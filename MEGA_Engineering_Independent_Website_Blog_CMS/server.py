"""Independent MEGA website and blog CMS using only Python standard library.
Set MEGA_ADMIN_PASSWORD and MEGA_SESSION_SECRET securely before starting.
"""
import os, re, sys, json, hmac, base64, hashlib, secrets, sqlite3, html, datetime, urllib.parse
from pathlib import Path
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from http.cookies import SimpleCookie
ROOT=Path(__file__).resolve().parent
DB=Path(os.getenv('MEGA_DB_PATH',str(ROOT/'data'/'blog.sqlite3')))
PASSWORD=os.getenv('MEGA_ADMIN_PASSWORD','')
SECRET=os.getenv('MEGA_SESSION_SECRET','').encode()
HTTPS=os.getenv('MEGA_HTTPS','0')=='1'
DOMAIN=os.getenv('MEGA_SITE_URL','https://www.mega.tc').rstrip('/')
PORT=int(os.getenv('PORT','8080'))

def db():
 DB.parent.mkdir(parents=True,exist_ok=True)
 c=sqlite3.connect(str(DB),timeout=20)
 c.row_factory=sqlite3.Row
 return c

def init():
 with db() as c:
  c.execute('CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY, title TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, excerpt TEXT NOT NULL DEFAULT "", body TEXT NOT NULL DEFAULT "", category TEXT NOT NULL DEFAULT "Insights", image_url TEXT NOT NULL DEFAULT "", seo_title TEXT NOT NULL DEFAULT "", seo_description TEXT NOT NULL DEFAULT "", status TEXT NOT NULL DEFAULT "draft", created TEXT NOT NULL, updated TEXT NOT NULL)')

def esc(s):return html.escape(str(s or ''),quote=True)
def slugify(s):return re.sub(r'[^a-z0-9]+','-',s.lower()).strip('-')[:90] or 'article'
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def cookie_sig(ts):return hmac.new(SECRET,('admin:'+str(ts)).encode(),hashlib.sha256).hexdigest()
def layout(title,content,description='',canonical='',admin=False):
 nav='<a href="/">Home</a><a href="/blog/">Blog &amp; Insights</a>'
 if admin:nav+='<a href="/admin/">Manage Blogs</a><form method="post" action="/admin/logout" style="display:inline"><button>Sign out</button></form>'
 canonical_tag=f'<link rel="canonical" href="{esc(DOMAIN+canonical)}">' if canonical else ''
 return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{esc(title)}</title><meta name="description" content="{esc(description[:160])}">{canonical_tag}<style>
