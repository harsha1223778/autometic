'use client';

import React, { useState } from 'react';
import { ShoppingBag, X, Plus, Trash2, Tag, ExternalLink, Sparkles, Check, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { VideoHotspotItem, SAMPLE_HOTSPOTS, HotspotType, HotspotPosition } from '@/lib/videoHotspots';

interface HotspotsStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTime: number;
  duration?: number;
  hotspots: VideoHotspotItem[];
  onSaveHotspots: (updated: VideoHotspotItem[]) => void;
}

export default function HotspotsStudioModal({
  isOpen,
  onClose,
  currentTime,
  hotspots: initialHotspots,
  onSaveHotspots
}: HotspotsStudioModalProps) {
  const [hotspotList, setHotspotList] = useState<VideoHotspotItem[]>(
    initialHotspots.length > 0 ? initialHotspots : SAMPLE_HOTSPOTS
  );

  // Form State
  const [newType, setNewType] = useState<HotspotType>('product_card');
  const [newTitle, setNewTitle] = useState('Featured Product Drop');
  const [newDesc, setNewDesc] = useState('Tap to unlock discount and direct checkout');
  const [newPrice, setNewPrice] = useState('$29.99');
  const [newButtonText, setNewButtonText] = useState('Claim Offer');
  const [newUrl, setNewUrl] = useState('https://editflow.ai');
  const [newCoupon, setNewCoupon] = useState('PRO20');
  const [newStartTime, setNewStartTime] = useState(Math.round(currentTime));
  const [newDuration, setNewDuration] = useState(5.0);
  const [newPosition, setNewPosition] = useState<HotspotPosition>('bottom-center');
  const [newAccentColor, setNewAccentColor] = useState('#8b5cf6');

  if (!isOpen) return null;

  const handleAddHotspot = (e: React.FormEvent) => {
    e.preventDefault();
    const item: VideoHotspotItem = {
      id: `hotspot-${Date.now()}`,
      type: newType,
      title: newTitle,
      description: newDesc,
      price: newType === 'product_card' ? newPrice : undefined,
      buttonText: newButtonText,
      url: newUrl,
      couponCode: newType === 'discount_coupon' ? newCoupon : undefined,
      startTime: Number(newStartTime),
      duration: Number(newDuration),
      position: newPosition,
      badge: newType === 'discount_coupon' ? 'COUPON' : 'SPONSORED',
      accentColor: newAccentColor
    };

    const updated = [...hotspotList, item];
    setHotspotList(updated);
    toast.success(`Created interactive ${newType.replace('_', ' ')} at ${newStartTime}s!`);
  };

  const handleDelete = (id: string) => {
    const filtered = hotspotList.filter(h => h.id !== id);
    setHotspotList(filtered);
    toast.info('Hotspot removed');
  };

  const handleSaveAndClose = () => {
    onSaveHotspots(hotspotList);
    toast.success(`Saved ${hotspotList.length} interactive video hotspots!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Shoppable Hotspots & Interactive CTAs</h2>
              <p className="text-xs text-zinc-400">Add clickable product cards, affiliate links and coupon vouchers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Hotspots */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300">Active Hotspots ({hotspotList.length})</span>
            <span className="text-[10px] text-purple-400 font-mono">Current Playhead: {Math.floor(currentTime)}s</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
            {hotspotList.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1 overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.accentColor || '#8b5cf6' }}
                    />
                    <span className="font-bold text-white truncate">{item.title}</span>
                    {item.price && <span className="font-mono text-emerald-400 font-bold">{item.price}</span>}
                  </div>
                  {item.description && <p className="text-[10px] text-zinc-400 line-clamp-1">{item.description}</p>}
                  <div className="flex items-center gap-2 text-[9px] text-zinc-500 font-mono">
                    <span>At {item.startTime}s ({item.duration}s)</span>
                    <span>•</span>
                    <span className="capitalize">{item.position}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-1 text-zinc-500 hover:text-rose-400 transition"
                  title="Remove Hotspot"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Create New Hotspot Form */}
        <form onSubmit={handleAddHotspot} className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
          <span className="text-xs font-bold text-zinc-200 block">Create Interactive CTA Hotspot</span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'product_card', label: 'Product Card' },
              { id: 'discount_coupon', label: 'Discount Coupon' },
              { id: 'link_button', label: 'Link Button' },
              { id: 'lead_form', label: 'Lead Capture' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setNewType(t.id as any)}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition ${
                  newType === t.id
                    ? 'bg-purple-600/30 border-purple-500 text-white shadow-sm'
                    : 'bg-black/30 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-zinc-400 block mb-1">Title / Headline</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-zinc-200"
              />
            </div>
            <div>
              <label className="text-zinc-400 block mb-1">Target Destination URL</label>
              <input
                type="url"
                required
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-zinc-200"
              />
            </div>
            <div>
              <label className="text-zinc-400 block mb-1">Description / Subtitle</label>
              <input
                type="text"
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-zinc-200"
              />
            </div>
            <div>
              <label className="text-zinc-400 block mb-1">Button CTA Text</label>
              <input
                type="text"
                value={newButtonText}
                onChange={e => setNewButtonText(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-zinc-200"
              />
            </div>
            {newType === 'product_card' && (
              <div>
                <label className="text-zinc-400 block mb-1">Price Tag</label>
                <input
                  type="text"
                  value={newPrice}
                  onChange={e => setNewPrice(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-zinc-200"
                />
              </div>
            )}
            {newType === 'discount_coupon' && (
              <div>
                <label className="text-zinc-400 block mb-1">Promo Coupon Code</label>
                <input
                  type="text"
                  value={newCoupon}
                  onChange={e => setNewCoupon(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-zinc-200"
                />
              </div>
            )}
            <div>
              <label className="text-zinc-400 block mb-1">Trigger Start (Seconds)</label>
              <input
                type="number"
                min={0}
                max={120}
                step={0.5}
                value={newStartTime}
                onChange={e => setNewStartTime(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-zinc-200"
              />
            </div>
            <div>
              <label className="text-zinc-400 block mb-1">Duration On Screen (Seconds)</label>
              <input
                type="number"
                min={1}
                max={30}
                step={0.5}
                value={newDuration}
                onChange={e => setNewDuration(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-zinc-200"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="py-1.5 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Hotspot
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveAndClose}
            className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl transition flex items-center gap-1.5 shadow-lg"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save &amp; Sync Hotspots</span>
          </button>
        </div>
      </div>
    </div>
  );
}
