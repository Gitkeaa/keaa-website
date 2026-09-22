# Status check, 21 September 2026

A full audit of everything discussed. Nothing was changed, committed, pushed or deployed to
produce this file.

**Live right now:** commit `1afd2be`, deployment `6565856849`, succeeded 09:54 UTC today.
**Local repository:** identical to the remote, plus six uncommitted files (see item 13).

Status labels used below:

| Label | Meaning |
|---|---|
| DONE / LIVE | Finished, deployed, and verified against the live site |
| DONE, NOT DEPLOYED | Finished in the code but sitting uncommitted, so no visitor sees it |
| PENDING | Not done, and I can do it without you |
| NEEDS YOUR INPUT | Blocked on a decision, a file, or an account only you control |
| NOT REQUIRED | Deliberately not doing it, with the reason given |

---

## 1. The auth / prerender bug

**What it is for:** stops every page shipping a signed-in account control to visitors who are
not signed in.

**Status: DONE / LIVE, verified.**

Every prerendered page except the home page was serving static HTML containing the signed-in
header: a blank account button whose accessible name was literally `undefined, Account menu`.
It appeared until JavaScript replaced it with the Sign in link. The cause was the session check
running during the build, where there is no API to answer it, so a truthy empty object came back
and the code believed someone was signed in.

No name, email or avatar was ever exposed. The object had no fields, which is why the label read
`undefined`.

Verified on the live site after deployment across `/`, `/contact`, `/about`, `/products`,
`/careers`, `/export`, `/nl/contact` and `/de/about`: all eight now serve the correct signed-out
markup, and none contains the signed-in marker.

---

## 2. The three approved fixes

| Fix | What it is for | Status |
|---|---|---|
| Hero responsive images | Stops phones downloading a desktop-sized hero photograph | **DONE / LIVE** |
| Product main image priority | The photo the product page's speed score is measured on is no longer lazy-loaded | **DONE / LIVE** |
| Projects rail label | Screen readers announced "Featured projects" for what are now application areas | **DONE / LIVE** |

All three verified on the live site:

- Hero carries a 640w to 1920w srcset on both `/contact` and `/about`
- Product main image is `loading="eager"`, `fetchpriority="high"`, `decoding="sync"`
- Rail announces "Application areas"; German and Dutch translated, the other nine locales fall
  back to English so the wrong wording is not left standing in any language

---

## 3. Layout shift (CLS)

**What it is for:** stops the page jumping while it loads, which Google counts as a ranking
signal.

**Status: NEEDS YOUR INPUT.**

### Does it actually need fixing?

Current measurements:

| Page | Mobile | Desktop |
|---|---|---|
| Home | 0.000 | 0.311 |
| Contact | 0.000 | 0.310 |
| Product | 0.000 | 0.245 |

Google wants under 0.1, so desktop fails and mobile passes cleanly.

**My honest read: it can safely remain as-is for now.** Nothing is broken, no content is lost,
and nobody is blocked from buying or enquiring. Google weights mobile more heavily than desktop
for ranking, and mobile is already perfect at zero. This is a polish item, not a defect.

### Why it is not already fixed

The cause is precise: pages are prerendered to real HTML, the browser paints them, and then
React throws that HTML away and rebuilds it, so the page briefly collapses and everything below
snaps back. The standard fix is to hydrate the existing HTML instead of rebuilding it. I wrote
that fix, tested it, and **it does not work here**, so I reverted it.

It fails because the prerenderer photographs each page *after* its animations have finished,
while hydration compares against React's *first* render. Seventeen elements per page have
animation state baked into the HTML that the first render does not reproduce. Making those agree
means changing how the whole site animates on first load, which is a visible behaviour change.

**The decision I need from you:** whether to spend a separate piece of work on changing the
animation behaviour to recover roughly 0.3 of desktop CLS. I would not prioritise it above
content and indexing work.

---

## 4. Batches 1 to 6

A caveat worth stating plainly: Batch 1 and Batch 2 are recorded precisely. Batches 3 to 6 come
from your own planning message and my record of them is a one-line summary each, so please
correct any that I have mis-stated rather than assuming my wording is the agreed scope.

