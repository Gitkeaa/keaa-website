# AI Chat Integration Guide

How the KEAA chat widget works, and how to run it.

> **Note:** an earlier version of this guide documented **Anthropic Claude** — the API key,
> the SDK, the console URL, the troubleshooting steps, all of it. That was wrong. This
> project has never used Anthropic: `server.js` runs **Google Gemini** via
> `@google/generative-ai`, and `@anthropic-ai/sdk` is not in the lockfile. Following the
> old guide produced a dead chat widget. This document describes what the code does.

## Architecture

| Piece | File | Role |
| --- | --- | --- |
| Chat widget | `src/components/AiChat.jsx` | Floating button + panel. `POST`s to `/api/chat`. Renders replies with `react-markdown`. |
| API server | `server.js` | Express on port 3001. Holds the Gemini key, builds the knowledge base, calls the model. |
| Dev proxy | `vite.config.js` | Forwards `/api` → `localhost:3001`. **Dev only.** |
| Knowledge base | `src/data/*.js` | `server.js` reads `company.js`, `products.js` and `content.js` and folds them into the system prompt. |

The browser never sees the API key. Nothing in `src/` reads `import.meta.env`, so there is
no client-side environment surface at all.

## Setup

### 1. Get a Gemini API key

Visit <https://aistudio.google.com/app/apikey> and create one.

### 2. Configure the environment

```bash
cp .env.example .env
```

Then set:

```
GEMINI_API_KEY=your-actual-key
# GEMINI_MODEL=gemini-2.5-flash-lite   # optional — overrides the default model chain
# PORT=3001                            # optional
```

`.env` is gitignored. Never commit it.

### 3. Run both processes

```bash
npm run dev:all     # Vite (5173) + API server (3001) together
```

Or separately: `npm run dev` and `npm run dev:server`.

Open <http://localhost:5173>, click the chat button, and ask something like
*"What scaffolding products do you make?"*

**Requires Node.js 20.11+.** `server.js` uses `import.meta.dirname`, which does not exist
on Node 18 or 20.10 — the server throws at boot on those versions.

## How the knowledge base works

`loadKnowledge()` in `server.js` imports `src/data/company.js`, `src/data/products.js` and
`src/data/content.js`, renders them into a text block, and appends it to the system prompt.
A file watcher re-runs this whenever those files change, so content edits take effect
**without a restart**.

⚠️ **The bot's catalogue is not the website's catalogue.** The knowledge base comes from
`src/data/products.js` — a 5-category marketing taxonomy (Scaffolding Systems, Formwork
Accessories, Safety Products, Livestock Housing, Wood Connectors) with curated item codes.
The catalogue *pages* come from `src/data/products.json` — a 3-category scrape of 355 real
products that contains **no PPE at all**. So the bot can describe safety harnesses the
catalogue has no page for, and cannot cite the 355 real item codes the catalogue does have.
Neither source is complete. Resolve this before relying on the bot's product answers.

## The API

### `POST /api/chat`

```json
{
  "message": "Do you export to the UAE?",
  "conversationHistory": [
    { "role": "user", "content": "Hi" },
    { "role": "assistant", "content": "Hello! How can I help?" }
  ]
}
```

- Success → `200 { "reply": "..." }`
- Failure → `503` / `429` / `500` with `{ "error": "<human-readable message>" }`

`server.js` walks a chain of models (`MODEL_CHAIN`) and retries on transient upstream
errors, so one request can produce more than one call to Google.

### `GET /health`

Returns `200` unconditionally. **It does not check the API key** — the server starts and
logs green with a missing or invalid `GEMINI_API_KEY`, and you only find out when a chat
request fails.

## Deploying

There is **no deployment configuration in this repository** — no `vercel.json`, no
`netlify.toml`, no Dockerfile — and `server.js` serves no static files. The front end and
the API are never wired together anywhere. Consequences:

- The Vite `/api` proxy **does not survive `npm run build`**. It is a dev-server feature.
- A plain static deploy of `dist/` gives you a chat widget that calls `/api/chat` and gets
  the SPA's own HTML back.

To ship it, pick one:

1. **Same origin** — have the host rewrite `/api/*` to the Express process, or add
   `express.static('dist')` plus an SPA fallback to `server.js`.
2. **Separate origin** — deploy `server.js` on its own host, add a `VITE_API_BASE`
   variable, and have `AiChat.jsx` use it instead of a bare relative path. This also means
   configuring CORS properly rather than leaving it open.

## Before this goes to production

`server.js` is currently a **wide-open, unauthenticated proxy to KEAA's paid Gemini key**:

- `app.use(cors())` — every origin allowed.
- No authentication, no rate limiting, no CAPTCHA.
- No cap on message length beyond body-parser's implicit ~100 kb default.
- `conversationHistory` is taken from the client, and any non-`user` role is coerced into a
  model turn — so a caller can forge the assistant's own prior replies.
- Upstream Google error text is reflected back to the caller in a `details` field.

Anyone who finds the endpoint can run up your Gemini bill. Lock this down before exposing
it publicly.

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| Server exits at boot with a `dirname` `TypeError` | Node < 20.11. Upgrade. |
| Chat says the assistant is unavailable | `GEMINI_API_KEY` missing or invalid. `/health` still returns OK — check the server logs. |
| Chat works in dev, dead in production | The Vite `/api` proxy is dev-only. See **Deploying**. |
| Bot describes products with no catalogue page | Known. See **How the knowledge base works**. |
