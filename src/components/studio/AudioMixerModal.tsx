'use client';

import React from 'react';
import {
  Sliders,
  X,
  Volume2,
  VolumeX,
  Radio,
  RotateCcw,
  Sparkles,
  Check,
} from 'lucide-react';
import {
  AudioMixerState,
  LOUDNESS_STANDARDS,
  DEFAULT_MIXER_STATE,
} from '@/lib/audioMixer';

interface AudioMixerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mixerState: AudioMixerState;
  onChangeMixerState: (newState: AudioMixerState) => void;
}

export default function AudioMixerModal({
  isOpen,
  onClose,
  mixerState,
  onChangeMixerState,
}: AudioMixerModalProps) {
  if (!isOpen) return null;

  const updateStem = (
    stemKey: 'dialogue' | 'voiceover' | 'music' | 'sfx',
    patch: Partial<AudioMixerState['stems']['dialogue']>
  ) => {
    onChangeMixerState({
      ...mixerState,
      stems: {
        ...mixerState.stems,
        [stemKey]: {
          ...mixerState.stems[stemKey],
          ...patch,
        },
      },
    });
  };

  const handleReset = () => {
    onChangeMixerState(DEFAULT_MIXER_STATE);
  };

  const stemKeys: Array<'dialogue' | 'voiceover' | 'music' | 'sfx'> = [
    'dialogue',
    'voiceover',
    'music',
    'sfx',
  ];

  const stemIcons = {
    dialogue: '🎙️',
    voiceover: '🗣️',
    music: '🎵',
    sfx: '💥',
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#0A0D18] border border-white/10 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#0D1120]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Multi-Track Audio Mixer & Console
              </h3>
              <p className="text-xs text-slate-400">
                Independent gain faders, stereo panning, solo/mute matrix, and loudness mastering
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Console Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* 4-Stem Channel Strips */}
          <div className="grid grid-cols-4 gap-3 bg-[#070912] p-4 rounded-2xl border border-white/[0.06]">
            {stemKeys.map((key) => {
              const stem = mixerState.stems[key];
              return (
                <div
                  key={key}
                  className={`flex flex-col items-center justify-between p-3 rounded-xl border transition-all ${
                    stem.isMuted
                      ? 'bg-rose-950/10 border-rose-500/30 opacity-70'
                      : stem.isSolo
                      ? 'bg-amber-950/20 border-amber-500/60 shadow-md shadow-amber-500/10'
                      : 'bg-white/[0.02] border-white/[0.06]'
                  }`}
                >
                  {/* Stem Title & Icon */}
                  <div className="text-center space-y-1 mb-2">
                    <span className="text-xl block">{stemIcons[key]}</span>
                    <span className="text-[11px] font-bold text-white block truncate w-24">
                      {stem.name}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold block">
                      {stem.volume}%
                    </span>
                  </div>

                  {/* Volume Slider */}
                  <div className="h-36 flex items-center justify-center my-2">
                    <input
                      type="range"
                      min={0}
                      max={150}
                      value={stem.volume}
                      onChange={(e) =>
                        updateStem(key, { volume: parseInt(e.target.value, 10) })
                      }
                      className="accent-cyan-400 -rotate-90 w-28 cursor-pointer"
                    />
                  </div>

                  {/* Stereo Pan Control */}
                  <div className="w-full space-y-1 mb-3 text-center">
                    <div className="flex justify-between text-[9px] text-slate-400 font-mono px-1">
                      <span>L</span>
                      <span className="text-cyan-300">
                        {stem.pan === 0
                          ? 'C'
                          : stem.pan < 0
                          ? `L${Math.round(Math.abs(stem.pan) * 100)}`
                          : `R${Math.round(stem.pan * 100)}`}
                      </span>
                      <span>R</span>
                    </div>
                    <input
                      type="range"
                      min={-1}
                      max={1}
                      step={0.1}
                      value={stem.pan}
                      onChange={(e) =>
                        updateStem(key, { pan: parseFloat(e.target.value) })
                      }
                      className="w-full accent-purple-400 h-1"
                    />
                  </div>

                  {/* Solo & Mute Buttons */}
                  <div className="flex items-center gap-1.5 w-full">
                    <button
                      onClick={() => updateStem(key, { isMuted: !stem.isMuted })}
                      className={`flex-1 py-1 rounded text-[10px] font-bold transition-colors ${
                        stem.isMuted
                          ? 'bg-rose-600 text-white'
                          : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                      }`}
                      title="Mute Track"
                    >
                      M
                    </button>
                    <button
                      onClick={() => updateStem(key, { isSolo: !stem.isSolo })}
                      className={`flex-1 py-1 rounded text-[10px] font-bold transition-colors ${
                        stem.isSolo
                          ? 'bg-amber-500 text-black'
                          : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                      }`}
                      title="Solo Track"
                    >
                      S
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Master Output & Broadcast Loudness Normalizer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Master Volume */}
            <div className="p-4 rounded-2xl bg-[#070912] border border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-cyan-400" /> Master Output Gain
                </span>
                <span className="text-xs font-mono font-bold text-cyan-300">
                  {mixerState.masterVolume}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={150}
                value={mixerState.masterVolume}
                onChange={(e) =>
                  onChangeMixerState({
                    ...mixerState,
                    masterVolume: parseInt(e.target.value, 10),
                  })
                }
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0% (Silent)</span>
                <span>100% (Unity)</span>
                <span>150% (Boost)</span>
              </div>
            </div>

            {/* Broadcast Normalization Preset */}
            <div className="p-4 rounded-2xl bg-[#070912] border border-white/[0.06] space-y-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-purple-400" /> Loudness Standard
              </span>
              <div className="space-y-1.5">
                {LOUDNESS_STANDARDS.map((std) => (
                  <button
                    key={std.id}
                    onClick={() =>
                      onChangeMixerState({
                        ...mixerState,
                        loudnessStandard: std.id,
                      })
                    }
                    className={`w-full p-2 rounded-xl text-left text-xs transition-all flex items-center justify-between ${
                      mixerState.loudnessStandard === std.id
                        ? 'bg-purple-600/30 border border-purple-500 text-white font-bold'
                        : 'bg-white/[0.02] border border-white/[0.06] text-slate-400 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{std.name}</div>
                      <div className="text-[10px] opacity-70 truncate">{std.description}</div>
                    </div>
                    {mixerState.loudnessStandard === std.id && (
                      <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 ml-2" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-[#070912] flex items-center justify-between">
          <button
            onClick={handleReset}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset to Unity
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 transition-all"
          >
            Done & Apply
          </button>
        </div>
      </div>
    </div>
  );
}
