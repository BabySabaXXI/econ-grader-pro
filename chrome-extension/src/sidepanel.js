/**
 * EconGrader Chrome Extension — Side Panel Logic
 * Orchestrates grading flow, UI rendering, highlighting, and push-to-review.
 */

// =============================================
// CONSTANTS (inline to avoid module issues in side panel)
// =============================================

const QUESTION_TYPE_OPTIONS = [
  { value: "define-4",     label: "Define (4 marks)" },
  { value: "explain-6",    label: "Explain (6 marks)" },
  { value: "explain-8",    label: "Explain (8 marks)" },
  { value: "assess-12",    label: "Assess (12 marks)" },
  { value: "evaluate-14",  label: "Evaluate (14 marks) — IAL" },
  { value: "evaluate-15",  label: "Evaluate (15 marks)" },
  { value: "evaluate-20",  label: "Evaluate (20 marks)" },
  { value: "evaluate-25",  label: "Evaluate (25 marks)" },
];

const LEVEL_DESCRIPTORS = { 1: "Limited", 2: "Basic", 3: "Sound", 4: "Good", 5: "Excellent" };

const AO_LABELS = { ao1: "Knowledge", ao2: "Application", ao3: "Analysis", ao4: "Evaluation" };

const LEVEL_BADGE_CLASSES = {
  5: "badge-level-5", 4: "badge-level-4", 3: "badge-level-3",
  2: "badge-level-2", 1: "badge-level-1",
};

// =============================================
// STATE
// =============================================

let currentEssayText = "";
let currentDiagramInfo = "none";
let currentDiagramBase64 = null;
let gradingResult = null;
let highlightMode = "all";

// =============================================
// DOM REFS
// =============================================

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// =============================================
// INIT
// =============================================

document.addEventListener("DOMContentLoaded", () => {
  initQuestionTypeSelect();
  bindEvents();
  checkAndShowSetup();
  extractDocContent();
});

function initQuestionTypeSelect() {
  const select = $("#input-question-type");
  QUESTION_TYPE_OPTIONS.forEach((opt) => {
    const el = document.createElement("option");
    el.value = opt.value;
    el.textContent = opt.label;
    select.appendChild(el);
  });
}

// =============================================
// SETUP / API CHECK
// =============================================

function checkAndShowSetup() {
  // No API key setup needed — backend handles it on Vercel
  showView("input");
}

// =============================================
// EVENT BINDINGS
// =============================================

function bindEvents() {
  // Settings modal
  $("#settings-btn").addEventListener("click", () => showModal("settings-modal"));
  $("#settings-close-btn").addEventListener("click", () => hideModal("settings-modal"));
  $("#settings-save-btn").addEventListener("click", saveSettings);
  $("#settings-cancel-btn").addEventListener("click", () => hideModal("settings-modal"));

  // Grade button enable/disable
  $("#input-question").addEventListener("input", updateGradeButton);
  $("#input-question-type").addEventListener("change", updateGradeButton);

  // Grade button
  $("#grade-btn").addEventListener("click", startGrading);

  // Essay preview toggle
  $("#essay-preview-toggle").addEventListener("click", toggleEssayPreview);

  // Diagram upload
  $("#diagram-upload").addEventListener("change", handleDiagramUpload);
  $("#diagram-remove-btn")?.addEventListener("click", removeDiagram);

  // Results actions
  $("#btn-push-review").addEventListener("click", () => showModal("review-modal"));
  $("#btn-copy-feedback").addEventListener("click", copyFeedbackToClipboard);
  $("#btn-grade-again").addEventListener("click", gradeAgain);

  // Review modal
  $("#modal-close-btn").addEventListener("click", () => hideModal("review-modal"));
  $("#review-copy-all").addEventListener("click", copyFullReport);
  $("#review-email").addEventListener("click", emailReport);
  $("#review-download").addEventListener("click", downloadReport);

  // Highlight controls
  $$(".highlight-btn").forEach((btn) => {
    btn.addEventListener("click", () => setHighlightMode(btn.dataset.mode));
  });

  // Listen for highlight clicks from content script
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "HIGHLIGHT_CLICKED") {
      showHighlightDetail(msg.payload.highlightType, msg.payload.data);
    }
  });
}

