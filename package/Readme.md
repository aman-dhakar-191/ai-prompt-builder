# AI Model Testing UI

A standalone web interface for testing AI models using the OpenRouter API. This tool allows you to experiment with different models, system prompts, and temperature settings while maintaining a chat history.

## Features

- 🤖 **Multiple AI Models**: Test various models from OpenAI, Google, Anthropic, and Meta
- 💬 **Chat Interface**: Interactive chat-based testing with conversation history
- ⚙️ **Customizable Settings**: Configure system prompts and temperature
- 💾 **Local Storage**: Chat history saved in browser localStorage
- 📤 **Export Options**: Export chat history as JSON or Markdown
- 🎨 **Modern UI**: Clean, responsive design with gradient styling

## Usage

### GitHub Pages Deployment

1. The `index.html` file is a self-contained, standalone HTML file
2. Enable GitHub Pages for your repository:
   - Go to repository Settings → Pages
   - Select the branch you want to deploy from
   - Set the folder to `/` (root) or configure to serve from `/package` directory
3. Access the UI at: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/package/`

### API Key Setup

Since this is a static site, the API key is entered directly in the UI:

1. Get your OpenRouter API key from [openrouter.ai/keys](https://openrouter.ai/keys)
2. Open the deployed page
3. Enter your API key in the "OpenRouter API Key" field
4. The key is stored in your browser's localStorage for convenience

**Note**: The API key is stored locally in your browser and never sent anywhere except to OpenRouter API.

### Using the UI

1. **Configure Settings** (Left Sidebar):
   - Enter your OpenRouter API key
   - Select an AI model from the dropdown
   - Write a system prompt (optional but recommended)
   - Adjust temperature (0 = deterministic, 2 = creative)

2. **Chat**:
   - Type your message in the text area at the bottom
   - Press Enter or click "Send" to submit
   - View AI responses in the chat area
   - All messages are automatically saved to localStorage

3. **Export Chat History**:
   - Click "Export" button
   - Choose format: JSON (1) or Markdown (2)
   - File will be downloaded automatically

4. **Clear History**:
   - Click "Clear" button to reset the chat
   - Confirmation required before clearing

## Available Models

The UI includes popular models from:
- **Google**: Gemini 2.0 Flash, Gemini 2.5 Flash/Pro
- **OpenAI**: GPT-4o, GPT-4o Mini
- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Haiku
- **Meta**: Llama 3.1 70B, Llama 3.1 8B

## Features in Detail

### System Prompt
The system prompt defines the AI's behavior and personality. Examples:
- "You are a helpful coding assistant specializing in JavaScript"
- "You are a creative writing partner who thinks outside the box"
- "You are a patient teacher explaining complex topics simply"

### Temperature
- **0.0-0.3**: Deterministic, focused responses (good for factual tasks)
- **0.4-0.7**: Balanced creativity and consistency (default: 0.7)
- **0.8-2.0**: Creative, varied responses (good for brainstorming)

### Local Storage
All settings and chat history are stored in your browser's localStorage:
- **Settings**: API key, model, system prompt, temperature
- **Chat History**: All messages with timestamps
- **Statistics**: Message count and storage size

### Export Formats

**JSON Export** includes:
- Export date
- Model configuration
- System prompt
- Temperature
- Full message history with timestamps

**Markdown Export** includes:
- Formatted chat history
- Configuration details
- Timestamps for each message

## Local Development

To test locally:
1. Simply open `index.html` in your web browser
2. No build process or dependencies required
3. Works offline once loaded (except for API calls)

## Security Notes

- API keys are stored in browser localStorage
- Never commit API keys to your repository
- For production use, consider implementing a backend proxy to handle API calls and keep keys server-side
- The UI only communicates with OpenRouter API

## Browser Compatibility

Works in all modern browsers that support:
- ES6 JavaScript
- localStorage API
- Fetch API
- CSS Grid

## License

MIT
