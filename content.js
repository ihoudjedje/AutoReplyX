// Function to extract tweet text from the tweet element
function extractTweetText() {
  try {
    const tweetTextElement = document.querySelector('[data-testid="tweetText"]');
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
      action: 'generateReply',
      tweet: tweetText
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
  if (!inputElement || !inputElement.isContentEditable || isProcessing) return false;

  try {
    isProcessing = true;

    // First insert placeholder
    const placeholder = "...";
    document.execCommand('insertText', false, placeholder);

    // Replace placeholder with response
    const currentText = inputElement.textContent || '';
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
      document.execCommand('insertText', false, updatedText);

      // Dispatch input event to ensure Twitter registers the change
      inputElement.dispatchEvent(new InputEvent('input', {
        bubbles: true,
        cancelable: true,
        inputType: 'insertText',
        data: updatedText,
        composed: true
      }));

      return true;
    } else {
      // If placeholder insertion failed, just insert the text directly
      document.execCommand('insertText', false, text);

      inputElement.dispatchEvent(new InputEvent('input', {
        bubbles: true,
        cancelable: true,
        inputType: 'insertText',
        data: text,
        composed: true
      }));

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

// Handle keyboard shortcut
async function handleKeyboardShortcut(e) {
  // Default keyboard shortcut (Command+X)
  if (e.metaKey && e.key === 'x') {
    e.preventDefault(); // Prevent default behavior

    // Make sure we're in an editor
    const activeElement = document.activeElement;
    if (!activeElement || !activeElement.isContentEditable) {
      return;
    }

    // Skip if already processing
    if (isProcessing) return;

    try {
      // Extract tweet text and generate response
      const tweetText = extractTweetText();
      if (!tweetText || tweetText === "No tweet text found") {
        console.error("No tweet text found to reply to");
        return;
      }

      // Generate reply and insert at cursor
      const response = await generateReply(tweetText);
      insertTextAtCursor(activeElement, response);
    } catch (error) {
      console.error("Error handling keyboard shortcut:", error);
    }
  }
}

// Add keyboard shortcut listener
document.addEventListener('keydown', handleKeyboardShortcut);

// Keep a minimal observer to ensure the extension stays active
const observer = new MutationObserver(() => { });
observer.observe(document.body, { childList: true, subtree: true });

// Notify that extension is loaded
console.log("AutoReplyX extension loaded with Command+X (⌘+X) shortcut enabled");
