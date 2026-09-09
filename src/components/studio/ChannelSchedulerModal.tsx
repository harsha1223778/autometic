'use client';

import React, { useState } from 'react';
import {
  Calendar,
  X,
  Clock,
  Send,
  Check,
  Share2,
  Trash2,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  PlatformScheduleConfig,
  ScheduledDispatch,
  buildPlatformConfigs,
  loadScheduledDispatches,
  saveScheduledDispatches,
} from '@/lib/channelScheduler';

interface ChannelSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  transcriptSnippet: string;
}

export default function ChannelSchedulerModal({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  transcriptSnippet,
}: ChannelSchedulerModalProps) {
  const [platformConfigs, setPlatformConfigs] = useState<PlatformScheduleConfig[]>(() =>
    buildPlatformConfigs(projectTitle, transcriptSnippet)
  );
  const [scheduledDate, setScheduledDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [scheduledTime, setScheduledTime] = useState('18:30');
  const [dispatches, setDispatches] = useState<ScheduledDispatch[]>(() =>
    loadScheduledDispatches(projectId)
  );

  if (!isOpen) return null;

  const handleTogglePlatform = (platformKey: string) => {
    setPlatformConfigs((prev) =>
      prev.map((cfg) =>
        cfg.platform === platformKey ? { ...cfg, enabled: !cfg.enabled } : cfg
      )
    );
  };

  const handleCaptionChange = (platformKey: string, newText: string) => {
    setPlatformConfigs((prev) =>
      prev.map((cfg) =>
        cfg.platform === platformKey ? { ...cfg, caption: newText } : cfg
      )
    );
  };

  const handleConfirmSchedule = () => {
    const activePlatforms = platformConfigs
      .filter((c) => c.enabled)
      .map((c) => c.platform);

    if (activePlatforms.length === 0) {
      toast.error('Please enable at least one target channel');
      return;
    }

    const newDispatch: ScheduledDispatch = {
      id: `dispatch-${Date.now()}`,
      title: projectTitle || 'Viral Video Release',
      scheduledDate,
      scheduledTime,
      platforms: activePlatforms,
      status: 'queued',
      createdAt: new Date().toLocaleDateString(),
    };

    const updated = [newDispatch, ...dispatches];
    setDispatches(updated);
    saveScheduledDispatches(projectId, updated);
    toast.success(
      `🚀 Scheduled release across ${activePlatforms.length} platforms for ${scheduledDate} @ ${scheduledTime}!`
    );
    onClose();
  };

  const handleDeleteDispatch = (dispatchId: string) => {
    const updated = dispatches.filter((d) => d.id !== dispatchId);
    setDispatches(updated);
    saveScheduledDispatches(projectId, updated);
    toast.info('Cancelled scheduled release');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Autonomous Channel Release Scheduler
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
                  Auto-Dispatch
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Multi-platform release automation with tailored captions, peak times, and scheduling queue.
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
          {/* Calendar & Optimal Time Slots */}
          <div className="p-4 rounded-xl bg-neutral-800/40 border border-neutral-700/60 space-y-3">
            <label className="text-xs font-bold text-white uppercase tracking-wider block flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Target Publishing Window
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Release Date</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Release Time (Local)</label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Quick Optimal Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[10px] text-neutral-400 font-medium">Quick Peak Times:</span>
              {[
                { label: 'Today Peak (7:45 PM)', time: '19:45' },
                { label: 'Tomorrow Morning (9:00 AM)', time: '09:00' },
                { label: 'Tomorrow Evening (6:30 PM)', time: '18:30' },
              ].map((slot, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setScheduledTime(slot.time)}
                  className="text-[10px] px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-700 hover:border-emerald-500 text-neutral-300 transition"
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </div>

          {/* Platform Channels Grid */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-white uppercase tracking-wider block">
              Channel Formats & Tailored Copy
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {platformConfigs.map((cfg) => (
                <div
                  key={cfg.platform}
                  className={`p-4 rounded-xl border transition-all space-y-3 ${
                    cfg.enabled
                      ? 'bg-neutral-800/60 border-neutral-700 shadow-md ring-1 ring-emerald-500/30'
                      : 'bg-neutral-900/30 border-neutral-800 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{cfg.icon}</span>
                      <div>
                        <span className="font-bold text-xs text-white block">{cfg.name}</span>
                        <span className="text-[9px] text-neutral-400 font-mono">{cfg.optimalTime}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTogglePlatform(cfg.platform)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        cfg.enabled
                          ? 'bg-emerald-600 text-white'
                          : 'bg-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {cfg.enabled ? 'ACTIVE' : 'OFF'}
                    </button>
                  </div>

                  {cfg.enabled && (
                    <div className="space-y-2 pt-1">
                      <textarea
                        rows={3}
                        value={cfg.caption}
                        onChange={(e) => handleCaptionChange(cfg.platform, e.target.value)}
                        className="w-full p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
                      />
                      <div className="flex flex-wrap gap-1">
                        {cfg.hashtags.map((ht, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-emerald-400 font-mono"
                          >
                            {ht}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Active Dispatches Queue */}
          {dispatches.length > 0 && (
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                Scheduled Queue ({dispatches.length})
              </span>
              <div className="space-y-2">
                {dispatches.map((d) => (
                  <div
                    key={d.id}
                    className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-white block">{d.title}</span>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        {d.scheduledDate} @ {d.scheduledTime} • {d.platforms.join(', ').toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                        QUEUED
                      </span>
                      <button
                        onClick={() => handleDeleteDispatch(d.id)}
                        className="p-1 text-neutral-500 hover:text-rose-400 transition"
                        title="Cancel"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
            onClick={handleConfirmSchedule}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition"
          >
            <Send className="w-4 h-4" />
            <span>Confirm & Dispatch Schedule</span>
          </button>
        </div>
      </div>
    </div>
  );
}
