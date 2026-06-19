import GameThemeBackground from './GameThemeBackground';
import { audioManager } from '../game/audio';

const CoinStack = ({ count, className, style }: any) => (
  <div className={`relative ${className}`} style={style}>
    {Array.from({ length: count }).map((_, i) => (
      <svg 
        key={i}
        viewBox="0 0 40 20" 
        className="absolute w-full"
        style={{ bottom: `${i * 35}%`, zIndex: i, overflow: 'visible' }}
      >
        <path d="M 2 10 L 2 16 C 2 22 38 22 38 16 L 38 10 Z" fill="#D97706" stroke="#111" strokeWidth="2.5" />
        <ellipse cx="20" cy="10" rx="18" ry="7" fill="#FACC15" stroke="#111" strokeWidth="2.5" />
        <ellipse cx="20" cy="10" rx="14" ry="4" fill="none" stroke="#FEF08A" strokeWidth="1.5" />
      </svg>
    ))}
  </div>
);

const CashBundle = ({ className, style }: any) => (
  <svg viewBox="0 0 120 70" className={`filter drop-shadow-xl ${className}`} style={{overflow: 'visible', ...style}}>
    {/* Bottom/Side thickness */}
    <path d="M 10 35 L 55 55 L 115 35 L 115 45 L 55 65 L 10 45 Z" fill="#14532D" stroke="#111" strokeWidth="3" strokeLinejoin="round" />
    {/* Paper stack lines */}
    <path d="M 10 40 L 55 60 L 115 40" fill="none" stroke="#111" strokeWidth="1.5" />
    <path d="M 10 42 L 55 62 L 115 42" fill="none" stroke="#111" strokeWidth="1.5" />
    
    {/* Top flat block */}
    <path d="M 10 35 L 55 55 L 115 35 L 70 15 Z" fill="#4ADE80" stroke="#111" strokeWidth="3" strokeLinejoin="round" />
    {/* Highlight */}
    <path d="M 18 33 L 55 50 L 105 33" fill="none" stroke="#86EFAC" strokeWidth="4" />

    {/* Strap down left */}
    <path d="M 30 44 L 45 50 L 45 60 L 30 53 Z" fill="#EAB308" stroke="#111" strokeWidth="2.5" strokeLinejoin="round" />
    {/* Strap top */}
    <path d="M 30 44 L 45 50 L 75 40 L 60 34 Z" fill="#FDE047" stroke="#111" strokeWidth="2.5" strokeLinejoin="round" />
  </svg>
);

const CashStack = ({ count, className, style }: any) => (
  <div className={`relative ${className}`} style={style}>
    {Array.from({ length: count }).map((_, i) => (
      <CashBundle 
        key={i}
        className="absolute w-full"
        style={{ bottom: `${i * 30}%`, zIndex: i }}
      />
    ))}
  </div>
);

const MoneyBag = ({ className, style }: any) => (
  <svg viewBox="0 0 100 120" className={`filter drop-shadow-xl ${className}`} style={{overflow: 'visible', ...style}}>
    {/* Shadow base / back */}
    <path d="M 15 110 C -20 110 0 50 20 40 Q 30 25 45 20 L 55 20 Q 70 25 80 40 C 100 50 120 110 85 110 Z" fill="#6B3A1C" stroke="#111" strokeWidth="4" />
    
    {/* Core body */}
    <path d="M 20 110 C -10 110 5 50 22 40 Q 32 25 45 20 L 55 20 Q 68 25 78 40 C 95 50 110 110 80 110 Z" fill="#925C30" />
    
    {/* Highlight contours */}
    <path d="M 30 100 C 10 100 15 60 30 45" fill="none" stroke="#C4844D" strokeWidth="6" strokeLinecap="round" />
    <path d="M 35 35 Q 45 25 50 22" fill="none" stroke="#C4844D" strokeWidth="4" strokeLinecap="round" />
    
    {/* Top scrunch */}
    <path d="M 45 20 L 30 0 Q 50 -10 70 0 L 55 20 Z" fill="#925C30" stroke="#111" strokeWidth="4" strokeLinejoin="round" />
    <path d="M 40 20 Q 50 25 60 20 Q 50 15 40 20 Z" fill="#111" />
  </svg>
);

