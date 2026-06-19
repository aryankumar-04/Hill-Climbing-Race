import React from 'react';

interface LockedCardOverlayProps {
  isLocked: boolean;
  isCenter: boolean;
  unlockCost: number;
  costType?: 'coins' | 'gems';
}

export const LockedCardOverlay = ({ isLocked, isCenter, unlockCost, costType = 'coins' }: LockedCardOverlayProps) => {
  if (!isLocked) return null;

  return (
    <>
      {/* Price Tag for Center */}
      {isCenter && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center z-40 pointer-events-none drop-shadow-md">
           <div className="flex items-center gap-2 px-4 py-1.5 bg-black/90 rounded-full">
             {costType === 'coins' ? (
               <div className="w-[16px] h-[16px] rounded-full bg-[#f3c300] border-2 border-black flex items-center justify-center shrink-0"></div>
             ) : (
               <div className="w-[14px] h-[14px] bg-[#00d0ff] border-2 border-black transform rotate-45 shrink-0"></div>
             )}
             <span className="text-white font-bold text-sm tracking-wider">
               {unlockCost.toLocaleString('en-US')}
             </span>
           </div>
        </div>
      )}

      {/* Lock Icon */}
      {isCenter ? (
        // Large lock for center overlapping bottom right correctly (just like the original game screenshot)
        <div className="absolute -bottom-10 -right-6 z-50 pointer-events-none drop-shadow-[0_12px_12px_rgba(0,0,0,0.8)] rotate-12 scale-125">
          <svg width="120" height="150" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
            {/* Shackle shadow */}
            <path d="M 30 50 L 30 30 C 30 5, 70 5, 70 30 L 70 50" fill="none" stroke="#1d2630" strokeWidth="26" strokeLinecap="round" className="opacity-90" />
            {/* Shackle base */}
            <path d="M 30 50 L 30 30 C 30 13, 70 13, 70 30 L 70 50" fill="none" stroke="#75b2dd" strokeWidth="14" strokeLinecap="round" />
            {/* Shackle highlight */}
            <path d="M 30 50 L 30 30 C 30 13, 70 13, 70 30 L 70 50" fill="none" stroke="#d5e8f6" strokeWidth="4" strokeDasharray="10 40" strokeLinecap="round" />

            {/* Body */}
            <rect x="10" y="45" width="80" height="70" rx="15" fill="#1d2630" stroke="#1d2630" strokeWidth="6" />
            <rect x="12" y="47" width="76" height="66" rx="12" fill="#5c9fc9" />
            
            {/* Inner body overlay for highlights */}
            <rect x="16" y="51" width="68" height="58" rx="8" fill="#75bced" />
            <path d="M 16 65 C 30 45, 70 45, 84 65 L 84 51 C 84 48, 81 47, 78 47 L 22 47 C 19 47, 16 48, 16 51 Z" fill="#ffffff" opacity="0.3" />

            {/* Keyhole Base */}
            <circle cx="50" cy="72" r="9" fill="#183648" />
            <path d="M 43 78 L 41 94 A 9 9 0 0 0 59 94 L 57 78 Z" fill="#183648" />
            
            {/* Keyhole Hole */}
            <circle cx="50" cy="72" r="7" fill="#0c161d" />
            <path d="M 45 78 L 43 92 A 7 7 0 0 0 57 92 L 55 78 Z" fill="#0c161d" />
          </svg>
        </div>
      ) : (
        // Small lock for side items
        <div className="absolute -bottom-4 right-0 z-50 pointer-events-none drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] rotate-12 scale-[0.6] opacity-90 transform origin-bottom-right">
          <svg width="120" height="150" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
            <path d="M 30 50 L 30 30 C 30 5, 70 5, 70 30 L 70 50" fill="none" stroke="#1d2630" strokeWidth="26" strokeLinecap="round" className="opacity-90" />
            <path d="M 30 50 L 30 30 C 30 13, 70 13, 70 30 L 70 50" fill="none" stroke="#75b2dd" strokeWidth="14" strokeLinecap="round" />
            <rect x="10" y="45" width="80" height="70" rx="15" fill="#1d2630" stroke="#1d2630" strokeWidth="6" />
            <rect x="12" y="47" width="76" height="66" rx="12" fill="#5c9fc9" />
            <rect x="16" y="51" width="68" height="58" rx="8" fill="#75bced" />
            <circle cx="50" cy="72" r="9" fill="#183648" />
            <path d="M 43 78 L 41 94 A 9 9 0 0 0 59 94 L 57 78 Z" fill="#183648" />
            <circle cx="50" cy="72" r="7" fill="#0c161d" />
            <path d="M 45 78 L 43 92 A 7 7 0 0 0 57 92 L 55 78 Z" fill="#0c161d" />
          </svg>
        </div>
      )}
      
      {/* Side cards price overlay */}
      {!isCenter && (
         <div className="absolute bottom-2 right-16 bg-[#1a1a1e] px-2 py-0.5 rounded-sm border-2 border-black z-20 flex items-center gap-1 drop-shadow-md">
           {costType === 'coins' ? (
             <div className="w-[12px] h-[12px] rounded-full bg-[#f3c300] border border-black flex items-center justify-center shrink-0 shadow-inner">
               <div className="w-[6px] h-[6px] rounded-full bg-yellow-200"></div>
             </div>
           ) : (
             <div className="w-[10px] h-[10px] bg-[#00d0ff] border border-black transform rotate-45 mx-0.5 shrink-0 shadow-inner"></div>
           )}
           <span className="text-white text-[11px] font-bold leading-none mt-0.5 tracking-wider">
             {unlockCost >= 1000 ? (unlockCost/1000) + ' 000' : unlockCost}
           </span>
         </div>
      )}
    </>
  );
};
