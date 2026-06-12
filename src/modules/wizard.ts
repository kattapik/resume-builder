// ===== Quick Start Wizard =====

import { state, saveState, mergeSectionOrder, mergeSectionVisibility } from './state';
import { renderForm } from './form';
import { renderPreview } from './preview';
import { updateScore } from './score';
import { pushHistory } from './history';
import type { RoleTemplate } from './types';

// ===== ROLE TEMPLATES =====
export const ROLE_TEMPLATES: Record<string, RoleTemplate> = {
  frontend: {
    label: 'Frontend Developer',
    desc: 'Vue, Quasar, React, UI engineering',
    targetRole: 'Frontend Developer',
    skills: [
      { cat: 'Programming Languages', items: ['TypeScript', 'JavaScript', 'SQL', 'HTML', 'CSS'] },
      { cat: 'Frameworks & Libraries', items: ['Vue', 'Quasar', 'React', 'Next.js', 'Tailwind CSS'] },
      { cat: 'Tools & Platforms', items: ['Git', 'Figma', 'Vite', 'CI/CD', 'Chrome DevTools', 'Agile/Scrum'] },
    ],
    bullets: {
      experience: [
        'Built responsive user interfaces in Vue and Quasar that improved page load performance by 35% and reduced bounce rate.',
        'Developed reusable component library adopted by 3 teams, cutting frontend development time by 20%.',
        'Integrated REST APIs for user authentication, data fetching, and real-time notification workflows.',
        'Optimized critical rendering path, reducing First Contentful Paint from 2.8s to 1.4s on mobile devices.',
        'Collaborated with UX designers and backend engineers to ship 12 features in a 6-month sprint cycle.',
        'Set up CI/CD pipelines with GitHub Actions, reducing deployment time from 30 minutes to 5 minutes.',
      ],
      projects: [
        'Designed and built a full-stack task management app with Vue, Quasar, and PostgreSQL serving 200+ monthly active users.',
        'Developed a real-time chat application using WebSocket and Vue, supporting concurrent sessions and message persistence.',
        'Created a responsive portfolio site with Next.js and Tailwind CSS, achieving 95+ Lighthouse performance score.',
      ],
    },
  },
  backend: {
    label: 'Backend Developer',
    desc: 'Node, FastAPI, TypeORM, databases',
    targetRole: 'Backend Developer',
    skills: [
      { cat: 'Programming Languages', items: ['TypeScript', 'JavaScript', 'Python', 'Java', 'SQL'] },
      { cat: 'Frameworks & ORMs', items: ['Node.js', 'FastAPI', 'TypeORM', 'Express', 'NestJS'] },
      { cat: 'Databases', items: ['PostgreSQL', 'MySQL', 'SQLite', 'Redis'] },
      { cat: 'Infrastructure & Tools', items: ['Docker', 'Azure', 'CI/CD', 'Git', 'Linux', 'Agile/Scrum'] },
    ],
    bullets: {
      experience: [
        'Architected and deployed 15+ RESTful microservices handling 50K requests per minute with 99.9% uptime.',
        'Designed database schemas with TypeORM and wrote optimized queries, reducing average response time from 800ms to 120ms.',
        'Implemented authentication and authorization with JWT and OAuth 2.0, securing access for 10K+ users.',
        'Built automated data pipelines processing 2M+ records daily with error handling and retry logic.',
        'Deployed containerized services on Azure App Service, reducing deployment time from 2 hours to 15 minutes via CI/CD.',
        'Wrote comprehensive unit and integration tests achieving 92% code coverage across core services.',
      ],
      projects: [
        'Built a scalable inventory management API with Node.js, TypeORM, and PostgreSQL, supporting real-time stock tracking for 5 warehouse locations.',
        'Developed a data processing service with FastAPI and Python, handling 100K+ records per hour with sub-second latency.',
        'Created a CLI tool in Java for automating database migrations across PostgreSQL and MySQL, adopted by 4 engineering teams.',
      ],
    },
  },
  data: {
    label: 'Data Analyst',
    desc: 'Analytics, visualization, insights',
    targetRole: 'Data Analyst',
    skills: [
      { cat: 'Programming & Querying', items: ['Python', 'SQL', 'TypeScript', 'Java'] },
      { cat: 'Visualization & BI', items: ['Tableau', 'Power BI', 'Matplotlib', 'Seaborn'] },
      { cat: 'Analytics & Tools', items: ['Pandas', 'NumPy', 'Scikit-learn', 'Git', 'Jupyter', 'Figma', 'Agile/Scrum'] },
    ],
    bullets: {
      experience: [
        'Analyzed 500K+ customer records using SQL and Python, identifying 3 key churn drivers that reduced attrition by 12%.',
        'Built automated dashboards in Power BI tracking 20+ KPIs, saving 8 hours per week of manual reporting.',
        'Conducted A/B tests on landing page variants, resulting in a 22% increase in conversion rate.',
        'Created monthly executive reports with actionable insights, influencing $2M in budget allocation decisions.',
        'Cleaned and transformed raw data from 5 sources into a unified analytics pipeline with 99.5% data accuracy.',
        'Presented findings to stakeholders across 4 departments, driving adoption of data-informed decision-making processes.',
      ],
      projects: [
        'Analyzed 1M+ e-commerce transactions to build a customer segmentation model, identifying 4 high-value user groups.',
        'Built a predictive model for sales forecasting with 89% accuracy using time-series analysis and Python.',
        'Created an interactive dashboard tracking marketing campaign ROI across 6 channels, reducing ad spend waste by 18%.',
      ],
    },
  },
  fullstack: {
    label: 'Full-Stack Developer',
    desc: 'Vue, Quasar, FastAPI, Prisma, Azure',
    targetRole: 'Full-Stack Developer',
    skills: [
      { cat: 'Frontend', items: ['Vue', 'Quasar', 'TypeScript', 'JavaScript', 'HTML/CSS'] },
      { cat: 'Backend', items: ['Node.js', 'FastAPI', 'Python', 'TypeORM', 'PostgreSQL', 'MySQL'] },
      { cat: 'DevOps & Tools', items: ['Azure', 'Docker', 'Git', 'CI/CD', 'Figma', 'Bun', 'Agile/Scrum'] },
    ],
    bullets: {
      experience: [
        'Developed end-to-end features for a SaaS platform serving 5K+ users, from database design with TypeORM to Quasar UI components.',
        'Built and maintained 20+ REST API endpoints with input validation, error handling, and rate limiting using Node.js and FastAPI.',
        'Deployed full-stack applications on Azure App Service with CI/CD pipelines, achieving zero-downtime deployments.',
        'Reduced API response times by 60% through query optimization, caching strategies, and connection pooling.',
        'Led code reviews and mentored 2 junior developers, improving team velocity by 25% over 3 sprints.',
        'Implemented automated testing with Jest and Cypress, increasing code coverage from 45% to 92%.',
      ],
      projects: [
        'Built a full-stack project management tool with Vue, Quasar, TypeORM, and PostgreSQL, supporting team collaboration for 50+ users.',
        'Developed an e-commerce platform with Stripe integration, user authentication, and admin dashboard handling 1K+ products.',
        'Created a real-time analytics dashboard with Chart.js and FastAPI, visualizing 100K+ data points with sub-second load times.',
      ],
    },
  },
};

