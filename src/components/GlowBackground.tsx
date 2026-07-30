import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type GlowState = 'idle' | 'spinning' | 'small' | 'medium' | 'big';

interface GlowBackgroundProps {
  state: GlowState;
}

// Generate static config for 12 floating chips and coins
const FLOATING_ITEMS = [
  { id: 1, type: 'coin', size: 40, x: '8%', delay: 0.5, duration: 8, rotate: 120 },
  { id: 2, type: 'chip', size: 60, x: '15%', delay: 2, duration: 12, rotate: -90 },
  { id: 3, type: 'coin', size: 30, x: '25%', delay: 0, duration: 9, rotate: 45 },
  { id: 4, type: 'chip', size: 45, x: '35%', delay: 4, duration: 11, rotate: 180 },
  { id: 5, type: 'coin', size: 50, x: '72%', delay: 1.5, duration: 7.5, rotate: -60 },
  { id: 6, type: 'chip', size: 55, x: '82%', delay: 3.5, duration: 13, rotate: 210 },
  { id: 7, type: 'coin', size: 35, x: '88%', delay: 0.8, duration: 9.5, rotate: 30 },
  { id: 8, type: 'chip', size: 40, x: '94%', delay: 2.5, duration: 10, rotate: 15 },
  { id: 9, type: 'coin', size: 45, x: '20%', delay: 5, duration: 8.5, rotate: -40 },
  { id: 10, type: 'chip', size: 50, x: '65%', delay: 1, duration: 11.5, rotate: 115 },
  { id: 11, type: 'coin', size: 30, x: '5%', delay: 3, duration: 10, rotate: 75 },
  { id: 12, type: 'chip', size: 65, x: '90%', delay: 5.5, duration: 14, rotate: -150 }
];

export const GlowBackground: React.FC<GlowBackgroundProps> = ({ state }) => {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#0a0202] z-0">
      
      {/* High-Definition Casino Blurred Background */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat scale-105 pointer-events-none filter blur-[4px] brightness-[0.45] saturate-[1.4]"
        style={{
          backgroundImage: `url('/images/casino_bg.png')`,
        }}
      />

      {/* Luxury Golden Spotlight Beams */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[80vh] bg-gradient-to-br from-yellow-500/15 via-amber-600/5 to-transparent rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[80vh] bg-gradient-to-bl from-yellow-500/15 via-amber-600/5 to-transparent rounded-full blur-[80px] pointer-events-none" />

      {/* Dynamic Red & Gold Ambient Glow Overlay */}
      <div 
        className={`absolute inset-0 bg-gradient-to-t from-black via-red-950/35 to-black/85 transition-all duration-1000 ease-in-out
          ${state === 'spinning' ? 'opacity-90' : 'opacity-70'}
        `} 
      />

      {/* Floating Casino Chips and Gold Coins (Left & Right Sides) */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {FLOATING_ITEMS.map((item) => (
          <motion.div
            key={item.id}
            initial={{ 
              y: '110vh', 
              x: item.x, 
              rotate: 0,
              opacity: 0.15,
              scale: 0.95
            }}
            animate={{ 
              y: '-10vh',
              rotate: item.rotate,
              opacity: [0.15, 0.45, 0.45, 0.15],
              scale: [0.95, 1.05, 1.05, 0.95]
            }}
            transition={{
              duration: item.duration,
              delay: item.delay,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute filter blur-[1.5px]"
            style={{
              width: `${item.size}px`,
              height: `${item.size}px`,
            }}
          >
            {item.type === 'coin' ? (
              // Gold Coin SVG
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
                <defs>
                  <radialGradient id={`gold-grad-${item.id}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFF176" />
                    <stop offset="60%" stopColor="#FBC02D" />
                    <stop offset="100%" stopColor="#F57F17" />
                  </radialGradient>
                </defs>
                <circle cx="50%" cy="50%" r="48" fill={`url(#gold-grad-${item.id})`} stroke="#FFD54F" strokeWidth="3" />
                <circle cx="50%" cy="50%" r="38" fill="none" stroke="#E65100" strokeWidth="2" strokeDasharray="6,4" />
                <polygon points="50,22 58,40 78,43 63,57 68,77 50,67 32,77 37,57 22,43 42,40" fill="#FFF8E1" />
              </svg>
            ) : (
              // Casino Poker Chip SVG (Red & White)
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_6px_12px_rgba(0,0,0,0.6)]">
                <circle cx="50%" cy="50%" r="48" fill="#C40018" stroke="#FFFFFF" strokeWidth="4" />
                {/* Dashes around the chip */}
                <circle cx="50%" cy="50%" r="42" fill="none" stroke="#FFFFFF" strokeWidth="6" strokeDasharray="16,14" />
                <circle cx="50%" cy="50%" r="28" fill="#FFFFFF" />
                <circle cx="50%" cy="50%" r="24" fill="#C40018" />
                <polygon points="50,34 54,44 65,46 57,53 60,64 50,58 40,64 43,53 35,46 46,44" fill="#FFFFFF" />
              </svg>
            )}
          </motion.div>
        ))}
      </div>

      {/* Dynamic prize states glow overlays */}
      <AnimatePresence mode="popLayout">
        {state === 'spinning' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-red-600/10 pointer-events-none mix-blend-color-dodge"
          />
        )}

        {state === 'small' && (
          <motion.div
            key="small-glow-pulse"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-green-500/10 pointer-events-none mix-blend-color-dodge"
          />
        )}

        {state === 'medium' && (
          <motion.div
            key="medium-glow-pulse"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="absolute inset-0 bg-blue-500/10 pointer-events-none mix-blend-color-dodge"
          />
        )}

        {state === 'big' && (
          <motion.div
            key="big-glow-pulse"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="absolute inset-0 bg-yellow-500/15 pointer-events-none mix-blend-color-dodge"
          />
        )}
      </AnimatePresence>

      {/* White camera flash for jackpot win */}
      <AnimatePresence>
        {state === 'big' && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute inset-0 bg-white z-50 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
  );
};
export default GlowBackground;
