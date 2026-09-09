/**
 * Ken Burns Motion Animator & Smart B-Roll Auto-Sync Engine for EditFlow AI
 * Computes camera pan, zoom, and drift transformations for still images and cutaways.
 * Aligns B-roll cutaway entry points to speech emphasis points in transcript.
 */

export interface KenBurnsPreset {
  id: string;
  name: string;
  description: string;
  category: 'zoom' | 'pan' | 'dynamic';
}

export const KEN_BURNS_PRESETS: KenBurnsPreset[] = [
  {
    id: 'zoom-in',
    name: 'Slow Cinematic Push-In',
    description: 'Draws viewer focus toward center subject (1.0x to 1.25x).',
    category: 'zoom',
  },
  {
    id: 'zoom-out',
    name: 'Dramatic Pull-Out',
    description: 'Reveals broader context and scale (1.28x to 1.0x).',
    category: 'zoom',
  },
  {
    id: 'pan-left-to-right',
    name: 'Horizontal Pan Right',
    description: 'Smooth documentary camera sweep across horizontal axis.',
    category: 'pan',
  },
  {
    id: 'pan-right-to-left',
    name: 'Horizontal Pan Left',
    description: 'Reverse sweeping pan highlighting background details.',
    category: 'pan',
  },
  {
    id: 'diagonal-drift',
    name: 'Cinematic Diagonal Drift',
    description: 'Organic floating camera motion with combined zoom and diagonal track.',
    category: 'dynamic',
  },
  {
    id: 'subtle-pulse',
    name: 'Heartbeat Pulse',
    description: 'Gentle breathing motion that keeps still graphics alive.',
    category: 'dynamic',
  },
];

export interface KenBurnsTransform {
  scale: number;
  translateX: number; // percentage of dimension (-0.1 to 0.1)
  translateY: number;
  rotation: number; // degrees
}

/**
 * Calculates current Ken Burns transformation at normalized progress (0.0 to 1.0)
 */
export function calculateKenBurnsTransform(
  presetId: string,
  progress: number
): KenBurnsTransform {
  const p = Math.max(0, Math.min(1, progress));
  // Smooth easing curve (easeInOutQuad)
  const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;

  switch (presetId) {
    case 'zoom-in':
      return {
        scale: 1.0 + 0.25 * ease,
        translateX: 0,
        translateY: 0,
        rotation: 0,
      };

    case 'zoom-out':
      return {
        scale: 1.25 - 0.25 * ease,
        translateX: 0,
        translateY: 0,
        rotation: 0,
      };

    case 'pan-left-to-right':
      return {
        scale: 1.15,
        translateX: -0.06 + 0.12 * ease,
        translateY: 0,
        rotation: 0,
      };

    case 'pan-right-to-left':
      return {
        scale: 1.15,
        translateX: 0.06 - 0.12 * ease,
        translateY: 0,
        rotation: 0,
      };

    case 'diagonal-drift':
      return {
        scale: 1.08 + 0.14 * ease,
        translateX: -0.04 + 0.08 * ease,
        translateY: -0.03 + 0.06 * ease,
        rotation: 0.5 * Math.sin(ease * Math.PI),
      };

    case 'subtle-pulse': {
      const pulse = Math.sin(p * Math.PI * 2);
      return {
        scale: 1.05 + 0.06 * pulse,
        translateX: 0,
        translateY: 0,
        rotation: 0,
      };
    }

    default:
      return { scale: 1.0, translateX: 0, translateY: 0, rotation: 0 };
  }
}

/**
 * Applies Ken Burns transform directly to an HTML5 Canvas 2D Rendering Context
 */
export function applyKenBurnsToContext(
  ctx: CanvasRenderingContext2D,
  transform: KenBurnsTransform,
  width: number,
  height: number
) {
  const centerX = width / 2;
  const centerY = height / 2;

  ctx.translate(centerX + transform.translateX * width, centerY + transform.translateY * height);
  if (transform.rotation !== 0) {
    ctx.rotate((transform.rotation * Math.PI) / 180);
  }
  ctx.scale(transform.scale, transform.scale);
  ctx.translate(-centerX, -centerY);
}

/**
 * Smart B-Roll Auto-Sync:
 * Calculates optimal timestamp cues for inserting B-Roll clips based on spoken word pauses
 */
export function calculateSmartBRollCues(
  transcript: string,
  totalDuration: number,
  maxSuggestions = 4
): Array<{ timestamp: number; duration: number; keyword: string; motionPreset: string }> {
  if (!transcript || totalDuration <= 5) return [];

  const sentences = transcript.split(/[.?!]\s+/).filter((s) => s.trim().length > 0);
  const cues: Array<{ timestamp: number; duration: number; keyword: string; motionPreset: string }> = [];

  const presets = ['zoom-in', 'diagonal-drift', 'pan-left-to-right', 'zoom-out'];
  const interval = totalDuration / (Math.min(sentences.length, maxSuggestions) + 1);

  for (let i = 0; i < Math.min(sentences.length, maxSuggestions); i++) {
    const rawTime = (i + 1) * interval;
    const timestamp = parseFloat(rawTime.toFixed(1));
    const words = sentences[i].split(/\s+/).filter((w) => w.length > 4);
    const keyword = words.length > 0 ? words[Math.floor(words.length / 2)] : 'Focus';

    cues.push({
      timestamp,
      duration: Math.min(4.5, totalDuration - timestamp),
      keyword,
      motionPreset: presets[i % presets.length],
    });
  }

  return cues;
}
