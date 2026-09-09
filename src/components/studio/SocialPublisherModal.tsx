'use client';

import React, { useState } from 'react';
import {
  Share2,
  X,
  Copy,
  Check,
  Download,
  FileText,
  Film,
  Smartphone,
  Sparkles,
  Hash,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  generateSocialLaunchKit,
  downloadTextFile,
  SocialLaunchKit,
} from '@/lib/socialPublisher';

interface SocialPublisherModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  transcript: string;
  duration: number;
}

export default function SocialPublisherModal({
  isOpen,
  onClose,
  title,
  transcript,
  duration,
}: SocialPublisherModalProps) {
  const [activeTab, setActiveTab] = useState<'youtube' | 'shorts' | 'captions'>('youtube');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const kit: SocialLaunchKit = generateSocialLaunchKit({
    title,
    transcript,
    duration,
  });

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadSRT = () => {
    const filename = `${title.toLowerCase().replace(/\s+/g, '_')}_subtitles.srt`;
    downloadTextFile(filename, kit.srtContent, 'application/x-subrip');
    toast.success(`Downloaded ${filename}`);
  };

  const handleDownloadVTT = () => {
    const filename = `${title.toLowerCase().replace(/\s+/g, '_')}_captions.vtt`;
    downloadTextFile(filename, kit.vttContent, 'text/vtt');
    toast.success(`Downloaded ${filename}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#0A0D18] border border-white/10 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#0D1120]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-600/20">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                1-Click Social Launch Kit & Metadata
              </h3>
              <p className="text-xs text-slate-400">
                SEO chapters, TikTok captions, viral hashtags, and SRT/VTT subtitle downloads
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

        {/* Platform Tabs */}
        <div className="flex border-b border-white/[0.08] px-6 pt-3 gap-2 bg-[#070912]">
          {[
            { id: 'youtube', label: 'YouTube Long-Form', icon: Film },
            { id: 'shorts', label: 'TikTok / Reels / Shorts', icon: Smartphone },
            { id: 'captions', label: 'Subtitle Files (.SRT / .VTT)', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          {/* YouTube Tab */}
          {activeTab === 'youtube' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Recommended Video Title
                </span>
                <button
                  onClick={() => handleCopy(kit.youtubeMetadata.title, 'yt-title')}
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold"
                >
                  {copiedKey === 'yt-title' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === 'yt-title' ? 'Copied' : 'Copy Title'}
                </button>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-slate-200 font-medium font-mono">
                {kit.youtubeMetadata.title}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Description & Auto-Timestamps
                </span>
                <button
                  onClick={() => handleCopy(kit.youtubeMetadata.description, 'yt-desc')}
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold"
                >
                  {copiedKey === 'yt-desc' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === 'yt-desc' ? 'Copied' : 'Copy Description'}
                </button>
              </div>
              <textarea
                readOnly
                rows={8}
                value={kit.youtubeMetadata.description}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl p-3 text-xs text-slate-300 font-mono leading-relaxed focus:outline-none"
              />

              <div className="space-y-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  SEO Tags
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {kit.youtubeMetadata.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TikTok & Shorts Tab */}
          {activeTab === 'shorts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Short-Form Post Caption
                </span>
                <button
                  onClick={() => handleCopy(kit.shortFormMetadata.caption, 'shorts-cap')}
                  className="text-xs text-pink-400 hover:text-pink-300 flex items-center gap-1 font-semibold"
                >
                  {copiedKey === 'shorts-cap' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === 'shorts-cap' ? 'Copied' : 'Copy Caption'}
                </button>
              </div>
              <textarea
                readOnly
                rows={6}
                value={kit.shortFormMetadata.caption}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl p-3 text-xs text-slate-300 font-sans leading-relaxed focus:outline-none"
              />

              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-pink-400" /> Trending Hashtag Cluster
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {kit.shortFormMetadata.hashtags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-1 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-300 font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Subtitles Tab */}
          {activeTab === 'captions' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Download formatted caption files with millisecond accuracy to upload directly into YouTube Studio, TikTok, Premiere Pro, or Final Cut.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <FileText className="w-4 h-4 text-cyan-400" /> SubRip Subtitles (.SRT)
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Standard subtitle file format accepted by YouTube, Facebook, and video editors.
                  </p>
                  <button
                    onClick={handleDownloadSRT}
                    className="w-full py-2 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Download .SRT
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <FileText className="w-4 h-4 text-purple-400" /> WebVTT Captions (.VTT)
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Modern HTML5 video subtitle format with styled cues and positioning.
                  </p>
                  <button
                    onClick={handleDownloadVTT}
                    className="w-full py-2 px-3 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Download .VTT
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-[#070912] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
