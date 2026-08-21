# Sonu Malik — Portfolio, CMS & Analytics Platform

A production-ready personal brand website for **Sonu Malik** — sports infrastructure founder,
cricket personality and entrepreneur based in Rohtak, Haryana — with a secure admin portal,
a first-party analytics stack, an inquiry inbox, and an evidence archive that backs every
public claim with a source.

- **Public site** — editorial, cinematic, mobile-first, statically rendered.
- **Admin portal** — SaaS-style CMS at `/admin`, role-based, never indexed.
- **Analytics** — self-hosted, cookie-free, no third-party trackers, no raw IP storage.
- **Verification system** — a claim only reads as "verified" once a real source is attached.

---

## 1. The accuracy policy

This is the most important section of this document. The site is built to be **credible**, and
credibility is a technical constraint here, not a copy decision.

**Nothing in this repository fabricates evidence.** Specifically, no code path invents, and no
seed data contains:

| Never fabricated | How the system handles it |
| --- | --- |
| Newspaper coverage, clippings, interviews, quotations | Media tables ship **empty**. Items appear only after a real upload. |
| Tournament names, dates, results, standings, certificates | Events store a category only; specifics require a source. |
| Player relationships | Wording is fixed to "associated with the facility". |
| Awards, statistics, revenue, business locations | Rendered only when supplied; otherwise "to be added". |
| Analytics figures | Charts read collected rows. An empty database shows zeros. |
| Wikipedia status | Never asserted anywhere. |

### Wording rules encoded in the product

- Cricket abroad is described as **"international club cricket"**. The site never implies national
  representation or a professional BCCI playing career. `/cricket` states this limit explicitly
  above the timeline.
- Players (Mohit Rathee, Nishant Sindhu) are described as **"associated with the facility"** with
  the team context exactly as supplied. `/players` states, before naming anyone, that no coaching,
  mentoring, discovery or management relationship is claimed.
- Any claim without a `VERIFIED` verification record renders a visible
  **"Verification required"** badge instead of being presented as settled fact.

### How verification is enforced

`VerificationRecord` holds one row per public claim: the claim text, source type, publication,
date, URL, uploaded evidence, review status and admin notes.

- `PUT /api/admin/verification/[id]` **refuses** to set status `VERIFIED` unless a `sourceUrl` or
  an `evidenceUrl` is present. This is the check that keeps the badge meaningful.
- `MediaArticle.isPublished` is forced to `false` unless `status === 'VERIFIED'`, on both create
  and update. An unverified press item cannot reach the public page even if the flag is sent.
- The seed opens an `UNVERIFIED` record for every launch claim that still needs backing
  (see `OPEN_CLAIMS` in `src/content/defaults.ts`), so the archive starts honest rather than empty.

Imagery is the one place this discipline is deliberately relaxed. The sport cards on `/red-ball`
carry openly-licensed stock photography of each sport, chosen by the site owner in preference to
empty frames. They are **not** photographs of Red Ball's own facilities, and a reader has no way to
tell that from the page — the trade was made knowingly. Every licence and author is recorded in
[`CREDITS.md`](CREDITS.md); see the note there about attribution still owed.

Everywhere else the rule holds: a subject with no photograph gets a labelled empty frame
(`MediaPlaceholder`), never a generated one, and alt text describes only what is in the frame.

---

## 2. Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, React 19, Turbopack) |
| Language | TypeScript, `strict` |
| Styling | Tailwind CSS 3 with a custom editorial design system |
| Database | PostgreSQL |
| ORM | Prisma 6 |
| Auth | Database-backed sessions, JWT cookie (`jose`), bcrypt, optional TOTP |
| Validation | Zod 4 |
| Charts | Recharts 3 |
| Email | Nodemailer (optional) |

---

## 3. Getting started

```bash
npm install
```

```bash
cp .env.example .env
```

Need a local database? This starts one on 5432 with a persistent volume:

