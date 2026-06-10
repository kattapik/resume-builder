// ===== State Management =====

import type {
  ResumeState,
  SectionVisibility,
  EducationEntry,
  ExperienceEntry,
  SkillEntry,
  ProjectEntry,
  LeadershipEntry,
  CertificationEntry,
  LanguageEntry,
} from './types';

const STORAGE_KEY = 'resume_state';

export function getDefaultSectionOrder(): string[] {
  return ['personal', 'summary', 'education', 'experience', 'projects', 'skills', 'leadership', 'certifications', 'languages'];
}

export function getDefaultSectionVisibility(): SectionVisibility {
  return {
    personal: true,
    summary: true,
    education: true,
    experience: true,
    projects: true,
    skills: true,
    leadership: true,
    certifications: true,
    languages: true,
  };
}

export function mergeSectionOrder(savedOrder: unknown): string[] {
  const defaults = getDefaultSectionOrder();
  const incoming = Array.isArray(savedOrder)
    ? (savedOrder as string[]).filter((s) => defaults.includes(s))
    : [];
  return incoming.concat(defaults.filter((s) => !incoming.includes(s)));
}

export function mergeSectionVisibility(savedVisibility: unknown): SectionVisibility {
  return Object.assign(getDefaultSectionVisibility(), savedVisibility || {});
}

export function getDefaultState(): ResumeState {
  return {
    name: '',
    contact: '',
    targetRole: '',
    summary: '',
    fontSizeStep: 0,
    fontFamily: 'Times New Roman, Georgia, serif',
    pageMode: 'single',
    photo: '',
    aiInsights: {},
    sectionOrder: getDefaultSectionOrder(),
    sectionVisibility: getDefaultSectionVisibility(),
    education: [{ school: '', degree: '', gpa: '', start: '', end: '', coursework: '', activities: '' }] as EducationEntry[],
    experience: [{ company: '', role: '', start: '', end: '', location: '', bullets: [''] }] as ExperienceEntry[],
    skills: [
      { category: 'Programming Languages', items: '' },
      { category: 'Frameworks & Tools', items: '' },
    ] as SkillEntry[],
    projects: [{ role: '', name: '', tech: '', date: '', bullets: [''] }] as ProjectEntry[],
    leadership: [{ organization: '', role: '', start: '', end: '', bullets: [''] }] as LeadershipEntry[],
    certifications: [{ name: '', issuer: '', date: '' }] as CertificationEntry[],
    languages: [{ name: '', level: '' }] as LanguageEntry[],
  };
}

// Mutable state — shared across all modules via import
export const state: ResumeState = getDefaultState();

function normalizeState(s: ResumeState): void {
  if (!s.summary) s.summary = '';
  if (!s.aiInsights) s.aiInsights = {};
  if (typeof s.fontSizeStep !== 'number') s.fontSizeStep = 0;
  if (!s.pageMode) s.pageMode = 'single';
  if (!s.fontFamily) s.fontFamily = 'Times New Roman, Georgia, serif';
  s.sectionOrder = mergeSectionOrder(s.sectionOrder);
  s.sectionVisibility = mergeSectionVisibility(s.sectionVisibility);
  s.education = Array.isArray(s.education) ? s.education : [];
  s.experience = Array.isArray(s.experience) ? s.experience : [];
  s.skills = Array.isArray(s.skills) ? s.skills : [];
  s.projects = Array.isArray(s.projects) ? s.projects : [];
  s.leadership = Array.isArray(s.leadership) ? s.leadership : [];
  s.certifications = Array.isArray(s.certifications) ? s.certifications : [];
  s.languages = Array.isArray(s.languages) ? s.languages : [];
}

export function loadState(): void {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as ResumeState;
      Object.assign(state, parsed);
    } catch (_) {
      // ignore parse errors — use defaults
    }
  }
  // Fall back to default if empty
  if (!state.name && !state.education.length) {
    Object.assign(state, getDefaultState());
  }
  normalizeState(state);
}

export function saveState(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function isSectionVisible(section: string): boolean {
  const vis = mergeSectionVisibility(state.sectionVisibility);
  return vis[section] !== false;
}
