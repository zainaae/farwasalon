/* @ds-bundle: {"format":4,"namespace":"FarwaSalonDesignSystem_f6c92b","components":[{"name":"Navbar","sourcePath":"components/chrome/Navbar.jsx"},{"name":"ProofStrip","sourcePath":"components/chrome/ProofStrip.jsx"},{"name":"ReviewProof","sourcePath":"components/chrome/ReviewProof.jsx"},{"name":"StickyMobileCTA","sourcePath":"components/chrome/StickyMobileCTA.jsx"},{"name":"WordmarkDivider","sourcePath":"components/chrome/WordmarkDivider.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"CardLink","sourcePath":"components/core/CardLink.jsx"},{"name":"InputField","sourcePath":"components/core/InputField.jsx"},{"name":"QuickPickCard","sourcePath":"components/core/QuickPickCard.jsx"},{"name":"TabPill","sourcePath":"components/core/TabPill.jsx"},{"name":"ArrowUpRight","sourcePath":"components/icons/ArrowUpRight.jsx"},{"name":"IgIcon","sourcePath":"components/icons/IgIcon.jsx"},{"name":"StarRating","sourcePath":"components/icons/StarRating.jsx"},{"name":"UrduSignature","sourcePath":"components/icons/UrduSignature.jsx"},{"name":"MenuRow","sourcePath":"components/menu/MenuRow.jsx"}],"sourceHashes":{"components/chrome/Navbar.jsx":"929b8d461721","components/chrome/ProofStrip.jsx":"4deebe6961d1","components/chrome/ReviewProof.jsx":"13df3cadce5c","components/chrome/StickyMobileCTA.jsx":"de0c796c017c","components/chrome/WordmarkDivider.jsx":"cc000a08ce55","components/core/Button.jsx":"9e26ab4cada0","components/core/CardLink.jsx":"eada741e3b04","components/core/InputField.jsx":"c07105dd5f51","components/core/QuickPickCard.jsx":"4f873404a4bb","components/core/TabPill.jsx":"8be25696196c","components/icons/ArrowUpRight.jsx":"ae7eca177d8f","components/icons/IgIcon.jsx":"ee32eb54c0c1","components/icons/StarRating.jsx":"035347514734","components/icons/UrduSignature.jsx":"f8e5192f3b65","components/menu/MenuRow.jsx":"1abec5b3ead1","ui_kits/website/Book.jsx":"055956f8b265","ui_kits/website/Home.jsx":"f6f06856bbb7","ui_kits/website/Services.jsx":"d94163322ca2","ui_kits/website/Shared.jsx":"e4ffa5ed63f5","ui_kits/website/data.js":"2ddf44f347e9"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.FarwaSalonDesignSystem_f6c92b = window.FarwaSalonDesignSystem_f6c92b || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/chrome/Navbar.jsx
try { (() => {
const LINKS = ['Home', 'Services', 'Prices', 'Gallery', 'Blog', 'About', 'FAQ', 'Contact'];

/** Fixed site header. light=true â†’ white/95 blur bar (scrolled / interior pages);
 *  light=false â†’ ink/35 blur over a dark hero. Static positioning so it composes;
 *  wrap with position:fixed;top:0 in a full page. Pass logoSrc (assets/logo.jpg)
 *  for the image mark; otherwise renders the FARWA wordmark. */
