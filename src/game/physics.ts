import Matter from 'matter-js';
import { TerrainGenerator, Pickable, Chunk } from './terrain';

export class PhysicsEngine {
  engine: Matter.Engine;
  world: Matter.World;
  
  carBody!: Matter.Body;
  wheelA!: Matter.Body;
  wheelB!: Matter.Body;
  invisibleWall!: Matter.Body;
  
  terrainBodiesMap: Map<number, Matter.Body[]> = new Map();
  
  constructor(stageId: string = 's_countryside') {
    this.engine = Matter.Engine.create();
    this.world = this.engine.world;
    if (stageId === 's_moon') {
        this.engine.world.gravity.y = 0.4;
    } else {
        this.engine.world.gravity.y = 1.0;
    }
    // E.g. Arctic could have less friction? We'll handle friction via terrain material or general physics rules if needed
  }

  headHitArea!: Matter.Body;
  isHeadCrashed: boolean = false;

  tuneData!: any;

  initCar(vehicleId: string, tuneData: any) {
    this.tuneData = tuneData || { engine: 1, suspension: 1, tires: 1, drivetrain: 1 };
    
    // Physics modifier from Tune Data
    // Suspension (1 - 14): stiffness goes from 0.1 to 0.4, damping from 0.05 to 0.15
    const suspensionLevel = this.tuneData.suspension;
    const suspStiffness = 0.1 + (suspensionLevel * 0.02);
    const suspDamping = 0.05 + (suspensionLevel * 0.01);
    
    // Tires (1 - 16): friction increases, density slightly increases
    const tireLevel = this.tuneData.tires;
    const tireFriction = 0.8 + (tireLevel * 0.05);
    const tireDensity = 0.01 + (tireLevel * 0.001);

    // Car physical dimensions based on logic: Body 176x56
    const cx = 200;
    const cy = 0;
    
    // Group them so they don't collide with each other
    const group = Matter.Body.nextGroup(true);

    let chassisW = 140;
    let chassisH = 40;
    let hw = 50; 
    let wy = 30; 
    let r1 = 28 + (tireLevel * 0.5); // Visual and physical size boost
    let r2 = 28 + (tireLevel * 0.5);
    
    switch (vehicleId) {
      case 'v_monster':
        chassisH = 60;
        chassisW = 160;
        hw = 55;
        r1 = 45 + (tireLevel * 1);
        r2 = 45 + (tireLevel * 1);
        wy = 40;
        break;
      case 'v_bike':
        chassisH = 30;
        chassisW = 80;
        hw = 45;
        r1 = 30 + (tireLevel * 0.4);
        r2 = 30 + (tireLevel * 0.4);
        wy = 25;
        break;
      case 'v_tractor':
        hw = 50;
        r1 = 42 + (tireLevel * 0.8); // Rear wheel
        r2 = 22 + (tireLevel * 0.4); // Front wheel
        wy = 35;
        break;
      case 'v_formula':
        chassisH = 25;
        chassisW = 160;
        hw = 55;
        r1 = 30 + (tireLevel * 0.3);
        r2 = 25 + (tireLevel * 0.3);
        wy = 20;
        break;
      case 'v_tank':
        chassisH = 40;
        chassisW = 150;
        hw = 55;
        r1 = 20 + (tireLevel * 0.2);
        r2 = 20 + (tireLevel * 0.2);
        wy = 35;
        break;
      case 'v_moon':
        hw = 60;
        r1 = 32 + (tireLevel * 0.5);
        r2 = 32 + (tireLevel * 0.5);
        wy = 35;
        break;
    }

    const carChassis = Matter.Bodies.rectangle(cx, cy, chassisW, chassisH, {
      label: 'car_chassis'
    });

    // Driver's head area (top-center, elevated)
    this.headHitArea = Matter.Bodies.circle(cx, cy - 35, 15, {
      label: 'head'
    });

    this.carBody = Matter.Body.create({
      parts: [carChassis, this.headHitArea],
      collisionFilter: { group },
      friction: 0.1,
      density: 0.002,
      label: 'car'
    });

    this.wheelA = Matter.Bodies.circle(cx - hw, cy + wy, r1, {
      collisionFilter: { group },
      friction: tireFriction,
      restitution: 0.1,
      density: tireDensity,
      label: 'wheel'
    });

    this.wheelB = Matter.Bodies.circle(cx + hw, cy + wy, r2, {
      collisionFilter: { group },
      friction: tireFriction,
      restitution: 0.1,
      density: tireDensity,
      label: 'wheel'
    });

    this.invisibleWall = Matter.Bodies.rectangle(-200, cy, 400, 10000, {
      isStatic: true,
      friction: 0.0,
      restitution: 0.2,
      label: 'rear_boundary'
    });

    const axelA = Matter.Constraint.create({
      bodyB: this.carBody,
      pointB: { x: -hw, y: wy - 10 },
      bodyA: this.wheelA,
      stiffness: suspStiffness,
      length: 10 + (suspensionLevel * 0.5), // lift effect
      damping: suspDamping
    });

    const axelB = Matter.Constraint.create({
      bodyB: this.carBody,
      pointB: { x: hw, y: wy - 10 },
      bodyA: this.wheelB,
      stiffness: suspStiffness,
      length: 10 + (suspensionLevel * 0.5),
      damping: suspDamping
    });

    Matter.Composite.add(this.world, [
      this.carBody, this.wheelA, this.wheelB, axelA, axelB, this.invisibleWall
    ]);

    // Setup head crash detection
    Matter.Events.on(this.engine, 'collisionStart', (event) => {
      for (const pair of event.pairs) {
        if ((pair.bodyA.label === 'head' && pair.bodyB.label === 'terrain') ||
            (pair.bodyB.label === 'head' && pair.bodyA.label === 'terrain')) {
          this.isHeadCrashed = true;
        }
      }
    });
  }

  updateTerrainChunks(activeChunks: Chunk[]) {
    const activeIndices = new Set(activeChunks.map(c => c.index));

    // Remove bodies for chunks no longer active
    for (const [idx, bodies] of this.terrainBodiesMap.entries()) {
      if (!activeIndices.has(idx)) {
        Matter.Composite.remove(this.world, bodies);
        this.terrainBodiesMap.delete(idx);
      }
    }

    // Add bodies for newly active chunks
    for (const chunk of activeChunks) {
      if (!this.terrainBodiesMap.has(chunk.index)) {
        const bodies: Matter.Body[] = [];
        
        for (let i = 0; i < chunk.points.length - 1; i++) {
          const p1 = chunk.points[i];
          const p2 = chunk.points[i+1];
          
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          const angle = Math.atan2(dy, dx);
          
          // Thick rectangle to prevent tunneling
          const thickness = 200;
          const rect = Matter.Bodies.rectangle(midX, midY + thickness/2, dist + 2, thickness, {
            isStatic: true,
            angle: angle,
            friction: 0.8,
            label: 'terrain'
          });
          
          bodies.push(rect);
        }
        
        Matter.Composite.add(this.world, bodies);
        this.terrainBodiesMap.set(chunk.index, bodies);
      }
    }
  }

  checkPickups(pickables: Pickable[]): Pickable[] {
    const collected: Pickable[] = [];
    for (const p of pickables) {
      if (p.collected) continue;
      const dx = this.carBody.position.x - p.x;
      const dy = this.carBody.position.y - p.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 80) { // Pickup radius
        p.collected = true;
        collected.push(p);
      }
    }
    return collected;
  }
}

