'use client';

import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Scissors, 
  Flame, 
  TrendingUp, 
  CheckCircle2, 
  Play, 
  Layers, 
  Clock, 
  ChevronRight,
  Share2
} from 'lucide-react';
import { HookVariant, generateShortsVariants } from '@/lib/shortsRepurposer';

interface RepurposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceDuration: number;
  scriptText?: string;
  onApplyVariant: (variant: HookVariant) => void;
}

export default function RepurposerModal({
  isOpen,
  onClose,
  sourceDuration,
  scriptText = '',
  onApplyVariant
}: RepurposerModalProps) {
  const [analysis] = useState(() => generateShortsVariants(sourceDuration, scriptText));
  const [selectedVariantId, setSelectedVariantId] = useState<string>(analysis.variants[0]?.id || '');
  const [appliedVariantId, setAppliedVariantId] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedVariant = analysis.variants.find(v => v.id === selectedVariantId) || analysis.variants[0];

  const handleApply = (variant: HookVariant) => {
    setAppliedVariantId(variant.id);
    onApplyVariant(variant);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">AI Multi-Hook Shorts Repurposer</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Viral Engine 2.0
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically deconstructs your master video into high-retention viral variants for TikTok, Reels & Shorts.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Variant Selection List (Left Column) */}
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Generated Viral Angles ({analysis.variants.length})
              </span>
              <span className="text-[11px] text-amber-400 flex items-center gap-1 font-medium">
                <Flame className="w-3.5 h-3.5" /> High APV Predictor
              </span>
            </div>

            {analysis.variants.map((v) => {
              const isSelected = selectedVariantId === v.id;
              return (
                <div
                  key={v.id}
                  onClick={() => setSelectedVariantId(v.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-slate-800/90 border-rose-500/80 shadow-lg shadow-rose-500/10'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-white truncate">{v.name}</span>
                        <span className="text-[10px] px-2 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                          {v.targetPlatform.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-rose-300 font-medium line-clamp-1 italic mb-1.5">
                        &quot;{v.hookHeadline}&quot;
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {Math.round(v.durationSeconds)}s cut
                        </span>
                        <span className="flex items-center gap-1 text-emerald-400 font-medium">
                          <TrendingUp className="w-3 h-3" />
                          {v.estimatedRetentionPct}% APV
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold font-mono">
                        <Flame className="w-3 h-3" />
                        {v.viralIndex}
                      </div>
                      <ChevronRight className={`w-4 h-4 transition ${isSelected ? 'text-rose-400 translate-x-1' : 'text-slate-600'}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Variant Detail & Preview Panel (Right Column) */}
          <div className="md:col-span-6 bg-slate-950/70 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/80">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Angle Deep-Dive</span>
                  <h3 className="text-base font-bold text-white mt-0.5">{selectedVariant.name}</h3>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready to Render
                </div>
              </div>

              {/* Hook Copy Preview Card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 space-y-2 mb-4">
                <div className="text-[10px] font-semibold text-rose-400 uppercase tracking-wide">
                  Burnt-In Hook Opening (0:00 - 0:03)
                </div>
                <div className="text-sm font-extrabold text-white leading-snug">
                  {selectedVariant.hookHeadline}
                </div>
                <div className="text-xs text-slate-300">
                  {selectedVariant.subHeadline}
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/50">
                  <span className="text-slate-400">Target Platform Format:</span>
                  <span className="font-semibold text-white uppercase">{selectedVariant.targetPlatform} (9:16 Vertical)</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/50">
                  <span className="text-slate-400">Pacing & Cut Velocity:</span>
                  <span className="font-semibold text-amber-400">{selectedVariant.pacingPpm} cuts / min (Hyper-Paced)</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/50">
                  <span className="text-slate-400">Recommended Captions:</span>
                  <span className="font-semibold text-cyan-400 capitalize">{selectedVariant.recommendedSubtitleStyle} Kinetic</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-slate-400">Algorithm Optimization:</span>
                  <span className="text-slate-300 max-w-[220px] text-right">{selectedVariant.description}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-5 mt-5 border-t border-slate-800 flex items-center gap-3">
              <button
                onClick={() => handleApply(selectedVariant)}
                disabled={appliedVariantId === selectedVariant.id}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                  appliedVariantId === selectedVariant.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white shadow-rose-500/25 hover:shadow-rose-500/40'
                }`}
              >
                {appliedVariantId === selectedVariant.id ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Applied to Studio!
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Apply Variant to Studio
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
