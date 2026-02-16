/**
 * EconGrader Chrome Extension — Background Service Worker
 * Routes messages between content script, side panel, and Vercel API backend.
 * API key lives server-side on Vercel — no key needed in the extension.
 *
 * Text extraction strategy (cascading fallbacks):
 *   1. Content script DOM extraction (classic Google Docs rendering)
 *   2. MAIN world fetch via Google Docs export API (has page cookies)
 *   3. Background service worker fetch via export API (host_permissions)
 *   4. MAIN world DOCS_modelChunk parsing (embedded document model)
 */

// ======================== CONFIG ========================
const API_BASE = "https://econ-grader-pro.vercel.app";
// ========================================================

const EMPTY_DIAGRAMS = { found: false, count: 0, types: [], images: [] };

// Open side panel when extension icon is clicked on a Google Doc
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url && tab.url.includes("docs.google.com/document")) {
    await chrome.sidePanel.open({ tabId: tab.id });
  }
});

// Enable side panel only on Google Docs + notify sidepanel on page changes
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (!tab.url) return;
  const isGoogleDoc = tab.url.includes("docs.google.com/document");
  await chrome.sidePanel.setOptions({
    tabId,
    path: "src/sidepanel.html",
    enabled: isGoogleDoc,
  });

  // When the URL changes or page finishes loading on a Google Doc tab,
  // notify the sidepanel to reset and re-extract content
  if (changeInfo.status === "complete" && isGoogleDoc) {
    chrome.runtime.sendMessage({
      type: "TAB_DOC_CHANGED",
      payload: { tabId, url: tab.url },
    }).catch(() => {
      // Sidepanel might not be open — that's fine
    });
  }
});

// When user switches to a different tab, notify sidepanel to reset
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    const isGoogleDoc = tab.url && tab.url.includes("docs.google.com/document");
    chrome.runtime.sendMessage({
      type: "TAB_DOC_CHANGED",
      payload: { tabId: activeInfo.tabId, url: tab.url || "", isGoogleDoc },
    }).catch(() => {});
  } catch (e) {
    // Tab might not exist
  }
});

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "GRADE_ESSAY":
      handleGradeEssay(message.payload)
        .then((result) => sendResponse({ success: true, data: result }))
        .catch((err) => sendResponse({ success: false, error: err.message }));
      return true;

    case "GET_API_BASE":
      chrome.storage.sync.get(["apiBase"], (result) => {
        sendResponse({ apiBase: result.apiBase || API_BASE });
      });
      return true;

    case "SET_API_BASE":
      chrome.storage.sync.set({ apiBase: message.payload }, () => {
        sendResponse({ success: true });
      });
      return true;

    case "EXTRACT_DOC_TEXT":
      handleExtractDocText(sendResponse);
      return true;

    case "APPLY_HIGHLIGHTS":
      forwardToContentScript({ type: "APPLY_HIGHLIGHTS", payload: message.payload }, sendResponse);
      return true;

    case "CLEAR_HIGHLIGHTS":
      forwardToContentScript({ type: "CLEAR_HIGHLIGHTS" }, sendResponse);
      return true;

    case "DETECT_DIAGRAMS":
      forwardToContentScript({ type: "DETECT_DIAGRAMS" }, sendResponse);
      return true;

    case "OPEN_SIDE_PANEL":
      if (sender.tab?.id) {
        chrome.sidePanel.open({ tabId: sender.tab.id });
        sendResponse({ success: true });
      } else {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            chrome.sidePanel.open({ tabId: tabs[0].id });
            sendResponse({ success: true });
          } else {
            sendResponse({ error: "No active tab found" });
          }
        });
      }
      return true;

    default:
      sendResponse({ error: "Unknown message type" });
      return true;
  }
});

// ======================== HELPERS ========================

function forwardToContentScript(message, sendResponse) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
        sendResponse(response || { error: "No response from content script" });
      });
    } else {
      sendResponse({ error: "No active tab found" });
    }
  });
}

function extractDocId(url) {
  const match = (url || "").match(/\/document\/d\/([^/]+)/);
  return match ? match[1] : null;
}

// ======================== GRADING ========================

async function handleGradeEssay(payload) {
  const { essay, question, questionType, diagramInfo, diagramBase64 } = payload;

  if (!essay || !question || !questionType) {
    throw new Error("Missing required fields: essay, question, and questionType");
  }

  const apiBase = await new Promise((resolve) => {
    chrome.storage.sync.get(["apiBase"], (result) => {
      resolve(result.apiBase || API_BASE);
    });
  });

  const response = await fetch(`${apiBase}/api/grade`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      essay,
      question,
      questionType,
      diagramInfo: diagramInfo || "none",
      diagramBase64: diagramBase64 || null,
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || `Server error (${response.status})`);
  }

  return response.json();
}

