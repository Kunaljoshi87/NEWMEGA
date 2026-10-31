MEGA ENGINEERING - NEW WEBSITE & SEO MIGRATION

Preview base: https://kunaljoshi87.github.io/NEWMEGA/

ALL 22 published WordPress pages and 8 published blogs are recreated at matching URL paths.
The homepage retains the existing Option B layout. Remaining pages share a new blue/green layout.
Available text was extracted from WordPress XML, removing old page-builder shortcodes. Verify every page against the live site before publishing as production.
IMPORTANT: WordPress export does NOT include rendered pages, many plugin-generated components, or actual image files. Some pages with empty WordPress content have minimal explanatory text and require manual content entry.
SEO: Yoast metadata values were preserved when usable; if titles used Yoast %% variables, a plain title fallback was used. Production canonical URLs refer to https://www.mega.tc/ matching original WordPress paths.
For hosting on GitHub Pages (repository NEWMEGA), copy the CONTENTS of this ZIP to repository ROOT, not into a subfolder, commit, and push. GitHub Pages: branch main, folder / (root).
Don't switch the primary production domain until all website functionality, forms, old content, visual media, metadata, canonical links, robots, structured data, redirects and GSC checks have been reviewed.
SITE LIMITATIONS: GitHub Pages cannot run a Python blog CMS or admin login or accept contact form submissions by itself. /admin/ is an explicit information page only.
URLS: page links are /NEWMEGA/<original-slug>/ for GitHub preview, which MUST be converted to /<original-slug>/ on the future mega.tc site. Use an automated build replacement, e.g. replace every /NEWMEGA/ occurrence with / before deploying production.
Images: WordPress XML references old media but does not contain media binaries; obtain /wp-content/uploads/ backups and optimize images.
Google rankings cannot be guaranteed from site files. Preserve content and same-domain URLs, compare GSC data before/after, confirm Google indexation.
Temporary migration files, XML and spreadsheet are not included in public site package.
