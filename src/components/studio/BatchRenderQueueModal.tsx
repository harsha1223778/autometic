'use client';

import React, { useState } from 'react';
import {
  Layers,
  X,
  Play,
  CheckCircle2,
  Loader2,
  Download,
  Smartphone,
  Monitor,
  Square,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

interface BatchRenderQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRenderAspect: (aspect: '16:9' | '9:16' | '1:1') => Promise<void>;
  projectTitle: string;
}

interface AspectJob {
  aspect: '16:9' | '9:16' | '1:1';
  title: string;
  resolution: string;
  destination: string;
  icon: typeof Monitor;
  status: 'idle' | 'rendering' | 'completed' | 'error';
  progress: number;
}

export default function BatchRenderQueueModal({
  isOpen,
  onClose,
  onRenderAspect,
  projectTitle,
}: BatchRenderQueueModalProps) {
  const [jobs, setJobs] = useState<AspectJob[]>([
    {
      aspect: '16:9',
      title: 'YouTube 16:9 Widescreen',
      resolution: '1280 x 720 (HD Master)',
      destination: 'YouTube, Web Player, TV',
      icon: Monitor,
      status: 'idle',
      progress: 0,
    },
    {
      aspect: '9:16',
      title: 'Vertical 9:16 Shorts / TikTok',
      resolution: '720 x 1280 (Mobile Vertical)',
      destination: 'TikTok, IG Reels, YT Shorts',
      icon: Smartphone,
      status: 'idle',
      progress: 0,
    },
    {
      aspect: '1:1',
      title: 'Square 1:1 Social Feed',
      resolution: '720 x 720 (Feed Square)',
      destination: 'Instagram, LinkedIn, Twitter',
      icon: Square,
      status: 'idle',
      progress: 0,
    },
  ]);
  const [isQueueRunning, setIsQueueRunning] = useState(false);

  if (!isOpen) return null;

  const handleStartIndividualRender = async (aspect: '16:9' | '9:16' | '1:1') => {
    setJobs((prev) =>
      prev.map((j) => (j.aspect === aspect ? { ...j, status: 'rendering', progress: 15 } : j))
    );
    try {
      // Simulate progress updates while rendering
      const progressTimer = setInterval(() => {
        setJobs((prev) =>
          prev.map((j) =>
            j.aspect === aspect && j.status === 'rendering'
              ? { ...j, progress: Math.min(90, j.progress + 18) }
              : j
          )
        );
      }, 500);

      await onRenderAspect(aspect);
      clearInterval(progressTimer);

      setJobs((prev) =>
        prev.map((j) => (j.aspect === aspect ? { ...j, status: 'completed', progress: 100 } : j))
      );
      toast.success(`🎉 Completed ${aspect} render & download!`);
    } catch {
      setJobs((prev) =>
        prev.map((j) => (j.aspect === aspect ? { ...j, status: 'error' } : j))
      );
      toast.error(`Failed to render ${aspect}`);
    }
  };

  const handleStartAllRenders = async () => {
    setIsQueueRunning(true);
    toast.info('🚀 Starting sequential multi-aspect batch render queue...');

    for (const job of jobs) {
      if (job.status !== 'completed') {
        await handleStartIndividualRender(job.aspect);
      }
    }
    setIsQueueRunning(false);
    toast.success('🏆 All multi-aspect outputs rendered successfully!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#080C17] border border-cyan-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-gradient-to-r from-cyan-950/40 via-[#080C17] to-purple-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center">
              <Layers className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Multi-Aspect Simultaneous Batch Render Queue
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-mono px-2 py-0.5 rounded-full font-bold">
                  MULTI-CORE
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Render 16:9, 9:16 vertical, and 1:1 feed clips in a single automated session.
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block">Target Project</span>
              <span className="text-white font-bold text-sm truncate max-w-sm block">
                {projectTitle}
              </span>
            </div>
            <button
              onClick={handleStartAllRenders}
              disabled={isQueueRunning}
              className="py-2 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isQueueRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Rendering Queue...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Render All 3 Formats
                </>
              )}
            </button>
          </div>

          {/* Job Cards */}
          <div className="space-y-3">
            {jobs.map((job) => {
              const Icon = job.icon;
              return (
                <div
                  key={job.aspect}
                  className={`p-4 rounded-2xl border transition-all ${
                    job.status === 'completed'
                      ? 'bg-emerald-950/20 border-emerald-500/40'
                      : job.status === 'rendering'
                      ? 'bg-cyan-950/30 border-cyan-400/60 shadow-lg shadow-cyan-500/10'
                      : 'bg-black/30 border-white/[0.07] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">{job.title}</h4>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-cyan-300 border border-cyan-500/30">
                            {job.aspect}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {job.resolution} • {job.destination}
                        </p>
                      </div>
                    </div>

                    <div>
                      {job.status === 'completed' ? (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-500/40">
                          <CheckCircle2 className="w-4 h-4" /> Ready & Downloaded
                        </div>
                      ) : job.status === 'rendering' ? (
                        <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                          <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                          <span>{job.progress}%</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleStartIndividualRender(job.aspect)}
                          disabled={isQueueRunning}
                          className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-cyan-500/20 hover:border-cyan-400 text-xs font-semibold text-slate-200 hover:text-cyan-300 border border-white/10 transition-all flex items-center gap-1.5 disabled:opacity-40"
                        >
                          <Play className="w-3 h-3 text-cyan-400" /> Render Format
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Meter */}
                  {job.status === 'rendering' && (
                    <div className="mt-3 w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-300"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/[0.08] flex items-center justify-between bg-black/40">
          <span className="text-[11px] text-slate-400 font-mono">
            Hardware-accelerated MediaRecorder Canvas pipeline
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-white transition-colors"
          >
            Close Queue
          </button>
        </div>
      </div>
    </div>
  );
}
