/* Book screen — recreation of farwasalon.com/book (category → service → time → confirm).
   title-stack / display-page — not page-level staccato. */
const DS_book = window.FarwaSalonDesignSystem_f6c92b;

function BookScreen() {
  const { Button, InputField } = DS_book;
  const D = window.FARWA_DATA;
  const bookable = Object.keys(D.services);
  const [step, setStep] = React.useState(0);
  const [cat, setCat] = React.useState(null);
  const [svc, setSvc] = React.useState(null);
  const [slot, setSlot] = React.useState(null);
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const stepLabel = ['Choose a category', 'Choose a service', 'Pick a time', 'Your details'][step];
  const catBtn = { width: '100%', padding: '1rem', textAlign: 'left', border: '1px solid var(--border-soft)', background: '#fff', cursor: 'pointer', transition: 'border-color .2s ease, background-color .2s ease' };
  const slotBtn = (active) => ({ minHeight: 44, padding: '10px 12px', fontFamily: 'var(--font-inter)', fontSize: 12, cursor: 'pointer', border: `1px solid ${active ? 'var(--ink)' : 'var(--border-soft)'}`, background: active ? 'var(--ink)' : '#fff', color: active ? '#fff' : 'var(--ink)', transition: 'all .2s ease' });
  const back = () => setStep(Math.max(0, step - 1));
  return (
    <div style={{ background: 'var(--mist)', minHeight: '100vh' }}>
      <window.FixedNav light active="Book" />
      <main data-screen-label="Booking flow" style={{ paddingTop: 56 }}>
        <div className="section-shell section-pad" style={{ maxWidth: '46rem' }}>
          <div className="title-stack" style={{ marginBottom: 28 }}>
            <p className="eyebrow">Online booking &middot; Mon&ndash;Sat 11:00&ndash;19:00</p>
            <h1 className="display-page" style={{ margin: 0, color: 'var(--ink)', fontSize: 'clamp(1.75rem,3.5vw,2.75rem)' }}>{step < 4 ? 'Book an appointment' : 'Booking confirmed'}</h1>
            {step < 4 && <p className="text-body" style={{ marginTop: 4 }}>Step {step + 1} of 4 — {stepLabel}. No prepayment; cancel free up to 2 hours before.</p>}
          </div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
            {[0, 1, 2, 3].map((i) => <span key={i} style={{ flex: 1, height: 2, background: i <= step ? 'var(--ink)' : 'var(--border-soft)', transition: 'background-color .3s ease' }}></span>)}
          </div>
          {step === 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {bookable.map((c) => (
                <button key={c} style={catBtn} onClick={() => { setCat(c); setSvc(null); setStep(1); }}>
                  <span style={{ display: 'block', fontFamily: 'var(--font-syne)', fontWeight: 600, fontSize: 15, color: 'var(--ink)', marginBottom: 2 }}>{c}</span>
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: 11, fontWeight: 300, color: 'var(--stone)' }}>{D.services[c].length} services · from {D.services[c][0].price}</span>
                </button>
              ))}
            </div>
          )}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {D.services[cat].map((s) => (
                <button key={s.name} style={{ ...catBtn, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }} onClick={() => { setSvc(s); setStep(2); }}>
                  <span style={{ fontFamily: 'var(--font-inter)', fontWeight: 400, fontSize: 14, color: 'var(--ink)' }}>{s.name}</span>
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, fontWeight: 500, color: 'var(--accent-gold-deep)', whiteSpace: 'nowrap' }}>{s.price} <span style={{ color: 'rgba(107,95,87,0.5)' }}>·</span> <span style={{ color: 'var(--stone)', fontWeight: 300 }}>{s.dur}</span></span>
                </button>
              ))}
              <button onClick={back} className="link-underline" style={{ alignSelf: 'flex-start', marginTop: 8, background: 'none', border: 0, cursor: 'pointer', fontFamily: 'var(--font-inter)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--stone)' }}>&larr; Back</button>
            </div>
          )}
          {step === 2 && (
            <div>
              <div style={{ background: '#fff', border: '1px solid var(--border-soft)', padding: '12px 16px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>{svc.name}</span>
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: 'var(--accent-gold-deep)', fontWeight: 500 }}>{svc.price} · {svc.dur}</span>
              </div>
              <p className="eyebrow" style={{ marginBottom: 10 }}>Tomorrow &middot; available times</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {D.slots.map((t) => <button key={t} style={slotBtn(slot === t)} onClick={() => setSlot(t)}>{t}</button>)}
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 24, alignItems: 'center' }}>
                <Button disabled={!slot} onClick={() => slot && setStep(3)} style={{ opacity: slot ? 1 : 0.4 }}>Continue</Button>
                <button onClick={back} className="link-underline" style={{ background: 'none', border: 0, cursor: 'pointer', fontFamily: 'var(--font-inter)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--stone)' }}>&larr; Back</button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: '26rem' }}>
              <InputField label="Your name" placeholder="Ayesha Khan" value={name} onChange={(e) => setName(e.target.value)} />
              <InputField label="Phone" placeholder="03XX XXXXXXX" hint="Pakistani mobile format" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <div style={{ background: '#fff', border: '1px solid var(--border-soft)', padding: '12px 16px', fontFamily: 'var(--font-inter)', fontSize: 12, color: 'var(--stone)', lineHeight: 1.7 }}>
                <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{svc.name}</span> — {svc.price} · {svc.dur}<br />Tomorrow at {slot} · Block 3 PECHS, Karachi
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <Button arrow onClick={() => setStep(4)} style={{ opacity: name && phone ? 1 : 0.4 }} disabled={!name || !phone}>Confirm booking</Button>
                <button onClick={back} className="link-underline" style={{ background: 'none', border: 0, cursor: 'pointer', fontFamily: 'var(--font-inter)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--stone)' }}>&larr; Back</button>
              </div>
            </div>
          )}
          {step === 4 && (
            <div style={{ background: '#fff', border: '1px solid var(--border-soft)', boxShadow: 'var(--shadow-card)', padding: '32px' }}>
              <p className="eyebrow" style={{ marginBottom: 12 }}>Booking confirmed</p>
              <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 600, fontSize: 20, color: 'var(--ink)', margin: '0 0 8px' }}>{svc.name}</p>
              <p className="text-body" style={{ margin: '0 0 20px' }}>Tomorrow at {slot} for {name || 'you'} · {svc.price} · {svc.dur}<br />Farwa Beauty Salon, Block 3 PECHS, Karachi. Cancel free up to 2 hours before.</p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Button variant="secondary" onClick={() => { setStep(0); setCat(null); setSvc(null); setSlot(null); }}>Book another</Button>
                <window.WaCta href="https://wa.me/923222782254" from="kit-book-confirm" className="link-underline" style={{ alignSelf: 'center', fontFamily: 'var(--font-inter)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--stone)', textDecoration: 'none' }}>WhatsApp us</window.WaCta>
                <a href="index.html" className="link-underline" style={{ alignSelf: 'center', fontFamily: 'var(--font-inter)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--stone)', textDecoration: 'none' }}>Back to home</a>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

Object.assign(window, { BookScreen });
