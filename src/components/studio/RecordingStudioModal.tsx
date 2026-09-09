'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Video,
  Mic,
  Monitor,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Download,
  Square,
  Eye,
  Sliders,
} from 'lucide-react';
import { toast } from 'sonner';

interface RecordingStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRecordingToStudio: (asset: {
    id: string;
    name: string;
    url: string;
    type: 'video';
    duration: number;
  }) => void;
  teleprompterScript?: string;
}

export default function RecordingStudioModal({
  isOpen,
  onClose,
  onAddRecordingToStudio,
  teleprompterScript = 'Welcome to EditFlow AI Studio. Today we are exploring high-retention video editing workflows.',
}: RecordingStudioModalProps) {
  const [sourceMode, setSourceMode] = useState<'camera' | 'screen'>('camera');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Teleprompter State
  const [showTeleprompter, setShowTeleprompter] = useState(true);
  const [isPrompterScrolling, setIsPrompterScrolling] = useState(false);
  const [prompterSpeed, setPrompterSpeed] = useState(3);
  const [prompterFontSize, setPrompterFontSize] = useState(20);
  const [isMirrored, setIsMirrored] = useState(false);
  const prompterContainerRef = useRef<HTMLDivElement>(null);

  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  // Initialize media devices on open or mode switch
  useEffect(() => {
    if (!isOpen) {
      stopActiveStreams();
      return;
    }
    startMediaPreview();

    return () => {
      stopActiveStreams();
    };
  }, [isOpen, sourceMode]);

  const stopActiveStreams = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsRecording(false);
    setIsPrompterScrolling(false);
  };

  const startMediaPreview = async () => {
    try {
      let stream: MediaStream;
      if (sourceMode === 'camera') {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
      } else {
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
      }

      mediaStreamRef.current = stream;
      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = stream;
        previewVideoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Could not access media devices:', err);
      toast.error(err.message || 'Media stream access denied');
    }
  };

  // Teleprompter Auto-Scroll Loop
  useEffect(() => {
    if (!isPrompterScrolling) return;

    const interval = setInterval(() => {
      if (prompterContainerRef.current) {
        prompterContainerRef.current.scrollTop += prompterSpeed * 0.7;
      }
    }, 40);

    return () => clearInterval(interval);
  }, [isPrompterScrolling, prompterSpeed]);

  const handleStartRecording = () => {
    if (!mediaStreamRef.current) {
      toast.error('No camera or screen input available');
      return;
    }

    recordedChunksRef.current = [];
    setRecordedBlob(null);
    setRecordedUrl(null);
    setRecordingSeconds(0);

    try {
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : 'video/webm';

      const recorder = new MediaRecorder(mediaStreamRef.current, { mimeType });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setIsPrompterScrolling(true);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      toast.success('🔴 Recording started! Teleprompter scrolling.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to start recording');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsRecording(false);
    setIsPrompterScrolling(false);
    toast.info('Recording finished! Preview ready below.');
  };

  const handlePushToStudio = () => {
    if (!recordedBlob || !recordedUrl) return;

    const id = `rec-${Date.now()}`;
    const name = `Recording_${new Date().toLocaleTimeString().replace(/:/g, '-')}.webm`;
    const duration = Math.max(2, recordingSeconds);

    onAddRecordingToStudio({
      id,
      name,
      url: recordedUrl,
      type: 'video',
      duration,
    });

    toast.success('🎉 Recording inserted directly into your studio timeline!');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-4xl w-full p-6 rounded-3xl glass-panel border border-white/10 shadow-2xl space-y-5 max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Live Recording Studio & Teleprompter</h3>
              <p className="text-xs text-slate-400">
                Record webcam or screen with floating eye-contact prompter
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Source Switcher */}
            <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 text-xs">
              <button
                type="button"
                onClick={() => setSourceMode('camera')}
                disabled={isRecording}
                className={`px-3 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                  sourceMode === 'camera' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400'
                }`}
              >
                <Video className="w-3.5 h-3.5" /> Webcam
              </button>
              <button
                type="button"
                onClick={() => setSourceMode('screen')}
                disabled={isRecording}
                className={`px-3 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                  sourceMode === 'screen' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" /> Screen
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Live Canvas Viewport with Overlay Teleprompter */}
        <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-inner flex items-center justify-center">
          {recordedUrl ? (
            <video src={recordedUrl} controls className="w-full h-full object-contain" />
          ) : (
            <video
              ref={previewVideoRef}
              muted
              playsInline
              className={`w-full h-full object-cover ${sourceMode === 'camera' && !isMirrored ? 'scale-x-[-1]' : ''}`}
            />
          )}

          {/* Floating Teleprompter Overlay */}
          {showTeleprompter && !recordedUrl && (
            <div
              ref={prompterContainerRef}
              style={{
                fontSize: `${prompterFontSize}px`,
                transform: isMirrored ? 'scaleX(-1)' : 'none',
              }}
              className="absolute top-4 left-6 right-6 bottom-16 bg-black/75 backdrop-blur-md rounded-2xl p-6 text-yellow-300 font-bold leading-relaxed overflow-y-auto border border-yellow-400/30 text-center shadow-2xl select-none scrollbar-none"
            >
              <p className="whitespace-pre-wrap py-24">{teleprompterScript}</p>
            </div>
          )}

          {/* Recording Timer Badge */}
          {isRecording && (
            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-rose-600/90 text-white font-mono text-xs font-bold flex items-center gap-2 shadow-lg animate-pulse z-30">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              <span>REC {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')}</span>
            </div>
          )}
        </div>

        {/* Teleprompter Controls Bar */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShowTeleprompter(!showTeleprompter)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
                showTeleprompter ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300' : 'bg-white/5 border-white/10 text-slate-400'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Prompter {showTeleprompter ? 'ON' : 'OFF'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPrompterScrolling(!isPrompterScrolling)}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-medium flex items-center gap-1.5 transition-all"
            >
              {isPrompterScrolling ? <Pause className="w-3.5 h-3.5 text-cyan-400" /> : <Play className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{isPrompterScrolling ? 'Pause Scroll' : 'Scroll Script'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMirrored(!isMirrored)}
              className={`px-2.5 py-1.5 rounded-xl border text-xs transition-all ${
                isMirrored ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-white/5 border-white/10 text-slate-400'
              }`}
            >
              Mirror Mode
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400">Speed: {prompterSpeed}x</span>
            <input
              type="range"
              min={1}
              max={10}
              value={prompterSpeed}
              onChange={(e) => setPrompterSpeed(parseInt(e.target.value))}
              className="w-20 accent-yellow-400"
            />
            <span className="text-[11px] text-slate-400 pl-2">Size: {prompterFontSize}px</span>
            <input
              type="range"
              min={16}
              max={36}
              value={prompterFontSize}
              onChange={(e) => setPrompterFontSize(parseInt(e.target.value))}
              className="w-20 accent-cyan-400"
            />
          </div>
        </div>

        {/* Recording Actions */}
        <div className="flex items-center justify-between pt-1">
          <div>
            {recordedUrl ? (
              <button
                type="button"
                onClick={() => {
                  setRecordedUrl(null);
                  setRecordedBlob(null);
                  startMediaPreview();
                }}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Retake
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            {!isRecording && !recordedUrl && (
              <button
                type="button"
                onClick={handleStartRecording}
                className="px-6 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all hover:scale-105"
              >
                <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                <span>Start Recording</span>
              </button>
            )}

            {isRecording && (
              <button
                type="button"
                onClick={handleStopRecording}
                className="px-6 py-2.5 rounded-2xl bg-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-600/40 flex items-center gap-2 animate-bounce"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>Stop & Save Recording</span>
              </button>
            )}

            {recordedUrl && (
              <button
                type="button"
                onClick={handlePushToStudio}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Add to Studio Timeline</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
