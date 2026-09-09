/**
 * Split-Screen, Picture-in-Picture (PIP) & Reaction Video Studio Engine for EditFlow AI
 * Composites dual-source videos for TikTok Duets, Reaction Videos, Facecam Podcasts, and Gameplay Shorts.
 */

export interface SplitScreenLayout {
  id: 'none' | 'top-bottom' | 'side-by-side' | 'pip-circle' | 'pip-rect';
  name: string;
  description: string;
  idealAspect: '9:16' | '16:9' | '1:1' | 'all';
}

export const SPLIT_SCREEN_LAYOUTS: SplitScreenLayout[] = [
  {
    id: 'none',
    name: 'Single Fullscreen',
    description: 'Standard single video stream without secondary PIP source.',
    idealAspect: 'all',
  },
  {
    id: 'top-bottom',
    name: 'Top / Bottom Split (9:16 Shorts)',
    description: 'Creator facecam on top 50%, gameplay/product B-roll on bottom 50%.',
    idealAspect: '9:16',
  },
  {
    id: 'side-by-side',
    name: 'Side-by-Side Duet (50/50)',
    description: 'Horizontal split comparison view for side-by-side reviews & duets.',
    idealAspect: '16:9',
  },
  {
    id: 'pip-circle',
    name: 'Floating Facecam (Circle PIP)',
    description: 'Circular corner facecam with glowing neon accent border.',
    idealAspect: 'all',
  },
  {
    id: 'pip-rect',
    name: 'Corner PIP (Rounded Rectangle)',
    description: 'Cinema-style floating picture-in-picture in top-right or bottom-right corner.',
    idealAspect: 'all',
  },
];

/**
 * Draws two media sources onto the canvas context according to the selected split layout
 */
export function renderSplitScreenComposite(
  ctx: CanvasRenderingContext2D,
  mainMedia: HTMLVideoElement | HTMLImageElement,
  secondaryMedia: HTMLVideoElement | HTMLImageElement | null,
  layout: 'none' | 'top-bottom' | 'side-by-side' | 'pip-circle' | 'pip-rect',
  width: number,
  height: number
) {
  if (layout === 'none' || !secondaryMedia) {
    ctx.drawImage(mainMedia, 0, 0, width, height);
    return;
  }

  if (layout === 'top-bottom') {
    const halfH = height / 2;

    // Draw Top Half (Main video / Creator)
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, width, halfH);
    ctx.clip();
    ctx.drawImage(mainMedia, 0, 0, width, halfH);
    ctx.restore();

    // Divider Line
    ctx.fillStyle = '#8B5CF6';
    ctx.fillRect(0, halfH - 2, width, 4);

    // Draw Bottom Half (Secondary video / B-roll)
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, halfH, width, halfH);
    ctx.clip();
    ctx.drawImage(secondaryMedia, 0, halfH, width, halfH);
    ctx.restore();
    return;
  }

  if (layout === 'side-by-side') {
    const halfW = width / 2;

    // Draw Left Half
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, halfW, height);
    ctx.clip();
    ctx.drawImage(mainMedia, 0, 0, halfW, height);
    ctx.restore();

    // Divider Line
    ctx.fillStyle = '#22D3EE';
    ctx.fillRect(halfW - 2, 0, 4, height);

    // Draw Right Half
    ctx.save();
    ctx.beginPath();
    ctx.rect(halfW, 0, halfW, height);
    ctx.clip();
    ctx.drawImage(secondaryMedia, halfW, 0, halfW, height);
    ctx.restore();
    return;
  }

  // Base background (Main media full screen)
  ctx.drawImage(mainMedia, 0, 0, width, height);

  if (layout === 'pip-circle') {
    const radius = Math.min(width, height) * 0.16;
    const cx = width - radius - 32;
    const cy = radius + 32;

    ctx.save();
    // Neon glow border
    ctx.shadowColor = '#8B5CF6';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 4, 0, Math.PI * 2);
    ctx.fillStyle = '#8B5CF6';
    ctx.fill();

    // Circular clip
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(secondaryMedia, cx - radius, cy - radius, radius * 2, radius * 2);
    ctx.restore();
    return;
  }

  if (layout === 'pip-rect') {
    const pipW = width * 0.32;
    const pipH = pipW * (9 / 16);
    const pipX = width - pipW - 28;
    const pipY = 28;

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.85)';
    ctx.shadowBlur = 20;

    // Rounded rectangle border
    ctx.fillStyle = '#22D3EE';
    ctx.beginPath();
    ctx.roundRect(pipX - 3, pipY - 3, pipW + 6, pipH + 6, 16);
    ctx.fill();

    ctx.beginPath();
    ctx.roundRect(pipX, pipY, pipW, pipH, 14);
    ctx.clip();
    ctx.drawImage(secondaryMedia, pipX, pipY, pipW, pipH);
    ctx.restore();
  }
}
