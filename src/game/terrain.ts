import Matter from 'matter-js';

export interface Pickable {
  id: string;
  type: 'coin' | 'gem' | 'fuel';
  gemVariant?: 'common' | 'rare' | 'epic';
  x: number;
  y: number;
  collected: boolean;
}

export interface Chunk {
  index: number;
  points: { x: number; y: number }[];
  pickables: Pickable[];
}

export class TerrainGenerator {
  chunkWidth = 1600;
  segmentWidth = 80;
  chunks: Map<number, Chunk> = new Map();
  collectedItems: Set<string> = new Set();
  stageId: string;

  constructor(stageId: string = 's_countryside') {
      this.stageId = stageId;
  }
  
  // Deterministic pseudo-random number generator
  private pseudoRandom(seed: number) {
    let t = seed + 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }

  getY(x: number) {
    // Flat start area from x=0 to x=500
    if (x >= 0 && x <= 500) {
      return 200;
    }

    let y = 300;
    
    // Stage specific noise
    if (this.stageId === 's_desert') {
        y += Math.sin(x / 500) * 120 + Math.sin(x / 200) * 50;
    } else if (this.stageId === 's_moon') {
        y += Math.sin(x / 300) * 60 + Math.sin(x / 100) * 30 + Math.sin(x / 30) * 15; // smaller, more frequent craters
    } else if (this.stageId === 's_arctic') {
        y += Math.sin(x / 600) * 100 + Math.sin(x / 150) * 20; // smoother, wider
    } else if (this.stageId === 's_neoncity') {
        // blocky, artificial feeling
        y += Math.sin(x / 200) * 40;
        y = Math.round(y / 50) * 50; 
    } else if (this.stageId === 's_volcano') {
        y += Math.sin(x / 350) * 100 + Math.sin(x / 80) * 50 + Math.sin(x / 25) * 20; // jagged
    } else if (this.stageId === 's_highway') {
        y += Math.sin(x / 800) * 50; // very flat
    } else {
        // s_countryside & default
        y += Math.sin(x / 400) * 80 + Math.sin(x / 150) * 40 + Math.sin(x / 50) * 10;
    }
    
    // Smooth transition from the start area into the hilly area
    if (x > 500 && x < 1500) {
      const t = (x - 500) / 1000;
      y = 200 * (1 - t) + y * t;
    }
    
    // Going backward before spawn
    if (x < 0) {
       y = 200 - Math.sin(x/400)*80 - Math.sin(x / 150) * 40;
    }
    
    return y;
  }

  // Generate coin patterns
  private addCoinPattern(chunk: Chunk, startX: number, startY: number, patternType: number, seed: number) {
    const coinSpacing = 60;
    const items: Pickable[] = [];

    if (patternType < 0.2) {
      // Line
      for (let i = 0; i < 5; i++) {
        items.push({ id: `coin-${startX}-${i}`, type: 'coin', x: startX + i * coinSpacing, y: this.getY(startX + i * coinSpacing) - 50, collected: false });
      }
    } else if (patternType < 0.4) {
      // Arc / Jump path
      for (let i = 0; i < 6; i++) {
        const heightOffset = Math.sin((i / 5) * Math.PI) * 150 + 50;
        items.push({ id: `coin-${startX}-${i}`, type: 'coin', x: startX + i * coinSpacing, y: this.getY(startX + i * coinSpacing) - heightOffset, collected: false });
      }
    } else if (patternType < 0.6) {
      // Single float
      items.push({ id: `coin-${startX}-single`, type: 'coin', x: startX, y: startY - 120, collected: false });
    } else if (patternType < 0.8) {
      // Valley cluster
      for (let i = 0; i < 3; i++) {
        items.push({ id: `coin-v-${startX}-${i}`, type: 'coin', x: startX + i * 40, y: this.getY(startX + i * 40) - 30, collected: false });
      }
    } else {
      // Bridge
      for (let i = 0; i < 7; i++) {
         items.push({ id: `coin-b-${startX}-${i}`, type: 'coin', x: startX + i * coinSpacing, y: startY - 80, collected: false });
      }
    }

    for (const item of items) {
      if (!this.collectedItems.has(item.id)) {
        chunk.pickables.push(item);
      }
    }
  }

