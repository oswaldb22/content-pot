// Constants
const APP_URL = "http://localhost:8080"; // Update this with your actual app URL

// Helper function to validate and sanitize URLs
function isValidUrl(url) {
  try {
    if (url.startsWith(APP_URL)) {
      return false;
    }
    new URL(url);
    return true;
  } catch (e) {
    console.error("Invalid URL:", e);
    return false;
  }
}

// Helper function to encode URL safely
function safeEncodeUrl(url) {
  try {
    // First try to decode in case it's already encoded to avoid double encoding
    const decodedUrl = decodeURIComponent(url);
    return encodeURIComponent(decodedUrl);
  } catch (e) {
    // If decoding fails, encode the original URL
    return encodeURIComponent(url);
  }
}

// show duccess badge
function showSuccessBadge() {
  chrome.action.setBadgeText({ text: "✓" });
  chrome.action.setBadgeBackgroundColor({ color: "#10B981" });
  setTimeout(() => chrome.action.setBadgeText({ text: "" }), 3000);
}

// Track background tabs created by the extension
const backgroundTabs = new Set();

// Listen for tab updates to handle navigation completion
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (backgroundTabs.has(tabId) && changeInfo.status === "complete") {
    // Check if the tab has navigated back to the app URL
    if (tab.url && tab.url === APP_URL + "/") {
      // Remove from tracking set and close the tab
      backgroundTabs.delete(tabId);
      chrome.tabs.remove(tabId).catch(console.error);
      showSuccessBadge();
    }
  }
});

// Clean up if a background tab is closed manually
chrome.tabs.onRemoved.addListener((tabId) => {
  backgroundTabs.delete(tabId);
});

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  try {
    // Show loading state immediately
    await chrome.action.setBadgeText({ text: "..." });
    await chrome.action.setBadgeBackgroundColor({ color: "#3B82F6" });

    // Validate current tab has a valid URL
    if (!tab.url || !isValidUrl(tab.url)) {
      throw new Error("Invalid or missing URL");
    }

    // Encode the current URL
    const encodedUrl = safeEncodeUrl(tab.url);

    // Construct the target URL
    const targetUrl = `${APP_URL}/add/${encodedUrl}`;

    // Create new tab with the target URL in the background
    try {
      const newTab = await chrome.tabs.create({
        url: targetUrl,
        active: false, // Create in background without focusing
      });
      // Add to tracking set
      backgroundTabs.add(newTab.id);
    } catch (e) {
      console.error("Failed to create new tab:", e);
      // Show error badge
      await chrome.action.setBadgeText({ text: "❌" });
      await chrome.action.setBadgeBackgroundColor({ color: "#DC2626" });
      setTimeout(() => chrome.action.setBadgeText({ text: "" }), 3000);
      throw e;
    }
  } catch (error) {
    console.error("Extension error:", error);
    // Show error badge
    await chrome.action.setBadgeText({ text: "❌" });
    await chrome.action.setBadgeBackgroundColor({ color: "#DC2626" });
    setTimeout(() => chrome.action.setBadgeText({ text: "" }), 3000);
  }
});
