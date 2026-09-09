'use client';

import React, { useState } from 'react';
import {
  Volume2,
  X,
  Sliders,
  Check,
  Zap,
  Activity,
  Radio,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  MasteringProfile,
  MASTERING_PROFILES,
  DEFAULT_MASTERING_PROFILE,
} from '@/lib/audioMastering';

interface AudioMasteringModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyProfile: (profile: MasteringProfile) => void;
}

export default function AudioMasteringModal({
  isOpen,
  onClose,
  onApplyProfile,
}: AudioMasteringModalProps) {
  const [selectedProfile, setSelectedProfile] = useState<MasteringProfile>(DEFAULT_MASTERING_PROFILE);
  const [targetLUFS, setTargetLUFS] = useState<number>(DEFAULT_MASTERING_PROFILE.targetLUFS);
  const [truePeak, setTruePeak] = useState<number>(DEFAULT_MASTERING_PROFILE.truePeakCeiling);
  const [compRatio, setCompRatio] = useState<number>(DEFAULT_MASTERING_PROFILE.compressionRatio);
  const [stereoSpread, setStereoSpread] = useState<number>(DEFAULT_MASTERING_PROFILE.stereoSpread);

  if (!isOpen) return null;

  const handleSelectPreset = (p: MasteringProfile) => {
    setSelectedProfile(p);
    setTargetLUFS(p.targetLUFS);
    setTruePeak(p.truePeakCeiling);
    setCompRatio(p.compressionRatio);
    setStereoSpread(p.stereoSpread);
    toast.info(`Selected ${p.name}`);
  };

  const handleApply = () => {
    const updated: MasteringProfile = {
      ...selectedProfile,
      targetLUFS,
      truePeakCeiling: truePeak,
      compressionRatio: compRatio,
      stereoSpread,
    };
    onApplyProfile(updated);
    toast.success(`Applied ${updated.targetLUFS} LUFS mastering pipeline!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-500 text-black shadow-lg shadow-amber-500/20 font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Broadcast Audio Mastering & LUFS Normalizer
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30">
                  EBU R128
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Industry-standard integrated loudness targets, brickwall peak limiting, and dynamics mastering.
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Preset Cards */}
          <div>
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-3">
              Platform Loudness Targets
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MASTERING_PROFILES.map((p) => {
                const isSelected = selectedProfile.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPreset(p)}
                    className={`text-left p-3.5 rounded-xl border transition-all relative ${
                      isSelected
                        ? 'bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/50'
                        : 'bg-neutral-800/50 border-neutral-700/60 hover:border-neutral-600 hover:bg-neutral-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white">{p.name}</span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-black">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-900 text-amber-400 font-mono font-bold">
                        {p.targetLUFS} LUFS
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 line-clamp-2 mb-2 leading-relaxed">
                      {p.description}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-300 font-mono">
                      <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-700">
                        Peak: {p.truePeakCeiling} dBFS
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-700">
                        Ratio: {p.compressionRatio}:1
                      </span>
                      <span className="text-amber-400 font-sans text-[11px] truncate">
                        {p.platform}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Granular Sliders Console */}
          <div className="p-4 rounded-xl bg-neutral-800/40 border border-neutral-700/60 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Dynamics & Limiter Micro-Tuning</span>
            </div>

            {/* Target LUFS */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-neutral-400">Integrated Target Loudness</span>
                <span className="font-mono font-bold text-amber-400">{targetLUFS} LUFS</span>
              </div>
              <input
                type="range"
                min={-24}
                max={-8}
                step={0.5}
                value={targetLUFS}
                onChange={(e) => setTargetLUFS(parseFloat(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
                <span>-24 LUFS (Cinema)</span>
                <span>-14 LUFS (YouTube)</span>
                <span>-8 LUFS (Max Hype)</span>
              </div>
            </div>

            {/* True Peak Ceiling */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-neutral-400">True Peak Ceiling (Inter-Sample Protection)</span>
                <span className="font-mono font-bold text-amber-400">{truePeak} dBFS</span>
              </div>
              <input
                type="range"
                min={-3.0}
                max={-0.1}
                step={0.1}
                value={truePeak}
                onChange={(e) => setTruePeak(parseFloat(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Multiband Compression Ratio */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-neutral-400">Multiband Dynamics Compression</span>
                <span className="font-mono font-bold text-amber-400">{compRatio}:1</span>
              </div>
              <input
                type="range"
                min={1.5}
                max={5.0}
                step={0.1}
                value={compRatio}
                onChange={(e) => setCompRatio(parseFloat(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Visual LUFS Meter & Loudness Spectrum */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-neutral-400 uppercase tracking-wider">
                Simulated LUFS Metering Bar
              </span>
              <span className="font-mono text-amber-400 font-bold">
                {targetLUFS} LUFS Target • 0.0 dB Gain Margin
              </span>
            </div>

            <div className="h-4 bg-neutral-900 rounded-full overflow-hidden p-0.5 border border-neutral-800 flex gap-0.5">
              <div className="h-full bg-emerald-500 rounded-l-full w-[60%]" />
              <div className="h-full bg-amber-500 w-[25%]" />
              <div className="h-full bg-rose-500 rounded-r-full w-[15%]" />
            </div>

            <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
              <span>-36 dB</span>
              <span>-24 dB</span>
              <span>-14 dB (Broadcast Sweet Spot)</span>
              <span>-1.0 dB True Peak</span>
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
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center gap-2 transition"
          >
            <Zap className="w-4 h-4" />
            <span>Apply Master Processing to Studio</span>
          </button>
        </div>
      </div>
    </div>
  );
}
