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
   * Canvas mode highlighting.
   *
   * Strategy: Use the ACTUAL page element (.kix-page) or tile manager's
   * internal structure to find real page boundaries, then use an offscreen
   * measurement div to calculate proportional Y positions within the page.
   *
   * The overlays are absolute-positioned children of the tile manager,
   * so they scroll naturally with the document.
   */
  function applyCanvasHighlights(highlights, fullText) {
    const tileManager = document.querySelector(".kix-rotatingtilemanager");
    if (!tileManager) {
      console.log("EconGrader: Missing tile manager for canvas highlights");
      return;
    }

    const tmRect = tileManager.getBoundingClientRect();
    const tmStyle = window.getComputedStyle(tileManager);

    // --- DIAGNOSTIC: dump real DOM structure to understand the page layout ---
    // Look for all positioned children inside the TM to find the actual page
    const tmContent = tileManager.querySelector(".kix-rotatingtilemanager-content");
    const allCanvases = tileManager.querySelectorAll("canvas.kix-canvas-tile-content");

    // Each canvas tile has a parent div with explicit top/left/width/height styles.
    // These tile positions reveal the actual page layout.
    let minTileLeft = Infinity, maxTileRight = 0;
    let minTileTop = Infinity, maxTileBottom = 0;
    allCanvases.forEach((c) => {
      const parent = c.parentElement;
      if (parent) {
        const r = parent.getBoundingClientRect();
        const relLeft = r.left - tmRect.left;
        const relTop = r.top - tmRect.top;
        if (relLeft < minTileLeft) minTileLeft = relLeft;
        if (relLeft + r.width > maxTileRight) maxTileRight = relLeft + r.width;
        if (relTop < minTileTop) minTileTop = relTop;
        if (relTop + r.height > maxTileBottom) maxTileBottom = relTop + r.height;
      }
    });

    // The tile area represents the actual rendered page content area
    // (the canvas tiles tile the entire page including margins)
    const tileAreaLeft = minTileLeft === Infinity ? 0 : minTileLeft;
    const tileAreaWidth = maxTileRight > 0 ? maxTileRight - tileAreaLeft : tmRect.width;
    const tileAreaTop = minTileTop === Infinity ? 0 : minTileTop;
    const tileAreaHeight = maxTileBottom > 0 ? maxTileBottom - tileAreaTop : tmRect.height;

    console.log(
      `EconGrader: Tile area — left:${Math.round(tileAreaLeft)} top:${Math.round(tileAreaTop)} ` +
      `w:${Math.round(tileAreaWidth)} h:${Math.round(tileAreaHeight)} ` +
      `TM: ${Math.round(tmRect.width)}×${Math.round(tmRect.height)} ` +
      `tiles: ${allCanvases.length}`
    );

    // Page dimensions: the tile area IS the full page (canvas covers everything).
    // Standard Google Docs page: 8.5" × 11" at 96 DPI = 816 × 1056 px
    // Default margins: 1" on all sides = 96px
    // Text content area: starts at (96, 96) relative to page, 624px wide, 864px tall
    //
    // The page width tells us the DPI scaling factor:
    const pageWidth = tileAreaWidth;
    const pageHeight = tileAreaHeight || tmRect.height;
    const dpiScale = pageWidth / 816; // 1.0 at standard 96dpi

    // Text area boundaries (relative to tile manager)
    const textLeft = tileAreaLeft + Math.round(96 * dpiScale);
    const textTop = tileAreaTop + Math.round(96 * dpiScale);
    const textWidth = Math.round(624 * dpiScale);
    const textBottom = tileAreaTop + pageHeight - Math.round(96 * dpiScale);
    const textHeight = textBottom - textTop;

    console.log(
      `EconGrader: Text area — left:${textLeft} top:${textTop} ` +
      `w:${textWidth} h:${textHeight} dpiScale:${dpiScale.toFixed(3)}`
    );

    // --- Measure paragraph heights with offscreen div ---
    const measureDiv = document.createElement("div");
    measureDiv.style.cssText = `
      position: absolute; top: -99999px; left: -99999px;
      width: ${textWidth}px;
      font-family: "Docs-Roboto", Roboto, Arial, sans-serif;
      font-size: 10.5pt;
      line-height: 1.35;
      word-wrap: break-word; overflow-wrap: break-word;
      white-space: pre-wrap;
      visibility: hidden; padding: 0; margin: 0; border: none;
    `;
    document.body.appendChild(measureDiv);

    const paragraphs = fullText.split("\n");
    const paraMap = [];
    let charOffset = 0;

    for (let i = 0; i < paragraphs.length; i++) {
      const para = paragraphs[i];
      const paraStart = charOffset;
      const paraEnd = charOffset + para.length;

      if (para.trim().length === 0) {
        paraMap.push({ startChar: paraStart, endChar: paraEnd, measuredHeight: 0, isEmpty: true });
      } else {
        measureDiv.textContent = para;
        const h = measureDiv.offsetHeight;
        paraMap.push({ startChar: paraStart, endChar: paraEnd, measuredHeight: h, isEmpty: false });
      }
      charOffset += para.length + 1;
    }
    document.body.removeChild(measureDiv);

    // --- Map measured heights to actual page text area ---
    const totalMeasured = paraMap.reduce((s, p) => s + p.measuredHeight, 0);
    const nonEmpty = paraMap.filter((p) => !p.isEmpty);
    const emptyCount = paraMap.filter((p) => p.isEmpty).length;

    // Google Docs paragraph spacing: default is 0pt before, ~8pt after ≈ 10.67px at 96dpi
    // Empty line: ~1 line height ≈ 18-19px at 96dpi
    const lineH = Math.round(19 * dpiScale);
    const paraSpacing = Math.round(11 * dpiScale);

    // Total estimated content height
    const totalEstimated = totalMeasured + emptyCount * lineH + nonEmpty.length * paraSpacing;

    // Scale: map our estimated total to the actual available text height
    const scale = textHeight > 0 && totalEstimated > 0
      ? textHeight / totalEstimated
      : 1.0;

    // Build Y map — all positions relative to tile manager top
    let y = textTop;
    for (let i = 0; i < paraMap.length; i++) {
      const p = paraMap[i];
      p.yStart = y;
      if (p.isEmpty) {
        p.displayHeight = lineH * scale;
        y += p.displayHeight;
      } else {
        p.displayHeight = p.measuredHeight * scale;
        y += p.displayHeight + paraSpacing * scale;
      }
    }
    const contentEnd = y;

    console.log(
      `EconGrader: Layout — ${paragraphs.length} paras, ` +
      `totalMeasured:${Math.round(totalMeasured)} totalEstimated:${Math.round(totalEstimated)} ` +
      `textHeight:${Math.round(textHeight)} scale:${scale.toFixed(3)} ` +
      `contentEnd:${Math.round(contentEnd)} textBottom:${Math.round(textBottom)}`
    );

    // Ensure tile manager accepts absolute children
    if (tmStyle.position === "static") {
      tileManager.style.position = "relative";
    }

    // --- Place highlights ---
    highlights.forEach((highlight) => {
      // Find paragraph containing the highlight start
      let startPara = null;
      for (const p of paraMap) {
        if (highlight.start >= p.startChar && highlight.start <= p.endChar) {
          startPara = p;
          break;
        }
      }
      if (!startPara || startPara.isEmpty) return;

      // Find paragraph containing the highlight end
      let endPara = startPara;
      for (const p of paraMap) {
        if (highlight.end >= p.startChar && highlight.end <= p.endChar) {
          endPara = p;
          break;
        }
      }

      // Use full paragraph height
      const docY = startPara.yStart;
      let highlightHeight = startPara === endPara
        ? startPara.displayHeight
        : (endPara.yStart + endPara.displayHeight) - startPara.yStart;

      // Don't place beyond text area
      if (docY > textBottom || docY + highlightHeight < textTop) return;
      highlightHeight = Math.max(lineH * scale * 0.8, highlightHeight);

      createCanvasOverlay(textLeft, docY, textWidth, highlightHeight, highlight, tileManager);
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
