// ===== AI Tools (Copy Prompt → Paste JSON → Apply) =====

import { state, saveState } from './state';
import { esc } from './utils';
import { renderForm } from './form';
import { renderPreview } from './preview';
import { updateScore } from './score';
import { pushHistory } from './history';
import type { AIToolDef } from './types';

let currentAITool = 'summary';

// ===== HELPERS =====
function getResumeContext() {
  return {
    targetRole: state.targetRole || 'Not specified',
    name: state.name || 'Not specified',
    contact: state.contact || 'Not specified',
    summary: state.summary || '',
    education: state.education,
    experience: state.experience,
    skills: state.skills,
    projects: state.projects,
    leadership: state.leadership,
    certifications: state.certifications,
    languages: state.languages,
  };
}

function getAIWritingRules(): string {
  return [
    'Write in a professional, formal, human-sounding tone.',
    'Do not sound robotic, vague, inflated, or obviously AI-generated.',
    'Do not use filler phrases or empty claims.',
    'Prefer concrete nouns, specific responsibilities, measurable outcomes, and clear verbs.',
    'Avoid weak verbs such as: supported, helped, responsible for, involved in, worked on.',
    'Prefer stronger verbs such as: built, developed, designed, implemented, optimized, delivered, reduced, improved, automated, led.',
    'Preserve truthful scope. Do not invent unrealistic achievements.',
    'Keep wording concise, ATS-friendly, and easy to scan.',
  ].join('\n- ');
}

function getAllResumeBullets(): string[] {
  return [...state.experience, ...state.projects, ...state.leadership].flatMap((x) =>
    (x.bullets || []).filter((b) => b.trim())
  );
}

function getOnePageGuide() {
  return {
    preferredMaxSummarySentences: 4,
    preferredMaxSkillCategories: 4,
    preferredMaxSkillsPerCategory: 6,
    preferredMaxProjectEntries: 2,
    preferredMaxBulletsPerEntry: 3,
    preferredMaxBulletWords: 24,
  };
}

function upsertAIInsight(key: string, title: string, payload: unknown): void {
  if (!state.aiInsights) state.aiInsights = {};
  state.aiInsights[key] = { title, payload };
}

