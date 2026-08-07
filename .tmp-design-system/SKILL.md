---
name: farwa-salon-design
description: Use this skill to generate well-branded interfaces and assets for Farwa Beauty Salon (farwasalon.com, PECHS Karachi), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.
If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.
If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

Key facts: white/mist/nude palette with ink #0d0d0d and champagne gold #c9a98a (deep gold #82664a for text on light); Unbounded 700 display + Inter 300 body + Syne subheads; SQUARE corners; hairline #e4ddd7 borders; matter-of-fact honest copy with real PKR prices ("Rs 1,400", "from Rs 4,000"); no emoji; 44px hit targets; ease-out cubic-bezier(0.16,1,0.3,1).

## Quoti × Farwa north star

**Quoti for rhythm below the fold; Farwa for skin, hero, and truth.**

Borrow Quoti’s section machinery (problem → sticky how-it-works → loud close). Keep Farwa’s brand-first hero, square ink/mist skin, Unbounded/Inter, and checkable numbers.

**YES — structure:** ink problem band (01–03 salon frictions); sticky how-booking-works; loud ink Book + WhatsApp close; light grain on ink; whitespace / one-job sections.

**NO — dress:** staccato benefit H1 (“More glow.”); circular hero avatars; plum gradients as page finales; fake review counts; motif pile-on (tears + grain + gradient + staccato on one page).

Homepage hero stays brand-first (FARWA / PECHS / Rubina). Prefer `ProofStrip` (19 reviews). `ReviewProof` is square mats, below the fold only — never the default under the hero. `.display-staccato` is campaign-only. Logo plum is a rare brand moment; default dark bands stay `--ink`.
