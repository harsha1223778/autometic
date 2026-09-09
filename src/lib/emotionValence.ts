export interface EmotionDataPoint {
  index: number;
  timeSeconds: number;
  valence: number; // -1.0 (conflict/problem) to +1.0 (relief/triumph)
  tension: number; // 0.0 (calm) to 1.0 (high tension/hook)
  act: string;
  actColor: string;
  hookStrength: number; // 0-100
  pacingPps: number; // words or beats per second
  dialoguePreview: string;
}

export interface ValenceArcReport {
  overallRetentionScore: number; // 0 - 100
  averageTension: number;
  peakTensionAct: string;
  hookDropoffRisk: 'low' | 'moderate' | 'high';
  pacingHealth: 'optimal' | 'sluggish' | 'rushed';
  dataPoints: EmotionDataPoint[];
  narrativeActs: {
    act: string;
    description: string;
    recommendedValence: number;
    recommendedTension: number;
  }[];
  recommendations: string[];
}

export const NARRATIVE_ACTS = [
  { act: 'The Hook', description: 'Immediate disruption or curiosity spark', recommendedValence: 0.2, recommendedTension: 0.85, color: '#f59e0b' },
  { act: 'Rising Friction', description: 'Pain point amplification and conflict', recommendedValence: -0.4, recommendedTension: 0.70, color: '#ef4444' },
  { act: 'The Epiphany', description: 'Sudden clarity, solution discovery or breakthrough', recommendedValence: 0.6, recommendedTension: 0.50, color: '#8b5cf6' },
  { act: 'Social Proof', description: 'Credibility, demonstrations and measurable relief', recommendedValence: 0.8, recommendedTension: 0.35, color: '#10b981' },
  { act: 'High-Stakes CTA', description: 'Urgent closing catalyst and final call to action', recommendedValence: 0.5, recommendedTension: 0.90, color: '#3b82f6' }
];

const POSITIVE_LEXICON = new Set([
  'best', 'win', 'love', 'amazing', 'huge', 'fast', 'easy', 'secret', 'growth',
  'mastery', 'revolution', 'profit', 'breakthrough', 'supercharge', 'perfect',
  'effortless', 'insane', 'solution', 'proven', 'boost', 'transform', 'pure'
]);

const NEGATIVE_LEXICON = new Set([
  'fail', 'hard', 'tired', 'slow', 'waste', 'struggle', 'lost', 'trap', 'never',
  'cost', 'pain', 'broken', 'dead', 'worst', 'mistake', 'risk', 'danger', 'fear',
  'burnout', 'scam', 'problem'
]);

