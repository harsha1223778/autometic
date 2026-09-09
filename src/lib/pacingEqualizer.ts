export interface VisualEvent {
  timestamp: number;
  type: string;
  name: string;
}

export interface VisualLullGap {
  startTime: number;
  endTime: number;
  duration: number;
  severity: 'moderate' | 'critical';
  suggestedAction: 'inject-broll' | 'punch-in-zoom' | 'kinetic-text-burst' | 'sfx-riser';
  actionDescription: string;
}

export interface PacingDensityReport {
  overallDensityScore: number; // 0 to 100
  pacingHealth: 'optimal' | 'monotonous' | 'overcrowded';
  averageCutIntervalSeconds: number;
  totalVisualEvents: number;
  lullGaps: VisualLullGap[];
  suggestedAdditionsCount: number;
  recommendations: string[];
}

export function evaluatePacingDensity(
  durationSeconds: number = 30,
  operations: Array<{ type: string; name?: string; details?: any }> = [],
  hasActiveSubtitles: boolean = true
): PacingDensityReport {
  const safeDuration = Math.max(3, durationSeconds);
  const events: VisualEvent[] = [
    { timestamp: 0, type: 'video-start', name: 'Opening Frame' }
  ];

  operations.forEach(op => {
    if (op.details?.startTime !== undefined) {
      events.push({
        timestamp: Number(op.details.startTime),
        type: op.type,
        name: op.name || op.type
      });
    }
  });

  if (hasActiveSubtitles) {
    // Word/phrase transitions add visual movement every ~2.5s
    for (let t = 2.5; t < safeDuration; t += 2.5) {
      events.push({
        timestamp: t,
        type: 'subtitle-cadence',
        name: 'Subtitle Phrase'
      });
    }
  }

  events.push({ timestamp: safeDuration, type: 'video-end', name: 'Closing Frame' });

  // Sort events chronologically
  events.sort((a, b) => a.timestamp - b.timestamp);

  // Detect gaps > 3.2 seconds
  const lullGaps: VisualLullGap[] = [];
  const maxAllowableLull = 3.2;

  for (let i = 0; i < events.length - 1; i++) {
    const start = events[i].timestamp;
    const end = events[i + 1].timestamp;
    const gap = end - start;

    if (gap > maxAllowableLull) {
      const midPoint = start + gap / 2;
      const isEarlyHook = midPoint < 6;
      lullGaps.push({
        startTime: Math.round(start * 10) / 10,
        endTime: Math.round(end * 10) / 10,
        duration: Math.round(gap * 10) / 10,
        severity: gap > 5.0 ? 'critical' : 'moderate',
        suggestedAction: isEarlyHook ? 'inject-broll' : 'punch-in-zoom',
        actionDescription: isEarlyHook
          ? `Static visual gap (${gap.toFixed(1)}s) during critical hook window. Inject contextual B-roll.`
          : `Monotonous static pacing (${gap.toFixed(1)}s). Add 1.2x camera punch-in zoom.`
      });
    }
  }

  const avgInterval = events.length > 1 ? safeDuration / (events.length - 1) : safeDuration;
  let pacingHealth: PacingDensityReport['pacingHealth'] = 'optimal';
  if (lullGaps.length > 2 || avgInterval > 4.0) pacingHealth = 'monotonous';
  else if (avgInterval < 1.0) pacingHealth = 'overcrowded';

  const baseScore = 95 - lullGaps.length * 12;
  const overallDensityScore = Math.max(35, Math.min(99, Math.round(baseScore)));

  const recommendations: string[] = [];
  if (lullGaps.some(g => g.startTime < 4)) {
    recommendations.push('First 4 seconds contain visual pause. Add kinetic text or B-roll to secure high retention.');
  }
  if (lullGaps.length > 0) {
    recommendations.push(`Detected ${lullGaps.length} visual pacing lulls. Auto-insert cutaways at recommended markers.`);
  } else {
    recommendations.push('Visual pacing is energetic and maintains viral retention cadence (sub-3s changes).');
  }

  return {
    overallDensityScore,
    pacingHealth,
    averageCutIntervalSeconds: Math.round(avgInterval * 10) / 10,
    totalVisualEvents: events.length,
    lullGaps,
    suggestedAdditionsCount: lullGaps.length,
    recommendations
  };
}
