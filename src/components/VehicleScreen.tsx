import React, { useState, useEffect, useRef } from 'react';
import { useGameStore, VEHICLE_LIST, VehicleDef } from '../game/store';
import { StandaloneVehicle } from './VehicleGraphics';
import { LockedCardOverlay } from './LockedCardOverlay';
import { audioManager } from '../game/audio';

export default function VehicleScreen() {
  const { unlockedVehicles, equippedVehicleId, unlockVehicle, equipVehicle, setPreviewVehicleId, vehicleTunes } = useGameStore();
  
  // Find current index
  const initialIndex = VEHICLE_LIST.findIndex(v => v.id === equippedVehicleId);
  const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  const handlePrev = () => {
    audioManager.playSwipe();
    setCurrentIndex(c => (c > 0 ? c - 1 : VEHICLE_LIST.length - 1));
  };

  const handleNext = () => {
    audioManager.playSwipe();
    setCurrentIndex(c => (c < VEHICLE_LIST.length - 1 ? c + 1 : 0));
  };

  useEffect(() => {
    setPreviewVehicleId(VEHICLE_LIST[currentIndex].id);
  }, [currentIndex, setPreviewVehicleId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        handlePrev();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if ('touches' in e) {
      setDragStartX(e.touches[0].clientX);
    } else {
      setDragStartX((e as React.MouseEvent).clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (dragStartX === null) return;
    let currentX = 0;
    if ('touches' in e) {
      currentX = e.touches[0].clientX;
    } else {
      currentX = (e as React.MouseEvent).clientX;
    }
    setDragOffset(currentX - dragStartX);
  };

  const handleTouchEnd = () => {
    if (dragOffset > 50) {
      handlePrev();
    } else if (dragOffset < -50) {
      handleNext();
    }
    setDragStartX(null);
    setDragOffset(0);
  };

  const currentVehicle: VehicleDef = VEHICLE_LIST[currentIndex];
  const isUnlocked = unlockedVehicles.includes(currentVehicle.id);
  const isEquipped = equippedVehicleId === currentVehicle.id;

  const handleCenterClick = () => {
    if (!isUnlocked) {
      const success = unlockVehicle(currentVehicle.id, currentVehicle.unlockCost, currentVehicle.costType);
      if (success) {
        audioManager.playUnlock();
      } else {
        audioManager.playFail();
      }
    } else if (!isEquipped) {
      audioManager.playUITap();
      console.log("Selected Vehicle:", currentVehicle.id);
      equipVehicle(currentVehicle.id);
    }
  };

  return (
    <div 
      className="w-full h-full flex flex-col items-center justify-center absolute inset-0 pb-[8vh] md:pb-[12vh] overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseMove={handleTouchMove}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
      <div className="flex items-center justify-center w-full max-w-[1400px] h-[60vh] md:h-[65vh] relative perspective-1000">
        
        {VEHICLE_LIST.map((vehicle, index) => {
          const total = VEHICLE_LIST.length;
          let offset = index - currentIndex;
          
          if (offset > total / 2) {
             offset -= total;
          } else if (offset < -total / 2) {
             offset += total;
          }
          
          const absOffset = Math.abs(offset);
          
          if (absOffset > 2) return null; // Only render center, nearest neighbors, and hidden exit states

          const isCenter = offset === 0;
          const isLeft = offset < 0;
          const isRight = offset > 0;
          
          const zIndex = 30 - absOffset * 10;
          
          // Calculate transforms based on position + drag delta
          const dragShift = isCenter ? dragOffset : 0;
          
          let translateX = '0%';
          let translateZ = '0px';
          let scale = 1;
          let opacity = 1;
          let pointerEvents: 'auto' | 'none' = 'auto';

          if (isCenter) {
            translateX = `calc(0% + ${dragShift}px)`;
            scale = 1;
            translateZ = '0px';
            opacity = 1;
          } else if (isLeft) {
            if (absOffset === 1) {
              translateX = 'calc(-110%)';
              scale = 0.75;
              translateZ = '-100px';
              opacity = 0.6;
            } else {
              translateX = 'calc(-200%)';
              scale = 0.5;
              translateZ = '-200px';
              opacity = 0;
              pointerEvents = 'none';
            }
          } else if (isRight) {
            if (absOffset === 1) {
              translateX = 'calc(110%)';
              scale = 0.75;
              translateZ = '-100px';
              opacity = 0.6;
            } else {
              translateX = 'calc(200%)';
              scale = 0.5;
              translateZ = '-200px';
              opacity = 0;
              pointerEvents = 'none';
            }
          }

          const vehicleIsUnlocked = unlockedVehicles.includes(vehicle.id);
          const vehicleIsEquipped = equippedVehicleId === vehicle.id;
          const tunes = vehicleTunes?.[vehicle.id] || { engine: 1, suspension: 1, tires: 1, drivetrain: 1 };

          return (
            <div 
              key={vehicle.id}
              className={`absolute transition-all duration-400 ease-out flex flex-col items-center ${isCenter ? 'cursor-pointer hover:scale-[1.02]' : 'cursor-pointer hover:opacity-80'}`}
              style={{
                transform: `translateX(${translateX}) translateZ(${translateZ}) scale(${scale})`,
                zIndex,
                opacity,
                pointerEvents,
                width: isCenter ? '55%' : '40%',
                maxWidth: isCenter ? '600px' : '450px'
              }}
              onClick={() => {
                if (isLeft && absOffset === 1) handlePrev();
                else if (isRight && absOffset === 1) handleNext();
                else if (isCenter) handleCenterClick();
              }}
            >
              <h2 className={`text-[2rem] md:text-5xl text-stroke-sm mb-4 text-center font-black tracking-widest leading-none drop-shadow-md transition-opacity ${!isCenter && 'opacity-50'}`}>
                {vehicle.name.toUpperCase()}
              </h2>
              
              <div className={`w-full aspect-[16/9] ${isCenter ? 'card-active' : 'card-beveled'} ${vehicleIsUnlocked ? 'bg-[#7FDDF7]' : 'bg-gray-800'} relative rounded-xl`}>
                
                {/* Background rendering inside bounded overflow */}
                <div className={`absolute inset-0 rounded-xl overflow-hidden pointer-events-none transition-all duration-300 ${!vehicleIsUnlocked ? 'brightness-[0.45] saturate-[0.8]' : ''}`}>
                  {/* Environment Ground graphic */}
                  <div className={`absolute bottom-0 w-full h-[35%] ${vehicleIsUnlocked ? 'bg-[#8BC34A] border-green-700' : 'bg-[#5d681c] border-black'} border-t-4`}></div>
                  
                  {/* Vehicle Graphics Rendering based on ID */}
                  <div className={`absolute inset-0 ${isCenter ? 'scale-100' : 'scale-75 opacity-80'} z-10 flex justify-center items-center pb-[10%] pointer-events-none transition-transform duration-300`}>
                    <StandaloneVehicle id={vehicle.id} />
                  </div>
                </div>

                {/* Locked Card Overlay (renders outside bounds) */}
                <LockedCardOverlay 
                  isLocked={!vehicleIsUnlocked} 
                  isCenter={isCenter} 
                  unlockCost={vehicle.unlockCost} 
                  costType={vehicle.costType} 
                />
                
                {/* Stats overlays (only for unlocked and center) */}
                {isCenter && vehicleIsUnlocked && (
                  <div className="absolute top-2 left-2 flex flex-col gap-1 z-40 opacity-80 pointer-events-none">
                    <div className="bg-black/80 px-2 py-0.5 rounded border border-black shadow text-[10px] md:text-xs">
                      <span className="text-white font-bold tracking-wider">ENGINE LV {tunes.engine}</span>
                    </div>
                    <div className="bg-black/80 px-2 py-0.5 rounded border border-black shadow text-[10px] md:text-xs">
                      <span className="text-white font-bold tracking-wider">SHOCKS LV {tunes.suspension}</span>
                    </div>
                    <div className="bg-black/80 px-2 py-0.5 rounded border border-black shadow text-[10px] md:text-xs">
                      <span className="text-white font-bold tracking-wider">TIRES LV {tunes.tires}</span>
                    </div>
                    <div className="bg-black/80 px-2 py-0.5 rounded border border-black shadow text-[10px] md:text-xs">
                      <span className="text-white font-bold tracking-wider">4WD LV {tunes.drivetrain}</span>
                    </div>
                  </div>
                )}
                
                {/* Status Overlays */}
                {isCenter && vehicleIsUnlocked && (
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center z-40 pointer-events-none">
                    {vehicleIsEquipped ? (
                       <div className="bg-green-600 px-6 py-1 rounded-full border-4 border-black shadow-lg">
                          <span className="text-white font-bold tracking-widest text-stroke-sm">EQUIPPED</span>
                       </div>
                    ) : (
                       <div className="bg-blue-500 px-6 py-1 rounded-full border-4 border-black shadow-lg animate-pulse">
                          <span className="text-white font-bold tracking-widest text-stroke-sm">TAP TO EQUIP</span>
                       </div>
                    )}
                  </div>
                )}
                
                {/* Side cards price overlays are now handled by LockedCardOverlay */}
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
}
