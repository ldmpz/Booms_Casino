import { useCallback, useRef, useState, useEffect } from 'react';
import { type PrizeTier } from '../constants/prizes';

// Audio file paths relative to public directory
const SOUND_PATHS = {
  spin: '/sounds/slot-spin.mp3',
  stop: '/sounds/slot-stop.mp3',
  small: '/sounds/small-win.mp3',
  medium: '/sounds/medium-win.mp3',
  jackpot: '/sounds/jackpot.mp3',
};

export function useAudio() {
  const [muted, setMuted] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('booms_casino_muted');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const spinOscsRef = useRef<{ osc: OscillatorNode; gain: GainNode }[]>([]);
  const isSpinningSynthRef = useRef<boolean>(false);

  // HTML5 Audio elements for real sounds
  const audioElements = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    // Save mute state to localStorage
    localStorage.setItem('booms_casino_muted', JSON.stringify(muted));
  }, [muted]);

  // Lazy initialize AudioContext on user action
  const getAudioContext = (): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      // @ts-ignore
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    }
    // Resume context if suspended (common browser policy)
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Helper to play physical audio file with a synth fallback
  const playSound = useCallback((type: keyof typeof SOUND_PATHS, synthFallback: () => void) => {
    if (muted) return;

    // Initialize HTML5 Audio element if not created yet
    if (!audioElements.current[type]) {
      const audio = new Audio(SOUND_PATHS[type]);
      audio.preload = 'auto';
      audioElements.current[type] = audio;
    }

    const audio = audioElements.current[type];
    
    // Reset playback position
    audio.currentTime = 0;
    
    audio.play()
      .catch((err) => {
        // If file doesn't exist (404) or blocked, run the synth fallback
        console.warn(`Audio file ${SOUND_PATHS[type]} could not be played. Running synth fallback.`, err);
        synthFallback();
      });
  }, [muted]);

  // Synthesize: Spin Sound (repeated retro tick/clack or frequency sweep)
  const startSpinSynth = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx || muted) return;

    if (isSpinningSynthRef.current) return;
    isSpinningSynthRef.current = true;

    // Create a rhythmic "clicking/spinning" sound using a low-frequency pulse
    const spinInterval = setInterval(() => {
      if (!isSpinningSynthRef.current || muted) {
        clearInterval(spinInterval);
        return;
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      // Retro pitch slide down for each slot click
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    }, 120);

    // Store reference to clean up
    // @ts-ignore
    spinOscsRef.current.push({ interval: spinInterval });
  }, [muted]);

  const stopSpinSynth = useCallback(() => {
    isSpinningSynthRef.current = false;
    spinOscsRef.current.forEach((item) => {
      // @ts-ignore
      if (item.interval) {
        // @ts-ignore
        clearInterval(item.interval);
      }
    });
    spinOscsRef.current = [];
  }, []);

  // Play Slot Spin Sound
  const playSpin = useCallback(() => {
    if (muted) return;
    
    // Play physical sound or fallback to synth
    playSound('spin', () => {
      startSpinSynth();
    });
  }, [muted, playSound, startSpinSynth]);

  // Stop Slot Spin Sound
  const stopSpin = useCallback(() => {
    const audio = audioElements.current['spin'];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    stopSpinSynth();
  }, [stopSpinSynth]);

  // Synthesize: Stop Sound (Single mechanical clunk/beep)
  const playStopSynth = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx || muted) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
    osc.frequency.setValueAtTime(110, ctx.currentTime + 0.03); // A2

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.16);
  }, [muted]);

  const playStop = useCallback(() => {
    playSound('stop', playStopSynth);
  }, [playSound, playStopSynth]);

  // Synthesize: Small Win (Retro happy scale)
  const playSmallWinSynth = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx || muted) return;

    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);

      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + idx * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.1);
      osc.stop(ctx.currentTime + idx * 0.1 + 0.3);
    });
  }, [muted]);

  // Synthesize: Medium Win (Arpeggio with filter sweep)
  const playMediumWinSynth = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx || muted) return;

    const notes = [329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // E4, G4, C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.35);
    });
  }, [muted]);

  // Synthesize: Jackpot (Siren and celebratory arpeggios in loop)
  const playJackpotSynth = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx || muted) return;

    const totalDuration = 2.5; // 2.5 seconds of synthesis
    const baseFreqs = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C5 to G6 chord

    // Make a rolling synth pattern
    for (let time = 0; time < totalDuration; time += 0.05) {
      const noteIdx = Math.floor((time / 0.05) % baseFreqs.length);
      const freq = baseFreqs[noteIdx] * (Math.floor(time * 2) % 2 === 0 ? 1 : 1.2); // Alternating octaves/fifths

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + time);
      
      // Vibrato/frequency mod
      osc.frequency.linearRampToValueAtTime(freq * 1.05, ctx.currentTime + time + 0.04);

      gain.gain.setValueAtTime(0, ctx.currentTime + time);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + 0.1);
    }

    // Add a retro sub bass drop
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(100, ctx.currentTime);
    subOsc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + totalDuration);

    subGain.gain.setValueAtTime(0.15, ctx.currentTime);
    subGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + totalDuration);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);

    subOsc.start();
    subOsc.stop(ctx.currentTime + totalDuration);
  }, [muted]);

  // Play Win Sound according to tier
  const playWin = useCallback((tier: PrizeTier) => {
    if (tier === 'small') {
      playSound('small', playSmallWinSynth);
    } else if (tier === 'medium') {
      playSound('medium', playMediumWinSynth);
    } else if (tier === 'big') {
      playSound('jackpot', playJackpotSynth);
    }
  }, [playSound, playSmallWinSynth, playMediumWinSynth, playJackpotSynth]);

  // Toggle Mute
  const toggleMute = useCallback(() => {
    setMuted((prev) => !prev);
  }, []);

  return {
    muted,
    toggleMute,
    playSpin,
    stopSpin,
    playStop,
    playWin,
  };
}
