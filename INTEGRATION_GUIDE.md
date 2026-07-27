# AI Chat Integration Guide

How the KEAA chat widget works, and how to run it.

> **Provider history.** This widget ran on **Google Gemini's free tier** until 2026-07-27,
> when it broke for the second time in three days: Google permanently denied the project
> behind the key (`403 "Your project has been denied access"`), first on the original
> account and then again on a brand-new one. Free-tier keys are not a foundation a
> customer-facing widget can stand on, so `server.js` now runs on the **Claude API**
> (`@anthropic-ai/sdk`), which bills per token instead of handing out revocable quota.
> `@google/generative-ai` has been removed from the project.

## Architecture

| Piece | File | Role |
| --- | --- | --- |
| Chat widget | `src/components/AiChat.jsx` | Floating button + panel. `POST`s to `/api/chat`. Renders replies with `react-markdown`. |
| API server | `server.js` | Express on port 3001. Holds the Claude key, builds the knowledge base, calls the model, and answers offline from site data when the model is unreachable. |
| Dev proxy | `vite.config.js` | Forwards `/api` → `localhost:3001`. **Dev only.** |
| Knowledge base | `src/data/*.js` | `server.js` reads `company.js`, `products.js` and `content.js` and folds them into the system prompt. |

The browser never sees the API key. Nothing in `src/` reads `import.meta.env`, so there is
no client-side environment surface at all.

## Setup

### 1. Get a Claude API key

Create one at <https://console.anthropic.com/settings/keys>. The account needs credit on
it; there is no free tier.

### 2. Configure the environment

```bash
cp .env.example .env
```

Then set:

```
ANTHROPIC_API_KEY=your-actual-key
# ANTHROPIC_MODEL=claude-haiku-4-5   # optional, this is the default
# PORT=3001                          # optional
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

`loadKnowledge()` in `server.js` reads `company.js`, `products.js`, `content.js`,
`enquiryLines.js`, `faqs.js`, `products.json` and `categories.json` from `src/data/`,
renders them into a text block, and appends it to the system prompt. A file watcher re-runs
this whenever those files change, so content edits take effect **without a restart**. It
also keeps a structured copy of the same data in memory for offline mode.

**Both product sources are fed to the bot, deliberately.** `products.json` is the 355
browsable products, each with a real page the bot can link (`/product/13`). `products.js` is
the 60 curated item codes from the printed catalogues, with size ranges, and is the only
place Safety Products appears. Only 16 entries overlap, so feeding either one alone loses
real information. Safety Products has no catalogue page yet, so the system prompt routes
those enquiries to the RFQ form rather than to a URL that would 404.

⚠️ `server.js` imports `src/data/*.js` under **raw Node, not Vite**. Those files, and any
file they import, must use explicit `.js` extensions. An extensionless import throws at
load time, `loadKnowledge()` catches it, and the bot silently falls back to the bare system
prompt with no knowledge base at all.

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

- Success → `200 { "message": "..." }`
- Offline fallback → `200 { "message": "...", "offline": true }` (see below)
- Total failure → `503 { "error": "<human-readable message>" }`

The Anthropic SDK retries `429` and `5xx` upstream errors itself with backoff
(`maxRetries: 3`), so one request can produce more than one call to the API.

### Model cost and prompt caching

The knowledge base is roughly 85 kB of text, about 22k tokens, and it is identical on every
request. `server.js` sends it as a **cached prefix** (`cache_control: ephemeral` on the
system block), so the first message of a conversation writes the cache and every follow-up
reads it back at about a tenth of the input price. On `claude-haiku-4-5` that works out to
roughly 3 US cents for a conversation's first message and well under half a cent for each
follow-up.

Caching is a **prefix match**: putting anything volatile in the system block (a timestamp, a
visitor id) invalidates it on every request and you pay full price forever. If
`cache_read_input_tokens` in the server log stays at 0 across a conversation, that is what
has happened.

### Offline mode

If the Claude API cannot be reached for any reason (missing or invalid key, no credit, rate
limit, outage, no network), the request does **not** fail. `offlineAnswer()` searches the
same site data the model would have used and returns a real answer: matching products with
their catalogue links, contact details, certifications, downloads, open roles, leadership,
or the closest FAQ entries. The reply is prefixed with a line telling the visitor the AI is
offline, and the response carries `"offline": true` so the client can tell the two apart.

### `GET /health`

Returns `200` unconditionally. **It does not check the API key.** The startup log does:
`verifyApiKey()` pings the API at boot and prints either `✓ Claude API key verified` or a
`⚠` with the real HTTP status, so a dead key is visible at boot rather than an hour later.

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

`server.js` is currently a **wide-open, unauthenticated proxy to KEAA's paid Claude key**:

- `app.use(cors())` — every origin allowed.
- No authentication, no rate limiting, no CAPTCHA.
- No cap on message length beyond body-parser's implicit ~100 kb default.
- `conversationHistory` is taken from the client, and any non-`user` role is coerced into an
  assistant turn, so a caller can forge the assistant's own prior replies.
- Upstream error text is reflected back to the caller in a `details` field.

Anyone who finds the endpoint can run up your Anthropic bill. This matters more now than it
did on a free tier: every request is metered. Lock it down before exposing it publicly, and
set a spend limit in the Anthropic console as a backstop.

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| Server exits at boot with a `dirname` `TypeError` | Node < 20.11. Upgrade. |
| Replies start with "The AI assistant is offline right now" | The Claude API was unreachable, so offline mode answered. The boot log and the `[chat] Claude API error:` line give the real HTTP status: `401` means a bad key, `429` means rate limited or out of credit. |
| Chat works in dev, dead in production | The Vite `/api` proxy is dev-only. See **Deploying**. |
| Every request bills full price, `cache_read_input_tokens` stays 0 | Something volatile got into the system block and broke the cache prefix. See **Model cost and prompt caching**. |
