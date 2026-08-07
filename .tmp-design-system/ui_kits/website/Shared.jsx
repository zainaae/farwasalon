/* Shared footer + page scaffolding for the Farwa website UI kit. */
const { Navbar, WordmarkDivider } = window.FarwaSalonDesignSystem_f6c92b;

/** Kit stub for production WaCta — opens WhatsApp; logs `from` in console for demos. */
function WaCta({ href, from, className, style, children, ...rest }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={className}
      style={style}
      onClick={() => { if (from) console.info('[WaCta]', from); }}
      {...rest}
    >
      {children}
    </a>
  );
}

function SiteFooter() {
  const h = { fontFamily: 'var(--font-inter)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 500, color: 'var(--ink)', margin: '0 0 14px' };
  const link = { display: 'block', color: 'var(--stone)', fontSize: 12, fontFamily: 'var(--font-inter)', textDecoration: 'none', padding: '5px 0' };
  return (
    <footer style={{ background: '#fff' }} data-screen-label="Footer">
      <div style={{ borderTop: '1px solid var(--border-soft)', padding: '32px 0' }}>
        <div className="section-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <img src="../../assets/logo.jpg" alt="Farwa Beauty Salon" style={{ height: 44, width: 'auto', objectFit: 'contain' }} />
            <span style={{ width: 1, height: 32, background: 'var(--border-soft)' }}></span>
            <span className="font-nastaliq" dir="rtl" lang="ur" style={{ color: 'var(--stone)', fontSize: 16 }}>فروا بیوٹی سیلون</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <a href="book.html" className="btn-primary" style={{ padding: '0.65rem 1.5rem' }}>Book appointment</a>
            <WaCta href="https://wa.me/923222782254" from="kit-footer" style={{ color: 'var(--stone)', fontSize: 10, fontFamily: 'var(--font-inter)', textDecoration: 'none' }}>Or message us on WhatsApp</WaCta>
          </div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid var(--border-soft)', padding: '40px 0' }}>
        <div className="section-shell" style={{ display: 'grid', gridTemplateColumns: '1.7fr 1.1fr 1.2fr 1fr', gap: 40 }}>
          <div><p style={h}>Services</p><div style={{ columns: 2, columnGap: 24 }}>{['Threading', 'Facials', 'Nails', 'Bridal', 'Hair', 'Massage', 'Cleansing', 'Rica Hot Wax'].map((s) => <a key={s} href="services.html" style={link} className="link-underline">{s}</a>)}</div></div>
          <div><p style={h}>Navigate</p>{[['Home', 'index.html'], ['Services', 'services.html'], ['Book', 'book.html'], ['Prices', 'services.html'], ['Contact', '#']].map(([l, href]) => <a key={l} href={href} style={link} className="link-underline">{l}</a>)}</div>
          <div><p style={h}>Visit us</p><p style={{ ...link, padding: 0, lineHeight: 1.8 }}>Farwa Beauty Salon<br />Block 3 PECHS<br />Karachi, Pakistan<br />Mon–Sat · 11:00–19:00</p></div>
          <div><p style={h}>Connect</p><WaCta href="https://wa.me/923222782254" from="kit-footer-connect" style={link} className="link-underline">WhatsApp</WaCta>{['@farwasalon', 'Google Maps', 'Leave a review'].map((l) => <a key={l} href="#" onClick={(e) => e.preventDefault()} style={link} className="link-underline">{l}</a>)}</div>
        </div>
        <div className="section-shell" style={{ marginTop: 36, paddingTop: 20, borderTop: '1px solid var(--border-soft)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ margin: 0, color: 'var(--stone)', fontSize: 11, fontFamily: 'var(--font-inter)' }}>© 2026 Farwa Beauty Salon. All rights reserved.</p>
          <p style={{ margin: 0, color: 'var(--stone)', fontSize: 11, fontFamily: 'var(--font-inter)' }}>Block 3 PECHS, Karachi · Est. 2008</p>
        </div>
      </div>
    </footer>
  );
}

function FixedNav({ light, active }) {
  const go = (label) => {
    const map = { Home: 'index.html', Services: 'services.html', Prices: 'services.html', Book: 'book.html' };
    if (map[label]) window.location.href = map[label];
  };
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
      <Navbar light={light} active={active} logoSrc="../../assets/logo.jpg" onNavigate={go} />
    </div>
  );
}

Object.assign(window, { SiteFooter, FixedNav, WaCta });
