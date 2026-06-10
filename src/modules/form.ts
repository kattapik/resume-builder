// ===== Form Rendering & Mutation =====

import { state, saveState, mergeSectionOrder, mergeSectionVisibility, isSectionVisible } from './state';
import { esc, autoExpandTextarea, autoExpandAllTextareas } from './utils';
import { renderPreview } from './preview';
import { pushHistory } from './history';
import { updateScore } from './score';
import { initSortable } from './dragdrop';

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

// ===== SCHEDULE DEFERRED SAVE =====
export function scheduleUpdate(): void {
  renderPreview();
  if (saveTimeout !== null) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    pushHistory();
    saveState();
    updateScore();
  }, 500);
}

// ===== TOP-LEVEL FORM INPUTS =====
export function onFormChange(): void {
  state.name = (document.getElementById('f-name') as HTMLTextAreaElement).value;
  state.contact = (document.getElementById('f-contact') as HTMLTextAreaElement).value;
  state.targetRole = (document.getElementById('f-target') as HTMLTextAreaElement).value;
  scheduleUpdate();
}

export function onSummaryChange(): void {
  state.summary = (document.getElementById('f-summary') as HTMLTextAreaElement).value;
  scheduleUpdate();
}

// ===== PHOTO =====
export function handlePhotoUpload(event: Event): void {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    state.photo = (e.target as FileReader).result as string;
    renderPreview();
    pushHistory();
    saveState();
  };
  reader.readAsDataURL(file);
}

// ===== SECTION VISIBILITY =====
export function toggleSectionVisibility(event: Event, section: string): void {
  event.stopPropagation();
  state.sectionVisibility[section] = !state.sectionVisibility[section];
  renderForm();
  renderPreview();
  pushHistory();
  saveState();
  updateScore();
}

export function syncSectionVisibilityButtons(): void {
  Object.entries(state.sectionVisibility).forEach(([section, visible]) => {
    const btn = document.getElementById('toggle-' + section) as HTMLButtonElement | null;
    if (!btn) return;
    btn.textContent = visible ? 'On' : 'Off';
    btn.classList.toggle('off', !visible);
  });
}

// ===== SECTION ORDER =====
export function applySectionOrder(): void {
  const panel = document.getElementById('formPanel');
  if (!panel) return;
  state.sectionOrder.forEach((section) => {
    const node = panel.querySelector<HTMLElement>(`.form-section[data-section="${section}"]`);
    if (node) panel.appendChild(node);
  });
}

// ===== RENDER ALL FORM SECTIONS =====
export function renderForm(): void {
  state.sectionOrder = mergeSectionOrder(state.sectionOrder);
  state.sectionVisibility = mergeSectionVisibility(state.sectionVisibility);

  (document.getElementById('f-name') as HTMLTextAreaElement).value = state.name;
  (document.getElementById('f-contact') as HTMLTextAreaElement).value = state.contact;
  (document.getElementById('f-target') as HTMLTextAreaElement).value = state.targetRole || '';
  (document.getElementById('f-summary') as HTMLTextAreaElement).value = state.summary || '';

  renderEduForm();
  renderExpForm();
  renderSkillForm();
  renderProjForm();
  renderLeadershipForm();
  renderCertificationForm();
  renderLanguageForm();
  syncSectionVisibilityButtons();
  applySectionOrder();
  autoExpandAllTextareas();
  // Re-init SortableJS after DOM re-render
  requestAnimationFrame(() => initSortable());
}

