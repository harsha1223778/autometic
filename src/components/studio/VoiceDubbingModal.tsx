'use client';

import React, { useState } from 'react';
import { Globe, Volume2, Check, Sparkles, X, ArrowRight, Play } from 'lucide-react';
import { toast } from 'sonner';
import {
  DUBBING_LANGUAGES,
  DubbingProjectReport,
  generateAutomatedDubbing,
  speakDubbedSegment
} from '@/lib/voiceDubber';

interface VoiceDubbingModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalTranscript: string;
  duration: number;
  onApplyDubbing: (report: DubbingProjectReport) => void;
}

export default function VoiceDubbingModal({
  isOpen,
  onClose,
  originalTranscript,
  duration,
  onApplyDubbing
}: VoiceDubbingModalProps) {
  const [selectedLang, setSelectedLang] = useState('es');
  const [isDubbing, setIsDubbing] = useState(false);
  const [dubbingReport, setDubbingReport] = useState<DubbingProjectReport | null>(null);
  const [playingSegmentIndex, setPlayingSegmentIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleRunDubbing = async () => {
    setIsDubbing(true);
    try {
      const report = await generateAutomatedDubbing(originalTranscript, selectedLang, duration);
      setDubbingReport(report);
      toast.success(`Voice Dub generated in ${report.targetLanguage.name} (${report.syncAccuracyPercent}% time-sync)!`);
    } catch (err: any) {
      toast.error(err.message || 'Dubbing failed');
    } finally {
      setIsDubbing(false);
    }
  };

  const handlePreviewAudio = async (text: string, index: number, rate: number) => {
    setPlayingSegmentIndex(index);
    try {
      await speakDubbedSegment(text, selectedLang, rate);
    } finally {
      setPlayingSegmentIndex(null);
    }
  };

  const handleApply = () => {
    if (!dubbingReport) return;
    onApplyDubbing(dubbingReport);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">AI Multi-Language Voice Dubbing</h2>
              <p className="text-xs text-zinc-400">Automated translation with duration matching and vocal re-synthesis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Selection Grid */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-300 block">Select Target Language</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {DUBBING_LANGUAGES.map((lang) => {
              const isSelected = selectedLang === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setSelectedLang(lang.code)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-purple-600/20 border-purple-500 text-white shadow-md ring-1 ring-purple-500/50'
                      : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl">{lang.flag}</span>
                    {isSelected && <Check className="w-4 h-4 text-purple-400 stroke-[3]" />}
                  </div>
                  <span className="text-xs font-bold text-white block">{lang.name}</span>
                  <span className="text-[10px] text-purple-300 block">{lang.nativeName}</span>
                  <span className="text-[9px] text-zinc-500 block mt-0.5 truncate">{lang.defaultSpeaker}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Trigger Button */}
        <button
          type="button"
          onClick={handleRunDubbing}
          disabled={isDubbing}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-xs font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 ${isDubbing ? 'animate-spin' : ''}`} />
          <span>{isDubbing ? 'Synthesizing Dubbed Vocals...' : 'Generate AI Voice Dub & Align Pacing'}</span>
        </button>

        {/* Dubbing Report Preview */}
        {dubbingReport && (
          <div className="space-y-4 pt-2 border-t border-zinc-800">
            {/* Sync Accuracy Score Card */}
            <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Duration Time-Sync Fit</span>
                <span className="text-[10px] text-zinc-400">Pacing adjusted to fit video scene timestamps</span>
              </div>
              <span className="text-xl font-mono font-black text-purple-400">
                {dubbingReport.syncAccuracyPercent}%
              </span>
            </div>

            {/* Segments Inspector */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-zinc-300 block">Dubbed Dialogue Segments</span>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {dubbingReport.segments.map((seg, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="overflow-hidden space-y-1">
                      <p className="text-zinc-400 text-[11px] truncate">
                        <span className="text-zinc-500">EN:</span> {seg.originalText}
                      </p>
                      <p className="text-white font-medium text-[11px] truncate">
                        <span className="text-purple-400">{dubbingReport.targetLanguage.code.toUpperCase()}:</span> {seg.translatedText}
                      </p>
                      <span className="text-[9px] font-mono text-cyan-400 block">
                        Original: {seg.originalDuration}s • Dubbed: {seg.estimatedDubDuration}s ({seg.speechRateFactor}x speed)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePreviewAudio(seg.translatedText, idx, seg.speechRateFactor)}
                      className={`p-2 rounded-lg text-xs font-bold flex-shrink-0 transition ${
                        playingSegmentIndex === idx
                          ? 'bg-purple-500 text-white animate-pulse'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                      }`}
                      title="Preview Speech Audio"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Apply Action */}
            <button
              type="button"
              onClick={handleApply}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Apply Dubbed Audio & Subtitles to Studio Timeline</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
