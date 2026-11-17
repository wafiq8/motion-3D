"""Contact sheet Gerbang 2: 9 baris (scene) x 3 kolom (awal/tengah/akhir)."""
import sys, json
from PIL import Image, ImageDraw, ImageFont
t = json.load(open('docs/timeline.json'))
frames = [int(x) for x in sys.argv[1].split(',')]
out = sys.argv[2]
tw, th = 300, 533
F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 18) if __import__('os').path.exists('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf') else ImageFont.load_default()
cols, rows = 9, 3
sheet = Image.new('RGB', (cols * (tw + 8) + 8, rows * (th + 34) + 8), '#111')
d = ImageDraw.Draw(sheet)
for i, f in enumerate(frames):
    sc, k = divmod(i, 3)
    im = Image.open(f'out/stills/f{f:04d}.png').convert('RGB').resize((tw, th))
    x = 8 + sc * (tw + 8); y = 8 + k * (th + 34)
    sheet.paste(im, (x, y + 28))
    d.text((x, y + 4), f"S{sc+1} {['awal','tengah','akhir'][k]} · f{f} · {f/30:.2f}s", fill='#ffcc66', font=F)
sheet.save(out, quality=88)
print(sheet.size)
