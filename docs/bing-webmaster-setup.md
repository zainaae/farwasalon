# Bing Webmaster Tools & IndexNow Setup — Farwa Beauty Salon

## 1. Verify Site in Bing Webmaster Tools

### Option A: XML File Verification (Recommended)
1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Sign in with a Microsoft account
3. Click **Add your site** → enter `https://farwasalon.com`
4. Choose **XML file** verification
5. Copy the authentication code provided
6. Edit `public/BingSiteAuth.xml` — replace `YOUR_AUTH_CODE` with the real code
7. Deploy to Vercel (push to master)
8. Click **Verify** in Bing Webmaster Tools

### Option B: Import from Google Search Console
1. If Google Search Console is already verified, click **Import** in Bing Webmaster Tools
2. Sign in with your Google account and authorize access
3. Bing will automatically import and verify your site

> **Recommendation:** Use the Import option if Google Search Console is already set up — it's instant and also imports your sitemap.

---

## 2. Submit Sitemap

1. In Bing Webmaster Tools, go to **Sitemaps**
2. Click **Submit sitemap**
3. Enter `https://farwasalon.com/sitemap.xml`
4. Click **Submit**

---

## 3. IndexNow Setup

IndexNow lets search engines know immediately when content changes, instead of waiting for a crawl.

### How It Works
- An API key file is already deployed at: `https://farwasalon.com/b7e3a1d4-9f2c-4b8e-a6d1-3c5f7e9b2a4d.txt`
- This key can be used to ping IndexNow whenever you publish or update content.

### API Key Details
- **Key:** `b7e3a1d4-9f2c-4b8e-a6d1-3c5f7e9b2a4d`
- **Key file location:** `public/b7e3a1d4-9f2c-4b8e-a6d1-3c5f7e9b2a4d.txt`
- **Supported engines:** Bing, Yandex, Naver, Seznam (they share IndexNow submissions)

### Manual Ping (Test)
After deploying, test with a single URL:
```
https://api.indexnow.org/indexnow?url=https://farwasalon.com/&key=b7e3a1d4-9f2c-4b8e-a6d1-3c5f7e9b2a4d
```

### Batch Submission (After Content Updates)
```bash
curl -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json" \
  -d '{
    "host": "farwasalon.com",
    "key": "b7e3a1d4-9f2c-4b8e-a6d1-3c5f7e9b2a4d",
    "keyLocation": "https://farwasalon.com/b7e3a1d4-9f2c-4b8e-a6d1-3c5f7e9b2a4d.txt",
    "urlList": [
      "https://farwasalon.com/",
      "https://farwasalon.com/services",
      "https://farwasalon.com/bridal",
      "https://farwasalon.com/gallery",
      "https://farwasalon.com/contact"
    ]
  }'
```

### Automate with Vercel Deploy Hook (Future)
Add an IndexNow ping to your Vercel deploy workflow so every deployment automatically notifies search engines. This can be done via:
- A Vercel serverless function triggered by a deploy hook
- A GitHub Action that runs after push to master

---

## 4. Bing Places for Business

Bing also has a local business listing (Bing Places):
1. Go to [Bing Places](https://www.bingplaces.com/)
2. Click **Claim your business** or import from Google Business Profile
3. Verify the business details match your Google listing

---

## 5. Monitor & Maintain

- Check **Crawl Errors** weekly for the first month
- Review **Search Performance** monthly
- Re-submit sitemap after major content changes
- Use IndexNow ping after every content update
