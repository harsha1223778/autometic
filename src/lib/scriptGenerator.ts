/**
 * AI Video Hook & Viral Script Generator for EditFlow Studio
 * Generates high-retention short-form video scripts (Shorts, TikTok, Reels)
 * using proven psychological hook frameworks.
 */

export interface HookFramework {
  id: string;
  name: string;
  description: string;
  badge: string;
  templateHook: (topic: string) => string;
}

export interface GeneratedScript {
  id: string;
  topic: string;
  category: string;
  frameworkName: string;
  hook: string;
  bodyPoints: string[];
  cta: string;
  fullScript: string;
  wordCount: number;
  estimatedDuration: number; // in seconds
  tags: string[];
}

export const HOOK_FRAMEWORKS: HookFramework[] = [
  {
    id: 'curiosity-gap',
    name: 'Curiosity Gap',
    description: 'Creates an irresistible mystery that viewer must watch to resolve.',
    badge: '🔥 85% Retention',
    templateHook: (topic) =>
      `Almost nobody knows this hidden secret about ${topic}, but once you see it, you can never unsee it.`,
  },
  {
    id: 'shock-awe',
    name: 'Shock & Disruption',
    description: 'Disrupts the viewer scrolling pattern by challenging conventional wisdom.',
    badge: '⚡ High Virality',
    templateHook: (topic) =>
      `Stop doing ${topic} the old way immediately. You are literally wasting hours and leaving results on the table.`,
  },
  {
    id: 'problem-solution',
    name: '3-Step Cheat Code',
    description: 'Promises immediate relief to a painful friction point in 3 steps.',
    badge: '💎 High Saves',
    templateHook: (topic) =>
      `If you have been struggling to figure out ${topic}, steal this exact 3-step cheat code.`,
  },
  {
    id: 'story-loop',
    name: 'Open Story Loop',
    description: 'Begins in the middle of intense transformation or struggle.',
    badge: '🎬 Deep Watch Time',
    templateHook: (topic) =>
      `Just six months ago, I was completely lost with ${topic}. Here is the one simple shift that changed everything.`,
  },
  {
    id: 'behind-scenes',
    name: 'Top 1% Secret',
    description: 'Appeals to insider knowledge and exclusive access.',
    badge: '🏆 Premium Authority',
    templateHook: (topic) =>
      `Here is the exact ${topic} workflow that top 1% creators use behind closed doors that they never talk about.`,
  },
];

export const SCRIPT_CATEGORIES = [
  'Tech & AI',
  'Business & Wealth',
  'Productivity & Habits',
  'Fitness & Health',
  'Content Creation',
  'Design & Creative',
];

export const PRESET_TOPICS: Record<string, string[]> = {
  'Tech & AI': [
    'Building AI agents with Next.js',
    'Automating your daily coding workflow',
    '3 Chrome extensions developers need',
    'How AI will change programming in 2026',
  ],
  'Business & Wealth': [
    'Turning your skill into digital revenue',
    'How micro-SaaS founders get first 100 users',
    'The 80/20 rule for high income skills',
  ],
  'Productivity & Habits': [
    'The 2-minute rule to beat procrastination',
    'My morning deep work ritual',
    'How to focus without your phone distracting you',
  ],
  'Fitness & Health': [
    'The simplest workout routine for busy professionals',
    'Fixing posture after 8 hours at a desk',
    'Why sleep is the ultimate performance enhancer',
  ],
  'Content Creation': [
    'How to edit viral short videos in under 10 minutes',
    'The secret to high viewer retention on TikTok',
    'Sound design tricks that make videos feel cinematic',
  ],
  'Design & Creative': [
    'Modern dark mode UI design principles',
    'Color theory secrets that make interfaces pop',
    'Typography rules that 90% of beginners break',
  ],
};

/**
 * Generates a complete viral short-form script tailored to topic, category, and framework.
 */
export function generateViralScript(
  topic: string,
  category: string = 'Tech & AI',
  frameworkId: string = 'curiosity-gap'
): GeneratedScript {
  const cleanTopic = topic.trim() || 'Video Editing';
  const framework =
    HOOK_FRAMEWORKS.find((f) => f.id === frameworkId) || HOOK_FRAMEWORKS[0];

  const hook = framework.templateHook(cleanTopic);

  let bodyPoints: string[] = [];
  let cta: string = '';

  switch (category) {
    case 'Tech & AI':
      bodyPoints = [
        `Step 1: Eliminate repetitive manual work by setting up smart automated triggers.`,
        `Step 2: Leverage modern frameworks that handle rendering and edge caching out of the box.`,
        `Step 3: Ship prototypes in hours rather than spending weeks overthinking architecture.`,
      ];
      cta = `Drop a comment below with your favorite stack, and hit follow for daily tech breakdowns!`;
      break;

    case 'Business & Wealth':
      bodyPoints = [
        `Point 1: Focus on high-leverage assets that compound while you sleep.`,
        `Point 2: Never trade pure time for money when you can package your knowledge into systems.`,
        `Point 3: Solve one painful problem for a specific group of people with extreme clarity.`,
      ];
      cta = `Save this video for when you need motivation, and share it with a friend who is building!`;
      break;

    case 'Productivity & Habits':
      bodyPoints = [
        `Rule 1: Protect your first 90 minutes of the morning from all notifications and emails.`,
        `Rule 2: Batch similar tasks together to eliminate the costly cognitive penalty of context switching.`,
        `Rule 3: Track lead measures instead of lagging results to maintain unstoppable momentum.`,
      ];
      cta = `Try this today for just one week and watch your output 10x. Follow for more productivity systems!`;
      break;

    case 'Content Creation':
      bodyPoints = [
        `Tip 1: Hook the viewer visually and verbally within the first 1.5 seconds.`,
        `Tip 2: Add subtle sound effects and cutaways every 4 seconds to reset viewer attention spans.`,
        `Tip 3: Use bold word-by-word highlighted captions so silent scrollers stay locked in.`,
      ];
      cta = `Double tap if you found this valuable, and follow for more creator hacks!`;
      break;

    default:
      bodyPoints = [
        `First, master the fundamental principles before chasing fancy trends.`,
        `Second, build a daily feedback loop so you iterate and improve rapidly.`,
        `Third, stay consistent for 90 days straight and let compounding do the heavy lifting.`,
      ];
      cta = `Save this video so you can reference it later, and drop your thoughts in the comments!`;
      break;
  }

  const fullScript = `${hook} ${bodyPoints.join(' ')} ${cta}`;
  const wordCount = fullScript.split(/\s+/).filter(Boolean).length;
  // Estimated speech speed ~145 words per minute (2.4 words per sec)
  const estimatedDuration = Math.round(wordCount / 2.4);

  return {
    id: `script-${Date.now()}`,
    topic: cleanTopic,
    category,
    frameworkName: framework.name,
    hook,
    bodyPoints,
    cta,
    fullScript,
    wordCount,
    estimatedDuration,
    tags: [category.toLowerCase().replace(/\s+/g, '-'), 'viral-hooks', 'shorts-script'],
  };
}
