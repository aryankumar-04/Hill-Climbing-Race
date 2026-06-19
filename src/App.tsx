import { useState, useEffect } from 'react';
import LoadingScreen from './components/LoadingScreen';
import VehicleScreen from './components/VehicleScreen';
import StageScreen from './components/StageScreen';
import TuneScreen from './components/TuneScreen';
import ShopScreen from './components/ShopScreen';
import GameScreen from './components/GameScreen';
import MenuHUD from './components/MenuHUD';
import BottomNavigation from './components/BottomNavigation';
import SettingsModal from './components/SettingsModal';
import GameThemeBackground from './components/GameThemeBackground';
import { useGameStore } from './game/store';
import { audioManager } from './game/audio';
import { ScreenType } from './types';

export default function App() {
  const [screen, setScreen] = useState<ScreenType>('loading');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showApp, setShowApp] = useState(false);
  const loadSaves = useGameStore(s => s.loadSaves);
  const musicEnabled = useGameStore(s => s.musicEnabled);
  const soundEnabled = useGameStore(s => s.soundEnabled);

  useEffect(() => {
    loadSaves();
  }, [loadSaves]);

  useEffect(() => {
    audioManager.setMusicEnabled(musicEnabled);
    audioManager.setSoundEnabled(soundEnabled);
  }, [musicEnabled, soundEnabled]);
  
  // Try playing theme music whenever they do an interaction or on load
  const handleInteraction = () => {
    audioManager.resumeContextIfNeeded();
    if (musicEnabled) {
      audioManager.playThemeMusic();
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleInteraction, { once: true });
    return () => document.removeEventListener('click', handleInteraction);
  }, [musicEnabled]);

  useEffect(() => {
    if (screen !== 'loading' && !showApp) {
      // Trigger fade in explicitly after the component is rendered
      const t = requestAnimationFrame(() => {
        setShowApp(true);
      });
      return () => cancelAnimationFrame(t);
    }
  }, [screen, showApp]);

  if (screen === 'loading') return <LoadingScreen onComplete={() => setScreen('vehicle')} />;
  if (screen === 'game') return <GameScreen onExit={() => setScreen('vehicle')} />;
  if (screen === 'shop') return <ShopScreen onBack={() => setScreen('vehicle')} />;

  return (
    <div className={`w-screen h-screen bg-transparent relative flex flex-col font-sans select-none transition-opacity duration-500 ease-in-out ${showApp ? 'opacity-100' : 'opacity-0'}`}>
        {/* Universal Menu Background Pattern */}
        <GameThemeBackground 
          brightness={isSettingsOpen ? 0.5 : 1.2}
          blurAmount={isSettingsOpen ? 8 : 0}
          particleDensity="high"
          particleColor="#fbbf24"
          spotlightIntensity={1.5}
          overlayColor={isSettingsOpen ? 'rgba(0,0,0,0.5)' : 'transparent'}
        />

      <div className="relative z-10 flex flex-col h-full mx-auto w-full max-w-7xl overflow-hidden">
        <MenuHUD onOpenSettings={() => setIsSettingsOpen(true)} onShopClick={() => setScreen('shop')} />

        <main className="flex-1 overflow-hidden relative">
          {screen === 'vehicle' && <VehicleScreen />}
          {screen === 'stage' && <StageScreen />}
          {screen === 'tune' && <TuneScreen />}
        </main>

        <BottomNavigation currentScreen={screen} onNavigate={setScreen} />
      </div>

      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
    </div>
  );
}
