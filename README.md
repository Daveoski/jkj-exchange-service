# JKJ Exchange Services — Website & Enquiry Platform

A premium, mobile-first corporate website for international supplier-payment **enquiries**, with a private admin dashboard and branded email notifications.
**This site does not process payments, exchange currency or publish live exchange rates.**

| | |
|---|---|
| Website | https://jkj-exchange-service.vercel.app |
| Admin dashboard | https://jkj-exchange-service.vercel.app/admin |
| API health | https://jkj-exchange-api.vercel.app/api/v1/health |

## Architecture

```text
Browser ──► jkj-exchange-service (Next.js 15, Vercel)
              │  /api/*  same-origin proxy (forwards visitor IP with a shared secret)
              ▼
            jkj-exchange-api (FastAPI, Vercel Python) ──► Neon Postgres
              │
              └──► Resend (team alert + customer confirmation emails)
```

```text
JKJ_Exchange_Website/
├── frontend/   Next.js 15 + React 19 + Tailwind — public site, admin UI, API proxy
├── backend/    FastAPI — enquiries, admin auth, stats, CSV export, email, rate limiting
│   ├── app.py          Vercel/uvicorn entry point
│   ├── jkj/            application package (config, db, security, guards, emails, routes)
│   └── tests/          pytest suite (SQLite)
└── database/   schema.sql — reference DDL (tables are created automatically)
```

### Why the proxy?
The browser only ever talks to the website's own domain. That makes the admin session cookie first-party (`HttpOnly`, `Secure`, `SameSite=Lax`), removes CORS from the picture and hides the API origin. The proxy forwards the visitor's IP in a header signed with `PROXY_SECRET`, so per-visitor rate limits work and can't be spoofed.

## Features

**Public website**
- Home, About, Services (RMB, USD, Alipay, WeChat Pay, bank transfer), How it works, Contact, Request a quote, Privacy, Terms.
- Quote form with inline validation, service pre-selection (`/request-quote?service=usd`), honeypot, optional Cloudflare Turnstile, and a **reference number** (e.g. `JKJ-7K3F9Q`) on success.
- WhatsApp / phone / email shortcuts everywhere, floating contact button.
- SEO: metadata per page, JSON-LD (`FinancialService`), sitemap, robots, generated Open Graph image, canonical URLs.
- Accessibility: skip link, focus styles, ARIA on menus/dialogs/forms, reduced-motion support.

**Admin dashboard** (`/admin`)
- Sign in with email + password (bcrypt, JWT in an HttpOnly cookie, brute-force throttling).
- Stats: totals by status, 30-day activity chart, service breakdown.
- Inbox: search (name, email, phone, reference, company, message), filter by status and service, sort, pagination.
- Detail drawer: one-tap WhatsApp / email / call, status pipeline, private notes, activity timeline (received, emails, status changes), delete.
- CSV export (Excel-friendly, formula-injection safe).
- Change password (signs out every other session).
- Email links open the enquiry directly (`/admin?inquiry=<id>`).

**Email (Resend)**
- Branded HTML alert to the JKJ team with reply-to set to the customer.
- Branded confirmation to the customer with their reference and next steps.
- Each recipient is sent separately with an idempotency key; delivery status is recorded on the enquiry and shown in the dashboard. An email failure never loses an enquiry.

**Security**
- Strict input validation, unknown fields rejected, HTML-escaped emails.
- Database-backed rate limiting (per visitor IP, per email, per login) that works across serverless instances; only keyed hashes are stored.
- CSRF protection (custom header + SameSite cookies), security headers (HSTS, nosniff, frame-deny), no-store on admin responses, API docs disabled in production.

## Production configuration (Vercel)

**`jkj-exchange-api`** (root directory `backend`, framework FastAPI)

