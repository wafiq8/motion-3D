#!/usr/bin/env bash
# Render per scene dari docs/timeline.json -> out/scenes/<prefix>-scene-N.mp4, lalu concat -c copy.
# Pakai: bash scripts/render_scenes.sh <scale> <prefix> [daftar scene, mis. "1 3"]
set -euo pipefail
SCALE="$1"; PFX="$2"; ONLY="${3:-}"
B=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
N=$(nproc)
mapfile -t R < <(python3 -I -c "
import json; t=json.load(open('docs/timeline.json'))
for s in t['scenes']: print(s['id'], round(s['start_s']*30), round(s['end_s']*30)-1)")
for row in "${R[@]}"; do
  read -r id a b <<< "$row"
  if [ -n "$ONLY" ] && [[ " $ONLY " != *" $id "* ]]; then continue; fi
  st=$(date +%s)
  npx remotion render src/index.ts Arlindo "out/scenes/$PFX-scene-$id.mp4" --frames=$a-$b --scale=$SCALE --muted \
    --gl=swangle --concurrency=$N --codec=h264 --crf=18 --pixel-format=yuv420p --browser-executable=$B --log=error
  echo "scene $id frames $a-$b: $(( $(date +%s)-st ))s"
done
: > out/scenes/$PFX-list.txt
for row in "${R[@]}"; do read -r id a b <<< "$row"; echo "file '$PFX-scene-$id.mp4'" >> out/scenes/$PFX-list.txt; done
ffmpeg -v error -y -f concat -safe 0 -i out/scenes/$PFX-list.txt -c copy out/$PFX-video.mp4
echo "concat ok: $(ffprobe -v error -show_entries format=duration -of csv=p=0 out/$PFX-video.mp4)s"
