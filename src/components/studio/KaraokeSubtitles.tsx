'use client';

import React, { useMemo } from 'react';

export interface TimedWord {
  word: string;
  start: number;
  end: number;
  emoji?: string;
}

export interface TimedPhrase {
  id: string;
  start: number;
  end: number;
  words: TimedWord[];
}

const EMOJI_MAP: Record<string, string> = {
  money: '💰',
  cash: '💵',
  profit: '📈',
  growth: '🚀',
  rocket: '🚀',
  fire: '🔥',
  hot: '🔥',
  cool: '❄️',
  code: '💻',
  ai: '🤖',
  future: '✨',
  video: '🎬',
  edit: '✂️',
  fast: '⚡',
  speed: '⚡',
  love: '❤️',
  great: '🌟',
  power: '💪',
  win: '🏆',
  smart: '🧠',
  idea: '💡',
};

/**
 * Converts a raw text transcript into timestamped words and phrases
 */
export function generateKaraokePhrases(rawText: string, totalDuration: number = 30): TimedPhrase[] {
  const cleanWords = rawText.trim().split(/\s+/).filter(Boolean);
  if (cleanWords.length === 0) return [];

  const wordDuration = Math.max(0.3, Math.min(0.6, totalDuration / Math.max(cleanWords.length, 1)));
  const phrases: TimedPhrase[] = [];
  const wordsPerPhrase = 5;

  for (let i = 0; i < cleanWords.length; i += wordsPerPhrase) {
    const chunk = cleanWords.slice(i, i + wordsPerPhrase);
    const phraseStart = i * wordDuration;
    const phraseEnd = (i + chunk.length) * wordDuration;

    const timedWords: TimedWord[] = chunk.map((w, indexInChunk) => {
      const start = phraseStart + indexInChunk * wordDuration;
      const end = start + wordDuration;
      const lower = w.toLowerCase().replace(/[^a-z]/g, '');
      const emoji = EMOJI_MAP[lower];
      return { word: w, start, end, emoji };
    });

    phrases.push({
      id: `phrase-${i}`,
      start: phraseStart,
      end: phraseEnd + 0.3,
      words: timedWords,
    });
  }

  return phrases;
}

import { SubtitleStyling } from '@/lib/subtitleDesigner';

interface KaraokeSubtitlesProps {
  currentTime: number;
  transcript?: string;
  stylePreset?: 'hormozi' | 'neon' | 'minimal';
  fontSize?: number;
  position?: 'bottom' | 'center' | 'top';
  customPhrases?: TimedPhrase[];
  customStyling?: SubtitleStyling;
}

export default function KaraokeSubtitles({
  currentTime,
  transcript = 'Transform your ideas into high impact viral videos with EditFlow AI',
  stylePreset = 'hormozi',
  fontSize = 28,
  position = 'bottom',
  customPhrases,
  customStyling,
}: KaraokeSubtitlesProps) {
  const phrases = useMemo(() => {
    if (customPhrases && customPhrases.length > 0) return customPhrases;
    return generateKaraokePhrases(transcript, 30);
  }, [transcript, customPhrases]);

  // Find active phrase based on currentTime
  const activePhrase = phrases.find(
    (p) => currentTime >= p.start && currentTime <= p.end
  ) || phrases[0];

  if (!activePhrase) return null;

  const activePosition = customStyling?.position || position;
  const positionClasses = {
    top: 'top-8',
    center: 'top-1/2 -translate-y-1/2',
    bottom: 'bottom-8',
  }[activePosition];

  const roundedClasses = {
    none: 'rounded-none',
    md: 'rounded-md',
    full: 'rounded-full',
  }[customStyling?.boxRounded || 'md'];

  return (
    <div
      className={`absolute left-0 right-0 px-6 text-center pointer-events-none z-30 transition-all duration-150 ${positionClasses}`}
    >
      <div className="inline-flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto select-none">
        {activePhrase.words.map((item, idx) => {
          const isCurrentWord = currentTime >= item.start && currentTime <= item.end;
          const isPassedWord = currentTime > item.end;

          if (customStyling) {
            const fontSz = customStyling.fontSize || fontSize;
            const textCase = customStyling.textTransform === 'uppercase' ? 'uppercase' : customStyling.textTransform === 'capitalize' ? 'capitalize' : 'normal-case';

            return (
              <span
                key={idx}
                className={`transition-all duration-100 inline-flex items-center gap-1 ${textCase} ${
                  isCurrentWord
                    ? `scale-110 px-2.5 py-1 ${roundedClasses} shadow-2xl`
                    : isPassedWord
                    ? 'opacity-95'
                    : 'opacity-40'
                }`}
                style={{
                  fontFamily: customStyling.fontFamily,
                  fontSize: `${fontSz}px`,
                  fontWeight: customStyling.fontWeight,
                  color: isCurrentWord ? customStyling.highlightTextColor : customStyling.textColor,
                  backgroundColor: isCurrentWord ? customStyling.highlightBgColor : 'transparent',
                  WebkitTextStroke: customStyling.strokeWidth > 0 && !isCurrentWord
                    ? `${customStyling.strokeWidth}px ${customStyling.strokeColor}`
                    : 'none',
                  textShadow: customStyling.shadowBlur > 0
                    ? `0 2px ${customStyling.shadowBlur}px ${customStyling.shadowColor}`
                    : 'none',
                }}
              >
                <span>{item.word}</span>
                {customStyling.showEmojis && item.emoji && isCurrentWord && (
                  <span className="text-xl animate-bounce">{item.emoji}</span>
                )}
              </span>
            );
          }

          if (stylePreset === 'hormozi') {
            return (
              <span
                key={idx}
                className={`font-black uppercase tracking-tight transition-all duration-100 inline-flex items-center gap-1 ${
                  isCurrentWord
                    ? 'scale-115 text-black bg-[#FFE600] px-2 py-0.5 rounded-md shadow-2xl ring-2 ring-[#FFE600]/80'
                    : isPassedWord
                    ? 'text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]'
                    : 'text-white/40'
                }`}
                style={{
                  fontSize: `${fontSize}px`,
                  WebkitTextStroke: isCurrentWord ? 'none' : '1px black',
                }}
              >
                <span>{item.word}</span>
                {item.emoji && isCurrentWord && (
                  <span className="text-xl animate-bounce">{item.emoji}</span>
                )}
              </span>
            );
          }

          if (stylePreset === 'neon') {
            return (
              <span
                key={idx}
                className={`font-bold transition-all duration-150 px-1 rounded ${
                  isCurrentWord
                    ? 'text-cyan-300 scale-110 drop-shadow-[0_0_12px_rgba(34,211,238,0.9)] bg-cyan-950/60 border border-cyan-400/50'
                    : isPassedWord
                    ? 'text-white/80'
                    : 'text-white/30'
                }`}
                style={{ fontSize: `${fontSize}px` }}
              >
                {item.word}
              </span>
            );
          }

          // Minimal
          return (
            <span
              key={idx}
              className={`font-medium transition-colors duration-150 ${
                isCurrentWord ? 'text-white font-bold' : isPassedWord ? 'text-white/80' : 'text-white/30'
              }`}
              style={{
                fontSize: `${fontSize}px`,
                textShadow: '0 2px 10px rgba(0,0,0,0.8)',
              }}
            >
              {item.word}
            </span>
          );
        })}
      </div>
    </div>
  );
}
