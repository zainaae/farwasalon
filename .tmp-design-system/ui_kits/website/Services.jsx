/* Services screen — recreation of farwasalon.com/services (couture menu).
   title-stack / display-page — not page-level staccato. Ink finale, not nude staccato. */
const DS_svcs = window.FarwaSalonDesignSystem_f6c92b;

function ServicesScreen() {
  const { MenuRow, Button, TabPill } = DS_svcs;
  const D = window.FARWA_DATA;
  const [tab, setTab] = React.useState('All');
  const tabs = ['All', 'Bridal', 'Facials', 'Threading', 'Nails', 'Hair', 'Massage', 'Waxing'];
  const matches = (c) => tab === 'All' || c.name === tab || (tab === 'Waxing' && c.name.includes('Wax'));
  const chapters = D.chapters.map((ch) => ({ ...ch, cats: D.categories.filter((c) => c.chapter === ch.name && matches(c)) })).filter((ch) => ch.cats.length);
  return (
    <div>
      <window.FixedNav light active="Services" />
      <main data-screen-label="Services menu" style={{ paddingTop: 56 }}>
        <div className="section-shell section-pad">
          <div className="title-stack" style={{ borderBottom: '1px solid var(--border-soft)', paddingBottom: 32, marginBottom: 40 }}>
            <p className="eyebrow">Thirteen specialities · PECHS Karachi</p>
            <h1 className="display-page" style={{ margin: 0, color: 'var(--ink)', fontSize: 'clamp(2rem,4vw,3.25rem)' }}>Our services</h1>
            <p className="text-body" style={{ maxWidth: '32rem', marginTop: 8 }}>
              100+ services — every starting price printed from Rs 100. Book online in under a minute, or message us on WhatsApp.
            </p>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 24, flexWrap: 'wrap' }}>
              <Button href="book.html" className="btn-loud" style={{ padding: '1rem 2rem' }} arrow>Book online</Button>
              <window.WaCta href="https://wa.me/923222782254" from="kit-services-hero" className="btn-secondary" style={{ padding: '0.625rem 1.25rem' }}>WhatsApp</window.WaCta>
              <a href="#" onClick={(e) => e.preventDefault()} className="link-underline" style={{ color: 'var(--stone)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: 'var(--font-inter)', textDecoration: 'none' }}>Full price list</a>
            </div>
            <ol style={{ listStyle: 'none', margin: '32px 0 0', padding: '24px 0 0', borderTop: '1px solid var(--border-soft)', display: 'flex', gap: 32, flexWrap: 'wrap' }}>
              {[['01', 'Book', 'Pick a service and a live slot online — or WhatsApp if you prefer.'], ['02', 'Visit', 'Come to the PECHS studio. We confirm the work before we start.'], ['03', 'Done', 'Printed PKR, no surprise add-ons — leave when you feel ready.']].map(([n, t, l]) => (
                <li key={n} style={{ display: 'flex', gap: 12, maxWidth: '14rem' }}>
                  <span style={{ fontFamily: 'var(--font-unbounded)', fontSize: 10, color: 'var(--accent-gold-deep)', paddingTop: 2 }}>{n}</span>
                  <span>
                    <span style={{ display: 'block', fontFamily: 'var(--font-syne)', fontWeight: 600, color: 'var(--ink)', fontSize: 14, marginBottom: 2 }}>{t}</span>
                    <span className="text-body" style={{ display: 'block', fontSize: 12, lineHeight: 1.6 }}>{l}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            {tabs.map((t) => <TabPill key={t} active={tab === t} onClick={() => setTab(t)}>{t}</TabPill>)}
          </div>
          <div style={{ maxWidth: '56rem' }}>
            {chapters.map(({ name, caption, cats }) => (
              <section key={name} aria-label={name}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, paddingTop: 40, paddingBottom: 12, borderBottom: '1px solid rgba(13,13,13,0.3)' }}>
                  <h2 className="section-title" style={{ margin: 0, color: 'var(--accent-gold-deep)' }}>{name}</h2>
                  <span className="eyebrow">{caption}</span>
                </div>
                {cats.map((c) => <MenuRow key={c.name} img={c.img} name={c.name} tagline={c.tagline} count={c.count} availability={c.availability} fromPrice={c.from} popular={c.popular} onClick={() => (window.location.href = 'book.html')} />)}
              </section>
            ))}
          </div>
          <p style={{ marginTop: 32, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: 'var(--font-inter)', color: 'rgba(107,95,87,0.8)' }}>
            Every price is a printed starting figure — final quotes confirmed before your appointment, never after.
          </p>
        </div>
      </main>
      <section className="grain grain--on-dark" style={{ background: 'var(--ink)', padding: '64px 0 72px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="section-shell">
          <h2 className="display-page" style={{ color: '#fff', margin: '0 auto 12px', fontSize: 'clamp(1.75rem,4vw,2.75rem)', maxWidth: '18ch' }}>
            Found yours? Book it now.
          </h2>
          <p className="text-body" style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '28rem', margin: '0 auto 28px' }}>No prepayment. Cancel free up to 2 hours before.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="book.html" className="btn-loud btn-loud--light">Book an Appointment</a>
            <window.WaCta href="https://wa.me/923222782254" from="kit-services-finale" className="btn-secondary" style={{ minHeight: 56, padding: '1.2rem 2.2rem', color: '#fff', borderColor: 'rgba(255,255,255,0.7)', background: 'transparent' }}>WhatsApp</window.WaCta>
          </div>
        </div>
      </section>
      <window.SiteFooter />
    </div>
  );
}

Object.assign(window, { ServicesScreen });
