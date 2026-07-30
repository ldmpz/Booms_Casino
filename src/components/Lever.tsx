import React from 'react';
import { motion, useAnimation } from 'framer-motion';

interface LeverProps {
  onPull: () => void;
  disabled: boolean;
}

export const Lever: React.FC<LeverProps> = ({ onPull, disabled }) => {
  const controls = useAnimation();

  const triggerPull = async () => {
    if (disabled) return;

    // Pull lever down
    await controls.start({
      rotate: 45,
      transition: { duration: 0.35, ease: 'easeIn' }
    });

    // Fire spin
    onPull();

    // Spring bounce back
    await controls.start({
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 180,
        damping: 10
      }
    });
  };

  // Touch support
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    triggerPull();
  };

  return (
    <div className="absolute right-[-24px] sm:right-[-38px] md:right-[-48px] top-[25px] sm:top-[80px] md:top-[140px] h-[130px] sm:h-[185px] md:h-[240px] w-[28px] sm:w-[40px] md:w-[50px] z-30 select-none flex flex-col items-center">
      {/* Base mounting cup — Gold/Chrome Mechanical Socket */}
      <div
        className="absolute bottom-0 w-8 sm:w-11 md:w-13 h-10 sm:h-14 md:h-16 rounded-l-md border-r-2 border-yellow-400 bg-gradient-to-b from-amber-700 via-yellow-600 to-amber-950 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.5),0_8px_16px_rgba(0,0,0,0.8)]"
        style={{ clipPath: 'polygon(0% 15%, 100% 0%, 100% 100%, 0% 85%)' }}
      />

      {/* Heavy metal pivot axle */}
      <div className="absolute bottom-1 sm:bottom-2 w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-r from-zinc-700 via-amber-300 to-zinc-900 border sm:border-2 border-yellow-400/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_4px_8px_rgba(0,0,0,0.8)] z-10" />

      {/* Status LED indicator — green when ready, red when spinning */}
      <div
        className={`absolute bottom-[-10px] sm:bottom-[-14px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full z-20 border border-black/80 shadow-lg transition-all duration-300
          ${disabled
            ? 'bg-red-600 shadow-[0_0_10px_#ef4444]'
            : 'bg-emerald-400 shadow-[0_0_14px_#10b981,0_0_22px_#10b981] animate-pulse'
          }
        `}
      />

      {/* Lever Arm — pivot at bottom axle */}
      <motion.div
        animate={controls}
        initial={{ rotate: 0 }}
        style={{ originX: 0.5, originY: 0.95, minWidth: '36px', minHeight: '36px' }}
        onClick={triggerPull}
        onTouchStart={handleTouchStart}
        className={`absolute bottom-3 sm:bottom-5 h-[105px] sm:h-[145px] md:h-[165px] w-4 sm:w-5 flex flex-col items-center z-20
          ${disabled
            ? 'cursor-not-allowed opacity-85'
            : 'cursor-pointer hover:brightness-115 active:brightness-130'
          }
        `}
      >
        {/* Shiny Red Ruby Sphere Knob with Gold Collar Ring */}
        <div className="relative flex flex-col items-center">
          <div
            className="w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full relative shadow-[0_8px_16px_rgba(0,0,0,0.8),0_0_15px_rgba(255,30,30,0.4),inset_-5px_-5px_10px_rgba(0,0,0,0.6)] transition-all duration-300 active:scale-95 border border-yellow-400/90"
            style={{
              background: disabled
                ? 'radial-gradient(circle at 35% 35%, #cc5555 0%, #aa1111 30%, #6a0004 80%, #3a0002 100%)'
                : 'radial-gradient(circle at 35% 35%, #ff9e9e 0%, #ff1e1e 28%, #b80010 75%, #590006 100%)',
            }}
          >
            {/* Sphere specular reflection highlights */}
            <div className="absolute top-1 left-1.5 w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-white/80 blur-[0.5px]" />
            <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-yellow-300/40 blur-[1px]" />
          </div>
          {/* Gold Collar */}
          <div className="w-3 sm:w-4 h-1.5 sm:h-2 bg-gold-metallic rounded-sm shadow-sm -mt-0.5 z-10" />
        </div>

        {/* Heavy Polished Chrome Shaft */}
        <div
          className="w-2 sm:w-3 flex-1 bg-gradient-to-r from-gray-300 via-white to-gray-500 border-x border-amber-300/40"
          style={{
            boxShadow: 'inset 1px 0 3px rgba(255,255,255,0.8), inset -1px 0 3px rgba(0,0,0,0.5), 0 4px 8px rgba(0,0,0,0.5)'
          }}
        />
      </motion.div>
    </div>
  );
};
export default Lever;