// =============================================
// DOC CONTENT EXTRACTION
// =============================================

function extractDocContent() {
  chrome.runtime.sendMessage({ type: "EXTRACT_DOC_TEXT" }, (response) => {
    if (chrome.runtime.lastError || !response) {
      $("#doc-word-count").textContent = "Unable to read";
      $("#doc-diagram-status").textContent = "Unknown";
      return;
    }

    const { text, diagrams } = response;
    currentEssayText = text || "";

    const wordCount = currentEssayText.split(/\s+/).filter(Boolean).length;
    $("#doc-word-count").textContent = `${wordCount} words`;

    // Show essay preview
    if (currentEssayText) {
      $("#essay-preview").style.display = "block";
      $("#essay-preview-content").textContent = currentEssayText;
    }

    // Diagram detection
    if (diagrams && diagrams.found) {
      currentDiagramInfo = "found";
      $("#doc-diagram-status").textContent = `Found (${diagrams.count})`;
      $("#doc-diagram-status").style.color = "#3A7266";
      $("#diagram-banner").style.display = "none";
    } else {
      currentDiagramInfo = "none";
      $("#doc-diagram-status").textContent = "Not detected";
      $("#doc-diagram-status").style.color = "#BF6B6B";
      // Show upload banner for question types that typically need diagrams
      $("#diagram-banner").style.display = "flex";
    }

    updateGradeButton();
  });
}

// =============================================
// DIAGRAM HANDLING
// =============================================

function handleDiagramUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    currentDiagramBase64 = ev.target.result;
    currentDiagramInfo = "uploaded";

    // Show preview
    $("#diagram-preview").style.display = "block";
    $("#diagram-preview-img").src = currentDiagramBase64;
    $("#diagram-banner").style.display = "none";
    $("#doc-diagram-status").textContent = "Uploaded";
    $("#doc-diagram-status").style.color = "#3A7266";
  };
  reader.readAsDataURL(file);
}

function removeDiagram() {
  currentDiagramBase64 = null;
  currentDiagramInfo = "none";
  $("#diagram-preview").style.display = "none";
  $("#diagram-upload").value = "";
  $("#diagram-banner").style.display = "flex";
  $("#doc-diagram-status").textContent = "Not detected";
  $("#doc-diagram-status").style.color = "#BF6B6B";
}

// =============================================
// GRADING FLOW
// =============================================

function updateGradeButton() {
  const question = $("#input-question").value.trim();
  const questionType = $("#input-question-type").value;
  const hasText = currentEssayText.length > 0;
  $("#grade-btn").disabled = !question || !questionType || !hasText;
}

async function startGrading() {
  const question = $("#input-question").value.trim();
  const questionType = $("#input-question-type").value;

  if (!question || !questionType || !currentEssayText) return;

  showView("loading");
  animateLoadingSteps();

  try {
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        type: "GRADE_ESSAY",
        payload: {
          essay: currentEssayText,
          question,
          questionType,
          diagramInfo: currentDiagramInfo,
          diagramBase64: currentDiagramBase64,
        },
      }, (resp) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (!resp || !resp.success) {
          reject(new Error(resp?.error || "Unknown error"));
        } else {
          resolve(resp.data);
        }
      });
    });

    gradingResult = response;

    // Apply highlights to the Google Doc
    await applyHighlightsToDoc();

    // Render results
    renderResults(gradingResult);
    showView("results");
  } catch (err) {
    showToast(err.message, "error");
    showView("input");
  }
}

function animateLoadingSteps() {
  const steps = ["step-extract", "step-analyse", "step-grade", "step-highlight"];
  const timings = [0, 1200, 3500, 7000];

  steps.forEach((id, i) => {
    setTimeout(() => {
      // Mark previous as done
      if (i > 0) {
        $(`#${steps[i - 1]}`).classList.remove("active");
        $(`#${steps[i - 1]}`).classList.add("done");
      }
      $(`#${id}`).classList.add("active");
    }, timings[i]);
  });
}

