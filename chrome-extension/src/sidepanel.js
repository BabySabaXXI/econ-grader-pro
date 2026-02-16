/**
 * EconGrader Chrome Extension — Side Panel Logic
 * Auto-detects question from Google Doc. User only picks question type + optional diagram.
 */

// =============================================
// CONSTANTS
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

// Question detection keywords — lines containing these are likely exam questions
const QUESTION_KEYWORDS = [
  "evaluate", "assess", "discuss", "explain", "define", "analyse", "analyze",
  "to what extent", "with the help of", "examine", "consider", "outline",
  "distinguish", "compare", "contrast", "justify", "calculate", "using a diagram",
  "with reference to", "account for",
];

// =============================================
// STATE
// =============================================

let currentEssayText = "";
let currentFullText = "";
let detectedQuestion = "";
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
  showView("input");
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
// QUESTION AUTO-DETECTION
// =============================================

/**
 * Detect the exam question from the document text.
 * Strategy:
 * 1. Look for lines containing question keywords (evaluate, assess, explain, etc.)
 * 2. Look for lines ending with a question mark
 * 3. Look for lines with mark indicators like (25 marks), [12]
 * 4. Fall back to the first non-empty line
 */
function detectQuestion(fullText) {
  if (!fullText) return "";

  const lines = fullText.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) return "";

  // Strategy 1: Find lines with question keywords + question mark or marks indicator
  for (const line of lines) {
    const lower = line.toLowerCase();
    const hasKeyword = QUESTION_KEYWORDS.some(kw => lower.includes(kw));
    const hasQuestionMark = line.includes("?");
    const hasMarksIndicator = /\(\d+\s*marks?\)|\[\d+\]/.test(lower);

    if (hasKeyword && (hasQuestionMark || hasMarksIndicator)) {
      return line;
    }
  }

  // Strategy 2: Find lines with question keywords (even without ? or marks)
  for (const line of lines) {
    const lower = line.toLowerCase();
    const hasKeyword = QUESTION_KEYWORDS.some(kw => lower.includes(kw));
    if (hasKeyword && line.length > 20) {
      return line;
    }
  }

  // Strategy 3: Lines ending with question mark
  for (const line of lines) {
    if (line.endsWith("?") && line.length > 15) {
      return line;
    }
  }

  // Strategy 4: Lines with mark indicators
  for (const line of lines) {
    if (/\(\d+\s*marks?\)|\[\d+\]/.test(line.toLowerCase())) {
      return line;
    }
  }

  // Strategy 5: First line (often the question/title)
  return lines[0];
}

/**
 * Extract the essay body (everything after the detected question line).
 */
function extractEssayBody(fullText, questionLine) {
  if (!questionLine || !fullText) return fullText;

  const idx = fullText.indexOf(questionLine);
  if (idx === -1) return fullText;

  const afterQuestion = fullText.substring(idx + questionLine.length).trim();
  return afterQuestion || fullText;
}

// =============================================
// EVENT BINDINGS
// =============================================

function bindEvents() {
  // Settings modal
  $("#settings-btn").addEventListener("click", openSettings);
  $("#settings-close-btn").addEventListener("click", () => hideModal("settings-modal"));
  $("#settings-save-btn").addEventListener("click", saveSettings);
  $("#settings-cancel-btn").addEventListener("click", () => hideModal("settings-modal"));

  // Question type enables grade button
  $("#input-question-type").addEventListener("change", updateGradeButton);

  // Grade button
  $("#grade-btn").addEventListener("click", startGrading);

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
    // When the active tab changes or page reloads, reset the sidepanel
    if (msg.type === "TAB_DOC_CHANGED") {
      resetSidepanel();
    }
  });
}

// =============================================
// DOC CONTENT EXTRACTION
// =============================================

let extractRetryCount = 0;
const MAX_EXTRACT_RETRIES = 8;

