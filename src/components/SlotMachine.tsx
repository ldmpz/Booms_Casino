import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Settings, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Reel } from './Reel';
import { Lever } from './Lever';
import { MarqueeArch } from './slot/MarqueeArch';
import { ResultOverlay } from './slot/ResultOverlay';
import { GlowBackground, type GlowState } from './GlowBackground';
import { PrizeInfoPanel } from './PrizeInfoPanel';
import { AdminDashboard } from '../admin/AdminDashboard';
import { GameEngine } from '../engine/GameEngine';
import { AudioManager } from '../engine/AudioManager';
import type { CalculatedOutcome } from '../engine/PrizeEngine';

interface BulbPosition {
  id: string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  transform: string;
}

const REEL_BULBS: BulbPosition[] = [
  { id: 'tl-0', top: '3px', left: '3%', transform: 'translate(-50%, -50%)' },
  { id: 'tl-1', top: '3px', left: '10%', transform: 'translate(-50%, -50%)' },
  { id: 'tl-2', top: '3px', left: '17%', transform: 'translate(-50%, -50%)' },
  { id: 'tr-0', top: '3px', right: '17%', transform: 'translate(50%, -50%)' },
  { id: 'tr-1', top: '3px', right: '10%', transform: 'translate(50%, -50%)' },
  { id: 'tr-2', top: '3px', right: '3%', transform: 'translate(50%, -50%)' },
  ...Array.from({ length: 7 }).map((_, i) => ({ id: `l-${i}`, left: '3px', top: `${14 + (i + 1) * 9.5}%`, transform: 'translate(-50%, -50%)' })),
  ...Array.from({ length: 7 }).map((_, i) => ({ id: `r-${i}`, right: '3px', top: `${14 + (i + 1) * 9.5}%`, transform: 'translate(50%, -50%)' })),
  ...Array.from({ length: 11 }).map((_, i) => ({ id: `b-${i}`, bottom: '3px', left: `${4 + i * 9.2}%`, transform: 'translate(-50%, 50%)' })),
];

