#!/usr/bin/env bash
# Mix narasi (master clock) + musik bed ber-ducking -> out/audio-mix.wav, -14 LUFS, true peak <= -1 dB (dua lintasan loudnorm).
set -euo pipefail
DUR=$(python3 -I -c "import json;print(json.load(open('docs/timeline.json'))['total_duration_s'])")
FO=$(python3 -I -c "print($DUR-1.6)")
FG="[0:a]aresample=48000,aformat=channel_layouts=stereo,apad=whole_dur=$DUR,asplit=2[v1][v2];\
[1:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:$DUR,asetpts=N/SR/TB,volume=-21dB,afade=t=in:d=0.8,afade=t=out:st=$FO:d=1.6[m];\
[m][v2]sidechaincompress=threshold=0.02:ratio=5:attack=15:release=450:makeup=1[md];\
[v1][md]amix=inputs=2:normalize=0:duration=first"
ffmpeg -v error -y -i public/narasi.mp3 -i public/musik.mp3 -filter_complex "$FG" -t $DUR -c:a pcm_s24le out/audio-raw.wav
J=$(ffmpeg -hide_banner -i out/audio-raw.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g() { echo "$J" | python3 -I -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i out/audio-raw.wav -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" -c:a pcm_s24le out/audio-mix.wav
ffmpeg -hide_banner -i out/audio-mix.wav -af loudnorm=print_format=summary -f null - 2>&1 | grep -E "Input Integrated|Input True Peak"
