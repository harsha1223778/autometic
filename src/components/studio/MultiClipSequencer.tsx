'use client';

import React from 'react';
import { Film, Image as ImageIcon, ChevronLeft, ChevronRight, Trash2, Clock, Layers, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export interface SequenceClip {
  id: string;
  name: string;
  url: string;
  type: 'video' | 'image';
  duration: number;
  thumbnailUrl?: string;
}

interface MultiClipSequencerProps {
  clips: SequenceClip[];
  onReorderClips: (reordered: SequenceClip[]) => void;
  onRemoveClip: (clipId: string) => void;
  onUpdateClipDuration: (clipId: string, duration: number) => void;
  onSelectClip: (clip: SequenceClip) => void;
  activeClipId?: string;
}

export default function MultiClipSequencer({
  clips,
  onReorderClips,
  onRemoveClip,
  onUpdateClipDuration,
  onSelectClip,
  activeClipId,
}: MultiClipSequencerProps) {
  const totalDuration = clips.reduce((acc, c) => acc + (Number(c.duration) || 5), 0);

  const moveClip = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= clips.length) return;

    const newClips = [...clips];
    const [moved] = newClips.splice(index, 1);
    newClips.splice(targetIndex, 0, moved);
    onReorderClips(newClips);
    toast.success(`Moved "${moved.name}" to position #${targetIndex + 1}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" /> Multi-Clip Sequencer
          </h4>
          <p className="text-[10px] text-slate-400">
            Magnetic primary track with gapless ripple editing
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono text-cyan-400 font-bold block">
            {clips.length} Clips
          </span>
          <span className="text-[9px] font-mono text-slate-400">
            Total {totalDuration.toFixed(1)}s
          </span>
        </div>
      </div>

      {clips.length === 0 ? (
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-center space-y-2">
          <Film className="w-6 h-6 text-slate-500 mx-auto" />
          <p className="text-xs text-slate-300 font-medium">No clips added to sequence</p>
          <p className="text-[10px] text-slate-500">
            Add videos or images from the Media tab to assemble a multi-scene timeline.
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {clips.map((clip, index) => {
            const isSelected = activeClipId === clip.id;
            return (
              <div
                key={clip.id}
                className={`p-2.5 rounded-2xl border transition-all space-y-2 ${
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-400 shadow-md shadow-cyan-950/30'
                    : 'bg-white/[0.03] border-white/[0.08] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div
                    onClick={() => onSelectClip(clip)}
                    className="flex items-center gap-2.5 flex-1 cursor-pointer overflow-hidden"
                  >
                    <span className="w-5 h-5 rounded-lg bg-white/10 text-slate-300 font-mono text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      #{index + 1}
                    </span>
                    <div className="w-10 h-8 rounded-lg bg-black overflow-hidden relative flex-shrink-0">
                      {clip.thumbnailUrl || clip.type === 'image' ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={clip.thumbnailUrl || clip.url}
                          alt={clip.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <Film className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold text-white truncate">{clip.name}</p>
                      <span className="text-[9px] text-slate-400 uppercase font-mono">
                        {clip.type} • {clip.duration}s
                      </span>
                    </div>
                  </div>

                  {/* Reorder and Delete Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveClip(index, 'left')}
                      className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30 transition-colors"
                      title="Move earlier"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === clips.length - 1}
                      onClick={() => moveClip(index, 'right')}
                      className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30 transition-colors"
                      title="Move later"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onRemoveClip(clip.id);
                        toast.success(`Removed #${index + 1} with ripple gap closing`);
                      }}
                      className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete & Ripple Close"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Per-Clip Duration Adjustment Slider */}
                <div className="flex items-center gap-2 pt-1 border-t border-white/[0.04]">
                  <Clock className="w-3 h-3 text-slate-500 flex-shrink-0" />
                  <span className="text-[9px] text-slate-400 font-mono w-14">
                    {clip.duration.toFixed(1)}s
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={20}
                    step={0.5}
                    value={clip.duration}
                    onChange={(e) => onUpdateClipDuration(clip.id, parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 h-1 bg-white/10 rounded cursor-pointer"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