export const SlotMachine: React.FC = () => {
  const gameEngine = GameEngine.getInstance();
  const audioManager = AudioManager.getInstance();

  const [gameState, setGameState] = useState<'intro' | 'idle' | 'spinning' | 'countdown' | 'showing-prize'>('intro');
  const [glowState, setGlowState] = useState<GlowState>('idle');
  const [currentResult, setCurrentResult] = useState<CalculatedOutcome | null>(null);
  const [muted, setMuted] = useState(audioManager.isMuted());

  const [reelsSpinning, setReelsSpinning] = useState([false, false, false]);
  const [reelsStopTriggered, setReelsStopTriggered] = useState([false, false, false]);
  const [reelsStopped, setReelsStopped] = useState([false, false, false]);
  const [isShaking, setIsShaking] = useState(false);
  const [showResultOverlay, setShowResultOverlay] = useState(false);
  const [isAttract, setIsAttract] = useState(false);
  const attractTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const logoClicksRef = useRef(0);
  const logoClicksTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setGameState('idle'), 2200);
    return () => clearTimeout(t);
  }, []);

  const resetAttractTimer = useCallback(() => {
    setIsAttract(false);
    if (attractTimerRef.current) clearTimeout(attractTimerRef.current);
    if (gameState === 'idle') {
      attractTimerRef.current = setTimeout(() => setIsAttract(true), 3500);
    }
  }, [gameState]);

  useEffect(() => {
    resetAttractTimer();
    const events = ['click', 'touchstart', 'keydown', 'mousemove'];
    events.forEach((e) => window.addEventListener(e, resetAttractTimer, { passive: true }));
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetAttractTimer));
      if (attractTimerRef.current) clearTimeout(attractTimerRef.current);
    };
  }, [resetAttractTimer]);

  const handleLogoClick = () => {
    logoClicksRef.current += 1;
    if (logoClicksTimeoutRef.current) clearTimeout(logoClicksTimeoutRef.current);
    logoClicksTimeoutRef.current = setTimeout(() => {
      logoClicksRef.current = 0;
    }, 2000);
    if (logoClicksRef.current >= 5) {
      setIsAdminOpen(true);
      logoClicksRef.current = 0;
    }
  };

  const handleToggleMute = () => {
    const isNowMuted = audioManager.toggleMute();
    setMuted(isNowMuted);
  };

  const handleSpin = () => {
    if (gameState !== 'idle') return;
    audioManager.playButtonClick();
    setIsAttract(false);

    const result = gameEngine.playTurn();
    setCurrentResult(result);

    setGameState('spinning');
    setGlowState('spinning');
    setIsShaking(false);

    setReelsStopped([false, false, false]);
    setReelsStopTriggered([false, false, false]);
    setReelsSpinning([true, true, true]);

    audioManager.playSpin();

    const baseDelay = 2500;
    const isSuspense = result.outcome === 'WIN_BIG' || result.isNearMiss;
    const reel3Delay = isSuspense ? 4500 : 3300;

    setTimeout(() => setReelsStopTriggered((prev) => [true, prev[1], prev[2]]), baseDelay);
    setTimeout(() => setReelsStopTriggered((prev) => [prev[0], true, prev[2]]), baseDelay + 400);
    setTimeout(() => setReelsStopTriggered((prev) => [prev[0], prev[1], true]), reel3Delay);
  };

  const handleReelStop = useCallback(
    (index: number) => {
      audioManager.playReelStop();
      setReelsStopped((prev) => {
        const n = [...prev];
        n[index] = true;
        return n;
      });
      setReelsSpinning((prev) => {
        const n = [...prev];
        n[index] = false;
        return n;
      });
    },
    [audioManager]
  );

  useEffect(() => {
    if (gameState === 'spinning' && reelsStopped[0] && reelsStopped[1] && reelsStopped[2]) {
      audioManager.stopSpin();

      if (currentResult) {
        setGlowState(currentResult.prizeTier || 'idle');

        if (currentResult.outcome === 'WIN_BIG') {
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), 800);
          setGameState('countdown');
          setCountdownValue(3);

          const doCount = (n: number) => {
            setTimeout(() => {
              setCountdownValue(n - 1);
              if (n - 1 <= 0) {
                setTimeout(() => {
                  setCountdownValue(null);
                  setGameState('showing-prize');
                  setShowResultOverlay(true);
                }, 600);
              } else {
                doCount(n - 1);
              }
            }, 900);
          };
          doCount(3);
        } else {
          setTimeout(() => {
            setGameState('showing-prize');
            setShowResultOverlay(true);
          }, 300);
        }
      }
    }
  }, [reelsStopped, gameState, currentResult, audioManager]);

  const handleCloseOverlay = () => {
    setShowResultOverlay(false);
    setGameState('idle');
    setGlowState('idle');
    setCurrentResult(null);
    setReelsStopped([false, false, false]);
    setReelsStopTriggered([false, false, false]);
    setReelsSpinning([false, false, false]);
    audioManager.stopSpin();
    resetAttractTimer();
  };

  const isInteractable = gameState === 'idle';

  return (
    <div
      className={`relative min-h-[100dvh] w-full flex flex-col items-center justify-between p-2 sm:p-4 md:p-6 select-none overflow-x-hidden transition-transform duration-100 ${
        isShaking ? 'animate-shake' : ''
      }`}
      onClick={resetAttractTimer}
    >
      <GlowBackground state={glowState} />

      <AnimatePresence>
        {gameState === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: 'easeOut' }}
            className="absolute inset-0 bg-black z-[100] pointer-events-none flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6, type: 'spring' }}
              className="font-anton text-4xl sm:text-6xl md:text-8xl text-white tracking-[0.15em] text-center"
              style={{ textShadow: '0 4px 0 #C40018, 0 8px 30px rgba(196,0,24,0.8)' }}
            >
              BOOMS<span className="text-yellow-400">LAB</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {gameState === 'countdown' && countdownValue !== null && countdownValue > 0 && (
          <motion.div
            key={`countdown-${countdownValue}`}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: 0.4, type: 'spring', stiffness: 300 }}
            className="fixed inset-0 z-[90] flex items-center justify-center pointer-events-none"
          >
            <div className="font-anton text-[20vw] leading-none text-yellow-400 drop-shadow-[0_0_60px_rgba(250,204,21,0.9)]">
              {countdownValue}
            </div>
          </motion.div>
        )}
        {gameState === 'countdown' && countdownValue === 0 && (
          <motion.div
            key="jackpot-text"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="fixed inset-0 z-[90] flex items-center justify-center pointer-events-none"
          >
            <div className="font-anton text-[10vw] leading-none text-yellow-300 text-center drop-shadow-[0_0_80px_rgba(250,204,21,1)]">
              ¡¡JACKPOT!!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAttract && (
          <motion.div
            key="attract"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-[80] flex items-center justify-center pointer-events-none p-2 sm:p-4"
          >
            <motion.div
              animate={{ y: [0, -10, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative max-w-[78vw] sm:max-w-md md:max-w-xl font-anton text-lg sm:text-3xl md:text-5xl text-red-500 text-center tracking-widest uppercase px-3 sm:px-6 md:px-10 py-2.5 sm:py-5 md:py-7 rounded-2xl sm:rounded-3xl backdrop-blur-md flex flex-col items-center gap-1.5 sm:gap-3"
              style={{
                background: 'radial-gradient(circle at 50% 50%, rgba(45, 6, 8, 0.96) 0%, rgba(10, 1, 2, 0.98) 100%)',
                border: '3px solid #ef4444',
                textShadow: '0 0 20px rgba(239,68,68,1), 0 0 40px rgba(239,68,68,0.7), 0 4px 8px rgba(0,0,0,0.9)',
                boxShadow: '0 0 60px rgba(239,68,68,0.65), inset 0 0 30px rgba(239,68,68,0.25), 0 20px 50px rgba(0,0,0,0.9)',
              }}
            >
              <div className="flex items-center justify-center gap-2 sm:gap-4">
                <span className="text-2xl sm:text-4xl md:text-5xl animate-bounce">🧵</span>
                <span>¡JALA LA PALANCA<br />PARA JUGAR!</span>
                <span className="text-2xl sm:text-4xl md:text-5xl animate-bounce">🪡</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsAdminOpen(true)}
        className="absolute top-3 left-3 p-2 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white transition-all cursor-pointer opacity-20 hover:opacity-100 z-30"
        title="Panel Administrador"
      >
        <Settings className="w-4 h-4" />
      </button>

      <header className="relative w-full max-w-5xl flex items-center justify-between z-10 pt-1 sm:pt-2 pb-2 sm:pb-4 px-1">
        <div className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border-2 border-yellow-500/60 bg-gradient-to-r from-black via-zinc-950 to-black backdrop-blur-md shadow-[0_4px_25px_rgba(0,0,0,0.8),0_0_20px_rgba(234,179,8,0.25)]">
          <div className="p-1 sm:p-1.5 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 shadow-md animate-pulse">
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[8px] sm:text-[9px] leading-none text-yellow-300 font-black uppercase tracking-widest gold-text-glow">
              BOOMS LAB EXPO
            </span>
            <span className="text-[9px] sm:text-[11px] leading-none text-white font-extrabold uppercase tracking-wide">
              ¡Gran Sorteo de Exposición!
            </span>
          </div>
        </div>

        <button
          onClick={handleToggleMute}
          className="p-2 sm:p-3 rounded-full border-2 border-yellow-500/60 bg-gradient-to-b from-amber-900/90 via-black to-yellow-950/90 text-yellow-400 hover:text-yellow-200 hover:border-yellow-400 transition-all cursor-pointer shadow-[0_6px_20px_rgba(0,0,0,0.8),0_0_15px_rgba(234,179,8,0.3)] active:scale-95 backdrop-blur-md"
          title={muted ? 'Activar sonido' : 'Silenciar'}
        >
          {muted ? (
            <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          ) : (
            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 animate-pulse" />
          )}
        </button>
      </header>

      <main className="relative w-full max-w-4xl flex-1 flex flex-col items-center justify-center z-10 py-2 sm:py-4 md:py-8 pr-10 sm:pr-14 md:pr-16 pl-2 sm:pl-4 md:pl-6">
        <div
          className={`relative w-full p-1 sm:p-1.5 md:p-[6px] rounded-[36px] sm:rounded-[48px] md:rounded-[56px] bg-gold-metallic shadow-[0_35px_90px_rgba(0,0,0,0.98),0_0_60px_rgba(234,179,8,0.35)] transition-all duration-300 ${
            isAttract ? 'shadow-[0_0_90px_rgba(250,204,21,0.6),0_35px_90px_rgba(0,0,0,0.98)]' : ''
          }`}
        >
          <div className="relative w-full bg-crimson-velvet rounded-[32px] sm:rounded-[42px] md:rounded-[50px] p-3 sm:p-6 md:p-8 border-2 border-yellow-400/50 shadow-[inset_0_4px_16px_rgba(255,255,255,0.4),inset_0_-10px_20px_rgba(0,0,0,0.85)]">
            <div className="absolute top-2.5 sm:top-4 left-3 sm:left-5 w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-gradient-to-tr from-amber-700 via-yellow-400 to-amber-200 border border-black/80 shadow-md" />
            <div className="absolute top-2.5 sm:top-4 right-3 sm:right-5 w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-gradient-to-tr from-amber-700 via-yellow-400 to-amber-200 border border-black/80 shadow-md" />
            <div className="absolute bottom-2.5 sm:bottom-4 left-3 sm:left-5 w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-gradient-to-tr from-amber-700 via-yellow-400 to-amber-200 border border-black/80 shadow-md" />
            <div className="absolute bottom-2.5 sm:bottom-4 right-3 sm:right-5 w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-gradient-to-tr from-amber-700 via-yellow-400 to-amber-200 border border-black/80 shadow-md" />
            <div className="absolute inset-1.5 sm:inset-2 border border-yellow-200/30 rounded-[28px] sm:rounded-[38px] md:rounded-[44px] pointer-events-none" />

            <MarqueeArch isSpinning={gameState === 'spinning'} onLogoClick={handleLogoClick} />

            {REEL_BULBS.map((bulb, i) => (
              <div
                key={bulb.id}
                className={`absolute w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 rounded-full z-15 ${
                  gameState === 'spinning'
                    ? i % 2 === 0
                      ? 'animate-bulb-3d-fast-odd'
                      : 'animate-bulb-3d-fast-even'
                    : i % 2 === 0
                    ? 'animate-bulb-3d-odd'
                    : 'animate-bulb-3d-even'
                }`}
                style={{ top: bulb.top, bottom: bulb.bottom, left: bulb.left, right: bulb.right, transform: bulb.transform }}
              />
            ))}

            <Lever onPull={handleSpin} disabled={!isInteractable} />

            <div className="relative bg-gradient-to-b from-[#1b080a] via-[#080203] to-[#1b080a] p-2 sm:p-4 md:p-6 rounded-[22px] sm:rounded-[32px] border-2 sm:border-4 border-yellow-500/80 inset-bevel-dark shadow-[inset_0_16px_35px_rgba(0,0,0,0.98),0_10px_30px_rgba(0,0,0,0.9),0_0_25px_rgba(234,179,8,0.2)]">
              <div className="grid grid-cols-3 gap-1.5 sm:gap-3 md:gap-5">
                {[0, 1, 2].map((idx) => (
                  <Reel
                    key={idx}
                    id={idx}
                    targetImage={currentResult ? currentResult.reelsOutcome[idx] : null}
                    isSpinning={reelsSpinning[idx]}
                    stopTriggered={reelsStopTriggered[idx]}
                    onStop={() => handleReelStop(idx)}
                  />
                ))}
              </div>

              <div className="absolute top-[-12px] sm:top-[-14px] left-1/2 -translate-x-1/2 bg-gradient-to-r from-black via-amber-950/90 to-black border sm:border-2 border-yellow-400 px-3 sm:px-6 py-0.5 sm:py-1 rounded-full z-25 shadow-[0_6px_16px_rgba(0,0,0,0.95),0_0_18px_rgba(234,179,8,0.4)] flex items-center gap-1.5 sm:gap-2.5">
                <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-red-500 animate-ping shadow-[0_0_10px_#ef4444]" />
                <span className="font-orbitron text-[8px] sm:text-[9px] md:text-[11px] text-yellow-300 font-black uppercase tracking-[0.25em] sm:tracking-[0.3em] gold-text-glow">
                  {gameState === 'spinning' ? '¡GIRANDO!' : isAttract ? '¡JUEGA AHORA!' : '¡SUERTE!'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <PrizeInfoPanel />
      </main>

      <ResultOverlay
        isOpen={showResultOverlay}
        outcome={currentResult ? currentResult.outcome : null}
        prizeTier={currentResult ? currentResult.prizeTier : null}
        winningImage={currentResult ? currentResult.reelsOutcome[2] : null}
        isNearMiss={currentResult?.isNearMiss ?? false}
        securityCode={currentResult ? currentResult.securityCode : null}
        onClose={handleCloseOverlay}
      />

      <AdminDashboard isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
    </div>
  );
};

export default SlotMachine;