// ===== EDUCATION =====
export function renderEduForm(): void {
  const c = document.getElementById('eduEntries');
  if (!c) return;
  c.innerHTML = state.education
    .map(
      (e, i) => `
    <div class="entry-card" draggable="true" data-section="education" data-index="${i}"
      ondragstart="onDragStart(event)" ondragover="onDragOver(event)" ondrop="onDrop(event)" ondragend="onDragEnd(event)">
      <div class="entry-card-header">
        <span class="drag-handle">⠿</span>
        <span class="entry-card-title">${e.school || 'New Education'}</span>
        <div class="entry-card-actions">
          <button class="entry-card-btn" onclick="toggleEntryCard(this)">▼</button>
          <button class="entry-card-btn delete" onclick="removeEntry('education', ${i})">×</button>
        </div>
      </div>
      <div class="entry-card-body">
        <div class="form-group"><label class="form-label">School & Degree</label><textarea class="form-textarea" rows="1" oninput="updateEdu(${i},'school',this.value);autoExpandTextarea(this)" placeholder="University Name, B.S. in Computer Science">${esc(e.school)}</textarea></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">GPA</label><textarea class="form-textarea" rows="1" oninput="updateEdu(${i},'gpa',this.value);autoExpandTextarea(this)" placeholder="3.85 / 4.00">${esc(e.gpa)}</textarea></div>
          <div class="form-group"><label class="form-label">Start</label><textarea class="form-textarea" rows="1" oninput="updateEdu(${i},'start',this.value);autoExpandTextarea(this)" placeholder="Aug 2022">${esc(e.start)}</textarea></div>
          <div class="form-group"><label class="form-label">End</label><textarea class="form-textarea" rows="1" oninput="updateEdu(${i},'end',this.value);autoExpandTextarea(this)" placeholder="May 2026">${esc(e.end)}</textarea></div>
        </div>
        <div class="form-group"><label class="form-label">Coursework</label><textarea class="form-textarea" rows="1" oninput="updateEdu(${i},'coursework',this.value);autoExpandTextarea(this)" placeholder="Data Structures, Algorithms, ...">${esc(e.coursework)}</textarea></div>
        <div class="form-group"><label class="form-label">Activities</label><textarea class="form-textarea" rows="1" oninput="updateEdu(${i},'activities',this.value);autoExpandTextarea(this)" placeholder="Student Club, Hackathon, ...">${esc(e.activities)}</textarea></div>
      </div>
    </div>
  `
    )
    .join('');
}

// ===== SKILLS =====
export function renderSkillForm(): void {
  const c = document.getElementById('skillEntries');
  if (!c) return;
  c.innerHTML = state.skills
    .map(
      (s, i) => `
    <div class="entry-card" draggable="true" data-section="skills" data-index="${i}"
      ondragstart="onDragStart(event)" ondragover="onDragOver(event)" ondrop="onDrop(event)" ondragend="onDragEnd(event)">
      <div class="entry-card-header">
        <span class="drag-handle">⠿</span>
        <span class="entry-card-title">${s.category || 'New Category'}</span>
        <div class="entry-card-actions">
          <button class="entry-card-btn" onclick="toggleEntryCard(this)">▼</button>
          <button class="entry-card-btn delete" onclick="removeEntry('skills', ${i})">×</button>
        </div>
      </div>
      <div class="entry-card-body">
        <div class="form-group"><label class="form-label">Category</label><textarea class="form-textarea" rows="1" oninput="updateSkill(${i},'category',this.value);autoExpandTextarea(this)" placeholder="Programming Languages">${esc(s.category)}</textarea></div>
        <div class="form-group"><label class="form-label">Skills (comma separated)</label><textarea class="form-textarea" oninput="updateSkill(${i},'items',this.value);autoExpandTextarea(this)" placeholder="JavaScript, TypeScript, Python">${esc(s.items)}</textarea></div>
      </div>
    </div>
  `
    )
    .join('');
}

