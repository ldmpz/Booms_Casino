import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Settings, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Reel } from './Reel';
import { PrizeModal } from './PrizeModal';
import { AdminPanel } from './AdminPanel';
import { Lever } from './Lever';
import { PrizeInfoPanel } from './PrizeInfoPanel';
import { GlowBackground, type GlowState } from './GlowBackground';
import { useAudio } from '../hooks/useAudio';
import { determineSpinResult, getGameSettings, type GameSettings, type SpinResult } from '../utils/prizeSelector';
import { type PrizeTier } from '../constants/prizes';

interface BulbPosition {
  id: string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  transform: string;
}

// 13 LED bulbs tracing the top semi-elliptical marquee arch
const MARQUEE_BULBS = Array.from({ length: 13 }).map((_, i) => {
  const angle = (i / 12) * Math.PI;
  const radiusX = 46;
  const radiusY = 78;
  const left = 50 - radiusX * Math.cos(angle);
  const top = 88 - radiusY * Math.sin(angle);
  return { id: `m-${i}`, left: `${left}%`, top: `${top}%`, transform: 'translate(-50%, -50%)' };
});

// LED bulbs around the cabinet frame contour (inlaid along the gold border rim channel)
const REEL_BULBS: BulbPosition[] = [
  // Top Left Shoulder (3 bulbs)
  { id: 'tl-0', top: '3px', left: '3%', transform: 'translate(-50%, -50%)' },
  { id: 'tl-1', top: '3px', left: '10%', transform: 'translate(-50%, -50%)' },
  { id: 'tl-2', top: '3px', left: '17%', transform: 'translate(-50%, -50%)' },

  // Top Right Shoulder (3 bulbs)
  { id: 'tr-0', top: '3px', right: '17%', transform: 'translate(50%, -50%)' },
  { id: 'tr-1', top: '3px', right: '10%', transform: 'translate(50%, -50%)' },
  { id: 'tr-2', top: '3px', right: '3%', transform: 'translate(50%, -50%)' },

  // Left Vertical Edge (7 bulbs down)
  ...Array.from({ length: 7 }).map((_, i) => ({
    id: `l-${i}`,
    left: '3px',
    top: `${14 + (i + 1) * 9.5}%`,
    transform: 'translate(-50%, -50%)',
  })),

  // Right Vertical Edge (7 bulbs down)
  ...Array.from({ length: 7 }).map((_, i) => ({
    id: `r-${i}`,
    right: '3px',
    top: `${14 + (i + 1) * 9.5}%`,
    transform: 'translate(50%, -50%)',
  })),

  // Bottom Edge (11 bulbs across)
  ...Array.from({ length: 11 }).map((_, i) => ({
    id: `b-${i}`,
    bottom: '3px',
    left: `${4 + i * 9.2}%`,
    transform: 'translate(-50%, 50%)',
  })),
];

// Prizes delivered ticker — persisted in localStorage
function getPrizesDelivered() {
  try {
    const data = localStorage.getItem('booms_casino_delivered');
    if (data) return JSON.parse(data) as { small: number; medium: number; big: number };
  } catch { /* ignore */ }
  return { small: 0, medium: 0, big: 0 };
}
function incrementPrizesDelivered(tier: PrizeTier) {
  const current = getPrizesDelivered();
  current[tier]++;
  try { localStorage.setItem('booms_casino_delivered', JSON.stringify(current)); } catch { /* ignore */ }
  return current;
}

