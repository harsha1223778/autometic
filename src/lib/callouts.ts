/**
 * Animated Social Callouts & Lower-Thirds Studio for EditFlow
 * Provides customizable graphic overlays for YouTube/TikTok/Instagram handles,
 * animated subscription bells, and speaker lower-thirds cards.
 */

export interface CalloutPreset {
  id: string;
  name: string;
  category: 'social' | 'engagement' | 'lower-third';
  icon: string;
  defaultTitle: string;
  defaultSubtitle: string;
  badgeColor: string;
  defaultDuration: number;
}

export interface ActiveCallout {
  id: string;
  presetId: string;
  title: string;
  subtitle: string;
  startTime: number;
  duration: number;
  position: 'bottom-left' | 'bottom-center' | 'bottom-right' | 'top-right';
}

export const CALLOUT_PRESETS: CalloutPreset[] = [
  {
    id: 'social-youtube',
    name: 'YouTube Subscribe',
    category: 'social',
    icon: '🔴',
    defaultTitle: 'Subscribe on YouTube',
    defaultSubtitle: '@YourChannel',
    badgeColor: '#FF0000',
    defaultDuration: 3.5,
  },
  {
    id: 'social-tiktok',
    name: 'TikTok Follow',
    category: 'social',
    icon: '🎵',
    defaultTitle: 'Follow on TikTok',
    defaultSubtitle: '@creator',
    badgeColor: '#00F2FE',
    defaultDuration: 3.5,
  },
  {
    id: 'social-instagram',
    name: 'Instagram Profile',
    category: 'social',
    icon: '📸',
    defaultTitle: 'Follow on Instagram',
    defaultSubtitle: '@your.handle',
    badgeColor: '#E1306C',
    defaultDuration: 3.5,
  },
  {
    id: 'social-x',
    name: 'X / Twitter Handle',
    category: 'social',
    icon: '𝕏',
    defaultTitle: 'Follow on X',
    defaultSubtitle: '@handle',
    badgeColor: '#1DA1F2',
    defaultDuration: 3.5,
  },
  {
    id: 'engagement-bell',
    name: 'Subscribe & Bell Notification',
    category: 'engagement',
    icon: '🔔',
    defaultTitle: 'Turn On Notifications',
    defaultSubtitle: 'Never Miss a Video',
    badgeColor: '#FFE600',
    defaultDuration: 3.0,
  },
  {
    id: 'engagement-like',
    name: 'Double-Tap Like',
    category: 'engagement',
    icon: '❤️',
    defaultTitle: 'Drop a Like!',
    defaultSubtitle: 'Helps the Algorithm',
    badgeColor: '#FF2E93',
    defaultDuration: 3.0,
  },
  {
    id: 'engagement-save',
    name: 'Save This Video',
    category: 'engagement',
    icon: '🔖',
    defaultTitle: 'Save This Cheat Code',
    defaultSubtitle: 'Reference it anytime',
    badgeColor: '#8B5CF6',
    defaultDuration: 3.0,
  },
  {
    id: 'lower-third-speaker',
    name: 'Speaker Lower-Third',
    category: 'lower-third',
    icon: '🎙️',
    defaultTitle: 'Alex Morgan',
    defaultSubtitle: 'AI Engineer & Creator',
    badgeColor: '#06B6D4',
    defaultDuration: 4.5,
  },
];

/**
 * Renders an animated callout badge directly onto a 2D canvas context.
 * progress is normalized between 0.0 (appearance) and 1.0 (disappearance).
 */
export function renderCalloutOnCanvas(
  ctx: CanvasRenderingContext2D,
  callout: ActiveCallout,
  canvasWidth: number,
  canvasHeight: number,
  progress: number
) {
  if (progress < 0 || progress > 1) return;

  const preset = CALLOUT_PRESETS.find((p) => p.id === callout.presetId) || CALLOUT_PRESETS[0];

  // Animation phases:
  // 0.0 to 0.15: Spring entrance (slide up & scale)
  // 0.15 to 0.85: Rest with subtle float
  // 0.85 to 1.0: Fade out
  let opacity = 1.0;
  let translateY = 0;
  let scale = 1.0;

  if (progress < 0.15) {
    const enter = progress / 0.15;
    // Spring overshoot: 1 - Math.cos(enter * Math.PI * 1.2)
    scale = 0.5 + enter * 0.55;
    translateY = (1 - enter) * 35;
    opacity = Math.min(1, enter * 1.5);
  } else if (progress > 0.85) {
    const exit = (progress - 0.85) / 0.15;
    opacity = Math.max(0, 1 - exit);
    translateY = exit * 15;
    scale = 1 - exit * 0.1;
  }

  // Dimensions
  const pillW = Math.min(340, canvasWidth * 0.42);
  const pillH = 56;

  let x = 32;
  let y = canvasHeight - pillH - 32;

  if (callout.position === 'bottom-center') {
    x = (canvasWidth - pillW) / 2;
    y = canvasHeight - pillH - 40;
  } else if (callout.position === 'bottom-right') {
    x = canvasWidth - pillW - 32;
    y = canvasHeight - pillH - 32;
  } else if (callout.position === 'top-right') {
    x = canvasWidth - pillW - 32;
    y = 32;
  }

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(x + pillW / 2, y + pillH / 2 + translateY);
  ctx.scale(scale, scale);
  ctx.translate(-(x + pillW / 2), -(y + pillH / 2 + translateY));

  // Background Glass Card
  ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;

  ctx.fillStyle = 'rgba(10, 14, 26, 0.92)';
  ctx.beginPath();
  ctx.roundRect(x, y, pillW, pillH, 16);
  ctx.fill();

  // Colored Left Accent Border
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = preset.badgeColor;
  ctx.beginPath();
  ctx.roundRect(x, y, 6, pillH, [16, 0, 0, 16]);
  ctx.fill();

  // Subtle Border Stroke
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x, y, pillW, pillH, 16);
  ctx.stroke();

  // Icon Circle Badge
  const iconSize = 34;
  const iconX = x + 18;
  const iconY = y + (pillH - iconSize) / 2;

  ctx.fillStyle = `${preset.badgeColor}22`;
  ctx.beginPath();
  ctx.arc(iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2, 0, Math.PI * 2);
  ctx.fill();

  // Icon Emoji Text
  ctx.font = '16px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(preset.icon, iconX + iconSize / 2, iconY + iconSize / 2 + 1);

  // Title Text
  const textLeft = iconX + iconSize + 12;
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(callout.title || preset.defaultTitle, textLeft, y + 12, pillW - iconSize - 36);

  // Subtitle / Handle Text
  ctx.font = '500 11px sans-serif';
  ctx.fillStyle = preset.badgeColor;
  ctx.fillText(callout.subtitle || preset.defaultSubtitle, textLeft, y + 31, pillW - iconSize - 36);

  ctx.restore();
}