// ===== EXPERIENCE =====
export function renderExpForm(): void {
  const c = document.getElementById('expEntries');
  if (!c) return;
  c.innerHTML = state.experience
    .map(
      (e, i) => `
    <div class="entry-card" draggable="true" data-section="experience" data-index="${i}"
      ondragstart="onDragStart(event)" ondragover="onDragOver(event)" ondrop="onDrop(event)" ondragend="onDragEnd(event)">
      <div class="entry-card-header">
        <span class="drag-handle">⠿</span>
        <span class="entry-card-title">${e.role || e.company || 'New Experience'}</span>
        <div class="entry-card-actions">
          <button class="entry-card-btn" onclick="toggleEntryCard(this)">▼</button>
          <button class="entry-card-btn delete" onclick="removeEntry('experience', ${i})">×</button>
        </div>
      </div>
      <div class="entry-card-body">
        <div class="form-row">
          <div class="form-group"><label class="form-label">Role</label><textarea class="form-textarea" rows="1" oninput="updateExp(${i},'role',this.value);autoExpandTextarea(this)" placeholder="Software Engineer Intern">${esc(e.role)}</textarea></div>
          <div class="form-group"><label class="form-label">Company</label><textarea class="form-textarea" rows="1" oninput="updateExp(${i},'company',this.value);autoExpandTextarea(this)" placeholder="Company Name">${esc(e.company)}</textarea></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Location</label><textarea class="form-textarea" rows="1" oninput="updateExp(${i},'location',this.value);autoExpandTextarea(this)" placeholder="Bangkok, Thailand">${esc(e.location)}</textarea></div>
          <div class="form-group"><label class="form-label">Start</label><textarea class="form-textarea" rows="1" oninput="updateExp(${i},'start',this.value);autoExpandTextarea(this)" placeholder="Jun 2025">${esc(e.start)}</textarea></div>
          <div class="form-group"><label class="form-label">End</label><textarea class="form-textarea" rows="1" oninput="updateExp(${i},'end',this.value);autoExpandTextarea(this)" placeholder="Aug 2025">${esc(e.end)}</textarea></div>
        </div>
        <div class="form-group">
          <label class="form-label">Bullet Points (one per line)</label>
          <textarea class="form-textarea" rows="4" oninput="updateExpBullets(${i},this.value);autoExpandTextarea(this)" placeholder="Built internal dashboard&#10;Reduced manual reporting time by 60%">${esc((e.bullets || []).join('\n'))}</textarea>
        </div>
      </div>
    </div>
  `
    )
    .join('');
}

// ===== PROJECTS =====
export function renderProjForm(): void {
  const c = document.getElementById('projEntries');
  if (!c) return;
  c.innerHTML = state.projects
    .map(
      (p, i) => `
    <div class="entry-card" draggable="true" data-section="projects" data-index="${i}"
      ondragstart="onDragStart(event)" ondragover="onDragOver(event)" ondrop="onDrop(event)" ondragend="onDragEnd(event)">
      <div class="entry-card-header">
        <span class="drag-handle">⠿</span>
        <span class="entry-card-title">${p.role || p.name || 'New Project'}</span>
        <div class="entry-card-actions">
          <button class="entry-card-btn" onclick="toggleEntryCard(this)">▼</button>
          <button class="entry-card-btn delete" onclick="removeEntry('projects', ${i})">×</button>
        </div>
      </div>
      <div class="entry-card-body">
        <div class="form-row">
          <div class="form-group"><label class="form-label">Role</label><textarea class="form-textarea" rows="1" oninput="updateProj(${i},'role',this.value);autoExpandTextarea(this)" placeholder="Lead Developer">${esc(p.role)}</textarea></div>
          <div class="form-group"><label class="form-label">Project Name</label><textarea class="form-textarea" rows="1" oninput="updateProj(${i},'name',this.value);autoExpandTextarea(this)" placeholder="Project Name">${esc(p.name)}</textarea></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Tech Stack</label><textarea class="form-textarea" rows="1" oninput="updateProj(${i},'tech',this.value);autoExpandTextarea(this)" placeholder="React, Firebase">${esc(p.tech)}</textarea></div>
          <div class="form-group"><label class="form-label">Date</label><textarea class="form-textarea" rows="1" oninput="updateProj(${i},'date',this.value);autoExpandTextarea(this)" placeholder="Jan 2025">${esc(p.date)}</textarea></div>
        </div>
        <div class="form-group">
          <label class="form-label">Bullet Points (one per line)</label>
          <textarea class="form-textarea" rows="4" oninput="updateProjBullets(${i},this.value);autoExpandTextarea(this)" placeholder="Built full-stack app&#10;Designed auth flows&#10;Deployed with cloud backend">${esc((p.bullets || []).join('\n'))}</textarea>
        </div>
      </div>
    </div>
  `
    )
    .join('');
}

