// ===== Preview Rendering & Pagination =====

import { state, mergeSectionOrder, isSectionVisible } from './state';
import { esc, stripIds } from './utils';
import { initPreviewSortable } from './dragdrop';

// ===== HELPERS =====
function createResumePage(): HTMLDivElement {
  const page = document.createElement('div');
  page.className = 'resume-page';
  page.style.setProperty('--resume-font-step', state.fontSizeStep + 'px');
  page.style.setProperty('--resume-line-height-step', state.lineHeightStep + '');
  page.style.setProperty('--resume-font-family', state.fontFamily);
  return page;
}

// ===== MAIN PREVIEW RENDER =====
export function renderPreview(): void {
  const page = document.getElementById('tempRender');
  if (!page) return;

  state.sectionOrder = mergeSectionOrder(state.sectionOrder);
  page.style.setProperty('--resume-font-step', state.fontSizeStep + 'px');
  page.style.setProperty('--resume-line-height-step', state.lineHeightStep + '');
  page.style.setProperty('--resume-font-family', state.fontFamily);

  const fontSelect = document.getElementById('fontFamilySelect') as HTMLSelectElement | null;
  const pageModeSelect = document.getElementById('pageModeSelect') as HTMLSelectElement | null;
  if (fontSelect) fontSelect.value = state.fontFamily;
  if (pageModeSelect) pageModeSelect.value = state.pageMode || 'single';

  const fontSizeDisplay = document.getElementById('fontSizeDisplay');
  if (fontSizeDisplay) {
    fontSizeDisplay.textContent = (12 + (state.fontSizeStep || 0)).toString();
  }

  const rHeader = document.querySelector('.r-header') as HTMLElement | null;
  if (rHeader) rHeader.style.display = isSectionVisible('personal') ? 'grid' : 'none';

  const rName = document.getElementById('rName');
  const rTarget = document.getElementById('rTarget');
  const rContact = document.getElementById('rContact');
  const rPhoto = document.getElementById('rPhoto');
  if (rName) rName.textContent = state.name || 'YOUR NAME';
  if (rTarget) {
    rTarget.textContent = state.targetRole || '';
    rTarget.style.display = state.targetRole ? 'block' : 'none';
  }
  
  const contactParts: string[] = [];
  if (state.contact) contactParts.push(state.contact);
  if (state.address) contactParts.push(state.address);
  if (rContact) {
    rContact.textContent = contactParts.join(' | ') || '+66 x-xxx-xxxx | email@example.com';
  }
  if (rPhoto) {
    rPhoto.innerHTML = state.photo
      ? `<img src="${state.photo}" alt="Photo" />`
      : '<span>Photo</span>';
  }

  const rSummary = document.getElementById('rSummary');
  if (rSummary) {
    rSummary.innerHTML =
      isSectionVisible('summary') && state.summary
        ? `<div class="r-section"><div class="r-section-title">Personal Statement</div><div class="r-summary">${esc(state.summary)}</div></div>`
        : '';
  }

  renderEduPreview();
  renderExpPreview();
  renderProjPreview();
  renderSkillsPreview();
  renderLeadershipPreview();
  renderCertificationPreview();
  renderLanguagePreview();
  applyPreviewSectionOrder();
  paginate();
}

export function setPageMode(value: string): void {
  state.pageMode = value as 'single' | 'multi';
  renderPreview();
  import('./state').then(({ saveState }) => saveState());
}

export function increaseResumeFont(): void {
  state.fontSizeStep = Math.min(4, (state.fontSizeStep || 0) + 1);
  renderPreview();
  import('./state').then(({ saveState }) => saveState());
}

export function decreaseResumeFont(): void {
  state.fontSizeStep = Math.max(-4, (state.fontSizeStep || 0) - 1);
  renderPreview();
  import('./state').then(({ saveState }) => saveState());
}

export function increaseLineHeight(): void {
  state.lineHeightStep = Math.min(4, (state.lineHeightStep || 0) + 1);
  renderPreview();
  import('./state').then(({ saveState }) => saveState());
}

export function decreaseLineHeight(): void {
  state.lineHeightStep = Math.max(-4, (state.lineHeightStep || 0) - 1);
  renderPreview();
  import('./state').then(({ saveState }) => saveState());
}

export function setResumeFontFamily(value: string): void {
  state.fontFamily = value;
  renderPreview();
  import('./state').then(({ saveState }) => saveState());
}

