import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useGameStore } from '../game/store';
import { audioManager } from '../game/audio';

interface SettingsModalProps {
  onClose: () => void;
}

const ToggleRow = ({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) => (
  <div className="flex justify-between items-center bg-[#515c68] py-2 px-4 rounded shadow-sm border-t border-white/10 border-b border-black/30">
    <span className="text-[1.3rem] text-white font-bold tracking-wide leading-none">{label}</span>
    <div onClick={(e) => {
       audioManager.playUITap();
       if (onClick) onClick();
    }} className="w-16 h-[28px] bg-[#2d343c] rounded border border-black relative flex items-center p-1 cursor-pointer overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
      <div className={`w-[26px] h-[22px] border-2 border-black rounded shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] transition-all duration-150 absolute top-[2px] ${active ? 'bg-[#00c8e6] right-[2px]' : 'bg-[#434b54] left-[2px]'}`}></div>
    </div>
  </div>
);

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const {
    musicEnabled, setMusicEnabled,
    soundEnabled, setSoundEnabled,
    drawDirtEnabled, setDrawDirtEnabled,
    backgroundScrollEnabled, setBackgroundScrollEnabled,
    pedalsEnabled, setPedalsEnabled
  } = useGameStore();

  const [activeView, setActiveView] = useState<'main' | 'privacy' | 'about'>('main');

  const handleClose = () => {
    audioManager.playUITap();
    if (activeView !== 'main') {
      setActiveView('main');
    } else {
      onClose();
    }
  };

  return (
    <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4" style={{ backdropFilter: 'blur(3px)' }}>
      <style>{`
        .hcr-scrollbar::-webkit-scrollbar {
          width: 14px;
        }
        .hcr-scrollbar::-webkit-scrollbar-track {
          background: #4a545e;
          border-left: 2px solid #3e4854;
          border-right: 2px solid #3e4854;
        }
        .hcr-scrollbar::-webkit-scrollbar-thumb {
          background: #ffffff;
          border: 3px solid #4a545e;
          border-radius: 8px;
        }
      `}</style>
      
      <div className="relative w-full max-w-[500px] h-[400px] bg-[#5a646e] border-[3px] border-black rounded overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.2)] flex flex-col">
        {/* Floating Close Button */}
        <button 
          onClick={handleClose} 
          className="absolute top-2 right-2 w-10 h-10 bg-white rounded-lg border-[3px] border-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-20 shadow-[0_4px_0_#1e272e]"
        >
          <X className="w-8 h-8 text-black" strokeWidth={5} />
        </button>
        
        <h2 className="text-[2rem] text-center text-white text-stroke-sm mt-3 mb-2 tracking-widest font-black uppercase shadow-black drop-shadow-md">
          {activeView === 'main' ? 'SETTINGS' : activeView === 'privacy' ? 'PRIVACY POLICY' : 'ABOUT'}
        </h2>
        
        {activeView === 'main' && (
          <div className="flex-1 flex flex-col px-4 pb-4 overflow-hidden">
            <div className="flex-1 flex flex-col gap-[2px] overflow-y-auto pr-2 hcr-scrollbar mt-2">
              <div className="flex justify-between items-center py-2 px-4 rounded bg-[#515c68] border-t border-white/10 border-b border-black/30">
                <span className="text-[1.3rem] text-white font-bold tracking-wide">LANGUAGE</span>
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => audioManager.playUITap()}>
                  <span className="text-[1.2rem] text-white drop-shadow-md font-bold tracking-wide">English</span>
                </div>
              </div>
              
              <ToggleRow label="MUSIC" active={musicEnabled} onClick={() => setMusicEnabled(!musicEnabled)} />
              <ToggleRow label="SOUNDS" active={soundEnabled} onClick={() => setSoundEnabled(!soundEnabled)} />
              <ToggleRow label="DRAW DIRT" active={drawDirtEnabled} onClick={() => setDrawDirtEnabled(!drawDirtEnabled)} />
              <ToggleRow label="BACKGROUND SCROLL" active={backgroundScrollEnabled} onClick={() => setBackgroundScrollEnabled(!backgroundScrollEnabled)} />
              <ToggleRow label="PEDALS" active={pedalsEnabled} onClick={() => setPedalsEnabled(!pedalsEnabled)} />
            </div>

            <div className="mt-4 flex flex-col items-center gap-2 px-4">
              <button 
                onClick={() => { audioManager.playUITap(); setActiveView('privacy'); }} 
                className="w-[280px] h-[36px] bg-[#00a8c6] border-2 border-black flex items-center justify-center text-white text-lg font-bold tracking-widest shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_2px_0_#1e272e] hover:brightness-110 active:translate-y-[2px] active:shadow-none"
              >
                <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">PRIVACY POLICY</span>
              </button>
              <button 
                onClick={() => { audioManager.playUITap(); setActiveView('about'); }} 
                className="w-[280px] h-[36px] bg-[#00a8c6] border-2 border-black flex items-center justify-center text-white text-lg font-bold tracking-widest shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_2px_0_#1e272e] hover:brightness-110 active:translate-y-[2px] active:shadow-none"
              >
                <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">ABOUT</span>
              </button>
            </div>
            
            <div className="absolute bottom-2 right-4 text-white/50 text-sm font-bold">1.41.1</div>
          </div>
        )}

        {activeView === 'privacy' && (
          <div className="flex-1 flex flex-col pt-2">
            <div className="flex-1 overflow-y-auto px-6 pb-2 hcr-scrollbar text-white font-bold tracking-wide text-lg leading-snug">
              <p className="mb-4 text-[#00c8e6]">Privacy Policy Overview</p>
              <p className="mb-4 text-sm text-gray-200">
                Your privacy is important to us. This game automatically saves your gameplay progress, coins, gems, and unlocked items locally on your device to ensure you don't lose progress.
              </p>
              <p className="mb-4 text-sm text-gray-200">
                <strong>Settings Preferences:</strong> Audio settings, theme choices, and other visual toggles are also saved locally.
              </p>
              <p className="mb-4 text-sm text-gray-200">
                <strong>Data Collection:</strong> We do not collect unnecessary personal data. Any basic analytics or ad-related data (if applicable) is strictly processed to improve performance and provide a balanced experience. Your game experience remains mainly client-side.
              </p>
            </div>
            <div className="flex justify-center mt-2 pb-4">
              <button 
                onClick={() => { audioManager.playUITap(); setActiveView('main'); }} 
                className="w-1/2 h-[36px] bg-[#515c68] border-2 border-black flex items-center justify-center text-white text-lg font-bold tracking-widest shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_2px_0_#1e272e] hover:brightness-110 active:translate-y-[2px] active:shadow-none"
              >
                BACK
              </button>
            </div>
          </div>
        )}

        {activeView === 'about' && (
          <div className="flex-1 flex flex-col pt-2">
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-white font-bold tracking-wide text-center">
              <h3 className="text-3xl text-[#00c8e6] text-stroke-sm mb-2">HILL CLIMB PRO</h3>
              <p className="text-lg text-gray-300 mb-6">Version 1.41.1</p>
              <p className="text-sm text-gray-200 leading-relaxed max-w-[80%] mx-auto mb-6">
                A physics-based hill climbing adventure. Face the challenges of unique environments with many different vehicles. 
                Earn bonuses from daring tricks to upgrade your car and reach even higher distances!
              </p>
              <p className="text-xs text-gray-400">Developed with precision & passion.</p>
            </div>
            <div className="flex justify-center mt-2 pb-4">
              <button 
                onClick={() => { audioManager.playUITap(); setActiveView('main'); }} 
                className="w-1/2 h-[36px] bg-[#515c68] border-2 border-black flex items-center justify-center text-white text-lg font-bold tracking-widest shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_2px_0_#1e272e] hover:brightness-110 active:translate-y-[2px] active:shadow-none"
              >
                BACK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
