#!/usr/bin/env bash
# Usage: bash scripts/assemble.sh <scenesDir> <out.mp4>
# Concat per-scene video (-c copy) and mux the normalised narration+music mix.
set -euo pipefail
dir=$1; out=$2
list=$(mktemp)
for f in $(ls "$dir"/scene-*.mp4 | sort -V); do echo "file '$(realpath "$f")'" >> "$list"; done
ffmpeg -v error -y -f concat -safe 0 -i "$list" -c copy "${out%.mp4}-video.mp4"
ffmpeg -v error -y -i "${out%.mp4}-video.mp4" -i out/audio/mix-norm.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart "$out"
rm -f "$list" "${out%.mp4}-video.mp4"
ffprobe -v error -show_entries stream=codec_type,width,height,r_frame_rate,duration -of compact "$out"
