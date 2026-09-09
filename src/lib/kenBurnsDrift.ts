export type KenBurnsTrajectoryType =
  | 'diagonal-down-right'
  | 'diagonal-up-left'
  | 'panoramic-left-right'
  | 'panoramic-right-left'
  | 'vertical-reveal-up'
  | 'vertical-settle-down'
  | 'radial-push-in'
  | 'radial-pull-out';

export interface KenBurnsProfile {
  id: KenBurnsTrajectoryType;
  name: string;
  category: 'cinematic' | 'dramatic' | 'documentary';
  description: string;
  startScale: number;
  endScale: number;
  startX: number; // percentage (-50 to +50)
  endX: number;
  startY: number; // percentage (-50 to +50)
  endY: number;
}

export const KEN_BURNS_TRAJECTORIES: KenBurnsProfile[] = [
  {
    id: 'diagonal-down-right',
    name: 'Diagonal Push (TL → BR)',
    category: 'cinematic',
    description: 'Smooth diagonal glide from top-left into bottom-right focal area',
    startScale: 1.05,
    endScale: 1.25,
    startX: -3,
    endX: 3,
    startY: -3,
    endY: 3
  },
  {
    id: 'diagonal-up-left',
    name: 'Diagonal Ascend (BR → TL)',
    category: 'cinematic',
    description: 'Inspiring ascension from bottom-right up towards top-left hero focus',
    startScale: 1.25,
    endScale: 1.05,
    startX: 3,
    endX: -3,
    startY: 3,
    endY: -3
  },
  {
    id: 'panoramic-left-right',
    name: 'Panoramic Left to Right',
    category: 'documentary',
    description: 'Steady lateral glide across landscapes, text banners, or horizon',
    startScale: 1.15,
    endScale: 1.15,
    startX: -5,
    endX: 5,
    startY: 0,
    endY: 0
  },
  {
    id: 'panoramic-right-left',
    name: 'Panoramic Right to Left',
    category: 'documentary',
    description: 'Reverse sweeping survey across the visual field',
    startScale: 1.15,
    endScale: 1.15,
    startX: 5,
    endX: -5,
    startY: 0,
    endY: 0
  },
  {
    id: 'vertical-reveal-up',
    name: 'Vertical Reveal (Tilt Up)',
    category: 'dramatic',
    description: 'Upward tilting motion uncovering tall structures, figures, or headlines',
    startScale: 1.12,
    endScale: 1.18,
    startX: 0,
    endX: 0,
    startY: 4,
    endY: -4
  },
  {
    id: 'vertical-settle-down',
    name: 'Vertical Settle (Tilt Down)',
    category: 'dramatic',
    description: 'Downward settle grounding the viewer into the scene foundation',
    startScale: 1.18,
    endScale: 1.12,
    startX: 0,
    endX: 0,
    startY: -4,
    endY: 4
  },
  {
    id: 'radial-push-in',
    name: 'Radial Dramatic Push-In',
    category: 'dramatic',
    description: 'Centered forward zoom intensifying focus and emotional stakes',
    startScale: 1.0,
    endScale: 1.35,
    startX: 0,
    endX: 0,
    startY: 0,
    endY: 0
  },
  {
    id: 'radial-pull-out',
    name: 'Radial Wide Pull-Back',
    category: 'cinematic',
    description: 'Expansive backward pull revealing the broader context and grandeur',
    startScale: 1.35,
    endScale: 1.05,
    startX: 0,
    endX: 0,
    startY: 0,
    endY: 0
  }
];

export interface KenBurnsTransform {
  scale: number;
  translateX: number; // percentage
  translateY: number; // percentage
  cssTransform: string;
}

// Smooth cubic ease-in-out
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function getKenBurnsTransform(
  trajectoryId: string = 'diagonal-down-right',
  rawProgress: number = 0
): KenBurnsTransform {
  const profile = KEN_BURNS_TRAJECTORIES.find(t => t.id === trajectoryId) || KEN_BURNS_TRAJECTORIES[0];
  const t = Math.max(0, Math.min(1, rawProgress));
  const eased = easeInOutCubic(t);

  const scale = profile.startScale + (profile.endScale - profile.startScale) * eased;
  const translateX = profile.startX + (profile.endX - profile.startX) * eased;
  const translateY = profile.startY + (profile.endY - profile.startY) * eased;

  return {
    scale: Math.round(scale * 1000) / 1000,
    translateX: Math.round(translateX * 100) / 100,
    translateY: Math.round(translateY * 100) / 100,
    cssTransform: `scale(${scale.toFixed(3)}) translate(${translateX.toFixed(2)}%, ${translateY.toFixed(2)}%)`
  };
}
