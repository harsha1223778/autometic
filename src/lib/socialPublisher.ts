/**
 * 1-Click Social Media Launch Kit & Metadata Publisher for EditFlow AI
 * Generates valid .SRT / .VTT subtitles, YouTube clickable chapter descriptions,
 * and viral TikTok / Reels caption & hashtag bundles.
 */

export interface SocialLaunchKit {
  srtContent: string;
  vttContent: string;
  youtubeMetadata: {
    title: string;
    description: string;
    tags: string[];
    chaptersText: string;
  };
  shortFormMetadata: {
    caption: string;
    hashtags: string[];
    openingHook: string;
  };
}

/**
 * Format seconds into SRT timestamp (00:00:05,000)
 */
function toSrtTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}

/**
 * Format seconds into VTT timestamp (00:00:05.000)
 */
function toVttTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

/**
 * Generates complete multi-platform social launch kit
 */
export function generateSocialLaunchKit(params: {
  title: string;
  transcript: string;
  duration: number;
  operations?: any[];
}): SocialLaunchKit {
  const { title, transcript, duration } = params;
  const safeTitle = title || 'Viral Video';
  const cleanTranscript = transcript || 'Watch this breakthrough video to learn how to create viral content faster.';

  // Break transcript into chunks for SRT / VTT
  const sentences = cleanTranscript.match(/[^.!?]+[.!?]+/g) || [cleanTranscript];
  const chunkDuration = Math.max(2, duration / Math.max(1, sentences.length));

  let srtLines: string[] = [];
  let vttLines: string[] = ['WEBVTT\n'];

  sentences.forEach((sentence, idx) => {
    const start = idx * chunkDuration;
    const end = Math.min(duration, (idx + 1) * chunkDuration);
    const trimmed = sentence.trim();

    // SRT format
    srtLines.push(`${idx + 1}`);
    srtLines.push(`${toSrtTime(start)} --> ${toSrtTime(end)}`);
    srtLines.push(trimmed);
    srtLines.push('');

    // VTT format
    vttLines.push(`${toVttTime(start)} --> ${toVttTime(end)}`);
    vttLines.push(trimmed);
    vttLines.push('');
  });

  const srtContent = srtLines.join('\n');
  const vttContent = vttLines.join('\n');

  // Generate YouTube Clickable Chapters
  const chapterCount = Math.max(3, Math.min(6, Math.floor(duration / 6)));
  const chapterInterval = duration / chapterCount;
  const chapterTitles = [
    'The Hook & Problem',
    'Core Breakthrough Strategy',
    'Live Breakdown & Case Study',
    'The Hidden Secret Exposed',
    'Step-by-Step Action Plan',
    'Final Conclusion & Next Steps',
  ];

  const chapters: string[] = [];
  for (let i = 0; i < chapterCount; i++) {
    const timestamp = i * chapterInterval;
    const m = Math.floor(timestamp / 60);
    const s = Math.floor(timestamp % 60);
    const formatted = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    chapters.push(`${formatted} - ${chapterTitles[i % chapterTitles.length]}`);
  }

  const chaptersText = chapters.join('\n');

  const youtubeDescription = `${safeTitle}

In this video, discover high-impact secrets to boost your engagement, retain viewers, and accelerate your growth.

TIMESTAMPS:
${chaptersText}

🔥 TOOLS USED:
Created with EditFlow AI — The Automated AI Video Production Studio.

🔔 Don't forget to SUBSCRIBE, LIKE, and comment your favorite takeaway below!

#ContentCreation #VideoEditing #AIProduction #ViralContent #EditFlowAI`;

  // TikTok / Reels Metadata
  const shortTags = [
    '#shorts',
    '#fyp',
    '#viral',
    '#contentcreator',
    '#videoediting',
    '#growthhacks',
    '#techtok',
    '#editflow',
  ];

  const firstSentence = sentences[0] ? sentences[0].trim() : 'Watch until the end 🤯';

  return {
    srtContent,
    vttContent,
    youtubeMetadata: {
      title: `${safeTitle} (Full Breakdown)`,
      description: youtubeDescription,
      tags: ['ai video editing', 'content creation', 'retention editing', 'shorts', 'youtube growth'],
      chaptersText,
    },
    shortFormMetadata: {
      caption: `${firstSentence}\n\nSave this for your next upload! 🔥 Drop a comment if this helped.\n\n${shortTags.join(' ')}`,
      hashtags: shortTags,
      openingHook: firstSentence,
    },
  };
}

/**
 * Triggers a browser text file download
 */
export function downloadTextFile(filename: string, content: string, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
