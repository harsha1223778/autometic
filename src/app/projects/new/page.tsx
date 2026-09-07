'use client';

import { useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/navigation/Sidebar';
import TopNav from '@/components/navigation/TopNav';
import {
  UploadCloud,
  FileVideo,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Film,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

function NewProjectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedMode = searchParams.get('mode') || 'auto';

  const [projectName, setProjectName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [selectedClip, setSelectedClip] = useState<{ name: string; url: string; thumbnail: string; duration: number } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample stock clips to start immediately with one click
  const sampleClips = [
    {
      name: 'Keynote & Presentation',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80',
      duration: 60.0,
    },
    {
      name: 'Creator Vlog Raw Footage',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
      duration: 15.0,
    },
    {
      name: 'Cinematic Landscape B-Roll',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80',
      duration: 35.0,
    },
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectedFile = (selectedFile: File) => {
    setError(null);
    setSelectedClip(null);
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/mov'];
    const hasValidExt = selectedFile.name.match(/\.(mp4|webm|mov|avi)$/i);

    if (!validTypes.includes(selectedFile.type) && !hasValidExt) {
      setError('Please upload a valid MP4, WebM, MOV, or AVI video file.');
      return;
    }

    if (selectedFile.size > 250 * 1024 * 1024) {
      setError('File exceeds 250MB limit for demo prototype.');
      return;
    }

    setFile(selectedFile);
    if (!projectName) {
      const cleanName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setProjectName(cleanName);
    }
  };

  const handleUploadAndProceed = async () => {
    if (!file && !projectName && !selectedClip) {
      setError('Please select or upload a video file and name your project.');
      return;
    }

    setUploading(true);
    setProgress(15);

    try {
      let videoUrl = selectedClip?.url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
      let duration = selectedClip?.duration || 30.0;
      let thumbnailUrl = selectedClip?.thumbnail || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80';

      if (file) {
        const formData = new FormData();
        formData.append('video', file);

        setProgress(40);
        const uploadRes = await fetch('/api/upload/video', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          throw new Error(errData.error || 'Upload failed');
        }

        const uploadData = await uploadRes.json();
        videoUrl = uploadData.url;
        duration = uploadData.duration || 30.0;
        thumbnailUrl = uploadData.thumbnailUrl;
      }

      setProgress(75);

      // Create Project in Database
      const createRes = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: projectName.trim() || selectedClip?.name || 'Untitled AI Project',
          originalVideoUrl: videoUrl,
          thumbnailUrl,
          duration,
          mode: preselectedMode,
        }),
      });

      if (!createRes.ok) {
        const errData = await createRes.json().catch(() => ({}));
        const detailMsg = errData.details
          ? Object.entries(errData.details).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(', ')
          : '';
        throw new Error(errData.error ? `${errData.error}${detailMsg ? ' (' + detailMsg + ')' : ''}` : 'Failed to create project in database');
      }

      const projectData = await createRes.json();
      setProgress(100);
      toast.success('Project uploaded successfully!');

      // Redirect to Mode Selection page or direct mode
      router.push(`/projects/${projectData.project.id}/select-mode`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong during upload.');
      setUploading(false);
      setProgress(0);
    }
  };

  const handleSelectSampleClip = (clip: (typeof sampleClips)[0]) => {
    setSelectedClip(clip);
    setProjectName(clip.name);
    setFile(null);
    toast.info(`Selected sample clip: ${clip.name}`);
  };

  return (
    <div className="min-h-screen bg-[#080B14] text-slate-100 flex">
      <Sidebar />
      <div className="flex-1 pl-64">
        <TopNav />

        <main className="pt-24 px-8 pb-16 max-w-4xl mx-auto space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> New Project Setup
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Upload Raw Footage</h1>
            <p className="text-sm text-slate-400 mt-1">
              Select or drop your video clip to start auto-editing, studio manual cuts, or AI assistance.
            </p>
          </div>

          {/* Project Name Input */}
          <div className="glass-panel p-6 rounded-3xl border border-white/[0.08] space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Project Title
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. YouTube Podcast Ep 12 - AI Revolution"
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.1] rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm transition-all"
            />
          </div>

          {/* Drag and Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-10 rounded-3xl border-2 border-dashed transition-all cursor-pointer text-center relative overflow-hidden ${
              dragActive
                ? 'border-cyan-400 bg-cyan-950/20 scale-[1.01]'
                : file
                ? 'border-emerald-500/60 bg-emerald-950/15'
                : 'border-white/15 bg-white/[0.02] hover:border-purple-500/50 hover:bg-purple-950/10'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleSelectedFile(e.target.files[0]);
              }}
            />

            {file ? (
              <div className="space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <FileVideo className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{file.name}</h3>
                  <p className="text-xs text-slate-400">{(file.size / (1024 * 1024)).toFixed(1)} MB • Ready to Process</p>
                </div>
                <span className="inline-block text-xs text-cyan-400 hover:underline">
                  Click to replace file
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto shadow-lg shadow-purple-900/20">
                  <UploadCloud className="w-8 h-8 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Drag & drop footage here</h3>
                  <p className="text-xs text-slate-400 mt-1">or click to browse from your device</p>
                </div>
                <p className="text-[11px] text-slate-400">
                  Accepts MP4, MOV, AVI, WebM (up to 250MB prototype limit)
                </p>
              </div>
            )}
          </div>

          {/* Quick Select Royalty-Free Samples */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Or test with pre-loaded royalty-free footage:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {sampleClips.map((clip, idx) => {
                const isSelected = selectedClip?.name === clip.name;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSampleClip(clip)}
                    className={`p-3 rounded-2xl glass-panel border transition-all text-left flex gap-3 items-center group relative ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/30 ring-1 ring-cyan-400 shadow-lg shadow-cyan-500/10'
                        : 'border-white/[0.08] hover:border-purple-500/50'
                    }`}
                  >
                    <div className="w-14 h-12 rounded-xl bg-black/40 overflow-hidden relative flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={clip.thumbnail} alt={clip.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="overflow-hidden">
                      <p className={`text-xs font-bold truncate ${isSelected ? 'text-cyan-300' : 'text-white'}`}>{clip.name}</p>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-2.5 h-2.5 text-cyan-400" /> {clip.duration}s
                        {isSelected && <span className="text-[10px] text-emerald-400 font-semibold ml-1">● Selected</span>}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="p-6 rounded-2xl glass-panel border border-purple-500/30 space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-300 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" /> Ingesting & Analyzing Video...
                </span>
                <span className="text-cyan-400 font-mono">{progress}%</span>
              </div>
              <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Continue Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleUploadAndProceed}
              disabled={uploading || (!file && !projectName)}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-xl shadow-purple-600/30 transition-all hover:scale-[1.02] flex items-center gap-2 disabled:opacity-40"
            >
              {uploading ? 'Processing...' : 'Continue to Mode Selection'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function NewProjectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080B14] flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <NewProjectContent />
    </Suspense>
  );
}
