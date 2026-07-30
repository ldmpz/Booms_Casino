import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { type PrizeTier, PRIZE_TIERS, PRIZE_IMAGES } from '../constants/prizes';

interface PrizeModalProps {
  prizeTier: PrizeTier | null;
  winningImage: string | null;
  isNearMiss: boolean;
  isOpen: boolean;
  onClose: () => void;
  onPlayWinAudio: (tier: PrizeTier) => void;
}

interface JackpotCoin {
  id: number;
  xStart: number;
  yStart: number;
  xEnd: number;
  yMid: number;
  yEnd: number;
  size: number;
  delay: number;
  duration: number;
  rotate: number;
}

export const PrizeModal: React.FC<PrizeModalProps> = ({
  prizeTier,
  winningImage,
  isNearMiss,
  isOpen,
  onClose,
  onPlayWinAudio,
}) => {
  const [jackpotCoins, setJackpotCoins] = useState<JackpotCoin[]>([]);

  // Trigger animations and effects when modal opens
  useEffect(() => {
    if (isOpen && prizeTier) {
      // Play win audio
      onPlayWinAudio(prizeTier);

      // Trigger Confetti and Coins only for Grand Prize
      if (prizeTier === 'big') {
        // 1. Confetti burst loop
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 35, spread: 360, ticks: 60, zIndex: 100 };

        const randomInRange = (min: number, max: number) => {
          return Math.random() * (max - min) + min;
        };

        const interval: ReturnType<typeof setInterval> = setInterval(() => {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 70 * (timeLeft / duration);
          
          // Confetti blasts from left and right corners
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
          });
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
          });
        }, 220);

        // 2. Generate jackpot falling coins
        const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;
        const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
        
        const coins = Array.from({ length: 60 }).map((_, i) => ({
          id: i,
          xStart: screenWidth / 2,
          yStart: screenHeight * 0.45,
          xEnd: Math.random() * screenWidth,
          yMid: Math.random() * (screenHeight * 0.2), // Peak heights
          yEnd: screenHeight + 60, // Falls off screen
          size: Math.random() * 26 + 18,
          delay: Math.random() * 2.2, // Spread out coin drops
          duration: Math.random() * 1.6 + 1.2,
          rotate: Math.random() * 1080
        }));
        setJackpotCoins(coins);

        return () => clearInterval(interval);
      } else {
        setJackpotCoins([]);
      }
    }
  }, [isOpen, prizeTier, onPlayWinAudio]);

  if (!prizeTier) return null;

  const config = PRIZE_TIERS[prizeTier];
  
  // Find a representative image to display in the modal
  const prizeImg = winningImage || (prizeTier === 'big' 
    ? PRIZE_IMAGES.big[0] 
    : PRIZE_IMAGES[prizeTier][0]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Golden Rotating Sunburst Overlay (Jackpot exclusive) */}
          {prizeTier === 'big' && (
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center">
              <div 
                className="absolute w-[250vw] h-[250vw] animate-sunburst opacity-[0.18]"
                style={{
                  backgroundImage: 'repeating-conic-gradient(from 0deg, #ffd700 0deg 10deg, transparent 10deg 20deg)',
                  mixBlendMode: 'color-dodge'
                }}
              />
            </div>
          )}

          {/* Flying Gold Coins Shower (Jackpot exclusive) */}
          {prizeTier === 'big' && jackpotCoins.map((coin) => (
            <motion.div
              key={coin.id}
              initial={{ x: coin.xStart, y: coin.yStart, rotate: 0, opacity: 1, scale: 0 }}
              animate={{
                x: [coin.xStart, (coin.xStart + coin.xEnd) / 2, coin.xEnd],
                y: [coin.yStart, coin.yMid, coin.yEnd],
                rotate: coin.rotate,
                opacity: [1, 1, 0.8, 0],
                scale: [0.5, 1.1, 1.1, 0.6]
              }}
              transition={{
                duration: coin.duration,
                delay: coin.delay,
                ease: "easeOut"
              }}
              className="absolute z-40 pointer-events-none filter blur-[0.2px]"
              style={{
                width: `${coin.size}px`,
                height: `${coin.size}px`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]">
                <defs>
                  <radialGradient id={`coin-gold-grad-${coin.id}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFE082" />
                    <stop offset="70%" stopColor="#FFB300" />
                    <stop offset="100%" stopColor="#FF6F00" />
                  </radialGradient>
                </defs>
                <circle cx="50%" cy="50%" r="48" fill={`url(#coin-gold-grad-${coin.id})`} stroke="#FFE082" strokeWidth="2.5" />
                <circle cx="50%" cy="50%" r="38" fill="none" stroke="#FFE082" strokeWidth="1.5" strokeDasharray="5,4" />
                <polygon points="50,22 58,40 78,43 63,57 68,77 50,67 32,77 37,57 22,43 42,40" fill="#FFF8E1" />
              </svg>
            </motion.div>
          ))}

          {/* Modal Cabinet Container */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 50 }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              y: 0,
              transition: {
                type: 'spring',
                stiffness: 260,
                damping: 20
              }
            }}
            exit={{ scale: 0.8, opacity: 0, y: 30 }}
            className={`relative max-w-lg w-full rounded-[36px] p-8 flex flex-col items-center border-4 text-center shadow-[0_20px_80px_rgba(0,0,0,0.95)] overflow-hidden backdrop-blur-2xl bg-gradient-to-b from-black via-zinc-950 to-black z-10
              ${
                prizeTier === 'big'
                  ? 'border-yellow-400 shadow-[0_0_50px_rgba(250,204,21,0.35)]'
                  : prizeTier === 'medium'
                  ? 'border-blue-500/70 shadow-[0_0_40px_rgba(59,130,246,0.25)]'
                  : 'border-emerald-500/60 shadow-[0_0_35px_rgba(16,185,129,0.2)]'
              }
            `}
          >
            {/* Ambient Radial Color Underlay */}
            <div 
              className="absolute -top-24 w-80 h-80 rounded-full blur-[100px] pointer-events-none"
              style={{
                background: config.glowColor,
                opacity: 0.25
              }}
            />

            {/* Glowing Ring Around Image */}
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className={`relative w-48 h-48 rounded-full flex items-center justify-center p-4 shadow-2xl mb-8 bg-black/60 border-2
                ${
                  prizeTier === 'big'
                    ? 'border-yellow-400 animate-pulse-glow shadow-yellow-500/30'
                    : prizeTier === 'medium'
                    ? 'border-blue-400/80 shadow-blue-500/20'
                    : 'border-green-400/60 shadow-green-500/15'
                }
              `}
            >
              <img
                src={prizeImg}
                alt={config.name}
                className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
                onError={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    const textEl = document.createElement('div');
                    textEl.className = 'text-6xl';
                    textEl.innerText = prizeTier === 'big' ? '👑' : prizeTier === 'medium' ? '🔵' : '🟢';
                    parent.appendChild(textEl);
                  }
                }}
              />
            </motion.div>

            {/* Near Miss Banner */}
            {isNearMiss && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
                className="mb-3 px-5 py-1.5 rounded-full bg-gradient-to-r from-yellow-900/60 to-orange-900/60 border border-yellow-500/50 shadow-[0_0_12px_rgba(250,204,21,0.3)]"
              >
                <span className="font-orbitron text-[10px] text-yellow-300 uppercase tracking-widest font-bold">
                  ⚡ ¡Casi lo logras! ⚡
                </span>
              </motion.div>
            )}

            {/* Subtitle / Felicidades */}
            <motion.h3 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`font-anton text-lg md:text-xl uppercase tracking-widest mb-1
                ${prizeTier === 'big' ? 'text-yellow-400 text-glow-gold' : prizeTier === 'medium' ? 'text-blue-400 text-glow-blue' : 'text-green-400 text-glow-green'}
              `}
            >
              {prizeTier === 'big' ? '¡¡JACKPOT!!' : config.bannerText}
            </motion.h3>

            {/* Title / Prize Name */}
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`font-anton text-4xl md:text-5xl uppercase mb-6 tracking-wider leading-none
                ${prizeTier === 'big' ? 'text-white text-glow-jackpot' : config.textColor}
              `}
              style={{
                fontSize: prizeTier === 'big' ? '3rem' : '2.25rem'
              }}
            >
              {prizeTier === 'big' ? '¡¡PREMIO GRANDE!!' : config.subText}
            </motion.h2>

            {/* Gold/Silver Divider */}
            <div className={`h-[2px] w-2/3 mb-8 bg-gradient-to-r from-transparent via-white/35 to-transparent
              ${prizeTier === 'big' ? 'via-yellow-400/50' : prizeTier === 'medium' ? 'via-blue-400/30' : 'via-green-400/30'}
            `} />

            {/* Action Button: Volver a Jugar */}
            <motion.button
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className={`relative px-12 py-5 rounded-full font-black tracking-widest text-lg uppercase cursor-pointer transition-all duration-300 shadow-2xl overflow-hidden border-2
                ${
                  prizeTier === 'big'
                    ? 'bg-gradient-to-b from-yellow-300 via-amber-500 to-yellow-600 text-black border-yellow-200 shadow-yellow-500/30 hover:brightness-110'
                    : prizeTier === 'medium'
                    ? 'bg-gradient-to-b from-blue-400 via-blue-600 to-indigo-700 text-white border-blue-400 shadow-blue-500/25 hover:brightness-110'
                    : 'bg-gradient-to-b from-green-400 via-green-600 to-emerald-700 text-white border-green-400 shadow-green-500/20 hover:brightness-110'
                }
              `}
            >
              Volver a jugar
            </motion.button>
          </motion.div>

          {/* Simple floating particles logic for medium/blue prize */}
          {prizeTier === 'medium' && (
            <div className="absolute inset-0 pointer-events-none z-10">
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: Math.random() * window.innerWidth, 
                    y: window.innerHeight + 10,
                    scale: Math.random() * 0.5 + 0.5,
                    opacity: Math.random() * 0.7 + 0.3
                  }}
                  animate={{ 
                    y: -50,
                    x: `+= ${Math.sin(i) * 80}`,
                    opacity: 0
                  }}
                  transition={{ 
                    duration: Math.random() * 2.5 + 1.8, 
                    ease: "easeOut",
                    repeat: Infinity,
                    delay: Math.random() * 2
                  }}
                  className="absolute w-2.5 h-2.5 rounded-full bg-blue-400 blur-[0.8px]"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
};
export default PrizeModal;