function extractDocContent() {
  $("#doc-word-count").textContent = extractRetryCount > 0 ? `Retrying (${extractRetryCount})...` : "Reading...";

  chrome.runtime.sendMessage({ type: "EXTRACT_DOC_TEXT" }, (response) => {
    if (chrome.runtime.lastError || !response) {
      // Retry a few times — content script or background might not be ready
      if (extractRetryCount < MAX_EXTRACT_RETRIES) {
        extractRetryCount++;
        setTimeout(extractDocContent, 2000);
        return;
      }
      $("#doc-word-count").textContent = "Unable to read";
      $("#doc-question-status").textContent = "Unable to detect";
      $("#doc-question-status").style.color = "#BF6B6B";
      $("#doc-diagram-status").textContent = "Unknown";
      return;
    }

    // If we got a response but no text, retry with increasing delay
    if ((!response.text || response.text.length < 5) && extractRetryCount < MAX_EXTRACT_RETRIES) {
      extractRetryCount++;
      const delay = Math.min(2000 + extractRetryCount * 500, 5000);
      setTimeout(extractDocContent, delay);
      return;
    }

    const { text, diagrams } = response;
    const fullText = text || "";
    currentFullText = fullText;

    // Detect question from document
    detectedQuestion = detectQuestion(fullText);

    // Extract essay body (text after the question)
    currentEssayText = extractEssayBody(fullText, detectedQuestion);

    const wordCount = currentEssayText.split(/\s+/).filter(Boolean).length;
    $("#doc-word-count").textContent = `${wordCount} words`;

    // Show detected question
    if (detectedQuestion) {
      $("#doc-question-status").textContent = "Detected";
      $("#doc-question-status").style.color = "#3A7266";
      $("#question-preview").style.display = "block";
      $("#question-preview-text").textContent = detectedQuestion;
    } else {
      $("#doc-question-status").textContent = "Not found";
      $("#doc-question-status").style.color = "#BF6B6B";
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
  const questionType = $("#input-question-type").value;
  const hasText = currentEssayText.length > 0;
  const hasQuestion = detectedQuestion.length > 0;
  $("#grade-btn").disabled = !questionType || !hasText || !hasQuestion;
}

async function startGrading() {
  const questionType = $("#input-question-type").value;

  if (!questionType || !currentEssayText || !detectedQuestion) return;

  showView("loading");
  animateLoadingSteps();

  try {
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        type: "GRADE_ESSAY",
        payload: {
          essay: currentEssayText,
          question: detectedQuestion,
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
    payload: { marksEarned, marksLost, fullText: currentFullText },
  });
}

function setHighlightMode(mode) {
  highlightMode = mode;

  $$(".highlight-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });

  if (mode === "none") {
    chrome.runtime.sendMessage({ type: "CLEAR_HIGHLIGHTS" });
  } else {
    applyHighlightsToDoc();
  }
}

function showHighlightDetail(type, data) {
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
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (result.overallPercentage / 100) * circumference;
  const ring = $("#score-ring");
  ring.style.strokeDasharray = circumference;
  setTimeout(() => { ring.style.strokeDashoffset = offset; }, 100);

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
    if (max === 0) return;

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

    requestAnimationFrame(() => {
      bar.querySelector(".ao-bar-fill").style.width = `${pct}%`;
    });
  });
}

function renderFeedbackList(containerId, items, type) {
  const container = $(`#${containerId}`);
  container.innerHTML = "";

  items.forEach((item) => {
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

function openSettings() {
  // Load current API URL into the field
  chrome.runtime.sendMessage({ type: "GET_API_BASE" }, (resp) => {
    if (resp && resp.apiBase) {
      $("#settings-api-url").value = resp.apiBase;
    }
  });
  showModal("settings-modal");
}

function saveSettings() {
  const apiUrl = $("#settings-api-url").value.trim();
  if (apiUrl) {
    chrome.runtime.sendMessage({
      type: "SET_API_BASE",
      payload: apiUrl,
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

function gradeAgain() {
  chrome.runtime.sendMessage({ type: "CLEAR_HIGHLIGHTS" });

  gradingResult = null;
  highlightMode = "all";

  ["step-extract", "step-analyse", "step-grade", "step-highlight"].forEach((id) => {
    const el = $(`#${id}`);
    el.classList.remove("active", "done");
  });

  extractDocContent();
  showView("input");
}

/**
 * Fully reset the sidepanel when the user navigates to a different doc,
 * refreshes the page, or switches tabs. Clears all state, results,
 * highlights, and goes back to the input view with fresh extraction.
 */
function resetSidepanel() {
  // Clear highlights on the old page (best effort — page may have unloaded)
  chrome.runtime.sendMessage({ type: "CLEAR_HIGHLIGHTS" });

  // Reset all state
  currentEssayText = "";
  currentFullText = "";
  detectedQuestion = "";
  currentDiagramInfo = "none";
  currentDiagramBase64 = null;
  gradingResult = null;
  highlightMode = "all";
  extractRetryCount = 0;

  // Reset loading steps
  ["step-extract", "step-analyse", "step-grade", "step-highlight"].forEach((id) => {
    const el = $(`#${id}`);
    if (el) el.classList.remove("active", "done");
  });

  // Reset UI elements
  const questionType = $("#input-question-type");
  if (questionType) questionType.value = "";

  const questionPreview = $("#question-preview");
  if (questionPreview) questionPreview.style.display = "none";

  const diagramPreview = $("#diagram-preview");
  if (diagramPreview) diagramPreview.style.display = "none";

  const diagramUpload = $("#diagram-upload");
  if (diagramUpload) diagramUpload.value = "";

  const diagramFeedback = $("#diagram-feedback-section");
  if (diagramFeedback) diagramFeedback.style.display = "none";

  // Reset highlight buttons
  $$(".highlight-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === "all");
  });

  // Go back to input view and re-extract from the new document
  showView("input");

  // Small delay to let the new page content load before extracting
  setTimeout(() => {
    extractDocContent();
  }, 1000);
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
