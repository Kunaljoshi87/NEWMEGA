MEGA ENGINEERING - INDEPENDENT WEBSITE & BLOG CMS
=================================================
This package does NOT depend on WordPress. It includes:
  index.html     - existing Option B website design (Blog link updated)
  server.py      - independent blog publisher and public article pages
  legacy_post_manifest.json - old article titles, slugs and short excerpts for reference ONLY (not published)

START LOCALLY (Python 3.10+; no pip dependencies)
------------------------------------------------
1. Open a terminal in this folder.
2. Set your own STRONG credentials (don't use these example placeholders):
   Windows PowerShell:
      $env:MEGA_ADMIN_PASSWORD="YOUR-VERY-LONG-UNIQUE-PASSWORD"
      $env:MEGA_SESSION_SECRET="YOUR-OWN-RANDOM-STRING-AT-LEAST-32-CHARS-LONG"
      $env:MEGA_SITE_URL="http://localhost:8080"
      python server.py
   Linux/macOS:
      export MEGA_ADMIN_PASSWORD='YOUR-VERY-LONG-UNIQUE-PASSWORD'
      export MEGA_SESSION_SECRET='YOUR-OWN-RANDOM-STRING-AT-LEAST-32-CHARS-LONG'
      export MEGA_SITE_URL='http://localhost:8080'
      python3 server.py
3. Open http://localhost:8080 to see your website.
4. Open http://localhost:8080/admin/ to write/edit/publish posts.
5. Published posts appear at /blog/ and /blog/<slug>/ with SEO-friendly HTML.

DEPLOYMENT NOTES (read before production)
-----------------------------------------
- Use a managed host/VPS/Python app platform with persistent storage for data/blog.sqlite3.
- Set MEGA_SITE_URL=https://www.mega.tc and MEGA_HTTPS=1 in production.
- Put an HTTPS reverse proxy (Caddy/Nginx) in front, and configure service restart/backups.
- Don't expose admin without TLS. Use restrictive network access, MFA via an identity provider,
  login rate limiting, anti-CSRF tokens and a security review before public deployment.
- This is a lightweight working prototype, NOT hardened enterprise CMS. Its current single
  admin password + cookie and basic same-origin check are not production-grade controls.
- The old WordPress blog content is NOT automatically published. The manifest is a migration
  reference; copy approved complete articles into the new editor and preserve their old slugs.
- Original WordPress URLs must be explicitly mapped or redirected to retained articles.
- The original homepage still uses hash-based feature previews; the rest of the SEO migration
  (separate service pages and redirects) is NOT complete.
- Featured images currently use public HTTPS URLs; image upload is not implemented.
- No outbound enquiry form backend is included: the original site's form is a preview.
