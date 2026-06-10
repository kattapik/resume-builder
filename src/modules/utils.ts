// ===== Utility Functions =====

/** Escape HTML special characters to prevent XSS */
export function esc(str: string | undefined | null): string {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/** Auto-expand textarea height to fit its content */
export function autoExpandTextarea(el: HTMLTextAreaElement | null): void {
  if (!el) return;
  if (el.offsetParent === null) {
    el.style.height = '';
    return;
  }
  el.style.height = '0px';
  el.style.height = el.scrollHeight + 'px';
  requestAnimationFrame(() => {
    if (!document.body.contains(el)) return;
    if (el.offsetParent === null) return;
    el.style.height = '0px';
    el.style.height = el.scrollHeight + 'px';
  });
}

/** Auto-expand all textareas within a root element */
export function autoExpandTextareasIn(root: Element | Document): void {
  if (!root) return;
  root.querySelectorAll<HTMLTextAreaElement>('.form-textarea').forEach((el) => {
    autoExpandTextarea(el);
  });
}

/** Auto-expand all textareas on the page */
export function autoExpandAllTextareas(): void {
  autoExpandTextareasIn(document);
}

/** Toggle a collapsible form section open/closed */
export function toggleSection(header: HTMLElement): void {
  const section = header.parentElement;
  if (!section) return;
  section.classList.toggle('open');
  if (section.classList.contains('open')) {
    requestAnimationFrame(() => {
      autoExpandTextareasIn(section);
    });
  }
}

/** Toggle an entry card open/closed */
export function toggleEntryCard(btn: HTMLButtonElement): void {
  const card = btn.closest('.entry-card') as HTMLElement | null;
  if (!card) return;
  card.classList.toggle('open');
  if (card.classList.contains('open')) {
    requestAnimationFrame(() => {
      autoExpandTextareasIn(card);
    });
  }
}

/** Strip id attributes from a cloned node and all its descendants */
export function stripIds(node: Element): Element {
  if (node.id) node.removeAttribute('id');
  node.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
  return node;
}
