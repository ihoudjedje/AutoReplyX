// Function to extract tweet text from the tweet element
function extractTweetText() {
  try {
    const tweetTextElement = document.querySelector(
      '[data-testid="tweetText"]'
    );
    return tweetTextElement?.textContent || "No tweet text found";
  } catch (error) {
    console.error("Error extracting tweet text:", error);
    return "No tweet text found";
  }
}

// Function to generate a reply using AI via background script
async function generateReply(tweetText) {
  try {
    const response = await chrome.runtime.sendMessage({
      action: "generateReply",
      tweet: tweetText,
    });

    if (response && response.success) {
      return response.reply.trim();
    } else {
      return "AutoX Internal Error";
    }
  } catch (error) {
    console.error("Error generating reply:", error);
    return "AutoX Internal Error";
  }
}

// Flag to prevent multiple triggers
let isProcessing = false;

// Function to insert text at the cursor position
function insertTextAtCursor(inputElement, text) {
  if (!inputElement || !inputElement.isContentEditable || isProcessing)
    return false;

  try {
    isProcessing = true;

    // First insert placeholder
    const placeholder = "...";
    document.execCommand("insertText", false, placeholder);

    // Replace placeholder with response
    const currentText = inputElement.textContent || "";
    if (currentText.includes(placeholder)) {
      // Select all content
      const selection = window.getSelection();
      if (!selection) return false;

      const range = document.createRange();
      range.selectNodeContents(inputElement);
      selection.removeAllRanges();
      selection.addRange(range);

      // Replace placeholder with response
      const updatedText = currentText.replace(placeholder, text);
      document.execCommand("insertText", false, updatedText);

      // Dispatch input event to ensure Twitter registers the change
      inputElement.dispatchEvent(
        new InputEvent("input", {
          bubbles: true,
          cancelable: true,
          inputType: "insertText",
          data: updatedText,
          composed: true,
        })
      );

      return true;
    } else {
      // If placeholder insertion failed, just insert the text directly
      document.execCommand("insertText", false, text);

      inputElement.dispatchEvent(
        new InputEvent("input", {
          bubbles: true,
          cancelable: true,
          inputType: "insertText",
          data: text,
          composed: true,
        })
      );

      return true;
    }
  } catch (error) {
    console.error("Error inserting text:", error);
    return false;
  } finally {
    setTimeout(() => {
      isProcessing = false;
    }, 100);
  }
}

// Function to show toast message
function showToast(message) {
  // Remove existing toast if any
  const existingToast = document.querySelector(".autoreplyx-toast");
  if (existingToast) {
    existingToast.remove();
  }

  // Create toast element
  const toast = document.createElement("div");
  toast.className = "autoreplyx-toast";
  toast.textContent = message;

  // Style the toast
  Object.assign(toast.style, {
    position: "fixed",
    bottom: "-100px", // Start below the viewport
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    color: "white",
    padding: "16px 32px",
    borderRadius: "12px",
    zIndex: "9999",
    fontSize: "16px",
    fontFamily: "system-ui, -apple-system, sans-serif",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
    transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
    minWidth: "300px",
    textAlign: "center",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  });

  // Add to document
  document.body.appendChild(toast);

  // Trigger slide-up animation
  requestAnimationFrame(() => {
    toast.style.bottom = "32px";
  });

  // Remove after 3 seconds with slide-down animation
  setTimeout(() => {
    toast.style.bottom = "-100px";
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

// Handle keyboard shortcut
async function handleKeyboardShortcut(e) {
  // Default keyboard shortcut (Command+X)
  if (e.metaKey && e.key === "x") {
    e.preventDefault(); // Prevent default behavior

    // Make sure we're in an editor
    const activeElement = document.activeElement;
    if (!activeElement || !activeElement.isContentEditable) {
      return;
    }

    // Skip if already processing
    if (isProcessing) return;

    try {
      // Show generating toast
      showToast("Generating reply...");

      // Extract tweet text and generate response
      const tweetText = extractTweetText();
      if (!tweetText || tweetText === "No tweet text found") {
        console.error("No tweet text found to reply to");
        showToast("No tweet found to reply to");
        return;
      }

      // Generate reply and insert at cursor
      const response = await generateReply(tweetText);
      insertTextAtCursor(activeElement, response);

      // Show success toast
      showToast("Reply generated!");
    } catch (error) {
      console.error("Error handling keyboard shortcut:", error);
      showToast("Error generating reply");
    }
  }
}

// Add keyboard shortcut listener
document.addEventListener("keydown", handleKeyboardShortcut);

// Keep a minimal observer to ensure the extension stays active
const observer = new MutationObserver(() => {});
observer.observe(document.body, { childList: true, subtree: true });

// Notify that extension is loaded
console.log(
  "AutoReplyX extension loaded with Command+X (⌘+X) shortcut enabled"
);
