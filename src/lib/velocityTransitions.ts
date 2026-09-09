/**
 * Velocity & Motion Blur Transition Engine for EditFlow Studio
 * Provides high-octane crash zooms, whip pans with synthetic motion blur,
 * rotation snaps, and chromatic glitch shakes for ultra-engaging viral pacing.
 */

export interface VelocityTransitionPreset {
  id: string;
  name: string;
  icon: string;
  description: string;
  defaultDuration: number; // Duration in seconds (e.g. 0.3s)
  category: 'zoom' | 'whip' | 'glitch' | 'spin';
}

export const VELOCITY_TRANSITION_PRESETS: VelocityTransitionPreset[] = [
  {
    id: 'crash-zoom-in',
    name: 'Crash Zoom In',
    icon: '⚡',
    description: 'Explosive forward punch (1.0x to 1.45x) with sudden snap return.',
    defaultDuration: 0.32,
    category: 'zoom',
  },
  {
    id: 'crash-zoom-out',
    name: 'Crash Zoom Out',
    icon: '🔭',
    description: 'Rapid drop back with rapid scale recovery for dramatic impact.',
    defaultDuration: 0.30,
    category: 'zoom',
  },
  {
    id: 'whip-blur-left',
    name: 'Whip Blur Left',
    icon: '◀️',
    description: 'High-speed leftward velocity blur with horizontal momentum.',
    defaultDuration: 0.28,
    category: 'whip',
  },
  {
    id: 'whip-blur-right',
    name: 'Whip Blur Right',
    icon: '▶️',
    description: 'High-speed rightward velocity blur with horizontal momentum.',
    defaultDuration: 0.28,
    category: 'whip',
  },
  {
    id: 'glitch-shake',
    name: 'Glitch Jolt Shake',
    icon: '👾',
    description: 'High frequency chaotic vibration with chromatic distortion.',
    defaultDuration: 0.25,
    category: 'glitch',
  },
  {
    id: 'hyper-spin',
    name: 'Hyper Spin Snap',
    icon: '🔄',
    description: 'Lightning-fast rotational snap pulse with momentum settling.',
    defaultDuration: 0.35,
    category: 'spin',
  },
];

export interface VelocityTransform {
  scale: number;
  translateX: number;
  translateY: number;
  rotation: number; // in radians
  blurPx: number;
  opacity: number;
}

/**
 * Calculates transform offsets for canvas rendering or preview elements.
 * Progress is normalized 0.0 to 1.0 over the transition window.
 */
export function calculateVelocityTransform(
  type: string,
  progress: number,
  width: number = 1080,
  height: number = 1920
): VelocityTransform {
  const p = Math.max(0, Math.min(1, progress));
  // Bell curve bell = sin(p * PI), peaks at 1.0 when p = 0.5
  const bell = Math.sin(p * Math.PI);
  // Quadratic pulse
  const pulse = Math.pow(bell, 1.8);

  switch (type) {
    case 'crash-zoom-in': {
      // Scales up aggressively to 1.45 at peak
      const scale = 1.0 + pulse * 0.45;
      const blurPx = pulse * 4;
      return { scale, translateX: 0, translateY: 0, rotation: 0, blurPx, opacity: 1.0 };
    }

    case 'crash-zoom-out': {
      // Scales down to 0.78 at peak
      const scale = 1.0 - pulse * 0.22;
      const blurPx = pulse * 3;
      return { scale, translateX: 0, translateY: 0, rotation: 0, blurPx, opacity: 1.0 };
    }

    case 'whip-blur-left': {
      // Shifts left up to 40% of width, highest motion blur at center
      const translateX = -Math.sin(p * Math.PI) * (width * 0.35);
      const blurPx = pulse * 14;
      return { scale: 1.0 + pulse * 0.08, translateX, translateY: 0, rotation: -pulse * 0.04, blurPx, opacity: 1.0 };
    }

    case 'whip-blur-right': {
      // Shifts right up to 40% of width
      const translateX = Math.sin(p * Math.PI) * (width * 0.35);
      const blurPx = pulse * 14;
      return { scale: 1.0 + pulse * 0.08, translateX, translateY: 0, rotation: pulse * 0.04, blurPx, opacity: 1.0 };
    }

    case 'glitch-shake': {
      // Rapid pseudo-random high frequency shake
      const jitterX = pulse * (Math.sin(p * 45) * 26);
      const jitterY = pulse * (Math.cos(p * 37) * 20);
      const rot = pulse * (Math.sin(p * 50) * 0.05);
      return { scale: 1.0 + pulse * 0.06, translateX: jitterX, translateY: jitterY, rotation: rot, blurPx: pulse * 2, opacity: 1.0 };
    }

    case 'hyper-spin': {
      // Rotates up to 180 degrees at peak speed and settles
      const rot = Math.sin(p * Math.PI) * (Math.PI * 0.5);
      const scale = 1.0 + pulse * 0.25;
      const blurPx = pulse * 8;
      return { scale, translateX: 0, translateY: 0, rotation: rot, blurPx, opacity: 1.0 };
    }

    default:
      return { scale: 1.0, translateX: 0, translateY: 0, rotation: 0, blurPx: 0, opacity: 1.0 };
  }
}

/**
 * Directly applies velocity transition transform to an active HTML5 2D Canvas.
 */
export function applyVelocityTransition(
  ctx: CanvasRenderingContext2D,
  type: string,
  progress: number,
  width: number,
  height: number
): void {
  if (type === 'none' || progress < 0 || progress > 1) return;

  const transform = calculateVelocityTransform(type, progress, width, height);

  ctx.save();
  // Center anchor
  ctx.translate(width / 2 + transform.translateX, height / 2 + transform.translateY);

  if (transform.rotation !== 0) {
    ctx.rotate(transform.rotation);
  }

  if (transform.scale !== 1.0) {
    ctx.scale(transform.scale, transform.scale);
  }

  ctx.translate(-width / 2, -height / 2);

  // Apply motion blur filter if supported by browser canvas
  if (transform.blurPx > 1) {
    ctx.filter = `blur(${transform.blurPx.toFixed(1)}px)`;
  }
}
