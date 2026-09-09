// Synthesized Web Audio API sound effects - zero external audio assets, 0ms latency

let audioCtx: AudioContext | null = null;
let soundEnabled = true;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function toggleSound(enabled?: boolean): boolean {
  if (enabled !== undefined) {
    soundEnabled = enabled;
  } else {
    soundEnabled = !soundEnabled;
  }
  try {
    localStorage.setItem('task_tracker_sound', soundEnabled ? 'true' : 'false');
  } catch {
    // ignore
  }
  return soundEnabled;
}

export function isSoundEnabled(): boolean {
  try {
    const saved = localStorage.getItem('task_tracker_sound');
    if (saved !== null) {
      soundEnabled = saved === 'true';
    }
  } catch {
    // ignore
  }
  return soundEnabled;
}

/**
 * Pleasant, warm ascending chime with soft acoustic resonance (Things 3 / Linear style)
 */
export function playCheckClick(): void {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Master output node with clean volume staging
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.16, now);
  master.connect(ctx.destination);

  // Note 1: Warm fundamental body (G5 - 783.99 Hz)
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(783.99, now);

  gain1.gain.setValueAtTime(0, now);
  gain1.gain.linearRampToValueAtTime(0.7, now + 0.005);
  gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

  osc1.connect(gain1);
  gain1.connect(master);
  osc1.start(now);
  osc1.stop(now + 0.16);

  // Note 2: Harmonious crystalline chime (C6 - 1046.5 Hz, +50ms)
  const t2 = now + 0.05;
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(1046.5, t2);

  gain2.gain.setValueAtTime(0, t2);
  gain2.gain.linearRampToValueAtTime(0.85, t2 + 0.006);
  gain2.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.28);

  osc2.connect(gain2);
  gain2.connect(master);
  osc2.start(t2);
  osc2.stop(t2 + 0.28);

  // Note 3: Velvet high sparkle overtone (E6 - 1318.5 Hz, +60ms)
  const t3 = now + 0.06;
  const osc3 = ctx.createOscillator();
  const gain3 = ctx.createGain();
  osc3.type = 'sine';
  osc3.frequency.setValueAtTime(1318.51, t3);

  gain3.gain.setValueAtTime(0, t3);
  gain3.gain.linearRampToValueAtTime(0.3, t3 + 0.006);
  gain3.gain.exponentialRampToValueAtTime(0.0001, t3 + 0.22);

  osc3.connect(gain3);
  gain3.connect(master);
  osc3.start(t3);
  osc3.stop(t3 + 0.22);
}

/**
 * Soft chime for Pomodoro complete
 */
export function playChime(): void {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const freqs = [523.25, 659.25, 783.99, 1046.5]; // C-E-G-C chord

  freqs.forEach((f, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(f, now + i * 0.08);

    gain.gain.setValueAtTime(0.08, now + i * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 1.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + i * 0.08);
    osc.stop(now + i * 0.08 + 1.2);
  });
}

export type HabitFailSoundStyle = 'minor' | 'dull' | 'descend';

export function getHabitFailSoundStyle(): HabitFailSoundStyle {
  try {
    const saved = localStorage.getItem('task_tracker_habit_fail_style');
    if (saved === 'minor' || saved === 'dull' || saved === 'descend') {
      return saved;
    }
  } catch {
    // ignore
  }
  return 'minor';
}

export function setHabitFailSoundStyle(style: HabitFailSoundStyle): void {
  try {
    localStorage.setItem('task_tracker_habit_fail_style', style);
  } catch {
    // ignore
  }
}

/**
 * Alternative negative synthesized sound for habit breaks / failures
 */
export function playHabitFailSound(overrideStyle?: HabitFailSoundStyle): void {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const style = overrideStyle || getHabitFailSoundStyle();
  const now = ctx.currentTime;

  if (style === 'dull') {
    // Dampened acoustic sub thud / muffled drop
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.18);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, now);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
    return;
  }

  if (style === 'descend') {
    // Two-tone descending interval (523Hz -> 392Hz)
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.14, now);
    master.connect(ctx.destination);

    // Tone 1: High note
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now);
    gain1.gain.setValueAtTime(0.7, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc1.connect(gain1);
    gain1.connect(master);
    osc1.start(now);
    osc1.stop(now + 0.14);

    // Tone 2: Descending note (+80ms)
    const t2 = now + 0.08;
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(392.0, t2);
    gain2.gain.setValueAtTime(0.8, t2);
    gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.22);
    osc2.connect(gain2);
    gain2.connect(master);
    osc2.start(t2);
    osc2.stop(t2 + 0.22);
    return;
  }

  // Default: 'minor' - Elegant soft descending minor chord
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.16, now);
  master.connect(ctx.destination);

  // Note 1: F4 (349.23 Hz)
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(349.23, now);
  gain1.gain.setValueAtTime(0.65, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
  osc1.connect(gain1);
  gain1.connect(master);
  osc1.start(now);
  osc1.stop(now + 0.16);

  // Note 2: Db4 (277.18 Hz) at +60ms
  const t2 = now + 0.06;
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(277.18, t2);
  gain2.gain.setValueAtTime(0.75, t2);
  gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.24);
  osc2.connect(gain2);
  gain2.connect(master);
  osc2.start(t2);
  osc2.stop(t2 + 0.24);

  // Note 3: Subtle low harmonic support
  const t3 = now + 0.07;
  const osc3 = ctx.createOscillator();
  const gain3 = ctx.createGain();
  osc3.type = 'triangle';
  osc3.frequency.setValueAtTime(138.59, t3);
  gain3.gain.setValueAtTime(0.25, t3);
  gain3.gain.exponentialRampToValueAtTime(0.001, t3 + 0.26);
  osc3.connect(gain3);
  gain3.connect(master);
  osc3.start(t3);
  osc3.stop(t3 + 0.26);
}

