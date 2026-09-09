export type TrackingFramingMode = 'center-face' | 'rule-of-thirds-left' | 'rule-of-thirds-right' | 'wide-active-speaker';

export interface FaceBoundingBox {
  x: number; // 0 to 1 normalized horizontal position
  y: number; // 0 to 1 normalized vertical position
  width: number;
  height: number;
  confidence: number;
}

export interface CameraPanWindow {
  cropX: number; // horizontal offset in source pixels
  cropY: number; // vertical offset in source pixels
  cropWidth: number;
  cropHeight: number;
  zoomFactor: number;
}

export interface SimulatedFaceTrackPoint {
  timeSeconds: number;
  box: FaceBoundingBox;
  targetCenterX: number;
}

export const TRACKING_MODES: { id: TrackingFramingMode; name: string; description: string; targetNormalizedX: number }[] = [
  {
    id: 'center-face',
    name: 'Center Hero Focus',
    description: 'Locks speaker firmly in the center third of vertical 9:16 mobile feeds',
    targetNormalizedX: 0.5
  },
  {
    id: 'rule-of-thirds-left',
    name: 'Cinematic Left Third',
    description: 'Frames speaker slightly to the left, leaving right area open for kinetic graphics',
    targetNormalizedX: 0.38
  },
  {
    id: 'rule-of-thirds-right',
    name: 'Cinematic Right Third',
    description: 'Frames speaker slightly to the right, leaving left area open for overlays',
    targetNormalizedX: 0.62
  },
  {
    id: 'wide-active-speaker',
    name: 'Dynamic Room Panning',
    description: 'Expansive panning with loose spring physics to preserve gesture motions',
    targetNormalizedX: 0.5
  }
];

// Exponential moving average smoothing
export function smoothCameraTrajectory(
  currentOffset: number,
  targetOffset: number,
  smoothingFactor: number = 0.08
): number {
  return currentOffset + (targetOffset - currentOffset) * smoothingFactor;
}

/**
 * Simulates intelligent face position across a video duration if real-time web worker is offline
 */
export function generateSimulatedFacePath(duration: number = 30): SimulatedFaceTrackPoint[] {
  const points: SimulatedFaceTrackPoint[] = [];
  const steps = Math.floor(duration * 4); // 4 checks per second

  for (let i = 0; i <= steps; i++) {
    const t = i * 0.25;
    // Harmonic walking motion simulating natural speaker drift
    const drift = Math.sin(t * 0.4) * 0.18 + Math.cos(t * 0.8) * 0.08;
    const normX = Math.max(0.2, Math.min(0.8, 0.5 + drift));
    const normY = 0.35 + Math.sin(t * 0.2) * 0.04;

    points.push({
      timeSeconds: t,
      box: {
        x: normX - 0.1,
        y: normY - 0.15,
        width: 0.2,
        height: 0.3,
        confidence: 0.94
      },
      targetCenterX: normX
    });
  }

  return points;
}

/**
 * Computes exact source crop window for 9:16 vertical reframe
 */
export function computeAutoTrackingCrop(
  sourceWidth: number,
  sourceHeight: number,
  normalizedTargetX: number,
  mode: TrackingFramingMode = 'center-face',
  zoomFactor: number = 1.0
): CameraPanWindow {
  const targetAspect = 9 / 16;
  const baseCropHeight = sourceHeight / zoomFactor;
  const baseCropWidth = baseCropHeight * targetAspect;

  const modeConfig = TRACKING_MODES.find(m => m.id === mode) || TRACKING_MODES[0];
  const desiredCenterSourceX = normalizedTargetX * sourceWidth;
  const targetOffsetWithinCrop = modeConfig.targetNormalizedX * baseCropWidth;

  let idealCropX = desiredCenterSourceX - targetOffsetWithinCrop;

  // Clamp within bounds of the original video
  const maxCropX = Math.max(0, sourceWidth - baseCropWidth);
  const clampedCropX = Math.max(0, Math.min(maxCropX, idealCropX));

  const maxCropY = Math.max(0, sourceHeight - baseCropHeight);
  const clampedCropY = Math.max(0, Math.min(maxCropY, (sourceHeight - baseCropHeight) * 0.3)); // Upper third bias

  return {
    cropX: Math.round(clampedCropX),
    cropY: Math.round(clampedCropY),
    cropWidth: Math.round(baseCropWidth),
    cropHeight: Math.round(baseCropHeight),
    zoomFactor
  };
}
