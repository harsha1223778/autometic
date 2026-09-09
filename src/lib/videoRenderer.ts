/**
 * In-Browser Video Rendering & Composition Engine
 * Uses Canvas 2D + Web Audio API + MediaRecorder to record real downloadable video files
 * with burnt-in subtitles, image overlays, B-roll, color filters, and mixed soundtrack.
 */

import { computeMotionTransform, applyCanvasTransitionFX } from './transitions';
import { ChromaKeyOptions, applyChromaKeyToCanvas } from './chromaKey';
import { ActiveCallout, renderCalloutOnCanvas } from './callouts';
import { applyLUTOverlayTint, ColorAdjustments } from './colorGrading';
import { ActiveSticker, renderStickerOnCanvas } from './stickerEngine';
import { calculateKenBurnsTransform } from './kenBurns';

export interface RenderOptions {
  videoElement: HTMLVideoElement | null;
  imageSrc?: string | null;
  aspectRatio: '16:9' | '9:16' | '1:1';
  reframeMode?: 'blurred-letterbox' | 'crop-center' | 'black-bars';
  filter?: string;
  colorLUT?: string;
  colorAdjustments?: ColorAdjustments;
  duration: number;
  transitionType?: string;
  chromaKey?: ChromaKeyOptions;
  kenBurnsPreset?: string;
  stickers?: ActiveSticker[];
  subtitles?: {
    text: string;
    style: 'hormozi' | 'neon' | 'minimal';
    fontSize?: number;
    position?: 'bottom' | 'center' | 'top';
  };
  overlays?: Array<{
    id: string;
    type: 'overlay_image' | 'broll_clip';
    name: string;
    url: string;
    startTime: number;
    duration: number;
    position?: 'top-right' | 'center' | 'lower-third';
    motionPreset?: string;
  }>;
  callouts?: ActiveCallout[];
  musicUrl?: string | null;
  musicVolume?: number;
  onProgress?: (progressPct: number, stage: string) => void;
}