// ===== LEADERSHIP =====
export function renderLeadershipForm(): void {
  const c = document.getElementById('leadEntries');
  if (!c) return;
  c.innerHTML = state.leadership
    .map(
      (e, i) => `
    <div class="entry-card" draggable="true" data-section="leadership" data-index="${i}"
      ondragstart="onDragStart(event)" ondragover="onDragOver(event)" ondrop="onDrop(event)" ondragend="onDragEnd(event)">
      <div class="entry-card-header">
        <span class="drag-handle">⠿</span>
        <span class="entry-card-title">${e.role || e.organization || 'New Leadership'}</span>
        <div class="entry-card-actions">
          <button class="entry-card-btn" onclick="toggleEntryCard(this)">▼</button>
          <button class="entry-card-btn delete" onclick="removeEntry('leadership', ${i})">×</button>
        </div>
      </div>
      <div class="entry-card-body">
        <div class="form-row">
          <div class="form-group"><label class="form-label">Role</label><textarea class="form-textarea" rows="1" oninput="updateLeadership(${i},'role',this.value);autoExpandTextarea(this)" placeholder="President">${esc(e.role)}</textarea></div>
          <div class="form-group"><label class="form-label">Organization</label><textarea class="form-textarea" rows="1" oninput="updateLeadership(${i},'organization',this.value);autoExpandTextarea(this)" placeholder="Computer Science Club">${esc(e.organization)}</textarea></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Start</label><textarea class="form-textarea" rows="1" oninput="updateLeadership(${i},'start',this.value);autoExpandTextarea(this)" placeholder="2024">${esc(e.start)}</textarea></div>
          <div class="form-group"><label class="form-label">End</label><textarea class="form-textarea" rows="1" oninput="updateLeadership(${i},'end',this.value);autoExpandTextarea(this)" placeholder="Present">${esc(e.end)}</textarea></div>
        </div>
        <div class="form-group"><label class="form-label">Highlights (one per line)</label><textarea class="form-textarea" rows="4" oninput="updateLeadershipBullets(${i},this.value);autoExpandTextarea(this)" placeholder="Led a 20-member team&#10;Organized campus workshop for 150 attendees">${esc((e.bullets || []).join('\n'))}</textarea></div>
      </div>
    </div>
  `
    )
    .join('');
}

// ===== CERTIFICATIONS =====
export function renderCertificationForm(): void {
  const c = document.getElementById('certEntries');
  if (!c) return;
  c.innerHTML = state.certifications
    .map(
      (e, i) => `
    <div class="entry-card" draggable="true" data-section="certifications" data-index="${i}"
      ondragstart="onDragStart(event)" ondragover="onDragOver(event)" ondrop="onDrop(event)" ondragend="onDragEnd(event)">
      <div class="entry-card-header">
        <span class="drag-handle">⠿</span>
        <span class="entry-card-title">${e.name || 'New Certification'}</span>
        <div class="entry-card-actions">
          <button class="entry-card-btn" onclick="toggleEntryCard(this)">▼</button>
          <button class="entry-card-btn delete" onclick="removeEntry('certifications', ${i})">×</button>
        </div>
      </div>
      <div class="entry-card-body">
        <div class="form-group"><label class="form-label">Certification</label><textarea class="form-textarea" rows="1" oninput="updateCertification(${i},'name',this.value);autoExpandTextarea(this)" placeholder="AWS Certified Cloud Practitioner">${esc(e.name)}</textarea></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Issuer</label><textarea class="form-textarea" rows="1" oninput="updateCertification(${i},'issuer',this.value);autoExpandTextarea(this)" placeholder="Amazon Web Services">${esc(e.issuer)}</textarea></div>
          <div class="form-group"><label class="form-label">Date</label><textarea class="form-textarea" rows="1" oninput="updateCertification(${i},'date',this.value);autoExpandTextarea(this)" placeholder="2025">${esc(e.date)}</textarea></div>
        </div>
      </div>
    </div>
  `
    )
    .join('');
}

