/**
 * EconGrader Chrome Extension — Content Script
 * Injected into Google Docs pages.
 * Handles: text extraction, diagram detection, and highlight overlays.
 */

(function () {
  "use strict";

  // =============================================
  // STATE
  // =============================================
  let activeHighlights = [];
  let highlightOverlays = [];
  let observer = null;
  let scrollHandler = null;
  let resizeHandler = null;

  // =============================================
  // TEXT EXTRACTION FROM GOOGLE DOCS
  // =============================================

  /**
   * Extract all text from Google Docs DOM.
   * Google Docs renders text in .kix-lineview elements containing
   * .kix-wordhtmlgenerator-word-node spans.
   */
  function extractDocText() {
    // Method 1: Try kix word nodes (standard Google Docs rendering)
    const wordNodes = document.querySelectorAll(".kix-wordhtmlgenerator-word-node");
    if (wordNodes.length > 0) {
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

    // Method 2: Try line views directly
    const lineViews = document.querySelectorAll(".kix-lineview");
    if (lineViews.length > 0) {
      return Array.from(lineViews)
        .map((lv) => lv.textContent)
        .join("\n")
        .trim();
    }

    // Method 3: Try the content wrapper
    const contentWrapper = document.querySelector(".kix-appview-editor");
    if (contentWrapper) {
      return contentWrapper.textContent.trim();
    }

    // Method 4: Try pages
    const pages = document.querySelectorAll(".kix-page-content-wrapper");
    if (pages.length > 0) {
      return Array.from(pages)
        .map((p) => p.textContent)
        .join("\n\n")
        .trim();
    }

    return "";
  }

  /**
   * Build a map of text positions to DOM nodes for highlighting.
   * Returns an array of { node, text, globalStart, globalEnd } entries.
   */
  function buildTextNodeMap() {
    const entries = [];
    const wordNodes = document.querySelectorAll(".kix-wordhtmlgenerator-word-node");

    if (wordNodes.length === 0) return entries;

    let globalPos = 0;
    let lastLineView = null;

    wordNodes.forEach((node) => {
      const lineView = node.closest(".kix-lineview");
      if (lineView && lineView !== lastLineView) {
        if (lastLineView !== null) globalPos++; // \n
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

  // =============================================
  // DIAGRAM DETECTION
  // =============================================

  /**
   * Detect if the Google Doc contains any diagrams/images.
   * Google Docs embeds images in .kix-embeddedobjectview elements,
   * or as inline images within drawing elements.
   */
  function detectDiagrams() {
    const results = {
      found: false,
      count: 0,
      types: [],
      images: [],
    };

    // Check for embedded objects (images, charts, drawings)
    const embeddedObjects = document.querySelectorAll(".kix-embeddedobjectview");
    if (embeddedObjects.length > 0) {
      results.found = true;
      results.count += embeddedObjects.length;
      results.types.push("embedded-object");
    }

    // Check for inline images
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

    // Check for Google Drawing elements
    const drawings = document.querySelectorAll(".kix-drawingview");
    if (drawings.length > 0) {
      results.found = true;
      results.count += drawings.length;
      results.types.push("drawing");
    }

    // Check text content for diagram references
    const text = extractDocText().toLowerCase();
    const diagramKeywords = [
      "diagram", "figure", "fig.", "graph", "chart", "curve",
      "see above", "see below", "as shown", "illustrated",
    ];
    const hasTextReference = diagramKeywords.some((kw) => text.includes(kw));
    if (hasTextReference) {
      results.textReferencesFound = true;
    }

    return results;
  }

  // =============================================
  // HIGHLIGHT OVERLAY SYSTEM
  // =============================================

  /**
   * Create the overlay container for highlights.
   */
  function getOrCreateOverlayContainer() {
    let container = document.getElementById("econgrader-highlight-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "econgrader-highlight-container";
      container.style.cssText =
        "position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 999;";

      // Insert into the editor area
      const editor =
        document.querySelector(".kix-appview-editor") ||
        document.querySelector(".docs-editor-container") ||
        document.body;
      editor.style.position = editor.style.position || "relative";
      editor.appendChild(container);
    }
    return container;
  }

  /**
   * Find text positions in the DOM and create overlay rectangles.
   */
  function applyHighlightsToDoc(marksEarned, marksLost) {
    clearHighlightsFromDoc();

    const textNodeMap = buildTextNodeMap();
    if (textNodeMap.length === 0) return;

    const fullText = extractDocText();
    const fullTextLower = fullText.toLowerCase();
    const container = getOrCreateOverlayContainer();
    const editorRect = container.parentElement.getBoundingClientRect();

    // Find all highlight positions
    const highlights = [];

    marksEarned.forEach((mark) => {
      if (!mark.quote) return;
      const quoteLower = mark.quote.toLowerCase();
      let idx = fullTextLower.indexOf(quoteLower);
      while (idx !== -1) {
        highlights.push({
          start: idx,
          end: idx + mark.quote.length,
          type: "earned",
          data: mark,
        });
        idx = fullTextLower.indexOf(quoteLower, idx + 1);
      }
    });

    marksLost.forEach((mark) => {
      if (!mark.quote) return;
      const quoteLower = mark.quote.toLowerCase();
      let idx = fullTextLower.indexOf(quoteLower);
      while (idx !== -1) {
        highlights.push({
          start: idx,
          end: idx + mark.quote.length,
          type: "lost",
          data: mark,
        });
        idx = fullTextLower.indexOf(quoteLower, idx + 1);
      }
    });

    // Sort and remove overlaps
    highlights.sort((a, b) => a.start - b.start);
    const nonOverlapping = [];
    let lastEnd = 0;
    for (const h of highlights) {
      if (h.start >= lastEnd) {
        nonOverlapping.push(h);
        lastEnd = h.end;
      }
    }

    // Create overlay elements for each highlight
    nonOverlapping.forEach((highlight) => {
      // Find the DOM nodes that contain this text range
      const ranges = findDOMRangesForTextRange(textNodeMap, highlight.start, highlight.end);

      ranges.forEach((rangeInfo) => {
        try {
          const range = document.createRange();
          const textNode = findTextNodeInElement(rangeInfo.node);
          if (!textNode) return;

          const nodeOffset = highlight.start - rangeInfo.nodeStart;
          const startInNode = Math.max(0, nodeOffset);
          const endInNode = Math.min(
            textNode.length,
            startInNode + (highlight.end - highlight.start)
          );

          if (startInNode >= textNode.length || endInNode <= startInNode) return;

          range.setStart(textNode, startInNode);
          range.setEnd(textNode, endInNode);

          const rects = range.getClientRects();
          for (const rect of rects) {
            const overlay = document.createElement("div");
            overlay.className = `econgrader-overlay econgrader-overlay-${highlight.type}`;
            overlay.style.cssText = `
              position: fixed;
              left: ${rect.left}px;
              top: ${rect.top}px;
              width: ${rect.width}px;
              height: ${rect.height}px;
              pointer-events: auto;
              cursor: pointer;
              transition: opacity 0.2s;
              border-radius: 2px;
              z-index: 1000;
            `;

            if (highlight.type === "earned") {
              overlay.style.backgroundColor = "rgba(74, 139, 127, 0.15)";
              overlay.style.borderBottom = "2px solid rgba(74, 139, 127, 0.5)";
            } else {
              overlay.style.backgroundColor = "rgba(191, 107, 107, 0.15)";
              overlay.style.borderBottom = "2px solid rgba(191, 107, 107, 0.5)";
            }

            overlay.dataset.type = highlight.type;
            overlay.dataset.highlightData = JSON.stringify(highlight.data);

            overlay.addEventListener("click", (e) => {
              e.stopPropagation();
              chrome.runtime.sendMessage({
                type: "HIGHLIGHT_CLICKED",
                payload: {
                  highlightType: highlight.type,
                  data: highlight.data,
                },
              });
            });

            overlay.addEventListener("mouseenter", () => {
              overlay.style.opacity = "0.8";
            });
            overlay.addEventListener("mouseleave", () => {
              overlay.style.opacity = "1";
            });

            document.body.appendChild(overlay);
            highlightOverlays.push(overlay);
          }
        } catch (e) {
          // Skip this range if DOM manipulation fails
          console.debug("EconGrader: Skipping highlight range", e);
        }
      });
    });

    activeHighlights = nonOverlapping;

    // Set up scroll/resize handlers to reposition overlays
    setupRepositionHandlers(marksEarned, marksLost);
  }

  /**
   * Find DOM ranges that correspond to a text range in the full document.
   */
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

  /**
   * Find the first text node within an element.
   */
  function findTextNodeInElement(element) {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    return walker.nextNode();
  }

  /**
   * Clear all highlight overlays from the document.
   */
  function clearHighlightsFromDoc() {
    highlightOverlays.forEach((el) => el.remove());
    highlightOverlays = [];
    activeHighlights = [];

    // Clean up handlers
    if (scrollHandler) {
      document.removeEventListener("scroll", scrollHandler, true);
      scrollHandler = null;
    }
    if (resizeHandler) {
      window.removeEventListener("resize", resizeHandler);
      resizeHandler = null;
    }
  }

  /**
   * Set up handlers to reposition overlays on scroll/resize.
   * Uses debouncing to avoid performance issues.
   */
  function setupRepositionHandlers(marksEarned, marksLost) {
    let timeout;
    const reposition = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        // Re-apply highlights (they use fixed positioning based on client rects)
        clearHighlightsFromDoc();
        applyHighlightsToDoc(marksEarned, marksLost);
      }, 150);
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
        const text = extractDocText();
        const diagrams = detectDiagrams();
        sendResponse({ text, diagrams });
        break;
      }

      case "APPLY_HIGHLIGHTS": {
        const { marksEarned, marksLost } = message.payload;
        applyHighlightsToDoc(marksEarned || [], marksLost || []);
        sendResponse({ success: true, count: highlightOverlays.length });
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

  // Wait for Google Docs to fully render, then inject FAB
  function init() {
    const checkReady = setInterval(() => {
      const editor = document.querySelector(".kix-appview-editor");
      if (editor) {
        clearInterval(checkReady);
        injectFAB();
        console.log("EconGrader: Content script initialized");
      }
    }, 500);

    // Give up after 30 seconds
    setTimeout(() => clearInterval(checkReady), 30000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
