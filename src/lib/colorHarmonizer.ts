/**
 * Smart Video B-Roll Semantic Color Matcher & Grade Harmonizer
 * 
 * Analyzes the master video frame's color palette (luminance, temperature, saturation)
 * and dynamically calculates color-matching corrections for B-roll clips and overlays
 * so foreign stock footage looks shot on the exact same camera and lighting.
 */

export interface SceneColorStats {
  avgRed: number;
  avgGreen: number;
  avgBlue: number;
  luminance: number;     // 0 - 255
  temperature: number;   // -100 (cool/blue) to +100 (warm/orange)
  saturation: number;    // 0 - 100
  dominantHue: string;
}

export type HarmonizerPreset = 
  | 'auto-match'       // dynamically samples master frame and matches tone
  | 'golden-hour'      // warm sunset glow + lift shadows
  | 'cyber-noir'       // cyan-magenta shadow split + deep blacks
  | 'clean-commercial' // balanced neutral studio tones + skin preservation
  | 'vintage-film';    // soft faded blacks + gentle warm midtone roll-off

export interface HarmonizerSettings {
  enabled: boolean;
  preset: HarmonizerPreset;
  intensity: number; // 0 to 1
  matchExposure?: boolean;
  matchTemperature?: boolean;
}

/**
 * Samples a grid of pixels from a canvas 2D context to compute primary scene color statistics.
 */
export function analyzeSceneColor(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  sampleStride = 16
): SceneColorStats {
  try {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    let totalR = 0;
    let totalG = 0;
    let totalB = 0;
    let count = 0;

    const len = data.length;
    for (let i = 0; i < len; i += 4 * sampleStride) {
      totalR += data[i];
      totalG += data[i + 1];
      totalB += data[i + 2];
      count++;
    }

    if (count === 0) {
      return {
        avgRed: 128,
        avgGreen: 128,
        avgBlue: 128,
        luminance: 128,
        temperature: 0,
        saturation: 30,
        dominantHue: '#808080'
      };
    }

    const avgRed = totalR / count;
    const avgGreen = totalG / count;
    const avgBlue = totalB / count;

    // Perceived luminance (ITU-R BT.709)
    const luminance = 0.2126 * avgRed + 0.7152 * avgGreen + 0.0722 * avgBlue;

    // Color Temperature estimate (-100 to +100): Orange (R+G) vs Blue (B)
    const warmBias = (avgRed * 0.6 + avgGreen * 0.4) - avgBlue;
    const temperature = Math.max(-100, Math.min(100, Math.round(warmBias * 0.8)));

    // Saturation estimate
    const max = Math.max(avgRed, avgGreen, avgBlue);
    const min = Math.min(avgRed, avgGreen, avgBlue);
    const saturation = max === 0 ? 0 : Math.round(((max - min) / max) * 100);

    const dominantHue = `rgb(${Math.round(avgRed)}, ${Math.round(avgGreen)}, ${Math.round(avgBlue)})`;

    return {
      avgRed,
      avgGreen,
      avgBlue,
      luminance,
      temperature,
      saturation,
      dominantHue
    };
  } catch {
    // Return graceful default if canvas is tainted or cross-origin
    return {
      avgRed: 128,
      avgGreen: 128,
      avgBlue: 128,
      luminance: 128,
      temperature: 15,
      saturation: 35,
      dominantHue: '#808080'
    };
  }
}

/**
 * Applies harmonizing tint and luminance correction over a target bounding box or B-roll overlay on canvas.
 */
export function applyHarmonizationFX(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  stats: SceneColorStats,
  settings: HarmonizerSettings
): void {
  if (!settings.enabled || settings.intensity <= 0) return;

  const alpha = Math.max(0.05, Math.min(0.6, settings.intensity * 0.35));

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();

  if (settings.preset === 'auto-match') {
    // Dynamic match: if scene is warm, warm up the b-roll; if cool, tint cool
    if (stats.temperature > 10) {
      ctx.fillStyle = `rgba(255, 170, 70, ${alpha * 0.8})`;
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillRect(x, y, width, height);
    } else if (stats.temperature < -10) {
      ctx.fillStyle = `rgba(70, 160, 255, ${alpha * 0.8})`;
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillRect(x, y, width, height);
    }

    // Match exposure slightly
    if (stats.luminance < 90) {
      // Dark scene: pull down overlay highlights
      ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.4})`;
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillRect(x, y, width, height);
    } else if (stats.luminance > 180) {
      // High key bright scene: lift overlay
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
      ctx.globalCompositeOperation = 'screen';
      ctx.fillRect(x, y, width, height);
    }
  } else if (settings.preset === 'golden-hour') {
    ctx.fillStyle = `rgba(255, 140, 30, ${alpha})`;
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillRect(x, y, width, height);
    // Lift midtones
    ctx.fillStyle = `rgba(255, 210, 120, ${alpha * 0.5})`;
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillRect(x, y, width, height);
  } else if (settings.preset === 'cyber-noir') {
    // Deep shadows + teal midtones
    ctx.fillStyle = `rgba(0, 210, 230, ${alpha * 0.7})`;
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillRect(x, y, width, height);
    // Contrast pop
    ctx.fillStyle = `rgba(180, 0, 220, ${alpha * 0.4})`;
    ctx.globalCompositeOperation = 'color-burn';
    ctx.fillRect(x, y, width, height);
  } else if (settings.preset === 'clean-commercial') {
    // Subtle neutral vibrance
    ctx.fillStyle = `rgba(245, 245, 255, ${alpha * 0.4})`;
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillRect(x, y, width, height);
  } else if (settings.preset === 'vintage-film') {
    // Lifted matte blacks + sepia-green warmth
    ctx.fillStyle = `rgba(210, 190, 140, ${alpha * 0.6})`;
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillRect(x, y, width, height);
    // Soft wash
    ctx.fillStyle = `rgba(20, 25, 30, ${alpha * 0.25})`;
    ctx.globalCompositeOperation = 'lighten';
    ctx.fillRect(x, y, width, height);
  }

  ctx.restore();
}
