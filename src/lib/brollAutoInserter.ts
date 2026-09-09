/**
 * AI Smart B-Roll Auto-Inserter & Semantic Pacing for EditFlow AI
 * Analyzes dialogue transcripts and automatically generates timed B-roll cutaways
 * matched to stock media assets at optimal visual retention intervals (every 3.5s - 5.5s).
 */

import { STOCK_MEDIA_LIBRARY, StockMediaItem } from './stockMedia';

export interface AutoBrollCutaway {
  id: string;
  type: 'broll_clip';
  name: string;
  url: string;
  startTime: number;
  duration: number;
  motionPreset: string;
  matchedKeyword: string;
}

const KEN_BURNS_PRESETS = [
  'zoom-in',
  'zoom-out',
  'pan-left-to-right',
  'pan-right-to-left',
  'diagonal-drift',
  'subtle-pulse',
];

/**
 * Automatically places B-roll cutaway operations across a project timeline
 */
export function generateAutoBrollInserts(
  transcriptText: string,
  totalDuration: number,
  intervalSeconds: number = 4.5
): AutoBrollCutaway[] {
  const safeDuration = Math.max(10, totalDuration);
  const words = transcriptText.toLowerCase().split(/\s+/).filter(Boolean);
  const cutaways: AutoBrollCutaway[] = [];

  // Start after the initial hook (e.g. at ~2.5s)
  let currentTime = 2.5;
  let assetIndex = 0;

  while (currentTime + 2.0 < safeDuration) {
    const clipDuration = Math.min(3.5, safeDuration - currentTime);

    // Search for a matching stock asset based on transcript words
    let matchedAsset: StockMediaItem = STOCK_MEDIA_LIBRARY[assetIndex % STOCK_MEDIA_LIBRARY.length];
    let matchedKeyword = 'visual concept';

    // Try semantic match with transcript words
    for (const item of STOCK_MEDIA_LIBRARY) {
      const match = item.keywords.find((k) => words.includes(k));
      if (match) {
        matchedAsset = item;
        matchedKeyword = match;
        break;
      }
    }

    const motionPreset = KEN_BURNS_PRESETS[assetIndex % KEN_BURNS_PRESETS.length];

    cutaways.push({
      id: `auto-broll-${Date.now()}-${assetIndex}`,
      type: 'broll_clip',
      name: `${matchedAsset.title} (${matchedKeyword})`,
      url: matchedAsset.url,
      startTime: Number(currentTime.toFixed(1)),
      duration: Number(clipDuration.toFixed(1)),
      motionPreset,
      matchedKeyword,
    });

    currentTime += intervalSeconds + clipDuration;
    assetIndex++;
  }

  return cutaways;
}
