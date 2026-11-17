"""Selaraskan token naskah resmi dengan timestamp kata Whisper -> src/data/captions.json.
Teks SELALU dari naskah (timeline.sentences); Whisper hanya memasok waktu."""
import json, re, difflib
t = json.load(open('docs/timeline.json'))
W = t['words']
NUM = {'2': 'dua', '3': 'tiga', '4': 'empat', '6': 'enam', '7': 'tujuh', '10': 'sepuluh', '11': 'sebelas',
       '15': 'lima belas', '19': 'sembilan belas', '20': 'dua puluh', '160': 'seratus enam puluh',
       '350': 'tiga ratus lima puluh', ',6': 'koma enam', ',9': 'koma sembilan', ',5': 'koma lima',
       '.000': 'ribu'}
def norm(s):
    s = s.lower().replace('ñ', 'n')
    return re.sub(r'[^a-z0-9]', '', s)
KEY = {'pasifik', 'hindia', 'indonesia', 'instant', 'mindanao', 'sulawesi', 'makassar', 'kalimantan',
       'lifamatola', 'banda', 'lombok', 'ombai', 'timor', 'el', 'nino', 'benarkah', 'samudra', 'olimpiade'}
NUMW = {'lima', 'belas', 'juta', 'enam', 'ribu', 'sebelas', 'koma', 'tiga', 'perempat', 'dua', 'puluh', 'ratus',
        'empat', 'sembilan', 'seratus', 'tujuh', 'sepuluh', 'kilometer', 'meter', 'tahun', 'kubik'}
out = []
for s in t['sentences']:
    a = [w for w in W if w['s'] >= s['start_s'] - 0.01 and w['e'] <= s['end_s'] + 0.01]
    ex = []  # token asr yang diekspansi + waktunya
    for w in a:
        raw = w['w'].strip()
        key = raw.rstrip('.,?!:')
        parts = (NUM.get(key) or raw).split()
        if key == 'per' and False: pass
        d = (w['e'] - w['s']) / len(parts)
        for i, p in enumerate(parts):
            ex.append((norm(p), w['s'] + i * d, w['s'] + (i + 1) * d))
    toks = s['text'].replace('-', '-⁠').split()
    toks = [x.replace('⁠', '') for x in toks]
    tn = [norm(x) for x in toks]
    sm = difflib.SequenceMatcher(None, tn, [e[0] for e in ex], autojunk=False)
    tm = [None] * len(toks)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            tm[blk.a + k] = (ex[blk.b + k][1], ex[blk.b + k][2])
    # interpolasi yang tidak cocok
    known = [i for i, v in enumerate(tm) if v]
    for i in range(len(toks)):
        if tm[i]: continue
        p = max([k for k in known if k < i], default=None)
        n = min([k for k in known if k > i], default=None)
        t0 = tm[p][1] if p is not None else s['start_s']
        t1 = tm[n][0] if n is not None else s['end_s']
        gap = [k for k in range(len(toks)) if (p is None or k > p) and (n is None or k < n)]
        j = gap.index(i); d = (t1 - t0) / len(gap)
        tm[i] = (t0 + j * d, t0 + (j + 1) * d)
    words = [{'w': toks[i], 's': round(tm[i][0], 3), 'e': round(tm[i][1], 3),
              'k': 'key' if norm(toks[i]) in KEY else ('num' if norm(toks[i]) in NUMW else '')}
             for i in range(len(toks))]
    # halaman 2-4 kata via DP: hindari memutus frasa angka, utamakan putus di tanda baca
    n = len(words)
    def cost(i, j):  # halaman words[i:j]
        k = j - i
        if k > 4 or (k < 2 and n >= 2): return 1e9
        L = sum(len(x['w']) + 1 for x in words[i:j]) - 1
        if L > 26: return 1e9
        c = (4 - k) * 0.4 + max(0, L - 20) * 0.3
        for m in range(i, j - 1):
            if words[m]['w'][-1] in ',.?!:': c += 4      # tanda baca di tengah halaman
        last = words[j - 1]
        if j < n and last['w'][-1] not in ',.?!:': c += 1.5
        if j < n and last['k'] == 'num' and words[j]['k'] == 'num': c += 5  # memutus frasa angka
        return c
    best = [0] + [1e18] * n; prv = [0] * (n + 1)
    for j in range(1, n + 1):
        for i in range(max(0, j - 4), j):
            v = best[i] + cost(i, j)
            if v < best[j]: best[j], prv[j] = v, i
    pages, j = [], n
    while j > 0:
        pages.insert(0, words[prv[j]:j]); j = prv[j]
    out.append({'id': s['id'], 'pages': [{'s': p[0]['s'], 'e': p[-1]['e'], 'words': p} for p in pages]})
json.dump(out, open('src/data/captions.json', 'w'), ensure_ascii=False, indent=0)
for o in out:
    print(o['id'], ' | '.join(' '.join(w['w'] for w in p['words']) + f"@{p['s']:.2f}" for p in o['pages']))
