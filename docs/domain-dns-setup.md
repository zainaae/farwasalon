# Namecheap DNS + Vercel domain setup â€” farwasalon.com

Operational guide to point **farwasalon.com** at Vercel. Use this when the live site is down, DNS still points at old hosting, or Vercel shows **Invalid Configuration** or **DNS Change Recommended**.

**Temporary URL (works before DNS propagates):** [https://farwasalon.vercel.app](https://farwasalon.vercel.app)

**Broader domain checklist (registration, email, SEO):** [domain-setup.md](./domain-setup.md)

---

## Problem (current state)

If DNS still points at old parking/hosting (e.g. `198.54.117.242`), visitors never reach Vercel. Both apex and `www` must be updated.

**Records to set today (Vercel recommended â€” IP range expansion, Jun 2025+):**

| Type  | Host | Value | TTL   |
|-------|------|-------|-------|
| **A** | `@`  | `216.198.79.1` | Auto  |
| **CNAME** | `www` | `25cff91a97a4946f.vercel-dns-017.com` | Auto |

Remove any other **A** or **URL Redirect** records for `@` or `www` that point elsewhere (especially `198.54.117.242`).

> **Legacy records (still work, not preferred):** Vercel previously recommended `@` â†’ `76.76.21.21` and `www` â†’ `cname.vercel-dns.com`. Those continue to resolve, but the dashboard now shows **DNS Change Recommended** until you switch to the values above.

---

## Vercel dashboard â€” source of truth for `www`

Vercel may show a **project-specific** CNAME for `www`, not the generic `cname.vercel-dns.com`.

For **farwasalon**, the dashboard shows:

| Host | Record |
|------|--------|
| `farwasalon.com` | **A** â†’ `216.198.79.1` |
| `www.farwasalon.com` | **CNAME** â†’ `25cff91a97a4946f.vercel-dns-017.com` |

**Always use the exact values from your projectâ€™s Settings â†’ Domains.** If Vercel displays a different `*.vercel-dns-*.com` hostname after a redeploy or domain re-add, update Namecheap to match â€” do not assume `cname.vercel-dns.com`.

`farwasalon.vercel.app` should show **Valid Configuration** independently of custom-domain DNS.

---

## 1. Namecheap (registrar: `registrar-servers.com`)

Domain must use **Namecheap BasicDNS** (or Custom DNS), not third-party nameservers, unless you manage DNS elsewhere.

1. Log in at [namecheap.com](https://www.namecheap.com) â†’ **Domain List** â†’ **Manage** next to `farwasalon.com`.
2. **Nameservers:** set to **Namecheap BasicDNS** (default). If you use Custom DNS, edit records in that provider instead.
3. Open **Advanced DNS**.
4. **Remove wrong records:**
   - Delete parking page **A** records for `@` (e.g. `198.54.117.242` or similar).
   - Delete **A** or **URL Redirect** on `www` that point to old hosting.
   - Remove old Vercel **A** on `@` if you are migrating: `76.76.21.21`.
   - Remove old Vercel **CNAME** on `www`: `cname.vercel-dns.com` (replace with project-specific value below).
   - Remove duplicate **CNAME** / **ALIAS** for `@` or `www` that conflict with the table above.
   - Leave unrelated records (MX, TXT for email/verification) unless they conflict.
5. **Add / update:**
   - **A Record:** Host `@` â†’ Value `216.198.79.1` â†’ TTL Automatic.
   - **CNAME Record:** Host `www` â†’ Value `25cff91a97a4946f.vercel-dns-017.com` (trailing dot optional on Namecheap) â†’ TTL Automatic.
6. **Save all changes.**

> **Note:** Namecheap â€œURL Redirect Recordâ€ for `@` or `www` is not a substitute for the A + CNAME above. Use A + CNAME for Vercel.

---

## 2. Vercel

1. Open [Vercel Dashboard](https://vercel.com) â†’ project **farwasalon** (or your Farwa project).
2. **Settings â†’ Domains**.
3. **Add** both (if not already present):
   - `farwasalon.com`
   - `www.farwasalon.com`
4. **Primary domain:** set `farwasalon.com` as primary (recommended).
5. **Redirect:** enable redirect so `www.farwasalon.com` â†’ `farwasalon.com` (Vercelâ€™s recommended canonical). Match what you configured in `next.config.mjs` if applicable.
6. If either domain shows **DNS Change Recommended**, update Namecheap to the A + CNAME in the table at the top of this doc (or copy fresh values from the dashboard).
7. Wait until each custom domain shows **Valid Configuration** (green). SSL certificates provision automatically after DNS is correct (usually minutes, up to 24h).

Do not mix old IP addresses (`76.76.21.21`, `198.54.117.242`) with the new recommended records.

---

## 3. Verification

### Global propagation

- [whatsmydns.net â€” farwasalon.com A record](https://www.whatsmydns.net/#A/farwasalon.com) â€” should show `216.198.79.1` worldwide over time.
- [whatsmydns.net â€” www CNAME](https://www.whatsmydns.net/#CNAME/www.farwasalon.com) â€” should show `25cff91a97a4946f.vercel-dns-017.com`.

### Command line

```bash
nslookup farwasalon.com 8.8.8.8
```

Expected after update: **Address: 216.198.79.1** (not `198.54.117.242`). Legacy `76.76.21.21` still reaches Vercel but triggers **DNS Change Recommended** in the dashboard.

```bash
nslookup www.farwasalon.com 8.8.8.8
```

Expected after update: CNAME to `25cff91a97a4946f.vercel-dns-017.com` (or resolves via that target). Legacy `cname.vercel-dns.com` still works but is not preferred.

### HTTPS smoke test

```bash
curl -I https://farwasalon.com
curl -I https://www.farwasalon.com
```

Expected: `HTTP/2 200` or `301`/`308` redirect from `www` to apex; valid TLS (no certificate errors).

### Vercel dashboard

- **Settings â†’ Domains:** both hostnames **Valid Configuration** (no **DNS Change Recommended**).
- **Deployments â†’ Production:** latest deploy assigned to custom domains.

### Last checked (local verification)

| Check | Result |
|-------|--------|
| `nslookup farwasalon.com 8.8.8.8` | `76.76.21.21` (legacy Vercel A â€” site works; update to `216.198.79.1` recommended) |
| `nslookup www.farwasalon.com 8.8.8.8` | CNAME â†’ `cname.vercel-dns.com` (legacy â€” update to `25cff91a97a4946f.vercel-dns-017.com` recommended) |
| `198.54.117.242` | Not present (good â€” old parking IP removed) |

---

## 4. Production setup checklist

After DNS and domains are valid, complete production configuration.

### Vercel environment variables

Set in **Project â†’ Settings â†’ Environment Variables** for **Production** (and **Preview** if you test bookings on previews). Same list as [staging-qa-checklist.md](./staging-qa-checklist.md#3-vercel-env-required-for-book--newsletter):

| Variable | Purpose |
|----------|---------|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Google service account client email |
| `GOOGLE_PRIVATE_KEY` | PEM private key (`\n` newlines OK in Vercel) |
| `GOOGLE_SHEET_ID` | Spreadsheet ID from the Google Sheets URL |
| `BOOKING_CANCEL_SECRET` | HMAC secret for booking cancel links |

Also ensure the spreadsheet is shared with the service account (Editor). Tabs **Bookings** (headers Aâ€“L) and **Subscribers** (auto-created on first signup) must exist or be creatable.

### Post-DNS code / SEO (if not already done)

See [domain-setup.md Â§ Post-Domain Setup Checklist](./domain-setup.md#3-post-domain-setup-checklist) and [search-console-setup.md](./search-console-setup.md).

Quick checks:

- [ ] `metadataBase`, sitemap, and robots use `https://farwasalon.com`
- [ ] Google Search Console verified; sitemap submitted
- [ ] `BASE_URL=https://farwasalon.com node scripts/booking-api-probe.mjs` passes
- [ ] [staging-qa-checklist.md](./staging-qa-checklist.md) manual sections spot-checked on production

---

## 5. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|----------------|-----|
| Site still shows old host / parking | DNS not updated or cached | Confirm Namecheap records; wait propagation; flush local DNS cache |
| Vercel **Invalid Configuration** | A/CNAME missing or wrong | Match dashboard records exactly; remove conflicting A on `www` |
| Vercel **DNS Change Recommended** | Legacy `76.76.21.21` / `cname.vercel-dns.com` still set | Update to `216.198.79.1` + project CNAME from dashboard |
| SSL pending | DNS just changed | Wait up to 24h; ensure only Vercel records on `@` / `www` |
| `www` certificate error | CNAME missing or wrong target | Use project-specific `*.vercel-dns-*.com` from Vercel, not a stale generic value |
| Booking API 503 on production | Missing env vars | Complete Â§4 Production setup checklist |

**Propagation:** often 15â€“60 minutes; allow up to 48 hours globally. Use [farwasalon.vercel.app](https://farwasalon.vercel.app) until `farwasalon.com` resolves correctly.

---

## Quick reference

| Item | Value |
|------|-------|
| Apex A record (recommended) | `@` â†’ `216.198.79.1` |
| www CNAME (recommended) | `www` â†’ `25cff91a97a4946f.vercel-dns-017.com` |
| Apex A record (legacy, still works) | `@` â†’ `76.76.21.21` |
| www CNAME (legacy, still works) | `www` â†’ `cname.vercel-dns.com` |
| Vercel preview / fallback URL | `https://farwasalon.vercel.app` |
| Legacy IP to remove | `198.54.117.242` (and any other non-Vercel A records) |

---

## Last verified

**2026-06-12** (automated: nslookup @ 8.8.8.8 / 1.1.1.1, curl HTTPS)

| Resolver | farwasalon.com (A) | www |
|----------|----------------------|--------|
| 8.8.8.8 | 216.198.79.1 (expected) | CNAME to 25cff91a97a4946f.vercel-dns-017.com |
| 1.1.1.1 | 198.54.117.242 (stale) | 198.54.117.242 (stale) |

- **Vercel app:** https://farwasalon.vercel.app/ returns HTTP 200.
- **Custom domain on Vercel IPs:** /, /book, /api/slots return HTTP 200.
- **Custom domain via default resolver:** HTTPS failed; HTTP apex showed Namecheap parking.

**Action:** Confirm Namecheap records; wait for 1.1.1.1 propagation. Re-verify in 24-48h.
