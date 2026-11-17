#!/usr/bin/env bash
# Pemeriksa file final untuk skill diorama-basabasi (fail-closed).
# Pakai: bash scripts/check_output.sh out/<slug>-final.mp4
set -u
F="${1:?path file final wajib diisi}"
# Rentang durasi: argumen [dur_min] [dur_max]; tanpa argumen max, Varian A2
# terbaca otomatis dari docs/timeline.json di sebelah file final (30–120).
DMIN="${2:-30}"
DMAX="${3:-}"
if [ -z "$DMAX" ]; then
  DMAX=60
  TL="$(dirname "$F")/../docs/timeline.json"
  if [ -f "$TL" ] && grep -q '"variant"[[:space:]]*:[[:space:]]*"A2"' "$TL"; then DMAX=120; fi
fi
fail=0
say() { echo "$1 $2"; [ "$1" = "FAIL" ] && fail=1; return 0; }

W=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$F")
H=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "$F")
FPS=$(ffprobe -v error -select_streams v:0 -show_entries stream=avg_frame_rate -of csv=p=0 "$F")
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$F")
W=${W//,/}; H=${H//,/}; DUR=${DUR//,/}
# avg_frame_rate berbentuk "30/1"
FPSN=$(echo "$FPS" | awk -F/ '{printf "%.0f", $1/$2}')
[ "$W" = "1080" ] && [ "$H" = "1920" ] \
  && say PASS "resolusi 1080x1920" || say FAIL "resolusi ${W}x${H}"
[ "$FPSN" = "30" ] && say PASS "fps 30" || say FAIL "fps $FPSN"
awk "BEGIN{exit !($DUR>=$DMIN && $DUR<=$DMAX)}" \
  && say PASS "durasi ${DUR}s ($DMIN–$DMAX)" || say FAIL "durasi ${DUR}s di luar $DMIN–$DMAX"

GAPS=$(ffmpeg -hide_banner -i "$F" -af "silencedetect=noise=-45dB:d=1.2" -f null - 2>&1 \
  | grep -c 'silence_start' || true)
[ "$GAPS" = "0" ] && say PASS "tidak ada keheningan > 1,2 detik" \
  || say FAIL "ada $GAPS keheningan > 1,2 detik (cek manual: jeda payoff boleh <= 1 detik di penutup)"

LUFS=$(ffmpeg -hide_banner -i "$F" -af loudnorm=print_format=summary -f null - 2>&1 \
  | awk '/Input Integrated/ {print $3}')
echo "INFO loudness terukur: ${LUFS:-tidak terbaca} LUFS (target -14 ±1)"

echo; [ "$fail" = "0" ] && echo "HASIL: PASS SEMUA" || echo "HASIL: ADA FAIL"
exit "$fail"
