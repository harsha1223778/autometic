'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  X,
  Check,
  Upload,
  Palette,
  Type,
  Maximize2,
  Sparkles,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  BrandKit,
  DEFAULT_BRAND_KIT,
  BRAND_FONTS,
  getStoredBrandKit,
  saveStoredBrandKit,
} from '@/lib/brandKit';

interface BrandKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateBrandKit: (kit: BrandKit) => void;
}

export default function BrandKitModal({
  isOpen,
  onClose,
  onUpdateBrandKit,
}: BrandKitModalProps) {
  const [kit, setKit] = useState<BrandKit>(DEFAULT_BRAND_KIT);

  useEffect(() => {
    if (isOpen) {
      setKit(getStoredBrandKit());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveStoredBrandKit(kit);
    onUpdateBrandKit(kit);
    toast.success('👑 Brand Kit & Watermark preferences saved!');
    onClose();
  };

  const handleToggle = () => {
    const updated = { ...kit, enabled: !kit.enabled };
    setKit(updated);
    toast.info(updated.enabled ? 'Watermark branding enabled' : 'Watermark branding disabled');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[#090D1A] border border-purple-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-gradient-to-r from-purple-950/40 via-[#090D1A] to-cyan-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Brand Kit & Watermark Studio
                <span className="text-[10px] bg-purple-500/20 text-purple-300 font-mono px-2 py-0.5 rounded-full font-bold">
                  PRO
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Burn persistent logos, creator handles, and signature colors into exports.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Master Enable Switch */}
          <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white block">Burn Brand Watermark into Renders</span>
              <span className="text-[11px] text-slate-400 block">
                Automatically overlays your logo and handle onto video canvas.
              </span>
            </div>
            <button
              onClick={handleToggle}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                kit.enabled
                  ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/30'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
              }`}
            >
              {kit.enabled ? 'ACTIVE' : 'DISABLED'}
            </button>
          </div>

          {/* Logo URL & Preset */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Creator Logo / Watermark Image</span>
              <span className="text-[10px] text-slate-500 font-mono">PNG / SVG with transparency recommended</span>
            </label>
            <input
              type="text"
              value={kit.logoUrl}
              onChange={(e) => setKit({ ...kit, logoUrl: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-mono text-[11px]"
              placeholder="https://... logo png url"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setKit({ ...kit, logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80' })}
                className="py-1 px-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[10px] text-slate-300 border border-white/[0.06]"
              >
                Sample Logo A
              </button>
              <button
                type="button"
                onClick={() => setKit({ ...kit, logoUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=80' })}
                className="py-1 px-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[10px] text-slate-300 border border-white/[0.06]"
              >
                Sample Badge B
              </button>
            </div>
          </div>

          {/* Position & Size Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Position */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Screen Position</label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setKit({ ...kit, logoPosition: pos })}
                    className={`py-2 px-2.5 rounded-xl border text-[11px] font-medium capitalize transition-all ${
                      kit.logoPosition === pos
                        ? 'bg-purple-600/30 border-purple-400 text-white font-bold'
                        : 'bg-black/30 border-white/[0.06] text-slate-400 hover:text-white'
                    }`}
                  >
                    {pos.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Scale & Opacity */}
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Opacity</span>
                  <span className="text-purple-400 font-mono">{Math.round(kit.logoOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={1.0}
                  step={0.05}
                  value={kit.logoOpacity}
                  onChange={(e) => setKit({ ...kit, logoOpacity: parseFloat(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Logo Size</span>
                  <span className="text-purple-400 font-mono">{kit.logoSizePx}px</span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={160}
                  step={10}
                  value={kit.logoSizePx}
                  onChange={(e) => setKit({ ...kit, logoSizePx: parseInt(e.target.value, 10) })}
                  className="w-full accent-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Creator Handle & Typography */}
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/[0.08]">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Creator Handle</label>
              <input
                type="text"
                value={kit.creatorHandle}
                onChange={(e) => setKit({ ...kit, creatorHandle: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-mono text-[11px]"
                placeholder="@handle"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Brand Font</label>
              <select
                value={kit.fontFamily}
                onChange={(e) => setKit({ ...kit, fontFamily: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
              >
                {BRAND_FONTS.map((font) => (
                  <option key={font.id} value={font.font} className="bg-slate-900">
                    {font.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Brand Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Primary Brand Accent</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={kit.primaryColor}
                  onChange={(e) => setKit({ ...kit, primaryColor: e.target.value })}
                  className="w-8 h-8 rounded-lg border-0 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={kit.primaryColor}
                  onChange={(e) => setKit({ ...kit, primaryColor: e.target.value })}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Secondary Accent</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={kit.accentColor}
                  onChange={(e) => setKit({ ...kit, accentColor: e.target.value })}
                  className="w-8 h-8 rounded-lg border-0 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={kit.accentColor}
                  onChange={(e) => setKit({ ...kit, accentColor: e.target.value })}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/[0.08] flex items-center justify-between bg-black/40">
          <button
            type="button"
            onClick={() => setKit(DEFAULT_BRAND_KIT)}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Reset Defaults
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/[0.05] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-purple-500/25 flex items-center gap-1.5 transition-all"
            >
              <Check className="w-3.5 h-3.5" /> Save Brand Kit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
