import { create } from 'zustand';

export interface VehicleDef {
  id: string;
  name: string;
  unlockCost: number;
  costType: 'coins' | 'gems';
  color?: string; // fallback color for generic render if needed
}

export const VEHICLE_LIST: VehicleDef[] = [
  { id: 'v_jeep', name: 'Hill Climber', unlockCost: 0, costType: 'coins', color: '#DC2626' },
  { id: 'v_bike', name: 'Motocross Bike', unlockCost: 75000, costType: 'coins', color: '#EF4444' },
  { id: 'v_sports', name: 'Sports Car', unlockCost: 150000, costType: 'coins', color: '#DC2626' },
  { id: 'v_monster', name: 'Monster Truck', unlockCost: 250000, costType: 'coins', color: '#3B82F6' },
  { id: 'v_tractor', name: 'Tractor', unlockCost: 350000, costType: 'coins', color: '#16A34A' },
  { id: 'v_bus', name: 'Bus', unlockCost: 500000, costType: 'coins', color: '#FACC15' },
  { id: 'v_pickup', name: 'Pickup Truck', unlockCost: 750000, costType: 'coins', color: '#F97316' },
  { id: 'v_tank', name: 'Tank', unlockCost: 1000000, costType: 'coins', color: '#4D7C0F' },
  { id: 'v_formula', name: 'Formula Car', unlockCost: 1500000, costType: 'coins', color: '#DC2626' },
  { id: 'v_moon', name: 'Moon Rover', unlockCost: 2000000, costType: 'coins', color: '#E5E7EB' }
];

export interface StageDef {
  id: string;
  name: string;
  unlockCost: number;
  targetDistance: number;
  gravity?: number;
  terrainType?: string;
  fuelSpawnRate?: number;
  coinSpawnRate?: number;
  color?: string; // visual fallback
}

export const STAGE_LIST: StageDef[] = [
  { id: 's_countryside', name: 'Countryside', unlockCost: 0, targetDistance: 600, color: '#4ADE80' },
  { id: 's_desert', name: 'Desert', unlockCost: 50000, targetDistance: 800, color: '#FCD34D' },
  { id: 's_arctic', name: 'Arctic', unlockCost: 100000, targetDistance: 1000, color: '#93C5FD' },
  { id: 's_moon', name: 'Moon', unlockCost: 200000, targetDistance: 1200, color: '#D1D5DB' },
  { id: 's_forest', name: 'Forest', unlockCost: 350000, targetDistance: 2000, color: '#15803D' },
  { id: 's_highway', name: 'Highway', unlockCost: 500000, targetDistance: 1500, color: '#6B7280' },
  { id: 's_volcano', name: 'Volcano', unlockCost: 750000, targetDistance: 2200, color: '#DC2626' },
  { id: 's_beach', name: 'Beach', unlockCost: 1000000, targetDistance: 2500, color: '#FDE047' },
  { id: 's_mars', name: 'Mars', unlockCost: 1500000, targetDistance: 3000, color: '#EF4444' },
  { id: 's_neoncity', name: 'Neon City', unlockCost: 2000000, targetDistance: 3500, color: '#D946EF' }
];

export interface TuneData {
  engine: number;
  suspension: number;
  tires: number;
  drivetrain: number;
}

export interface GameState {
  status: 'menu' | 'countdown' | 'playing' | 'coasting' | 'crashing' | 'results' | 'paused' | 'gameover';
  failReason: string;
  distance: number;
  bestDistance: number; // legacy best distance, now per stage below
  bestDistances: Record<string, number>;
  coins: number;
  currentRunCoins: number;
  gems: number;
  currentRunGems: number;
  fuel: number;
  rpm: number;
  boost: number;
  
  unlockedVehicles: string[];
  equippedVehicleId: string;
  previewVehicleId: string;

  unlockedStages: string[];
  selectedStageId: string;
  previewStageId: string;
  
  vehicleTunes: Record<string, TuneData>;

  musicEnabled: boolean;
  soundEnabled: boolean;
  drawDirtEnabled: boolean;
  backgroundScrollEnabled: boolean;
  pedalsEnabled: boolean;

  setStatus: (s: GameState['status']) => void;
  setFailReason: (r: string) => void;
  setDistance: (d: number) => void;
  addCoin: (amount: number) => void;
  addGem: (amount: number) => void;
  setFuel: (f: number) => void;
  consumeFuel: (amount: number) => void;
  addFuel: (amount: number) => void;
  setRPM: (r: number) => void;
  resetRun: () => void;
  saveProgress: () => void;
  loadSaves: () => void;
  setPreviewVehicleId: (id: string) => void;
  setPreviewStageId: (id: string) => void;
  
