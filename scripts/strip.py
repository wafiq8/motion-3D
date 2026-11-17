import sys
from PIL import Image
out=sys.argv[1]; fs=[int(x) for x in sys.argv[2].split(',')]
ims=[Image.open(f'out/stills/f{f:04d}.png') for f in fs]
W,H=ims[0].size[0]//2,ims[0].size[1]//2
sh=Image.new('RGB',(W*len(ims),H))
for i,im in enumerate(ims): sh.paste(im.convert('RGB').resize((W,H)),(i*W,0))
sh.save(out,quality=85)