export function analyzeEmotionValenceArc(scenes: Array<{ dialogue?: string; duration?: number; bRollPrompt?: string; visualDescription?: string }>): ValenceArcReport {
  if (!scenes || scenes.length === 0) {
    return {
      overallRetentionScore: 75,
      averageTension: 0.5,
      peakTensionAct: 'The Hook',
      hookDropoffRisk: 'low',
      pacingHealth: 'optimal',
      dataPoints: [],
      narrativeActs: NARRATIVE_ACTS,
      recommendations: ['Add scenes to generate a comprehensive emotional valence analysis.']
    };
  }

  let currentTime = 0;
  const dataPoints: EmotionDataPoint[] = [];

  scenes.forEach((scene, index) => {
    const duration = Math.max(scene.duration || 4, 1);
    const text = ((scene.dialogue || '') + ' ' + (scene.bRollPrompt || '') + ' ' + (scene.visualDescription || '')).toLowerCase();
    const words = text.split(/\s+/).filter(Boolean);

    let posCount = 0;
    let negCount = 0;
    words.forEach(w => {
      const clean = w.replace(/[^a-z]/g, '');
      if (POSITIVE_LEXICON.has(clean)) posCount++;
      if (NEGATIVE_LEXICON.has(clean)) negCount++;
    });

    const netSentiment = words.length > 0 ? (posCount - negCount) / Math.max(words.length * 0.15, 1) : 0;
    const clampedValence = Math.max(-1, Math.min(1, netSentiment));

    // Determine narrative act based on timeline progression
    const progress = scenes.length > 1 ? index / (scenes.length - 1) : 0;
    let actIndex = 0;
    if (progress <= 0.15) actIndex = 0; // Hook
    else if (progress <= 0.45) actIndex = 1; // Rising Friction
    else if (progress <= 0.70) actIndex = 2; // Epiphany
    else if (progress <= 0.88) actIndex = 3; // Social Proof
    else actIndex = 4; // CTA

    const actInfo = NARRATIVE_ACTS[actIndex];

    // Pacing calculation
    const wordsPerSec = duration > 0 ? words.length / duration : 0;
    const hookFactor = index === 0 ? 0.95 : Math.max(0.1, 0.7 - index * 0.05);

    // Calculated tension: combining hook expectation, emotional intensity, and pacing
    const intensity = Math.abs(clampedValence);
    const calculatedTension = Math.min(1, Math.max(0.1, (actInfo.recommendedTension * 0.6) + (intensity * 0.25) + (Math.min(wordsPerSec, 4) / 16)));

    dataPoints.push({
      index: index + 1,
      timeSeconds: Math.round(currentTime),
      valence: Math.round(clampedValence * 100) / 100,
      tension: Math.round(calculatedTension * 100) / 100,
      act: actInfo.act,
      actColor: actInfo.color,
      hookStrength: Math.round(hookFactor * 100),
      pacingPps: Math.round(wordsPerSec * 10) / 10,
      dialoguePreview: scene.dialogue ? (scene.dialogue.slice(0, 45) + (scene.dialogue.length > 45 ? '...' : '')) : `Scene ${index + 1}`
    });

    currentTime += duration;
  });

  const avgTension = dataPoints.reduce((acc, p) => acc + p.tension, 0) / dataPoints.length;
  const hookStrength = dataPoints[0]?.hookStrength || 50;
  const hookRisk: 'low' | 'moderate' | 'high' = hookStrength >= 80 ? 'low' : hookStrength >= 50 ? 'moderate' : 'high';

  const avgPacing = dataPoints.reduce((acc, p) => acc + p.pacingPps, 0) / dataPoints.length;
  const pacingHealth: 'optimal' | 'sluggish' | 'rushed' = avgPacing > 3.2 ? 'rushed' : avgPacing < 1.0 ? 'sluggish' : 'optimal';

  // Retention score computation
  const hasStrongHook = hookStrength >= 70 ? 25 : 15;
  const tensionVariety = Math.min(25, (Math.max(...dataPoints.map(p => p.tension)) - Math.min(...dataPoints.map(p => p.tension))) * 40);
  const narrativeProgression = scenes.length >= 4 ? 25 : scenes.length * 5;
  const pacingBonus = pacingHealth === 'optimal' ? 25 : 15;
  const overallRetentionScore = Math.round(Math.min(99, Math.max(40, hasStrongHook + tensionVariety + narrativeProgression + pacingBonus)));

  const peakPoint = [...dataPoints].sort((a, b) => b.tension - a.tension)[0];

  const recommendations: string[] = [];
  if (hookRisk === 'high') {
    recommendations.push('First 3 seconds lack high-impact hook trigger. Start with an urgent question or provocative paradox.');
  }
  if (pacingHealth === 'sluggish') {
    recommendations.push('Pacing is slow in middle scenes (< 1.5 wps). Trim visual pauses to prevent swipe-away.');
  }
  if (dataPoints.length > 3 && dataPoints.every(p => p.valence > 0.4)) {
    recommendations.push('Add a brief tension or friction point early to make the eventual solution feel much more satisfying.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Story arc is well-balanced with strong hook tension and clear emotional payoff.');
  }

  return {
    overallRetentionScore,
    averageTension: Math.round(avgTension * 100) / 100,
    peakTensionAct: peakPoint?.act || 'The Hook',
    hookDropoffRisk: hookRisk,
    pacingHealth,
    dataPoints,
    narrativeActs: NARRATIVE_ACTS,
    recommendations
  };
}
