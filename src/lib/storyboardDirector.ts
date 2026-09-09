/**
 * AI Storyboard & Multi-Scene Auto-Director for EditFlow AI
 * Generates structured 4-5 scene visual storyboards complete with stock B-roll,
 * Ken Burns camera direction, sound effects, subtitles, and reaction stickers.
 * Provides 1-click conversion directly into executable timeline operations.
 */

export interface StoryboardScene {
  sceneNumber: number;
  name: string;
  startTime: number;
  duration: number;
  purpose: string;
  suggestedBrollTitle: string;
  suggestedBrollUrl: string;
  kenBurnsMotion: string;
  foleySFX?: string;
  reactionSticker?: string;
  scriptText: string;
}

export interface StoryboardFramework {
  id: string;
  name: string;
  description: string;
  targetAudience: string;
  sceneCount: number;
}

export const STORYBOARD_FRAMEWORKS: StoryboardFramework[] = [
  {
    id: 'viral-hook-story',
    name: 'Viral Retention Hook (5 Scenes)',
    description: 'Hook → Core Conflict → The Secret Revealed → Social Proof → Call-to-Action.',
    targetAudience: 'TikTok, Instagram Reels, YouTube Shorts',
    sceneCount: 5,
  },
  {
    id: 'educational-explainer',
    name: 'Educational Deep Dive (4 Scenes)',
    description: 'Concept Primer → Step-by-Step Walkthrough → Mistake to Avoid → Pro Summary.',
    targetAudience: 'YouTube Long-form & LinkedIn Video',
    sceneCount: 4,
  },
  {
    id: 'product-commercial',
    name: 'High-Converting Ad (4 Scenes)',
    description: 'Relatable Pain Point → Product Introduction → Key Feature Demo → Special Offer.',
    targetAudience: 'Facebook/Meta Ads, TikTok Spark Ads',
    sceneCount: 4,
  },
];

export function generateStoryboard(
  frameworkId: string,
  topic: string,
  totalDuration: number
): StoryboardScene[] {
  const safeDuration = Math.max(15, totalDuration);

  if (frameworkId === 'educational-explainer') {
    const dur = safeDuration / 4;
    return [
      {
        sceneNumber: 1,
        name: 'Concept Primer',
        startTime: 0,
        duration: dur,
        purpose: 'Establish curiosity and frame why this topic matters right now.',
        suggestedBrollTitle: 'Cinematic B-Roll Overlay',
        suggestedBrollUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200',
        kenBurnsMotion: 'zoom-in',
        foleySFX: 'whoosh-swoosh',
        reactionSticker: '💡',
        scriptText: `Most creators get ${topic} completely wrong. Here is the actual blueprint.`,
      },
      {
        sceneNumber: 2,
        name: 'Step-by-Step Breakdown',
        startTime: dur,
        duration: dur,
        purpose: 'Deliver clear actionable mechanics without fluff.',
        suggestedBrollTitle: 'Studio Title Card Graphic',
        suggestedBrollUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200',
        kenBurnsMotion: 'pan-left-to-right',
        foleySFX: 'subtle-mouse-click',
        reactionSticker: '🎯',
        scriptText: `Step one is focusing strictly on retention and immediate visual hook velocity.`,
      },
      {
        sceneNumber: 3,
        name: 'Mistake to Avoid',
        startTime: dur * 2,
        duration: dur,
        purpose: 'Highlight a counter-intuitive trap that ruins results.',
        suggestedBrollTitle: 'Cinematic B-Roll Overlay',
        suggestedBrollUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200',
        kenBurnsMotion: 'zoom-out',
        foleySFX: 'cinematic-impact-boom',
        reactionSticker: '⚠️',
        scriptText: `Do not make the classic error of slow intros or static video scenes.`,
      },
      {
        sceneNumber: 4,
        name: 'Pro Summary & CTA',
        startTime: dur * 3,
        duration: dur,
        purpose: 'Recap and drive subscriptions / follows.',
        suggestedBrollTitle: 'Studio Title Card Graphic',
        suggestedBrollUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200',
        kenBurnsMotion: 'diagonal-drift',
        foleySFX: 'bell-ding-chime',
        reactionSticker: '🚀',
        scriptText: `Save this video and subscribe for daily automated production workflows!`,
      },
    ];
  }

  // Default: viral-hook-story (5 scenes)
  const d = safeDuration / 5;
  return [
    {
      sceneNumber: 1,
      name: 'Shocking Hook',
      startTime: 0,
      duration: d,
      purpose: 'Stop the scroll within the first 1.5 seconds.',
      suggestedBrollTitle: 'Cinematic B-Roll Overlay',
      suggestedBrollUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200',
      kenBurnsMotion: 'zoom-in',
      foleySFX: 'cinematic-impact-boom',
      reactionSticker: '🔥',
      scriptText: `If you are still struggling with ${topic}, you need to see this right now.`,
    },
    {
      sceneNumber: 2,
      name: 'Core Conflict',
      startTime: d,
      duration: d,
      purpose: 'Agitate the pain point and create a curiosity gap.',
      suggestedBrollTitle: 'Studio Title Card Graphic',
      suggestedBrollUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200',
      kenBurnsMotion: 'pan-left-to-right',
      foleySFX: 'whoosh-swoosh',
      reactionSticker: '🤯',
      scriptText: `Everyone told you to spend hours manually editing, but they are doing it in seconds.`,
    },
    {
      sceneNumber: 3,
      name: 'The Secret Revealed',
      startTime: d * 2,
      duration: d,
      purpose: 'Reveal the secret automated shortcut.',
      suggestedBrollTitle: 'Cinematic B-Roll Overlay',
      suggestedBrollUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200',
      kenBurnsMotion: 'diagonal-drift',
      foleySFX: 'sparkle-magic-chime',
      reactionSticker: '💡',
      scriptText: `With EditFlow AI, jump cuts, subtitles, B-roll, and music happen automatically.`,
    },
    {
      sceneNumber: 4,
      name: 'Proof & Demonstration',
      startTime: d * 3,
      duration: d,
      purpose: 'Prove results with undeniable metrics.',
      suggestedBrollTitle: 'Studio Title Card Graphic',
      suggestedBrollUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200',
      kenBurnsMotion: 'zoom-out',
      foleySFX: 'subtle-mouse-click',
      reactionSticker: '📈',
      scriptText: `Audience retention shoots past 85% and watch time doubles immediately.`,
    },
    {
      sceneNumber: 5,
      name: 'Strong Call-to-Action',
      startTime: d * 4,
      duration: d,
      purpose: 'Drive immediate action before video loops.',
      suggestedBrollTitle: 'Cinematic B-Roll Overlay',
      suggestedBrollUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200',
      kenBurnsMotion: 'subtle-pulse',
      foleySFX: 'bell-ding-chime',
      reactionSticker: '🚀',
      scriptText: `Hit follow for more AI video automation secrets!`,
    },
  ];
}

