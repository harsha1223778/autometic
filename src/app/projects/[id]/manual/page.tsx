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
  FileText,
  Move,
  Zap,
  Radio,
  Gauge,
  TrendingUp,
  Copy,
  BookOpen,
  CheckCircle2,
  AtSign,
  Video as VideoIcon,
  Keyboard,
  SlidersHorizontal,
  Smile,
  Activity,
  Globe,
  Flag,
  Shield,
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
import BatchExportModal from '@/components/studio/BatchExportModal';
import { detectMediaSilences, calculateJumpCutSegments, calculateDeadAirSaved, SilenceInterval } from '@/lib/silenceDetector';
import { generateViralScript, HOOK_FRAMEWORKS, SCRIPT_CATEGORIES, PRESET_TOPICS, GeneratedScript } from '@/lib/scriptGenerator';
import { TRANSITION_PRESETS, MOTION_PRESETS, TransitionPreset, MotionPreset } from '@/lib/transitions';
import {
  PROCEDURAL_MUSIC_TRACKS,
  startProceduralMusic,
  stopProceduralMusic,
  setProceduralMusicVolume,
  setProceduralMusicDucking,
} from '@/lib/musicSynthesizer';
import { generateVideoSEOAndChapters, SEOMetadata, ChapterItem } from '@/lib/chapterGenerator';
import { ChromaKeyOptions, DEFAULT_CHROMA_KEY_OPTIONS } from '@/lib/chromaKey';
import { SPEED_RAMP_PRESETS, calculateInstantPlaybackRate, applyPlaybackSpeed, SpeedRampPreset } from '@/lib/speedRamp';
import { evaluateViralityScore, ViralityReport } from '@/lib/viralityCoach';
import MultiClipSequencer, { SequenceClip } from '@/components/studio/MultiClipSequencer';
import { CALLOUT_PRESETS, ActiveCallout, CalloutPreset } from '@/lib/callouts';
import RecordingStudioModal from '@/components/studio/RecordingStudioModal';
import {
  COLOR_LUT_PRESETS,
  ColorLUTPreset,
  ColorAdjustments,
  DEFAULT_COLOR_ADJUSTMENTS,
  buildCompositeFilterString,
} from '@/lib/colorGrading';
import KeyboardShortcutsModal from '@/components/studio/KeyboardShortcutsModal';
import {
  getProjectSnapshots,
  saveProjectSnapshot,
  deleteProjectSnapshot,
  ProjectSnapshot,
} from '@/lib/versionHistory';
import AudioMixerModal from '@/components/studio/AudioMixerModal';
import SocialPublisherModal from '@/components/studio/SocialPublisherModal';
import { AudioMixerState, DEFAULT_MIXER_STATE } from '@/lib/audioMixer';
import { KEN_BURNS_PRESETS, calculateSmartBRollCues } from '@/lib/kenBurns';
import {
  STICKER_LIBRARY,
  ActiveSticker,
  scanTranscriptForStickerTriggers,
  StickerItem,
} from '@/lib/stickerEngine';
import { generateRetentionHeatmap, RetentionAnalysisReport } from '@/lib/retentionHeatmap';
import { VOICE_PROFILES as VOICE_ISOLATOR_PROFILES, buildVoiceFilterGraph } from '@/lib/voiceIsolator';
import { SPLIT_SCREEN_LAYOUTS, renderSplitScreenComposite } from '@/lib/splitScreen';
import { SHAKE_PRESETS, calculateCameraShakeOffset } from '@/lib/motionBlur';
import WebhookHubModal from '@/components/studio/WebhookHubModal';
import { STORYBOARD_FRAMEWORKS, generateStoryboard, convertStoryboardToTimelineOperations, StoryboardScene } from '@/lib/storyboardDirector';
import { extractViralHighlights, ExtractedHighlight } from '@/lib/momentExtractor';
import { BrandKit, DEFAULT_BRAND_KIT, getStoredBrandKit } from '@/lib/brandKit';
import BrandKitModal from '@/components/studio/BrandKitModal';
import { SUPPORTED_LANGUAGES, translateTranscript } from '@/lib/translator';
import { TimelineMarker, MARKER_TYPES, getMarkerTypeMeta } from '@/lib/timelineMarkers';
import BatchRenderQueueModal from '@/components/studio/BatchRenderQueueModal';
import { generateAutoBrollInserts } from '@/lib/brollAutoInserter';
import { VoicePersona, VOICE_PERSONAS, DEFAULT_VOICE_PERSONA } from '@/lib/voicePersona';
import VoicePersonaModal from '@/components/studio/VoicePersonaModal';
import { VELOCITY_TRANSITION_PRESETS, VelocityTransitionPreset } from '@/lib/velocityTransitions';
import { SubtitleStyling, SUBTITLE_DESIGN_PRESETS, DEFAULT_SUBTITLE_STYLING, AVAILABLE_FONTS } from '@/lib/subtitleDesigner';
import { ExportMatrixSettings, EXPORT_MATRIX_PRESETS, DEFAULT_EXPORT_SETTINGS } from '@/lib/exportMatrix';
import ExportMatrixModal from '@/components/studio/ExportMatrixModal';

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
  const [activeTab, setActiveTab] = useState<'media' | 'stock' | 'sequence' | 'voice' | 'script' | 'sfx' | 'transitions' | 'callouts' | 'stickers' | 'retention' | 'speed' | 'chroma' | 'coach' | 'seo' | 'reframe' | 'trim' | 'audio' | 'subtitles' | 'filters' | 'history' | 'storyboard' | 'splitscreen' | 'shake' | 'highlights' | 'translate'>('media');
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

  // 1. AI Auto-Jumpcut & Silence Removal State
  const [detectedSilences, setDetectedSilences] = useState<SilenceInterval[]>([]);
  const [isDetectingSilences, setIsDetectingSilences] = useState(false);
  const [deadAirStats, setDeadAirStats] = useState<{ savedSeconds: number; percentSaved: number; newDuration: number } | null>(null);

  // 2. AI Video Hook & Script Generator State
  const [scriptTopic, setScriptTopic] = useState('How to automate video editing with AI');
  const [scriptCategory, setScriptCategory] = useState('Tech & AI');
  const [scriptFramework, setScriptFramework] = useState('curiosity-gap');
  const [generatedScript, setGeneratedScript] = useState<GeneratedScript | null>(null);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

  // 3. Motion Transitions & Visual FX State
  const [selectedTransition, setSelectedTransition] = useState('whip-pan');
  const [selectedMotionPreset, setSelectedMotionPreset] = useState('ken-burns');

  // 4. AI Procedural Music & Auto-Ducking State
  const [selectedProceduralTrack, setSelectedProceduralTrack] = useState<string | null>(null);
  const [isPlayingProcedural, setIsPlayingProcedural] = useState(false);
  const [autoDuckingEnabled, setAutoDuckingEnabled] = useState(true);
  const [proceduralVolume, setProceduralVolume] = useState(25);

  // 5. WebGL Chroma Key & Green Screen State
  const [chromaKeyOptions, setChromaKeyOptions] = useState<ChromaKeyOptions>(DEFAULT_CHROMA_KEY_OPTIONS);

  // 6. Speed Ramping State
  const [selectedSpeedRamp, setSelectedSpeedRamp] = useState('normal');

  // 7. Multi-Clip Sequencer State
  const [sequenceClips, setSequenceClips] = useState<SequenceClip[]>([]);
  const [activeSequenceClipId, setActiveSequenceClipId] = useState<string | undefined>(undefined);

  // 8. AI Chapter Markers & SEO State
  const [seoMetadata, setSeoMetadata] = useState<SEOMetadata | null>(null);
  const [isGeneratingSEO, setIsGeneratingSEO] = useState(false);

  // 9. AI Virality Score & Retention Coach State
  const [viralityReport, setViralityReport] = useState<ViralityReport | null>(null);

  // 10. Social Callouts & Lower-Thirds State
  const [selectedCalloutPreset, setSelectedCalloutPreset] = useState('social-youtube');
  const [calloutTitle, setCalloutTitle] = useState('Subscribe on YouTube');
  const [calloutSubtitle, setCalloutSubtitle] = useState('@channel');
  const [calloutPosition, setCalloutPosition] = useState<'bottom-left' | 'bottom-center' | 'bottom-right' | 'top-right'>('bottom-left');
  const [calloutDuration, setCalloutDuration] = useState(3.5);

  // 11. Webcam / Screen Recording & Teleprompter State
  const [showRecordingModal, setShowRecordingModal] = useState(false);

  // 12. Cinematic Color LUTs & Manual Grading State
  const [selectedLUTPreset, setSelectedLUTPreset] = useState('clean');
  const [colorAdjustments, setColorAdjustments] = useState<ColorAdjustments>(DEFAULT_COLOR_ADJUSTMENTS);

  // 13. Keyboard Shortcuts Modal State
  const [showKeyboardShortcutsModal, setShowKeyboardShortcutsModal] = useState(false);

  // 14. Project Snapshots & Version History State
  const [snapshots, setSnapshots] = useState<ProjectSnapshot[]>([]);

  // 15. Multi-Track Audio Mixer Console State
  const [showAudioMixerModal, setShowAudioMixerModal] = useState(false);
  const [mixerState, setMixerState] = useState<AudioMixerState>(DEFAULT_MIXER_STATE);

  // 16. Social Launch Kit Modal State
  const [showSocialModal, setShowSocialModal] = useState(false);

  // 17. Motion Graphics Stickers & Emoji Popper State
  const [selectedSticker, setSelectedSticker] = useState('fire');
  const [stickerPosition, setStickerPosition] = useState<'top-left' | 'top-right' | 'center' | 'bottom-left' | 'bottom-right'>('top-right');
  const [stickerAnimation, setStickerAnimation] = useState<'pop-bounce' | 'spin-in' | 'pulse-glow' | 'slide-up'>('pop-bounce');
  const [stickerDuration, setStickerDuration] = useState(2.5);

  // 18. Ken Burns Motion Presets State
  const [selectedKenBurnsPreset, setSelectedKenBurnsPreset] = useState('zoom-in');

  // 19. AI Audience Retention Graph & Heatmap State
  const [retentionReport, setRetentionReport] = useState<RetentionAnalysisReport | null>(null);

  // 20. AI Voice Isolator & Studio Sound Denoise Console State
  const [selectedVoiceFilterProfile, setSelectedVoiceFilterProfile] = useState<string>('podcast-warmth');
  const [voiceIsolatorEnabled, setVoiceIsolatorEnabled] = useState<boolean>(false);

  // 21. Split-Screen, PIP & Reaction Video Studio State
  const [splitScreenLayout, setSplitScreenLayout] = useState<'none' | 'top-bottom' | 'side-by-side' | 'pip-circle' | 'pip-rect'>('none');
  const [secondaryMediaUrl, setSecondaryMediaUrl] = useState<string>('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80');

  // 22. Dynamic Camera Shake Simulator State
  const [activeCameraShake, setActiveCameraShake] = useState<{
    type: 'quick-jolt' | 'bass-drop-impact' | 'earthquake-rumble' | 'handheld-micro';
    startTime: number;
    duration: number;
  } | null>(null);

  // 23. AI Storyboard & Multi-Scene Auto-Director State
  const [storyboardTopic, setStoryboardTopic] = useState<string>('How to build high-growth short-form videos with AI');
  const [selectedStoryboardFramework, setSelectedStoryboardFramework] = useState<string>('viral-hook-story');
  const [storyboardScenes, setStoryboardScenes] = useState<StoryboardScene[]>([]);
  const [isGeneratingStoryboard, setIsGeneratingStoryboard] = useState<boolean>(false);

  // 24. Webhooks & Multi-Platform Automation Hub State
  const [showWebhookModal, setShowWebhookModal] = useState<boolean>(false);

  // 25. AI Video Highlights & Viral Moment Extractor State
  const [extractedHighlights, setExtractedHighlights] = useState<ExtractedHighlight[]>([]);
  const [isExtractingHighlights, setIsExtractingHighlights] = useState<boolean>(false);

  // 26. Custom Brand Kit & Watermark State
  const [brandKit, setBrandKit] = useState<BrandKit>(DEFAULT_BRAND_KIT);
  const [showBrandKitModal, setShowBrandKitModal] = useState<boolean>(false);

  // 27. Multi-Language AI Subtitle Translator State
  const [selectedLanguage, setSelectedLanguage] = useState<string>('es');
  const [translatedSubtitle, setTranslatedSubtitle] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  // 28. Timeline Marker Flags State
  const [timelineMarkers, setTimelineMarkers] = useState<TimelineMarker[]>([
    { id: 'mark-init-1', time: 0, type: 'hook', label: 'Hook Start', color: '#06B6D4', note: 'Primary 3-second retention window' },
    { id: 'mark-init-2', time: 10.5, type: 'cut', label: 'Jump Cut Cue', color: '#EF4444', note: 'Pacing cadence change' },
  ]);
  const [selectedMarkerType, setSelectedMarkerType] = useState<TimelineMarker['type']>('cut');
  const [markerLabelInput, setMarkerLabelInput] = useState<string>('Edit Cue');

  // 29. Multi-Aspect Batch Render Queue Modal State
  const [showBatchQueueModal, setShowBatchQueueModal] = useState<boolean>(false);

  // 30. Phase 5 Enterprise AI Studio & Mastering States
  const [showVoicePersonaModal, setShowVoicePersonaModal] = useState<boolean>(false);
  const [activeVoicePersona, setActiveVoicePersona] = useState<VoicePersona>(DEFAULT_VOICE_PERSONA);
  const [selectedVelocityTransition, setSelectedVelocityTransition] = useState<string>('none');
  const [customSubtitleStyling, setCustomSubtitleStyling] = useState<SubtitleStyling>(DEFAULT_SUBTITLE_STYLING);
  const [showExportMatrixModal, setShowExportMatrixModal] = useState<boolean>(false);
  const [exportMatrixSettings, setExportMatrixSettings] = useState<ExportMatrixSettings>(DEFAULT_EXPORT_SETTINGS);

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

    if (projectId) {
      setSnapshots(getProjectSnapshots(projectId));
    }
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

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // 10. Social Callouts & Lower-Thirds Handler
  const handleInsertCallout = () => {
    const preset = CALLOUT_PRESETS.find((p) => p.id === selectedCalloutPreset) || CALLOUT_PRESETS[0];
    const start = parseFloat(currentTime.toFixed(1));
    addOperation('callout_badge', `Callout: ${calloutTitle || preset.name}`, {
      presetId: preset.id,
      title: calloutTitle || preset.defaultTitle,
      subtitle: calloutSubtitle || preset.defaultSubtitle,
      position: calloutPosition,
      startTime: start,
      duration: calloutDuration,
    });
    toast.success(`Inserted "${preset.name}" callout at ${formatTime(start)} (${calloutDuration}s)`);
  };

  // 12. Cinematic Color LUTs & Grading Handlers
  const handleLUTPresetSelect = (lutId: string) => {
    setSelectedLUTPreset(lutId);
    const lut = COLOR_LUT_PRESETS.find((p) => p.id === lutId);
    addOperation('color_lut', `LUT: ${lut?.name || lutId}`, {
      lutId,
      name: lut?.name,
    });
    toast.success(`Applied LUT: ${lut?.name || lutId}`);
  };

  const handleResetGrading = () => {
    setSelectedLUTPreset('clean');
    setColorAdjustments(DEFAULT_COLOR_ADJUSTMENTS);
    toast.info('Reset color grading to default');
  };

  // 14. Version History & Milestone Snapshots Handlers
  const handleSaveSnapshot = (customLabel?: string) => {
    if (!projectId) return;
    const snapName = customLabel || `Milestone ${snapshots.length + 1} (${formatTime(currentTime)})`;
    const updated = saveProjectSnapshot(projectId, {
      name: snapName,
      operations,
      trimStart,
      trimEnd,
      subtitleText,
      aspectRatio,
      selectedFilter: selectedLUTPreset,
    });
    setSnapshots(updated);
    toast.success(`Saved snapshot "${snapName}"`);
  };

  const handleRestoreSnapshot = (snapshot: ProjectSnapshot) => {
    if (confirm(`Restore snapshot "${snapshot.name}"? Your current timeline will be rolled back.`)) {
      setOperations(snapshot.operations);
      setTrimStart(snapshot.trimStart);
      setTrimEnd(snapshot.trimEnd);
      if (snapshot.subtitleText !== undefined) setSubtitleText(snapshot.subtitleText);
      if (snapshot.aspectRatio) setAspectRatio(snapshot.aspectRatio as any);
      if (snapshot.selectedFilter) setSelectedLUTPreset(snapshot.selectedFilter);
      toast.success(`Restored snapshot "${snapshot.name}" (${snapshot.operations.length} actions)`);
    }
  };

  const handleDeleteSnapshot = (snapshotId: string) => {
    if (!projectId) return;
    deleteProjectSnapshot(projectId, snapshotId);
    setSnapshots(getProjectSnapshots(projectId));
    toast.info('Snapshot deleted');
  };

  // 17. Motion Graphics Stickers & Emoji Handlers
  const handleInsertSticker = (item?: StickerItem) => {
    const stickerItem = item || STICKER_LIBRARY.find((s) => s.id === selectedSticker) || STICKER_LIBRARY[0];
    const start = parseFloat(currentTime.toFixed(1));
    addOperation('sticker_emoji', `Sticker: ${stickerItem.emoji} ${stickerItem.label}`, {
      stickerId: stickerItem.id,
      emoji: stickerItem.emoji,
      label: stickerItem.label,
      startTime: start,
      duration: stickerDuration,
      position: stickerPosition,
      animation: stickerAnimation,
      size: 80,
    });
    toast.success(`Popped "${stickerItem.emoji}" sticker at ${formatTime(start)} (${stickerDuration}s)`);
  };

  const handleAutoScanStickers = () => {
    const suggestions = scanTranscriptForStickerTriggers(subtitleText, duration);
    if (suggestions.length === 0) {
      toast.info('No direct keyword triggers found. Try adding stickers manually!');
      return;
    }
    suggestions.forEach((match) => {
      addOperation('sticker_emoji', `Sticker: ${match.sticker.emoji} ${match.sticker.label}`, {
        stickerId: match.sticker.id,
        emoji: match.sticker.emoji,
        label: match.sticker.label,
        startTime: match.timestamp,
        duration: 2.5,
        position: 'top-right',
        animation: match.sticker.defaultAnimation,
        size: 80,
      });
    });
    toast.success(`AI automatically inserted ${suggestions.length} reaction stickers synced to key words!`);
  };

  // 18. Smart Ken Burns B-Roll Auto-Sync Handler
  const handleAutoSyncBRollCues = () => {
    const cues = calculateSmartBRollCues(subtitleText, duration, 4);
    if (cues.length === 0) {
      toast.info('Not enough speech content to calculate B-roll pauses');
      return;
    }
    toast.success(`AI calculated ${cues.length} speech pauses for Ken Burns cutaways!`);
  };

  // 19. AI Retention Heatmap Analysis Handler
  const handleRunRetentionAnalysis = () => {
    const report = generateRetentionHeatmap({
      duration,
      operations,
      hasSubtitles: Boolean(subtitleText && subtitleText.trim()),
    });
    setRetentionReport(report);
    toast.success(`Audience Retention: ${report.overallRetentionScore}% projected retention score!`);
  };

  // Global NLE Keyboard Shortcuts Engine
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement | null;
      const tag = activeEl?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || activeEl?.isContentEditable) {
        return;
      }

      // [?] -> Open shortcuts modal
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setShowKeyboardShortcutsModal((prev) => !prev);
        return;
      }

      // [Space] -> Toggle Play/Pause
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
        return;
      }

      // [J] -> Rewind 2s
      if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        if (videoRef.current) {
          videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 2);
          setCurrentTime(videoRef.current.currentTime);
        }
        return;
      }

      // [K] -> Pause
      if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        if (videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
        return;
      }

      // [L] -> Forward 2s
      if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        if (videoRef.current) {
          videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 2);
          setCurrentTime(videoRef.current.currentTime);
        }
        return;
      }

      // [S] -> Split Clip at Cursor
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleSplitClip();
        return;
      }

      // [I] -> Set In-Point (trimStart)
      if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        setTrimStart(currentTime);
        toast.info(`In-point set to ${formatTime(currentTime)}`);
        return;
      }

      // [O] -> Set Out-Point (trimEnd)
      if (e.key === 'o' || e.key === 'O') {
        e.preventDefault();
        setTrimEnd(currentTime);
        toast.info(`Out-point set to ${formatTime(currentTime)}`);
        return;
      }

      // [M] -> Audio Mute Toggle
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setIsMuted((prev) => {
          if (videoRef.current) videoRef.current.muted = !prev;
          return !prev;
        });
        toast.info('Toggled audio mute');
        return;
      }

      // [Ctrl+Z] -> Undo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }

      // [Ctrl+Y] or [Ctrl+Shift+Z] -> Redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y' || (e.shiftKey && (e.key === 'z' || e.key === 'Z')))) {
        e.preventDefault();
        handleRedo();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, duration, isPlaying, operations, redoStack, trimStart, trimEnd]);

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

  // 1. AI Auto-Jumpcut & Silence Removal Handlers
  const handleDetectSilences = async () => {
    setIsDetectingSilences(true);
    toast.info('Analyzing audio cadence and speech energy...');
    try {
      const silences = await detectMediaSilences(videoRef.current, {
        duration,
        minSilenceDuration: 0.45,
      });
      setDetectedSilences(silences);
      const stats = calculateDeadAirSaved(duration, silences);
      setDeadAirStats(stats);
      if (silences.length > 0) {
        toast.success(`⚡ Detected ${silences.length} pauses! Can trim ${stats.savedSeconds}s (${stats.percentSaved}% dead air).`);
      } else {
        toast.info('Audio is tight! No long pauses detected.');
      }
    } catch (err: any) {
      toast.error('Could not analyze audio for silences');
    } finally {
      setIsDetectingSilences(false);
    }
  };

  const handleApplyAutoJumpcuts = () => {
    if (detectedSilences.length === 0) {
      toast.error('Please scan for silences first');
      return;
    }
    const stats = calculateDeadAirSaved(duration, detectedSilences);
    addOperation('jumpcut_remove_silence', `Auto-Jumpcut: Trimmed ${detectedSilences.length} pauses`, {
      silencesCount: detectedSilences.length,
      savedSeconds: stats.savedSeconds,
      newDuration: stats.newDuration,
    });
    setTrimEnd(stats.newDuration);
    setDeadAirStats(null);
    setDetectedSilences([]);
    toast.success(`✂️ Applied auto-jumpcuts! Removed ${stats.savedSeconds}s of dead air.`);
  };

  // 2. AI Video Hook & Script Generator Handlers
  const handleGenerateViralScript = () => {
    setIsGeneratingScript(true);
    try {
      const script = generateViralScript(scriptTopic, scriptCategory, scriptFramework);
      setGeneratedScript(script);
      toast.success(`✨ Generated ${script.frameworkName} script (~${script.estimatedDuration}s)!`);
    } catch (err: any) {
      toast.error('Failed to generate viral script');
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleApplyScriptToStudio = () => {
    if (!generatedScript) return;
    setVoiceoverScript(generatedScript.fullScript);
    setSubtitleText(generatedScript.fullScript);
    setActiveTab('voice');
    toast.success('Pushed script to AI Voiceover Studio & Karaoke Subtitles!');
  };

  // 3. AI Procedural Background Music Handlers
  const handleToggleProceduralMusic = (trackId: string) => {
    if (selectedProceduralTrack === trackId && isPlayingProcedural) {
      stopProceduralMusic();
      setIsPlayingProcedural(false);
      setSelectedProceduralTrack(null);
      toast.info('Stopped procedural music');
    } else {
      setSelectedProceduralTrack(trackId);
      startProceduralMusic(trackId, proceduralVolume / 100);
      setIsPlayingProcedural(true);
      toast.success(`Playing procedural loop: ${trackId}`);
    }
  };

  // Dynamic Auto-Ducking Watcher
  useEffect(() => {
    if (autoDuckingEnabled && isPlayingProcedural) {
      setProceduralMusicDucking(isSpeaking);
    }
  }, [isSpeaking, autoDuckingEnabled, isPlayingProcedural]);

  // Clean up procedural music on unmount
  useEffect(() => {
    return () => {
      stopProceduralMusic();
    };
  }, []);

  // 5. Speed Ramping Handler
  const handleSelectSpeedRamp = (presetId: string) => {
    setSelectedSpeedRamp(presetId);
    const preset = SPEED_RAMP_PRESETS.find((p) => p.id === presetId);
    if (preset && videoRef.current) {
      applyPlaybackSpeed(videoRef.current, preset.baseSpeed, true);
    }
    toast.success(`Speed ramp set to ${preset?.name || presetId}`);
  };

  // 6. AI Chapter Markers & SEO Handler
  const handleGenerateSEO = () => {
    setIsGeneratingSEO(true);
    try {
      const seo = generateVideoSEOAndChapters(
        project?.title || 'Viral Video',
        subtitleText,
        duration,
        operations
      );
      setSeoMetadata(seo);
      toast.success('Generated YouTube Chapters & SEO metadata!');
    } catch (err) {
      toast.error('Could not generate SEO metadata');
    } finally {
      setIsGeneratingSEO(false);
    }
  };

  // 7. AI Virality Score & Retention Coach Handler
  const handleRunViralityCoach = () => {
    const report = evaluateViralityScore({
      duration,
      operations,
      hasSubtitles: Boolean(subtitleText && subtitleText.trim()),
      subtitleLength: subtitleText ? subtitleText.split(/\s+/).length : 0,
      hasMusic: Boolean(musicTrack || (selectedProceduralTrack && isPlayingProcedural)),
      autoDucking: autoDuckingEnabled,
    });
    setViralityReport(report);
    toast.success(`Retention Coach: Score ${report.overallScore}/100 (${report.tierBadge})`);
  };

  // 8. Multi-Clip Sequencer Handlers
  const handleReorderClips = (newClips: SequenceClip[]) => {
    setSequenceClips(newClips);
  };
  const handleRemoveClip = (clipId: string) => {
    setSequenceClips((prev) => prev.filter((c) => c.id !== clipId));
  };
  const handleUpdateClipDuration = (clipId: string, newDur: number) => {
    setSequenceClips((prev) =>
      prev.map((c) => (c.id === clipId ? { ...c, duration: newDur } : c))
    );
  };
  const handleAddAssetToSequence = (asset: MediaAsset) => {
    const newClip: SequenceClip = {
      id: `clip-${Date.now()}`,
      name: asset.name,
      url: asset.url,
      type: asset.type,
      duration: asset.duration || (asset.type === 'image' ? 4 : 8),
      thumbnailUrl: asset.thumbnailUrl,
    };
    setSequenceClips((prev) => [...prev, newClip]);
    toast.success(`Added "${asset.name}" to sequence #${sequenceClips.length + 1}`);
  };

  // 9. Camera Shake Simulator Handler
  const handleTriggerCameraShake = (presetId: string) => {
    const preset = SHAKE_PRESETS.find((p) => p.id === presetId);
    const dur = preset?.defaultDuration || 0.4;
    setActiveCameraShake({
      type: presetId as any,
      startTime: currentTime,
      duration: dur,
    });
    const op: EditOperation = {
      id: `op-shake-${Date.now()}`,
      type: 'camera_shake',
      name: `Camera Shake: ${preset?.name || presetId}`,
      timestamp: new Date().toLocaleTimeString(),
      details: { type: presetId, startTime: currentTime, duration: dur },
    };
    setOperations((prev) => [op, ...prev]);
    toast.success(`💥 Camera Shake triggered: ${preset?.name || presetId}`);
    setTimeout(() => {
      setActiveCameraShake(null);
    }, dur * 1000);
  };

  // 10. AI Storyboard & Multi-Scene Director Handlers
  const handleGenerateStoryboard = () => {
    setIsGeneratingStoryboard(true);
    try {
      const scenes = generateStoryboard(selectedStoryboardFramework, storyboardTopic, duration || 30);
      setStoryboardScenes(scenes);
      toast.success(`🎬 Generated ${scenes.length}-scene AI Storyboard!`);
    } catch {
      toast.error('Failed to generate storyboard');
    } finally {
      setIsGeneratingStoryboard(false);
    }
  };

  const handleApplyStoryboardToTimeline = () => {
    if (storyboardScenes.length === 0) {
      toast.error('Generate a storyboard first');
      return;
    }
    const newOps = convertStoryboardToTimelineOperations(storyboardScenes);
    setOperations((prev) => [...newOps, ...prev]);
    const combinedScript = storyboardScenes.map((s) => s.scriptText).join(' ');
    setSubtitleText(combinedScript);
    toast.success(`🚀 Applied ${storyboardScenes.length} scenes to timeline!`);
  };

  // 11. Split-Screen Layout Handler
  const handleSelectSplitLayout = (layoutId: any) => {
    setSplitScreenLayout(layoutId);
    const layout = SPLIT_SCREEN_LAYOUTS.find((l) => l.id === layoutId);
    const op: EditOperation = {
      id: `op-split-${Date.now()}`,
      type: 'split_screen',
      name: `Split Screen: ${layout?.name || layoutId}`,
      timestamp: new Date().toLocaleTimeString(),
      details: { layout: layoutId, secondaryUrl: secondaryMediaUrl },
    };
    setOperations((prev) => [op, ...prev]);
    toast.success(`📐 Split-Screen: ${layout?.name || layoutId}`);
  };

  // 12. Voice Isolator Profile Handler
  const handleSelectVoiceProfile = (profileId: string) => {
    setSelectedVoiceFilterProfile(profileId);
    setVoiceIsolatorEnabled(true);
    const prof = VOICE_ISOLATOR_PROFILES.find((p) => p.id === profileId);
    const op: EditOperation = {
      id: `op-voice-iso-${Date.now()}`,
      type: 'voice_isolator',
      name: `Voice Filter: ${prof?.name || profileId}`,
      timestamp: new Date().toLocaleTimeString(),
      details: { profile: profileId },
    };
    setOperations((prev) => [op, ...prev]);
    toast.success(`🎙️ Vocal Profile: ${prof?.name || profileId}`);
  };

  // 13. AI Highlights & Viral Moment Extractor Handlers
  const handleExtractHighlights = () => {
    setIsExtractingHighlights(true);
    try {
      const hls = extractViralHighlights(duration || 30, subtitleText);
      setExtractedHighlights(hls);
      toast.success(`⚡ Extracted ${hls.length} high-retention viral micro-clips!`);
    } catch {
      toast.error('Failed to extract highlights');
    } finally {
      setIsExtractingHighlights(false);
    }
  };

  const handleApplyHighlightRange = (hl: ExtractedHighlight) => {
    setTrimStart(hl.startTime);
    setTrimEnd(hl.endTime);
    if (videoRef.current) {
      videoRef.current.currentTime = hl.startTime;
      setCurrentTime(hl.startTime);
    }
    setAspectRatio(hl.recommendedAspect);
    const op: EditOperation = {
      id: `op-hl-${Date.now()}`,
      type: 'highlight_cut',
      name: `Highlight: ${hl.title}`,
      timestamp: new Date().toLocaleTimeString(),
      details: {
        startTime: hl.startTime,
        endTime: hl.endTime,
        duration: hl.duration,
        aspect: hl.recommendedAspect,
      },
    };
    setOperations((prev) => [op, ...prev]);
    toast.success(`✂️ Timeline trimmed to "${hl.title}" (${hl.duration}s • ${hl.recommendedAspect})!`);
  };

  // 14. Multi-Language AI Subtitle Translator Handlers
  const handleTranslateSubtitles = (langCode: string) => {
    setSelectedLanguage(langCode);
    setIsTranslating(true);
    try {
      const textToTranslate = subtitleText || 'Transform your content into viral high engagement videos with EditFlow AI';
      const result = translateTranscript(textToTranslate, langCode);
      setTranslatedSubtitle(result);
      const targetLang = SUPPORTED_LANGUAGES.find((l) => l.code === langCode);
      toast.success(`🌐 Translated into ${targetLang?.name || langCode} (${targetLang?.flag})!`);
    } catch {
      toast.error('Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleApplyTranslatedToSubtitles = () => {
    if (!translatedSubtitle) {
      toast.error('Translate the text first');
      return;
    }
    setSubtitleText(translatedSubtitle);
    const op: EditOperation = {
      id: `op-trans-${Date.now()}`,
      type: 'subtitle_translated',
      name: `Subtitles: ${selectedLanguage.toUpperCase()} Translation`,
      timestamp: new Date().toLocaleTimeString(),
      details: { lang: selectedLanguage, text: translatedSubtitle },
    };
    setOperations((prev) => [op, ...prev]);
    toast.success(`✅ Active subtitles replaced with ${selectedLanguage.toUpperCase()} translation!`);
  };

  // 15. Timeline Marker Flags Handlers
  const handleAddMarker = (type: TimelineMarker['type'] = selectedMarkerType, label: string = markerLabelInput) => {
    const meta = getMarkerTypeMeta(type);
    const newMarker: TimelineMarker = {
      id: `marker-${Date.now()}`,
      time: Number(currentTime.toFixed(1)),
      type,
      label: label.trim() || meta.name,
      color: meta.color,
      note: `Cue point at ${currentTime.toFixed(1)}s`,
    };
    setTimelineMarkers((prev) => [...prev.filter((m) => Math.abs(m.time - currentTime) > 0.3), newMarker].sort((a, b) => a.time - b.time));
    toast.success(`📍 Added ${meta.name} marker at ${currentTime.toFixed(1)}s`);
  };

  const handleSeekToMarker = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
    setCurrentTime(time);
  };

  const handleDeleteMarker = (markerId: string) => {
    setTimelineMarkers((prev) => prev.filter((m) => m.id !== markerId));
    toast.info('Marker removed');
  };

  const handleAutoBrollInserter = () => {
    const rawText = subtitleText || 'Transform your ideas into high impact viral videos with EditFlow AI';
    const inserts = generateAutoBrollInserts(rawText, duration, 4.5);
    if (inserts.length === 0) {
      toast.info('No matching transcript keywords found for auto-insertion');
      return;
    }
    const newOps: EditOperation[] = inserts.map((ins) => ({
      id: `op-autobroll-${Date.now()}-${ins.id}`,
      type: 'broll_clip',
      name: `Auto B-Roll: ${ins.name} (${ins.matchedKeyword})`,
      timestamp: new Date().toLocaleTimeString(),
      details: {
        assetId: ins.id,
        name: ins.name,
        url: ins.url,
        startTime: ins.startTime,
        duration: ins.duration,
        position: 'center',
        motionPreset: ins.motionPreset,
      },
    }));
    setOperations((prev) => [...newOps, ...prev]);
    toast.success(`🎬 Auto-inserted ${inserts.length} semantic B-roll cutaways with Ken Burns pacing!`);
  };

  const handleInBrowserRender = async (presetAspect?: '16:9' | '9:16' | '1:1', customExportSettings?: ExportMatrixSettings) => {
    const targetAspect = presetAspect || aspectRatio;
    const activeExportMatrix = customExportSettings || exportMatrixSettings;
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
          motionPreset: selectedMotionPreset,
        }));

      const activeCallouts: ActiveCallout[] = operations
        .filter((op) => op.type === 'callout_badge' && op.details)
        .map((op) => ({
          id: op.id,
          presetId: op.details.presetId || 'social-youtube',
          title: op.details.title || op.name,
          subtitle: op.details.subtitle || '',
          startTime: Number(op.details.startTime) || 0,
          duration: Number(op.details.duration) || 3.5,
          position: op.details.position || 'bottom-left',
        }));

      const activeStickers: ActiveSticker[] = operations
        .filter((op) => op.type === 'sticker_emoji' && op.details)
        .map((op) => ({
          id: op.id,
          stickerId: op.details.stickerId || 'fire',
          emoji: op.details.emoji || '🔥',
          label: op.details.label || '',
          startTime: Number(op.details.startTime) || 0,
          duration: Number(op.details.duration) || 2.5,
          position: op.details.position || 'top-right',
          animation: op.details.animation || 'pop-bounce',
          size: op.details.size || 80,
        }));

      const outputBlob = await renderStudioComposition({
        videoElement: isImg ? null : videoRef.current,
        imageSrc: isImg ? mediaSrc : null,
        secondaryMediaSrc: splitScreenLayout !== 'none' ? secondaryMediaUrl : null,
        splitScreenLayout: splitScreenLayout !== 'none' ? splitScreenLayout : undefined,
        cameraShake: activeCameraShake ? activeCameraShake : undefined,
        brandKit: brandKit.enabled ? brandKit : undefined,
        aspectRatio: targetAspect,
        reframeMode,
        filter: selectedFilter,
        colorLUT: selectedLUTPreset !== 'clean' ? selectedLUTPreset : undefined,
        colorAdjustments: colorAdjustments,
        transitionType: selectedTransition,
        velocityTransitionType: selectedVelocityTransition !== 'none' ? selectedVelocityTransition : undefined,
        chromaKey: chromaKeyOptions.enabled ? chromaKeyOptions : undefined,
        exportMatrix: activeExportMatrix,
        customSubtitleStyling: customSubtitleStyling,
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
        callouts: activeCallouts,
        stickers: activeStickers,
        musicUrl: musicTrack?.url || null,
        musicVolume: musicVolume / 100,
        onProgress: (pct, stage) => {
          setRenderLocalProgress(pct);
          setRenderLocalStage(stage);
        },
      });

      downloadRenderedBlob(
        outputBlob,
        `${(project?.title || 'editflow').toLowerCase().replace(/\s+/g, '_')}_${targetAspect}_${activeExportMatrix.resolutionTier}_${activeExportMatrix.fps}fps.webm`
      );
      toast.success(`🎉 Video render completed and downloaded (${targetAspect})!`);
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

  const activeCompositeFilter = `${filterStyles[selectedFilter] || ''} ${buildCompositeFilterString(selectedLUTPreset, colorAdjustments)}`.trim();

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
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-white/10 mx-1" />
          <button
            onClick={() => setShowRecordingModal(true)}
            className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-xs font-semibold text-rose-300 border border-rose-500/30 transition-all flex items-center gap-1.5 shadow-sm"
            title="Record Camera / Screen with AI Teleprompter"
          >
            <VideoIcon className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Record</span>
          </button>
          <button
            onClick={() => setShowKeyboardShortcutsModal(true)}
            className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-slate-200 transition-all flex items-center gap-1.5"
            title="NLE Keyboard Shortcuts (?)"
          >
            <Keyboard className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Hotkeys</span>
          </button>
          <button
            onClick={() => setShowAudioMixerModal(true)}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-xs font-semibold text-cyan-300 border border-cyan-500/30 transition-all flex items-center gap-1.5 shadow-sm"
            title="Multi-Track Audio Mixer & Console"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Mixer</span>
          </button>
          <button
            onClick={() => setShowSocialModal(true)}
            className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-xs font-semibold text-purple-300 border border-purple-500/30 transition-all flex items-center gap-1.5 shadow-sm"
            title="1-Click Social Media Launch Kit & Subtitles"
          >
            <Share2 className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Social Kit</span>
          </button>
          <button
            onClick={() => setShowWebhookModal(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-xs font-semibold text-emerald-300 border border-emerald-500/30 transition-all flex items-center gap-1.5 shadow-sm"
            title="Zapier, Make.com & Discord Webhook Automation Hub"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Webhooks</span>
          </button>
          <button
            onClick={() => setShowBrandKitModal(true)}
            className="px-3 py-1.5 rounded-xl bg-purple-600/15 hover:bg-purple-600/25 text-xs font-semibold text-purple-300 border border-purple-500/30 transition-all flex items-center gap-1.5 shadow-sm"
            title="Custom Brand Kit & Watermark Studio"
          >
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Brand Kit</span>
          </button>
          <button
            onClick={() => setShowBatchQueueModal(true)}
            className="px-3 py-1.5 rounded-xl bg-cyan-600/15 hover:bg-cyan-600/25 text-xs font-semibold text-cyan-300 border border-cyan-500/30 transition-all flex items-center gap-1.5 shadow-sm"
            title="Simultaneous Multi-Aspect Batch Render Queue (16:9 + 9:16 + 1:1)"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Batch Queue</span>
          </button>
          <button
            onClick={() => setShowExportMatrixModal(true)}
            className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-xs font-semibold text-purple-200 border border-purple-500/40 transition-all flex items-center gap-1.5 shadow-sm"
            title="Master Export Matrix & Custom Codec / Bitrate Console"
          >
            <Film className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Export Matrix</span>
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
          <div className="flex overflow-x-auto border-b border-white/[0.08] p-1.5 gap-1">
            {[
              { id: 'media', label: 'Media', icon: ImageIcon },
              { id: 'sequence', label: 'Multi-Clip', icon: Layers },
              { id: 'stock', label: 'B-Roll', icon: Flame },
              { id: 'stickers', label: 'Stickers', icon: Smile },
              { id: 'retention', label: 'Retention', icon: Activity },
              { id: 'callouts', label: 'Callouts', icon: AtSign },
              { id: 'filters', label: 'LUTs/Grading', icon: SlidersHorizontal },
              { id: 'script', label: 'Script', icon: FileText },
              { id: 'voice', label: 'Voice', icon: Mic },
              { id: 'sfx', label: 'SFX', icon: Volume1 },
              { id: 'transitions', label: 'FX/Cut', icon: Zap },
              { id: 'speed', label: 'Speed', icon: Gauge },
              { id: 'chroma', label: 'Green Screen', icon: Sparkles },
              { id: 'coach', label: 'Virality', icon: TrendingUp },
              { id: 'seo', label: 'Chapters/SEO', icon: BookOpen },
              { id: 'reframe', label: 'Reframe', icon: Crop },
              { id: 'trim', label: 'Jumpcut', icon: Scissors },
              { id: 'audio', label: 'Audio', icon: Volume2 },
              { id: 'subtitles', label: 'Subs', icon: Type },
              { id: 'storyboard', label: 'Storyboard', icon: Film },
              { id: 'splitscreen', label: 'Split-Screen', icon: Split },
              { id: 'shake', label: 'Shake FX', icon: Move },
              { id: 'highlights', label: 'Highlights', icon: Flame },
              { id: 'translate', label: 'Translate', icon: Globe },
              { id: 'history', label: 'Snapshots', icon: History },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-1.5 px-2 rounded-xl text-[10px] font-medium flex-shrink-0 flex items-center justify-center gap-1 transition-all ${
                    activeTab === tab.id
                      ? 'bg-purple-600/25 text-purple-300 border border-purple-500/40 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  <Icon className="w-3 h-3" />
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

            {activeTab === 'sequence' && (
              <MultiClipSequencer
                clips={sequenceClips}
                onReorderClips={handleReorderClips}
                onRemoveClip={handleRemoveClip}
                onUpdateClipDuration={handleUpdateClipDuration}
                onSelectClip={(clip) => setActiveSequenceClipId(clip.id)}
                activeClipId={activeSequenceClipId}
              />
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

                {/* AI Keyword Auto-Detect & Auto-Inserter Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleAutoDetectBRoll}
                    className="py-2.5 px-3 rounded-xl bg-orange-500/15 border border-orange-500/30 hover:border-orange-400 text-xs font-semibold text-white flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-orange-300" />
                    <span>Detect Cues</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAutoBrollInserter}
                    className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-orange-500/30 to-amber-500/30 border border-orange-400/50 hover:border-orange-300 text-xs font-bold text-amber-200 flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span>Auto-Insert All</span>
                  </button>
                </div>

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

            {activeTab === 'script' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-pink-400" /> Viral Hooks & Scripts
                  </h4>
                  <span className="text-[10px] text-pink-400 font-mono font-semibold">AI Generator</span>
                </div>

                {/* Niche Categories */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-400 font-medium block">Niche / Industry</label>
                  <div className="flex gap-1 overflow-x-auto no-scrollbar py-0.5">
                    {SCRIPT_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setScriptCategory(cat)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all ${
                          scriptCategory === cat
                            ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 font-bold'
                            : 'bg-white/[0.02] border border-white/[0.06] text-slate-400 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hook Frameworks */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-400 font-medium block">Hook Psychology Framework</label>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {HOOK_FRAMEWORKS.map((hw) => (
                      <button
                        key={hw.id}
                        type="button"
                        onClick={() => setScriptFramework(hw.id)}
                        className={`w-full p-2 rounded-xl border text-left transition-all ${
                          scriptFramework === hw.id
                            ? 'bg-pink-500/20 border-pink-500 text-white shadow-sm'
                            : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{hw.name}</span>
                          <span className="text-[9px] text-pink-300 font-mono">{hw.badge}</span>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-0.5">{hw.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Topic Input & Presets */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-400 font-medium block">Video Topic / Core Idea</label>
                  <input
                    type="text"
                    value={scriptTopic}
                    onChange={(e) => setScriptTopic(e.target.value)}
                    placeholder="e.g. 3 tools every video editor needs..."
                    className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                  {PRESET_TOPICS[scriptCategory] && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {PRESET_TOPICS[scriptCategory].slice(0, 3).map((topicSuggestion, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setScriptTopic(topicSuggestion)}
                          className="text-[9px] px-2 py-0.5 rounded-md bg-white/[0.03] hover:bg-white/10 text-slate-400 hover:text-pink-300 border border-white/[0.06] truncate max-w-[200px]"
                        >
                          + {topicSuggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Generate Script Button */}
                <button
                  type="button"
                  onClick={handleGenerateViralScript}
                  disabled={isGeneratingScript}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-xs font-bold text-white shadow-md shadow-pink-600/30 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-pink-200" />
                  <span>{isGeneratingScript ? 'Generating...' : 'Generate Viral Script'}</span>
                </button>

                {/* Generated Script Card */}
                {generatedScript && (
                  <div className="p-3 rounded-2xl bg-pink-950/20 border border-pink-500/30 space-y-2.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-pink-300 uppercase">{generatedScript.frameworkName}</span>
                      <span className="font-mono text-slate-400">~{generatedScript.estimatedDuration}s ({generatedScript.wordCount} words)</span>
                    </div>

                    <div className="p-2 rounded-xl bg-black/40 border border-white/5 space-y-1 text-xs">
                      <p className="text-white font-bold text-[11px] leading-snug">🎣 Hook: {generatedScript.hook}</p>
                      <div className="text-slate-300 text-[10px] space-y-0.5 pl-1.5 border-l border-pink-500/40">
                        {generatedScript.bodyPoints.map((pt, idx) => (
                          <p key={idx}>{pt}</p>
                        ))}
                      </div>
                      <p className="text-pink-300 text-[10px] italic">📣 CTA: {generatedScript.cta}</p>
                    </div>

                    <button
                      type="button"
                      onClick={handleApplyScriptToStudio}
                      className="w-full py-2 px-3 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold shadow-md shadow-pink-600/20 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>Push to Voiceover & Subtitles</span>
                    </button>
                  </div>
                )}
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

                {/* Voice Persona & Custom Timbre Studio Launch Card */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border border-purple-500/30 flex items-center justify-between">
                  <div className="overflow-hidden pr-2">
                    <span className="text-[10px] uppercase font-bold text-purple-400 block">Active Persona Timbre</span>
                    <p className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold">
                        {activeVoicePersona.tag}
                      </span>
                      <span>{activeVoicePersona.name}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowVoicePersonaModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold shadow-md shadow-purple-600/30 flex items-center gap-1.5 transition flex-shrink-0"
                  >
                    <Sliders className="w-3 h-3" />
                    <span>Tune Timbre</span>
                  </button>
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

            {activeTab === 'transitions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" /> Cut Transitions & Motion FX
                  </h4>
                  <span className="text-[10px] text-cyan-400 font-mono font-semibold">Pro FX</span>
                </div>

                {/* Transition Cut Presets */}
                <div className="space-y-2">
                  <label className="text-[11px] text-slate-400 font-medium block">
                    Scene Cut Transition ({TRANSITION_PRESETS.length})
                  </label>
                  <div className="space-y-1.5">
                    {TRANSITION_PRESETS.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setSelectedTransition(t.id);
                          toast.success(`Transition set to ${t.name}`);
                        }}
                        className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                          selectedTransition === t.id
                            ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-md shadow-cyan-900/20'
                            : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{t.icon}</span>
                          <div>
                            <p className="text-xs font-bold text-white">{t.name}</p>
                            <p className="text-[9px] text-slate-400 leading-tight">{t.description}</p>
                          </div>
                        </div>
                        {selectedTransition === t.id && <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Velocity & Motion Blur Engine Presets */}
                <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] text-amber-300 font-bold block flex items-center gap-1">
                      <span>⚡</span> Velocity & Motion Blur Transitions
                    </label>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                      Viral Pacing
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {VELOCITY_TRANSITION_PRESETS.map((vt) => (
                      <button
                        key={vt.id}
                        type="button"
                        onClick={() => {
                          if (selectedVelocityTransition === vt.id) {
                            setSelectedVelocityTransition('none');
                            toast.info('Cleared velocity transition');
                          } else {
                            setSelectedVelocityTransition(vt.id);
                            toast.success(`Velocity transition set to ${vt.name}`);
                          }
                        }}
                        className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                          selectedVelocityTransition === vt.id
                            ? 'bg-amber-500/20 border-amber-400 text-white shadow-md shadow-amber-900/20'
                            : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{vt.icon}</span>
                          <div>
                            <p className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>{vt.name}</span>
                              <span className="text-[9px] font-mono text-amber-400">{vt.defaultDuration}s</span>
                            </p>
                            <p className="text-[9px] text-slate-400 leading-tight">{vt.description}</p>
                          </div>
                        </div>
                        {selectedVelocityTransition === vt.id && <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Overlay Motion Presets */}
                <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                  <label className="text-[11px] text-slate-400 font-medium block">
                    Overlay & B-Roll Motion Animation
                  </label>
                  <div className="space-y-1.5">
                    {MOTION_PRESETS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setSelectedMotionPreset(m.id);
                          toast.success(`Overlay motion preset set to ${m.name}`);
                        }}
                        className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                          selectedMotionPreset === m.id
                            ? 'bg-purple-600/20 border-purple-400 text-white shadow-md shadow-purple-900/20'
                            : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{m.icon}</span>
                          <div>
                            <p className="text-xs font-bold text-white">{m.name}</p>
                            <p className="text-[9px] text-slate-400 leading-tight">{m.description}</p>
                          </div>
                        </div>
                        {selectedMotionPreset === m.id && <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'speed' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-cyan-400" /> Speed Ramping & Velocity
                  </h4>
                  <span className="text-[10px] text-cyan-400 font-mono font-semibold">Pitch Preserved</span>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] text-slate-400 font-medium block">
                    Velocity Curve Presets ({SPEED_RAMP_PRESETS.length})
                  </label>
                  <div className="space-y-2">
                    {SPEED_RAMP_PRESETS.map((sr) => (
                      <button
                        key={sr.id}
                        type="button"
                        onClick={() => handleSelectSpeedRamp(sr.id)}
                        className={`w-full p-2.5 rounded-xl border text-left transition-all ${
                          selectedSpeedRamp === sr.id
                            ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-md shadow-cyan-900/20'
                            : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{sr.icon}</span> {sr.name}
                          </span>
                          <span className="text-[9px] font-mono font-bold text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                            {sr.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-snug">{sr.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'chroma' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Green Screen & Chroma Key
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setChromaKeyOptions((prev) => ({ ...prev, enabled: !prev.enabled }));
                      toast.success(`Chroma Key ${!chromaKeyOptions.enabled ? 'Enabled' : 'Disabled'}`);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      chromaKeyOptions.enabled
                        ? 'bg-emerald-500 text-black shadow-sm'
                        : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    {chromaKeyOptions.enabled ? 'ENABLED' : 'OFF'}
                  </button>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-400 font-medium block">Key Screen Color</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'green', label: 'Green Screen', color: '#00FF00' },
                        { id: 'blue', label: 'Blue Screen', color: '#0000FF' },
                      ].map((kc) => (
                        <button
                          key={kc.id}
                          type="button"
                          onClick={() => setChromaKeyOptions((prev) => ({ ...prev, keyColor: kc.id as any }))}
                          className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                            chromaKeyOptions.keyColor === kc.id
                              ? 'bg-emerald-500/20 border-emerald-400 text-white'
                              : 'bg-white/[0.02] border-white/[0.06] text-slate-400'
                          }`}
                        >
                          <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: kc.color }} />
                          <span>{kc.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Tolerance (Similarity)</span>
                      <span className="text-emerald-400 font-mono">{Math.round(chromaKeyOptions.similarity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0.1}
                      max={0.8}
                      step={0.02}
                      value={chromaKeyOptions.similarity}
                      onChange={(e) =>
                        setChromaKeyOptions((prev) => ({ ...prev, similarity: parseFloat(e.target.value) }))
                      }
                      className="w-full accent-emerald-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Edge Smoothness</span>
                      <span className="text-emerald-400 font-mono">{Math.round(chromaKeyOptions.smoothness * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0.02}
                      max={0.35}
                      step={0.01}
                      value={chromaKeyOptions.smoothness}
                      onChange={(e) =>
                        setChromaKeyOptions((prev) => ({ ...prev, smoothness: parseFloat(e.target.value) }))
                      }
                      className="w-full accent-emerald-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'coach' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> Virality & Retention Coach
                  </h4>
                  <span className="text-[10px] text-cyan-400 font-mono font-semibold">AI Coach</span>
                </div>

                <button
                  type="button"
                  onClick={handleRunViralityCoach}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 border border-cyan-500/40 hover:border-cyan-400 text-xs font-bold text-white flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
                  <span>Analyze Retention & Virality Potential</span>
                </button>

                {viralityReport && (
                  <div className="space-y-3">
                    {/* Score Gauge Card */}
                    <div className={`p-4 rounded-2xl border text-center space-y-1 ${viralityReport.colorClass}`}>
                      <span className="text-3xl font-black block font-mono">{viralityReport.overallScore}/100</span>
                      <span className="text-xs font-bold uppercase tracking-wider">{viralityReport.tierBadge}</span>
                    </div>

                    {/* 5 Retention Metrics */}
                    <div className="space-y-2">
                      {viralityReport.metrics.map((m, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1 text-xs">
                          <div className="flex justify-between font-semibold text-[11px]">
                            <span className="text-white">{m.name}</span>
                            <span className="text-cyan-400 font-mono">{m.score}/{m.maxScore}</span>
                          </div>
                          <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full bg-cyan-400 rounded-full"
                              style={{ width: `${(m.score / m.maxScore) * 100}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-slate-400 leading-snug">{m.feedback}</p>
                        </div>
                      ))}
                    </div>

                    {/* Actionable Recommendations */}
                    {viralityReport.recommendations.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                        <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider block">
                          Actionable Retention Fixes
                        </span>
                        {viralityReport.recommendations.map((rec) => (
                          <div
                            key={rec.id}
                            className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between gap-2"
                          >
                            <div className="overflow-hidden">
                              <p className="text-[11px] font-bold text-white">{rec.title}</p>
                              <p className="text-[9px] text-slate-400 leading-tight">{rec.reason}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (rec.actionType === 'enable_subs') setActiveTab('subtitles');
                                if (rec.actionType === 'add_broll') setActiveTab('stock');
                                if (rec.actionType === 'auto_foley') setActiveTab('sfx');
                                if (rec.actionType === 'enable_ducking') {
                                  setAutoDuckingEnabled(true);
                                  toast.success('Auto-Ducking Enabled!');
                                }
                              }}
                              className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-[10px] flex-shrink-0"
                            >
                              {rec.actionLabel}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'seo' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" /> Chapters & Viral SEO
                  </h4>
                  <span className="text-[10px] text-amber-400 font-mono font-semibold">Metadata</span>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateSEO}
                  disabled={isGeneratingSEO}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-purple-500/20 border border-amber-500/40 hover:border-amber-400 text-xs font-bold text-white flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isGeneratingSEO ? 'Generating Metadata...' : 'Generate YouTube Chapters & SEO'}</span>
                </button>

                {seoMetadata && (
                  <div className="space-y-3">
                    {/* Title Variants */}
                    <div className="space-y-1.5 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                      <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                        Viral Title Options
                      </span>
                      {[
                        { label: 'Curiosity', text: seoMetadata.titles.curiosity },
                        { label: 'High Value', text: seoMetadata.titles.highValue },
                        { label: 'Contrarian', text: seoMetadata.titles.contrarian },
                      ].map((t, idx) => (
                        <div key={idx} className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-2">
                          <p className="text-[11px] text-white font-medium leading-snug">{t.text}</p>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(t.text);
                              toast.success(`Copied "${t.label}" title!`);
                            }}
                            className="p-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 flex-shrink-0"
                            title="Copy Title"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Timestamped Chapters */}
                    <div className="space-y-1.5 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                          YouTube Chapters ({seoMetadata.chapters.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(seoMetadata.chaptersFormattedText);
                            toast.success('Copied all chapters!');
                          }}
                          className="text-[10px] text-amber-400 hover:text-amber-300 font-mono font-bold flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" /> Copy All
                        </button>
                      </div>
                      <div className="space-y-1 font-mono text-[10px] text-slate-300 p-2 rounded-xl bg-black/40 border border-white/5">
                        {seoMetadata.chapters.map((ch) => (
                          <div key={ch.id} className="flex gap-2">
                            <span className="text-amber-400 font-bold">{ch.timestamp}</span>
                            <span className="text-white">{ch.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Trending Hashtags */}
                    <div className="space-y-1.5 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                          Hashtag Bundle
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(seoMetadata.hashtagsFormattedText);
                            toast.success('Copied hashtags!');
                          }}
                          className="text-[10px] text-amber-400 hover:text-amber-300 font-mono font-bold flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" /> Copy
                        </button>
                      </div>
                      <p className="text-[10px] text-cyan-300 font-mono p-2 rounded-xl bg-black/40 border border-white/5">
                        {seoMetadata.hashtagsFormattedText}
                      </p>
                    </div>
                  </div>
                )}
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

                {/* AI Auto-Jumpcut & Silence Removal Section */}
                <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-cyan-400" /> AI Auto-Jumpcut
                    </span>
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                      Silence Removal
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug">
                    Scans audio for awkward silences (&gt;0.45s) and creates rapid-fire, high-retention cuts.
                  </p>

                  <button
                    type="button"
                    onClick={handleDetectSilences}
                    disabled={isDetectingSilences}
                    className="w-full py-2 px-3 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/40 text-cyan-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                    <span>{isDetectingSilences ? 'Analyzing Cadence...' : 'Scan Pauses & Dead Air'}</span>
                  </button>

                  {/* Detected Silences & Dead Air Stats */}
                  {deadAirStats && detectedSilences.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <div className="p-2.5 rounded-xl bg-black/40 border border-cyan-500/20 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-white text-[11px]">Found {detectedSilences.length} Pauses</p>
                          <p className="text-[10px] text-cyan-400 font-mono">
                            Saves {deadAirStats.savedSeconds}s ({deadAirStats.percentSaved}% faster)
                          </p>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {duration}s → {deadAirStats.newDuration}s
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleApplyAutoJumpcuts}
                        className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-black font-extrabold text-xs shadow-md shadow-cyan-500/20 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Scissors className="w-3.5 h-3.5" />
                        <span>Apply Auto-Jumpcuts ({deadAirStats.savedSeconds}s cut)</span>
                      </button>
                    </div>
                  )}
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

                {/* AI Voice Isolator & Studio Denoise Console */}
                <div className="p-3.5 rounded-2xl bg-indigo-950/25 border border-indigo-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5 text-indigo-400" /> AI Voice Isolator & EQ
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setVoiceIsolatorEnabled(!voiceIsolatorEnabled);
                        toast.success(voiceIsolatorEnabled ? 'Voice Isolator bypassed' : 'Voice Isolator enabled');
                      }}
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full transition-all ${
                        voiceIsolatorEnabled
                          ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                          : 'bg-white/10 text-slate-400 border border-white/10 hover:text-white'
                      }`}
                    >
                      {voiceIsolatorEnabled ? 'ACTIVE (ISOLATED)' : 'ENABLE FILTER'}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug">
                    Web Audio parametric EQ curve eliminates HVAC hum, room reverb echo, and boosts speech clarity.
                  </p>
                  <div className="space-y-1.5">
                    {VOICE_ISOLATOR_PROFILES.map((prof) => (
                      <button
                        key={prof.id}
                        type="button"
                        onClick={() => handleSelectVoiceProfile(prof.id)}
                        className={`w-full p-2 rounded-xl text-left border transition-all ${
                          selectedVoiceFilterProfile === prof.id
                            ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-sm'
                            : 'bg-black/30 border-white/[0.06] text-slate-300 hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold">{prof.name}</span>
                          <span className="text-[9px] font-mono uppercase text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 rounded">
                            {prof.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{prof.description}</p>
                      </button>
                    ))}
                  </div>
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

                  {/* AI Procedural Background Music & Auto-Ducking */}
                  <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-3 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-purple-400" /> AI Procedural Music
                      </span>
                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                        Royalty Free
                      </span>
                    </div>

                    {/* Auto-Ducking Switch */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <div>
                        <p className="text-[11px] font-semibold text-white">Smart Auto-Ducking</p>
                        <p className="text-[9px] text-slate-400">Lowers music by 75% when speech is detected</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAutoDuckingEnabled(!autoDuckingEnabled)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          autoDuckingEnabled
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'bg-white/10 text-slate-400'
                        }`}
                      >
                        {autoDuckingEnabled ? 'ENABLED' : 'OFF'}
                      </button>
                    </div>

                    {/* Procedural Loops List */}
                    <div className="space-y-1.5">
                      {PROCEDURAL_MUSIC_TRACKS.map((t) => {
                        const isPlaying = selectedProceduralTrack === t.id && isPlayingProcedural;
                        return (
                          <div
                            key={t.id}
                            className={`p-2 rounded-xl border text-xs transition-all flex items-center justify-between ${
                              isPlaying
                                ? 'bg-purple-600/20 border-purple-500 text-white'
                                : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <span className="text-sm flex-shrink-0">{t.icon}</span>
                              <div className="overflow-hidden">
                                <p className="text-[11px] font-bold text-white truncate">{t.name}</p>
                                <span className="text-[9px] text-purple-300">{t.genre} • {t.bpm} BPM</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleToggleProceduralMusic(t.id)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                                isPlaying
                                  ? 'bg-purple-600 text-white animate-pulse'
                                  : 'bg-white/10 hover:bg-white/20 text-white'
                              }`}
                            >
                              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                              <span>{isPlaying ? 'Stop' : 'Play'}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
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

                {/* Advanced Subtitle Styling Presets */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] text-amber-300 font-bold block">
                      Viral Typography Presets ({SUBTITLE_DESIGN_PRESETS.length})
                    </label>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                      Custom Studio
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SUBTITLE_DESIGN_PRESETS.map((preset) => {
                      const isSelected = customSubtitleStyling.presetId === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setCustomSubtitleStyling({
                              ...preset.styling,
                              fontSize: subtitleSize,
                              position: subtitlePosition,
                            });
                            if (preset.id === 'cyberpunk-neon') setSubtitleStyle('neon');
                            else if (preset.id === 'monochrome-bold') setSubtitleStyle('minimal');
                            else setSubtitleStyle('hormozi');
                            toast.success(`Applied ${preset.name} styling preset!`);
                          }}
                          className={`p-2 rounded-xl border text-left transition-all relative ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-400 text-white font-bold shadow-md shadow-amber-900/20 ring-1 ring-amber-400/60'
                              : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-base">{preset.icon}</span>
                            {isSelected && <Check className="w-3 h-3 text-amber-400 stroke-[3]" />}
                          </div>
                          <span className="text-[11px] font-bold text-white block truncate">{preset.name}</span>
                          <span className="text-[8px] text-slate-400 block line-clamp-1 mt-0.5">{preset.description}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Granular Typography Controls */}
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3">
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                    Typography Micro-Tuning
                  </span>

                  {/* Font Family */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 block">Font Family</label>
                    <select
                      value={customSubtitleStyling.fontFamily}
                      onChange={(e) =>
                        setCustomSubtitleStyling((prev) => ({ ...prev, fontFamily: e.target.value }))
                      }
                      className="w-full py-1.5 px-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      {AVAILABLE_FONTS.map((f) => (
                        <option key={f.value} value={f.value} className="bg-neutral-900 text-white">
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Stroke Width Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Outline Stroke Width</span>
                      <span className="text-amber-400 font-mono font-bold">{customSubtitleStyling.strokeWidth}px</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={6}
                      step={1}
                      value={customSubtitleStyling.strokeWidth}
                      onChange={(e) =>
                        setCustomSubtitleStyling((prev) => ({
                          ...prev,
                          strokeWidth: parseInt(e.target.value),
                        }))
                      }
                      className="w-full accent-amber-400 h-1.5"
                    />
                  </div>

                  {/* Emoji Bounce Toggle & Casing */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-300">Emoji Bounce Effect</span>
                    <button
                      type="button"
                      onClick={() =>
                        setCustomSubtitleStyling((prev) => ({
                          ...prev,
                          showEmojis: !prev.showEmojis,
                        }))
                      }
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        customSubtitleStyling.showEmojis
                          ? 'bg-amber-500 text-black shadow-sm'
                          : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      {customSubtitleStyling.showEmojis ? 'BOUNCING ON' : 'OFF'}
                    </button>
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
                    onChange={(e) => {
                      const sz = parseInt(e.target.value);
                      setSubtitleSize(sz);
                      setCustomSubtitleStyling((prev) => ({ ...prev, fontSize: sz }));
                    }}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">Position</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['top', 'center', 'bottom'].map((pos) => (
                      <button
                        key={pos}
                        onClick={() => {
                          setSubtitlePosition(pos as any);
                          setCustomSubtitleStyling((prev) => ({ ...prev, position: pos as any }));
                        }}
                        className={`py-1.5 rounded-lg text-xs font-medium capitalize border ${
                          subtitlePosition === pos
                            ? 'bg-purple-600/30 border-purple-500 text-white font-bold'
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

            {activeTab === 'stickers' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Smile className="w-3.5 h-3.5 text-amber-400" /> Reaction Stickers & Emojis
                  </h4>
                  <span className="text-[10px] text-amber-300 font-mono font-semibold">
                    {operations.filter((op) => op.type === 'sticker_emoji').length} Active
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAutoScanStickers}
                    className="flex-1 py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Auto-Scan Keywords
                  </button>
                </div>

                {/* Sticker Library Grid */}
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-300">Select Sticker</label>
                  <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 bg-black/30 rounded-xl border border-white/[0.06]">
                    {STICKER_LIBRARY.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setSelectedSticker(item.id);
                          setStickerAnimation(item.defaultAnimation);
                        }}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                          selectedSticker === item.id
                            ? 'bg-amber-500/25 border-amber-400 text-white shadow-md scale-105'
                            : 'bg-white/[0.02] border-white/[0.06] text-slate-300 hover:bg-white/[0.05]'
                        }`}
                      >
                        <span className="text-2xl">{item.emoji}</span>
                        <span className="text-[9px] font-semibold truncate w-full text-center opacity-80">
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Animation & Position */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Animation</label>
                    <select
                      value={stickerAnimation}
                      onChange={(e) => setStickerAnimation(e.target.value as any)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    >
                      <option value="pop-bounce">Pop Bounce</option>
                      <option value="spin-in">Spin In (360°)</option>
                      <option value="pulse-glow">Pulse Glow</option>
                      <option value="slide-up">Slide Up</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Position</label>
                    <select
                      value={stickerPosition}
                      onChange={(e) => setStickerPosition(e.target.value as any)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    >
                      <option value="top-right">Top Right</option>
                      <option value="top-left">Top Left</option>
                      <option value="center">Center Pop</option>
                      <option value="bottom-right">Bottom Right</option>
                      <option value="bottom-left">Bottom Left</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Duration</span>
                    <span className="font-mono text-amber-400">{stickerDuration}s</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={6}
                    step={0.5}
                    value={stickerDuration}
                    onChange={(e) => setStickerDuration(parseFloat(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                {/* Insert Button */}
                <button
                  onClick={() => handleInsertSticker()}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-xs font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Insert Sticker at {formatTime(currentTime)}
                </button>

                {/* Active Stickers on Timeline */}
                <div className="space-y-2 pt-2 border-t border-white/[0.08]">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Stickers on Timeline
                  </span>
                  {operations.filter((op) => op.type === 'sticker_emoji').length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic">No stickers on timeline yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {operations
                        .filter((op) => op.type === 'sticker_emoji')
                        .map((op) => (
                          <div
                            key={op.id}
                            className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between text-xs"
                          >
                            <div className="truncate">
                              <span className="font-semibold text-white truncate block">{op.name}</span>
                              <span className="text-[10px] text-amber-400 font-mono">
                                @ {formatTime(op.details?.startTime || 0)} ({op.details?.duration || 2.5}s)
                              </span>
                            </div>
                            <button
                              onClick={() => handleRemoveOverlayOp(op.id)}
                              className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Delete Sticker"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'retention' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" /> Retention Graph & Heatmap
                  </h4>
                  <button
                    onClick={handleRunRetentionAnalysis}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold underline"
                  >
                    Simulate
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 leading-snug">
                  Predictive timeline heatmap detecting audience drop-off risk and boredom spikes.
                </p>

                {/* Big Score Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/30 to-[#0A0E1A] border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-medium">Projected Completion</span>
                    <span className="text-2xl font-black font-mono text-emerald-400">
                      {retentionReport ? `${retentionReport.overallRetentionScore}%` : '85%'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-[10px] text-slate-400 block">Avg Visual Pace</span>
                      <span className="font-mono font-bold text-cyan-300">
                        {retentionReport ? `${retentionReport.averagePaceInterval}s` : '2.8s'}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-[10px] text-slate-400 block">Boredom Spikes</span>
                      <span className="font-mono font-bold text-amber-300">
                        {retentionReport ? `${retentionReport.boredomGapsCount}` : '1 detected'}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleRunRetentionAnalysis}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Activity className="w-4 h-4" /> Run Audience Retention Simulation
                </button>

                {/* Heatmap Legend */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Timeline Color Key
                  </span>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> High (75%+)
                    </span>
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Medium (50-74%)
                    </span>
                    <span className="flex items-center gap-1.5 text-rose-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Churn Risk (&lt;50%)
                    </span>
                  </div>
                </div>

                {/* Actionable Recommendations */}
                {retentionReport?.actions && retentionReport.actions.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-white/[0.08]">
                    <span className="text-[11px] font-bold text-white uppercase tracking-wider block">
                      Retention Fixes
                    </span>
                    <div className="space-y-2">
                      {retentionReport.actions.map((act) => (
                        <div
                          key={act.id}
                          className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-emerald-500/40 transition-all space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-white">{act.title}</span>
                            <span className="text-[10px] font-mono text-cyan-400">
                              @ {formatTime(act.timestamp)}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400">{act.description}</p>
                          <button
                            onClick={() => {
                              if (videoRef.current) {
                                videoRef.current.currentTime = act.timestamp;
                                setCurrentTime(act.timestamp);
                              }
                              if (act.type === 'add_broll') setActiveTab('stock');
                              if (act.type === 'add_sticker') setActiveTab('stickers');
                              if (act.type === 'add_sfx') setActiveTab('sfx');
                            }}
                            className="text-[10px] font-bold text-emerald-400 hover:underline pt-1 block"
                          >
                            Jump to Playhead & Fix →
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'callouts' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <AtSign className="w-3.5 h-3.5 text-cyan-400" /> Social Callouts & Badges
                  </h4>
                  <span className="text-[10px] text-purple-400 font-mono font-semibold">
                    {operations.filter((op) => op.type === 'callout_badge').length} Active
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-snug">
                  Add eye-catching lower-third banners, subscriber badges, and follow prompts with spring physics.
                </p>

                {/* Preset Selector */}
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-300">Preset Template</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CALLOUT_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => {
                          setSelectedCalloutPreset(preset.id);
                          setCalloutTitle(preset.defaultTitle);
                          setCalloutSubtitle(preset.defaultSubtitle);
                        }}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all flex flex-col gap-1 ${
                          selectedCalloutPreset === preset.id
                            ? 'bg-purple-600/25 border-purple-500 text-white font-bold shadow-sm'
                            : 'bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-bold"
                            style={{ backgroundColor: `${preset.badgeColor}30`, color: preset.badgeColor }}
                          >
                            {preset.icon}
                          </span>
                          <span className="truncate font-semibold">{preset.name}</span>
                        </div>
                        <span className="text-[10px] opacity-70 truncate">{preset.defaultTitle}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Text Fields */}
                <div className="space-y-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Headline Text</label>
                    <input
                      type="text"
                      value={calloutTitle}
                      onChange={(e) => setCalloutTitle(e.target.value)}
                      placeholder="e.g. Subscribe on YouTube"
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Subtitle / Handle</label>
                    <input
                      type="text"
                      value={calloutSubtitle}
                      onChange={(e) => setCalloutSubtitle(e.target.value)}
                      placeholder="e.g. @yourchannel"
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Position & Duration */}
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-300 block">Position on Screen</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'bottom-left', label: 'Bottom Left' },
                      { id: 'bottom-center', label: 'Bottom Center' },
                      { id: 'bottom-right', label: 'Bottom Right' },
                      { id: 'top-right', label: 'Top Right' },
                    ].map((pos) => (
                      <button
                        key={pos.id}
                        onClick={() => setCalloutPosition(pos.id as any)}
                        className={`py-1.5 px-2 rounded-xl text-[11px] border font-medium transition-all ${
                          calloutPosition === pos.id
                            ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 font-bold'
                            : 'bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white'
                        }`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Display Duration</span>
                    <span className="font-mono text-cyan-400">{calloutDuration}s</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={0.5}
                    value={calloutDuration}
                    onChange={(e) => setCalloutDuration(parseFloat(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                {/* Insert Button */}
                <button
                  onClick={handleInsertCallout}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Insert Callout at {formatTime(currentTime)}
                </button>

                {/* Active Callouts on Timeline */}
                <div className="space-y-2 pt-2 border-t border-white/[0.08]">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Callouts on Timeline
                  </span>
                  {operations.filter((op) => op.type === 'callout_badge').length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic">No callouts added yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {operations
                        .filter((op) => op.type === 'callout_badge')
                        .map((op) => (
                          <div
                            key={op.id}
                            className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between text-xs"
                          >
                            <div className="truncate">
                              <span className="font-semibold text-white truncate block">{op.name}</span>
                              <span className="text-[10px] text-cyan-400 font-mono">
                                @ {formatTime(op.details?.startTime || 0)} ({op.details?.duration || 3}s)
                              </span>
                            </div>
                            <button
                              onClick={() => handleRemoveOverlayOp(op.id)}
                              className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Delete Callout"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'filters' && (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" /> Hollywood LUT Presets
                    </h4>
                    <button
                      onClick={handleResetGrading}
                      className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 underline"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {COLOR_LUT_PRESETS.map((lut) => (
                      <button
                        key={lut.id}
                        onClick={() => handleLUTPresetSelect(lut.id)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                          selectedLUTPreset === lut.id
                            ? 'bg-purple-600/30 border-purple-500 text-white font-bold shadow-sm'
                            : 'bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="font-bold truncate text-white">{lut.name}</div>
                        <div className="text-[10px] opacity-70 truncate">{lut.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Legacy Base Filters */}
                <div className="space-y-2 pt-2 border-t border-white/[0.08]">
                  <label className="text-[11px] font-semibold text-slate-300 block">Base Tint Profiles</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'clean', name: 'Clean' },
                      { id: 'warm', name: 'Warm' },
                      { id: 'cool', name: 'Cool' },
                      { id: 'cinematic', name: 'Cinema' },
                      { id: 'bw', name: 'B&W' },
                    ].map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setSelectedFilter(filter.id as any)}
                        className={`py-1.5 px-2 rounded-xl border text-[11px] text-center transition-all ${
                          selectedFilter === filter.id
                            ? 'bg-indigo-600/30 border-indigo-500 text-white font-bold'
                            : 'bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white'
                        }`}
                      >
                        {filter.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Color Grading Sliders */}
                <div className="space-y-3 pt-2 border-t border-white/[0.08]">
                  <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Precision Sliders
                  </h4>

                  {/* Brightness */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Brightness</span>
                      <span className="font-mono text-cyan-400">{colorAdjustments.brightness > 0 ? `+${colorAdjustments.brightness}` : colorAdjustments.brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min={-50}
                      max={50}
                      value={colorAdjustments.brightness}
                      onChange={(e) =>
                        setColorAdjustments((prev) => ({ ...prev, brightness: parseInt(e.target.value, 10) }))
                      }
                      className="w-full accent-purple-500"
                    />
                  </div>

                  {/* Contrast */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Contrast</span>
                      <span className="font-mono text-cyan-400">{colorAdjustments.contrast > 0 ? `+${colorAdjustments.contrast}` : colorAdjustments.contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min={-50}
                      max={50}
                      value={colorAdjustments.contrast}
                      onChange={(e) =>
                        setColorAdjustments((prev) => ({ ...prev, contrast: parseInt(e.target.value, 10) }))
                      }
                      className="w-full accent-purple-500"
                    />
                  </div>

                  {/* Saturation */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Saturation</span>
                      <span className="font-mono text-cyan-400">{colorAdjustments.saturation > 0 ? `+${colorAdjustments.saturation}` : colorAdjustments.saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min={-50}
                      max={100}
                      value={colorAdjustments.saturation}
                      onChange={(e) =>
                        setColorAdjustments((prev) => ({ ...prev, saturation: parseInt(e.target.value, 10) }))
                      }
                      className="w-full accent-purple-500"
                    />
                  </div>

                  {/* Temperature */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Color Temperature</span>
                      <span className="font-mono text-cyan-400">{colorAdjustments.temperature > 0 ? `+${colorAdjustments.temperature} Warm` : colorAdjustments.temperature < 0 ? `${colorAdjustments.temperature} Cool` : '0 Neutral'}</span>
                    </div>
                    <input
                      type="range"
                      min={-50}
                      max={50}
                      value={colorAdjustments.temperature}
                      onChange={(e) =>
                        setColorAdjustments((prev) => ({ ...prev, temperature: parseInt(e.target.value, 10) }))
                      }
                      className="w-full accent-amber-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-purple-400" /> Version History & Snapshots
                  </h4>
                  <span className="text-[10px] text-purple-300 font-mono font-semibold">
                    {snapshots.length} Snapshots
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-snug">
                  Save snapshot checkpoints of your project timeline and roll back anytime with zero data loss.
                </p>

                {/* Create Snapshot Button */}
                <button
                  onClick={() => handleSaveSnapshot()}
                  className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Current Milestone
                </button>

                {/* Snapshots List */}
                <div className="space-y-2 pt-2 border-t border-white/[0.08]">
                  <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
                    Saved Checkpoints
                  </span>

                  {snapshots.length === 0 ? (
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-center space-y-1">
                      <p className="text-xs text-slate-400 font-medium">No snapshots saved yet</p>
                      <p className="text-[10px] text-slate-500">
                        Click "Save Current Milestone" or press [M] to create a rollback checkpoint.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {snapshots.map((snap) => (
                        <div
                          key={snap.id}
                          className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-purple-500/40 transition-all space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="font-bold text-xs text-white block">{snap.name}</span>
                              <span className="text-[10px] text-slate-400">
                                {snap.formattedTime}
                              </span>
                            </div>
                            <button
                              onClick={() => handleDeleteSnapshot(snap.id)}
                              className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Delete Snapshot"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-300/90 bg-black/30 px-2 py-1 rounded-lg">
                            <span>{snap.operations.length} actions</span>
                            <span>•</span>
                            <span>{snap.aspectRatio}</span>
                            <span>•</span>
                            <span>LUT: {snap.selectedFilter || 'clean'}</span>
                          </div>

                          <button
                            onClick={() => handleRestoreSnapshot(snap)}
                            className="w-full py-1.5 px-3 rounded-lg bg-white/[0.06] hover:bg-purple-600/30 text-xs font-semibold text-purple-300 hover:text-white border border-purple-500/30 transition-all flex items-center justify-center gap-1.5"
                          >
                            <RotateCcw className="w-3 h-3" /> Restore Snapshot
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'storyboard' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-amber-400" /> AI Storyboard & Director
                  </h4>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded-full font-bold">
                    Multi-Scene
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Select a proven narrative framework to automatically generate pacing, shot descriptions, B-roll cues, and word-for-word scripts.
                </p>

                {/* Framework Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-medium">Framework & Formula</label>
                  <div className="space-y-1.5">
                    {STORYBOARD_FRAMEWORKS.map((fw) => (
                      <button
                        key={fw.id}
                        type="button"
                        onClick={() => setSelectedStoryboardFramework(fw.id)}
                        className={`w-full p-2.5 rounded-xl border text-left transition-all ${
                          selectedStoryboardFramework === fw.id
                            ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-sm'
                            : 'bg-black/30 border-white/[0.06] text-slate-300 hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-300">{fw.name}</span>
                          <span className="text-[9px] font-mono text-slate-400">{fw.sceneCount} Scenes • {fw.targetAudience}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">{fw.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Topic Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-medium">Video Topic / Concept</label>
                  <input
                    type="text"
                    value={storyboardTopic}
                    onChange={(e) => setStoryboardTopic(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    placeholder="e.g. 3 AI Tools that will replace video editors"
                  />
                </div>

                {/* Generate Storyboard Button */}
                <button
                  type="button"
                  onClick={handleGenerateStoryboard}
                  disabled={isGeneratingStoryboard}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>{isGeneratingStoryboard ? 'Generating Scene Plan...' : 'Generate Multi-Scene Storyboard'}</span>
                </button>

                {/* Generated Scenes */}
                {storyboardScenes.length > 0 && (
                  <div className="space-y-3 pt-2 border-t border-white/[0.08]">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                        {storyboardScenes.length} Directing Scenes
                      </span>
                      <button
                        type="button"
                        onClick={handleApplyStoryboardToTimeline}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-[10px] font-extrabold text-emerald-300 transition-all flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Apply to Timeline
                      </button>
                    </div>

                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {storyboardScenes.map((scene) => (
                        <div
                          key={scene.sceneNumber}
                          className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.07] space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white flex items-center gap-1">
                              <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[9px] font-mono">
                                {scene.sceneNumber}
                              </span>
                              {scene.name}
                            </span>
                            <span className="text-[10px] font-mono text-amber-400 bg-black/40 px-1.5 py-0.5 rounded">
                              {scene.duration.toFixed(1)}s
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-300 italic bg-black/20 p-1.5 rounded border border-white/[0.04]">
                            &quot;{scene.scriptText}&quot;
                          </p>
                          <div className="grid grid-cols-2 gap-1 text-[9px] text-slate-400 font-mono">
                            <div><span className="text-slate-500">Purpose:</span> {scene.purpose}</div>
                            <div><span className="text-slate-500">B-Roll:</span> {scene.suggestedBrollTitle}</div>
                            <div><span className="text-slate-500">SFX:</span> {scene.foleySFX || 'None'}</div>
                            <div><span className="text-slate-500">Motion:</span> {scene.kenBurnsMotion} {scene.reactionSticker || ''}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'splitscreen' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Split className="w-3.5 h-3.5 text-pink-400" /> Split-Screen & PIP Studio
                  </h4>
                  <span className="text-[10px] bg-pink-500/20 text-pink-300 font-mono px-2 py-0.5 rounded-full font-bold">
                    Duet / Reaction
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Composite dual videos for TikTok Duets, Reaction Shorts, Podcast Facecams, or Gaming streams.
                </p>

                {/* Layout Presets */}
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-medium">Layout Style</label>
                  <div className="space-y-1.5">
                    {SPLIT_SCREEN_LAYOUTS.map((layout) => (
                      <button
                        key={layout.id}
                        type="button"
                        onClick={() => handleSelectSplitLayout(layout.id)}
                        className={`w-full p-2.5 rounded-xl border text-left transition-all ${
                          splitScreenLayout === layout.id
                            ? 'bg-pink-500/20 border-pink-400 text-white shadow-sm'
                            : 'bg-black/30 border-white/[0.06] text-slate-300 hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-pink-300">{layout.name}</span>
                          <span className="text-[9px] font-mono text-slate-400 uppercase">{layout.idealAspect}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">{layout.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Secondary Media URL */}
                <div className="space-y-2 pt-2 border-t border-white/[0.08]">
                  <label className="text-[10px] text-slate-400 font-medium">Secondary Media Asset (URL / B-Roll)</label>
                  <input
                    type="text"
                    value={secondaryMediaUrl}
                    onChange={(e) => setSecondaryMediaUrl(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-400 font-mono text-[11px]"
                    placeholder="https://... image or video URL"
                  />
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSecondaryMediaUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80');
                        toast.success('Loaded portrait creator facecam');
                      }}
                      className="py-1.5 px-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[10px] text-slate-300 border border-white/[0.06]"
                    >
                      Preset: Facecam
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSecondaryMediaUrl('https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80');
                        toast.success('Loaded gaming background');
                      }}
                      className="py-1.5 px-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[10px] text-slate-300 border border-white/[0.06]"
                    >
                      Preset: Gameplay
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'shake' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Move className="w-3.5 h-3.5 text-cyan-400" /> Motion Blur & Camera Shake
                  </h4>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-mono px-2 py-0.5 rounded-full font-bold">
                    Physics Engine
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  High-frequency screen shake vectors simulate explosive physical camera impacts synced to beats, punchlines, and SFX hits.
                </p>

                {/* Shake Presets */}
                <div className="space-y-2">
                  {SHAKE_PRESETS.map((preset) => (
                    <div
                      key={preset.id}
                      className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.07] space-y-2 hover:border-cyan-500/40 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{preset.name}</span>
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-1.5 py-0.5 rounded">
                          {preset.defaultDuration}s • ±{preset.maxOffsetPx}px
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">{preset.description}</p>
                      <button
                        type="button"
                        onClick={() => handleTriggerCameraShake(preset.id)}
                        className="w-full py-1.5 px-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold text-xs border border-cyan-500/40 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5 text-cyan-400" /> Trigger Shake at {currentTime.toFixed(1)}s
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'highlights' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-orange-400" /> Viral Highlights Extractor
                  </h4>
                  <span className="text-[10px] bg-orange-500/20 text-orange-300 font-mono px-2 py-0.5 rounded-full font-bold">
                    Shorts / Reels
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  AI scans audio pacing and dialogue keywords to extract the top 3–5 highest-retention micro-clips for TikTok and Shorts.
                </p>

                <button
                  type="button"
                  onClick={handleExtractHighlights}
                  disabled={isExtractingHighlights}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-extrabold text-xs shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isExtractingHighlights ? 'Scanning Virality Signals...' : 'Extract Top Viral Highlights'}</span>
                </button>

                {extractedHighlights.length > 0 && (
                  <div className="space-y-2.5 pt-2 border-t border-white/[0.08]">
                    <span className="text-[11px] font-bold text-orange-300 uppercase tracking-wider block">
                      {extractedHighlights.length} Ranked Micro-Clips
                    </span>

                    {extractedHighlights.map((hl) => (
                      <div
                        key={hl.id}
                        className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2 hover:border-orange-500/40 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white truncate max-w-[170px]">{hl.title}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30 font-bold">
                            Score: {hl.viralityScore}/100
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>{hl.startTime}s - {hl.endTime}s ({hl.duration}s)</span>
                          <span className="bg-black/40 px-1.5 py-0.5 rounded text-cyan-300">{hl.recommendedAspect}</span>
                        </div>

                        <p className="text-[10px] text-slate-300 italic bg-black/30 p-1.5 rounded border border-white/[0.04] line-clamp-2">
                          &quot;{hl.hookSentence}&quot;
                        </p>

                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleApplyHighlightRange(hl)}
                            className="flex-1 py-1.5 px-2.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 text-[10px] font-bold border border-orange-500/40 transition-all flex items-center justify-center gap-1"
                          >
                            <Scissors className="w-3 h-3" /> Load as Trim ({hl.recommendedAspect})
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'translate' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-cyan-400" /> Multi-Language Translator
                  </h4>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-mono px-2 py-0.5 rounded-full font-bold">
                    12 Languages
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Localize your subtitles and voiceover into global markets with 1-click vocabulary translation.
                </p>

                {/* Language Selector Grid */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-medium">Target Language</label>
                  <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => handleTranslateSubtitles(lang.code)}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          selectedLanguage === lang.code
                            ? 'bg-cyan-600/30 border-cyan-400 text-white font-bold'
                            : 'bg-black/30 border-white/[0.06] text-slate-300 hover:bg-white/[0.04]'
                        }`}
                      >
                        <span className="text-base">{lang.flag}</span>
                        <div className="truncate">
                          <p className="text-[11px] font-semibold truncate">{lang.name}</p>
                          <p className="text-[9px] text-slate-400 truncate">{lang.nativeName}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Translation Output Preview */}
                {translatedSubtitle && (
                  <div className="p-3 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-cyan-300 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Translated Subtitle Output
                      </span>
                      <span className="text-[9px] font-mono text-slate-400 uppercase">
                        {selectedLanguage}
                      </span>
                    </div>

                    <p className="text-xs text-white p-2.5 rounded-xl bg-black/40 border border-white/[0.06] leading-relaxed">
                      {translatedSubtitle}
                    </p>

                    <button
                      type="button"
                      onClick={handleApplyTranslatedToSubtitles}
                      className="w-full py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black font-extrabold text-xs shadow-md shadow-cyan-500/20 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" /> Apply Translated Subtitles to Video
                    </button>
                  </div>
                )}
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
              } ${activeCameraShake ? 'animate-pulse scale-[1.02] rotate-1' : ''}`}
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
                            style={{ filter: activeCompositeFilter || undefined }}
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
                          style={{ filter: activeCompositeFilter || undefined }}
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

                      {/* Split-Screen / PIP Live Studio Overlay Preview */}
                      {splitScreenLayout !== 'none' && secondaryMediaUrl && (
                        <>
                          {splitScreenLayout === 'pip-circle' && (
                            <div className="absolute top-4 right-4 z-20 w-32 h-32 rounded-full overflow-hidden shadow-2xl border-2 border-pink-400 bg-black pointer-events-none ring-4 ring-pink-500/30">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={secondaryMediaUrl} alt="PIP Facecam" className="w-full h-full object-cover" />
                              <span className="absolute bottom-1 inset-x-0 text-center text-[8px] font-extrabold bg-black/70 text-pink-300 py-0.5">
                                FACECAM
                              </span>
                            </div>
                          )}
                          {splitScreenLayout === 'pip-rect' && (
                            <div className="absolute bottom-4 right-4 z-20 w-44 aspect-video rounded-xl overflow-hidden shadow-2xl border-2 border-pink-400 bg-black pointer-events-none ring-4 ring-pink-500/30">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={secondaryMediaUrl} alt="PIP Rect" className="w-full h-full object-cover" />
                              <span className="absolute bottom-1 left-1 text-[8px] font-extrabold bg-pink-600 text-white px-1.5 py-0.5 rounded shadow">
                                PIP REACTION
                              </span>
                            </div>
                          )}
                          {splitScreenLayout === 'top-bottom' && (
                            <div className="absolute bottom-0 inset-x-0 h-1/2 z-20 overflow-hidden shadow-2xl border-t-2 border-pink-500/80 bg-black pointer-events-none">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={secondaryMediaUrl} alt="Bottom Split" className="w-full h-full object-cover" />
                              <span className="absolute top-2 left-2 text-[8px] font-extrabold bg-pink-600 text-white px-1.5 py-0.5 rounded shadow">
                                SPLIT DUAL VIEW
                              </span>
                            </div>
                          )}
                          {splitScreenLayout === 'side-by-side' && (
                            <div className="absolute top-0 right-0 bottom-0 w-1/2 z-20 overflow-hidden shadow-2xl border-l-2 border-pink-500/80 bg-black pointer-events-none">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={secondaryMediaUrl} alt="Right Split" className="w-full h-full object-cover" />
                              <span className="absolute top-2 right-2 text-[8px] font-extrabold bg-pink-600 text-white px-1.5 py-0.5 rounded shadow">
                                SIDE-BY-SIDE DUET
                              </span>
                            </div>
                          )}
                        </>
                      )}

                      {/* Custom Creator Brand Kit & Watermark Live Overlay */}
                      {brandKit.enabled && brandKit.logoUrl && (
                        <div
                          className={`absolute z-25 pointer-events-none transition-all ${
                            brandKit.logoPosition === 'top-left'
                              ? 'top-4 left-4'
                              : brandKit.logoPosition === 'bottom-left'
                              ? 'bottom-4 left-4'
                              : brandKit.logoPosition === 'bottom-right'
                              ? 'bottom-4 right-4 text-right'
                              : 'top-4 right-4 text-right'
                          }`}
                          style={{ opacity: brandKit.logoOpacity }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={brandKit.logoUrl}
                            alt="Creator Brand Watermark"
                            className="object-contain drop-shadow-lg inline-block"
                            style={{ width: `${Math.round(brandKit.logoSizePx * 0.75)}px` }}
                          />
                          {brandKit.showHandleBadge && brandKit.creatorHandle && (
                            <p
                              className="text-[10px] font-bold drop-shadow tracking-tight mt-1"
                              style={{ color: brandKit.primaryColor }}
                            >
                              {brandKit.creatorHandle}
                            </p>
                          )}
                        </div>
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
                  customStyling={customSubtitleStyling}
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

              {/* Active Animated Social Callouts & Lower-Thirds Preview Overlay */}
              {operations
                .filter((op) => op.type === 'callout_badge' && op.details)
                .filter(
                  (op) =>
                    currentTime >= Number(op.details.startTime) &&
                    currentTime <= Number(op.details.startTime) + Number(op.details.duration)
                )
                .map((op) => {
                  const pos = op.details.position || 'bottom-left';
                  const posClasses =
                    pos === 'top-right'
                      ? 'top-5 right-5'
                      : pos === 'bottom-center'
                      ? 'bottom-14 left-1/2 -translate-x-1/2'
                      : pos === 'bottom-right'
                      ? 'bottom-14 right-5'
                      : 'bottom-14 left-5';
                  const preset = CALLOUT_PRESETS.find((p) => p.id === op.details.presetId) || CALLOUT_PRESETS[0];

                  return (
                    <div
                      key={op.id}
                      className={`absolute z-30 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${posClasses}`}
                    >
                      <div
                        className="flex items-center gap-3 px-4 py-2.5 rounded-2xl shadow-2xl border backdrop-blur-md bg-black/85"
                        style={{
                          borderColor: `${preset.badgeColor}80`,
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shadow-md"
                          style={{
                            backgroundColor: preset.badgeColor,
                            color: '#FFFFFF',
                          }}
                        >
                          {preset.icon}
                        </div>
                        <div className="flex flex-col">
                          <span
                            className="text-xs font-black tracking-wide text-white"
                          >
                            {op.details.title || op.name}
                          </span>
                          {op.details.subtitle && (
                            <span
                              className="text-[10px] font-medium opacity-80 text-slate-300"
                            >
                              {op.details.subtitle}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

              {/* Active Reaction Stickers & Emojis Preview Overlay */}
              {operations
                .filter((op) => op.type === 'sticker_emoji' && op.details)
                .filter(
                  (op) =>
                    currentTime >= Number(op.details.startTime) &&
                    currentTime <= Number(op.details.startTime) + Number(op.details.duration)
                )
                .map((op) => {
                  const pos = op.details.position || 'top-right';
                  const posClasses =
                    pos === 'top-left'
                      ? 'top-8 left-8'
                      : pos === 'top-right'
                      ? 'top-8 right-8'
                      : pos === 'center'
                      ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                      : pos === 'bottom-left'
                      ? 'bottom-20 left-8'
                      : 'bottom-20 right-8';

                  return (
                    <div
                      key={op.id}
                      className={`absolute z-30 pointer-events-none transition-all duration-300 animate-in zoom-in-50 ${posClasses}`}
                    >
                      <div className="flex flex-col items-center justify-center drop-shadow-2xl">
                        <span className="text-6xl drop-shadow-lg filter select-none">
                          {op.details.emoji}
                        </span>
                        {op.details.label && (
                          <span className="text-[11px] font-black tracking-wider px-2 py-0.5 rounded-full bg-black/70 border border-white/20 text-white shadow">
                            {op.details.label}
                          </span>
                        )}
                      </div>
                    </div>
                  );
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
              <button
                type="button"
                onClick={() => handleAddMarker(selectedMarkerType, `${selectedMarkerType.toUpperCase()} ${currentTime.toFixed(1)}s`)}
                className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 text-[11px] font-semibold border border-white/10 flex items-center gap-1.5 transition-all"
                title="Add Color-Coded Timeline Marker Flag at Playhead"
              >
                <Flag className="w-3.5 h-3.5 text-rose-400" />
                <span>+ Marker</span>
              </button>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10">
                1080p 60fps
              </span>
            </div>
          </div>

          {/* Interactive Multi-Track Timeline Simulation */}
          <div className="h-44 bg-[#0B0F1C] border-t border-white/[0.08] p-4 flex flex-col justify-between select-none">
            {/* AI Audience Retention Drop-Off Heatmap Strip */}
            <div
              className="relative w-full h-1.5 rounded-full overflow-hidden flex bg-white/5 border border-white/10 mb-1"
              title="Audience Retention Heatmap (Green = High Retention, Amber = Moderate, Red = Drop-off Risk)"
            >
              {(retentionReport?.retentionSegments || [
                { start: 0, end: duration * 0.25, level: 'high' as const },
                { start: duration * 0.25, end: duration * 0.6, level: 'medium' as const },
                { start: duration * 0.6, end: duration * 0.75, level: 'risk' as const },
                { start: duration * 0.75, end: duration, level: 'high' as const },
              ]).map((seg, sIdx) => {
                const segWidth = ((seg.end - seg.start) / (duration || 1)) * 100;
                return (
                  <div
                    key={sIdx}
                    style={{ width: `${segWidth}%` }}
                    className={`h-full transition-all ${
                      seg.level === 'high'
                        ? 'bg-emerald-500/70'
                        : seg.level === 'medium'
                        ? 'bg-amber-500/70'
                        : 'bg-rose-500/80 animate-pulse'
                    }`}
                  />
                );
              })}
            </div>

            {/* Playhead Scrubbing Rail with Interactive Timeline Marker Flags */}
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
                className="absolute top-0 w-3 h-4 bg-cyan-400 rounded-sm shadow-md shadow-cyan-400/50 -translate-x-1.5 cursor-ew-resize z-10"
                style={{ left: `${(currentTime / (duration || 1)) * 100}%` }}
              />

              {/* Color-Coded Marker Flags */}
              {timelineMarkers.map((marker) => {
                const markerPct = (marker.time / (duration || 1)) * 100;
                return (
                  <button
                    key={marker.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSeekToMarker(marker.time);
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteMarker(marker.id);
                    }}
                    title={`📍 ${marker.label} (${marker.time}s) — Click to seek, right-click to delete`}
                    className="absolute -top-1.5 -translate-x-1/2 z-20 group flex flex-col items-center cursor-pointer"
                    style={{ left: `${markerPct}%` }}
                  >
                    <Flag
                      className="w-3.5 h-3.5 filter drop-shadow hover:scale-125 transition-transform"
                      style={{ color: marker.color }}
                      fill={marker.color}
                    />
                    <span className="hidden group-hover:block absolute bottom-4 bg-black/90 text-[9px] font-mono text-white px-1.5 py-0.5 rounded shadow whitespace-nowrap border border-white/20 z-30">
                      {marker.label} ({marker.time}s)
                    </span>
                  </button>
                );
              })}
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

      {/* Batch Multi-Platform & Highlight GIF Snippet Export Studio */}
      <BatchExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onTriggerInBrowserRender={handleInBrowserRender}
        onTriggerCloudExport={handleCloudExport}
        videoElement={videoRef.current}
        projectTitle={project?.title || 'editflow'}
        currentTime={currentTime}
        duration={duration}
      />

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

      {/* In-Studio Webcam & Screen Recorder with AI Teleprompter Modal */}
      <RecordingStudioModal
        isOpen={showRecordingModal}
        onClose={() => setShowRecordingModal(false)}
        onAddRecordingToStudio={(recordedAsset) => {
          setMediaAssets((prev) => [recordedAsset, ...prev]);
          handleAddAssetToSequence(recordedAsset);
          addOperation('record_clip', `Recorded: ${recordedAsset.name}`, {
            id: recordedAsset.id,
            duration: recordedAsset.duration,
            url: recordedAsset.url,
          });
          toast.success(`🎬 Recording added to project assets & multi-clip sequence!`);
        }}
        teleprompterScript={voiceoverScript || subtitleText}
      />

      {/* NLE Keyboard Shortcuts Cheat Sheet Modal */}
      <KeyboardShortcutsModal
        isOpen={showKeyboardShortcutsModal}
        onClose={() => setShowKeyboardShortcutsModal(false)}
      />

      {/* Multi-Track Audio Mixer & Console Modal */}
      <AudioMixerModal
        isOpen={showAudioMixerModal}
        onClose={() => setShowAudioMixerModal(false)}
        mixerState={mixerState}
        onChangeMixerState={(newState) => {
          setMixerState(newState);
          setOriginalVolume(newState.stems.dialogue.volume);
          setMusicVolume(newState.stems.music.volume);
          setIsMuted(newState.stems.dialogue.isMuted);
          toast.success('Updated Audio Mixer levels');
        }}
      />

      {/* 1-Click Social Media Launch Kit & Metadata Exporter Modal */}
      <SocialPublisherModal
        isOpen={showSocialModal}
        onClose={() => setShowSocialModal(false)}
        title={project?.title || 'Viral Video'}
        transcript={subtitleText || project?.description || ''}
        duration={duration}
      />

      {/* Zapier, Make.com & Discord Webhooks Hub Modal */}
      <WebhookHubModal
        isOpen={showWebhookModal}
        onClose={() => setShowWebhookModal(false)}
        projectTitle={project?.title || 'Viral Video'}
        projectId={projectId || 'p-1'}
        duration={duration || 30}
      />

      {/* Custom Brand Kit & Watermark Studio Modal */}
      <BrandKitModal
        isOpen={showBrandKitModal}
        onClose={() => setShowBrandKitModal(false)}
        onUpdateBrandKit={(updatedKit) => {
          setBrandKit(updatedKit);
        }}
      />

      {/* Multi-Aspect Simultaneous Batch Render Queue Modal */}
      <BatchRenderQueueModal
        isOpen={showBatchQueueModal}
        onClose={() => setShowBatchQueueModal(false)}
        projectTitle={project?.title || 'Viral Video'}
        onRenderAspect={async (aspect) => {
          await handleInBrowserRender(aspect);
        }}
      />

      {/* AI Voice Persona & Custom Timbre Studio Modal */}
      <VoicePersonaModal
        isOpen={showVoicePersonaModal}
        onClose={() => setShowVoicePersonaModal(false)}
        sampleText={voiceoverScript || subtitleText}
        onApplyPersona={(persona) => {
          setActiveVoicePersona(persona);
          toast.success(`Applied voice timbre: ${persona.name}`);
        }}
      />

      {/* Master Export Matrix & Custom Codec / Bitrate Console Modal */}
      <ExportMatrixModal
        isOpen={showExportMatrixModal}
        onClose={() => setShowExportMatrixModal(false)}
        aspectRatio={aspectRatio}
        totalDuration={duration}
        onConfirmExport={(settings) => {
          setExportMatrixSettings(settings);
          toast.success(`Rendering Master in ${settings.resolutionTier.toUpperCase()} @ ${settings.fps} FPS...`);
          handleInBrowserRender(aspectRatio, settings);
        }}
      />
    </div>
  );
}
