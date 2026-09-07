'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PlusCircle,
  Wand2,
  Sliders,
  BotMessageSquare,
  FolderKanban,
  LayoutTemplate,
  Music2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Video,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ collapsed: initialCollapsed = false, onToggle }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const pathname = usePathname();

  const handleToggle = () => {
    setCollapsed(!collapsed);
    if (onToggle) onToggle();
  };

  const navGroups = [
    {
      label: 'Creation Studio',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'New Project', href: '/projects/new', icon: PlusCircle, badge: 'New' },
      ],
    },
    {
      label: 'Editing Modes',
      items: [
        { name: 'Auto Edit', href: '/projects/new?mode=auto', icon: Wand2 },
        { name: 'Manual Studio', href: '/projects/new?mode=manual', icon: Sliders },
        { name: 'AI Assistant', href: '/projects/new?mode=assistant', icon: BotMessageSquare, badge: 'AI' },
      ],
    },
    {
      label: 'Assets & Library',
      items: [
        { name: 'Projects', href: '/projects', icon: FolderKanban },
        { name: 'Templates', href: '/templates', icon: LayoutTemplate },
        { name: 'Music Library', href: '/music-library', icon: Music2 },
      ],
    },
    {
      label: 'Preferences',
      items: [{ name: 'Settings', href: '/settings', icon: Settings }],
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 flex flex-col bg-[#080B14]/95 border-r border-white/[0.08] backdrop-blur-xl transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/[0.08]">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 min-w-[36px] rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-400 p-0.5 shadow-md shadow-purple-500/20">
            <div className="w-full h-full bg-[#080B14] rounded-[10px] flex items-center justify-center">
              <Video className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          {!collapsed && (
            <span className="font-bold text-base tracking-tight text-white flex items-center gap-1">
              EditFlow
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
                AI
              </span>
            </span>
          )}
        </Link>

        <button
          onClick={handleToggle}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href.split('?')[0];

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                    isActive
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                  title={collapsed ? item.name : undefined}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-purple-400' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  {!collapsed && (
                    <div className="flex items-center justify-between flex-1">
                      <span>{item.name}</span>
                      {item.badge && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500/30 to-cyan-500/30 text-cyan-300 border border-cyan-500/30">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b from-purple-500 to-cyan-400 rounded-r-full" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Pro Plan Widget */}
      {!collapsed && (
        <div className="p-4 m-3 rounded-2xl bg-gradient-to-b from-purple-950/40 to-slate-900/40 border border-purple-500/20">
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-300 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Pro AI Rendering
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
            Hardware acceleration & 4K 60fps exports enabled.
          </p>
          <div className="w-full bg-black/40 rounded-full h-1.5 mb-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full rounded-full w-[42%]" />
          </div>
          <p className="text-[10px] text-slate-400 text-right">4.2 GB / 10 GB</p>
        </div>
      )}
    </aside>
  );
}
