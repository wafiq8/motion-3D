#!/usr/bin/env bash
# Mix narasi (master clock) + bed musik user dengan ducking, normalisasi -14 LUFS / TP -1.5 dB.
# Pakai: bash tools/mix_audio.sh <total_detik> <out.m4a>
set -euo pipefail
TOTAL="$1"; OUT="$2"
MUS=$(ls public/musik.* | head -1)
FADE_ST=$(awk "BEGIN{print $TOTAL-1.2}")
ffmpeg -v error -y -i public/narasi.mp3 -i "$MUS" -filter_complex "\
[0:a]aresample=48000,aformat=channel_layouts=stereo,apad=whole_dur=${TOTAL},asplit=2[nar][sc];\
[1:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:${TOTAL},volume=0.32,afade=t=in:d=0.6,afade=t=out:st=${FADE_ST}:d=1.2[mus];\
[mus][sc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=350[duck];\
[nar][duck]amix=inputs=2:normalize=0:duration=first,atrim=0:${TOTAL}[mix];\
[mix]loudnorm=I=-14:TP=-1.5:LRA=11:linear=true[out]" -map "[out]" -c:a aac -b:a 192k -ar 48000 "$OUT"
