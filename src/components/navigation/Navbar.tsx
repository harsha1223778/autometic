'use client';

import Link from 'next/link';
import { Sparkles, ArrowRight, Video } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all backdrop-blur-xl bg-[#080B14]/80 border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-400 p-0.5 shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-300">
            <div className="w-full h-full bg-[#080B14] rounded-[10px] flex items-center justify-center">
              <Video className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <span className="font-bold text-xl tracking-tight text-white flex items-center gap-1.5">
            EditFlow <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 font-extrabold text-sm px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-500/30">AI</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="/#features" className="hover:text-white transition-colors">
            Modes
          </Link>
          <Link href="/#workflow" className="hover:text-white transition-colors">
            How It Works
          </Link>
          <Link href="/#tools" className="hover:text-white transition-colors">
            Editing Tools
          </Link>
          <Link href="/#pricing" className="hover:text-white transition-colors">
            Pricing
          </Link>
          <Link href="/dashboard" className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Studio
          </Link>
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-all"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all hover:-translate-y-0.5"
          >
            Launch Studio
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
