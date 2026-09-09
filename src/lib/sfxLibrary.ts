/**
 * AI Sound Effects (SFX) & Foley Library
 * Provides synthesized Web Audio sound effects (Whoosh, Cash Register, Pop, Bass Impact, Shutter, Chime)
 * with zero external asset latency and 100% offline reliability.
 */

export interface SoundEffectItem {
  id: string;
  name: string;
  category: 'transition' | 'reaction' | 'impact' | 'chime';
  description: string;
  icon: string;
  duration: number;
}

export const SOUND_EFFECTS: SoundEffectItem[] = [
  {
    id: 'sfx-whoosh',
    name: 'Air Whoosh Swoosh',
    category: 'transition',
    description: 'Fast air sweep for visual cuts, B-roll appearances, and transitions.',
    icon: '💨',
    duration: 0.6,
  },
  {
    id: 'sfx-cash',
    name: 'Cash Register Cha-Ching',
    category: 'reaction',
    description: 'Bright metallic bell chime for revenue, crypto, and success moments.',
    icon: '💰',
    duration: 0.8,
  },
  {
    id: 'sfx-pop',
    name: 'Bubble Pop',
    category: 'reaction',
    description: 'Punchy cartoon pop for emoji highlights, sticker reveals, and lower thirds.',
    icon: '🎈',
    duration: 0.3,
  },
  {
    id: 'sfx-bass',
    name: 'Cinematic Bass Drop',
    category: 'impact',
    description: 'Deep sub-bass impact thud for dramatic title cards and reveals.',
    icon: '💥',
    duration: 1.2,
  },
  {
    id: 'sfx-shutter',
    name: 'Camera Shutter Click',
    category: 'impact',
    description: 'Mechanical shutter snapshot sound for freeze frames and photos.',
    icon: '📸',
    duration: 0.4,
  },
  {
    id: 'sfx-chime',
    name: 'Success Bell Chime',
    category: 'chime',
    description: 'Uplifting major chord harmony for tips, ideas, and call-to-actions.',
    icon: '🔔',
    duration: 1.0,
  },
];

let globalAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!globalAudioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      globalAudioCtx = new AudioContextClass();
    }
  }
  if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume().catch(() => {});
  }
  return globalAudioCtx;
}

/**
 * Plays a synthesized sound effect using Web Audio API
 */
export function playSoundEffect(id: string, volume: number = 0.5) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(volume, now);
  masterGain.connect(ctx.destination);

  switch (id) {
    case 'sfx-whoosh': {
      // Noise buffer with sweeping bandpass filter
      const bufferSize = ctx.sampleRate * 0.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(200, now);
      filter.frequency.exponentialRampToValueAtTime(1400, now + 0.25);
      filter.frequency.exponentialRampToValueAtTime(150, now + 0.5);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.2);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.5);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      noise.start(now);
      noise.stop(now + 0.5);
      break;
    }

    case 'sfx-cash': {
      // Metallic dual-bell chimes
      [2100, 2600].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        g.gain.setValueAtTime(0.6 * volume, now + i * 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.6);

        osc.connect(g);
        g.connect(masterGain);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.6);
      });
      break;
    }

    case 'sfx-pop': {
      // Fast sine pitch-drop
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);

      g.gain.setValueAtTime(0.8 * volume, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(g);
      g.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.12);
      break;
    }

    case 'sfx-bass': {
      // Sub-bass sine drop
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.8);

      g.gain.setValueAtTime(volume, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(g);
      g.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.8);
      break;
    }

    case 'sfx-shutter': {
      // Double mechanical snap clicks
      [0, 0.09].forEach((offset) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(900, now + offset);
        osc.frequency.exponentialRampToValueAtTime(150, now + offset + 0.04);

        g.gain.setValueAtTime(0.7 * volume, now + offset);
        g.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.04);

        osc.connect(g);
        g.connect(masterGain);
        osc.start(now + offset);
        osc.stop(now + offset + 0.05);
      });
      break;
    }

    case 'sfx-chime': {
      // Major triad arpeggio (C5 - E5 - G5 - C6)
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        g.gain.setValueAtTime(0.4 * volume, now + idx * 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.6);

        osc.connect(g);
        g.connect(masterGain);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.7);
      });
      break;
    }
  }
}

export interface FoleySuggestion {
  sfxItem: SoundEffectItem;
  timestamp: number;
  reason: string;
}

/**
 * Scans video operations and speech to automatically recommend Foley SFX placements
 */
export function autoDetectFoleyMoments(
  operations: Array<{ type: string; details?: any }>,
  transcriptText: string,
  totalDuration: number = 30
): FoleySuggestion[] {
  const suggestions: FoleySuggestion[] = [];

  // 1. Place whooshes at B-roll and overlay cut points
  for (const op of operations) {
    if ((op.type === 'broll_clip' || op.type === 'overlay_image') && op.details?.startTime) {
      suggestions.push({
        sfxItem: SOUND_EFFECTS[0], // Whoosh
        timestamp: Number(op.details.startTime),
        reason: `Transition swoop for ${op.details.name || 'overlay'}`,
      });
    }
  }

  // 2. Scan keywords in text
  const lower = transcriptText.toLowerCase();
  if (lower.includes('money') || lower.includes('growth') || lower.includes('scale') || lower.includes('revenue')) {
    suggestions.push({
      sfxItem: SOUND_EFFECTS[1], // Cash register
      timestamp: 4.0,
      reason: 'Triggered on revenue/growth keyword in speech',
    });
  }

  if (lower.includes('viral') || lower.includes('secret') || lower.includes('hack')) {
    suggestions.push({
      sfxItem: SOUND_EFFECTS[2], // Pop
      timestamp: 2.0,
      reason: 'Hook pop on viral keyword',
    });
  }

  if (suggestions.length === 0) {
    // Default intro whoosh & outro chime
    suggestions.push({
      sfxItem: SOUND_EFFECTS[0],
      timestamp: 1.5,
      reason: 'Introductory attention hook whoosh',
    });
    suggestions.push({
      sfxItem: SOUND_EFFECTS[5],
      timestamp: Math.max(5, totalDuration - 2),
      reason: 'Outro resolution chime',
    });
  }

  return suggestions;
}
