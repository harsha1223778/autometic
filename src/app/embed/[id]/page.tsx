'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { Play, Pause, Volume2, VolumeX, Mail, ArrowRight } from 'lucide-react';

function EmbedPlayerContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = params.id as string;

  const videoSrc = searchParams.get('src') || '';
  const autoplay = searchParams.get('auto') === '1';
  const mutedInit = searchParams.get('mute') === '1';
  const loop = searchParams.get('loop') === '1';
  const showControls = searchParams.get('controls') !== '0';
  const isGateEnabled = searchParams.get('gate') === '1';
  const gateTime = Number(searchParams.get('gateTime') || 5);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(mutedInit);
  const [currentTime, setCurrentTime] = useState(0);
  const [gateUnlocked, setGateUnlocked] = useState(false);
  const [gateActive, setGateActive] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (autoplay) {
      video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (isGateEnabled && !gateUnlocked && video.currentTime >= gateTime) {
        video.pause();
        setIsPlaying(false);
        setGateActive(true);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [autoplay, isGateEnabled, gateUnlocked, gateTime]);

  const togglePlay = () => {
    if (gateActive) return;
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleUnlockGate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.includes('@')) return;
    setGateActive(false);
    setGateUnlocked(true);
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none flex items-center justify-center font-sans">
      {/* Video Element */}
      {videoSrc ? (
        <video
          ref={videoRef}
          src={videoSrc}
          loop={loop}
          muted={mutedInit}
          playsInline
          className="w-full h-full object-contain cursor-pointer"
          onClick={togglePlay}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 text-white p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold mb-3">
            ▶
          </div>
          <h2 className="text-base font-bold">EditFlow AI Interactive Player</h2>
          <p className="text-xs text-zinc-400 max-w-xs mt-1">
            Project ID: <span className="font-mono text-zinc-300">{projectId}</span>
          </p>
        </div>
      )}

      {/* Floating Watermark */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] text-white/90">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
        <span className="font-bold">EditFlow AI</span>
      </div>

      {/* Lead Capture Gate Overlay */}
      {gateActive && (
        <div className="absolute inset-0 z-30 bg-black/85 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in">
          <form onSubmit={handleUnlockGate} className="w-full max-w-xs bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-center space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 mx-auto flex items-center justify-center text-blue-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Unlock Full Video</h3>
              <p className="text-[11px] text-zinc-400 mt-1">Enter your email to continue watching without interruption.</p>
            </div>
            <div className="space-y-2">
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-black/60 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <span>Continue Watching</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Simple Custom Controls Bar */}
      {showControls && (
        <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between px-3 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white">
          <button onClick={togglePlay} className="p-1 hover:text-blue-400 transition">
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
          </button>
          <span className="text-[10px] font-mono text-zinc-300">
            {Math.floor(currentTime)}s
          </span>
          <button onClick={toggleMute} className="p-1 hover:text-blue-400 transition">
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
}

export default function EmbedPlayerPage() {
  return (
    <Suspense fallback={<div className="w-full h-screen bg-black flex items-center justify-center text-white text-xs">Loading player...</div>}>
      <EmbedPlayerContent />
    </Suspense>
  );
}
