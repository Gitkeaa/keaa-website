# SEO programme: what was done, and what is left

Written for the site owner. Against the programme brief dated July 2026, which set a starting
score of 3 out of 10 and a target of 10.

Last updated 19 September 2026.

---

## The one thing that was actually wrong

Almost every finding in the brief traced back to a single cause, and it was not missing code.

The site already had a proper SEO layer. A hook set each page's own title, description,
canonical address, social sharing tags and structured data, and it worked correctly in a
browser. No search engine ever saw any of it.

The build step that writes those tags into the delivered HTML needs a copy of Chrome. The
build machine at the hosting provider has none, so that step was skipped silently on every
deploy for months. What shipped was one identical 4.8 KB file served for all 4,800 addresses,
each one telling Google "this page is a copy of the homepage" and carrying the homepage
title.

Google was being told the entire catalogue was duplicate content. That single fact explains
the canonical problem (P1), the empty HTML problem (P2), the duplicate titles (P3), the
missing social previews (P8) and the missing structured data (P10) all at once.

It is fixed. Every address now serves its own fully rendered page. A build gate was added
that reports loudly if it ever silently stops again.

---

## Scoring

| Area | Weight | Was | Now | Evidence |
| --- | --- | --- | --- | --- |
| Indexability: canonicals, status codes, redirects | 25% | 2 | 9 | Every page carries its own canonical. 52 legacy redirects, all single hop. Unknown addresses return a real 404. Product URLs still carry numeric ids, see below |
| Server rendered content | 20% | 1 | 10 | All 4,800 addresses deliver full HTML, product pages included |
| Titles, meta, headings | 15% | 3 | 10 | No two pages share a title. Exactly one h1 on all 440 English pages |
| URLs and sitemap | 10% | 3 | 8 | Sitemap and delivered pages agree exactly. Product URLs keep numeric ids |
| HTTPS and domain | 10% | 9 | 10 | HSTS served |
| Structured data and social | 10% | 2 | 10 | Organization, WebSite, Breadcrumb, CollectionPage, Product, FAQPage, JobPosting, Article and Service markup, per page type |
| Speed and images | 10% | unknown | 7 | Alt text on all 6,540 images, lazy loading, long cache headers. Not yet measured against the 90+ mobile target |

Weighted: **9.0 out of 10**, from 3.

The two points that are missing are speed, which has not been measured since the changes, and
product URL shape, which is explained below.

---

## Done and live

**Indexing and crawling**
- Every address serves its own canonical, title, description, social tags and structured data.
- 52 permanent redirects covering the old PHP site: company pages, the root level category and
  subcategory addresses, the numbered category addresses, the old product address shape, and
  the retired coming-soon page. Each is a single hop.
- Unknown addresses return a genuine 404 with a page that lists the product categories, rather
  than the old behaviour of answering "200 OK" with the homepage.
- The staff console is excluded from search.
- Sitemap and delivered pages agree exactly: 4,872 addresses, every one a real page.

**Content**
- Each of the three category pages gained a long-form section covering what the system is,
  its components, the standards it is built to, where it is used and why to buy from the
  manufacturer, with the questions buyers ask. The scaffolding page went from a few hundred
  words to over 1,400.
- Five guides published at /blog, each over a thousand words: choosing between ringlock,
  cuplock and frame scaffolds; selecting adjustable props with EN 1065 explained; British
  against European couplers; cattle headlocks and cubicles; and post supports and ground
  anchors. Each links into the catalogue.
- A new /export page for overseas buyers.
- A new /request-a-quote page explaining what to send and what happens next.

**Turning visits into enquiries**
- A Request a Quote button now sits in the header on every page, in all twelve languages.
- Each completed form now lands on its own address, so enquiries can be counted at all.
- Google Analytics is installed and gated behind consent, with events for quote requests,
  export enquiries, catalogue downloads, job applications, phone taps and WhatsApp taps.
- Job openings carry the markup that lets them appear in Google for Jobs.
- The footer states the ISO 9001:2015 certification, and category pages show the number of
  countries served.

---

## Not done, and why

**Product addresses still carry numbers.** They look like /product/281 rather than
/product/ringlock-tower. The brief asks for names. This was investigated and deliberately not
changed, for two reasons. Twenty-nine products share a name, so names alone do not identify a
page uniquely. More importantly, the hosting configuration would need a redirect for every old
address, and with 355 products across twelve languages that is 4,260 redirect rules in a file
that is not built for that many. Doing it properly needs either unique names assigned to the
twenty-nine duplicates, or the redirects handled somewhere other than the hosting config. It
is worth doing, it is not worth doing badly, and the gain over the work already delivered is
small.

**Page speed has not been measured** since these changes. Pages now deliver real HTML
instead of a shell, which usually helps, but that is a guess until it is measured. Run
PageSpeed Insights on the homepage, a category page and a product page, and treat any result
below 90 on mobile as the next piece of work.

**The Search Console report has not been mapped.** Section 5 of the brief asks for every line
of your Search Console Pages report to be matched to a fix and re-validation requested. That
needs the report exported from your account. Once the changes above have been crawled, most
of those lines should resolve on their own, so it is worth waiting a week or two before
exporting it.

---

## What you need to do

1. **Submit the sitemap** in Search Console, as the full address
   https://www.keaainternational.com/sitemap.xml
2. **Request re-validation** for the duplicate-canonical and soft-404 issues, once Google has
   re-crawled. Give it a week or two.
3. **Export the Pages report** from Search Console after that, so the remaining lines can be
   mapped one by one.
4. **Run PageSpeed Insights** on three page types and share the mobile scores.
5. **Confirm the export terms** if you want them published: Incoterms offered, typical lead
   time, port of loading and export packing. The export page has a section ready for them and
   will show it as soon as they exist. They were deliberately not invented.
6. **Add a posting date to each job opening** if you want them fully eligible for Google for
   Jobs. Google asks for one and the current data has none, so it was left out rather than
   guessed.

---

## Ground rules that were applied throughout

Nothing about the company was stated that was not already published on the site or held in
its own data files. No certifications, capacities, load figures, lead times or commercial
terms were invented.

European standards are described by what they govern, never by quoting load values. A safe
working load depends on the size, class and extension of a specific item, so a single
published number would be wrong for most of a range. Where a class is named, it is one the
company's own certification record already carries.
