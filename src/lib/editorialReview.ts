/**
 * Real-Time Collaborative Editorial Review & Annotation Pins
 * Allows editors, directors, and agency clients to pin frame-accurate feedback,
 * mark revision approvals, and track editorial progress across the timeline.
 */

export interface EditorialPin {
  id: string;
  timestamp: number; // in seconds
  author: string;
  role: 'Client' | 'Lead Editor' | 'Director' | 'Sound Designer';
  comment: string;
  category: 'pacing' | 'visual' | 'audio' | 'brand' | 'general';
  status: 'pending' | 'resolved' | 'rejected';
  createdAt: string;
}

export const REVIEW_CATEGORIES = [
  { id: 'pacing', label: 'Pacing & Cuts', color: '#06B6D4' },
  { id: 'visual', label: 'Visual / B-Roll', color: '#8B5CF6' },
  { id: 'audio', label: 'Audio & Music', color: '#10B981' },
  { id: 'brand', label: 'Brand & Text', color: '#F59E0B' },
  { id: 'general', label: 'General Note', color: '#6B7280' },
];

const STORAGE_PREFIX = 'editflow_editorial_pins_';

export function loadEditorialPins(projectId: string): EditorialPin[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${projectId}`);
    if (!raw) {
      // Default demo feedback pins for instant collaboration preview
      return [
        {
          id: 'pin-demo-1',
          timestamp: 2.5,
          author: 'Alex (Agency Lead)',
          role: 'Client',
          comment: 'Punch in tighter here or add dynamic zoom on the first claim.',
          category: 'visual',
          status: 'pending',
          createdAt: '10 mins ago',
        },
        {
          id: 'pin-demo-2',
          timestamp: 8.0,
          author: 'Sarah (Creative Director)',
          role: 'Director',
          comment: 'The music ducking feels great! Make sure subtitles are uppercase here.',
          category: 'pacing',
          status: 'resolved',
          createdAt: '25 mins ago',
        },
      ];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveEditorialPins(projectId: string, pins: EditorialPin[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${projectId}`, JSON.stringify(pins));
  } catch (e) {
    console.error('Failed to save editorial pins:', e);
  }
}

export function exportEditorialSummary(pins: EditorialPin[]): string {
  if (pins.length === 0) return 'No editorial notes recorded.';

  const lines = ['# EditFlow Studio — Editorial Review Sheet\n'];
  pins.forEach((pin, i) => {
    lines.push(
      `${i + 1}. [${pin.timestamp.toFixed(1)}s] [${pin.status.toUpperCase()}] ${pin.author} (${pin.role}) - ${pin.category.toUpperCase()}`
    );
    lines.push(`   Note: ${pin.comment}\n`);
  });

  return lines.join('\n');
}
