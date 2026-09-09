'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/navigation/Sidebar';
import TopNav from '@/components/navigation/TopNav';
import {
  Scissors,
  Split,
  Trash2,
  Volume2,
  VolumeX,
  Music,
  Type,
  Palette,
  Undo,
  Redo,
  Save,
  Download,
  Play,
  Pause,
  Sliders,
  Sparkles,
  Layers,
  History,
  Check,
  RotateCcw,
  Maximize,
  Image as ImageIcon,
  Film,
  Plus,
  UploadCloud,
  Wand2,
  BotMessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';

const isImageMedia = (url?: string) => {
  if (!url) return false;
  return !!url.match(/\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i);
};

interface EditOperation {
  id: string;
  type: string;
  name: string;
  timestamp: string;
  details: Record<string, any>;
}

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  type: 'video' | 'image';
  duration?: number;
  thumbnailUrl?: string;
}

export default function ManualStudioPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Playback state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);

  // Studio Tools & Properties State
  const [activeTab, setActiveTab] = useState<'media' | 'trim' | 'audio' | 'subtitles' | 'filters'>('media');
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [selectedOverlayPosition, setSelectedOverlayPosition] = useState<'top-right' | 'center' | 'lower-third'>('top-right');
  const [overlayDuration, setOverlayDuration] = useState(4.0);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const studioFileInputRef = useRef<HTMLInputElement>(null);

  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(30);
  const [originalVolume, setOriginalVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [musicTrack, setMusicTrack] = useState<any>(null);
  const [musicVolume, setMusicVolume] = useState(25);
  const [fadeIn, setFadeIn] = useState(1.5);
  const [fadeOut, setFadeOut] = useState(2.0);

  // Subtitle Settings
  const [subtitleText, setSubtitleText] = useState('Welcome to EditFlow AI Studio');
  const [subtitleSize, setSubtitleSize] = useState(24);
  const [subtitleColor, setSubtitleColor] = useState('#FFFFFF');
  const [subtitlePosition, setSubtitlePosition] = useState<'bottom' | 'center' | 'top'>('bottom');

  // Filters
  const [selectedFilter, setSelectedFilter] = useState<'clean' | 'warm' | 'cool' | 'cinematic' | 'bw'>('clean');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');

  // Operations History & Undo/Redo Stacks
  const [operations, setOperations] = useState<EditOperation[]>([
    {
      id: 'op-init',
      type: 'clip_import',
      name: 'Footage Imported',
      timestamp: '00:00',
      details: { format: '1080p MP4' },
    },
  ]);
  const [redoStack, setRedoStack] = useState<EditOperation[]>([]);
  const [savingDraft, setSavingDraft] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Available music tracks from library
  const [musicTracks, setMusicTracks] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.project) {
          setProject(data.project);
          if (data.project.duration) {
            setDuration(data.project.duration);
            setTrimEnd(data.project.duration);
          }

          // Fetch edit plan to load operations and any stored media assets
          fetch(`/api/projects/${projectId}/edit-plan`)
            .then((r) => (r.ok ? r.json() : null))
            .then((plan) => {
              let existingAssets: MediaAsset[] = [];
              if (plan?.operations && Array.isArray(plan.operations)) {
                setOperations(plan.operations);
                const assetOp = plan.operations.find((o: any) => o.type === 'media_assets_imported');
                if (assetOp?.assets && Array.isArray(assetOp.assets)) {
                  existingAssets = assetOp.assets;
                }
              }

              if (existingAssets.length === 0) {
                setMediaAssets([
                  {
                    id: 'asset-main',
                    name: data.project.title || 'Primary Video Clip',
                    url: data.project.originalVideoUrl,
                    type: 'video',
                    duration: data.project.duration || 30.0,
                    thumbnailUrl: data.project.thumbnailUrl,
                  },
                  {
                    id: 'stock-broll-1',
                    name: 'Cinematic B-Roll Overlay',
                    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&auto=format&fit=crop&q=80',
                    type: 'image',
                    duration: 5.0,
                    thumbnailUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80',
                  },
                  {
                    id: 'stock-broll-2',
                    name: 'Studio Title Card Graphic',
                    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
                    type: 'image',
                    duration: 5.0,
                    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
                  },
                ]);
              } else {
                setMediaAssets(existingAssets);
              }
            })
            .catch(() => {});
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch('/api/music')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.tracks) setMusicTracks(data.tracks);
      })
      .catch(() => {});
  }, [projectId]);

  const addOperation = (type: string, name: string, details: Record<string, any>) => {
    const newOp: EditOperation = {
      id: `op-${Date.now()}`,
      type,
      name,
      timestamp: formatTime(currentTime),
      details,
    };
    setOperations((prev) => [...prev, newOp]);
    setRedoStack([]); // Clear redo stack on new action
  };

  const handleUndo = () => {
    if (operations.length <= 1) {
      toast.info('Nothing to undo');
      return;
    }
    const lastOp = operations[operations.length - 1];
    setRedoStack((prev) => [lastOp, ...prev]);
    setOperations((prev) => prev.slice(0, prev.length - 1));
    toast.info(`Undid: ${lastOp.name}`);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) {
      toast.info('Nothing to redo');
      return;
    }
    const [opToRedo, ...rest] = redoStack;
    setRedoStack(rest);
    setOperations((prev) => [...prev, opToRedo]);
    toast.info(`Redid: ${opToRedo.name}`);
  };

  const handleStudioMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingMedia(true);
    try {
      const formData = new FormData();
      Array.from(e.target.files).forEach((f) => formData.append('files', f));

      const res = await fetch('/api/upload/media', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      const newAssets: MediaAsset[] = data.media || [];
      setMediaAssets((prev) => [...prev, ...newAssets]);
      addOperation('media_assets_imported', `Imported ${newAssets.length} media asset(s)`, {
        count: newAssets.length,
        names: newAssets.map((a) => a.name),
      });
      toast.success(`Imported ${newAssets.length} new media asset(s) to studio!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to import media');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleAddImageOverlay = (asset: MediaAsset) => {
    const start = parseFloat(currentTime.toFixed(1));
    addOperation('overlay_image', `Overlay Image: ${asset.name}`, {
      assetId: asset.id,
      name: asset.name,
      url: asset.url,
      thumbnailUrl: asset.thumbnailUrl,
      startTime: start,
      duration: overlayDuration,
      position: selectedOverlayPosition,
    });
    toast.success(`Added image overlay at ${formatTime(start)} (${overlayDuration}s)`);
  };

  const handleAddBrollCutaway = (asset: MediaAsset) => {
    const start = parseFloat(currentTime.toFixed(1));
    addOperation('broll_clip', `B-Roll Cutaway: ${asset.name}`, {
      assetId: asset.id,
      name: asset.name,
      url: asset.url,
      thumbnailUrl: asset.thumbnailUrl,
      startTime: start,
      duration: 5.0,
    });
    toast.success(`Added B-roll cutaway at ${formatTime(start)} (5s)`);
  };

  const handleRemoveOverlayOp = (opId: string) => {
    setOperations((prev) => prev.filter((o) => o.id !== opId));
    toast.info('Removed overlay from timeline');
  };

  const handleSplitClip = () => {
    addOperation('split_clip', 'Split Clip at Cursor', { splitPoint: currentTime.toFixed(2) });
    toast.success(`Clip split at ${formatTime(currentTime)}`);
  };

  const handleDeleteSection = () => {
    addOperation('delete_section', 'Deleted Selected Segment', {
      from: trimStart.toFixed(2),
      to: trimEnd.toFixed(2),
    });
    toast.success('Deleted selected clip segment');
  };

  const handleSaveDraft = async () => {
    setSavingDraft(true);
    try {
      await fetch(`/api/projects/${projectId}/edit-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operations,
          mode: 'manual',
          instructions: 'Manual Studio Draft',
        }),
      });
      toast.success('Saved draft operations to cloud');
    } catch {
      toast.error('Failed to save draft');
    } finally {
      setSavingDraft(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    toast.info('Initiating manual video render job...');
    try {
      const res = await fetch(`/api/projects/${projectId}/render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operations,
          mode: 'manual',
          instructions: `Manual render with ${operations.length} operations`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Export failed');

      toast.success('Render job queued! Navigating to Auto/Jobs preview.');
      router.push(`/projects/${projectId}/auto`);
    } catch (err: any) {
      toast.error(err.message || 'Export failed');
      setIsExporting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  const filterStyles = {
    clean: '',
    warm: 'sepia(0.25) saturate(1.3) contrast(1.05)',
    cool: 'hue-rotate(180deg) saturate(1.1) brightness(1.05)',
    cinematic: 'contrast(1.2) saturate(1.15) brightness(0.95)',
    bw: 'grayscale(1) contrast(1.2)',
  };

  return (
    <div className="min-h-screen bg-[#06080F] text-slate-100 flex flex-col">
      {/* Studio Top Control Bar */}
      <header className="h-14 border-b border-white/[0.08] bg-[#080B14] px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            ←
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white truncate max-w-xs">
              {project?.title || 'Manual Studio'}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Manual Studio
            </span>
          </div>
        </div>

        {/* Mode Switcher Navigation */}
        <div className="hidden sm:flex items-center gap-1 p-1 bg-white/[0.04] border border-white/[0.08] rounded-xl">
          <button
            type="button"
            onClick={() => router.push(`/projects/${projectId}/auto`)}
            className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Wand2 className="w-3.5 h-3.5 text-purple-400" /> Auto Edit
          </button>
          <button
            type="button"
            className="px-2.5 py-1 rounded-lg bg-cyan-600 text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5" /> Manual Studio
          </button>
          <button
            type="button"
            onClick={() => router.push(`/projects/${projectId}/assistant`)}
            className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <BotMessageSquare className="w-3.5 h-3.5 text-pink-400" /> AI Assistant
          </button>
        </div>

        {/* Undo/Redo & Save Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={operations.length <= 1}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.05] disabled:opacity-30 transition-all"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.05] disabled:opacity-30 transition-all"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-white/10 mx-1" />
          <button
            onClick={handleSaveDraft}
            disabled={savingDraft}
            className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-slate-200 transition-all flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5 text-slate-400" />
            {savingDraft ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-xs font-semibold text-white shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Export Video
          </button>
        </div>
      </header>

      {/* Studio Workspace 3-Pane Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Tools Panel */}
        <div className="w-72 bg-[#080B14]/90 border-r border-white/[0.08] flex flex-col">
          {/* Tool Navigation Tabs */}
          <div className="flex border-b border-white/[0.08] p-2 gap-1">
            {[
              { id: 'media', label: 'Media', icon: ImageIcon },
              { id: 'trim', label: 'Trim', icon: Scissors },
              { id: 'audio', label: 'Audio', icon: Volume2 },
              { id: 'subtitles', label: 'Subs', icon: Type },
              { id: 'filters', label: 'Filter', icon: Palette },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-2 px-1 rounded-xl text-[11px] font-medium flex flex-col items-center gap-1 transition-all ${
                    activeTab === tab.id
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tool Parameters */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {activeTab === 'media' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Project Media Assets</h4>
                  <span className="text-[10px] text-cyan-400 font-mono font-semibold">{mediaAssets.length} Items</span>
                </div>

                {/* In-Studio Upload Button */}
                <input
                  ref={studioFileInputRef}
                  type="file"
                  multiple
                  accept="video/*,image/*"
                  className="hidden"
                  onChange={handleStudioMediaUpload}
                />
                <button
                  type="button"
                  onClick={() => studioFileInputRef.current?.click()}
                  disabled={uploadingMedia}
                  className="w-full p-3 rounded-2xl bg-gradient-to-r from-purple-600/20 to-cyan-500/20 hover:from-purple-600/30 hover:to-cyan-500/30 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <UploadCloud className="w-4 h-4 text-cyan-400" />
                  <span>{uploadingMedia ? 'Uploading Files...' : 'Upload Images / Videos'}</span>
                </button>

                {/* Overlay Position & Duration Controls */}
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2.5">
                  <label className="text-[11px] font-semibold text-slate-300 block">Image Overlay Settings</label>
                  <div className="grid grid-cols-3 gap-1 text-[10px]">
                    {[
                      { id: 'top-right', label: 'Top Right' },
                      { id: 'center', label: 'Center' },
                      { id: 'lower-third', label: 'Lower 3rd' },
                    ].map((pos) => (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => setSelectedOverlayPosition(pos.id as any)}
                        className={`py-1 px-1.5 rounded-lg border font-medium text-center transition-all ${
                          selectedOverlayPosition === pos.id
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold'
                            : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-400">Duration</span>
                    <span className="text-cyan-300 font-mono font-bold">{overlayDuration}s</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={15}
                    step={0.5}
                    value={overlayDuration}
                    onChange={(e) => setOverlayDuration(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 h-1"
                  />
                </div>

                {/* Media Asset List */}
                <div className="space-y-2">
                  <label className="text-[11px] text-slate-400 block font-medium">Available Assets (Click to insert at {formatTime(currentTime)})</label>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {mediaAssets.map((asset) => (
                      <div
                        key={asset.id}
                        className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] flex items-center gap-2.5 transition-all group"
                      >
                        <div className="w-12 h-10 rounded-lg bg-black overflow-hidden relative flex-shrink-0 flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={asset.thumbnailUrl || asset.url}
                            alt={asset.name}
                            className="w-full h-full object-cover"
                          />
                          <span
                            className={`absolute top-0.5 left-0.5 text-[7px] font-extrabold uppercase px-1 rounded ${
                              asset.type === 'video' ? 'bg-purple-600 text-white' : 'bg-cyan-600 text-white'
                            }`}
                          >
                            {asset.type}
                          </span>
                        </div>

                        <div className="flex-1 overflow-hidden">
                          <p className="text-[11px] font-semibold text-white truncate">{asset.name}</p>
                          <span className="text-[9px] text-slate-400">{asset.type === 'video' ? `${asset.duration || 30}s Clip` : 'Still Image'}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (asset.type === 'image') {
                              handleAddImageOverlay(asset);
                            } else {
                              handleAddBrollCutaway(asset);
                            }
                          }}
                          className="px-2 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-[10px] font-semibold text-purple-200 transition-all flex items-center gap-1"
                          title="Insert onto timeline at current playhead"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Insert</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline Active Overlays */}
                {operations.some((op) => op.type === 'overlay_image' || op.type === 'broll_clip') && (
                  <div className="pt-2 border-t border-white/[0.08] space-y-2">
                    <label className="text-[11px] font-semibold text-cyan-300 block">Active Timeline Overlays</label>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {operations
                        .filter((op) => op.type === 'overlay_image' || op.type === 'broll_clip')
                        .map((op) => (
                          <div
                            key={op.id}
                            className="p-2 rounded-lg bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between text-[10px]"
                          >
                            <div className="overflow-hidden pr-2">
                              <span className="font-semibold text-white truncate block">{op.name}</span>
                              <span className="text-slate-400 font-mono">{op.details?.startTime}s - {Number(op.details?.startTime) + Number(op.details?.duration)}s</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveOverlayOp(op.id)}
                              className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors"
                              title="Delete from timeline"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'trim' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Clip Editing</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleSplitClip}
                    className="p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-semibold flex flex-col items-center gap-2"
                  >
                    <Split className="w-4 h-4 text-cyan-400" />
                    <span>Split at Cursor</span>
                  </button>
                  <button
                    onClick={handleDeleteSection}
                    className="p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex flex-col items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Section</span>
                  </button>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Trim In</span>
                    <span className="text-white font-mono">{trimStart.toFixed(1)}s</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={duration}
                    step={0.5}
                    value={trimStart}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setTrimStart(val);
                      addOperation('trim_start', 'Trim Start Point', { time: val });
                    }}
                    className="w-full accent-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Trim Out</span>
                    <span className="text-white font-mono">{trimEnd.toFixed(1)}s</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={duration}
                    step={0.5}
                    value={trimEnd}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setTrimEnd(val);
                      addOperation('trim_end', 'Trim End Point', { time: val });
                    }}
                    className="w-full accent-purple-500"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                  <label className="text-xs text-slate-400 block">Aspect Ratio</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['16:9', '9:16', '1:1'].map((ratio) => (
                      <button
                        key={ratio}
                        onClick={() => {
                          setAspectRatio(ratio as any);
                          addOperation('aspect_ratio', `Changed Aspect to ${ratio}`, { ratio });
                        }}
                        className={`py-1.5 rounded-lg text-xs font-medium border ${
                          aspectRatio === ratio
                            ? 'bg-purple-600/30 border-purple-500/50 text-white'
                            : 'border-white/10 text-slate-400'
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'audio' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Audio Channels</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">Original Footage Audio</span>
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`p-1.5 rounded-lg ${isMuted ? 'bg-rose-500/20 text-rose-300' : 'bg-white/5 text-slate-400'}`}
                    >
                      {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={isMuted ? 0 : originalVolume}
                    onChange={(e) => setOriginalVolume(parseInt(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div className="space-y-3 pt-3 border-t border-white/[0.06]">
                  <h5 className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-purple-400" /> Background Music Track
                  </h5>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {musicTracks.slice(0, 5).map((track) => (
                      <button
                        key={track.id}
                        onClick={() => {
                          setMusicTrack(track);
                          addOperation('add_music', `Added Track: ${track.title}`, { title: track.title });
                          toast.success(`Selected music track: ${track.title}`);
                        }}
                        className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all ${
                          musicTrack?.id === track.id
                            ? 'bg-purple-600/20 border-purple-500/50 text-white'
                            : 'bg-white/[0.02] border-white/[0.06] text-slate-300 hover:bg-white/[0.05]'
                        }`}
                      >
                        <p className="font-semibold truncate">{track.title}</p>
                        <span className="text-[10px] text-slate-400 capitalize">{track.genre} • {track.duration}s</span>
                      </button>
                    ))}
                  </div>

                  {musicTrack && (
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Soundtrack Volume</span>
                        <span className="text-cyan-400 font-mono">{musicVolume}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={musicVolume}
                        onChange={(e) => setMusicVolume(parseInt(e.target.value))}
                        className="w-full accent-purple-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'subtitles' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Subtitles & Captions</h4>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">Caption Text Preview</label>
                  <textarea
                    rows={3}
                    value={subtitleText}
                    onChange={(e) => setSubtitleText(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Font Size</span>
                    <span className="text-white font-mono">{subtitleSize}px</span>
                  </div>
                  <input
                    type="range"
                    min={14}
                    max={48}
                    value={subtitleSize}
                    onChange={(e) => setSubtitleSize(parseInt(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">Position</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['top', 'center', 'bottom'].map((pos) => (
                      <button
                        key={pos}
                        onClick={() => setSubtitlePosition(pos as any)}
                        className={`py-1.5 rounded-lg text-xs font-medium capitalize border ${
                          subtitlePosition === pos
                            ? 'bg-purple-600/30 border-purple-500 text-white'
                            : 'border-white/10 text-slate-400'
                        }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'filters' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Color Grade LUTs</h4>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'clean', name: 'Clean Neutral' },
                    { id: 'warm', name: 'Warm Sunset' },
                    { id: 'cool', name: 'Cool Futuristic' },
                    { id: 'cinematic', name: 'Cinematic Mood' },
                    { id: 'bw', name: 'Monochrome Noir' },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => {
                        setSelectedFilter(filter.id as any);
                        addOperation('color_grade', `Filter: ${filter.name}`, { filter: filter.id });
                      }}
                      className={`p-3 rounded-xl border text-xs text-left transition-all ${
                        selectedFilter === filter.id
                          ? 'bg-purple-600/30 border-purple-500 text-white font-bold'
                          : 'bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white'
                      }`}
                    >
                      {filter.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Live Video Preview Canvas */}
        <div className="flex-1 flex flex-col bg-[#05070E] relative overflow-hidden">
          <div className="flex-1 flex items-center justify-center p-6 relative">
            <div
              className={`relative rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/10 transition-all ${
                aspectRatio === '9:16'
                  ? 'h-[440px] aspect-[9/16]'
                  : aspectRatio === '1:1'
                  ? 'h-[420px] aspect-square'
                  : 'w-full max-w-3xl aspect-video'
              }`}
            >
              {(() => {
                const mediaSrc = project?.originalVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
                const isImg = isImageMedia(mediaSrc);

                if (isImg) {
                  return (
                    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mediaSrc}
                        alt={project?.title || 'Canvas Asset'}
                        className="w-full h-full object-contain"
                        style={{ filter: filterStyles[selectedFilter] }}
                      />
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-cyan-600/90 text-white text-[11px] font-bold shadow-lg flex items-center gap-1.5 backdrop-blur-md">
                        <ImageIcon className="w-3.5 h-3.5" /> Image Asset Preview
                      </div>
                    </div>
                  );
                }

                return (
                  <video
                    ref={videoRef}
                    src={mediaSrc}
                    className="w-full h-full object-contain"
                    style={{ filter: filterStyles[selectedFilter] }}
                    onTimeUpdate={() => {
                      if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
                    }}
                    onLoadedMetadata={() => {
                      if (videoRef.current) setDuration(videoRef.current.duration);
                    }}
                    onError={(e) => {
                      console.warn('Video failed to load or unsupported codec, falling back to universal stream');
                      e.currentTarget.src = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
                    }}
                  />
                );
              })()}

              {/* In-Video Burnt Subtitle Overlay Preview */}
              {subtitleText && (
                <div
                  className={`absolute left-0 right-0 px-6 text-center pointer-events-none z-30 ${
                    subtitlePosition === 'top'
                      ? 'top-8'
                      : subtitlePosition === 'center'
                      ? 'top-1/2 -translate-y-1/2'
                      : 'bottom-8'
                  }`}
                >
                  <span
                    className="inline-block font-extrabold px-3 py-1 rounded-lg bg-black/75 backdrop-blur-md shadow-lg"
                    style={{ fontSize: `${subtitleSize}px`, color: subtitleColor }}
                  >
                    {subtitleText}
                  </span>
                </div>
              )}

              {/* Active Image Overlays & B-Roll Cutaways Preview */}
              {operations
                .filter((op) => (op.type === 'overlay_image' || op.type === 'broll_clip') && op.details)
                .filter(
                  (op) =>
                    currentTime >= Number(op.details.startTime) &&
                    currentTime <= Number(op.details.startTime) + Number(op.details.duration)
                )
                .map((op) => {
                  if (op.type === 'overlay_image') {
                    const pos = op.details.position || 'top-right';
                    const posClasses =
                      pos === 'top-right'
                        ? 'top-4 right-4 max-w-[180px]'
                        : pos === 'center'
                        ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[280px]'
                        : 'bottom-12 left-6 max-w-[200px]';

                    return (
                      <div
                        key={op.id}
                        className={`absolute z-20 rounded-xl overflow-hidden shadow-2xl border-2 border-cyan-400/80 bg-black/70 backdrop-blur-sm pointer-events-none transition-all duration-200 animate-in fade-in zoom-in-95 ${posClasses}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={op.details.url} alt={op.details.name} className="w-full h-auto object-cover max-h-48" />
                        <div className="bg-black/90 px-2 py-1 flex items-center justify-between">
                          <span className="text-[9px] text-cyan-300 font-bold truncate">
                            {op.details.name}
                          </span>
                          <span className="text-[8px] bg-cyan-600/60 text-white font-mono px-1 rounded">IMAGE</span>
                        </div>
                      </div>
                    );
                  }

                  if (op.type === 'broll_clip') {
                    return (
                      <div
                        key={op.id}
                        className="absolute top-4 left-4 z-20 w-48 aspect-video rounded-xl overflow-hidden shadow-2xl border-2 border-purple-500/80 bg-black pointer-events-none transition-all duration-200 animate-in fade-in"
                      >
                        <video
                          src={op.details.url}
                          autoPlay
                          muted
                          loop
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
                          }}
                        />
                        <span className="absolute bottom-1 left-1 text-[8px] font-extrabold bg-purple-600 text-white px-1.5 py-0.5 rounded shadow">
                          B-ROLL CUTAWAY
                        </span>
                      </div>
                    );
                  }
                  return null;
                })}
            </div>
          </div>

          {/* Video Timeline Playback Controls Bar */}
          <div className="h-12 bg-[#080B14] border-t border-white/[0.08] px-6 flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (!videoRef.current) return;
                  if (isPlaying) {
                    videoRef.current.pause();
                    setIsPlaying(false);
                  } else {
                    videoRef.current.play();
                    setIsPlaying(true);
                  }
                }}
                className="w-8 h-8 rounded-lg bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <span className="font-mono text-slate-300">
                {formatTime(currentTime)} <span className="text-slate-600">/</span> {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-3 text-slate-400">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10">
                1080p 60fps
              </span>
            </div>
          </div>

          {/* Interactive Multi-Track Timeline Simulation */}
          <div className="h-44 bg-[#0B0F1C] border-t border-white/[0.08] p-4 flex flex-col justify-between select-none">
            {/* Playhead Scrubbing Rail */}
            <div
              className="relative w-full h-4 cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const pct = clickX / rect.width;
                const newT = pct * duration;
                setCurrentTime(newT);
                if (videoRef.current) videoRef.current.currentTime = newT;
              }}
            >
              <div className="absolute top-1.5 left-0 right-0 h-1 bg-white/10 rounded-full" />
              <div
                className="absolute top-0 w-3 h-4 bg-cyan-400 rounded-sm shadow-md shadow-cyan-400/50 -translate-x-1.5 cursor-ew-resize"
                style={{ left: `${(currentTime / (duration || 1)) * 100}%` }}
              />
            </div>

            {/* Overlays / B-Roll Track Lane */}
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="w-12 font-mono text-[9px] text-cyan-400 font-bold">OVERLAYS</span>
              <div className="flex-1 h-6 rounded-md bg-cyan-950/20 border border-cyan-500/30 relative flex items-center px-1 overflow-hidden">
                {operations
                  .filter((op) => (op.type === 'overlay_image' || op.type === 'broll_clip') && op.details)
                  .map((op, i) => {
                    const startPct = ((Number(op.details.startTime) || 0) / (duration || 1)) * 100;
                    const widthPct = Math.max(5, ((Number(op.details.duration) || 3) / (duration || 1)) * 100);
                    return (
                      <div
                        key={op.id || i}
                        className={`absolute top-0.5 bottom-0.5 rounded px-1.5 flex items-center gap-1 text-[8px] font-bold truncate border shadow-sm ${
                          op.type === 'overlay_image'
                            ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200'
                            : 'bg-purple-500/30 border-purple-400 text-purple-200'
                        }`}
                        style={{ left: `${startPct}%`, width: `${widthPct}%` }}
                        title={`${op.name} (${op.details.startTime}s - ${Number(op.details.startTime) + Number(op.details.duration)}s)`}
                      >
                        <span className="opacity-75">{op.type === 'overlay_image' ? 'IMG' : 'B-ROLL'}:</span>
                        <span className="truncate">{op.details.name || op.name}</span>
                      </div>
                    );
                  })}
                {operations.filter((op) => op.type === 'overlay_image' || op.type === 'broll_clip').length === 0 && (
                  <span className="text-[9px] text-slate-500 italic pl-1">No active image overlays or B-roll clips. Insert from Media tab.</span>
                )}
              </div>
            </div>

            {/* Video Track Lane */}
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="w-12 font-mono">VIDEO</span>
              <div className="flex-1 h-6 rounded-md bg-purple-950/40 border border-purple-500/30 relative flex items-center px-2 overflow-hidden">
                <span className="text-purple-300 font-semibold truncate">{project?.title || 'Clip Track 1'}</span>
                {/* Visual clip marker trims */}
                <div
                  className="absolute inset-y-0 bg-purple-500/20 border-r border-purple-400"
                  style={{ width: `${(trimStart / (duration || 1)) * 100}%` }}
                />
              </div>
            </div>

            {/* Audio Track Lane */}
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="w-12 font-mono">AUDIO</span>
              <div className="flex-1 h-7 rounded-lg bg-cyan-950/30 border border-cyan-500/30 relative flex items-center px-2 overflow-hidden">
                <span className="text-cyan-300 font-semibold">
                  {musicTrack ? `Soundtrack: ${musicTrack.title}` : 'Original Dialogue Track'}
                </span>
              </div>
            </div>

            {/* Subtitle Track Lane */}
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="w-12 font-mono">SUBS</span>
              <div className="flex-1 h-5 rounded-md bg-amber-950/20 border border-amber-500/30 flex items-center px-2">
                <span className="text-amber-300 truncate">{subtitleText}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Edit History Panel (Operations JSON Stack) */}
        <div className="w-80 bg-[#080B14]/90 border-l border-white/[0.08] flex flex-col">
          <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <History className="w-3.5 h-3.5 text-purple-400" /> Edit History & Operations
            </h3>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
              {operations.length} Actions
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {operations.map((op, idx) => (
              <div
                key={op.id}
                className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs space-y-1 hover:border-purple-500/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    {op.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{op.timestamp}</span>
                </div>
                {op.details && (
                  <pre className="text-[10px] text-cyan-300/80 bg-black/40 p-1.5 rounded-lg overflow-x-auto font-mono">
                    {JSON.stringify(op.details)}
                  </pre>
                )}
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-white/[0.08] bg-[#05070E]">
            <p className="text-[11px] text-slate-400 leading-snug">
              Every timeline operation is stored as a persistent JSON command ready for FFmpeg cluster execution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