function Navbar({
  light = true,
  active = 'Home',
  links = LINKS,
  logoSrc,
  onNavigate
}) {
  const linkColor = l => {
    if (l === active) return light ? 'var(--ink)' : '#fff';
    return light ? 'var(--stone)' : 'rgba(255,255,255,0.65)';
  };
  return /*#__PURE__*/React.createElement("header", {
    style: {
      width: '100%',
      zIndex: 100,
      backdropFilter: 'blur(12px)',
      background: light ? 'rgba(255,255,255,0.95)' : 'rgba(13,13,13,0.35)',
      borderBottom: `1px solid ${light ? 'var(--border-soft)' : 'rgba(255,255,255,0.08)'}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '80rem',
      margin: '0 auto',
      padding: '0 1.5rem',
      height: 56,
      display: 'grid',
      gridTemplateColumns: '1fr auto 1fr',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault(),
    style: {
      justifySelf: 'start',
      display: 'inline-flex',
      alignItems: 'center',
      height: 44,
      textDecoration: 'none'
    }
  }, light && logoSrc ? /*#__PURE__*/React.createElement("img", {
    src: logoSrc,
    alt: "Farwa Beauty Salon",
    style: {
      height: 28,
      width: 'auto',
      objectFit: 'contain'
    }
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-unbounded)',
      fontWeight: 700,
      fontSize: 13,
      letterSpacing: '0.16em',
      color: light ? 'var(--ink)' : '#fff'
    }
  }, "FARWA")), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      height: 44
    },
    "aria-label": "Main navigation"
  }, links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l,
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNavigate?.(l);
    },
    style: {
      fontFamily: 'var(--font-inter)',
      fontSize: 11,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      fontWeight: 500,
      textDecoration: 'none',
      whiteSpace: 'nowrap',
      color: linkColor(l),
      borderBottom: l === active ? `1px solid ${light ? 'var(--ink)' : 'var(--accent-gold)'}` : '1px solid transparent',
      paddingBottom: 2,
      transition: 'color .2s ease'
    }
  }, l))), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNavigate?.('Book');
    },
    style: {
      justifySelf: 'end',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      height: 44,
      padding: '0 20px',
      fontFamily: 'var(--font-inter)',
      fontSize: 12,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      fontWeight: 600,
      textDecoration: 'none',
      borderRadius: 2,
      whiteSpace: 'nowrap',
      transition: 'background-color .3s ease',
      ...(light ? {
        background: 'var(--ink)',
        color: '#fff',
        border: '1px solid var(--ink)'
      } : {
        background: 'transparent',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.7)'
      })
    }
  }, "Book an Appointment")));
}
Object.assign(__ds_scope, { Navbar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/chrome/Navbar.jsx", error: String((e && e.message) || e) }); }

// components/chrome/ProofStrip.jsx
try { (() => {
/** Dark trust band under the hero: rating · years · volume · services.
 *  Real, checkable numbers only. Defaults match FARWA_GBP_STATS / production (19 reviews, 102 services). */
function ProofStrip({
  items
}) {
  const data = items || typeof window !== 'undefined' && window.FARWA_PROOF_ITEMS || [{
    lead: '4.6★',
    label: '19 Google reviews'
  }, {
    lead: '18+',
    label: 'Years in PECHS'
  }, {
    lead: '1,000+',
    label: 'Appointments a month'
  }, {
    lead: '102',
    label: 'Services, every price printed'
  }];
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      background: 'var(--ink)',
      borderTop: '1px solid rgba(255,255,255,0.1)'
    },
    "aria-label": "Why clients choose Farwa"
  }, /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: 'none',
      margin: '0 auto',
      maxWidth: '80rem',
      padding: '18px 1.5rem',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px 40px'
    }
  }, data.map(({
    lead,
    label
  }, i) => /*#__PURE__*/React.createElement("li", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 40
    }
  }, i > 0 && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: 1,
      height: 24,
      background: 'rgba(255,255,255,0.15)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'baseline',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-unbounded)',
      fontWeight: 700,
      color: '#fff',
      fontSize: 16,
      lineHeight: 1,
      fontVariantNumeric: 'tabular-nums'
    }
  }, lead), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'rgba(255,255,255,0.7)',
      fontSize: 12,
      fontFamily: 'var(--font-inter)',
      lineHeight: 1
    }
  }, label))))));
}
Object.assign(__ds_scope, { ProofStrip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/chrome/ProofStrip.jsx", error: String((e && e.message) || e) }); }
// components/chrome/ReviewProof.jsx
try { (() => {
/** Square-mat photo proof + rating + trust line.
 *  Below the fold only — never the default under the home hero (use ProofStrip).
 *  Brand is square; mats stay square (see .avatar-strip). */
function ReviewProof({
  images = [],
  rating = '4.6★',
  line = '19 Google reviews · 1,000+ appointments a month',
  onDark = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "avatar-strip",
    style: {
      gap: 14,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex'
    }
  }, images.map((src, i) => /*#__PURE__*/React.createElement("img", {
    key: i,
    src: src,
    alt: "",
    style: {
      borderColor: onDark ? 'rgba(255,255,255,0.9)' : '#fff'
    }
  }))), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-unbounded)',
      fontWeight: 700,
      fontSize: 15,
      lineHeight: 1,
      color: onDark ? '#fff' : 'var(--ink)'
    }
  }, rating), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-inter)',
      fontSize: 11,
      fontWeight: 300,
      color: onDark ? 'rgba(255,255,255,0.7)' : 'var(--stone)'
    }
  }, line)));
}
Object.assign(__ds_scope, { ReviewProof });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/chrome/ReviewProof.jsx", error: String((e && e.message) || e) }); }
// components/chrome/WordmarkDivider.jsx
try { (() => {
/** Kinetic wordmark divider â€” "F Â· B Â· S âœ¦ Since 2008" between gold gradient hairlines. */
function WordmarkDivider() {
  return /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    style: {
      background: '#fff',
      borderTop: '1px solid var(--border-soft)',
      borderBottom: '1px solid var(--border-soft)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '80rem',
      margin: '0 auto',
      padding: '28px 2.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 32
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      height: 1,
      background: 'linear-gradient(to right, transparent, rgba(201,169,138,0.5), #c9a98a)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-unbounded)',
      fontWeight: 700,
      color: 'var(--ink)',
      letterSpacing: '0.3em',
      fontSize: 12,
      flexShrink: 0
    }
  }, "F \xB7 B \xB7 S"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#c9a98a',
      fontSize: 12
    }
  }, "\u2726"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-unbounded)',
      fontStyle: 'italic',
      fontWeight: 400,
      color: 'var(--stone)',
      fontSize: 12,
      flexShrink: 0,
      letterSpacing: '0.02em'
    }
  }, "Since 2008"), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      height: 1,
      background: 'linear-gradient(to left, transparent, rgba(201,169,138,0.5), #c9a98a)'
    }
  })));
}
Object.assign(__ds_scope, { WordmarkDivider });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/chrome/WordmarkDivider.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Farwa primary/secondary button â€” square, uppercase, tracked Inter 600.
 *  Matches .btn-primary/.btn-secondary in app/globals.css. */
function Button({
  variant = 'primary',
  arrow = false,
  children,
  className = '',
  as = 'button',
  href,
  ...rest
}) {
  const cls = `${variant === 'secondary' ? 'btn-secondary' : 'btn-primary'} ${className}`;
  const arrowSvg = arrow ? /*#__PURE__*/React.createElement("svg", {
    width: "15",
    height: "15",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M7 7h10v10"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 17 17 7"
  })) : null;
  if (as === 'a' || href) return /*#__PURE__*/React.createElement("a", _extends({
    href: href || '#',
    className: cls
  }, rest), children, arrowSvg);
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    className: cls
  }, rest), children, arrowSvg);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/CardLink.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Small link row on soft ground with trailing arrow. */
function CardLink({
  children,
  href = '#',
  ...rest
}) {
  return /*#__PURE__*/React.createElement("a", _extends({
    href: href,
    className: "card-link"
  }, rest), /*#__PURE__*/React.createElement("span", null, children), /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M7 7h10v10"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 17 17 7"
  })));
}
Object.assign(__ds_scope, { CardLink });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/CardLink.jsx", error: String((e && e.message) || e) }); }

// components/core/InputField.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Form input â€” square, hairline border, ink ring on focus. */
function InputField({
  label,
  id,
  hint,
  className = '',
  ...rest
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\W+/g, '-') : undefined);
  return /*#__PURE__*/React.createElement("div", {
    className: className
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      display: 'block',
      fontFamily: 'var(--font-inter)',
      fontSize: 10,
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
      fontWeight: 500,
      color: 'var(--ink)',
      marginBottom: 8
    }
  }, label), /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    className: "input-field"
  }, rest)), hint && /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-inter)',
      fontSize: 11,
      fontWeight: 300,
      color: 'var(--stone)',
      margin: '6px 0 0'
    }
  }, hint));
}
Object.assign(__ds_scope, { InputField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/InputField.jsx", error: String((e && e.message) || e) }); }

// components/core/QuickPickCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Quick-pick category shortcut card (home page grid). */
function QuickPickCard({
  title,
  meta = 'View options',
  all = false,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("a", _extends({
    href: "#",
    onClick: e => e.preventDefault(),
    className: `tap-safe quick-pick-card ${all ? 'quick-pick-card--all' : ''}`
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-syne)',
      fontWeight: 700,
      fontSize: 12,
      color: 'var(--ink)',
      textTransform: 'uppercase',
      lineHeight: 1.2,
      width: '100%'
    }
  }, title), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-inter)',
      fontSize: 10,
      fontWeight: 500,
      color: all ? 'var(--stone)' : 'var(--accent-gold-deep)',
      width: '100%'
    }
  }, meta));
}
Object.assign(__ds_scope, { QuickPickCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/QuickPickCard.jsx", error: String((e && e.message) || e) }); }

// components/core/TabPill.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Filter chip â€” uppercase 11px Inter 500. Active = ink fill. */
function TabPill({
  active = false,
  children,
  className = '',
  ...rest
}) {
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    className: `tab-pill ${active ? 'tab-pill-active' : ''} ${className}`
  }, rest), children);
}
Object.assign(__ds_scope, { TabPill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/TabPill.jsx", error: String((e && e.message) || e) }); }

// components/icons/ArrowUpRight.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** The brand's ubiquitous CTA arrow (â†—). Decorative by default. */
function ArrowUpRight({
  size = 15,
  className = '',
  label
}) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    className: className,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, label ? {
    role: 'img',
    'aria-label': label
  } : {
    'aria-hidden': 'true'
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 7h10v10"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 17 17 7"
  }));
}
Object.assign(__ds_scope, { ArrowUpRight });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/icons/ArrowUpRight.jsx", error: String((e && e.message) || e) }); }

// components/chrome/StickyMobileCTA.jsx
try { (() => {
/** Mobile sticky bottom bar: Call / WhatsApp / Book on a dark blurred pill.
 *  Static here â€” wrap with position:fixed;bottom in a real page. */
function StickyMobileCTA({
  slotLabel = 'Today 3:00 PM',
  showSlotHint = true
}) {
  const item = {
    flex: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    fontWeight: 500,
    fontFamily: 'var(--font-inter)',
    padding: '10px 0',
    minHeight: 44,
    textDecoration: 'none'
  };
  return /*#__PURE__*/React.createElement("nav", {
    "aria-label": "Quick contact and booking",
    style: {
      maxWidth: 380,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 8,
      background: 'rgba(13,13,13,0.92)',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 10px 15px -3px rgba(13,13,13,0.25)',
      border: '1px solid rgba(255,255,255,0.08)',
      overflow: 'hidden'
    }
  }, showSlotHint && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      padding: '6px 12px 0',
      textAlign: 'center',
      fontSize: 8.5,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.4)',
      fontFamily: 'var(--font-inter)',
      lineHeight: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-block',
      width: 4,
      height: 4,
      borderRadius: 999,
      marginRight: 6,
      verticalAlign: 'middle',
      background: '#9cd48c'
    }
  }), "Next slot ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'rgba(255,255,255,0.7)',
      fontWeight: 500
    }
  }, slotLabel)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'stretch',
      gap: 2,
      padding: 4
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault(),
    style: item
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
  })), "Call"), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: 1,
      background: 'rgba(255,255,255,0.1)',
      margin: '8px 0'
    }
  }), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault(),
    style: item
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M7.9 20A9 9 0 1 0 4 16.1L2 22Z"
  })), "WhatsApp"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault(),
    style: {
      ...item,
      flex: 1.3,
      background: '#fff',
      color: 'var(--ink)',
      fontWeight: 600,
      letterSpacing: '0.14em',
      borderRadius: 6
    }
  }, "Book", /*#__PURE__*/React.createElement(__ds_scope.ArrowUpRight, {
    size: 14
  })))));
}
Object.assign(__ds_scope, { StickyMobileCTA });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/chrome/StickyMobileCTA.jsx", error: String((e && e.message) || e) }); }

// components/icons/IgIcon.jsx
try { (() => {
/** Instagram glyph â€” custom stroke icon from src/shared-chrome.jsx. */
function IgIcon({
  size = 16,
  className = ''
}) {
  return /*#__PURE__*/React.createElement("svg", {
    "aria-hidden": "true",
    width: size,
    height: size,
    className: className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "2",
    width: "20",
    height: "20",
    rx: "5",
    ry: "5"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "4.5"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "17.5",
    cy: "6.5",
    r: "0.5",
    fill: "currentColor",
    stroke: "none"
  }));
}
Object.assign(__ds_scope, { IgIcon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/icons/IgIcon.jsx", error: String((e && e.message) || e) }); }

// components/icons/StarRating.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const STAR = 'M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z';

/** Five filled stars as ONE svg (review cards). Decorative by default. */
function StarRating({
  count = 5,
  size = 8,
  className = '',
  label
}) {
  const gap = size * 0.25;
  const width = count * size + (count - 1) * gap;
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: width,
    height: size,
    viewBox: `0 0 ${width} ${size}`,
    className: className,
    fill: "currentColor"
  }, label ? {
    role: 'img',
    'aria-label': label
  } : {
    'aria-hidden': 'true'
  }), Array.from({
    length: count
  }, (_, i) => /*#__PURE__*/React.createElement("g", {
    key: i,
    transform: `translate(${i * (size + gap)},0) scale(${size / 24})`
  }, /*#__PURE__*/React.createElement("path", {
    d: STAR
  }))));
}
Object.assign(__ds_scope, { StarRating });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/icons/StarRating.jsx", error: String((e && e.message) || e) }); }

// components/icons/UrduSignature.jsx
try { (() => {
/** "ÙØ±ÙˆØ§ Ø¨ÛŒÙˆÙ¹ÛŒ Ø³ÛŒÙ„ÙˆÙ†" in Noto Nastaliq Urdu â€” footer/brand signature. */
function UrduSignature({
  className = '',
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: `font-nastaliq ${className}`,
    dir: "rtl",
    lang: "ur",
    "aria-label": "Farwa Beauty Salon in Urdu",
    style: {
      fontSize: '1.1em',
      ...style
    }
  }, "\u0641\u0631\u0648\u0627 \u0628\u06CC\u0648\u0679\u06CC \u0633\u06CC\u0644\u0648\u0646");
}
Object.assign(__ds_scope, { UrduSignature });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/icons/UrduSignature.jsx", error: String((e && e.message) || e) }); }

// components/menu/MenuRow.jsx
try { (() => {
/** Priced service-category row from the /services couture menu â€” photo in a
 *  white mat, Syne name + tagline, count/availability, "from Rs X" price. */
function MenuRow({
  img,
  name,
  tagline,
  count,
  availability,
  fromPrice,
  popular = false,
  onClick
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onClick?.();
    },
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'grid',
      gridTemplateColumns: '4.5rem minmax(0,1fr) auto auto',
      alignItems: 'center',
      columnGap: 24,
      padding: '20px 12px',
      margin: '0 -12px',
      borderBottom: '1px solid var(--border-soft)',
      textDecoration: 'none',
      background: hover ? 'rgba(248,245,241,0.7)' : 'transparent',
      transition: 'background-color .3s ease'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'block',
      width: '4.5rem',
      height: '5.4rem',
      border: '1px solid var(--border-soft)',
      padding: 3,
      background: '#fff',
      overflow: 'hidden'
    }
  }, img ? /*#__PURE__*/React.createElement("img", {
    src: img,
    alt: "",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transform: hover ? 'scale(1.05)' : 'scale(1)',
      transition: 'transform .7s ease'
    }
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      width: '100%',
      height: '100%',
      background: 'var(--nude)'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'baseline',
      gap: '4px 12px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-syne)',
      fontWeight: 600,
      color: 'var(--ink)',
      fontSize: 19,
      lineHeight: 1.2
    }
  }, name), popular && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      fontWeight: 600,
      fontFamily: 'var(--font-inter)',
      color: 'var(--berry, #9e2a52)'
    }
  }, "Most booked")), tagline && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      color: 'var(--stone)',
      fontSize: 13,
      fontWeight: 300,
      fontFamily: 'var(--font-inter)',
      lineHeight: 1.4,
      marginTop: 2
    }
  }, tagline)), /*#__PURE__*/React.createElement("span", {
    style: {
      textAlign: 'right',
      alignSelf: 'center',
      color: 'var(--stone)',
      fontSize: 11,
      fontFamily: 'var(--font-inter)',
      whiteSpace: 'nowrap'
    }
  }, count != null ? `${count} services` : '', availability ? ` Â· ${availability.toLowerCase()}` : ''), /*#__PURE__*/React.createElement("span", {
    style: {
      textAlign: 'right',
      flexShrink: 0
    }
  }, fromPrice && /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 10,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      fontFamily: 'var(--font-inter)',
      color: 'var(--stone)'
    }
  }, "from"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontFamily: 'var(--font-unbounded)',
      fontWeight: 700,
      color: 'var(--ink)',
      fontSize: 17,
      lineHeight: 1.2,
      fontVariantNumeric: 'tabular-nums'
    }
  }, fromPrice))));
}
Object.assign(__ds_scope, { MenuRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/menu/MenuRow.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Book.jsx
try { (() => {
/* Book screen — recreation of farwasalon.com/book (category → service → time → confirm).
   title-stack / display-page — not page-level staccato. */
const DS_book = window.FarwaSalonDesignSystem_f6c92b;
function BookScreen() {
  const {
    Button,
    InputField
  } = DS_book;
  const D = window.FARWA_DATA;
  const bookable = Object.keys(D.services);
  const [step, setStep] = React.useState(0);
  const [cat, setCat] = React.useState(null);
  const [svc, setSvc] = React.useState(null);
  const [slot, setSlot] = React.useState(null);
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const stepLabel = ['Choose a category', 'Choose a service', 'Pick a time', 'Your details'][step];
  const catBtn = {
    width: '100%',
    padding: '1rem',
    textAlign: 'left',
    border: '1px solid var(--border-soft)',
    background: '#fff',
    cursor: 'pointer',
    transition: 'border-color .2s ease, background-color .2s ease'
  };
  const slotBtn = active => ({
    minHeight: 44,
    padding: '10px 12px',
    fontFamily: 'var(--font-inter)',
    fontSize: 12,
    cursor: 'pointer',
    border: `1px solid ${active ? 'var(--ink)' : 'var(--border-soft)'}`,
    background: active ? 'var(--ink)' : '#fff',
    color: active ? '#fff' : 'var(--ink)',
    transition: 'all .2s ease'
  });
  const back = () => setStep(Math.max(0, step - 1));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--mist)',
      minHeight: '100vh'
    }
  }, /*#__PURE__*/React.createElement(window.FixedNav, {
    light: true,
    active: "Book"
  }), /*#__PURE__*/React.createElement("main", {
    "data-screen-label": "Booking flow",
    style: {
      paddingTop: 56
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-shell section-pad",
    style: {
      maxWidth: '46rem'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "title-stack",
    style: {
      marginBottom: 28
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "eyebrow"
  }, "Online booking \xB7 Mon\u2013Sat 11:00\u201319:00"), /*#__PURE__*/React.createElement("h1", {
    className: "display-page",
    style: {
      margin: 0,
      color: 'var(--ink)',
      fontSize: 'clamp(1.75rem,3.5vw,2.75rem)'
    }
  }, step < 4 ? 'Book an appointment' : 'Booking confirmed'), step < 4 && /*#__PURE__*/React.createElement("p", {
    className: "text-body",
    style: {
      marginTop: 4
    }
  }, "Step ", step + 1, " of 4 \u2014 ", stepLabel, ". No prepayment; cancel free up to 2 hours before.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      marginBottom: 28
    }
  }, [0, 1, 2, 3].map(i => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      flex: 1,
      height: 2,
      background: i <= step ? 'var(--ink)' : 'var(--border-soft)',
      transition: 'background-color .3s ease'
    }
  }))), step === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 8
    }
  }, bookable.map(c => /*#__PURE__*/React.createElement("button", {
    key: c,
    style: catBtn,
    onClick: () => {
      setCat(c);
      setSvc(null);
      setStep(1);
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontFamily: 'var(--font-syne)',
      fontWeight: 600,
      fontSize: 15,
      color: 'var(--ink)',
      marginBottom: 2
    }
  }, c), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-inter)',
      fontSize: 11,
      fontWeight: 300,
      color: 'var(--stone)'
    }
  }, D.services[c].length, " services \xB7 from ", D.services[c][0].price)))), step === 1 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, D.services[cat].map(s => /*#__PURE__*/React.createElement("button", {
    key: s.name,
    style: {
      ...catBtn,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      gap: 12
    },
    onClick: () => {
      setSvc(s);
      setStep(2);
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-inter)',
      fontWeight: 400,
      fontSize: 14,
      color: 'var(--ink)'
    }
  }, s.name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-inter)',
      fontSize: 12,
      fontWeight: 500,
      color: 'var(--accent-gold-deep)',
      whiteSpace: 'nowrap'
    }
  }, s.price, " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'rgba(107,95,87,0.5)'
    }
  }, "\xB7"), " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--stone)',
      fontWeight: 300
    }
  }, s.dur)))), /*#__PURE__*/React.createElement("button", {
    onClick: back,
    className: "link-underline",
    style: {
      alignSelf: 'flex-start',
      marginTop: 8,
      background: 'none',
      border: 0,
      cursor: 'pointer',
      fontFamily: 'var(--font-inter)',
      fontSize: 11,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: 'var(--stone)'
    }
  }, "\u2190 Back")), step === 2 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      border: '1px solid var(--border-soft)',
      padding: '12px 16px',
      marginBottom: 20,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-syne)',
      fontWeight: 600,
      fontSize: 14,
      color: 'var(--ink)'
    }
  }, svc.name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-inter)',
      fontSize: 12,
      color: 'var(--accent-gold-deep)',
      fontWeight: 500
    }
  }, svc.price, " \xB7 ", svc.dur)), /*#__PURE__*/React.createElement("p", {
    className: "eyebrow",
    style: {
      marginBottom: 10
    }
  }, "Tomorrow \xB7 available times"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 8
    }
  }, D.slots.map(t => /*#__PURE__*/React.createElement("button", {
    key: t,
    style: slotBtn(slot === t),
    onClick: () => setSlot(t)
  }, t))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      marginTop: 24,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    disabled: !slot,
    onClick: () => slot && setStep(3),
    style: {
      opacity: slot ? 1 : 0.4
    }
  }, "Continue"), /*#__PURE__*/React.createElement("button", {
    onClick: back,
    className: "link-underline",
    style: {
      background: 'none',
      border: 0,
      cursor: 'pointer',
      fontFamily: 'var(--font-inter)',
      fontSize: 11,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: 'var(--stone)'
    }
  }, "\u2190 Back"))), step === 3 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 18,
      maxWidth: '26rem'
    }
  }, /*#__PURE__*/React.createElement(InputField, {
    label: "Your name",
    placeholder: "Ayesha Khan",
    value: name,
    onChange: e => setName(e.target.value)
  }), /*#__PURE__*/React.createElement(InputField, {
    label: "Phone",
    placeholder: "03XX XXXXXXX",
    hint: "Pakistani mobile format",
    value: phone,
    onChange: e => setPhone(e.target.value)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      border: '1px solid var(--border-soft)',
      padding: '12px 16px',
      fontFamily: 'var(--font-inter)',
      fontSize: 12,
      color: 'var(--stone)',
      lineHeight: 1.7
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink)',
      fontWeight: 500
    }
  }, svc.name), " \u2014 ", svc.price, " \xB7 ", svc.dur, /*#__PURE__*/React.createElement("br", null), "Tomorrow at ", slot, " \xB7 Block 3 PECHS, Karachi"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    arrow: true,
    onClick: () => setStep(4),
    style: {
      opacity: name && phone ? 1 : 0.4
    },
    disabled: !name || !phone
  }, "Confirm booking"), /*#__PURE__*/React.createElement("button", {
    onClick: back,
    className: "link-underline",
    style: {
      background: 'none',
      border: 0,
      cursor: 'pointer',
      fontFamily: 'var(--font-inter)',
      fontSize: 11,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: 'var(--stone)'
    }
  }, "\u2190 Back"))), step === 4 && /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      border: '1px solid var(--border-soft)',
      boxShadow: 'var(--shadow-card)',
      padding: '32px'
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "eyebrow",
    style: {
      marginBottom: 12
    }
  }, "Booking confirmed"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-syne)',
      fontWeight: 600,
      fontSize: 20,
      color: 'var(--ink)',
      margin: '0 0 8px'
    }
  }, svc.name), /*#__PURE__*/React.createElement("p", {
    className: "text-body",
    style: {
      margin: '0 0 20px'
    }
  }, "Tomorrow at ", slot, " for ", name || 'you', " \xB7 ", svc.price, " \xB7 ", svc.dur, /*#__PURE__*/React.createElement("br", null), "Farwa Beauty Salon, Block 3 PECHS, Karachi. Cancel free up to 2 hours before."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: () => {
      setStep(0);
      setCat(null);
      setSvc(null);
      setSlot(null);
    }
  }, "Book another"), /*#__PURE__*/React.createElement(window.WaCta, {
    href: "https://wa.me/923222782254",
    from: "kit-book-confirm",
    className: "link-underline",
    style: {
      alignSelf: 'center',
      fontFamily: 'var(--font-inter)',
      fontSize: 11,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: 'var(--stone)',
      textDecoration: 'none'
    }
  }, "WhatsApp us"), /*#__PURE__*/React.createElement("a", {
    href: "index.html",
    className: "link-underline",
    style: {
      alignSelf: 'center',
      fontFamily: 'var(--font-inter)',
      fontSize: 11,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: 'var(--stone)',
      textDecoration: 'none'
    }
  }, "Back to home"))))));
}
Object.assign(window, {
  BookScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Book.jsx", error: String((e && e.message) || e) }); }
// ui_kits/website/Home.jsx
try { (() => {
/* Home kit — Farwa brand-first (aligned to production hero + honest proof).
   Quoti leftovers removed: staccato slogan, circular avatars in hero, plum
   gradient finale, excess edge-tears, invented review counts. */
const DS_home = window.FarwaSalonDesignSystem_f6c92b;

/** Same figures as production ProofStrip / FARWA_GBP_STATS (19 reviews, 102 services). */
const PROOF_ITEMS = window.FARWA_PROOF_ITEMS || [{
  lead: '4.6★',
  label: '19 Google reviews'
}, {
  lead: '18+',
  label: 'Years in PECHS'
}, {
  lead: '1,000+',
  label: 'Appointments a month'
}, {
  lead: '102',
  label: 'Services, every price printed'
}];
function HomeHero() {
  return /*#__PURE__*/React.createElement("section", {
    "data-screen-label": "Home hero",
    className: "grain grain--on-dark",
    style: {
      position: 'relative',
      width: '100%',
      height: '100svh',
      minHeight: 560,
      maxHeight: 1100,
      overflow: 'hidden',
      background: '#0d0609'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/bridal2.jpg",
    alt: "Bridal makeup and beauty styling at Farwa Beauty Salon",
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: '68% 28%',
      transform: 'scale(1.01)',
      zIndex: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(to top, rgba(13,6,9,0.9) 0%, rgba(13,6,9,0.48) 26%, rgba(13,6,9,0.10) 58%, rgba(13,6,9,0.24) 100%), linear-gradient(to right, rgba(13,6,9,0.66) 0%, rgba(13,6,9,0.36) 30%, rgba(13,6,9,0.06) 60%, rgba(13,6,9,0) 78%)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      padding: '0 2.5rem 3.5rem',
      textShadow: '0 1px 14px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.2)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '96rem',
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "hero-lcp",
    style: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: 11,
      letterSpacing: '0.3em',
      textTransform: 'uppercase',
      fontFamily: 'var(--font-inter)',
      margin: '0 0 22px'
    }
  }, "Farwa Beauty Salon \xB7 Est. 2008"), /*#__PURE__*/React.createElement("h1", {
    className: "hero-lcp",
    style: {
      color: '#fff',
      margin: '0 0 16px',
      maxWidth: '13ch',
      fontFamily: 'var(--font-unbounded)',
      fontWeight: 700,
      fontSize: 'clamp(2.5rem, 8.8vw, 6.75rem)',
      lineHeight: 1.05,
      letterSpacing: '-0.03em'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontWeight: 700
    }
  }, "Beauty Salon in PECHS"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontWeight: 400,
      marginTop: 4
    }
  }, "Karachi")), /*#__PURE__*/React.createElement("p", {
    className: "hero-lcp",
    style: {
      color: 'rgba(255,255,255,0.9)',
      margin: '0 0 28px',
      fontFamily: 'var(--font-unbounded)',
      fontSize: 'clamp(1.05rem, 3.2vw, 1.75rem)',
      letterSpacing: '-0.01em',
      lineHeight: 1.2,
      maxWidth: '22ch'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontWeight: 700
    }
  }, "Bridal. Hair. Skin."), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontWeight: 400,
      color: 'rgba(255,255,255,0.85)'
    }
  }, "Rubina\u2019s studio"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontWeight: 700
    }
  }, "since 2008.")), /*#__PURE__*/React.createElement("div", {
    className: "hero-fade-up",
    style: {
      animationDelay: '0.25s',
      display: 'flex',
      alignItems: 'center',
      gap: 28,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "book.html",
    className: "btn-loud btn-loud--light",
    style: {
      textShadow: 'none'
    }
  }, "Book an Appointment", /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M7 7h10v10"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 17 17 7"
  }))), /*#__PURE__*/React.createElement("a", {
    href: "services.html",
    className: "link-underline",
    style: {
      color: 'rgba(255,255,255,0.75)',
      fontSize: 13,
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      fontFamily: 'var(--font-inter)',
      textDecoration: 'none'
    }
  }, "Explore Services")))));
}
function ProblemBand() {
  const problems = [['Prices you only learn at the counter', 'Most salons make you ask. Every one of our 100+ services has its starting price printed — from Rs 100 — before you book.'], ['Back-and-forth to get a slot', '"Are you free Tuesday?" "What does it cost?" Each message is another day of waiting. Pick a live slot online instead.'], ['Walk-ins mean waiting', 'A booked slot is yours. Two stations, real availability, cancel free up to 2 hours before.']];
  /* One tear into the ink band only — stays under the DS "max 2" budget with the finale. */
  return /*#__PURE__*/React.createElement("div", {
    "data-screen-label": "Problem band"
  }, /*#__PURE__*/React.createElement("span", {
    className: "edge-tear",
    style: {
      color: '#0d0d0d',
      background: 'var(--mist)'
    },
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("section", {
    className: "grain grain--on-dark",
    style: {
      background: 'var(--ink)',
      padding: '80px 0 88px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-shell"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "display-section",
    style: {
      color: '#fff',
      margin: '0 0 12px',
      maxWidth: '18ch',
      fontSize: 'clamp(1.75rem,3.6vw,3.4rem)'
    }
  }, "The hardest part isn\u2019t the service."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-unbounded)',
      fontWeight: 400,
      color: 'var(--accent-gold)',
      fontSize: 'clamp(1rem,1.8vw,1.4rem)',
      margin: '0 0 56px'
    }
  }, "It\u2019s everything around it."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '40px 48px'
    }
  }, problems.map(([t, l], i) => /*#__PURE__*/React.createElement("div", {
    key: t,
    style: {
      borderTop: '1px solid rgba(255,255,255,0.15)',
      paddingTop: 24
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-unbounded)',
      fontSize: 10,
      color: 'var(--accent-gold)',
      letterSpacing: '0.1em'
    }
  }, '0' + (i + 1)), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-syne)',
      fontWeight: 600,
      color: '#fff',
      fontSize: 17,
      margin: '12px 0 12px',
      lineHeight: 1.35
    }
  }, t), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-inter)',
      fontWeight: 300,
      color: 'rgba(255,255,255,0.65)',
      fontSize: 13.5,
      lineHeight: 1.7,
      margin: 0
    }
  }, l)))))));
}
function StickyStory() {
  const steps = [{
    n: '01',
    t: 'Pick your service',
    l: 'Thirteen specialities, every starting price printed. No calling to ask what a facial costs — it says Rs 1,400 right on the menu.',
    img: '../../assets/glow.jpg'
  }, {
    n: '02',
    t: 'Pick a live slot',
    l: 'Real availability, Mon–Sat 11:00–19:00. Book in under a minute; cancel free up to 2 hours before. No prepayment.',
    img: '../../assets/pedicure.jpg'
  }, {
    n: '03',
    t: 'Walk in, sit down',
    l: 'We confirm the work before we start. Printed PKR, no surprise add-ons — leave when you feel ready.',
    img: '../../assets/threading.jpg'
  }];
  const [active, setActive] = React.useState(0);
  const refs = React.useRef([]);
  React.useEffect(() => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) setActive(Number(e.target.dataset.i));
      });
    }, {
      rootMargin: '-40% 0px -40% 0px'
    });
    refs.current.forEach(el => el && io.observe(el));
    return () => io.disconnect();
  }, []);
  return /*#__PURE__*/React.createElement("section", {
    "data-screen-label": "How booking works",
    style: {
      background: 'var(--mist)',
      padding: '88px 0 48px',
      borderTop: '1px solid var(--border-soft)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-shell"
  }, /*#__PURE__*/React.createElement("p", {
    className: "eyebrow",
    style: {
      marginBottom: 14
    }
  }, "How booking works"), /*#__PURE__*/React.createElement("h2", {
    className: "display-section",
    style: {
      margin: '0 0 64px',
      fontSize: 'clamp(1.75rem,3.6vw,3.4rem)'
    }
  }, "Booked while you get on with your day"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 64,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", null, steps.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: s.n,
    "data-i": i,
    ref: el => refs.current[i] = el,
    style: {
      minHeight: '62vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      opacity: active === i ? 1 : 0.35,
      transition: 'opacity .4s var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-unbounded)',
      fontWeight: 700,
      fontSize: 13,
      color: 'var(--accent-gold-deep)'
    }
  }, s.n), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-unbounded)',
      fontWeight: 700,
      color: 'var(--ink)',
      fontSize: 'clamp(1.4rem,2.4vw,2.1rem)',
      letterSpacing: '-0.02em',
      margin: '12px 0 14px',
      lineHeight: 1.15
    }
  }, s.t), /*#__PURE__*/React.createElement("p", {
    className: "text-body",
    style: {
      maxWidth: '30rem',
      margin: '0 0 22px'
    }
  }, s.l), /*#__PURE__*/React.createElement("a", {
    href: "book.html",
    className: "link-underline",
    style: {
      alignSelf: 'flex-start',
      color: 'var(--ink)',
      fontSize: 12,
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      fontFamily: 'var(--font-inter)',
      fontWeight: 500,
      textDecoration: 'none'
    }
  }, "Book online \u2192")))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'sticky',
      top: 'calc(50vh - 260px)',
      height: 520
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      border: '1px solid var(--border-soft)',
      background: '#fff',
      padding: 4,
      height: '100%',
      boxShadow: 'var(--shadow-card)',
      position: 'relative',
      overflow: 'hidden'
    }
  }, steps.map((s, i) => /*#__PURE__*/React.createElement("img", {
    key: s.n,
    src: s.img,
    alt: "",
    style: {
      position: 'absolute',
      inset: 4,
      width: 'calc(100% - 8px)',
      height: 'calc(100% - 8px)',
      objectFit: 'cover',
      opacity: active === i ? 1 : 0,
      transition: 'opacity .5s var(--ease-out)'
    }
  })))))));
}
function QuickPickSection() {
  const {
    QuickPickCard,
    ArrowUpRight
  } = DS_home;
  const cats = window.FARWA_DATA.categories;
  return /*#__PURE__*/React.createElement("section", {
    "data-screen-label": "Quick pick",
    style: {
      background: 'var(--mist)',
      borderBottom: '1px solid var(--border-soft)',
      padding: '8px 0 56px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-shell"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      boxShadow: 'var(--shadow-card)',
      border: '1px solid var(--border-soft)',
      padding: '24px 28px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 16,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-syne)',
      fontWeight: 600,
      color: 'var(--ink)',
      fontSize: 18,
      margin: 0,
      lineHeight: 1
    }
  }, "Quick pick"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--stone)',
      fontSize: 11,
      fontFamily: 'var(--font-inter)',
      margin: 0
    }
  }, "Tap a service to start booking in one step")), /*#__PURE__*/React.createElement("a", {
    href: "services.html",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      color: 'var(--stone)',
      fontSize: 10,
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      fontFamily: 'var(--font-inter)',
      textDecoration: 'none'
    }
  }, "All ", /*#__PURE__*/React.createElement(ArrowUpRight, {
    size: 12
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, minmax(0,1fr))',
      gap: 8
    }
  }, cats.slice(0, 4).map(c => /*#__PURE__*/React.createElement(QuickPickCard, {
    key: c.name,
    title: c.name,
    meta: `From ${c.from}`,
    onClick: () => window.location.href = 'book.html'
  })), /*#__PURE__*/React.createElement(QuickPickCard, {
    title: "View all 13",
    meta: "Categories",
    all: true,
    onClick: () => window.location.href = 'services.html'
  })))));
}
function CtaFinale() {
  /* Ink band + hairline — not plum gradient theatre. One optional tear into ink. */
  return /*#__PURE__*/React.createElement("div", {
    "data-screen-label": "CTA finale"
  }, /*#__PURE__*/React.createElement("span", {
    className: "edge-tear",
    style: {
      color: 'var(--ink)',
      background: 'var(--mist)'
    },
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("section", {
    className: "grain grain--on-dark",
    style: {
      background: 'var(--ink)',
      padding: '80px 0 88px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-shell",
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      color: '#fff',
      margin: '0 auto 18px',
      fontFamily: 'var(--font-unbounded)',
      fontWeight: 700,
      fontSize: 'clamp(2rem, 5vw, 3.75rem)',
      lineHeight: 1.12,
      letterSpacing: '-0.02em',
      maxWidth: '18ch'
    }
  }, "Book online in under a minute"), /*#__PURE__*/React.createElement("p", {
    className: "text-body",
    style: {
      maxWidth: '36rem',
      margin: '0 auto 32px',
      color: 'rgba(255,255,255,0.75)'
    }
  }, "No prepayment. Cancel free up to 2 hours before. Or message us on WhatsApp \u2014 whichever is easier for you."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 16,
      justifyContent: 'center',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "book.html",
    className: "btn-loud btn-loud--light"
  }, "Book an Appointment", /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M7 7h10v10"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 17 17 7"
  }))), /*#__PURE__*/React.createElement(window.WaCta, {
    href: "https://wa.me/923222782254",
    from: "kit-home-finale",
    className: "btn-secondary",
    style: {
      minHeight: 56,
      padding: '1.2rem 2.2rem',
      fontSize: 13,
      color: '#fff',
      borderColor: 'rgba(255,255,255,0.7)',
      background: 'transparent'
    }
  }, "WhatsApp us")))));
}
function HomeScreen() {
  const {
    ProofStrip,
    WordmarkDivider
  } = DS_home;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff'
    }
  }, /*#__PURE__*/React.createElement(window.FixedNav, {
    light: false,
    active: "Home"
  }), /*#__PURE__*/React.createElement(HomeHero, null), /*#__PURE__*/React.createElement(ProofStrip, {
    items: PROOF_ITEMS
  }), /*#__PURE__*/React.createElement(QuickPickSection, null), /*#__PURE__*/React.createElement(ProblemBand, null), /*#__PURE__*/React.createElement(StickyStory, null), /*#__PURE__*/React.createElement(CtaFinale, null), /*#__PURE__*/React.createElement(WordmarkDivider, null), /*#__PURE__*/React.createElement(window.SiteFooter, null));
}
Object.assign(window, {
  HomeScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Home.jsx", error: String((e && e.message) || e) }); }
// ui_kits/website/Services.jsx
try { (() => {
/* Services screen — recreation of farwasalon.com/services (couture menu).
   title-stack / display-page — not page-level staccato. Ink finale, not nude staccato. */
const DS_svcs = window.FarwaSalonDesignSystem_f6c92b;
function ServicesScreen() {
  const {
    MenuRow,
    Button,
    TabPill
  } = DS_svcs;
  const D = window.FARWA_DATA;
  const [tab, setTab] = React.useState('All');
  const tabs = ['All', 'Bridal', 'Facials', 'Threading', 'Nails', 'Hair', 'Massage', 'Waxing'];
  const matches = c => tab === 'All' || c.name === tab || tab === 'Waxing' && c.name.includes('Wax');
  const chapters = D.chapters.map(ch => ({
    ...ch,
    cats: D.categories.filter(c => c.chapter === ch.name && matches(c))
  })).filter(ch => ch.cats.length);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(window.FixedNav, {
    light: true,
    active: "Services"
  }), /*#__PURE__*/React.createElement("main", {
    "data-screen-label": "Services menu",
    style: {
      paddingTop: 56
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-shell section-pad"
  }, /*#__PURE__*/React.createElement("div", {
    className: "title-stack",
    style: {
      borderBottom: '1px solid var(--border-soft)',
      paddingBottom: 32,
      marginBottom: 40
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "eyebrow"
  }, "Thirteen specialities \xB7 PECHS Karachi"), /*#__PURE__*/React.createElement("h1", {
    className: "display-page",
    style: {
      margin: 0,
      color: 'var(--ink)',
      fontSize: 'clamp(2rem,4vw,3.25rem)'
    }
  }, "Our services"), /*#__PURE__*/React.createElement("p", {
    className: "text-body",
    style: {
      maxWidth: '32rem',
      marginTop: 8
    }
  }, "100+ services \u2014 every starting price printed from Rs 100. Book online in under a minute, or message us on WhatsApp."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'center',
      marginTop: 24,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    href: "book.html",
    className: "btn-loud",
    style: {
      padding: '1rem 2rem'
    },
    arrow: true
  }, "Book online"), /*#__PURE__*/React.createElement(window.WaCta, {
    href: "https://wa.me/923222782254",
    from: "kit-services-hero",
    className: "btn-secondary",
    style: {
      padding: '0.625rem 1.25rem'
    }
  }, "WhatsApp"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault(),
    className: "link-underline",
    style: {
      color: 'var(--stone)',
      fontSize: 11,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      fontFamily: 'var(--font-inter)',
      textDecoration: 'none'
    }
  }, "Full price list")), /*#__PURE__*/React.createElement("ol", {
    style: {
      listStyle: 'none',
      margin: '32px 0 0',
      padding: '24px 0 0',
      borderTop: '1px solid var(--border-soft)',
      display: 'flex',
      gap: 32,
      flexWrap: 'wrap'
    }
  }, [['01', 'Book', 'Pick a service and a live slot online — or WhatsApp if you prefer.'], ['02', 'Visit', 'Come to the PECHS studio. We confirm the work before we start.'], ['03', 'Done', 'Printed PKR, no surprise add-ons — leave when you feel ready.']].map(([n, t, l]) => /*#__PURE__*/React.createElement("li", {
    key: n,
    style: {
      display: 'flex',
      gap: 12,
      maxWidth: '14rem'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-unbounded)',
      fontSize: 10,
      color: 'var(--accent-gold-deep)',
      paddingTop: 2
    }
  }, n), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontFamily: 'var(--font-syne)',
      fontWeight: 600,
      color: 'var(--ink)',
      fontSize: 14,
      marginBottom: 2
    }
  }, t), /*#__PURE__*/React.createElement("span", {
    className: "text-body",
    style: {
      display: 'block',
      fontSize: 12,
      lineHeight: 1.6
    }
  }, l)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      marginBottom: 8
    }
  }, tabs.map(t => /*#__PURE__*/React.createElement(TabPill, {
    key: t,
    active: tab === t,
    onClick: () => setTab(t)
  }, t))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '56rem'
    }
  }, chapters.map(({
    name,
    caption,
    cats
  }) => /*#__PURE__*/React.createElement("section", {
    key: name,
    "aria-label": name
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 16,
      paddingTop: 40,
      paddingBottom: 12,
      borderBottom: '1px solid rgba(13,13,13,0.3)'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "section-title",
    style: {
      margin: 0,
      color: 'var(--accent-gold-deep)'
    }
  }, name), /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, caption)), cats.map(c => /*#__PURE__*/React.createElement(MenuRow, {
    key: c.name,
    img: c.img,
    name: c.name,
    tagline: c.tagline,
    count: c.count,
    availability: c.availability,
    fromPrice: c.from,
    popular: c.popular,
    onClick: () => window.location.href = 'book.html'
  }))))), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 32,
      fontSize: 11,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      fontFamily: 'var(--font-inter)',
      color: 'rgba(107,95,87,0.8)'
    }
  }, "Every price is a printed starting figure \u2014 final quotes confirmed before your appointment, never after."))), /*#__PURE__*/React.createElement("section", {
    className: "grain grain--on-dark",
    style: {
      background: 'var(--ink)',
      padding: '64px 0 72px',
      textAlign: 'center',
      borderTop: '1px solid rgba(255,255,255,0.08)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-shell"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "display-page",
    style: {
      color: '#fff',
      margin: '0 auto 12px',
      fontSize: 'clamp(1.75rem,4vw,2.75rem)',
      maxWidth: '18ch'
    }
  }, "Found yours? Book it now."), /*#__PURE__*/React.createElement("p", {
    className: "text-body",
    style: {
      color: 'rgba(255,255,255,0.7)',
      maxWidth: '28rem',
      margin: '0 auto 28px'
    }
  }, "No prepayment. Cancel free up to 2 hours before."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      justifyContent: 'center',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "book.html",
    className: "btn-loud btn-loud--light"
  }, "Book an Appointment"), /*#__PURE__*/React.createElement(window.WaCta, {
    href: "https://wa.me/923222782254",
    from: "kit-services-finale",
    className: "btn-secondary",
    style: {
      minHeight: 56,
      padding: '1.2rem 2.2rem',
      color: '#fff',
      borderColor: 'rgba(255,255,255,0.7)',
      background: 'transparent'
    }
  }, "WhatsApp")))), /*#__PURE__*/React.createElement(window.SiteFooter, null));
}
Object.assign(window, {
  ServicesScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Services.jsx", error: String((e && e.message) || e) }); }
// ui_kits/website/Shared.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Shared footer + page scaffolding for the Farwa website UI kit. */
const {
  Navbar,
  WordmarkDivider
} = window.FarwaSalonDesignSystem_f6c92b;

/** Kit stub for production WaCta — opens WhatsApp; logs `from` in console for demos. */
function WaCta({
  href,
  from,
  className,
  style,
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("a", _extends({
    href: href,
    target: "_blank",
    rel: "noreferrer",
    className: className,
    style: style,
    onClick: () => {
      if (from) console.info('[WaCta]', from);
    }
  }, rest), children);
}
function SiteFooter() {
  const h = {
    fontFamily: 'var(--font-inter)',
    fontSize: 10,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    fontWeight: 500,
    color: 'var(--ink)',
    margin: '0 0 14px'
  };
  const link = {
    display: 'block',
    color: 'var(--stone)',
    fontSize: 12,
    fontFamily: 'var(--font-inter)',
    textDecoration: 'none',
    padding: '5px 0'
  };
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: '#fff'
    },
    "data-screen-label": "Footer"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid var(--border-soft)',
      padding: '32px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-shell",
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 24,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo.jpg",
    alt: "Farwa Beauty Salon",
    style: {
      height: 44,
      width: 'auto',
      objectFit: 'contain'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 1,
      height: 32,
      background: 'var(--border-soft)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "font-nastaliq",
    dir: "rtl",
    lang: "ur",
    style: {
      color: 'var(--stone)',
      fontSize: 16
    }
  }, "\u0641\u0631\u0648\u0627 \u0628\u06CC\u0648\u0679\u06CC \u0633\u06CC\u0644\u0648\u0646")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "book.html",
    className: "btn-primary",
    style: {
      padding: '0.65rem 1.5rem'
    }
  }, "Book appointment"), /*#__PURE__*/React.createElement(WaCta, {
    href: "https://wa.me/923222782254",
    from: "kit-footer",
    style: {
      color: 'var(--stone)',
      fontSize: 10,
      fontFamily: 'var(--font-inter)',
      textDecoration: 'none'
    }
  }, "Or message us on WhatsApp")))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid var(--border-soft)',
      padding: '40px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-shell",
    style: {
      display: 'grid',
      gridTemplateColumns: '1.7fr 1.1fr 1.2fr 1fr',
      gap: 40
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: h
  }, "Services"), /*#__PURE__*/React.createElement("div", {
    style: {
      columns: 2,
      columnGap: 24
    }
  }, ['Threading', 'Facials', 'Nails', 'Bridal', 'Hair', 'Massage', 'Cleansing', 'Rica Hot Wax'].map(s => /*#__PURE__*/React.createElement("a", {
    key: s,
    href: "services.html",
    style: link,
    className: "link-underline"
  }, s)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: h
  }, "Navigate"), [['Home', 'index.html'], ['Services', 'services.html'], ['Book', 'book.html'], ['Prices', 'services.html'], ['Contact', '#']].map(([l, href]) => /*#__PURE__*/React.createElement("a", {
    key: l,
    href: href,
    style: link,
    className: "link-underline"
  }, l))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: h
  }, "Visit us"), /*#__PURE__*/React.createElement("p", {
    style: {
      ...link,
      padding: 0,
      lineHeight: 1.8
    }
  }, "Farwa Beauty Salon", /*#__PURE__*/React.createElement("br", null), "Block 3 PECHS", /*#__PURE__*/React.createElement("br", null), "Karachi, Pakistan", /*#__PURE__*/React.createElement("br", null), "Mon\u2013Sat \xB7 11:00\u201319:00")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: h
  }, "Connect"), /*#__PURE__*/React.createElement(WaCta, {
    href: "https://wa.me/923222782254",
    from: "kit-footer-connect",
    style: link,
    className: "link-underline"
  }, "WhatsApp"), ['@farwasalon', 'Google Maps', 'Leave a review'].map(l => /*#__PURE__*/React.createElement("a", {
    key: l,
    href: "#",
    onClick: e => e.preventDefault(),
    style: link,
    className: "link-underline"
  }, l)))), /*#__PURE__*/React.createElement("div", {
    className: "section-shell",
    style: {
      marginTop: 36,
      paddingTop: 20,
      borderTop: '1px solid var(--border-soft)',
      display: 'flex',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: 'var(--stone)',
      fontSize: 11,
      fontFamily: 'var(--font-inter)'
    }
  }, "\xA9 2026 Farwa Beauty Salon. All rights reserved."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: 'var(--stone)',
      fontSize: 11,
      fontFamily: 'var(--font-inter)'
    }
  }, "Block 3 PECHS, Karachi \xB7 Est. 2008"))));
}
function FixedNav({
  light,
  active
}) {
  const go = label => {
    const map = {
      Home: 'index.html',
      Services: 'services.html',
      Prices: 'services.html',
      Book: 'book.html'
    };
    if (map[label]) window.location.href = map[label];
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100
    }
  }, /*#__PURE__*/React.createElement(Navbar, {
    light: light,
    active: active,
    logoSrc: "../../assets/logo.jpg",
    onNavigate: go
  }));
}
Object.assign(window, {
  SiteFooter,
  FixedNav,
  WaCta
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Shared.jsx", error: String((e && e.message) || e) }); }
// ui_kits/website/data.js
try { (() => {
/* Shared demo data for the Farwa website UI kit â€” from src/data.js in the repo. */
window.FARWA_DATA = {
  categories: [{
    name: 'Threading',
    img: '../../assets/threading.jpg',
    tagline: 'Precise brow & face threading from Rs 100',
    count: 7,
    from: 'Rs 100',
    availability: 'Usually available same-day',
    popular: true,
    chapter: 'The Brow & The Silk'
  }, {
    name: 'Rica Hot Wax',
    img: '../../assets/waxing.jpg',
    tagline: 'Gentle Rica stripless wax for face from Rs 150',
    count: 9,
    from: 'Rs 150',
    availability: 'Usually available same-day',
    chapter: 'The Brow & The Silk'
  }, {
    name: 'Facials',
    img: '../../assets/glow.jpg',
    tagline: '11 facials for every skin type from Rs 1,400',
    count: 11,
    from: 'Rs 1,400',
    availability: 'Book 1â€“2 days ahead',
    popular: true,
    chapter: 'The Face'
  }, {
    name: 'Cleansing',
    img: '../../assets/facial.jpg',
    tagline: 'Deep pore cleansing facials from Rs 1,200',
    count: 4,
    from: 'Rs 1,200',
    availability: 'Book 1â€“2 days ahead',
    chapter: 'The Face'
  }, {
    name: 'Nails',
    img: '../../assets/pedicure.jpg',
    tagline: 'Manicure, pedicure & nail art from Rs 300',
    count: 18,
    from: 'Rs 300',
    availability: 'Book 1â€“2 days ahead',
    chapter: 'The Hands & The Calm'
  }, {
    name: 'Massage',
    img: '../../assets/massage.jpg',
    tagline: 'Head, back & full body massage from Rs 700',
    count: 7,
    from: 'Rs 700',
    availability: 'Usually available same-day',
    chapter: 'The Hands & The Calm'
  }, {
    name: 'Hair',
    img: '../../assets/hairdo.jpg',
    tagline: 'Cuts, colour & styling from Rs 1,500',
    count: 4,
    from: 'Rs 1,500',
    availability: 'Book 1â€“2 days ahead',
    chapter: 'The Hair'
  }, {
    name: 'Hair Treatments',
    img: '../../assets/hairtreatment.jpg',
    tagline: 'Protein, repair & scalp treatments from Rs 2,000',
    count: 5,
    from: 'Rs 2,000',
    availability: 'Book 1â€“2 days ahead',
    chapter: 'The Hair'
  }, {
    name: 'Bridal',
    img: '../../assets/bridal.jpg',
    tagline: 'Bridal makeup & trials from Rs 8,000',
    count: 4,
    from: 'Rs 8,000',
    availability: 'Book 1â€“2 weeks ahead',
    popular: true,
    chapter: 'The Bride'
  }],
  chapters: [{
    name: 'The Face',
    caption: 'Glow & skin rituals'
  }, {
    name: 'The Brow & The Silk',
    caption: 'Shaping & hair removal'
  }, {
    name: 'The Hair',
    caption: 'Cut Â· colour Â· repair'
  }, {
    name: 'The Hands & The Calm',
    caption: 'Nails Â· body Â· rest'
  }, {
    name: 'The Bride',
    caption: 'The flagship'
  }],
  services: {
    'Threading': [{
      name: 'Eyebrow Threading',
      price: 'Rs 200',
      dur: '10 min'
    }, {
      name: 'Upper Lip Threading',
      price: 'Rs 150',
      dur: '5 min'
    }, {
      name: 'Chin Threading',
      price: 'Rs 100',
      dur: '5 min'
    }, {
      name: 'Full Face Threading',
      price: 'Rs 1,200',
      dur: '25 min'
    }],
    'Facials': [{
      name: 'Normal Facial',
      price: 'Rs 1,400',
      dur: '45 min'
    }, {
      name: 'Whitening Facial',
      price: 'Rs 1,900',
      dur: '55 min'
    }, {
      name: 'HD Whitening Facial',
      price: 'Rs 3,000',
      dur: '65 min'
    }, {
      name: 'Janssen Whitening Facial',
      price: 'Rs 5,500',
      dur: '75 min'
    }],
    'Bridal': [{
      name: 'Bridal Trial',
      price: 'Rs 8,000',
      dur: '2h'
    }, {
      name: 'Mehndi / Dholki Look',
      price: 'Rs 10,000',
      dur: '2h'
    }, {
      name: 'Engagement Look',
      price: 'Rs 12,000',
      dur: '2h 30m'
    }, {
      name: 'Full Bridal Package',
      price: 'Rs 25,000',
      dur: '5h'
    }],
    'Nails': [{
      name: 'Nail Paint',
      price: 'Rs 300',
      dur: '15 min'
    }, {
      name: 'Normal Manicure',
      price: 'Rs 900',
      dur: '30 min'
    }, {
      name: 'Normal Pedicure',
      price: 'Rs 1,000',
      dur: '35 min'
    }, {
      name: 'SPA Pedicure',
      price: 'Rs 1,400',
      dur: '45 min'
    }],
    'Massage': [{
      name: 'Back Massage',
      price: 'Rs 700',
      dur: '15 min'
    }, {
      name: 'Head Massage & Wash',
      price: 'Rs 1,500',
      dur: '30 min'
    }, {
      name: 'Full Body Massage',
      price: 'Rs 2,500',
      dur: '40 min'
    }]
  },
  slots: ['11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM']
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/data.js", error: String((e && e.message) || e) }); }

__ds_ns.Navbar = __ds_scope.Navbar;

__ds_ns.ProofStrip = __ds_scope.ProofStrip;

__ds_ns.ReviewProof = __ds_scope.ReviewProof;

__ds_ns.StickyMobileCTA = __ds_scope.StickyMobileCTA;

__ds_ns.WordmarkDivider = __ds_scope.WordmarkDivider;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.CardLink = __ds_scope.CardLink;

__ds_ns.InputField = __ds_scope.InputField;

__ds_ns.QuickPickCard = __ds_scope.QuickPickCard;

__ds_ns.TabPill = __ds_scope.TabPill;

__ds_ns.ArrowUpRight = __ds_scope.ArrowUpRight;

__ds_ns.IgIcon = __ds_scope.IgIcon;

__ds_ns.StarRating = __ds_scope.StarRating;

__ds_ns.UrduSignature = __ds_scope.UrduSignature;

__ds_ns.MenuRow = __ds_scope.MenuRow;

})();
