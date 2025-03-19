chrome.runtime.onInstalled.addListener(() => {
  console.log('X AI Reply Generator extension installed');
});

// Function to check available models
async function getAvailableModels() {
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('>>> Available models:', data);
    return data;
  } catch (error) {
    console.error('>>> Error fetching models:', error);
    throw error;
  }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'generateReply') {
    // Handle the async operation properly
    (async () => {
      try {
        console.log('>>> Sending request to Ollama with tweet:', request.tweet);
        
        // First, let's check available models
        await getAvailableModels();
        
        const response = await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama3:latest',  // Using llama2 as default, will adjust based on available models
            prompt: `You are a friendly and engaging social media user. Generate a concise reply (max 280 characters) to the following tweet. The reply should be relevant, add value to the conversation, and include appropriate emojis where it makes sense. Be natural and conversational.

Tweet: "${request.tweet}"

Your reply (remember to keep it under 280 characters):`,
            stream: false
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        }

        const data = await response.json();
        console.log('>>> Ollama raw response:', data);
        
        if (!data.response) {
          throw new Error('No response from Ollama');
        }

        // Clean up the response to ensure it's Twitter-friendly
        let cleanResponse = data.response
          .trim()
          // Remove any "Reply:" or similar prefixes that the model might add
          .replace(/^(Reply:|Response:|Your reply:|Here's a reply:|A reply:)/i, '')
          .trim();

        sendResponse({ success: true, reply: cleanResponse });
      } catch (error) {
        console.error('>>> Error details:', {
          message: error.message,
          stack: error.stack,
          error: error
        });
        sendResponse({ 
          success: false, 
          reply: "Thanks for sharing! 🙌",
          error: error.message 
        });
      }
    })();
    return true; // Will respond asynchronously
  }
});

// Function to generate reply using Ollama
async function generateReply(tweetText) {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistral',
      prompt: `Generate a friendly and engaging reply to this tweet. The reply should be concise (max 280 characters) and relevant to the tweet's content. Add appropriate emojis if relevant.

Tweet: "${tweetText}"

Reply:`,
      stream: false
    })
  });

  const data = await response.json();
  return data.response;
}