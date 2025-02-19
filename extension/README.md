# Article Bundle Chrome Extension

This Chrome extension allows you to quickly add articles to your Article Bundle collection by capturing the current tab's URL.

## Features

- One-click URL capture and add to Article Bundle
- Visual feedback for successful/failed operations
- Robust error handling for invalid URLs
- Handles special characters and long URLs gracefully
- Works with various URL formats including query parameters and fragments

## Installation

1. Download or clone this extension directory
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory
5. The Article Bundle extension icon should now appear in your Chrome toolbar

## Usage

1. Navigate to any webpage you want to add to your Article Bundle
2. Click the Article Bundle extension icon in the toolbar
3. A new tab will open with the article being added to your collection
4. Look for the checkmark badge on the extension icon for confirmation

## Development

The extension is built using Chrome's Manifest V3 specifications and includes:

- Service worker for background processing
- URL validation and sanitization
- Visual feedback system
- Error handling for network failures and invalid URLs

### Files Structure

```
extension/
├── manifest.json        # Extension configuration
├── service-worker.js   # Background service worker
└── icons/              # Extension icons
    ├── icon16.png      # 16x16 icon
    ├── icon48.png      # 48x48 icon
    └── icon128.png     # 128x128 icon
```

## Configuration

Update the `APP_URL` constant in `service-worker.js` to match your Article Bundle installation:

```javascript
const APP_URL = "http://localhost:5173"; // Change this to your app URL
```

## Error Handling

The extension provides visual feedback through badge icons:

- ✓ (green) = Success
- ❌ (red) = Error

Error cases handled:

- Invalid URLs
- Network failures
- Missing permissions
- Already encoded URLs
- Special characters
- Long URLs
