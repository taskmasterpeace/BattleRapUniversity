"""Install the thin-mood crowd wave: download completed renders, key out the
green chroma (house sprites are transparent-bg), defringe edges, save at
112x128, and tag each body into lib/crowd-family.json (mood/demo/gender).
Idempotent — skips bodies already installed."""
import json, os, sys, urllib.request
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST = os.path.join(ROOT, '.crowd-thin-jobs.json')
FAMILY = os.path.join(ROOT, 'lib', 'crowd-family.json')
KEY = os.environ.get('PIXELLAB_API_KEY', '8a33c429-1ea4-489b-aa2d-0587bbfdd885')

def fetch(job_id):
    req = urllib.request.Request(
        f'https://api.pixellab.ai/mcp/images/{job_id}/download?index=0',
        headers={'Authorization': f'Bearer {KEY}'})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()

def key_green(im):
    im = im.convert('RGBA')
    px = im.load()
    w, h = im.size
    # pass 1: kill green-dominant pixels
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            dom = g - max(r, b)
            if (dom > 20 and g > 80) or (r < 100 and g > 120 and b < 100) or (g / (r + g + b + 1) > 0.45 and g > 60):
                px[x, y] = (0, 0, 0, 0)
    # pass 2: defringe — pixels touching transparency lose their green tint
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0 or g <= max(r, b) + 6:
                continue
            near_edge = any(
                0 <= x + dx < w and 0 <= y + dy < h and px[x + dx, y + dy][3] == 0
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))
            if near_edge:
                px[x, y] = (r, max(r, b), b, a)
    return im

manifest = json.load(open(MANIFEST))
family = json.load(open(FAMILY))
have = {m['src'] for m in family}

installed = skipped = failed = 0
for item in manifest:
    if item.get('status') != 'completed' or not item.get('jobId'):
        continue
    src = f"/sprites/crowd/{item['mood']}/{item['file']}.png"
    out = os.path.join(ROOT, 'public', src.lstrip('/').replace('/', os.sep))
    if src in have and os.path.exists(out):
        skipped += 1
        continue
    try:
        raw = fetch(item['jobId'])
        tmp = out + '.raw'
        os.makedirs(os.path.dirname(out), exist_ok=True)
        with open(tmp, 'wb') as f:
            f.write(raw)
        im = Image.open(tmp)
        if im.size != (112, 128):
            im = im.resize((112, 128), Image.NEAREST)
        key_green(im).save(out)
        os.remove(tmp)
        if src not in have:
            family.append({'src': src, 'mood': item['mood'], 'demo': item['demo'], 'gender': item['gender']})
            have.add(src)
        installed += 1
        print(f"installed {src} ({item['demo']}/{item['gender']})")
    except Exception as e:  # noqa: BLE001 — report and continue the batch
        failed += 1
        print(f"FAILED {item['file']}: {e}", file=sys.stderr)

with open(FAMILY, 'w') as f:
    json.dump(family, f, indent=2)
print(f"done: {installed} installed, {skipped} already present, {failed} failed — family now {len(family)} bodies")
