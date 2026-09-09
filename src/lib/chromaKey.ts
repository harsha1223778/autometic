/**
 * Chroma Key & Green Screen Background Remover for EditFlow Studio
 * Provides fast client-side pixel-level chroma keying to remove green, blue,
 * or custom backdrop colors with edge smoothing and spill suppression.
 */

export interface ChromaKeyOptions {
  enabled: boolean;
  keyColor: 'green' | 'blue' | string; // 'green', 'blue', or custom hex '#00FF00'
  similarity: number; // 0.1 to 0.9 (default 0.38)
  smoothness: number; // 0.05 to 0.4 (default 0.12)
  spillSuppression: number; // 0.0 to 1.0 (default 0.3)
}

export const DEFAULT_CHROMA_KEY_OPTIONS: ChromaKeyOptions = {
  enabled: false,
  keyColor: 'green',
  similarity: 0.38,
  smoothness: 0.12,
  spillSuppression: 0.3,
};

/**
 * Converts color name or hex code to normalized RGB values [0..1]
 */
function parseKeyColor(keyColor: string): [number, number, number] {
  if (keyColor === 'green') return [0, 1, 0];
  if (keyColor === 'blue') return [0, 0, 1];

  let hex = keyColor.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    return [r, g, b];
  }
  return [0, 1, 0];
}

/**
 * Applies Chroma Key transparency to raw ImageData pixel buffer.
 */
export function applyChromaKeyToImageData(
  imageData: ImageData,
  options: ChromaKeyOptions
): void {
  if (!options.enabled) return;

  const [targetR, targetG, targetB] = parseKeyColor(options.keyColor);
  const data = imageData.data;
  const len = data.length;

  const sim = Math.max(0.01, options.similarity);
  const smooth = Math.max(0.01, options.smoothness);
  const spill = options.spillSuppression;

  for (let i = 0; i < len; i += 4) {
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;

    // Euclidean distance in normalized RGB space
    const diffR = r - targetR;
    const diffG = g - targetG;
    const diffB = b - targetB;
    const distance = Math.sqrt(diffR * diffR + diffG * diffG + diffB * diffB);

    if (distance < sim) {
      // Full transparency
      data[i + 3] = 0;
    } else if (distance < sim + smooth) {
      // Smooth edge alpha gradient
      const alphaFactor = (distance - sim) / smooth;
      data[i + 3] = Math.round(data[i + 3] * alphaFactor);

      // Spill suppression on edges
      if (spill > 0 && targetG > targetR && targetG > targetB) {
        // Green spill
        data[i + 1] = Math.min(data[i + 1], Math.round((data[i] + data[i + 2]) / 2));
      } else if (spill > 0 && targetB > targetR && targetB > targetG) {
        // Blue spill
        data[i + 2] = Math.min(data[i + 2], Math.round((data[i] + data[i + 1]) / 2));
      }
    } else {
      // Keep pixel, apply spill reduction if near key color
      if (spill > 0) {
        if (targetG > targetR && targetG > targetB && g > (r + b) / 2) {
          data[i + 1] = Math.round(data[i + 1] * (1 - spill * 0.5));
        } else if (targetB > targetR && targetB > targetG && b > (r + g) / 2) {
          data[i + 2] = Math.round(data[i + 2] * (1 - spill * 0.5));
        }
      }
    }
  }
}

/**
 * Applies Chroma Key filter directly onto a 2D canvas context.
 */
export function applyChromaKeyToCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: ChromaKeyOptions
): void {
  if (!options.enabled) return;
  try {
    const imgData = ctx.getImageData(0, 0, width, height);
    applyChromaKeyToImageData(imgData, options);
    ctx.putImageData(imgData, 0, 0);
  } catch (err) {
    // Cross-origin image or canvas access limitation
    console.warn('Chroma key canvas putImageData skipped:', err);
  }
}
