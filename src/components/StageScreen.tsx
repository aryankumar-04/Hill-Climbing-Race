import React, { useState, useEffect } from 'react';
import { useGameStore, STAGE_LIST, StageDef } from '../game/store';
import { LockedCardOverlay } from './LockedCardOverlay';
import { audioManager } from '../game/audio';

export default function StageScreen() {
  const { unlockedStages, selectedStageId, unlockStage, selectStage, setPreviewStageId, bestDistances } = useGameStore();
  
  // Find current index
  const initialIndex = STAGE_LIST.findIndex(s => s.id === selectedStageId);
  const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  const handlePrev = () => {
    audioManager.playSwipe();
    setCurrentIndex(c => (c > 0 ? c - 1 : STAGE_LIST.length - 1));
  };

  const handleNext = () => {
    audioManager.playSwipe();
    setCurrentIndex(c => (c < STAGE_LIST.length - 1 ? c + 1 : 0));
  };

  useEffect(() => {
    setPreviewStageId(STAGE_LIST[currentIndex].id);
  }, [currentIndex, setPreviewStageId]);

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

  const currentStage = STAGE_LIST[currentIndex] as StageDef;
  const isUnlocked = unlockedStages.includes(currentStage.id);
  const isSelected = selectedStageId === currentStage.id;

  const handleCenterClick = () => {
    if (!isUnlocked) {
      const success = unlockStage(currentStage.id, currentStage.unlockCost);
      if (success) {
        audioManager.playUnlock();
      } else {
        audioManager.playFail(); // not enough coins
      }
    } else if (!isSelected) {
      audioManager.playUITap();
      console.log("Selected Stage:", currentStage.id);
      selectStage(currentStage.id);
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
        
        {STAGE_LIST.map((stage, index) => {
          const total = STAGE_LIST.length;
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

          const stageIsUnlocked = unlockedStages.includes(stage.id);
          const stageIsSelected = selectedStageId === stage.id;
          const stageBest = bestDistances[stage.id] || 0;

          return (
            <div 
              key={stage.id}
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
                {stage.name.toUpperCase()}
              </h2>
              
              <div className={`w-full aspect-[16/9] ${isCenter ? 'card-active' : 'card-beveled'} ${stageIsUnlocked ? 'bg-[#7FDDF7]' : 'bg-gray-800'} relative rounded-xl`}>
                
                <div className={`absolute inset-0 rounded-xl overflow-hidden pointer-events-none transition-all duration-300 ${!stageIsUnlocked ? 'brightness-[0.45] saturate-[0.8]' : ''}`}>
                  {/* Custom Environment Backdrops */}
                  <div className="absolute inset-0 z-0">
                  {stage.id === 's_countryside' && (
                     <div className="w-full h-full bg-gradient-to-b from-blue-300 to-blue-500 relative">
                        <div className="absolute bottom-0 left-[-10%] w-[120%] h-[40%] bg-green-600 rounded-t-[50%]"></div>
                        <div className="absolute bottom-0 right-[-10%] w-[80%] h-[50%] bg-green-500 rounded-t-[50%]"></div>
                     </div>
                  )}
                  {stage.id === 's_desert' && (
                     <div className="w-full h-full bg-gradient-to-b from-orange-200 to-orange-400 relative">
                        <div className="absolute bottom-0 left-0 w-full h-[30%] bg-yellow-600 rounded-t-[30%]"></div>
                        <div className="absolute bottom-10 right-0 w-[60%] h-[40%] bg-yellow-500 rounded-t-[40%]"></div>
                     </div>
                  )}
                  {stage.id === 's_arctic' && (
                     <div className="w-full h-full bg-gradient-to-b from-blue-100 to-blue-300 relative">
                        <div className="absolute bottom-0 w-0 h-0 border-l-[100px] border-r-[100px] border-b-[150px] border-transparent border-b-white opacity-80 left-[10%]"></div>
                        <div className="absolute bottom-0 left-[-20%] w-[140%] h-[30%] bg-white rounded-t-[20%]"></div>
                     </div>
                  )}
                  {stage.id === 's_moon' && (
                     <div className="w-full h-full bg-gradient-to-b from-gray-900 to-gray-700 relative">
                        <div className="absolute top-[20%] right-[20%] w-16 h-16 bg-gray-200 rounded-full shadow-[0_0_20px_white]"></div>
                        <div className="absolute bottom-0 left-[-10%] w-[120%] h-[30%] bg-gray-500 rounded-t-[10%]"></div>
                        <div className="absolute bottom-10 left-[20%] w-10 h-4 bg-gray-600 rounded-full"></div>
                     </div>
                  )}
                  {stage.id === 's_highway' && (
                     <div className="w-full h-full bg-gradient-to-b from-blue-400 to-blue-600 relative">
                        <div className="absolute bottom-[20%] w-full h-[30%] bg-gray-600 flex items-center justify-around overflow-hidden">
                           {[...Array(5)].map((_,i) => <div key={i} className="w-10 h-2 bg-yellow-400 transform -skew-x-[45deg]"></div>)}
                        </div>
                        <div className="absolute bottom-0 w-full h-[20%] bg-green-500"></div>
                     </div>
                  )}
                  {stage.id === 's_beach' && (
                     <div className="w-full h-full bg-blue-300 relative">
                        <div className="absolute top-[20%] left-[70%] w-16 h-16 bg-yellow-300 rounded-full"></div>
                        <div className="absolute bottom-[30%] w-full h-[20%] bg-blue-500 opacity-50"></div>
                        <div className="absolute bottom-0 w-full h-[40%] bg-yellow-200"></div>
                     </div>
                  )}
                  {stage.id === 's_forest' && (
                      <div className="w-full h-full bg-gradient-to-b from-green-300 to-green-500 relative">
                        <div className="absolute bottom-0 left-[10%] w-10 h-[50%] bg-[#8B4513]"></div>
                        <div className="absolute bottom-[30%] left-[5%] w-20 h-20 bg-green-800 rounded-full opacity-80"></div>
                        <div className="absolute bottom-0 right-[20%] w-8 h-[60%] bg-[#8B4513]"></div>
                        <div className="absolute bottom-[40%] right-[10%] w-24 h-24 bg-green-700 rounded-full opacity-80"></div>
                        <div className="absolute bottom-0 w-full h-[15%] bg-green-900"></div>
                     </div>
                  )}
                  {stage.id === 's_volcano' && (
                     <div className="w-full h-full bg-red-900 relative">
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[60%] bg-[#3a1c1c] rounded-t-[40%]"></div>
                        <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[20%] h-[40%] bg-orange-500 blur-md"></div>
                        <div className="absolute bottom-0 w-full h-[10%] bg-[#1a0a0a]"></div>
                     </div>
                  )}
                  {stage.id === 's_neoncity' && (
                     <div className="w-full h-full bg-purple-900 relative flex items-end justify-center gap-1 opacity-70">
                        <div className="w-[20%] h-[70%] bg-black"></div>
                        <div className="w-[15%] h-[40%] bg-black"></div>
                        <div className="w-[25%] h-[80%] bg-black border-t-2 border-pink-500"></div>
                        <div className="w-[10%] h-[50%] bg-black"></div>
                        <div className="absolute bottom-0 w-full h-[15%] bg-blue-900 z-10 border-t-2 border-cyan-400 border-dashed"></div>
                     </div>
                  )}
                  {stage.id === 's_mars' && (
                     <div className="w-full h-full bg-orange-800 relative">
                       <div className="absolute bottom-[-10%] left-[-20%] w-[80%] h-[50%] bg-red-900 rounded-t-[100%]"></div>
                       <div className="absolute bottom-0 right-[-10%] w-[60%] h-[40%] bg-orange-900 rounded-t-[100%]"></div>
                     </div>
                  )}
                </div>
              </div>
                
              {/* Locked Card Overlay (renders outside bounds) */}
              <LockedCardOverlay 
                isLocked={!stageIsUnlocked} 
                  isCenter={isCenter} 
                  unlockCost={stage.unlockCost} 
                  costType="coins" 
                />
                
                {/* Stats overlays (only for unlocked and center) */}
                {isCenter && stageIsUnlocked && (
                  <div className="absolute bottom-2 left-2 right-2 flex justify-between z-40 bg-black/50 px-4 py-2 rounded-lg border border-white/20 backdrop-blur-sm pointer-events-none">
                    <div className="flex flex-col">
                      <span className="text-white/70 text-[10px] md:text-xs font-bold uppercase">Best</span>
                      <span className="text-yellow-400 font-bold text-lg leading-none">{Math.floor(stageBest)}m</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-white/70 text-[10px] md:text-xs font-bold uppercase">Target</span>
                      <span className="text-red-400 font-bold text-lg leading-none">{stage.targetDistance}m</span>
                    </div>
                  </div>
                )}
                
                {/* Status Overlays */}
                {isCenter && stageIsUnlocked && (
                  <div className="absolute top-2 left-0 right-0 flex justify-center z-40 pointer-events-none">
                    {stageIsSelected && (
                       <div className="bg-green-600 px-6 py-1 rounded-full border-4 border-black shadow-lg">
                          <span className="text-white font-bold tracking-widest text-stroke-sm">SELECTED</span>
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
