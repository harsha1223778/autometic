'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/navigation/Sidebar';
import TopNav from '@/components/navigation/TopNav';
import {
  Wand2,
  Sparkles,
  Scissors,
  Volume2,
  Type,
  Music,
  Film,
  Play,
  Pause,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Download,
  Share2,
  AlertCircle,
  Clock,
  Layers,
  Check,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AutoEditorPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-edit toggles
  const [options, setOptions] = useState({
    removeSilence: true,
    trimEdges: true,
    removeFillerWords: true,
    autoSubtitles: true,
    normalizeAudio: true,
    reduceNoise: true,
    addMusic: true,
    sceneTransitions: true,
    createHighlights: false,
    aspectRatio: '16:9',
    style: 'Professional',
  });

  // AI Analysis State
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>({
    totalDuration: 45.0,
    scenesCount: 6,
    detectedSilences: [
      { start: 0.0, end: 1.8, duration: 1.8 },
      { start: 14.2, end: 16.5, duration: 2.3 },
      { start: 28.0, end: 30.1, duration: 2.1 },
      { start: 42.5, end: 45.0, duration: 2.5 },
    ],
    estimatedCuts: 8,
    detectedLanguage: 'English (US)',
    estimatedFinalDuration: 36.3,
  });

  // Edit Plan operations list
  const [editPlanGenerated, setEditPlanGenerated] = useState(false);
  const [planOperations, setPlanOperations] = useState<any[]>([]);

  // Render Job State
  const [jobId, setJobId] = useState<string | null>(null);
  const [renderStatus, setRenderStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle');
  const [renderProgress, setRenderProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState('');
  const [outputVideoUrl, setOutputVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.project) {
          setProject(data.project);
          if (data.project.duration) {
            setAnalysis((prev: any) => ({
              ...prev,
              totalDuration: data.project.duration,
              estimatedFinalDuration: Math.round(data.project.duration * 0.78),
            }));
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [projectId]);

  const toggleOption = (key: keyof typeof options) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGeneratePlan = async () => {
    setAnalyzing(true);
    toast.info('Analyzing footage and generating editing operations...');

    // Simulate smart operations generation based on active options
    setTimeout(() => {
      const ops: any[] = [];
      if (options.removeSilence) {
        ops.push({
          id: 'op-1',
          name: 'Remove Long Silences',
          desc: 'Trim 4 pauses exceeding 1.5s with audio crossfades',
          enabled: true,
          badge: '4 Cuts',
        });
      }
      if (options.trimEdges) {
        ops.push({
          id: 'op-2',
          name: 'Trim Start & End Dead Air',
          desc: 'Cut 1.8s intro pause and 2.5s outro pause',
          enabled: true,
          badge: 'Edge Trim',
        });
      }
      if (options.removeFillerWords) {
        ops.push({
          id: 'op-3',
          name: 'Filler Words Removal',
          desc: 'Excise detected "um", "uh", and stutter pauses',
          enabled: true,
          badge: 'Speech Clean',
        });
      }
      if (options.autoSubtitles) {
        ops.push({
          id: 'op-4',
          name: 'Auto Subtitles Synchronization',
          desc: 'Generate animated karaoke captions in lower third',
          enabled: true,
          badge: 'Subtitles',
        });
      }
      if (options.normalizeAudio) {
        ops.push({
          id: 'op-5',
          name: 'Broadcast Audio Normalization',
          desc: 'Target -14 LUFS loudness with dynamic vocal compression',
          enabled: true,
          badge: '-14 LUFS',
        });
      }
      if (options.addMusic) {
        ops.push({
          id: 'op-6',
          name: 'Curated Soundtrack Sync',
          desc: `Layer subtle ${options.style.toLowerCase()} backing track ducked at vocal speech`,
          enabled: true,
          badge: 'Music Mix',
        });
      }
      if (options.sceneTransitions) {
        ops.push({
          id: 'op-7',
          name: 'Scene Cut Transitions',
          desc: 'Apply 350ms smooth dissolve across 6 detected scene breaks',
          enabled: true,
          badge: 'Transitions',
        });
      }

      setPlanOperations(ops);
      setEditPlanGenerated(true);
      setAnalyzing(false);
      toast.success('Generated tailored edit plan with ' + ops.length + ' operations!');
    }, 1000);
  };

  const handleStartAutoEdit = async () => {
    setRenderStatus('processing');
    setRenderProgress(10);
    setCurrentStage('Ingesting video frames & audio streams...');

    try {
      const res = await fetch(`/api/projects/${projectId}/render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operations: planOperations,
          mode: 'auto',
          instructions: `Auto Edit: ${options.style} style, ${options.aspectRatio}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start render');

      setJobId(data.jobId);
      pollJobProgress(data.jobId);
    } catch (err: any) {
      toast.error(err.message || 'Render failed to start');
      setRenderStatus('idle');
    }
  };

  const pollJobProgress = (jId: string) => {
    const stages = [
      'Ingesting video frames...',
      'Analyzing audio waveforms & silence thresholds...',
      'Detecting scene boundaries & camera cut intervals...',
      'Transcribing speech and generating subtitle timing...',
      'Applying color grading, audio leveling, and ducking...',
      'Packaging final MP4 export container...',
    ];

    let step = 0;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/jobs/${jId}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data?.job) {
          setRenderProgress(data.job.progress);
          setCurrentStage(stages[step % stages.length]);
          step++;

          if (data.job.status === 'completed' || data.job.progress >= 100) {
            clearInterval(interval);
            setRenderProgress(100);
            setRenderStatus('completed');
            setOutputVideoUrl(data.job.outputVideoUrl || project?.originalVideoUrl);
            toast.success('Auto Edit render completed successfully!');
          }
        }
      } catch {
        clearInterval(interval);
      }
    }, 1500);
  };

  const toggleVideoPlayback = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#080B14] text-slate-100 flex">
      <Sidebar />
      <div className="flex-1 pl-64">
        <TopNav />

        <main className="pt-20 px-8 pb-16 max-w-7xl mx-auto space-y-8">
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-1">
                <Wand2 className="w-3.5 h-3.5 text-cyan-400" /> Auto Edit Studio
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {project?.title || 'Auto Edit Project'}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(`/projects/${projectId}/manual`)}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Switch to Manual Studio
              </button>
              <button
                onClick={handleGeneratePlan}
                disabled={analyzing}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                {analyzing ? 'Analyzing...' : 'Generate Edit Plan'}
              </button>
            </div>
          </div>

          {/* Main 2-Column Workflow */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Video Preview & AI Analysis */}
            <div className="lg:col-span-7 space-y-6">
              {/* Video Player Box */}
              <div className="rounded-3xl glass-panel border border-white/[0.08] overflow-hidden relative shadow-2xl">
                <div className="relative aspect-video bg-black flex items-center justify-center">
                  <video
                    ref={videoRef}
                    src={outputVideoUrl || project?.originalVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'}
                    className="w-full h-full object-contain"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    controls
                  />
                  {outputVideoUrl && (
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-500/90 text-white text-[11px] font-bold shadow-lg flex items-center gap-1">
                      <Check className="w-3 h-3" /> Rendered Result
                    </div>
                  )}
                </div>

                <div className="p-4 bg-[#0D1122]/90 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={toggleVideoPlayback}
                      className="p-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 transition-colors"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <div>
                      <p className="text-xs font-semibold text-white truncate max-w-[220px]">
                        {project?.title}
                      </p>
                      <span className="text-[11px] text-slate-400">
                        Duration: {Math.round(project?.duration || 30)}s
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-cyan-400 font-mono">
                    Format: {options.aspectRatio}
                  </span>
                </div>
              </div>

              {/* AI Analysis Panel */}
              <div className="p-6 rounded-3xl glass-panel border border-white/[0.08] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" /> Deep AI Footage Analysis
                  </h3>
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    Live Diagnostics
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-slate-400 block mb-1">Total Duration</span>
                    <span className="text-base font-bold text-white font-mono">
                      {Math.round(analysis.totalDuration)}s
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-slate-400 block mb-1">Detected Scenes</span>
                    <span className="text-base font-bold text-cyan-400 font-mono">
                      {analysis.scenesCount} cuts
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-slate-400 block mb-1">Silent Sections</span>
                    <span className="text-base font-bold text-purple-400 font-mono">
                      {analysis.detectedSilences.length} pauses
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-slate-400 block mb-1">Speaking Language</span>
                    <span className="text-base font-bold text-white">
                      {analysis.detectedLanguage}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-slate-400 block mb-1">Estimated Cuts</span>
                    <span className="text-base font-bold text-pink-400 font-mono">
                      {analysis.estimatedCuts} trims
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-slate-400 block mb-1">Est. Final Length</span>
                    <span className="text-base font-bold text-emerald-400 font-mono">
                      {analysis.estimatedFinalDuration}s
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Auto-Editing Controls & Proposed Edit Plan */}
            <div className="lg:col-span-5 space-y-6">
              {/* Auto-Edit Options Toggles */}
              <div className="p-6 rounded-3xl glass-panel border border-white/[0.08] space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-purple-400" /> Automated Editing Controls
                </h3>

                {/* Aspect Ratio & Style Selectors */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                      Aspect Ratio
                    </label>
                    <select
                      value={options.aspectRatio}
                      onChange={(e) => setOptions({ ...options, aspectRatio: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white/[0.05] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="16:9" className="bg-[#080B14]">16:9 (Landscape)</option>
                      <option value="9:16" className="bg-[#080B14]">9:16 (Vertical Reel)</option>
                      <option value="1:1" className="bg-[#080B14]">1:1 (Square Feed)</option>
                      <option value="Original" className="bg-[#080B14]">Original Footage</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                      Video Style
                    </label>
                    <select
                      value={options.style}
                      onChange={(e) => setOptions({ ...options, style: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white/[0.05] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="Professional" className="bg-[#080B14]">Professional</option>
                      <option value="Vlog" className="bg-[#080B14]">Vlog</option>
                      <option value="Podcast" className="bg-[#080B14]">Podcast</option>
                      <option value="Educational" className="bg-[#080B14]">Educational</option>
                      <option value="Cinematic" className="bg-[#080B14]">Cinematic</option>
                      <option value="Social Media" className="bg-[#080B14]">Social Media</option>
                    </select>
                  </div>
                </div>

                {/* Feature Toggles List */}
                <div className="space-y-2.5 pt-2">
                  {[
                    { key: 'removeSilence', label: 'Remove Long Silences', icon: Scissors, desc: 'Cut gaps > 1.5s' },
                    { key: 'trimEdges', label: 'Trim Start & End Silence', icon: Clock, desc: 'Snip awkward start/end dead air' },
                    { key: 'removeFillerWords', label: 'Remove Filler Words', icon: Type, desc: 'Cuts "um", "uh" pauses' },
                    { key: 'autoSubtitles', label: 'Auto-Generate Subtitles', icon: Type, desc: 'Lower-third karaoke captions' },
                    { key: 'normalizeAudio', label: 'Normalize Audio (LUFS)', icon: Volume2, desc: 'Even broadcast loudness' },
                    { key: 'reduceNoise', label: 'Reduce Background Noise', icon: Volume2, desc: 'Noise suppression gate' },
                    { key: 'addMusic', label: 'Add Soft Background Music', icon: Music, desc: 'Curated mood sync & ducking' },
                    { key: 'sceneTransitions', label: 'Add Transitions Between Scenes', icon: Film, desc: 'Smooth cross-dissolves' },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isChecked = options[item.key as keyof typeof options] as boolean;
                    return (
                      <div
                        key={item.key}
                        onClick={() => toggleOption(item.key as any)}
                        className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${isChecked ? 'bg-purple-600/30 text-purple-300' : 'bg-white/5 text-slate-500'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-white">{item.label}</p>
                            <p className="text-[10px] text-slate-400">{item.desc}</p>
                          </div>
                        </div>

                        {/* Toggle Switch */}
                        <div
                          className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                            isChecked ? 'bg-gradient-to-r from-purple-500 to-cyan-400' : 'bg-white/20'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-white transition-transform ${
                              isChecked ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Editable Timeline of Proposed Operations */}
              {editPlanGenerated && (
                <div className="p-6 rounded-3xl glass-panel border border-purple-500/30 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-cyan-400" /> Proposed Edit Plan Timeline
                      </h3>
                      <p className="text-[11px] text-slate-400">Review operations before initiating render</p>
                    </div>
                    <span className="text-xs text-purple-300 font-mono font-semibold">
                      {planOperations.length} Steps
                    </span>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {planOperations.map((op, idx) => (
                      <div
                        key={op.id}
                        className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-mono text-[10px] font-bold">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="font-semibold text-white">{op.name}</p>
                            <p className="text-[10px] text-slate-400">{op.desc}</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 text-[10px] font-medium border border-cyan-500/20">
                          {op.badge}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleStartAutoEdit}
                    disabled={renderStatus === 'processing'}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-semibold text-xs shadow-xl shadow-purple-600/30 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Wand2 className="w-4 h-4" /> Start Auto Edit Render
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Render Progress Modal */}
          {renderStatus === 'processing' && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
              <div className="max-w-md w-full p-8 rounded-3xl glass-panel border border-purple-500/40 shadow-2xl text-center space-y-6">
                <div className="w-16 h-16 rounded-3xl bg-purple-600/20 border border-purple-500/30 text-purple-300 flex items-center justify-center mx-auto shadow-lg shadow-purple-900/40">
                  <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-extrabold text-white">Rendering Auto Edit</h3>
                  <p className="text-xs text-purple-300 font-mono">{currentStage}</p>
                </div>

                <div className="space-y-2">
                  <div className="w-full bg-black/50 rounded-full h-3 overflow-hidden p-0.5 border border-white/10">
                    <div
                      className="bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${renderProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Progress</span>
                    <span className="text-cyan-400 font-mono font-bold">{renderProgress}%</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400">
                  Processing on cloud worker node. Please do not close this window.
                </p>
              </div>
            </div>
          )}

          {/* Export & Download Options Banner on Completion */}
          {renderStatus === 'completed' && outputVideoUrl && (
            <div className="p-6 rounded-3xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Video Render Finished!</h4>
                  <p className="text-xs text-slate-400">
                    Exported in 1080p MP4 with automated silence trimming and synchronized captions.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={outputVideoUrl}
                  download="editflow_auto_export.mp4"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-900/20 transition-all"
                >
                  <Download className="w-3.5 h-3.5" /> Download MP4
                </a>
                <button
                  onClick={() => router.push('/projects')}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all"
                >
                  Back to Projects
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
