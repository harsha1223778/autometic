'use client';

import React, { useState, useEffect } from 'react';
import {
  Globe,
  X,
  Plus,
  Send,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Code,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  WebhookEndpoint,
  getWebhooks,
  saveWebhook,
  deleteWebhook,
  dispatchWebhook,
  PublishPayload,
} from '@/lib/webhooks';

interface WebhookHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle?: string;
  projectId?: string;
  duration?: number;
}

export default function WebhookHubModal({
  isOpen,
  onClose,
  projectTitle = 'Viral Video',
  projectId = 'p-1',
  duration = 30,
}: WebhookHubModalProps) {
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState<'zapier' | 'make' | 'discord' | 'custom'>('zapier');
  const [url, setUrl] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEndpoints(getWebhooks());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !url) {
      toast.error('Please provide a name and valid Webhook URL');
      return;
    }
    const updated = saveWebhook({
      name,
      platform,
      url,
      enabled: true,
    });
    setEndpoints(updated);
    setName('');
    setUrl('');
    setShowAddForm(false);
    toast.success('Webhook endpoint registered!');
  };

  const handleDelete = (id: string) => {
    const updated = deleteWebhook(id);
    setEndpoints(updated);
    toast.info('Webhook removed');
  };

  const handleTestDispatch = async (endpoint: WebhookEndpoint) => {
    setIsSending(true);
    const mockPayload: PublishPayload = {
      event: 'manual_dispatch',
      projectId,
      title: projectTitle || 'Viral Video',
      duration,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
      aspectRatio: '9:16',
      operationsCount: 8,
      youtubeChapters: '00:00 - Intro\n00:08 - Strategy\n00:20 - Outro',
      tiktokCaption: 'Watch until the end! 🔥 #shorts #fyp #viral',
      hashtags: ['#shorts', '#fyp', '#viral'],
      timestamp: new Date().toISOString(),
    };

    const res = await dispatchWebhook(endpoint, mockPayload);
    setIsSending(false);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#0A0D18] border border-white/10 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#0D1120]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Webhooks & Multi-Platform Publishing Hub
              </h3>
              <p className="text-xs text-slate-400">
                Auto-dispatch rendered videos and viral copy to Zapier, Make.com, or Discord
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

        {/* Modal Body */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
          {/* Header Action */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Connected Endpoints ({endpoints.length})
            </span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 rounded-xl bg-purple-600/25 border border-purple-500/40 text-purple-300 text-xs font-semibold hover:bg-purple-600/40 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> {showAddForm ? 'Cancel' : 'Add Webhook'}
            </button>
          </div>

          {/* Add Webhook Form */}
          {showAddForm && (
            <form
              onSubmit={handleAddWebhook}
              className="p-4 rounded-2xl bg-white/[0.03] border border-purple-500/30 space-y-3 animate-in fade-in"
            >
              <h4 className="text-xs font-bold text-white">Register New Automation Webhook</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Pipeline Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Zapier YouTube Shorts Pipeline"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Platform</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as any)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="zapier">Zapier Catch Hook</option>
                    <option value="make">Make.com / Integromat</option>
                    <option value="discord">Discord Webhook</option>
                    <option value="custom">Custom REST API</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Webhook URL Endpoint</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow transition-all"
                >
                  Save Webhook
                </button>
              </div>
            </form>
          )}

          {/* Endpoints List */}
          <div className="space-y-2.5">
            {endpoints.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-xs text-slate-400">
                No webhooks configured. Click "Add Webhook" to connect Zapier, Make, or Discord.
              </div>
            ) : (
              endpoints.map((ep) => (
                <div
                  key={ep.id}
                  className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-purple-500/30 transition-all flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white truncate">{ep.name}</span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 uppercase font-bold">
                        {ep.platform}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono truncate">{ep.url}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleTestDispatch(ep)}
                      disabled={isSending}
                      className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-slate-200 transition-all flex items-center gap-1.5"
                    >
                      <Send className="w-3 h-3 text-cyan-400" /> Test Ping
                    </button>
                    <button
                      onClick={() => handleDelete(ep.id)}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Webhook"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* JSON Payload Inspector */}
          <div className="space-y-2 pt-2 border-t border-white/[0.08]">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-cyan-400" /> Standard Outgoing JSON Payload Schema
            </span>
            <pre className="p-3 rounded-xl bg-black/60 border border-white/5 text-[10px] font-mono text-cyan-300/80 overflow-x-auto leading-relaxed">
              {JSON.stringify(
                {
                  event: 'video_rendered',
                  projectId,
                  title: projectTitle || 'Viral Video',
                  duration,
                  videoUrl: 'https://cdn.editflow.ai/renders/...webm',
                  thumbnailUrl: 'https://cdn.editflow.ai/thumbnails/...jpg',
                  aspectRatio: '9:16',
                  youtubeChapters: '00:00 - Hook\n00:08 - Breakdown...',
                  tiktokCaption: 'Check this out! #shorts #fyp',
                  timestamp: '2026-09-09T20:45:00Z',
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-[#070912] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-white transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
