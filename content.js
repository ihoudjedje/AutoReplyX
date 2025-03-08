// Function to extract tweet text from the tweet element
function extractTweetText() {
  const tweetTextElement = document.querySelector('[data-testid="tweetText"]');
  console.log('Tweet text element:', tweetTextElement);
  return tweetTextElement ? tweetTextElement.textContent.trim() : '';
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
      console.log('Found reply input:', selector);
      replyInput.focus();
      return replyInput;
    }
  }
  
  console.log('Reply input not found');
  return null;
}

// Flag to prevent multiple triggers
let isProcessing = false;

// Function to set text in the input field
function setReplyText(inputElement, text) {
  if (inputElement && !isProcessing) {
    try {
      isProcessing = true;
      console.log('Setting reply text:', text);
      
      // Remove the "autox" trigger
      const currentText = inputElement.textContent;
      const cleanText = currentText.replace('autox', '').trim();
      
      // Set the new text (original text without autox + our response)
      const newText = cleanText + (cleanText ? ' ' : '') + text;
      
      // Use a single method to set the text and dispatch the input event
      inputElement.textContent = newText;
      inputElement.dispatchEvent(new InputEvent('input', {
        bubbles: true,
        cancelable: true,
        inputType: 'insertText',
        data: newText
      }));
      
    } finally {
      // Reset the flag after a short delay to allow the mutation observer to process
      setTimeout(() => {
        isProcessing = false;
      }, 100);
    }
  }
}

// Function to generate a hardcoded reply based on tweet content
function generateHardcodedReply(tweetText) {
  return "Thanks for sharing these valuable insights! Looking forward to more discussions! 🙌";
}

// Function to handle text changes
function handleTextChange(element) {
  if (isProcessing) return; // Skip if already processing
  
  const text = element.textContent || '';
  if (text.toLowerCase().includes('autox')) {
    console.log('autox trigger detected');
    const tweetText = extractTweetText();
    if (tweetText) {
      const response = generateHardcodedReply(tweetText);
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