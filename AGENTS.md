# Resume Builder Pro - AGENTS.md

## Project Overview

Full-featured resume builder with form-based input, live preview, auto-save, undo/redo, drag & drop reorder, and AI-detection scoring. Single HTML file, no build tools.

## Tech Stack

- **HTML/CSS/JS only** — no frameworks, no build step
- **Browser print API** (`window.print()`) for PDF export
- **LocalStorage** for auto-save persistence
- **Drag & Drop API** for reordering entries

## Architecture

### File Structure

```
resume/
├── index.html              # Main entry — full app in single file
└── AGENTS.md               # This file
```

### Layout

- **Left panel (420px)**: Form input with collapsible sections
- **Center panel**: Live resume preview (Letter size)
- **Right panel (280px)**: Score & feedback panel

## Features

### Core
- Form-based input with live preview
- Auto-save to LocalStorage (debounced 500ms)
- Undo/Redo with 50-step history stack
- Drag & drop reorder entries within sections
- Photo upload via FileReader
- Export PDF via `window.print()`

### Score System (100 pts)
- **Contact Info (10)**: Name length, contact completeness
- **Education (15)**: At least one filled entry
- **Skills Categorized (20)**: Separate categories (not combined like AI), 8+ skills
- **Experience Quality (25)**: Strong action verbs, no AI-generic words, 3+ bullets
- **Projects (15)**: Entry count, bullet count
- **Leadership (10)**: At least one entry
- **Specificity (5)**: Numbers, metrics, outcomes (not generic descriptions)

### AI Detection Feedback
- Warns about generic words: "supported", "helped", "responsible for"
- Suggests strong verbs: Built, Developed, Designed, Implemented
- Checks for specificity: %, metrics, concrete outcomes
- Validates skill categorization (AI combines, humans separate)

### Keyboard Shortcuts
- `Ctrl+Z`: Undo
- `Ctrl+Y`: Redo
- `Ctrl+E`: Export PDF

## Constraints

- NO external dependencies (no CDN, no npm packages)
- Single HTML file — everything inline
- Must work offline
- Must print cleanly to PDF on Chrome, Edge, Firefox
- Dark theme for editor, white for resume preview
