# Release checklist — Farwa Beauty Salon

Use this right before promoting a Vercel deployment to **production** or tagging a release. It complements automated CI (lint, build, test) and the deeper criteria in [quality-gates-release.md](./quality-gates-release.md).

**Custom domain / DNS:** [domain-dns-setup.md](./domain-dns-setup.md)

## Automated gates (must be green)

- [ ] Latest commit on the release candidate passes GitHub Actions **CI** (`lint`, `build`, `test`).
- [ ] Locally: `npm run verify` and `npm run test` succeed on the same commit (especially if CI was skipped or branch-only).

## Human gates — functional

- [ ] Home, Services, Gallery, About, Contact load without a blank screen; no obvious broken layout on mobile width.
- [ ] Primary **WhatsApp** / booking links open with the expected prefilled text (spot-check `waLink` / booking flow).
- [ ] Address / map / Instagram links in footer or contact match live business details.

## Human gates — content & SEO (spot-check)

- [ ] Page titles and meta description on key routes look correct in the browser tab / view-source.
- [ ] Hero/media assets that matter for the release are present (no broken images on first screen).

## Human gates — analytics & privacy

- [ ] If using **Plausible**, confirm the script loads on production (network tab) and the domain is configured in Plausible.
- [ ] No secrets or API keys committed; Vercel env vars only where needed.

## Rollback

- [ ] You know how to **redeploy** or **rollback** the previous Vercel production deployment from the Vercel dashboard if something is wrong post-release.

---

After release: monitor Plausible (or future error tool) for the first 24–48 hours for obvious regressions.
