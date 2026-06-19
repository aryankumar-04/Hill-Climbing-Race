import { useState, useEffect, useRef } from 'react';
import { Trophy, Check, RotateCw, X } from 'lucide-react';
import { CoinIcon, GemIcon } from './SharedUI';
import { useGameStore } from '../game/store';
import { GameEngine } from '../game/GameEngine';
import { initInput, setButtonInput } from '../game/input';
import ResultsScreen from './ResultsScreen';
import { VehicleGraphics } from './VehicleGraphics';

import { StageBackground } from './StageRenderer';

const Gauge = ({ label, rotateValue = '-45deg' }: { label: string, rotateValue?: string }) => (
  <div className="relative flex flex-col items-center pointer-events-none">
    <div className="w-32 h-32 rounded-full border-[6px] border-gray-400 bg-gray-800 shadow-[0_0_10px_black,inset_0_0_15px_black] relative overflow-hidden flex justify-center">
      <div className="absolute w-[80%] h-[80%] border-[8px] border-transparent border-t-red-600 border-r-red-600 rounded-full transform rotate-[15deg] -top-2 -right-2"></div>
      
      {/* Ticks */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="absolute w-1 h-3 bg-white top-2 origin-[50%_56px]" style={{ transform: `rotate(${-60 + i * 30}deg)` }}></div>
      ))}

      <div className="absolute bottom-[20%] w-1.5 h-16 bg-white origin-bottom transform rounded-full shadow" style={{ rotate: rotateValue }}></div>
      <div className="absolute bottom-[20%] w-5 h-5 bg-gray-400 rounded-full translate-y-1/2 shadow-inner border border-gray-600"></div>
    </div>
    <span className="text-2xl text-stroke tracking-widest font-black absolute -bottom-6 bg-transparent">{label}</span>
  </div>
);

const Pedal = ({ label, type }: { label: string, type: 'gas'|'brake' }) => (
  <div 
    className="relative w-36 h-48 z-10 flex flex-col items-center justify-end group select-none pointer-events-auto"
    onPointerDown={(e) => { e.preventDefault(); setButtonInput(type, true); }}
    onPointerUp={(e) => { e.preventDefault(); setButtonInput(type, false); }}
    onPointerLeave={(e) => { e.preventDefault(); setButtonInput(type, false); }}
  >
    <div className="absolute bottom-[-20px] w-8 h-12 bg-gray-500 border-x-2 border-gray-800 -z-10"></div>
    <button className="w-full h-full pedal flex flex-col items-center justify-between py-6 px-4 hover:brightness-110 active:scale-[0.98] transition-all">
       <div className="grid grid-cols-3 gap-3 w-full px-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-6 h-6 bg-gray-800 rounded-full shadow-inner border shadow-[inset_2px_2px_5px_black,1px_1px_2px_white]"></div>
          ))}
       </div>
       <span className="text-4xl font-black text-gray-800 tracking-wider opacity-80">{label}</span>
    </button>
  </div>
);

const getNextMilestone = (current: number) => {
  if (current < 50) return 50;
  if (current < 100) return 100;
  if (current < 250) return 250;
  if (current < 500) return 500;
  
  let milestone = 1000;
  while (true) {
      if (current < milestone) return milestone;
      if (current < milestone * 2.5) return milestone * 2.5;
      if (current < milestone * 5) return milestone * 5;
      milestone *= 10;
  }
};

const getPrevMilestone = (current: number) => {
  if (current < 50) return 0;
  if (current < 100) return 50;
  if (current < 250) return 100;
  if (current < 500) return 250;
  
  let milestone = 100;
  while (true) {
      if (current < milestone * 5) return milestone * 2.5;
      if (current < milestone * 10) return milestone * 5;
      if (current < milestone * 25) return milestone * 10;
      milestone *= 10;
  }
};