  getChunk(index: number): Chunk {
    if (this.chunks.has(index)) {
      return this.chunks.get(index)!;
    }

    const chunk: Chunk = {
      index,
      points: [],
      pickables: []
    };

    const startX = index * this.chunkWidth;
    const endX = startX + this.chunkWidth;

    // We will place items somewhat deterministically based on chunk index
    // rather than doing it strictly per segment to allow larger patterns

    // Generate points up to endX inclusively, so chunks overlap precisely at exactly 1 point
    for (let x = startX; x <= endX; x += this.segmentWidth) {
      chunk.points.push({ x, y: this.getY(x) });
    }

    // Spawn Pickables per chunk logic to allow patterns
    if (index >= 0) {
      // We will iterate through chunk x with a larger step for patterns
      for (let px = startX; px < endX; px += 400) {
        if (px < 500) continue; // No spawns in the starting flat area
        
        const patternSeed = this.pseudoRandom(px * 1.11);
        const spawnTypeRand = this.pseudoRandom(px * 2.22);
        
        const difficultyFuel = px > 2500 ? 0.15 : (px > 1000 ? 0.2 : 0.25); // Distance based fuel frequency
        const diamondChance = px > 2500 ? 0.08 : 0.04;

        if (spawnTypeRand < difficultyFuel) {
          // Spawn Fuel
          const id = `fuel-${px}`;
          if (!this.collectedItems.has(id)) {
            chunk.pickables.push({
               id,
               type: 'fuel',
               x: px + 200, 
               y: this.getY(px + 200) - 60,
               collected: false
            });
          }
          // Optionally spawn some coins nearby to make 'Fuel Rescue'
          if (this.pseudoRandom(px * 5.55) < 0.5) {
             this.addCoinPattern(chunk, px, this.getY(px), patternSeed, px);
          }
        } 
        else if (spawnTypeRand < difficultyFuel + diamondChance) {
          // Spawn Diamond
          const id = `gem-${px}`;
          if (!this.collectedItems.has(id)) {
            const rarityRoll = this.pseudoRandom(px * 4.44);
            const variant = rarityRoll < 0.1 ? 'epic' : (rarityRoll < 0.4 ? 'rare' : 'common');
            chunk.pickables.push({
               id,
               type: 'gem',
               gemVariant: variant,
               x: px + 200,
               y: this.getY(px + 200) - 100, // Higher up
               collected: false
            });
          }
          // Spawn 'Diamond Hill' cluster
          this.addCoinPattern(chunk, px, this.getY(px), patternSeed, px);
        }
        else {
          // Spawn Coin Pattern
          // 70% chance to spawn coins empty gaps
          if (this.pseudoRandom(px * 3.33) < 0.7) {
             this.addCoinPattern(chunk, px, this.getY(px), patternSeed, px);
          }
        }
      }
    }

    this.chunks.set(index, chunk);
    return chunk;
  }

  getActiveChunks(camX: number, loadWindowBefore: number, loadWindowAfter: number): Chunk[] {
    const startChunk = Math.floor((camX - loadWindowBefore) / this.chunkWidth);
    const endChunk = Math.floor((camX + loadWindowAfter) / this.chunkWidth);
    
    const activeChunks: Chunk[] = [];

    for (let i = startChunk; i <= endChunk; i++) {
      activeChunks.push(this.getChunk(i));
    }

    // Cleanup very far away chunks to prevent memory leaks over time
    for (const [idx, chunk] of this.chunks.entries()) {
      if (idx < startChunk - 3 || idx > endChunk + 3) {
        this.chunks.delete(idx);
      }
    }

    return activeChunks;
  }
}