// ===== WIZARD STATE =====
let wizardRole: string | null = null;
let wizardSkills: string[] = [];

export function openWizard(): void {
  document.getElementById('wizardOverlay')?.classList.add('active');
  renderRoleGrid();
  wizardRole = null;
  wizardSkills = [];
  showWizardStep(1);
}

export function closeWizard(): void {
  document.getElementById('wizardOverlay')?.classList.remove('active');
}

function showWizardStep(n: number): void {
  document.querySelectorAll('.wizard-step').forEach((s) => s.classList.remove('active'));
  document.getElementById('wStep' + n)?.classList.add('active');
  for (let i = 1; i <= 3; i++) {
    document.getElementById('wp' + i)?.classList.toggle('active', i <= n);
  }
  if (n === 2) renderSkillPicker();
  if (n === 3) renderWizardPrompt();
}

export function wizardNext(n: number): void {
  if (n === 1 && wizardRole) showWizardStep(2);
  else if (n === 2 && wizardSkills.length > 0) showWizardStep(3);
}

export function wizardPrev(n: number): void {
  if (n === 2) showWizardStep(1);
  else if (n === 3) showWizardStep(2);
}

function renderRoleGrid(): void {
  const grid = document.getElementById('roleGrid');
  if (!grid) return;
  grid.innerHTML = Object.entries(ROLE_TEMPLATES)
    .map(
      ([key, t]) => `
    <div class="role-card" data-role="${key}" onclick="selectRole('${key}')">
      <div class="role-card-title">${t.label}</div>
      <div class="role-card-desc">${t.desc}</div>
    </div>
  `
    )
    .join('');
}

