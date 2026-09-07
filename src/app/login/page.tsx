'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Video, ArrowRight, Sparkles, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        let errMsg = 'Failed to sign in';
        try {
          const errData = await res.json();
          errMsg = errData.error || errMsg;
        } catch {}
        toast.error(errMsg);
        setLoading(false);
        return;
      }

      const data = await res.json();
      toast.success('Welcome back, ' + data.user.name);
      router.push('/dashboard');
    } catch {
      toast.error('Network error during login');
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('demo@editflow.ai');
    setPassword('Demo@12345');
    toast.info('Filled demo credentials! Click Sign In to continue.');
  };

  return (
    <div className="min-h-screen bg-[#080B14] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background Neon Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-600/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Logo */}
      <Link href="/" className="flex items-center gap-3 mb-8 group">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-400 p-0.5 shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform">
          <div className="w-full h-full bg-[#080B14] rounded-[14px] flex items-center justify-center">
            <Video className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
        <span className="font-bold text-2xl tracking-tight text-white flex items-center gap-1.5">
          EditFlow <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">AI</span>
        </span>
      </Link>

      {/* Glassmorphic Auth Card */}
      <div className="w-full max-w-md p-8 rounded-3xl glass-panel border border-white/[0.08] shadow-2xl relative">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-1.5">Welcome Back</h1>
          <p className="text-xs text-slate-400">
            Sign in to access your automated editing studio & projects.
          </p>
        </div>

        {/* Demo Credentials Quick-Fill Button */}
        <button
          type="button"
          onClick={fillDemoCredentials}
          className="w-full mb-6 py-2 px-3 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 text-purple-300 text-xs font-medium flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Auto-fill Demo Account (demo@editflow.ai)
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/40 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300">Password</label>
              <Link href="/forgot-password" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/40 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