// ===== SECTION-SPECIFIC PREVIEW RENDERERS =====
export function renderEduPreview(): void {
  const el = document.getElementById('rEducation');
  if (!el) return;
  const entries = state.education.filter((e) => e.school);
  if (!isSectionVisible('education') || !entries.length) { el.innerHTML = ''; return; }
  el.innerHTML = '<div class="r-section"><div class="r-section-title">Education</div>' +
    entries.map((e) => `
      <div class="r-entry r-compact">
        <div class="r-topline"><div class="r-left">${esc(e.school)}${e.gpa ? ', GPA: ' + esc(e.gpa) : ''}</div><div class="r-right">${esc(e.start)}${e.end ? ' - ' + esc(e.end) : ''}</div></div>
        ${e.coursework ? `<div class="r-meta"><strong>Relevant Coursework:</strong> ${esc(e.coursework)}</div>` : ''}
        ${e.activities ? `<div class="r-meta"><strong>Activities:</strong> ${esc(e.activities)}</div>` : ''}
      </div>
    `).join('') + '</div>';
}

export function renderSkillsPreview(): void {
  const el = document.getElementById('rSkills');
  if (!el) return;
  const entries = state.skills.filter((s) => s.category && s.items);
  if (!isSectionVisible('skills') || !entries.length) { el.innerHTML = ''; return; }
  el.innerHTML = '<div class="r-section"><div class="r-section-title">Technical Skills</div><div class="r-skills">' +
    entries.map((s) => `<div><strong>${esc(s.category)}:</strong> ${esc(s.items)}</div>`).join('') +
    '</div></div>';
}

export function renderExpPreview(): void {
  const el = document.getElementById('rExperience');
  if (!el) return;
  const entries = state.experience.filter((e) => e.role || e.company);
  if (!isSectionVisible('experience') || !entries.length) { el.innerHTML = ''; return; }
  el.innerHTML = '<div class="r-section"><div class="r-section-title">Experience</div>' +
    entries.map((e) => `
      <div class="r-entry">
        <div class="r-topline"><div class="r-left">${esc(e.role)}${e.company ? ' | ' + esc(e.company) : ''}</div><div class="r-right">${esc(e.start)}${e.end ? ' - ' + esc(e.end) : ''}</div></div>
        ${e.project || e.location ? `<div class="r-tech-stack">${e.project ? `<strong>Project:</strong> ${esc(e.project)}` : ''}${e.project && e.location ? ' | ' : ''}${e.location ? esc(e.location) : ''}</div>` : ''}
        ${(e.bullets || []).filter((b) => b.trim()).length ? '<ul class="r-ul">' + (e.bullets || []).filter((b) => b.trim()).map((b) => `<li class="r-li">${esc(b)}</li>`).join('') + '</ul>' : ''}
      </div>
    `).join('') + '</div>';
}

export function renderProjPreview(): void {
  const el = document.getElementById('rProjects');
  if (!el) return;
  const entries = state.projects.filter((p) => p.role || p.name);
  if (!isSectionVisible('projects') || !entries.length) { el.innerHTML = ''; return; }
  el.innerHTML = '<div class="r-section"><div class="r-section-title">Projects</div>' +
    entries.map((p) => `
      <div class="r-entry">
        <div class="r-topline"><div class="r-left">${esc(p.role)}${p.name ? (p.role ? ' | ' : '') + esc(p.name) : ''}</div><div class="r-right">${esc(p.date)}</div></div>
        ${p.tech ? `<div class="r-tech-stack">${esc(p.tech)}</div>` : ''}
        ${(p.bullets || []).filter((b) => b.trim()).length ? '<ul class="r-ul">' + (p.bullets || []).filter((b) => b.trim()).map((b) => `<li class="r-li">${esc(b)}</li>`).join('') + '</ul>' : ''}
      </div>
    `).join('') + '</div>';
}

export function renderLeadershipPreview(): void {
  const el = document.getElementById('rLeadership');
  if (!el) return;
  const entries = state.leadership.filter((e) => e.role || e.organization);
  if (!isSectionVisible('leadership') || !entries.length) { el.innerHTML = ''; return; }
  el.innerHTML = '<div class="r-section"><div class="r-section-title">Leadership</div>' +
    entries.map((e) => `
      <div class="r-entry">
        <div class="r-topline"><div class="r-left">${esc(e.role)}${e.organization ? ' | ' + esc(e.organization) : ''}</div><div class="r-right">${esc(e.start)}${e.end ? ' - ' + esc(e.end) : ''}</div></div>
        ${(e.bullets || []).filter((b) => b.trim()).length ? '<ul class="r-ul">' + (e.bullets || []).filter((b) => b.trim()).map((b) => `<li class="r-li">${esc(b)}</li>`).join('') + '</ul>' : ''}
      </div>
    `).join('') + '</div>';
}

