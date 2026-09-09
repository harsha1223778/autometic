'use client';

import React, { useState } from 'react';
import {
  Film,
  X,
  Sparkles,
  Sliders,
  HardDrive,
  Cpu,
  Layers,
  Check,
  Video,
} from 'lucide-react';
import {
  ExportMatrixSettings,
  EXPORT_MATRIX_PRESETS,
  DEFAULT_EXPORT_SETTINGS,
  resolveMatrixDimensions,
  estimateOutputSizeMB,
} from '@/lib/exportMatrix';

interface ExportMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  aspectRatio: '16:9' | '9:16' | '1:1';
  totalDuration: number;
  onConfirmExport: (settings: ExportMatrixSettings) => void;
}

export default function ExportMatrixModal({
  isOpen,
  onClose,
  aspectRatio,
  totalDuration,
  onConfirmExport,
}: ExportMatrixModalProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(DEFAULT_EXPORT_SETTINGS.presetId);
  const [resolutionTier, setResolutionTier] = useState<'4k' | '1080p' | '720p'>(DEFAULT_EXPORT_SETTINGS.resolutionTier);
  const [fps, setFps] = useState<24 | 30 | 60>(DEFAULT_EXPORT_SETTINGS.fps);
  const [videoBitrateMbps, setVideoBitrateMbps] = useState<number>(12);
  const [audioBitrateKbps, setAudioBitrateKbps] = useState<number>(256);

  if (!isOpen) return null;

  const currentPreset = EXPORT_MATRIX_PRESETS.find((p) => p.id === selectedPresetId);
  const dimensions = resolveMatrixDimensions(resolutionTier, aspectRatio);
  const estimatedSize = estimateOutputSizeMB(
    Math.max(5, totalDuration || 15),
    videoBitrateMbps * 1_000_000,
    audioBitrateKbps * 1_000
  );

  const handleSelectPreset = (presetId: string) => {
    const preset = EXPORT_MATRIX_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setSelectedPresetId(preset.id);
    setResolutionTier(preset.resolutionTier);
    setFps(preset.fps);
    setVideoBitrateMbps(preset.videoBitrate / 1_000_000);
    setAudioBitrateKbps(preset.audioBitrate / 1_000);
  };

  const handleRender = () => {
    onConfirmExport({
      presetId: selectedPresetId,
      name: currentPreset ? currentPreset.name : 'Custom Studio Export',
      resolutionTier,
      customWidth: dimensions.width,
      customHeight: dimensions.height,
      fps,
      videoBitrate: videoBitrateMbps * 1_000_000,
      audioBitrate: audioBitrateKbps * 1_000,
      container: 'webm',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/20">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Master Export Matrix
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-medium border border-purple-500/30">
                  Broadcast Console
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Configure render engine resolution, variable FPS, and hardware bitrates.
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
          {/* Preset Cards Grid */}
          <div>
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-3">
              Export Profile Presets
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EXPORT_MATRIX_PRESETS.map((p) => {
                const isSelected = selectedPresetId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPreset(p.id)}
                    className={`text-left p-3.5 rounded-xl border transition-all relative ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500/50'
                        : 'bg-neutral-800/50 border-neutral-700/60 hover:border-neutral-600 hover:bg-neutral-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white">{p.name}</span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center text-white">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-700 text-neutral-300 font-mono font-bold">
                        {p.badge}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 line-clamp-2 mb-2 leading-relaxed">
                      {p.description}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-300 font-mono">
                      <span className="px-1.5 py-0.5 rounded bg-neutral-900/80 border border-neutral-700">
                        {p.fps} FPS
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-neutral-900/80 border border-neutral-700">
                        {p.videoBitrate / 1_000_000} Mbps
                      </span>
                      <span className="text-purple-400 font-sans text-[11px] truncate">
                        {p.recommendedFor.split(',')[0]}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Granular Sliders & Console */}
          <div className="p-4 rounded-xl bg-neutral-800/40 border border-neutral-700/60 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Sliders className="w-4 h-4 text-purple-400" />
              <span>Hardware & Encoding Micro-Tuning</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Resolution Tier */}
              <div>
                <label className="text-xs text-neutral-400 block mb-1.5">
                  Resolution Tier
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['720p', '1080p', '4k'] as const).map((res) => (
                    <button
                      key={res}
                      onClick={() => {
                        setResolutionTier(res);
                        setSelectedPresetId('custom');
                      }}
                      className={`py-1.5 text-xs font-semibold rounded-lg border transition ${
                        resolutionTier === res
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:border-neutral-600'
                      }`}
                    >
                      {res.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Framerate */}
              <div>
                <label className="text-xs text-neutral-400 block mb-1.5">
                  Target Framerate (FPS)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {([24, 30, 60] as const).map((val) => (
                    <button
                      key={val}
                      onClick={() => {
                        setFps(val);
                        setSelectedPresetId('custom');
                      }}
                      className={`py-1.5 text-xs font-semibold rounded-lg border transition ${
                        fps === val
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:border-neutral-600'
                      }`}
                    >
                      {val} FPS
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Video Bitrate */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-neutral-400">Target Video Bitrate</span>
                <span className="font-mono font-bold text-purple-400">{videoBitrateMbps} Mbps</span>
              </div>
              <input
                type="range"
                min={3}
                max={30}
                step={1}
                value={videoBitrateMbps}
                onChange={(e) => {
                  setVideoBitrateMbps(Number(e.target.value));
                  setSelectedPresetId('custom');
                }}
                className="w-full accent-purple-500 h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
                <span>3 Mbps (Fast Mobile)</span>
                <span>12 Mbps (Studio)</span>
                <span>30 Mbps (Master)</span>
              </div>
            </div>

            {/* Audio Bitrate */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-neutral-400">Audio Mastering Bitrate</span>
                <span className="font-mono font-bold text-indigo-400">{audioBitrateKbps} kbps</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[128, 192, 256, 320].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => {
                      setAudioBitrateKbps(rate);
                      setSelectedPresetId('custom');
                    }}
                    className={`py-1 text-xs font-mono rounded-lg border transition ${
                      audioBitrateKbps === rate
                        ? 'bg-indigo-600 border-indigo-500 text-white font-bold'
                        : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:border-neutral-600'
                    }`}
                  >
                    {rate}k
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Specification & Estimation Summary */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-neutral-800 text-neutral-300">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-neutral-500 uppercase tracking-wider block font-semibold">
                  Estimated Output Size
                </span>
                <span className="text-sm font-bold text-white font-mono">
                  ~{estimatedSize} MB
                </span>
                <span className="text-xs text-neutral-400 ml-1.5">
                  ({Math.round(totalDuration || 15)}s sequence)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-neutral-800 text-neutral-300">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-neutral-500 uppercase tracking-wider block font-semibold">
                  Canvas Resolution
                </span>
                <span className="text-sm font-bold text-white font-mono">
                  {dimensions.width} &times; {dimensions.height} px
                </span>
                <span className="text-xs text-neutral-400 ml-1.5">
                  ({aspectRatio})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-neutral-800 text-neutral-300">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-neutral-500 uppercase tracking-wider block font-semibold">
                  Codec Pipeline
                </span>
                <span className="text-sm font-bold text-purple-400 font-mono">
                  WebM VP9 / Opus
                </span>
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
            onClick={handleRender}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/30 flex items-center gap-2 transition"
          >
            <Video className="w-4 h-4" />
            <span>Start Studio Master Render</span>
          </button>
        </div>
      </div>
    </div>
  );
}
