/**
 * AI Procedural Background Music & Smart Auto-Ducking Engine
 * Generates royalty-free procedural background music loops (Lofi, Synthwave, Cinematic)
 * and dynamically ducks audio levels when speech or voiceovers are active.
 */

export interface MusicTrackPreset {
  id: string;
  name: string;
  genre: string;
  bpm: number;
  icon: string;
  description: string;
}

export const PROCEDURAL_MUSIC_TRACKS: MusicTrackPreset[] = [
  {
    id: 'lofi-chill',
    name: 'Lofi Midnight Chill',
    genre: 'Lofi Hip Hop',
    bpm: 80,
    icon: '☕',
    description: 'Warm electric piano chord progression with gentle vinyl texture.',
  },
  {
    id: 'synthwave-pulse',
    name: 'Retro Synthwave Pulse',
    genre: 'Synthwave',
    bpm: 110,
    icon: '🌆',
    description: 'Neon 80s analog arpeggiator and energetic bassline pulse.',
  },
  {
    id: 'cinematic-drone',
    name: 'Cinematic Ambient Drone',
    genre: 'Ambient / Tension',
    bpm: 65,
    icon: '🌌',
    description: 'Deep resonant sub-bass drone with evolving harmonic overtone swells.',
  },
];

let activeMusicContext: AudioContext | null = null;
let activeMasterGain: GainNode | null = null;
let activeIntervalId: any = null;
let currentBaseVolume = 0.25;
let isCurrentlyDucked = false;

/**
 * Starts playing a continuous procedural music loop in the browser.
 */
export function startProceduralMusic(
  trackId: string,
  initialVolume: number = 0.25
): {
  stop: () => void;
  setVolume: (v: number) => void;
  setDucking: (ducked: boolean) => void;
} {
  stopProceduralMusic();

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) throw new Error('Web Audio API not supported');

    activeMusicContext = new AudioCtx();
    const ctx = activeMusicContext;

    activeMasterGain = ctx.createGain();
    currentBaseVolume = initialVolume;
    activeMasterGain.gain.setValueAtTime(initialVolume, ctx.currentTime);
    activeMasterGain.connect(ctx.destination);

    // Play procedural pattern based on track ID
    if (trackId === 'synthwave-pulse') {
      runSynthwaveEngine(ctx, activeMasterGain);
    } else if (trackId === 'cinematic-drone') {
      runCinematicDroneEngine(ctx, activeMasterGain);
    } else {
      // Default: lofi-chill
      runLofiEngine(ctx, activeMasterGain);
    }

    return {
      stop: stopProceduralMusic,
      setVolume: setProceduralMusicVolume,
      setDucking: setProceduralMusicDucking,
    };
  } catch (err) {
    console.warn('Procedural music audio playback error:', err);
    return {
      stop: () => {},
      setVolume: () => {},
      setDucking: () => {},
    };
  }
}

/**
 * Stops any actively playing procedural music.
 */
export function stopProceduralMusic() {
  if (activeIntervalId) {
    clearInterval(activeIntervalId);
    activeIntervalId = null;
  }
  if (activeMasterGain) {
    try {
      activeMasterGain.disconnect();
    } catch {}
    activeMasterGain = null;
  }
  if (activeMusicContext) {
    try {
      activeMusicContext.close();
    } catch {}
    activeMusicContext = null;
  }
  isCurrentlyDucked = false;
}

/**
 * Updates master volume level of procedural music.
 */
export function setProceduralMusicVolume(volume: number) {
  currentBaseVolume = Math.max(0, Math.min(1, volume));
  if (activeMasterGain && activeMusicContext) {
    const targetGain = isCurrentlyDucked ? currentBaseVolume * 0.25 : currentBaseVolume;
    activeMasterGain.gain.setTargetAtTime(targetGain, activeMusicContext.currentTime, 0.1);
  }
}

/**
 * Toggles dynamic auto-ducking (lowering music volume when speech/voiceover is active).
 */
export function setProceduralMusicDucking(ducked: boolean) {
  if (isCurrentlyDucked === ducked) return;
  isCurrentlyDucked = ducked;

  if (activeMasterGain && activeMusicContext) {
    const targetGain = ducked ? currentBaseVolume * 0.25 : currentBaseVolume;
    // Smooth ramp over 200ms
    activeMasterGain.gain.setTargetAtTime(targetGain, activeMusicContext.currentTime, 0.15);
  }
}

/**
 * Lofi Chord Engine
 */
function runLofiEngine(ctx: AudioContext, destination: GainNode) {
  const chords = [
    [174.61, 220.0, 261.63, 329.63], // Fmaj7
    [164.81, 196.0, 246.94, 293.66], // Em7
    [146.83, 174.61, 220.0, 261.63], // Dm7
    [130.81, 164.81, 196.0, 246.94], // Cmaj7
  ];

  let chordIndex = 0;

  const playChord = () => {
    if (!ctx || ctx.state === 'closed') return;
    const notes = chords[chordIndex % chords.length];
    chordIndex++;

    const now = ctx.currentTime;
    notes.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(destination);

      osc.start(now);
      osc.stop(now + 3.0);
    });
  };

  playChord();
  activeIntervalId = setInterval(playChord, 3000);
}

/**
 * Synthwave Engine
 */
function runSynthwaveEngine(ctx: AudioContext, destination: GainNode) {
  const bassNotes = [110, 110, 130.81, 146.83, 98, 98, 123.47, 130.81]; // A2 / C3 / D3 / G2
  let step = 0;

  const playStep = () => {
    if (!ctx || ctx.state === 'closed') return;
    const now = ctx.currentTime;
    const freq = bassNotes[step % bassNotes.length];
    step++;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(400, now + 0.25);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(destination);

    osc.start(now);
    osc.stop(now + 0.3);
  };

  playStep();
  activeIntervalId = setInterval(playStep, 272); // ~110 BPM eighth notes
}

/**
 * Cinematic Drone Engine
 */
function runCinematicDroneEngine(ctx: AudioContext, destination: GainNode) {
  const rootFreq = 65.41; // C2

  const startDrone = () => {
    if (!ctx || ctx.state === 'closed') return;
    const now = ctx.currentTime;

    [1, 1.5, 2, 2.5].forEach((mult, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(rootFreq * mult, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600 + i * 150, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08 / (i + 1), now + 3.0);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(destination);

      osc.start(now);
    });
  };

  startDrone();
}
