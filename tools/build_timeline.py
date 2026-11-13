"""Bangun docs/words.json + docs/timeline.json dari Whisper (waktu) + naskah resmi (teks).
Batas kalimat diverifikasi silencedetect -35 dB. Pakai: python3 tools/build_timeline.py"""
import json, re
SCRIPT = [
 "Tahukah kamu, banyak masalah kesehatan sebenarnya berawal dari usus? Sisa makanan yang menumpuk memicu bakteri jahat menghasilkan racun di dalam usus.",
 "Iritasi yang dibiarkan terus-menerus membuat dinding usus merenggang dan bocor—kondisi yang disebut leaky gut.",
 "Lewat celah bocor inilah racun endotoksin lolos masuk ke aliran darah dan memicu peradangan di seluruh tubuh.",
 "Peradangan ini melukai dinding pembuluh darah, bikin kolesterol mudah menempel hingga menumpuk menjadi plak penyumbat.",
 "Saat darah penuh peradangan ini mengalir ke jantung, hati, hingga otak, sel-sel sehat perlahan rusak dan memicu berbagai penyakit.",
 "Karena itu, hidup sehat selalu diawali dari usus yang sehat. Rawat dari dalam, jangan sampai terlambat.",
]
# awal/akhir suara kalimat dari silencedetect -35 dB (silence_end / silence_start)
SENT_START = [0.00, 9.43, 16.06, 22.54, 28.98, 36.88]
SENT_END   = [9.08, 15.57, 22.16, 28.58, 36.46, 43.23]
AUDIO = 43.47
PAYOFF = 1.03            # jeda payoff setelah kata terakhir (musik + kartu seri)
TOTAL = round(round((AUDIO + PAYOFF) * 30) / 30, 2)
wh = json.load(open('docs/whisper-words.json'))
merged = []
for w in wh:
    if w['w'].startswith('-') and merged:
        merged[-1]['w'] += w['w']; merged[-1]['e'] = w['e']
    else:
        merged.append(dict(w))
toks = []
for i, s in enumerate(SCRIPT):
    for t in re.sub('—', '— ', s).split():
        toks.append((t, i + 1))
assert len(toks) == len(merged), (len(toks), len(merged))
norm = lambda x: re.sub(r'[^a-z]', '', x.lower())
words = []
for (t, sid), w in zip(toks, merged):
    a, b = norm(t), norm(w['w'])
    if a != b: print('beda ASR (teks naskah dipakai):', w['w'], '->', t)
    words.append({'w': t, 's': w['s'], 'e': w['e'], 'sent': sid})
for sid in range(1, 7):
    ws = [w for w in words if w['sent'] == sid]
    ws[0]['s'] = max(ws[0]['s'], SENT_START[sid - 1])
fr = lambda x: round(round(x * 30) / 30, 2)
sents = [{'id': i + 1, 'text': SCRIPT[i], 'start_s': SENT_START[i], 'end_s': SENT_END[i], 'scene': i + 1} for i in range(6)]
scenes = []
for i in range(6):
    scenes.append({'id': i + 1, 'sentence_ids': [i + 1], 'start_s': fr(SENT_START[i]), 'end_s': fr(SENT_START[i + 1]) if i < 5 else TOTAL})
tl = {'fps': 30, 'audio_duration_s': AUDIO, 'total_duration_s': TOTAL,
      'source': 'public/narasi.mp3 (voice-offer-usus.mp3, tanpa ubah tempo); waktu: Whisper large-v3 language=id + silencedetect -35dB; teks: naskah resmi user',
      'sentences': sents, 'scenes': scenes}
json.dump(words, open('docs/words.json', 'w'), ensure_ascii=False, indent=0)
json.dump(tl, open('docs/timeline.json', 'w'), ensure_ascii=False, indent=2)
print(len(words), 'kata; total', TOTAL)