// ===== AI TOOL DEFINITIONS =====
export const AI_TOOLS: Record<string, AIToolDef> = {
  summary: {
    label: 'Personal Statement',
    desc: 'สร้าง personal statement 3-4 ประโยคสำหรับส่วนบนสุดของ resume — บอกว่าใคร, เก่งอะไร, และทำไมถึงเหมาะกับ role นี้',
    buildPrompt() {
      return `You are a senior resume writer.\n\nTask:\nWrite a personal statement for the candidate below.\n\nQuality rules:\n- ${getAIWritingRules()}\n- Write exactly 3-4 sentences.\n- Keep it concise enough for a 1-page resume.\n- Sentence 1: who the candidate is and target role.\n- Sentence 2: strongest technical strengths and stack.\n- Sentence 3: business impact, delivery style, or collaboration strengths.\n- Optional sentence 4: domain fit, collaboration style, or product mindset if supported by the resume.\n- Do not use first person pronouns.\n\n1-page guide:\n${JSON.stringify(getOnePageGuide(), null, 2)}\n\nResume context:\n${JSON.stringify(getResumeContext(), null, 2)}\n\nReturn ONLY valid JSON with this exact schema:\n{\n  "personalStatement": "3-4 sentence personal statement"\n}`;
    },
    apply(json) {
      const j = json as { personalStatement?: string };
      if (j.personalStatement) state.summary = j.personalStatement.trim();
    },
  },
  bulletrewrite: {
    label: 'Bullet Rewrite',
    desc: 'แก้ bullet เดียวให้ดู professional ขึ้น — เลือก bullet จาก resume ด้านล่าง แล้ว AI จะ rewrite ให้',
    buildPrompt() {
      const allBullets = getAllResumeBullets();
      return `You are a senior resume editor.\n\nTask:\nRewrite ALL resume bullets below to sound more professional, specific, and human-written.\n\nQuality rules:\n- ${getAIWritingRules()}\n- Keep each bullet to one line.\n- Use one strong action verb at the start.\n- Keep bullets under 24 words when possible.\n- Preserve the original meaning.\n- Return bullets in the same order.\n\nResume context:\n${JSON.stringify(getResumeContext(), null, 2)}\n\nAll current bullets:\n${allBullets.length ? allBullets.map((b, i) => `${i + 1}. ${b}`).join('\n') : 'none'}\n\nReturn ONLY valid JSON with this exact schema:\n{\n  "rewrittenBullets": ["bullet 1 improved", "bullet 2 improved"]\n}`;
    },
    apply(json) {
      const j = json as { rewrittenBullets?: string[] };
      if (j.rewrittenBullets && j.rewrittenBullets.length) {
        let idx = 0;
        for (const section of [state.experience, state.projects, state.leadership]) {
          for (const entry of section) {
            if (entry.bullets && idx < j.rewrittenBullets.length) {
              entry.bullets = entry.bullets.map(() => j.rewrittenBullets![idx++] || '');
            }
          }
        }
      }
    },
  },
  grammar: {
    label: 'Grammar',
    desc: 'ตรวจ grammar, tone, consistency ของ bullet ทั้งหมดใน resume — แก้คำผิด, ปรับ parallel structure, แทนที่คำ generic',
    buildPrompt() {
      const allBullets = getAllResumeBullets();
      return `You are a senior resume editor.\n\nTask:\nEdit the resume wording below for grammar, tone, consistency, concision, and professionalism.\n\nQuality rules:\n- ${getAIWritingRules()}\n- Fix grammar, tense, punctuation, parallel structure, and tone consistency.\n- Keep bullets in the same order.\n- Keep the same meaning unless wording is weak or unclear.\n- Rewrite bullets so they start with a strong verb when possible.\n- Keep wording concise enough for a 1-page resume.\n\nResume context:\n${JSON.stringify(getResumeContext(), null, 2)}\n\nBullets to review in current order:\n${allBullets.length ? allBullets.map((b, i) => `${i + 1}. ${b}`).join('\n') : 'none'}\n\nReturn ONLY valid JSON with this exact schema:\n{\n  "fixedBullets": ["bullet 1 in same order", "bullet 2 in same order"],\n  "issues": ["specific issue 1", "specific issue 2"],\n  "suggestions": ["high-level suggestion 1", "high-level suggestion 2"]\n}`;
    },
    apply(json) {
      const j = json as { fixedBullets?: string[]; issues?: string[]; suggestions?: string[] };
      if (j.fixedBullets && j.fixedBullets.length) {
        let idx = 0;
        for (const section of [state.experience, state.projects, state.leadership]) {
          for (const entry of section) {
            if (entry.bullets && idx < j.fixedBullets.length) {
              entry.bullets = entry.bullets.map(() => j.fixedBullets![idx++] || '');
            }
          }
        }
      }
      upsertAIInsight('grammar', 'Grammar & Tone Review', { issues: j.issues || [], suggestions: j.suggestions || [] });
    },
  },
  atsreview: {
    label: 'ATS Review',
    desc: 'ตรวจว่า resume อ่านผ่าน ATS ได้ดีแค่ไหน — บอก keyword ที่ขาด, จุดเสี่ยง, และสิ่งที่ควรเพิ่ม',
    buildPrompt() {
      return `You are an ATS-focused resume reviewer.\n\nTask:\nReview this resume for ATS friendliness and keyword clarity.\n\nQuality rules:\n- Evaluate structure, section names, keyword usage, scanability, and wording.\n- Flag anything too vague for ATS matching.\n- Consider whether the content is concise enough for a strong 1-page technical resume.\n\nResume context:\n${JSON.stringify(getResumeContext(), null, 2)}\n\nReturn ONLY valid JSON with this exact schema:\n{\n  "score": 0,\n  "strengths": ["strength 1", "strength 2"],\n  "risks": ["risk 1", "risk 2"],\n  "missingKeywords": ["keyword 1", "keyword 2"],\n  "improvements": ["improvement 1", "improvement 2"]\n}`;
    },
    apply(json) { upsertAIInsight('atsreview', 'ATS Review', json); },
  },
  recruiterreview: {
    label: 'Recruiter Review',
    desc: 'มุมมอง recruiter — บอกว่าดูน่าเชื่อถือมั้ย, จุดไหนอ่อน, จุดไหนแข็ง, และควรแก้อะไรก่อน',
    buildPrompt() {
      return `You are a recruiter reviewing this resume for a first-pass screen.\n\nTask:\nAssess clarity, professionalism, credibility, relevance, and overall first impression.\n\nQuality rules:\n- Be direct and practical.\n- Identify anything that feels confusing, weak, generic, inflated, or underdeveloped.\n- Comment on whether the resume feels appropriately scoped for one page.\n\nResume context:\n${JSON.stringify(getResumeContext(), null, 2)}\n\nReturn ONLY valid JSON with this exact schema:\n{\n  "score": 0,\n  "strengths": ["strength 1", "strength 2"],\n  "concerns": ["concern 1", "concern 2"],\n  "topFixes": ["top fix 1", "top fix 2"],\n  "verdict": "short recruiter verdict"\n}`;
    },
    apply(json) { upsertAIInsight('recruiterreview', 'Recruiter Review', json); },
  },
  managerreview: {
    label: 'Hiring Manager',
    desc: 'มุมมอง hiring manager — บอกว่า bullet ไหนดูมีน้ำหนัก, ไหนดูผิวเผิน, และ technical gap ที่ควรเติม',
    buildPrompt() {
      return `You are a hiring manager reviewing this resume for technical relevance.\n\nTask:\nAssess whether the technical depth, tooling choices, and accomplishments look convincing for the target role.\n\nQuality rules:\n- Focus on technical substance, ownership, and scope.\n- Identify which bullets are strongest and which feel shallow.\n- Call out where the candidate should clarify architecture, implementation depth, scale, or outcomes.\n- Keep one-page constraints in mind.\n\nResume context:\n${JSON.stringify(getResumeContext(), null, 2)}\n\nReturn ONLY valid JSON with this exact schema:\n{\n  "score": 0,\n  "strongestSignals": ["signal 1", "signal 2"],\n  "weakestSignals": ["weakness 1", "weakness 2"],\n  "technicalGaps": ["gap 1", "gap 2"],\n  "recommendations": ["recommendation 1", "recommendation 2"]\n}`;
    },
    apply(json) { upsertAIInsight('managerreview', 'Hiring Manager Review', json); },
  },
  humanreview: {
    label: 'Human vs AI',
    desc: 'ตรวจว่า resume ส่วนไหนดูคนเขียนจริง ส่วนไหนดู AI เขียน — บอกจุดที่ภาษา generic เกินไป',
    buildPrompt() {
      return `You are a resume reviewer specializing in detecting AI-like writing.\n\nTask:\nReview this resume and identify which parts sound human-written and which parts sound AI-generated or generic.\n\nQuality rules:\n- Focus on wording, specificity, sentence rhythm, action verbs, repetition, and realism.\n- Call out generic phrasing, empty impact claims, and unnatural sentence patterns.\n- Recommend how to make it feel more human while staying concise enough for one page.\n\nResume context:\n${JSON.stringify(getResumeContext(), null, 2)}\n\nReturn ONLY valid JSON with this exact schema:\n{\n  "verdict": "human-like / mixed / AI-like",\n  "humanSignals": ["signal 1", "signal 2"],\n  "aiSignals": ["signal 1", "signal 2"],\n  "rewriteTargets": ["target 1", "target 2"],\n  "recommendations": ["recommendation 1", "recommendation 2"]\n}`;
    },
    apply(json) { upsertAIInsight('humanreview', 'Human vs AI Review', json); },
  },
  coverletter: {
    label: 'Cover Letter',
    desc: 'สร้าง cover letter 3 ย่อหน้าจาก resume — เก็บเป็น insight แยก ไม่ยัดลงหน้า resume',
    buildPrompt() {
      return `You are a senior cover letter writer.\n\nTask:\nWrite a concise, professional cover letter based on the resume below.\n\nQuality rules:\n- ${getAIWritingRules()}\n- Keep it under 250 words.\n- Write 3 paragraphs only.\n- Paragraph 1: role interest and concise introduction.\n- Paragraph 2: strongest relevant projects, technical strengths, and impact.\n- Paragraph 3: why the candidate is a strong fit and a professional closing.\n- Make it tailored to the target role if one exists.\n- Do not overpraise. Keep it credible and specific.\n- Use plain text only. Separate paragraphs with \\n\\n.\n\nResume context:\n${JSON.stringify(getResumeContext(), null, 2)}\n\nReturn ONLY valid JSON with this exact schema:\n{\n  "coverLetter": "paragraph 1\\n\\nparagraph 2\\n\\nparagraph 3"\n}`;
    },
    apply(json) { upsertAIInsight('coverletter', 'Cover Letter', json); },
  },
};

