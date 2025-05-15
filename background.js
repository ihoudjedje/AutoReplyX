import { config } from './config.js';

chrome.runtime.onInstalled.addListener(() => {});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "generateReply") {
    // Handle the async operation properly
    (async () => {
      try {
        const response = await fetch(config.AWANLLM_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.AWANLLM_API_KEY}`,
          },
          body: JSON.stringify({
            ...config.MODEL_CONFIG,
            messages: [
              {
                role: "system",
                content: config.SYSTEM_PROMPT,
              },
              {
                role: "user",
                content: config.USER_PROMPT_TEMPLATE(request.tweet),
              },
            ],
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `awanllm API error: ${response.status}, details: ${JSON.stringify(
              errorData
            )}`
          );
        }

        const data = await response.json();

        if (!data.choices || data.choices.length === 0) {
          throw new Error("No response from awanllm");
        }

        // Get the response text from the awanllm API
        const replyText = data.choices[0].message.content;

        // Clean up the response to ensure it's Twitter-friendly
        let cleanResponse = replyText
          .trim()
          // Remove any "Reply:" or similar prefixes that the model might add
          .replace(
            /^(Reply:|Response:|Your reply:|Here's a reply:|A reply:)/i,
            ""
          )
          .trim()
          // Remove double quotes from the beginning and end of the response only
          .replace(/^"|"$/g, "")
          .trim();

        sendResponse({ success: true, reply: cleanResponse });
      } catch (error) {
        sendResponse({
          success: false,
          reply: "AutoX Internal Error",
          error: error.message,
        });
      }
    })();
    return true; // Will respond asynchronously
  }
});