/**
 * Converts a storyboard directly into timeline operations (B-roll, SFX, Stickers)
 */
export function convertStoryboardToTimelineOperations(scenes: StoryboardScene[]): any[] {
  const operations: any[] = [];

  scenes.forEach((scene, i) => {
    // 1. Overlay B-Roll Image
    operations.push({
      id: `sb-broll-${i}-${Date.now()}`,
      type: 'overlay_image',
      name: `Scene ${scene.sceneNumber}: ${scene.name}`,
      timestamp: `${Math.floor(scene.startTime / 60)}:${Math.floor(scene.startTime % 60).toString().padStart(2, '0')}`,
      details: {
        url: scene.suggestedBrollUrl,
        name: scene.suggestedBrollTitle,
        startTime: parseFloat(scene.startTime.toFixed(1)),
        duration: parseFloat((scene.duration * 0.8).toFixed(1)),
        position: 'top-right',
        motionPreset: scene.kenBurnsMotion,
      },
    });

    // 2. Foley Sound Effect Drop
    if (scene.foleySFX) {
      operations.push({
        id: `sb-sfx-${i}-${Date.now()}`,
        type: 'sfx_drop',
        name: `SFX: ${scene.foleySFX}`,
        timestamp: `${Math.floor(scene.startTime / 60)}:${Math.floor(scene.startTime % 60).toString().padStart(2, '0')}`,
        details: {
          sfxId: scene.foleySFX,
          startTime: parseFloat(scene.startTime.toFixed(1)),
          duration: 1.0,
        },
      });
    }

    // 3. Reaction Sticker
    if (scene.reactionSticker) {
      operations.push({
        id: `sb-sticker-${i}-${Date.now()}`,
        type: 'sticker_emoji',
        name: `Sticker: ${scene.reactionSticker}`,
        timestamp: `${Math.floor(scene.startTime / 60)}:${Math.floor(scene.startTime % 60).toString().padStart(2, '0')}`,
        details: {
          emoji: scene.reactionSticker,
          startTime: parseFloat((scene.startTime + 0.5).toFixed(1)),
          duration: 2.0,
          position: 'top-right',
          animation: 'pop-bounce',
          size: 80,
        },
      });
    }
  });

  return operations;
}
