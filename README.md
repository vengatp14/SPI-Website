# SP International website – structure, SEO changes and deployment

## Site structure
| File | Purpose |
|---|---|
| `index.html` | Home (company, products, training, videos, contact form, branches) |
| `sewing-machines.html` | Post bed, flat bed, zig-zag and cylinder arm sewing machines |
| `special-sewing-machines.html` | Special, leather and upholstery sewing machines |
| `attachments-special-applications.html` | French folder, additional table, zig-zag T-stitching, knife sharpening |
| `welding-machines.html` | PFAFF 8303i hot-air taping machine |
| `laser-cutting.html` | Laser cutting machines (CH1812TT-AT-SCCD, CH1610T-P, CH1610T-AT, CH1610T) |
| `oscillating-knife-cutting.html` | KC-1625TT, KC-1625, KC-1612-P |
| `cookie-policy.html`, `404.html`, `403.html` | Support pages (`noindex`) |
| `assets/css/style.css`, `assets/js/main.js` | The only stylesheet and script (both local) |
| `assets/fonts/` | Self-hosted Manrope WOFF2 (replaces Google Fonts) |
| `robots.txt`, `sitemap.xml`, `sitemap-images.xml`, `.htaccess`, `site.webmanifest`, favicons | SEO / server support |
| `seo-keyword-map.md` | 700 keyword targets (100 per page). Developer document – not needed on the server |

## Before going live (required)
1. **Production domain.** It was not stated anywhere in the site. Every absolute URL uses the token `https://YOUR-PRODUCTION-DOMAIN` (canonical, Open Graph, Twitter, JSON-LD, `robots.txt`, both sitemaps). Replace it everywhere, e.g. `grep -rl YOUR-PRODUCTION-DOMAIN . | xargs sed -i 's#https://YOUR-PRODUCTION-DOMAIN#https://www.yourdomain.com#g'`. (`office@spi-machines.com` suggests `spi-machines.com`, but that is unconfirmed.)
2. **Contact form key.** `index.html` posts to Web3Forms with `access_key` = `YOUR_WEB3FORMS_ACCESS_KEY`. Insert the real key or the form will report failure.
3. **Canonical host redirect** in `.htaccess` is commented out; enable it once the domain is known.
4. Deploy in the web root (error pages and manifest use root-relative paths).
5. Submit both sitemaps in Google Search Console and Bing Webmaster Tools.
6. Remove `seo-keyword-map.md` and `README.md` from the server (`.htaccess` already denies `*.md`).

## SEO changes made
* Unique title, meta description, robots, canonical, Open Graph and Twitter tags on all 7 pages; JSON-LD (Organization/WebSite on Home using the real address, phone, email and hours; WebPage + BreadcrumbList on inner pages; Product for PFAFF 8303i without invented price/rating).
* One H1 per page (page banner heading; Home keeps the first hero headline, other hero slide titles became non-heading elements with the same styling).
* Fixed broken product links (`kc-*.html`, `ch*.html` did not exist) to anchors on the real pages; removed references to missing `lightbox-additions.*`, `okc-page-additions.*`, `product-detail-additions.css` (their rules already live in `style.css`/`main.js`).
* Alt text corrected where it did not match the image; repeated hero photos set to `alt=""`; `width`/`height` on every static image; lazy-loading below the fold; first content image eager with `fetchpriority="high"`.
* Two JPEGs over 250 KB recompressed (~255 KB saved); all other images were already small.
* Removed the inline `<script>` and inline style colour from the contact form handler; it now lives in `main.js` using CSS classes.
* Cookie consent: YouTube and Google Maps iframes load only after the visitor accepts (`data-consent-src`); banner built in `main.js`; footer "Cookie settings" reopens it; choice stored in `localStorage` key `spi_consent_v1`. YouTube now uses `youtube-nocookie.com`.
* Google Fonts removed in favour of self-hosted Manrope.

## Server configuration
`.htaccess` needs Apache 2.4 with `mod_rewrite`, `mod_headers`, `mod_expires`, `mod_deflate` and `AllowOverride` for FileInfo/Indexes/Options. The CSP is **Report-Only** until checked in a browser. On Nginx, IIS or static hosts, translate the redirects, headers and error pages.

## Known content issues for the site owner (not changed)
* Several slides/cards reuse a photo that does not match the product named in the heading (e.g. KC-1625TT and KC-1612-P hero slides show an 867 ECO sewing machine; "669-180010 eco" and "PFAFF 8303i" slides show an 888 CLASSIC). Replace with correct images.
* No contextual internal links between pages were added to body copy (it would change page content); consider links from Home product text and between related machines.
* Heading levels on card grids skip a level (H2 → H4) because JavaScript and CSS depend on those tags.
* A privacy policy for the contact-form data is recommended.
* `assets/downloads` PDFs have no metadata/titles reviewed.
