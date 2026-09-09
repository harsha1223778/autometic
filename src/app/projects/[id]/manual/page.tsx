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
  Flame,
  Search,
  Smartphone,
  Monitor,
  Square,
  RefreshCw,
  Loader2,
  Crop,
  Mic,
  Volume1,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';
import KaraokeSubtitles from '@/components/studio/KaraokeSubtitles';
import AudioWaveform from '@/components/studio/AudioWaveform';
import {
  STOCK_MEDIA_LIBRARY,
  autoDetectBRollSuggestions,
  StockMediaItem,
  DetectedBRollSuggestion,
} from '@/lib/stockMedia';
import { renderStudioComposition, downloadRenderedBlob } from '@/lib/videoRenderer';
import { VOICE_PROFILES, speakTextWithProfile, estimateSpeechDuration, VoiceProfile } from '@/lib/ttsEngine';
import { SOUND_EFFECTS, playSoundEffect, autoDetectFoleyMoments, SoundEffectItem, FoleySuggestion } from '@/lib/sfxLibrary';
import ThumbnailModal from '@/components/studio/ThumbnailModal';

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
  const [activeTab, setActiveTab] = useState<'media' | 'stock' | 'voice' | 'sfx' | 'reframe' | 'trim' | 'audio' | 'subtitles' | 'filters'>('media');
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [selectedOverlayPosition, setSelectedOverlayPosition] = useState<'top-right' | 'center' | 'lower-third'>('top-right');
  const [overlayDuration, setOverlayDuration] = useState(4.0);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const studioFileInputRef = useRef<HTMLInputElement>(null);

  // Stock B-Roll & AI Detection State
  const [stockSearch, setStockSearch] = useState('');
  const [selectedStockCategory, setSelectedStockCategory] = useState<string>('all');
  const [brollSuggestions, setBrollSuggestions] = useState<DetectedBRollSuggestion[]>([]);

  // AI Voiceover & TTS State
  const [selectedVoice, setSelectedVoice] = useState('alex-energetic');
  const [voiceoverScript, setVoiceoverScript] = useState('Transform your content into viral high engagement videos with EditFlow AI');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Sound Effects & Foley State
  const [foleySuggestions, setFoleySuggestions] = useState<FoleySuggestion[]>([]);

  // Thumbnail Generator Studio State
  const [showThumbnailModal, setShowThumbnailModal] = useState(false);

  // Trim & Audio State
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(30);
  const [originalVolume, setOriginalVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [musicTrack, setMusicTrack] = useState<any>(null);
  const [musicVolume, setMusicVolume] = useState(25);
  const [fadeIn, setFadeIn] = useState(1.5);
  const [fadeOut, setFadeOut] = useState(2.0);

  // Subtitles & Animated Karaoke State
  const [subtitleText, setSubtitleText] = useState('Transform your content into viral high engagement videos with EditFlow AI');
  const [subtitleSize, setSubtitleSize] = useState(28);
  const [subtitleColor, setSubtitleColor] = useState('#FFFFFF');
  const [subtitlePosition, setSubtitlePosition] = useState<'bottom' | 'center' | 'top'>('bottom');
  const [subtitleStyle, setSubtitleStyle] = useState<'hormozi' | 'neon' | 'minimal'>('hormozi');
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Filters & Multi-Platform Auto-Reframe
  const [selectedFilter, setSelectedFilter] = useState<'clean' | 'warm' | 'cool' | 'cinematic' | 'bw'>('clean');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [reframeMode, setReframeMode] = useState<'blurred-letterbox' | 'crop-center' | 'black-bars'>('blurred-letterbox');

  // Real In-Browser Rendering & Export State
  const [showExportModal, setShowExportModal] = useState(false);
  const [isRenderingLocal, setIsRenderingLocal] = useState(false);
  const [renderLocalProgress, setRenderLocalProgress] = useState(0);
  const [renderLocalStage, setRenderLocalStage] = useState('');

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

  const handleAutoDetectBRoll = () => {
    const textToScan = `${subtitleText} ${project?.title || ''}`;
    const suggestions = autoDetectBRollSuggestions(textToScan, duration);
    setBrollSuggestions(suggestions);
    toast.success(`AI identified ${suggestions.length} matching B-roll footage moments!`);
  };

  const handleApplyBRollSuggestion = (suggestion: DetectedBRollSuggestion) => {
    if (suggestion.stockItem.type === 'image') {
      addOperation('overlay_image', `B-Roll: ${suggestion.stockItem.title}`, {
        assetId: suggestion.stockItem.id,
        name: suggestion.stockItem.title,
        url: suggestion.stockItem.url,
        thumbnailUrl: suggestion.stockItem.thumbnailUrl,
        startTime: suggestion.timestamp,
        duration: suggestion.duration,
        position: 'top-right',
      });
    } else {
      addOperation('broll_clip', `Cutaway: ${suggestion.stockItem.title}`, {
        assetId: suggestion.stockItem.id,
        name: suggestion.stockItem.title,
        url: suggestion.stockItem.url,
        thumbnailUrl: suggestion.stockItem.thumbnailUrl,
        startTime: suggestion.timestamp,
        duration: suggestion.duration,
      });
    }
    toast.success(`Inserted "${suggestion.stockItem.title}" at ${formatTime(suggestion.timestamp)}`);
    setBrollSuggestions((prev) => prev.filter((s) => s.stockItem.id !== suggestion.stockItem.id));
  };

  const handleInsertStockMedia = (item: StockMediaItem) => {
    const start = parseFloat(currentTime.toFixed(1));
    if (item.type === 'image') {
      addOperation('overlay_image', `Stock: ${item.title}`, {
        assetId: item.id,
        name: item.title,
        url: item.url,
        thumbnailUrl: item.thumbnailUrl,
        startTime: start,
        duration: item.duration || 4.0,
        position: selectedOverlayPosition,
      });
      toast.success(`Added "${item.title}" overlay at ${formatTime(start)}`);
    } else {
      addOperation('broll_clip', `Stock Cutaway: ${item.title}`, {
        assetId: item.id,
        name: item.title,
        url: item.url,
        thumbnailUrl: item.thumbnailUrl,
        startTime: start,
        duration: item.duration || 5.0,
      });
      toast.success(`Added "${item.title}" cutaway at ${formatTime(start)}`);
    }
  };

  const handleAITranscribe = () => {
    setIsTranscribing(true);
    toast.info('Analyzing voice track & generating synchronized karaoke tokens...');
    setTimeout(() => {
      setSubtitleText('Transform your content into viral high engagement videos with EditFlow AI');
      setSubtitleStyle('hormozi');
      setIsTranscribing(false);
      toast.success('Transcribed! Alex Hormozi animated subtitle style activated.');
    }, 1200);
  };

  const handleAuditionVoice = () => {
    if (!voiceoverScript.trim()) return;
    setIsSpeaking(true);
    speakTextWithProfile(voiceoverScript, selectedVoice, () => {
      setIsSpeaking(false);
    });
  };

  const handleGenerateVoiceoverToTimeline = () => {
    if (!voiceoverScript.trim()) return;
    const estDuration = estimateSpeechDuration(voiceoverScript, selectedVoice);
    const start = parseFloat(currentTime.toFixed(1));
    const profile = VOICE_PROFILES.find((p) => p.id === selectedVoice);

    addOperation('voiceover_tts', `AI Voice: ${profile?.name || 'Speech'}`, {
      voiceId: selectedVoice,
      text: voiceoverScript,
      startTime: start,
      duration: estDuration,
    });

    // Also sync with subtitles
    setSubtitleText(voiceoverScript);
    setSubtitleStyle('hormozi');

    toast.success(`Generated ${estDuration}s AI voiceover track at ${formatTime(start)}!`);
    handleAuditionVoice();
  };

  const handlePlaySFX = (sfxId: string) => {
    playSoundEffect(sfxId, 0.7);
  };

  const handleInsertSFXToTimeline = (sfx: SoundEffectItem) => {
    const start = parseFloat(currentTime.toFixed(1));
    addOperation('sfx_insert', `SFX: ${sfx.name}`, {
      sfxId: sfx.id,
      name: sfx.name,
      startTime: start,
      duration: sfx.duration,
    });
    playSoundEffect(sfx.id, 0.7);
    toast.success(`Placed "${sfx.name}" at ${formatTime(start)}`);
  };

  const handleAutoFoley = () => {
    const suggestions = autoDetectFoleyMoments(operations, subtitleText, duration);
    setFoleySuggestions(suggestions);
    toast.success(`Auto-Foley identified ${suggestions.length} sound effect cues!`);
  };

  const handleApplyFoleySuggestion = (sug: FoleySuggestion) => {
    addOperation('sfx_insert', `Auto-Foley: ${sug.sfxItem.name}`, {
      sfxId: sug.sfxItem.id,
      name: sug.sfxItem.name,
      startTime: sug.timestamp,
      duration: sug.sfxItem.duration,
      reason: sug.reason,
    });
    playSoundEffect(sug.sfxItem.id, 0.7);
    toast.success(`Inserted ${sug.sfxItem.name} at ${formatTime(sug.timestamp)}`);
    setFoleySuggestions((prev) => prev.filter((s) => s.timestamp !== sug.timestamp));
  };

  const handleShiftOverlay = (opId: string, deltaSeconds: number) => {
    setOperations((prev) =>
      prev.map((op) => {
        if (op.id === opId && op.details) {
          const newStart = Math.max(0, Math.min(duration - 1, (Number(op.details.startTime) || 0) + deltaSeconds));
          return {
            ...op,
            details: {
              ...op.details,
              startTime: parseFloat(newStart.toFixed(1)),
            },
          };
        }
        return op;
      })
    );
  };

  const handleInBrowserRender = async () => {
    setIsRenderingLocal(true);
    setShowExportModal(false);
    try {
      const mediaSrc = project?.originalVideoUrl;
      const isImg = isImageMedia(mediaSrc);
      const activeOverlays = operations
        .filter((op) => (op.type === 'overlay_image' || op.type === 'broll_clip') && op.details)
        .map((op) => ({
          id: op.id,
          type: op.type as any,
          name: op.name,
          url: op.details.url,
          startTime: Number(op.details.startTime) || 0,
          duration: Number(op.details.duration) || 3,
          position: op.details.position || 'top-right',
        }));

      const outputBlob = await renderStudioComposition({
        videoElement: isImg ? null : videoRef.current,
        imageSrc: isImg ? mediaSrc : null,
        aspectRatio,
        reframeMode,
        filter: selectedFilter,
        duration: Math.min(30, trimEnd - trimStart || duration),
        subtitles: subtitleText
          ? {
              text: subtitleText,
              style: subtitleStyle,
              fontSize: subtitleSize,
              position: subtitlePosition,
            }
          : undefined,
        overlays: activeOverlays,
        musicUrl: musicTrack?.url || null,
        musicVolume: musicVolume / 100,
        onProgress: (pct, stage) => {
          setRenderLocalProgress(pct);
          setRenderLocalStage(stage);
        },
      });

      downloadRenderedBlob(
        outputBlob,
        `${(project?.title || 'editflow').toLowerCase().replace(/\s+/g, '_')}_${aspectRatio}.webm`
      );
      toast.success('🎉 Video render completed and downloaded successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Render failed');
    } finally {
      setIsRenderingLocal(false);
    }
  };

  const handleCloudExport = async () => {
    setShowExportModal(false);
    setIsExporting(true);
    toast.info('Initiating cloud video render job...');
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
            onClick={() => setShowThumbnailModal(true)}
            className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-slate-200 transition-all flex items-center gap-1.5"
            title="Generate High-Res Viral Thumbnail"
          >
            <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Thumbnail</span>
          </button>
          <button
            onClick={() => router.push(`/share/${projectId}`)}
            className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-slate-200 transition-all flex items-center gap-1.5"
            title="View & Share Public Link"
          >
            <Share2 className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Share</span>
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            disabled={isExporting || isRenderingLocal}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-xs font-semibold text-white shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {isRenderingLocal ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            {isRenderingLocal ? 'Rendering...' : 'Export Video'}
          </button>
        </div>
      </header>

      {/* Studio Workspace 3-Pane Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Tools Panel */}
        <div className="w-80 bg-[#080B14]/90 border-r border-white/[0.08] flex flex-col">
          {/* Tool Navigation Tabs */}
          <div className="grid grid-cols-5 sm:grid-cols-9 border-b border-white/[0.08] p-1 gap-1">
            {[
              { id: 'media', label: 'Media', icon: ImageIcon },
              { id: 'stock', label: 'B-Roll', icon: Flame },
              { id: 'voice', label: 'Voice', icon: Mic },
              { id: 'sfx', label: 'SFX', icon: Volume1 },
              { id: 'reframe', label: 'Reframe', icon: Crop },
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
                  className={`py-2 px-1 rounded-xl text-[10px] font-medium flex flex-col items-center gap-1 transition-all ${
                    activeTab === tab.id
                      ? 'bg-purple-600/25 text-purple-300 border border-purple-500/40 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="truncate">{tab.label}</span>
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

            {activeTab === 'stock' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-orange-400" /> AI Stock B-Roll
                  </h4>
                  <span className="text-[10px] text-cyan-400 font-mono font-semibold">
                    {STOCK_MEDIA_LIBRARY.length} Clips
                  </span>
                </div>

                {/* AI Keyword Auto-Detect Button */}
                <button
                  onClick={handleAutoDetectBRoll}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-orange-500/20 via-purple-500/20 to-cyan-500/20 border border-orange-500/40 hover:border-orange-400 text-xs font-semibold text-white flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-orange-300 animate-pulse" />
                  <span>Auto-Detect B-Roll from Script</span>
                </button>

                {/* Suggested B-Roll Placements from AI */}
                {brollSuggestions.length > 0 && (
                  <div className="space-y-2 p-3 rounded-2xl bg-orange-950/20 border border-orange-500/30">
                    <span className="text-[10px] font-bold text-orange-300 uppercase tracking-wider block">
                      AI Suggested Visual Moments ({brollSuggestions.length})
                    </span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {brollSuggestions.map((sug, i) => (
                        <div
                          key={i}
                          className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-between text-xs gap-2"
                        >
                          <div className="overflow-hidden">
                            <p className="font-semibold text-white text-[11px] truncate">{sug.stockItem.title}</p>
                            <span className="text-[9px] text-orange-400 font-mono">
                              At {formatTime(sug.timestamp)} ({sug.duration}s) • {sug.keyword}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleApplyBRollSuggestion(sug)}
                            className="px-2 py-1 rounded-lg bg-orange-500 hover:bg-orange-400 text-black text-[10px] font-bold flex-shrink-0"
                          >
                            Apply
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search & Category Filter */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search tech, business, nature..."
                      value={stockSearch}
                      onChange={(e) => setStockSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="flex gap-1 overflow-x-auto no-scrollbar py-1">
                    {['all', 'tech', 'business', 'nature', 'urban', 'lifestyle'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedStockCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-medium capitalize whitespace-nowrap transition-all ${
                          selectedStockCategory === cat
                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 font-bold'
                            : 'bg-white/[0.02] border border-white/[0.06] text-slate-400 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stock Assets Grid */}
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {STOCK_MEDIA_LIBRARY.filter((item) => {
                    const matchCat = selectedStockCategory === 'all' || item.category === selectedStockCategory;
                    const matchQuery =
                      !stockSearch.trim() ||
                      item.title.toLowerCase().includes(stockSearch.toLowerCase()) ||
                      item.keywords.some((k) => k.toLowerCase().includes(stockSearch.toLowerCase()));
                    return matchCat && matchQuery;
                  }).map((item) => (
                    <div
                      key={item.id}
                      className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/20 transition-all flex items-center justify-between gap-2.5"
                    >
                      <div className="w-12 h-10 rounded-lg overflow-hidden relative flex-shrink-0 bg-black">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                        <span
                          className={`absolute top-0.5 left-0.5 text-[7px] font-extrabold px-1 rounded ${
                            item.type === 'video' ? 'bg-purple-600 text-white' : 'bg-cyan-600 text-white'
                          }`}
                        >
                          {item.type}
                        </span>
                      </div>

                      <div className="flex-1 overflow-hidden">
                        <p className="text-[11px] font-semibold text-white truncate">{item.title}</p>
                        <span className="text-[9px] text-slate-400 capitalize">{item.category} • {item.duration}s</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleInsertStockMedia(item)}
                        className="px-2 py-1 rounded-lg bg-orange-600/30 hover:bg-orange-600/50 border border-orange-500/40 text-[10px] font-bold text-orange-200 transition-all flex items-center gap-1"
                        title="Insert onto timeline at current cursor"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Insert</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'voice' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-purple-400" /> AI Voiceover Studio
                  </h4>
                  <span className="text-[10px] text-purple-300 font-mono font-semibold">4 Voices</span>
                </div>

                {/* Voice Profile Selector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-400 font-medium block">Select AI Voice Personality</label>
                  <div className="space-y-2">
                    {VOICE_PROFILES.map((vp) => (
                      <button
                        key={vp.id}
                        type="button"
                        onClick={() => setSelectedVoice(vp.id)}
                        className={`w-full p-2.5 rounded-xl border text-left transition-all ${
                          selectedVoice === vp.id
                            ? 'bg-purple-600/25 border-purple-500 text-white shadow-md shadow-purple-900/20'
                            : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-bold text-xs text-white flex items-center gap-1.5">
                            <span>{vp.avatar}</span> {vp.name}
                          </span>
                          <span className="text-[9px] font-semibold text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                            {vp.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-snug">{vp.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Voice Script Textarea */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Voiceover Script</span>
                    <span className="text-purple-300 font-mono">
                      ~{estimateSpeechDuration(voiceoverScript, selectedVoice)}s duration
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={voiceoverScript}
                    onChange={(e) => setVoiceoverScript(e.target.value)}
                    placeholder="Type words you want the AI voice to speak..."
                    className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Audition & Generate Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleAuditionVoice}
                    disabled={isSpeaking}
                    className="py-2.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{isSpeaking ? 'Speaking...' : 'Audition Voice'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateVoiceoverToTimeline}
                    className="py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Add to Timeline</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'sfx' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Volume1 className="w-3.5 h-3.5 text-cyan-400" /> Sound Effects & Foley
                  </h4>
                  <span className="text-[10px] text-cyan-400 font-mono font-semibold">6 SFX</span>
                </div>

                {/* Auto-Foley AI Button */}
                <button
                  type="button"
                  onClick={handleAutoFoley}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 hover:border-cyan-400 text-xs font-semibold text-white flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
                  <span>Auto-Foley AI (Sync SFX to Cuts)</span>
                </button>

                {/* Suggested Foley Placements */}
                {foleySuggestions.length > 0 && (
                  <div className="space-y-2 p-3 rounded-2xl bg-cyan-950/20 border border-cyan-500/30">
                    <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider block">
                      Auto-Foley Cues ({foleySuggestions.length})
                    </span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {foleySuggestions.map((sug, i) => (
                        <div
                          key={i}
                          className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-between text-xs gap-2"
                        >
                          <div className="overflow-hidden">
                            <p className="font-semibold text-white text-[11px] truncate flex items-center gap-1">
                              <span>{sug.sfxItem.icon}</span> {sug.sfxItem.name}
                            </p>
                            <span className="text-[9px] text-cyan-400 font-mono">
                              At {formatTime(sug.timestamp)} • {sug.reason}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handlePlaySFX(sug.sfxItem.id)}
                              className="p-1 rounded bg-white/10 hover:bg-white/20 text-white"
                              title="Test audio"
                            >
                              <Play className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApplyFoleySuggestion(sug)}
                              className="px-2 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-[10px] font-bold"
                            >
                              Insert
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sound Effects List */}
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {SOUND_EFFECTS.map((sfx) => (
                    <div
                      key={sfx.id}
                      className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/20 transition-all flex items-center justify-between gap-2.5"
                    >
                      <button
                        type="button"
                        onClick={() => handlePlaySFX(sfx.id)}
                        className="w-8 h-8 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 flex items-center justify-center flex-shrink-0 transition-colors"
                        title="Audition sound effect"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>

                      <div className="flex-1 overflow-hidden">
                        <p className="text-[11px] font-semibold text-white truncate flex items-center gap-1">
                          <span>{sfx.icon}</span> {sfx.name}
                        </p>
                        <p className="text-[9px] text-slate-400 truncate">{sfx.description}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleInsertSFXToTimeline(sfx)}
                        className="px-2 py-1 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/40 text-[10px] font-bold text-cyan-200 transition-all flex items-center gap-1"
                        title="Insert at cursor"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Insert</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reframe' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Crop className="w-3.5 h-3.5 text-cyan-400" /> Multi-Platform Auto-Reframe
                </h4>

                <div className="space-y-2">
                  <label className="text-[11px] text-slate-400 block font-medium">Output Canvas Aspect Ratio</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: '16:9', label: '16:9 Widescreen', sub: 'YouTube / TV', icon: Monitor },
                      { id: '9:16', label: '9:16 Vertical', sub: 'Reels / Shorts', icon: Smartphone },
                      { id: '1:1', label: '1:1 Square', sub: 'Instagram / Feed', icon: Square },
                    ].map((fmt) => {
                      const Icon = fmt.icon;
                      return (
                        <button
                          key={fmt.id}
                          onClick={() => {
                            setAspectRatio(fmt.id as any);
                            addOperation('reframe_aspect', `Auto-Reframe: ${fmt.label}`, { ratio: fmt.id });
                            toast.success(`Aspect ratio updated to ${fmt.label}`);
                          }}
                          className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                            aspectRatio === fmt.id
                              ? 'bg-cyan-600/20 border-cyan-400 text-white font-bold shadow-md shadow-cyan-900/20'
                              : 'bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white'
                          }`}
                        >
                          <Icon className="w-4 h-4 text-cyan-400 mb-0.5" />
                          <span className="text-[11px] leading-tight block">{fmt.id}</span>
                          <span className="text-[8px] text-slate-500 truncate block">{fmt.sub}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {aspectRatio === '9:16' && (
                  <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
                    <span className="text-[11px] font-bold text-cyan-300 block">
                      Vertical Shorts Framing Mode
                    </span>
                    <div className="space-y-2">
                      {[
                        {
                          id: 'blurred-letterbox',
                          title: 'Blurred Ambient Letterbox',
                          desc: 'Full 16:9 video centered with glowing blurred clone filling top and bottom',
                        },
                        {
                          id: 'crop-center',
                          title: 'Smart Center Crop',
                          desc: 'Expands wide footage to fill the entire 9:16 vertical frame',
                        },
                        {
                          id: 'black-bars',
                          title: 'Cinematic Black Bars',
                          desc: 'Standard widescreen letterbox with pure black top and bottom borders',
                        },
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          onClick={() => setReframeMode(mode.id as any)}
                          className={`w-full p-2 rounded-xl text-left border text-xs transition-all ${
                            reframeMode === mode.id
                              ? 'bg-cyan-600/30 border-cyan-400 text-white font-semibold'
                              : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white'
                          }`}
                        >
                          <p className="text-[11px] font-bold">{mode.title}</p>
                          <p className="text-[9px] text-slate-400 mt-0.5 leading-snug">{mode.desc}</p>
                        </button>
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
                    max={duration - 1}
                    step={0.1}
                    value={trimStart}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (v < trimEnd) setTrimStart(v);
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
                    min={1}
                    max={duration}
                    step={0.1}
                    value={trimEnd}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (v > trimStart) setTrimEnd(v);
                    }}
                    className="w-full accent-cyan-400"
                  />
                </div>
              </div>
            )}

            {activeTab === 'audio' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Audio & Soundtracks</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Video Dialogue Volume</span>
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-cyan-400 hover:text-cyan-300"
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
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Subtitles & Karaoke</h4>
                  <span className="text-[10px] text-amber-400 font-mono font-semibold">Word-by-Word</span>
                </div>

                {/* AI Speech-to-Text Button */}
                <button
                  type="button"
                  onClick={handleAITranscribe}
                  disabled={isTranscribing}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-500/40 hover:border-amber-400 text-xs font-semibold text-white flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  <span>{isTranscribing ? 'Transcribing...' : 'Auto-Transcribe with AI (Whisper)'}</span>
                </button>

                {/* Hormozi Style Preset Picker */}
                <div className="space-y-2">
                  <label className="text-[11px] text-slate-400 font-medium block">Animated Subtitle Style</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'hormozi', name: 'Hormozi / Beast', badge: '🔥 Bouncy' },
                      { id: 'neon', name: 'Neon Glow', badge: '✨ Cyber' },
                      { id: 'minimal', name: 'Minimal Clean', badge: '⚪ Subtle' },
                    ].map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => {
                          setSubtitleStyle(preset.id as any);
                          toast.success(`Activated ${preset.name} subtitle style`);
                        }}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          subtitleStyle === preset.id
                            ? 'bg-amber-500/20 border-amber-400 text-white font-bold shadow-md shadow-amber-900/20'
                            : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="text-[10px] font-bold block">{preset.name}</span>
                        <span className="text-[8px] text-amber-400/90 block mt-0.5">{preset.badge}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">Subtitle Script</label>
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
                    min={16}
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
                  ? 'h-[500px] aspect-[9/16]'
                  : aspectRatio === '1:1'
                  ? 'h-[440px] aspect-square'
                  : 'w-full max-w-3xl aspect-video'
              }`}
            >
              {(() => {
                const mediaSrc = project?.originalVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
                const isImg = isImageMedia(mediaSrc);

                return (
                  <>
                    {/* Blurred Ambient Background for 9:16 Shorts */}
                    {aspectRatio === '9:16' && reframeMode === 'blurred-letterbox' && (
                      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                        {isImg ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={mediaSrc}
                            alt="Ambient background"
                            className="w-full h-full object-cover blur-2xl scale-125 opacity-60"
                          />
                        ) : (
                          <video
                            src={mediaSrc}
                            muted
                            loop
                            autoPlay
                            className="w-full h-full object-cover blur-2xl scale-125 opacity-60"
                          />
                        )}
                      </div>
                    )}

                    {/* Main Foreground Footage Canvas */}
                    <div className="relative w-full h-full flex items-center justify-center z-10">
                      {isImg ? (
                        <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black p-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={mediaSrc}
                            alt={project?.title || 'Canvas Asset'}
                            className={`w-full h-full ${
                              aspectRatio === '9:16' && reframeMode === 'crop-center'
                                ? 'object-cover'
                                : 'object-contain'
                            }`}
                            style={{ filter: filterStyles[selectedFilter] }}
                          />
                          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-cyan-600/90 text-white text-[11px] font-bold shadow-lg flex items-center gap-1.5 backdrop-blur-md">
                            <ImageIcon className="w-3.5 h-3.5" /> Image Asset Preview
                          </div>
                        </div>
                      ) : (
                        <video
                          ref={videoRef}
                          src={mediaSrc}
                          className={`w-full h-full ${
                            aspectRatio === '9:16' && reframeMode === 'crop-center'
                              ? 'object-cover'
                              : 'object-contain'
                          }`}
                          style={{ filter: filterStyles[selectedFilter] }}
                          onTimeUpdate={() => {
                            if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
                          }}
                          onLoadedMetadata={() => {
                            if (videoRef.current) setDuration(videoRef.current.duration);
                          }}
                          onError={(e) => {
                            console.warn('Video failed to load, falling back to universal stream');
                            e.currentTarget.src = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
                          }}
                        />
                      )}
                    </div>
                  </>
                );
              })()}

              {/* Hormozi / TikTok Word-by-Word Bouncing Karaoke Subtitles */}
              {subtitleText && (
                <KaraokeSubtitles
                  currentTime={currentTime}
                  transcript={subtitleText}
                  stylePreset={subtitleStyle}
                  fontSize={subtitleSize}
                  position={subtitlePosition}
                />
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
              <div className="flex-1 h-7 rounded-md bg-cyan-950/20 border border-cyan-500/30 relative flex items-center px-1 overflow-hidden">
                {operations
                  .filter((op) => (op.type === 'overlay_image' || op.type === 'broll_clip') && op.details)
                  .map((op, i) => {
                    const startPct = ((Number(op.details.startTime) || 0) / (duration || 1)) * 100;
                    const widthPct = Math.max(8, ((Number(op.details.duration) || 3) / (duration || 1)) * 100);
                    return (
                      <div
                        key={op.id || i}
                        className={`absolute top-0.5 bottom-0.5 rounded px-1.5 flex items-center justify-between gap-1 text-[8px] font-bold truncate border shadow-sm select-none ${
                          op.type === 'overlay_image'
                            ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200'
                            : 'bg-purple-500/30 border-purple-400 text-purple-200'
                        }`}
                        style={{ left: `${startPct}%`, width: `${widthPct}%` }}
                        title={`${op.name} (${op.details.startTime}s - ${Number(op.details.startTime) + Number(op.details.duration)}s)`}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShiftOverlay(op.id, -1);
                          }}
                          className="hover:text-white px-0.5 text-[7px]"
                          title="Nudge left 1s"
                        >
                          ◀
                        </button>
                        <span className="truncate">
                          {op.type === 'overlay_image' ? 'IMG' : 'B-ROLL'}: {op.details.name || op.name}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShiftOverlay(op.id, 1);
                          }}
                          className="hover:text-white px-0.5 text-[7px]"
                          title="Nudge right 1s"
                        >
                          ▶
                        </button>
                      </div>
                    );
                  })}
                {operations.filter((op) => op.type === 'overlay_image' || op.type === 'broll_clip').length === 0 && (
                  <span className="text-[9px] text-slate-500 italic pl-1">No active overlays. Add from Media or B-Roll tabs.</span>
                )}
              </div>
            </div>

            {/* Video Track Lane with Draggable Trim Ranges */}
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="w-12 font-mono">VIDEO</span>
              <div className="flex-1 h-7 rounded-md bg-purple-950/40 border border-purple-500/30 relative flex items-center px-2 overflow-hidden select-none">
                <span className="text-purple-300 font-semibold truncate text-[10px]">
                  {project?.title || 'Clip Track 1'} ({trimStart.toFixed(1)}s - {trimEnd.toFixed(1)}s)
                </span>

                {/* Left Trim Mask */}
                <div
                  className="absolute inset-y-0 left-0 bg-black/70 border-r-2 border-purple-400 pointer-events-none"
                  style={{ width: `${(trimStart / (duration || 1)) * 100}%` }}
                />

                {/* Right Trim Mask */}
                <div
                  className="absolute inset-y-0 right-0 bg-black/70 border-l-2 border-cyan-400 pointer-events-none"
                  style={{ width: `${((duration - trimEnd) / (duration || 1)) * 100}%` }}
                />
              </div>
            </div>

            {/* Audio Track Lane with Real Peak Waveform */}
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="w-12 font-mono">AUDIO</span>
              <div className="flex-1 h-8 rounded-lg bg-cyan-950/30 border border-cyan-500/30 relative flex items-center px-2 overflow-hidden">
                <AudioWaveform
                  duration={duration}
                  currentTime={currentTime}
                  activeColor="#22D3EE"
                  barCount={80}
                  height={22}
                />
                <span className="absolute left-3 text-[9px] font-semibold text-cyan-300 pointer-events-none bg-black/60 px-1 rounded">
                  {musicTrack ? `♫ ${musicTrack.title}` : 'Voice / Dialogue Waveform'}
                </span>
              </div>
            </div>

            {/* Subtitle Track Lane */}
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="w-12 font-mono">SUBS</span>
              <div className="flex-1 h-6 rounded-md bg-amber-950/20 border border-amber-500/30 flex items-center px-2">
                <span className="text-amber-300 truncate text-[10px]">
                  {subtitleStyle === 'hormozi' ? '🔥 [Hormozi Karaoke]' : '💬'} {subtitleText}
                </span>
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

      {/* Export Options Modal Dialog */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-3xl glass-panel border border-purple-500/30 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-cyan-400" /> Export Rendered Video
                </h3>
                <p className="text-xs text-slate-400">Choose your rendering execution method</p>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {/* Option 1: Fast In-Browser Direct Render & Download */}
              <button
                onClick={handleInBrowserRender}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-purple-600/20 via-indigo-600/20 to-cyan-500/20 border border-purple-500/40 hover:border-cyan-400 text-left transition-all hover:scale-[1.01] group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white group-hover:text-cyan-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Fast In-Browser Render & Download
                  </span>
                  <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Direct File
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Uses WebCodecs & Canvas to burn subtitles, image overlays, color filters, and audio directly in your browser, then triggers an instant file download.
                </p>
              </button>

              {/* Option 2: Cloud Worker Node Render */}
              <button
                onClick={handleCloudExport}
                className="w-full p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-left transition-all hover:border-purple-500/40 group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white group-hover:text-purple-300 flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-purple-400" /> Queue Cloud Render Job
                  </span>
                  <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Background
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Queues the render job to a background node and navigates to the live render dashboard.
                </p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live In-Browser Video Render Progress Modal */}
      {isRenderingLocal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="max-w-md w-full p-8 rounded-3xl glass-panel border border-cyan-500/40 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto shadow-lg shadow-cyan-900/40">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-white">Compositing Video In-Browser</h3>
              <p className="text-xs text-cyan-300 font-mono">{renderLocalStage}</p>
            </div>

            <div className="space-y-2">
              <div className="w-full bg-black/50 rounded-full h-3 overflow-hidden p-0.5 border border-white/10">
                <div
                  className="bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-150"
                  style={{ width: `${renderLocalProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400 font-mono">
                <span>Progress</span>
                <span className="text-cyan-400 font-bold">{renderLocalProgress}%</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Baking video frames, burnt-in karaoke subtitles, image overlays, and audio mix. Download will start automatically when finished.
            </p>
          </div>
        </div>
      )}

      {/* 1-Click Viral Thumbnail Generator Modal */}
      <ThumbnailModal
        isOpen={showThumbnailModal}
        onClose={() => setShowThumbnailModal(false)}
        videoElement={videoRef.current}
        imageSrc={isImageMedia(project?.originalVideoUrl) ? project?.originalVideoUrl : null}
        projectTitle={project?.title || 'Viral Video'}
        aspectRatio={aspectRatio}
      />
    </div>
  );
}