export async function renderStudioComposition(options: RenderOptions): Promise<Blob> {
  const {
    videoElement,
    imageSrc,
    aspectRatio,
    reframeMode = 'blurred-letterbox',
    filter = 'clean',
    duration = 10,
    subtitles,
    overlays = [],
    musicUrl,
    musicVolume = 0.25,
    onProgress,
  } = options;

  // Determine Canvas Dimensions
  let width = 1280;
  let height = 720;
  if (aspectRatio === '9:16') {
    width = 720;
    height = 1280;
  } else if (aspectRatio === '1:1') {
    width = 720;
    height = 720;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not supported');

  // Pre-load image overlay elements
  const loadedOverlays: Array<{
    el: HTMLImageElement;
    startTime: number;
    endTime: number;
    position: string;
    motionPreset?: string;
  }> = [];

  for (const ov of overlays) {
    if (ov.url) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = ov.url;
      try {
        await new Promise((res, rej) => {
          img.onload = res;
          img.onerror = res; // Proceed even if an overlay image fails
          setTimeout(res, 2000);
        });
        loadedOverlays.push({
          el: img,
          startTime: Number(ov.startTime) || 0,
          endTime: (Number(ov.startTime) || 0) + (Number(ov.duration) || 3),
          position: ov.position || 'top-right',
          motionPreset: ov.motionPreset || 'static',
        });
      } catch {
        // Skip faulty overlay
      }
    }
  }

  // Pre-load base image if footage is a photo
  let loadedBaseImage: HTMLImageElement | null = null;
  if (imageSrc) {
    loadedBaseImage = new Image();
    loadedBaseImage.crossOrigin = 'anonymous';
    loadedBaseImage.src = imageSrc;
    await new Promise((res) => {
      if (loadedBaseImage) {
        loadedBaseImage.onload = res;
        loadedBaseImage.onerror = res;
      }
      setTimeout(res, 2000);
    });
  }

  // Set up Audio Context and Destination
  let audioContext: AudioContext | null = null;
  let audioDestination: MediaStreamAudioDestinationNode | null = null;

  try {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtxClass) {
      audioContext = new AudioCtxClass();
      audioDestination = audioContext.createMediaStreamDestination();

      // Connect video audio if available
      if (videoElement && (videoElement as any).captureStream) {
        try {
          const videoStream = (videoElement as any).captureStream();
          const audioTracks = videoStream.getAudioTracks();
          if (audioTracks.length > 0) {
            const videoAudioSource = audioContext.createMediaStreamSource(videoStream);
            videoAudioSource.connect(audioDestination);
          }
        } catch (e) {
          console.warn('Video audio track capture not available:', e);
        }
      }

      // Connect background music if specified
      if (musicUrl) {
        try {
          const bgAudio = new Audio();
          bgAudio.crossOrigin = 'anonymous';
          bgAudio.src = musicUrl;
          bgAudio.volume = musicVolume;
          bgAudio.loop = true;
          const bgSource = audioContext.createMediaElementSource(bgAudio);
          const gainNode = audioContext.createGain();
          gainNode.gain.value = musicVolume;
          bgSource.connect(gainNode);
          gainNode.connect(audioDestination);
          bgAudio.play().catch(() => {});
        } catch (e) {
          console.warn('Music track audio context link skipped:', e);
        }
      }
    }
  } catch (err) {
    console.warn('AudioContext setup skipped:', err);
  }

  // Create combined canvas stream
  const canvasStream = canvas.captureStream(30);
  if (audioDestination && audioDestination.stream.getAudioTracks().length > 0) {
    const audioTrack = audioDestination.stream.getAudioTracks()[0];
    canvasStream.addTrack(audioTrack);
  }

  // Find supported mime type for MediaRecorder
  const mimeTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4',
  ];
  let selectedMimeType = 'video/webm';
  for (const mt of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mt)) {
      selectedMimeType = mt;
      break;
    }
  }

  const recordedChunks: Blob[] = [];
  const recorder = new MediaRecorder(canvasStream, {
    mimeType: selectedMimeType,
    videoBitsPerSecond: 4500000,
  });

  recorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  const renderDuration = Math.min(30, Math.max(3, duration));
  const fps = 30;
  const totalFrames = Math.floor(renderDuration * fps);
  let currentFrame = 0;

  recorder.start(100);

  return new Promise((resolve, reject) => {
    const drawNextFrame = () => {
      if (currentFrame >= totalFrames) {
        recorder.stop();
        return;
      }

      const currentTime = currentFrame / fps;
      const progress = Math.round((currentFrame / totalFrames) * 100);
      onProgress?.(progress, `Compositing frame ${currentFrame}/${totalFrames}`);

      // 1. Draw Background / Video Frame
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      if (loadedBaseImage && loadedBaseImage.complete) {
        // Ken Burns effect on still images
        const scale = 1.0 + (currentTime / renderDuration) * 0.12;
        const dw = width * scale;
        const dh = height * scale;
        const dx = (width - dw) / 2;
        const dy = (height - dh) / 2;
        ctx.drawImage(loadedBaseImage, dx, dy, dw, dh);
      } else if (videoElement) {
        // Render base video
        if (aspectRatio === '9:16' && reframeMode === 'blurred-letterbox') {
          // Blurred ambient background
          ctx.save();
          ctx.filter = 'blur(24px) brightness(0.65)';
          ctx.drawImage(videoElement, -width * 0.2, 0, width * 1.4, height);
          ctx.restore();

          // Centered sharp main video
          const vidAspect = videoElement.videoWidth / (videoElement.videoHeight || 1);
          const drawW = width;
          const drawH = width / (vidAspect || 16 / 9);
          const drawY = (height - drawH) / 2;
          ctx.drawImage(videoElement, 0, drawY, drawW, drawH);
        } else if (aspectRatio === '9:16' && reframeMode === 'crop-center') {
          // Center crop to fill 9:16
          const vW = videoElement.videoWidth || 1920;
          const vH = videoElement.videoHeight || 1080;
          const targetAspect = 9 / 16;
          const cropW = vH * targetAspect;
          const cropX = (vW - cropW) / 2;
          ctx.drawImage(videoElement, cropX, 0, cropW, vH, 0, 0, width, height);
        } else {
          // Standard fit
          ctx.drawImage(videoElement, 0, 0, width, height);
        }
      }

      // 1b. Apply Chroma Key Background Transparency
      if (options.chromaKey?.enabled) {
        applyChromaKeyToCanvas(ctx, width, height, options.chromaKey);
      }

      // 2. Apply Color Grading Filter Overlay
      if (filter === 'warm') {
        ctx.fillStyle = 'rgba(255, 140, 0, 0.15)';
        ctx.fillRect(0, 0, width, height);
      } else if (filter === 'cool') {
        ctx.fillStyle = 'rgba(0, 200, 255, 0.12)';
        ctx.fillRect(0, 0, width, height);
      } else if (filter === 'cinematic') {
        // Vignette
        const gradient = ctx.createRadialGradient(
          width / 2,
          height / 2,
          height * 0.3,
          width / 2,
          height / 2,
          height * 0.85
        );
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.55)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      } else if (filter === 'bw') {
        // Monochrome Noir
        ctx.save();
        ctx.fillStyle = 'rgba(128, 128, 128, 0.2)';
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      // 3. Draw Active Image Overlays (with Motion Presets)
      for (const ov of loadedOverlays) {
        if (currentTime >= ov.startTime && currentTime <= ov.endTime) {
          const ovDuration = Math.max(0.1, ov.endTime - ov.startTime);
          const progress = (currentTime - ov.startTime) / ovDuration;
          const motion = computeMotionTransform(ov.motionPreset || 'static', progress);

          const baseW = width * 0.28;
          const baseH = (baseW * ov.el.height) / (ov.el.width || 1);
          const ovW = baseW * motion.scale;
          const ovH = baseH * motion.scale;

          let ovX = width - ovW - 32;
          let ovY = 32;

          if (ov.position === 'center') {
            ovX = (width - ovW) / 2;
            ovY = (height - ovH) / 2;
          } else if (ov.position === 'lower-third') {
            ovX = 32;
            ovY = height - ovH - 48;
          }

          ovX += motion.translateX;
          ovY += motion.translateY;

          ctx.save();
          if (ov.motionPreset && ['zoom-in', 'zoom-out', 'pan-left-to-right', 'pan-right-to-left', 'diagonal-drift', 'subtle-pulse'].includes(ov.motionPreset)) {
            const kb = calculateKenBurnsTransform(ov.motionPreset, progress);
            ctx.translate(ovX + ovW / 2, ovY + ovH / 2);
            ctx.scale(kb.scale, kb.scale);
            ctx.translate(-(ovX + ovW / 2), -(ovY + ovH / 2));
            ctx.shadowColor = 'rgba(0,0,0,0.7)';
            ctx.shadowBlur = 16;
            ctx.drawImage(ov.el, ovX, ovY, ovW, ovH);
          } else {
            ctx.globalAlpha = motion.opacity;
            ctx.shadowColor = 'rgba(0,0,0,0.7)';
            ctx.shadowBlur = 16;
            ctx.drawImage(ov.el, ovX, ovY, ovW, ovH);
          }
          ctx.restore();
        }
      }

      // 4. Handle Visual Transitions
      if (options.transitionType && options.transitionType !== 'none') {
        const transDur = 0.6;
        const transMid = duration / 2;
        if (currentTime >= transMid - transDur / 2 && currentTime <= transMid + transDur / 2) {
          const transProg = (currentTime - (transMid - transDur / 2)) / transDur;
          applyCanvasTransitionFX(ctx, options.transitionType, transProg, width, height);
        }
      }

      // 5. Burn in Burnt-In Subtitles / Karaoke Text
      if (subtitles?.text) {
        ctx.save();
        const fSize = subtitles.fontSize || (aspectRatio === '9:16' ? 36 : 28);
        ctx.font = `900 ${fSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        let subY = height - 80;
        if (subtitles.position === 'top') subY = 90;
        if (subtitles.position === 'center') subY = height / 2;

        if (subtitles.style === 'hormozi') {
          // Yellow bouncing box with black text
          const text = subtitles.text.toUpperCase();
          const metrics = ctx.measureText(text);
          const boxPadding = 16;
          const boxW = metrics.width + boxPadding * 2;
          const boxH = fSize + 16;

          ctx.fillStyle = '#FFE600';
          ctx.beginPath();
          ctx.roundRect(width / 2 - boxW / 2, subY - boxH / 2, boxW, boxH, 8);
          ctx.fill();

          ctx.fillStyle = '#000000';
          ctx.fillText(text, width / 2, subY);
        } else if (subtitles.style === 'neon') {
          // Cyan glow
          ctx.shadowColor = '#22D3EE';
          ctx.shadowBlur = 18;
          ctx.fillStyle = '#22D3EE';
          ctx.fillText(subtitles.text, width / 2, subY);
        } else {
          // Clean minimal with outline
          ctx.shadowColor = 'rgba(0,0,0,0.85)';
          ctx.shadowBlur = 10;
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(subtitles.text, width / 2, subY);
        }
        ctx.restore();
      }

      // 6. Draw Active Social Callouts & Lower-Thirds
      if (options.callouts && options.callouts.length > 0) {
        for (const callout of options.callouts) {
          const calloutEnd = callout.startTime + (callout.duration || 3);
          if (currentTime >= callout.startTime && currentTime <= calloutEnd) {
            const progress = (currentTime - callout.startTime) / (callout.duration || 3);
            renderCalloutOnCanvas(ctx, callout, width, height, progress);
          }
        }
      }

      // 7. Draw Active Motion Graphics Stickers & Reaction Emojis
      if (options.stickers && options.stickers.length > 0) {
        for (const sticker of options.stickers) {
          renderStickerOnCanvas(ctx, sticker, currentTime, width, height);
        }
      }

      // 8. Apply Color LUT Overlay Tint if configured
      if (options.colorLUT) {
        applyLUTOverlayTint(ctx, width, height, options.colorLUT);
      }

      currentFrame++;
      // Draw next frame smoothly
      setTimeout(drawNextFrame, 1000 / fps);
    };

    recorder.onstop = () => {
      const outputBlob = new Blob(recordedChunks, { type: selectedMimeType });
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close().catch(() => {});
      }
      onProgress?.(100, 'Rendering completed!');
      resolve(outputBlob);
    };

    recorder.onerror = (e) => {
      reject(e);
    };

    drawNextFrame();
  });
}

/**
 * Triggers a native browser file download of a Blob
 */
export function downloadRenderedBlob(blob: Blob, filename = 'editflow_studio_export.webm') {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 2000);
}
