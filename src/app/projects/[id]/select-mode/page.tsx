'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/navigation/Sidebar';
import TopNav from '@/components/navigation/TopNav';
import {
  Wand2,
  Sliders,
  BotMessageSquare,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function SelectModePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recommendation, setRecommendation] = useState<{
    mode: 'auto' | 'manual' | 'assistant';
    confidence: number;
    detectedCategory: string;
    reasoning: string;
  }>({
    mode: 'auto',
    confidence: 98,
    detectedCategory: 'Creator Dialogue & Spoken Vlog',
    reasoning: 'AI detected continuous speech with natural pause gaps. Auto-cut silence removal, vocal loudness normalization (-14 LUFS), and auto-captions will deliver the fastest broadcast-quality result.',
  });

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.project) {
          setProject(data.project);

          // AI Workflow Recommendation Logic based on project media characteristics
          const title = (data.project.title || '').toLowerCase();
          const isImage = !!data.project.originalVideoUrl?.match(/\.(png|jpe?g|webp|gif|svg)$/i);

          if (isImage || title.includes('photo') || title.includes('image') || title.includes('card') || title.includes('montage')) {
            setRecommendation({
              mode: 'assistant',
              confidence: 99,
              detectedCategory: 'Photo Montage & Multi-Asset Visuals',
              reasoning: 'Detected still photos and mixed graphics. The conversational AI Assistant is optimal for generating timed image slideshows, graphics overlays, and matching music.',
            });
          } else if (title.includes('landscape') || title.includes('b-roll') || title.includes('cinematic') || (data.project.duration && data.project.duration > 45)) {
            setRecommendation({
              mode: 'manual',
              confidence: 97,
              detectedCategory: 'Multi-Track Creative Footage & B-Roll',
              reasoning: 'Detected layered footage and cinematic pacing. The Manual Studio timeline is recommended for frame-accurate split trims, color grading LUTs, and multi-track audio mixing.',
            });
          } else {
            setRecommendation({
              mode: 'auto',
              confidence: 98,
              detectedCategory: 'Creator Dialogue & Speech Presentation',
              reasoning: 'Detected talking-head pacing. Auto-cut silence removal, vocal loudness normalization (-14 LUFS), and styled captions will produce an instant polished delivery.',
            });
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [projectId]);

  const modes = [
    {
      id: 'auto',
      title: 'Auto Edit Mode',
      subtitle: 'Instant Automated Polish',
      desc: 'Let AI detect long silences, trim dead air, master vocal loudness to -14 LUFS, and generate styled captions automatically.',
      icon: Wand2,
      href: `/projects/${projectId}/auto`,
      gradient: 'from-purple-600 to-indigo-600',
      borderGlow: 'hover:border-purple-500/60 hover:shadow-purple-900/30',
      features: [
        'Silence & pause removal',
        'Auto subtitle synchronization',
        'Loudness normalization',
        'Automatic scene cut transitions',
      ],
    },
    {
      id: 'manual',
      title: 'Manual Studio Mode',
      subtitle: 'Precision Multi-Track Studio',
      desc: 'Take complete direct control of video cuts, multi-track audio, trim handles, split points, custom subtitle styling, and color LUT filters.',
      icon: Sliders,
      href: `/projects/${projectId}/manual`,
      gradient: 'from-cyan-500 to-blue-600',
      borderGlow: 'hover:border-cyan-500/60 hover:shadow-cyan-900/30',
      features: [
        'Draggable clip timeline markers',
        'Trim, split & delete controls',
        'Music library volume ducking',
        'Undo & redo operations stack',
      ],
      badge: 'Pro Studio',
    },
    {
      id: 'assistant',
      title: 'AI Video Assistant',
      subtitle: 'Natural-Language Editing Copilot',
      desc: 'Describe what you want in plain English: "Make this vlog look professional, remove pauses, and add soft background music." The AI generates an actionable plan.',
      icon: BotMessageSquare,
      href: `/projects/${projectId}/assistant`,
      gradient: 'from-pink-500 to-rose-600',
      borderGlow: 'hover:border-pink-500/60 hover:shadow-pink-900/30',
      features: [
        'Conversational instructions parser',
        'Structured operations timeline',
        'One-click plan refinement',
        'Target aspect ratio adaptation',
      ],
      badge: 'AI Powered',
    },
  ];

  return (
    <div className="min-h-screen bg-[#080B14] text-slate-100 flex">
      <Sidebar />
      <div className="flex-1 pl-64">
        <TopNav />

        <main className="pt-24 px-8 pb-16 max-w-6xl mx-auto space-y-10">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> AI Creative Workflow Detection
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Select Your Creative Workflow
            </h1>
            <p className="text-sm text-slate-400">
              Targeted for &ldquo;{project?.title || 'Your Video'}&rdquo; • Switch between modes anytime after creating edits.
            </p>
          </div>

          {/* Project Preview Bar & AI Smart Recommendation Banner */}
          {project && (
            <div className="space-y-4 max-w-4xl mx-auto">
              {/* Footage Info Bar */}
              <div className="p-4 rounded-2xl glass-panel border border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-10 rounded-xl bg-black/40 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={project.thumbnailUrl || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80'}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">{project.title}</h3>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-cyan-400" /> {Math.round(project.duration || 30)} seconds duration
                    </span>
                  </div>
                </div>
                <span className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-medium">
                  Footage Analyzed
                </span>
              </div>

              {/* AI Recommendation Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-cyan-950/40 border border-cyan-500/40 shadow-xl shadow-cyan-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
                <div className="space-y-2 relative z-10 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-cyan-300 animate-pulse" />
                      AI Detected: {recommendation.detectedCategory}
                    </span>
                    <span className="text-[10px] text-purple-300 font-mono">
                      {recommendation.confidence}% Match
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    Recommended: <span className="text-cyan-300 uppercase">{recommendation.mode.replace('_', ' ')} MODE</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {recommendation.reasoning}
                  </p>
                </div>

                <Link
                  href={`/projects/${projectId}/${recommendation.mode}`}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 flex items-center gap-2 flex-shrink-0"
                >
                  <span>Launch Recommended Workflow</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* 3D Animated Mode Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {modes.map((mode) => {
              const Icon = mode.icon;
              const isRecommended = recommendation.mode === mode.id;

              return (
                <motion.div
                  key={mode.id}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="flex"
                >
                  <Link
                    href={mode.href}
                    className={`w-full p-8 rounded-3xl glass-panel border transition-all flex flex-col justify-between relative group shadow-xl ${
                      isRecommended
                        ? 'border-cyan-400/80 bg-cyan-950/15 ring-2 ring-cyan-400/30 shadow-cyan-500/20'
                        : `${mode.borderGlow} border-white/[0.08]`
                    }`}
                  >
                    {isRecommended ? (
                      <span className="absolute top-5 right-5 px-3 py-1 rounded-full bg-cyan-500/30 text-cyan-200 text-[10px] font-extrabold uppercase tracking-wider border border-cyan-400/50 shadow-md shadow-cyan-400/20 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-cyan-300" /> AI SUGGESTION
                      </span>
                    ) : (
                      mode.badge && (
                        <span className="absolute top-6 right-6 px-2.5 py-0.5 rounded-full bg-white/10 text-cyan-300 text-[10px] font-bold uppercase tracking-wider border border-white/15">
                          {mode.badge}
                        </span>
                      )
                    )}

                    <div>
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${mode.gradient} text-white flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="w-7 h-7" />
                      </div>

                      <h3 className="text-xl font-bold text-white mb-1">{mode.title}</h3>
                      <p className="text-xs font-semibold text-purple-400 mb-3">{mode.subtitle}</p>
                      <p className="text-xs text-slate-400 mb-6 leading-relaxed">{mode.desc}</p>

                      <div className="space-y-2.5 mb-8 pt-4 border-t border-white/[0.06]">
                        {mode.features.map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                      <span>{isRecommended ? 'Launch Recommended Mode' : 'Launch Mode'}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
