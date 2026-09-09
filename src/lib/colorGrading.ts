/**
 * Cinematic Color LUTs & Grading Presets for EditFlow Studio
 * Provides Hollywood color presets and custom color grading controls
 * (Temperature, Tint, Exposure, Contrast, Saturation) for video canvas rendering.
 */

export interface ColorLUTPreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  filterString: string;
  overlayTint?: string;
}

export interface ColorAdjustments {
  brightness: number; // -50 to 50 (default 0)
  contrast: number;   // -50 to 50 (default 0)
  saturation: number; // -50 to 100 (default 0)
  temperature: number;// -100 to 100 (default 0)
}

export const DEFAULT_COLOR_ADJUSTMENTS: ColorAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  temperature: 0,
};

export const COLOR_LUT_PRESETS: ColorLUTPreset[] = [
  {
    id: 'clean',
    name: 'Natural Baseline',
    badge: 'Clean',
    description: 'Crisp true-to-life colors without tint.',
    filterString: 'none',
  },
  {
    id: 'teal-orange',
    name: 'Teal & Orange Blockbuster',
    badge: 'Hollywood',
    description: 'Rich teal shadows and glowing warm skin-tone highlights.',
    filterString: 'contrast(1.25) saturate(1.2) sepia(0.2)',
    overlayTint: 'rgba(0, 180, 216, 0.08)',
  },
  {
    id: 'kodak-vintage',
    name: 'Kodak 35mm Analog Film',
    badge: 'Retro',
    description: 'Vintage 90s analog warmth with softened blacks.',
    filterString: 'sepia(0.35) contrast(1.1) saturate(1.15) brightness(1.05)',
    overlayTint: 'rgba(255, 170, 0, 0.07)',
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour Sunset',
    badge: 'Warm',
    description: 'Luminous honey-gold ambient glow.',
    filterString: 'sepia(0.4) saturate(1.35) contrast(1.08) brightness(1.05)',
    overlayTint: 'rgba(255, 140, 0, 0.12)',
  },
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon',
    badge: 'Cyber',
    description: 'Electrifying neon magenta and cyan contrast.',
    filterString: 'contrast(1.3) saturate(1.4) hue-rotate(190deg)',
    overlayTint: 'rgba(217, 70, 239, 0.1)',
  },
  {
    id: 'noir-monochrome',
    name: 'Dramatic Noir Monochrome',
    badge: 'B&W',
    description: 'Deep theatrical black and white with high dynamic range.',
    filterString: 'grayscale(1) contrast(1.35) brightness(0.95)',
  },
];

/**
 * Builds CSS filter string combining LUT preset and manual grading sliders.
 */
export function buildCompositeFilterString(
  presetId: string = 'clean',
  adjustments: ColorAdjustments = DEFAULT_COLOR_ADJUSTMENTS
): string {
  const preset = COLOR_LUT_PRESETS.find((p) => p.id === presetId) || COLOR_LUT_PRESETS[0];

  const brightnessFactor = 1 + adjustments.brightness / 100;
  const contrastFactor = 1 + adjustments.contrast / 100;
  const saturationFactor = 1 + adjustments.saturation / 100;

  const filters: string[] = [];

  if (preset.filterString && preset.filterString !== 'none') {
    filters.push(preset.filterString);
  }

  if (adjustments.brightness !== 0) {
    filters.push(`brightness(${brightnessFactor.toFixed(2)})`);
  }
  if (adjustments.contrast !== 0) {
    filters.push(`contrast(${contrastFactor.toFixed(2)})`);
  }
  if (adjustments.saturation !== 0) {
    filters.push(`saturate(${saturationFactor.toFixed(2)})`);
  }
  if (adjustments.temperature > 0) {
    filters.push(`sepia(${(adjustments.temperature / 200).toFixed(2)})`);
  } else if (adjustments.temperature < 0) {
    filters.push(`hue-rotate(${Math.round(adjustments.temperature * 0.8)}deg)`);
  }

  return filters.length > 0 ? filters.join(' ') : 'none';
}

/**
 * Applies color tint overlay if specified by active LUT preset.
 */
export function applyLUTOverlayTint(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  presetId: string
) {
  const preset = COLOR_LUT_PRESETS.find((p) => p.id === presetId);
  if (preset?.overlayTint) {
    ctx.save();
    ctx.fillStyle = preset.overlayTint;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }
}
