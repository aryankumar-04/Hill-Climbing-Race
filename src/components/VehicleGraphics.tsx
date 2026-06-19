import React from 'react';
import { useGameStore, TuneData } from '../game/store';

export interface VehicleGraphicsProps {
  id: string;
  type: 'chassis' | 'wheel1' | 'wheel2';
}

export const VehicleGraphics = ({ id, type }: VehicleGraphicsProps) => {
  const tunes = useGameStore((state) => state.vehicleTunes?.[id]) || { engine: 1, suspension: 1, tires: 1, drivetrain: 1 };

  if (type === 'wheel1' || type === 'wheel2') {
    return (
      <svg viewBox="0 0 56 56" className="w-full h-full" style={{ overflow: 'visible' }}>
        <g transform="translate(28,28)">
          {getWheelSVG(id, type, tunes)}
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 176 56" className="w-full h-full" style={{ overflow: 'visible' }}>
      <g transform="translate(0,0)">
        {getChassisSVG(id, tunes)}
      </g>
    </svg>
  );
};

// Returns SVG elements centered at 0,0 since we translated by 28,28
const getWheelSVG = (id: string, type: 'wheel1' | 'wheel2', tunes: TuneData) => {
  const tireScale = 1 + (tunes.tires - 1) * 0.05; // Make tires visually larger

  const drawWheel = (baseR: number, rimR: number, tireColor: string, rimColor: string, spokes: number) => {
    const r = baseR * tireScale;
    const isPremium = tunes.tires >= 15;
    const isOffroad = tunes.tires >= 10;
    const isWider = tunes.tires >= 5;

    const actualTireColor = isPremium ? '#050505' : tireColor;
    const actualRimColor = isPremium ? '#fbbf24' : rimColor;
    const actualSpokes = isPremium ? spokes + 2 : spokes;

    return (
      <g>
        {/* Tire shadow / depth */}
        <circle r={r} fill="#111" />
        <circle r={r * (isWider ? 0.92 : 0.95)} fill={actualTireColor} stroke="#000" strokeWidth="2" />
        {/* Tread marks */}
        {isOffroad ? (
           <circle r={r * 0.85} fill="none" stroke="#111" strokeWidth="6" strokeDasharray="6 8" />
        ) : (
           <circle r={r * 0.85} fill="none" stroke="#222" strokeWidth="2" strokeDasharray="3 4" />
        )}
        {/* Rim inner darkness */}
        <circle r={rimR + 2} fill="#000" />
        {/* Rim */}
        <circle r={rimR} fill={actualRimColor} stroke="#000" strokeWidth="2" />
        {/* Spokes */}
        {Array.from({ length: actualSpokes }).map((_, i) => (
          <line 
            key={i} 
            x1="0" y1="0" 
            x2="0" y2={-rimR} 
            stroke="#000" strokeWidth="3" 
            transform={`rotate(${(360 / actualSpokes) * i})`} 
          />
        ))}
        <circle r={rimR * 0.3} fill="#444" stroke="#000" strokeWidth="1.5" />
      </g>
    );
  };

  switch (id) {
    case 'v_jeep':
      return drawWheel(28, 14, '#333', '#CCC', 6);
    case 'v_bike':
      // Motocross bike wheels (wire spokes, knobby tires)
      return (
        <g>
          <circle r="30" fill="#222" stroke="#000" strokeWidth="3" strokeDasharray="4 2" />
          <circle r="26" fill="transparent" stroke="#000" strokeWidth="2" />
          <circle r="2" fill="#000" />
          {Array.from({ length: 16 }).map((_, i) => (
            <line key={i} x1="0" y1="0" x2="0" y2="-26" stroke="#AAA" strokeWidth="1" transform={`rotate(${(360 / 16) * i})`} />
          ))}
        </g>
      );
    case 'v_sports':
      // Low profile, large rims
      return drawWheel(28, 20, '#222', '#E5E7EB', 5);
    case 'v_monster':
      // Massive wheels
      return drawWheel(45, 15, '#222', '#6B7280', 8);
    case 'v_tractor':
      // Rear wheel (wheel1) is large, front (wheel2) is tiny
      if (type === 'wheel1') {
        return drawWheel(42, 18, '#333', '#FACC15', 5);
      } else {
        return drawWheel(22, 10, '#333', '#FACC15', 4);
      }
    case 'v_bus':
      return drawWheel(26, 12, '#333', '#111', 8);
    case 'v_pickup':
      return drawWheel(32, 16, '#222', '#9CA3AF', 6);
    case 'v_tank':
      // Just internal driver cogs for the track system
      return (
        <g>
           <circle r="20" fill="#4B5320" stroke="#000" strokeWidth="2" />
           <circle r="12" fill="#2E3314" stroke="#000" strokeWidth="1" />
           <circle r="4" fill="#000" />
           {Array.from({ length: 6 }).map((_, i) => (
             <circle key={i} cx="0" cy="-15" r="3" fill="#888" stroke="#000" strokeWidth="1" transform={`rotate(${(360 / 6) * i})`} />
           ))}
        </g>
      );
    case 'v_formula':
      // Thick slicks, rear wider/bigger slightly
      if (type === 'wheel1') {
         return drawWheel(30, 12, '#111', '#000', 3);
      } else {
         return drawWheel(25, 10, '#111', '#000', 3);
      }
    case 'v_moon':
      // Space mesh wheel
      return (
        <g>
          <circle r="32" fill="none" stroke="#9CA3AF" strokeWidth="4" />
          <circle r="28" fill="none" stroke="#4B5563" strokeWidth="1" strokeDasharray="2 4" />
          <circle r="8" fill="#F3F4F6" stroke="#000" strokeWidth="2" />
          {Array.from({ length: 12 }).map((_, i) => (
            <path key={i} d="M 0 0 C 10 -15 20 -15 0 -32" stroke="#9CA3AF" strokeWidth="2" fill="none" transform={`rotate(${(360 / 12) * i})`} />
          ))}
        </g>
      );
    default:
      return drawWheel(28, 14, '#333', '#CCC', 6);
  }
};

const getChassisSVG = (id: string, tunes: TuneData) => {
  // Common parts
  const drawHelmet = (x: number, y: number, color = "#FFF", visor = "#000") => (
    <g transform={`translate(${x}, ${y})`}>
      <circle cx="0" cy="0" r="14" fill={color} stroke="#000" strokeWidth="2" />
      <path d="M 2 -4 Q 12 -4 14 2 Q 8 6 0 4 Z" fill={visor} />
    </g>
  );

  const drawDriver = (x: number, y: number, bodyColor = "#EF4444") => (
    <g transform={`translate(${x}, ${y})`}>
      <path d="M -15 20 Q -5 0 0 -10 Q 5 0 15 20" fill={bodyColor} stroke="#000" strokeWidth="2" />
      {drawHelmet(0, -22, "#E5E7EB", "#2563EB")}
      <path d="M 0 -10 L 12 5" stroke="#000" strokeWidth="4" strokeLinecap="round" />
      <path d="M 12 5 L 20 2" stroke="#000" strokeWidth="4" strokeLinecap="round" />
    </g>
  );

  const drawUpgrades = (t: TuneData) => {
    return (
      <g className="vehicle-upgrades">
        {/* ENGINES */}
        {t.engine >= 5 && (
           <g transform="translate(140, 10)">
              {/* Custom big engine block + air intake */}
              <rect x="-10" y="-15" width="20" height="20" fill="#9CA3AF" stroke="#000" strokeWidth="2" />
              <rect x="-15" y="-20" width="30" height="8" fill="#4B5563" stroke="#000" strokeWidth="2" />
              {t.engine >= 10 && (
                <>
                  {/* Supercharger scoops */}
                  <path d="M -5 -20 L -10 -30 L 10 -30 L 5 -20 Z" fill="#EF4444" stroke="#000" strokeWidth="2" />
                  <circle cx="-10" cy="-5" r="4" fill="#3B82F6" />
                  <circle cx="0" cy="-5" r="4" fill="#3B82F6" />
                  <circle cx="10" cy="-5" r="4" fill="#3B82F6" />
                </>
              )}
           </g>
        )}
        
        {/* SUSPENSION */}
        {t.suspension >= 5 && (
           <g>
             {/* Rear shock */}
             <line x1="38" y1="20" x2="38" y2="40" stroke="#EF4444" strokeWidth="6" strokeDasharray="3 2" />
             <line x1="38" y1="20" x2="38" y2="40" stroke="#000" strokeWidth="2" />
             {/* Front shock */}
             <line x1="138" y1="20" x2="138" y2="40" stroke="#EF4444" strokeWidth="6" strokeDasharray="3 2" />
             <line x1="138" y1="20" x2="138" y2="40" stroke="#000" strokeWidth="2" />
             
             {t.suspension >= 10 && (
               <>
                 <circle cx="38" cy="20" r="5" fill="#3B82F6" stroke="#000" strokeWidth="1" />
                 <circle cx="138" cy="20" r="5" fill="#3B82F6" stroke="#000" strokeWidth="1" />
                 {/* Secondary heavy duty springs */}
                 <line x1="45" y1="25" x2="45" y2="45" stroke="#FBBF24" strokeWidth="4" />
                 <line x1="130" y1="25" x2="130" y2="45" stroke="#FBBF24" strokeWidth="4" />
               </>
             )}
           </g>
        )}
        
        {/* DRIVETRAIN (4WD) */}
        {t.drivetrain >= 5 && (
           <g>
             {/* Driveshaft */}
             <line x1="38" y1="45" x2="138" y2="45" stroke="#4B5563" strokeWidth="4" />
             {/* Differential visual */}
             <circle cx="88" cy="45" r="6" fill="#1F2937" stroke="#000" strokeWidth="2" />
             
             {t.drivetrain >= 10 && (
               <>
                 {/* Heavy duty axle casing */}
                 <rect x="30" y="42" width="16" height="6" fill="#DC2626" />
                 <rect x="130" y="42" width="16" height="6" fill="#DC2626" />
                 <circle cx="88" cy="45" r="10" fill="#EF4444" stroke="#000" strokeWidth="2" />
               </>
             )}
           </g>
        )}
      </g>
    );
  };

  let chassisContent = null;
  switch (id) {
    case 'v_jeep':
      chassisContent = (
        <g>
          {/* Driver */}
          <g transform="translate(80, -5)">
            <circle cx="0" cy="-22" r="14" fill="#FCD34D" stroke="#000" strokeWidth="2" />
            <path d="M -12 -30 Q 0 -40 18 -26" fill="#DC2626" stroke="#000" strokeWidth="2" />
            <path d="M 12 -26 L 22 -26" stroke="#000" strokeWidth="3" strokeLinecap="round" />
            <path d="M -14 0 Q 0 -15 14 0 L 18 20 L -18 20 Z" fill="#2563EB" stroke="#000" strokeWidth="2" />
          </g>
          {/* Roll cage */}
          <path d="M 40 10 L 40 -35 L 110 -35 L 130 10" fill="none" stroke="#222" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          {/* Main Body */}
          <path d="M 10 20 L 10 40 Q 10 48 18 48 L 158 48 Q 166 48 166 40 L 166 25 L 130 10 L 40 10 Z" fill="#DC2626" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
          <path d="M 10 30 L 166 30" stroke="#000" strokeWidth="1" opacity="0.3" />
          {/* Engine/Hood Details */}
          <rect x="130" y="15" width="20" height="5" fill="#333" />
          <rect x="130" y="22" width="20" height="5" fill="#333" />
          {/* Fender Cutouts (matching wheel positions somewhat visually) */}
          <path d="M 20 48 C 20 25 56 25 56 48" fill="#222" />
          <path d="M 120 48 C 120 25 156 25 156 48" fill="#222" />
        </g>
      );
      break;
    case 'v_bike':
      chassisContent = (
        <g>
          <path d="M 50 30 L 130 15 L 100 0 Z" fill="#EF4444" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
          {/* Seat */}
          <path d="M 45 25 L 80 15 L 90 5 L 60 10 Z" fill="#111" />
          {/* Driver leaning forward */}
          <g transform="translate(80, 5) rotate(20)">
            {drawDriver(0, 0, "#3B82F6")}
          </g>
          {/* Engine & chassis details */}
          <rect x="70" y="20" width="25" height="20" rx="4" fill="#6B7280" stroke="#000" strokeWidth="2" />
          <circle cx="82" cy="30" r="6" fill="#374151" stroke="#000" strokeWidth="1" />
          {/* Front fork */}
          <line x1="120" y1="-5" x2="145" y2="45" stroke="#FDE047" strokeWidth="4" />
          <line x1="120" y1="-5" x2="145" y2="45" stroke="#000" strokeWidth="6" strokeDasharray="10 40" />
          {/* Rear swingarm */}
          <line x1="75" y1="35" x2="35" y2="45" stroke="#9CA3AF" strokeWidth="5" />
          {/* Exhaust */}
          <path d="M 85 40 L 40 25" stroke="#D1D5DB" strokeWidth="5" strokeLinecap="round" />
          <path d="M 40 25 L 20 25" stroke="#9CA3AF" strokeWidth="8" strokeLinecap="round" />
        </g>
      );
      break;
    case 'v_sports':
      chassisContent = (
        <g>
          {/* Aerodynamic Body */}
          <path d="M 5 45 L 175 45 Q 180 45 175 35 L 140 20 Q 110 -5 80 10 L 30 20 Q 0 30 5 45 Z" fill="#DC2626" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
          {/* Windows */}
          <path d="M 75 12 Q 100 0 130 18 L 110 22 L 75 22 Z" fill="#3B82F6" stroke="#000" strokeWidth="2" opacity="0.8" />
          {/* Driver Inside */}
          {drawDriver(90, 8, "#F59E0B")}
          {/* Spoiler */}
          <path d="M 10 20 L 30 10 L 60 15 L 60 20 L 35 15 L 20 25 Z" fill="#111" />
          {/* Decals */}
          <path d="M 70 25 L 150 25 L 160 30 L 70 30 Z" fill="#FCD34D" />
          <path d="M 70 32 L 170 32 L 160 37 L 70 37 Z" fill="#FCD34D" />
          {/* Fender gaps */}
          <path d="M 20 48 Q 38 15 56 48" fill="#111" />
          <path d="M 120 48 Q 138 15 156 48" fill="#111" />
        </g>
      );
      break;
    case 'v_monster':
      chassisContent = (
        <g>
          {/* Massive suspension linkages */}
          <line x1="88" y1="28" x2="40" y2="50" stroke="#FBBF24" strokeWidth="6" />
          <line x1="88" y1="28" x2="136" y2="50" stroke="#FBBF24" strokeWidth="6" />
          <circle cx="88" cy="28" r="8" fill="#111" />
          
          {/* High lifted body */}
          <g transform="translate(0, -35)">
             {/* Exhaust pipes vertical */}
             <rect x="50" y="0" width="8" height="30" fill="#D1D5DB" stroke="#000" strokeWidth="2" />
             <rect x="120" y="0" width="8" height="30" fill="#D1D5DB" stroke="#000" strokeWidth="2" />
             
             {/* Driver */}
             {drawDriver(90, 15, "#10B981")}
             
             {/* Pickup style body */}
             <path d="M 10 35 L 10 55 Q 10 60 15 60 L 165 60 Q 170 60 170 55 L 170 35 L 125 35 L 100 10 L 50 10 L 40 35 Z" fill="#3B82F6" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
             {/* Flame Decal */}
             <path d="M 15 45 Q 40 40 50 45 Q 70 35 80 50 Q 100 45 110 55 L 15 55 Z" fill="#EF4444" opacity="0.9" />
          </g>
        </g>
      );
      break;
    case 'v_tractor':
      chassisContent = (
        <g>
          {/* Driver */}
          {drawDriver(70, 0, "#F59E0B")}
          {/* Exhaust Stack */}
          <rect x="120" y="-30" width="8" height="50" fill="#4B5563" stroke="#000" strokeWidth="2" />
          <polygon points="115,-30 133,-30 128,-40 120,-40" fill="#111" />
          <circle cx="124" cy="-45" r="5" fill="#444" opacity="0.5" />
          <circle cx="128" cy="-55" r="8" fill="#444" opacity="0.4" />
          
          {/* Body */}
          <path d="M 30 5 L 85 5 L 90 20 L 160 20 L 160 45 L 30 45 Z" fill="#16A34A" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
          <rect x="40" y="10" width="40" height="15" fill="#FACC15" />
          <rect x="95" y="25" width="60" height="15" fill="#FACC15" />
          
          {/* Engine block detail */}
          <rect x="100" y="28" width="50" height="10" fill="#374151" />
          <line x1="105" y1="33" x2="145" y2="33" stroke="#6B7280" strokeWidth="2" />
          
          {/* Huge rear fender */}
          <path d="M 0 45 C 0 -10 80 -10 80 45 Z" fill="#15803D" stroke="#000" strokeWidth="3" />
          <path d="M 10 45 C 10 5 70 5 70 45" fill="none" stroke="#222" strokeWidth="4" />
        </g>
      );
      break;
    case 'v_bus':
      chassisContent = (
        <g>
          {/* Driver */}
          {drawDriver(150, 0, "#60A5FA")}
          
          {/* Long Bus Body stretching out back */}
          <path d="M -40 0 L 180 0 Q 190 0 190 10 L 190 45 L -40 45 Z" fill="#FACC15" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
          <path d="M -40 25 L 190 25" stroke="#000" strokeWidth="2" />
          
          {/* Windows */}
          <rect x="-30" y="5" width="20" height="15" rx="2" fill="#93C5FD" stroke="#000" strokeWidth="2" />
          <rect x="-5" y="5" width="20" height="15" rx="2" fill="#93C5FD" stroke="#000" strokeWidth="2" />
          <rect x="20" y="5" width="20" height="15" rx="2" fill="#93C5FD" stroke="#000" strokeWidth="2" />
          <rect x="45" y="5" width="20" height="15" rx="2" fill="#93C5FD" stroke="#000" strokeWidth="2" />
          <rect x="70" y="5" width="20" height="15" rx="2" fill="#93C5FD" stroke="#000" strokeWidth="2" />
          <rect x="95" y="5" width="20" height="15" rx="2" fill="#93C5FD" stroke="#000" strokeWidth="2" />
          <rect x="120" y="5" width="20" height="15" rx="2" fill="#93C5FD" stroke="#000" strokeWidth="2" />
          
          {/* Stripe */}
          <rect x="-40" y="30" width="230" height="5" fill="#111" />
          
          {/* Fenders */}
          <path d="M 20 48 C 20 25 56 25 56 48" fill="#111" />
          <path d="M 120 48 C 120 25 156 25 156 48" fill="#111" />
        </g>
      );
      break;
    case 'v_pickup':
      chassisContent = (
        <g>
          {/* Driver */}
          {drawDriver(90, 5, "#D97706")}
          
          {/* Roll bar in bed */}
          <path d="M 30 15 L 50 -10 L 80 -10 L 80 15" fill="none" stroke="#6B7280" strokeWidth="6" strokeLinejoin="round" />
          
          {/* Body */}
          <path d="M 10 15 L 75 15 L 85 -5 L 115 -5 L 125 15 L 165 15 Q 175 15 175 25 L 175 45 L 10 45 Z" fill="#F97316" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
          
          {/* Silver/Chrome trim */}
          <rect x="10" y="40" width="165" height="5" fill="#D1D5DB" />
          <rect x="5" y="42" width="10" height="6" fill="#9CA3AF" stroke="#000" strokeWidth="1" />
          <rect x="170" y="42" width="10" height="6" fill="#9CA3AF" stroke="#000" strokeWidth="1" />
          
          {/* Fenders */}
          <path d="M 15 48 C 15 20 56 20 61 48" fill="#4B5563" stroke="#000" strokeWidth="2" />
          <path d="M 115 48 C 115 20 156 20 161 48" fill="#4B5563" stroke="#000" strokeWidth="2" />
        </g>
      );
      break;
    case 'v_tank':
      chassisContent = (
        <g>
          {/* Tracks Base */}
          <rect x="15" y="30" width="146" height="25" rx="12" fill="#1F2937" stroke="#000" strokeWidth="4" />
          <rect x="25" y="34" width="126" height="17" fill="#111" />
          
          {/* Turret */}
          <path d="M 50 10 L 70 -15 L 110 -15 L 120 10 Z" fill="#4D7C0F" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
          {drawDriver(85, -20, "#3F6212")}
          <rect x="60" y="-15" width="20" height="5" fill="#3F6212" stroke="#000" strokeWidth="1" />
          
          {/* Cannon */}
          <rect x="110" y="-10" width="70" height="8" fill="#4B5563" stroke="#000" strokeWidth="2" />
          <rect x="170" y="-12" width="15" height="12" rx="2" fill="#374151" stroke="#000" strokeWidth="2" />
          
          {/* Main Hull */}
          <path d="M 20 10 L 150 10 L 160 30 L 10 30 Z" fill="#4D7C0F" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
          {/* Camo Decals */}
          <path d="M 30 15 Q 40 25 50 15 Z" fill="#3F6212" />
          <path d="M 130 10 Q 140 20 150 25 L 120 25 Z" fill="#3F6212" />
        </g>
      );
      break;
    case 'v_formula':
      chassisContent = (
        <g>
          {/* Rear Wing */}
          <path d="M 10 10 L 40 10 L 40 25 L 30 25 L 30 15 L 10 15 Z" fill="#111" stroke="#000" strokeWidth="2" />
          <path d="M 0 5 L 45 5 L 45 10 L 0 10 Z" fill="#DC2626" stroke="#000" strokeWidth="2" />
          
          {/* Driver */}
          {drawHelmet(85, 10, "#EF4444", "#111")}
          
          {/* Main Body Aero */}
          <path d="M 15 25 L 70 25 C 80 15 90 15 100 25 L 160 35 L 180 40 L 180 43 L 15 43 Z" fill="#DC2626" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
          
          {/* Front Wing */}
          <path d="M 150 43 L 185 43 L 185 47 L 150 47 Z" fill="#111" stroke="#000" strokeWidth="2" />
          
          {/* Sidepods */}
          <path d="M 50 35 L 110 35 L 100 43 L 60 43 Z" fill="#fff" stroke="#000" strokeWidth="2" />
        </g>
      );
      break;
    case 'v_moon':
      chassisContent = (
        <g>
          {/* Radar Antenna */}
          <line x1="40" y1="5" x2="40" y2="-30" stroke="#9CA3AF" strokeWidth="2" />
          <path d="M 30 -30 C 40 -40 50 -30 50 -30 C 40 -25 30 -30 30 -30 Z" fill="#D1D5DB" stroke="#000" strokeWidth="1" />
          
          {/* Astronaut */}
          {drawDriver(88, -10, "#FFFFFF")}
          
          {/* Suspension Struts Space Age */}
          <line x1="88" y1="20" x2="38" y2="40" stroke="#9CA3AF" strokeWidth="3" />
          <line x1="88" y1="20" x2="138" y2="40" stroke="#9CA3AF" strokeWidth="3" />
          
          {/* Main Pod */}
          <path d="M 30 20 L 140 20 C 150 20 150 35 140 35 L 30 35 C 20 35 20 20 30 20 Z" fill="#E5E7EB" stroke="#000" strokeWidth="3" />
          
          {/* Tech Details */}
          <rect x="50" y="23" width="20" height="9" rx="2" fill="#3B82F6" stroke="#000" strokeWidth="1" />
          <rect x="75" y="23" width="10" height="9" rx="2" fill="#F59E0B" stroke="#000" strokeWidth="1" />
          <rect x="90" y="23" width="30" height="9" rx="2" fill="#10B981" stroke="#000" strokeWidth="1" />
          
          {/* Solar Panel */}
          <path d="M 120 5 L 160 -10 L 170 -5 L 130 10 Z" fill="#1E3A8A" stroke="#3B82F6" strokeWidth="2" />
          <line x1="125" y1="5" x2="165" y2="-10" stroke="#3B82F6" strokeWidth="1" />
        </g>
      );
      break;
    default:
      chassisContent = (
        <g>
          <rect x="0" y="0" width="176" height="56" rx="8" fill="#3B82F6" stroke="#000" strokeWidth="3" />
        </g>
      );
      break;
  }
  
  return (
    <g>
      {chassisContent}
      {drawUpgrades(tunes)}
    </g>
  );
};

export const StandaloneVehicle = ({ id }: { id: string }) => {
  return (
    <div className="relative w-[176px] h-[56px] scale-[1.1] origin-center -translate-y-2">
      {/* Central Chassis Graphic */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <VehicleGraphics id={id} type="chassis" />
      </div>
      
      {/* Rear Wheel (Wheel 1) - positioned centered over physical anchor (-50, 30 from center => top-left 10, 30) */}
      <div className="absolute w-[56px] h-[56px] left-[10px] top-[30px] z-20 origin-center">
        <VehicleGraphics id={id} type="wheel1" />
      </div>
      
      {/* Front Wheel (Wheel 2) - positioned centered over physical anchor (+50, 30 from center => top-left 110, 30) */}
      <div className="absolute w-[56px] h-[56px] left-[110px] top-[30px] z-20 origin-center">
        <VehicleGraphics id={id} type="wheel2" />
      </div>
    </div>
  );
};
