/**
 * EconGrader Chrome Extension — Background Service Worker (Arc / Chromium compatible)
 * Routes messages between content script, grading panel, and Vercel API backend.
 * Uses chrome.windows.create() popup panel instead of chrome.sidePanel (not supported in Arc).
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

// Track the panel window so we can reuse / detect it
let panelWindowId = null;
// Track which Google Doc tab the panel was opened from
let sourceTabId = null;

// ======================== PANEL WINDOW MANAGEMENT ========================

/**
 * Open the grading panel as a popup window positioned to the right of the screen.
 * Reuses existing panel window if one is already open.
 */
async function openPanelWindow(docTabId) {
  sourceTabId = docTabId;

  // If panel is already open, focus it
  if (panelWindowId !== null) {
    try {
      const win = await chrome.windows.get(panelWindowId);
      if (win) {
        await chrome.windows.update(panelWindowId, { focused: true });
        // Notify panel about the (possibly new) doc tab
        chrome.runtime.sendMessage({
          type: "TAB_DOC_CHANGED",
          payload: { tabId: docTabId },
        }).catch(() => {});
        return;
      }
    } catch (e) {
      // Window no longer exists
      panelWindowId = null;
    }
  }

  // Get screen dimensions to position panel on the right
  const currentWindow = await chrome.windows.getCurrent();
  const panelWidth = 400;
  const panelHeight = currentWindow.height || 800;
  const panelLeft = (currentWindow.left || 0) + (currentWindow.width || 1200) - panelWidth - 10;
  const panelTop = currentWindow.top || 0;

  const panelWindow = await chrome.windows.create({
    url: chrome.runtime.getURL("src/sidepanel.html"),
    type: "popup",
    width: panelWidth,
    height: panelHeight,
    left: panelLeft,
    top: panelTop,
  });

  panelWindowId = panelWindow.id;
}

// Clean up when panel window is closed
chrome.windows.onRemoved.addListener((windowId) => {
  if (windowId === panelWindowId) {
    panelWindowId = null;
  }
});

// When a Google Doc page finishes loading, notify panel if open
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (!tab.url) return;
  const isGoogleDoc = tab.url.includes("docs.google.com/document");

  if (changeInfo.status === "complete" && isGoogleDoc) {
    sourceTabId = tabId;
    chrome.runtime.sendMessage({
      type: "TAB_DOC_CHANGED",
      payload: { tabId, url: tab.url },
    }).catch(() => {});
  }
});

// When user switches tabs, notify panel
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    const isGoogleDoc = tab.url && tab.url.includes("docs.google.com/document");

    if (isGoogleDoc) {
      sourceTabId = activeInfo.tabId;
      chrome.runtime.sendMessage({
        type: "TAB_DOC_CHANGED",
        payload: { tabId: activeInfo.tabId, url: tab.url },
      }).catch(() => {});
    } else {
      chrome.runtime.sendMessage({
        type: "TAB_LEFT_DOC",
      }).catch(() => {});
    }
  } catch (e) {
    // Tab might not exist
  }
});

// ======================== MESSAGE HANDLER ========================

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
      forwardToDocTab({ type: "APPLY_HIGHLIGHTS", payload: message.payload }, sendResponse);
      return true;

    case "CLEAR_HIGHLIGHTS":
      forwardToDocTab({ type: "CLEAR_HIGHLIGHTS" }, sendResponse);
      return true;

    case "DETECT_DIAGRAMS":
      forwardToDocTab({ type: "DETECT_DIAGRAMS" }, sendResponse);
      return true;

    case "OPEN_PANEL":
      // Open grading panel window
      (async () => {
        try {
          const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
          const docTab = tabs.find(t => t.url && t.url.includes("docs.google.com/document"));
          if (docTab) {
            await openPanelWindow(docTab.id);
            sendResponse({ success: true });
          } else if (tabs[0]) {
            // Try opening anyway with current tab
            await openPanelWindow(tabs[0].id);
            sendResponse({ success: true });
          } else {
            sendResponse({ error: "No active tab found" });
          }
        } catch (e) {
          sendResponse({ error: e.message });
        }
      })();
      return true;

    case "GET_SOURCE_TAB":
      // Panel asks which tab to extract from
      sendResponse({ tabId: sourceTabId });
      return true;

    default:
      sendResponse({ error: "Unknown message type" });
      return true;
  }
});