// ===== LANGUAGES =====
export function renderLanguageForm(): void {
  const c = document.getElementById('langEntries');
  if (!c) return;
  c.innerHTML = state.languages
    .map(
      (e, i) => `
    <div class="entry-card" draggable="true" data-section="languages" data-index="${i}"
      ondragstart="onDragStart(event)" ondragover="onDragOver(event)" ondrop="onDrop(event)" ondragend="onDragEnd(event)">
      <div class="entry-card-header">
        <span class="drag-handle">⠿</span>
        <span class="entry-card-title">${e.name || 'New Language'}</span>
        <div class="entry-card-actions">
          <button class="entry-card-btn" onclick="toggleEntryCard(this)">▼</button>
          <button class="entry-card-btn delete" onclick="removeEntry('languages', ${i})">×</button>
        </div>
      </div>
      <div class="entry-card-body">
        <div class="form-row">
          <div class="form-group"><label class="form-label">Language</label><textarea class="form-textarea" rows="1" oninput="updateLanguage(${i},'name',this.value);autoExpandTextarea(this)" placeholder="Thai">${esc(e.name)}</textarea></div>
          <div class="form-group"><label class="form-label">Level</label><textarea class="form-textarea" rows="1" oninput="updateLanguage(${i},'level',this.value);autoExpandTextarea(this)" placeholder="Native / Fluent / Intermediate">${esc(e.level)}</textarea></div>
        </div>
      </div>
    </div>
  `
    )
    .join('');
}

// ===== FIELD UPDATE FUNCTIONS =====
export function updateEdu(i: number, key: string, val: string): void {
  (state.education[i] as any)[key] = val;
  scheduleUpdate();
}
export function updateExp(i: number, key: string, val: string): void {
  (state.experience[i] as any)[key] = val;
  scheduleUpdate();
}
export function updateSkill(i: number, key: string, val: string): void {
  (state.skills[i] as any)[key] = val;
  scheduleUpdate();
}
export function updateProj(i: number, key: string, val: string): void {
  (state.projects[i] as any)[key] = val;
  scheduleUpdate();
}
export function updateLeadership(i: number, key: string, val: string): void {
  (state.leadership[i] as any)[key] = val;
  scheduleUpdate();
}
export function updateCertification(i: number, key: string, val: string): void {
  (state.certifications[i] as any)[key] = val;
  scheduleUpdate();
}
export function updateLanguage(i: number, key: string, val: string): void {
  (state.languages[i] as any)[key] = val;
  scheduleUpdate();
}
export function updateExpBullets(i: number, val: string): void {
  state.experience[i].bullets = val.split('\n').filter((l) => l.trim());
  scheduleUpdate();
}
export function updateProjBullets(i: number, val: string): void {
  state.projects[i].bullets = val.split('\n').filter((l) => l.trim());
  scheduleUpdate();
}
export function updateLeadershipBullets(i: number, val: string): void {
  state.leadership[i].bullets = val.split('\n').filter((l) => l.trim());
  scheduleUpdate();
}

// ===== ADD / REMOVE ENTRIES =====
export function addEduEntry(): void {
  state.education.push({ school: '', degree: '', gpa: '', start: '', end: '', coursework: '', activities: '' });
  renderForm();
  pushHistory();
  saveState();
  updateScore();
}
export function addExpEntry(): void {
  state.experience.push({ company: '', role: '', start: '', end: '', location: '', bullets: [''] });
  renderForm();
  pushHistory();
  saveState();
  updateScore();
}
export function addSkillEntry(): void {
  state.skills.push({ category: '', items: '' });
  renderForm();
  pushHistory();
  saveState();
  updateScore();
}
export function addProjEntry(): void {
  state.projects.push({ role: '', name: '', tech: '', date: '', bullets: [''] });
  renderForm();
  pushHistory();
  saveState();
  updateScore();
}
export function addLeadershipEntry(): void {
  state.leadership.push({ organization: '', role: '', start: '', end: '', bullets: [''] });
  renderForm();
  pushHistory();
  saveState();
  updateScore();
}
export function addCertificationEntry(): void {
  state.certifications.push({ name: '', issuer: '', date: '' });
  renderForm();
  pushHistory();
  saveState();
  updateScore();
}
export function addLanguageEntry(): void {
  state.languages.push({ name: '', level: '' });
  renderForm();
  pushHistory();
  saveState();
  updateScore();
}

export function removeEntry(section: string, index: number): void {
  (state[section as keyof typeof state] as unknown[]).splice(index, 1);
  renderForm();
  renderPreview();
  pushHistory();
  saveState();
  updateScore();
}