export function renderCertificationPreview(): void {
  const el = document.getElementById('rCertifications');
  if (!el) return;
  const entries = state.certifications.filter((e) => e.name);
  if (!isSectionVisible('certifications') || !entries.length) { el.innerHTML = ''; return; }
  el.innerHTML = '<div class="r-section"><div class="r-section-title">Certifications</div><div class="r-skills">' +
    entries.map((e) => `<div><strong>${esc(e.name)}</strong>${e.issuer ? ' - ' + esc(e.issuer) : ''}${e.date ? ' (' + esc(e.date) + ')' : ''}</div>`).join('') +
    '</div></div>';
}

export function renderLanguagePreview(): void {
  const el = document.getElementById('rLanguages');
  if (!el) return;
  const entries = state.languages.filter((e) => e.name);
  if (!isSectionVisible('languages') || !entries.length) { el.innerHTML = ''; return; }
  el.innerHTML = '<div class="r-section"><div class="r-section-title">Languages</div><div class="r-skills">' +
    entries.map((e) => `<div><strong>${esc(e.name)}</strong>${e.level ? ': ' + esc(e.level) : ''}</div>`).join('') +
    '</div></div>';
}

// ===== SECTION ORDER IN PREVIEW =====
export function applyPreviewSectionOrder(): void {
  const page = document.getElementById('tempRender');
  if (!page) return;
  state.sectionOrder.forEach((section) => {
    const key = 'r' + section.charAt(0).toUpperCase() + section.slice(1);
    const node = document.getElementById(key);
    if (node) page.appendChild(node);
  });
}

// ===== PAGE FIT STATUS =====
export function getAllResumeBullets(): string[] {
  return [...state.experience, ...state.projects, ...state.leadership]
    .flatMap((x) => (x.bullets || []).filter((b) => b.trim()));
}

export function renderPageFit(): void {
  const pages = document.querySelectorAll('#resumePagesContainer .resume-page');
  if (pages.length === 0) return;
  const pageMode = state.pageMode || 'single';
  const container = document.getElementById('pageFitStatus');
  if (!container) return;

  if (pageMode === 'single') {
    const page = pages[0] as HTMLElement;
    const pageHeightLimit = 1056;
    const actualHeight = page.scrollHeight;
    const overflowPx = Math.max(0, Math.round(actualHeight - pageHeightLimit));
    const summarySentences = (state.summary || '').split(/[.!?]+/).filter((x) => x.trim()).length;
    const overLimit = overflowPx > 8;
    const hints: string[] = [];
    if (summarySentences > 4) hints.push('Shorten summary to 3-4 sentences.');
    if (state.projects.filter((p) => p.role || p.name).length > 2) hints.push('Keep projects to 2 entries max.');
    if (getAllResumeBullets().some((b) => b.split(/\s+/).filter(Boolean).length > 24)) hints.push('Trim long bullets to under 24 words.');
    container.innerHTML = `
      <div class="feedback-item ${overLimit ? 'error' : 'good'}">
        <div class="feedback-title">${overLimit ? 'Over 1 Page' : 'Fits 1 Page'}</div>
        <div class="feedback-desc">${overLimit ? `Estimated overflow: about ${overflowPx}px.` : 'Current content is within a 1-page layout.'}</div>
      </div>
      ${hints.length ? hints.map((h) => `<div class="feedback-item warn"><div class="feedback-desc">${esc(h)}</div></div>`).join('') : ''}
    `;
  } else {
    container.innerHTML = `
      <div class="feedback-item good">
        <div class="feedback-title">Multi-Page Mode</div>
        <div class="feedback-desc">Content distributed across ${pages.length} page(s).</div>
      </div>
    `;
  }
}

