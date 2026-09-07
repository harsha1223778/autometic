'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/navigation/Sidebar';
import TopNav from '@/components/navigation/TopNav';
import {
  Wand2,
  Sliders,
  BotMessageSquare,
  Sparkles,
  UploadCloud,
  Film,
  Play,
  ArrowRight,
  TrendingUp,
  Clock,
  HardDrive,
  Lightbulb,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

const activityData = [
  { day: 'Mon', cuts: 18, renderMins: 12 },
  { day: 'Tue', cuts: 32, renderMins: 24 },
  { day: 'Wed', cuts: 24, renderMins: 18 },
  { day: 'Thu', cuts: 45, renderMins: 35 },
  { day: 'Fri', cuts: 62, renderMins: 48 },
  { day: 'Sat', cuts: 38, renderMins: 29 },
  { day: 'Sun', cuts: 54, renderMins: 42 },
];

export default function DashboardPage() {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    fetch('/api/projects')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data) => {
        setProjects(data?.projects || []);
        setLoadingProjects(false);
      })
      .catch(() => {
        setLoadingProjects(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#080B14] text-slate-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'pl-20' : 'pl-64'}`}>
        <TopNav sidebarCollapsed={sidebarCollapsed} />

        <main className="pt-20 px-8 pb-16 max-w-7xl mx-auto space-y-8">
          {/* Welcome Banner */}
          <div className="p-8 rounded-3xl relative overflow-hidden bg-gradient-to-r from-purple-900/40 via-indigo-950/40 to-slate-900/50 border border-purple-500/25 shadow-2xl">
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="max-w-2xl space-y-3 z-10 relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI Video Suite Activated</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Alex Rivera</span>
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                Your AI Video Editing Assistant is ready. Upload raw footage or choose an editing mode to accelerate your workflow.
              </p>
            </div>
          </div>

          {/* Rapid Upload Dropzone */}
          <Link
            href="/projects/new"
            className="block p-8 rounded-3xl border-2 border-dashed border-white/15 hover:border-purple-500/60 bg-white/[0.02] hover:bg-purple-950/15 transition-all text-center group cursor-pointer"
          >
            <div className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-purple-900/20">
              <UploadCloud className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">
              Drop footage here to start a new project
            </h3>
            <p className="text-xs text-slate-400">
              Supports MP4, WebM, MOV, and AVI up to 4K resolution. Instant AI silence and scene detection.
            </p>
          </Link>

          {/* Three Large Editing Mode Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Auto Edit Mode */}
            <Link
              href="/projects/new?mode=auto"
              className="p-6 rounded-3xl glass-panel-interactive border border-white/[0.08] relative group"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Wand2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Auto Edit Mode</h3>
              <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                Automated silence cuts, dialogue leveling, karaoke subtitles, and music track matching.
              </p>
              <span className="text-xs font-semibold text-purple-400 flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                Launch Auto Edit <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            {/* Manual Studio */}
            <Link
              href="/projects/new?mode=manual"
              className="p-6 rounded-3xl glass-panel-interactive border border-cyan-500/30 relative group shadow-lg shadow-cyan-950/20"
            >
              <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Manual Studio</h3>
              <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                Precision multi-track timeline, draggable playhead, audio filters, and operations stack.
              </p>
              <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                Open Studio <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            {/* AI Assistant */}
            <Link
              href="/projects/new?mode=assistant"
              className="p-6 rounded-3xl glass-panel-interactive border border-white/[0.08] relative group"
            >
              <div className="w-12 h-12 rounded-2xl bg-pink-600/20 border border-pink-500/30 text-pink-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <BotMessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">AI Video Assistant</h3>
              <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                Conversational editor: type instructions in natural language to generate structured editing plans.
              </p>
              <span className="text-xs font-semibold text-pink-400 flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                Chat With AI <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>

          {/* Analytics & Storage Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Editing Activity Chart */}
            <div className="lg:col-span-8 p-6 rounded-3xl glass-panel border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-400" /> Editing Activity & Render Velocity
                  </h3>
                  <p className="text-xs text-slate-400">Automated cuts and render minutes processed this week</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5 text-purple-400 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> AI Cuts
                  </span>
                  <span className="flex items-center gap-1.5 text-cyan-400 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Render Mins
                  </span>
                </div>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCuts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorMins" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0d1122',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                    <Area type="monotone" dataKey="cuts" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorCuts)" />
                    <Area type="monotone" dataKey="renderMins" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorMins)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Storage & Quick Tips */}
            <div className="lg:col-span-4 space-y-6">
              {/* Storage Usage Card */}
              <div className="p-6 rounded-3xl glass-panel border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-cyan-400" /> Cloud Storage
                  </h4>
                  <span className="text-[10px] text-purple-300 font-semibold bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                    42% Used
                  </span>
                </div>
                <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full rounded-full w-[42%]" />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>4.2 GB used</span>
                  <span>10.0 GB Total</span>
                </div>
              </div>

              {/* Quick Tips Card */}
              <div className="p-6 rounded-3xl glass-panel border border-white/[0.08] space-y-2.5">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400" /> Pro Editing Tip
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  For TikTok and Reels, prompt the AI Assistant with <span className="text-purple-300 font-mono">&ldquo;Turn into a 30-sec reel with karaoke captions&rdquo;</span> to automatically crop and format.
                </p>
              </div>
            </div>
          </div>

          {/* Recent Projects Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-purple-400" /> Recent Projects
              </h3>
              <Link href="/projects" className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
                View All <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            {loadingProjects ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-48 rounded-2xl glass-panel border border-white/5 animate-pulse" />
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="p-8 rounded-2xl glass-panel text-center text-slate-400 text-xs">
                No projects created yet. Drag and drop a video above to get started!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {projects.slice(0, 4).map((proj) => {
                  const job = proj.editJobs?.[0];
                  const mode = job?.mode || 'auto';
                  const targetHref = `/projects/${proj.id}/${mode}`;

                  return (
                    <Link
                      key={proj.id}
                      href={targetHref}
                      className="group rounded-2xl glass-panel border border-white/[0.08] overflow-hidden hover:border-purple-500/40 transition-all hover:-translate-y-1 block"
                    >
                      <div className="relative aspect-video bg-black/40 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={proj.thumbnailUrl || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80'}
                          alt={proj.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px]">
                          <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-slate-300 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3 text-cyan-400" />
                            {Math.round(proj.duration)}s
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-500/30 text-[10px] font-semibold uppercase">
                            {mode}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="text-xs font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                          {proj.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Status: <span className="capitalize text-slate-300">{proj.status}</span>
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
