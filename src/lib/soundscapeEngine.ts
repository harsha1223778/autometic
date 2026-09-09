/**
 * AI Soundscape & Environmental Foley Ambience Generator
 * Uses the Web Audio API to procedurally generate immersive environmental soundscapes
 * (Coffeehouse, Cyberpunk Rain, Studio Silence, Nature Wind, Space Drone)
 * that add depth and broadcast presence beneath creator dialogue.
 */

export interface SoundscapePreset {
  id: string;
  name: string;
  icon: string;
  tag: string;
  description: string;
  baseFreq: number;
  filterType: BiquadFilterType;
  filterFreq: number;
  noiseColor: 'pink' | 'brown' | 'white' | 'sine';
}

export const SOUNDSCAPE_PRESETS: SoundscapePreset[] = [
  {
    id: 'cafe-ambience',
    name: 'Lo-Fi Coffeehouse Room',
    icon: '☕',
    tag: 'WARM VLOG',
    description: 'Cozy conversational acoustic space with gentle low-pass warmth and room resonance.',
    baseFreq: 110,
    filterType: 'lowpass',
    filterFreq: 480,
    noiseColor: 'brown',
  },
  {
    id: 'cyber-rain',
    name: 'Cyberpunk Rain & City',
    icon: '🌧️',
    tag: 'NEON MOOD',
    description: 'Continuous atmospheric precipitation texture with filtered soothing droplet hiss.',
    baseFreq: 180,
    filterType: 'bandpass',
    filterFreq: 1200,
    noiseColor: 'pink',
  },
  {
    id: 'tech-studio',
    name: 'Modern Broadcast Studio',
    icon: '🏢',
    tag: 'PODCAST PRO',
    description: 'Ultra-clean treated vocal booth presence with subtle room air and anti-dead-air floor.',
    baseFreq: 75,
    filterType: 'lowpass',
    filterFreq: 320,
    noiseColor: 'pink',
  },
  {
    id: 'nature-wind',
    name: 'Forest Canopy Wind',
    icon: '🌲',
    tag: 'OUTDOOR NATURE',
    description: 'Dynamic airy treetop breeze with slow undulating filter sweeps.',
    baseFreq: 140,
    filterType: 'bandpass',
    filterFreq: 750,
    noiseColor: 'pink',
  },
  {
    id: 'space-drone',
    name: 'Deep Space Sub Drone',
    icon: '🌌',
    tag: 'CINEMATIC SUSPENSE',
    description: 'Ominous 55Hz sub-bass rumble adding tension and gravity to deep revelations.',
    baseFreq: 55,
    filterType: 'lowpass',
    filterFreq: 180,
    noiseColor: 'sine',
  },
  {
    id: 'trading-floor',
    name: 'High-Pace Energy Floor',
    icon: '⚡',
    tag: 'BUSINESS HYPE',
    description: 'Upbeat corporate ambient energy drone for finance, tech launches, and hustle content.',
    baseFreq: 160,
    filterType: 'highpass',
    filterFreq: 400,
    noiseColor: 'brown',
  },
];

let globalAudioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let activeSourceNode: AudioNode | null = null;
let activeFilterNode: BiquadFilterNode | null = null;
let lfoNode: OscillatorNode | null = null;
let targetVolume = 0.25;

function getOrCreateAudioContext(): AudioContext {
  if (!globalAudioCtx || globalAudioCtx.state === 'closed') {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    globalAudioCtx = new AudioCtx();
  }
  if (globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume();
  }
  return globalAudioCtx;
}

/**
 * Procedurally synthesizes and loops the selected environmental soundscape.
 */
export function startSoundscape(presetId: string, volume: number = 0.25): void {
  if (typeof window === 'undefined') return;

  stopSoundscape();
  targetVolume = Math.max(0, Math.min(1, volume));

  const preset = SOUNDSCAPE_PRESETS.find((p) => p.id === presetId) || SOUNDSCAPE_PRESETS[0];
  const ctx = getOrCreateAudioContext();

  masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(targetVolume * 0.25, ctx.currentTime + 0.8);
  masterGain.connect(ctx.destination);

  activeFilterNode = ctx.createBiquadFilter();
  activeFilterNode.type = preset.filterType;
  activeFilterNode.frequency.setValueAtTime(preset.filterFreq, ctx.currentTime);
  activeFilterNode.connect(masterGain);

  if (preset.noiseColor === 'sine') {
    // Pure synthesized dual sub-bass drone
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(preset.baseFreq, ctx.currentTime);
    osc2.frequency.setValueAtTime(preset.baseFreq * 1.5, ctx.currentTime);

    const oscGain = ctx.createGain();
    oscGain.gain.value = 0.5;
    osc1.connect(oscGain);
    osc2.connect(oscGain);
    oscGain.connect(activeFilterNode);

    osc1.start();
    osc2.start();
    activeSourceNode = oscGain;
  } else {
    // Noise buffer generator (white/pink/brown noise generator)
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (preset.noiseColor === 'pink') {
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2 + white * 0.5362) * 0.11;
      } else {
        // Brown noise
        b0 = (b0 + (0.02 * white)) / 1.02;
        output[i] = b0 * 1.8;
      }
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // LFO for slow atmospheric breathing
    lfoNode = ctx.createOscillator();
    lfoNode.frequency.value = 0.2; // 0.2 Hz slow breath
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = preset.filterFreq * 0.35;
    lfoNode.connect(lfoGain);
    lfoGain.connect(activeFilterNode.frequency);
    lfoNode.start();

    whiteNoise.connect(activeFilterNode);
    whiteNoise.start();
    activeSourceNode = whiteNoise;
  }
}

/**
 * Halts active procedural soundscape with smooth 0.3s fadeout.
 */
export function stopSoundscape(): void {
  if (masterGain && globalAudioCtx && globalAudioCtx.state !== 'closed') {
    try {
      masterGain.gain.linearRampToValueAtTime(0.001, globalAudioCtx.currentTime + 0.3);
      setTimeout(() => {
        try {
          if (lfoNode) {
            lfoNode.stop();
            lfoNode.disconnect();
            lfoNode = null;
          }
          if (activeSourceNode) {
            activeSourceNode.disconnect();
            activeSourceNode = null;
          }
          if (masterGain) {
            masterGain.disconnect();
            masterGain = null;
          }
        } catch {}
      }, 350);
    } catch {}
  }
}

/**
 * Updates active soundscape volume.
 */
export function setSoundscapeVolume(vol: number): void {
  targetVolume = Math.max(0, Math.min(1, vol));
  if (masterGain && globalAudioCtx && globalAudioCtx.state !== 'closed') {
    masterGain.gain.setValueAtTime(targetVolume * 0.25, globalAudioCtx.currentTime);
  }
}

/**
 * Automatically ducks soundscape when creator is speaking.
 */
export function setSoundscapeDucking(isDucking: boolean): void {
  if (masterGain && globalAudioCtx && globalAudioCtx.state !== 'closed') {
    const vol = isDucking ? targetVolume * 0.08 : targetVolume * 0.25;
    masterGain.gain.setTargetAtTime(vol, globalAudioCtx.currentTime, 0.15);
  }
}
