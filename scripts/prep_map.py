"""Siapkan aset panggung peta Arlindo dari data asli yang di-vendor.
Masukan: GeoTIFF GEBCO 2026 (bbox 108-135E, 14S-10N) + mosaik S2Cloudless 2016 (EOX, CC BY 4.0).
Keluaran: public/map/height.bin (int16 LE, HW x HH), public/map/albedo.jpg, public/map/meta.json
Pakai: python3 -I scripts/prep_map.py <gebco.tif> <mosaic.png>
"""
import sys, json
import numpy as np, tifffile
from PIL import Image

geb = tifffile.imread(sys.argv[1]).astype(np.float32)  # 5760 x 6480, 15"
sat = Image.open(sys.argv[2]).convert('RGB')
OUT = 'public/map/'
HW, HH = 1080, 960          # 40 px / derajat untuk geometri
TW, TH = 4096, 3641         # tekstur albedo

def block_mean(a, f):
    h, w = a.shape[0] // f * f, a.shape[1] // f * f
    return a[:h, :w].reshape(h // f, f, w // f, f).mean(axis=(1, 3))

hgt = block_mean(geb, 6)
assert hgt.shape == (HH, HW), hgt.shape
np.clip(hgt, -32000, 32000).astype('<i2').tofile(OUT + 'height.bin')

# elevasi pada resolusi tekstur
e = np.asarray(Image.fromarray(geb).resize((TW, TH), Image.BILINEAR))
s = np.asarray(sat.resize((TW, TH), Image.LANCZOS)).astype(np.float32) / 255

# hillshade (cahaya dari barat laut, cocok dengan rig senja)
px_m = 111000 * 27 / TW
gy, gx = np.gradient(e, px_m)
def shade(z):
    nx, ny, nz = -gx * z, -gy * z, np.ones_like(gx)
    n = np.sqrt(nx**2 + ny**2 + nz**2)
    L = np.array([-0.55, -0.55, 0.63]); L /= np.linalg.norm(L)
    return np.clip((nx * L[0] + ny * L[1] + nz * L[2]) / n, 0, 1)

d = np.clip(-e, 0, None)
stops = [(0, (0.36, 0.72, 0.74)), (60, (0.22, 0.58, 0.68)), (250, (0.13, 0.42, 0.60)),
         (1200, (0.08, 0.28, 0.48)), (4000, (0.04, 0.15, 0.31)), (7500, (0.02, 0.08, 0.19))]
ocean = np.zeros_like(s)
for c in range(3):
    ocean[..., c] = np.interp(d, [p for p, _ in stops], [v[c] for _, v in stops])
hs_o = shade(6.0)[..., None]
ocean = ocean * (0.82 + 0.45 * hs_o)
ocean = 0.88 * ocean + 0.12 * s

hs_l = shade(2.5)[..., None]
lum = s.mean(axis=2, keepdims=True)
land = np.clip(lum + (s - lum) * 1.18, 0, 1)            # sedikit saturasi
land = land * np.array([1.10, 1.05, 0.94]) * (0.92 + 0.38 * hs_l)

m = np.clip((e + 2) / 6, 0, 1)[..., None]                  # garis pantai dari data GEBCO
alb = np.clip(land * m + ocean * (1 - m), 0, 1)
Image.fromarray((alb * 255).astype(np.uint8)).save(OUT + 'albedo.jpg', quality=90)

json.dump({"lon0": 108, "lon1": 135, "lat0": -14, "lat1": 10, "hw": HW, "hh": HH,
           "tw": TW, "th": TH, "hmin": float(hgt.min()), "hmax": float(hgt.max())},
          open(OUT + 'meta.json', 'w'), indent=1)
print('ok', hgt.min(), hgt.max())
