# AutoReplyX - Twitter Auto Reply Extension

A Chrome extension that automatically generates and posts replies to tweets using the AwanLLM API.

## Features

- Automatically generates human-like replies to tweets
- Customizable prompts and response style
- Easy to configure API settings
- Clean and concise responses
- Quick keyboard shortcut for generating replies

## Setup Instructions

1. Clone this repository:

   ```bash
   git clone https://github.com/yourusername/AutoReplyX.git
   cd AutoReplyX
   ```

2. Configure the extension:

   - Open `config.js`
   - Add your AwanLLM API key to the `AWANLLM_API_KEY` field
   - (Optional) Customize the prompts and model settings
   - (Optional) Configure your preferred keyboard shortcut

3. Load the extension in Chrome:

   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked"
   - Select the `AutoReplyX` directory

4. The extension is now installed and ready to use!

## Usage

### Quick Reply with Keyboard Shortcut

1. Navigate to Twitter and open the reply box for any tweet
2. Press your configured keyboard shortcut while the reply box is focused
3. The extension will automatically:
   - Extract the tweet text
   - Generate an AI response
   - Insert the response at your cursor position

### Customizing the Keyboard Shortcut

You can customize the keyboard shortcut in `config.js` by modifying the `KEYBOARD_SHORTCUT` object:

```javascript
KEYBOARD_SHORTCUT: {
  key: 'x',           // The key to press (e.g., 'x', 'r', 'a', etc.)
  useMetaKey: true,   // true for Command (Mac) / Windows key
  useCtrlKey: false,  // true for Ctrl key
  useAltKey: false,   // true for Alt key
  useShiftKey: false  // true for Shift key
}
```

Examples:

- Default (Command+X): `{ key: 'x', useMetaKey: true, useCtrlKey: false, useAltKey: false, useShiftKey: false }`
- Ctrl+R: `{ key: 'r', useMetaKey: false, useCtrlKey: true, useAltKey: false, useShiftKey: false }`
- Alt+A: `{ key: 'a', useMetaKey: false, useCtrlKey: false, useAltKey: true, useShiftKey: false }`

## Configuration

You can customize the extension by modifying the following in `config.js`:

- `AWANLLM_API_KEY`: Your AwanLLM API key
- `SYSTEM_PROMPT`: The system prompt that defines the AI's behavior
- `USER_PROMPT_TEMPLATE`: The template for generating replies
- `MODEL_CONFIG`: Model parameters like temperature, max tokens, etc.
- `KEYBOARD_SHORTCUT`: Keyboard shortcut configuration

## Security Note

Never commit your API key to version control. The `config.js` file is included in `.gitignore` by default.

## License

MIT License - feel free to use and modify as needed.
