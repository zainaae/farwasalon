/* Home kit — Farwa brand-first (aligned to production hero + honest proof).
   Quoti leftovers removed: staccato slogan, circular avatars in hero, plum
   gradient finale, excess edge-tears, invented review counts. */
const DS_home = window.FarwaSalonDesignSystem_f6c92b;

/** Same figures as production ProofStrip / FARWA_GBP_STATS (19 reviews, 102 services). */
const PROOF_ITEMS = window.FARWA_PROOF_ITEMS || [
  { lead: '4.6★', label: '19 Google reviews' },
  { lead: '18+', label: 'Years in PECHS' },
  { lead: '1,000+', label: 'Appointments a month' },
  { lead: '102', label: 'Services, every price printed' },
];

function HomeHero() {
  return (
    <section data-screen-label="Home hero" className="grain grain--on-dark" style={{ position: 'relative', width: '100%', height: '100svh', minHeight: 560, maxHeight: 1100, overflow: 'hidden', background: '#0d0609' }}>
      <img src="../../assets/bridal2.jpg" alt="Bridal makeup and beauty styling at Farwa Beauty Salon" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '68% 28%', transform: 'scale(1.01)', zIndex: 0 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,6,9,0.9) 0%, rgba(13,6,9,0.48) 26%, rgba(13,6,9,0.10) 58%, rgba(13,6,9,0.24) 100%), linear-gradient(to right, rgba(13,6,9,0.66) 0%, rgba(13,6,9,0.36) 30%, rgba(13,6,9,0.06) 60%, rgba(13,6,9,0) 78%)' }}></div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '0 2.5rem 3.5rem', textShadow: '0 1px 14px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.2)' }}>
        <div style={{ maxWidth: '96rem', margin: '0 auto' }}>
          <p className="hero-lcp" style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', fontFamily: 'var(--font-inter)', margin: '0 0 22px' }}>
            Farwa Beauty Salon &middot; Est. 2008
          </p>
          <h1
            className="hero-lcp"
            style={{
              color: '#fff',
              margin: '0 0 16px',
              maxWidth: '13ch',
              fontFamily: 'var(--font-unbounded)',
              fontWeight: 700,
              fontSize: 'clamp(2.5rem, 8.8vw, 6.75rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
            }}
          >
            <span style={{ display: 'block', fontWeight: 700 }}>Beauty Salon in PECHS</span>
            <span style={{ display: 'block', fontWeight: 400, marginTop: 4 }}>Karachi</span>
          </h1>
          <p
            className="hero-lcp"
            style={{
              color: 'rgba(255,255,255,0.9)',
              margin: '0 0 28px',
              fontFamily: 'var(--font-unbounded)',
              fontSize: 'clamp(1.05rem, 3.2vw, 1.75rem)',
              letterSpacing: '-0.01em',
              lineHeight: 1.2,
              maxWidth: '22ch',
            }}
          >
            <span style={{ display: 'block', fontWeight: 700 }}>Bridal. Hair. Skin.</span>
            <span style={{ display: 'block', fontWeight: 400, color: 'rgba(255,255,255,0.85)' }}>Rubina&rsquo;s studio</span>
            <span style={{ display: 'block', fontWeight: 700 }}>since 2008.</span>
          </p>
          <div className="hero-fade-up" style={{ animationDelay: '0.25s', display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
            <a href="book.html" className="btn-loud btn-loud--light" style={{ textShadow: 'none' }}>
              Book an Appointment
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 7h10v10"></path><path d="M7 17 17 7"></path></svg>
            </a>
            <a href="services.html" className="link-underline" style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, letterSpacing: '0.16em', textTransform: 'uppercase', fontFamily: 'var(--font-inter)', textDecoration: 'none' }}>Explore Services</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProblemBand() {
  const problems = [
    ['Prices you only learn at the counter', 'Most salons make you ask. Every one of our 100+ services has its starting price printed — from Rs 100 — before you book.'],
    ['Back-and-forth to get a slot', '"Are you free Tuesday?" "What does it cost?" Each message is another day of waiting. Pick a live slot online instead.'],
    ['Walk-ins mean waiting', 'A booked slot is yours. Two stations, real availability, cancel free up to 2 hours before.'],
  ];
  /* One tear into the ink band only — stays under the DS "max 2" budget with the finale. */
  return (
    <div data-screen-label="Problem band">
      <span className="edge-tear" style={{ color: '#0d0d0d', background: 'var(--mist)' }} aria-hidden="true"></span>
      <section className="grain grain--on-dark" style={{ background: 'var(--ink)', padding: '80px 0 88px' }}>
        <div className="section-shell">
          <h2 className="display-section" style={{ color: '#fff', margin: '0 0 12px', maxWidth: '18ch', fontSize: 'clamp(1.75rem,3.6vw,3.4rem)' }}>The hardest part isn&rsquo;t the service.</h2>
          <p style={{ fontFamily: 'var(--font-unbounded)', fontWeight: 400, color: 'var(--accent-gold)', fontSize: 'clamp(1rem,1.8vw,1.4rem)', margin: '0 0 56px' }}>It&rsquo;s everything around it.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px 48px' }}>
            {problems.map(([t, l], i) => (
              <div key={t} style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 24 }}>
                <span style={{ fontFamily: 'var(--font-unbounded)', fontSize: 10, color: 'var(--accent-gold)', letterSpacing: '0.1em' }}>{'0' + (i + 1)}</span>
                <h3 style={{ fontFamily: 'var(--font-syne)', fontWeight: 600, color: '#fff', fontSize: 17, margin: '12px 0 12px', lineHeight: 1.35 }}>{t}</h3>
                <p style={{ fontFamily: 'var(--font-inter)', fontWeight: 300, color: 'rgba(255,255,255,0.65)', fontSize: 13.5, lineHeight: 1.7, margin: 0 }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function StickyStory() {
  const steps = [
    { n: '01', t: 'Pick your service', l: 'Thirteen specialities, every starting price printed. No calling to ask what a facial costs — it says Rs 1,400 right on the menu.', img: '../../assets/glow.jpg' },
    { n: '02', t: 'Pick a live slot', l: 'Real availability, Mon–Sat 11:00–19:00. Book in under a minute; cancel free up to 2 hours before. No prepayment.', img: '../../assets/pedicure.jpg' },
    { n: '03', t: 'Walk in, sit down', l: 'We confirm the work before we start. Printed PKR, no surprise add-ons — leave when you feel ready.', img: '../../assets/threading.jpg' },
  ];
  const [active, setActive] = React.useState(0);
  const refs = React.useRef([]);
  React.useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(Number(e.target.dataset.i)); });
    }, { rootMargin: '-40% 0px -40% 0px' });
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);
  return (
    <section data-screen-label="How booking works" style={{ background: 'var(--mist)', padding: '88px 0 48px', borderTop: '1px solid var(--border-soft)' }}>
      <div className="section-shell">
        <p className="eyebrow" style={{ marginBottom: 14 }}>How booking works</p>
        <h2 className="display-section" style={{ margin: '0 0 64px', fontSize: 'clamp(1.75rem,3.6vw,3.4rem)' }}>Booked while you get on with your day</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'start' }}>
          <div>
            {steps.map((s, i) => (
              <div key={s.n} data-i={i} ref={(el) => (refs.current[i] = el)} style={{ minHeight: '62vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', opacity: active === i ? 1 : 0.35, transition: 'opacity .4s var(--ease-out)' }}>
                <span style={{ fontFamily: 'var(--font-unbounded)', fontWeight: 700, fontSize: 13, color: 'var(--accent-gold-deep)' }}>{s.n}</span>
                <h3 style={{ fontFamily: 'var(--font-unbounded)', fontWeight: 700, color: 'var(--ink)', fontSize: 'clamp(1.4rem,2.4vw,2.1rem)', letterSpacing: '-0.02em', margin: '12px 0 14px', lineHeight: 1.15 }}>{s.t}</h3>
                <p className="text-body" style={{ maxWidth: '30rem', margin: '0 0 22px' }}>{s.l}</p>
                <a href="book.html" className="link-underline" style={{ alignSelf: 'flex-start', color: 'var(--ink)', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', fontFamily: 'var(--font-inter)', fontWeight: 500, textDecoration: 'none' }}>Book online →</a>
              </div>
            ))}
          </div>
          <div style={{ position: 'sticky', top: 'calc(50vh - 260px)', height: 520 }}>
            <span style={{ display: 'block', border: '1px solid var(--border-soft)', background: '#fff', padding: 4, height: '100%', boxShadow: 'var(--shadow-card)', position: 'relative', overflow: 'hidden' }}>
              {steps.map((s, i) => (
                <img key={s.n} src={s.img} alt="" style={{ position: 'absolute', inset: 4, width: 'calc(100% - 8px)', height: 'calc(100% - 8px)', objectFit: 'cover', opacity: active === i ? 1 : 0, transition: 'opacity .5s var(--ease-out)' }} />
              ))}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuickPickSection() {
  const { QuickPickCard, ArrowUpRight } = DS_home;
  const cats = window.FARWA_DATA.categories;
  return (
    <section data-screen-label="Quick pick" style={{ background: 'var(--mist)', borderBottom: '1px solid var(--border-soft)', padding: '8px 0 56px' }}>
      <div className="section-shell">
        <div style={{ background: '#fff', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-soft)', padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 600, color: 'var(--ink)', fontSize: 18, margin: 0, lineHeight: 1 }}>Quick pick</h2>
              <p style={{ color: 'var(--stone)', fontSize: 11, fontFamily: 'var(--font-inter)', margin: 0 }}>Tap a service to start booking in one step</p>
            </div>
            <a href="services.html" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--stone)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', fontFamily: 'var(--font-inter)', textDecoration: 'none' }}>All <ArrowUpRight size={12} /></a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0,1fr))', gap: 8 }}>
            {cats.slice(0, 4).map((c) => <QuickPickCard key={c.name} title={c.name} meta={`From ${c.from}`} onClick={() => (window.location.href = 'book.html')} />)}
            <QuickPickCard title="View all 13" meta="Categories" all onClick={() => (window.location.href = 'services.html')} />
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaFinale() {
  /* Ink band + hairline — not plum gradient theatre. One optional tear into ink. */
  return (
    <div data-screen-label="CTA finale">
      <span className="edge-tear" style={{ color: 'var(--ink)', background: 'var(--mist)' }} aria-hidden="true"></span>
      <section className="grain grain--on-dark" style={{ background: 'var(--ink)', padding: '80px 0 88px' }}>
        <div className="section-shell" style={{ textAlign: 'center' }}>
          <h2
            style={{
              color: '#fff',
              margin: '0 auto 18px',
              fontFamily: 'var(--font-unbounded)',
              fontWeight: 700,
              fontSize: 'clamp(2rem, 5vw, 3.75rem)',
              lineHeight: 1.12,
              letterSpacing: '-0.02em',
              maxWidth: '18ch',
            }}
          >
            Book online in under a minute
          </h2>
          <p className="text-body" style={{ maxWidth: '36rem', margin: '0 auto 32px', color: 'rgba(255,255,255,0.75)' }}>No prepayment. Cancel free up to 2 hours before. Or message us on WhatsApp — whichever is easier for you.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="book.html" className="btn-loud btn-loud--light">Book an Appointment
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 7h10v10"></path><path d="M7 17 17 7"></path></svg>
            </a>
            <window.WaCta href="https://wa.me/923222782254" from="kit-home-finale" className="btn-secondary" style={{ minHeight: 56, padding: '1.2rem 2.2rem', fontSize: 13, color: '#fff', borderColor: 'rgba(255,255,255,0.7)', background: 'transparent' }}>WhatsApp us</window.WaCta>
          </div>
        </div>
      </section>
    </div>
  );
}

function HomeScreen() {
  const { ProofStrip, WordmarkDivider } = DS_home;
  return (
    <div style={{ background: '#fff' }}>
      <window.FixedNav light={false} active="Home" />
      <HomeHero />
      <ProofStrip items={PROOF_ITEMS} />
      <QuickPickSection />
      <ProblemBand />
      <StickyStory />
      <CtaFinale />
      <WordmarkDivider />
      <window.SiteFooter />
    </div>
  );
}

Object.assign(window, { HomeScreen });
