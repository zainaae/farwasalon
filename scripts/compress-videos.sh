#!/usr/bin/env bash
# Compress all .mp4 in public/ for web delivery + generate .webm variants.
# Original is preserved as .orig.mp4. Re-run safe: skips already-backed-up files.
set -e
FFMPEG="/c/Users/user/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.1-full_build/bin/ffmpeg.exe"
cd "$(dirname "$0")/.."

# Files to compress (skip the small ones to avoid making them bigger)
VIDS=(hero-mp4 eyebrowtattoo manicurephotography nails cleansing ct)

for v in "${VIDS[@]}"; do
  SRC="public/$v.mp4"
  ORIG="public/$v.orig.mp4"
  WEBM="public/$v.webm"

  if [ ! -f "$SRC" ]; then
    echo "[skip] $SRC not found"; continue
  fi

  if [ ! -f "$ORIG" ]; then
    cp "$SRC" "$ORIG"
    echo "[backup] $ORIG"
  fi

  # MP4: H.264, CRF 28, max 1280x720, no audio, faststart for streaming
  echo "[mp4] encoding $v.mp4..."
  "$FFMPEG" -y -hide_banner -loglevel error -i "$ORIG" \
    -vf "scale='min(1280,iw)':'-2'" \
    -c:v libx264 -crf 28 -preset medium -pix_fmt yuv420p \
    -an -movflags +faststart "$SRC"

  # WebM: VP9, CRF 33 (~20-30% smaller than h264 for similar quality)
  echo "[webm] encoding $v.webm..."
  "$FFMPEG" -y -hide_banner -loglevel error -i "$ORIG" \
    -vf "scale='min(1280,iw)':'-2'" \
    -c:v libvpx-vp9 -crf 33 -b:v 0 -row-mt 1 -cpu-used 2 \
    -an "$WEBM"

  ORIG_SIZE=$(stat -c%s "$ORIG" 2>/dev/null || stat -f%z "$ORIG")
  NEW_SIZE=$(stat -c%s "$SRC" 2>/dev/null || stat -f%z "$SRC")
  WEBM_SIZE=$(stat -c%s "$WEBM" 2>/dev/null || stat -f%z "$WEBM")

  # Only keep WebM if it's smaller than the MP4 — VP9 doesn't always win.
  if [ "$WEBM_SIZE" -ge "$NEW_SIZE" ]; then
    rm -f "$WEBM"
    WEBM_NOTE="webm dropped (larger than mp4)"
  else
    WEBM_NOTE="webm $((WEBM_SIZE/1024)) KB (-$((100-100*WEBM_SIZE/ORIG_SIZE))%)"
  fi
  printf "[done] %-30s  mp4 %4d KB (-%d%%)  %s\n" "$v" \
    $((NEW_SIZE/1024)) $((100-100*NEW_SIZE/ORIG_SIZE)) \
    "$WEBM_NOTE"
done

echo "Done. Re-run safe."
