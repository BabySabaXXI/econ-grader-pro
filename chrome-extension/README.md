# EconGrader for Google Docs — Chrome Extension

A Chrome extension that brings EconGrader's AI-powered essay grading directly into Google Docs. Grade Edexcel IAL Economics essays with inline highlighting, AO breakdowns, diagram detection, and push-to-review — without leaving your document.

## Architecture

```
chrome-extension/          # Chrome Extension (client)
  manifest.json            # Manifest V3
  src/
    background.js          # Service worker — routes to Vercel API
    content.js             # Injected into Google Docs — text extraction, highlights
    content.css            # Overlay and FAB styles
    sidepanel.html/css/js  # Side panel grading UI
    popup.html             # Settings popup
    lib/constants.js       # Question types, mark schemes
  icons/                   # Extension icons

econgrader-docs-api/       # Vercel API Backend (separate deployment)
  api/grade.js             # POST /api/grade — grading endpoint
  api/health.js            # GET /api/health — health check
  lib/constants.js         # Mark schemes
  lib/prompts.js           # Claude grading prompts
  vercel.json              # Vercel config with CORS
  package.json
```

## Setup

### 1. Deploy the API Backend

```bash
cd econgrader-docs-api
npm install
vercel --prod
```

Set the `ANTHROPIC_API_KEY` environment variable in your Vercel project settings.

### 2. Update the Extension Config

In `chrome-extension/src/background.js`, update `API_BASE` to your deployed URL:

```js
const API_BASE = "https://your-project.vercel.app";
```

### 3. Load the Chrome Extension

1. Open Chrome → `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `chrome-extension/` directory
5. Navigate to any Google Doc — you'll see the "Grade" FAB button

### 4. Generate Icons (Optional)

Open `chrome-extension/icons/generate-icons.html` in a browser, right-click each canvas, and save as `icon16.png`, `icon48.png`, `icon128.png`.

## Features

- **Auto-extract** essay text from Google Docs
- **AI grading** with Edexcel IAL mark schemes (AO1-AO4)
- **Inline highlights** — green (marks earned) / red (issues) overlaid on the doc
- **Diagram detection** — scans doc for images/drawings, prompts upload if missing
- **Score breakdown** — animated AO bars, level badge, examiner comment
- **Detailed feedback** — collapsible earned/lost items with fix suggestions
- **Push to review** — copy report, email to teacher, or download as file
- **Highlight controls** — toggle All / Earned / Issues / Off

## How It Works

1. Open a Google Doc with your economics essay
2. Click the "Grade" button (bottom-right) or the extension icon
3. Enter the question and select the mark allocation
4. The AI grades against the Edexcel mark scheme
5. Highlights appear on your document; full results in the side panel
6. Push feedback to a reviewer or download the report
