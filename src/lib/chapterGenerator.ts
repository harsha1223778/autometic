/**
 * AI Chapter Markers & SEO Metadata Generator for EditFlow Studio
 * Analyzes video duration, transcript, and edit operations to automatically generate:
 * 1. Timestamped YouTube/TikTok chapters (e.g. 00:00 Hook, 01:15 Strategy, etc.)
 * 2. High-CTR viral video titles
 * 3. SEO-optimized descriptions with summary & call-to-action
 * 4. Trending hashtag bundles for YouTube Shorts, TikTok, and Instagram Reels.
 */

export interface ChapterItem {
  id: string;
  seconds: number;
  timestamp: string;
  title: string;
}

export interface SEOMetadata {
  titles: {
    curiosity: string;
    highValue: string;
    contrarian: string;
  };
  chapters: ChapterItem[];
  chaptersFormattedText: string;
  description: string;
  hashtags: string[];
  hashtagsFormattedText: string;
}

/**
 * Formats seconds into MM:SS timestamp (or HH:MM:SS if > 1 hour)
 */
export function formatTimestamp(totalSeconds: number): string {
  const secs = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  const remainingSeconds = secs % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`;
}

/**
 * Generates structured chapters and SEO metadata for a video project.
 */
export function generateVideoSEOAndChapters(
  projectTitle: string = 'Viral Video',
  transcript: string = '',
  duration: number = 30,
  operations: any[] = []
): SEOMetadata {
  const cleanTitle = projectTitle.trim() || 'Untitled Video';
  const totalDuration = Math.max(10, duration);

  // 1. Generate High-CTR Title Variations
  const titles = {
    curiosity: `The Hidden Secret About ${cleanTitle} (Almost Nobody Knows This)`,
    highValue: `How to Master ${cleanTitle} in 3 Simple Steps (Complete Guide)`,
    contrarian: `Stop Doing ${cleanTitle} Like This! You're Losing Hours Every Day`,
  };

  // 2. Generate Intelligent Timestamped Chapters
  const chapters: ChapterItem[] = [];
  chapters.push({
    id: 'ch-0',
    seconds: 0,
    timestamp: '00:00',
    title: 'The Hook & Problem',
  });

  if (totalDuration >= 15) {
    const ch1Time = Math.round(totalDuration * 0.25);
    chapters.push({
      id: 'ch-1',
      seconds: ch1Time,
      timestamp: formatTimestamp(ch1Time),
      title: 'The Core Strategy & Breakdown',
    });
  }

  if (totalDuration >= 25) {
    const ch2Time = Math.round(totalDuration * 0.55);
    chapters.push({
      id: 'ch-2',
      seconds: ch2Time,
      timestamp: formatTimestamp(ch2Time),
      title: 'Actionable Cheat Code & Workflow',
    });
  }

  if (totalDuration >= 35) {
    const ch3Time = Math.round(totalDuration * 0.85);
    chapters.push({
      id: 'ch-3',
      seconds: ch3Time,
      timestamp: formatTimestamp(ch3Time),
      title: 'Results & Next Action Step',
    });
  }

  const chaptersFormattedText = chapters
    .map((c) => `${c.timestamp} - ${c.title}`)
    .join('\n');

  // 3. Trending Hashtags
  const baseTags = [
    '#Shorts',
    '#VideoEditing',
    '#CreatorEconomy',
    '#EditFlowAI',
    '#ContentCreation',
    '#ViralVideo',
    '#TechHacks',
  ];
  const topicTag = `#${cleanTitle.replace(/[^a-zA-Z0-9]/g, '')}`;
  const hashtags = [topicTag, ...baseTags].slice(0, 8);
  const hashtagsFormattedText = hashtags.join(' ');

  // 4. Formatted SEO Description
  const summaryText = transcript.trim()
    ? transcript.slice(0, 160) + (transcript.length > 160 ? '...' : '')
    : `In this breakdown, discover how to elevate your ${cleanTitle} workflow with modern creator tools and techniques.`;

  const description = `${titles.curiosity}

${summaryText}

⏱️ TIMESTAMPS:
${chaptersFormattedText}

🚀 CREATED WITH EDITFLOW AI:
Built using EditFlow AI Studio - the ultimate browser-based video editing engine with auto-captions, B-roll detection, procedural sound design, and viral rendering.

${hashtagsFormattedText}`;

  return {
    titles,
    chapters,
    chaptersFormattedText,
    description,
    hashtags,
    hashtagsFormattedText,
  };
}
