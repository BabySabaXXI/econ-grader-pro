/**
 * EconGrader Chrome Extension — Background Service Worker
 * Routes messages between content script, side panel, and Vercel API backend.
 * API key lives server-side on Vercel — no key needed in the extension.
 */

// ======================== CONFIG ========================
// Set this to your Vercel deployment URL after deploying econgrader-docs-api
const API_BASE = "https://econgrader-docs-api.vercel.app";
// ========================================================

// Open side panel when extension icon is clicked on a Google Doc
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url && tab.url.includes("docs.google.com/document")) {
    await chrome.sidePanel.open({ tabId: tab.id });
  }
});

// Enable side panel only on Google Docs
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (!tab.url) return;
  const isGoogleDoc = tab.url.includes("docs.google.com/document");
  await chrome.sidePanel.setOptions({
    tabId,
    path: "src/sidepanel.html",
    enabled: isGoogleDoc,
  });
});

// Message handler — routes messages between content script, side panel, and API
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "GRADE_ESSAY":
      handleGradeEssay(message.payload)
        .then((result) => sendResponse({ success: true, data: result }))
        .catch((err) => sendResponse({ success: false, error: err.message }));
      return true;

    case "GET_API_BASE":
      // Let side panel know the configured API base URL
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
      forwardToContentScript(sender, { type: "EXTRACT_TEXT" }, sendResponse);
      return true;

    case "APPLY_HIGHLIGHTS":
      forwardToContentScript(sender, {
        type: "APPLY_HIGHLIGHTS",
        payload: message.payload,
      }, sendResponse);
      return true;

    case "CLEAR_HIGHLIGHTS":
      forwardToContentScript(sender, { type: "CLEAR_HIGHLIGHTS" }, sendResponse);
      return true;

    case "DETECT_DIAGRAMS":
      forwardToContentScript(sender, { type: "DETECT_DIAGRAMS" }, sendResponse);
      return true;

    case "OPEN_SIDE_PANEL":
      if (sender.tab?.id) {
        chrome.sidePanel.open({ tabId: sender.tab.id });
      }
      sendResponse({ success: true });
      return true;

    default:
      sendResponse({ error: "Unknown message type" });
      return true;
  }
});

/**
 * Forward a message to the content script in the active Google Docs tab.
 */
function forwardToContentScript(sender, message, sendResponse) {
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

/**
 * Grade an essay by calling the Vercel API backend.
 */
async function handleGradeEssay(payload) {
  const { essay, question, questionType, diagramInfo, diagramBase64 } = payload;

  if (!essay || !question || !questionType) {
    throw new Error("Missing required fields: essay, question, and questionType");
  }

  // Get the API base URL (user-configurable)
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
