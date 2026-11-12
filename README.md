# NECore public website — Early access build

An original, responsive public marketing website based on NECore's existing logo and **Sapphire Veil** palette (`#E7F0FA`, `#7BA4D0`, `#2E5F99`, `#0D2440`). The presentation is informed by the client's latest approved three-pillar strategy.

## Pages
- `index.html` — Homepage, product value proposition and visual dashboard illustration.
- `products.html` — Verification engine, intelligence layer, compliance infrastructure and Phase 2 portable credentials.
- `solutions.html` — Banking, fintech, regulated business and platform use cases.
- `developers.html` — Planned API-first integration approach and **explicitly illustrative** code sample.
- `security.html` — Security and privacy by design; **no unsupported certifications claimed**.
- `company.html` — NECore mission and positioning.
- `pricing.html` — Early-access commercial discussion; no invented pricing.
- `contact.html` — Institution enquiry form and serverless mail handler.

## Local preview
Open `index.html` in a browser to view the static pages. For full form/API testing, use Vercel local development or deploy to a protected preview. Basic static test: `python -m http.server 3000` from the site root.

## Vercel deployment
Deploy the project root as a Vercel **Other** / static website project (no compilation required). All `.html` files are served as static pages; `api/contact.js` runs as a Vercel function.

### Required configuration for contact form
Set these **server-side** environment variables in Vercel before publicly advertising demo requests:
- `RESEND_API_KEY` — Resend account API key, set only in Vercel, never in source.
- `CONTACT_TO_EMAIL` — the actual NECore team inbox approved by the client.
- `CONTACT_FROM_EMAIL` — verified domain sender, e.g. a sender created and validated within Resend. Do not use an invented/unverified address.

The form **fails honestly** with a `503` message until configured. Backend validates mandatory fields, uses a honeypot, returns generic delivery errors, and does not intentionally log sensitive details. Add Vercel Firewall / WAF rate limiting and a formal privacy notice before public launch.

## Launch checks
1. Confirm the business domain, official contact inbox, and sender domain.
2. Connect and test Resend email delivery; verify both successful and failure cases.
3. Replace early-access wording only for proven, accessible integrations.
4. Ask legal/compliance owners to approve regulatory statements, policies and data retention descriptions.
5. Perform accessibility, responsive, browser, security and form abuse testing.
6. Connect analytics only with an appropriate consent approach.
7. Configure custom domain, DNS, HTTPS and sitemap/canonical URLs after domain selection.

## Product disclaimers
All dashboard statistics are clearly marked as **sample** data. NIN/BVN identity source checking depends on authorized partner access. Advanced fraud models, specialist biometrics and Phase 2 portable identity credentials are product roadmap items unless separately validated as operational. No production-ready AI, regulatory approval, or certification is claimed by this website.

## Assets
`assets/necore-logo.png` and `assets/necore-icon.png` are derived from client-provided logo artwork without redesign. A vector trace is included for reference, but the client-approved master SVG should replace it if supplied.


## V4 character redesign
- Replaces the irregular drawn figure with a professionally rendered, consistent editorial portrait (synthetic person).
- Face and body never morph or move; only scan indicator and outcome cards animate.
- Original three-scene stage sequence and reduced-motion mode retained.
- Portrait is embedded in a portable SVG image wrapper; the source WebP is included in assets.
- Browser image is a synthetic illustrative asset; do not represent it as real verification.
