import { useGameStore, TuneData } from '../game/store';
import { audioManager } from '../game/audio';

const UpgradeCard = ({ title, level, maxLevel, cost, canAfford, onClick, children }: any) => {
  return (
    <div 
      className={`w-[220px] sm:w-[240px] md:w-[260px] h-[280px] sm:h-[320px] md:h-[360px] flex flex-col group rounded-lg overflow-hidden card-beveled bg-[#586674] relative transition-transform ${level >= maxLevel ? 'opacity-80' : 'cursor-pointer hover:scale-105'}`}
      onClick={() => {
        if (level >= maxLevel) return;
        if (!canAfford) {
          audioManager.playFail();
          return;
        }
        onClick();
      }}
    >
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-r-[12px] border-b-[16px] border-transparent border-b-black"></div>
      
      <div className={`h-14 md:h-16 w-full flex items-center justify-center gap-2 border-b-4 border-black ${level >= maxLevel ? 'bg-gray-600 text-gray-400' : canAfford ? 'bg-[#4a4a4a] text-white' : 'bg-red-900 text-red-300'}`}>
        {level < maxLevel && (
          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-yellow-400 border-2 border-black flex items-center justify-center">
            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full border border-yellow-600"></div>
          </div>
        )}
        <span className="text-3xl md:text-4xl text-stroke-sm font-black mt-1 tracking-widest">
          {level >= maxLevel ? 'MAX' : cost.toLocaleString()}
        </span>
      </div>

      <div className="flex-1 relative p-3 flex items-center justify-center overflow-hidden">
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-black/20 transform rotate-45 pointer-events-none"></div>
        
        <div className="absolute left-2 top-3 bottom-10 w-5 md:w-6 bg-black border-2 border-gray-700 flex flex-col justify-end p-0.5 rounded shadow-inner z-10">
          <div className="flex-1 flex flex-col-reverse justify-start">
             {Array(maxLevel).fill(0).map((_,i) => (
                <div key={i} className={`flex-1 w-full border-b border-gray-700 ${i < level ? 'bg-[#55b6e6]' : 'bg-transparent'}`}></div>
             ))}
          </div>
        </div>

        <div className="ml-8 flex items-center justify-center w-full h-full relative z-20 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] pb-8 scale-110 md:scale-125">
          {children}
        </div>
        
        <div className="absolute bottom-4 left-10 md:left-12 text-sm md:text-base font-black uppercase text-white tracking-widest pointer-events-none drop-shadow-[0_2px_2px_rgba(0,0,0,1)] opacity-70">
          {title}
        </div>

        <div className="absolute bottom-3 right-4 text-2xl md:text-3xl text-stroke font-black z-10 pointer-events-none text-white tracking-wider">
          {level}/{maxLevel}
        </div>
      </div>
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[16px] border-transparent border-t-black"></div>
    </div>
  );
};

