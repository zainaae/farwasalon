# Google Search Console Setup — Farwa Beauty Salon

## 1. Verify Ownership

### Option A: HTML File Upload (Recommended)
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click **Add Property** → choose **URL prefix**
3. Enter `https://farwasalon.com`
4. Select **HTML file** verification method
5. Download the verification HTML file
6. Replace the contents of `public/google-site-verification.html` with the downloaded file's content
7. Deploy to Vercel (push to master)
8. Click **Verify** in Search Console

### Option B: Meta Tag
1. In Search Console, choose **HTML tag** verification method
2. Copy the meta tag (looks like `<meta name="google-site-verification" content="..." />`)
3. Add it to the `<head>` section in the site's layout component
4. Deploy and verify

### Option C: DNS Record (Most Reliable)
1. In Search Console, choose **Domain** property type
2. Enter `farwasalon.com`
3. Copy the TXT record value
4. Go to your domain registrar's DNS settings
5. Add a TXT record with the provided value
6. Wait for DNS propagation (up to 72 hours, usually minutes)
7. Click **Verify**

> **Recommendation:** Use DNS verification — it covers all subdomains and protocols automatically, and won't break if pages change.

---

## 2. Submit the Sitemap

1. In Search Console, go to **Sitemaps** in the left sidebar
2. Enter `sitemap.xml` in the "Add a new sitemap" field
3. Click **Submit**
4. Verify it shows "Success" status
5. The sitemap at `https://farwasalon.com/sitemap.xml` includes all key pages

---

## 3. Request Indexing of Key Pages

After verification, manually request indexing for high-priority pages:

1. Go to **URL Inspection** (top search bar)
2. Enter each URL below and click **Request Indexing**:

| Priority | URL | Page |
|----------|-----|------|
| 1 | `https://farwasalon.com/` | Homepage |
| 2 | `https://farwasalon.com/#services` | Services section |
| 3 | `https://farwasalon.com/#bridal` | Bridal packages |
| 4 | `https://farwasalon.com/#gallery` | Gallery |
| 5 | `https://farwasalon.com/#contact` | Contact / Booking |

> **Note:** Google may take days to weeks to index pages. Single-page app sections with hash routes (`#services`) may not be indexed separately — consider migrating to proper routes (`/services`, `/bridal`) for better SEO (the Next.js migration will address this).

---

## 4. Monitor Performance

After indexing, check these weekly:

- **Performance** → Search queries driving traffic, CTR, average position
- **Coverage** → Any indexing errors or warnings
- **Core Web Vitals** → Page experience signals
- **Mobile Usability** → Mobile-friendliness issues

---

## 5. Ongoing Tasks

- [ ] Submit updated sitemap whenever new pages are added
- [ ] Monitor for crawl errors monthly
- [ ] Check Core Web Vitals after each deployment
- [ ] Review search queries monthly to identify content gaps
- [ ] Set up email alerts for critical issues
