"""QC poin 2: batas scene aktual (durasi file per scene yang di-concat) vs awal kalimat pemetaan."""
import json, subprocess, sys
pfx = sys.argv[1]
t = json.load(open('docs/timeline.json'))
sent = {s['id']: s for s in t['sentences']}
acc, ok = 0.0, True
for sc in t['scenes']:
    first = sent[sc['sentence_ids'][0]]['start_s']
    d = abs(acc - first)
    good = d <= 0.3; ok &= good
    print(f"{'PASS' if good else 'FAIL'} scene {sc['id']}: potongan aktual {acc:.3f}s vs kalimat {sc['sentence_ids'][0]} {first:.2f}s (selisih {d:.3f}s)")
    dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-count_frames', '-show_entries',
        'stream=nb_read_frames', '-of', 'csv=p=0', f'out/scenes/{pfx}-scene-{sc["id"]}.mp4']).decode().strip()) / 30
    acc += dur
print(f"total frame video: {acc:.3f}s vs timeline {t['total_duration_s']}s")
print('HASIL:', 'PASS' if ok else 'FAIL'); sys.exit(0 if ok else 1)
