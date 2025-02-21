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

// Helper function to normalize URL for consistent comparison
function normalizeUrl(url) {
  try {
    const urlObj = new URL(url);
    // Remove trailing slashes and convert to lowercase
    return (
      urlObj.origin.toLowerCase() +
      urlObj.pathname.toLowerCase().replace(/\/$/, "")
    );
  } catch (e) {
    console.error("URL normalization failed:", e);
    return url.toLowerCase();
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

// Check if URL exists in localStorage
async function checkUrlInStorage(url) {
  try {
    const normalizedUrl = normalizeUrl(url);
    const storageData = await chrome.storage.local.get(null);
    const urls = Object.values(storageData).flat();
    return urls.some((item) => normalizeUrl(item.url) === normalizedUrl);
  } catch (e) {
    console.error("Storage check failed:", e);
    return false;
  }
}

// Update extension icon based on URL status
async function updateIcon(tabId, url) {
  if (!url || !isValidUrl(url)) {
    await chrome.action.setBadgeText({ text: "" });
    return;
  }

  const exists = await checkUrlInStorage(url);
  if (exists) {
    await chrome.action.setBadgeText({ text: "✓" });
    await chrome.action.setBadgeBackgroundColor({ color: "#10B981" });
  } else {
    await chrome.action.setBadgeText({ text: "" });
  }
}

// Show success badge
function showSuccessBadge() {
  chrome.action.setBadgeText({ text: "✓" });
  chrome.action.setBadgeBackgroundColor({ color: "#10B981" });
  // setTimeout(() => chrome.action.setBadgeText({ text: "" }), 3000);
}

// Track background tabs created by the extension
const backgroundTabs = new Set();
const tabUrlMap = new Map();

// Listen for tab updates to handle navigation completion and URL changes
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Handle background tabs created by the extension
  if (backgroundTabs.has(tabId) && changeInfo.status === "complete") {
    if (tab.url && tab.url === APP_URL + "/") {
      backgroundTabs.delete(tabId);
      chrome.tabs.remove(tabId).catch(console.error);

      // add it to the local storage
      const url = tabUrlMap.get(tabId);
      if (!url) {
        console.error("URL not found for tab:", tabId);
        return;
      }
      const storageData = await chrome.storage.local.get(null);
      const urls = Object.values(storageData).flat();
      const newUrls = [...urls, { url }];
      await chrome.storage.local.set({ urls: newUrls });

      showSuccessBadge();
    }
  }

  // Only update icon for active tab when URL changes or page loads
  const activeTab = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (
    activeTab[0]?.id === tabId &&
    (changeInfo.url || changeInfo.status === "complete")
  ) {
    await updateIcon(tabId, tab.url);
  }
});

// Listen for tab activation to update icon
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  await updateIcon(activeInfo.tabId, tab.url);
});

// Clean up if a background tab is closed manually
chrome.tabs.onRemoved.addListener((tabId) => {
  backgroundTabs.delete(tabId);
});

// Handle storage changes to update icon only for active tab
chrome.storage.onChanged.addListener(async (changes, namespace) => {
  if (namespace === "local") {
    const [activeTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (activeTab) {
      await updateIcon(activeTab.id, activeTab.url);
    }
  }
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

    if (await checkUrlInStorage(tab.url)) {
      console.log("URL already exists in storage");
      showSuccessBadge();
      return;
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
      tabUrlMap.set(newTab.id, tab.url);
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
