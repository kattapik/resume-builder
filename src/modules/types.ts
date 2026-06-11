// ===== Type Definitions for Resume Builder Pro =====

export interface EducationEntry {
  school: string;
  degree: string;
  gpa: string;
  start: string;
  end: string;
  coursework: string;
  activities: string;
}

export interface ExperienceEntry {
  company: string;
  role: string;
  start: string;
  end: string;
  location: string;
  bullets: string[];
}

export interface SkillEntry {
  category: string;
  items: string;
}

export interface ProjectEntry {
  role: string;
  name: string;
  tech: string;
  date: string;
  bullets: string[];
}

export interface LeadershipEntry {
  organization: string;
  role: string;
  start: string;
  end: string;
  bullets: string[];
}

export interface CertificationEntry {
  name: string;
  issuer: string;
  date: string;
}

export interface LanguageEntry {
  name: string;
  level: string;
}

export interface AIInsight {
  title: string;
  payload: unknown;
}

export interface SectionVisibility {
  personal: boolean;
  summary: boolean;
  education: boolean;
  experience: boolean;
  projects: boolean;
  skills: boolean;
  leadership: boolean;
  certifications: boolean;
  languages: boolean;
  [key: string]: boolean;
}

export type SectionKey = keyof SectionVisibility;

export interface ResumeState {
  name: string;
  contact: string;
  targetRole: string;
  address: string;
  summary: string;
  fontSizeStep: number;
  lineHeightStep: number;
  fontFamily: string;
  pageMode: 'single' | 'multi';
  photo: string;
  aiInsights: Record<string, AIInsight>;
  sectionOrder: string[];
  sectionVisibility: SectionVisibility;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  skills: SkillEntry[];
  projects: ProjectEntry[];
  leadership: LeadershipEntry[];
  certifications: CertificationEntry[];
  languages: LanguageEntry[];
}

export interface ScoreBreakdownItem {
  label: string;
  score: number;
  max: number;
}

export interface FeedbackItem {
  type: 'error' | 'warn' | 'good';
  title: string;
  desc: string;
}

export interface RoleTemplate {
  label: string;
  desc: string;
  targetRole: string;
  skills: Array<{ cat: string; items: string[] }>;
  bullets: {
    experience: string[];
    projects: string[];
  };
}

export interface AIToolDef {
  label: string;
  desc: string;
  buildPrompt(): string;
  apply(json: Record<string, unknown>): void;
}