| Variable | Purpose |
|---|---|
| `DATABASE_URL`, `DATABASE_URL_UNPOOLED` | Injected by the Neon integration (`jkj-exchange-db`) |
| `JWT_SECRET` | Signs admin sessions (sensitive) |
| `PROXY_SECRET` | Must match the website's value (sensitive) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | First administrator, created on first sign-in only |
| `FRONTEND_URL` | Website origin (CORS + dashboard links in emails) |
| `RESEND_API_KEY` | Resend key (sensitive) |
| `NOTIFICATION_FROM_EMAIL` | Sender, e.g. `JKJ Exchange Services <hello@yourdomain.com>` |
| `NOTIFICATION_TO_EMAIL` | Team recipients, comma separated |
| `REPLY_TO_EMAIL` | Where customer replies go |
| `TURNSTILE_SECRET_KEY`, `REQUIRE_TURNSTILE` | Optional bot protection |

**`jkj-exchange-service`** (root directory `frontend`, framework Next.js)

| Variable | Purpose |
|---|---|
| `BACKEND_URL` | `https://jkj-exchange-api.vercel.app` |
| `PROXY_SECRET` | Same value as the API (sensitive) |
| `NEXT_PUBLIC_SITE_URL` | Public website origin |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Optional, pairs with the API's Turnstile secret |

### Email: verify a sending domain (important)
Until a domain is verified in Resend, Resend only delivers to the Resend **account owner's** address, so alerts to other inboxes and customer confirmations are rejected (the dashboard shows "Some emails failed"). To enable all emails:
1. In Resend → **Domains**, add a domain JKJ owns and add the DNS records it shows.
2. In Vercel (`jkj-exchange-api`), set `NOTIFICATION_FROM_EMAIL=JKJ Exchange Services <hello@that-domain>` and redeploy.

### Continuous deployment from GitHub
Both projects are designed to deploy from this repository. To enable deploy-on-push, give Vercel access to the repo once: GitHub → Settings → Applications → **Vercel** → Configure → Repository access → add `jkj-exchange-service`. Then, in each Vercel project → Settings → Git, connect `Daveoski/jkj-exchange-service`.

## Local development

Requirements: Node.js 20+, Python 3.12.

```bash
# Backend (terminal 1)
cd backend
python -m venv .venv
.venv\Scripts\activate          # macOS/Linux: source .venv/bin/activate
pip install -r requirements-dev.txt
copy .env.example .env          # macOS/Linux: cp .env.example .env
uvicorn app:app --reload --port 8000
```

Without `DATABASE_URL` the API uses a local SQLite file. Interactive API docs: http://localhost:8000/api/docs

```bash
# Frontend (terminal 2)
cd frontend
npm install
copy .env.example .env.local    # macOS/Linux: cp .env.example .env.local
npm run dev
```

Open http://localhost:3000 and http://localhost:3000/admin/login (sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `backend/.env`).

## Tests

```bash
cd backend && python -m pytest          # 27 API tests: validation, rate limits, auth, CSRF, management, export
cd frontend && npm run typecheck && npm run build
```

## Managing administrators
- The first admin is created from `ADMIN_EMAIL` / `ADMIN_PASSWORD` the first time anyone signs in. Change the password from the dashboard afterwards; the environment value is then ignored.
- To add or deactivate admins, see the SQL notes at the bottom of `database/schema.sql` (run in the Neon console: Vercel → Storage → `jkj-exchange-db` → Open in Neon).

## Launch checklist
- [ ] Verify a sending domain in Resend and update `NOTIFICATION_FROM_EMAIL`.
- [ ] Sign in to `/admin` and change the initial password.
- [ ] Confirm all claims about JKJ's services are factual (no invented authorisations, rates, testimonials or turnaround times).
- [ ] Have a Nigerian legal/compliance professional review cross-border payment wording, AML/KYC obligations and the NDPA privacy notice; finalise the **draft** privacy and terms pages.
- [ ] Optionally enable Cloudflare Turnstile (`NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY`, `REQUIRE_TURNSTILE=true`).
- [ ] Connect a custom domain and update `FRONTEND_URL` and `NEXT_PUBLIC_SITE_URL`.
- [ ] Confirm permission to use the supplied portrait and flyer.

### Functional boundaries
- Only **website form** submissions enter the dashboard; direct WhatsApp messages, emails and calls are not synced.
- Payment-provider names are descriptive only, not endorsements or integrations. There is no payment gateway.
