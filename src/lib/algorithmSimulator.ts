export type SocialPlatformType = 'tiktok' | 'youtube_shorts' | 'instagram_reels';

export interface PlatformAlgorithmMetrics {
  platform: SocialPlatformType;
  name: string;
  icon: string;
  reachMultiplier: string;
  projectedViewsRange: string;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  retentionWeightPct: number;
  shareWeightPct: number;
  loopWeightPct: number;
  algorithmicFitScore: number; // 0-100
}

export interface AlgorithmicLever {
  name: string;
  score: number; // 0-100
  benchmark: number; // typical viral threshold
  status: 'optimal' | 'moderate' | 'critical';
  insight: string;
}

export interface SocialAlgorithmSimulationReport {
  overallViralScore: number; // 0 - 100
  primaryRecommendation: string;
  platforms: PlatformAlgorithmMetrics[];
  levers: AlgorithmicLever[];
  viralChecklist: { item: string; passed: boolean; tip: string }[];
}

export function simulateSocialAlgorithms(
  durationSeconds: number = 30,
  hasSubtitles: boolean = true,
  hasMusic: boolean = true,
  hasStockOverlays: boolean = true,
  operationsCount: number = 5
): SocialAlgorithmSimulationReport {
  const isShort = durationSeconds <= 35;
  const editDensityFactor = Math.min(1.0, operationsCount / 8);

  // 1. Calculate Lever Scores
  const hookScore = Math.min(98, Math.round(75 + (hasSubtitles ? 15 : 0) + (operationsCount > 2 ? 8 : 0)));
  const retentionScore = Math.min(96, Math.round(68 + (hasSubtitles ? 14 : 0) + (hasStockOverlays ? 12 : 0)));
  const loopabilityScore = Math.min(94, Math.round(isShort ? 88 : 65));
  const shareProbabilityScore = Math.min(92, Math.round(72 + (hasSubtitles ? 10 : 0) + (hasMusic ? 8 : 0)));
  const audioResonanceScore = Math.min(99, Math.round(hasMusic ? 92 : 45));

  const overallViralScore = Math.round(
    (hookScore * 0.3) +
    (retentionScore * 0.25) +
    (loopabilityScore * 0.15) +
    (shareProbabilityScore * 0.15) +
    (audioResonanceScore * 0.15)
  );

  const platforms: PlatformAlgorithmMetrics[] = [
    {
      platform: 'tiktok',
      name: 'TikTok FYP Feed',
      icon: '🎵',
      reachMultiplier: overallViralScore > 85 ? '4.8x Viral Burst' : '1.8x Moderate Seed',
      projectedViewsRange: overallViralScore > 85 ? '75K – 350K' : '8K – 35K',
      grade: overallViralScore >= 90 ? 'A+' : overallViralScore >= 80 ? 'A' : overallViralScore >= 70 ? 'B' : 'C',
      retentionWeightPct: 40,
      shareWeightPct: 30,
      loopWeightPct: 30,
      algorithmicFitScore: Math.min(99, Math.round((hookScore * 0.4) + (loopabilityScore * 0.3) + (retentionScore * 0.3)))
    },
    {
      platform: 'youtube_shorts',
      name: 'YouTube Shorts Shelf',
      icon: '▶️',
      reachMultiplier: overallViralScore > 85 ? '5.2x Long-Tail Evergreen' : '2.1x Steady Flow',
      projectedViewsRange: overallViralScore > 85 ? '100K – 500K' : '12K – 45K',
      grade: overallViralScore >= 88 ? 'A+' : overallViralScore >= 78 ? 'A' : overallViralScore >= 68 ? 'B' : 'C',
      retentionWeightPct: 55,
      shareWeightPct: 20,
      loopWeightPct: 25,
      algorithmicFitScore: Math.min(99, Math.round((retentionScore * 0.6) + (hookScore * 0.4)))
    },
    {
      platform: 'instagram_reels',
      name: 'Instagram Reels Explore',
      icon: '📸',
      reachMultiplier: overallViralScore > 85 ? '3.9x DM Velocity' : '1.6x Local Network',
      projectedViewsRange: overallViralScore > 85 ? '50K – 220K' : '5K – 20K',
      grade: overallViralScore >= 85 ? 'A+' : overallViralScore >= 75 ? 'A' : overallViralScore >= 65 ? 'B' : 'C',
      retentionWeightPct: 30,
      shareWeightPct: 50,
      loopWeightPct: 20,
      algorithmicFitScore: Math.min(99, Math.round((shareProbabilityScore * 0.5) + (audioResonanceScore * 0.3) + (hookScore * 0.2)))
    }
  ];

  const levers: AlgorithmicLever[] = [
    {
      name: '3-Second Hook Retention',
      score: hookScore,
      benchmark: 80,
      status: hookScore >= 80 ? 'optimal' : 'moderate',
      insight: 'First 3 seconds are critical to avoid user swipe-away penalty.'
    },
    {
      name: 'Pacing & Visual Density',
      score: retentionScore,
      benchmark: 75,
      status: retentionScore >= 75 ? 'optimal' : 'moderate',
      insight: 'Frequent visual updates every 2.5–3.0 seconds maintain watch velocity.'
    },
    {
      name: 'Loopability Factor',
      score: loopabilityScore,
      benchmark: 70,
      status: loopabilityScore >= 70 ? 'optimal' : 'moderate',
      insight: 'Seamless ending-to-beginning audio transition triggers repeat views.'
    },
    {
      name: 'Direct Message (DM) Shareability',
      score: shareProbabilityScore,
      benchmark: 72,
      status: shareProbabilityScore >= 72 ? 'optimal' : 'moderate',
      insight: 'Relatable paradoxes and strong epiphanies drive private share forwarding.'
    },
    {
      name: 'Audio Presence & Mastering',
      score: audioResonanceScore,
      benchmark: 75,
      status: audioResonanceScore >= 75 ? 'optimal' : 'critical',
      insight: 'Normalized LUFS loudness prevents immediate volume drop swipe.'
    }
  ];

  const viralChecklist = [
    { item: 'Dynamic Karaoke Subtitles Active', passed: hasSubtitles, tip: 'Captures 70%+ of sound-off mobile viewers.' },
    { item: 'Target Duration Under 45 Seconds', passed: isShort, tip: 'Shorter clips achieve higher % completion rates.' },
    { item: 'Background Music Track Loaded', passed: hasMusic, tip: 'Drives subconscious acoustic pacing.' },
    { item: 'B-Roll / Cutaway Overlays Applied', passed: hasStockOverlays, tip: 'Resets visual eye focus every 3 seconds.' },
    { item: 'Broadcast Loudness Normalized', passed: true, tip: 'Protects audio clarity on mobile phone speakers.' }
  ];

  let primaryRecommendation = 'Video has excellent structural mechanics for algorithmic amplification.';
  if (!hasSubtitles) {
    primaryRecommendation = 'Enable dynamic subtitles to capture sound-off mobile feed audiences.';
  } else if (!hasMusic) {
    primaryRecommendation = 'Select an energetic music track or soundscape to drive subconscious rhythm.';
  }

  return {
    overallViralScore,
    primaryRecommendation,
    platforms,
    levers,
    viralChecklist
  };
}
