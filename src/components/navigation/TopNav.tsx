'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  User,
  LogOut,
  Sparkles,
  ExternalLink,
  Sliders,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

interface TopNavProps {
  sidebarCollapsed?: boolean;
}

export default function TopNav({ sidebarCollapsed = false }: TopNavProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; avatar?: string } | null>({
    name: 'Alex Rivera',
    email: 'demo@editflow.ai',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setCurrentUser(data.user);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Logged out successfully');
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  const notifications = [
    {
      id: 1,
      title: 'Auto Edit Completed',
      desc: 'Tech Founder Vlog - Week 12 finished rendering 14 cuts.',
      time: '5m ago',
      icon: CheckCircle2,
      color: 'text-emerald-400',
    },
    {
      id: 2,
      title: 'AI Assistant Plan Ready',
      desc: 'Keynote 2026 operations generated with 9:16 vertical reframe.',
      time: '42m ago',
      icon: Sparkles,
      color: 'text-purple-400',
    },
    {
      id: 3,
      title: 'Cloud Backup Synced',
      desc: '12 new audio tracks available in your library.',
      time: '2h ago',
      icon: Clock,
      color: 'text-cyan-400',
    },
  ];

  return (
    <header
      className={`h-16 fixed top-0 right-0 z-30 flex items-center justify-between px-6 bg-[#080B14]/80 backdrop-blur-xl border-b border-white/[0.08] transition-all duration-300 ${
        sidebarCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Search Input */}
      <div className="flex-1 max-w-md relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search projects, clips, or AI operations..."
          className="w-full pl-10 pr-4 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        <Link
          href="/projects/new"
          className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/20 transition-all hover:scale-[1.02]"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Create Video
        </Link>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#0D1122] border border-white/10 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <h4 className="text-sm font-semibold text-white">Notifications</h4>
                <span className="text-[10px] font-medium text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full">
                  3 New
                </span>
              </div>
              <div className="space-y-3 pt-3">
                {notifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div key={n.id} className="flex gap-3 text-left group cursor-pointer">
                      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${n.color}`} />
                      <div>
                        <p className="text-xs font-medium text-slate-200 group-hover:text-white transition-colors">
                          {n.title}
                        </p>
                        <p className="text-[11px] text-slate-400 leading-snug mt-0.5">{n.desc}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-1 rounded-xl hover:bg-white/[0.04] transition-colors"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border border-purple-500/40 bg-purple-900/50 flex items-center justify-center">
              {currentUser?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-purple-300" />
              )}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-white leading-tight">{currentUser?.name || 'User'}</p>
              <p className="text-[10px] text-slate-400 leading-tight truncate max-w-[120px]">
                {currentUser?.email || 'demo@editflow.ai'}
              </p>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0D1122] border border-white/10 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-white/[0.06] mb-1">
                <p className="text-xs font-semibold text-white">{currentUser?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{currentUser?.email}</p>
              </div>
              <Link
                href="/settings"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.05] rounded-xl transition-colors"
              >
                <Sliders className="w-3.5 h-3.5 text-slate-400" /> Settings & Preferences
              </Link>
              <Link
                href="/projects"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.05] rounded-xl transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" /> My Projects
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors text-left"
              >
                <LogOut className="w-3.5 h-3.5" /> Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