| Batch | What it is for | Status |
|---|---|---|
| 1. Full translation, 11 languages | Foreign-language pages that actually read as that language | **PARTIAL** |
| 2. Prerender on deploy | Every URL serves its own real HTML, title and canonical | **DONE / LIVE** |
| 3. Titles and meta descriptions | Unique, written search snippets per page | **NEEDS YOUR INPUT** |
| 4. Schema and image polish | Structured data and image delivery refinements | **MOSTLY DONE / LIVE** |
| 5. HTML cleanup | Typos and stray links in the live copy | **PENDING** |
| 6. Subcategory and product content | Real words on thin category and product pages | **NEEDS YOUR INPUT** |

**Batch 1 detail.** German and Dutch are complete at 1,128 keys each and are live. The other
nine languages sit at 1,012 to 1,013 keys, roughly 90 per cent, and their product data is still
English. Sub-batches 1b (fr, es, it, pt), 1c (pl, ru, tr) and 1d (ar, hi) were never run.

**Batch 4 detail.** Organization, WebSite, Product, BreadcrumbList, CollectionPage, FAQPage,
JobPosting, Article and Service schema are all live. Image work is live as of today. What
remains inside this batch is small.

**Batch 5 detail.** The two homepage typos, "Glavanizing" and "Aoutomatic", are still live. See
item 13, because they sit in a file you are editing. The bare `/portal` link concern turned out
to be unfounded: the footer link correctly points at `/portal/login`, and `robots.txt` already
disallows `/portal`.

---

## 5. Product numeric URLs and the slug migration

**What it is for:** readable addresses like `/product/push-pull-props` instead of
`/product/136`, which read better in search results.

**Status: NEEDS YOUR INPUT. My recommendation is to leave it.**

Two hard obstacles, neither of which is about effort:

1. **29 of the 355 products share a name with another product.** Slugs must be unique, so those
   29 need distinct names decided by someone who knows the products. That is your call, not mine.
2. **A clean migration needs one redirect per old address**, which is 355 products across 12
   locales, roughly 4,260 rules added to the hosting configuration. That file already holds 266
   redirects and is the single point of failure for the whole site's routing.

The SEO gain from slugs is real but modest, and the numeric URLs are not being penalised. I would
put Batch 6 content ahead of this.

---

## 6. PageSpeed, before and after today's fixes

**What it is for:** the loading speed scores Google publishes and partly ranks on.

**Status: DONE, measured. No deployment was made to test.**

Measured against the live site after today's deployment, with the earlier run as the baseline:

| Page | Score | Largest Contentful Paint | Layout shift |
|---|---|---|---|
| Contact mobile | 72 to **74** | 8.7s to **5.8s** | 0 |
| Contact desktop | 78 to **82** | 1.6s to **1.2s** | 0.310, unchanged |
| Product mobile | 72 to **80** | 3.9s to 4.4s | 0.296 to **0.000** |
| Product desktop | 87 to 87 | 0.9s to 1.0s | 0.245, unchanged |
| Home mobile | 72 to 71 | 5.3s to 5.5s | 0 |
| Home desktop | 83 to 83 | 0.8s to 0.8s | 0.311, unchanged |

**What genuinely improved:** the contact page, which was the worst of the three, lost nearly
three seconds of load time on mobile. The product page gained eight points and its layout shift
went to zero.

**What did not:** the home page is flat. Its hero is a video poster frame that already had
responsive images, so today's fix had nothing to do there. Product mobile shows a slightly worse
load time while its score rose eight points; a single measurement run varies by a few points
either way, so I would not read either of those two numbers as precise.

Desktop layout shift is unchanged exactly as expected, because that fix was not shipped. See
item 3.

---

## 7. Search Console indexing

**What it is for:** getting the right pages into Google and the dead ones out.

**Status: NEEDS YOUR INPUT. This one genuinely cannot proceed without you.**

I checked the connected Google account today. It can see **only `gezuimpex.com`**. It has no
access to `keaainternational.com`, so I cannot read the indexing reports, request validation, or
confirm anything about the property myself.

The five coverage issues from your export, and what was built for each, are written up in
`SEARCH-CONSOLE-ANALYSIS.md` in this repository: 314 alternative-page-with-canonical, 270
crawled-not-indexed, 159 not-found, 120 duplicate-without-canonical, 68 soft-404.

**What is still required from you, in order:**

1. **Wait for a re-crawl.** Roughly two thirds of those entries resolve on their own once Google
   revisits. One to two weeks.
2. **Then request validation** in Search Console under Indexing, then Pages, in this order: Soft
   404, Not found, Duplicate without canonical, Alternative page with canonical, Crawled not
   indexed. Starting before the re-crawl risks a failed validation and a cooling-off period.
