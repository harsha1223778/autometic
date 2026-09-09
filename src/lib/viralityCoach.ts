/**
 * AI Virality Score & Retention Coach for EditFlow Studio
 * Evaluates video timeline against algorithmic retention patterns
 * (Hook immediacy, caption readability, B-roll density, audio sound design)
 * and generates actionable 1-click improvements.
 */

export interface ViralityMetric {
  name: string;
  score: number; // 0 to 20
  maxScore: number;
  status: 'good' | 'average' | 'needs-work';
  feedback: string;
}

export interface ViralityReport {
  overallScore: number; // 0 to 100
  tierBadge: string;
  colorClass: string;
  metrics: ViralityMetric[];
  strengths: string[];
  recommendations: Array<{
    id: string;
    title: string;
    reason: string;
    actionLabel: string;
    actionType: 'add_broll' | 'enable_subs' | 'auto_foley' | 'enable_ducking' | 'add_sfx';
  }>;
}

export function evaluateViralityScore(params: {
  duration: number;
  operations: any[];
  hasSubtitles: boolean;
  subtitleLength: number;
  hasMusic: boolean;
  autoDucking: boolean;
}): ViralityReport {
  const { duration, operations, hasSubtitles, subtitleLength, hasMusic, autoDucking } = params;

  // 1. Hook Immediacy (0-20)
  const hasEarlyCutOrOverlay = operations.some((op) => {
    const st = Number(op.details?.startTime) || 0;
    return st <= 2.5;
  });
  let hookScore = 12;
  let hookFeedback = 'Good start. Ensure the opening visual or voice hook captures attention in under 1.5s.';
  if (hasSubtitles && hasEarlyCutOrOverlay) {
    hookScore = 20;
    hookFeedback = '🔥 Flawless! High-speed opening hook with early visual and textual stimulus.';
  } else if (hasSubtitles || hasEarlyCutOrOverlay) {
    hookScore = 16;
    hookFeedback = 'Strong hook. Adding a fast sound effect in the first 2 seconds will maximize retention.';
  }

  // 2. Caption Density & Readability (0-20)
  let captionScore = 0;
  let captionFeedback = 'No subtitles detected. 72% of TikTok & Instagram scrollers watch with sound off!';
  if (hasSubtitles && subtitleLength > 20) {
    captionScore = 20;
    captionFeedback = 'Active word-by-word karaoke subtitles are engaging silent viewers.';
  } else if (hasSubtitles) {
    captionScore = 14;
    captionFeedback = 'Subtitles present. Consider expanding coverage across the full video script.';
  }

  // 3. Visual Variety & B-Roll Density (0-20)
  const brollCount = operations.filter(
    (op) => op.type === 'broll_clip' || op.type === 'overlay_image'
  ).length;
  let visualScore = 8;
  let visualFeedback = 'Static camera detected. Modern viewers lose attention after 4.5 seconds of static framing.';
  if (brollCount >= 3) {
    visualScore = 20;
    visualFeedback = 'Exceptional visual pacing! Frequent B-roll cutaways and graphics keep retention high.';
  } else if (brollCount >= 1) {
    visualScore = 15;
    visualFeedback = 'Good visual variation. Adding 1-2 more cutaways will elevate viewer watch time.';
  }

  // 4. Sound Design & Foley Accents (0-20)
  const sfxCount = operations.filter((op) => op.type === 'sfx_insert').length;
  let sfxScore = 5;
  let sfxFeedback = 'Zero sound effects found. Subconscious acoustic accents trigger dopamine and engagement.';
  if (sfxCount >= 3) {
    sfxScore = 20;
    sfxFeedback = 'Rich Foley design! Whooshes, pops, and impacts are accenting critical scene moments.';
  } else if (sfxCount >= 1) {
    sfxScore = 14;
    sfxFeedback = 'Audio accents present. Run Auto-Foley to automatically sprinkle whooshes on cuts.';
  }

  // 5. Audio Balance & Music Ducking (0-20)
  let audioScore = 10;
  let audioFeedback = 'Background soundtrack inactive. Ambient music increases perceived video value.';
  if (hasMusic && autoDucking) {
    audioScore = 20;
    audioFeedback = 'Studio audio mix! Music automatically ducks during spoken voice dialogue.';
  } else if (hasMusic) {
    audioScore = 15;
    audioFeedback = 'Music active. Enable Smart Auto-Ducking so dialogue remains loud and clear.';
  }

  const overallScore = hookScore + captionScore + visualScore + sfxScore + audioScore;

  let tierBadge = '⚡ High Engagement';
  let colorClass = 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10';
  if (overallScore >= 90) {
    tierBadge = '🔥 Viral Masterpiece';
    colorClass = 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
  } else if (overallScore < 70) {
    tierBadge = '📈 Solid Foundation';
    colorClass = 'text-amber-400 border-amber-500/40 bg-amber-500/10';
  }

  const strengths: string[] = [];
  if (hookScore >= 16) strengths.push('Immediate visual & hook start');
  if (captionScore >= 16) strengths.push('Bouncing karaoke subtitles for silent scrollers');
  if (visualScore >= 16) strengths.push('Dynamic B-roll cutaways every 4-5 seconds');
  if (sfxScore >= 16) strengths.push('Polished audio Foley sound design');
  if (audioScore >= 16) strengths.push('Balanced music mix with auto-ducking');

  const recommendations: ViralityReport['recommendations'] = [];
  if (captionScore < 16) {
    recommendations.push({
      id: 'rec-subs',
      title: 'Enable Hormozi Karaoke Subtitles',
      reason: '70%+ of mobile viewers scroll on mute. Bouncing subtitles boost hook retention by 42%.',
      actionLabel: 'Go to Subtitles',
      actionType: 'enable_subs',
    });
  }
  if (brollCount < 2) {
    recommendations.push({
      id: 'rec-broll',
      title: 'Auto-Detect Stock B-Roll Cutaways',
      reason: 'Long static shots cause 28% drop-off. Insert relevant stock clips at key speaking moments.',
      actionLabel: 'Scan B-Roll',
      actionType: 'add_broll',
    });
  }
  if (sfxCount < 2) {
    recommendations.push({
      id: 'rec-sfx',
      title: 'Auto-Sync Foley SFX to Cuts',
      reason: 'Add subtle whooshes on cuts and bubble pops on text badges to create cinematic energy.',
      actionLabel: 'Auto-Foley',
      actionType: 'auto_foley',
    });
  }
  if (!autoDucking) {
    recommendations.push({
      id: 'rec-ducking',
      title: 'Turn On Audio Auto-Ducking',
      reason: 'Music can compete with dialogue. Auto-ducking dips music volume by 75% when speech is playing.',
      actionLabel: 'Enable Ducking',
      actionType: 'enable_ducking',
    });
  }

  return {
    overallScore,
    tierBadge,
    colorClass,
    metrics: [
      {
        name: 'Hook Immediacy',
        score: hookScore,
        maxScore: 20,
        status: hookScore >= 16 ? 'good' : hookScore >= 12 ? 'average' : 'needs-work',
        feedback: hookFeedback,
      },
      {
        name: 'Caption Density',
        score: captionScore,
        maxScore: 20,
        status: captionScore >= 16 ? 'good' : captionScore >= 10 ? 'average' : 'needs-work',
        feedback: captionFeedback,
      },
      {
        name: 'Visual Pacing & B-Roll',
        score: visualScore,
        maxScore: 20,
        status: visualScore >= 16 ? 'good' : visualScore >= 12 ? 'average' : 'needs-work',
        feedback: visualFeedback,
      },
      {
        name: 'Sound Effects & Foley',
        score: sfxScore,
        maxScore: 20,
        status: sfxScore >= 16 ? 'good' : sfxScore >= 10 ? 'average' : 'needs-work',
        feedback: sfxFeedback,
      },
      {
        name: 'Audio Mix & Ducking',
        score: audioScore,
        maxScore: 20,
        status: audioScore >= 16 ? 'good' : audioScore >= 12 ? 'average' : 'needs-work',
        feedback: audioFeedback,
      },
    ],
    strengths,
    recommendations,
  };
}
