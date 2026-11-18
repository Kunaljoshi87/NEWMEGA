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

CONTACT_BLOCK = ('<div class="mx-contact">'
  '<div><h4>Corporate Office</h4><address>Speciality Business Center, A204<br/>Baner - Balewadi Rd, Balewadi<br/>Pune, Maharashtra 411045<br/>India</address>'
  '<p><a href="https://maps.app.goo.gl/qDJyUwLuz1FP1hdUA" rel="noopener" target="_blank">Open in Google Maps</a></p></div>'
  '<div><h4>Workshop</h4><address>Talegaon Dabhade, Jadhavwadi,<br/>Pune, Maharashtra 410507<br/>India</address>'
  '<p><a href="https://maps.app.goo.gl/P9XkR1yzuTTSPBxQ9" rel="noopener" target="_blank">Open in Google Maps</a></p></div>'
  '<div><h4>Phone &amp; Email</h4><ul>'
  '<li><a href="tel:+917276011520">+91 72760 11520</a></li>'
  '<li>Sales Enquiry: <a href="mailto:sales@mega.tc">sales@mega.tc</a></li>'
  '<li>General Enquiry: <a href="mailto:support@mega.tc">support@mega.tc</a></li>'
  '<li>Vendor Enquiry: <a href="mailto:purchase@mega.tc">purchase@mega.tc</a>, <a href="mailto:purchase.bo@mega.tc">purchase.bo@mega.tc</a></li>'
  '</ul></div>'
  '<div><h4>Business Hours</h4><p>Monday - Saturday: 9:00 AM - 6:00 PM</p></div>'
  '</div>')


# ---------------------------------------------------------------- site-wide header / footer
B_ = BASE
def _l(path, text): return f'<li><a href="{B_}{path}">{text}</a></li>'
NAV_HTML = (
 '<header class="mx-header"><div class="mx-hwrap">'
 f'<a class="mx-logo" href="{B_}" aria-label="MEGA Engineering home"><img class="mx-logo-dark" src="{B_}assets/mega-logo-t.png" alt="MEGA Engineering" width="101" height="42"/><img class="mx-logo-light" src="{B_}assets/mega-logo-light.png" alt="" aria-hidden="true" width="101" height="42"/></a>'
 '<nav class="mx-nav" id="mx-nav" aria-label="Main navigation"><ul class="mx-menu">'
 f'<li class="mx-item"><a class="mx-link" href="{B_}">Home</a></li>'
 f'<li class="mx-item mx-has"><a class="mx-link" href="{B_}about-us/">About Us</a><button class="mx-sub" type="button" aria-expanded="false" aria-label="About Us menu"></button>'
 '<div class="mx-drop"><ul>'
 + _l('about-us/', 'Company Overview') + _l('faqs/', 'FAQs') + _l('contact-mega-engineering-epc-company/', 'Contact Details') +
 '</ul></div></li>'
 f'<li class="mx-item mx-has mx-mega"><a class="mx-link" href="{B_}business-lines/">Business Lines</a><button class="mx-sub" type="button" aria-expanded="false" aria-label="Business Lines menu"></button>'
 '<div class="mx-drop"><div class="mx-cols">'
 '<div><p class="mx-h">Distillery &amp; Ethanol</p><ul>' + _l('fuel-ethanol/', 'Fuel Ethanol Plants') + _l('craft-brewery-plants/', 'Craft Brewery Plants') + '</ul></div>'
 '<div><p class="mx-h">CO₂ &amp; Biogas</p><ul>' + _l('co2-recovery-plants/', 'CO₂ Recovery Plants') + _l('bio-cng-biogas-plant-epc-mega-engineering/', 'Biogas &amp; Bio-CNG') + _l('cbg-technology-partnership-oekobit/', 'CBG Plants · OEKOBIT Partnership') + '</ul></div>'
 '<div><p class="mx-h">Evaporation &amp; ZLD</p><ul>' + _l('evaporation-dryer/', 'Evaporation &amp; Dryers') + _l('vinasse-dryer-manufacturer-from-india/', 'Vinasse Spray Dryer') + _l('zero-liquid-discharge-system/', 'Zero Liquid Discharge') + '</ul></div>'
 '<div><p class="mx-h">Equipment &amp; Skids</p><ul>' + _l('modular-process-skid/', 'Modular Process Skids') + _l('critical-process-equipment/', 'Critical Process Equipment') + _l('solvent-recovery-system/', 'Solvent Recovery Systems') + _l('automation-and-controls/', 'Automation &amp; Controls') + '</ul></div>'
 '<div><p class="mx-h">Services</p><ul>' + _l('engineering-services/', 'Engineering Services') + _l('project-management-services/', 'Project Management Services') + _l('industries/', 'Industries We Serve') + _l('business-lines/', 'All Business Lines →') + '</ul></div>'
 '</div></div></li>'
 f'<li class="mx-item mx-has"><a class="mx-link" href="{B_}projects/">Projects</a><button class="mx-sub" type="button" aria-expanded="false" aria-label="Projects menu"></button>'
 '<div class="mx-drop"><ul>'
 + _l('projects/', 'Project References') + _l('projects/#featured', 'Featured Projects') + _l('projects/#regions', 'Projects by Region') + _l('projects/#delivery', 'How We Deliver') +
 '</ul></div></li>'
 f'<li class="mx-item"><a class="mx-link" href="{B_}our-blogs-2/">Insights</a></li>'
 f'<li class="mx-item"><a class="mx-link" href="{B_}careers/">Careers</a></li>'
 f'<li class="mx-item"><a class="mx-link" href="{B_}contact-mega-engineering-epc-company/">Contact</a></li>'
 '</ul></nav>'
 '<button class="mx-burger" type="button" aria-controls="mx-nav" aria-expanded="false"><span class="mx-bars" aria-hidden="true"></span><span class="mx-burger-t">Menu</span></button>'
 '</div></header>')

