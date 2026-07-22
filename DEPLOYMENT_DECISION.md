# Deployment decision brief

A one-page call on where to host the KEAA site. Details for step 2 live in `BACKEND_GUIDE.md`.

## Problem statement

The site is **three deployable pieces**, not one static bundle:

| Piece | What | Needs |
| --- | --- | --- |
| `dist/` | Prerendered static React site | Static host + CDN |
| `server.js` | Gemini chat proxy (Express) | Node runtime, always-on |
| `keaa-admin-api` | Spring Boot + **MySQL** | Java runtime + database, always-on |

Constraints that decide the host: **one developer** (ops must be near-zero), **EU-facing** (RFQ/contact
data should sit in an EU region for GDPR), keep **MySQL** (no DB migration), and predictable low cost.

## Options

**A — Railway (backend + MySQL + chat) + Cloudflare Pages (frontend)  — RECOMMENDED**
- Pros: lowest ops (push-to-deploy), **managed MySQL — no migration**, EU (Amsterdam) region, cheap
  (~$10–25/mo + free frontend), no lock-in.
- Cons: less control than a raw server; usage-based cost drifts with traffic.

**B — Small EU VPS (Hetzner/DigitalOcean) + Docker + Cloudflare Pages**
- Pros: cheapest (~€5/mo), full control, best EU data residency, whole backend in one box.
- Cons: **you run the server** — updates, backups, HTTPS, monitoring. Real ongoing time.

**C — Full AWS (S3+CloudFront, Beanstalk/ECS, RDS)**
- Pros: everything integrated, scales, EU regions, Secrets Manager, first-year free tier.
- Cons: complex for one dev, security easy to misconfigure, **cost surprises** (RDS + load balancer +
  NAT quietly $50–100+/mo), overkill for a marketing site's traffic.

## Recommendation — Option A, in an EU region

**Justification:** it fits the actual constraints. One dev means ops must be minimal (A is push-to-deploy);
MySQL stays as-is (Railway is managed MySQL, Render is not); EU region covers GDPR data residency for the
Runi/EU sales channel; cost is low and predictable. AWS's power is wasted at this size and its complexity is
a liability; a VPS is cheaper but trades money for your time. Start on A — and because there is no lock-in,
moving to AWS later, **if** scale or a client mandate ever demands it, stays cheap.

## Regardless of host — 4 must-dos (or login breaks in production)

1. `VITE_ADMIN_API` set at **build** time (Vite inlines it).
2. Cookie `secure=true` + `SameSite` (`None` if frontend and API are on different domains) → needs HTTPS.
3. Backend CORS `allowed-origins` must include the deployed frontend origin.
4. Secrets (JWT, DB password) out of the repo, into env vars.