3. **Optionally, add the connected account to the property**, which would let me read the
   reports and check progress directly instead of asking you to export them.
4. **Re-export the reports in about three weeks** into `seo_reports/` if new old addresses appear.

**Expect the indexed page count to fall before it rises.** That is the correct outcome: hundreds
of old PHP addresses are being deliberately collapsed onto the pages that replaced them.

---

## 8. Sitemap submission and re-validation

**What it is for:** telling Google the full list of addresses worth crawling.

**Status: NEEDS YOUR INPUT.**

What I verified today:

- The live sitemap returns HTTP 200 as `application/xml`, 487 KB, listing **4,884 URLs**
- `robots.txt` correctly points at `https://www.keaainternational.com/sitemap.xml`
- The file regenerates itself on every deployment, so it cannot go stale

What I cannot check, because of the account access in item 7: whether it has been submitted, and
whether the two stale `http://www` sitemap entries left by the previous developer, which read
"Couldn't fetch", have been deleted.

**What is required from you:** in Search Console, submit the full address
`https://www.keaainternational.com/sitemap.xml`, and delete the two old `http://www` entries if
they are still listed. For a Domain property it must be the complete address, not a path.

---

## 9. Job posting dates

**What it is for:** Google's job listings need a posting date, and inventing one would be a false
claim.

**Status: DONE / LIVE. Nothing further needed until you reopen a role.**

Exactly what you asked for is already in place:

- All four roles carry `status: 'closed'` and none was deleted
- All four carry a `postedDate: ''` field, empty and waiting
- The job listing structured data includes `datePosted` **only** when a role actually has one,
  so no date is invented anywhere

**When you reopen a role:** change its `status` to `'open'` and set `postedDate` to the real date
as `YYYY-MM-DD`. Those two edits are all that is required. The instructions are written into
`src/data/content.js` directly above the roles.

---

## 10. Featured Projects

**What it is for:** showing buyers the kind of work the equipment is built for.

**Status: NOT REQUIRED now. Marked as a future content update.**

One correction worth making, because it changes what the future work is. **The fake projects are
already gone.** They were removed and deployed earlier: eight entries with invented names,
cities and clients such as "Riverside Residences, Ludhiana" and "Export Distribution Hub,
Eindhoven".

What is on the site today is eight **application areas**, with no client, no city and no project
name anywhere:

High-Rise Buildings, Commercial Construction, Industrial Facilities, Infrastructure Projects,
Large-Scale Construction, Livestock Housing, Timber Structures, Export and Distribution.

Every one is a true statement about what the products are for. Nothing there needs correcting or
removing, and I have left it untouched as you asked.

**The future content update**, when you want it: replace these generic areas with real project
records once you have ones you are willing to publish. The data shape is deliberately unchanged,
so adding a `location` back to an entry makes the card show it again. The section headings then
change back from "Applications" to "Featured Projects" in two files. The instructions are written
into `src/data/content.js` above the list.

---

## 11. Export Terms PDF

**What it is for:** letting a buyer download your export terms from the Export page.

**Status: DONE / LIVE in code. NEEDS YOUR INPUT for the Cloudinary ID.**

This is already built exactly the way you describe, and it is already deployed. Nothing needs
writing.

- A single constant, `EXPORT_TERMS_PDF`, in `src/data/exportTerms.js`
- It accepts **either** a full Cloudinary URL **or** a bare public ID, so you can paste whichever
  Cloudinary gives you
- While it is empty the download button does not render at all, deliberately: a button leading to
  a missing file reads as a broken site to a buyer deciding whether to trust one
- The browser saves it as `keaa-international-export-terms.pdf`, not a Cloudinary ID

**What is required from you:** upload the PDF and send me the ID. That is a one-line change and
one deployment.

**One caution about the contents.** The Export page deliberately publishes no Incoterms, lead
times or port of loading, because none of those are published anywhere and inventing a commercial
term is a commitment the company never made. If the PDF carries such terms, they should be added
to the page as well so the two cannot contradict each other. A PDF promising terms the page does
not is the same problem in a harder place to correct.

---

## 12. The old failed deployments in Vercel history

**What it is for:** knowing whether any past failure still affects what visitors see.

**Status: NOT REQUIRED. All of them can be ignored. Production is unaffected.**

The full history, read from the deployment records today:

