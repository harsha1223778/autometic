/**
 * Motion Blur & Dynamic Camera Shake Simulator for EditFlow AI
 * Computes high-impact camera shake physics and directional motion blur vectors
 * for Foley sound hits, bass drops, sticker pops, and fast transitions.
 */

export interface CameraShakeImpulse {
  id: string;
  type: 'quick-jolt' | 'bass-drop-impact' | 'earthquake-rumble' | 'handheld-micro';
  startTime: number;
  duration: number;
  intensity: number; // 0.5 to 2.5
}

export const SHAKE_PRESETS = [
  {
    id: 'quick-jolt',
    name: 'Quick Impact Jolt',
    description: 'Snappy high-frequency shake (0.35s) ideal for sticker pops and word emphasis.',
    defaultDuration: 0.35,
    maxOffsetPx: 12,
  },
  {
    id: 'bass-drop-impact',
    name: 'Bass Drop & Foley Hit',
    description: 'Deep heavy camera thud (0.55s) synced to audio bass spikes.',
    defaultDuration: 0.55,
    maxOffsetPx: 22,
  },
  {
    id: 'earthquake-rumble',
    name: 'Dramatic Earthquake',
    description: 'Sustained cinematic screen vibration (1.2s) for high suspense scenes.',
    defaultDuration: 1.2,
    maxOffsetPx: 16,
  },
  {
    id: 'handheld-micro',
    name: 'Handheld Camera Drift',
    description: 'Subtle organic documentary motion eliminating sterile static tripod look.',
    defaultDuration: 2.0,
    maxOffsetPx: 6,
  },
];

/**
 * Calculates current camera shake displacement (X, Y in px, rotation in degrees)
 */
export function calculateCameraShakeOffset(
  type: 'quick-jolt' | 'bass-drop-impact' | 'earthquake-rumble' | 'handheld-micro',
  progress: number, // 0.0 to 1.0
  intensity = 1.0
): { offsetX: number; offsetY: number; rotation: number } {
  if (progress < 0 || progress > 1) {
    return { offsetX: 0, offsetY: 0, rotation: 0 };
  }

  // Decay envelope (shakes hardest at start, fades out toward end)
  const decay = Math.pow(1 - progress, 2);

  let freq = 24;
  let maxPx = 14 * intensity;

  switch (type) {
    case 'quick-jolt':
      freq = 32;
      maxPx = 16 * intensity;
      break;
    case 'bass-drop-impact':
      freq = 18;
      maxPx = 24 * intensity;
      break;
    case 'earthquake-rumble':
      freq = 28;
      maxPx = 18 * intensity;
      break;
    case 'handheld-micro':
      freq = 6;
      maxPx = 6 * intensity;
      break;
  }

  const offsetX = Math.sin(progress * Math.PI * freq) * maxPx * decay;
  const offsetY = Math.cos(progress * Math.PI * freq * 1.3) * maxPx * decay;
  const rotation = Math.sin(progress * Math.PI * freq * 0.7) * 1.5 * decay;

  return { offsetX, offsetY, rotation };
}

/**
 * Applies camera shake transform to Canvas 2D context
 */
export function applyCameraShakeToCanvas(
  ctx: CanvasRenderingContext2D,
  shake: { offsetX: number; offsetY: number; rotation: number },
  width: number,
  height: number
) {
  if (shake.offsetX === 0 && shake.offsetY === 0 && shake.rotation === 0) return;

  const cx = width / 2;
  const cy = height / 2;

  ctx.translate(cx + shake.offsetX, cy + shake.offsetY);
  if (shake.rotation !== 0) {
    ctx.rotate((shake.rotation * Math.PI) / 180);
  }
  ctx.translate(-cx, -cy);
}
