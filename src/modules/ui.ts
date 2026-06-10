// ===== PDF Export — jsPDF + html2canvas (replaces window.print()) =====
// ===== UI Controls =====

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { state, saveState, getDefaultState } from './state';
import { renderForm } from './form';
import { renderPreview, increaseResumeFont, decreaseResumeFont, setResumeFontFamily, setPageMode } from './preview';
import { updateScore } from './score';
import { pushHistory } from './history';
import { autoExpandAllTextareas } from './utils';

// ===== PDF EXPORT =====
export async function exportPDF(): Promise<void> {
  const pages = document.querySelectorAll<HTMLElement>('#resumePagesContainer .resume-page');
  if (!pages.length) {
    alert('No resume content to export.');
    return;
  }

  // Show loading indicator
  const btn = document.getElementById('exportPDFBtn') as HTMLButtonElement | null;
  const originalText = btn?.textContent ?? 'Export PDF';
  if (btn) { btn.textContent = '⏳ Generating...'; btn.disabled = true; }

  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'letter', // 612 x 792 pt = 8.5 x 11 in
    });

    const pageWidthPt = 612;
    const pageHeightPt = 792;

    for (let i = 0; i < pages.length; i++) {
      if (i > 0) pdf.addPage('letter', 'portrait');
      const canvas = await html2canvas(pages[i], {
        scale: 2,             // 2x resolution for crisp text
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: pages[i].scrollWidth,
        windowHeight: pages[i].scrollHeight,
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.97);
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidthPt, pageHeightPt);
    }

    const filename = (state.name || 'resume').replace(/\s+/g, '-').toLowerCase() + '.pdf';
    pdf.save(filename);
  } catch (err) {
    console.error('PDF export failed:', err);
    alert('PDF export failed. Try again or use Ctrl+P as fallback.');
  } finally {
    if (btn) { btn.textContent = originalText; btn.disabled = false; }
  }
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
