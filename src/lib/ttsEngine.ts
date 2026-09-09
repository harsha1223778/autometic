/**
 * AI Voiceover & Text-to-Speech (TTS) Engine
 * Uses Web Speech Synthesis API with custom pitch, rate, and timbre configurations,
 * and generates synchronized timed tokens for Karaoke Subtitles.
 */

export interface VoiceProfile {
  id: string;
  name: string;
  description: string;
  pitch: number;
  rate: number;
  badge: string;
  avatar: string;
}

export const VOICE_PROFILES: VoiceProfile[] = [
  {
    id: 'alex-energetic',
    name: 'Alex',
    description: 'High-energy, upbeat delivery suited for YouTube Shorts & TikTok.',
    pitch: 1.1,
    rate: 1.12,
    badge: '⚡ Fast & Viral',
    avatar: '🎙️',
  },
  {
    id: 'marcus-deep',
    name: 'Marcus',
    description: 'Deep, authoritative tone ideal for movie trailers and documentary intros.',
    pitch: 0.78,
    rate: 0.92,
    badge: '🎬 Deep Cinema',
    avatar: '🦁',
  },
  {
    id: 'sarah-founder',
    name: 'Sarah',
    description: 'Confident, articulate pace designed for tech startups and business pitches.',
    pitch: 1.0,
    rate: 1.02,
    badge: '💼 Tech Founder',
    avatar: '✨',
  },
  {
    id: 'emma-calm',
    name: 'Emma',
    description: 'Warm, soothing cadence tailored for vlogs, meditation, and calm tutorials.',
    pitch: 0.95,
    rate: 0.88,
    badge: '🌿 Calm Storyteller',
    avatar: '🌸',
  },
];

/**
 * Speaks text using the chosen voice profile
 */
export function speakTextWithProfile(
  text: string,
  profileId: string = 'alex-energetic',
  onEnd?: () => void
): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis not supported in this environment');
    onEnd?.();
    return null;
  }

  window.speechSynthesis.cancel();

  const profile = VOICE_PROFILES.find((p) => p.id === profileId) || VOICE_PROFILES[0];
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.pitch = profile.pitch;
  utterance.rate = profile.rate;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    const englishVoice =
      voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google'))) ||
      voices.find((v) => v.lang.startsWith('en')) ||
      voices[0];
    if (englishVoice) utterance.voice = englishVoice;
  }

  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();

  window.speechSynthesis.speak(utterance);
  return utterance;
}

/**
 * Estimates duration of speech based on word count and profile speed
 */
export function estimateSpeechDuration(text: string, profileId: string = 'alex-energetic'): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const profile = VOICE_PROFILES.find((p) => p.id === profileId) || VOICE_PROFILES[0];
  // Average reading speed is ~150 words per minute (2.5 words per second)
  const baseWordsPerSec = 2.5 * profile.rate;
  return Math.max(2, parseFloat((words / baseWordsPerSec).toFixed(1)));
}
