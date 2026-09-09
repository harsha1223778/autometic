/**
 * Broadcast Audio Mastering & Loudness Normalization (LUFS / EBU R128)
 * Standardizes integrated loudness for YouTube, TikTok, Instagram Reels, and Podcasts,
 * applying True-Peak Brickwall Limiting and multiband dynamics compression curves.
 */

export interface MasteringProfile {
  id: string;
  name: string;
  platform: string;
  targetLUFS: number; // in LUFS (e.g. -14, -13, -16, -10)
  truePeakCeiling: number; // in dBFS (e.g. -1.0)
  compressionRatio: number; // e.g. 3.0
  thresholdDb: number; // in dB
  stereoSpread: number; // 1.0 = neutral, 1.3 = wide
  badge: string;
  description: string;
}

export const MASTERING_PROFILES: MasteringProfile[] = [
  {
    id: 'tiktok-reels',
    name: 'TikTok & Reels Commercial Punch',
    platform: 'TikTok / Instagram Reels',
    targetLUFS: -13.0,
    truePeakCeiling: -1.0,
    compressionRatio: 3.5,
    thresholdDb: -16.0,
    stereoSpread: 1.2,
    badge: 'MOBILE LOUDNESS',
    description: 'High-density commercial punch ensuring maximum voice intelligibility on phone speakers.',
  },
  {
    id: 'youtube-master',
    name: 'YouTube Standard Master',
    platform: 'YouTube Shorts & Longform',
    targetLUFS: -14.0,
    truePeakCeiling: -1.0,
    compressionRatio: 2.8,
    thresholdDb: -18.0,
    stereoSpread: 1.15,
    badge: 'AES STANDARD',
    description: 'Industry standard for YouTube. Prevents algorithmic loudness penalty down-ranking.',
  },
  {
    id: 'podcast-ebu',
    name: 'Broadcast Speech EBU R128',
    platform: 'Podcasts & Spotify / Apple',
    targetLUFS: -16.0,
    truePeakCeiling: -1.0,
    compressionRatio: 2.2,
    thresholdDb: -22.0,
    stereoSpread: 1.0,
    badge: 'EBU R128',
    description: 'Pristine acoustic dynamic range with warm proximity and non-fatiguing long listening comfort.',
  },
  {
    id: 'club-hype',
    name: 'Max Competitive Hype',
    platform: 'EDM / High-Energy Promos',
    targetLUFS: -10.0,
    truePeakCeiling: -0.5,
    compressionRatio: 4.5,
    thresholdDb: -14.0,
    stereoSpread: 1.35,
    badge: 'AGGRESSIVE',
    description: 'Ultra-compressed brickwall mastering for music drops and chaotic meme edits.',
  },
];

export const DEFAULT_MASTERING_PROFILE = MASTERING_PROFILES[0];

/**
 * Calculates estimated loudness boost in Decibels to hit target LUFS from baseline
 */
export function calculateLoudnessOffset(currentEstimatedLUFS: number, targetLUFS: number): number {
  return parseFloat((targetLUFS - currentEstimatedLUFS).toFixed(1));
}
