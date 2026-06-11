// ===== PDF Export — window.print() =====
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
let _formFullscreen = false;

export function toggleFormFullscreen(): void {
  _formFullscreen = !_formFullscreen;
  document.getElementById('formPanel')?.classList.toggle('fullscreen', _formFullscreen);
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

// Re-export font/page controls for main.ts window wiring
export { increaseResumeFont, decreaseResumeFont, setResumeFontFamily, setPageMode };
