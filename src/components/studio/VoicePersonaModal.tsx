'use client';

import React, { useState } from 'react';
import {
  Mic,
  X,
  Play,
  Check,
  Sparkles,
  Sliders,
  Volume2,
  Square,
} from 'lucide-react';
import { toast } from 'sonner';
import { VoicePersona, VOICE_PERSONAS, DEFAULT_VOICE_PERSONA } from '@/lib/voicePersona';

interface VoicePersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPersona: (persona: VoicePersona) => void;
  sampleText: string;
}

export default function VoicePersonaModal({
  isOpen,
  onClose,
  onApplyPersona,
  sampleText,
}: VoicePersonaModalProps) {
  const [selectedPersona, setSelectedPersona] = useState<VoicePersona>(DEFAULT_VOICE_PERSONA);
  const [pitch, setPitch] = useState(DEFAULT_VOICE_PERSONA.pitch);
  const [rate, setRate] = useState(DEFAULT_VOICE_PERSONA.rate);
  const [warmth, setWarmth] = useState(DEFAULT_VOICE_PERSONA.warmth);
  const [presence, setPresence] = useState(DEFAULT_VOICE_PERSONA.presence);
  const [isPlayingTest, setIsPlayingTest] = useState(false);

  if (!isOpen) return null;

  const handleSelectPreset = (p: VoicePersona) => {
    setSelectedPersona(p);
    setPitch(p.pitch);
    setRate(p.rate);
    setWarmth(p.warmth);
    setPresence(p.presence);
    toast.info(`Selected ${p.name}`);
  };

  const handleTestSpeech = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      toast.error('Web Speech Synthesis not supported in this browser');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      sampleText || 'Transform your content into viral high engagement videos with EditFlow AI.'
    );
    utterance.pitch = pitch;
    utterance.rate = rate;

    // Pick an expressive English voice if available
    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find((v) => v.lang.startsWith('en') && v.name.includes('Natural')) || voices.find((v) => v.lang.startsWith('en'));
    if (enVoice) utterance.voice = enVoice;

    utterance.onstart = () => setIsPlayingTest(true);
    utterance.onend = () => setIsPlayingTest(false);
    utterance.onerror = () => setIsPlayingTest(false);

    window.speechSynthesis.speak(utterance);
    toast.success(`🎙️ Testing "${selectedPersona.name}" audio timbre...`);
  };

  const handleStopSpeech = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlayingTest(false);
    }
  };

  const handleApply = () => {
    const customPersona: VoicePersona = {
      ...selectedPersona,
      pitch,
      rate,
      warmth,
      presence,
    };
    onApplyPersona(customPersona);
    toast.success(`✨ Voice Persona "${customPersona.name}" applied to studio!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[#090D1A] border border-cyan-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-gradient-to-r from-cyan-950/40 via-[#090D1A] to-purple-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center">
              <Mic className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                AI Voice Persona & Timbre Studio
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-mono px-2 py-0.5 rounded-full font-bold">
                  NEURAL
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Sculpt speech pitch, delivery rate, chest warmth, and presence EQ.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Persona Presets Grid */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Vocal Persona Preset</label>
            <div className="space-y-2">
              {VOICE_PERSONAS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`w-full p-3 rounded-2xl border text-left transition-all ${
                    selectedPersona.id === p.id
                      ? 'bg-cyan-600/20 border-cyan-400 text-white shadow-md shadow-cyan-500/10'
                      : 'bg-black/30 border-white/[0.06] text-slate-300 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{p.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                      {p.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{p.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Micro-Tuning Sliders */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.07] space-y-4">
            <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" /> Vocal Timbre Tuning
            </h4>

            {/* Pitch */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Speech Pitch</span>
                <span className="font-mono text-cyan-400">{pitch.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min={0.6}
                max={1.6}
                step={0.05}
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* Speed Rate */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Speech Rate / Velocity</span>
                <span className="font-mono text-cyan-400">{rate.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min={0.7}
                max={1.5}
                step={0.05}
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* Warmth & Presence */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Chest Warmth</span>
                  <span className="font-mono text-purple-400">+{warmth}dB</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={6}
                  step={0.5}
                  value={warmth}
                  onChange={(e) => setWarmth(parseFloat(e.target.value))}
                  className="w-full accent-purple-400"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Air Presence</span>
                  <span className="font-mono text-cyan-400">+{presence}dB</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={6}
                  step={0.5}
                  value={presence}
                  onChange={(e) => setPresence(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/[0.08] flex items-center justify-between bg-black/40">
          <button
            type="button"
            onClick={isPlayingTest ? handleStopSpeech : handleTestSpeech}
            className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-cyan-300 border border-cyan-500/30 transition-all flex items-center gap-1.5"
          >
            {isPlayingTest ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" /> Stop Audition
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" /> Audition Timbre
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/[0.05] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition-all"
            >
              <Check className="w-3.5 h-3.5" /> Apply Persona
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
