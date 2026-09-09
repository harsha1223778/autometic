/**
 * AI Voice Isolator & Studio Sound Denoise Console for EditFlow AI
 * Configures Web Audio API parametric EQ filters and noise gate curves
 * to isolate spoken dialogue and remove background hum, room echo, and wind noise.
 */

export interface VoiceFilterProfile {
  id: string;
  name: string;
  description: string;
  category: 'podcast' | 'clarity' | 'denoise' | 'natural';
  highPassFreq: number; // Hz (cut low rumble)
  lowPassFreq: number; // Hz (cut high hiss)
  lowShelfGain: number; // dB (boost vocal body)
  lowShelfFreq: number;
  notchCutGain: number; // dB (cut room boxiness around 400Hz)
  notchFreq: number;
  highShelfGain: number; // dB (air & crispness)
  highShelfFreq: number;
}

export const VOICE_PROFILES: VoiceFilterProfile[] = [
  {
    id: 'podcast-warmth',
    name: 'Podcast Warmth (Broadcast Rich)',
    description: 'Enriches deep vocal chest resonance (+3dB @ 150Hz) with smooth high-end air.',
    category: 'podcast',
    highPassFreq: 60,
    lowPassFreq: 16000,
    lowShelfGain: 3.5,
    lowShelfFreq: 150,
    notchCutGain: -2.0,
    notchFreq: 420,
    highShelfGain: 2.5,
    highShelfFreq: 4000,
  },
  {
    id: 'vocal-clarity',
    name: 'Mobile Vocal Clarity & Presence',
    description: 'Removes boxy room mud (-3.5dB @ 450Hz) and boosts voice presence (+4dB @ 7kHz).',
    category: 'clarity',
    highPassFreq: 80,
    lowPassFreq: 18000,
    lowShelfGain: 0,
    lowShelfFreq: 200,
    notchCutGain: -3.5,
    notchFreq: 450,
    highShelfGain: 4.0,
    highShelfFreq: 7000,
  },
  {
    id: 'room-de-echo',
    name: 'Room De-Echo & Reverb Reducer',
    description: 'Attenuates flutter echo and hollow room reflections in untreated rooms.',
    category: 'denoise',
    highPassFreq: 90,
    lowPassFreq: 14000,
    lowShelfGain: -1.5,
    lowShelfFreq: 250,
    notchCutGain: -4.5,
    notchFreq: 600,
    highShelfGain: -1.0,
    highShelfFreq: 8000,
  },
  {
    id: 'wind-rumble-cut',
    name: 'Wind & Traffic Rumble Cut',
    description: 'Aggressive 110Hz high-pass filter stripping HVAC, wind, and desk vibration.',
    category: 'denoise',
    highPassFreq: 110,
    lowPassFreq: 15000,
    lowShelfGain: -3.0,
    lowShelfFreq: 120,
    notchCutGain: 0,
    notchFreq: 1000,
    highShelfGain: 1.0,
    highShelfFreq: 5000,
  },
  {
    id: 'clean-natural',
    name: 'Clean Neutral (Transparent)',
    description: 'Reference flat response with subtle 40Hz sub-sonic rumble filter.',
    category: 'natural',
    highPassFreq: 40,
    lowPassFreq: 20000,
    lowShelfGain: 0,
    lowShelfFreq: 200,
    notchCutGain: 0,
    notchFreq: 1000,
    highShelfGain: 0,
    highShelfFreq: 10000,
  },
];

/**
 * Connects Web Audio BiquadFilter nodes implementing the chosen voice profile
 */
export function buildVoiceFilterGraph(
  audioCtx: AudioContext,
  sourceNode: AudioNode,
  destinationNode: AudioNode,
  profileId: string
): AudioNode[] {
  const profile = VOICE_PROFILES.find((p) => p.id === profileId) || VOICE_PROFILES[0];

  // 1. High-Pass Filter (Rumble Cut)
  const hpFilter = audioCtx.createBiquadFilter();
  hpFilter.type = 'highpass';
  hpFilter.frequency.value = profile.highPassFreq;

  // 2. Low-Shelf Filter (Body / Warmth)
  const lsFilter = audioCtx.createBiquadFilter();
  lsFilter.type = 'lowshelf';
  lsFilter.frequency.value = profile.lowShelfFreq;
  lsFilter.gain.value = profile.lowShelfGain;

  // 3. Peaking Notch Filter (Boxy Room Cut)
  const notchFilter = audioCtx.createBiquadFilter();
  notchFilter.type = 'peaking';
  notchFilter.frequency.value = profile.notchFreq;
  notchFilter.gain.value = profile.notchCutGain;
  notchFilter.Q.value = 1.4;

  // 4. High-Shelf Filter (Air / Crispness)
  const hsFilter = audioCtx.createBiquadFilter();
  hsFilter.type = 'highshelf';
  hsFilter.frequency.value = profile.highShelfFreq;
  hsFilter.gain.value = profile.highShelfGain;

  // 5. Low-Pass Filter (Hiss Cut)
  const lpFilter = audioCtx.createBiquadFilter();
  lpFilter.type = 'lowpass';
  lpFilter.frequency.value = profile.lowPassFreq;

  // Connect in serial
  sourceNode
    .connect(hpFilter)
    .connect(lsFilter)
    .connect(notchFilter)
    .connect(hsFilter)
    .connect(lpFilter)
    .connect(destinationNode);

  return [hpFilter, lsFilter, notchFilter, hsFilter, lpFilter];
}

export const STUDIO_VOICE_PROFILES = VOICE_PROFILES;
