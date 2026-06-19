import React from 'react';

export const STAGE_CONFIGS: Record<string, { bgColors: string, groundFill: string, groundStroke: string }> = {
  's_countryside': { bgColors: 'from-[#a0d8ef] to-[#bcf2ff]', groundFill: '#654321', groundStroke: '#82e022' },
  's_desert': { bgColors: 'from-[#fcd34d] to-[#fbbf24]', groundFill: '#d97706', groundStroke: '#b45309' },
  's_arctic': { bgColors: 'from-[#e0f2fe] to-[#bae6fd]', groundFill: '#bae6fd', groundStroke: '#ffffff' },
  's_moon': { bgColors: 'from-[#000000] to-[#1f2937]', groundFill: '#374151', groundStroke: '#9ca3af' },
  's_forest': { bgColors: 'from-[#86efac] to-[#4ade80]', groundFill: '#4d2c11', groundStroke: '#166534' },
  's_highway': { bgColors: 'from-[#9ca3af] to-[#6b7280]', groundFill: '#374151', groundStroke: '#1f2937' },
  's_volcano': { bgColors: 'from-[#b91c1c] to-[#7f1d1d]', groundFill: '#450a0a', groundStroke: '#ef4444' },
  's_beach': { bgColors: 'from-[#7dd3fc] to-[#38bdf8]', groundFill: '#fef08a', groundStroke: '#fde047' },
  's_mars': { bgColors: 'from-[#ea580c] to-[#c2410c]', groundFill: '#7c2d12', groundStroke: '#9a3412' },
  's_neoncity': { bgColors: 'from-[#4c1d95] to-[#312e81]', groundFill: '#000000', groundStroke: '#a855f7' }
};

export function StageBackground({ id, cameraX = 0, cameraY = 0 }: { id: string, cameraX?: number, cameraY?: number }) {
  const config = STAGE_CONFIGS[id] || STAGE_CONFIGS['s_countryside'];

  return (
    <div className={`absolute inset-0 bg-gradient-to-b ${config.bgColors} z-0 overflow-hidden`}>
      {/* Dynamic Background Parallax Container */}
      <div className="absolute inset-0 z-0" style={{ transform: 'translate(calc(var(--cam-x) * -0.05px), calc(var(--cam-y) * -0.02px))' }}>
        {/* Background Decorators based on Stage */}
        {id === 's_countryside' && (
          <div className="absolute inset-0 z-0 w-[200%] -left-[50%]">
            <div className="absolute bottom-1/4 w-full h-32 bg-green-300 rounded-t-full opacity-50 blur-xl transform translate-y-1/2"></div>
          </div>
        )}
        
        {id === 's_moon' && (
          <div className="absolute inset-0 z-0">
            {/* Earth in background */}
            <div className="absolute top-[10%] left-[60%] w-32 h-32 bg-blue-500 rounded-full shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden">
               <div className="w-16 h-16 bg-green-500 rounded-full absolute -top-2 -left-2"></div>
               <div className="w-12 h-10 bg-green-500 rounded-full absolute bottom-4 right-4"></div>
            </div>
          </div>
        )}

        {id === 's_desert' && (
          <div className="absolute inset-0 z-0 flex items-end">
               {/* distant sun */}
               <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-orange-400 rounded-full opacity-80 blur-md"></div>
               {/* distant dunes */}
               <div className="absolute w-[200%] h-[30%] bg-orange-300 rounded-t-[100%] opacity-40 -left-[50%] bottom-0 transform"></div>
          </div>
        )}

        {id === 's_arctic' && (
          <div className="absolute inset-0 z-0">
             {/* faint mountains */}
             <div className="absolute bottom-1/4 w-[50%] h-[40%] bg-blue-100 transform rotate-45 translate-y-1/2 -ml-[10%]"></div>
             <div className="absolute bottom-1/4 w-[60%] h-[50%] bg-blue-50 transform rotate-45 translate-y-1/2 left-[30%]"></div>
          </div>
        )}

        {id === 's_volcano' && (
          <div className="absolute inset-0 z-0">
              {/* dark red gradient at bottom */}
              <div className="absolute bottom-0 w-full h-[50%] bg-gradient-to-t from-orange-900 to-transparent opacity-80"></div>
          </div>
        )}

        {id === 's_neoncity' && (
          <div className="absolute inset-0 z-0">
             {/* glowing buildings silhouette */}
             <div className="absolute bottom-1/4 w-[200%] -left-[50%] flex items-end opacity-20 filter blur-sm">
               <div className="w-20 h-64 bg-purple-500 mx-2"></div>
               <div className="w-32 h-40 bg-pink-500 mx-2"></div>
               <div className="w-24 h-80 bg-blue-500 mx-2"></div>
               <div className="w-40 h-48 bg-purple-500 mx-2"></div>
               <div className="w-40 h-48 bg-pink-500 mx-2"></div>
               <div className="w-20 h-64 bg-purple-500 mx-2"></div>
               <div className="w-32 h-40 bg-pink-500 mx-2"></div>
             </div>
          </div>
        )}

        {id === 's_forest' && (
          <div className="absolute inset-0 z-0">
             <div className="absolute bottom-[20%] w-[200%] -left-[50%] h-[50%] bg-green-900/10 rounded-[100%] scale-150"></div>
          </div>
        )}

        {id === 's_highway' && (
          <div className="absolute inset-0 z-0">
             {/* distant city */}
             <div className="absolute bottom-[25%] flex items-end w-[200%] -left-[50%] h-20 opacity-30">
                 <div className="w-10 h-10 bg-gray-800 mx-1"></div>
                 <div className="w-12 h-16 bg-gray-800 mx-1"></div>
                 <div className="w-8 h-8 bg-gray-800 mx-1"></div>
                 <div className="w-10 h-10 bg-gray-800 mx-1"></div>
                 <div className="w-12 h-16 bg-gray-800 mx-1"></div>
                 <div className="w-8 h-8 bg-gray-800 mx-1"></div>
             </div>
          </div>
        )}

        {id === 's_mars' && (
          <div className="absolute inset-0 z-0">
              <div className="absolute top-[20%] left-[60%] w-16 h-16 bg-orange-300 rounded-full opacity-60"></div>
          </div>
        )}

        {id === 's_beach' && (
          <div className="absolute inset-0 z-0">
              {/* sun / ocean line */}
              <div className="absolute top-[30%] left-[80%] w-32 h-32 bg-yellow-200 rounded-full opacity-90 shadow-[0_0_50px_#fef08a]"></div>
              <div className="absolute bottom-[30%] w-[200%] -left-[50%] h-[20%] bg-blue-300 opacity-50"></div>
          </div>
        )}
      </div>

      {/* Static Overlays (Stars/Grid/Snow) */}
      {id === 's_moon' && (
         <div className="absolute inset-0 bg-[radial-gradient(white_1px,transparent_1px)] bg-[size:40px_40px] opacity-30"></div>
      )}
      {id === 's_arctic' && (
         <div className="absolute inset-0 bg-[radial-gradient(white_2px,transparent_2px)] bg-[size:30px_30px] opacity-50"></div>
      )}
      {id === 's_volcano' && (
         <div className="absolute inset-0 bg-[radial-gradient(#fca5a5_1px,transparent_1px)] bg-[size:25px_25px] opacity-40"></div>
      )}
      {id === 's_neoncity' && (
         <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.2)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      )}
      {id === 's_forest' && (
         <div className="absolute top-0 w-full h-full bg-gradient-to-b from-green-100/20 to-transparent pointer-events-none"></div>
      )}
    </div>
  );
}
