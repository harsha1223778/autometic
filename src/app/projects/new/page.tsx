'use client';

import { useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/navigation/Sidebar';
import TopNav from '@/components/navigation/TopNav';
import {
  UploadCloud,
  FileVideo,
  FileImage,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Film,
  Clock,
  Trash2,
  Plus,
  Star,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';

interface QueuedMedia {
  id: string;
  file: File;
  name: string;
  type: 'video' | 'image';
  size: number;
  previewUrl: string;
  isPrimary: boolean;
}

function NewProjectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedMode = searchParams.get('mode') || 'auto';

  const [projectName, setProjectName] = useState('');
  const [mediaList, setMediaList] = useState<QueuedMedia[]>([]);
  const [selectedClip, setSelectedClip] = useState<{ name: string; url: string; thumbnail: string; duration: number; type: 'video' | 'image' } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample stock clips & images to start immediately with one click
  const sampleAssets = [
    {
      name: 'Keynote & Presentation (Video)',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80',
      duration: 60.0,
      type: 'video' as const,
    },
    {
      name: 'Creator Vlog Raw Footage (Video)',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
      duration: 15.0,
      type: 'video' as const,
    },
    {
      name: 'Cinematic B-Roll Overlay (Image)',
      url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&auto=format&fit=crop&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80',
      duration: 5.0,
      type: 'image' as const,
    },
    {
      name: 'Studio Title Card Graphics (Image)',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      duration: 5.0,
      type: 'image' as const,
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleSelectedFiles = (newFiles: File[]) => {
    setError(null);
    setSelectedClip(null);

    const validNewItems: QueuedMedia[] = [];

    for (const file of newFiles) {
      const isVideo = file.type.startsWith('video/') || !!file.name.match(/\.(mp4|webm|mov|avi|mkv)$/i);
      const isImage = file.type.startsWith('image/') || !!file.name.match(/\.(png|jpe?g|webp|gif|svg)$/i);

      if (!isVideo && !isImage) {
        setError(`"${file.name}" is not a supported video or image file.`);
        continue;
      }

      if (file.size > 250 * 1024 * 1024) {
        setError(`"${file.name}" exceeds 250MB limit.`);
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      validNewItems.push({
        id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        file,
        name: file.name,
        type: isVideo ? 'video' : 'image',
        size: file.size,
        previewUrl,
        isPrimary: false,
      });
    }

    if (validNewItems.length === 0) return;

    setMediaList((prev) => {
      const combined = [...prev, ...validNewItems];
      // If none is primary yet, make first video (or first item) primary
      const hasPrimary = combined.some((m) => m.isPrimary);
      if (!hasPrimary) {
        const firstVideoIdx = combined.findIndex((m) => m.type === 'video');
        if (firstVideoIdx !== -1) {
          combined[firstVideoIdx].isPrimary = true;
        } else if (combined.length > 0) {
          combined[0].isPrimary = true;
        }
      }
      return combined;
    });

    if (!projectName && validNewItems[0]) {
      const cleanName = validNewItems[0].name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setProjectName(cleanName);
    }
  };

  const handleSetPrimary = (id: string) => {
    setMediaList((prev) =>
      prev.map((item) => ({
        ...item,
        isPrimary: item.id === id,
      }))
    );
    toast.success('Updated primary project media');
  };

  const handleRemoveMedia = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMediaList((prev) => {
      const filtered = prev.filter((m) => m.id !== id);
      if (filtered.length > 0 && !filtered.some((m) => m.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      return filtered;
    });
  };

  const handleUploadAndProceed = async () => {
    if (mediaList.length === 0 && !projectName && !selectedClip) {
      setError('Please add at least one video or image to your project.');
      return;
    }

    setUploading(true);
    setProgress(15);

    try {
      let primaryVideoUrl = selectedClip?.url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
      let duration = selectedClip?.duration || 30.0;
      let thumbnailUrl = selectedClip?.thumbnail || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80';
      let uploadedAssets: any[] = [];

      if (mediaList.length > 0) {
        setProgress(30);
        const formData = new FormData();
        mediaList.forEach((item) => {
          formData.append('files', item.file);
        });

        const uploadRes = await fetch('/api/upload/media', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          throw new Error(errData.error || 'Media upload failed');
        }

        const uploadData = await uploadRes.json();
        uploadedAssets = uploadData.media || [];
        setProgress(65);

        // Find primary media
        const primaryItem = mediaList.find((m) => m.isPrimary);
        const primaryMatch = uploadedAssets.find((a: any) => a.name === primaryItem?.name) || uploadedAssets[0];

        if (primaryMatch) {
          primaryVideoUrl = primaryMatch.url;
          thumbnailUrl = primaryMatch.thumbnailUrl;
          duration = primaryMatch.duration || 30.0;
        }
      } else if (selectedClip) {
        uploadedAssets = [
          {
            id: `sample-${Date.now()}`,
            url: selectedClip.url,
            name: selectedClip.name,
            type: selectedClip.type,
            duration: selectedClip.duration,
            thumbnailUrl: selectedClip.thumbnail,
          },
        ];
      }

      setProgress(85);

      // Create Project in Database
      const createRes = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: projectName.trim() || selectedClip?.name || (mediaList[0]?.name.replace(/\.[^/.]+$/, '')) || 'Untitled AI Project',
          originalVideoUrl: primaryVideoUrl,
          thumbnailUrl,
          duration,
          mode: preselectedMode,
          mediaAssets: uploadedAssets,
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
      toast.success(`Project created with ${uploadedAssets.length || 1} media assets!`);

      // Redirect to Mode Selection page or direct mode
      router.push(`/projects/${projectData.project.id}/select-mode`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong during upload.');
      setUploading(false);
      setProgress(0);
    }
  };

  const handleSelectSampleClip = (asset: (typeof sampleAssets)[0]) => {
    setSelectedClip(asset);
    setProjectName(asset.name);
    setMediaList([]);
    toast.info(`Selected stock asset: ${asset.name}`);
  };

  const videoCount = mediaList.filter((m) => m.type === 'video').length;
  const imageCount = mediaList.filter((m) => m.type === 'image').length;

  return (
    <div className="min-h-screen bg-[#080B14] text-slate-100 flex">
      <Sidebar />
      <div className="flex-1 pl-64">
        <TopNav />

        <main className="pt-24 px-8 pb-16 max-w-4xl mx-auto space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Multi-Media Project Setup
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Upload Footage & Images</h1>
            <p className="text-sm text-slate-400 mt-1">
              Add multiple video clips, B-roll footage, and images. The AI assistant can merge, overlay, and cut across all assets.
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
            className={`p-8 rounded-3xl border-2 border-dashed transition-all cursor-pointer text-center relative overflow-hidden ${
              dragActive
                ? 'border-cyan-400 bg-cyan-950/20 scale-[1.01]'
                : mediaList.length > 0
                ? 'border-purple-500/50 bg-purple-950/10'
                : 'border-white/15 bg-white/[0.02] hover:border-purple-500/50 hover:bg-purple-950/10'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleSelectedFiles(Array.from(e.target.files));
                }
              }}
            />

            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto shadow-lg shadow-purple-900/20">
                <UploadCloud className="w-7 h-7 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Drag & drop multiple videos and images</h3>
                <p className="text-xs text-slate-400 mt-1">or click to browse from your device</p>
              </div>
              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 font-mono">MP4, MOV, WebM, AVI</span>
                <span>•</span>
                <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 font-mono">PNG, JPG, WEBP, GIF</span>
              </div>
            </div>
          </div>

          {/* Queued Media Assets List */}
          {mediaList.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Selected Assets ({mediaList.length})
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                    {videoCount} Video{videoCount !== 1 ? 's' : ''}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                    {imageCount} Image{imageCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
                >
                  <Plus className="w-3.5 h-3.5" /> Add more files
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mediaList.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-2xl glass-panel border flex items-center gap-3 transition-all ${
                      item.isPrimary
                        ? 'border-cyan-400 bg-cyan-950/20 ring-1 ring-cyan-400/40'
                        : 'border-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    <div className="w-14 h-12 rounded-xl bg-black/50 overflow-hidden relative flex-shrink-0 flex items-center justify-center">
                      {item.type === 'image' ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.previewUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full relative">
                          <video
                            src={item.previewUrl}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <FileVideo className="w-6 h-6 text-purple-400 absolute inset-0 m-auto -z-10" />
                        </div>
                      )}
                      <span className={`absolute top-1 left-1 text-[8px] font-extrabold uppercase px-1 rounded z-10 ${
                        item.type === 'video' ? 'bg-purple-600 text-white' : 'bg-cyan-600 text-white'
                      }`}>
                        {item.type}
                      </span>
                    </div>

                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs font-semibold text-white truncate">{item.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-400">
                          {(item.size / (1024 * 1024)).toFixed(1)} MB
                        </span>
                        {item.isPrimary && (
                          <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-cyan-400" /> Primary
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {!item.isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(item.id)}
                          className="px-2 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[10px] text-slate-300 hover:text-white transition-colors"
                          title="Set as primary clip"
                        >
                          Make Primary
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleRemoveMedia(item.id, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Remove file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Select Royalty-Free Samples */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Or test with pre-loaded royalty-free footage & B-roll:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {sampleAssets.map((asset, idx) => {
                const isSelected = selectedClip?.name === asset.name;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSampleClip(asset)}
                    className={`p-3 rounded-2xl glass-panel border transition-all text-left flex gap-3 items-center group relative ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/30 ring-1 ring-cyan-400 shadow-lg shadow-cyan-500/10'
                        : 'border-white/[0.08] hover:border-purple-500/50'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-black/40 overflow-hidden relative flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={asset.thumbnail} alt={asset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <span className={`absolute top-0.5 left-0.5 text-[7px] font-extrabold uppercase px-1 rounded ${
                        asset.type === 'video' ? 'bg-purple-600 text-white' : 'bg-cyan-600 text-white'
                      }`}>
                        {asset.type}
                      </span>
                    </div>
                    <div className="overflow-hidden">
                      <p className={`text-xs font-bold truncate ${isSelected ? 'text-cyan-300' : 'text-white'}`}>{asset.name}</p>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-2.5 h-2.5 text-cyan-400" /> {asset.duration}s
                        {isSelected && <span className="text-[10px] text-emerald-400 font-semibold ml-1">● Active</span>}
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
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" /> Ingesting & Analyzing Multi-Media Assets...
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
              disabled={uploading || (mediaList.length === 0 && !projectName && !selectedClip)}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-xl shadow-purple-600/30 transition-all hover:scale-[1.02] flex items-center gap-2 disabled:opacity-40"
            >
              {uploading ? 'Processing Assets...' : 'Continue to Mode Selection'}
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
