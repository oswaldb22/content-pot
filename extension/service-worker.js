// Constants
const APP_URL = "http://localhost:8080"; // Update this with your actual app URL

// Helper function to validate and sanitize URLs
function isValidUrl(url) {
  try {
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

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  try {
    // Validate current tab has a valid URL
    if (!tab.url || !isValidUrl(tab.url)) {
      throw new Error("Invalid or missing URL");
    }

    // Encode the current URL
    const encodedUrl = safeEncodeUrl(tab.url);

    // Construct the target URL
    const targetUrl = `${APP_URL}/add/${encodedUrl}`;

    // Create new tab with the target URL
    try {
      await chrome.tabs.create({ url: targetUrl });
    } catch (e) {
      console.error("Failed to create new tab:", e);
      // Show error badge
      await chrome.action.setBadgeText({ text: "❌" });
      await chrome.action.setBadgeBackgroundColor({ color: "#DC2626" });
      setTimeout(() => chrome.action.setBadgeText({ text: "" }), 3000);
      throw e;
    }

    // Show success badge
    await chrome.action.setBadgeText({ text: "✓" });
    await chrome.action.setBadgeBackgroundColor({ color: "#059669" });
    setTimeout(() => chrome.action.setBadgeText({ text: "" }), 3000);
  } catch (error) {
    console.error("Extension error:", error);
    // Show error badge
    await chrome.action.setBadgeText({ text: "❌" });
    await chrome.action.setBadgeBackgroundColor({ color: "#DC2626" });
    setTimeout(() => chrome.action.setBadgeText({ text: "" }), 3000);
  }
});
