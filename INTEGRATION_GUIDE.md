# Claude AI Integration Guide

This guide walks you through setting up the Claude AI chatbot for your KEAA International website.

## What's Been Added

- **AI Chat Component** (`src/components/AiChat.jsx`) - A beautiful chat widget that appears on every page
- **Backend Server** (`server.js`) - Express.js server that communicates with Claude API
- **Environment Configuration** (`.env`) - For storing your Claude API key

## Setup Instructions

### 1. Get Your Claude API Key

1. Visit [https://console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in to your Anthropic account
3. Go to the **API Keys** section
4. Click "Create Key" and copy it

### 2. Configure Environment Variables

1. Open the `.env` file in the root directory
2. Replace `your-api-key-here` with your actual Claude API key:
   ```
   ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxx
   PORT=3001
   ```

### 3. Install Backend Dependencies

```bash
npm install
```

This installs:
- `express` - Web server framework
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management
- `concurrently` - Run multiple processes simultaneously
- `@anthropic-ai/sdk` - Claude AI SDK (already installed)

### 4. Start Development Mode

You now have two options:

**Option A: Run both servers together (recommended)**
```bash
npm run dev:all
```
This starts:
- Vite development server (port 5173) - your React app
- Express API server (port 3001) - Claude backend

**Option B: Run servers separately in different terminals**

Terminal 1:
```bash
npm run dev
```

Terminal 2:
```bash
npm run dev:server
```

### 5. Test the Integration

1. Open http://localhost:5173 in your browser
2. Look for the blue chat button in the bottom-right corner
3. Click it to open the chat
4. Type a message like "Tell me about KEAA products"
5. Claude should respond with company information

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│ Browser (React Frontend)                                     │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ AiChat Component                                       │   │
│ │ - Beautiful chat UI                                   │   │
│ │ - Sends messages to /api/chat                         │   │
│ └───────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP Request
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ Vite Dev Server (Port 5173)                                 │
│ - Proxies /api/* requests to Express backend                │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ Express API Server (Port 3001) - server.js                  │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ POST /api/chat                                        │   │
│ │ - Receives user message                              │   │
│ │ - Sends to Claude API with company context           │   │
│ │ - Returns AI response                                │   │
│ └───────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ Anthropic Claude API                                        │
│ - Processes message with company knowledge                  │
│ - Returns generated response                                │
└─────────────────────────────────────────────────────────────┘
```

## Customization

### Modify Chat Appearance

Edit `src/components/AiChat.jsx` to change:
- Colors and styling (look for Tailwind classes)
- Chat widget position (bottom-right by default)
- Welcome message

### Customize AI Behavior

Edit the `SYSTEM_PROMPT` in `server.js` to:
- Add new company information
- Change the assistant's personality
- Add new capabilities

Example:
```javascript
const SYSTEM_PROMPT = `You are a helpful AI assistant for KEAA International...`;
```

### Change Port Numbers

Edit `.env`:
```
PORT=3001  # Change this to use a different port for the API server
```

## Troubleshooting

### "Failed to get response" or connection errors
- Make sure the Express server is running (`npm run dev:server`)
- Check that port 3001 is not in use
- Verify the proxy configuration in `vite.config.js`

### Claude API errors
- Verify your `ANTHROPIC_API_KEY` in `.env`
- Make sure you have API credits: https://console.anthropic.com/account/billing/overview
- Check the API key hasn't expired

### Chat not appearing
- Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
- Check browser console for errors (F12)
- Verify `AiChat` is imported and used in `src/App.jsx`

## Production Deployment

When deploying to production:

1. **Backend Setup** - Host the Express server
   - Use a service like Railway, Render, or Heroku
   - Set environment variables (ANTHROPIC_API_KEY)
   - Update frontend API calls to your backend URL

2. **Frontend Setup** - Build and deploy React
   ```bash
   npm run build
   ```
   - Deploy the `dist/` folder to Vercel, Netlify, etc.

3. **API Proxy** - Update Vite config for production:
   ```javascript
   // In vite.config.js or via environment
   server: {
     proxy: {
       '/api': 'https://your-backend-url.com'
     }
   }
   ```

## File Structure

```
keaa-website final/
├── src/
│   ├── components/
│   │   └── AiChat.jsx          # Chat widget component
│   └── App.jsx                 # Updated with AiChat import
├── server.js                   # Express backend with Claude
├── .env                        # Your API key (keep secret!)
├── .env.example                # Template for .env
├── vite.config.js              # Updated with API proxy
└── package.json                # Updated with new dependencies
```

## Support

For issues with:
- **Claude API**: https://console.anthropic.com/docs
- **Vite**: https://vitejs.dev/guide/
- **React**: https://react.dev/
- **Express**: https://expressjs.com/

---

Happy chatting! 🚀
