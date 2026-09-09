/**
 * Dynamic Kinetic Typography & Per-Word Animation Engine
 * Computes micro-physics transforms (elastic scale, glow pulse, wave wiggle, flame jitter)
 * for word-level karaoke subtitles to achieve high-engagement viral retention.
 */

export interface KineticPreset {
  id: string;
  name: string;
  badge: string;
  icon: string;
  description: string;
}

export const KINETIC_PRESETS: KineticPreset[] = [
  {
    id: 'pop-bounce',
    name: 'Pop & Elastic Bounce',
    badge: 'VIRAL OVERSHOOT',
    icon: '💥',
    description: 'Energetic scale overshoot (1.25x) that snaps into place with rubber-band elasticity.',
  },
  {
    id: 'neon-pulse',
    name: 'Neon Cyber Pulse',
    badge: 'LUMINESCENT',
    icon: '⚡',
    description: 'Dynamic luminescent radial glow with continuous breathing cyan-purple hue cycle.',
  },
  {
    id: 'flame-jitter',
    name: 'Flame Keyword Shake',
    badge: 'HIGH INTENSITY',
    icon: '🔥',
    description: 'Chaotic micro-shake on intense keywords to convey explosive revelations.',
  },
  {
    id: 'wiggle-wave',
    name: 'Sinusoidal Wiggle Wave',
    badge: 'PLAYFUL',
    icon: '🌊',
    description: 'Smooth harmonic floating baseline wave running across individual letters.',
  },
  {
    id: 'slide-up-snap',
    name: 'Slide-Up Snap Entry',
    badge: 'CLEAN CRISP',
    icon: '🚀',
    description: 'Fast upward translation from bottom baseline with subtle inertia settling.',
  },
];

export interface KineticTransform {
  scale: number;
  translateY: number;
  translateX: number;
  rotate: number; // in radians
  glowBlur: number;
  glowColor: string;
}

/**
 * Calculates transform offsets for a word given progress (0.0 = word start, 1.0 = word end)
 */
export function calculateKineticTransform(
  presetId: string,
  progress: number
): KineticTransform {
  const p = Math.max(0, Math.min(1, progress));

  switch (presetId) {
    case 'pop-bounce': {
      // Overshoot curve: starts at 0.7, peaks at 1.25 around p = 0.25, then settles to 1.10
      let scale = 1.0;
      if (p < 0.25) {
        scale = 0.7 + (p / 0.25) * 0.55; // Up to 1.25
      } else {
        const settle = (p - 0.25) / 0.75;
        scale = 1.25 - settle * 0.15; // Settles to 1.10
      }
      return { scale, translateY: -Math.sin(p * Math.PI) * 4, translateX: 0, rotate: 0, glowBlur: 10, glowColor: 'rgba(255, 230, 0, 0.7)' };
    }

    case 'neon-pulse': {
      // Continuous pulse
      const pulse = 1.05 + Math.sin(p * Math.PI * 4) * 0.08;
      const glowBlur = 12 + Math.sin(p * Math.PI * 4) * 8;
      return { scale: pulse, translateY: 0, translateX: 0, rotate: 0, glowBlur, glowColor: 'rgba(34, 211, 238, 0.9)' };
    }

    case 'flame-jitter': {
      // High frequency jitter
      const jitterX = (Math.sin(p * 50) * 2.5);
      const jitterY = (Math.cos(p * 40) * 2.0);
      const rot = (Math.sin(p * 45) * 0.04);
      return { scale: 1.15, translateY: jitterY, translateX: jitterX, rotate: rot, glowBlur: 14, glowColor: 'rgba(239, 68, 68, 0.85)' };
    }

    case 'wiggle-wave': {
      // Sinusoidal floating
      const waveY = Math.sin(p * Math.PI * 2) * 5;
      const waveRot = Math.cos(p * Math.PI * 2) * 0.05;
      return { scale: 1.08, translateY: waveY, translateX: 0, rotate: waveRot, glowBlur: 8, glowColor: 'rgba(16, 185, 129, 0.6)' };
    }

    case 'slide-up-snap': {
      // Upward entry
      const enterPhase = Math.min(1, p / 0.25);
      const ease = 1 - Math.pow(1 - enterPhase, 3);
      const translateY = (1 - ease) * 16;
      return { scale: 1.1, translateY: -translateY, translateX: 0, rotate: 0, glowBlur: 8, glowColor: 'rgba(255, 255, 255, 0.5)' };
    }

    default:
      return { scale: 1.0, translateY: 0, translateX: 0, rotate: 0, glowBlur: 0, glowColor: 'transparent' };
  }
}
