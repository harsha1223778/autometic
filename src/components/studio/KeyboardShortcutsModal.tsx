'use client';

import React from 'react';
import { Command, Keyboard, X } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcutCategories = [
    {
      name: 'Playback & Transport Controls',
      items: [
        { key: 'Space', desc: 'Toggle Video Playback (Play / Pause)' },
        { key: 'J', desc: 'Jump / Shuttle Backward (2 seconds)' },
        { key: 'K', desc: 'Pause Playback' },
        { key: 'L', desc: 'Jump / Shuttle Forward (2 seconds)' },
        { key: 'M', desc: 'Toggle Audio Mute / Unmute' },
      ],
    },
    {
      name: 'Clip Trimming & Slicing',
      items: [
        { key: 'S', desc: 'Split Clip at Current Playhead Cursor' },
        { key: 'I', desc: 'Set Trim In Point at Current Timestamp' },
        { key: 'O', desc: 'Set Trim Out Point at Current Timestamp' },
      ],
    },
    {
      name: 'Studio History & Dialogs',
      items: [
        { key: 'Ctrl + Z', desc: 'Undo Last Timeline Action' },
        { key: 'Ctrl + Y', desc: 'Redo Previous Timeline Action' },
        { key: '?', desc: 'Toggle this Keyboard Shortcuts Modal' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-xl w-full p-6 rounded-3xl glass-panel border border-white/10 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">NLE Keyboard Shortcuts</h3>
              <p className="text-xs text-slate-400">
                Industry-standard hotkeys for high-speed video editing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {shortcutCategories.map((cat, i) => (
            <div key={i} className="space-y-2">
              <h4 className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                {cat.name}
              </h4>
              <div className="space-y-1.5">
                {cat.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-300">{item.desc}</span>
                    <kbd className="px-2 py-1 rounded-lg bg-white/10 border border-white/20 text-white font-mono text-[11px] font-bold shadow-sm">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-slate-500 text-center">
          Hotkeys are active anywhere in the studio when you are not typing into text inputs.
        </p>
      </div>
    </div>
  );
}
