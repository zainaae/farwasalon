Site header — h-56px, blurred translucent bar, centered uppercase nav, "Book an Appointment" CTA right.

```jsx
<Navbar light active="Services" logoSrc="../../assets/logo.jpg" />
<Navbar light={false} active="Home" /> {/* over a dark hero */}
```

Static positioning; wrap in `position:fixed;top:0;left:0;right:0` for a real page.
