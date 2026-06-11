// ===== Drag & Drop — SortableJS (replaces HTML5 DnD API) =====
// HTML5 DnD export stubs kept for backward compat (onclick attributes in form.ts templates)

import Sortable from 'sortablejs';
import { state, saveState } from './state';
import { renderPreview } from './preview';
import { pushHistory } from './history';
import { updateScore } from './score';

// Active SortableJS instances — destroyed and re-created on each renderForm()
const _instances: Sortable[] = [];

/** Called at the end of renderForm() to wire SortableJS on all entry containers + sections */
export function initSortable(): void {
  // Destroy stale instances before re-init
  while (_instances.length) _instances.pop()!.destroy();

  // ===== ENTRY-LEVEL SORTABLE (reorder items within a section) =====
  const ENTRY_MAP: Record<string, keyof typeof state> = {
    eduEntries: 'education',
    expEntries: 'experience',
    skillEntries: 'skills',
    projEntries: 'projects',
    leadEntries: 'leadership',
    certEntries: 'certifications',
    langEntries: 'languages',
  };

  Object.entries(ENTRY_MAP).forEach(([elId, stateKey]) => {
    const el = document.getElementById(elId);
    if (!el) return;

    _instances.push(
      Sortable.create(el, {
        animation: 150,
        handle: '.drag-handle',   // drag starts ONLY from ⠿ handle
        draggable: '.entry-card',
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        onEnd({ oldIndex, newIndex }) {
          if (oldIndex == null || newIndex == null || oldIndex === newIndex) return;
          const arr = state[stateKey] as unknown[];
          const [item] = arr.splice(oldIndex, 1);
          arr.splice(newIndex, 0, item);
          renderPreview();
          pushHistory();
          saveState();
        },
      })
    );
  });

  // ===== SECTION-LEVEL SORTABLE (reorder top-level sections) =====
  const formPanel = document.getElementById('formPanel');
  if (formPanel) {
    _instances.push(
      Sortable.create(formPanel, {
        animation: 150,
        handle: '.section-drag-handle',  // drag starts ONLY from ⠿ handle — no filter needed
        draggable: '.form-section',
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        onEnd() {
          // Read new order from DOM after SortableJS reordered nodes
          const sections = Array.from(
            formPanel.querySelectorAll<HTMLElement>('.form-section[data-section]')
          );
          state.sectionOrder = sections.map((el) => el.dataset.section!).filter(Boolean);
          renderPreview();
          pushHistory();
          saveState();
          updateScore();
        },
      })
    );
  }
}

// ===== NO-OP STUBS for HTML5 DnD (form.ts templates still have ondragstart etc.) =====
// SortableJS handles actual drag; these prevent state corruption from stale HTML attrs
export function onDragStart(e: DragEvent): void { e.stopPropagation(); }
export function onDragOver(e: DragEvent): void { e.stopPropagation(); e.preventDefault(); }
export function onDrop(e: DragEvent): void { e.stopPropagation(); e.preventDefault(); }
export function onDragEnd(e: DragEvent): void { e.stopPropagation(); }
export function onSectionDragStart(e: DragEvent): void { e.stopPropagation(); }
export function onSectionDragOver(e: DragEvent): void { e.stopPropagation(); e.preventDefault(); }
export function onSectionDrop(e: DragEvent): void { e.stopPropagation(); e.preventDefault(); }
export function onSectionDragEnd(): void { /* no-op */ }
