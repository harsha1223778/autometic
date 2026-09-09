export interface AudioBeatMarker {
  index: number;
  timeSeconds: number;
  isDownbeat: boolean; // 1st beat of measure (bar)
  isDrop: boolean; // Bass drop / climax transition
  energyScore: number; // 0.0 to 1.0
  suggestedCutType: 'jump-cut' | 'broll-switch' | 'camera-shake' | 'transition-whip';
}

export interface BeatAnalysisReport {
  bpm: number;
  beatCount: number;
  downbeatCount: number;
  dropTimestamps: number[];
  beats: AudioBeatMarker[];
  recommendedTransitionCadence: string;
}

export const COMMON_MUSIC_BPMS = [
  { genre: 'Lofi & Ambient', bpm: 85, vibe: 'Relaxed & Contemplative' },
  { genre: 'Hip Hop & Boom Bap', bpm: 95, vibe: 'Punchy & Confident' },
  { genre: 'Modern Pop & Trap', bpm: 120, vibe: 'Upbeat & Engaging' },
  { genre: 'EDM & House Hype', bpm: 128, vibe: 'Peak Adrenaline & Speed' },
  { genre: 'Phonk & Drift Bass', bpm: 140, vibe: 'Ultra High-Tension Viral' }
];

export function generateBeatSyncGrid(
  durationSeconds: number = 30,
  bpm: number = 120,
  offsetSeconds: number = 0.15
): BeatAnalysisReport {
  const safeDuration = Math.max(2, durationSeconds);
  const secondsPerBeat = 60 / Math.max(40, Math.min(220, bpm));
  const beats: AudioBeatMarker[] = [];
  const dropTimestamps: number[] = [];

  let currentTime = offsetSeconds;
  let beatIndex = 0;

  // Major drops typically occur at bar 8, 16, or around 25-30% and 75% marks
  const dropWindows = [safeDuration * 0.28, safeDuration * 0.72];

  while (currentTime < safeDuration) {
    const isDownbeat = beatIndex % 4 === 0;
    const isDropCandidate = dropWindows.some(dw => Math.abs(currentTime - dw) < secondsPerBeat * 1.2);

    let energyScore = 0.4;
    if (isDownbeat) energyScore += 0.3;
    if (isDropCandidate) energyScore += 0.3;

    const isDrop = isDropCandidate && isDownbeat;
    if (isDrop) dropTimestamps.push(Math.round(currentTime * 100) / 100);

    let suggestedCutType: AudioBeatMarker['suggestedCutType'] = 'jump-cut';
    if (isDrop) suggestedCutType = 'camera-shake';
    else if (isDownbeat) suggestedCutType = 'transition-whip';
    else if (energyScore > 0.6) suggestedCutType = 'broll-switch';

    beats.push({
      index: beatIndex + 1,
      timeSeconds: Math.round(currentTime * 100) / 100,
      isDownbeat,
      isDrop,
      energyScore: Math.min(1.0, Math.round(energyScore * 100) / 100),
      suggestedCutType
    });

    currentTime += secondsPerBeat;
    beatIndex++;
  }

  const cadenceStr = bpm > 125 ? 'Fast-Paced (Cut every 2 beats / 1s)' : 'Standard (Cut every 4 beats / 2s)';

  return {
    bpm,
    beatCount: beats.length,
    downbeatCount: beats.filter(b => b.isDownbeat).length,
    dropTimestamps,
    beats,
    recommendedTransitionCadence: cadenceStr
  };
}

export function snapTimestampToNearestBeat(
  timestamp: number,
  beats: AudioBeatMarker[],
  toleranceSeconds: number = 0.35
): { snappedTime: number; snappedToBeat: boolean; beatMarker?: AudioBeatMarker } {
  if (!beats || beats.length === 0) {
    return { snappedTime: timestamp, snappedToBeat: false };
  }

  let closest = beats[0];
  let minDiff = Math.abs(timestamp - closest.timeSeconds);

  for (let i = 1; i < beats.length; i++) {
    const diff = Math.abs(timestamp - beats[i].timeSeconds);
    if (diff < minDiff) {
      minDiff = diff;
      closest = beats[i];
    }
  }

  if (minDiff <= toleranceSeconds) {
    return {
      snappedTime: closest.timeSeconds,
      snappedToBeat: true,
      beatMarker: closest
    };
  }

  return { snappedTime: timestamp, snappedToBeat: false };
}
