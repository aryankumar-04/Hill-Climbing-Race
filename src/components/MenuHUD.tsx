import { Settings, Trophy } from 'lucide-react';
import { CoinIcon, GemIcon } from './SharedUI';
import { useGameStore } from '../game/store';
import { audioManager } from '../game/audio';

interface MenuHUDProps {
  onOpenSettings: () => void;
  onShopClick?: () => void;
}

export default function MenuHUD({ onOpenSettings, onShopClick }: MenuHUDProps) {
  const { coins, gems } = useGameStore();

  const handleShop = () => {
    audioManager.playUITap();
    if (onShopClick) onShopClick();
  };

  const handleSettings = () => {
    audioManager.playUITap();
    onOpenSettings();
  };

  return (
    <header className="flex justify-between items-start p-4 w-full z-20 pointer-events-auto">
      <div className="flex flex-col gap-2">
        <div 
          className="flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform"
          onClick={handleShop}
        >
          <CoinIcon />
          <span className="text-[32px] leading-none text-white font-black tracking-wider drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]" style={{ WebkitTextStroke: '2.5px black', textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 3px 0 #000' }}>
            {coins.toLocaleString('en-US').replace(/,/g, ' ')}
          </span>
        </div>
        <div 
          className="flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform"
          onClick={handleShop}
        >
          <GemIcon />
          <span className="text-[32px] leading-none text-white font-black tracking-wider drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]" style={{ WebkitTextStroke: '2.5px black', textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 3px 0 #000' }}>
            {gems.toLocaleString('en-US').replace(/,/g, ' ')}
          </span>
        </div>
      </div>

      <div className="flex gap-4">

        <button onClick={() => audioManager.playUITap()} className="w-14 h-14 rounded-full bg-yellow-500 border-4 border-black flex items-center justify-center shadow-lg relative overflow-hidden btn-beveled hover:bg-yellow-400 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-black/20"></div>
          <Trophy className="w-6 h-6 text-black z-10" fill="currentColor" />
        </button>

        <button 
          onClick={handleSettings}
          className="w-14 h-14 rounded-full bg-blue-300 border-4 border-black flex items-center justify-center shadow-lg relative overflow-hidden btn-beveled hover:bg-blue-200 transition-colors"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-black/20"></div>
          <Settings className="w-7 h-7 text-black z-10" fill="currentColor" />
        </button>
      </div>
    </header>
  );
}