// ======================== TEXT EXTRACTION (MULTI-METHOD) ========================

/**
 * Master extraction handler — tries multiple methods in order.
 */
function handleExtractDocText(sendResponse) {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    if (!tabs[0]) {
      sendResponse({ text: "", diagrams: EMPTY_DIAGRAMS, error: "No active tab found" });
      return;
    }

    const tab = tabs[0];
    const tabUrl = tab.url || "";
    const docId = extractDocId(tabUrl);

    console.log("EconGrader: Starting text extraction for doc:", docId);

    // ---- Method 1: Content script DOM extraction ----
    try {
      const resp = await sendToTab(tab.id, { type: "EXTRACT_TEXT" });
      if (resp?.text && resp.text.length > 10) {
        console.log("EconGrader: ✓ Method 1 (DOM) succeeded —", resp.text.length, "chars");
        sendResponse(resp);
        return;
      }
      console.log("EconGrader: ✗ Method 1 (DOM) — no text returned");
    } catch (e) {
      console.log("EconGrader: ✗ Method 1 (DOM) failed:", e.message);
    }

    if (!docId) {
      sendResponse({ text: "", diagrams: EMPTY_DIAGRAMS, error: "Could not find document ID in URL" });
      return;
    }

    // ---- Method 2: MAIN world fetch (page context has Google cookies) ----
    try {
      const text = await extractViaMainWorldFetch(tab.id, docId);
      if (text && text.length > 10) {
        console.log("EconGrader: ✓ Method 2 (MAIN world fetch) succeeded —", text.length, "chars");
        sendResponse({ text, diagrams: EMPTY_DIAGRAMS });
        return;
      }
      console.log("EconGrader: ✗ Method 2 (MAIN world fetch) — no text");
    } catch (e) {
      console.log("EconGrader: ✗ Method 2 (MAIN world fetch) failed:", e.message);
    }

    // ---- Method 3: Background service worker fetch (host_permissions) ----
    try {
      const text = await extractViaBackgroundFetch(docId);
      if (text && text.length > 10) {
        console.log("EconGrader: ✓ Method 3 (background fetch) succeeded —", text.length, "chars");
        sendResponse({ text, diagrams: EMPTY_DIAGRAMS });
        return;
      }
      console.log("EconGrader: ✗ Method 3 (background fetch) — no text");
    } catch (e) {
      console.log("EconGrader: ✗ Method 3 (background fetch) failed:", e.message);
    }

    // ---- Method 4: MAIN world model chunk parsing ----
    try {
      const text = await extractViaModelChunks(tab.id);
      if (text && text.length > 10) {
        console.log("EconGrader: ✓ Method 4 (model chunks) succeeded —", text.length, "chars");
        sendResponse({ text, diagrams: EMPTY_DIAGRAMS });
        return;
      }
      console.log("EconGrader: ✗ Method 4 (model chunks) — no text");
    } catch (e) {
      console.log("EconGrader: ✗ Method 4 (model chunks) failed:", e.message);
    }

    // ---- Method 5: MAIN world accessibility / aria text ----
    try {
      const text = await extractViaAccessibility(tab.id);
      if (text && text.length > 10) {
        console.log("EconGrader: ✓ Method 5 (accessibility) succeeded —", text.length, "chars");
        sendResponse({ text, diagrams: EMPTY_DIAGRAMS });
        return;
      }
      console.log("EconGrader: ✗ Method 5 (accessibility) — no text");
    } catch (e) {
      console.log("EconGrader: ✗ Method 5 (accessibility) failed:", e.message);
    }

    // All methods failed
    console.error("EconGrader: ✗✗✗ ALL extraction methods failed");
    sendResponse({
      text: "",
      diagrams: EMPTY_DIAGRAMS,
      error: "Could not extract text. Please ensure the document is open and you are signed in.",
    });
  });
}

/**
 * Send a message to a tab and return a promise.
 */
function sendToTab(tabId, message) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}

/**
 * Method 2: Execute fetch in the page's MAIN world.
 * The page context at docs.google.com has the user's Google auth cookies,
 * so the export API request will be authenticated.
 */
async function extractViaMainWorldFetch(tabId, docId) {
  const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;

  const results = await chrome.scripting.executeScript({
    target: { tabId },
    world: "MAIN",
    args: [exportUrl],
    func: async (url) => {
      try {
        const resp = await fetch(url, { credentials: "include" });
        if (!resp.ok) return { error: `HTTP ${resp.status}` };
        const text = await resp.text();
        return { text };
      } catch (e) {
        return { error: e.message };
      }
    },
  });

  const result = results?.[0]?.result;
  if (result?.error) {
    throw new Error(result.error);
  }

  if (result?.text) {
    return result.text
      .replace(/^\uFEFF/, "")
      .replace(/\r\n/g, "\n")
      .trim();
  }

  return "";
}

