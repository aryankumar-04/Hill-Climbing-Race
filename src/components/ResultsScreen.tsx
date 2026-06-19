import React, { useEffect, useState } from 'react';
import { useGameStore, VEHICLE_LIST, STAGE_LIST } from '../game/store';
import { CoinIcon, GemIcon } from './SharedUI';
import GameThemeBackground from './GameThemeBackground';
import { StandaloneVehicle } from './VehicleGraphics';
import { StageBackground, STAGE_CONFIGS } from './StageRenderer';
import { audioManager } from '../game/audio';

interface ResultsScreenProps {
  onContinue: () => void;
}

export default function ResultsScreen({ onContinue }: ResultsScreenProps) {
  const { distance, bestDistance, currentRunCoins, currentRunGems, failReason, resetRun, equippedVehicleId, selectedStageId, bestDistances } = useGameStore();
  const equippedVehicleName = VEHICLE_LIST.find(v => v.id === equippedVehicleId)?.name || 'VEHICLE';
  const selectedStageName = STAGE_LIST.find(s => s.id === selectedStageId)?.name || 'STAGE';
  
  const stageConfig = STAGE_CONFIGS[selectedStageId] || STAGE_CONFIGS['s_countryside'];
  const [animationStep, setAnimationStep] = useState(0);
  const [displayDistance, setDisplayDistance] = useState(0);
  const [displayCoins, setDisplayCoins] = useState(0);
  
  useEffect(() => {
    // Animation sequence
    const timers = [
      setTimeout(() => setAnimationStep(1), 500), // Card slides in
      setTimeout(() => setAnimationStep(2), 1000), // Title appears
      setTimeout(() => {
        setAnimationStep(3); // Stats appear
        if (distance > 0 && distance >= (bestDistances[selectedStageId] || 0)) {
           // wait best distance is already recorded in store via GameEngine, we can check if it's identical but we don't have previous.
           // Play anyway on stats appear
           audioManager.playUITap();
        }
      }, 1500), 
      setTimeout(() => setAnimationStep(4), 2500)  // Footer appears
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (animationStep === 4) {
      if (distance >= (bestDistances[selectedStageId] || 0) && distance > 50) {
        audioManager.playResultsRecord();
      }
    }
  }, [animationStep]);

  useEffect(() => {
    if (animationStep >= 3) {
      // Count up distance
      let distObj = { val: 0 };
      const distInterval = setInterval(() => {
        distObj.val += Math.max(1, Math.floor(distance / 20));
        if (distObj.val >= distance) {
          distObj.val = distance;
          clearInterval(distInterval);
        }
        setDisplayDistance(distObj.val);
      }, 30);

      // Count up coins
      let coinObj = { val: 0 };
      const coinInterval = setInterval(() => {
        coinObj.val += Math.max(1, Math.floor(currentRunCoins / 20));
        if (coinObj.val >= currentRunCoins) {
          coinObj.val = currentRunCoins;
          clearInterval(coinInterval);
        }
        setDisplayCoins(coinObj.val);
      }, 30);
      
      return () => {
        clearInterval(distInterval);
        clearInterval(coinInterval);
      };
    }
  }, [animationStep, distance, currentRunCoins]);

  // Use the HTML provided in the instructions for the layout.
  // Converting HTML to JSX and adding logic...
  
  return (
    <div 
      className="absolute inset-0 z-[200] overflow-hidden select-none cursor-pointer flex items-center justify-center"
      onClick={() => {
        if (animationStep >= 4) {
          audioManager.playUITap();
          resetRun();
          onContinue();
          // Resetting will cause App.tsx to remount Menu/Vehicle views
        } else {
          // Skip animation
          setAnimationStep(4);
          setDisplayDistance(distance);
          setDisplayCoins(currentRunCoins);
        }
      }}
    >
      <GameThemeBackground 
        brightness={1.1} 
        particleDensity="high" 
        particleColor="#fbbf24" // gold particles for rewards
        spotlightIntensity={1.3}
      />

      <style>{`
        .results-text-outline {
          text-shadow: 
            -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000,
            -3px 0 0 #000, 3px 0 0 #000, 0 -3px 0 #000, 0 3px 0 #000;
        }
        .results-text-outline-sm {
          text-shadow: 
            -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
        }
      `}</style>
      
      <main className="relative z-10 flex w-full max-w-6xl p-8 items-center justify-between gap-12 font-['Teko',sans-serif]">
        
        {/* Left Section - Polaroid */}
        <section 
          className={`flex-shrink-0 w-[550px] transition-all duration-500 ease-out ${animationStep >= 1 ? 'translate-x-0 opacity-100 rotate-[-3deg] hover:rotate-0' : '-translate-x-20 opacity-0'}`}
        >
          <div className="bg-white p-4 pb-0 shadow-[15px_15px_30px_rgba(0,0,0,0.5)] rounded-sm flex flex-col relative">
            {/* Polaroid Image Container */}
            <div className="relative w-full h-[400px] overflow-hidden border-2 border-gray-200">
              {/* Background image from game */}
              <div className="absolute inset-0">
                <StageBackground id={selectedStageId} />
                <div className="absolute z-0 bottom-0 w-full h-1/3 border-t-8" style={{ backgroundColor: stageConfig.groundFill, borderColor: stageConfig.groundStroke }}></div>
                
                {/* Simulated Final Car State (Flipped or Coasted) */}
                <div className={`absolute z-10 bottom-24 left-1/4 transform ${failReason.includes('DRIVER') || failReason.includes('FLIP') ? 'rotate-180' : 'rotate-12'}`}>
                  <StandaloneVehicle id={equippedVehicleId} />
                </div>
              </div>
              
              {/* Overlay Text on Polaroid */}
              <div className="absolute top-4 left-4 text-white z-20 results-text-outline font-bold text-4xl leading-tight">
                <div>HILL CLIMB</div>
                <div className="text-5xl">RACING</div>
              </div>
              <div className="absolute top-4 right-4 text-white z-20 results-text-outline font-bold text-right leading-none">
                <div className="text-6xl mb-2">{distance}m</div>
                <div className="text-2xl tracking-wide uppercase">IN GAME RIDE</div>
                <div className="text-xl">(best: {bestDistance}m)</div>
              </div>
              <div className="absolute top-1/2 left-4 text-white z-20 results-text-outline-sm font-bold text-2xl transform -translate-y-1/2 uppercase">
                {equippedVehicleName} <br /> ON {selectedStageName}
              </div>
            </div>
            
            {/* Share Section */}
            <div className="flex items-center justify-between py-4 px-2">
              <div className="flex gap-2">
                <div className="w-12 h-12 bg-blue-600 rounded-md shadow-md flex items-center justify-center text-white font-bold text-2xl border-b-4 border-blue-800">f</div>
                <div className="w-12 h-12 bg-sky-400 rounded-md shadow-md flex items-center justify-center text-white font-bold text-2xl border-b-4 border-sky-600">t</div>
                <div className="w-12 h-12 bg-red-600 rounded-md shadow-md flex items-center justify-center text-white font-bold text-2xl border-b-4 border-red-800">g+</div>
              </div>
              <div className="text-4xl text-black font-bold tracking-wider pt-2">SHARE</div>
            </div>
          </div>
        </section>
        
        {/* Right Section - Stats */}
        <section className="flex flex-col items-center justify-start flex-1 gap-8 text-white font-bold h-[550px]">
          
          {/* Header */}
          <h1 className={`text-7xl tracking-wide results-text-outline mb-4 uppercase transition-all duration-300 ${animationStep >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
            {failReason || 'DRIVER DOWN'}
          </h1>
          
          {/* Main Stats */}
          <div className={`flex flex-col gap-4 w-full pl-12 text-4xl results-text-outline transition-all duration-500 ${animationStep >= 3 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-400 rounded-sm transform rotate-45 border-2 border-white shadow-md flex items-center justify-center relative">
                <div className="w-6 h-1 bg-white transform -rotate-45"></div>
                <div className="absolute w-1 h-6 bg-white transform -rotate-45"></div>
              </div>
              <span>DISTANCE: {displayDistance}m</span>
              {displayDistance >= bestDistance && distance > 0 && distance >= bestDistance && (
                <span className="text-yellow-400 ml-4 animate-bounce">NEW RECORD!</span>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 relative">
                <GemIcon />
              </div>
              <span>+{currentRunGems} GEMS</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 relative">
                 <CoinIcon />
              </div>
              <span className="text-yellow-400">+{displayCoins} COINS</span>
            </div>
            
          </div>
          
          {/* Flip Stats Container */}
          <div className={`relative w-full h-40 mt-8 transition-opacity duration-500 ${animationStep >= 3 ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute top-0 left-12 text-3xl results-text-outline transform -rotate-6">0xAIR TIME</div>
            <div className="absolute top-4 right-12 text-3xl results-text-outline transform rotate-6">0xBACK FLIP</div>
            <div className="absolute bottom-8 left-32 text-3xl results-text-outline transform -rotate-3">0xFLIP</div>
            <div className="absolute bottom-4 right-20 text-3xl results-text-outline transform rotate-3">0xNECK FLIP</div>
          </div>
          
          {/* Footer Text */}
          <div className={`mt-auto text-4xl results-text-outline ${animationStep >= 4 ? 'animate-pulse opacity-100' : 'opacity-0'}`}>
            PRESS BUTTON TO CONTINUE
          </div>
          
        </section>
        
      </main>
    </div>
  );
}
