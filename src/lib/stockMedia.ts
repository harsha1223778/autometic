export interface StockMediaItem {
  id: string;
  title: string;
  category: 'tech' | 'business' | 'nature' | 'urban' | 'lifestyle' | 'abstract';
  type: 'video' | 'image';
  url: string;
  thumbnailUrl: string;
  duration?: number;
  keywords: string[];
}

export const STOCK_MEDIA_LIBRARY: StockMediaItem[] = [
  // Tech & Coding
  {
    id: 'stock-tech-1',
    title: 'Cyber Matrix Code Stream',
    category: 'tech',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&q=80',
    duration: 5.0,
    keywords: ['code', 'programming', 'developer', 'software', 'tech', 'ai', 'algorithm', 'system', 'cyber', 'data'],
  },
  {
    id: 'stock-tech-2',
    title: 'AI Neural Network Circuit',
    category: 'tech',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&q=80',
    duration: 4.0,
    keywords: ['ai', 'artificial intelligence', 'neural', 'brain', 'future', 'robot', 'machine learning', 'deep learning'],
  },
  {
    id: 'stock-tech-3',
    title: 'Modern Workspace & Laptop',
    category: 'tech',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=80',
    duration: 4.0,
    keywords: ['laptop', 'computer', 'desk', 'workspace', 'typing', 'online', 'internet', 'build'],
  },

  // Business & Startup
  {
    id: 'stock-biz-1',
    title: 'Stock Market Growth & Analytics',
    category: 'business',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80',
    duration: 6.0,
    keywords: ['money', 'growth', 'stocks', 'crypto', 'investment', 'finance', 'revenue', 'profit', 'chart', 'wealth'],
  },
  {
    id: 'stock-biz-2',
    title: 'Rocket Launch High Altitude',
    category: 'business',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1517976487507-5b3b11329a43?w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517976487507-5b3b11329a43?w=400&q=80',
    duration: 4.5,
    keywords: ['rocket', 'launch', 'startup', 'scale', 'fast', 'blast', 'reach', 'skyrocket', 'momentum'],
  },
  {
    id: 'stock-biz-3',
    title: 'Executive Team Collaboration',
    category: 'business',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&q=80',
    duration: 5.0,
    keywords: ['team', 'meeting', 'office', 'people', 'collaborate', 'business', 'company', 'work', 'founder'],
  },

  // Cinematic Nature & Travel
  {
    id: 'stock-nat-1',
    title: 'Epic Mountain Peak Sunset',
    category: 'nature',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80',
    duration: 6.0,
    keywords: ['mountain', 'nature', 'travel', 'peak', 'sunset', 'freedom', 'outdoor', 'adventure', 'landscape'],
  },
  {
    id: 'stock-nat-2',
    title: 'Ocean Waves Aerial View',
    category: 'nature',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
    duration: 4.0,
    keywords: ['ocean', 'sea', 'water', 'waves', 'beach', 'calm', 'peace', 'summer', 'vacation'],
  },

  // Urban & City
  {
    id: 'stock-urb-1',
    title: 'Futuristic City Skyline at Night',
    category: 'urban',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&q=80',
    duration: 5.0,
    keywords: ['city', 'urban', 'skyline', 'night', 'lights', 'tokyo', 'new york', 'metropolis', 'traffic'],
  },

  // Abstract & Neon
  {
    id: 'stock-abs-1',
    title: 'Neon Holographic Prism Waves',
    category: 'abstract',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&q=80',
    duration: 4.0,
    keywords: ['neon', 'abstract', 'glow', 'prism', 'color', 'background', 'vibrant', 'light', 'energy'],
  },
];

export interface DetectedBRollSuggestion {
  keyword: string;
  timestamp: number;
  duration: number;
  stockItem: StockMediaItem;
  reason: string;
}

/**
 * Scans a transcript string or script and recommends B-roll placements with timestamps
 */
export function autoDetectBRollSuggestions(
  transcript: string,
  totalDuration: number = 30
): DetectedBRollSuggestion[] {
  const words = transcript.toLowerCase().split(/\s+/);
  const suggestions: DetectedBRollSuggestion[] = [];
  const usedIds = new Set<string>();

  // Distribute timestamps across the duration
  let currentTimeSlot = 2.0;

  for (const stockItem of STOCK_MEDIA_LIBRARY) {
    if (currentTimeSlot >= totalDuration - 3) break;

    // Check if any keyword matches words in transcript
    const matchedKeyword = stockItem.keywords.find((kw) =>
      words.some((w) => w.includes(kw) || kw.includes(w))
    );

    if (matchedKeyword && !usedIds.has(stockItem.id)) {
      usedIds.add(stockItem.id);
      suggestions.push({
        keyword: matchedKeyword,
        timestamp: parseFloat(currentTimeSlot.toFixed(1)),
        duration: stockItem.duration || 4.0,
        stockItem,
        reason: `Keyword "${matchedKeyword}" detected in footage speech`,
      });
      currentTimeSlot += (stockItem.duration || 4.0) + 4.0;
    }
  }

  // Fallback defaults if transcript is sparse
  if (suggestions.length === 0) {
    const defaultItem1 = STOCK_MEDIA_LIBRARY[0];
    const defaultItem2 = STOCK_MEDIA_LIBRARY[3];
    suggestions.push({
      keyword: 'technology',
      timestamp: 3.5,
      duration: 5.0,
      stockItem: defaultItem1,
      reason: 'Auto-suggested visual hook for audience retention',
    });
    if (totalDuration > 15) {
      suggestions.push({
        keyword: 'growth',
        timestamp: 12.0,
        duration: 5.0,
        stockItem: defaultItem2,
        reason: 'Mid-roll engagement B-roll cutaway',
      });
    }
  }

  return suggestions;
}
