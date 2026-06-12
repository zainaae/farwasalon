# Namecheap DNS + Vercel domain setup — farwasalon.com

Operational guide to point **farwasalon.com** at Vercel. Use this when the live site is down, DNS still points at old hosting, or Vercel shows **Invalid Configuration**.

**Temporary URL (works before DNS propagates):** [https://farwasalon.vercel.app](https://farwasalon.vercel.app)

**Broader domain checklist (registration, email, SEO):** [domain-setup.md](./domain-setup.md)

---

## Problem (current state)

If DNS still points at old parking/hosting (e.g. `198.54.117.242`), visitors never reach Vercel. Both apex and `www` must be updated.

**Records to set today:**

| Type  | Host | Value                 | TTL   |
|-------|------|-----------------------|-------|
| **A** | `@`  | `76.76.21.21`         | Auto  |
| **CNAME** | `www` | `cname.vercel-dns.com` | Auto |

Remove any other **A** or **URL Redirect** records for `@` or `www` that point elsewhere.

---

## 1. Namecheap (registrar: `registrar-servers.com`)

Domain must use **Namecheap BasicDNS** (or Custom DNS), not third-party nameservers, unless you manage DNS elsewhere.

1. Log in at [namecheap.com](https://www.namecheap.com) → **Domain List** → **Manage** next to `farwasalon.com`.
2. **Nameservers:** set to **Namecheap BasicDNS** (default). If you use Custom DNS, edit records in that provider instead.
3. Open **Advanced DNS**.
4. **Remove wrong records:**
   - Delete parking page **A** records for `@` (e.g. `198.54.117.242` or similar).
   - Delete **A** or **URL Redirect** on `www` that point to old hosting.
   - Remove duplicate **CNAME** / **ALIAS** for `@` or `www` that conflict with the table above.
   - Leave unrelated records (MX, TXT for email/verification) unless they conflict.
5. **Add / update:**
   - **A Record:** Host `@` → Value `76.76.21.21` → TTL Automatic.
   - **CNAME Record:** Host `www` → Value `cname.vercel-dns.com.` (trailing dot optional on Namecheap) → TTL Automatic.
6. **Save all changes.**

> **Note:** Namecheap “URL Redirect Record” for `@` or `www` is not a substitute for the A + CNAME above. Use A + CNAME for Vercel.

---

## 2. Vercel

1. Open [Vercel Dashboard](https://vercel.com) → project **farwasalon** (or your Farwa project).
2. **Settings → Domains**.
3. **Add** both:
   - `farwasalon.com`
   - `www.farwasalon.com`
4. **Primary domain:** set `farwasalon.com` as primary (recommended).
5. **Redirect:** enable redirect so `www.farwasalon.com` → `farwasalon.com` (Vercel’s recommended canonical). Match what you configured in `next.config.mjs` if applicable.
6. Wait until each domain shows **Valid Configuration** (green). SSL certificates provision automatically after DNS is correct (usually minutes, up to 24h).

If Vercel shows required records, they should match the table above. Do not mix old IP addresses with Vercel records.

---

## 3. Verification

### Global propagation

- [whatsmydns.net — farwasalon.com A record](https://www.whatsmydns.net/#A/farwasalon.com) — should show `76.76.21.21` worldwide over time.
- [whatsmydns.net — www CNAME](https://www.whatsmydns.net/#CNAME/www.farwasalon.com) — should show `cname.vercel-dns.com`.

### Command line

```bash
nslookup farwasalon.com 8.8.8.8
```

Expected: **Address: 76.76.21.21** (not `198.54.117.242` or other legacy IPs).

```bash
nslookup www.farwasalon.com 8.8.8.8
```

Expected: CNAME to `cname.vercel-dns.com` (or resolves via Vercel).

### HTTPS smoke test

```bash
curl -I https://farwasalon.com
curl -I https://www.farwasalon.com
```

Expected: `HTTP/2 200` or `301`/`308` redirect from `www` to apex; valid TLS (no certificate errors).

### Vercel dashboard

- **Settings → Domains:** both hostnames **Valid Configuration**.
- **Deployments → Production:** latest deploy assigned to custom domains.

---

## 4. Production setup checklist

After DNS and domains are valid, complete production configuration.

### Vercel environment variables

Set in **Project → Settings → Environment Variables** for **Production** (and **Preview** if you test bookings on previews). Same list as [staging-qa-checklist.md](./staging-qa-checklist.md#3-vercel-env-required-for-book--newsletter):

| Variable | Purpose |
|----------|---------|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Google service account client email |
| `GOOGLE_PRIVATE_KEY` | PEM private key (`\n` newlines OK in Vercel) |
| `GOOGLE_SHEET_ID` | Spreadsheet ID from the Google Sheets URL |
| `BOOKING_CANCEL_SECRET` | HMAC secret for booking cancel links |

Also ensure the spreadsheet is shared with the service account (Editor). Tabs **Bookings** (headers A–L) and **Subscribers** (auto-created on first signup) must exist or be creatable.

### Post-DNS code / SEO (if not already done)

See [domain-setup.md § Post-Domain Setup Checklist](./domain-setup.md#3-post-domain-setup-checklist) and [search-console-setup.md](./search-console-setup.md).

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
| Vercel **Invalid Configuration** | A/CNAME missing or wrong | Match records exactly; remove conflicting A on `www` |
| SSL pending | DNS just changed | Wait up to 24h; ensure only Vercel records on `@` / `www` |
| `www` certificate error | CNAME missing | Add `www` → `cname.vercel-dns.com` |
| Booking API 503 on production | Missing env vars | Complete §4 Production setup checklist |

**Propagation:** often 15–60 minutes; allow up to 48 hours globally. Use [farwasalon.vercel.app](https://farwasalon.vercel.app) until `farwasalon.com` resolves correctly.

---

## Quick reference

| Item | Value |
|------|-------|
| Apex A record | `@` → `76.76.21.21` |
| www CNAME | `www` → `cname.vercel-dns.com` |
| Vercel preview / fallback URL | `https://farwasalon.vercel.app` |
| Legacy IP to remove | `198.54.117.242` (and any other non-Vercel A records) |