export function selectRole(key: string): void {
  wizardRole = key;
  document.querySelectorAll('.role-card').forEach((c) =>
    c.classList.toggle('selected', (c as HTMLElement).dataset.role === key)
  );
  const next1 = document.getElementById('wNext1') as HTMLButtonElement | null;
  if (next1) next1.disabled = false;
}

function renderSkillPicker(): void {
  const tpl = wizardRole ? ROLE_TEMPLATES[wizardRole] : null;
  if (!tpl) return;
  const picker = document.getElementById('skillPicker');
  if (!picker) return;
  picker.innerHTML = tpl.skills
    .map(
      (g) => `
    <div class="skill-group-title">${g.cat}</div>
    ${g.items
      .map(
        (s) => `
      <div class="skill-item ${wizardSkills.includes(s) ? 'selected' : ''}" data-skill="${s}" onclick="toggleSkill('${s}')">
        <div class="skill-check">${wizardSkills.includes(s) ? '✓' : ''}</div>
        <span>${s}</span>
      </div>
    `
      )
      .join('')}
  `
    )
    .join('');
  renderSelectedSkills();
}

export function toggleSkill(skill: string): void {
  const idx = wizardSkills.indexOf(skill);
  if (idx >= 0) wizardSkills.splice(idx, 1);
  else wizardSkills.push(skill);
  renderSkillPicker();
}

function renderSelectedSkills(): void {
  const el = document.getElementById('selectedSkills');
  if (el) {
    el.innerHTML = wizardSkills
      .map(
        (s) =>
          `<span class="selected-skill-tag">${s}<span class="remove" onclick="toggleSkill('${s}')">×</span></span>`
      )
      .join('');
  }
  const next2 = document.getElementById('wNext2') as HTMLButtonElement | null;
  if (next2) next2.disabled = wizardSkills.length === 0;
}

