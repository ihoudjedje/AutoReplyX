chrome.runtime.onInstalled.addListener(() => {
});

// awanllm API configuration
const AWANLLM_API_URL = 'https://api.awanllm.com/v1/chat/completions';
const AWANLLM_API_KEY = '71c8f6bd-a0b4-447e-8962-00e6eda02791';

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'generateReply') {
    // Handle the async operation properly
    (async () => {
      try {
        const response = await fetch(AWANLLM_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AWANLLM_API_KEY}`
          },
          body: JSON.stringify({
            model: 'Meta-Llama-3.1-70B-Instruct',
            messages: [
              {
                role: 'system',
                content: 'You are a friendly and engaging social media user. Generate concise, relevant, and thoughtful replies (max 280 characters) that contribute to the conversation. Avoid emojis, hashtags, fluff words, and filler. Be direct, clear, and valuable. Short and concise replies are preferred; only elaborate when necessary.'
              },
              {
                role: 'user',
                content: `Generate a reply to this tweet: "${request.tweet}". Keep it under 280 characters. Return only the reply text, without double quotes.`
              }
            ],
            repetition_penalty: 1.1,
            temperature: 0.7,
            top_p: 0.9,
            top_k: 40,
            max_tokens: 150,
            stream: false
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`awanllm API error: ${response.status}, details: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();

        if (!data.choices || data.choices.length === 0) {
          throw new Error('No response from awanllm');
        }

        // Get the response text from the awanllm API
        const replyText = data.choices[0].message.content;

        // Clean up the response to ensure it's Twitter-friendly
        let cleanResponse = replyText
          .trim()
          // Remove any "Reply:" or similar prefixes that the model might add
          .replace(/^(Reply:|Response:|Your reply:|Here's a reply:|A reply:)/i, '')
          .trim();

        sendResponse({ success: true, reply: cleanResponse });
      } catch (error) {
        sendResponse({
          success: false,
          reply: "AutoX Internal Error",
          error: error.message
        });
      }
    })();
    return true; // Will respond asynchronously
  }
});