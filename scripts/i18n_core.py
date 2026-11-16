"""MEGA website translation engine.

English pages are the source. Text is cut into segments (a run of text plus inline tags such as
<b>, <a>, <sub>), attributes (alt, title, placeholder, aria-label, meta descriptions) and readable
string literals inside page scripts. Translations live in i18n/<lang>.json as {english: translation}.
Anything not yet translated falls back to English.
"""
import re, json
from bs4 import BeautifulSoup, NavigableString, Tag, Comment

INLINE = {'a', 'abbr', 'b', 'br', 'code', 'em', 'i', 'mark', 's', 'small', 'span', 'strong', 'sub', 'sup', 'u',
          'kbd', 'time', 'img', 'wbr', 'tspan', 'q', 'cite', 'bdi'}
SKIP = {'script', 'style', 'noscript', 'template', 'textarea', 'code', 'pre'}
ATTRS = ('alt', 'title', 'placeholder', 'aria-label', 'data-subject')
META_KEYS = {'description', 'og:title', 'og:description', 'twitter:title', 'twitter:description'}
LETTERS = re.compile(r'[A-Za-z]{2,}')

def norm(s):
    return re.sub(r'\s+', ' ', s).strip()

def wanted(text):
    """Is this human text worth translating?"""
    t = norm(re.sub(r'<[^>]+>', ' ', text))
    if not LETTERS.search(t):
        return False
    if re.fullmatch(r'[A-Z0-9₂³°\-/·.,:+&%()× ]{1,14}', t):  # tags/codes like FT-1, CO₂, MEGA, PLC
        return False
    if re.fullmatch(r'(https?://|www\.|mailto:|tel:)\S+', t) or re.fullmatch(r'\S+@\S+', t) or t.startswith('+91'):
        return False
    return True

def all_inline(node):
    if isinstance(node, NavigableString):
        return not isinstance(node, Comment)
    if not isinstance(node, Tag) or node.name not in INLINE:
        return False
    return all(all_inline(c) for c in node.children)

def runs(container):
    """Group consecutive inline children of a container into runs."""
    cur = []
    for c in list(container.children):
        if isinstance(c, Comment):
            continue
        if all_inline(c):
            cur.append(c)
        else:
            if cur:
                yield cur
            cur = []
    if cur:
        yield cur

def split_runs(container):
    """Runs, but a run made only of sibling elements (links in a menu, label + value pairs)
    is split so each element is translated on its own."""
    for run in runs(container):
        tags = [n for n in run if isinstance(n, Tag)]
        loose = [n for n in run if isinstance(n, NavigableString) and str(n).strip()]
        if tags and not loose and all(t.name not in ("br", "img") for t in tags):
            for t in tags:
                yield from split_runs(t)
        else:
            yield run

def run_html(run):
    return norm(''.join(str(n) for n in run))

def containers(soup):
    for el in soup.find_all(True):
        if el.name in SKIP or el.name in INLINE and el.parent is not None and all_inline(el):
            continue
        if any(p.name in SKIP for p in el.parents if isinstance(p, Tag)):
            continue
        yield el

# ---------------------------------------------------------------- JS string literals
REGEX_PREV = set('(,=:[!&|?{};+-*%<>~^')

def js_scan(code):
    """Yield (start, end, quote, body) for every string literal, skipping comments and regex literals."""
    i, n, prev = 0, len(code), ''
    while i < n:
        c = code[i]
        if c in '"\'`':
            j = i + 1
            while j < n and code[j] != c:
                if code[j] == '\\':
                    j += 1
                elif c == '`' and code[j] == '$' and j + 1 < n and code[j + 1] == '{':
                    depth = 1; j += 2
                    while j < n and depth:
                        depth += {'{': 1, '}': -1}.get(code[j], 0); j += 1
                    continue
                j += 1
            yield i, j + 1, c, code[i + 1:j]
            i = j + 1; prev = 'x'; continue
        if c == '/' and i + 1 < n and code[i + 1] == '/':
            k = code.find('\n', i); i = n if k < 0 else k; continue
        if c == '/' and i + 1 < n and code[i + 1] == '*':
            k = code.find('*/', i + 2); i = n if k < 0 else k + 2; continue
        if c == '/' and (prev in REGEX_PREV or prev == ''):
            j = i + 1; cls = False
            while j < n and code[j] != '\n':
                if code[j] == '\\': j += 2; continue
                if code[j] == '[': cls = True
                elif code[j] == ']': cls = False
                elif code[j] == '/' and not cls: break
                j += 1
            i = j + 1; prev = 'x'; continue
        if not c.isspace():
            prev = c
        i += 1

def js_wanted(s):
    if '${' in s or '\n' in s:
        return False
    if not re.search(r'[A-Za-z]{3,}', s) or ' ' not in s.strip():
        return False
    if re.search(r'(querySelector|getElementById|function|=>|\bvar\b|\blet\b|\bconst\b|\)\s*\{|;\s*$)', s):
        return False
    if re.fullmatch(r'[#.\[\]\w\s:>=~*"(),-]+', s) and (re.search(r'[.#\[\]>:=]', s) or s == s.lower()) and not re.search(r'[A-Za-z]{3,} [a-z]{3,} [a-z]{3,}', s):  # css selectors
        return False
    if re.match(r'^[\w-]+(\s[\w-]+)*$', s) and s == s.lower() and len(s.split()) <= 3 and '-' in s:  # class lists
        return False
    if s.strip().startswith(('M ', 'M0', 'L ', 'translate(', 'rotate(', 'rgba', 'url(', 'http')):
        return False
    return wanted(s)

