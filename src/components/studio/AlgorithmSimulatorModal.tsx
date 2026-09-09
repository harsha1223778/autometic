'use client';

import React, { useState } from 'react';
import { TrendingUp, X, Check, AlertCircle, Share2, Sparkles, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import {
  simulateSocialAlgorithms,
  SocialAlgorithmSimulationReport
} from '@/lib/algorithmSimulator';

interface AlgorithmSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  duration: number;
  hasSubtitles: boolean;
  hasMusic: boolean;
  hasOverlays: boolean;
  operationsCount: number;
  onAutoOptimize?: () => void;
}

export default function AlgorithmSimulatorModal({
  isOpen,
  onClose,
  duration,
  hasSubtitles,
  hasMusic,
  hasOverlays,
  operationsCount,
  onAutoOptimize
}: AlgorithmSimulatorModalProps) {
  const [report] = useState<SocialAlgorithmSimulationReport>(() =>
    simulateSocialAlgorithms(duration, hasSubtitles, hasMusic, hasOverlays, operationsCount)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">AI Social Algorithm Simulator</h2>
              <p className="text-xs text-zinc-400">Predicting TikTok FYP, YouTube Shorts & IG Reels distribution</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overall Viral Rating Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-blue-950/30 border border-pink-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 block font-medium">Algorithmic Virality Index</span>
            <h3 className="text-2xl font-black font-mono text-white mt-0.5">
              {report.overallViralScore}/100 <span className="text-xs font-semibold text-pink-400 ml-1">High Virality Potential</span>
            </h3>
            <p className="text-[11px] text-zinc-300 mt-1 max-w-md">{report.primaryRecommendation}</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-pink-600/20 border border-pink-500/40 flex flex-col items-center justify-center text-pink-400 font-mono">
            <span className="text-2xl font-black">{report.overallViralScore >= 90 ? 'A+' : report.overallViralScore >= 80 ? 'A' : 'B'}</span>
            <span className="text-[9px] uppercase font-bold text-zinc-400">Rating</span>
          </div>
        </div>

        {/* Platform Projections */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-300 block">Platform Distribution Forecasts</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {report.platforms.map((p) => (
              <div
                key={p.platform}
                className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">{p.icon}</span>
                    <span className="text-xs font-bold text-white">{p.name}</span>
                  </div>
                  <span className="text-xs font-mono font-black text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    {p.grade}
                  </span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span className="text-[11px]">Seed Views:</span>
                    <span className="font-mono font-bold text-zinc-200">{p.projectedViewsRange}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span className="text-[11px]">Multiplier:</span>
                    <span className="font-mono text-pink-400 text-[11px]">{p.reachMultiplier}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Algorithmic Levers */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-300 block">Algorithmic Levers & Retention Drivers</label>
          <div className="space-y-2">
            {report.levers.map((lever, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-200">{lever.name}</span>
                  <span className="font-mono font-bold text-pink-400">{lever.score}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
                    style={{ width: `${lever.score}%` }}
                  />
                </div>
                <p className="text-[10px] text-zinc-400">{lever.insight}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Viral Checklist */}
        <div className="space-y-2 p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
          <label className="text-xs font-bold text-zinc-300 block">Viral Engineering Checklist</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {report.viralChecklist.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-zinc-300">
                {item.passed ? (
                  <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <span className={`block font-medium ${item.passed ? 'text-zinc-200' : 'text-amber-300'}`}>
                    {item.item}
                  </span>
                  <span className="text-[10px] text-zinc-500">{item.tip}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition"
          >
            Close
          </button>
          {onAutoOptimize && (
            <button
              onClick={() => {
                onAutoOptimize();
                toast.success('Applied algorithmic pacing optimizations!');
                onClose();
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-pink-600 hover:bg-pink-500 rounded-xl transition flex items-center gap-1.5 shadow-lg"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto-Optimize Timeline</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
