#!/usr/bin/env python3
# Build new blog articles into static SEO-friendly pages.
from pathlib import Path
import os,re,html,json,datetime,shutil
from urllib.parse import urlparse
import yaml,mistune
ROOT=Path(__file__).resolve().parents[1]
BASE=os.environ.get('MEGA_BASE','/NEWMEGA/').rstrip('/')+'/'
PROD=os.environ.get('MEGA_PRODUCTION','0')=='1'
CANON='https://www.mega.tc/'
try: legacy=json.loads((ROOT/'content/legacy-posts.json').read_text())
except:legacy=[]

def clean(s):return html.escape(str(s or ''),quote=True)
def slugify(s):return re.sub(r'[^a-z0-9]+','-',s.lower()).strip('-')
def imgsrc(path):
 p=str(path or '').strip()
 if not p:return ''
 if p.startswith('/NEWMEGA/') or p.startswith('http://') or p.startswith('https://'):return p
 if p.startswith('/'):return BASE+p.lstrip('/')
 return BASE+p

def read_posts():
 posts=[]
 for path in sorted((ROOT/'content/posts').glob('*.md')):
  raw=path.read_text(encoding='utf-8')
  mt=re.match(r'\A---\s*\n(.*?)\n---\s*\n(.*)',raw,re.S)
  if not mt:continue
  data=yaml.safe_load(mt.group(1)) or {}
  if data.get('published') not in [True,'true','True',1]:continue
  date=data.get('date') or datetime.date.today()
  date=date.isoformat() if hasattr(date,'isoformat') else str(date)
  slug=slugify(path.stem)
  if not slug or slug in {'blog','admin','about-us','our-blogs-2'}:continue
  desc=str(data.get('description') or '').strip()[:280]
  title=str(data.get('title') or '').strip()
  if not title or not desc:continue
  posts.append(dict(slug=slug,title=title,date=date,author=str(data.get('author') or 'MEGA Engineering Team'),category=str(data.get('category') or 'Engineering Insights'),description=desc,cover=imgsrc(data.get('cover')),body=mt.group(2),content_format=str(data.get('content_format') or 'markdown'),legacy=False))
 return sorted(posts,key=lambda x:x['date'],reverse=True)

def global_header():
 return f'<div class="stripe"></div><header class="header"><div class="wrap head-inner"><a class="brand" href="{BASE}"><img src="{BASE}assets/mega-logo.png" alt="MEGA Engineering logo" width="170" height="49"></a><nav class="nav" aria-label="Main navigation"><a href="{BASE}">Home</a><a href="{BASE}about-us/">About</a><a href="{BASE}business-lines/">Business Lines</a><a href="{BASE}engineering-services/">Services</a><a href="{BASE}our-blogs-2/">Blogs</a><a href="{BASE}contact-mega-engineering-epc-company/">Contact</a></nav></div></header>'

def global_footer():
 return f'<footer class="footer"><div class="wrap"><p><strong>MEGA Engineering</strong> — Engineering, procurement and construction solutions.</p><p><a href="{BASE}about-us/">About</a> · <a href="{BASE}our-blogs-2/">Articles</a> · <a href="{BASE}contact-mega-engineering-epc-company/">Contact</a></p></div></footer>'

def document(title,desc,url,body,schema=None,image=''):
 robots='<meta name="robots" content="index,follow">' if PROD else '<meta name="robots" content="noindex,follow">'
 data=f'<script type="application/ld+json">{json.dumps(schema,ensure_ascii=False).replace("</","<\\/")}</script>' if schema else ''
 ogimage=f'<meta property="og:image" content="{clean(image)}">' if image else ''
 return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{clean(title)}</title><meta name="description" content="{clean(desc)}"><link rel="canonical" href="{clean(url)}">{robots}<meta property="og:type" content="article"><meta property="og:title" content="{clean(title)}"><meta property="og:description" content="{clean(desc)}"><meta property="og:url" content="{clean(url)}">{ogimage}<meta name="twitter:card" content="summary_large_image"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Barlow:wght@500;600;700&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet"><link rel="stylesheet" href="{BASE}assets/site.css"><link rel="stylesheet" href="{BASE}assets/mega-editorial.css">{data}</head><body>{global_header()}{body}{global_footer()}<script defer src="{BASE}assets/mega-editorial.js"></script></body></html>'''

def card(p,i):
 name=clean(p['title']);desc=clean(p.get('description','')[:150]);category=clean(p.get('category') or 'Engineering Insights')
 img=p.get('cover') or f'{BASE}assets/design-image-0{(i%9)+1}.jpg'
 return f'''<article class="editorial-card reveal" data-blog-card data-category="{category}"><a href="{BASE}{clean(p['slug'])}/"><img class="editorial-image" loading="lazy" src="{clean(img)}" alt="{name}" onerror="this.src='{BASE}assets/hero-1.jpg'"></a><div class="editorial-body"><div class="editorial-meta"><span class="category-pill">{category}</span>{clean(p.get('date') or '')}</div><h3><a href="{BASE}{clean(p['slug'])}/">{name}</a></h3><p>{desc}</p><a class="view-link" href="{BASE}{clean(p['slug'])}/">Read article →</a></div></article>'''

