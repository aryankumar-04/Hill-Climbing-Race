import { useState, useEffect, useRef } from 'react';
import GameThemeBackground from './GameThemeBackground';

// Using a list of essential resources derived from game logic
const RESOURCES_TO_LOAD = [
  { id: 'data_store', type: 'data', weight: 1, message: 'Initializing systems...' },
  { id: 'data_save', type: 'data', weight: 2, message: 'Loading save files...' },
  { id: 'data_settings', type: 'data', weight: 1, message: 'Loading player data...' },
  { id: 'assets_fonts', type: 'font', weight: 5, message: 'Loading UI graphics...' },
  { id: 'assets_vehicles', type: 'image', weight: 10, message: 'Loading vehicles...' },
  { id: 'assets_backgrounds', type: 'image', weight: 8, message: 'Loading backgrounds...' },
  { id: 'assets_audio', type: 'audio', weight: 15, message: 'Loading audio...' },
  { id: 'assets_music', type: 'audio', weight: 15, message: 'Loading audio...' },
  { id: 'page_garage', type: 'component', weight: 5, message: 'Preparing garage...' },
  { id: 'page_store', type: 'component', weight: 5, message: 'Preparing store...' },
  { id: 'page_stage', type: 'component', weight: 5, message: 'Preparing stages...' },
  { id: 'page_achievements', type: 'component', weight: 3, message: 'Preparing stages...' },
  { id: 'systems_ready', type: 'system', weight: 1, message: 'Finalizing...' },
];

export default function LoadingScreen({ onComplete }: { onComplete?: () => void }) {
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Loading assets...');
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  const totalWeight = RESOURCES_TO_LOAD.reduce((sum, res) => sum + res.weight, 0);
  
  useEffect(() => {
    let unmounted = false;
    let currentWeightLoaded = 0;
    let completedAssets = 0;
    const startTime = Date.now();
    const MIN_LOADING_TIME = 1500;
    const MAX_TIMEOUT = 10000;
    
    // Safety timeout to prevent infinite loading loops
    const safetyTimeout = setTimeout(() => {
      console.warn("Loading screen timed out. Forcing completion.");
      finishLoading();
    }, MAX_TIMEOUT);

    const finishLoading = () => {
      if (unmounted) return;
      clearTimeout(safetyTimeout);
      
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);
      
      setProgress(100);
      setLoadingMessage('Ready!');
      setIsReady(true);
      
      setTimeout(() => {
        if (unmounted) return;
        setIsFadingOut(true);
        setTimeout(() => {
          if (unmounted) return;
          if (onComplete) onComplete();
        }, 400); // 400ms fade out
      }, Math.max(500, remainingTime)); // Show "Ready!" for at least 500ms
    };

    const loadNext = async (index: number) => {
      if (unmounted) return;
      
      if (index >= RESOURCES_TO_LOAD.length) {
        finishLoading();
        return;
      }

      const resource = RESOURCES_TO_LOAD[index];
      setLoadingMessage(resource.message);
      
      try {
        // Simulate real loading constraints or actually evaluate true resources
        // For fonts, we can check if document.fonts is ready (if supported)
        if (resource.type === 'font') {
          await document.fonts.ready;
        } 
        // For other types, as we do not have external URLs to fetch in this prototype,
        // we simulate variable processing times per weight logic.
        else {
          const delay = Math.random() * 50 + resource.weight * 10;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (err) {
        console.warn(`Failed to load resource: ${resource.id}`, err);
        // Skip broken non-critical resources
      }
      
      if (unmounted) return;

      currentWeightLoaded += resource.weight;
      completedAssets++;
      
      // Calculate realistic percentage based on weight
      const percentage = Math.min(97, Math.round((completedAssets / RESOURCES_TO_LOAD.length) * 100));
      
      // Smooth out the progress visibly
      setProgress(prev => {
        // Prevent backwards progression
        return Math.max(prev, percentage);
      });
      
      loadNext(index + 1);
    };

    // Begin the load loop
    loadNext(0);

    return () => {
      unmounted = true;
      clearTimeout(safetyTimeout);
    };
  }, [onComplete, totalWeight]);

  return (
    <div 
      className={`w-screen h-screen bg-[#1a1c21] flex flex-col items-center justify-center relative overflow-hidden font-sans select-none transition-opacity duration-500 ease-in-out ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}
    >
      <GameThemeBackground brightness={0.8} particleDensity="low" overlayColor="rgba(0,0,0,0.3)" />
      
      <main className="z-10 flex flex-col items-center w-full max-w-4xl px-4 mt-[-10vh]">
        <div className="flex flex-col items-center transform -rotate-2 mb-8">
          <div className="text-5xl sm:text-6xl md:text-7xl text-white text-stroke leading-none tracking-tight text-center font-black">
            <div className="flex justify-center mb-2">
               <svg className="transform -rotate-12" fill="none" height="40" viewBox="0 0 40 30" width="50" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 28V2M2 2C6 2 10 4 14 4C18 4 22 2 26 2C30 2 34 4 38 4V16C34 16 30 14 26 14C22 14 18 16 14 16C10 16 6 14 2 14V2Z" fill="white" stroke="white" strokeWidth="2"></path>
                <path d="M8 2V8H14V2H8ZM14 8V14H20V8H14ZM20 2V8H26V2H20ZM26 8V14H32V8H26Z" fill="black"></path>
              </svg>
            </div>
            HILL CLIMBER<br />
            <span className="text-6xl sm:text-7xl md:text-8xl">RACING</span>
          </div>
        </div>

        <h1 className={`text-2xl sm:text-3xl ${isReady ? 'text-green-400' : 'text-white'} text-stroke tracking-widest mt-8 mb-6 font-bold uppercase transition-colors duration-300`}>
          {loadingMessage}
        </h1>
        
        <div className="w-[80%] max-w-[600px] h-8 sm:h-10 bg-black/50 border-4 border-black box-border shadow-[0_4px_0_rgba(0,0,0,0.5)] relative overflow-hidden">
          <div 
            className="absolute top-0 left-0 bottom-0 bg-white transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </main>

      <footer className="absolute bottom-8 left-0 right-0 flex justify-center items-center z-10 w-full">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-[#8dc63f] flex items-center justify-center relative">
            <div className="w-8 h-8 rounded-full border-4 border-white border-t-transparent border-r-transparent transform -rotate-45"></div>
          </div>
          <span className="text-[#8dc63f] font-black text-3xl tracking-wider uppercase mt-1">Fingersoft</span>
        </div>
      </footer>
    </div>
  );
}