| Commit | When | State | Meaning |
|---|---|---|---|
| `1afd2be` | 21 Sep 09:54 | **success** | Live now |
| `c5dbf28` | 19 Sep 11:55 | **success** | Fixed the failures below |
| `4a64a67` | 19 Sep 10:27 | failure | Superseded |
| `156b096` | 19 Sep 09:42 | failure | Superseded |
| `626ddf5` | 19 Sep 08:56 | failure | Superseded |
| `9ff6144` | 19 Sep 08:10 | failure | Superseded |
| `18a42d4` | 19 Sep 07:25 | failure | **The original cause** |
| `b618c67` | 19 Sep 06:39 | success | Live at the time |
| 5 older entries | 19 Sep 06:39 and 06:00 | inactive | Not failures, see below |

**What happened.** `18a42d4` raised how many pages the build renders at once from four to eight.
That change broke the build. The four commits after it inherited the same broken setting, so they
failed too. `c5dbf28` put it back to four, and because Vercel builds the newest commit rather
than replaying each one, that single successful build carried all four failed commits' content
onto the site. Everything they contained is live and was verified.

**The five "inactive" entries are not failures.** Vercel marks a deployment inactive when a newer
commit supersedes it before it finishes. I previously described these as failures, which was
wrong.

**Nothing to do.** No failed deployment left any trace in production. The only lasting effect was
a two-day delay.

---

## 13. Your manual changes, reviewed

I read every uncommitted file in the repository today. Six files differ from what is deployed.

### 13a. Leader photographs, `src/data/company.js`

**Status: DONE, NOT DEPLOYED.** You have filled in **7 of the 12** Cloudinary slots. I tested
every one of them against Cloudinary today and **all 7 return a valid image**:

`ChatGPT_Image_19_Sept_2026_16_18_05_t7pgv4`, `Jaskamal_Keaa_nr05tj`, `Vikram_keaa_kjc9cj`,
`Ajay_RAna_Keaa_tn10ww`, `sumit_Dogra_keaa_enpham`, `ChatGPT_Image_19_Sept_2026_16_13_24_r2nb0b`,
`Amarjot_keaa_m3uucm`

Five slots remain empty, and those people correctly keep their existing local photographs.

**Important:** none of this is visible to visitors yet. The seven photographs, and the code that
makes the Cloudinary slots work at all, are sitting uncommitted. They need one commit and one
deployment before anyone sees them. Say the word and I will do it.

Two of the seven IDs begin `ChatGPT_Image_`, which suggests generated rather than photographed
portraits. That is entirely your call and I have not touched them. I mention it only because a
buyer checking a supplier sometimes reverse-searches a team photograph.

### 13b. The company description, `src/components/home/CoreSolutions.jsx`

**Status: NEEDS YOUR INPUT. There is a real problem here.**

You rewrote the English paragraph on the home page to cover the full range: scaffolding and
formwork, livestock housing, DIY and hardware, and custom-engineered components. The new wording
is accurate and an improvement on the old scaffolding-only text.

**The problem:** that paragraph is translated in all 11 other languages, and every one of them
still carries the **old** narrower text. A German or Dutch visitor currently reads "specialising
in high-performance scaffolding, formwork and industrial solutions" while an English visitor
reads the broader description. The two disagree about what the company makes.

Three ways forward, your choice:

1. I translate the new paragraph properly into German and Dutch, the two complete languages, and
   remove the key from the other nine so they fall back to your new English. This is what was
   done for the other headings and it is my recommendation.
2. I remove it from all 11 so every language shows your new English wording.
3. Leave it, and the eleven translations keep describing a narrower company.

### 13c. The two homepage typos

**Status: NEEDS YOUR INPUT, deliberately left alone.**

"Glavanizing" and "Aoutomatic" are still live on the home page. Both sit in `src/data/company.js`,
which is the file you are editing, so I have not touched it as instructed. They are a one-character
and a two-character fix whenever you want them done.

### 13d. Things that are fine, for completeness

- **`src/components/ui/Photo.jsx`, `src/pages/About.jsx`, `src/pages/Contact.jsx`:** the plumbing
  that makes the Cloudinary leader slots work. Mine, uncommitted, needed for 13a to appear.
- **`public/sitemap.xml`:** a build artifact from running the build locally. It regenerates on
  every deployment and the live copy is already current at 4,884 URLs. No action needed, and it
  does not need committing.
- **The broken `emaiil` import** previously at the top of `company.js` is **gone**. Resolved.

---

## What I would do next, if you want a shortlist

1. Commit and deploy the seven leader photographs, so the work you have already done becomes
   visible. Small, self-contained, low risk.
