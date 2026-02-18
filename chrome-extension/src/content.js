/**
 * EconGrader Chrome Extension — Content Script
 * Injected into Google Docs pages.
 * Handles: text extraction, diagram detection, and highlight overlays.
 * Supports both DOM-based and canvas-based Google Docs rendering.
 *
 * Canvas mode: When Google Docs renders via canvas (no DOM text nodes),
 * the background script handles text extraction via the export API.
 */

(function () {
  "use strict";

  // =============================================
  // STATE
  // =============================================
  let activeHighlights = [];
  let highlightOverlays = [];
  let lastFullText = "";
  let scrollHandler = null;
  let resizeHandler = null;
  let isCanvasMode = false;

  // =============================================
  // TEXT EXTRACTION FROM GOOGLE DOCS
  // =============================================

  /**
   * Detect if Google Docs is in canvas rendering mode.
   */
  function detectCanvasMode() {
    const hasWordNodes = document.querySelectorAll(".kix-wordhtmlgenerator-word-node").length > 0;
    const hasLineViews = document.querySelectorAll(".kix-lineview").length > 0;
    const hasCanvasTiles = document.querySelectorAll(".kix-canvas-tile-content").length > 0;
    isCanvasMode = !hasWordNodes && !hasLineViews && hasCanvasTiles;
    return isCanvasMode;
  }

  /**
   * Extract all text from Google Docs.
   * Tries DOM-based methods first, then falls back to parsing
   * DOCS_modelChunk script tags (works for canvas-mode Google Docs).
   */
  function extractDocText() {
    let text = "";

    // Method 1: kix word nodes (classic Google Docs rendering)
    text = extractViaWordNodes();
    if (text.length > 10) return text;

    // Method 2: Line views
    text = extractViaLineViews();
    if (text.length > 10) return text;

    // Method 3: Page content wrappers
    text = extractViaPageContent();
    if (text.length > 10) return text;

    // Method 4: Broad selectors (contenteditable, etc.)
    text = extractViaBroadSelectors();
    if (text.length > 10) return text;

    // Method 5: Parse DOCS_modelChunk script tags (canvas mode fallback)
    text = extractViaModelChunks();
    if (text.length > 10) return text;

    return "";
  }

  /**
   * Parse DOCS_modelChunk / DOCS_modelData script tags embedded in the page.
   * Google Docs stores the document model as encoded data in <script> tags.
   * This works even when the doc renders via canvas with no DOM text nodes.
   */
  function extractViaModelChunks() {
    try {
      const scripts = document.querySelectorAll("script");
      let modelData = "";

      for (const script of scripts) {
        const content = script.textContent || "";
        if (
          content.includes("DOCS_modelChunk") ||
          content.includes("DOCS_modelData") ||
          content.includes("kix-model")
        ) {
          modelData += content + "\n";
        }
      }

      if (!modelData) return "";

      // Extract "s":"..." string values from the model data
      const strings = [];
      const sPattern = /"s":"((?:[^"\\]|\\.)*)"/g;
      let match;
      while ((match = sPattern.exec(modelData)) !== null) {
        const decoded = match[1]
          .replace(/\\n/g, "\n")
          .replace(/\\t/g, "\t")
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, "\\")
          .replace(/\\u000b/g, "\n")
          .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
            String.fromCharCode(parseInt(hex, 16))
          );
        if (decoded.trim().length > 0) {
          strings.push(decoded);
        }
      }

      if (strings.length > 0) {
        const text = strings.join("").trim();
        if (text.length > 10) {
          console.log("EconGrader: Extracted", text.length, "chars via DOCS_modelChunk");
          return text;
        }
      }

      return "";
    } catch (e) {
      console.debug("EconGrader: Model chunk parsing failed:", e);
      return "";
    }
  }

  function extractViaWordNodes() {
    const wordNodes = document.querySelectorAll(".kix-wordhtmlgenerator-word-node");
    if (wordNodes.length === 0) return "";

    let text = "";
    let lastLineView = null;

    wordNodes.forEach((node) => {
      const lineView = node.closest(".kix-lineview");
      if (lineView && lineView !== lastLineView) {
        if (lastLineView !== null) text += "\n";
        lastLineView = lineView;
      }
      text += node.textContent;
    });

    return text.trim();
  }

  function extractViaLineViews() {
    const lineViews = document.querySelectorAll(".kix-lineview");
    if (lineViews.length === 0) return "";

    return Array.from(lineViews)
      .map((lv) => lv.textContent)
      .join("\n")
      .trim();
  }

  function extractViaPageContent() {
    const pages = document.querySelectorAll(".kix-page-content-wrapper");
    if (pages.length === 0) return "";

    return Array.from(pages)
      .map((p) => p.textContent)
      .join("\n\n")
      .trim();
  }

  function extractViaBroadSelectors() {
    const editorSelectors = [
      ".docs-editor-container",
      ".kix-paginateddocumentplugin",
      '[contenteditable="true"]',
      ".doc-content",
    ];

    for (const selector of editorSelectors) {
      const el = document.querySelector(selector);
      if (el) {
        const text = el.innerText || el.textContent || "";
        if (text.trim().length > 50) return text.trim();
      }
    }

    return "";
  }

  /**
   * Build a map of text positions to DOM nodes for highlighting.
   */
  function buildTextNodeMap() {
    const entries = [];

    const wordNodes = document.querySelectorAll(".kix-wordhtmlgenerator-word-node");
    if (wordNodes.length > 0) {
      let globalPos = 0;
      let lastLineView = null;

      wordNodes.forEach((node) => {
        const lineView = node.closest(".kix-lineview");
        if (lineView && lineView !== lastLineView) {
          if (lastLineView !== null) globalPos++;
          lastLineView = lineView;
        }

        const text = node.textContent;
        entries.push({
          node,
          text,
          globalStart: globalPos,
          globalEnd: globalPos + text.length,
        });
        globalPos += text.length;
      });

      return entries;
    }

    const lineViews = document.querySelectorAll(".kix-lineview");
    if (lineViews.length > 0) {
      let globalPos = 0;
      lineViews.forEach((lv) => {
        const text = lv.textContent;
        entries.push({
          node: lv,
          text,
          globalStart: globalPos,
          globalEnd: globalPos + text.length,
        });
        globalPos += text.length + 1;
      });
    }

    return entries;
  }

  // =============================================
  // DIAGRAM DETECTION
  // =============================================

  function detectDiagrams() {
    const results = {
      found: false,
      count: 0,
      types: [],
      images: [],
    };

    const embeddedObjects = document.querySelectorAll(".kix-embeddedobjectview");
    if (embeddedObjects.length > 0) {
      results.found = true;
      results.count += embeddedObjects.length;
      results.types.push("embedded-object");
    }

    const inlineImages = document.querySelectorAll(
      '.kix-page img:not([src*="docs.google.com/static"]):not([src*="ssl.gstatic.com"])'
    );
    inlineImages.forEach((img) => {
      if (img.width > 50 && img.height > 50) {
        results.found = true;
        results.count++;
        results.types.push("inline-image");
        results.images.push(img.src);
      }
    });

    const drawings = document.querySelectorAll(".kix-drawingview");
    if (drawings.length > 0) {
      results.found = true;
      results.count += drawings.length;
      results.types.push("drawing");
    }

    return results;
  }

  // =============================================
  // HIGHLIGHT OVERLAY SYSTEM (CANVAS MODE COMPATIBLE)
  // =============================================

  /**
   * Apply highlights to the Google Doc.
   * Works in both classic DOM mode and canvas rendering mode.
   *
   * Canvas mode strategy:
   *   1. Get full document text (from modelChunks or cached)
   *   2. Find where each quote appears in the text (character offset)
   *   3. Split text into lines to estimate vertical position
   *   4. Map line positions to page elements (.kix-page)
   *   5. Create colored overlay bars at estimated positions
   *   6. Add tooltip popups on hover/click
   */
  function applyHighlightsToDoc(marksEarned, marksLost, providedText) {
    clearHighlightsFromDoc();

    // Use provided text first, fall back to extraction
    let fullText = providedText || "";
    if (!fullText || fullText.length < 10) {
      fullText = extractDocText();
    }
    if (!fullText || fullText.length < 10) {
      console.log("EconGrader: No text available for highlighting");
      return 0;
    }
    lastFullText = fullText;
    console.log("EconGrader: Highlighting with", fullText.length, "chars of text");

    const fullTextLower = fullText.toLowerCase();

    // Build highlight list with text positions
    const highlights = [];

    (marksEarned || []).forEach((mark) => {
      if (!mark.quote) return;
      const quoteLower = mark.quote.toLowerCase();
      const idx = fullTextLower.indexOf(quoteLower);
      if (idx !== -1) {
        highlights.push({
          start: idx,
          end: idx + mark.quote.length,
          type: "earned",
          data: mark,
        });
      }
    });

    (marksLost || []).forEach((mark) => {
      if (!mark.quote) return;
      const quoteLower = mark.quote.toLowerCase();
      const idx = fullTextLower.indexOf(quoteLower);
      if (idx !== -1) {
        highlights.push({
          start: idx,
          end: idx + mark.quote.length,
          type: "lost",
          data: mark,
        });
      }
    });

    highlights.sort((a, b) => a.start - b.start);

    // Remove overlapping highlights
    const nonOverlapping = [];
    let lastEnd = 0;
    for (const h of highlights) {
      if (h.start >= lastEnd) {
        nonOverlapping.push(h);
        lastEnd = h.end;
      }
    }

    if (nonOverlapping.length === 0) {
      console.log("EconGrader: No matching quotes found in document text");
      return 0;
    }

    // Try classic DOM-based highlighting first
    const textNodeMap = buildTextNodeMap();
    let usedCanvasMode = false;
    if (textNodeMap.length > 0) {
      applyClassicHighlights(nonOverlapping, textNodeMap, fullText);
    } else {
      // Canvas mode: use position-estimated page overlays
      applyCanvasHighlights(nonOverlapping, fullText);
      usedCanvasMode = true;
    }

    activeHighlights = nonOverlapping;
    // Canvas mode uses absolute positioning inside .kix-rotatingtilemanager
    // so overlays scroll naturally — no scroll handler needed.
    // Classic mode uses fixed positioning and needs reposition on scroll.
    if (!usedCanvasMode) {
      setupRepositionHandlers(marksEarned, marksLost);
    }
    return highlightOverlays.length;
  }

  /**
   * Classic DOM-based highlighting (works when word nodes exist).
   */
  function applyClassicHighlights(highlights, textNodeMap, fullText) {
    highlights.forEach((highlight) => {
      const ranges = findDOMRangesForTextRange(textNodeMap, highlight.start, highlight.end);
      ranges.forEach((rangeInfo) => {
        try {
          const range = document.createRange();
          const textNode = findTextNodeInElement(rangeInfo.node);
          if (!textNode) return;

          const nodeOffset = highlight.start - rangeInfo.nodeStart;
          const startInNode = Math.max(0, nodeOffset);
          const endInNode = Math.min(textNode.length, startInNode + (highlight.end - highlight.start));
          if (startInNode >= textNode.length || endInNode <= startInNode) return;

          range.setStart(textNode, startInNode);
          range.setEnd(textNode, endInNode);

          const rects = range.getClientRects();
          for (const rect of rects) {
            createHighlightOverlay(rect.left, rect.top, rect.width, rect.height, highlight, "fixed");
          }
        } catch (e) {
          console.debug("EconGrader: Skipping classic highlight range", e);
        }
      });
    });
  }

  /**
   * Canvas mode highlighting — uses CANVAS PIXEL SCANNING for exact positions.
   *
   * Strategy:
   *   1. Read pixel data from Google Docs' own canvas tiles
   *   2. Scan each row for non-white/non-transparent pixels (= rendered text)
   *   3. Group text rows into visual lines, then lines into visual paragraphs
   *   4. Match extracted text paragraphs to visual paragraphs
   *   5. Place overlays at the EXACT pixel positions where text actually renders
   *   6. Overlays are absolute-positioned in the tile manager → scroll naturally
   */
  function applyCanvasHighlights(highlights, fullText) {
    const tileManager = document.querySelector(".kix-rotatingtilemanager");
    if (!tileManager) {
      console.log("EconGrader: Missing tile manager for canvas highlights");
      return;
    }

    const tmRect = tileManager.getBoundingClientRect();
    const tmStyle = window.getComputedStyle(tileManager);
    const allCanvases = tileManager.querySelectorAll("canvas.kix-canvas-tile-content");

    if (allCanvases.length === 0) {
      console.log("EconGrader: No canvas tiles found");
      return;
    }

    // --- Step 1: Get tile offsets relative to tile manager ---
    const deviceRatio = allCanvases[0].width / parseInt(allCanvases[0].parentElement.style.width);
    const tileOffsets = [];
    allCanvases.forEach((c) => {
      const p = c.parentElement;
      const r = p.getBoundingClientRect();
      tileOffsets.push({
        tmX: Math.round(r.left - tmRect.left),
        tmY: Math.round(r.top - tmRect.top),
      });
    });

    // --- Step 2: Scan all canvas tiles for text pixel positions ---
    const allTextYs = [];
    let textLeftMin = Infinity, textRightMax = 0;

    allCanvases.forEach((canvas, ti) => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const W = canvas.width, H = canvas.height;
      const off = tileOffsets[ti];

      for (let yDev = 0; yDev < H; yDev += 2) {
        const row = ctx.getImageData(0, yDev, W, 1).data;
        let firstText = -1, lastText = -1;
        for (let x = 0; x < W; x++) {
          const r = row[x * 4], g = row[x * 4 + 1], b = row[x * 4 + 2], a = row[x * 4 + 3];
          if (a > 200 && (r < 240 || g < 240 || b < 240)) {
            if (firstText === -1) firstText = x;
            lastText = x;
          }
        }
        if (firstText >= 0) {
          const tmY = Math.round(off.tmY + yDev / deviceRatio);
          const tmL = Math.round(off.tmX + firstText / deviceRatio);
          const tmR = Math.round(off.tmX + lastText / deviceRatio);
          allTextYs.push(tmY);
          if (tmL < textLeftMin) textLeftMin = tmL;
          if (tmR > textRightMax) textRightMax = tmR;
        }
      }
    });

    if (allTextYs.length === 0) {
      console.log("EconGrader: No text pixels found in canvas");
      return;
    }

    allTextYs.sort((a, b) => a - b);

    // Text area boundaries (consistent left/right from 10th/90th percentile)
    const sortedLefts = [...new Set(allTextYs)]; // unique Ys, use global left/right
    const textLeft = textLeftMin;
    const textRight = textRightMax;
    const textWidth = textRight - textLeft;

    // --- Step 3: Group text rows into visual lines ---
    const lines = [];
    let lineStart = allTextYs[0], lineEnd = allTextYs[0];
    for (let i = 1; i < allTextYs.length; i++) {
      if (allTextYs[i] - lineEnd <= 3) {
        lineEnd = allTextYs[i];
      } else {
        lines.push({ top: lineStart, bottom: lineEnd });
        lineStart = allTextYs[i];
        lineEnd = allTextYs[i];
      }
    }
    lines.push({ top: lineStart, bottom: lineEnd });

    // --- Step 4: Group lines into visual paragraphs (gap > 12px) ---
    const visualParas = [];
    let paraLines = [lines[0]];
    for (let i = 1; i < lines.length; i++) {
      const gap = lines[i].top - paraLines[paraLines.length - 1].bottom;
      if (gap > 12) {
        visualParas.push({
          top: paraLines[0].top,
          bottom: paraLines[paraLines.length - 1].bottom,
          lineCount: paraLines.length,
        });
        paraLines = [lines[i]];
      } else {
        paraLines.push(lines[i]);
      }
    }
    visualParas.push({
      top: paraLines[0].top,
      bottom: paraLines[paraLines.length - 1].bottom,
      lineCount: paraLines.length,
    });

    // --- Step 5: Match text paragraphs to visual paragraphs ---
    // Split fullText into paragraphs, skip empty ones, match by order
    const textParas = fullText.split("\n");
    const nonEmptyTextParas = [];
    let charOff = 0;
    for (let i = 0; i < textParas.length; i++) {
      const p = textParas[i];
      if (p.trim().length > 0) {
        nonEmptyTextParas.push({ startChar: charOff, endChar: charOff + p.length, text: p });
      }
      charOff += p.length + 1;
    }

    // Build mapping: textPara index → visualPara index (1:1 by order)
    const paraMapping = [];
    const mapCount = Math.min(nonEmptyTextParas.length, visualParas.length);
    for (let i = 0; i < mapCount; i++) {
      paraMapping.push({
        startChar: nonEmptyTextParas[i].startChar,
        endChar: nonEmptyTextParas[i].endChar,
        top: visualParas[i].top,
        bottom: visualParas[i].bottom,
        height: visualParas[i].bottom - visualParas[i].top,
        lineCount: visualParas[i].lineCount,
      });
    }

    console.log(
      `EconGrader: Canvas scan — ${lines.length} lines, ${visualParas.length} visual paras, ` +
      `${nonEmptyTextParas.length} text paras, textArea: L${textLeft} R${textRight} W${textWidth}, ` +
      `mapped: ${mapCount}`
    );

    // Ensure tile manager accepts absolute children
    if (tmStyle.position === "static") {
      tileManager.style.position = "relative";
    }

    // --- Step 6: Place highlights at EXACT visual paragraph positions ---
    highlights.forEach((highlight) => {
      // Find which mapped paragraph contains this highlight
      let startPara = null, endPara = null;
      for (const pm of paraMapping) {
        if (highlight.start >= pm.startChar && highlight.start < pm.endChar) {
          startPara = pm;
        }
        if (highlight.end > pm.startChar && highlight.end <= pm.endChar) {
          endPara = pm;
        }
      }
      if (!startPara) return;
      if (!endPara) endPara = startPara;

      // Use exact visual paragraph boundaries
      const top = startPara.top;
      const bottom = endPara.bottom;
      const height = bottom - top;

      // Skip if height is unreasonable (ghost highlight protection)
      if (height <= 0 || height > tmRect.height * 0.8) return;

      createCanvasOverlay(textLeft, top, textWidth, height, highlight, tileManager);
    });

    console.log(`EconGrader: Placed ${highlightOverlays.length} canvas highlight overlays`);
  }

  /**
   * Create a canvas-mode overlay as an absolute-positioned child of the tile manager.
   * Uses a thin left-border accent bar style for clarity.
   */
  function createCanvasOverlay(left, top, textWidth, height, highlight, parentEl) {
    const isEarned = highlight.type === "earned";

    // Colors — visible but not overpowering
    const barColor = isEarned ? "#3A7D6E" : "#C45C5C";
    const bgColor = isEarned ? "rgba(58, 125, 110, 0.10)" : "rgba(196, 92, 92, 0.10)";
    const bgHover = isEarned ? "rgba(58, 125, 110, 0.18)" : "rgba(196, 92, 92, 0.18)";

    // Single overlay: slim left accent bar + light background tint
    const el = document.createElement("div");
    el.style.cssText = `
      position: absolute;
      left: ${Math.round(left)}px;
      top: ${Math.round(top)}px;
      width: ${Math.round(textWidth)}px;
      height: ${Math.round(height)}px;
      background: ${bgColor};
      border-left: 3px solid ${barColor};
      border-radius: 2px;
      pointer-events: auto;
      cursor: pointer;
      z-index: 998;
      transition: background 0.15s ease;
      box-sizing: border-box;
    `;

    el.className = `econgrader-overlay econgrader-overlay-${highlight.type}`;
    el.dataset.type = highlight.type;
    el.dataset.highlightData = JSON.stringify(highlight.data);

    el.addEventListener("mouseenter", (e) => {
      el.style.background = bgHover;
      showHighlightTooltip(e, highlight);
    });
    el.addEventListener("mouseleave", () => {
      el.style.background = bgColor;
      hideHighlightTooltip();
    });
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      chrome.runtime.sendMessage({
        type: "HIGHLIGHT_CLICKED",
        payload: { highlightType: highlight.type, data: highlight.data },
      });
    });

    parentEl.appendChild(el);
    highlightOverlays.push(el);
  }

  /**
   * Create a single highlight overlay element (used for classic DOM-based highlights).
   */
  function createHighlightOverlay(left, top, width, height, highlight, position, parentEl) {
    const overlay = document.createElement("div");
    const isEarned = highlight.type === "earned";
    overlay.className = `econgrader-overlay econgrader-overlay-${highlight.type}`;
    overlay.style.cssText = `
      position: ${position};
      left: ${left}px;
      top: ${top}px;
      width: ${width}px;
      height: ${height}px;
      pointer-events: auto;
      cursor: pointer;
      transition: opacity 0.2s;
      border-radius: 3px;
      z-index: 1000;
      background-color: ${isEarned ? "rgba(74, 139, 127, 0.12)" : "rgba(191, 107, 107, 0.12)"};
      border-left: 3px solid ${isEarned ? "rgba(74, 139, 127, 0.7)" : "rgba(191, 107, 107, 0.7)"};
    `;

    overlay.dataset.type = highlight.type;
    overlay.dataset.highlightData = JSON.stringify(highlight.data);

    // Click handler: notify side panel
    overlay.addEventListener("click", (e) => {
      e.stopPropagation();
      chrome.runtime.sendMessage({
        type: "HIGHLIGHT_CLICKED",
        payload: { highlightType: highlight.type, data: highlight.data },
      });
    });

    // Hover: show tooltip
    overlay.addEventListener("mouseenter", (e) => {
      showHighlightTooltip(e, highlight);
    });
    overlay.addEventListener("mouseleave", () => {
      hideHighlightTooltip();
    });

    const container = parentEl || document.body;
    container.appendChild(overlay);
    highlightOverlays.push(overlay);
  }

  /**
   * Show a tooltip popup near the highlight overlay on hover.
   */
  function showHighlightTooltip(event, highlight) {
    hideHighlightTooltip();

    const tooltip = document.createElement("div");
    tooltip.id = "econgrader-active-tooltip";
    tooltip.className = "econgrader-tooltip";

    const data = highlight.data;
    const typeLabel = highlight.type === "earned" ? "✓ Mark Earned" : "✗ Issue Found";
    const typeColor = highlight.type === "earned" ? "#3A7266" : "#BF6B6B";
    const aoLabel = (data.ao || "").toUpperCase();

    let bodyHtml = "";
    if (highlight.type === "earned") {
      bodyHtml = `
        <div style="font-weight:600;color:${typeColor};margin-bottom:4px;font-size:11px;">${typeLabel} · ${aoLabel}</div>
        <div style="font-size:12px;color:#2E3545;margin-bottom:4px;">"${escapeHtmlStr(data.quote || "")}"</div>
        <div style="font-size:11px;color:#5A6478;">${escapeHtmlStr(data.reason || "")}</div>
      `;
    } else {
      bodyHtml = `
        <div style="font-weight:600;color:${typeColor};margin-bottom:4px;font-size:11px;">${typeLabel} · ${aoLabel}</div>
        <div style="font-size:12px;color:#2E3545;margin-bottom:4px;">"${escapeHtmlStr(data.quote || "")}"</div>
        <div style="font-size:11px;color:#BF6B6B;margin-bottom:3px;"><b>Issue:</b> ${escapeHtmlStr(data.issue || "")}</div>
        <div style="font-size:11px;color:#3A7266;"><b>Fix:</b> ${escapeHtmlStr(data.howToFix || "")}</div>
      `;
    }

    tooltip.innerHTML = bodyHtml;
    tooltip.style.cssText = `
      position: fixed;
      z-index: 10001;
      background: white;
      border: 1px solid #DDE2EB;
      border-radius: 10px;
      padding: 10px 14px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      max-width: 300px;
      box-shadow: 0 8px 24px -6px rgba(22,27,38,0.18);
      pointer-events: none;
      opacity: 0;
      transform: translateY(4px);
      transition: opacity 0.15s, transform 0.15s;
    `;

    document.body.appendChild(tooltip);

    // Position the tooltip above or below the highlight
    const rect = event.target.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    let tooltipTop = rect.bottom + 6;
    let tooltipLeft = rect.left;

    // If tooltip would go below viewport, show above
    if (tooltipTop + tooltipRect.height > window.innerHeight) {
      tooltipTop = rect.top - tooltipRect.height - 6;
    }
    // Keep within viewport horizontally
    if (tooltipLeft + tooltipRect.width > window.innerWidth - 16) {
      tooltipLeft = window.innerWidth - tooltipRect.width - 16;
    }

    tooltip.style.top = `${tooltipTop}px`;
    tooltip.style.left = `${tooltipLeft}px`;

    // Animate in
    requestAnimationFrame(() => {
      tooltip.style.opacity = "1";
      tooltip.style.transform = "translateY(0)";
    });
  }

  function hideHighlightTooltip() {
    const existing = document.getElementById("econgrader-active-tooltip");
    if (existing) existing.remove();
  }

  function escapeHtmlStr(str) {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return String(str).replace(/[&<>"']/g, (c) => map[c]);
  }

  function findDOMRangesForTextRange(textNodeMap, start, end) {
    const ranges = [];
    for (const entry of textNodeMap) {
      if (entry.globalEnd <= start) continue;
      if (entry.globalStart >= end) break;
      ranges.push({
        node: entry.node,
        nodeStart: entry.globalStart,
        nodeEnd: entry.globalEnd,
      });
    }
    return ranges;
  }

  function findTextNodeInElement(element) {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
    return walker.nextNode();
  }

  function clearHighlightsFromDoc() {
    highlightOverlays.forEach((el) => el.remove());
    highlightOverlays = [];
    activeHighlights = [];
    hideHighlightTooltip();

    if (scrollHandler) {
      const editorEl = document.querySelector(".kix-appview-editor");
      if (editorEl) editorEl.removeEventListener("scroll", scrollHandler);
      document.removeEventListener("scroll", scrollHandler, true);
      scrollHandler = null;
    }
    if (resizeHandler) {
      window.removeEventListener("resize", resizeHandler);
      resizeHandler = null;
    }
  }

  function setupRepositionHandlers(marksEarned, marksLost) {
    let timeout;
    const reposition = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        clearHighlightsFromDoc();
        applyHighlightsToDoc(marksEarned, marksLost, lastFullText);
      }, 200);
    };

    scrollHandler = reposition;
    resizeHandler = reposition;

    document.addEventListener("scroll", scrollHandler, true);
    window.addEventListener("resize", resizeHandler);
  }

  // =============================================
  // FLOATING ACTION BUTTON
  // =============================================

  function injectFAB() {
    if (document.getElementById("econgrader-fab")) return;

    const fab = document.createElement("div");
    fab.id = "econgrader-fab";
    fab.innerHTML = `
      <button id="econgrader-fab-btn" title="Open EconGrader">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        <span>Grade</span>
      </button>
    `;
    document.body.appendChild(fab);

    document.getElementById("econgrader-fab-btn").addEventListener("click", () => {
      chrome.runtime.sendMessage({ type: "OPEN_SIDE_PANEL" });
    });
  }

  // =============================================
  // MESSAGE HANDLER
  // =============================================

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case "EXTRACT_TEXT": {
        // Try DOM-based extraction
        const text = extractDocText();
        const diagrams = detectDiagrams();

        if (text.length > 10) {
          // DOM extraction succeeded (classic mode)
          sendResponse({ text, diagrams });
        } else {
          // DOM extraction failed — signal that export API should be used
          // Return the current URL so background can use export API
          sendResponse({
            text: "",
            diagrams,
            canvasMode: true,
            docUrl: window.location.href,
          });
        }
        break;
      }

      case "APPLY_HIGHLIGHTS": {
        const { marksEarned, marksLost, fullText } = message.payload;
        const count = applyHighlightsToDoc(marksEarned || [], marksLost || [], fullText || "");
        sendResponse({ success: true, count: count || highlightOverlays.length });
        break;
      }

      case "CLEAR_HIGHLIGHTS": {
        clearHighlightsFromDoc();
        sendResponse({ success: true });
        break;
      }

      case "DETECT_DIAGRAMS": {
        const diagramResults = detectDiagrams();
        sendResponse(diagramResults);
        break;
      }

      default:
        sendResponse({ error: "Unknown message type" });
    }
    return true;
  });

  // =============================================
  // INITIALIZE
  // =============================================

  function init() {
    const checkReady = setInterval(() => {
      const classicEditor = document.querySelector(".kix-appview-editor");
      const canvasEditor = document.querySelector(".docs-editor-container");
      const anyEditor = classicEditor || canvasEditor;

      if (anyEditor) {
        clearInterval(checkReady);
        detectCanvasMode();
        injectFAB();
        console.log("EconGrader: Content script initialized (mode: " +
          (isCanvasMode ? "canvas" : "classic") + ")");
      }
    }, 500);

    setTimeout(() => clearInterval(checkReady), 30000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
