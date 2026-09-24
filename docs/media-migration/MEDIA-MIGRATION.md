# Media migration to Cloudflare R2

Status: **manifest built and approved layout applied. Nothing uploaded.**
Generated 2026-09-24 from a read-only listing of the Cloudinary account `keaa-assets`.

## Destination

Bucket `keaa-media`, location WEUR, served at `https://media.keaainternational.com`
(SSL active, minimum TLS 1.2, the `r2.dev` address deliberately disabled).

## The object key rule

One definition, two copies that are tested against each other:

- Frontend: `src/data/mediaKey.js` (this repo)
- Backend: `src/main/java/com/keaa/adminapi/media/MediaKey.java` (keaa-admin-api, branch `infra/media-r2`)

Do not write a third. `ProductController.slugify` in the backend is NOT the same function: it
names a single Cloudinary asset, `MediaKey` names an R2 object.

Given a Cloudinary public ID and a file extension, in order:

1. NFKD-normalise and strip combining marks, so `Böhler` becomes `bohler`, not `b-hler`.
2. Lowercase.
3. Replace spaces and every character outside `[a-z0-9/._-]` with a hyphen.
4. Collapse runs of hyphens into one.
5. Trim leading and trailing hyphens per path segment, then re-collapse.
6. Append the extension, lowercased.

Signed-off example:

```
"1.Keaa Assets/Keaa products/Ringlock Tower 281-1" + jpg
  ->  1.keaa-assets/keaa-products/ringlock-tower-281-1.jpg
```

Step 5 is applied per path segment, not only to the whole key, because a trailing hyphen can hide
immediately before a slash where a whole-string trim would miss it. A segment that trims away to
nothing becomes `x` rather than emitting an empty path segment.

### Extension-less uploads

`extensionFromMagicBytes()` in both copies reads a file's first bytes and returns the real
extension. Use it whenever an upload arrives with no extension, and log every case: a
browser-supplied filename or Content-Type is attacker controlled on a public form such as the job
application form, and the bytes are the only honest evidence. 17 signatures are covered (pdf, jpg,
png, gif, webp, webm, bmp, tiff, doc, docx, xlsx, pptx, zip, mp4, mov, avif, heic, svg); anything
unrecognised returns null and must be decided by a human, never guessed.

### Collision guard

When a computed key is already taken, the loser gets the last 6 characters of the SHA-1 of its
original public ID inserted before the extension, and both sides are written to the collision log
below. Verified identical in Node `crypto`, browser `crypto.subtle` and Java `MessageDigest`:
`sha1("a b")` ends `b41929` in all three.

### Parity

Java and JS were run over all 592 real public IDs plus 10 deliberately awkward synthetic ones
(accents, trailing spaces, punctuation, `---/---`, Turkish dotted capital I, an empty extension):
**602 of 602 identical**. The magic-byte detector was run over 22 vectors covering every supported
signature plus an unrecognised one: **22 of 22 identical**. Re-run both after any edit to either file.

## Layout

Owner's decision, 2026-09-24: everything lives under `1.keaa-assets/`.

| Destination prefix | Count | Status | Source |
|---|---|---|---|
| `1.keaa-assets/keaa-products` | 502 | approved | all of `keaa-products/` |
| `1.keaa-assets/keaa-gallery` | 36 | proposed | loose root photos used by `data/gallery.js` and `data/heroSlides.js` |
| `1.keaa-assets/keaa-certificates` | 4 | approved | the loose root certificate PDFs |
| `1.keaa-assets/keaa-certificates` | 10 | proposed | certification badges used by `data/certificationLogos.js` |
| `1.keaa-assets/1.keaa-hero-page-videos` | 7 | approved | all loose root videos |
| `1.keaa-assets/keaa-team` | 7 | proposed | leadership portraits used by `data/company.js` |
| `1.keaa-assets/keaa-manufacturing` | 6 | proposed | plant photos used by `Manufacturing.jsx` and `ManufacturingBand.jsx` |
| `1.keaa-assets/keaa-brand` | 4 | proposed | the KEAA logos |
| `1.keaa-assets/keaa-site` | 2 | proposed | general site imagery |
| `1.keaa-assets/keaa-resumes` | 1 | approved | the one job application PDF |

## Manifest files

| File | Contents |
|---|---|
| `manifest.csv` | 514 rows, the approved layout, ready to upload on the owner's word |
| `manifest-loose-root.csv` | 68 rows, the loose root images: 65 with a proposed key, 3 needing a decision |
| `manifest-excluded.csv` | 51 rows, everything deliberately not migrating, with a reason each |
| `manifest-all.json` | all of the above plus the collision log and the magic-byte log |
| `cloudinary-inventory.json` | the raw Cloudinary listing everything was derived from |
| `inventory.mjs`, `manifest2.mjs` | the scripts that produce them, so this is reproducible |

## Totals

| | count |
|---|---|
| Cloudinary assets in the account | 633 |
| Excluded | 51 |
| **KEAA assets accounted for** | **582** |
| Approved layout, key assigned | 514 |
| Proposed layout, key assigned | 65 |
| Awaiting a decision, no key yet | 3 |
| Distinct keys | 579 of 579 |
| **Collisions** | **0** |
| **Keys over 1024 bytes** | **0** (longest is 105) |

### Collision log

Empty. All 579 assigned keys are unique, so the SHA-1 suffix has never fired. If a future run
collides, `manifest2.mjs` prints the winner and the loser and both must be recorded here.

### Magic-byte log

| Public ID | Detected | How |
|---|---|---|
| `1.Keaa Assets/Keaa Resumes/file_klapaj` | `pdf` | first bytes are `%PDF-1.3` |

### Assertions, all passing

No assigned key contains an uppercase letter or a space, or any character outside `[a-z0-9/._-]`.
None has a double hyphen, a leading, doubled or trailing slash, or a path segment that begins or
ends with a hyphen. None exceeds 1024 bytes. None is missing an extension. Every one sits under
`1.keaa-assets/`. There are no duplicates.

## What is excluded, and why

- **41 remote-URL proxies**, reason `external URL, replace with KEAA asset`. Their public ID is a
  web address, so Cloudinary fetches them on demand and stores no file. 29 point at
  `images.unsplash.com`. The other **12 point at `www.keaainternational.com/images/`**, which means
  they are KEAA's own photographs already, proxied from the website rather than uploaded. Those 12
  are staff portraits and similar; the underlying files live in the frontend repo under
  `public/images/`. They are a separate job from replacing the Unsplash stock.
- **10 Cloudinary demo files** under `samples/`, shipped with every Cloudinary account.

## Still to decide before upload

1. Three unreferenced root images have no proposed home:
   `ChatGPT_Image_24_Sept_2026_14_20_33_rqqwzu` and `ChatGPT_Image_24_Sept_2026_14_23_40_bv5tdn`
   were uploaded on 2026-09-24 and nothing on the site uses them yet; `main-sample` looks like
   another Cloudinary demo file that happens to sit at the root rather than under `samples/`.
2. The 65 proposed keys in `manifest-loose-root.csv` need a yes before they move.
