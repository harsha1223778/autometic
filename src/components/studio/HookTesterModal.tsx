'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  X,
  Sparkles,
  Copy,
  Check,
  Smartphone,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { HookVariant, generateHookVariants } from '@/lib/hookTester';

interface HookTesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTopic: string;
  onApplyHook: (variant: HookVariant) => void;
}

export default function HookTesterModal({
  isOpen,
  onClose,
  defaultTopic,
  onApplyHook,
}: HookTesterModalProps) {
  const [topicInput, setTopicInput] = useState(defaultTopic || 'AI Video Production');
  const [variants, setVariants] = useState<HookVariant[]>(() => generateHookVariants(defaultTopic || 'AI Video Production'));
  const [selectedVariantId, setSelectedVariantId] = useState<string>('variant-negative');

  if (!isOpen) return null;

  const handleRegenerate = () => {
    const newVariants = generateHookVariants(topicInput);
    setVariants(newVariants);
    setSelectedVariantId(newVariants[0].id);
    toast.success('Generated 3 new A/B packaging angles!');
  };

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) || variants[0];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label}!`);
  };

  const handleApply = () => {
    onApplyHook(selectedVariant);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-black shadow-lg shadow-orange-500/20 font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Viral Hook & Title A/B Simulator
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30">
                  CTR Predictor
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Simulate 3 packaging angles with predictive Click-Through Rates and retention modeling.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Topic Input Bar */}
        <div className="px-6 py-3 bg-neutral-950 border-b border-neutral-800 flex items-center gap-3">
          <input
            type="text"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            placeholder="Enter core video topic (e.g. AI Automation, Real Estate, Fitness)..."
            className="flex-1 py-1.5 px-3 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-amber-400"
          />
          <button
            onClick={handleRegenerate}
            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate A/B Matrix</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 3 Variant Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {variants.map((v) => {
              const isSelected = selectedVariantId === v.id;
              return (
                <div
                  key={v.id}
                  onClick={() => setSelectedVariantId(v.id)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-950/30 border-amber-500 shadow-xl shadow-amber-500/10 ring-2 ring-amber-500/50'
                      : 'bg-neutral-800/40 border-neutral-700/60 hover:border-neutral-600 hover:bg-neutral-800'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{v.icon}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-700 text-amber-300 font-mono">
                        {v.badge}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-white leading-snug line-clamp-2">
                      {v.title}
                    </h3>

                    <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-300 italic leading-relaxed">
                      &quot;{v.spokenHook}&quot;
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-neutral-400">Pred. CTR</span>
                      <span className="text-amber-400 font-bold">{v.predictedCTR}%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-neutral-400">3s Retention</span>
                      <span className="text-emerald-400 font-bold">{v.retention3s}%</span>
                    </div>
                    <div className="text-[10px] text-neutral-500 truncate">
                      {v.psychologyTrigger}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Simulated Mobile Short-Form Feed Preview */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-amber-400" /> Simulated Mobile Feed Display ({selectedVariant.recommendedPlatform})
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopy(selectedVariant.title, 'Title')}
                  className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 font-mono"
                >
                  <Copy className="w-3 h-3" /> Copy Title
                </button>
                <button
                  onClick={() => handleCopy(selectedVariant.spokenHook, 'Spoken Hook')}
                  className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 font-mono"
                >
                  <Copy className="w-3 h-3" /> Copy Hook
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-700/60 flex items-start gap-4">
              <div className="w-20 aspect-[9/16] rounded-lg bg-neutral-800 border border-neutral-700 flex-shrink-0 flex items-center justify-center text-xs font-mono text-neutral-500 relative overflow-hidden">
                <Flame className="w-6 h-6 text-amber-500/50" />
                <span className="absolute bottom-1 text-[8px] bg-black/80 px-1 rounded text-amber-300 font-bold">
                  {selectedVariant.predictedCTR}% CTR
                </span>
              </div>

              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">@viral_creator</span>
                  <span className="text-[10px] text-neutral-500 font-mono">1h ago</span>
                </div>
                <p className="text-xs font-bold text-white leading-snug">
                  {selectedVariant.title}
                </p>
                <p className="text-[11px] text-amber-300/90 font-mono bg-black/40 p-2 rounded-lg border border-white/5">
                  Spoken Hook: &quot;{selectedVariant.spokenHook}&quot;
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800 bg-neutral-900/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center gap-2 transition"
          >
            <span>Apply Selected Hook to Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
