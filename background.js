chrome.runtime.onInstalled.addListener(() => {
  console.log('X AI Reply Generator extension installed');
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GENERATE_REPLY') {
    // Using a simple hardcoded response for testing
    sendResponse({ reply: "Thanks for sharing these valuable insights! Looking forward to more discussions! 🙌" });
  }
  return true;
});