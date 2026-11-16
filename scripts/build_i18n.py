#!/usr/bin/env python3
"""Build ES / FR / PT / RU versions of the MEGA website and add the language switcher,
hreflang tags and motion layer to every page. Runs in GitHub Actions after build_blog.py.

Translations: i18n/<lang>.json  ({english text: translation})
Pages to publish per language: i18n/pages.json (list of page folders, "" = home page)
"""
import json, re, sys, shutil
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import i18n_core as C

ROOT = Path(__file__).resolve().parents[1]
BASE = '/NEWMEGA/'
CANON = 'https://www.mega.tc/'
LANGS = ['en', 'es', 'fr', 'pt', 'ru']
NAMES = {'en': 'English', 'es': 'Español', 'fr': 'Français', 'pt': 'Português', 'ru': 'Русский'}
SKIP_DIRS = {'.git', '.github', 'content', 'scripts', 'assets', 'media', 'i18n', 'admin', 'category'} | set(LANGS)
MOTION = (f'<link rel="stylesheet" href="{BASE}assets/mega-motion.css"/>', f'<script defer src="{BASE}assets/mega-motion.js"></script>')
RU_FONT = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@500;600;700&amp;display=swap"/>'

def en_pages():
    out = {'': ROOT / 'index.html'}
    for p in sorted(ROOT.glob('*/index.html')):
        if p.parent.name not in SKIP_DIRS:
            out[p.parent.name] = p
    return out

def url(lang, slug):
    pre = '' if lang == 'en' else lang + '/'
    return BASE + pre + (slug + '/' if slug else '')

def canon(lang, slug):
    pre = '' if lang == 'en' else lang + '/'
    return CANON + pre + (slug + '/' if slug else '')

def switcher(slug, lang, published):
    links = []
    for l in LANGS:
        target = slug if (l == 'en' or slug in published) else ''
        cur = ' aria-current="true"' if l == lang else ''
        links.append(f'<a href="{url(l, target)}" hreflang="{l}" lang="{l}"{cur}>{l.upper()}</a>')
    return '<nav class="lang-switch" aria-label="Language">' + ''.join(links) + '</nav>'

def hreflangs(slug, published):
    langs = ['en'] + ([l for l in LANGS[1:]] if slug in published else [])
    tags = ''.join(f'<link rel="alternate" hreflang="{l}" href="{canon(l, slug)}"/>' for l in langs)
    return tags + f'<link rel="alternate" hreflang="x-default" href="{canon("en", slug)}"/>'

def decorate(html, slug, lang, published):
    """Switcher, hreflang, motion layer. Idempotent."""
    html = re.sub(r'<nav class="lang-switch".*?</nav>', '', html, flags=re.S)
    html = re.sub(r'<div class="lang-bar">.*?</div>', '', html, flags=re.S)
    html = re.sub(r'<link rel="alternate" hreflang="[^"]*" href="[^"]*"/>', '', html)
    sw = switcher(slug, lang, published)
    m = re.search(r'<header\b[^>]*>.*?</nav>', html, flags=re.S)
    if m:
        html = html[:m.end()] + sw + html[m.end():]
    else:
        html = re.sub(r'(<body\b[^>]*>)', r'\1<div class="lang-bar">' + sw + '</div>', html, count=1)
    # the old disabled language buttons are replaced by the switcher
    html = re.sub(r'<div aria-label="Language" class="langs" role="group">.*?</div>', '', html, flags=re.S)
    html = html.replace('</head>', hreflangs(slug, published) + '</head>', 1)
    if MOTION[0] not in html:
        html = html.replace('</head>', MOTION[0] + '</head>', 1)
    if MOTION[1] not in html:
        html = html.replace('</body>', MOTION[1] + '</body>', 1)
    if lang == 'ru' and RU_FONT not in html:
        html = html.replace('</head>', RU_FONT + '</head>', 1)
    return html

