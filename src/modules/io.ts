// ===== I/O: Save/Load JSON — Zod validation =====

import { z } from 'zod';
import { state, saveState, mergeSectionOrder, mergeSectionVisibility } from './state';
import { renderForm } from './form';
import { renderPreview } from './preview';
import { updateScore } from './score';
import { pushHistory } from './history';

// ===== ZOD SCHEMAS =====
const EducationSchema = z.object({
  school: z.string().default(''),
  degree: z.string().default(''),
  gpa: z.string().default(''),
  start: z.string().default(''),
  end: z.string().default(''),
  coursework: z.string().default(''),
  activities: z.string().default(''),
});

const ExperienceSchema = z.object({
  company: z.string().default(''),
  role: z.string().default(''),
  start: z.string().default(''),
  end: z.string().default(''),
  location: z.string().default(''),
  bullets: z.array(z.string()).default(['']),
});

const SkillSchema = z.object({
  category: z.string().default(''),
  items: z.string().default(''),
});

const ProjectSchema = z.object({
  role: z.string().default(''),
  name: z.string().default(''),
  tech: z.string().default(''),
  date: z.string().default(''),
  bullets: z.array(z.string()).default(['']),
});

const LeadershipSchema = z.object({
  organization: z.string().default(''),
  role: z.string().default(''),
  start: z.string().default(''),
  end: z.string().default(''),
  bullets: z.array(z.string()).default(['']),
});

const CertificationSchema = z.object({
  name: z.string().default(''),
  issuer: z.string().default(''),
  date: z.string().default(''),
});

const LanguageSchema = z.object({
  name: z.string().default(''),
  level: z.string().default(''),
});

const ResumeStateSchema = z.object({
  name: z.string().default(''),
  contact: z.string().default(''),
  targetRole: z.string().default(''),
  summary: z.string().default(''),
  fontSizeStep: z.number().default(0),
  fontFamily: z.string().default('Times New Roman, Georgia, serif'),
  pageMode: z.enum(['single', 'multi']).default('single'),
  photo: z.string().default(''),
  aiInsights: z.record(z.string(), z.unknown()).default({}),
  sectionOrder: z.array(z.string()).optional(),
  sectionVisibility: z.record(z.string(), z.boolean()).optional(),
  education: z.array(EducationSchema).default([]),
  experience: z.array(ExperienceSchema).default([]),
  skills: z.array(SkillSchema).default([]),
  projects: z.array(ProjectSchema).default([]),
  leadership: z.array(LeadershipSchema).default([]),
  certifications: z.array(CertificationSchema).default([]),
  languages: z.array(LanguageSchema).default([]),
}).passthrough(); // Allow extra fields for forward compat

// ===== SAVE =====
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

// ===== LOAD =====
export function loadJSON(): void {
  document.getElementById('jsonLoadInput')?.click();
}

export function handleJSONLoad(event: Event): void {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const raw = JSON.parse((e.target as FileReader).result as string);
      // Validate + coerce with Zod
      const result = ResumeStateSchema.safeParse(raw);
      if (!result.success) {
        const issues = result.error.issues.map((i) => `• ${i.path.join('.')}: ${i.message}`).join('\n');
        alert(`Invalid resume file:\n${issues}`);
        return;
      }
      const parsed = result.data;
      Object.assign(state, {
        ...parsed,
        sectionOrder: mergeSectionOrder(parsed.sectionOrder),
        sectionVisibility: mergeSectionVisibility(parsed.sectionVisibility),
      });
      pushHistory();
      renderForm();
      renderPreview();
      updateScore();
      saveState();
      alert('Resume loaded successfully!');
    } catch (err) {
      alert(`Failed to parse file: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  reader.readAsText(file);
  (event.target as HTMLInputElement).value = '';
}