// ===== UI FUNCTIONS =====
export function openAIAnalyst(): void {
  document.getElementById('aiOverlay')?.classList.add('active');
  selectAITool('summary');
}

export function closeAIAnalyst(): void {
  document.getElementById('aiOverlay')?.classList.remove('active');
}

export function selectAITool(tool: string): void {
  currentAITool = tool;
  const def = AI_TOOLS[tool];
  document.querySelectorAll('.ai-tool-btn').forEach((b) =>
    b.classList.toggle('active', (b as HTMLElement).dataset.tool === tool)
  );
  const descEl = document.getElementById('aiToolDesc');
  if (descEl) descEl.innerHTML = `<strong>${esc(def.label)}</strong><br>${esc(def.desc)}`;
  const promptEl = document.getElementById('aiPromptOut') as HTMLTextAreaElement | null;
  if (promptEl) promptEl.value = def.buildPrompt();
  const resultEl = document.getElementById('aiResultIn') as HTMLTextAreaElement | null;
  if (resultEl) resultEl.value = '';
}

export function copyAIPrompt(): void {
  const box = document.getElementById('aiPromptOut') as HTMLTextAreaElement | null;
  if (!box) return;
  box.select();
  box.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(box.value).then(() => {
    const btn = (window.event as MouseEvent | undefined)?.target as HTMLButtonElement | null;
    if (btn) {
      const old = btn.textContent ?? '';
      btn.textContent = 'Copied!';
      setTimeout(() => (btn.textContent = old), 1500);
    }
  }).catch(() => {});
}

export function applyAIResult(): void {
  const raw = (document.getElementById('aiResultIn') as HTMLTextAreaElement | null)?.value.trim() ?? '';
  if (!raw) { alert('Paste JSON from AI first.'); return; }
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    const json = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    AI_TOOLS[currentAITool].apply(json);
    pushHistory();
    renderForm();
    renderPreview();
    updateScore();
    saveState();
    const resultEl = document.getElementById('aiResultIn') as HTMLTextAreaElement | null;
    if (resultEl) resultEl.value = '';
    alert('Applied to resume!');
  } catch (_) {
    alert('Invalid JSON. Make sure you paste the full JSON response from AI.');
  }
}