const OpenCoinSack = ({ className, style }: any) => (
  <svg viewBox="0 0 120 100" className={`filter drop-shadow-xl ${className}`} style={{overflow: 'visible', ...style}}>
    {/* Sack base (behind) */}
    <path d="M 10 50 C 5 95 115 95 110 50 Z" fill="#925C30" stroke="#111" strokeWidth="4" />
    <path d="M 10 50 C 10 20 110 20 110 50 Z" fill="#3D200E" stroke="#111" strokeWidth="4" />
    
    {/* Pile of coins */}
    <g transform="translate(0, -5)">
      {/* Back layer */}
      <ellipse cx="30" cy="45" rx="18" ry="7" fill="#FACC15" stroke="#111" strokeWidth="2.5" />
      <ellipse cx="60" cy="40" rx="18" ry="7" fill="#FACC15" stroke="#111" strokeWidth="2.5" />
      <ellipse cx="90" cy="45" rx="18" ry="7" fill="#FACC15" stroke="#111" strokeWidth="2.5" />
      
      {/* Mid layer */}
      <ellipse cx="45" cy="48" rx="18" ry="7" fill="#FEF08A" stroke="#111" strokeWidth="2.5" />
      <ellipse cx="75" cy="48" rx="18" ry="7" fill="#FDE047" stroke="#111" strokeWidth="2.5" />
      <ellipse cx="25" cy="55" rx="18" ry="7" fill="#FACC15" stroke="#111" strokeWidth="2.5" />
      <ellipse cx="95" cy="55" rx="18" ry="7" fill="#FACC15" stroke="#111" strokeWidth="2.5" />
      
      {/* Front layer */}
      <ellipse cx="60" cy="55" rx="20" ry="8" fill="#FEF08A" stroke="#111" strokeWidth="2.5" />
      <ellipse cx="40" cy="62" rx="18" ry="7" fill="#FDE047" stroke="#111" strokeWidth="2.5" />
      <ellipse cx="80" cy="62" rx="18" ry="7" fill="#FACC15" stroke="#111" strokeWidth="2.5" />
      <ellipse cx="60" cy="68" rx="20" ry="8" fill="#FDE047" stroke="#111" strokeWidth="2.5" />
    </g>

    {/* Foldover rim */}
    <path d="M 0 50 C 0 85 120 85 120 50 C 90 20 30 20 0 50 Z" fill="#BA7A44" stroke="#111" strokeWidth="4" />
    <path d="M 12 55 C 30 75 90 75 108 55" fill="none" stroke="#D19560" strokeWidth="4" strokeLinecap="round" />
    
    {/* Body front */}
    <path d="M 10 58 C 0 105 120 105 110 58 C 80 65 40 65 10 58 Z" fill="#925C30" stroke="#111" strokeWidth="4" />
    {/* Shadow / Highlight on body front */}
    <path d="M 20 70 C 20 90 100 90 100 70" fill="none" stroke="#C4844D" strokeWidth="6" strokeLinecap="round" />
  </svg>
);

interface ShopCardProps {
  amount: string;
  price: string;
  type: 'starter' | 'medium' | 'premium';
}