  setMusicEnabled: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setDrawDirtEnabled: (enabled: boolean) => void;
  setBackgroundScrollEnabled: (enabled: boolean) => void;
  setPedalsEnabled: (enabled: boolean) => void;

  unlockVehicle: (id: string, cost: number, costType: 'coins' | 'gems') => boolean;
  equipVehicle: (id: string) => void;

  unlockStage: (id: string, cost: number) => boolean;
  selectStage: (id: string) => void;
  
  upgradeTune: (vehicleId: string, part: keyof TuneData, maxLevel: number) => boolean;
}

export const useGameStore = create<GameState>((set, get) => ({
  status: 'menu',
  failReason: '',
  distance: 0,
  bestDistance: 0,
  bestDistances: {},
  coins: 1000000,
  currentRunCoins: 0,
  gems: 5000,
  currentRunGems: 0,
  fuel: 100,
  rpm: 0,
  boost: 0,
  
  unlockedVehicles: ['v_jeep'],
  equippedVehicleId: 'v_jeep',
  previewVehicleId: 'v_jeep',

  unlockedStages: ['s_countryside'],
  selectedStageId: 's_countryside',
  previewStageId: 's_countryside',

  vehicleTunes: {},

  musicEnabled: true,
  soundEnabled: true,
  drawDirtEnabled: true,
  backgroundScrollEnabled: true,
  pedalsEnabled: true,

  setPreviewVehicleId: (id) => set({ previewVehicleId: id }),
  setPreviewStageId: (id) => set({ previewStageId: id }),

  setMusicEnabled: (enabled) => {
    set({ musicEnabled: enabled });
    get().saveProgress();
  },
  setSoundEnabled: (enabled) => {
    set({ soundEnabled: enabled });
    get().saveProgress();
  },
  setDrawDirtEnabled: (enabled) => {
    set({ drawDirtEnabled: enabled });
    get().saveProgress();
  },
  setBackgroundScrollEnabled: (enabled) => {
    set({ backgroundScrollEnabled: enabled });
    get().saveProgress();
  },
  setPedalsEnabled: (enabled) => {
    set({ pedalsEnabled: enabled });
    get().saveProgress();
  },

  setStatus: (status) => set({ status }),
  setFailReason: (failReason) => set({ failReason }),
  setDistance: (newDist) => {
    set((state) => {
      const distance = Math.max(state.distance, newDist);
      const bestDistance = Math.max(state.bestDistance, distance);
      const stageBest = Math.max(state.bestDistances[state.selectedStageId] || 0, distance);
      return { 
        distance, 
        bestDistance,
        bestDistances: { ...state.bestDistances, [state.selectedStageId]: stageBest }
      };
    });
  },
  addCoin: (amount) => {
    set((state) => {
      return { currentRunCoins: state.currentRunCoins + amount };
    });
  },
  addGem: (amount) => {
    set((state) => {
      return { currentRunGems: state.currentRunGems + amount };
    });
  },
  setFuel: (fuel) => set({ fuel: Math.max(0, Math.min(100, fuel)) }),
  consumeFuel: (amount) => set((s) => ({ fuel: Math.max(0, s.fuel - amount) })),
  addFuel: (amount) => set((s) => ({ fuel: Math.min(100, s.fuel + amount) })),
  setRPM: (rpm) => set({ rpm }),
  
  resetRun: () => set({
    distance: 0,
    fuel: 100,
    rpm: 0,
    currentRunCoins: 0,
    currentRunGems: 0,
    failReason: '',
    status: 'playing' 
  }),

  unlockVehicle: (id, cost, costType) => {
    const state = get();
    if (state.unlockedVehicles.includes(id)) return false;
    
    if (costType === 'coins' && state.coins >= cost) {
      set({ 
        coins: state.coins - cost,
        unlockedVehicles: [...state.unlockedVehicles, id]
      });
      get().saveProgress();
      return true;
    } else if (costType === 'gems' && state.gems >= cost) {
      set({ 
        gems: state.gems - cost,
        unlockedVehicles: [...state.unlockedVehicles, id]
      });
      get().saveProgress();
      return true;
    }
    return false;
  },
  
  equipVehicle: (id) => {
    if (get().unlockedVehicles.includes(id)) {
      set({ equippedVehicleId: id });
      get().saveProgress();
    }
  },

  unlockStage: (id, cost) => {
    const state = get();
    if (state.unlockedStages.includes(id)) return false;
    
    if (state.coins >= cost) {
      set({ 
        coins: state.coins - cost,
        unlockedStages: [...state.unlockedStages, id]
      });
      get().saveProgress();
      return true;
    }
    return false;
  },

  selectStage: (id) => {
    if (get().unlockedStages.includes(id)) {
      set({ selectedStageId: id });
      get().saveProgress();
    }
  },

  saveProgress: () => {
    const state = get();
    const newTotalCoins = state.coins + state.currentRunCoins;
    const newTotalGems = state.gems + state.currentRunGems;
    localStorage.setItem('hcr_best_distance', state.bestDistance.toString());
    localStorage.setItem('hcr_best_distances', JSON.stringify(state.bestDistances));
    localStorage.setItem('hcr_coins', newTotalCoins.toString());
    localStorage.setItem('hcr_gems', newTotalGems.toString());
    localStorage.setItem('hcr_unlocked_vehicles', JSON.stringify(state.unlockedVehicles));
    localStorage.setItem('hcr_equipped_vehicle', state.equippedVehicleId);
    localStorage.setItem('hcr_unlocked_stages', JSON.stringify(state.unlockedStages));
    localStorage.setItem('hcr_selected_stage', state.selectedStageId);
    localStorage.setItem('hcr_vehicle_tunes', JSON.stringify(state.vehicleTunes));
    localStorage.setItem('hcr_music_enabled', state.musicEnabled.toString());
    localStorage.setItem('hcr_sound_enabled', state.soundEnabled.toString());
    localStorage.setItem('hcr_draw_dirt', state.drawDirtEnabled.toString());
    localStorage.setItem('hcr_bg_scroll', state.backgroundScrollEnabled.toString());
    localStorage.setItem('hcr_pedals', state.pedalsEnabled.toString());
    set({ coins: newTotalCoins, gems: newTotalGems, currentRunCoins: 0, currentRunGems: 0 }); 
  },
  
  loadSaves: () => {
    const best = localStorage.getItem('hcr_best_distance');
    const bests = localStorage.getItem('hcr_best_distances');
    const coins = localStorage.getItem('hcr_coins');
    const gems = localStorage.getItem('hcr_gems');
    const unlocked = localStorage.getItem('hcr_unlocked_vehicles');
    const equipped = localStorage.getItem('hcr_equipped_vehicle');
    const unlockedStages = localStorage.getItem('hcr_unlocked_stages');
    const selectedStage = localStorage.getItem('hcr_selected_stage');
    const tunesStr = localStorage.getItem('hcr_vehicle_tunes');
    const musicParam = localStorage.getItem('hcr_music_enabled');
    const soundParam = localStorage.getItem('hcr_sound_enabled');
    const drawDirtParam = localStorage.getItem('hcr_draw_dirt');
    const bgScrollParam = localStorage.getItem('hcr_bg_scroll');
    const pedalsParam = localStorage.getItem('hcr_pedals');
    
    set({
      bestDistance: best ? parseFloat(best) : 0,
      bestDistances: bests ? JSON.parse(bests) : {},
      coins: coins !== null ? parseInt(coins, 10) : 1000000,
      gems: gems !== null ? parseInt(gems, 10) : 5000,
      unlockedVehicles: unlocked ? JSON.parse(unlocked) : ['v_jeep'],
      equippedVehicleId: equipped || 'v_jeep',
      unlockedStages: unlockedStages ? JSON.parse(unlockedStages) : ['s_countryside'],
      selectedStageId: selectedStage || 's_countryside',
      vehicleTunes: (tunesStr && tunesStr !== "undefined") ? (JSON.parse(tunesStr) || {}) : {},
      musicEnabled: musicParam !== null ? musicParam === 'true' : true,
      soundEnabled: soundParam !== null ? soundParam === 'true' : true,
      drawDirtEnabled: drawDirtParam !== null ? drawDirtParam === 'true' : true,
      backgroundScrollEnabled: bgScrollParam !== null ? bgScrollParam === 'true' : true,
      pedalsEnabled: pedalsParam !== null ? pedalsParam === 'true' : true
    });
  },

  upgradeTune: (vehicleId: string, part: keyof TuneData, maxLevel: number) => {
    const state = get();
    const currentTunes = state.vehicleTunes?.[vehicleId] || { engine: 1, suspension: 1, tires: 1, drivetrain: 1 };
    const currentLevel = currentTunes[part];

    if (currentLevel >= maxLevel) return false;

    // Pricing formula based on instructions (e.g. 4000, 8000, 12000...)
    const cost = currentLevel * 4000;

    if (state.coins >= cost) {
      set({
        coins: state.coins - cost,
        vehicleTunes: {
          ...state.vehicleTunes,
          [vehicleId]: {
            ...currentTunes,
            [part]: currentLevel + 1
          }
        }
      });
      get().saveProgress();
      return true;
    }
    return false;
  }
}));
