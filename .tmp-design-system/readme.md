# Farwa Beauty Salon — Design System

Design system for **Farwa Beauty Salon** (farwasalon.com), a women's beauty salon in Block 3 PECHS, Karachi, Pakistan — est. 2008, run by Rubina. Bridal, facials, threading, waxing, nails, hair — 100+ services across 13 categories, every starting price printed (from Rs 100). Primary conversion paths: online booking and WhatsApp.

**Source:** https://github.com/zainaae/farwasalon (Next.js 16 + Tailwind marketing/booking site). Explore that repo for full page implementations — `app/globals.css` is the canonical stylesheet, `src/data.js` the full service/price catalog, `src/shared.jsx` the shared chrome.

One product surface: the **marketing + booking website** (mobile-first; the audience is largely on mid-range Android over Karachi mobile data — the codebase is obsessive about performance).

## Quoti × Farwa north star

**Quoti for rhythm below the fold; Farwa for skin, hero, and truth.**

Borrow Quoti’s section machinery — not Quoti’s product UI, colors, or slogan dress. After a brand-first Farwa hero, the page should move: name friction → show the booking path → one decisive close. Skin stays ink / mist / gold, Unbounded / Inter, square corners, honest numbers.

| YES (structure) | NO (dress) |
|---|---|
| Ink problem band (01–03 salon frictions) | Staccato benefit H1 (“More glow.” / “more jobs.”) |
| Sticky how-booking-works (few steps, owned photos) | Circular overlapping hero avatars |
| Loud ink Book + WhatsApp close | Plum / purple gradient finales |
| Light grain on ink bands | Fake volume (“380 reviews”, “500+”) |
| Whitespace / one-job sections | Motif pile-on (tears + grain + gradient + staccato) |

Homepage hero: FARWA / PECHS / Rubina thesis + honest `ProofStrip` (4.6★ / **19** reviews). `.display-staccato` is campaign-only. `ReviewProof` is below-fold only. Logo plum is rare; default dark bands stay `--ink`.

## CONTENT FUNDAMENTALS

- **Voice: matter-of-fact, honest, anti-hype.** Copy explains what a service actually does and talks clients OUT of over-buying: "the service we talk clients out of most often", "if you only want two or three areas cleaned up, book those individually — it comes to less", "bleach does not lighten skin".
- **Numbers are checkable.** "1,000+ appointments a month", "4.6★", "19 Google reviews", "every starting price printed". Never rounded up, never invented. Prices as `Rs 1,200` (comma-separated, `from Rs 4,000` when hair-dependent). Durations as `10 min`, `1h 30m`.
- **"We" for the salon, "you/your" for the client.** Warm but professional; no exclamation marks in body copy, no emoji anywhere.
- **Casing:** sentence case for headings/body ("Our services", "Quick pick"). ALL-CAPS is a *typographic* treatment (uppercase + letter-spacing) applied via CSS to labels, buttons, eyebrows and nav — not written in caps.
- **CTAs:** "Book an Appointment" (primary), "Book appointment", "Book online", "Or message us on WhatsApp", "Explore Services". Booking online and WhatsApp always offered as a pair.
- **Place-rooted:** PECHS, Karachi named constantly ("Beauty Salon in PECHS Karachi", "Years in PECHS"). Urdu signature "فروا بیوٹی سیلون" appears in footer chrome.
- Microcopy examples: eyebrow lines like "Farwa Beauty Salon · Est. 2008"; hero thesis "Bridal. Hair. Skin. Rubina's studio since 2008."

## VISUAL FOUNDATIONS

