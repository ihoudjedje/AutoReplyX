chrome.runtime.onInstalled.addListener(() => {});

// awanllm API configuration
const AWANLLM_API_URL = "https://api.awanllm.com/v1/chat/completions";
const AWANLLM_API_KEY = "71c8f6bd-a0b4-447e-8962-00e6eda02791";

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "generateReply") {
    // Handle the async operation properly
    (async () => {
      try {
        const response = await fetch(AWANLLM_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AWANLLM_API_KEY}`,
          },
          body: JSON.stringify({
            model: "Meta-Llama-3.1-70B-Instruct",
            messages: [
              {
                role: "system",
                content:
                  "You are a friendly and engaging social media user. Use clear, valuable, and conversational language. Avoid emojis, hashtags, and unnecessary fluff. Keep replies concise and human-like.",
              },
              {
                role: "user",
                content: `Generate a reply to this tweet: "${request.tweet}". Keep it under 280 characters, use simple language, and avoid filler words. Ensure the reply is short — ideally 1 or 2 sentences. Avoid complex punctuation like dashes or semicolons. Finally, before posting your final reponse, turn all the text to lowercase, and break the line with an emply line between phrases.`,
              },
            ],
            repetition_penalty: 1.05,
            temperature: 0.6,
            top_p: 0.9,
            top_k: 40,
            max_tokens: 100,
            stream: false,
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
