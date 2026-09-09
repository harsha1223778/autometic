/**
 * Motion Transitions & Visual FX Pack for EditFlow Studio
 * Provides cinematic cut transitions and dynamic motion presets for
 * videos, B-roll overlays, and graphic assets.
 */

export interface TransitionPreset {
  id: string;
  name: string;
  icon: string;
  description: string;
  defaultDuration: number; // in seconds (e.g. 0.35s)
}

export interface MotionPreset {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const TRANSITION_PRESETS: TransitionPreset[] = [
  {
    id: 'none',
    name: 'Hard Cut',
    icon: '✂️',
    description: 'Instant frame cut with zero transition latency.',
    defaultDuration: 0,
  },
  {
    id: 'whip-pan',
    name: 'Whip Pan',
    icon: '💨',
    description: 'High-speed horizontal directional motion blur cut.',
    defaultDuration: 0.3,
  },
  {
    id: 'zoom-blur',
    name: 'Zoom Punch',
    icon: '🔍',
    description: 'Explosive radial punch into the center frame.',
    defaultDuration: 0.35,
  },
  {
    id: 'glitch',
    name: 'Cyber Glitch',
    icon: '⚡',
    description: 'RGB chromatic aberration split with digital scanlines.',
    defaultDuration: 0.25,
  },
  {
    id: 'fade-black',
    name: 'Dip to Black',
    icon: '🌑',
    description: 'Cinematic fade to total black and reveal.',
    defaultDuration: 0.4,
  },
  {
    id: 'cross-dissolve',
    name: 'Cross Dissolve',
    icon: '✨',
    description: 'Smooth opacity blending between consecutive scenes.',
    defaultDuration: 0.45,
  },
];

export const MOTION_PRESETS: MotionPreset[] = [
  {
    id: 'static',
    name: 'Static Placement',
    icon: '📌',
    description: 'Remains anchored at fixed position without animation.',
  },
  {
    id: 'ken-burns',
    name: 'Ken Burns Zoom',
    icon: '🔭',
    description: 'Slow continuous cinematic zoom (1.0x to 1.15x).',
  },
  {
    id: 'slide-in-left',
    name: 'Slide In (Left)',
    icon: '⬅️',
    description: 'Smooth cubic-bezier slide in from the left edge.',
  },
  {
    id: 'slide-in-bottom',
    name: 'Slide In (Bottom)',
    icon: '⬆️',
    description: 'Upward slide in from lower viewport with fade.',
  },
  {
    id: 'pop-bounce',
    name: 'Pop & Scale Bounce',
    icon: '💥',
    description: 'Punchy scale-up with dynamic overshoot elasticity.',
  },
];

/**
 * Computes transform properties for an overlay or B-roll element based on its active motion preset
 * and normalized lifetime progress (0.0 to 1.0).
 */
export function computeMotionTransform(
  preset: string,
  progress: number
): { scale: number; translateX: number; translateY: number; opacity: number } {
  // Clamp progress between 0 and 1
  const p = Math.max(0, Math.min(1, progress));

  switch (preset) {
    case 'ken-burns': {
      // Smooth continuous slow zoom from 1.0 to 1.15
      const scale = 1.0 + p * 0.15;
      return { scale, translateX: 0, translateY: 0, opacity: 1.0 };
    }

    case 'slide-in-left': {
      // First 25% of lifetime slides in, remaining 75% stays anchored
      const enterPhase = Math.min(1, p / 0.25);
      // Cubic ease out: 1 - Math.pow(1 - x, 3)
      const ease = 1 - Math.pow(1 - enterPhase, 3);
      const translateX = (1 - ease) * -120; // 120px offset
      const opacity = Math.min(1, enterPhase * 1.5);
      return { scale: 1.0, translateX, translateY: 0, opacity };
    }

    case 'slide-in-bottom': {
      const enterPhase = Math.min(1, p / 0.25);
      const ease = 1 - Math.pow(1 - enterPhase, 3);
      const translateY = (1 - ease) * 100;
      const opacity = Math.min(1, enterPhase * 1.5);
      return { scale: 1.0, translateX: 0, translateY, opacity };
    }

    case 'pop-bounce': {
      const enterPhase = Math.min(1, p / 0.2);
      let scale = 1.0;
      if (enterPhase < 0.6) {
        // scale from 0.4 to 1.15
        scale = 0.4 + (enterPhase / 0.6) * 0.75;
      } else {
        // settle back from 1.15 to 1.0
        const settle = (enterPhase - 0.6) / 0.4;
        scale = 1.15 - settle * 0.15;
      }
      const opacity = Math.min(1, enterPhase * 2);
      return { scale, translateX: 0, translateY: 0, opacity };
    }

    case 'static':
    default:
      return { scale: 1.0, translateX: 0, translateY: 0, opacity: 1.0 };
  }
}

/**
 * Applies transition FX to a 2D canvas context during render compositing.
 * progress is 0.0 (transition start) to 1.0 (transition end).
 */
export function applyCanvasTransitionFX(
  ctx: CanvasRenderingContext2D,
  type: string,
  progress: number,
  width: number,
  height: number
) {
  if (type === 'none' || progress < 0 || progress > 1) return;

  const p = Math.max(0, Math.min(1, progress));

  ctx.save();
  switch (type) {
    case 'whip-pan': {
      // Horizontal motion displacement and directional opacity
      const offset = (Math.sin(p * Math.PI) * width) * 0.15;
      ctx.translate(offset, 0);
      ctx.globalAlpha = 0.85 + Math.cos(p * Math.PI) * 0.15;
      break;
    }

    case 'zoom-blur': {
      // Center scale pulse
      const scale = 1.0 + Math.sin(p * Math.PI) * 0.12;
      ctx.translate(width / 2, height / 2);
      ctx.scale(scale, scale);
      ctx.translate(-width / 2, -height / 2);
      break;
    }

    case 'fade-black': {
      // Dip to black at apex (p = 0.5)
      const blackOpacity = Math.sin(p * Math.PI);
      ctx.fillStyle = `rgba(0, 0, 0, ${blackOpacity * 0.95})`;
      ctx.fillRect(0, 0, width, height);
      break;
    }

    case 'glitch': {
      // Subtle chromatic horizontal glitch slices
      if (p > 0.1 && p < 0.9) {
        const sliceCount = 3;
        for (let i = 0; i < sliceCount; i++) {
          const sliceY = (height / sliceCount) * i + ((p * 100) % 20);
          const sliceHeight = height / 6;
          const shift = (Math.sin(p * 20 + i) * 15);
          ctx.drawImage(ctx.canvas, 0, sliceY, width, sliceHeight, shift, sliceY, width, sliceHeight);
        }
      }
      break;
    }

    case 'cross-dissolve': {
      // Smooth fade
      ctx.globalAlpha = 0.5 + Math.abs(p - 0.5);
      break;
    }
  }
  ctx.restore();
}
