import React, { useEffect, useRef, useMemo } from 'react';
import { motion, useMotionValue } from 'motion/react';

interface GameThemeBackgroundProps {
  brightness?: number;
  blurAmount?: number;
  particleDensity?: number | 'normal' | 'high' | 'low' | 'none';
  overlayColor?: string;
  spotlightIntensity?: number;
  particleColor?: string;
  className?: string; // Allow passing class just in case we need extra absolute positioning
}

export default function GameThemeBackground({
  brightness = 1,
  blurAmount = 0,
  particleDensity = 'normal',
  overlayColor = 'transparent',
  spotlightIntensity = 1,
  particleColor = '#ffffff',
  className = ''
}: GameThemeBackgroundProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 30);
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 30);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  let numParticles = 0;
  if (typeof particleDensity === 'number') numParticles = particleDensity;
  else if (particleDensity === 'low') numParticles = 15;
  else if (particleDensity === 'normal') numParticles = 30;
  else if (particleDensity === 'high') numParticles = 60;

  // Generate stable random values for particles so they don't recreate on re-render
  const particles = useMemo(() => {
    return Array.from({ length: numParticles }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * -20,
    }));
  }, [numParticles]);

  return (
    <div 
      className={`fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#090d14] transition-all duration-700 ease-in-out ${className}`}
      style={{
        filter: `brightness(${brightness}) blur(${blurAmount}px)`,
      }}
    >
      {/* Tilted Grid Pattern */}
      <motion.div 
        className="absolute inset-[-50%] bg-[linear-gradient(45deg,rgba(255,255,255,0.015)_25%,transparent_25%,transparent_75%,rgba(255,255,255,0.015)_75%,rgba(255,255,255,0.015)),linear-gradient(45deg,rgba(255,255,255,0.015)_25%,transparent_25%,transparent_75%,rgba(255,255,255,0.015)_75%,rgba(255,255,255,0.015))] bg-[size:100px_100px] bg-[position:0_0,50px_50px] opacity-40 transform rotate-[15deg] scale-150"
        style={{ x: mouseX, y: mouseY }}
      />

      {/* Central glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] bg-[#0284c7] rounded-full blur-[120px] opacity-20 mix-blend-screen" />

      {/* Spotlight 1 (Left) */}
      <motion.div 
        className="absolute -top-[10%] left-[20%] w-[30vw] h-[120%] origin-top blur-3xl mix-blend-screen"
        style={{
          background: `linear-gradient(to bottom, rgba(14, 165, 233, ${0.4 * spotlightIntensity}), transparent)`,
          clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)'
        }}
        animate={{
          rotate: ['-12deg', '-8deg', '-12deg'],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Spotlight 2 (Right) */}
      <motion.div 
        className="absolute -top-[10%] right-[20%] w-[30vw] h-[120%] origin-top blur-3xl mix-blend-screen bg-gradient-to-b from-sky-500/30 to-transparent"
        style={{
          background: `linear-gradient(to bottom, rgba(14, 165, 233, ${0.4 * spotlightIntensity}), transparent)`,
          clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)'
        }}
        animate={{
          rotate: ['10deg', '15deg', '10deg'],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Dark Vignette Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_#05080c_100%)] opacity-90" />

      {/* Optional Overlay Color layer for specific screens */}
      {overlayColor !== 'transparent' && (
        <div className="absolute inset-0 transition-colors duration-700" style={{ backgroundColor: overlayColor }} />
      )}

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden mix-blend-screen">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              backgroundColor: particleColor,
              boxShadow: `0 0 ${p.size * 2}px ${particleColor}`,
              opacity: 0.3 + Math.random() * 0.5,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 0.8, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "linear",
            }}
          />
        ))}
      </div>
      
      {/* Subtle bottom mist */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#0284c7]/10 to-transparent blur-2xl" />
    </div>
  );
}