const DistanceTracker = () => {
  const { distance, bestDistance, addCoin } = useGameStore();
  const [celebrating, setCelebrating] = useState(false);
  const [reachedPB, setReachedPB] = useState(false);
  const [lastMilestone, setLastMilestone] = useState(0);
  
  // Capture static PB for the current run
  const [initialBest] = useState(bestDistance);

  const prev = getPrevMilestone(distance);
  const next = getNextMilestone(distance);
  const progressPercent = Math.max(0, Math.min(100, ((distance - prev) / (next - prev)) * 100));

  useEffect(() => {
    if (prev > lastMilestone && lastMilestone > 0) {
      // Reached a milestone!
      setCelebrating(true);
      
      let reward = 5;
      if (prev >= 100) reward = 10;
      if (prev >= 250) reward = 20;
      if (prev >= 500) reward = 50;
      if (prev >= 1000) reward = 100;
      
      addCoin(reward);

      setTimeout(() => setCelebrating(false), 2000);
    }
    setLastMilestone(prev);
  }, [prev, lastMilestone, addCoin]);

  useEffect(() => {
    // Only celebrate PB if we actually passed the strictly positive run-start PB
    if (initialBest > 0 && distance >= initialBest && !reachedPB) {
      setReachedPB(true);
      setCelebrating(true);
      setTimeout(() => setCelebrating(false), 2000);
    }
  }, [distance, initialBest, reachedPB]);

  // Position for PB marker (always use the initial best so it doesn't move)
  let pbPosition = -1;
  if (initialBest > prev && initialBest <= next) {
    pbPosition = ((initialBest - prev) / (next - prev)) * 100;
  }

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[40%] min-w-[320px] max-w-[600px] z-50">
      
      {/* Celebration Text Popup */}
      <div className={`absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center transition-all duration-300 ${celebrating ? 'opacity-100 -translate-y-4 scale-110' : 'opacity-0 translate-y-2 scale-50 pointer-events-none'}`}>
        <span className="text-yellow-400 font-black text-3xl text-stroke whitespace-nowrap">
          {reachedPB && distance >= initialBest && initialBest > 0 ? 'NEW RECORD!' : 'MILESTONE REACHED!'}
        </span>
      </div>

      <div className={`w-full h-3 border-2 border-black rounded-full relative flex items-center shadow-[0_4px_0_rgba(0,0,0,0.2)] transition-all duration-300 ${celebrating ? 'bg-yellow-500 shadow-[0_0_15px_#eab308]' : 'bg-gray-800'}`}>
        
        {/* Progress Fill */}
        <div 
          className="h-full bg-blue-500 rounded-full transition-all duration-100 ease-linear border-r border-white/50" 
          style={{ width: `${progressPercent}%` }}
        />

        {/* Current Distance Indicator */}
        <div className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-100 ease-linear" style={{ left: `${progressPercent}%` }}>
          <div className="w-4 h-4 bg-white border-2 border-black rotate-45 mb-1 z-20 shadow-[0_2px_4px_rgba(0,0,0,0.5)]"></div>
          <span className="absolute top-5 text-2xl text-stroke font-black text-white">{distance}m</span>
        </div>

        {/* Start Milestone */}
        <div className="absolute left-[-30px] font-bold text-gray-200" style={{ textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000' }}>{prev}m</div>

        {/* End Milestone */}
        <div className="absolute right-[-30px] flex items-center gap-1 origin-left">
          <Trophy className={`w-6 h-6 text-yellow-400 drop-shadow transition-all duration-500 ${celebrating ? 'scale-150 fill-yellow-400 animate-pulse' : 'scale-100'}`} fill={celebrating ? 'currentColor' : 'transparent'} />
          <span className="font-bold text-gray-200" style={{ textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000' }}>{next}m</span>
        </div>

        {/* PB Marker */}
        {pbPosition !== -1 && !reachedPB && (
          <div className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none" style={{ left: `${pbPosition}%` }}>
            <div className="w-1 h-5 bg-red-500 border border-black z-10"></div>
            <span className="absolute top-4 text-xs font-bold text-red-500" style={{ textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000' }}>PB</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default function GameScreen({ onExit }: { onExit: () => void }) {
  const { status, failReason, distance, bestDistance, coins, currentRunCoins, currentRunGems, fuel, rpm, setStatus, resetRun, loadSaves, equippedVehicleId, selectedStageId, pedalsEnabled } = useGameStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  const wheel1Ref = useRef<HTMLDivElement>(null);
  const wheel2Ref = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  useEffect(() => {
    initInput();
    loadSaves();
    resetRun();
    
    console.log("Spawned Vehicle:", useGameStore.getState().equippedVehicleId);
    console.log("Stage Spawned:", useGameStore.getState().selectedStageId);
    
    if (canvasRef.current && carRef.current && wheel1Ref.current && wheel2Ref.current) {
      engineRef.current = new GameEngine(
        canvasRef.current, 
        carRef.current, 
        wheel1Ref.current, 
        wheel2Ref.current, 
        useGameStore.getState().equippedVehicleId,
        useGameStore.getState().selectedStageId
      );
      engineRef.current.start();
    }
    
    return () => {
      engineRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    if (status === 'paused') {
      // Just pausing the logic in GameEngine
    }
  }, [status]);
  
  const handleRestart = () => {
    resetRun();
    if (engineRef.current) {
      engineRef.current.stop();
      engineRef.current = new GameEngine(
          canvasRef.current!, 
          carRef.current!, 
          wheel1Ref.current!, 
          wheel2Ref.current!,
          useGameStore.getState().equippedVehicleId,
          useGameStore.getState().selectedStageId
      );
      engineRef.current.start();
    }
  };

  const handlePause = (paused: boolean) => {
    setStatus(paused ? 'paused' : 'playing');
  };

  return (
    <div className="w-full h-full absolute inset-0 overflow-hidden select-none z-50 flex flex-col">
      <StageBackground id={selectedStageId} />
      {/* Background & Terrain */}
      <div className="absolute inset-0 z-0">
         <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10" />

         {/* Physics Entities Layer */}
         <div className="absolute inset-0 z-20 pointer-events-none">
           <div ref={carRef} className="absolute w-[176px] h-[56px] origin-center -ml-[88px] -mt-[28px] top-0 left-0">
             <VehicleGraphics id={equippedVehicleId} type="chassis" />
           </div>
           
           <div ref={wheel1Ref} className="absolute w-[56px] h-[56px] origin-center -ml-[28px] -mt-[28px] top-0 left-0">
             <VehicleGraphics id={equippedVehicleId} type="wheel1" />
           </div>
           <div ref={wheel2Ref} className="absolute w-[56px] h-[56px] origin-center -ml-[28px] -mt-[28px] top-0 left-0">
             <VehicleGraphics id={equippedVehicleId} type="wheel2" />
           </div>
         </div>
      </div>

      {/* HUD Layer */}
      <div className="relative z-50 flex-1 flex flex-col justify-between pointer-events-none">
        
        {/* Top HUD */}
        <div className="flex justify-between p-4 px-6 items-start">
          <div className="flex flex-col gap-3 pointer-events-auto">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-red-600 rounded drop-shadow border-2 border-black flex items-center justify-center p-1">
                <div className="w-full h-full border-2 border-white/20 rounded-sm bg-red-700"></div>
              </div>
              <div className="w-48 h-8 bg-gray-300 border-[3px] border-black rounded relative shadow-inner overflow-hidden">
                <div className={`h-full border-r-2 border-black transition-all ${fuel > 50 ? 'bg-green-500' : fuel > 20 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${fuel}%` }}></div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
               <CoinIcon />
               <div className="bg-white border-2 border-black px-3 rounded text-2xl font-black min-w-[3rem] text-center shadow">{currentRunCoins}</div>
            </div>
            <div className="flex items-center gap-2">
               <GemIcon />
               <div className="bg-white border-2 border-black px-3 rounded text-2xl font-black min-w-[3rem] text-center shadow">{currentRunGems}</div>
            </div>
          </div>

          <DistanceTracker />

          <div className="flex gap-4 pointer-events-auto">
             <button onClick={() => handlePause(true)} className="w-14 h-16 bg-white rounded border-4 border-black flex items-center justify-center shadow-lg hover:bg-gray-200 gap-1.5 p-2 align-baseline mt-2">
               <div className="w-2.5 h-8 bg-black rounded-sm shadow-inner"></div>
               <div className="w-2.5 h-8 bg-black rounded-sm shadow-inner"></div>
             </button>
          </div>
        </div>

        {/* Bottom HUD */}
        <div className="p-6 pb-10 flex justify-between items-end pointer-events-none">
          {pedalsEnabled ? <Pedal label="BRAKE" type="brake" /> : <div className="w-36 h-48" />}
          
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-end gap-16 pointer-events-none hidden md:flex">
             {/* Optional Speed display, ignored for now */}
             
             <Gauge label="RPM" rotateValue={`${-60 + Math.min(120, (rpm / 8000) * 120)}deg`} />
             <Gauge label="BOOST" rotateValue="-60deg" />
          </div>

          {pedalsEnabled ? <Pedal label="GAS" type="gas" /> : <div className="w-36 h-48" />}
        </div>

      </div>

      {/* Paused Modal Layer */}
      {status === 'paused' && (
        <div className="absolute inset-0 bg-black/60 z-[100] flex items-center justify-center pointer-events-auto">
          <div className="w-[420px] bg-[#2a2d34] border-4 border-[#0b0c0f] rounded-lg shadow-[0_0_0_2px_#5b6676_inset,_0_10px_30px_rgba(0,0,0,0.8)] flex flex-col pb-6 relative translate-y-[-20px]">
            
            <div className="w-full relative flex justify-center py-5">
              <h2 className="text-4xl text-[#7a8594] font-bold tracking-widest text-shadow drop-shadow-[0_2px_2px_rgba(0,0,0,1)] pt-2">PAUSED</h2>
              <button 
                onClick={() => handlePause(false)}
                className="absolute top-2 right-2 w-[52px] h-[48px] bg-[#d3d3d3] rounded-lg border-4 border-black shadow-[inset_0_-4px_0_rgba(0,0,0,0.2)] flex items-center justify-center hover:bg-white active:scale-95 active:shadow-[inset_0_-1px_0_rgba(0,0,0,0.2)] active:translate-y-1 transition-all"
              >
                <X strokeWidth={6} className="w-8 h-8 text-[#1b1c1e] drop-shadow-sm -mt-1" />
              </button>
            </div>

            <div className="w-full flex flex-col gap-5 px-6 pt-2">
              <button onClick={() => handlePause(false)} className="w-full h-[72px] bg-[#22252a] rounded shadow-[0_0_0_2px_#4c5562_inset,0_4px_10px_rgba(0,0,0,0.5)] border-2 border-black flex items-stretch overflow-hidden group hover:bg-[#2c3036] active:translate-y-1 active:shadow-[0_0_0_2px_#4c5562_inset]">
                <div className="w-20 border-r-2 border-black flex items-center justify-center bg-[#22252a] group-hover:bg-[#2c3036] shadow-[inset_-2px_0_4px_rgba(0,0,0,0.3)]">
                   <Check strokeWidth={6} className="w-10 h-10 text-[#a3b1c6] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] group-hover:brightness-125" />
                </div>
                <div className="flex-1 flex items-center justify-center bg-[#22252a] group-hover:bg-[#2c3036] relative shadow-[inset_2px_0_4px_rgba(255,255,255,0.05)]">
                   <span className="text-[28px] font-bold tracking-widest text-[#697482] drop-shadow-[0_2px_1px_rgba(0,0,0,0.8)] group-hover:brightness-125">RESUME</span>
                </div>
              </button>

              <button onClick={handleRestart} className="w-full h-[72px] bg-[#22252a] rounded shadow-[0_0_0_2px_#4c5562_inset,0_4px_10px_rgba(0,0,0,0.5)] border-2 border-black flex items-stretch overflow-hidden group hover:bg-[#2c3036] active:translate-y-1 active:shadow-[0_0_0_2px_#4c5562_inset]">
                <div className="w-20 border-r-2 border-black flex items-center justify-center bg-[#22252a] group-hover:bg-[#2c3036] shadow-[inset_-2px_0_4px_rgba(0,0,0,0.3)]">
                   <RotateCw strokeWidth={5} className="w-9 h-9 text-[#a3b1c6] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] group-hover:brightness-125 -scale-x-100" />
                </div>
                <div className="flex-1 flex items-center justify-center bg-[#22252a] group-hover:bg-[#2c3036] relative shadow-[inset_2px_0_4px_rgba(255,255,255,0.05)]">
                   <span className="text-[28px] font-bold tracking-widest text-[#697482] drop-shadow-[0_2px_1px_rgba(0,0,0,0.8)] group-hover:brightness-125">RESTART</span>
                </div>
              </button>

              <button onClick={onExit} className="w-full h-[72px] bg-[#22252a] rounded shadow-[0_0_0_2px_#4c5562_inset,0_4px_10px_rgba(0,0,0,0.5)] border-2 border-black flex items-stretch overflow-hidden group hover:bg-[#2c3036] active:translate-y-1 active:shadow-[0_0_0_2px_#4c5562_inset]">
                <div className="w-20 border-r-2 border-black flex items-center justify-center bg-[#22252a] group-hover:bg-[#2c3036] shadow-[inset_-2px_0_4px_rgba(0,0,0,0.3)]">
                   <X strokeWidth={6} className="w-10 h-10 text-[#a3b1c6] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] group-hover:brightness-125" />
                </div>
                <div className="flex-1 flex items-center justify-center bg-[#22252a] group-hover:bg-[#2c3036] relative shadow-[inset_2px_0_4px_rgba(255,255,255,0.05)]">
                   <span className="text-[28px] font-bold tracking-widest text-[#697482] drop-shadow-[0_2px_1px_rgba(0,0,0,0.8)] group-hover:brightness-125">EXIT</span>
                </div>
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* Results Layer */}
      {status === 'results' && (
        <ResultsScreen onContinue={onExit} />
      )}

    </div>
  );
}
