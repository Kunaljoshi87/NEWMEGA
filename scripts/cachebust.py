"""Final build step: make sure every visitor gets the newest design files.

1. Adds ?v=<fingerprint> to every /NEWMEGA/assets/*.css and *.js link, so a browser
   never shows a new page with an old, cached style sheet.
2. Gives every line icon a safe built-in size and outline style, so an icon can
   never appear as a giant black shape even if the style sheet is slow to load.

Usage:  python scripts/cachebust.py
"""
import hashlib, re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
ASSET = re.compile(r'(/NEWMEGA/(assets/[\w\-./]+?\.(?:css|js)))(?:\?v=[0-9a-f]+)?(?=["\'])')
ICON = re.compile(r'<svg class="(mx-ico[^"]*)"(?![^>]*\bwidth=)')
SAFE = ('width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" '
        'stroke-linecap="round" stroke-linejoin="round"')
cache = {}

def fp(rel):
    if rel not in cache:
        f = root / rel
        cache[rel] = hashlib.md5(f.read_bytes()).hexdigest()[:8] if f.exists() else None
    return cache[rel]

def fix(m):
    v = fp(m.group(2))
    return m.group(1) + (f'?v={v}' if v else '')

n = 0
for p in root.rglob('*.html'):
    if '.git' in p.parts or 'content' in p.parts:
        continue
    t = p.read_text(encoding='utf-8')
    t2 = ASSET.sub(fix, t)
    t2 = ICON.sub(lambda m: f'<svg class="{m.group(1)}" {SAFE}', t2)
    if t2 != t:
        p.write_text(t2, encoding='utf-8'); n += 1
print('Fresh design-file links and safe icons on', n, 'pages')
