#!/usr/bin/env bash
# Render PER SCENE + concat -c copy + mux audio. Pakai: bash tools/render.sh preview|final <slug>
set -euo pipefail
MODE="$1"; SLUG="$2"
if [ "$MODE" = preview ]; then SCALE=0.5; DIR=out/preview-scenes; OUTF=out/${SLUG}-preview.mp4; else SCALE=1; DIR=out/scenes; OUTF=out/${SLUG}-final.mp4; fi
mkdir -p "$DIR"
N=$(nproc)
ONLY="${ONLY:-}"
python3 - <<'P' > "$DIR/ranges.txt"
import json; t=json.load(open('docs/timeline.json'))
for s in t['scenes']: print(s['id'], round(s['start_s']*30), round(s['end_s']*30)-1)
P
while read -r ID A B; do
  if [ -n "$ONLY" ] && ! echo " $ONLY " | grep -q " $ID "; then continue; fi
  echo "== scene $ID frames $A-$B"
  npx remotion render src/index.ts "${COMP:-LeakyGut}" "$DIR/scene-$ID.mp4" --frames=$A-$B --scale=$SCALE --muted \
    --concurrency=$N --codec=h264 --crf=18 --pixel-format=yuv420p --log=error
done < "$DIR/ranges.txt"
: > "$DIR/list.txt"
for i in $(python3 -c "import json;print(' '.join(str(s['id']) for s in json.load(open('docs/timeline.json'))['scenes']))"); do echo "file 'scene-$i.mp4'" >> "$DIR/list.txt"; done
ffmpeg -v error -y -f concat -safe 0 -i "$DIR/list.txt" -c copy "$DIR/video.mp4"
TOTAL=$(python3 -c "import json;print(json.load(open('docs/timeline.json'))['total_duration_s'])")
bash tools/mix_audio.sh "$TOTAL" "$DIR/audio.m4a"
ffmpeg -v error -y -i "$DIR/video.mp4" -i "$DIR/audio.m4a" -map 0:v -map 1:a -c copy -movflags +faststart "$OUTF"
echo "OK $OUTF"
