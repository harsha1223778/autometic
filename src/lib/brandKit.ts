/**
 * Custom Brand Kit & Watermark Studio for EditFlow AI
 * Stores creator logos, watermark position/opacity settings, brand font families,
 * and brand hex color accents.
 */

export interface BrandKit {
  enabled: boolean;
  creatorName: string;
  creatorHandle: string;
  logoUrl: string;
  logoOpacity: number; // 0.1 to 1.0
  logoSizePx: number; // 40 to 180
  logoPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  showHandleBadge: boolean;
}

export const DEFAULT_BRAND_KIT: BrandKit = {
  enabled: false,
  creatorName: 'EditFlow Creator',
  creatorHandle: '@editflow.ai',
  logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
  logoOpacity: 0.85,
  logoSizePx: 80,
  logoPosition: 'top-right',
  primaryColor: '#8B5CF6',
  accentColor: '#06B6D4',
  fontFamily: 'Inter, sans-serif',
  showHandleBadge: true,
};

export const BRAND_FONTS = [
  { id: 'Inter', name: 'Inter (Modern Tech)', font: 'Inter, sans-serif' },
  { id: 'Montserrat', name: 'Montserrat (Bold Clean)', font: 'Montserrat, sans-serif' },
  { id: 'Oswald', name: 'Oswald (Punchy Condensed)', font: 'Oswald, sans-serif' },
  { id: 'Poppins', name: 'Poppins (Playful Creator)', font: 'Poppins, sans-serif' },
  { id: 'Cinzel', name: 'Cinzel (Cinematic Luxury)', font: 'Cinzel, serif' },
];

const BRAND_STORAGE_KEY = 'editflow_brand_kit';

export function getStoredBrandKit(): BrandKit {
  if (typeof window === 'undefined') return DEFAULT_BRAND_KIT;
  try {
    const raw = localStorage.getItem(BRAND_STORAGE_KEY);
    if (raw) return { ...DEFAULT_BRAND_KIT, ...JSON.parse(raw) };
  } catch {
    // Fallback to default
  }
  return DEFAULT_BRAND_KIT;
}

export function saveStoredBrandKit(kit: BrandKit): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(kit));
  } catch (err) {
    console.error('Failed to save brand kit:', err);
  }
}

/**
 * Calculates (X, Y) canvas coordinates for a given logo position and canvas size
 */
export function calculateLogoPlacement(
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left',
  canvasWidth: number,
  canvasHeight: number,
  logoWidth: number,
  logoHeight: number,
  padding = 32
): { x: number; y: number } {
  let x = padding;
  let y = padding;

  switch (position) {
    case 'top-right':
      x = canvasWidth - logoWidth - padding;
      y = padding;
      break;
    case 'top-left':
      x = padding;
      y = padding;
      break;
    case 'bottom-right':
      x = canvasWidth - logoWidth - padding;
      y = canvasHeight - logoHeight - padding;
      break;
    case 'bottom-left':
      x = padding;
      y = canvasHeight - logoHeight - padding;
      break;
  }

  return { x, y };
}
