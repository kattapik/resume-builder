// ===== Undo / Redo — structuredClone (faster than JSON.stringify/parse) =====

import type { ResumeState } from './types';
import { state, saveState } from './state';

// Store snapshots as actual objects, not JSON strings
let history: ResumeState[] = [];
let historyIndex = -1;

export function pushHistory(): void {
  history = history.slice(0, historyIndex + 1);
  history.push(structuredClone(state));   // ~3x faster than JSON.stringify
  historyIndex = history.length - 1;
  if (history.length > 50) {
    history.shift();
    historyIndex--;
  }
  updateHistoryButtons();
}

export function undo(onDone: () => void): void {
  if (historyIndex > 0) {
    historyIndex--;
    Object.assign(state, structuredClone(history[historyIndex]));
    onDone();
    saveState();
    updateHistoryButtons();
  }
}

export function redo(onDone: () => void): void {
  if (historyIndex < history.length - 1) {
    historyIndex++;
    Object.assign(state, structuredClone(history[historyIndex]));
    onDone();
    saveState();
    updateHistoryButtons();
  }
}

export function updateHistoryButtons(): void {
  const undoBtn = document.getElementById('undoBtn') as HTMLButtonElement | null;
  const redoBtn = document.getElementById('redoBtn') as HTMLButtonElement | null;
  if (undoBtn) undoBtn.disabled = historyIndex <= 0;
  if (redoBtn) redoBtn.disabled = historyIndex >= history.length - 1;
}