2. Decide on the company description in 13b, because eleven languages currently contradict the
   English.
3. Submit the sitemap and run the Search Console validations in item 7. Nothing I do can replace
   this and it gates the indexing recovery.
4. Send the Export Terms PDF ID when you have it.
5. Leave the desktop layout shift, the product slugs and the Featured Projects alone for now.

---

# Future task: fix the layout shift (CLS 0.31)

Written 22 September 2026, after two failed attempts and one diagnostic build. **No code has been
written for this.** The diagnostic branch `fix/cls-hydration` holds the experiment and is
deliberately unmerged.

## What is actually wrong

Every page is prerendered to real HTML and the browser paints it immediately. `createRoot` in
`src/main.jsx` then throws that markup away and rebuilds the tree. The document collapses for a
frame and everything below snaps back: **CLS 0.310 on home and category, 0.267 on landing pages,
0.251 on product pages**, against Google's 0.1 threshold.

The obvious fix, `hydrateRoot`, adopts the existing markup instead. It was tried twice and
failed both times, leaving CLS unchanged at 0.310 and adding four console errors per page. It
fails because **React's first render does not match the prerendered HTML**, and React rejects
the entire tree on any single mismatch, so partial fixes achieve nothing at all.

## The rule the fix has to satisfy

**The first client render must be deterministic from the URL alone.** Anything read from the
browser (stored preferences, navigator languages, image load state, timers) or anything set by
an effect produces a different first render than the build produced, and hydration fails.

## The three pieces of work

### (a) Language resolution must use only the URL prefix on first render

`resolveInitialLanguage()` in `src/i18n/LocaleContext.jsx` runs inside a lazy `useState`
initialiser and reads `localStorage` and `navigator.languages`. Prerendering always resolves
`en`; a visitor's browser can resolve any of the twelve.

Proved with a controlled experiment: same URL, same build, only the browser language changed,
and `<html lang>` came back `en` for an English browser and `de` for a German one.

The fix: first render takes the language from the URL prefix and nothing else. Detection moves
into an effect that **suggests** a switch rather than changing the tree underneath React. That
is a visible product decision, not only a technical one: today a German browser lands on the
English URL and silently gets German, and afterwards it would get English with an offer to
switch.

### (b) The prerenderer must inline the dictionaries

`LocaleProvider` starts `content` as `null` on any locale URL and **holds its children back**
until the dictionary loads, while the prerendered HTML already contains the fully translated
page. That is a guaranteed mismatch on all eleven locale prefixes.

The comment above it explains why it exists: rendering early would let a page fire the
prerender-ready event before its translations arrived, baking English into German HTML. So this
is a deliberate design decision protecting translation correctness, and it cannot simply be
deleted.

The fix: the prerenderer writes the locale dictionary and the product dictionary into the HTML
as a JSON script tag, and `LocaleProvider` reads it synchronously on first render. Children are
never held back, because the translations are already there. Cost: a larger HTML payload per
locale page, which needs measuring against the shift it removes.

### (c) Bisect for the third mismatch

A third mismatch survives on an English page in an English browser, where neither (a) nor (b)
applies. React 18.3 reports only "the server HTML was replaced with client content in `<div>`"
and will not name the element, so this needs bisection: stub one suspect provider or component
at a time and rebuild until the error count drops from four.

Known-settled suspects already ruled out by inspection, so do not start with these: the route
announcer, the cookie banner, the feedback widget, the header account control and the header
search history all begin from a state that matches the prerendered markup.

## Build estimate

| Step | Builds | Why |
|---|---|---|
| (a) language from URL | 1 | One change, one verification |
| (b) inline dictionaries | 2 | One to get the script tag emitted and read, one to verify a locale page hydrates |
| (c) bisection | 4 to 8 | One per suspect eliminated; unknown until (a) and (b) narrow it |
| Final verification | 1 | CLS across all page types, hydration console clean |

**Eight to twelve builds.** At roughly 90 seconds each for the no-products path and six minutes
for a full one, most of it can run on the fast path, with two or three full builds at the end.

## Worth deciding before starting

CLS is currently 0.310 on desktop and **0.000 on mobile**, and Google weights mobile more
heavily for ranking. This is a real Core Web Vitals failure but it is not a functional defect:
nothing is broken, no content is lost, and nobody is blocked from enquiring. Item (a) also
changes how language detection behaves for real visitors. Both are reasons to schedule this
deliberately rather than fold it into another batch.
