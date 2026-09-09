'use client';

import React, { useMemo } from 'react';

interface AudioWaveformProps {
  duration: number;
  currentTime: number;
  color?: string;
  activeColor?: string;
  barCount?: number;
  height?: number;
}

export default function AudioWaveform({
  duration,
  currentTime,
  color = 'rgba(255, 255, 255, 0.2)',
  activeColor = '#22D3EE',
  barCount = 64,
  height = 24,
}: AudioWaveformProps) {
  // Generate a deterministic pseudo-random speech/music waveform pattern
  const bars = useMemo(() => {
    const data: number[] = [];
    for (let i = 0; i < barCount; i++) {
      // Natural speech cadence pattern (rhythm with pauses and bursts)
      const base = Math.sin(i * 0.25) * 0.4 + 0.5;
      const noise = ((i * 17 + 7) % 31) / 31;
      const h = Math.max(0.15, Math.min(1.0, base * 0.6 + noise * 0.4));
      data.push(h);
    }
    return data;
  }, [barCount]);

  const currentPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="w-full relative flex items-center gap-[2px] overflow-hidden select-none pointer-events-none"
      style={{ height: `${height}px` }}
    >
      {bars.map((barHeight, idx) => {
        const barPct = (idx / barCount) * 100;
        const isPassed = barPct <= currentPct;

        return (
          <div
            key={idx}
            className="flex-1 rounded-full transition-all duration-75"
            style={{
              height: `${Math.max(3, barHeight * height)}px`,
              backgroundColor: isPassed ? activeColor : color,
              opacity: isPassed ? 1.0 : 0.45,
            }}
          />
        );
      })}
    </div>
  );
}