// =============================================
// HIGHLIGHTING
// =============================================

async function applyHighlightsToDoc() {
  if (!gradingResult) return;

  let marksEarned = gradingResult.marksEarned || [];
  let marksLost = gradingResult.marksLost || [];

  if (highlightMode === "earned") marksLost = [];
  if (highlightMode === "lost") marksEarned = [];
  if (highlightMode === "none") { marksEarned = []; marksLost = []; }

  chrome.runtime.sendMessage({
    type: "APPLY_HIGHLIGHTS",
    payload: { marksEarned, marksLost },
  });
}

function setHighlightMode(mode) {
  highlightMode = mode;

  // Update button states
  $$(".highlight-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });

  // Re-apply highlights
  if (mode === "none") {
    chrome.runtime.sendMessage({ type: "CLEAR_HIGHLIGHTS" });
  } else {
    applyHighlightsToDoc();
  }
}

function showHighlightDetail(type, data) {
  // Scroll to and expand the matching feedback item
  const prefix = type === "earned" ? "earned" : "lost";
  const items = $$(`.feedback-item-${prefix}`);

  items.forEach((item) => {
    const quote = item.dataset.quote;
    if (quote && data.quote && quote.toLowerCase() === data.quote.toLowerCase()) {
      item.classList.add("expanded");
      item.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
}

// =============================================
// RENDER RESULTS
// =============================================

function renderResults(result) {
  const markScheme = result.markScheme || {};

  // Score card
  $("#score-marks").textContent = result.totalMarks;
  $("#score-total").textContent = `/${markScheme.total || "?"}`;
  $("#score-percentage").textContent = `${result.overallPercentage}%`;

  // Level badge
  const level = result.levelAchieved || 1;
  const levelEl = $("#score-level");
  levelEl.textContent = `Level ${level} — ${LEVEL_DESCRIPTORS[level] || ""}`;
  levelEl.className = `badge ${LEVEL_BADGE_CLASSES[level] || "badge-level"}`;

  // Animate score ring
  const circumference = 2 * Math.PI * 52; // r=52
  const offset = circumference - (result.overallPercentage / 100) * circumference;
  const ring = $("#score-ring");
  ring.style.strokeDasharray = circumference;
  setTimeout(() => { ring.style.strokeDashoffset = offset; }, 100);

  // Color the ring based on level
  const ringColors = { 5: "#3A7266", 4: "#3B6FAE", 3: "#B89A5C", 2: "#B89A5C", 1: "#BF6B6B" };
  ring.setAttribute("stroke", ringColors[level] || "#3B6FAE");

  // AO bars
  renderAOBars(result.aoScores, markScheme);

  // Examiner comment
  $("#examiner-comment").textContent = result.examinerComment || "";

  // Diagram feedback
  if (result.diagramFeedback) {
    $("#diagram-feedback-section").style.display = "block";
    $("#diagram-feedback-content").textContent = result.diagramFeedback;
  }

  // Highlight counts
  const earned = result.marksEarned || [];
  const lost = result.marksLost || [];
  $("#earned-count").textContent = earned.length;
  $("#lost-count").textContent = lost.length;

  // Marks earned list
  renderFeedbackList("marks-earned-list", earned, "earned");
  renderFeedbackList("marks-lost-list", lost, "lost");

  // Strengths & improvements
  renderBulletList("strengths-list", result.strengths || []);
  renderBulletList("improvements-list", result.improvements || []);
}

function renderAOBars(scores, markScheme) {
  const container = $("#ao-bars");
  container.innerHTML = "";

  ["ao1", "ao2", "ao3", "ao4"].forEach((ao) => {
    const score = scores[ao] || 0;
    const max = markScheme[ao] || 0;
    if (max === 0) return; // Skip AOs with 0 marks (e.g., define-4 has no ao2/3/4)

    const pct = max > 0 ? (score / max) * 100 : 0;

    const bar = document.createElement("div");
    bar.className = "ao-bar";
    bar.dataset.ao = ao;
    bar.innerHTML = `
      <span class="ao-bar-label">${ao.toUpperCase()} ${AO_LABELS[ao]}</span>
      <div class="ao-bar-track">
        <div class="ao-bar-fill" style="width: 0%"></div>
      </div>
      <span class="ao-bar-score">${score}/${max}</span>
    `;
    container.appendChild(bar);

    // Animate after DOM insertion
    requestAnimationFrame(() => {
      bar.querySelector(".ao-bar-fill").style.width = `${pct}%`;
    });
  });
}

function renderFeedbackList(containerId, items, type) {
  const container = $(`#${containerId}`);
  container.innerHTML = "";

  items.forEach((item, idx) => {
    const el = document.createElement("div");
    el.className = `feedback-item feedback-item-${type}`;
    el.dataset.quote = item.quote || "";

    const aoBadgeClass = `badge-${item.ao}`;

    if (type === "earned") {
      el.innerHTML = `
        <div class="feedback-item-header" onclick="this.parentElement.classList.toggle('expanded')">
          <svg class="feedback-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
          <div style="flex:1;min-width:0">
            <div class="feedback-item-meta">
              <span class="badge badge-ao ${aoBadgeClass}">${(item.ao || "").toUpperCase()}</span>
              <span class="points-badge">+${item.points || 1}</span>
            </div>
            <div class="feedback-item-quote">&ldquo;${escapeHtml(item.quote)}&rdquo;</div>
          </div>
        </div>
        <div class="feedback-item-body">
          <div class="feedback-detail feedback-detail-earned">
            <div class="feedback-detail-label">Why this earned marks</div>
            <div>${escapeHtml(item.reason || "")}</div>
          </div>
        </div>
      `;
    } else {
      el.innerHTML = `
        <div class="feedback-item-header" onclick="this.parentElement.classList.toggle('expanded')">
          <svg class="feedback-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
          <div style="flex:1;min-width:0">
            <div class="feedback-item-meta">
              <span class="badge badge-ao ${aoBadgeClass}">${(item.ao || "").toUpperCase()}</span>
              <span class="issue-badge">Issue</span>
            </div>
            <div class="feedback-item-quote">&ldquo;${escapeHtml(item.quote)}&rdquo;</div>
          </div>
        </div>
        <div class="feedback-item-body">
          <div class="feedback-detail feedback-detail-issue">
            <div class="feedback-detail-label">Issue</div>
            <div>${escapeHtml(item.issue || "")}</div>
          </div>
          <div class="feedback-detail feedback-detail-fix">
            <div class="feedback-detail-label">How to Fix</div>
            <div>${escapeHtml(item.howToFix || "")}</div>
          </div>
        </div>
      `;
    }

    container.appendChild(el);
  });
}

function renderBulletList(containerId, items) {
  const container = $(`#${containerId}`);
  container.innerHTML = "";
  items.forEach((text) => {
    const li = document.createElement("li");
    li.textContent = text;
    container.appendChild(li);
  });
}

// =============================================
// PUSH TO REVIEW
// =============================================

function buildReportText() {
  if (!gradingResult) return "";

  const ms = gradingResult.markScheme || {};
  const lines = [];

  lines.push("═══════════════════════════════════════");
  lines.push("ECONGRADER — ESSAY GRADING REPORT");
  lines.push("═══════════════════════════════════════\n");

  lines.push(`Score: ${gradingResult.totalMarks}/${ms.total} (${gradingResult.overallPercentage}%)`);
  lines.push(`Level: ${gradingResult.levelAchieved} — ${LEVEL_DESCRIPTORS[gradingResult.levelAchieved] || ""}\n`);

  lines.push("AO Breakdown:");
  ["ao1", "ao2", "ao3", "ao4"].forEach((ao) => {
    if (ms[ao] > 0) {
      lines.push(`  ${ao.toUpperCase()} (${AO_LABELS[ao]}): ${gradingResult.aoScores[ao]}/${ms[ao]}`);
    }
  });

  lines.push(`\nExaminer Comment:\n  ${gradingResult.examinerComment}\n`);

  if (gradingResult.diagramFeedback) {
    lines.push(`Diagram Feedback:\n  ${gradingResult.diagramFeedback}\n`);
  }

  lines.push("Strengths:");
  (gradingResult.strengths || []).forEach((s) => lines.push(`  + ${s}`));

  lines.push("\nAreas for Improvement:");
  (gradingResult.improvements || []).forEach((s) => lines.push(`  - ${s}`));

  lines.push("\n───────────────────────────────────────");
  lines.push("MARKS EARNED");
  lines.push("───────────────────────────────────────");
  (gradingResult.marksEarned || []).forEach((m) => {
    lines.push(`  [${m.ao.toUpperCase()} +${m.points}] "${m.quote}"`);
    lines.push(`    → ${m.reason}`);
  });

  lines.push("\n───────────────────────────────────────");
  lines.push("ISSUES FOUND");
  lines.push("───────────────────────────────────────");
  (gradingResult.marksLost || []).forEach((m) => {
    lines.push(`  [${m.ao.toUpperCase()}] "${m.quote}"`);
    lines.push(`    Issue: ${m.issue}`);
    lines.push(`    Fix: ${m.howToFix}`);
  });

  lines.push("\n═══════════════════════════════════════");
  lines.push("Generated by EconGrader for Google Docs");
  lines.push("═══════════════════════════════════════");

  return lines.join("\n");
}

function copyFullReport() {
  const text = buildReportText();
  navigator.clipboard.writeText(text).then(() => {
    showToast("Full report copied to clipboard", "success");
    hideModal("review-modal");
  });
}

function emailReport() {
  const subject = encodeURIComponent("EconGrader — Essay Feedback Report");
  const body = encodeURIComponent(buildReportText());
  window.open(`mailto:?subject=${subject}&body=${body}`);
  hideModal("review-modal");
}

function downloadReport() {
  const text = buildReportText();
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `econgrader-report-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Report downloaded", "success");
  hideModal("review-modal");
}

function copyFeedbackToClipboard() {
  const text = buildReportText();
  navigator.clipboard.writeText(text).then(() => {
    showToast("Feedback copied to clipboard", "success");
  });
}

// =============================================
// SETTINGS
// =============================================

function saveSettings() {
  const apiBase = $("#settings-api-key").value.trim();
  if (apiBase) {
    chrome.runtime.sendMessage({
      type: "SET_API_BASE",
      payload: apiBase,
    }, () => {
      showToast("Settings saved", "success");
      hideModal("settings-modal");
    });
  } else {
    hideModal("settings-modal");
  }
}

// =============================================
// VIEW MANAGEMENT
// =============================================

function showView(viewId) {
  $$(".view").forEach((v) => (v.style.display = "none"));
  $(`#view-${viewId}`).style.display = "block";
}

function showModal(id) {
  $(`#${id}`).style.display = "flex";
}

function hideModal(id) {
  $(`#${id}`).style.display = "none";
}

function toggleEssayPreview() {
  const content = $("#essay-preview-content");
  const btn = $("#essay-preview-toggle");
  if (content.style.display === "none") {
    content.style.display = "block";
    btn.textContent = "Hide";
  } else {
    content.style.display = "none";
    btn.textContent = "Show";
  }
}

function gradeAgain() {
  // Clear highlights from doc
  chrome.runtime.sendMessage({ type: "CLEAR_HIGHLIGHTS" });

  // Reset state
  gradingResult = null;
  highlightMode = "all";

  // Reset loading step animations
  ["step-extract", "step-analyse", "step-grade", "step-highlight"].forEach((id) => {
    const el = $(`#${id}`);
    el.classList.remove("active", "done");
  });

  // Re-extract doc content (might have changed)
  extractDocContent();
  showView("input");
}

// =============================================
// UTILITIES
// =============================================

function escapeHtml(str) {
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return String(str).replace(/[&<>"']/g, (c) => map[c]);
}

function showToast(message, type = "") {
  const toast = $("#toast");
  toast.textContent = message;
  toast.className = `toast ${type ? `toast-${type}` : ""}`;
  toast.style.display = "block";
  setTimeout(() => { toast.style.display = "none"; }, 3000);
}
