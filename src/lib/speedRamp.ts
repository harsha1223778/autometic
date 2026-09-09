/**
 * Speed Ramping & Cinematic Slow-Motion Studio for EditFlow
 * Dynamically adjusts video velocity curves with pitch preservation.
 */

export interface SpeedRampPreset {
  id: string;
  name: string;
  badge: string;
  icon: string;
  description: string;
  baseSpeed: number;
}

export const SPEED_RAMP_PRESETS: SpeedRampPreset[] = [
  {
    id: 'normal',
    name: 'Standard Speed',
    badge: '1.0x',
    icon: '▶️',
    description: 'Natural 100% real-time playback velocity.',
    baseSpeed: 1.0,
  },
  {
    id: 'bullet-time',
    name: 'Bullet Time Curve',
    badge: '⚡ 2.0x → 0.35x',
    icon: '🎯',
    description: 'High-speed intro, dramatic ultra-slow-mo center, and fast exit snap.',
    baseSpeed: 1.0,
  },
  {
    id: 'slow-mo-apex',
    name: 'Cinematic Slow Apex',
    badge: '🎬 0.4x Apex',
    icon: '🐢',
    description: 'Gentle deceleration to 0.4x around the climactic action point.',
    baseSpeed: 0.6,
  },
  {
    id: 'montage-fast',
    name: 'Montage Rush',
    badge: '🚀 2.0x Rush',
    icon: '⏩',
    description: 'Fast energetic time compression for montage hooks.',
    baseSpeed: 2.0,
  },
  {
    id: 'constant-0.5x',
    name: 'Half Speed Slow-Mo',
    badge: '0.5x',
    icon: '⏳',
    description: 'Constant 50% slow motion with pitch-corrected vocals.',
    baseSpeed: 0.5,
  },
  {
    id: 'constant-1.5x',
    name: 'Snappy Creator Pace',
    badge: '1.5x',
    icon: '⚡',
    description: 'Snappy 1.5x speed popular for rapid tutorials.',
    baseSpeed: 1.5,
  },
];

/**
 * Calculates current instantaneous playback speed based on active velocity curve and time progress.
 */
export function calculateInstantPlaybackRate(
  presetId: string,
  currentTime: number,
  totalDuration: number
): number {
  if (!presetId || presetId === 'normal') return 1.0;
  const progress = totalDuration > 0 ? Math.max(0, Math.min(1, currentTime / totalDuration)) : 0;

  switch (presetId) {
    case 'bullet-time': {
      // 0..0.3: 2.0x | 0.3..0.7: dips to 0.35x | 0.7..1.0: 1.8x
      if (progress < 0.3) return 2.0;
      if (progress > 0.7) return 1.8;
      // Parabolic dip at center progress = 0.5
      const centerFactor = 1 - Math.sin((progress - 0.3) / 0.4 * Math.PI);
      return Math.max(0.35, 0.35 + centerFactor * 1.4);
    }

    case 'slow-mo-apex': {
      // Dips smoothly to 0.4x at midpoint
      const dip = Math.sin(progress * Math.PI);
      return Math.max(0.4, 1.0 - dip * 0.6);
    }

    case 'montage-fast': {
      // Starts fast 2.2x and settles to 1.0x
      return Math.max(1.0, 2.2 - progress * 1.2);
    }

    case 'constant-0.5x':
      return 0.5;

    case 'constant-1.5x':
      return 1.5;

    default:
      return 1.0;
  }
}

/**
 * Applies playback rate to HTMLMediaElement with vocal pitch correction.
 */
export function applyPlaybackSpeed(
  mediaElement: HTMLMediaElement | null,
  speed: number,
  preservePitch: boolean = true
): void {
  if (!mediaElement) return;
  try {
    const clampedSpeed = Math.max(0.25, Math.min(4.0, speed));
    mediaElement.playbackRate = clampedSpeed;
    (mediaElement as any).preservesPitch = preservePitch;
    (mediaElement as any).mozPreservesPitch = preservePitch;
    (mediaElement as any).webkitPreservesPitch = preservePitch;
  } catch (err) {
    console.warn('Playback rate application failed:', err);
  }
}
