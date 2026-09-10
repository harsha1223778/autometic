export type VoiceTimbreProfileId = 'deep-narrator' | 'hyper-hype' | 'warm-podcaster' | 'radio-vintage' | 'whisper-asmr' | string;

export interface VoiceTimbreProfile {
  id: string;
  name: string;
  badge: string;
  icon: string;
  description: string;
  pitchSemitones: number; // -12 to +12
  speechRateMultiplier: number; // 0.8 to 1.3
  formantBoostHz: number; // e.g. 250Hz for chest, 3200Hz for presence
  compressionRatio: number; // 2.0 to 8.0
  saturationAmount: number; // 0.0 to 1.0
  clarityBoostDb: number;
}

export const VOICE_TIMBRE_PROFILES: VoiceTimbreProfile[] = [
  {
    id: 'deep-narrator',
    name: 'Cinematic Deep Narrator',
    badge: 'AUTHORITY',
    icon: '🎙️',
    description: 'Rich low-end chest resonance with -3 semitones pitch transposition for epic documentary feel',
    pitchSemitones: -3,
    speechRateMultiplier: 0.95,
    formantBoostHz: 180,
    compressionRatio: 4.5,
    saturationAmount: 0.25,
    clarityBoostDb: 1.5
  },
  {
    id: 'hyper-hype',
    name: 'Viral TikTok Hype Energy',
    badge: 'HIGH ADRENALINE',
    icon: '⚡',
    description: 'Punchy elevated pitch (+2 semitones) and accelerated 1.2x cadence for unskippable retention',
    pitchSemitones: 2,
    speechRateMultiplier: 1.18,
    formantBoostHz: 3500,
    compressionRatio: 6.0,
    saturationAmount: 0.4,
    clarityBoostDb: 4.5
  },
  {
    id: 'warm-podcaster',
    name: 'Studio Broadcast Warmth',
    badge: 'INTIMATE PRO',
    icon: '☕',
    description: 'Smooth proximity effect boosting low mids (280Hz) with natural conversational cadence',
    pitchSemitones: 0,
    speechRateMultiplier: 1.0,
    formantBoostHz: 280,
    compressionRatio: 3.2,
    saturationAmount: 0.15,
    clarityBoostDb: 3.0
  },
  {
    id: 'radio-vintage',
    name: 'Vintage AM Radio / Telephone',
    badge: 'RETRO FILTER',
    icon: '📻',
    description: 'Nostalgic band-limited filter (350Hz - 3.8kHz) with harmonic saturation and drive',
    pitchSemitones: 1,
    speechRateMultiplier: 1.05,
    formantBoostHz: 1500,
    compressionRatio: 5.0,
    saturationAmount: 0.65,
    clarityBoostDb: 0.0
  },
  {
    id: 'whisper-asmr',
    name: 'Intimate ASMR / Whisper Mode',
    badge: 'CLOSE-UP',
    icon: '🤫',
    description: 'Breath-focused air presence boost (>8kHz) with heavy dynamic soft-clipping',
    pitchSemitones: 0,
    speechRateMultiplier: 0.9,
    formantBoostHz: 8000,
    compressionRatio: 7.0,
    saturationAmount: 0.1,
    clarityBoostDb: 6.0
  }
];

export function buildVoiceTimbreFilterGraph(
  audioContext: AudioContext,
  sourceNode: AudioNode,
  timbre: VoiceTimbreProfile
): AudioNode {
  // 1. Parametric Formant Peak Filter
  const formantFilter = audioContext.createBiquadFilter();
  formantFilter.type = 'peaking';
  formantFilter.frequency.value = timbre.formantBoostHz;
  formantFilter.Q.value = 1.4;
  formantFilter.gain.value = 4.5; // +4.5dB boost

  // 2. Dynamics Compressor for Timbre Leveling
  const compressor = audioContext.createDynamicsCompressor();
  compressor.threshold.value = -20;
  compressor.knee.value = 12;
  compressor.ratio.value = timbre.compressionRatio;
  compressor.attack.value = 0.005;
  compressor.release.value = 0.15;

  // 3. Connect Graph
  sourceNode.connect(formantFilter);
  formantFilter.connect(compressor);

  return compressor;
}

export function calculatePitchPlaybackRate(pitchSemitones: number): number {
  // Standard frequency shift formula: 2^(semitones / 12)
  return Math.pow(2, pitchSemitones / 12);
}
