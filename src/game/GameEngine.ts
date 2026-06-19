import Matter from 'matter-js';
import { PhysicsEngine } from './physics';
import { TerrainGenerator, Pickable, Chunk } from './terrain';
import { useGameStore } from './store';
import { inputState } from './input';
import { STAGE_CONFIGS } from '../components/StageRenderer';
import { audioManager } from './audio';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export class GameEngine {
  physics: PhysicsEngine;
  terrain: TerrainGenerator;
  stageId: string;
  vehicleId: string;
  
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  
  // Refs to update transforms directly avoiding React re-renders
  carRef: HTMLElement;
  wheelARef: HTMLElement;
  wheelBRef: HTMLElement;
  
  animationFrameId: number = 0;
  camera = { x: 0, y: 0 };
  
  coastTimer: number = 0;
  crashTimer: number = 0;
  flipTimer: number = 0;
  
  maxCarX: number = 0;
  
  activeChunks: Chunk[] = [];
  particles: Particle[] = [];

  constructor(canvas: HTMLCanvasElement, carRef: HTMLElement, wheelA: HTMLElement, wheelB: HTMLElement, vehicleId: string, stageId: string) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.carRef = carRef;
    this.wheelARef = wheelA;
    this.wheelBRef = wheelB;
    this.stageId = stageId;
    this.vehicleId = vehicleId;
    
    this.physics = new PhysicsEngine(stageId);
    this.terrain = new TerrainGenerator(stageId);
    
    const store = useGameStore.getState();
    const tuneData = store.vehicleTunes[vehicleId] || { engine: 1, suspension: 1, tires: 1, drivetrain: 1 };

    this.physics.initCar(vehicleId, tuneData);
  }

  start() {
    let lastTime = performance.now();
    audioManager.startEngine(this.vehicleId);
    audioManager.startWind();
    
    const loop = (time: number) => {
      const dt = time - lastTime;
      lastTime = time;
      
      this.update(Math.min(dt, 32)); // Cap dt to avoid physics explosions
      this.draw();
      
      this.animationFrameId = requestAnimationFrame(loop);
    };
    
    this.animationFrameId = requestAnimationFrame(loop);
  }

  stop() {
    cancelAnimationFrame(this.animationFrameId);
    audioManager.stopEngine();
    audioManager.stopWind();
  }

  update(dt: number) {
    const store = useGameStore.getState();
    const status = store.status;

    if (status === 'paused' || status === 'results' || status === 'menu') {
       audioManager.updateEngine(0);
       audioManager.updateWind(0, false);
       return; 
    }

    let rpmTarget = 0;

    // Input processing only allowed in 'playing' state
    if (status === 'playing') {
      const tuneData = this.physics.tuneData;
      // Engine up to + 150% power
      const enginePower = 0.02 * (1 + ((tuneData.engine - 1) * 0.15));
      // Drivetrain allocates more engine power directly to forward motion, less slip
      const drivetrainMultiplier = 1 + ((tuneData.drivetrain - 1) * 0.05);

      if (inputState.gas) {
        Matter.Body.setAngularVelocity(this.physics.wheelA, this.physics.wheelA.angularVelocity + enginePower * drivetrainMultiplier * (dt/16));
        Matter.Body.setAngularVelocity(this.physics.wheelB, this.physics.wheelB.angularVelocity + enginePower * drivetrainMultiplier * 0.5 * (dt/16)); // Front wheel gets less direct power, but AWD improves it
        store.consumeFuel(0.08 * (dt/16));
        rpmTarget = 8000;
      }
      if (inputState.brake) {
        Matter.Body.setAngularVelocity(this.physics.wheelA, this.physics.wheelA.angularVelocity - 0.02 * (dt/16));
        Matter.Body.setAngularVelocity(this.physics.wheelB, this.physics.wheelB.angularVelocity - 0.02 * (dt/16));
        rpmTarget = 1000;
        // Brake sound
        if (Matter.Vector.magnitude(this.physics.carBody.velocity) > 2) {
          if (Math.random() < 0.1) audioManager.playBrake();
        }
      }
      
      // Passive and airtime fuel drain
      const inAir = this.physics.carBody.velocity.y > 0.5 || this.physics.carBody.velocity.y < -0.5;
      const baseDrain = store.distance > 1000 ? 0.06 : 0.04; // Harder economy further out
      const outOfFuelMultiplier = inAir ? 1.2 : 1; 
      store.consumeFuel(baseDrain * outOfFuelMultiplier * (dt/16));

      // Transition to coasting if out of fuel
      if (store.fuel <= 0) {
        store.setStatus('coasting');
      }
    }
    
    // Smooth RPM
    const newRpm = store.rpm + (rpmTarget - store.rpm) * 0.1;
    store.setRPM(newRpm);
    
    if (status === 'playing' || status === 'coasting') {
      audioManager.updateEngine(newRpm / 8000);
      const speed = Matter.Vector.magnitude(this.physics.carBody.velocity);
      const inAir = this.physics.carBody.velocity.y > 0.5 || this.physics.carBody.velocity.y < -0.5;
      audioManager.updateWind(speed, inAir);
    } else {
      audioManager.updateEngine(0);
      audioManager.updateWind(0, false);
    }

    // Physics Step
    Matter.Engine.update(this.physics.engine, dt);

    // Particle Logic
    if (store.drawDirtEnabled && (inputState.gas || inputState.brake || Matter.Vector.magnitude(this.physics.carBody.velocity) > 2)) {
       const vy = this.physics.carBody.velocity.y;
       if (vy > -5 && Math.abs(this.physics.carBody.angularVelocity) < 0.2) {
          const colors: Record<string, string[]> = {
            's_countryside': ['#5c4033', '#8b5a2b', '#a0522d'],
            's_desert': ['#d2b48c', '#f4a460', '#eebcb1'],
            's_arctic': ['#ffffff', '#f0f8ff', '#e0ffff'],
            's_moon': ['#696969', '#808080', '#a9a9a9'],
            's_forest': ['#3b2f2f', '#4e3b31', '#2e1f1c'],
            's_highway': ['#2f4f4f', '#696969', '#708090'],
            's_volcano': ['#8b0000', '#a52a2a', '#4a0e4e'],
            's_beach': ['#f5deb3', '#ffdead', '#ffe4b5'],
            's_mars': ['#a0522d', '#cd853f', '#d2691e'],
            's_neoncity': ['#8a2be2', '#9400d3', '#9932cc']
          };
          const stageColors = colors[this.stageId] || colors['s_countryside'];
          
          const emitForWheel = (wheel: Matter.Body) => {
             if (Math.random() < 0.3) {
               this.particles.push({
                 x: wheel.position.x + (Math.random() - 0.5) * 20,
                 y: wheel.position.y + 15,
                 vx: -this.physics.carBody.velocity.x * 0.5 + (Math.random() - 0.5) * 2,
                 vy: -Math.random() * 3,
                 life: 20 + Math.random() * 20,
                 maxLife: 40,
                 size: 3 + Math.random() * 4,
                 color: stageColors[Math.floor(Math.random() * stageColors.length)]
               });
             }
          };
          emitForWheel(this.physics.wheelA);
          emitForWheel(this.physics.wheelB);
       }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
       const p = this.particles[i];
       p.x += p.vx;
       p.y += p.vy;
       p.vy += 0.1; // gravity
       p.life--;
       if (p.life <= 0) this.particles.splice(i, 1);
    }

    // Update Distance and Rear Boundary
    const cx = this.physics.carBody.position.x;
    if (cx > 200) {
      store.setDistance(Math.floor((cx - 200) / 50));
    }
    
    // Track max X for reverse boundary
    if (cx > this.maxCarX) {
      this.maxCarX = cx;
    }
    
    // Calculate allowed rear boundary (e.g., 1500px behind max progress, minimum -200)
    const rearBoundaryX = Math.max(-200, this.maxCarX - 1500);
    
    // Position the invisible wall's center so its right edge touches rearBoundaryX
    // Wall width is 400, so subtract 200 from the rearBoundaryX
    Matter.Body.setPosition(this.physics.invisibleWall, {
      x: rearBoundaryX - 200,
      y: this.physics.carBody.position.y
    });

    // Apply damping if the car is pushing hard backward against the boundary region
    if (cx < rearBoundaryX + 100 && this.physics.carBody.velocity.x < 0) {
      Matter.Body.setVelocity(this.physics.carBody, {
        x: this.physics.carBody.velocity.x * 0.5,
        y: this.physics.carBody.velocity.y
      });
    }

    // Generate new terrain logic
    const { innerWidth: width } = window;
    // Load 2000px behind, and 2 screens ahead
    this.activeChunks = this.terrain.getActiveChunks(cx, 2000, width * 2);
    this.physics.updateTerrainChunks(this.activeChunks);
    
    if (status === 'playing' || status === 'coasting') {
      const pickables = this.activeChunks.flatMap(ch => ch.pickables);
      const collected = this.physics.checkPickups(pickables);
      for (const p of collected) {
        this.terrain.collectedItems.add(p.id);
        if (p.type === 'coin') {
          store.addCoin(5);
          audioManager.playCoin();
        }
        if (p.type === 'gem') {
           let amount = 1;
           if (p.gemVariant === 'rare') amount = 3;
           if (p.gemVariant === 'epic') amount = 10;
           store.addGem(amount);
           audioManager.playDiamond();
        }
        if (p.type === 'fuel') {
           store.addFuel(100);
           audioManager.playFuel();
           if (useGameStore.getState().status === 'coasting') {
              store.setStatus('playing');
              this.coastTimer = 0;
           }
        }
      }

      // Check head collision
      if (this.physics.isHeadCrashed && useGameStore.getState().status !== 'crashing') {
        store.setFailReason('DRIVER DOWN!');
        store.setStatus('crashing');
        const speed = Matter.Vector.magnitude(this.physics.carBody.velocity);
        audioManager.playCrash(speed > 10 ? 'major' : 'medium');
        audioManager.playGameOver();
      }

      // Check flip / Unsafe angle
      const angle = this.physics.carBody.angle;
      if (Math.abs(angle) > Math.PI / 1.5) {
        this.flipTimer += dt;
        if (this.flipTimer > 1500 && useGameStore.getState().status !== 'crashing') {
          store.setFailReason('FLIPPED!');
          store.setStatus('crashing');
          audioManager.playCrash('small');
          audioManager.playGameOver();
        }
      } else {
        this.flipTimer = 0;
      }

      // Check out of bounds (falling off world)
      if (this.physics.carBody.position.y > this.camera.y + window.innerHeight + 1000 && useGameStore.getState().status !== 'crashing') {
        store.setFailReason('OUT OF BOUNDS!');
        store.setStatus('crashing');
        audioManager.playGameOver();
      }
    }

    const currentStatus = useGameStore.getState().status;

    if (currentStatus === 'coasting') {
       const speed = Matter.Vector.magnitude(this.physics.carBody.velocity);
       if (speed < 0.5 && Math.abs(this.physics.carBody.angularVelocity) < 0.05) {
          this.coastTimer += dt;
          if (this.coastTimer > 1500) {
             store.setFailReason('OUT OF FUEL');
             store.saveProgress();
             store.setStatus('results');
             audioManager.playGameOver();
          }
       } else {
          this.coastTimer = 0;
       }
    }

    if (currentStatus === 'crashing') {
       this.crashTimer += dt;
       if (this.crashTimer > 2000) {
          store.saveProgress();
          store.setStatus('results');
       }
    }
  }

  draw() {
    const { innerWidth: width, innerHeight: height } = window;
    
    // Update Camera
    const cx = this.physics.carBody.position.x;
    const cy = this.physics.carBody.position.y;
    // Easing for camera
    const destCamX = cx - width * 0.4; // car at 40% of screen X
    const destCamY = cy - height * 0.6; // car lower on screen
    
    this.camera.x += (destCamX - this.camera.x) * 0.1;
    this.camera.y += (destCamY - this.camera.y) * 0.1;

    // Apply camera shake if crashing
    const store = useGameStore.getState();
    if (store.status === 'crashing') {
       const shakeIntensity = Math.max(0, 10 - (this.crashTimer / 200) * 10);
       this.camera.x += (Math.random() - 0.5) * shakeIntensity;
       this.camera.y += (Math.random() - 0.5) * shakeIntensity;
    }

    // Export camera position for background parallax (if enabled)
    if (store.backgroundScrollEnabled) {
       document.documentElement.style.setProperty('--cam-x', `${this.camera.x}`);
       document.documentElement.style.setProperty('--cam-y', `${this.camera.y}`);
    } else {
       document.documentElement.style.setProperty('--cam-x', `0`);
       document.documentElement.style.setProperty('--cam-y', `0`);
    }

    // Optional: clamp camera Y to not go too high if car jumps
    if (this.camera.y < -500) this.camera.y = -500;

    // Adjust canvas size safely
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }

    const { ctx, camera, activeChunks } = this;
    ctx.clearRect(0, 0, width, height);

    // Filter all points and sorted to draw correctly
    // To prevent duplicate consecutive points at chunk boundaries from ruining fill/strokes
    const allPoints: {x:number, y:number}[] = [];
    for (let i = 0; i < activeChunks.length; i++) {
       const chunkPoints = activeChunks[i].points;
       // Skip the last point if it's not the last chunk so they join exactly
       const pointsToAdd = (i === activeChunks.length - 1) ? chunkPoints : chunkPoints.slice(0, -1);
       allPoints.push(...pointsToAdd);
    }
    
    const allPickables = activeChunks.flatMap(ch => ch.pickables);

    // Render Pickables
    for (const item of allPickables) {
      if (item.collected) continue;
      const x = item.x - camera.x;
      const y = item.y - camera.y;
      
      // Basic bounce animation for items based on time
      const bounce = Math.sin(performance.now()/200 + item.x) * 5;
      
      ctx.save();
      ctx.translate(x, y + bounce);
      if (item.type === 'coin') {
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (item.type === 'gem') {
        let fill = '#06b6d4'; // common: cyan-500
        let highlight = '#67e8f9'; // common: cyan-300
        let scale = 1;
        
        if (item.gemVariant === 'rare') {
          fill = '#d946ef'; // rare: fuchsia-500
          highlight = '#f0abfc'; // rare: fuchsia-300
          scale = 1.2;
        } else if (item.gemVariant === 'epic') {
          fill = '#f59e0b'; // epic: amber-500
          highlight = '#fcd34d'; // epic: amber-300
          scale = 1.5;
        }

        ctx.scale(scale, scale);
        
        // Draw glow for epic
        if (item.gemVariant === 'epic') {
          ctx.beginPath();
          ctx.arc(0, 0, 25, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(245, 158, 11, 0.3)';
          ctx.fill();
        }

        ctx.fillStyle = fill;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3 / scale;
        ctx.beginPath();
        // Draw a diamond shape
        ctx.moveTo(0, -18);
        ctx.lineTo(15, 0);
        ctx.lineTo(0, 18);
        ctx.lineTo(-15, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Inner highlight
        ctx.fillStyle = highlight;
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.lineTo(8, 0);
        ctx.lineTo(0, 12);
        ctx.lineTo(-8, 0);
        ctx.closePath();
        ctx.fill();
      } else if (item.type === 'fuel') {
        ctx.fillStyle = '#ef4444';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.fillRect(-15, -20, 30, 40);
        ctx.strokeRect(-15, -20, 30, 40);
        ctx.fillStyle = '#fff';
        ctx.font = '12px block';
        ctx.fillText('F', -4, 4);
      }
      ctx.restore();
    }

    // Render Terrain Path
    if (allPoints.length > 0) {
      ctx.beginPath();
      // Start drawing from the first point
      const p0 = allPoints[0];
      ctx.moveTo(p0.x - camera.x, p0.y - camera.y);
      for (let i = 1; i < allPoints.length; i++) {
        const p = allPoints[i];
        ctx.lineTo(p.x - camera.x, p.y - camera.y);
      }
      // Close the path far below
      const last = allPoints[allPoints.length - 1];
      ctx.lineTo(last.x - camera.x, last.y + 2000 - camera.y);
      ctx.lineTo(p0.x - camera.x, p0.y + 2000 - camera.y);
      ctx.closePath();

      const config = STAGE_CONFIGS[this.stageId] || STAGE_CONFIGS['s_countryside'];
      ctx.fillStyle = config.groundFill;
      ctx.fill();

      // Draw the top grass edge
      ctx.beginPath();
      ctx.moveTo(p0.x - camera.x, p0.y - camera.y);
      for (let i = 1; i < allPoints.length; i++) {
        const p = allPoints[i];
        ctx.lineTo(p.x - camera.x, p.y - camera.y);
      }
      ctx.strokeStyle = config.groundStroke;
      ctx.lineWidth = 16; // matched the border-t-[12px] visually
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Render Particles
    for (const p of this.particles) {
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x - camera.x, p.y - camera.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Sync DOM elements for car
    // Apply camera offsets
    // Physics body center is cx, cy. The dom element origin is its center via -ml-[w/2] -mt-[h/2]
    this.carRef.style.transform = `translate3d(${cx - camera.x}px, ${cy - camera.y}px, 0) rotate(${this.physics.carBody.angle}rad)`;
    
    // Wheels
    const wx1 = this.physics.wheelA.position.x;
    const wy1 = this.physics.wheelA.position.y;
    this.wheelARef.style.transform = `translate3d(${wx1 - camera.x}px, ${wy1 - camera.y}px, 0) rotate(${this.physics.wheelA.angle}rad)`;

    const wx2 = this.physics.wheelB.position.x;
    const wy2 = this.physics.wheelB.position.y;
    this.wheelBRef.style.transform = `translate3d(${wx2 - camera.x}px, ${wy2 - camera.y}px, 0) rotate(${this.physics.wheelB.angle}rad)`;
  }
}
