# Hero background video

`public/hero-mp4.mp4` is ~7.3MB. The site loads **`/bridal2.jpg` as the LCP** (preloaded in `app/layout.jsx`); the video uses `preload="none"` and only plays on desktop when motion is allowed.

To shrink the file (recommended before production):

```bash
ffmpeg -i public/hero-mp4.mp4 -vf "scale=1280:-2" -c:v libx264 -crf 28 -preset slow -an -movflags +faststart public/hero-mp4-compressed.mp4
```

Then replace `hero-mp4.mp4` with the compressed output (target under ~2MB).
