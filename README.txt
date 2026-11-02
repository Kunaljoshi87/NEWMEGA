MEGA - FIX INTERACTIVE HIGH-GRAVITY FERMENTATION ARTICLE

This is a targeted fix, not a full replacement of the website.
Preserves: article text, tables, accordion, live ethanol calculator, tabbed panels, charts, checklists, original source references.
The code uses trusted HTML ONLY for this reviewed article. Other CMS Markdown posts keep the normal renderer.

WINDOWS POWERSHELL:

1. Open PowerShell in C:\Users\Kunal Joshi\Desktop\New Website
2. Backup your current files and first pull the saved CMS post:
   git status
   git pull origin main
   git branch backup-before-hgf-fix
   Copy-Item '.\scripts\build_blog.py' '.\scripts\build_blog.before-hgf.py' -Force
   Copy-Item '.\content\posts\example-draft.md' '.\example-draft-backup.md' -Force

3. Extract this ZIP into the SAME New Website root. The zip contains scripts/ and content/ at root. Copy them there, NOT under another folder.

4. Disable the old published example-draft to prevent duplicate and broken content:
   (Get-Content '.\content\posts\example-draft.md' -Raw) -replace '(?m)^published:\s*true\s*$', 'published: false' | Set-Content '.\content\posts\example-draft.md' -Encoding utf8

5. Build:
   py scripts\build_blog.py
   Test-Path '.\high-gravity-fermentation\index.html'
   Select-String -Path '.\high-gravity-fermentation\index.html' -Pattern 'mh-calc', 'mh-sugar', '<style>'
   If Python dependencies missing: py -m pip install mistune PyYAML

6. Stage ONLY the relevant files; check git status, then commit and push:
   git add scripts/build_blog.py content/posts/high-gravity-fermentation.md content/posts/example-draft.md high-gravity-fermentation/index.html index.html our-blogs-2/index.html blog/index.html sitemap-preview.xml sitemap-production.xml
   git status
   git commit -m "Fix interactive high-gravity article display"
   git push origin main

7. Confirm GitHub Actions succeeds and open https://kunaljoshi87.github.io/NEWMEGA/high-gravity-fermentation/

NOTES:
- Images referenced inside article reuse an existing site logo. This fix does not include a relevant hero photograph; it intentionally leaves cover blank rather than displaying a broken image.
- If HTML code still appears on live site, inspect the GitHub Actions log. Ensure Pages Settings > Source is GitHub Actions.
- Only trusted site administrators should edit the reviewed custom HTML; arbitrary HTML/JS from untrusted authors can execute scripts on your website.
- Do not commit the local backup files. Prefer removing them later from the repository directory.
- The current production domain is not switched by this package. Keep production noindex migration safeguards until the final switch.