```bash
docker run -d --name sm-portfolio-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=sm_portfolio -p 5432:5432 -v sm-portfolio-pgdata:/var/lib/postgresql/data --restart unless-stopped postgres:16-alpine
```

Fill in `DATABASE_URL`, then generate secrets:

```bash
node -e "console.log('AUTH_SECRET=' + require('crypto').randomBytes(48).toString('base64'))"
```

```bash
node -e "console.log('ANALYTICS_IP_SALT=' + require('crypto').randomBytes(24).toString('hex'))"
```

Create the schema and seed the launch content:

```bash
npm run db:push
```

```bash
npm run db:seed
```

```bash
npm run dev
```

The public site is at `http://localhost:3000`, the admin portal at `http://localhost:3000/admin`.

### Bootstrapping the first admin

Set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` (12+ characters) before running `db:seed`. The
account is created as **Super Admin** with `mustChangePassword: true`, so the seed password — which
is sitting in your shell history — must be replaced at first sign-in. Re-running the seed never
touches an existing user.

---

## 4. Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string. |
| `AUTH_SECRET` | yes | 32+ chars. Signs session JWTs. |
| `NEXT_PUBLIC_SITE_URL` | yes in prod | Canonical URLs, sitemap, OG tags. |
| `AUTH_SESSION_TTL` | no | Session lifetime in seconds (default 28800). |
| `ANALYTICS_IP_SALT` | recommended | Salt for visitor hashing. Falls back to `AUTH_SECRET`. |
| `NEXT_PUBLIC_ANALYTICS_ENABLED` | no | Set `false` to disable collection entirely. |
| `SMTP_*`, `MAIL_FROM`, `INQUIRY_NOTIFY_TO` | no | Inquiry notifications. Without these, inquiries are still saved. |
| `INQUIRY_SEND_ACK` | no | Send an acknowledgement to the visitor. |
| `UPLOAD_DRIVER`, `UPLOAD_MAX_BYTES` | no | `local` writes to `public/uploads` (dev only). |
| `SEED_ADMIN_*` | no | One-time bootstrap admin. |

Secrets are read only through `src/lib/env.ts` on the server. Nothing except `NEXT_PUBLIC_*`
reaches the browser, and the Settings screen reports credentials as "Configured" without printing
a single value.

---

## 5. Architecture

```
src/
  app/
    (site)/            Public pages — Home, About, Cricket, Red Ball, Players,
                       Ventures, Media, Contact, Privacy, Terms, Cookies
    admin/(auth)/      Login, forgot password, reset — no shell
    admin/(portal)/    Authenticated shell: dashboard, analytics, inquiries,
                       CMS, media, verification, SEO, users, audit, settings
    api/               Public, auth and admin-only endpoints
    og/                Generated social sharing image
    sitemap.ts, robots.ts
  components/
    site/  sections/  ui/  admin/
  content/defaults.ts  Canonical launch content (also the DB-down fallback)
  lib/                 auth, permissions, analytics, validation, content, SEO
  proxy.ts             Edge gate for /admin (Next 16 proxy convention)
