/**
 * Autonomous Multi-Channel Scheduled Publishing & Formatting Matrix
 * Formats platform-specific metadata, hashtag bundles, and optimal publishing windows
 * for TikTok, YouTube Shorts, Instagram Reels, and LinkedIn.
 */

export interface PlatformScheduleConfig {
  platform: 'tiktok' | 'youtube' | 'reels' | 'linkedin';
  name: string;
  badge: string;
  icon: string;
  color: string;
  optimalTime: string;
  caption: string;
  hashtags: string[];
  maxChars: number;
  enabled: boolean;
}

export interface ScheduledDispatch {
  id: string;
  title: string;
  scheduledDate: string;
  scheduledTime: string;
  platforms: Array<'tiktok' | 'youtube' | 'reels' | 'linkedin'>;
  status: 'queued' | 'published' | 'draft';
  createdAt: string;
}

/**
 * Generates tailored per-platform copy and metadata.
 */
export function buildPlatformConfigs(
  title: string,
  transcriptSnippet: string
): PlatformScheduleConfig[] {
  const cleanTitle = title || 'Viral AI Video Blueprint';
  const cleanSnippet = transcriptSnippet ? transcriptSnippet.slice(0, 140) : 'Watch till the end to see the full breakdown!';

  return [
    {
      platform: 'tiktok',
      name: 'TikTok',
      badge: 'VIRAL FOR YOU',
      icon: '🎵',
      color: '#00F2FE',
      optimalTime: '7:45 PM (Peak For You Feed)',
      caption: `${cleanTitle} 🤯 Drop your thoughts in the comments! #creator #editflow`,
      hashtags: ['#viral', '#fyp', '#learnontiktok', '#tech', '#growth'],
      maxChars: 2200,
      enabled: true,
    },
    {
      platform: 'youtube',
      name: 'YouTube Shorts',
      badge: 'ALGORITHM BOOST',
      icon: '▶️',
      color: '#FF0000',
      optimalTime: '5:15 PM (Subscribers Active)',
      caption: `${cleanTitle} — Full video breakdown in comments! Subscribe for daily creator tools.`,
      hashtags: ['#shorts', '#youtubeshorts', '#editing', '#creator', '#aivideo'],
      maxChars: 5000,
      enabled: true,
    },
    {
      platform: 'reels',
      name: 'Instagram Reels',
      badge: 'EXPLORE REACH',
      icon: '📸',
      color: '#E1306C',
      optimalTime: '6:30 PM (Peak Engagement)',
      caption: `${cleanTitle} ✨ Save this reel for your next video shoot! Link in bio for full workflow.`,
      hashtags: ['#reelsinstagram', '#contentcreation', '#videotips', '#growthhack', '#reels'],
      maxChars: 2200,
      enabled: true,
    },
    {
      platform: 'linkedin',
      name: 'LinkedIn Video',
      badge: 'B2B THOUGHT LEADERSHIP',
      icon: '💼',
      color: '#0A66C2',
      optimalTime: '9:00 AM (Professional Network)',
      caption: `How AI is reshaping modern digital media production:\n\n${cleanTitle}\n\nWhat are your thoughts on creator automation? Let’s discuss below.`,
      hashtags: ['#artificialintelligence', '#videoengineering', '#leadership', '#innovation'],
      maxChars: 3000,
      enabled: false,
    },
  ];
}

const STORAGE_PREFIX = 'editflow_channel_schedule_';

export function loadScheduledDispatches(projectId: string): ScheduledDispatch[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${projectId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveScheduledDispatches(projectId: string, dispatches: ScheduledDispatch[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${projectId}`, JSON.stringify(dispatches));
  } catch (e) {
    console.error('Failed to save scheduled dispatches:', e);
  }
}
