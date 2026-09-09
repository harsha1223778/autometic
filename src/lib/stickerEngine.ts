/**
 * Motion Graphics Sticker & Emoji Popper Engine for EditFlow AI
 * Renders animated emojis, viral badges, and reaction stickers with spring physics
 * Features auto-scanning of transcripts for high-energy trigger words.
 */

export interface StickerItem {
  id: string;
  emoji: string;
  label: string;
  category: 'reactions' | 'gestures' | 'badges' | 'viral';
  defaultAnimation: 'pop-bounce' | 'spin-in' | 'pulse-glow' | 'slide-up';
  keywords: string[];
}

export interface ActiveSticker {
  id: string;
  stickerId: string;
  emoji: string;
  label: string;
  startTime: number;
  duration: number;
  position: 'top-left' | 'top-right' | 'center' | 'bottom-left' | 'bottom-right';
  animation: 'pop-bounce' | 'spin-in' | 'pulse-glow' | 'slide-up';
  size: number; // 48 to 140 px
}

export const STICKER_LIBRARY: StickerItem[] = [
  // Reactions
  { id: 'fire', emoji: '🔥', label: 'Fire / Lit', category: 'reactions', defaultAnimation: 'pop-bounce', keywords: ['fire', 'insane', 'hot', 'crazy', 'amazing', 'best'] },
  { id: 'rocket', emoji: '🚀', label: 'Rocket Growth', category: 'reactions', defaultAnimation: 'slide-up', keywords: ['rocket', 'launch', 'growth', 'scale', 'fast', 'future'] },
  { id: 'idea', emoji: '💡', label: 'Smart Idea', category: 'reactions', defaultAnimation: 'pop-bounce', keywords: ['idea', 'tip', 'trick', 'hack', 'secret', 'smart'] },
  { id: 'mindblown', emoji: '🤯', label: 'Mind Blown', category: 'reactions', defaultAnimation: 'pop-bounce', keywords: ['mindblown', 'unbelievable', 'shocking', 'omg', 'impossible'] },
  { id: 'money', emoji: '💰', label: 'Money Bag', category: 'reactions', defaultAnimation: 'pop-bounce', keywords: ['money', 'revenue', 'profit', 'sales', 'dollar', 'income', 'rich'] },
  { id: 'target', emoji: '🎯', label: 'Bullseye Target', category: 'reactions', defaultAnimation: 'pulse-glow', keywords: ['goal', 'target', 'focus', 'exact', 'accurate', 'result'] },
  { id: 'chart', emoji: '📈', label: 'Trending Up', category: 'reactions', defaultAnimation: 'slide-up', keywords: ['trend', 'trending', 'upward', 'million', 'viral', 'views'] },
  { id: 'star', emoji: '⭐', label: 'Gold Star', category: 'reactions', defaultAnimation: 'spin-in', keywords: ['star', 'rating', 'premium', 'quality', 'win'] },
  { id: 'hundred', emoji: '💯', label: '100% Real', category: 'reactions', defaultAnimation: 'pop-bounce', keywords: ['100', 'real', 'truth', 'fact', 'honest', 'definite'] },
  { id: 'warning', emoji: '⚠️', label: 'Alert Warning', category: 'reactions', defaultAnimation: 'pulse-glow', keywords: ['warning', 'caution', 'stop', 'mistake', 'danger', 'avoid'] },
  { id: 'crown', emoji: '👑', label: 'King Crown', category: 'reactions', defaultAnimation: 'spin-in', keywords: ['crown', 'king', 'queen', 'leader', 'best', 'top'] },
  { id: 'lightning', emoji: '⚡', label: 'Flash Energy', category: 'reactions', defaultAnimation: 'pop-bounce', keywords: ['lightning', 'fast', 'instant', 'speed', 'quick', 'power'] },

  // Gestures
  { id: 'thumbsup', emoji: '👍', label: 'Thumbs Up', category: 'gestures', defaultAnimation: 'pop-bounce', keywords: ['yes', 'agree', 'like', 'approve', 'good'] },
  { id: 'clap', emoji: '👏', label: 'Applause', category: 'gestures', defaultAnimation: 'pulse-glow', keywords: ['clap', 'bravo', 'congrats', 'respect'] },
  { id: 'pointdown', emoji: '👇', label: 'Point Down (Link)', category: 'gestures', defaultAnimation: 'pop-bounce', keywords: ['link', 'below', 'description', 'bio', 'comments'] },
  { id: 'pointright', emoji: '👉', label: 'Point Right', category: 'gestures', defaultAnimation: 'slide-up', keywords: ['here', 'check', 'look', 'this'] },
  { id: 'eyes', emoji: '👀', label: 'Look Here', category: 'gestures', defaultAnimation: 'pop-bounce', keywords: ['watch', 'see', 'look', 'notice', 'peek'] },
  { id: 'megaphone', emoji: '📢', label: 'Announcement', category: 'gestures', defaultAnimation: 'pulse-glow', keywords: ['announcement', 'news', 'update', 'listen', 'hear'] },

  // Badges
  { id: 'badge-new', emoji: '✨', label: 'NEW', category: 'badges', defaultAnimation: 'pop-bounce', keywords: ['new', 'fresh', 'latest', 'release', 'update'] },
  { id: 'badge-viral', emoji: '💥', label: 'VIRAL', category: 'badges', defaultAnimation: 'pop-bounce', keywords: ['viral', 'trending', 'famous', 'popular'] },
  { id: 'badge-hot', emoji: '🌶️', label: 'HOT', category: 'badges', defaultAnimation: 'pulse-glow', keywords: ['hot', 'spicy', 'trending'] },
  { id: 'badge-secret', emoji: '🤫', label: 'SECRET', category: 'badges', defaultAnimation: 'pop-bounce', keywords: ['secret', 'hidden', 'nobody', 'quiet'] },
  { id: 'badge-protip', emoji: '🧠', label: 'PRO TIP', category: 'badges', defaultAnimation: 'slide-up', keywords: ['pro', 'tip', 'advice', 'master', 'expert'] },
  { id: 'badge-discount', emoji: '🏷️', label: '50% OFF', category: 'badges', defaultAnimation: 'spin-in', keywords: ['sale', 'discount', 'deal', 'cheap', 'free'] },
];

