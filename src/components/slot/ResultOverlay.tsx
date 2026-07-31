import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { PrizeTier } from '../../types/engine';
import { PRIZE_IMAGES, PRIZE_TIERS } from '../../constants/prizes';
import { AudioManager } from '../../engine/AudioManager';

interface ResultOverlayProps {
  isOpen: boolean;
  outcome: 'WIN_SMALL' | 'WIN_MEDIUM' | 'WIN_BIG' | 'LOSE' | null;
  prizeTier: PrizeTier | null;
  winningImage: string | null;
  isNearMiss: boolean;
  securityCode: string | null;
  onClose: () => void;
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

export const ResultOverlay: React.FC<ResultOverlayProps> = ({
  isOpen,
  outcome,
  prizeTier,
  winningImage,
  isNearMiss,
  securityCode,
  onClose,
}) => {
  const [jackpotCoins, setJackpotCoins] = useState<JackpotCoin[]>([]);
  const audioManager = AudioManager.getInstance();

  useEffect(() => {
    if (isOpen) {
      if (outcome === 'LOSE') {
        audioManager.playLose();
        setJackpotCoins([]);
      } else if (prizeTier) {
        audioManager.playWin(prizeTier);

        if (prizeTier === 'big') {
          const duration = 5 * 1000;
          const animationEnd = Date.now() + duration;
          const defaults = { startVelocity: 35, spread: 360, ticks: 60, zIndex: 100 };
          const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

          const interval: ReturnType<typeof setInterval> = setInterval(() => {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            const particleCount = 70 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
          }, 220);

          const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;
          const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
          const coins = Array.from({ length: 60 }).map((_, i) => ({
            id: i,
            xStart: screenWidth / 2,
            yStart: screenHeight * 0.45,
            xEnd: Math.random() * screenWidth,
            yMid: Math.random() * (screenHeight * 0.2),
            yEnd: screenHeight + 60,
            size: Math.random() * 26 + 18,
            delay: Math.random() * 2.2,
            duration: Math.random() * 1.6 + 1.2,
            rotate: Math.random() * 1080,
          }));
          setJackpotCoins(coins);

          return () => clearInterval(interval);
        } else {
          setJackpotCoins([]);
        }
      }
    }
  }, [isOpen, outcome, prizeTier, audioManager]);

  if (!isOpen || !outcome) return null;

  const isWin = outcome !== 'LOSE';
  const config = prizeTier ? PRIZE_TIERS[prizeTier] : null;
  const prizeImg = winningImage || (prizeTier === 'big' ? PRIZE_IMAGES.big[0] : prizeTier ? PRIZE_IMAGES[prizeTier][0] : '');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden select-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        {outcome === 'WIN_BIG' && (
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center">
            <div
              className="absolute w-[250vw] h-[250vw] animate-sunburst opacity-[0.22]"
              style={{
                backgroundImage: 'repeating-conic-gradient(from 0deg, #ffd700 0deg 10deg, transparent 10deg 20deg)',
                mixBlendMode: 'color-dodge',
              }}
            />
          </div>
        )}

        {outcome === 'WIN_BIG' &&
          jackpotCoins.map((coin) => (
            <motion.div
              key={coin.id}
              initial={{ x: coin.xStart, y: coin.yStart, rotate: 0, opacity: 1, scale: 0 }}
              animate={{
                x: [coin.xStart, (coin.xStart + coin.xEnd) / 2, coin.xEnd],
                y: [coin.yStart, coin.yMid, coin.yEnd],
                rotate: coin.rotate,
                opacity: [1, 1, 0.8, 0],
                scale: [0.5, 1.1, 1.1, 0.6],
              }}
              transition={{ duration: coin.duration, delay: coin.delay, ease: 'easeOut' }}
              className="absolute z-40 pointer-events-none filter blur-[0.2px]"
              style={{ width: `${coin.size}px`, height: `${coin.size}px`, transform: 'translate(-50%, -50%)' }}
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

        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } }}
          exit={{ scale: 0.8, opacity: 0, y: 30 }}
          className={`relative max-w-lg w-[92vw] sm:w-full rounded-3xl sm:rounded-[36px] p-6 sm:p-8 flex flex-col items-center border-2 sm:border-4 text-center shadow-[0_25px_90px_rgba(0,0,0,0.98)] overflow-hidden backdrop-blur-2xl bg-gradient-to-b from-black via-zinc-950 to-black z-10
            ${
              outcome === 'WIN_BIG'
                ? 'border-yellow-400 shadow-[0_0_60px_rgba(250,204,21,0.4)]'
                : outcome === 'WIN_MEDIUM'
                ? 'border-blue-500/70 shadow-[0_0_40px_rgba(59,130,246,0.25)]'
                : outcome === 'WIN_SMALL'
                ? 'border-emerald-500/60 shadow-[0_0_35px_rgba(16,185,129,0.2)]'
                : 'border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.2)]'
            }
          `}
        >
          <div
            className="absolute -top-24 w-80 h-80 rounded-full blur-[100px] pointer-events-none"
            style={{
              background: config ? config.glowColor : 'rgba(239,68,68,0.3)',
              opacity: 0.3,
            }}
          />

          {isWin ? (
            <>
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: 'spring' }}
                className={`relative w-28 h-28 sm:w-44 sm:h-44 rounded-full flex items-center justify-center p-3 sm:p-4 shadow-2xl mb-4 sm:mb-6 bg-black/70 border-2
                  ${
                    outcome === 'WIN_BIG'
                      ? 'border-yellow-400 shadow-yellow-500/40 animate-pulse'
                      : outcome === 'WIN_MEDIUM'
                      ? 'border-blue-400/80 shadow-blue-500/30'
                      : 'border-green-400/60 shadow-green-500/20'
                  }
                `}
              >
                <img
                  src={prizeImg}
                  alt={config?.name || 'Premio'}
                  className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)]"
                  onError={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.className = 'text-4xl sm:text-6xl';
                      fallback.innerText = prizeTier === 'big' ? '👑' : prizeTier === 'medium' ? '🔵' : '🟢';
                      parent.appendChild(fallback);
                    }
                  }}
                />
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className={`font-anton text-sm sm:text-lg uppercase tracking-widest mb-1 ${
                  outcome === 'WIN_BIG'
                    ? 'text-yellow-400 text-glow-gold'
                    : outcome === 'WIN_MEDIUM'
                    ? 'text-blue-400 text-glow-blue'
                    : 'text-green-400 text-glow-green'
                }`}
              >
                {config?.bannerText}
              </motion.h3>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className={`font-anton text-2xl sm:text-4xl md:text-5xl uppercase mb-3 sm:mb-5 tracking-wider leading-none ${
                  outcome === 'WIN_BIG' ? 'text-white text-glow-jackpot' : config?.textColor
                }`}
              >
                {config?.subText}
              </motion.h2>

              {securityCode && (
                <div className="mb-4 px-3.5 py-1 bg-black/60 border border-white/10 rounded-full font-orbitron text-[10px] text-gray-400 tracking-widest uppercase">
                  Código: <span className="text-yellow-400 font-bold">{securityCode}</span>
                </div>
              )}
            </>
          ) : (
            <>
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: 'spring' }}
                className="w-24 h-24 sm:w-36 sm:h-36 rounded-full bg-gradient-to-b from-red-950/80 to-black border-2 border-red-500/40 flex items-center justify-center text-4xl sm:text-6xl mb-4 sm:mb-6 shadow-[0_0_25px_rgba(239,68,68,0.2)]"
              >
                🧵
              </motion.div>

              {isNearMiss && (
                <div className="mb-2 px-3 py-1 bg-yellow-950/40 border border-yellow-500/40 rounded-full font-orbitron text-[10px] text-yellow-300 font-bold tracking-widest uppercase">
                  ⚡ ¡Casi te llevas el Premio Mayor! ⚡
                </div>
              )}

              <h3 className="font-anton text-lg sm:text-2xl text-red-400 uppercase tracking-widest mb-1">
                ¡SIGUE PARTICIPANDO!
              </h3>

              <p className="font-sans text-xs sm:text-sm text-gray-300 max-w-xs mb-5 leading-relaxed">
                Gracias por visitar el stand de <span className="text-yellow-400 font-bold">BOOMS LAB</span>. ¡Vuelve a jalar la palanca para intentarlo de nuevo!
              </p>
            </>
          )}

          <div
            className={`h-[2px] w-2/3 mb-4 sm:mb-6 bg-gradient-to-r from-transparent via-white/30 to-transparent ${
              outcome === 'WIN_BIG'
                ? 'via-yellow-400/50'
                : outcome === 'WIN_MEDIUM'
                ? 'via-blue-400/30'
                : outcome === 'WIN_SMALL'
                ? 'via-green-400/30'
                : 'via-red-400/30'
            }`}
          />

          <motion.button
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className={`relative px-8 sm:px-12 py-3 sm:py-4 rounded-full font-black tracking-widest text-xs sm:text-base uppercase cursor-pointer transition-all duration-300 shadow-2xl overflow-hidden border-2
              ${
                outcome === 'WIN_BIG'
                  ? 'bg-gradient-to-b from-yellow-300 via-amber-500 to-yellow-600 text-black border-yellow-200 shadow-yellow-500/30 hover:brightness-110'
                  : outcome === 'WIN_MEDIUM'
                  ? 'bg-gradient-to-b from-blue-400 via-blue-600 to-indigo-700 text-white border-blue-400 shadow-blue-500/25 hover:brightness-110'
                  : outcome === 'WIN_SMALL'
                  ? 'bg-gradient-to-b from-green-400 via-green-600 to-emerald-700 text-white border-green-400 shadow-green-500/20 hover:brightness-110'
                  : 'bg-gradient-to-b from-red-600 via-red-800 to-zinc-900 text-white border-red-500 shadow-red-500/20 hover:brightness-110'
              }
            `}
          >
            {isWin ? 'Reclamar Premio' : 'Volver a Jugar'}
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
