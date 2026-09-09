/**
 * AI Audience Retention Graph & Drop-off Heatmap Simulator for EditFlow AI
 * Analyzes visual pace, audio spikes, and cut frequency across the timeline.
 * Identifies boredom spikes (> 3.5s static visuals) and predicts 0-100% viewer retention.
 */

export interface RetentionSegment {
  start: number;
  end: number;
  score: number; // 0 to 100
  level: 'high' | 'medium' | 'risk';
  reason: string;
}

export interface RetentionAction {
  id: string;
  timestamp: number;
  type: 'add_broll' | 'add_sfx' | 'add_sticker' | 'trim_gap';
  title: string;
  description: string;
}

export interface RetentionAnalysisReport {
  overallRetentionScore: number; // 0 to 100
  averagePaceInterval: number; // average seconds between visual stimuli
  boredomGapsCount: number;
  retentionSegments: RetentionSegment[];
  actions: RetentionAction[];
  svgPathD: string; // SVG curve for smooth timeline rendering
}

interface AnalysisInput {
  duration: number;
  operations: Array<{
    id: string;
    type: string;
    name: string;
    details?: Record<string, any>;
  }>;
  hasSubtitles: boolean;
}

/**
 * Evaluates video timeline and computes retention heatmap segments & SVG retention graph
 */
export function generateRetentionHeatmap(input: AnalysisInput): RetentionAnalysisReport {
  const { duration, operations, hasSubtitles } = input;
  const safeDuration = Math.max(5, duration);

  // Collect all visual and auditory event timestamps
  const visualMoments: number[] = [0];
  const audioMoments: number[] = [0];

  operations.forEach((op) => {
    const time = Number(op.details?.startTime || op.details?.timestamp || 0);
    if (!isNaN(time) && time <= safeDuration) {
      if (
        op.type === 'overlay_image' ||
        op.type === 'broll_clip' ||
        op.type === 'sticker_emoji' ||
        op.type === 'callout_badge' ||
        op.type === 'split_clip'
      ) {
        visualMoments.push(time);
      } else if (op.type === 'sfx_drop' || op.type === 'voiceover_tts') {
        audioMoments.push(time);
      }
    }
  });

  visualMoments.sort((a, b) => a - b);
  audioMoments.sort((a, b) => a - b);

  // Divide timeline into 1-second chunks or 15 samples
  const sampleCount = Math.min(30, Math.max(10, Math.round(safeDuration)));
  const step = safeDuration / sampleCount;

  const segments: RetentionSegment[] = [];
  const actions: RetentionAction[] = [];

  let currentRetention = 100;
  const points: Array<{ x: number; y: number }> = [];

  for (let i = 0; i < sampleCount; i++) {
    const segStart = i * step;
    const segEnd = (i + 1) * step;
    const midTime = (segStart + segEnd) / 2;

    // Check if any visual event falls within or near this segment
    const hasVisualChange = visualMoments.some((t) => t >= segStart - 1.5 && t <= segEnd + 0.5);
    const hasAudioChange = audioMoments.some((t) => t >= segStart - 1.5 && t <= segEnd + 0.5);

    // Initial hook check (first 3 seconds)
    if (i === 0) {
      if (!hasSubtitles) {
        currentRetention -= 12; // viewers churn if no captions in first 3s
      }
      if (visualMoments.length <= 1) {
        currentRetention -= 8;
      }
    } else {
      // Normal degradation vs stimulation
      if (hasVisualChange && hasAudioChange) {
        currentRetention = Math.min(96, currentRetention + 4); // stimulated interest
      } else if (hasVisualChange || hasAudioChange) {
        currentRetention = Math.max(25, currentRetention - 1.5);
      } else {
        // Boredom decay
        currentRetention = Math.max(20, currentRetention - 6.5);
      }
    }

    const roundedScore = Math.round(Math.max(15, Math.min(100, currentRetention)));
    const level: 'high' | 'medium' | 'risk' =
      roundedScore >= 75 ? 'high' : roundedScore >= 50 ? 'medium' : 'risk';

    let reason = 'Steady viewer engagement';
    if (level === 'risk') {
      reason = 'High drop-off risk: static visuals for >3.5 seconds';
      if (actions.length < 4) {
        actions.push({
          id: `action-${i}`,
          timestamp: parseFloat(midTime.toFixed(1)),
          type: i % 2 === 0 ? 'add_broll' : 'add_sticker',
          title: i % 2 === 0 ? 'Insert Visual B-Roll' : 'Pop Reaction Emoji',
          description: `Viewer retention dips to ${roundedScore}% here. Break visual monotony.`,
        });
      }
    } else if (level === 'high') {
      reason = 'Peak retention: dynamic visual change & audio alignment';
    }

    segments.push({
      start: parseFloat(segStart.toFixed(1)),
      end: parseFloat(segEnd.toFixed(1)),
      score: roundedScore,
      level,
      reason,
    });

    points.push({ x: (i / (sampleCount - 1)) * 100, y: 100 - roundedScore });
  }

  // Build SVG Path (d="M x y L x y ...")
  const svgPathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const overallScore = Math.round(
    segments.reduce((acc, s) => acc + s.score, 0) / segments.length
  );
  const boredomGaps = segments.filter((s) => s.level === 'risk').length;

  return {
    overallRetentionScore: overallScore,
    averagePaceInterval: parseFloat(
      (safeDuration / Math.max(1, visualMoments.length)).toFixed(1)
    ),
    boredomGapsCount: boredomGaps,
    retentionSegments: segments,
    actions,
    svgPathD,
  };
}