export default function TuneScreen() {
  const { previewVehicleId, vehicleTunes, upgradeTune, coins } = useGameStore();
  const tunes = vehicleTunes?.[previewVehicleId] || { engine: 1, suspension: 1, tires: 1, drivetrain: 1 };

  const handleUpgrade = (part: keyof TuneData, maxLevel: number) => {
    const success = upgradeTune(previewVehicleId, part, maxLevel);
    if (success) {
      audioManager.playUpgrade();
    }
  };

  const getCost = (level: number) => level * 4000;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center absolute inset-0 z-10 pt-10 pb-[8vh] md:pb-[12vh]">
      <div className="flex items-center justify-center gap-4 sm:gap-6 px-4 sm:px-10 flex-wrap">
        
        <UpgradeCard 
          title="ENGINE" 
          level={tunes.engine} 
          maxLevel={13} 
          cost={getCost(tunes.engine)}
          canAfford={coins >= getCost(tunes.engine)}
          onClick={() => handleUpgrade('engine', 13)}
        >
          <div className="relative w-24 h-24 flex items-center justify-center scale-110">
            {/* Left Piston */}
            <div className="absolute left-[10px] top-[12px] transform -rotate-45 z-0 flex flex-col items-center drop-shadow-md">
              {/* Head */}
              <div className="w-[38px] h-[28px] bg-[#7a93b2] border-[3px] border-black rounded-lg">
                 <div className="w-full h-[8px] border-b-[3px] border-black bg-[#9bb4d1] rounded-t-md"></div>
                 <div className="w-full h-[8px] border-b-[3px] border-black bg-[#9bb4d1]"></div>
              </div>
              {/* Rod */}
              <div className="w-[16px] h-[24px] bg-[#7a93b2] border-x-[3px] border-black border-t-0 -mt-[3px]"></div>
              {/* Ring */}
              <div className="w-[30px] h-[30px] rounded-full bg-[#7a93b2] border-[3px] border-black -mt-[6px] flex items-center justify-center">
                 <div className="w-[10px] h-[10px] rounded-full bg-gray-800 border-[2px] border-black"></div>
              </div>
            </div>

            {/* Right Piston */}
             <div className="absolute right-[10px] top-[12px] transform rotate-45 z-10 flex flex-col items-center drop-shadow-md">
              {/* Head */}
              <div className="w-[38px] h-[28px] bg-[#89a1c2] border-[3px] border-black rounded-lg">
                 <div className="w-full h-[8px] border-b-[3px] border-black bg-[#adbed9] rounded-t-md"></div>
                 <div className="w-full h-[8px] border-b-[3px] border-black bg-[#adbed9]"></div>
              </div>
              {/* Rod */}
              <div className="w-[16px] h-[24px] bg-[#89a1c2] border-x-[3px] border-black border-t-0 -mt-[3px]"></div>
              {/* Ring */}
              <div className="w-[30px] h-[30px] rounded-full bg-[#89a1c2] border-[3px] border-black -mt-[6px] flex items-center justify-center">
                 <div className="w-[10px] h-[10px] rounded-full bg-gray-800 border-[2px] border-black"></div>
              </div>
            </div>
          </div>
        </UpgradeCard>

        <UpgradeCard 
          title="SUSPENSION" 
          level={tunes.suspension} 
          maxLevel={14}
          cost={getCost(tunes.suspension)}
          canAfford={coins >= getCost(tunes.suspension)}
          onClick={() => handleUpgrade('suspension', 14)}
        >
          <div className="relative w-24 h-24 transform -rotate-45 flex items-center justify-center scale-[1.2]">
             <div className="w-3 h-24 bg-gray-400 border-2 border-black rounded-full absolute"></div>
             <div className="w-10 h-20 flex flex-col justify-evenly absolute">
               {[1,2,3,4,5].map(i => <div key={i} className="w-full h-3 bg-red-500 border-2 border-black rounded-full transform rotate-12"></div>)}
             </div>
             <div className="w-6 h-6 rounded-full border-4 border-black absolute -top-2 bg-gray-800"></div>
             <div className="w-6 h-6 rounded-full border-4 border-black absolute -bottom-2 bg-gray-800"></div>
          </div>
        </UpgradeCard>

        <UpgradeCard 
          title="TIRES" 
          level={tunes.tires} 
          maxLevel={16}
          cost={getCost(tunes.tires)}
          canAfford={coins >= getCost(tunes.tires)}
          onClick={() => handleUpgrade('tires', 16)}
        >
          <div className="relative w-24 h-24 flex items-center justify-center scale-[1.2]">
            <div className="w-20 h-20 rounded-full border-[10px] border-[#333] ring-4 ring-black bg-[#111] absolute ml-6 mt-4 shadow-xl"></div>
            <div className="w-20 h-20 rounded-full border-[10px] border-[#444] ring-4 ring-black bg-[#1a1a1a] flex items-center justify-center relative shadow-lg">
              <div className="w-8 h-8 rounded-full border-4 border-black bg-gray-800"></div>
            </div>
          </div>
        </UpgradeCard>

        <UpgradeCard 
          title="4WD" 
          level={tunes.drivetrain} 
          maxLevel={10}
          cost={getCost(tunes.drivetrain)}
          canAfford={coins >= getCost(tunes.drivetrain)}
          onClick={() => handleUpgrade('drivetrain', 10)}
        >
          <div className="relative w-24 h-24 transform -rotate-45 flex items-center justify-center scale-[1.2]">
            <div className="absolute w-3 h-20 bg-[#7a93b2] border-[3px] border-black"></div>
            <div className="absolute w-16 h-3 bg-[#7a93b2] border-[3px] border-black top-4"></div>
            <div className="absolute w-16 h-3 bg-[#7a93b2] border-[3px] border-black bottom-4"></div>
            
            <div className="absolute -left-2 top-1 w-5 h-10 bg-[#333] border-[3px] border-black rounded-sm"></div>
            <div className="absolute -right-2 top-1 w-5 h-10 bg-[#333] border-[3px] border-black rounded-sm"></div>
            <div className="absolute -left-2 bottom-1 w-5 h-10 bg-[#333] border-[3px] border-black rounded-sm"></div>
            <div className="absolute -right-2 bottom-1 w-5 h-10 bg-[#333] border-[3px] border-black rounded-sm"></div>
            
            <div className="absolute w-6 h-6 rounded-full border-[3px] border-red-600 bg-transparent flex items-center justify-center shadow-lg">
               <div className="w-2 h-2 rounded-full bg-red-600"></div>
            </div>
          </div>
        </UpgradeCard>

      </div>
    </div>
  );
}
