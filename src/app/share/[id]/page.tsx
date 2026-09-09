'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Share2,
  Download,
  Copy,
  Check,
  Play,
  Film,
  Sparkles,
  MessageSquare,
  Clock,
  Layers,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

export default function PublicSharePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Array<{ id: string; user: string; text: string; time: string }>>([
    {
      id: 'c-1',
      user: 'Creative Director',
      text: 'The silence cuts and color grading look crisp! The karaoke subtitles really boost engagement.',
      time: '10m ago',
    },
  ]);

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.project) setProject(data.project);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [projectId]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Share link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setComments((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        user: 'Guest Reviewer',
        text: commentText.trim(),
        time: 'Just now',
      },
    ]);
    setCommentText('');
    toast.success('Feedback note posted!');
  };

  const isImage = !!project?.originalVideoUrl?.match(/\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i);
  const mediaSrc = project?.originalVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

  return (
    <div className="min-h-screen bg-[#06080F] text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 border-b border-white/[0.08] bg-[#080B14]/80 backdrop-blur-xl px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center shadow-md shadow-purple-600/30">
              <Film className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-white">
              EditFlow <span className="text-cyan-400">Share</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopyLink}
            className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-white flex items-center gap-1.5 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{copied ? 'Link Copied' : 'Copy Link'}</span>
          </button>

          <a
            href={mediaSrc}
            download="video_export.mp4"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-xs font-bold text-white shadow-md shadow-purple-600/30 transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </a>
        </div>
      </header>

      {/* Main Theater View */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 space-y-8">
        {/* Video Theater Box */}
        <div className="rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl bg-black">
          <div className="relative aspect-video flex items-center justify-center bg-black overflow-hidden">
            {isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaSrc} alt={project?.title || 'Preview'} className="w-full h-full object-contain" />
            ) : (
              <video
                src={mediaSrc}
                controls
                autoPlay
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
                }}
              />
            )}
          </div>

          {/* Video Metadata Bar */}
          <div className="p-6 bg-[#0B0F1C] border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 text-[10px] font-bold border border-cyan-500/20">
                  Ready to Share
                </span>
                <span className="text-slate-400 text-xs font-mono">• 1080p 60fps</span>
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                {project?.title || 'Untitled EditFlow Project'}
              </h1>
            </div>

            {/* Quick Social Share Buttons */}
            <div className="flex items-center gap-2">
              <a
                href={`https://twitter.com/intent/tweet?text=Check out this video edited with EditFlow AI&url=${typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
              >
                <span>Twitter / X</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
              <a
                href={`https://api.whatsapp.com/send?text=Check out this video: ${typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
              >
                <span>WhatsApp</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>
        </div>

        {/* 2-Column Info & Comments */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Column: AI Pipeline Diagnostics */}
          <div className="md:col-span-7 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" /> AI Production Specifications
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-slate-400 block mb-1">Duration</span>
                <span className="text-sm font-bold text-white font-mono">{Math.round(project?.duration || 30)}s</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-slate-400 block mb-1">Subtitles</span>
                <span className="text-sm font-bold text-cyan-400">Word-by-Word</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-slate-400 block mb-1">Audio Master</span>
                <span className="text-sm font-bold text-emerald-400">-14 LUFS Clean</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs text-slate-400 leading-relaxed">
              This video was processed with EditFlow AI&apos;s intelligent media composition engine with silence trimming, synchronized captions, sound effects, and multi-track visual overlays.
            </div>
          </div>

          {/* Right Column: Feedback & Review Notes */}
          <div className="md:col-span-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" /> Reviewer Feedback & Notes
            </h3>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="space-y-2">
              <textarea
                rows={2}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Leave feedback or timestamps for the creator..."
                className="w-full p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all shadow-md shadow-cyan-900/20"
              >
                Post Review Note
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {comments.map((c) => (
                <div key={c.id} className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">{c.user}</span>
                    <span className="text-[10px] text-slate-500">{c.time}</span>
                  </div>
                  <p className="text-slate-300 leading-snug">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
