/**
 * Multi-Camera Angle Switching & Dynamic Podcaster Director
 * Provides automated or manual camera switching between Wide Master,
 * Host Close-up, Guest Reaction, and Dynamic Duet Split angles
 * based on conversational cadence and speech turn-taking.
 */

export interface CameraAngle {
  id: string;
  name: string;
  badge: string;
  icon: string;
  description: string;
  cropTransform: {
    scale: number;
    originX: number; // 0.0 to 1.0 (center horizontal point)
    originY: number; // 0.0 to 1.0 (center vertical point)
  };
  layout: 'single' | 'split-vertical' | 'split-horizontal' | 'pip';
}

export const CAMERA_ANGLES: CameraAngle[] = [
  {
    id: 'angle-wide',
    name: 'Wide Master Shot',
    badge: 'FULL STAGE',
    icon: '🎥',
    description: 'Wide master establishing frame showing both conversational participants.',
    cropTransform: { scale: 1.0, originX: 0.5, originY: 0.5 },
    layout: 'single',
  },
  {
    id: 'angle-host',
    name: 'Host Dynamic Focus',
    badge: 'SPEAKER A',
    icon: '🎙️',
    description: 'Punchy tight crop focused on primary speaker / host on the left side of frame.',
    cropTransform: { scale: 1.35, originX: 0.32, originY: 0.45 },
    layout: 'single',
  },
  {
    id: 'angle-guest',
    name: 'Guest Reaction Angle',
    badge: 'SPEAKER B',
    icon: '👤',
    description: 'Close-up camera isolation focused on guest/respondent on the right side of frame.',
    cropTransform: { scale: 1.35, originX: 0.68, originY: 0.45 },
    layout: 'single',
  },
  {
    id: 'angle-split',
    name: 'Dual Podcaster Split',
    badge: 'SPLIT DUAL',
    icon: '👥',
    description: 'Dynamic synchronized split-screen presenting host and guest simultaneously.',
    cropTransform: { scale: 1.15, originX: 0.5, originY: 0.5 },
    layout: 'split-vertical',
  },
];

export interface MultiCamCutCue {
  id: string;
  startTime: number;
  duration: number;
  angleId: string;
  speaker: 'host' | 'guest' | 'both';
  label: string;
}

/**
 * Automatically creates camera switching operations across the duration
 * based on pacing intervals (switching angle every 4 to 7 seconds).
 */
export function generateAutoMultiCamCues(
  totalDuration: number,
  averageCutInterval: number = 5.0
): MultiCamCutCue[] {
  const duration = Math.max(8, totalDuration);
  const cues: MultiCamCutCue[] = [];
  let currentTime = 0;
  let index = 0;

  const angleSequence = [
    { angleId: 'angle-wide', speaker: 'both' as const, label: 'Master Establishing' },
    { angleId: 'angle-host', speaker: 'host' as const, label: 'Host Key Point' },
    { angleId: 'angle-guest', speaker: 'guest' as const, label: 'Guest Reaction' },
    { angleId: 'angle-host', speaker: 'host' as const, label: 'Host Follow-up' },
    { angleId: 'angle-split', speaker: 'both' as const, label: 'Dual Conversation' },
    { angleId: 'angle-wide', speaker: 'both' as const, label: 'Discussion Wrap' },
  ];

  while (currentTime < duration) {
    const seqItem = angleSequence[index % angleSequence.length];
    // Dynamic variance between 4.0s and 6.5s
    const cutDuration = Math.min(
      duration - currentTime,
      Math.max(3.5, averageCutInterval + (Math.sin(index * 1.7) * 1.5))
    );

    cues.push({
      id: `cam-cue-${index + 1}`,
      startTime: parseFloat(currentTime.toFixed(1)),
      duration: parseFloat(cutDuration.toFixed(1)),
      angleId: seqItem.angleId,
      speaker: seqItem.speaker,
      label: seqItem.label,
    });

    currentTime += cutDuration;
    index++;
  }

  return cues;
}

/**
 * Applies multi-camera angle crop and transform to a Canvas 2D rendering context
 */
export function applyCameraAngleTransform(
  ctx: CanvasRenderingContext2D,
  angleId: string,
  width: number,
  height: number
): void {
  const angle = CAMERA_ANGLES.find((a) => a.id === angleId) || CAMERA_ANGLES[0];
  const { scale, originX, originY } = angle.cropTransform;

  if (scale === 1.0 && originX === 0.5 && originY === 0.5) return;

  const focusX = width * originX;
  const focusY = height * originY;

  ctx.translate(focusX, focusY);
  ctx.scale(scale, scale);
  ctx.translate(-focusX, -focusY);
}