function renderWizardPrompt(): void {
  const tpl = wizardRole ? ROLE_TEMPLATES[wizardRole] : null;
  if (!tpl) return;
  const skills = tpl.skills
    .map((g) => ({
      category: g.cat,
      items: g.items.filter((s) => wizardSkills.includes(s)).join(', '),
    }))
    .filter((s) => s.items);
  const selectedSkills = skills.map((s) => s.items).join(', ');

  const prompt = `You are a senior resume writer conducting a structured interview to build a complete resume.

IMPORTANT — Follow this exact process:

STEP 1 — Interview the candidate.
Ask these questions ONE AT A TIME. Wait for each answer before asking the next question.
Do NOT ask all questions at once. Ask them sequentially.

Questions to ask in order:
1. What is your full name?
2. What is your contact info? (phone | email | LinkedIn | GitHub)
3. What role are you applying for?
4. Tell me about your education. Include: university, degree, GPA, dates, relevant coursework, activities.
5. Tell me about your work experience. For each: role, company, location, dates, and 2-3 impact-focused bullets.
6. What are your technical skills? (languages, frameworks, tools, databases)
7. Tell me about your projects. For each: project role, name, tech stack, dates, and what you built.
8. Tell me about your leadership or extracurricular experience. For each: role, organization, dates, and 1-3 highlights.
9. List any certifications. Include: name, issuer, date. If none, say none.
10. List any languages you speak and your proficiency. If none, say none.
11. Write a personal statement about yourself. Keep it 3-4 sentences, formal, human-like, and aligned to the target role.

STEP 2 — After receiving all answers, output the resume as JSON.
At the very end of the conversation, output ONLY valid JSON — no extra text before or after.

Quality rules for the resume:
- Write in a professional, formal, human-sounding tone.
- Do not sound robotic, vague, inflated, or obviously AI-generated.
- Avoid weak verbs: supported, helped, responsible for, involved in, worked on.
- Prefer strong verbs: built, developed, designed, implemented, optimized, delivered, reduced, improved, automated, led.
- Keep the resume optimized for 1 page max.
- Prefer 2 project entries max.
- Prefer 3 bullets per project max, under 24 words each.
- Separate skills into proper categories.
- Use specific metrics and outcomes when supported by the candidate's answers.
- If the candidate's answers are incomplete, use reasonable placeholders they can edit later.

Context for this candidate:
- Target role: ${tpl.targetRole}
- Selected skills: ${selectedSkills || 'Use the template defaults for this role'}

JSON output schema (output this ONLY at the end, after all interview questions are answered):
{
  "name": "string",
  "contact": "string",
  "targetRole": "string",
  "personalStatement": "string",
  "education": [{"school": "string", "degree": "string", "gpa": "string", "start": "string", "end": "string", "coursework": "string", "activities": "string"}],
  "experience": [{"company": "string", "role": "string", "project": "string", "start": "string", "end": "string", "location": "string", "bullets": ["string"]}],
  "skills": [{"category": "string", "items": "string"}],
  "projects": [{"role": "string", "name": "string", "tech": "string", "date": "string", "bullets": ["string"]}],
  "leadership": [{"organization": "string", "role": "string", "start": "string", "end": "string", "bullets": ["string"]}],
  "certifications": [{"name": "string", "issuer": "string", "date": "string"}],
  "languages": [{"name": "string", "level": "string"}]
}`;

  const promptOut = document.getElementById('wizardPromptOut') as HTMLTextAreaElement | null;
  if (promptOut) promptOut.value = prompt;
  const resultIn = document.getElementById('wizardResultIn') as HTMLTextAreaElement | null;
  if (resultIn) resultIn.value = '';
}

export function copyWizardPrompt(): void {
  const box = document.getElementById('wizardPromptOut') as HTMLTextAreaElement | null;
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

export function wizardApplyAI(): void {
  const raw = (document.getElementById('wizardResultIn') as HTMLTextAreaElement | null)?.value.trim() ?? '';
  if (!raw) { alert('Paste JSON from AI first.'); return; }
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    const json = JSON.parse(jsonMatch[0]);
    Object.assign(state, {
      name: json.name ?? state.name,
      contact: json.contact ?? state.contact,
      targetRole: json.targetRole ?? state.targetRole,
      summary: json.personalStatement ?? json.summary ?? state.summary,
      sectionOrder: mergeSectionOrder(json.sectionOrder ?? state.sectionOrder),
      education: json.education ?? state.education,
      experience: json.experience ?? state.experience,
      skills: json.skills ?? state.skills,
      projects: json.projects ?? state.projects,
      leadership: json.leadership ?? state.leadership,
      certifications: json.certifications ?? state.certifications,
      languages: json.languages ?? state.languages,
      sectionVisibility: mergeSectionVisibility(json.sectionVisibility ?? state.sectionVisibility),
    });
    closeWizard();
    pushHistory();
    renderForm();
    renderPreview();
    updateScore();
    saveState();
    alert('Resume created!');
  } catch (_) {
    alert('Invalid JSON. Make sure you paste the full JSON response from AI.');
  }
}
