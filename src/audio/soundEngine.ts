/**
 * Sonido de la invitación, sintetizado en vivo con Web Audio (sin archivos ni licencias):
 * - pageTurn(): hoja de papel que se pasa (ruido filtrado con "crujidos")
 * - celebrate(): golpe de cañón de confeti + campanitas que brillan
 * - startMusic()/stopMusic(): pieza instrumental tenue (arpa, cuerdas, bajo) en bucle
 *
 * Los navegadores sólo permiten sonido después de un gesto de la persona, así que el
 * contexto se desbloquea en el primer toque, clic o tecla.
 */

import { AUDIO } from '../content';

type Listener = () => void;

const STORAGE_KEY = 'invitacion-sonido-silenciado';
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

// Re mayor, cálido: Dmaj9 · Bm9 · Gmaj9 · A6/9 (dos compases cada uno)
const CHORDS = [
  { bass: 38, tones: [62, 66, 69, 73, 76] },
  { bass: 35, tones: [62, 66, 69, 71, 74] },
  { bass: 31, tones: [62, 67, 71, 74, 78] },
  { bass: 33, tones: [61, 64, 69, 71, 76] }
];
const BPM = 66;
const EIGHTH = 60 / BPM / 2;
const STEPS_PER_CHORD = 16;
// recorrido del arpegio por las notas del acorde (los índices altos suben de octava)
const ARP = [0, 2, 4, 2, 1, 3, 5, 3, 0, 2, 4, 6, 5, 3, 2, 1];
const MUSIC_LEVEL = 0.55;

