/**
 * Multi-Track Audio Mixer & Stem Layering Engine for EditFlow AI
 * Manages 4 discrete stems: Dialogue, Voiceover, Music, and SFX
 * Supports stereo pan, dB gain faders, mute/solo matrices, and LUFS broadcast normalization.
 */

export interface AudioStemConfig {
  id: 'dialogue' | 'voiceover' | 'music' | 'sfx';
  name: string;
  volume: number; // 0 to 150 (percentage)
  pan: number; // -1.0 (Full Left) to 1.0 (Full Right)
  isMuted: boolean;
  isSolo: boolean;
}

export interface AudioMixerState {
  stems: Record<'dialogue' | 'voiceover' | 'music' | 'sfx', AudioStemConfig>;
  masterVolume: number; // 0 to 150
  loudnessStandard: 'youtube-14' | 'tiktok-16' | 'podcast-12' | 'natural';
}

export const LOUDNESS_STANDARDS = [
  {
    id: 'youtube-14',
    name: 'YouTube Standard (-14 LUFS)',
    targetLUFS: -14,
    description: 'Optimal loudness for YouTube long-form and desktop streaming.',
    gainMultiplier: 1.0,
  },
  {
    id: 'tiktok-16',
    name: 'TikTok & Reels (-16 LUFS)',
    targetLUFS: -16,
    description: 'Optimized dynamic range for mobile phone speakers and headphones.',
    gainMultiplier: 0.85,
  },
  {
    id: 'podcast-12',
    name: 'Loud & Punchy (-12 LUFS)',
    targetLUFS: -12,
    description: 'High energy commercial sound with tight dynamic compression.',
    gainMultiplier: 1.2,
  },
  {
    id: 'natural',
    name: 'Natural Dynamic (No Limiter)',
    targetLUFS: -18,
    description: 'Raw uncompressed original audio levels.',
    gainMultiplier: 1.0,
  },
] as const;

export const DEFAULT_MIXER_STATE: AudioMixerState = {
  stems: {
    dialogue: {
      id: 'dialogue',
      name: 'Original Dialogue',
      volume: 100,
      pan: 0,
      isMuted: false,
      isSolo: false,
    },
    voiceover: {
      id: 'voiceover',
      name: 'AI Voiceover',
      volume: 100,
      pan: 0,
      isMuted: false,
      isSolo: false,
    },
    music: {
      id: 'music',
      name: 'Background Music',
      volume: 35,
      pan: 0,
      isMuted: false,
      isSolo: false,
    },
    sfx: {
      id: 'sfx',
      name: 'Sound Effects (SFX)',
      volume: 75,
      pan: 0,
      isMuted: false,
      isSolo: false,
    },
  },
  masterVolume: 100,
  loudnessStandard: 'youtube-14',
};

/**
 * Calculates effective volume multiplier considering mute and solo conditions
 */
export function calculateEffectiveGain(
  stemId: 'dialogue' | 'voiceover' | 'music' | 'sfx',
  mixer: AudioMixerState
): number {
  const stem = mixer.stems[stemId];
  if (!stem) return 0;

  // If any stem is in SOLO mode, only soloed stems produce sound
  const anySolo = Object.values(mixer.stems).some((s) => s.isSolo);
  if (anySolo && !stem.isSolo) {
    return 0;
  }

  // If directly muted
  if (stem.isMuted) {
    return 0;
  }

  // Find standard gain multiplier
  const standard = LOUDNESS_STANDARDS.find((s) => s.id === mixer.loudnessStandard);
  const standardMultiplier = standard ? standard.gainMultiplier : 1.0;

  const stemGain = stem.volume / 100;
  const masterGain = mixer.masterVolume / 100;

  return Math.min(2.0, stemGain * masterGain * standardMultiplier);
}

/**
 * Helper to convert pan (-1 to 1) into left and right channel gains (constant-power pan law)
 */
export function calculateStereoPanGains(pan: number): { leftGain: number; rightGain: number } {
  // Clamp pan between -1 and 1
  const p = Math.max(-1, Math.min(1, pan));
  // Convert -1..1 to 0..pi/2 radians
  const angle = ((p + 1) * Math.PI) / 4;
  return {
    leftGain: Math.cos(angle),
    rightGain: Math.sin(angle),
  };
}
