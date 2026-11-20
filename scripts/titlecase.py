"""Title Case helper: capitalise each word of headings, questions and buttons (English pages only).

Rules: every word starts with a capital letter, except short joining words
(a, an, the, and, or, of, to, in, on, at, by, for, with, from, as, per, via, vs)
when they are not the first or last word. Words that already contain capitals or
digits (MEGA, CO₂, BioCNG, pH, 5–300 KLPD) and links/units with "/" are left as written.

Usage:  python scripts/titlecase.py            (updates the English pages in place)
"""
import re
from pathlib import Path

SMALL = {'a', 'an', 'the', 'and', 'but', 'or', 'nor', 'of', 'to', 'in', 'on', 'at', 'by', 'for',
         'with', 'from', 'as', 'per', 'via', 'vs', 'vs.', 'into', 'over', 'than'}
WORD = re.compile(r"[A-Za-zÀ-ÿ][\w'’\-/]*")


def _cap_part(p):
    return p[:1].upper() + p[1:] if p else p


def _fix_word(w, first, last):
    if any(ch.isdigit() for ch in w) or '/' in w or '@' in w:
        return w
    if any(ch.isupper() for ch in w[1:]):          # MEGA, BioCNG, pH, CO₂ ...
        return w
    low = w.lower()
    if low in SMALL and not first and not last:
        return low
    return '-'.join(_cap_part(x) for x in w.split('-'))


def title_case(text):
    """Title Case one plain-text string (no HTML)."""
    words = list(WORD.finditer(text))
    if not words:
        return text
    out, pos = [], 0
    for i, m in enumerate(words):
        before = text[pos:m.start()]
        # a word right after ":", "–", "—", "|" or "?" starts a new phrase
        new_phrase = bool(re.search(r'[:–—|?!·]\s*$', text[:m.start()]))
        out.append(before)
        out.append(_fix_word(m.group(0), i == 0 or new_phrase, i == len(words) - 1))
        pos = m.end()
    out.append(text[pos:])
    return ''.join(out)


def title_case_html(inner):
    """Title Case the text parts of a small HTML fragment, leaving tags and entities alone."""
    parts = re.split(r'(<[^>]+>|&[#\w]+;)', inner)
    # treat the fragment as one phrase so "first/last word" rules work across inline tags
    idx = [i for i, p in enumerate(parts) if p and not p.startswith('<') and not p.startswith('&') and WORD.search(p)]
    for n, i in enumerate(idx):
        t = parts[i]
        words = list(WORD.finditer(t))
        res, pos = [], 0
        for k, m in enumerate(words):
            first = (n == 0 and k == 0) or bool(re.search(r'[:–—|?!·]\s*$', t[:m.start()]))
            last = (n == len(idx) - 1 and k == len(words) - 1)
            a = t.rfind(' ', 0, m.start()) + 1; b = t.find(' ', m.end()); b = len(t) if b < 0 else b
            chunk = t[a:b]
            w = m.group(0) if ('@' in chunk or 'www.' in chunk or '://' in chunk) else _fix_word(m.group(0), first, last)
            res.append(t[pos:m.start()]); res.append(w); pos = m.end()
        res.append(t[pos:]); parts[i] = ''.join(res)
    return ''.join(parts)


TAGS = re.compile(r'(<(h[1-5]|summary|th|button)\b[^>]*>)(.*?)(</\2>)', re.S)
BTN = re.compile(r'(<a\b[^>]*class="[^"]*\b(?:mx-btn|btn|mega-btn|me-link|read|view-link)\b[^"]*"[^>]*>)(.*?)(</a>)', re.S)


def apply(html):
    # never touch scripts, styles or SVG drawings
    keep = {}
    def stash(m):
        k = f'\x00{len(keep)}\x00'; keep[k] = m.group(0); return k
    html = re.sub(r'<(script|style|svg)\b.*?</\1>', stash, html, flags=re.S)
    html = TAGS.sub(lambda m: m.group(1) + title_case_html(m.group(3)) + m.group(4), html)
    html = BTN.sub(lambda m: m.group(1) + title_case_html(m.group(2)) + m.group(3), html)
    for k, v in keep.items():
        html = html.replace(k, v)
    return html


if __name__ == '__main__':
    root = Path(__file__).resolve().parents[1]
    skip = {'es', 'fr', 'pt', 'ru', 'ar', 'assets', 'media', 'content', 'scripts', 'i18n', '.git', '.github'}
    n = 0
    for p in [root / 'index.html'] + sorted(root.glob('*/index.html')):
        if p.parent.name in skip:
            continue
        t = p.read_text(encoding='utf-8'); t2 = apply(t)
        if t2 != t:
            p.write_text(t2, encoding='utf-8'); n += 1
    print('Title Case applied to', n, 'pages')
