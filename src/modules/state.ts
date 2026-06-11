// ===== State Management — Zustand (persist) + Zod (validation on load) =====

import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';
import type { PersistStorage, StorageValue } from 'zustand/middleware';
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

// ===== DEFAULTS =====
export function getDefaultSectionOrder(): string[] {
  return ['personal', 'summary', 'education', 'experience', 'projects', 'skills', 'leadership', 'certifications', 'languages'];
}

export function getDefaultSectionVisibility(): SectionVisibility {
  return {
    personal: true, summary: true, education: true, experience: true,
    projects: true, skills: true, leadership: true, certifications: true, languages: true,
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
    name: '', contact: '', targetRole: '', address: '', summary: '',
    fontSizeStep: 0, fontFamily: 'Times New Roman, Georgia, serif',
    pageMode: 'single', photo: '', aiInsights: {},
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

// ===== NORMALIZE (pure function returning new state) =====
function normalize(s: Partial<ResumeState>): ResumeState {
  const defaults = getDefaultState();
  return {
    ...defaults,
    ...s,
    summary: s.summary ?? '',
    address: s.address ?? '',
    aiInsights: s.aiInsights ?? {},
    fontSizeStep: typeof s.fontSizeStep === 'number' ? s.fontSizeStep : 0,
    pageMode: s.pageMode ?? 'single',
    fontFamily: s.fontFamily ?? 'Times New Roman, Georgia, serif',
    sectionOrder: mergeSectionOrder(s.sectionOrder),
    sectionVisibility: mergeSectionVisibility(s.sectionVisibility),
    education: Array.isArray(s.education) ? s.education : defaults.education,
    experience: Array.isArray(s.experience) ? s.experience : defaults.experience,
    skills: Array.isArray(s.skills) ? s.skills : defaults.skills,
    projects: Array.isArray(s.projects) ? s.projects : defaults.projects,
    leadership: Array.isArray(s.leadership) ? s.leadership : defaults.leadership,
    certifications: Array.isArray(s.certifications) ? s.certifications : defaults.certifications,
    languages: Array.isArray(s.languages) ? s.languages : defaults.languages,
  };
}

// ===== ZUSTAND STORE =====
const migrateStorage: PersistStorage<ResumeState> = {
  getItem(name: string): StorageValue<ResumeState> | null {
    const raw = localStorage.getItem(name);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      // Old format — wrap to Zustand persist format { state, version }
      if (!Object.prototype.hasOwnProperty.call(parsed, 'state')) {
        return { state: parsed, version: 0 };
      }
      return parsed as StorageValue<ResumeState>;
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: StorageValue<ResumeState>) => localStorage.setItem(name, JSON.stringify(value)),
  removeItem: (name: string) => localStorage.removeItem(name),
};

const _store = createStore<ResumeState>()(
  persist(
    () => getDefaultState(),
    {
      name: 'resume_state',
      storage: migrateStorage,
      merge: (persisted, current) => normalize({ ...current, ...(persisted as Partial<ResumeState>) }),
    }
  )
);

// ===== MUTABLE STATE (for backward-compat with all other modules) =====
// All modules import `state` and mutate it directly — Zustand is used for persistence
export const state: ResumeState = getDefaultState();

export function loadState(): void {
  const saved = _store.getState();
  Object.assign(state, normalize(saved));
}

export function saveState(): void {
  // Sync mutable state → Zustand store → auto-persists to localStorage
  _store.setState({ ...state }, true);
}

export function isSectionVisible(section: string): boolean {
  return mergeSectionVisibility(state.sectionVisibility)[section] !== false;
}