function readMuted() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private sfx!: GainNode;
  private music!: GainNode;
  private wet!: GainNode;
  private noise!: AudioBuffer;
  private track: HTMLAudioElement | null = null;
  private muted = readMuted();
  private wantMusic = false;
  private musicTimer = 0;
  private nextTime = 0;
  private step = 0;
  private listeners = new Set<Listener>();
  private armed = false;

  /** Escucha el primer gesto de la persona para poder reproducir sonido después. */
  arm() {
    if (this.armed || typeof window === 'undefined') return;
    this.armed = true;
    const unlock = () => this.unlock();
    for (const type of ['pointerdown', 'pointerup', 'touchend', 'keydown', 'click']) {
      window.addEventListener(type, unlock, { capture: true, passive: true });
    }
    document.addEventListener('visibilitychange', () => {
      if (!this.ctx) return;
      if (document.hidden) {
        this.ctx.suspend().catch(() => undefined);
        this.track?.pause();
      } else {
        this.ctx.resume().catch(() => undefined);
        if (this.wantMusic && !this.muted) this.track?.play().catch(() => undefined);
      }
    });
  }

  /** Debe llamarse dentro de un gesto (toque, clic, tecla). */
  unlock() {
    const ctx = this.ensure();
    if (ctx && ctx.state === 'suspended' && !document.hidden) ctx.resume().catch(() => undefined);
  }

  get isMuted() {
    return this.muted;
  }

  get isPlaying() {
    return this.wantMusic && !this.muted;
  }

  get isReady() {
    return this.ctx?.state === 'running';
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    try {
      window.localStorage.setItem(STORAGE_KEY, muted ? '1' : '0');
    } catch {
      /* almacenamiento no disponible: la preferencia dura sólo esta visita */
    }
    if (this.ctx) {
      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setTargetAtTime(muted ? 0 : 1, now, 0.08);
    }
    if (muted) this.halt();
    else if (this.wantMusic) this.play();
    this.emit();
  }

  /* ---------------- efectos ---------------- */

  /** Hoja de papel que se pasa. `soft` para cambios de panel, más discreto. */
  pageTurn(soft = false) {
    const ctx = this.live();
    if (!ctx) return;
    const t = ctx.currentTime + 0.01;
    const length = soft ? 0.38 : 0.55;
    const level = soft ? 0.32 : 0.6;

    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.playbackRate.value = rand(0.85, 1.1);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 380;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 0.75;
    bp.frequency.setValueAtTime(650, t);
    bp.frequency.exponentialRampToValueAtTime(3400, t + length * 0.42);
    bp.frequency.exponentialRampToValueAtTime(1300, t + length);
    // envolvente irregular: el papel "cruje" mientras se desliza
    const curve = new Float32Array(48);
    for (let i = 0; i < curve.length; i++) {
      const x = i / (curve.length - 1);
      const shape = Math.pow(Math.sin(Math.PI * Math.min(1, x * 1.12)), 1.4);
      curve[i] = shape * level * (0.72 + 0.28 * Math.random());
    }
    curve[curve.length - 1] = 0;
    const g = ctx.createGain();
    g.gain.value = 0;
    g.gain.setValueCurveAtTime(curve, t, length);
    src.connect(hp).connect(bp).connect(g);
    g.connect(this.sfx);
    this.send(g, 0.12);
    src.start(t, rand(0, 1));
    src.stop(t + length + 0.05);

    // asentamiento suave de la hoja
    if (!soft) this.thump(t + length * 0.82, 0.22, 240);
  }

  /** Cañón de confeti + campanitas brillantes. */
  celebrate() {
    const ctx = this.live();
    if (!ctx) return;
    const t = ctx.currentTime + 0.02;

    // "¡pum!" del cañón
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1700;
    bp.Q.value = 0.9;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.55, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    src.connect(bp).connect(g).connect(this.sfx);
    this.send(g, 0.25);
    src.start(t, rand(0, 1));
    src.stop(t + 0.25);
    this.thump(t, 0.5, 150);

    // lluvia de campanitas en pentatónica de Re, hacia lo agudo
    const notes = [86, 88, 90, 93, 95, 98, 100, 102, 105];
    let at = t + 0.09;
    for (let i = 0; i < 16; i++) {
      const n = notes[Math.min(notes.length - 1, Math.floor(rand(0, notes.length - 3) + i * 0.25))];
      this.bell(midi(n), at, rand(0.035, 0.07), rand(-0.7, 0.7));
      at += rand(0.06, 0.15) * (1 + i * 0.05);
    }
  }

  /* ---------------- música ---------------- */

  startMusic() {
    this.wantMusic = true;
    if (!this.muted) this.play();
    this.emit();
  }

  stopMusic() {
    this.wantMusic = false;
    this.halt();
    this.emit();
  }

  private play() {
    if (AUDIO.musicUrl) {
      this.playTrack();
      return;
    }
    const ctx = this.ensure();
    if (!ctx || this.musicTimer) return;
    const now = ctx.currentTime;
    this.music.gain.cancelScheduledValues(now);
    this.music.gain.setValueAtTime(this.music.gain.value, now);
    this.music.gain.linearRampToValueAtTime(MUSIC_LEVEL, now + 4);
    this.nextTime = now + 0.15;
    this.musicTimer = window.setInterval(this.schedule, 60);
    this.schedule();
  }

  private halt() {
    if (this.track) {
      const track = this.track;
      const fade = window.setInterval(() => {
        track.volume = Math.max(0, track.volume - 0.05);
        if (track.volume <= 0) {
          window.clearInterval(fade);
          track.pause();
        }
      }, 80);
    }
    if (!this.ctx || !this.musicTimer) return;
    const now = this.ctx.currentTime;
    this.music.gain.cancelScheduledValues(now);
    this.music.gain.setValueAtTime(this.music.gain.value, now);
    this.music.gain.linearRampToValueAtTime(0, now + 1.8);
    const timer = this.musicTimer;
    this.musicTimer = 0;
    window.setTimeout(() => window.clearInterval(timer), 1900);
  }

  /** Pista propia (si se configuró AUDIO.musicUrl) con fundido de entrada. */
  private playTrack() {
    if (!this.track) {
      this.track = new Audio(AUDIO.musicUrl);
      this.track.loop = true;
      this.track.preload = 'auto';
    }
    const track = this.track;
    track.volume = 0;
    track.play().catch(() => undefined);
    const fade = window.setInterval(() => {
      if (!this.wantMusic || this.muted) return window.clearInterval(fade);
      track.volume = Math.min(AUDIO.musicVolume, track.volume + 0.02);
      if (track.volume >= AUDIO.musicVolume) window.clearInterval(fade);
    }, 120);
  }

  private schedule = () => {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;
    // si la pestaña estuvo en segundo plano, retomamos sin disparar notas atrasadas
    if (this.nextTime < ctx.currentTime - 0.1) this.nextTime = ctx.currentTime + 0.05;
    while (this.nextTime < ctx.currentTime + 0.35) {
      this.playStep(this.step, this.nextTime);
      this.nextTime += EIGHTH;
      this.step++;
    }
  };

  private playStep(step: number, time: number) {
    const chordIndex = Math.floor(step / STEPS_PER_CHORD) % CHORDS.length;
    const chord = CHORDS[chordIndex];
    const local = step % STEPS_PER_CHORD;

    if (local === 0) {
      this.pad(chord.tones.slice(0, 4), time, STEPS_PER_CHORD * EIGHTH);
      this.bassNote(midi(chord.bass), time);
    }
    if (local === 8) this.bassNote(midi(chord.bass + 12), time, 0.05);

    // arpa: arpegio con respiraciones (algunas notas se omiten para sonar humano)
    if (local !== 0 && Math.random() < 0.16) return;
    const idx = ARP[local];
    const n = chord.tones[idx % chord.tones.length] + 12 * Math.floor(idx / chord.tones.length);
    const accent = local % 4 === 0 ? 1 : 0.72;
    this.pluck(midi(n), time + rand(0, 0.012), 0.075 * accent);
    // un destello agudo ocasional, como celesta
    if (local === 4 && Math.random() < 0.5) this.bell(midi(chord.tones[4] + 12), time, 0.018, rand(-0.4, 0.4), true);
  }

  /* ---------------- instrumentos ---------------- */

  private pluck(freq: number, time: number, level: number) {
    const ctx = this.ctx!;
    const o1 = ctx.createOscillator();
    o1.type = 'triangle';
    o1.frequency.value = freq;
    const o2 = ctx.createOscillator();
    o2.type = 'sine';
    o2.frequency.value = freq * 2;
    const o2g = ctx.createGain();
    o2g.gain.value = 0.3;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(4200, time);
    lp.frequency.exponentialRampToValueAtTime(1100, time + 0.6);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(level, time + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 2.4);
    o1.connect(lp);
    o2.connect(o2g).connect(lp);
    lp.connect(g).connect(this.music);
    this.send(g, 0.55);
    for (const o of [o1, o2]) {
      o.start(time);
      o.stop(time + 2.5);
    }
  }

  private pad(tones: number[], time: number, duration: number) {
    const ctx = this.ctx!;
    const end = time + duration;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 820;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, time);
    g.gain.linearRampToValueAtTime(0.022, time + 2.4);
    g.gain.setValueAtTime(0.022, end - 0.2);
    g.gain.linearRampToValueAtTime(0.0001, end + 2.4);
    lp.connect(g).connect(this.music);
    this.send(g, 0.5);
    for (const n of tones) {
      for (const detune of [-6, 6]) {
        const o = ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = midi(n - 12);
        o.detune.value = detune;
        o.connect(lp);
        o.start(time);
        o.stop(end + 2.5);
      }
    }
  }

  private bassNote(freq: number, time: number, level = 0.11) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(level, time + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 3.2);
    o.connect(g).connect(this.music);
    o.start(time);
    o.stop(time + 3.3);
  }

  private bell(freq: number, time: number, level: number, pan: number, toMusic = false) {
    const ctx = this.ctx!;
    const panner = ctx.createStereoPanner();
    panner.pan.value = pan;
    panner.connect(toMusic ? this.music : this.sfx);
    this.send(panner, 0.6);
    // parciales inarmónicos de campana
    for (const [ratio, amount, decay] of [
      [1, 1, 1.5],
      [2.756, 0.32, 0.7],
      [5.404, 0.12, 0.35]
    ]) {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = freq * ratio;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, time);
      g.gain.exponentialRampToValueAtTime(level * amount, time + 0.003);
      g.gain.exponentialRampToValueAtTime(0.0001, time + decay);
      o.connect(g).connect(panner);
      o.start(time);
      o.stop(time + decay + 0.05);
    }
  }

  private thump(time: number, level: number, freq: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(freq, time);
    o.frequency.exponentialRampToValueAtTime(freq * 0.45, time + 0.14);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(level, time + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);
    o.connect(g).connect(this.sfx);
    o.start(time);
    o.stop(time + 0.2);
  }

  /* ---------------- infraestructura ---------------- */

  /** Contexto listo y con sonido permitido; si no, null (el efecto simplemente no suena). */
  private live() {
    if (this.muted) return null;
    const ctx = this.ensure();
    if (!ctx) return null;
    if (ctx.state === 'suspended') ctx.resume().catch(() => undefined);
    return ctx;
  }

  private send(node: AudioNode, amount: number) {
    const g = this.ctx!.createGain();
    g.gain.value = amount;
    node.connect(g).connect(this.wet);
  }

  private ensure() {
    if (this.ctx) return this.ctx;
    const Ctor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    const ctx = new Ctor({ latencyHint: 'interactive' });
    this.ctx = ctx;

    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -10;
    limiter.knee.value = 6;
    limiter.ratio.value = 8;
    limiter.connect(ctx.destination);

    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 1;
    this.master.connect(limiter);

    this.sfx = ctx.createGain();
    this.sfx.gain.value = 0.9;
    this.sfx.connect(this.master);

    const musicTone = ctx.createBiquadFilter();
    musicTone.type = 'lowpass';
    musicTone.frequency.value = 5200;
    musicTone.connect(this.master);
    this.music = ctx.createGain();
    this.music.gain.value = 0;
    this.music.connect(musicTone);

    // reverberación de salón: impulso de ruido que decae ~3 s
    const reverb = ctx.createConvolver();
    reverb.buffer = this.impulse(ctx, 3.2);
    this.wet = ctx.createGain();
    this.wet.gain.value = 0.45;
    this.wet.connect(reverb).connect(this.master);

    this.noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return ctx;
  }

  private impulse(ctx: AudioContext, seconds: number) {
    const length = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        const t = i / length;
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 3.2) * (i < ctx.sampleRate * 0.012 ? i / (ctx.sampleRate * 0.012) : 1);
      }
    }
    return buffer;
  }

  private emit() {
    this.listeners.forEach(listener => listener());
  }
}

export const sound = new SoundEngine();
