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

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.project) setProject(data.project);
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
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Choose Editing Experience
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Select Your Creative Workflow
            </h1>
            <p className="text-sm text-slate-400">
              Targeted for &ldquo;{project?.title || 'Your Video'}&rdquo; • Switch between modes at any time.
            </p>
          </div>

          {/* Project Preview Bar */}
          {project && (
            <div className="p-4 rounded-2xl glass-panel border border-white/[0.08] flex items-center justify-between max-w-3xl mx-auto">
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
                Footage Ready
              </span>
            </div>
          )}

          {/* 3D Animated Mode Tilt Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {modes.map((mode, idx) => {
              const Icon = mode.icon;
              return (
                <motion.div
                  key={mode.id}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="flex"
                >
                  <Link
                    href={mode.href}
                    className={`w-full p-8 rounded-3xl glass-panel border border-white/[0.08] transition-all flex flex-col justify-between relative group ${mode.borderGlow} shadow-xl`}
                  >
                    {mode.badge && (
                      <span className="absolute top-6 right-6 px-2.5 py-0.5 rounded-full bg-white/10 text-cyan-300 text-[10px] font-bold uppercase tracking-wider border border-white/15">
                        {mode.badge}
                      </span>
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
                      <span>Launch Mode</span>
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