const ShopCard = ({ amount, price, type }: ShopCardProps) => (
  <div onClick={() => audioManager.playUpgrade()} className="flex flex-col items-center w-[280px] group cursor-pointer hover:-translate-y-1 transition-transform duration-200">
    {/* Main Card Container */}
    <div className="w-full h-[220px] bg-[#4a545e] rounded border-4 border-black relative overflow-hidden shadow-[inset_0_0_0_2px_rgba(255,255,255,0.3)]">
      
      {/* Background Gradient for Depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.4)] to-transparent pointer-events-none"></div>

      {/* Artwork */}
      <div className="absolute inset-0 flex flex-col justify-end pb-[40px] items-center pointer-events-none">
        {type === 'starter' && (
           <div className="relative w-full h-[140px] flex items-end justify-center">
             <MoneyBag className="absolute right-[5%] top-[10%] w-[55%] z-10 scale-105" />
             <OpenCoinSack className="absolute left-[0%] bottom-[10%] w-[65%] z-20" />
             <CashBundle className="absolute right-[15%] bottom-[5%] w-[50%] z-30" />
             <CoinStack count={3} className="absolute right-[-5%] bottom-[-5%] w-[25%] h-[30px] z-40" />
           </div>
        )}
        {type === 'medium' && (
           <div className="relative w-full h-[150px] flex items-end justify-center">
             <MoneyBag className="absolute left-[5%] top-[15%] w-[45%] z-10 -scale-x-100" />
             <MoneyBag className="absolute right-[5%] top-[0%] w-[55%] z-0" />
             <OpenCoinSack className="absolute left-[-5%] bottom-[5%] w-[70%] z-20" />
             <CashBundle className="absolute right-[-5%] bottom-[5%] w-[55%] z-30 transform -rotate-6" />
             <CoinStack count={5} className="absolute left-[20%] bottom-[-5%] w-[20%] h-[30px] z-40" />
             <CoinStack count={6} className="absolute right-[10%] bottom-[-10%] w-[20%] h-[30px] z-40" />
           </div>
        )}
        {type === 'premium' && (
           <div className="relative w-full h-[180px] flex items-end justify-center">
             <MoneyBag className="absolute left-[0%] top-[25%] w-[40%] z-10 rotate-12" />
             <MoneyBag className="absolute right-[0%] top-[5%] w-[45%] z-10 -scale-x-100" />
             <MoneyBag className="absolute left-[25%] top-[0%] w-[50%] z-5" />

             <OpenCoinSack className="absolute left-[15%] bottom-[10%] w-[60%] z-20" />
             
             <CashStack count={4} className="absolute right-[5%] bottom-[10%] w-[35%] h-[30px] z-30 -rotate-6" />
             <CashStack count={3} className="absolute left-[0%] bottom-[0%] w-[35%] h-[30px] z-30 rotate-6" />
             
             <CoinStack count={8} className="absolute right-[15%] bottom-[-15%] w-[20%] h-[30px] z-40 scale-125" />
             <CoinStack count={6} className="absolute left-[25%] bottom-[-10%] w-[20%] h-[30px] z-40" />
           </div>
        )}
      </div>

      {/* Coin Amount at the bottom of the card */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center z-40 pointer-events-none">
        <span 
          className="text-white text-[28px] font-black tracking-wider drop-shadow-md"
          style={{
            fontFamily: "'Arial Black', Impact, sans-serif",
            WebkitTextStroke: "1px black"
          }}
        >
          {amount}
        </span>
      </div>
    </div>
    
    {/* Price Button Component attached to bottom */}
    <button className="w-[102%] py-3 mt-[-4px] z-20 bg-gradient-to-b from-[#8F7EAB] to-[#6A5A82] border-[3px] border-[#222] rounded-md shadow-[0_4px_0_#1a1a1a] flex justify-center items-center hover:brightness-110 active:translate-y-1 active:shadow-none">
       <span className="text-white text-xl font-bold tracking-wider drop-shadow-md mr-1">
         ₹ {price}
       </span>
    </button>
  </div>
);

export default function ShopScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="w-full h-full absolute inset-0 z-50 flex flex-col font-sans select-none overflow-hidden pb-10">
      <GameThemeBackground 
        brightness={1.2} 
        particleDensity="high" 
        particleColor="#fbbf24" // gold particles
        spotlightIntensity={1.5}
      />
      
      <div className="w-full bg-black/80 py-3 mt-16 flex justify-center shadow-lg border-b-4 border-black relative z-10">
        <h1 className="text-5xl text-stroke font-black tracking-widest uppercase">COINS</h1>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
        <div className="flex flex-wrap justify-center gap-8 md:gap-12 w-full max-w-5xl">
          <ShopCard amount="5 000 000" price="1,099.00" type="starter" />
          <ShopCard amount="16 000 000" price="1,624.00" type="medium" />
          <ShopCard amount="80 000 000" price="2,724.00" type="premium" />
        </div>
      </main>

      <footer className="w-full flex items-center relative z-10 min-h-[100px]">
        <div className="px-6 absolute z-20 top-1/2 -translate-y-1/2">
          <button 
            onClick={() => {
              audioManager.playUITap();
              onBack();
            }}
            className="bg-gradient-to-b from-[#7f8fa6] to-[#5f6c82] border-[3px] border-[#1e272e] shadow-[inset_0_2px_0_rgba(255,255,255,0.2),_0_4px_0_#1e272e] flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-3xl tracking-widest text-stroke hover:brightness-110 active:translate-y-1 active:shadow-none"
          >
            <div className="w-0 h-0 border-t-8 border-t-transparent border-r-[12px] border-r-cyan-400 border-b-8 border-b-transparent mr-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"></div>
            BACK
          </button>
        </div>

        <div className="w-full bg-black/60 py-4 flex justify-end items-center pr-8 relative z-10 pl-[200px]">
          <div className="flex-1 text-center">
            <span className="text-2xl text-stroke font-bold text-white tracking-widest">Coins & Gems remove banner ads!</span>
          </div>
          
          <button onClick={() => audioManager.playFail()} className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-black shadow-[0_0_0_2px_rgba(255,255,255,0.5)] cursor-pointer hover:scale-105 transition-transform relative group ml-4 flex-shrink-0">
            <div className="absolute w-[120%] h-1 bg-black rotate-45 z-10 group-hover:bg-red-500"></div>
            <span className="text-black text-3xl font-black z-0">AD</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
