"""Contact sheet: baris = scene, kolom = awal/tengah/akhir. Pakai: python3 tools/contact_sheet.py <dir> <out.png> [scenes...] [--w=360]"""
import sys, json
from PIL import Image, ImageDraw, ImageFont
args = [a for a in sys.argv[1:] if not a.startswith('--')]
opts = dict(a[2:].split('=') for a in sys.argv[1:] if a.startswith('--'))
d, out = args[0], args[1]
scenes = [int(x) for x in args[2:]] or list(range(1, 9))
W = int(opts.get('w', 360)); H = W * 16 // 9; pad = 10; lab = 34
tl = json.load(open('docs/timeline.json'))
sheet = Image.new('RGB', (pad + 3 * (W + pad), pad + len(scenes) * (H + lab + pad)), (10, 6, 20))
dr = ImageDraw.Draw(sheet)
try:
    f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 20)
except Exception:
    f = ImageFont.load_default()
for r, s in enumerate(scenes):
    sc = tl['scenes'][s - 1]
    for c, n in enumerate(['awal', 'tengah', 'akhir']):
        im = Image.open(f'{d}/scene{s}-{n}.png').convert('RGB').resize((W, H), Image.LANCZOS)
        x = pad + c * (W + pad); y = pad + r * (H + lab + pad)
        dr.text((x, y + 6), f'Scene {s} · {n} · {sc["start_s"]:.2f}–{sc["end_s"]:.2f}s', fill=(255, 216, 77), font=f)
        sheet.paste(im, (x, y + lab))
sheet.save(out)
print(out, sheet.size)
