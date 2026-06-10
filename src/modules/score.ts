// ===== Score & Feedback System =====

import { state } from './state';
import { esc } from './utils';
import { renderPageFit, getAllResumeBullets } from './preview';

export function renderAIInsights(): void {
  const container = document.getElementById('aiInsights');
  if (!container) return;
  const insights = Object.values(state.aiInsights || {});
  if (!insights.length) {
    container.innerHTML = '<div class="feedback-desc">No AI insights applied yet.</div>';
    return;
  }
  container.innerHTML = insights
    .map(
      (insight) =>
        `<div class="insight-block"><div class="feedback-title">${esc(insight.title || 'Insight')}</div><pre>${esc(JSON.stringify(insight.payload, null, 2))}</pre></div>`
    )
    .join('');
}

export function updateScore(): void {
  let total = 0;
  const breakdown: Array<{ label: string; score: number; max: number }> = [];
  const feedback: Array<{ type: string; title: string; desc: string }> = [];

  // Contact Info (10 pts)
  const hasName = state.name.length > 2;
  const hasContact = state.contact.length > 5;
  const contactScore = (hasName ? 5 : 0) + (hasContact ? 5 : 0);
  total += contactScore;
  breakdown.push({ label: 'Contact Info', score: contactScore, max: 10 });
  if (!hasName) feedback.push({ type: 'error', title: 'Missing Name', desc: 'Add your full name to the resume.' });
  if (!hasContact) feedback.push({ type: 'warn', title: 'Contact Info Too Short', desc: 'Add phone, email, LinkedIn, or GitHub.' });

  // Education (15 pts)
  const eduFilled = state.education.filter((e) => e.school).length;
  const eduScore = Math.min(15, eduFilled * 8);
  total += eduScore;
  breakdown.push({ label: 'Education', score: eduScore, max: 15 });
  if (!eduFilled) feedback.push({ type: 'error', title: 'No Education', desc: 'Add at least one education entry.' });

  // Skills (20 pts)
  const skillCategories = state.skills.filter((s) => s.category && s.items).length;
  const skillItems = state.skills.filter((s) => s.items).map((s) => s.items.split(',').filter((x) => x.trim()).length);
  const totalSkills = skillItems.reduce((a, b) => a + b, 0);
  let skillScore = 0;
  if (skillCategories >= 2) skillScore += 10;
  else if (skillCategories === 1) skillScore += 5;
  if (totalSkills >= 8) skillScore += 10;
  else if (totalSkills >= 4) skillScore += 5;
  total += skillScore;
  breakdown.push({ label: 'Skills (Categorized)', score: skillScore, max: 20 });
  if (skillCategories < 2) feedback.push({ type: 'warn', title: 'Skills Not Categorized', desc: 'AI writes skills combined. Humans separate into categories (Languages, Frameworks, Tools).' });
  if (totalSkills < 8) feedback.push({ type: 'warn', title: 'Too Few Skills', desc: 'List at least 8 specific skills to look credible.' });

  // Projects (15 pts)
  const projEntries = state.projects.filter((p) => p.role || p.name);
  const projBullets = projEntries.flatMap((p) => p.bullets || []).filter((b) => b.trim());
  let projScore = 0;
  if (projEntries.length >= 2) projScore += 8;
  else if (projEntries.length === 1) projScore += 4;
  if (projBullets.length >= 4) projScore += 7;
  else if (projBullets.length >= 2) projScore += 4;
  total += projScore;
  breakdown.push({ label: 'Projects', score: projScore, max: 15 });

  // Personal Statement (10 pts)
  const statementWords = (state.summary || '').split(/\s+/).filter(Boolean).length;
  let statementScore = 0;
  if (statementWords >= 35 && statementWords <= 70) statementScore = 10;
  else if (statementWords >= 20) statementScore = 7;
  else if (statementWords > 0) statementScore = 4;
  total += statementScore;
  breakdown.push({ label: 'Personal Statement', score: statementScore, max: 10 });
  if (!state.summary) feedback.push({ type: 'warn', title: 'No Personal Statement', desc: 'Add a 3-4 sentence personal statement at the top.' });
  else if (statementWords > 70) feedback.push({ type: 'warn', title: 'Too Long', desc: 'Trim the personal statement to stay under 1 page.' });

  // Specificity (5 pts)
  const allText = JSON.stringify(state).toLowerCase();
  const specificIndicators = ['%', '$', 'users', 'reduced', 'increased', 'improved', 'from', 'to', 'by', 'within', 'under'];
  const specificityCount = specificIndicators.filter((w) => allText.includes(w)).length;
  const specScore = Math.min(5, Math.floor(specificityCount / 2));
  total += specScore;
  breakdown.push({ label: 'Specificity', score: specScore, max: 5 });
  if (specScore < 3) feedback.push({ type: 'warn', title: 'Too Generic', desc: 'Add specific numbers, metrics, and outcomes. AI writes generic; humans write: "Reduced load time by 40%".' });

  // Render score ring
  const maxScore = 75;
  const pct = Math.min(100, Math.round((total / maxScore) * 100));
  const circumference = 2 * Math.PI * 34;
  const offset = circumference - (pct / 100) * circumference;
  const circle = document.getElementById('scoreCircle');
  const scoreText = document.getElementById('scoreText');
  if (circle) {
    circle.style.strokeDashoffset = String(offset);
    circle.style.stroke = pct >= 70 ? '#22c55e' : pct >= 40 ? '#f59e0b' : '#ef4444';
  }
  if (scoreText) scoreText.textContent = String(pct);

  const breakdownEl = document.getElementById('scoreBreakdown');
  if (breakdownEl) {
    breakdownEl.innerHTML = breakdown
      .map(
        (b) => `
      <div class="score-item">
        <span class="score-item-label">${b.label}</span>
        <span class="score-item-value" style="color:${b.score >= b.max * 0.7 ? '#22c55e' : b.score >= b.max * 0.4 ? '#f59e0b' : '#ef4444'}">${b.score}/${b.max}</span>
      </div>
    `
      )
      .join('');
  }

  if (!feedback.length) feedback.push({ type: 'good', title: 'Looking Great!', desc: 'Your resume looks well-structured and specific. Not AI-generic!' });
  const feedbackEl = document.getElementById('scoreFeedback');
  if (feedbackEl) {
    feedbackEl.innerHTML = feedback
      .map(
        (f) => `
      <div class="feedback-item ${f.type}">
        <div class="feedback-title">${f.title}</div>
        <div class="feedback-desc">${f.desc}</div>
      </div>
    `
      )
      .join('');
  }

  renderPageFit();
  renderAIInsights();
}
