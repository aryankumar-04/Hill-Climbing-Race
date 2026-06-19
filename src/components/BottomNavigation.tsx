import React from 'react';
import { ScreenType } from '../types';
import { useGameStore, VEHICLE_LIST } from '../game/store';
import { audioManager } from '../game/audio';

interface BottomNavProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
}

const ShopIcon = () => (
  <div className="w-12 h-10 bg-red-600 border-2 border-black relative shadow-lg rounded-sm flex justify-center items-end mt-2">
    <div className="w-14 h-4 bg-red-800 border-t-2 border-black rounded-t flex justify-end px-1 -mb-1">
      <div className="w-4 h-4 bg-yellow-400 border border-black rounded-full shadow -mt-2"></div>
    </div>
  </div>
);

const StageIcon = () => (
  <div className="w-14 h-14 rounded-full border-2 border-black bg-cyan-300 overflow-hidden relative shadow-lg">
    <div className="w-full h-full bg-[#8BC34A] rounded-t-[100%] absolute bottom-[-40%] left-0 border-t-2 border-green-800"></div>
    <div className="w-2 h-2 bg-yellow-500 rounded-full absolute top-[20%] left-[20%]"></div>
  </div>
);

const VehicleIcon = () => (
  <div className="w-16 h-8 bg-red-600 border-2 border-black rounded-md transform rotate-12 flex items-end justify-between px-1 pb-1 relative shadow">
    <div className="w-10 h-4 bg-black/40 absolute bottom-3 left-2 rounded-t-full"></div>
    <div className="w-4 h-4 bg-gray-300 rounded-full border-2 border-black -mb-2 z-10"></div>
    <div className="w-4 h-4 bg-gray-300 rounded-full border-2 border-black -mb-2 z-10"></div>
  </div>
);

const TuneIcon = () => (
  <div className="w-14 h-14 flex items-center justify-center transform rotate-45">
    <div className="w-10 h-4 bg-yellow-500 border-2 border-black rounded-sm relative shadow-lg">
      <div className="absolute -left-2 -top-1 w-6 h-6 bg-yellow-500 border-2 border-black rounded-full"></div>
      <div className="absolute -right-2 -top-1 w-6 h-6 bg-yellow-500 border-2 border-black rounded-full"></div>
      <div className="absolute left-0 top-0 w-2 h-2 bg-gray-800 rounded-full"></div>
      <div className="absolute right-0 top-0 w-2 h-2 bg-gray-800 rounded-full"></div>
    </div>
  </div>
);

const StartIcon = () => (
  <div className="w-0 h-0 border-t-[20px] border-t-transparent border-l-[30px] border-l-[#A5E144] border-b-[20px] border-b-transparent transform rotate-12 drop-shadow-[0_4px_0_rgba(0,0,0,1)] hover:scale-105 transition-transform"></div>
);

interface NavBtnProps {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  isStart?: boolean;
  disabled?: boolean;
}

const NavButton = ({ label, icon, active, onClick, isStart, disabled }: NavBtnProps) => {
  const baseClasses = "relative flex flex-col items-center justify-end pb-1 btn-beveled transition-colors group h-24 sm:h-28 overflow-visible border-[3px] border-black rounded shadow-[0_4px_0_#000]";
  const activeClasses = active ? "bg-[#3e86a0] h-28 sm:h-32 -mt-4 border-b-[3px] border-b-black shadow-[inset_0_5px_10px_rgba(0,0,0,0.5)] z-10" : "bg-gray-600 hover:bg-gray-500 hover:-translate-y-1";
  const startClasses = isStart ? (disabled ? "bg-gray-500 opacity-50 cursor-not-allowed" : "bg-[#6bb92d] hover:bg-[#7dd238] cursor-pointer hover:-translate-y-1") : (disabled ? "opacity-50 cursor-not-allowed" : activeClasses + " cursor-pointer");
  const widthClass = isStart || active ? "flex-[1.3]" : "flex-1";

  const handleClick = () => {
    if (disabled) {
      audioManager.playFail();
      return;
    }
    if (isStart) {
      audioManager.playUITap();
    } else if (!active) {
      audioManager.playSwipe();
    }
    onClick();
  };

  return (
    <button onClick={handleClick} className={`${baseClasses} ${startClasses} ${widthClass}`}>
      <div className={`absolute -top-6 sm:-top-8 left-1/2 -translate-x-1/2 z-10 transition-transform flex items-center justify-center scale-90 sm:scale-100 ${!disabled && 'group-hover:-translate-y-1'}`}>
        {icon}
      </div>
      <span className="text-[1.2rem] sm:text-2xl md:text-3xl text-white font-black tracking-widest text-stroke-sm drop-shadow-md leading-none mb-1 md:mb-2">{label}</span>
    </button>
  );
};

export default function BottomNavigation({ currentScreen, onNavigate }: BottomNavProps) {
  const { previewVehicleId, unlockedVehicles, previewStageId, unlockedStages } = useGameStore();
  
  // Disable start if we are on the vehicle screen AND looking at a locked vehicle
  // Or if on the stage screen AND looking at a locked stage
  const isStartDisabled = 
    (currentScreen === 'vehicle' && !unlockedVehicles.includes(previewVehicleId)) ||
    (currentScreen === 'tune' && !unlockedVehicles.includes(previewVehicleId)) ||
    (currentScreen === 'stage' && !unlockedStages.includes(previewStageId));

  return (
    <footer className="w-full flex justify-center gap-1 pb-4 px-4 sm:px-10 z-20 shrink-0 max-w-6xl mx-auto">
      <NavButton label="SHOP" icon={<ShopIcon />} active={currentScreen === 'shop'} onClick={() => onNavigate('shop')} />
      <NavButton label="STAGE" icon={<StageIcon />} active={currentScreen === 'stage'} onClick={() => onNavigate('stage')} />
      <NavButton label="VEHICLE" icon={<VehicleIcon />} active={currentScreen === 'vehicle'} onClick={() => onNavigate('vehicle')} />
      <NavButton label="TUNE" icon={<TuneIcon />} active={currentScreen === 'tune'} onClick={() => onNavigate('tune')} />
      <NavButton label="START" icon={<StartIcon />} active={false} isStart disabled={isStartDisabled} onClick={() => {
        const state = useGameStore.getState();
        if (currentScreen === 'vehicle' && state.unlockedVehicles.includes(state.previewVehicleId)) {
          state.equipVehicle(state.previewVehicleId);
        }
        if (currentScreen === 'tune' && state.unlockedVehicles.includes(state.previewVehicleId)) {
          state.equipVehicle(state.previewVehicleId);
        }
        if (currentScreen === 'stage' && state.unlockedStages.includes(state.previewStageId)) {
          state.selectStage(state.previewStageId);
        }

        console.log("Loading Vehicle:", useGameStore.getState().equippedVehicleId);
        console.log("Loading Stage:", useGameStore.getState().selectedStageId);
        onNavigate('game');
      }} />
    </footer>
  );
}
