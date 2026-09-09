/**
 * Project Version History & Auto-Save Snapshots for EditFlow
 * Captures milestone checkpoints of timeline operations and enables 1-click rollbacks.
 */

export interface ProjectSnapshot {
  id: string;
  name: string;
  timestamp: number;
  formattedTime: string;
  operationsCount: number;
  operations: any[];
  trimStart: number;
  trimEnd: number;
  subtitleText?: string;
  selectedFilter?: string;
  aspectRatio?: string;
}

const STORAGE_PREFIX = 'editflow_history_';

export function getProjectSnapshots(projectId: string): ProjectSnapshot[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${projectId}`);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('Failed to load project snapshots:', err);
    return [];
  }
}

export function saveProjectSnapshot(
  projectId: string,
  snapshotData: {
    name: string;
    operations: any[];
    trimStart: number;
    trimEnd: number;
    subtitleText?: string;
    selectedFilter?: string;
    aspectRatio?: string;
  }
): ProjectSnapshot[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = getProjectSnapshots(projectId);
    const now = new Date();
    const formattedTime = `${now.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const newSnapshot: ProjectSnapshot = {
      id: `snap-${Date.now()}`,
      name: snapshotData.name || `Snapshot #${existing.length + 1}`,
      timestamp: Date.now(),
      formattedTime,
      operationsCount: snapshotData.operations.length,
      operations: snapshotData.operations,
      trimStart: snapshotData.trimStart,
      trimEnd: snapshotData.trimEnd,
      subtitleText: snapshotData.subtitleText,
      selectedFilter: snapshotData.selectedFilter,
      aspectRatio: snapshotData.aspectRatio,
    };

    // Keep up to 15 recent snapshots
    const updated = [newSnapshot, ...existing].slice(0, 15);
    localStorage.setItem(`${STORAGE_PREFIX}${projectId}`, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to save project snapshot:', err);
    return [];
  }
}

export function deleteProjectSnapshot(projectId: string, snapshotId: string): ProjectSnapshot[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = getProjectSnapshots(projectId);
    const updated = existing.filter((s) => s.id !== snapshotId);
    localStorage.setItem(`${STORAGE_PREFIX}${projectId}`, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to delete project snapshot:', err);
    return [];
  }
}
