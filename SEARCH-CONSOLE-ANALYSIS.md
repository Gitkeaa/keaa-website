# Search Console coverage: what the 928 reported pages actually mean

Written for the site owner. Section 5 of the SEO brief asks for every line of the coverage
report to be matched to a cause, a fix and a re-validation step. This is that.

Source: five coverage exports from the property, taken 19 September 2026, in `seo_reports/`.

---

## The single most important fact

**Google has not seen the fixed site yet.**

Every page in these five reports was last crawled between January 2021 and 15 September 2026.
Not one was crawled on or after 19 September, which is the day the canonical, rendering and
404 fixes went live. The reports describe the site as it was, not as it is.

That matters for how you read the rest of this. Roughly two thirds of the 928 entries are
symptoms of one problem that is already fixed and simply has not been re-crawled. The
remaining third are old addresses from the previous PHP site, which needed redirects, and now
have them.

---

## The five reports

| Report | Pages | Cause | Status |
| --- | --- | --- | --- |
| Alternative page with proper canonical tag | 314 | Every page served the homepage canonical | Fixed, awaiting re-crawl |
| Crawled, currently not indexed | 270 | Empty HTML and duplicate titles | Fixed, awaiting re-crawl |
| Not found (404) | 159 | Old PHP addresses with no redirect | Fixed now, redirects added |
| Duplicate without user-selected canonical | 120 | Old addresses plus the homepage canonical | Fixed, both causes |
| Soft 404 | 68 | Unknown addresses answered "200 OK" | Fixed, awaiting re-crawl |

---

## Report by report

### Alternative page with proper canonical tag, 314 pages

**What Google means.** It found these pages, read their canonical tag, and the tag pointed at
a different page. So it indexed that other page instead.

**The cause.** 268 of the 314 are product pages, mostly in the eleven non-English languages.
Until 19 September every page on the site served an identical canonical pointing at the
homepage, because the build step that writes per-page tags was being skipped. Google was
doing exactly what it was told: treating the entire catalogue as alternatives of the front
page.

**Fixed by** the prerendering work. Every page now serves its own canonical, and each
language version points at itself. Nothing further to do but wait for a re-crawl.

### Crawled, currently not indexed, 270 pages

**What Google means.** It fetched the page, decided it was not worth indexing, and moved on.

**The cause.** Two, both now gone. The delivered HTML was an empty 4.8 KB shell with no
content in it, and every page carried the same title and description. There was nothing to
distinguish one page from another.

**Fixed by** the same prerendering work, plus the unique titles. 117 of these are current
product addresses that should index normally once re-crawled. The other 153 are old PHP
addresses, which now redirect.

### Not found (404), 159 pages

**What Google means.** The address returned 404 and it was dropped from the index.

**The cause.** These are genuinely old addresses from the previous PHP site, in shapes like
`/product/<name>/detail.php` and `/enquiry/<name>/enquiry.php`. They were removed without
redirects, so whatever ranking they held was discarded.

**Fixed now.** 266 redirect rules were generated from these reports. Each old address now
makes one permanent hop to the page that replaced it.

### Duplicate without user-selected canonical, 120 pages

**What Google means.** It found several addresses with the same content and had to pick one
itself.

**The cause.** Two at once. The old site exposed the same product under several addresses at
the same time: with and without `www`, over both `http` and `https`, under `/product/` and
`/enquiry/`, and with and without a `/public/index.php` prefix. On top of that, every page was
claiming the homepage as its canonical.

**Fixed by** the redirects, which collapse every old shape onto one address, and by the
canonical fix.

### Soft 404, 68 pages

**What Google means.** The page said "200 OK" but looked empty, so Google treated it as
missing anyway. This wastes crawl budget and makes retired addresses look like real pages
with no content.

**The cause.** A catch-all rule sent every unknown address to the app shell with a 200
status.

**Fixed.** Unknown addresses now return a genuine 404, which I verified on the live site. The
old addresses in this list redirect instead.

---

## What was actually built from these reports

`scripts/gen-legacy-redirects.mjs` reads the exports and writes the redirect rules into
`vercel.json`. It is generated rather than hand-written because 883 distinct addresses is far
past the point where a typo becomes inevitable, and a typo here silently discards a page's
ranking.

**266 redirects, in two kinds.**

Four pattern rules cover 246 addresses, every old shape that carries the product id in the
path. The destination is derived from the match, so no list is needed.

215 explicit rules cover the addresses that carry only a name. A hosting config cannot look a
name up in the catalogue, so each one is resolved at build time and written out.

**Three rules about how destinations were chosen.** An address that named one item goes to
that product. An address that was a listing goes to the category or subcategory, even when a
single product shares the name, because sending a listing to one item throws away the rest of
the page. An address that matches nothing goes to the nearest relevant category, never to a
page that would itself 404. Every destination was verified against the catalogue.

Only addresses Google has actually reported are covered. A redirect for an address nobody
links to is dead weight in a file with a size limit.

---

## What you need to do

1. **Wait for a re-crawl.** Around two thirds of these entries resolve themselves once Google
   re-visits. Give it one to two weeks.

2. **Then request validation**, in this order, in Search Console under Indexing and then
   Pages. Click the issue, then Validate Fix:
   - Soft 404
   - Not found (404)
   - Duplicate without user-selected canonical
   - Alternative page with proper canonical tag
   - Crawled, currently not indexed

   Validation takes Google up to two weeks per issue and it re-crawls a sample. Starting
   before the re-crawl risks a failed validation, which imposes a cooling-off period.

3. **Submit the sitemap** if it is not already listed, as the full address
   `https://www.keaainternational.com/sitemap.xml`. The property showed two stale `http://www`
   sitemap entries from the previous developer that read "Couldn't fetch". Delete those.

4. **Re-export these reports in about three weeks.** If new old addresses appear, drop the
   exports into `seo_reports/` and re-run the generator. It is one command and it will not
   duplicate anything already covered.

---

## One thing to expect, so it does not alarm you

The number of indexed pages will probably **fall** before it rises.

That is the correct outcome. Hundreds of old PHP addresses are being deliberately collapsed
onto the pages that replaced them, so the count of distinct indexed addresses goes down while
the value consolidates onto fewer, better pages. What to watch instead is impressions and
clicks in the Performance report, and whether product and category pages start appearing for
their own names rather than the homepage appearing for everything.