// ======================== HELPERS ========================

/**
 * Forward a message to the Google Doc tab (not the panel window).
 * Uses sourceTabId to find the correct doc tab.
 */
function forwardToDocTab(message, sendResponse) {
  if (sourceTabId) {
    chrome.tabs.sendMessage(sourceTabId, message, (response) => {
      if (chrome.runtime.lastError) {
        // Fallback: try active tab in last focused window
        forwardToActiveDocTab(message, sendResponse);
      } else {
        sendResponse(response || { error: "No response from content script" });
      }
    });
  } else {
    forwardToActiveDocTab(message, sendResponse);
  }
}

function forwardToActiveDocTab(message, sendResponse) {
  chrome.tabs.query({ url: "https://docs.google.com/document/*" }, (tabs) => {
    if (tabs && tabs.length > 0) {
      // Use the most recently active Google Doc tab
      const tab = tabs[0];
      sourceTabId = tab.id;
      chrome.tabs.sendMessage(tab.id, message, (response) => {
        sendResponse(response || { error: "No response from content script" });
      });
    } else {
      sendResponse({ error: "No Google Doc tab found" });
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
 * In Arc version, we find the Google Doc tab explicitly instead of relying on "active tab".
 */
function handleExtractDocText(sendResponse) {
  // First try sourceTabId, then fall back to querying for a Google Doc tab
  const findDocTab = (callback) => {
    if (sourceTabId) {
      chrome.tabs.get(sourceTabId, (tab) => {
        if (chrome.runtime.lastError || !tab || !tab.url || !tab.url.includes("docs.google.com/document")) {
          // sourceTabId is stale, search for a doc tab
          chrome.tabs.query({ url: "https://docs.google.com/document/*" }, (tabs) => {
            if (tabs && tabs.length > 0) {
              sourceTabId = tabs[0].id;
              callback(tabs[0]);
            } else {
              callback(null);
            }
          });
        } else {
          callback(tab);
        }
      });
    } else {
      chrome.tabs.query({ url: "https://docs.google.com/document/*" }, (tabs) => {
        if (tabs && tabs.length > 0) {
          sourceTabId = tabs[0].id;
          callback(tabs[0]);
        } else {
          // Last resort: try active tab
          chrome.tabs.query({ active: true, lastFocusedWindow: true }, (activeTabs) => {
            callback(activeTabs?.[0] || null);
          });
        }
      });
    }
  };

  findDocTab(async (tab) => {
    if (!tab) {
      sendResponse({ text: "", diagrams: EMPTY_DIAGRAMS, error: "No Google Doc tab found" });
      return;
    }

    const tabUrl = tab.url || "";
    const docId = extractDocId(tabUrl);

    console.log("EconGrader: Starting text extraction for doc:", docId);

    // ---- Method 1: Content script DOM extraction ----
    try {
      const resp = await sendToTab(tab.id, { type: "EXTRACT_TEXT" });
      if (resp?.text && resp.text.length > 10) {
        console.log("EconGrader: Method 1 (DOM) succeeded —", resp.text.length, "chars");
        sendResponse(resp);
        return;
      }
    } catch (e) {
      console.log("EconGrader: Method 1 (DOM) failed:", e.message);
    }

    if (!docId) {
      sendResponse({ text: "", diagrams: EMPTY_DIAGRAMS, error: "Could not find document ID in URL" });
      return;
    }

    // ---- Method 2: MAIN world fetch (page context has Google cookies) ----
    try {
      const text = await extractViaMainWorldFetch(tab.id, docId);
      if (text && text.length > 10) {
        console.log("EconGrader: Method 2 (MAIN world fetch) succeeded —", text.length, "chars");
        sendResponse({ text, diagrams: EMPTY_DIAGRAMS });
        return;
      }
    } catch (e) {
      console.log("EconGrader: Method 2 (MAIN world fetch) failed:", e.message);
    }

    // ---- Method 3: Background service worker fetch (host_permissions) ----
    try {
      const text = await extractViaBackgroundFetch(docId);
      if (text && text.length > 10) {
        console.log("EconGrader: Method 3 (background fetch) succeeded —", text.length, "chars");
        sendResponse({ text, diagrams: EMPTY_DIAGRAMS });
        return;
      }
    } catch (e) {
      console.log("EconGrader: Method 3 (background fetch) failed:", e.message);
    }

    // ---- Method 4: MAIN world model chunk parsing ----
    try {
      const text = await extractViaModelChunks(tab.id);
      if (text && text.length > 10) {
        console.log("EconGrader: Method 4 (model chunks) succeeded —", text.length, "chars");
        sendResponse({ text, diagrams: EMPTY_DIAGRAMS });
        return;
      }
    } catch (e) {
      console.log("EconGrader: Method 4 (model chunks) failed:", e.message);
    }

    // ---- Method 5: MAIN world accessibility / aria text ----
    try {
      const text = await extractViaAccessibility(tab.id);
      if (text && text.length > 10) {
        console.log("EconGrader: Method 5 (accessibility) succeeded —", text.length, "chars");
        sendResponse({ text, diagrams: EMPTY_DIAGRAMS });
        return;
      }
    } catch (e) {
      console.log("EconGrader: Method 5 (accessibility) failed:", e.message);
    }

    // All methods failed
    console.error("EconGrader: ALL extraction methods failed");
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
  if (result?.error) throw new Error(result.error);
  if (result?.text) {
    return result.text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").trim();
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

  if (!response.ok) throw new Error(`Export API returned ${response.status}`);

  const text = await response.text();
  return text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").trim();
}

/**
 * Method 4: Parse DOCS_modelChunk script tags in the MAIN world.
 */
async function extractViaModelChunks(tabId) {
  const results = await chrome.scripting.executeScript({
    target: { tabId },
    world: "MAIN",
    func: () => {
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

        const strings = [];
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
          if (decoded.trim().length > 0) strings.push(decoded);
        }

        if (strings.length > 0) {
          const text = strings.join("");
          if (text.trim().length > 10) return text.trim();
        }

        const arrayPattern = /\["([^"]{5,}(?:","[^"]*)*?)"\]/g;
        const arrayStrings = [];
        while ((match = arrayPattern.exec(modelData)) !== null) {
          const parts = match[0]
            .slice(1, -1)
            .split(",")
            .map((s) => { try { return JSON.parse(s); } catch { return ""; } })
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
 */
async function extractViaAccessibility(tabId) {
  const results = await chrome.scripting.executeScript({
    target: { tabId },
    world: "MAIN",
    func: () => {
      try {
        const textParts = [];

        const annotatedElements = document.querySelectorAll(
          "[aria-label]:not([role='button']):not([role='toolbar']):not([role='menubar'])"
        );
        for (const el of annotatedElements) {
          const label = el.getAttribute("aria-label") || "";
          if (label.length > 20 && !label.startsWith("Menu") && !label.startsWith("Toolbar")) {
            textParts.push(label);
          }
        }

        if (textParts.join("").length > 50) return textParts.join("\n").trim();

        const textboxes = document.querySelectorAll('[role="textbox"]');
        for (const tb of textboxes) {
          const text = tb.innerText || tb.textContent || "";
          if (text.trim().length > 10) return text.trim();
        }

        const iframe = document.querySelector(".docs-texteventtarget-iframe");
        if (iframe) {
          try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (iframeDoc) {
              const text = iframeDoc.body?.innerText || iframeDoc.body?.textContent || "";
              if (text.trim().length > 10) return text.trim();
            }
          } catch (e) {}
        }

        const srElements = document.querySelectorAll(
          ".docs-a11y-ariascreenreader-container, [role='document']"
        );
        for (const el of srElements) {
          const text = el.innerText || el.textContent || "";
          if (text.trim().length > 10) return text.trim();
        }

        const editorArea = document.querySelector(".kix-appview-editor");
        if (editorArea) {
          const allText = [];
          const walk = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
              const t = node.textContent.trim();
              if (t.length > 0) allText.push(t);
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              const style = window.getComputedStyle(node);
              if (style.display === "none" || style.visibility === "hidden") return;
              for (const child of node.childNodes) walk(child);
            }
          };
          walk(editorArea);
          if (allText.join(" ").trim().length > 10) return allText.join(" ").trim();
        }

        return "";
      } catch (e) {
        return "";
      }
    },
  });

  return results?.[0]?.result || "";
}
