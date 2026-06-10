// ===== Resume Builder Pro — Entry Point =====
// All modules are imported here. Functions needed by HTML onclick="" are exposed on window.

import './styles/main.css';

import { loadState, saveState } from './modules/state';
import { renderForm, onFormChange, onSummaryChange, handlePhotoUpload, toggleSectionVisibility, addEduEntry, addExpEntry, addSkillEntry, addProjEntry, addLeadershipEntry, addCertificationEntry, addLanguageEntry, removeEntry, updateEdu, updateExp, updateSkill, updateProj, updateLeadership, updateCertification, updateLanguage, updateExpBullets, updateProjBullets, updateLeadershipBullets } from './modules/form';
import { renderPreview } from './modules/preview';
import { updateScore } from './modules/score';
import { pushHistory, undo, redo } from './modules/history';
import { toggleSection, toggleEntryCard, autoExpandTextarea } from './modules/utils';
import { onDragStart, onDragOver, onDrop, onDragEnd, onSectionDragStart, onSectionDragOver, onSectionDrop, onSectionDragEnd } from './modules/dragdrop';
import { openWizard, closeWizard, wizardNext, wizardPrev, selectRole, toggleSkill, copyWizardPrompt, wizardApplyAI } from './modules/wizard';
import { openAIAnalyst, closeAIAnalyst, selectAITool, copyAIPrompt, applyAIResult } from './modules/ai-tools';
import { saveAsJSON, loadJSON, handleJSONLoad } from './modules/io';
import { exportPDF, toggleFormFullscreen, clearAll, increaseResumeFont, decreaseResumeFont, setResumeFontFamily, setPageMode } from './modules/ui';

// ===== EXPOSE GLOBALS FOR HTML onclick HANDLERS =====
// (Necessary because HTML event attributes call functions by name on window)
declare global {
  interface Window {
    onFormChange: typeof onFormChange;
    onSummaryChange: typeof onSummaryChange;
    handlePhotoUpload: typeof handlePhotoUpload;
    toggleSection: typeof toggleSection;
    toggleSectionVisibility: typeof toggleSectionVisibility;
    toggleEntryCard: typeof toggleEntryCard;
    autoExpandTextarea: typeof autoExpandTextarea;
    addEduEntry: typeof addEduEntry;
    addExpEntry: typeof addExpEntry;
    addSkillEntry: typeof addSkillEntry;
    addProjEntry: typeof addProjEntry;
    addLeadershipEntry: typeof addLeadershipEntry;
    addCertificationEntry: typeof addCertificationEntry;
    addLanguageEntry: typeof addLanguageEntry;
    removeEntry: typeof removeEntry;
    updateEdu: typeof updateEdu;
    updateExp: typeof updateExp;
    updateSkill: typeof updateSkill;
    updateProj: typeof updateProj;
    updateLeadership: typeof updateLeadership;
    updateCertification: typeof updateCertification;
    updateLanguage: typeof updateLanguage;
    updateExpBullets: typeof updateExpBullets;
    updateProjBullets: typeof updateProjBullets;
    updateLeadershipBullets: typeof updateLeadershipBullets;
    onDragStart: typeof onDragStart;
    onDragOver: typeof onDragOver;
    onDrop: typeof onDrop;
    onDragEnd: typeof onDragEnd;
    onSectionDragStart: typeof onSectionDragStart;
    onSectionDragOver: typeof onSectionDragOver;
    onSectionDrop: typeof onSectionDrop;
    onSectionDragEnd: typeof onSectionDragEnd;
    openWizard: typeof openWizard;
    closeWizard: typeof closeWizard;
    wizardNext: typeof wizardNext;
    wizardPrev: typeof wizardPrev;
    selectRole: typeof selectRole;
    toggleSkill: typeof toggleSkill;
    copyWizardPrompt: typeof copyWizardPrompt;
    wizardApplyAI: typeof wizardApplyAI;
    openAIAnalyst: typeof openAIAnalyst;
    closeAIAnalyst: typeof closeAIAnalyst;
    selectAITool: typeof selectAITool;
    copyAIPrompt: typeof copyAIPrompt;
    applyAIResult: typeof applyAIResult;
    saveAsJSON: typeof saveAsJSON;
    loadJSON: typeof loadJSON;
    handleJSONLoad: typeof handleJSONLoad;
    exportPDF: typeof exportPDF;
    toggleFormFullscreen: typeof toggleFormFullscreen;
    clearAll: typeof clearAll;
    increaseResumeFont: typeof increaseResumeFont;
    decreaseResumeFont: typeof decreaseResumeFont;
    setResumeFontFamily: typeof setResumeFontFamily;
    setPageMode: typeof setPageMode;
    undo: () => void;
    redo: () => void;
  }
}

// Assign all to window
Object.assign(window, {
  onFormChange,
  onSummaryChange,
  handlePhotoUpload,
  toggleSection,
  toggleSectionVisibility,
  toggleEntryCard,
  autoExpandTextarea,
  addEduEntry,
  addExpEntry,
  addSkillEntry,
  addProjEntry,
  addLeadershipEntry,
  addCertificationEntry,
  addLanguageEntry,
  removeEntry,
  updateEdu,
  updateExp,
  updateSkill,
  updateProj,
  updateLeadership,
  updateCertification,
  updateLanguage,
  updateExpBullets,
  updateProjBullets,
  updateLeadershipBullets,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onSectionDragStart,
  onSectionDragOver,
  onSectionDrop,
  onSectionDragEnd,
  openWizard,
  closeWizard,
  wizardNext,
  wizardPrev,
  selectRole,
  toggleSkill,
  copyWizardPrompt,
  wizardApplyAI,
  openAIAnalyst,
  closeAIAnalyst,
  selectAITool,
  copyAIPrompt,
  applyAIResult,
  saveAsJSON,
  loadJSON,
  handleJSONLoad,
  exportPDF,
  toggleFormFullscreen,
  clearAll,
  increaseResumeFont,
  decreaseResumeFont,
  setResumeFontFamily,
  setPageMode,
  undo: () => {
    undo(() => {
      renderForm();
      renderPreview();
      updateScore();
    });
  },
  redo: () => {
    redo(() => {
      renderForm();
      renderPreview();
      updateScore();
    });
  },
});

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); window.undo(); }
  if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); window.redo(); }
  if ((e.ctrlKey || e.metaKey) && e.key === 'e') { e.preventDefault(); void exportPDF(); }
});

// ===== INIT =====
function init(): void {
  loadState();
  renderForm();
  renderPreview();
  updateScore();
}

pushHistory();
init();