// ===== PAGINATION =====
export function paginate(): void {
  const container = document.getElementById('resumePagesContainer');
  if (!container) return;
  container.innerHTML = '';

  const pageLimit = 1056;
  const paddingY = 67.2;
  const maxContentHeight = pageLimit - paddingY;
  const temp = document.getElementById('tempRender');
  if (!temp) return;
  const pageMode = state.pageMode || 'single';

  if (pageMode === 'single') {
    const pageDiv = createResumePage();
    Array.from(temp.children).forEach((child) => {
      if ((child as HTMLElement).id) {
        const clone = child.cloneNode(true) as Element;
        stripIds(clone);
        pageDiv.appendChild(clone);
      }
    });
    container.appendChild(pageDiv);
    setTimeout(() => {
      const scrollH = pageDiv.scrollHeight;
      if (scrollH > pageLimit + 5) {
        pageDiv.classList.add('overflow');
      } else {
        pageDiv.classList.remove('overflow');
      }
      renderPageFit();
    }, 50);
    return;
  }

  // ===== MULTI-PAGE =====
  let currentPage = createResumePage();
  container.appendChild(currentPage);
  let currentPageHeight = 0;

  const sections = Array.from(temp.children) as HTMLElement[];

  sections.forEach((section) => {
    if (!section.innerHTML.trim() || section.style.display === 'none') return;

    if (section.id === 'rPersonal' || section.id === 'rSummary') {
      const rect = section.getBoundingClientRect();
      const height = rect.height;
      if (currentPageHeight + height > maxContentHeight && currentPageHeight > 0) {
        currentPage = createResumePage();
        container.appendChild(currentPage);
        currentPageHeight = 0;
      }
      const clone = section.cloneNode(true) as Element;
      stripIds(clone);
      currentPage.appendChild(clone);
      currentPageHeight += height;
      return;
    }

    const rSection = section.querySelector('.r-section') as HTMLElement | null;
    if (!rSection) return;

    const titleEl = rSection.querySelector('.r-section-title') as HTMLElement | null;
    const titleHeight = titleEl ? titleEl.getBoundingClientRect().height : 0;

    let entries = Array.from(rSection.querySelectorAll('.r-entry')) as HTMLElement[];
    if (entries.length === 0) {
      const skillsContainer = rSection.querySelector('.r-skills') as HTMLElement | null;
      if (skillsContainer) {
        entries = Array.from(skillsContainer.children) as HTMLElement[];
      }
    }

    if (entries.length === 0) {
      const rect = section.getBoundingClientRect();
      const height = rect.height;
      if (currentPageHeight + height > maxContentHeight && currentPageHeight > 0) {
        currentPage = createResumePage();
        container.appendChild(currentPage);
        currentPageHeight = 0;
      }
      const clone = section.cloneNode(true) as Element;
      stripIds(clone);
      currentPage.appendChild(clone);
      currentPageHeight += height;
      return;
    }

    let pageSectionContainer: HTMLElement | null = null;
    let pageSectionContentWrapper: HTMLElement | null = null;

    function initSectionOnCurrentPage(): void {
      const sectionClone = section.cloneNode(false) as HTMLElement;
      stripIds(sectionClone);
      const rSectionClone = rSection!.cloneNode(false) as HTMLElement;
      stripIds(rSectionClone);
      sectionClone.appendChild(rSectionClone);

      if (titleEl) {
        const titleClone = titleEl.cloneNode(true) as Element;
        stripIds(titleClone);
        rSectionClone.appendChild(titleClone);
      }

      const originalSkills = rSection!.querySelector('.r-skills') as HTMLElement | null;
      if (originalSkills) {
        const skillsClone = originalSkills.cloneNode(false) as HTMLElement;
        stripIds(skillsClone);
        rSectionClone.appendChild(skillsClone);
        pageSectionContentWrapper = skillsClone;
      } else {
        pageSectionContentWrapper = rSectionClone;
      }

      currentPage.appendChild(sectionClone);
      pageSectionContainer = sectionClone;
    }

    entries.forEach((entry, idx) => {
      const entryHeight = entry.getBoundingClientRect().height;
      const requiredHeight = pageSectionContainer === null ? titleHeight + entryHeight + 15 : entryHeight;

      if (currentPageHeight + requiredHeight > maxContentHeight && currentPageHeight > 0) {
        currentPage = createResumePage();
        container.appendChild(currentPage);
        currentPageHeight = 0;
        pageSectionContainer = null;
        pageSectionContentWrapper = null;
      }

      if (!pageSectionContainer) {
        initSectionOnCurrentPage();
        currentPageHeight += titleHeight;
      }

      const entryClone = entry.cloneNode(true) as Element;
      stripIds(entryClone);
      pageSectionContentWrapper!.appendChild(entryClone);
      currentPageHeight += entryHeight;
    });
  });

  setTimeout(() => {
    renderPageFit();
    initPreviewSortable();
  }, 50);
}
