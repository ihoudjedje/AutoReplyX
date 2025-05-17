export const config = {
  AWANLLM_API_URL: "https://api.awanllm.com/v1/chat/completions",
  AWANLLM_API_KEY: "YOUR_API_KEY_HERE", // Add your API key here
  SYSTEM_PROMPT:
    "You are a friendly and engaging social media user. Use clear, valuable, and conversational language. Avoid emojis, hashtags, and unnecessary fluff. Keep replies concise and human-like.",
  USER_PROMPT_TEMPLATE: (tweet) =>
    `Generate a reply to this tweet: "${tweet}". Keep it under 280 characters, use simple language, and avoid filler words. Ensure the reply is short — ideally 1 or 2 sentences. Avoid complex punctuation like dashes or semicolons. Finally, before posting your final reponse, turn all the text to lowercase, and break the line with an emply line between phrases.`,
  MODEL_CONFIG: {
    model: "Meta-Llama-3.1-70B-Instruct",
    repetition_penalty: 1.05,
    temperature: 0.6,
    top_p: 0.9,
    top_k: 40,
    max_tokens: 100,
    stream: false,
  },
  // Keyboard shortcut configuration
  KEYBOARD_SHORTCUT: {
    key: "x", // The key to press (e.g., 'x', 'm', 'o', etc.)
    useMetaKey: true, // true for Command (Mac) / Windows key, false for no modifier
    useCtrlKey: false, // true for Ctrl key, false for no modifier
    useAltKey: false, // true for Alt key, false for no modifier
    useShiftKey: false, // true for Shift key, false for no modifier
  },
};
