'use client';

import Link from 'next/link';
import Sidebar from '@/components/navigation/Sidebar';
import TopNav from '@/components/navigation/TopNav';
import {
  LayoutTemplate,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Video,
  Flame,
  Smartphone,
  Mic,
  Monitor,
  Camera,
  GraduationCap,
} from 'lucide-react';

export default function TemplatesPage() {
  const templates = [
    {
      id: 'viral-reel',
      title: 'TikTok & Reels Viral Cut',
      category: 'Shorts & Social',
      icon: Smartphone,
      aspect: '9:16',
      duration: '30-60s',
      desc: 'Aggressive silence removal, karaoke centered animated captions, and high-energy beat synchronization.',
      tags: ['Fast Paced', 'Captions', '9:16'],
      operations: ['Remove silences > 0.8s', 'Bold center captions', 'Upbeat music ducking', 'Zoom cuts on beat'],
      badge: 'Trending',
    },
    {
      id: 'youtube-vlog',
      title: 'YouTube Creator Vlog',
      category: 'Long-Form',
      icon: Flame,
      aspect: '16:9',
      duration: '8-15m',
      desc: 'Polished creator pacing with subtle background music, intro hook retention, and warm color grade.',
      tags: ['Storytelling', 'Warm LUT', 'Audio Master'],
      operations: ['1.5s silence threshold', 'Lower-third subtitles', 'Vlog soundtrack sync', 'Warm grade preset'],
    },
    {
      id: 'podcast-pro',
      title: 'Studio Podcast & Interview',
      category: 'Podcast',
      icon: Mic,
      aspect: '16:9',
      duration: '20-60m',
      desc: 'Broadcast vocal mastering to -14 LUFS, filler word suppression, and speaker switch chapter cuts.',
      tags: ['Dialogue Clean', '-14 LUFS', 'Chapters'],
      operations: ['Remove "um" & "uh"', 'Noise suppression gate', 'Dialogue leveling', 'Automated speaker detection'],
      badge: 'Popular',
    },
    {
      id: 'product-demo',
      title: 'SaaS Walkthrough & Demo',
      category: 'Software',
      icon: Monitor,
      aspect: '16:9',
      duration: '2-5m',
      desc: 'Screen recording enhancement with smooth zoom on clicks, corporate ambient audio, and crisp captions.',
      tags: ['Product Tour', 'Crisp Audio', 'Corporate'],
      operations: ['Cursor zoom simulation', 'Dead air trimming', 'Corporate soundtrack', 'Clean subtitles'],
    },
    {
      id: 'cinematic-broll',
      title: 'Cinematic B-Roll Montage',
      category: 'Film',
      icon: Camera,
      aspect: '16:9',
      duration: '1-3m',
      desc: 'Teal and orange color grading, rhythmic cut timing to orchestral music, and speed ramps.',
      tags: ['Teal & Orange', 'Speed Ramps', 'Cinematic'],
      operations: ['Moody cinema LUT', 'Scene transitions', 'Orchestral audio riser', 'Speed curve smooth'],
    },
    {
      id: 'course-lecture',
      title: 'Educational Course & Masterclass',
      category: 'Education',
      icon: GraduationCap,
      aspect: '16:9',
      duration: '10-30m',
      desc: 'Crystal-clear speech intelligibility, slide synchronization, and key takeaway bullet overlays.',
      tags: ['E-Learning', 'Slide Sync', 'Clear Vocals'],
      operations: ['Vocal presence boost', 'Key phrase subtitles', 'Pause trim', 'Slide transitions'],
    },
  ];

  return (
    <div className="min-h-screen bg-[#080B14] text-slate-100 flex">
      <Sidebar />
      <div className="flex-1 pl-64">
        <TopNav />

        <main className="pt-20 px-8 pb-16 max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="border-b border-white/[0.08] pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-1">
              <LayoutTemplate className="w-3.5 h-3.5 text-cyan-400" /> Automated Recipes
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Workflow Templates</h1>
            <p className="text-xs text-slate-400 mt-1">
              Pre-configured editing plans tailored for YouTube, TikTok, Podcasts, and SaaS demos.
            </p>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((tpl) => {
              const Icon = tpl.icon;
              return (
                <div
                  key={tpl.id}
                  className="rounded-3xl glass-panel border border-white/[0.08] hover:border-purple-500/40 p-6 flex flex-col justify-between group transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>
                      {tpl.badge && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500/30 to-cyan-500/30 text-cyan-300 border border-cyan-500/30 uppercase">
                          {tpl.badge}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white mb-1">{tpl.title}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-3">
                      <span>{tpl.aspect}</span>
                      <span>•</span>
                      <span>{tpl.duration}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed mb-4">{tpl.desc}</p>

                    <div className="space-y-1.5 pt-3 border-t border-white/[0.06] mb-6">
                      {tpl.operations.map((op, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-2 text-[11px] text-slate-400">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                          <span>{op}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link
                    href={`/projects/new?template=${tpl.id}`}
                    className="w-full py-2.5 rounded-xl bg-white/[0.05] hover:bg-purple-600 text-slate-200 hover:text-white text-xs font-semibold text-center transition-all flex items-center justify-center gap-2"
                  >
                    Use This Template <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
