// ===== Drag & Drop — Entry Cards & Section Reordering =====

import { state, saveState } from './state';
import { renderForm } from './form';
import { renderPreview } from './preview';
import { pushHistory } from './history';
import { updateScore } from './score';

// ===== ENTRY-LEVEL DRAG (within a section) =====
let dragSection: string | null = null;
let dragIndex: number | null = null;

export function onDragStart(e: DragEvent): void {
  e.stopPropagation();
  const target = e.currentTarget as HTMLElement;
  dragSection = target.dataset.section ?? null;
  dragIndex = parseInt(target.dataset.index ?? '-1');
  target.classList.add('dragging');
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `${dragSection}:${dragIndex}`);
  }
}

export function onDragOver(e: DragEvent): void {
  e.stopPropagation();
  e.preventDefault();
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
  const card = (e.currentTarget as HTMLElement).closest('.entry-card') as HTMLElement | null;
  if (card) card.classList.add('drag-over');
}

export function onDrop(e: DragEvent): void {
  e.stopPropagation();
  e.preventDefault();
  const target = (e.currentTarget as HTMLElement).closest('.entry-card') as HTMLElement | null;
  if (!target) return;
  target.classList.remove('drag-over');
  const targetSection = target.dataset.section;
  const targetIndex = parseInt(target.dataset.index ?? '-1');
  if (dragSection === targetSection && dragIndex !== null && dragIndex !== targetIndex) {
    const arr = state[dragSection as keyof typeof state] as unknown[];
    const [item] = arr.splice(dragIndex, 1);
    arr.splice(targetIndex, 0, item);
    renderForm();
    renderPreview();
    pushHistory();
    saveState();
  }
}

export function onDragEnd(e: DragEvent): void {
  e.stopPropagation();
  document.querySelectorAll('.dragging, .drag-over').forEach((el) => {
    el.classList.remove('dragging', 'drag-over');
  });
  dragSection = null;
  dragIndex = null;
}

// ===== SECTION-LEVEL DRAG (reorder top-level sections) =====
let draggedTopLevelSection: string | null = null;

export function onSectionDragStart(e: DragEvent): void {
  if ((e.target as HTMLElement).closest('.entry-card')) return;
  const target = e.currentTarget as HTMLElement;
  draggedTopLevelSection = target.dataset.section ?? null;
  target.classList.add('dragging');
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', draggedTopLevelSection ?? '');
  }
}

export function onSectionDragOver(e: DragEvent): void {
  if (!draggedTopLevelSection) return;
  e.preventDefault();
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
  (e.currentTarget as HTMLElement).classList.add('drag-over');
}

export function onSectionDrop(e: DragEvent): void {
  if (!draggedTopLevelSection) return;
  e.preventDefault();
  const target = e.currentTarget as HTMLElement;
  target.classList.remove('drag-over');
  const targetSection = target.dataset.section;
  if (!targetSection || targetSection === draggedTopLevelSection) return;
  const nextOrder = state.sectionOrder.slice();
  const from = nextOrder.indexOf(draggedTopLevelSection);
  const to = nextOrder.indexOf(targetSection);
  if (from < 0 || to < 0) return;
  const [moved] = nextOrder.splice(from, 1);
  nextOrder.splice(to, 0, moved);
  state.sectionOrder = nextOrder;
  renderForm();
  renderPreview();
  pushHistory();
  saveState();
  updateScore();
}

export function onSectionDragEnd(): void {
  draggedTopLevelSection = null;
  document.querySelectorAll('.form-section.dragging, .form-section.drag-over').forEach((el) => {
    el.classList.remove('dragging', 'drag-over');
  });
}
