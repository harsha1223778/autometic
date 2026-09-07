'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Navbar from '@/components/navigation/Navbar';
import {
  Wand2,
  Sliders,
  BotMessageSquare,
  Sparkles,
  Scissors,
  Type,
  Volume2,
  Palette,
  Film,
  Zap,
  ArrowRight,
  CheckCircle2,
  Play,
  Share2,
  ShieldCheck,
  Star,
  Layers,
} from 'lucide-react';

// Dynamic import for Three.js 3D Hero canvas with SSR disabled
const Hero3DCanvas = dynamic(() => import('@/components/canvas/Hero3DCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[440px] flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

export default function LandingPage() {
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(0);

  const workflowSteps = [
    {
      title: '1. Ingest Raw Footage',
      desc: 'Drag and drop high-res MP4, MOV, or ProRes camera cuts. EditFlow instantly computes audio waveforms and scene cuts.',
      tag: 'Fast Ingest',
      stats: 'Supports 4K/60fps',
    },
    {
      title: '2. Direct AI or Edit Manually',
      desc: 'Use normal language commands like "Make this vlog look cinematic and remove long silences" or sculpt precise cuts on the multi-track timeline.',
      tag: 'Adaptive Engine',
      stats: '12+ Smart Tools',
    },
    {
      title: '3. Render & Multi-Platform Export',
      desc: 'Auto-format for 16:9 YouTube, 9:16 Reels & TikTok, or 1:1 feeds with synchronized burnt-in captions and ducked sound design.',
      tag: 'Instant Export',
      stats: '10x Faster Render',
    },
  ];

  const tools = [
    {
      name: 'Silence & Dead Air Cutter',
      desc: 'AI detects gaps and trims awkward pauses with audio crossfades.',
      icon: Scissors,
      gradient: 'from-purple-500 to-indigo-500',
    },
    {
      name: 'Dynamic Animated Subtitles',
      desc: 'Generate karaoke-style captions styled to your brand aesthetics.',
      icon: Type,
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      name: 'Audio Broadcast Mastering',
      desc: 'One-click dialogue normalization to -14 LUFS with ambient noise gating.',
      icon: Volume2,
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      name: 'Cinematic Color Presets',
      desc: 'Apply film-grade LUTs: Warm Golden Hour, Cool Tech, Moody Teal.',
      icon: Palette,
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      name: 'Scene Cut Detection',
      desc: 'Detects camera switches and adds smooth transitions seamlessly.',
      icon: Film,
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      name: 'Soundtrack Mood Sync',
      desc: '12 curated royalty-free tracks ducked dynamically beneath vocals.',
      icon: Zap,
      gradient: 'from-violet-500 to-purple-500',
    },
  ];

  const testimonials = [
    {
      name: 'Marcus Vance',
      role: 'YouTube Creator (680k Subs)',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
      comment:
        'EditFlow AI sliced my 45-minute podcast edit down to 6 minutes of work. The silence detection and subtitle synchronization are unmatched.',
      rating: 5,
    },
    {
      name: 'Elena Rostova',
      role: 'Documentary Filmmaker',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
      comment:
        'The ability to tell the AI assistant "Make this scene tense and cinematic" and get an editable timeline plan has transformed my team workflow.',
      rating: 5,
    },
    {
      name: 'Jordan Chen',
      role: 'Growth Lead at SaaSify',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      comment:
        'We turn webinar recordings into 20 viral TikToks and LinkedIn video snippets every single week. Pure magic for marketing teams.',
      rating: 5,
    },
  ];

  const pricingPlans = [
    {
      name: 'Free Starter',
      price: '$0',
      desc: 'Ideal for testing AI video workflows and quick social clips.',
      features: [
        'Up to 1080p exports',
        'Auto silence trimming',
        'Basic subtitle styling',
        '3 AI Assistant plans per month',
        'Standard render queue',
      ],
      cta: 'Get Started Free',
      popular: false,
    },
    {
      name: 'Creator Studio',
      price: '$29',
      period: '/month',
      desc: 'For YouTubers, vloggers, and creators producing weekly content.',
      features: [
        'Unlimited 4K 60fps renders',
        'Full AI Assistant with custom prompts',
        'Unlimited subtitle generation',
        'All 12+ mood soundtrack tracks',
        'Priority render processing',
        'Aspect ratio auto-reframe (9:16, 16:9)',
      ],
      cta: 'Start 14-Day Free Trial',
      popular: true,
    },
    {
      name: 'Production Pro',
      price: '$79',
      period: '/month',
      desc: 'Designed for agencies, studios, and high-volume video teams.',
      features: [
        'Everything in Creator Studio',
        'Team collaboration & shared presets',
        'Dedicated FFmpeg cluster worker',
        'Custom Brand LUTs & font uploads',
        'API access for programmatic editing',
        '24/7 dedicated engineering support',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#080B14] text-slate-100 overflow-x-hidden selection:bg-purple-600 selection:text-white">
      <Navbar />

      {/* Decorative Neon Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-gradient-to-tr from-purple-700/20 via-cyan-600/15 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[800px] -left-48 w-[600px] h-[600px] bg-purple-900/15 blur-[160px] pointer-events-none -z-10" />
      <div className="absolute top-[1400px] -right-48 w-[600px] h-[600px] bg-cyan-900/15 blur-[160px] pointer-events-none -z-10" />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left z-10">
            {/* Pill Announcement */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Next-Gen AI Video Assistant 2.0</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              Edit Smarter.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400">
                Create Faster.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              AI-powered video editing that turns raw footage into polished content in minutes.
              Remove long silences, generate animated subtitles, and direct your edits with normal-language instructions.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-semibold shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 transition-all hover:-translate-y-0.5"
              >
                Start Editing
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/projects/new"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-slate-200 font-semibold transition-all hover:-translate-y-0.5"
              >
                <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                Try Interactive Demo
              </Link>
            </div>

            {/* Social Trust Metrics */}
            <div className="pt-6 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-400 border-t border-white/[0.06]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>100% In-Browser Preview</span>
              </div>
            </div>
          </div>

          {/* Hero Right 3D Interactive Canvas */}
          <div className="lg:col-span-6 relative w-full h-[460px] sm:h-[520px] rounded-3xl overflow-hidden glass-panel border border-white/[0.08] p-2 flex items-center justify-center shadow-2xl shadow-purple-900/20">
            <div className="absolute inset-0 bg-radial from-purple-900/20 via-transparent to-transparent pointer-events-none" />
            <Hero3DCanvas />
            <div className="absolute bottom-4 left-4 right-4 px-4 py-2.5 rounded-xl bg-[#0D1122]/90 backdrop-blur-md border border-white/10 flex items-center justify-between text-xs text-slate-300 pointer-events-none">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Interactive 3D Engine: Three.js & Drei
              </span>
              <span className="text-slate-400 text-[11px]">Rotate with mouse cursor</span>
            </div>
          </div>
        </div>
      </section>

      {/* THREE APPLICATION MODES CARDS */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-2">
            Engineered For Modern Content
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Three Modes. Infinite Creative Control.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Auto Edit Mode Card */}
          <div className="p-8 rounded-3xl glass-panel-interactive border border-white/[0.08] relative group">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform">
              <Wand2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Auto Edit Mode</h3>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              Upload raw video and toggle automated silence trimming, speech normalization, scene detection, and background music sync.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-300 mb-8">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                Remove long silences & dead air
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                AI audio mastering to -14 LUFS
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                Auto-generate subtitles with custom styles
              </li>
            </ul>
            <Link
              href="/projects/new?mode=auto"
              className="inline-flex items-center gap-2 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
            >
              Launch Auto Editor <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Manual Edit Mode Card */}
          <div className="p-8 rounded-3xl glass-panel-interactive border border-purple-500/30 relative group shadow-lg shadow-purple-900/10">
            <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-[10px] font-bold text-white uppercase tracking-wider">
              Studio Grade
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center mb-6 text-cyan-400 group-hover:scale-110 transition-transform">
              <Sliders className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Manual Studio Mode</h3>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              Full multi-track timeline control with draggable playhead, clip splits, volume ducking, subtitle styler, and real-time operations history.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-300 mb-8">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                Multi-track video, audio & subtitle lanes
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                Draggable trim handles & split markers
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                Comprehensive Undo/Redo operations stack
              </li>
            </ul>
            <Link
              href="/projects/new?mode=manual"
              className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Open Manual Studio <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* AI Video Assistant Card */}
          <div className="p-8 rounded-3xl glass-panel-interactive border border-white/[0.08] relative group">
            <div className="w-12 h-12 rounded-2xl bg-pink-600/20 border border-pink-500/30 flex items-center justify-center mb-6 text-pink-400 group-hover:scale-110 transition-transform">
              <BotMessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">AI Video Assistant</h3>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              Describe edits in normal language: “Make this vlog professional and add subtitles.” The assistant produces an actionable editing plan.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-300 mb-8">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-pink-400" />
                Natural-language to JSON operations pipeline
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-pink-400" />
                One-click plan preview, manual edit, or apply
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-pink-400" />
                Suggested prompt chips for fast execution
              </li>
            </ul>
            <Link
              href="/projects/new?mode=assistant"
              className="inline-flex items-center gap-2 text-xs font-semibold text-pink-400 hover:text-pink-300 transition-colors"
            >
              Chat With Assistant <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="workflow" className="py-20 px-6 max-w-7xl mx-auto border-t border-white/[0.06]">
        <div className="text-center max-w-xl mx-auto mb-14">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-2">
            Seamless Three-Step Workflow
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            From Camera Roll to Polished Content
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {workflowSteps.map((step, idx) => (
            <div
              key={idx}
              onClick={() => setActiveWorkflowStep(idx)}
              className={`p-8 rounded-3xl border transition-all cursor-pointer ${
                activeWorkflowStep === idx
                  ? 'bg-purple-950/30 border-purple-500/40 shadow-xl shadow-purple-950/40'
                  : 'glass-panel border-white/[0.06] hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 text-cyan-300">
                  {step.tag}
                </span>
                <span className="text-xs text-slate-400 font-mono">{step.stats}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SUPPORTED EDITING TOOLS GRID */}
      <section id="tools" className="py-20 px-6 max-w-7xl mx-auto border-t border-white/[0.06]">
        <div className="text-center max-w-xl mx-auto mb-14">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-2">
            Powerful Creative Suite
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Every Feature Built For Speed
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((t, idx) => {
            const Icon = t.icon;
            return (
              <div key={idx} className="p-6 rounded-2xl glass-panel border border-white/[0.06] flex gap-4 items-start">
                <div className={`p-3 rounded-xl bg-gradient-to-tr ${t.gradient} text-white shadow-md`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-white mb-1">{t.name}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{t.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-t border-white/[0.06]">
        <div className="text-center max-w-xl mx-auto mb-14">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-2">
            Loved By Video Creators
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Trusted By 20,000+ Storytellers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div key={idx} className="p-8 rounded-3xl glass-panel border border-white/[0.08] flex flex-col justify-between">
              <div>
                <div className="flex gap-1 text-amber-400 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-200 leading-relaxed italic mb-6">
                  &ldquo;{t.comment}&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover border border-purple-500/30" />
                <div>
                  <p className="text-xs font-bold text-white">{t.name}</p>
                  <p className="text-[11px] text-slate-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING TIERS */}
      <section id="pricing" className="py-20 px-6 max-w-7xl mx-auto border-t border-white/[0.06]">
        <div className="text-center max-w-xl mx-auto mb-14">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-2">
            Transparent Pricing
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Plans For Every Production Scale
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((p, idx) => (
            <div
              key={idx}
              className={`p-8 rounded-3xl flex flex-col justify-between relative transition-all ${
                p.popular
                  ? 'glass-panel border-2 border-purple-500/60 shadow-2xl shadow-purple-950/60 -translate-y-2'
                  : 'glass-panel border border-white/[0.08]'
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 text-white font-bold text-[10px] uppercase tracking-wider shadow-md">
                  Most Popular
                </span>
              )}
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{p.name}</h3>
                <p className="text-xs text-slate-300 mb-6">{p.desc}</p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-extrabold text-white">{p.price}</span>
                  {p.period && <span className="text-xs text-slate-400">{p.period}</span>}
                </div>
                <ul className="space-y-3 text-xs text-slate-300 mb-8">
                  {p.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href="/dashboard"
                className={`w-full py-3 rounded-xl text-center text-xs font-semibold transition-all ${
                  p.popular
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-white/10 hover:bg-white/15 text-white'
                }`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.08] py-14 px-6 bg-[#04060A]/80">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 text-xs text-slate-400">
          <div className="col-span-2 space-y-4">
            <span className="font-bold text-lg text-white flex items-center gap-2">
              EditFlow <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">AI</span>
            </span>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Automated video editing assistant powered by Next.js 14, Three.js, and intelligent audio/visual operations pipelines.
            </p>
            <p className="text-[11px] text-slate-400">
              © {new Date().getFullYear()} EditFlow AI Technologies. All rights reserved.
            </p>
          </div>

          <div className="space-y-2.5">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider">Product</h5>
            <p><Link href="/projects/new?mode=auto" className="hover:text-white">Auto Editor</Link></p>
            <p><Link href="/projects/new?mode=manual" className="hover:text-white">Manual Studio</Link></p>
            <p><Link href="/projects/new?mode=assistant" className="hover:text-white">AI Video Assistant</Link></p>
            <p><Link href="/music-library" className="hover:text-white">Music Library</Link></p>
            <p><Link href="/templates" className="hover:text-white">Workflow Templates</Link></p>
          </div>

          <div className="space-y-2.5">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider">Resources</h5>
            <p><Link href="/#workflow" className="hover:text-white">Documentation</Link></p>
            <p><Link href="/#tools" className="hover:text-white">API Reference</Link></p>
            <p><Link href="/dashboard" className="hover:text-white">Sample Projects</Link></p>
            <p><Link href="/#pricing" className="hover:text-white">Cloud Cluster</Link></p>
          </div>

          <div className="space-y-2.5">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider">Legal</h5>
            <p><a href="#" className="hover:text-white">Privacy Policy</a></p>
            <p><a href="#" className="hover:text-white">Terms of Service</a></p>
            <p><a href="#" className="hover:text-white">Security Architecture</a></p>
            <p><a href="#" className="hover:text-white">Cookie Preferences</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
