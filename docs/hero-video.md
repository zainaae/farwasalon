# Hero background video

`public/hero-mp4.mp4` is compressed (~0.9MB fallback); `public/hero-mp4.webm` is ~0.8MB VP9. Desktop hero prefers WebM when supported (`app/home-client.jsx` + `lib/video-manifest.js`). The site loads **`/bridal2.jpg` as the LCP** (preloaded in `app/page.jsx`). The hero video:

- Mounts only on **desktop** when `prefers-reduced-motion` is off
- Defers mount until **`requestIdleCallback`** (or ~400ms) so the poster wins first paint
- Uses **`preload="auto"`** only after that decision (not on mobile)
- Fades in after **`canplaythrough`** so playback starts at full quality, not a buffering low-bitrate frame
- Plays at **`playbackRate` 0.65** (cinematic slow-mo without the choppy feel of 0.35)

There is no separate `hero-mp4-compressed.mp4` file — the main MP4 is kept under ~1MB for fallback. To re-compress after replacing source footage:

```bash
ffmpeg -i public/hero-mp4.mp4 -vf "scale=1280:-2" -c:v libx264 -crf 28 -preset slow -an -movflags +faststart public/hero-mp4-compressed.mp4
```

Then replace `hero-mp4.mp4` with the compressed output (target under ~2MB) or point `HERO_VIDEO` in `app/home-client.jsx` at the compressed file.