CTA_HTML = ('<section class="mx-cta-band" aria-label="Contact MEGA"><div class="mx-cta-in"><div>'
 '<h2>Think Projects! Think MEGA!</h2>'
 '<p>Planning a new process plant, expanding an existing facility or upgrading your operations? MEGA\'s engineering team is ready to understand your requirements and explore the right solution for your project.</p></div>'
 '<div class="mx-cta-btns"><a class="mx-btn" href="mailto:sales@mega.tc">Email sales@mega.tc</a>'
 '<a class="mx-btn mx-btn-line" href="tel:+917276011520">Call +91 72760 11520</a></div></div></section>')

LEGAL_HTML = (f'<div class="mx-legal"><a href="{B_}privacy-policy/">Privacy Policy</a><a href="{B_}terms-of-use/">Terms of Use</a>'
 f'<a href="{B_}cookie-policy/">Cookie Policy</a><a href="{B_}faqs/">FAQs</a></div>')

def unify(html):
    """Same header, footer call-to-action and legal links on every page (English source)."""
    if 'class="mx-header"' in html:  # keep the shared header current
        html = re.sub(r'<header class="mx-header">.*?</header>', lambda m: NAV_HTML, html, count=1, flags=re.S)
    else:
        html, n = re.subn(r'<header class="(?:site|header|mega-head)"[^>]*>.*?</header>', NAV_HTML, html, count=1, flags=re.S)
        if not n:  # page without a site header (e.g. GOBARdhan article)
            html = re.sub(r'(<body\b[^>]*>)', lambda m: m.group(1) + NAV_HTML, html, count=1)
    if 'class="mx-cta-band"' in html:
        html = re.sub(r'<section class="mx-cta-band".*?</section>', lambda m: CTA_HTML, html, count=1, flags=re.S)
    else:
        html = re.sub(r'(<footer\b)', CTA_HTML + r'\1', html, count=1)
    if 'class="mx-legal"' not in html:
        html = re.sub(r'(</footer>)', LEGAL_HTML + r'\1', html, count=1)
    return html


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
    html = re.sub(r'<nav\b[^>]*class="lang-switch"[^>]*>.*?</nav>', '', html, flags=re.S)
    html = re.sub(r'<div class="lang-bar">\s*</div>', '', html)
    html = re.sub(r'<link\b(?=[^>]*\bhreflang=)[^>]*>', '', html)
    sw = switcher(slug, lang, published)
    m = re.search(r'<header class="(?:site|header|mega-head|mx-header)"[^>]*>.*?</nav>', html, flags=re.S)
    if m:
        html = html[:m.end()] + sw + html[m.end():]
    else:
        html = re.sub(r'(<body\b[^>]*>)', r'\1<div class="lang-bar">' + sw + '</div>', html, count=1)
    # the old disabled language buttons are replaced by the switcher
    html = re.sub(r'<div aria-label="Language" class="langs" role="group">.*?</div>', '', html, flags=re.S)
    # company contact details in the footer of the older page templates
    if 'class="mx-contact"' not in html:
        html = re.sub(r'(<footer class="(?:footer|mega-foot)"[^>]*>\s*<div class="(?:wrap|mega-wrap)">)', lambda m: m.group(1) + CONTACT_BLOCK, html, count=1)
    html = html.replace('</head>', hreflangs(slug, published) + '</head>', 1)
    if 'mega-motion.css' not in html:
        html = html.replace('</head>', MOTION[0] + '</head>', 1)
    if 'mega-motion.js' not in html:
        html = html.replace('</body>', MOTION[1] + '</body>', 1)
    if lang == 'ru' and 'Roboto+Condensed' not in html:
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
    sources = {slug: unify(p.read_text(encoding='utf-8')) for slug, p in pages.items()}
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
    for name, base in (('sitemap-preview.xml', 'https://mega-engineering.github.io/NEWMEGA/'), ('sitemap-production.xml', CANON)):
        sm = ROOT / name
        if sm.exists():
            x = sm.read_text(encoding='utf-8')
            extra = ''.join(f'<url><loc>{base}{l}/{(s + "/") if s else ""}</loc></url>\n' for l in LANGS[1:] for s in sorted(published))
            x = re.sub(r'<url><loc>[^<]*/(?:es|fr|pt|ru)/[^<]*</loc></url>\n', '', x)
            sm.write_text(x.replace('</urlset>', extra + '</urlset>'), encoding='utf-8')
    print('Languages built for', len(published), 'pages. Untranslated strings:', report)

if __name__ == '__main__':
    main()
