/**
 * AI Voice Persona & Custom Timbre Studio for EditFlow AI
 * Configures speech synthesis pitch, velocity rate, timbre warmth, and emotional cadence.
 */

export interface VoicePersona {
  id: string;
  name: string;
  description: string;
  pitch: number; // 0.6 to 1.8 (1.0 default)
  rate: number; // 0.7 to 1.6 (1.0 default)
  warmth: number; // -5 to +6 dB
  presence: number; // -3 to +6 dB
  emotion: 'hype' | 'authority' | 'documentary' | 'dramatic' | 'casual';
  tag: string;
}

export const VOICE_PERSONAS: VoicePersona[] = [
  {
    id: 'persona-hype',
    name: 'Viral Hype & High Energy',
    description: 'Brisk cadence with elevated pitch for rapid retention TikToks & Shorts.',
    pitch: 1.15,
    rate: 1.25,
    warmth: 1.5,
    presence: 4.5,
    emotion: 'hype',
    tag: '⚡ 1.25x SPEED',
  },
  {
    id: 'persona-authority',
    name: 'Executive Authority & Founder',
    description: 'Deep chest resonance, measured pace, and confident cadence for B2B & Thought Leadership.',
    pitch: 0.88,
    rate: 0.95,
    warmth: 4.0,
    presence: 2.0,
    emotion: 'authority',
    tag: '👔 DEEP PITCH',
  },
  {
    id: 'persona-documentary',
    name: 'Cinema Documentary Narrator',
    description: 'Rich, intimate proximity effect with cinematic warmth and thoughtful pauses.',
    pitch: 0.95,
    rate: 0.92,
    warmth: 5.0,
    presence: 3.0,
    emotion: 'documentary',
    tag: '🎙️ WARM TIMBRE',
  },
  {
    id: 'persona-dramatic',
    name: 'Dramatic Suspense & Storyteller',
    description: 'Dynamic pacing with intense inflection for true crime, mysteries, and climactic hooks.',
    pitch: 1.02,
    rate: 0.88,
    warmth: 3.0,
    presence: 5.0,
    emotion: 'dramatic',
    tag: '🎭 HIGH DRAMA',
  },
  {
    id: 'persona-casual',
    name: 'Friendly Conversational Creator',
    description: 'Natural approachable vocal tone ideal for vlogs, product unboxings, and tutorials.',
    pitch: 1.05,
    rate: 1.08,
    warmth: 2.0,
    presence: 2.5,
    emotion: 'casual',
    tag: '😊 NATURAL',
  },
];

export const DEFAULT_VOICE_PERSONA = VOICE_PERSONAS[0];
