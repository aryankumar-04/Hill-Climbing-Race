export const CoinIcon = () => (
  <div className="w-[30px] h-[30px] rounded-full bg-[#f3c300] border-[2px] border-black flex items-center justify-center shadow-md relative overflow-hidden shrink-0">
    <div className="absolute inset-[2px] rounded-full border-2 border-[#fff3bd] bg-gradient-to-br from-[#fcde46] to-[#d69f00]"></div>
    <div className="absolute top-[4px] left-[5px] w-[6px] h-[10px] bg-white/50 rounded-full rotate-45 blur-[1px]"></div>
    <div className="w-[14px] h-[14px] bg-[#df9c00] rounded-full border-[1.5px] border-[#ffe885] z-10 opacity-90 flex items-center justify-center">
      <div className="w-[8px] h-[8px] bg-yellow-300 rounded-sm rotate-45 opacity-60"></div>
    </div>
  </div>
);

export const GemIcon = () => (
  <div className="w-[30px] h-[30px] flex items-center justify-center shrink-0">
    <div className="w-[24px] h-[24px] bg-[#00d0ff] border-[2px] border-black transform rotate-45 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.6),inset_-2px_-2px_4px_rgba(0,0,0,0.3),2px_2px_3px_rgba(0,0,0,0.5)] flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[200%] h-[200%] bg-gradient-to-bl from-white/60 via-transparent to-transparent rotate-45 translate-x-[20%] -translate-y-[20%]"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent"></div>
    </div>
  </div>
);