/**
 * Method 3: Fetch from background service worker using host_permissions.
 */
async function extractViaBackgroundFetch(docId) {
  const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;

  const response = await fetch(exportUrl, {
    credentials: "include",
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`Export API returned ${response.status}`);
  }

  const text = await response.text();
  return text
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .trim();
}

/**
 * Method 4: Parse DOCS_modelChunk script tags in the MAIN world.
 * Google Docs embeds the document model in <script> tags as encoded data.
 */
async function extractViaModelChunks(tabId) {
  const results = await chrome.scripting.executeScript({
    target: { tabId },
    world: "MAIN",
    func: () => {
      try {
        // Collect all script tags that contain model data
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

        // Strategy A: Look for string values in the model data
        // The model data contains text content as JSON-encoded strings
        const strings = [];

        // Pattern 1: "s":"text content here"
        const sPattern = /"s":"((?:[^"\\]|\\.)*)"/g;
        let match;
        while ((match = sPattern.exec(modelData)) !== null) {
          const decoded = match[1]
            .replace(/\\n/g, "\n")
            .replace(/\\t/g, "\t")
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, "\\")
            .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
              String.fromCharCode(parseInt(hex, 16))
            );
          if (decoded.trim().length > 0) {
            strings.push(decoded);
          }
        }

        if (strings.length > 0) {
          const text = strings.join("");
          if (text.trim().length > 10) return text.trim();
        }

        // Pattern 2: Look for arrays of text content
        // Sometimes the text is in arrays: ["text1","text2",...]
        const arrayPattern = /\["([^"]{5,}(?:","[^"]*)*?)"\]/g;
        const arrayStrings = [];
        while ((match = arrayPattern.exec(modelData)) !== null) {
          const parts = match[0]
            .slice(1, -1)
            .split(",")
            .map((s) => {
              try {
                return JSON.parse(s);
              } catch {
                return "";
              }
            })
            .filter(Boolean);
          arrayStrings.push(...parts);
        }

        if (arrayStrings.length > 0) {
          const text = arrayStrings.join(" ");
          if (text.trim().length > 10) return text.trim();
        }

        return "";
      } catch (e) {
        return "";
      }
    },
  });

  return results?.[0]?.result || "";
}

/**
 * Method 5: Try to extract text via accessibility features in the MAIN world.
 * Google Docs may expose text via ARIA attributes or accessibility tree.
 */
async function extractViaAccessibility(tabId) {
  const results = await chrome.scripting.executeScript({
    target: { tabId },
    world: "MAIN",
    func: () => {
      try {
        const textParts = [];

        // Try 1: Look for aria-label attributes on page elements
        const annotatedElements = document.querySelectorAll(
          "[aria-label]:not([role='button']):not([role='toolbar']):not([role='menubar'])"
        );
        for (const el of annotatedElements) {
          const label = el.getAttribute("aria-label") || "";
          if (label.length > 20 && !label.startsWith("Menu") && !label.startsWith("Toolbar")) {
            textParts.push(label);
          }
        }

        if (textParts.join("").length > 50) {
          return textParts.join("\n").trim();
        }

        // Try 2: Look for role=textbox elements
        const textboxes = document.querySelectorAll('[role="textbox"]');
        for (const tb of textboxes) {
          const text = tb.innerText || tb.textContent || "";
          if (text.trim().length > 10) return text.trim();
        }

        // Try 3: Look for the docs-texteventtarget-iframe
        const iframe = document.querySelector(".docs-texteventtarget-iframe");
        if (iframe) {
          try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (iframeDoc) {
              const text = iframeDoc.body?.innerText || iframeDoc.body?.textContent || "";
              if (text.trim().length > 10) return text.trim();
            }
          } catch (e) {
            // Cross-origin frame — can't access
          }
        }

        // Try 4: Screen reader output elements
        const srElements = document.querySelectorAll(
          ".docs-a11y-ariascreenreader-container, [role='document']"
        );
        for (const el of srElements) {
          const text = el.innerText || el.textContent || "";
          if (text.trim().length > 10) return text.trim();
        }

        // Try 5: Get all visible text from the editor area
        const editorArea = document.querySelector(".kix-appview-editor");
        if (editorArea) {
          // Try to get text from all child elements that might contain text
          const allText = [];
          const walk = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
              const t = node.textContent.trim();
              if (t.length > 0) allText.push(t);
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              // Skip hidden elements
              const style = window.getComputedStyle(node);
              if (style.display === "none" || style.visibility === "hidden") return;
              for (const child of node.childNodes) {
                walk(child);
              }
            }
          };
          walk(editorArea);
          if (allText.join(" ").trim().length > 10) {
            return allText.join(" ").trim();
          }
        }

        return "";
      } catch (e) {
        return "";
      }
    },
  });

  return results?.[0]?.result || "";
}
