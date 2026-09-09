/**
 * Timeline Marker Flags & Micro-Precision Waveform Scrubbing Engine for EditFlow AI
 * Supports colored timeline cue markers (Cut, B-Roll, SFX, Hook, Note)
 * with instant playhead jump navigation and frame-accurate cues.
 */

export interface TimelineMarker {
  id: string;
  time: number; // in seconds
  type: 'cut' | 'broll' | 'sfx' | 'hook' | 'note';
  label: string;
  note?: string;
  color: string;
}

export const MARKER_TYPES: Array<{
  id: TimelineMarker['type'];
  name: string;
  color: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  dotColor: string;
}> = [
  {
    id: 'cut',
    name: 'Jump Cut / Edit',
    color: '#EF4444',
    bgClass: 'bg-rose-500/20',
    textClass: 'text-rose-400',
    borderClass: 'border-rose-500/40',
    dotColor: '#F43F5E',
  },
  {
    id: 'broll',
    name: 'B-Roll Cutaway',
    color: '#A855F7',
    bgClass: 'bg-purple-500/20',
    textClass: 'text-purple-400',
    borderClass: 'border-purple-500/40',
    dotColor: '#C084FC',
  },
  {
    id: 'sfx',
    name: 'SFX / Sound Hit',
    color: '#F59E0B',
    bgClass: 'bg-amber-500/20',
    textClass: 'text-amber-400',
    borderClass: 'border-amber-500/40',
    dotColor: '#FBBF24',
  },
  {
    id: 'hook',
    name: 'Hook / Climax',
    color: '#06B6D4',
    bgClass: 'bg-cyan-500/20',
    textClass: 'text-cyan-400',
    borderClass: 'border-cyan-500/40',
    dotColor: '#22D3EE',
  },
  {
    id: 'note',
    name: 'Editor Feedback',
    color: '#10B981',
    bgClass: 'bg-emerald-500/20',
    textClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/40',
    dotColor: '#34D399',
  },
];

export function getMarkerTypeMeta(type: TimelineMarker['type']) {
  return MARKER_TYPES.find((m) => m.id === type) || MARKER_TYPES[0];
}
