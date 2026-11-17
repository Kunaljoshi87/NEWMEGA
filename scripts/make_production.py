"""Build the launch copy of the site for www.mega.tc.

Usage (from the repository folder):  python scripts/make_production.py
Writes a ready-to-upload copy into ./production/ (the preview site is not changed):
  * /NEWMEGA/ paths become / and preview URLs become https://www.mega.tc/
  * the preview "noindex" tags are removed (admin and 404 keep noindex)
  * sitemap.xml, robots.txt and CNAME are added
"""
import re, shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'production'
SITE = 'https://www.mega.tc/'
SKIP = {'.git', '.github', 'production', 'scripts', 'content', 'i18n'}
KEEP_NOINDEX = {'admin', '404.html'}
TEXT = {'.html', '.css', '.js', '.json', '.xml', '.txt', '.webmanifest', '.svg'}

def main():
    if OUT.exists():
        shutil.rmtree(OUT)
    for src in ROOT.rglob('*'):
        rel = src.relative_to(ROOT)
        if rel.parts[0] in SKIP or src.is_dir() or rel.name in ('sitemap-preview.xml',):
            continue
        dst = OUT / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        if src.suffix.lower() not in TEXT:
            shutil.copy2(src, dst)
            continue
        t = src.read_text(encoding='utf-8')
        t = t.replace('https://kunaljoshi87.github.io/NEWMEGA/', SITE).replace('/NEWMEGA/', '/')
        if src.suffix == '.html' and rel.parts[0] not in KEEP_NOINDEX:
            t = re.sub(r'<meta[^>]*name="robots"[^>]*>\s*|<meta[^>]*content="noindex[^"]*"[^>]*name="robots"[^>]*>\s*', '', t)
        dst.write_text(t, encoding='utf-8')
    sm = (ROOT / 'sitemap-production.xml').read_text(encoding='utf-8')
    (OUT / 'sitemap.xml').write_text(sm, encoding='utf-8')
    (OUT / 'robots.txt').write_text(
        'User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ' + SITE + 'sitemap.xml\n', encoding='utf-8')
    (OUT / 'CNAME').write_text('www.mega.tc\n', encoding='utf-8')
    left = [p for p in OUT.rglob('*.html') if '/NEWMEGA/' in p.read_text(encoding='utf-8')]
    print('Production copy written to', OUT, '| pages still mentioning /NEWMEGA/:', len(left))

if __name__ == '__main__':
    main()
