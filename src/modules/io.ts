// ===== I/O: Save/Load JSON =====

import { state, saveState, mergeSectionOrder, mergeSectionVisibility } from './state';
import { renderForm } from './form';
import { renderPreview } from './preview';
import { updateScore } from './score';
import { pushHistory } from './history';

export function saveAsJSON(): void {
  const data = JSON.stringify(state, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = (state.name || 'resume').replace(/\s+/g, '-').toLowerCase() + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function loadJSON(): void {
  document.getElementById('jsonLoadInput')?.click();
}

export function handleJSONLoad(event: Event): void {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const loaded = JSON.parse((e.target as FileReader).result as string);
      Object.keys(loaded).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(state, key)) {
          (state as Record<string, unknown>)[key] = loaded[key];
        }
      });
      if (!state.summary) state.summary = '';
      if (!state.aiInsights) state.aiInsights = {};
      if (typeof state.fontSizeStep !== 'number') state.fontSizeStep = 0;
      if (!state.fontFamily) state.fontFamily = 'Times New Roman, Georgia, serif';
      state.sectionOrder = mergeSectionOrder(state.sectionOrder);
      state.sectionVisibility = mergeSectionVisibility(state.sectionVisibility);
      state.education = Array.isArray(state.education) ? state.education : [];
      state.experience = Array.isArray(state.experience) ? state.experience : [];
      state.skills = Array.isArray(state.skills) ? state.skills : [];
      state.projects = Array.isArray(state.projects) ? state.projects : [];
      state.leadership = Array.isArray(state.leadership) ? state.leadership : [];
      state.certifications = Array.isArray(state.certifications) ? state.certifications : [];
      state.languages = Array.isArray(state.languages) ? state.languages : [];
      pushHistory();
      renderForm();
      renderPreview();
      updateScore();
      saveState();
      alert('Resume loaded!');
    } catch (_) {
      alert('Invalid JSON file.');
    }
  };
  reader.readAsText(file);
  (event.target as HTMLInputElement).value = '';
}