def build():
 posts=read_posts(); used={p['slug'] for p in posts}
 # keep old WordPress article paths; dynamically created posts can never overwrite existing original pages
 posts=[p for p in posts if p.get('content_format')=='standalone-html' or not (ROOT/p['slug']/'index.html').exists() or 'class="article-shell"' in (ROOT/p['slug']/'index.html').read_text(encoding='utf-8',errors='ignore')]
 for p in posts:
  url=CANON+p['slug']+'/'
  if p.get('content_format')=='standalone-html':
   # Keep reviewed self-contained interactive HTML intact; include post in cards and sitemaps.
   if not (ROOT/p['slug']/'index.html').exists():
    raise FileNotFoundError('Standalone HTML missing for '+p['slug'])
   continue
  text=p['body'] if p.get('content_format')=='trusted-html' else mistune.html(p['body'])
  # images in rich text must remain relative to repo prefix
  text=re.sub(r'(src|href)=["\']/(?!NEWMEGA/|https?://)',lambda m:m.group(1)+'="'+BASE,text)
  img=f'<img class="article-hero" loading="eager" src="{clean(p["cover"])}" alt="{clean(p["title"])}">' if p['cover'] else ''
  schema={'@context':'https://schema.org','@type':'BlogPosting','headline':p['title'],'description':p['description'],'datePublished':p['date'],'author':{'@type':'Organization','name':p['author']},'publisher':{'@type':'Organization','name':'MEGA Engineering','url':CANON},'mainEntityOfPage':url}
  if p['cover']:schema['image']=p['cover'].replace('https://kunaljoshi87.github.io/NEWMEGA/',CANON)
  body=f'''<div class="progress-track"><div class="progress-value"></div></div><main class="article-shell"><a href="{BASE}our-blogs-2/">← Back to all articles</a><p class="kicker">{clean(p['category'])} · {clean(p['date'])}</p><h1>{clean(p['title'])}</h1><p class="article-lead">{clean(p['description'])}</p><p class="editorial-meta">Written by {clean(p['author'])}</p>{img}<div class="body-copy">{text}</div><div class="share-row"><strong>Share this article</strong><a href="https://www.linkedin.com/sharing/share-offsite/?url={url}" target="_blank" rel="noopener">LinkedIn</a><button data-copy-link type="button">Copy link</button></div><div class="blog-cta"><h2>Discuss your next process plant project</h2><p>Talk with MEGA Engineering about your process, EPC and equipment requirements.</p><a href="{BASE}contact-mega-engineering-epc-company/">Contact our team →</a></div></main>'''
  target=ROOT/p['slug'];target.mkdir(exist_ok=True)
  (target/'index.html').write_text(document(p['title']+' | MEGA Engineering',p['description'],url,body,schema,p['cover']),encoding='utf-8')
 allposts=posts+[p for p in legacy if p['slug'] not in {x['slug'] for x in posts}]
 # Refresh the latest-insights cards on the homepage whenever new posts are published.
 home=ROOT/'index.html'
 if home.exists():
  h=home.read_text(encoding='utf-8')
  start=h.find('<section id="latest-insights"')
  if start>=0:
   a=h.find('<div class="editorial-grid">',start)
   b=h.find('</div><div class="stat-trio">',a)
   if a>=0 and b>a:
    newest=allposts[:3]
    blocks=''.join(card(p,i) for i,p in enumerate(newest))
    h=h[:a]+'<div class="editorial-grid">'+blocks+h[b:]
    home.write_text(h,encoding='utf-8')
 cats=sorted(set((p.get('category') or 'Engineering Insights') for p in allposts))
 filters='<button class="filter-pill active" data-filter="All">All articles</button>'+''.join(f'<button class="filter-pill" data-filter="{clean(cat)}">{clean(cat)}</button>' for cat in cats)
 tiles=''.join(card(p,i) for i,p in enumerate(allposts))
 listing=f'''<main><section class="blog-list-banner"><div class="wrap"><p class="kicker">TECHNICAL ARTICLES & COMPANY KNOWLEDGE</p><h1>Insights from MEGA Engineering</h1><p class="lede">Explore practical perspectives on ethanol, biogas, CO₂ recovery, industrial equipment and sustainable process technology.</p><div class="blog-controls"><input id="blog-search" class="blog-search" type="search" aria-label="Search blog articles" placeholder="Search articles, topics, technology...">{filters}</div></div></section><section class="news-section"><div class="wrap"><div class="editorial-grid">{tiles}</div><p id="no-posts" class="empty-results" hidden>No articles match the selected category or search.</p></div></section></main>'''
 ls={'@context':'https://schema.org','@type':'CollectionPage','name':'MEGA Engineering Articles','url':CANON+'our-blogs-2/','mainEntity':{'@type':'ItemList','itemListElement':[{'@type':'ListItem','position':i+1,'url':CANON+p['slug']+'/'} for i,p in enumerate(allposts)]}}
 content=document('Engineering Articles & Insights | MEGA Engineering','Technical articles on ethanol plants, biogas, CO2 recovery, EPC and industrial process engineering.',CANON+'our-blogs-2/',listing,ls)
 for key in ['our-blogs-2','blog']:
  path=ROOT/key;path.mkdir(exist_ok=True);(path/'index.html').write_text(content.replace('https://www.mega.tc/our-blogs-2/',CANON+key+'/') if key=='blog' else content,encoding='utf-8')
 # sitemap preview includes all original static paths + new articles
 allpages=[f'/{p.parent.relative_to(ROOT).as_posix()}/' if p.parent!=ROOT else '/' for p in ROOT.rglob('index.html') if not any(x in p.parts for x in ('.git','content','scripts'))]
 allpages=sorted(set(allpages))
 sitemap=lambda base:'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join(f'<url><loc>{html.escape(base+slug.lstrip("/"))}</loc></url>\n' for slug in allpages)+'</urlset>\n'
 (ROOT/'sitemap-preview.xml').write_text(sitemap('https://kunaljoshi87.github.io/NEWMEGA/'),encoding='utf-8')
 (ROOT/'sitemap-production.xml').write_text(sitemap(CANON),encoding='utf-8')
 print('Published existing WordPress blogs:',len(legacy),'New published CMS posts:',len(posts),'Total article cards:',len(allposts),'Static pages:',len(allpages))
if __name__=='__main__':build()
