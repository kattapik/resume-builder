import { PDFDocument } from 'pdf-lib';
import Sortable from 'sortablejs';

interface selectedPDF {
  id: string;
  file: File;
  pageCount: number;
}

let selectedFiles: selectedPDF[] = [];
let sortableInstance: Sortable | null = null;

export function openPDFMerger(): void {
  const overlay = document.getElementById('pdfMergerOverlay');
  if (overlay) {
    overlay.classList.add('active');
  }
  initMergerSortable();
  renderPDFFileList();
}

export function closePDFMerger(): void {
  const overlay = document.getElementById('pdfMergerOverlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
  // Clear file input and selected files to reset state
  const fileInput = document.getElementById('pdfFileInput') as HTMLInputElement | null;
  if (fileInput) fileInput.value = '';
  selectedFiles = [];
  renderPDFFileList();
}

function initMergerSortable(): void {
  const el = document.getElementById('pdfFileList');
  if (!el) return;

  if (sortableInstance) {
    sortableInstance.destroy();
  }

  sortableInstance = Sortable.create(el, {
    animation: 150,
    handle: '.pdf-item-handle',
    draggable: '.pdf-item',
    ghostClass: 'pdf-sortable-ghost',
    onEnd() {
      // Reorder selectedFiles array to match the DOM order
      const items = Array.from(el.querySelectorAll('.pdf-item')) as HTMLElement[];
      const newOrderIds = items.map((item) => item.dataset.id);
      
      const reordered: selectedPDF[] = [];
      newOrderIds.forEach((id) => {
        const found = selectedFiles.find((f) => f.id === id);
        if (found) {
          reordered.push(found);
        }
      });
      selectedFiles = reordered;
    }
  });
}

export async function handlePDFSelection(event: Event): Promise<void> {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const files = Array.from(target.files);

  for (const file of files) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pageCount = pdfDoc.getPageCount();
      
      selectedFiles.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        pageCount,
      });
    } catch (error) {
      console.error('Failed to load PDF file:', file.name, error);
      alert(`Failed to load ${file.name}. Make sure it is a valid PDF.`);
    }
  }

  // Reset input value so same file can be uploaded again
  target.value = '';
  
  renderPDFFileList();
}

export function removePDF(id: string): void {
  selectedFiles = selectedFiles.filter((f) => f.id !== id);
  renderPDFFileList();
}

function renderPDFFileList(): void {
  const listEl = document.getElementById('pdfFileList');
  const emptyEl = document.getElementById('pdfEmptyState');
  const mergeBtn = document.getElementById('mergePDFBtn') as HTMLButtonElement | null;
  
  if (!listEl) return;

  listEl.innerHTML = '';

  if (selectedFiles.length === 0) {
    if (emptyEl) emptyEl.style.display = 'block';
    if (mergeBtn) {
      mergeBtn.disabled = true;
      mergeBtn.textContent = 'Merge & Download';
    }
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';
  if (mergeBtn) mergeBtn.disabled = false;

  selectedFiles.forEach((item) => {
    const itemEl = document.createElement('div');
    itemEl.className = 'pdf-item';
    itemEl.dataset.id = item.id;
    itemEl.innerHTML = `
      <span class="pdf-item-handle">⠿</span>
      <span class="pdf-item-name" title="${escapeHtml(item.file.name)}">${escapeHtml(item.file.name)}</span>
      <span class="pdf-item-pages">${item.pageCount} page(s)</span>
      <button class="pdf-item-remove" onclick="removePDF('${item.id}')" title="Remove file">✕</button>
    `;
    listEl.appendChild(itemEl);
  });
}

export async function mergeAndDownloadPDFs(): Promise<void> {
  if (selectedFiles.length === 0) return;

  const mergeBtn = document.getElementById('mergePDFBtn') as HTMLButtonElement | null;
  const originalText = mergeBtn?.textContent || 'Merge & Download';

  try {
    if (mergeBtn) {
      mergeBtn.disabled = true;
      mergeBtn.textContent = 'Merging...';
    }

    const mergedPdf = await PDFDocument.create();

    for (const item of selectedFiles) {
      const fileBuffer = await item.file.arrayBuffer();
      const pdf = await PDFDocument.load(fileBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save();
    
    // Download PDF
    const blob = new Blob([mergedPdfBytes as any], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'merged.pdf';
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('PDFs merged successfully!');
    closePDFMerger();
  } catch (error) {
    console.error('Error merging PDFs:', error);
    alert('Failed to merge PDFs. Please try again.');
  } finally {
    if (mergeBtn) {
      mergeBtn.disabled = false;
      mergeBtn.textContent = originalText;
    }
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