- **Palette:** white pages, warm off-whites (`--mist #f8f5f1`, `--nude #e8ddd5`), near-black ink `#0d0d0d`, warm grey-brown `--stone #6b5f57` for body text, champagne gold `--accent-gold #c9a98a` (decorative / on-dark) and `--accent-gold-deep #82664a` (gold text on light — contrast-safe). **Logo plum** (sampled from `assets/logo.jpg`): `--plum-deep #3f1631`, `--plum #6e2044`, `--berry #9e2a52`, `--plum-gradient` — rare logo / badge moments only; default dark bands stay `--ink`. Gold stays ambient. Max 1 dark band per view; everything else white/mist.
- **Type:** `Unbounded` 700 for all display (hero → section → page → section-title ladder, always -0.02em); `Inter` **300** body (400/500/600 for labels), `Syne` 600/700 for card/menu subheads, `Noto Nastaliq Urdu` for the Urdu signature. Labels/buttons/nav: 10–12.5px Inter, uppercase, tracked 0.12–0.28em.
- **Corners: SQUARE.** Radius 0–2px everywhere. No rounded cards, no pill buttons.
- **Borders:** 1px hairlines in `--border-soft #e4ddd7` do most structural work (ruled lists, panel edges, footer sections). Cards = white + hairline border + very soft shadow (`--shadow-soft`/`--shadow-card`) — never heavy shadows.
- **Backgrounds:** flat white / mist bands; full-bleed photography with weighted dark gradient overlays + 4% SVG grain for hero; ink `#0d0d0d` for proof strips and dark bands. No gradients as decoration (the only gradient palette is the seasonal green "azadi" campaign).
- **Imagery:** real salon photography — warm-toned, women-focused, bridal/beauty closeups. On photos: white type with text-shadow, gradient protection weighted to the text corner. Photos framed with a 3px white mat + hairline border in menu rows.
- **Motion:** exponential ease-out `cubic-bezier(0.16,1,0.3,1)`, durations 120/220/420ms. Entrances = small rises + fades (`hero-rise`, `hero-fade-up`). Hovers: color/border swaps (stone→ink, border-soft→ink), background→mist, underline reveals (`link-underline`). Press: `scale(0.98)`. Full `prefers-reduced-motion` support. Never default `ease`.
- **Bold motifs (optional, use sparingly):** `.display-staccato` only for campaign posters (not the default home hero); `.edge-tear` max 2/page; `.grain` on ink bands; `.btn-loud` for primary conversion. Homepage hero stays brand-first (FARWA / PECHS / Rubina thesis) with a single honest `ProofStrip` — no circular avatar strips, no invented review counts.
- **Logo plum** tokens exist for rare brand moments; default dark bands stay `--ink`. Do not stack plum-gradient + tears + grain on the same page.
- **Focus:** 2px `--accent-gold-deep` outline, offset 3px, on everything interactive.
- **Layout:** `.section-shell` (max 80rem, responsive padding) + `.section-pad`; flow margin scale 28/48/96px. Fixed header (h-14, blur + white/95 when scrolled, ink/35 over hero). Mobile: sticky bottom CTA bar (call / WhatsApp / book) on dark blurred pill. 44px minimum hit targets everywhere (`.tap-safe`).
- **Transparency/blur:** only in fixed chrome (header `bg-white/95 backdrop-blur`, mobile CTA `ink/92 backdrop-blur`, modal backdrop `ink/60 blur(2px)`).

## ICONOGRAPHY

- **Lucide** (stroke 2, round caps) is the icon system: X, Menu, ChevronLeft/Right, Sparkles, Phone, MessageCircle, Star. Load from CDN or inline the paths.
- The two highest-frequency glyphs are **inlined as SVG symbols** in the codebase (perf): `ArrowUpRight` (the arrow on nearly every CTA) and a 5-star `StarRating` — recreated here as components. A custom stroke `IgIcon` (Instagram) lives in chrome. `assets/icons.svg` is the site's icon sprite.
- No emoji, no icon fonts. Unicode used sparingly: `★` inline in ratings ("4.6★"), `·` as separator, `→` in "All services →", `✦` gold ornament in dividers.
- **Logo:** `assets/logo.jpg` (white-background JPG, used at ~28–48px tall) + `assets/logo-source.png`. On dark grounds do NOT invert the JPG — use the type wordmark "FARWA" (Unbounded 700, tracked 0.14–0.16em) in white instead.

## Index

- `styles.css` → `tokens/` (fonts, colors, typography, motion, base component classes)
- `assets/` — logo, icon sprite, 10 salon photos (bridal, threading, facial, hair, nails, massage, waxing…)
- `components/core/` — Button, TabPill, InputField, QuickPickCard, CardLink
- `components/icons/` — ArrowUpRight, StarRating, IgIcon, UrduSignature
- `components/chrome/` — Navbar, ProofStrip, ReviewProof, WordmarkDivider, StickyMobileCTA
- `components/menu/` — MenuRow (priced service-category row)
- `guidelines/` — foundation specimen cards
- `ui_kits/website/` — home / services / booking screen recreations
- `SKILL.md`, `github.md`

### Intentional additions
- Quoti *structure* motifs (problem band pattern, sticky booking chapter, `.btn-loud`, light `.grain` on ink) — adapted to Farwa skin. `.display-staccato` and `ReviewProof` exist for campaign / below-fold experiments only; they are not the default home hero. Everything else is exactly what `src/shared.jsx`, `app/globals.css` and `app/components/` define.

### Notes / gaps
- No vector logo exists in the source — only `logo.jpg`/`logo-source.png` (raster). Wordmark fallback is intentional and matches production behavior.
- Fonts are Google Fonts (Inter, Unbounded, Syne, Noto Nastaliq Urdu), loaded from CDN — identical faces to production (which self-hosts via next/font).
