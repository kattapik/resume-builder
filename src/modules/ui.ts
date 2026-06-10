// ===== UI Controls =====

import { state, saveState, getDefaultState } from './state';
import { renderForm } from './form';
import { renderPreview, increaseResumeFont, decreaseResumeFont, setResumeFontFamily, setPageMode } from './preview';
import { updateScore } from './score';
import { pushHistory } from './history';
import { autoExpandAllTextareas } from './utils';

// ===== PDF EXPORT =====
export function exportPDF(): void {
  window.print();
}

// ===== FORM FULLSCREEN =====
let formFullscreen = false;

export function toggleFormFullscreen(): void {
  formFullscreen = !formFullscreen;
  const panel = document.getElementById('formPanel');
  panel?.classList.toggle('fullscreen', formFullscreen);
  autoExpandAllTextareas();
}

// ===== CLEAR ALL =====
export function clearAll(): void {
  if (confirm('Clear all data? This cannot be undone.')) {
    localStorage.removeItem('resume_state');
    Object.assign(state, getDefaultState());
    pushHistory();
    renderForm();
    renderPreview();
    updateScore();
  }
}

// Re-export font/page controls so main.ts can wire them to window
export { increaseResumeFont, decreaseResumeFont, setResumeFontFamily, setPageMode };
