'use client';

import React, { useState } from 'react';
import {
  VideoEmbedConfig,
  DEFAULT_EMBED_CONFIG,
  generateIframeEmbedCode,
  generateReactEmbedCode
} from '@/lib/videoEmbedder';

interface VideoEmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  videoUrl?: string;
}

export function VideoEmbedModal({ isOpen, onClose, projectId, videoUrl }: VideoEmbedModalProps) {
  const [config, setConfig] = useState<VideoEmbedConfig>(DEFAULT_EMBED_CONFIG);
  const [activeTab, setActiveTab] = useState<'iframe' | 'react' | 'link'>('iframe');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000';
  const iframeCode = generateIframeEmbedCode(projectId, videoUrl || '', config, origin);
  const reactCode = generateReactEmbedCode(projectId, videoUrl || '', config, origin);
  const directLink = `${origin}/embed/${projectId}?auto=${config.autoplay ? 1 : 0}&mute=${config.muted ? 1 : 0}`;

  const currentCode = activeTab === 'iframe' ? iframeCode : activeTab === 'react' ? reactCode : directLink;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Interactive Player & Embed Studio</h2>
              <p className="text-xs text-zinc-400">Embed this video anywhere with custom branding and lead capture</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition"
          >
            ✕
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-zinc-900/90 border border-zinc-800 rounded-xl p-1 gap-1">
          <button
            onClick={() => setActiveTab('iframe')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'iframe'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            HTML &lt;iframe&gt;
          </button>
          <button
            onClick={() => setActiveTab('react')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'react'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            React / Next.js
          </button>
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'link'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Direct Share URL
          </button>
        </div>

        {/* Configuration Toggles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/60">
          <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={config.autoplay}
              onChange={e => setConfig({ ...config, autoplay: e.target.checked })}
              className="rounded bg-zinc-800 border-zinc-700 text-blue-600 focus:ring-blue-500"
            />
            Autoplay
          </label>
          <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={config.muted}
              onChange={e => setConfig({ ...config, muted: e.target.checked })}
              className="rounded bg-zinc-800 border-zinc-700 text-blue-600 focus:ring-blue-500"
            />
            Muted Start
          </label>
          <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={config.loop}
              onChange={e => setConfig({ ...config, loop: e.target.checked })}
              className="rounded bg-zinc-800 border-zinc-700 text-blue-600 focus:ring-blue-500"
            />
            Infinite Loop
          </label>
          <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={config.showControls}
              onChange={e => setConfig({ ...config, showControls: e.target.checked })}
              className="rounded bg-zinc-800 border-zinc-700 text-blue-600 focus:ring-blue-500"
            />
            Show Controls
          </label>
        </div>

        {/* Lead Capture Gate Controls */}
        <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-200">Interactive Lead-Capture Gate</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Lead Gen</span>
            </div>
            <input
              type="checkbox"
              checked={config.leadGateEnabled}
              onChange={e => setConfig({ ...config, leadGateEnabled: e.target.checked })}
              className="rounded bg-zinc-800 border-zinc-700 text-emerald-600 focus:ring-emerald-500"
            />
          </div>

          {config.leadGateEnabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs border-t border-zinc-800">
              <div>
                <label className="text-zinc-400 block mb-1">Gate at Second:</label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={config.leadGateTimestamp}
                  onChange={e => setConfig({ ...config, leadGateTimestamp: Number(e.target.value) })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-zinc-200"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Gate Headline:</label>
                <input
                  type="text"
                  value={config.leadGateHeadline}
                  onChange={e => setConfig({ ...config, leadGateHeadline: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-zinc-200"
                />
              </div>
            </div>
          )}
        </div>

        {/* Code Output Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">
              {activeTab === 'iframe' ? 'Ready-to-paste embed markup' : activeTab === 'react' ? 'Next.js component code' : 'Direct link'}
            </span>
            <button
              onClick={handleCopy}
              className={`text-xs px-3 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
                copied ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {copied ? '✓ Copied to clipboard!' : 'Copy Code'}
            </button>
          </div>
          <pre className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-300 overflow-x-auto whitespace-pre-wrap max-h-44">
            {currentCode}
          </pre>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
