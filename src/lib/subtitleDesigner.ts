/**
 * Advanced Subtitle Styling Designer & Custom Typography Engine
 * Provides granular control over fonts, colors, stroke widths, drop shadows,
 * active word highlight badges, and pre-engineered viral typography presets.
 */

export interface SubtitleStyling {
  presetId?: string;
  fontFamily: string;
  fontSize: number; // in px
  fontWeight: string;
  textTransform: 'uppercase' | 'capitalize' | 'none';
  textColor: string;
  highlightTextColor: string;
  highlightBgColor: string;
  strokeColor: string;
  strokeWidth: number; // in px (0 for none)
  shadowColor: string;
  shadowBlur: number;
  position: 'bottom' | 'center' | 'top';
  showEmojis: boolean;
  boxRounded: 'none' | 'md' | 'full';
}

export interface SubtitleDesignPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  styling: SubtitleStyling;
}

export const SUBTITLE_DESIGN_PRESETS: SubtitleDesignPreset[] = [
  {
    id: 'hormozi-gold',
    name: 'Hormozi Gold',
    description: 'Black bold text on punchy yellow badge with heavy outline and emojis.',
    icon: '⚡',
    styling: {
      presetId: 'hormozi-gold',
      fontFamily: 'Montserrat, sans-serif',
      fontSize: 28,
      fontWeight: '900',
      textTransform: 'uppercase',
      textColor: '#FFFFFF',
      highlightTextColor: '#000000',
      highlightBgColor: '#FFE600',
      strokeColor: '#000000',
      strokeWidth: 3,
      shadowColor: 'rgba(0, 0, 0, 0.9)',
      shadowBlur: 8,
      position: 'bottom',
      showEmojis: true,
      boxRounded: 'md',
    },
  },
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon',
    description: 'Vibrant cyan luminescent glow with deep obsidian pill backing.',
    icon: '🤖',
    styling: {
      presetId: 'cyberpunk-neon',
      fontFamily: 'Fira Code, monospace',
      fontSize: 26,
      fontWeight: '700',
      textTransform: 'uppercase',
      textColor: '#94A3B8',
      highlightTextColor: '#22D3EE',
      highlightBgColor: 'rgba(8, 51, 68, 0.85)',
      strokeColor: '#0891B2',
      strokeWidth: 1,
      shadowColor: 'rgba(34, 211, 238, 0.75)',
      shadowBlur: 14,
      position: 'bottom',
      showEmojis: true,
      boxRounded: 'md',
    },
  },
  {
    id: 'crimson-danger',
    name: 'Crimson Apex',
    description: 'Aggressive high-intensity red punch for dramatic revelations and alerts.',
    icon: '🔥',
    styling: {
      presetId: 'crimson-danger',
      fontFamily: 'Impact, sans-serif',
      fontSize: 30,
      fontWeight: '900',
      textTransform: 'uppercase',
      textColor: '#FCA5A5',
      highlightTextColor: '#FFFFFF',
      highlightBgColor: '#EF4444',
      strokeColor: '#000000',
      strokeWidth: 2,
      shadowColor: 'rgba(239, 68, 68, 0.8)',
      shadowBlur: 12,
      position: 'bottom',
      showEmojis: true,
      boxRounded: 'md',
    },
  },
  {
    id: 'emerald-growth',
    name: 'Emerald Profit',
    description: 'Crisp neon mint and lime aesthetic popular in business and finance content.',
    icon: '💵',
    styling: {
      presetId: 'emerald-growth',
      fontFamily: 'Inter, sans-serif',
      fontSize: 27,
      fontWeight: '800',
      textTransform: 'uppercase',
      textColor: '#A7F3D0',
      highlightTextColor: '#064E3B',
      highlightBgColor: '#10B981',
      strokeColor: '#000000',
      strokeWidth: 2,
      shadowColor: 'rgba(16, 185, 129, 0.7)',
      shadowBlur: 10,
      position: 'bottom',
      showEmojis: true,
      boxRounded: 'full',
    },
  },
  {
    id: 'monochrome-bold',
    name: 'Monochrome Minimal',
    description: 'Clean Apple-style clean typography with deep cinematic drop shadow.',
    icon: '✨',
    styling: {
      presetId: 'monochrome-bold',
      fontFamily: 'Inter, sans-serif',
      fontSize: 26,
      fontWeight: '700',
      textTransform: 'none',
      textColor: 'rgba(255, 255, 255, 0.5)',
      highlightTextColor: '#FFFFFF',
      highlightBgColor: 'transparent',
      strokeColor: 'transparent',
      strokeWidth: 0,
      shadowColor: 'rgba(0, 0, 0, 0.95)',
      shadowBlur: 10,
      position: 'bottom',
      showEmojis: false,
      boxRounded: 'none',
    },
  },
];

export const DEFAULT_SUBTITLE_STYLING: SubtitleStyling = SUBTITLE_DESIGN_PRESETS[0].styling;

export const AVAILABLE_FONTS = [
  { label: 'Montserrat (Viral Impact)', value: 'Montserrat, sans-serif' },
  { label: 'Inter (Modern Tech)', value: 'Inter, sans-serif' },
  { label: 'Impact (Heavy Stunner)', value: 'Impact, sans-serif' },
  { label: 'Fira Code (Code & Terminal)', value: 'Fira Code, monospace' },
  { label: 'Cinzel (Cinematic Luxury)', value: 'Cinzel, serif' },
];