KEYNAMES = {'Enter', 'Escape', 'Tab', 'Space', 'Backspace', 'Delete', 'Home', 'End', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown'}

def js_word(s):
    """Single capitalised word labels (e.g. 'Compression') - translated only when the table knows them."""
    return bool(re.fullmatch(r'[A-Z][a-z]{3,}', s)) and s not in KEYNAMES

def js_strings(code):
    for st, en, q, body in js_scan(code):
        if js_wanted(body):
            yield body

def translate_js(code, tr):
    out, last = [], 0
    for st, en, q, body in js_scan(code):
        if not js_wanted(body) and not js_word(body):
            continue
        key = body.replace("\\'", "'").replace('\\"', '"')
        t = tr(key)
        if t is None:
            continue
        lead = body[:len(body) - len(body.lstrip())]; trail = body[len(body.rstrip()):]
        out.append(code[last:st]); out.append(q + lead + t.replace(q, '\\' + q) + trail + q); last = en
    out.append(code[last:])
    return ''.join(out)

# ---------------------------------------------------------------- JSON-LD
LD_KEYS = {'name', 'description', 'text', 'headline', 'serviceType', 'alternateName'}

def ld_walk(obj, fn):
    if isinstance(obj, dict):
        return {k: (fn(v) if k in LD_KEYS and isinstance(v, str) else ld_walk(v, fn)) for k, v in obj.items()}
    if isinstance(obj, list):
        return [ld_walk(v, fn) for v in obj]
    return obj

# ---------------------------------------------------------------- extract / apply
def extract(html_text):
    soup = BeautifulSoup(html_text, 'html.parser')
    keys = []
    add = lambda k: keys.append(k) if k and wanted(k) else None
    if soup.title and soup.title.string:
        add(norm(soup.title.string))
    for m in soup.find_all('meta'):
        if (m.get('name') or m.get('property')) in META_KEYS and m.get('content'):
            add(norm(m['content']))
    body = soup.body or soup
    for el in containers(body):
        for run in split_runs(el):
            h = run_html(run)
            if wanted(h):
                add(h)
    for el in body.find_all(True):
        for a in ATTRS:
            if el.get(a) and not any(p.name in SKIP for p in el.parents if isinstance(p, Tag)):
                add(norm(el[a]))
        if el.name == 'input' and el.get('type') in ('submit', 'button') and el.get('value'):
            add(norm(el['value']))
    for s in soup.find_all('script'):
        code = s.string or ''
        if s.get('type') == 'application/ld+json':
            try:
                ld_walk(json.loads(code), lambda v: (add(norm(v)), v)[1])
            except Exception:
                pass
        elif not s.get('src') and s.get('type') in (None, 'text/javascript', 'module'):
            for k in js_strings(code):
                add(k)
    seen, out = set(), []
    for k in keys:
        if k not in seen:
            seen.add(k)
            out.append(k)
    return out

def apply(html_text, table, lang, hooks=None):
    """Return translated HTML. table: {english: translation}."""
    miss = set()
    def tr(k):
        k2 = norm(k)
        if not wanted(k2):
            return None
        v = table.get(k2)
        if v is None:
            miss.add(k2)
        return v
    soup = BeautifulSoup(html_text, 'html.parser')
    if soup.html:
        soup.html['lang'] = lang
    if soup.title and soup.title.string:
        v = tr(soup.title.string)
        if v: soup.title.string = v
    for m in soup.find_all('meta'):
        if (m.get('name') or m.get('property')) in META_KEYS and m.get('content'):
            v = tr(m['content'])
            if v: m['content'] = v
    body = soup.body or soup
    for el in list(containers(body)):
        for run in list(split_runs(el)):
            h = run_html(run)
            v = tr(h) if wanted(h) else None
            if not v:
                continue
            lead = ' ' if isinstance(run[0], NavigableString) and str(run[0])[:1].isspace() else ''
            trail = ' ' if isinstance(run[-1], NavigableString) and str(run[-1])[-1:].isspace() else ''
            frag = BeautifulSoup(lead + v + trail, 'html.parser')
            anchor = run[0]
            for node in list(frag.contents):
                anchor.insert_before(node)
            for n in run:
                n.extract()
    for el in body.find_all(True):
        if any(p.name in SKIP for p in el.parents if isinstance(p, Tag)):
            continue
        for a in ATTRS:
            if el.get(a):
                v = tr(el[a])
                if v: el[a] = v
        if el.name == 'input' and el.get('type') in ('submit', 'button') and el.get('value'):
            v = tr(el['value'])
            if v: el['value'] = v
    for s in soup.find_all('script'):
        code = s.string
        if not code:
            continue
        if s.get('type') == 'application/ld+json':
            try:
                data = ld_walk(json.loads(code), lambda v: tr(v) or v)
                s.string = json.dumps(data, ensure_ascii=False)
            except Exception:
                pass
        elif not s.get('src') and s.get('type') in (None, 'text/javascript', 'module'):
            s.string = translate_js(code, tr)
    if hooks:
        hooks(soup)
    return str(soup), miss
