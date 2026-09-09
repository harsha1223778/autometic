export interface VideoEmbedConfig {
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  showControls: boolean;
  brandColor: string;
  leadGateEnabled: boolean;
  leadGateTimestamp: number; // e.g. 5 seconds
  leadGateHeadline: string;
  leadGateCta: string;
  aspectRatio: '9:16' | '16:9' | '1:1';
}

export const DEFAULT_EMBED_CONFIG: VideoEmbedConfig = {
  autoplay: true,
  muted: true,
  loop: false,
  showControls: true,
  brandColor: '#3b82f6',
  leadGateEnabled: false,
  leadGateTimestamp: 5,
  leadGateHeadline: 'Unlock the full masterclass & resource checklist',
  leadGateCta: 'Continue Watching',
  aspectRatio: '9:16'
};

export function generateIframeEmbedCode(
  projectId: string,
  videoUrl: string = '',
  config: VideoEmbedConfig = DEFAULT_EMBED_CONFIG,
  origin: string = 'http://localhost:5000'
): string {
  const params = new URLSearchParams({
    src: videoUrl,
    auto: config.autoplay ? '1' : '0',
    mute: config.muted ? '1' : '0',
    loop: config.loop ? '1' : '0',
    controls: config.showControls ? '1' : '0',
    brand: encodeURIComponent(config.brandColor),
    gate: config.leadGateEnabled ? '1' : '0',
    gateTime: config.leadGateTimestamp.toString()
  });

  const embedUrl = `${origin}/embed/${projectId}?${params.toString()}`;

  const aspectPadding = config.aspectRatio === '9:16' ? '177.77%' : config.aspectRatio === '1:1' ? '100%' : '56.25%';

  return `<div style="position:relative;width:100%;max-width:480px;margin:0 auto;padding-top:${aspectPadding};border-radius:16px;overflow:hidden;box-shadow:0 20px 40px -15px rgba(0,0,0,0.5);">
  <iframe
    src="${embedUrl}"
    title="EditFlow AI Interactive Video Player"
    style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen>
  </iframe>
</div>`;
}

export function generateReactEmbedCode(
  projectId: string,
  videoUrl: string = '',
  config: VideoEmbedConfig = DEFAULT_EMBED_CONFIG,
  origin: string = 'http://localhost:5000'
): string {
  const params = new URLSearchParams({
    src: videoUrl,
    auto: config.autoplay ? '1' : '0',
    mute: config.muted ? '1' : '0',
    loop: config.loop ? '1' : '0',
    controls: config.showControls ? '1' : '0',
    gate: config.leadGateEnabled ? '1' : '0',
    gateTime: config.leadGateTimestamp.toString()
  });

  const aspectClass = config.aspectRatio === '9:16' ? 'aspect-[9/16]' : config.aspectRatio === '1:1' ? 'aspect-square' : 'aspect-video';

  return `import React from 'react';

export function EditFlowVideoPlayer() {
  return (
    <div className="relative w-full max-w-md mx-auto ${aspectClass} rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
      <iframe
        src="${origin}/embed/${projectId}?${params.toString()}"
        title="EditFlow AI Interactive Video"
        className="absolute inset-0 w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}`;
}
