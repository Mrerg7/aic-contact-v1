# Changelog — aic.contact

## 2026-10-01 — Comprehensive optimization pass

### I. Technical foundation
- Removed global `Link: <https://aic.contact/>; rel="canonical"` header (was canonicalizing
  every path incl. 404 to `/`). Each page now emits its own `<link rel="canonical">`.
- Hardened `public/_headers`: nosniff, DENY framing, strict referrer, permissions-policy,
  HSTS, CSP, COOP; immutable caching for `/_astro/*`, 1-day for favicon.
- Worker (`src/worker.ts`) now stamps the same security headers on asset responses
  (runs first via `run_worker_first = true`) and serves `POST /api/track` → 204
  (privacy-friendly, no PII/cookies, free-plan safe).
- Performance: hero image `preload` + `fetchpriority=high`, Google Fonts non-blocking
  (`media=print` swap + `display=swap`), `background-attachment: fixed` desktop-only
  (was a mobile perf killer / iOS bug), 16px form fields (no iOS zoom).

### II. SEO
- Title format → `aic.contact | Premium Domain for Sale | AIC Contact`; descriptions
  include price ($4,444), availability, CTA.
- Meta: keywords (long-tail: premium/investment/expired domains), author, geo,
  OG image alt, Twitter alt; single robots tag per page (Layout owns it).
- 404 correctly `noindex, nofollow` (was conflicting + rendered outside `<html>`).
- Sitemap (`@astrojs/sitemap`, weekly/0.7) now covers `/`, `/valuation-guide/`,
  `/comparable-sales/`; robots.txt unchanged + valid.
- Structured data: added `BreadcrumbList` (home) and `ItemList`/`Article`+FAQ on
  new pages; Product/Offer/FAQ on home unchanged.

### III. CRO
- Above the fold: price ($4,444 USD) + AVAILABLE NOW badge + Buy Now CTA.
- Trust strip: Escrow.com / SSL-secured / transfer-guarantee badges.
- Urgency: "1 of 1 exclusive asset" + weekly viewer counter (no cookies).
- Social proof: 3 buyer-process testimonials + market-context card.
- 3-tier CTAs everywhere: Buy Now ($4,444 via escrow mailto) / Make an Offer (#inquire)
  / Contact Agent (mailto); 16 tracked CTAs via `data-cta` → `/api/track`.
- Exit-intent popup: buyer-brief email capture, once/7 days (mouseleave + 55s mobile
  fallback), never interrupts active inquiry.
- Form: validation + inline error, honeypot spam trap, autocomplete/inputmode,
  reset binding fixed (was broken inline `onclick`).

### IV. Mobile
- All tap targets ≥48px (nav, menu button 40→48px, sticky CTA, footer links,
  popup close); body text ≥16px; `viewport-fit=cover`; `overflow-x-hidden` kept;
  sticky CTA text bumped to base size.

### V. Authority / internal linking
- New `/valuation-guide/` (Article + FAQ schema, 6-min guide, targets "premium/
  investment/expired domains").
- New `/comparable-sales/` (ItemList schema, 3-letter/.ai/semantic-GTLD bands
  with source disclaimer + pricing rationale).
- Header/footer/home cross-links; footer sitemap link. Off-page (guest posts,
  DA40+ outreach, weekly blog cadence) remains owner-operated — scaffolding ready.

### VI. Design
- Clean dark minimal kept; added scroll fade-ins (`.reveal` + IO, reduced-motion safe),
  hover micro-interactions kept, dark/light toggle (persisted, no-FOUC), skip link,
  focus-visible rings, aria labels/expanded states. Portfolio search/filter N/A —
  single-asset site; comps/guide pages serve discovery instead.

### VII. Validation (pre-deploy)
- `npm run build`: 4 pages, 0 errors. Sanity checks: 1×H1/page, canonicals correct,
  robots single + correct, no inline `onclick`, no fixed-attachment inline, 48px
  targets present, internal links present.
- Manual follow-ups for owner: Lighthouse + Mobile-Friendly Test, 48h error/analytics
  watch, GSC sitemap resubmit (`sitemap-index.xml`).

### Deployment
- Stack: Astro static + Cloudflare Workers + assets (free plan, no paid bindings).
- `wrangler deploy` from repo root; routes `aic.contact` + `www.aic.contact` → canonical
  apex via Worker 301s. Low-traffic window recommended; this push: 2026-10-01.