:root{{--blue:#36618E;--green:#90A840;--bg:#F5F8FB;--ink:#202028}}*{{box-sizing:border-box}}body{{font-family:system-ui,Segoe UI,sans-serif;margin:0;color:var(--ink);background:#fff;line-height:1.6}}header{{border-top:4px solid var(--green);border-bottom:1px solid #e1e7ef;padding:18px max(20px,calc((100vw - 1150px)/2));display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap}}header b{{font-size:1.22rem;color:var(--blue)}}nav{{display:flex;gap:20px;align-items:center;flex-wrap:wrap}}a{{color:var(--blue)}}nav a{{text-decoration:none;font-weight:600}}main{{max-width:1150px;padding:50px 20px 90px;margin:auto}}h1,h2,h3{{line-height:1.2}}h1{{font-size:clamp(2rem,4vw,3.2rem);color:var(--blue)}}.intro{{max-width:760px;color:#536477;font-size:1.1rem}}.cards{{display:grid;grid-template-columns:repeat(auto-fit,minmax(275px,1fr));gap:22px;margin:34px 0}}.card{{border:1px solid #d9e2ea;border-radius:10px;padding:24px;background:#fff}}.tag{{font-size:.86rem;color:#627E25;font-weight:700;text-transform:uppercase}}.muted{{color:#68798b}}.btn,button{{display:inline-block;background:var(--blue);color:white;border:0;padding:11px 17px;border-radius:6px;text-decoration:none;font-weight:650;cursor:pointer;font-size:1rem}}.secondary{{background:white;border:1px solid var(--blue);color:var(--blue)}}input,textarea,select{{font:inherit;border:1px solid #b5c4d2;border-radius:5px;padding:10px;max-width:100%;width:100%}}label{{display:block;font-weight:600;margin:15px 0 6px}}textarea{{min-height:140px}}.bodyinput{{min-height:340px}}.controls{{display:flex;gap:12px;flex-wrap:wrap;margin-top:20px}}.grid2{{display:grid;grid-template-columns:1fr 1fr;gap:18px}}.article{{max-width:770px}}.article .body{{white-space:pre-wrap;overflow-wrap:anywhere;font-size:1.08rem}}.article img,.card img{{max-width:100%;height:auto;border-radius:8px}}table{{border-collapse:collapse;width:100%}}th,td{{padding:12px;border-bottom:1px solid #dae2e9;text-align:left;vertical-align:top}}.error{{background:#fff1e6;padding:15px;border-left:4px solid #d76b22}}footer{{padding:24px;text-align:center;background:var(--bg);color:#657484}}@media(max-width:650px){{.grid2{{grid-template-columns:1fr}}table{{display:block;overflow-x:auto}}}}</style></head><body><header><b>MEGA Engineering</b><nav>{nav}</nav></header><main>{content}</main><footer>© MEGA Engineering · <a href="/">Home</a> · <a href="/blog/">Blog</a></footer></body></html>'''

class Handler(BaseHTTPRequestHandler):
 def send(self,status,content,kind='text/html; charset=utf-8',extra=None):
  if isinstance(content,str):content=content.encode('utf-8')
  self.send_response(status)
  self.send_header('Content-Type',kind)
  self.send_header('Content-Length',str(len(content)))
  self.send_header('X-Content-Type-Options','nosniff')
  self.send_header('Referrer-Policy','strict-origin-when-cross-origin')
  self.send_header('X-Frame-Options','DENY')
  self.send_header('Cache-Control','no-store' if self.path.startswith('/admin') else 'public, max-age=120')
  for k,v in (extra or []):self.send_header(k,v)
  self.end_headers();self.wfile.write(content)
 def redirect(self,to,extra=None):self.send(303,b'','text/plain',[('Location',to)]+(extra or []))
 def form(self):
  n=int(self.headers.get('Content-Length','0'))
  if n>1024*1024:raise ValueError('Request too large')
  return {k:v[0] for k,v in urllib.parse.parse_qs(self.rfile.read(n).decode('utf8'),keep_blank_values=True).items()}
 def authorized(self):
  jar=SimpleCookie()
  try:jar.load(self.headers.get('Cookie',''))
  except Exception:return False
  value=jar.get('mega_admin')
  if not value:return False
  try:
   ts,signature=value.value.split('.')
   return int(ts)>int(datetime.datetime.now(datetime.timezone.utc).timestamp()) and hmac.compare_digest(signature,cookie_sig(ts))
  except Exception:return False
 def csrf(self):
  # same-site browsers + strict origin check for all admin modifications
  origin=self.headers.get('Origin','')
  host=self.headers.get('Host','')
  if origin and urllib.parse.urlsplit(origin).netloc!=host:return False
  referer=self.headers.get('Referer','')
  if referer and urllib.parse.urlsplit(referer).netloc!=host:return False
  return True
 def do_GET(self):
  path=urllib.parse.urlsplit(self.path).path
  if path=='/':return self.send(200,(ROOT/'index.html').read_bytes())
  if path in ('/blog','/blog/'):
   with db() as c:rows=c.execute("SELECT * FROM posts WHERE status='published' ORDER BY created DESC").fetchall()
   cards=''.join(f'<article class="card"><span class="tag">{esc(p["category"])}</span><h2><a href="/blog/{esc(p["slug"])}/">{esc(p["title"])}</a></h2><p>{esc(p["excerpt"])}</p><a href="/blog/{esc(p["slug"])}/">Read article →</a></article>' for p in rows)
   body='<h1>Engineering Insights &amp; Industry Blogs</h1><p class="intro">Technical articles, project insights and industry updates from MEGA Engineering.</p><section class="cards">'+(cards or '<p>No blog posts have been published yet.</p>')+'</section>'
   return self.send(200,layout('Engineering Blogs | MEGA Engineering',body,'Engineering articles and technical insights from MEGA Engineering.','/blog/'))
  match=re.fullmatch(r'/blog/([a-z0-9-]+)/?',path)
  if match:
   with db() as c:p=c.execute("SELECT * FROM posts WHERE slug=? AND status='published'",(match[1],)).fetchone()
   if not p:return self.send(404,layout('Not found','<h1>Article not found</h1>'))
   photo=f'<img src="{esc(p["image_url"])}" alt="{esc(p["title"])}">' if p['image_url'] else ''
   body=f'<article class="article"><a href="/blog/">← All articles</a><p class="tag">{esc(p["category"])}</p><h1>{esc(p["title"])}</h1><p class="muted">{esc(p["created"][:10])}</p>{photo}<p class="intro">{esc(p["excerpt"])}</p><div class="body">{esc(p["body"])}</div></article>'
   return self.send(200,layout(p['seo_title'] or (p['title']+' | MEGA Engineering'),body,p['seo_description'] or p['excerpt'],path if path.endswith('/') else path+'/'))
  if path in ('/admin','/admin/'):
   if not self.authorized():return self.login()
   with db() as c:rows=c.execute('SELECT * FROM posts ORDER BY updated DESC').fetchall()
   lines=''.join(f'<tr><td>{esc(p["title"])}</td><td>{esc(p["status"])}</td><td>{esc(p["category"])}</td><td><a href="/admin/edit/{p["id"]}">Edit</a></td></tr>' for p in rows)
   body=f'<h1>Manage Blogs</h1><p>Write and publish articles without editing website code.</p><a class="btn" href="/admin/new">+ Add New Blog</a><table><thead><tr><th>Title</th><th>Status</th><th>Category</th><th>Action</th></tr></thead><tbody>{lines}</tbody></table>'
   return self.send(200,layout('Manage Blogs | MEGA',body,admin=True))
  if path=='/admin/new' or re.fullmatch(r'/admin/edit/\d+',path):
   if not self.authorized():return self.redirect('/admin/')
   p=None
   if path!='/admin/new':
    with db() as c:p=c.execute('SELECT * FROM posts WHERE id=?',(int(path.rsplit('/',1)[1]),)).fetchone()
    if not p:return self.send(404,layout('Not found','<h1>Blog not found</h1>',admin=True))
   def val(n):return esc(p[n]) if p else ''
   options=''.join(f'<option value="{s}" '+('selected' if p and p['status']==s else '')+f'>{s.title()}</option>' for s in ['draft','published'])
   body=f'''<h1>{'Edit Blog' if p else 'Write a Blog'}</h1><form method="post" action="/admin/save"><input type="hidden" name="id" value="{p['id'] if p else ''}">
<label>Blog title *</label><input name="title" value="{val('title')}" maxlength="180" required>
<div class="grid2"><div><label>URL slug</label><input name="slug" value="{val('slug')}" placeholder="auto-generated-from-title" maxlength="100"></div><div><label>Category</label><input name="category" value="{val('category') or 'Insights'}" maxlength="80"></div></div>
<label>Short introduction / summary</label><textarea name="excerpt" maxlength="700">{val('excerpt')}</textarea>
<label>Article content *</label><textarea class="bodyinput" name="body" required placeholder="Write or paste your article here. Each paragraph will be preserved.">{val('body')}</textarea>
<label>Featured image URL (optional; HTTPS only)</label><input name="image_url" value="{val('image_url')}">
<div class="grid2"><div><label>SEO title</label><input name="seo_title" value="{val('seo_title')}" maxlength="170"></div><div><label>SEO description</label><textarea name="seo_description" maxlength="320">{val('seo_description')}</textarea></div></div>
<label>Publication status</label><select name="status">{options}</select><div class="controls"><button type="submit">Save Blog</button><a href="/admin/" class="btn secondary">Cancel</a></div></form>'''
   return self.send(200,layout('Edit Blog | MEGA',body,admin=True))
  if path=='/robots.txt':return self.send(200,f'User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: {DOMAIN}/sitemap.xml\n','text/plain; charset=utf-8')
  if path=='/sitemap.xml':
   with db() as c:posts=c.execute("SELECT slug FROM posts WHERE status='published'").fetchall()
   urls=['/','/blog/']+['/blog/'+p['slug']+'/' for p in posts]
   body='<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join(f'<url><loc>{esc(DOMAIN+p)}</loc></url>' for p in urls)+'</urlset>'
   return self.send(200,body,'application/xml; charset=utf-8')
  return self.send(404,layout('Not found','<h1>Page not found</h1><a href="/">Homepage</a>'))
 def login(self,error=''):
  message='<p class="error">Incorrect password or too many attempts. Please try again.</p>' if error else ''
  body=f'<div class="article"><h1>Blog Administrator</h1><p>Authorized staff can add, edit, save drafts and publish blogs here.</p>{message}<form method="post" action="/admin/login"><label>Administrator password</label><input type="password" name="password" required autocomplete="current-password"><div class="controls"><button>Sign in</button></div></form></div>'
  return self.send(200,layout('Blog Admin Sign in | MEGA',body))
 def do_POST(self):
  path=urllib.parse.urlsplit(self.path).path
  if not self.csrf():return self.send(403,'Forbidden','text/plain')
  try:f=self.form()
  except (UnicodeError,ValueError):return self.send(400,'Invalid request','text/plain')
  if path=='/admin/login':
   if hmac.compare_digest(f.get('password',''),PASSWORD):
    ts=str(int(datetime.datetime.now(datetime.timezone.utc).timestamp())+8*3600)
    cookie=f'mega_admin={ts}.{cookie_sig(ts)}; Path=/admin; HttpOnly; SameSite=Strict; Max-Age=28800'+('; Secure' if HTTPS else '')
    return self.redirect('/admin/',[('Set-Cookie',cookie)])
   return self.login('bad')
  if not self.authorized():return self.send(403,'Sign in required','text/plain')
  if path=='/admin/logout':return self.redirect('/admin/',[('Set-Cookie','mega_admin=; Path=/admin; Max-Age=0; HttpOnly; SameSite=Strict')])
  if path=='/admin/save':
   title=f.get('title','').strip()[:180];body=f.get('body','').strip();slug=slugify(f.get('slug','') or title)
   if not title or not body:return self.send(400,'Title and content required','text/plain')
   url=f.get('image_url','').strip()
   if url and not url.startswith('https://'):return self.send(400,'Image URL must use HTTPS','text/plain')
   vals=(title,slug,f.get('excerpt','')[:700],body[:200000],f.get('category','Insights')[:80],url[:1000],f.get('seo_title','')[:170],f.get('seo_description','')[:320],f.get('status','draft') if f.get('status') in ('draft','published') else 'draft',now())
   try:
    with db() as c:
     if f.get('id','').isdigit():
      c.execute('UPDATE posts SET title=?,slug=?,excerpt=?,body=?,category=?,image_url=?,seo_title=?,seo_description=?,status=?,updated=? WHERE id=?',vals+(int(f['id']),))
     else:c.execute('INSERT INTO posts (title,slug,excerpt,body,category,image_url,seo_title,seo_description,status,updated,created) VALUES (?,?,?,?,?,?,?,?,?,?,?)',vals+(now(),))
   except sqlite3.IntegrityError:return self.send(400,'This URL slug is already used. Choose another.','text/plain')
   return self.redirect('/admin/')
  return self.send(404,'Not found','text/plain')

if __name__=='__main__':
 if not PASSWORD or len(PASSWORD)<12 or len(SECRET)<32:
  sys.exit('Set MEGA_ADMIN_PASSWORD (12+ characters) and MEGA_SESSION_SECRET (32+ characters) environment variables before starting.')
 init();print('MEGA independent website at http://localhost:'+str(PORT),flush=True)
 ThreadingHTTPServer(('127.0.0.1' if os.getenv('BIND_LOCAL_ONLY','0')=='1' else '0.0.0.0',PORT),Handler).serve_forever()
