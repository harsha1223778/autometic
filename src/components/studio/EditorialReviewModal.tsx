'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  X,
  Plus,
  CheckCircle2,
  Clock,
  Trash2,
  Copy,
  ExternalLink,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  EditorialPin,
  REVIEW_CATEGORIES,
  exportEditorialSummary,
} from '@/lib/editorialReview';

interface EditorialReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTime: number;
  pins: EditorialPin[];
  onAddPin: (newPin: EditorialPin) => void;
  onToggleStatus: (pinId: string) => void;
  onDeletePin: (pinId: string) => void;
  onSeekToTime: (time: number) => void;
}

export default function EditorialReviewModal({
  isOpen,
  onClose,
  currentTime,
  pins,
  onAddPin,
  onToggleStatus,
  onDeletePin,
  onSeekToTime,
}: EditorialReviewModalProps) {
  const [newComment, setNewComment] = useState('');
  const [newAuthor, setNewAuthor] = useState('Lead Editor');
  const [newRole, setNewRole] = useState<'Client' | 'Lead Editor' | 'Director' | 'Sound Designer'>('Lead Editor');
  const [newCategory, setNewCategory] = useState<'pacing' | 'visual' | 'audio' | 'brand' | 'general'>('pacing');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'resolved'>('all');

  if (!isOpen) return null;

  const handleCreatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error('Please enter a revision note');
      return;
    }

    const pin: EditorialPin = {
      id: `pin-${Date.now()}`,
      timestamp: parseFloat(currentTime.toFixed(1)),
      author: newAuthor.trim() || 'Editor',
      role: newRole,
      comment: newComment.trim(),
      category: newCategory,
      status: 'pending',
      createdAt: 'Just now',
    };

    onAddPin(pin);
    setNewComment('');
    toast.success(`Pinned revision note at ${currentTime.toFixed(1)}s`);
  };

  const filteredPins = pins.filter((p) => {
    if (filterStatus === 'all') return true;
    return p.status === filterStatus;
  });

  const handleCopySummary = () => {
    const summary = exportEditorialSummary(pins);
    navigator.clipboard.writeText(summary);
    toast.success('Copied editorial review sheet to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Collaborative Editorial Review
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-medium border border-cyan-500/30">
                  {pins.length} Revision Pins
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Frame-accurate timestamps, approval checkpoints, and team annotations.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* New Revision Form */}
          <form onSubmit={handleCreatePin} className="p-4 rounded-xl bg-neutral-800/40 border border-neutral-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-cyan-400" />
                Add Revision Pin at Current Playhead ({currentTime.toFixed(1)}s)
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="Your Name"
                  className="py-1 px-2.5 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-white w-28 focus:outline-none focus:border-cyan-400"
                />
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="py-1 px-2 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="Client">Client</option>
                  <option value="Lead Editor">Lead Editor</option>
                  <option value="Director">Director</option>
                  <option value="Sound Designer">Sound Designer</option>
                </select>
              </div>
            </div>

            <textarea
              rows={2}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="e.g. Cut 0.5s faster here, add B-roll of smartphone, boost music volume..."
              className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-cyan-400"
            />

            <div className="flex items-center justify-between">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5">
                {REVIEW_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setNewCategory(cat.id as any)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition ${
                      newCategory === cat.id
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Drop Pin</span>
              </button>
            </div>
          </form>

          {/* Feedback Feed Filter & Summary Action */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 bg-neutral-800/60 p-1 rounded-xl border border-neutral-700">
              {(['all', 'pending', 'resolved'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition ${
                    filterStatus === st
                      ? 'bg-cyan-600 text-white'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {st} ({st === 'all' ? pins.length : pins.filter((p) => p.status === st).length})
                </button>
              ))}
            </div>

            <button
              onClick={handleCopySummary}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-neutral-300 flex items-center gap-1.5 transition border border-neutral-700"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Review Sheet</span>
            </button>
          </div>

          {/* List of Pins */}
          <div className="space-y-2.5">
            {filteredPins.length === 0 ? (
              <div className="text-center py-8 text-neutral-500 text-xs">
                No feedback pins match the active filter.
              </div>
            ) : (
              filteredPins.map((pin) => {
                const categoryMeta = REVIEW_CATEGORIES.find((c) => c.id === pin.category);
                const isResolved = pin.status === 'resolved';

                return (
                  <div
                    key={pin.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                      isResolved
                        ? 'bg-neutral-900/40 border-neutral-800 opacity-60'
                        : 'bg-neutral-800/40 border-neutral-700/80 hover:border-neutral-600'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSeekToTime(pin.timestamp)}
                          className="px-2 py-0.5 rounded-md bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold hover:bg-cyan-900 transition flex items-center gap-1"
                          title="Seek playhead to this frame"
                        >
                          <Clock className="w-3 h-3" />
                          <span>{pin.timestamp.toFixed(1)}s</span>
                        </button>

                        <span className="text-xs font-bold text-white">
                          {pin.author}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          ({pin.role})
                        </span>

                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider font-mono"
                          style={{
                            backgroundColor: `${categoryMeta?.color}20`,
                            color: categoryMeta?.color,
                            border: `1px solid ${categoryMeta?.color}40`,
                          }}
                        >
                          {categoryMeta?.label}
                        </span>

                        <span className="text-[10px] text-neutral-500">
                          {pin.createdAt}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-200 leading-relaxed pl-1">
                        {pin.comment}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onToggleStatus(pin.id)}
                        className={`p-1.5 rounded-lg border transition ${
                          isResolved
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30'
                            : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-emerald-400'
                        }`}
                        title={isResolved ? 'Re-open note' : 'Mark as resolved'}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeletePin(pin.id)}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Delete pin"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-neutral-800 bg-neutral-900/60">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-neutral-800 text-white hover:bg-neutral-700 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
