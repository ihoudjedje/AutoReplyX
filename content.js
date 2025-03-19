// Function to extract tweet text from the tweet element
function extractTweetText() {
  const tweetTextElement = document.querySelector('[data-testid="tweetText"]').innerText;
  return tweetTextElement;
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
    return "AutoX Internal Error";
  }
}

// Function to find and focus the reply input field
function focusReplyInput() {
  // Try multiple possible selectors for the reply input, from most specific to least specific
  const selectors = [
    '.DraftEditor-root .notranslate.public-DraftEditor-content[contenteditable="true"][role="textbox"]',
    '.public-DraftEditor-content[contenteditable="true"][role="textbox"]',
    '.DraftEditor-root [contenteditable="true"]',
    '[data-testid="tweetTextarea_0"]'
  ];

  for (const selector of selectors) {
    const replyInput = document.querySelector(selector);
    if (replyInput) {
      replyInput.focus();
      return replyInput;
    }
  }

  return null;
}

// Flag to prevent multiple triggers
let isProcessing = false;

// Function to set text in the input field
function setReplyText(inputElement, text) {
  if (inputElement && !isProcessing) {
    try {
      isProcessing = true;

      // Use execCommand to modify the content in a way that the editor will recognize
      const selection = window.getSelection();
      const range = document.createRange();

      // First, select the entire content
      range.selectNodeContents(inputElement);
      selection.removeAllRanges();
      selection.addRange(range);

      // Get current text and find the position of "autox"
      const currentText = inputElement.textContent || '';
      const autoxIndex = currentText.toLowerCase().indexOf('autox');

      if (autoxIndex >= 0) {
        // Create a range that only selects "autox"
        const autoxRange = document.createRange();
        let textNode = null;

        // Find the text node containing "autox"
        for (let i = 0; i < inputElement.childNodes.length; i++) {
          const node = inputElement.childNodes[i];
          if (node.nodeType === Node.TEXT_NODE && node.textContent.toLowerCase().includes('autox')) {
            textNode = node;
            break;
          }
        }

        if (textNode) {
          const nodeText = textNode.textContent;
          const nodeAutoxIndex = nodeText.toLowerCase().indexOf('autox');

          // Create a range selecting just the "autox" text
          autoxRange.setStart(textNode, nodeAutoxIndex);
          autoxRange.setEnd(textNode, nodeAutoxIndex + 5); // "autox" is 5 characters

          // Select just the "autox" text
          selection.removeAllRanges();
          selection.addRange(autoxRange);

          // Replace the selected text with our LLM response
          document.execCommand('insertText', false, text);
        } else {
          // Fallback if we can't find the text node
          const cleanText = currentText.replace(/autox/i, text);
          document.execCommand('insertText', false, cleanText);
        }
      } else {
        // If "autox" isn't found, just append the text
        document.execCommand('insertText', false, text);
      }

      // Dispatch native input event to ensure Twitter's listeners catch it
      const inputEvent = new InputEvent('input', {
        bubbles: true,
        cancelable: true,
        inputType: 'insertText',
        data: text,
        composed: true
      });

      // Fire the event
      inputElement.dispatchEvent(inputEvent);

      // Blur and refocus to ensure Twitter registers the change
      inputElement.blur();
      setTimeout(() => {
        inputElement.focus();
      }, 10);

    } finally {
      setTimeout(() => {
        isProcessing = false;
      }, 100);
    }
  }
}

// Function to handle text changes
async function handleTextChange(element) {
  if (isProcessing) return; // Skip if already processing

  const text = element.textContent || '';
  if (text.toLowerCase().includes('autox')) {
    const tweetText = extractTweetText();
    if (tweetText) {
      const response = await generateReply(tweetText);
      setReplyText(element, response);
    }
  }
}

// Watch for input changes in any editable content
const observer = new MutationObserver((mutations) => {
  if (isProcessing) return; // Skip if already processing

  mutations.forEach(mutation => {
    // Check if this is a text change in a contenteditable element
    if (mutation.type === 'characterData') {
      const element = mutation.target.parentElement;
      if (element && element.closest('.public-DraftEditor-content[contenteditable="true"]')) {
        handleTextChange(element);
      }
    }
    // Also check for childList changes (for when text is pasted or modified in chunks)
    else if (mutation.type === 'childList') {
      const element = mutation.target.closest('.public-DraftEditor-content[contenteditable="true"]');
      if (element) {
        handleTextChange(element);
      }
    }
  });
});

// Start observing with configuration to watch for text changes
observer.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true,
  characterDataOldValue: true
});

// Add input event listener as a backup
document.addEventListener('input', (e) => {
  if (isProcessing) return; // Skip if already processing

  const element = e.target.closest('.public-DraftEditor-content[contenteditable="true"]');
  if (element) {
    handleTextChange(element);
  }
});