/**
 * Scan transcript and auto-suggest timed stickers based on emotional hooks and trigger words
 */
export function scanTranscriptForStickerTriggers(
  transcript: string,
  totalDuration: number
): Array<{ sticker: StickerItem; timestamp: number; word: string }> {
  if (!transcript) return [];

  const words = transcript.toLowerCase().split(/\s+/);
  const totalWords = words.length;
  if (totalWords === 0) return [];

  const matches: Array<{ sticker: StickerItem; timestamp: number; word: string }> = [];
  const usedStickerIds = new Set<string>();

  words.forEach((rawWord, idx) => {
    const cleanWord = rawWord.replace(/[^a-z0-9]/g, '');
    if (!cleanWord) return;

    for (const item of STICKER_LIBRARY) {
      if (!usedStickerIds.has(item.id) && item.keywords.includes(cleanWord)) {
        const estTime = parseFloat(((idx / totalWords) * totalDuration).toFixed(1));
        if (estTime >= 0.5 && estTime <= totalDuration - 1.5) {
          matches.push({
            sticker: item,
            timestamp: estTime,
            word: cleanWord,
          });
          usedStickerIds.add(item.id);
          break;
        }
      }
    }
  });

  return matches.slice(0, 6);
}

/**
 * Calculates current animation transform values (scale, rotation, opacity)
 */
export function calculateStickerTransform(
  animation: 'pop-bounce' | 'spin-in' | 'pulse-glow' | 'slide-up',
  progress: number // 0.0 to 1.0 across duration
): { scale: number; rotation: number; opacity: number; offsetY: number } {
  const p = Math.max(0, Math.min(1, progress));

  // Entry phase: first 25% of duration
  const entryP = Math.min(1, p / 0.25);
  // Exit phase: last 15% of duration
  const exitP = p > 0.85 ? (p - 0.85) / 0.15 : 0;

  let scale = 1.0;
  let rotation = 0;
  let offsetY = 0;
  let opacity = 1 - exitP;

  switch (animation) {
    case 'pop-bounce':
      // Overshoot spring physics: 0 -> 1.25 -> 1.0
      if (entryP < 0.7) {
        scale = (entryP / 0.7) * 1.25;
      } else {
        const recoverP = (entryP - 0.7) / 0.3;
        scale = 1.25 - 0.25 * recoverP;
      }
      break;

    case 'spin-in':
      scale = entryP;
      rotation = (1 - entryP) * 360;
      break;

    case 'slide-up':
      scale = 0.8 + 0.2 * entryP;
      offsetY = (1 - entryP) * 40;
      break;

    case 'pulse-glow':
      scale = 1.0 + 0.1 * Math.sin(p * Math.PI * 4);
      break;
  }

  return { scale: Math.max(0, scale * (1 - exitP)), rotation, opacity, offsetY };
}

/**
 * Render sticker onto Canvas 2D frame
 */
export function renderStickerOnCanvas(
  ctx: CanvasRenderingContext2D,
  sticker: ActiveSticker,
  currentTime: number,
  canvasWidth: number,
  canvasHeight: number
) {
  const start = sticker.startTime;
  const end = start + sticker.duration;

  if (currentTime < start || currentTime > end) return;

  const progress = (currentTime - start) / sticker.duration;
  const { scale, rotation, opacity, offsetY } = calculateStickerTransform(
    sticker.animation,
    progress
  );

  if (scale <= 0 || opacity <= 0) return;

  // Resolve screen coordinates
  let x = canvasWidth / 2;
  let y = canvasHeight / 2;
  const margin = 80;

  switch (sticker.position) {
    case 'top-left':
      x = margin;
      y = margin;
      break;
    case 'top-right':
      x = canvasWidth - margin;
      y = margin;
      break;
    case 'center':
      x = canvasWidth / 2;
      y = canvasHeight / 2;
      break;
    case 'bottom-left':
      x = margin;
      y = canvasHeight - margin - 40;
      break;
    case 'bottom-right':
      x = canvasWidth - margin;
      y = canvasHeight - margin - 40;
      break;
  }

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(x, y + offsetY);
  if (rotation !== 0) {
    ctx.rotate((rotation * Math.PI) / 180);
  }
  ctx.scale(scale, scale);

  // Draw Emoji
  const fontSize = sticker.size || 80;
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Add subtle drop shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 4;

  ctx.fillText(sticker.emoji, 0, 0);

  // Optional Badge text
  if (sticker.label && sticker.label.length <= 10 && !sticker.label.includes('/')) {
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeText(sticker.label, 0, fontSize / 2 + 16);
    ctx.fillText(sticker.label, 0, fontSize / 2 + 16);
  }

  ctx.restore();
}