prisma/schema.prisma   23 models
prisma/seed.ts         Idempotent seed
```

### Content layer with a fallback

Public pages read through `src/lib/content.ts`, which wraps every query in `safeQuery`. If the
database is unreachable — cold deploy, failover, a build machine with no `DATABASE_URL` — the page
still renders from `src/content/defaults.ts` instead of throwing. Write paths never use this; they
fail loudly. This is why `npm run build` succeeds with no database attached.

### Two-layer authorisation

1. **`src/proxy.ts` (edge)** — verifies the session JWT signature and expiry, redirects anonymous
   users to `/admin/login`, and returns 401 for `/api/admin/*`. Cheap, no database.
2. **Server (authoritative)** — `getSessionUser()` looks the session up in Postgres and rejects
   revoked sessions and deactivated accounts. `requirePermission()` checks the role matrix.

The edge layer is a fast gate, not the boundary. A token can be cryptographically valid and still
belong to a session revoked a second ago; only the server check catches that.

### Roles

| Role | Access |
| --- | --- |
| Super Admin | Everything, including users and settings. |
| Content Admin | Content, media, evidence, SEO, analytics. No inquiries, no users. |
| Inquiry Manager | Inquiries end to end. Read-only content. |
| Analytics Viewer | Analytics only. |

Permissions live in `src/lib/permissions.ts` and are checked by key, never by role name, so adding
a role does not require touching call sites. The sidebar hides links the role cannot use — a
usability measure; the API enforces the same rules independently.

---

## 6. Analytics

First-party, privacy-conscious, and **never fabricated**.

- **No cookies.** The session key lives in `sessionStorage` and dies with the tab.
- **No raw IPs.** Visitors are counted by `sha256(salt + UTC date + IP + user-agent)`, truncated.
  Because the date is an input, the identifier rotates daily and cannot be correlated across days
  or reversed.
- **Do Not Track is honoured** automatically, plus a persistent opt-out on `/cookies`.
- **Bots are dropped** at ingestion rather than inflating every metric.
- **Small cities are aggregated.** Geography folds buckets under three sessions into
  "Other (aggregated)" so a single visitor is never identifiable by location.

Events: `page_view`, `session_start`, `contact_form_view`, `contact_form_start`,
`contact_form_submit`, `external_link_click`, `media_open`, `red_ball_link_click`,
`business_link_click`. Full UTM capture on sessions and inquiries.

The dashboard offers Today / Yesterday / 7 / 30 / 90 days / custom range, with each metric compared
against the immediately preceding window of equal length. Day buckets are computed in
**Asia/Kolkata**, because UTC buckets would split an Indian evening across two days.

If nothing has been collected, the dashboard shows zeros and an explicit empty state. It never
shows sample data.

---

## 7. Contact flow

1. Client-side validation for fast feedback.
2. `POST /api/contact` re-validates everything with Zod — the browser check protects nobody.
3. Rate limited to 6 submissions per hour per IP hash, in memory **and** in Postgres so the limit
   survives across serverless instances.
4. Spam scoring: honeypot field, submission-speed check, link count, keyword heuristics. A filled
   honeypot returns a normal success response so a bot learns nothing; high-scoring messages are
   stored and flagged `SPAM` rather than dropped, so a false positive is recoverable.
5. **Saved to the database first.** Email is sent afterwards via `after()`, so a dead SMTP server
   delays nothing and loses nothing.
6. Admin notification and optional visitor acknowledgement.
7. Recorded in the audit log.

Statuses: New → Contacted → In Progress → Resolved, plus Spam and Archived. Each inquiry carries
assignment, internal notes, source page, referrer and UTM parameters. The visitor hash is stored
for abuse control and **never returned** to the inbox UI.

---

## 8. SEO & GEO

Generated automatically and always consistent with what is on the page:

- Per-page title, description, canonical, robots, Open Graph and Twitter card.
- JSON-LD: `Person`, `WebSite`, `SportsActivityLocation`, `Organization`, `FAQPage`,
  `BreadcrumbList`, and `Article` for verified press items only.
- `sitemap.xml` (excludes anything marked no-index), `robots.txt`, breadcrumbs, semantic headings.
- A generated OG image at `/og`.

**Structured data only asserts what is visible.** `compact()` in `src/lib/schema-org.ts` drops any
property whose value is unknown rather than filling it with something plausible — an absent field
is honest, an invented one is not. `Event` nodes are emitted only for entries with a real date.

For generative engines, `/` carries short, self-contained answer passages and an entity link web
connecting Sonu Malik to Mokhra, Rohtak, Haryana, Kalinga University, Vaish College, the three
cricket countries, Red Ball and the two ventures. AI crawlers are allowed on public pages
deliberately: the point is for them to read accurate, sourced information rather than infer it.

---

## 9. Security

- bcrypt (cost 12); passwords require 12+ chars with mixed case and a digit.
- Session tokens: signed JWT in an `httpOnly`, `SameSite=Lax`, `Secure` (in production) cookie;
  only the SHA-256 hash is stored, so the database cannot mint a session.
- Account lockout after 5 failed attempts for 15 minutes; identical error text for every failure
  mode so the endpoint cannot enumerate accounts.
- Password change or reset revokes **all** sessions for that account.
- Rate limiting on contact, login, password reset and analytics ingestion.
- Zod validation on every mutating endpoint; Prisma parameterises all queries.
- Upload validation in depth: MIME allow-list → extension match → **magic-byte check** →
  size limit → generated filename. Nothing executable is accepted and no attacker-controlled string
  reaches the filesystem path.
- Audit log with actor, action, resource, before/after values — with `password`, `token`, `secret`
  and `hash` keys redacted before writing.
- Security headers (HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy`); `X-Robots-Tag: noindex` and `no-store` across `/admin`.
- Errors return a generic message; stack traces, SQL and Prisma internals stay in the server log.

Guard rails worth knowing: you cannot deactivate or demote your own account, and the system refuses
to remove the last active Super Admin.

---

## 10. Accessibility

- Semantic landmarks, one `h1` per page, ordered heading levels.
- Skip links on both the public site and the admin portal.
- Visible `:focus-visible` rings; the mobile menu is a focus-trapped dialog with Escape to close.
- Labelled form controls, `aria-invalid`, `role="alert"` errors, `aria-live` status.
- FAQ uses native `<details>` — keyboard accessible with no JavaScript, and the answers are in the
  initial HTML.
- `prefers-reduced-motion` disables every reveal, counter and transition globally.
- Charts are always paired with a table or list; decorative SVG is `aria-hidden` with a real list
  beside it.

---

## 11. Scripts

```bash
npm run dev
```

```bash
npm run build
```

```bash
npm run typecheck
```

```bash
npm run lint
```

```bash
npm run db:migrate
```

```bash
npm run db:studio
```

---

## 12. Deployment

1. Provision managed PostgreSQL and set `DATABASE_URL`.
2. Set `AUTH_SECRET`, `ANALYTICS_IP_SALT` and `NEXT_PUBLIC_SITE_URL`.
3. Deploy to Vercel or any Node host. `npm run build` runs `prisma generate` first.
4. Run `npx prisma migrate deploy`, then `npm run db:seed` once.
5. Sign in at `/admin`, change the bootstrap password, and add real admin users.
6. **Switch `UPLOAD_DRIVER` to object storage.** The `local` driver writes to `public/uploads`,
   which is ephemeral on serverless platforms; the upload route returns `501` for any driver it
   does not implement rather than silently writing to a disk that will vanish.

`robots.txt` disallows everything when `NODE_ENV !== 'production'`, so a staging copy cannot
compete with the real site in search results.

---

## 13. Verification status

Every flow below was exercised against **PostgreSQL 16.14** running in Docker, on a production
build, with results confirmed by request and by direct database inspection.

**Build quality** — `typecheck` clean, `lint` clean (zero errors, zero warnings), `build` succeeds
with 13 static pages prerendered.

**Public site** — all 11 pages plus `robots.txt`, `sitemap.xml` and `/og` return 200; unknown paths
404. Security headers, canonical tags and JSON-LD blocks confirmed in the response. After seeding,
pages render from the database rather than the fallback.

**Database** — `db:push` synced 26 models; `db:seed` created 4 roles, 16 permissions, 1 super admin,
9 timeline events, 8 facilities, 5 events, 2 players, 2 businesses, 5 stats, 10 FAQs, 8 SEO records,
5 settings and **15 open verification records**, with media and analytics intentionally empty.

**Authentication** — wrong password returns a generic 401; correct password sets an `httpOnly`
session cookie and reports `mustChangePassword`. Changing the password revoked the active session
(subsequent request returned 401).

**Authorisation** — all seven `/api/admin/*` endpoints return 401 anonymously and 200 for a super
admin. An `ANALYTICS_VIEWER` received 200 on analytics and **403 on inquiries, users, audit and
content**, including write attempts. The rails held: self-deactivation and self-demotion of the last
super admin both refused with 400.

**Contact** — a submission persisted with its UTM parameters and appeared in the admin inbox;
`visitorHash` was absent from both list and detail payloads. A honeypot submission returned a normal
`201` with a plausible reference and wrote **no row**. The rate limiter cut in at the sixth request
per hour.

**Analytics** — ingested page views and funnel events, rejected `Googlebot`, and produced correct
KPIs (2 sessions, 5 page views, 50% bounce, 50% conversion), device split, top pages and a complete
funnel. Channel classification resolved Direct, Organic Search, Social, Referral and Campaign from
referrers and UTM parameters. Both `date_trunc` aggregate queries returned correct IST buckets.

**Verification gate** — marking a claim `VERIFIED` **without** a source was refused with 422; with a
source it succeeded and the claim appeared on the public `/media` page. A press item submitted with
`isPublished: true` while `UNVERIFIED` was stored as `isPublished: false` and stayed off the public
page.

**CMS** — create, update and delete all succeeded on the generic resource routes.

**Inquiries** — status change set `respondedAt`, an internal note attached, and both actions were
recorded in the audit log. The audit payload contained no password hashes or secrets.

**Uploads** — a genuine JPEG stored with a generated filename and SHA-256 checksum. Rejected with
415: a Windows executable renamed to `.jpg` (magic-byte check), a text file claiming to be a PDF,
an SVG (not on the allow-list), and a JPEG declared as `application/pdf` (extension mismatch).

### Two bugs this run caught and fixed

1. **The traffic chart excluded today.** `days` was derived by dividing the raw span by 24h, but
   `to` is "now" rather than end of day, so "Last 7 Days" rounded to 6 buckets and dropped the
   current day — two sessions existed and every bucket read zero. Now computed as an inclusive IST
   calendar-day count (`inclusiveDayCount`), giving 7 buckets with today included.
2. **Analytics ingestion returned 500 when the database was down.** Telemetry must never fail a
   visitor's request. `ingestEvent` now catches, returns `accepted: false`, and logs the outage once
   per minute instead of dumping a multi-line Prisma error per query.

### Test data

All artifacts from the run were removed afterwards: the temporarily verified claim was reset to
`UNVERIFIED` with its placeholder source stripped, and test inquiries, press items, the extra admin
account, uploaded file, synthetic analytics and audit entries were deleted. The database is back to
a clean seeded state — 15 open claims, 0 verified, 0 media, 0 inquiries, 0 analytics rows — and the
admin password matches the `.env` value with `mustChangePassword` set.

---

## 14. Pre-launch checklist

**Public** — navigation, responsive layout at 360/768/1280/1920, contact validation, contact
submission, success and error states, external links, metadata, structured data via the Rich
Results Test, `sitemap.xml`, `robots.txt`, Lighthouse on mobile, keyboard-only navigation.

**Admin** — sign in, forced password change, sign out, each role's visible surface, dashboard,
inquiry status and assignment and notes, every CMS collection, media upload, verification workflow
(confirm a claim cannot be verified without a source), analytics date filters, audit log.

**Security** — session revocation after a password change, lockout after 5 failed attempts, rate
limits, upload rejection of a renamed executable, no secrets in the client bundle
(`grep -r "AUTH_SECRET" .next/static` should return nothing).

---

## 15. Content to supply

The site is honest about what it does not have. These become real content through `/admin`:

- Portrait and facility photography (currently labelled placeholders).
- Press coverage, clippings, interviews — with publication, date and URL.
- Sources for the open claims listed in the verification archive.
- Business details for The Page and Hotel The Prada: photography, location, website, booking,
  contact, social links.
- Public email and phone, if they should be published.
- Specific events: names, years, organisers and supporting references.
- Player testimonials, photographs and official references.
