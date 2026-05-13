# Custom Domain Setup Guide — Farwa Beauty Salon

This guide covers registering a domain, connecting it to Vercel, and the post-setup checklist for `farwasalon.com`.

---

## 1. Domain Registration

### Recommended Registrars (accessible from Pakistan)

| Registrar | Notes |
|-----------|-------|
| **Namecheap** (recommended) | Good prices, easy DNS management, free WHOIS privacy |
| **GoDaddy** | Popular but more expensive; Urdu support available |
| **Google Domains** | Clean UI; check availability in PK |
| **Porkbun** | Very cheap `.com` renewals, modern dashboard |
| **PKnic.pk** | Required for `.pk` domains |

### Domains to Register

- `farwasalon.com` — primary
- `farwasalon.pk` — local presence (via PKnic.pk)
- Consider also: `farwabeautysalon.com`, `farwasalon.net` (to prevent squatting)

---

## 2. DNS Configuration for Vercel

### Step-by-Step

1. **Add domain in Vercel Dashboard**
   - Go to your project → **Settings → Domains**
   - Add `farwasalon.com`
   - Vercel will show the required DNS records

2. **Apex domain (`farwasalon.com`)**
   - Add an **A record** in your registrar's DNS settings:
     ```
     Type: A
     Host: @
     Value: 76.76.21.21
     TTL: 3600 (or Auto)
     ```

3. **www subdomain (`www.farwasalon.com`)**
   - Add a **CNAME record**:
     ```
     Type: CNAME
     Host: www
     Value: cname.vercel-dns.com
     TTL: 3600 (or Auto)
     ```

4. **SSL certificate** — automatic on Vercel, no action needed

5. **Redirect setup** — in Vercel Dashboard, configure:
   - `www.farwasalon.com` → redirects to `farwasalon.com` (recommended)
   - Or vice versa — pick one canonical version and stick with it

### DNS Propagation

- Changes typically take 15 minutes to 48 hours to propagate globally
- Use [whatsmydns.net](https://www.whatsmydns.net/) to check propagation status

---

## 3. Post-Domain Setup Checklist

After the domain is live and SSL is working:

### Code Changes

- [ ] Update `metadataBase` in `app/layout.jsx` back to `https://farwasalon.com`
- [ ] Update `BASE` in `app/sitemap.js` back to `https://farwasalon.com`
- [ ] Update sitemap URL in `app/robots.js` back to `https://farwasalon.com/sitemap.xml`
- [ ] Search codebase for any remaining `farwasalon.vercel.app` references and update them

> Look for `TODO: change back to https://farwasalon.com` comments in the code.

### Search Engine Submission

- [ ] **Google Search Console** — verify domain ownership, submit sitemap (`https://farwasalon.com/sitemap.xml`)
- [ ] **Bing Webmaster Tools** — verify and submit sitemap
- [ ] **Google Business Profile** — update the website URL to `https://farwasalon.com`

### Social & Directory Updates

- [ ] Update Instagram bio link
- [ ] Update Facebook page website
- [ ] Update any WhatsApp Business profile links
- [ ] Update Google Maps / Google Business listing

### Email Setup (Optional but Professional)

- [ ] Set up domain email: `info@farwasalon.com`, `bookings@farwasalon.com`
- [ ] Options: Google Workspace (~$6/mo), Zoho Mail (free tier), Namecheap email

---

## 4. Hosting Recommendations

### Current Setup

- **Vercel Free Tier** — excellent for Next.js
  - Includes: CDN, SSL, preview deployments, serverless functions
  - Limits: 100 GB bandwidth/mo, 100 deployments/day (more than enough for a salon site)

### If Traffic Grows

| Option | Cost | Best For |
|--------|------|----------|
| **Vercel Pro** | $20/mo | Analytics, more bandwidth, team features, priority support |
| **Cloudflare Pages** | Free | Great CDN, good DDoS protection |
| **Netlify** | Free tier | Similar to Vercel, good for static/JAMstack |

**Recommendation:** Stay on Vercel — it's purpose-built for Next.js and the free tier is generous for a local business site.

---

## 5. Domain Protection

After registering your domain:

- [ ] **Enable WHOIS privacy** — hides personal info from public WHOIS lookups (free on Namecheap)
- [ ] **Enable domain lock** — prevents unauthorized transfers (registrar transfer lock)
- [ ] **Set up auto-renewal** — avoid accidentally losing your domain
- [ ] **Use a strong password** on your registrar account + enable 2FA
- [ ] **Register defensive domains** — `farwabeautysalon.com`, `farwasalon.pk` to prevent squatting

---

## Quick Reference

| Item | Value |
|------|-------|
| Vercel A record | `76.76.21.21` |
| Vercel CNAME | `cname.vercel-dns.com` |
| Google Review Place ID | `ChIJeVyXMig_szoQEKI0TaSkW-U` |
| Plausible analytics domain | `farwasalon.com` |
| WhatsApp | `+92 322 278 2254` |
