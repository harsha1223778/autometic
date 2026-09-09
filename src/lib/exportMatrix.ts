/**
 * Master Export Matrix & Custom Codec / Bitrate Console
 * Provides granular broadcast-quality rendering configurations,
 * multi-tier resolution down/up-sampling, variable frame rates (24/30/60 FPS),
 * and audio/video bitrate budgeting.
 */

export interface ExportMatrixSettings {
  presetId: string;
  name: string;
  resolutionTier: '4k' | '1080p' | '720p';
  customWidth?: number;
  customHeight?: number;
  fps: 24 | 30 | 60;
  videoBitrate: number; // in bps (e.g. 12_000_000 for 12 Mbps)
  audioBitrate: number; // in bps (e.g. 256_000 for 256 kbps)
  container: 'webm' | 'mp4';
}

export interface ExportPreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  resolutionTier: '4k' | '1080p' | '720p';
  fps: 24 | 30 | 60;
  videoBitrate: number;
  audioBitrate: number;
  recommendedFor: string;
}

export const EXPORT_MATRIX_PRESETS: ExportPreset[] = [
  {
    id: '4k-master',
    name: '4K Cinema Master (60 FPS)',
    badge: 'UHD PRO',
    description: 'Supreme broadcast-grade resolution with uncompressed crispness and 60 FPS fluidity.',
    resolutionTier: '4k',
    fps: 60,
    videoBitrate: 24_000_000, // 24 Mbps
    audioBitrate: 320_000,    // 320 kbps
    recommendedFor: 'YouTube 4K, Desktop Masters, Client Deliverables',
  },
  {
    id: '1080p-studio',
    name: '1080p Studio Pro (60 FPS)',
    badge: 'MOST POPULAR',
    description: 'High-bitrate studio quality optimized for silky smooth motion graphics and viral reels.',
    resolutionTier: '1080p',
    fps: 60,
    videoBitrate: 12_000_000, // 12 Mbps
    audioBitrate: 256_000,    // 256 kbps
    recommendedFor: 'TikTok, Instagram Reels, YouTube Shorts, High FPS',
  },
  {
    id: '1080p-standard',
    name: '1080p Standard Web (30 FPS)',
    badge: 'BALANCED',
    description: 'Industry-standard 30 FPS web export balancing pristine visual quality and rapid download.',
    resolutionTier: '1080p',
    fps: 30,
    videoBitrate: 6_000_000,  // 6 Mbps
    audioBitrate: 192_000,    // 192 kbps
    recommendedFor: 'General Social Sharing, Twitter/X, Fast Uploads',
  },
  {
    id: '720p-mobile',
    name: '720p Mobile Fast (30 FPS)',
    badge: 'LIGHTWEIGHT',
    description: 'Ultra-compressed lightweight rendering for instant previews and low-bandwidth networks.',
    resolutionTier: '720p',
    fps: 30,
    videoBitrate: 3_000_000,  // 3 Mbps
    audioBitrate: 128_000,    // 128 kbps
    recommendedFor: 'Messaging Previews, WhatsApp, Low-storage archiving',
  },
];

export const DEFAULT_EXPORT_SETTINGS: ExportMatrixSettings = {
  presetId: '1080p-studio',
  name: '1080p Studio Pro (60 FPS)',
  resolutionTier: '1080p',
  fps: 60,
  videoBitrate: 12_000_000,
  audioBitrate: 256_000,
  container: 'webm',
};

/**
 * Resolves exact canvas dimensions in pixels given resolution tier and aspect ratio.
 */
export function resolveMatrixDimensions(
  resolutionTier: '4k' | '1080p' | '720p',
  aspectRatio: '16:9' | '9:16' | '1:1'
): { width: number; height: number } {
  if (resolutionTier === '4k') {
    if (aspectRatio === '9:16') return { width: 2160, height: 3840 };
    if (aspectRatio === '1:1') return { width: 2160, height: 2160 };
    return { width: 3840, height: 2160 };
  }

  if (resolutionTier === '1080p') {
    if (aspectRatio === '9:16') return { width: 1080, height: 1920 };
    if (aspectRatio === '1:1') return { width: 1080, height: 1080 };
    return { width: 1920, height: 1080 };
  }

  // 720p
  if (aspectRatio === '9:16') return { width: 720, height: 1280 };
  if (aspectRatio === '1:1') return { width: 720, height: 720 };
  return { width: 1280, height: 720 };
}

/**
 * Estimates final output file size in Megabytes based on total duration and bitrates.
 */
export function estimateOutputSizeMB(
  durationSeconds: number,
  videoBitrateBps: number,
  audioBitrateBps: number
): number {
  const totalBits = durationSeconds * (videoBitrateBps + audioBitrateBps);
  const totalBytes = totalBits / 8;
  return Number((totalBytes / (1024 * 1024)).toFixed(1));
}

/**
 * Detects the highest fidelity supported video container/codec mime type in the user's browser.
 */
export function detectSupportedVideoMimeType(): string {
  if (typeof window === 'undefined' || !window.MediaRecorder) {
    return 'video/webm';
  }

  const candidateMimeTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=h264,opus',
    'video/mp4;codecs=avc1,mp4a.40.2',
    'video/webm',
    'video/mp4',
  ];

  for (const mime of candidateMimeTypes) {
    if (MediaRecorder.isTypeSupported(mime)) {
      return mime;
    }
  }

  return 'video/webm';
}
