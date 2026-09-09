'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Download, Sparkles, Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';

interface ThumbnailModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoElement: HTMLVideoElement | null;
  imageSrc?: string | null;
  projectTitle: string;
  aspectRatio: '16:9' | '9:16' | '1:1';
}

const BADGES = ['VIRAL', 'MUST WATCH', 'SECRET HACK', '10X FASTER', 'AI REVOLUTION'];

const COLOR_PRESETS = [
  { name: 'Electric Yellow', color: '#FFE600' },
  { name: 'Neon Cyan', color: '#22D3EE' },
  { name: 'Hot Pink', color: '#F43F5E' },
  { name: 'Pure White', color: '#FFFFFF' },
];

export default function ThumbnailModal({
  isOpen,
  onClose,
  videoElement,
  imageSrc,
  projectTitle,
  aspectRatio,
}: ThumbnailModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [headline, setHeadline] = useState(projectTitle ? projectTitle.toUpperCase() : 'VIRAL VIDEO SECRETS');
  const [selectedBadge, setSelectedBadge] = useState('VIRAL');
  const [textColor, setTextColor] = useState('#FFE600');
  const [fontSize, setFontSize] = useState(58);
  const [includeBadge, setIncludeBadge] = useState(true);

  // Redraw canvas whenever parameters change
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1280;
    const height = 720;
    canvas.width = width;
    canvas.height = height;

    // 1. Draw base video frame or image
    ctx.fillStyle = '#080B14';
    ctx.fillRect(0, 0, width, height);

    if (imageSrc) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageSrc;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        drawGraphics(ctx, width, height);
      };
    } else if (videoElement) {
      try {
        ctx.drawImage(videoElement, 0, 0, width, height);
      } catch {
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, width, height);
      }
      drawGraphics(ctx, width, height);
    } else {
      drawGraphics(ctx, width, height);
    }

    function drawGraphics(c: CanvasRenderingContext2D, w: number, h: number) {
      // Vignette & Contrast Overlay
      const grad = c.createLinearGradient(0, h * 0.4, 0, h);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.85)');
      c.fillStyle = grad;
      c.fillRect(0, 0, w, h);

      // Top corner badge
      if (includeBadge && selectedBadge) {
        c.save();
        c.font = '900 24px sans-serif';
        const badgeText = selectedBadge;
        const bMetrics = c.measureText(badgeText);
        const bPadX = 18;
        const bPadY = 10;
        const bW = bMetrics.width + bPadX * 2;
        const bH = 24 + bPadY * 2;

        c.fillStyle = '#F43F5E';
        c.shadowColor = 'rgba(244, 63, 94, 0.6)';
        c.shadowBlur = 14;
        c.beginPath();
        c.roundRect(40, 40, bW, bH, 12);
        c.fill();

        c.fillStyle = '#FFFFFF';
        c.shadowBlur = 0;
        c.textAlign = 'left';
        c.textBaseline = 'middle';
        c.fillText(badgeText, 40 + bPadX, 40 + bH / 2);
        c.restore();
      }

      // Bold Viral Title Typography
      if (headline.trim()) {
        c.save();
        c.font = `900 ${fontSize}px sans-serif`;
        c.textAlign = 'center';
        c.textBaseline = 'middle';

        const lines = headline.split('\n');
        const lineHeight = fontSize * 1.15;
        const startY = h - 100 - (lines.length - 1) * lineHeight;

        lines.forEach((line, i) => {
          const y = startY + i * lineHeight;

          // Heavy black stroke outline
          c.lineWidth = 14;
          c.strokeStyle = '#000000';
          c.strokeText(line, w / 2, y);

          // Deep glow shadow
          c.shadowColor = textColor;
          c.shadowBlur = 16;
          c.fillStyle = textColor;
          c.fillText(line, w / 2, y);
        });
        c.restore();
      }
    }
  }, [isOpen, headline, selectedBadge, textColor, fontSize, includeBadge, videoElement, imageSrc]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/jpeg', 0.95);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(headline || 'thumbnail').toLowerCase().replace(/\s+/g, '_')}_thumb.jpg`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => document.body.removeChild(a), 1500);
    toast.success('High-resolution thumbnail downloaded!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-3xl w-full p-6 rounded-3xl glass-panel border border-cyan-500/30 shadow-2xl space-y-6 animate-in fade-in">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Viral Thumbnail Generator Studio</h3>
              <p className="text-xs text-slate-400">Captured from video playback canvas with high-CTR styling</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Canvas Preview */}
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl">
          <canvas ref={canvasRef} className="w-full h-full object-contain" />
        </div>

        {/* Customization Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Headline Text (Uppercase)</label>
              <textarea
                rows={2}
                value={headline}
                onChange={(e) => setHeadline(e.target.value.toUpperCase())}
                placeholder="TYPE VIRAL HEADLINE..."
                className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white font-bold focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Badge Sticker</label>
              <div className="flex flex-wrap gap-1.5">
                {BADGES.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => {
                      setSelectedBadge(b);
                      setIncludeBadge(true);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all ${
                      selectedBadge === b && includeBadge
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-900/40'
                        : 'bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-white'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Typography Color</label>
              <div className="grid grid-cols-2 gap-2">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setTextColor(c.color)}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      textColor === c.color
                        ? 'border-white text-white font-bold bg-white/10'
                        : 'border-white/[0.06] text-slate-400 hover:text-white bg-white/[0.02]'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-black/40" style={{ backgroundColor: c.color }} />
                    <span className="text-[11px] truncate">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Font Size</span>
                <span className="font-mono text-white font-bold">{fontSize}px</span>
              </div>
              <input
                type="range"
                min={36}
                max={84}
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download High-Res Thumbnail (.jpg)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
