import type { PrizeTier } from '../types/engine';

export class AudioManager {
  private static instance: AudioManager;
  private muted: boolean = false;
  private audioCtx: AudioContext | null = null;
  private isSpinningSynth: boolean = false;
  private spinInterval: ReturnType<typeof setInterval> | null = null;

  // HTML5 Audio elements
  private bgAudio: HTMLAudioElement | null = null;
  private winAudio: HTMLAudioElement | null = null;

  // Control de estado
  private bgStarted: boolean = false;

  private constructor() {
    try {
      const saved = localStorage.getItem('booms_casino_muted');
      if (saved) this.muted = JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    this.initAudioElements();
  }

  private initAudioElements(): void {
    if (typeof window === 'undefined') return;

    // 1. Musica de Fondo ambiental constante (/Audio/Ganador.mp3)
    this.bgAudio = new Audio('/Audio/Ganador.mp3');
    this.bgAudio.loop = true;
    this.bgAudio.volume = 0.5;

    // 2. Musica de Ganador en victoria (/Audio/Fondo.mp3)
    this.winAudio = new Audio('/Audio/Fondo.mp3');
    this.winAudio.loop = true;
    this.winAudio.volume = 0.85;
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    try {
      localStorage.setItem('booms_casino_muted', JSON.stringify(this.muted));
    } catch (e) {
      console.error(e);
    }

    if (this.muted) {
      this.stopAllAudio();
    } else {
      this.startBackground();
    }
    return this.muted;
  }

  /** Detiene absolutamente todos los audios en reproducción */
  public stopAllAudio(): void {
    this.stopSpin();
    if (this.bgAudio) {
      this.bgAudio.pause();
    }
    if (this.winAudio) {
      this.winAudio.pause();
      this.winAudio.currentTime = 0;
    }
  }

  // ── Background Music ─────────────────────────────────────────────────────────

  /** Reproduce la música de fondo al volumen normal (0.5) */
  public startBackground(): void {
    if (this.muted || !this.bgAudio) return;

    if (this.winAudio && !this.winAudio.paused) return;

    if (this.winAudio) {
      this.winAudio.pause();
      this.winAudio.currentTime = 0;
    }

    this.bgAudio.volume = 0.5;
    if (this.bgStarted && !this.bgAudio.paused) return;

    this.bgStarted = true;
    this.bgAudio.play().catch(() => {
      this.bgStarted = false;
    });
  }

  public pauseBackground(): void {
    if (this.bgAudio) {
      this.bgAudio.pause();
    }
  }

  public resumeBackground(): void {
    if (this.muted || !this.bgStarted) return;
    this.startBackground();
  }

  public stopBackground(): void {
    if (this.bgAudio) {
      this.bgAudio.pause();
      this.bgAudio.currentTime = 0;
    }
    this.bgStarted = false;
  }

  // ── Winner Music ─────────────────────────────────────────────────────────────

  /** Se ejecuta ÚNICAMENTE al mostrar la pantalla de victoria */
  public playWin(tier: PrizeTier | null): void {
    if (this.muted || !tier || !this.winAudio) return;

    // 1. Pausar COMPLETAMENTE la música de fondo para que no se mezcle
    this.pauseBackground();

    // 2. Reproducir únicamente la música de ganador en bucle continuo
    this.winAudio.pause();
    this.winAudio.currentTime = 0;
    this.winAudio.play().catch((err) => {
      console.warn('Error al reproducir audio de ganador:', err);
      this.startBackground();
    });
  }

  /** Detiene la música de ganador (al presionar Reclamar Premio) y vuelve a la música de fondo */
  public stopWinnerAudio(): void {
    if (this.winAudio) {
      this.winAudio.pause();
      this.winAudio.currentTime = 0;
    }
    this.startBackground();
  }

  // ── Web Audio Synth FX & Volume Ducking ──────────────────────────────────────

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      // @ts-ignore
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /** Al tirar de la palanca: atenia la música de fondo y activa el traqueteo de la máquina */
  public playSpin(): void {
    if (this.muted) return;

    // Atenuar música de fondo a 0.15 para que resalten los efectos mecánicos
    if (this.bgAudio && !this.bgAudio.paused) {
      this.bgAudio.volume = 0.15;
    }

    const ctx = this.getAudioContext();
    if (!ctx) return;

    if (this.isSpinningSynth) return;
    this.isSpinningSynth = true;

    let tickCount = 0;
    this.spinInterval = setInterval(() => {
      if (!this.isSpinningSynth || this.muted) {
        if (this.spinInterval) clearInterval(this.spinInterval);
        return;
      }

      tickCount++;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = tickCount % 2 === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(280 + (tickCount % 3) * 40, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.05);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, now);
      filter.Q.setValueAtTime(2.0, now);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.05);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);

      const humOsc = ctx.createOscillator();
      const humGain = ctx.createGain();
      humOsc.type = 'sine';
      humOsc.frequency.setValueAtTime(90, now);
      humGain.gain.setValueAtTime(0.08, now);
      humGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      humOsc.connect(humGain);
      humGain.connect(ctx.destination);
      humOsc.start(now);
      humOsc.stop(now + 0.06);
    }, 70);
  }

  public stopSpin(): void {
    this.isSpinningSynth = false;
    if (this.spinInterval) {
      clearInterval(this.spinInterval);
      this.spinInterval = null;
    }
  }

  /** Golpe mecánico al detener cada tarjeta / rodillo */
  public playReelStop(): void {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    const thud = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thud.type = 'sine';
    thud.frequency.setValueAtTime(180, now);
    thud.frequency.exponentialRampToValueAtTime(35, now + 0.12);
    thudGain.gain.setValueAtTime(0.45, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    thud.connect(thudGain);
    thudGain.connect(ctx.destination);
    thud.start(now);
    thud.stop(now + 0.13);

    const click = ctx.createOscillator();
    const clickGain = ctx.createGain();
    click.type = 'square';
    click.frequency.setValueAtTime(650, now);
    click.frequency.exponentialRampToValueAtTime(120, now + 0.04);
    clickGain.gain.setValueAtTime(0.25, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    click.connect(clickGain);
    clickGain.connect(ctx.destination);
    click.start(now);
    click.stop(now + 0.06);
  }

  public playButtonClick(): void {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.exponentialRampToValueAtTime(250, now + 0.08);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  /** Al perder: se restaura el volumen normal de la música de fondo */
  public playLose(): void {
    if (this.muted) return;

    // Restablecer el volumen de la música de fondo a 0.5
    if (this.bgAudio) {
      this.bgAudio.volume = 0.5;
    }

    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [400, 350, 300, 250];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      gain.gain.setValueAtTime(0.2, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.13);
    });
  }
}