JS_CACHE = {}
def local_js(lang, src, table):
    """Translated copy of a site script, served from assets/i18n/<lang>/."""
    name = src.split('/')[-1]
    key = (lang, name)
    if key in JS_CACHE:
        return JS_CACHE[key]
    f = ROOT / 'assets' / name
    if not f.exists():
        JS_CACHE[key] = src; return src
    code = f.read_text(encoding='utf-8')
    if not list(C.js_strings(code)):
        JS_CACHE[key] = src; return src
    out = C.translate_js(code, lambda k: table.get(C.norm(k)))
    d = ROOT / 'assets' / 'i18n' / lang; d.mkdir(parents=True, exist_ok=True)
    (d / name).write_text(out, encoding='utf-8')
    JS_CACHE[key] = BASE + f'assets/i18n/{lang}/{name}'
    return JS_CACHE[key]

def localize_links(html, lang, published, table):
    def href(m):
        path, rest = m.group(1), m.group(2) or ''
        slug = path.strip('/')
        if slug == '' or (slug in published and '/' not in slug):
            return f'href="{url(lang, slug)}{rest}"'
        return m.group(0)
    html = re.sub(r'href="/NEWMEGA/([^"#?]*)([#?][^"]*)?"', href, html)
    html = re.sub(r'src="(/NEWMEGA/assets/[\w.-]+\.js)"', lambda m: f'src="{local_js(lang, m.group(1), table)}"', html)
    return html

def set_canonical(html, lang, slug):
    c = canon(lang, slug)
    html = re.sub(r'<link rel="canonical" href="[^"]*"\s*/?>', f'<link rel="canonical" href="{c}"/>', html)
    html = re.sub(r'<link href="[^"]*" rel="canonical"\s*/?>', f'<link rel="canonical" href="{c}"/>', html)
    html = re.sub(r'(<meta [^>]*property="og:url"[^>]*content=")[^"]*', r'\1' + c, html)
    html = re.sub(r'(<meta content=")[^"]*("[^>]*property="og:url")', r'\1' + c + r'\2', html)
    return html

def main():
    i18n = ROOT / 'i18n'
    published = set(json.loads((i18n / 'pages.json').read_text(encoding='utf-8')))
    pages = en_pages()
    for l in LANGS[1:]:
        shutil.rmtree(ROOT / l, ignore_errors=True)
    shutil.rmtree(ROOT / 'assets' / 'i18n', ignore_errors=True)
    report = {}
    sources = {slug: p.read_text(encoding='utf-8') for slug, p in pages.items()}
    for lang in LANGS[1:]:
        f = i18n / f'{lang}.json'
        table = json.loads(f.read_text(encoding='utf-8')) if f.exists() else {}
        table = {C.norm(k): v for k, v in table.items()}
        missing = set()
        for slug in sorted(published):
            if slug not in sources:
                continue
            out, miss = C.apply(sources[slug], table, lang)
            missing |= miss
            out = set_canonical(out, lang, slug)
            out = localize_links(out, lang, published, table)
            out = decorate(out, slug, lang, published)
            dest = ROOT / lang / slug if slug else ROOT / lang
            dest.mkdir(parents=True, exist_ok=True)
            (dest / 'index.html').write_text(out, encoding='utf-8')
        report[lang] = len(missing)
        (i18n / f'missing-{lang}.txt').write_text('\n'.join(sorted(missing)), encoding='utf-8')
    for slug, p in pages.items():
        p.write_text(decorate(sources[slug], slug, 'en', published), encoding='utf-8')
    # sitemaps
    for name, base in (('sitemap-preview.xml', 'https://kunaljoshi87.github.io/NEWMEGA/'), ('sitemap-production.xml', CANON)):
        sm = ROOT / name
        if sm.exists():
            x = sm.read_text(encoding='utf-8')
            extra = ''.join(f'<url><loc>{base}{l}/{(s + "/") if s else ""}</loc></url>\n' for l in LANGS[1:] for s in sorted(published))
            x = re.sub(r'<url><loc>[^<]*/(?:es|fr|pt|ru)/[^<]*</loc></url>\n', '', x)
            sm.write_text(x.replace('</urlset>', extra + '</urlset>'), encoding='utf-8')
    print('Languages built for', len(published), 'pages. Untranslated strings:', report)

if __name__ == '__main__':
    main()