export const SlotMachine: React.FC = () => {
  const { muted, toggleMute, playSpin, stopSpin, playStop, playWin } = useAudio();

  // Game states
  const [gameState, setGameState] = useState<'intro' | 'idle' | 'spinning' | 'countdown' | 'showing-prize'>('intro');
  const [glowState, setGlowState] = useState<GlowState>('idle');
  const [settings, setSettings] = useState<GameSettings>(getGameSettings());
  const [currentResult, setCurrentResult] = useState<SpinResult | null>(null);

  // Reel control states
  const [reelsSpinning, setReelsSpinning] = useState([false, false, false]);
  const [reelsStopTriggered, setReelsStopTriggered] = useState([false, false, false]);
  const [reelsStopped, setReelsStopped] = useState([false, false, false]);

  // Special FX states
  const [isShaking, setIsShaking] = useState(false);
  const [showPrizeModal, setShowPrizeModal] = useState(false);

  // Attract mode
  const [isAttract, setIsAttract] = useState(false);
  const attractTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Countdown state (for Big prize only)
  const [countdownValue, setCountdownValue] = useState<number | null>(null);

  // Prizes delivered ticker
  const [deliveredCounts, setDeliveredCounts] = useState(getPrizesDelivered());

  // Admin panel state
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const logoClicksRef = useRef(0);
  const logoClicksTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── INTRO ANIMATION ──────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setGameState('idle'), 2200);
    return () => clearTimeout(t);
  }, []);

  // ── ATTRACT MODE: reset 3s timer on any interaction ─────────────
  const resetAttractTimer = useCallback(() => {
    setIsAttract(false);
    if (attractTimerRef.current) clearTimeout(attractTimerRef.current);
    if (gameState === 'idle') {
      attractTimerRef.current = setTimeout(() => setIsAttract(true), 3000);
    }
  }, [gameState]);

  useEffect(() => {
    resetAttractTimer();
    const events = ['click', 'touchstart', 'keydown', 'mousemove'];
    events.forEach(e => window.addEventListener(e, resetAttractTimer, { passive: true }));
    return () => {
      events.forEach(e => window.removeEventListener(e, resetAttractTimer));
      if (attractTimerRef.current) clearTimeout(attractTimerRef.current);
    };
  }, [resetAttractTimer]);

  // Sync settings after admin changes
  const handleSettingsChanged = useCallback(() => {
    setSettings(getGameSettings());
  }, []);

  // Easter Egg: 5 logo clicks to open admin
  const handleLogoClick = () => {
    logoClicksRef.current += 1;
    if (logoClicksTimeoutRef.current) clearTimeout(logoClicksTimeoutRef.current);
    logoClicksTimeoutRef.current = setTimeout(() => { logoClicksRef.current = 0; }, 2000);
    if (logoClicksRef.current >= 5) { setIsAdminOpen(true); logoClicksRef.current = 0; }
  };

  // ── MAIN SPIN HANDLER ─────────────────────────────────────────────
  const handleSpin = () => {
    if (gameState !== 'idle') return;
    setIsAttract(false);

    const result = determineSpinResult(settings);
    setCurrentResult(result);

    setGameState('spinning');
    setGlowState('spinning');
    setIsShaking(false);
    setReelsStopped([false, false, false]);
    setReelsStopTriggered([false, false, false]);
    setReelsSpinning([true, true, true]);
    playSpin();

    const isSuspense = result.prizeTier === 'big' || result.isNearMiss;
    setTimeout(() => setReelsStopTriggered(prev => [true, prev[1], prev[2]]), 2500);
    setTimeout(() => setReelsStopTriggered(prev => [prev[0], true, prev[2]]), 3000);
    const reel3Delay = isSuspense ? 5500 : 3500;
    setTimeout(() => setReelsStopTriggered(prev => [prev[0], prev[1], true]), reel3Delay);
  };

  // Individual reel stop callbacks
  const handleReelStop = useCallback((index: number) => {
    playStop();
    setReelsStopped(prev => { const n = [...prev]; n[index] = true; return n; });
    setReelsSpinning(prev => { const n = [...prev]; n[index] = false; return n; });
  }, [playStop]);

  // Watch when ALL reels stopped
  useEffect(() => {
    if (gameState === 'spinning' && reelsStopped[0] && reelsStopped[1] && reelsStopped[2]) {
      stopSpin();

      if (currentResult) {
        setGlowState(currentResult.prizeTier);

        if (currentResult.prizeTier === 'big') {
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), 800);

          // Countdown 3-2-1 before modal for Big prize
          setGameState('countdown');
          setCountdownValue(3);
          const doCount = (n: number) => {
            setTimeout(() => {
              setCountdownValue(n - 1);
              if (n - 1 <= 0) {
                setTimeout(() => {
                  setCountdownValue(null);
                  setGameState('showing-prize');
                  setShowPrizeModal(true);
                  setDeliveredCounts(incrementPrizesDelivered(currentResult.prizeTier));
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
            setShowPrizeModal(true);
            setDeliveredCounts(incrementPrizesDelivered(currentResult.prizeTier));
          }, 300);
        }
      }
    }
  }, [reelsStopped, gameState, currentResult, stopSpin]);

  const handleCloseModal = () => {
    setShowPrizeModal(false);
    setGameState('idle');
    setGlowState('idle');
    setCurrentResult(null);
    setReelsStopped([false, false, false]);
    setReelsStopTriggered([false, false, false]);
    setReelsSpinning([false, false, false]);
    stopSpin();
    resetAttractTimer();
  };

  const handlePlayWinAudio = useCallback((tier: PrizeTier) => {
    playWin(tier);
  }, [playWin]);

  const isInteractable = gameState === 'idle';

  return (
    <div
      className={`relative min-h-screen w-full flex flex-col items-center justify-between p-4 md:p-6 select-none overflow-hidden transition-transform duration-100 ${isShaking ? 'animate-shake' : ''}`}
      onClick={resetAttractTimer}
    >
      {/* Dynamic Casino Background */}
      <GlowBackground state={glowState} />

      {/* ── INTRO FADE-IN OVERLAY ───────────────────────────────────── */}
      <AnimatePresence>
        {gameState === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: 'easeOut' }}
            className="absolute inset-0 bg-black z-[100] pointer-events-none flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6, type: 'spring' }}
              className="font-anton text-6xl md:text-8xl text-white tracking-[0.15em] text-center"
              style={{ textShadow: '0 4px 0 #C40018, 0 8px 30px rgba(196,0,24,0.8)' }}
            >
              BOOMS<span className="text-yellow-400">LAB</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── JACKPOT COUNTDOWN OVERLAY ───────────────────────────────── */}
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

      {/* ── ATTRACT MODE OVERLAY ────────────────────────────────────── */}
      <AnimatePresence>
        {isAttract && (
          <motion.div
            key="attract"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-[80] flex items-center justify-center pointer-events-none p-4"
          >
            <motion.div
              animate={{ y: [0, -10, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative font-anton text-4xl md:text-6xl text-red-500 text-center tracking-widest uppercase px-8 md:px-12 py-6 md:py-8 rounded-3xl backdrop-blur-md flex flex-col items-center gap-3"
              style={{
                background: 'radial-gradient(circle at 50% 50%, rgba(45, 6, 8, 0.96) 0%, rgba(10, 1, 2, 0.98) 100%)',
                border: '4px solid #ef4444',
                textShadow: '0 0 20px rgba(239,68,68,1), 0 0 40px rgba(239,68,68,0.7), 0 4px 8px rgba(0,0,0,0.9)',
                boxShadow: '0 0 60px rgba(239,68,68,0.65), inset 0 0 30px rgba(239,68,68,0.25), 0 20px 50px rgba(0,0,0,0.9)',
              }}
            >
              <div className="flex items-center justify-center gap-4">
                <span className="text-4xl md:text-5xl animate-bounce">🧵</span>
                <span>¡JALA LA PALANCA<br />PARA JUGAR!</span>
                <span className="text-4xl md:text-5xl animate-bounce">🪡</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SETTINGS GEAR (hidden) ───────────────────────────────────── */}
      <button
        onClick={() => setIsAdminOpen(true)}
        className="absolute top-4 left-4 p-2 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white transition-all cursor-pointer opacity-20 hover:opacity-100 z-30"
        title="Settings"
      >
        <Settings className="w-4 h-4" />
      </button>

      {/* ── TOP HEADER ──────────────────────────────────────────────── */}
      <header className="relative w-full max-w-5xl flex items-center justify-between z-10 pt-2 pb-4">
        {/* Left: Guaranteed Prizes Badge */}
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full border-2 border-yellow-500/60 bg-gradient-to-r from-black via-zinc-950 to-black backdrop-blur-md shadow-[0_4px_25px_rgba(0,0,0,0.8),0_0_20px_rgba(234,179,8,0.25)]">
          <div className="p-1.5 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 shadow-md animate-pulse">
            <Trophy className="w-4 h-4 text-black" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[9px] leading-none text-yellow-300 font-black uppercase tracking-widest gold-text-glow">Premios Garantizados</span>
            <span className="text-[11px] leading-none text-white font-extrabold uppercase tracking-wide">¡Todos Ganan!</span>
          </div>
        </div>

        {/* Right: Audio Toggle */}
        <button
          onClick={toggleMute}
          className="p-3 rounded-full border-2 border-yellow-500/60 bg-gradient-to-b from-amber-900/90 via-black to-yellow-950/90 text-yellow-400 hover:text-yellow-200 hover:border-yellow-400 transition-all cursor-pointer shadow-[0_6px_20px_rgba(0,0,0,0.8),0_0_15px_rgba(234,179,8,0.3)] active:scale-95 backdrop-blur-md"
          title={muted ? 'Activar sonido' : 'Silenciar'}
        >
          {muted ? <VolumeX className="w-5 h-5 text-gray-400" /> : <Volume2 className="w-5 h-5 text-yellow-300 animate-pulse" />}
        </button>
      </header>

      {/* ── SLOT MACHINE CABINET ────────────────────────────────────── */}
      <main className="relative w-full max-w-4xl flex-1 flex flex-col items-center justify-center z-10 py-4 md:py-8">

        {/* Outer Gold & Platinum 3D Chassis Border */}
        <div className={`relative w-full p-[6px] rounded-[56px] bg-gold-metallic shadow-[0_35px_90px_rgba(0,0,0,0.98),0_0_60px_rgba(234,179,8,0.35)] transition-all duration-300 ${isAttract ? 'shadow-[0_0_90px_rgba(250,204,21,0.6),0_35px_90px_rgba(0,0,0,0.98)]' : ''}`}>

          {/* Main Royal Crimson Cabinet Body */}
          <div className="relative w-full bg-crimson-velvet rounded-[50px] p-6 md:p-8 border-2 border-yellow-400/50 shadow-[inset_0_4px_16px_rgba(255,255,255,0.4),inset_0_-10px_20px_rgba(0,0,0,0.85)]">

            {/* Brass Corner Rivets */}
            <div className="absolute top-4 left-5 w-3 h-3 rounded-full bg-gradient-to-tr from-amber-700 via-yellow-400 to-amber-200 border border-black/80 shadow-md" />
            <div className="absolute top-4 right-5 w-3 h-3 rounded-full bg-gradient-to-tr from-amber-700 via-yellow-400 to-amber-200 border border-black/80 shadow-md" />
            <div className="absolute bottom-4 left-5 w-3 h-3 rounded-full bg-gradient-to-tr from-amber-700 via-yellow-400 to-amber-200 border border-black/80 shadow-md" />
            <div className="absolute bottom-4 right-5 w-3 h-3 rounded-full bg-gradient-to-tr from-amber-700 via-yellow-400 to-amber-200 border border-black/80 shadow-md" />

            {/* Inner Chrome Bevel highlight */}
            <div className="absolute inset-2 border border-yellow-200/30 rounded-[44px] pointer-events-none" />

            {/* LOGO MARQUEE ARCH */}
            <div className="absolute top-[-120px] md:top-[-145px] left-1/2 -translate-x-1/2 w-[360px] md:w-[460px] h-[140px] md:h-[165px] z-20 flex flex-col items-center justify-center pt-2 md:pt-4 select-none pointer-events-none">
              
              {/* Outer Arch Gold Frame */}
              <div 
                className="absolute inset-0 p-[5px] bg-gold-metallic shadow-[0_15px_35px_rgba(0,0,0,0.95),0_0_25px_rgba(234,179,8,0.4)]"
                style={{ borderRadius: '135px 135px 0 0' }}
              >
                {/* Inner Crimson Arch Dome */}
                <div 
                  className="w-full h-full bg-gradient-to-b from-[#c40018] via-[#e6001a] to-[#78000b] border border-yellow-300/50 relative shadow-[inset_0_6px_12px_rgba(255,255,255,0.4)]"
                  style={{ borderRadius: '130px 130px 0 0' }}
                />
              </div>

              {/* Logo marquee 3D warm bulbs */}
              {MARQUEE_BULBS.map((bulb, i) => (
                <div
                  key={bulb.id}
                  className={`absolute w-3.5 h-3.5 md:w-4 md:h-4 rounded-full z-25 ${
                    gameState === 'spinning'
                      ? (i % 2 === 0 ? 'animate-bulb-3d-fast-odd' : 'animate-bulb-3d-fast-even')
                      : (i % 2 === 0 ? 'animate-bulb-3d-odd' : 'animate-bulb-3d-even')
                  }`}
                  style={{ left: bulb.left, top: bulb.top, transform: bulb.transform }}
                />
              ))}

              {/* BOOMS LAB Logo — Royal Anton font */}
              <div
                onClick={handleLogoClick}
                className="relative z-10 flex flex-col items-center justify-center cursor-pointer pointer-events-auto group"
              >
                <h1
                  className="font-anton text-4xl md:text-5xl tracking-[0.24em] text-white text-center select-none transform group-hover:scale-105 transition-transform"
                  style={{ 
                    textShadow: '0 3px 0 #85000d, 0 6px 0 #4a0007, 0 8px 25px rgba(0,0,0,0.95), 0 0 30px rgba(250,204,21,0.5)'
                  }}
                >
                  BOOMS<span className="text-yellow-400">LAB</span>
                </h1>
              </div>
            </div>

            {/* CHASSIS LED BULBS */}
            {REEL_BULBS.map((bulb, i) => (
              <div
                key={bulb.id}
                className={`absolute w-3.5 h-3.5 md:w-4 md:h-4 rounded-full z-15 ${
                  gameState === 'spinning'
                    ? (i % 2 === 0 ? 'animate-bulb-3d-fast-odd' : 'animate-bulb-3d-fast-even')
                    : (i % 2 === 0 ? 'animate-bulb-3d-odd' : 'animate-bulb-3d-even')
                }`}
                style={{ top: bulb.top, bottom: bulb.bottom, left: bulb.left, right: bulb.right, transform: bulb.transform }}
              />
            ))}

            {/* LEVER */}
            <Lever onPull={handleSpin} disabled={!isInteractable} />

            {/* INNER REELS VAULT CABINET */}
            <div className="relative bg-gradient-to-b from-[#1b080a] via-[#080203] to-[#1b080a] p-4 md:p-6 rounded-[32px] border-4 border-yellow-500/80 inset-bevel-dark shadow-[inset_0_16px_35px_rgba(0,0,0,0.98),0_10px_30px_rgba(0,0,0,0.9),0_0_25px_rgba(234,179,8,0.2)]">
              <div className="grid grid-cols-3 gap-3 md:gap-5">
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

              {/* SUERTE / GIRANDO / NEAR MISS badge */}
              <div className="absolute top-[-14px] left-1/2 -translate-x-1/2 bg-gradient-to-r from-black via-amber-950/90 to-black border-2 border-yellow-400 px-6 py-1 rounded-full z-25 shadow-[0_6px_16px_rgba(0,0,0,0.95),0_0_18px_rgba(234,179,8,0.4)] flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shadow-[0_0_10px_#ef4444]" />
                <span className="font-orbitron text-[9px] md:text-[11px] text-yellow-300 font-black uppercase tracking-[0.3em] gold-text-glow">
                  {gameState === 'spinning'
                    ? '¡GIRANDO!'
                    : isAttract
                    ? '¡JUEGA AHORA!'
                    : '¡SUERTE!'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM PRIZE INFO PANELS */}
        <PrizeInfoPanel />
      </main>

      {/* FOOTER — inventory stats */}
      <footer className="relative w-full max-w-5xl flex flex-col items-center justify-center z-10 py-2">
        {settings.mode === 'inventory' && gameState === 'idle' && (
          <div className="mt-3 flex items-center gap-1.5 px-3 py-1 bg-black/80 border border-yellow-500/30 rounded-full font-orbitron text-[9px] text-yellow-300 font-bold tracking-widest uppercase backdrop-blur-sm shadow-md">
            <span>Stand Stock</span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-white/60">
              (G: {settings.inventory.big} | M: {settings.inventory.medium} | C: {settings.inventory.small})
            </span>
          </div>
        )}
      </footer>

      {/* PRIZE MODAL */}
      <PrizeModal
        prizeTier={currentResult ? currentResult.prizeTier : null}
        winningImage={currentResult ? currentResult.reelsOutcome[2] : null}
        isNearMiss={currentResult?.isNearMiss ?? false}
        isOpen={showPrizeModal}
        onClose={handleCloseModal}
        onPlayWinAudio={handlePlayWinAudio}
      />

      {/* ADMIN PANEL */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onSettingsChanged={handleSettingsChanged}
      />
    </div>
  );
};
export default SlotMachine;
