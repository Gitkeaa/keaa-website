import GalleryHero from '../components/gallery/GalleryHero';
import { heroSlides } from '../data/heroSlides';
import SectionHeading from '../components/ui/SectionHeading';
import CertificateDocCard from '../components/certifications/CertificateDocCard';
import { company } from '../data/company';
import { publishedCertificateDocuments } from '../data/certificateDocuments';
import useSEO from '../hooks/useSEO';
import { useLT } from '../i18n/LocaleContext';

/**
 * Certifications & Compliance page: hero, a grid of certificate cards from company.certifications,
 * a second grid of full PDF certificates, and the in-house testing plus certified-workforce blurbs.
 *
 * Rendered at the /certifications route (lazy-loaded in App.jsx) and linked from the main
 * navigation. Edit the image certificate list in src/data/company.js and the PDF ones in
 * src/data/certificateDocuments.js; adjust layout and copy here.
 */

/**
 * How the PDF row lays itself out for the number of certificates that have actually been
 * filled in.
 *
 * Three columns only makes sense with three cards in them. Left on `lg:grid-cols-3`, a single
 * certificate would sit in a third of the page with two thirds of white space beside it, and
 * two would hug the left edge. Capping the width and centring instead keeps any count looking
 * deliberate, and all three cases stack to one column on a phone.
 */
const gridFor = (count) => {
  if (count <= 1) return 'mx-auto max-w-sm';
  if (count === 2) return 'mx-auto max-w-3xl sm:grid-cols-2';
  if (count === 3) return 'sm:grid-cols-2 lg:grid-cols-3';
  // Four goes to four columns rather than three, so the fourth is not left alone on a second
  // row. Anything past four wraps in threes, where a short last row reads as a wrap and not
  // as an orphan.
  if (count === 4) return 'sm:grid-cols-2 lg:grid-cols-4';
  return 'sm:grid-cols-2 lg:grid-cols-3';
};
export default function Certifications() {
  const lt = useLT('certifications');
  useSEO({
    title: lt('seo.title', 'Certifications & Compliance'),
    description: lt(
      'seo.description',
      'ISO 9001:2015, CE, AEO, BSCI and more -- KEAA International\'s certifications and quality compliance documents.'
    ),
  });

  return (
    <>
      <GalleryHero
        eyebrow={lt('hero.eyebrow', 'Certifications & Compliance')}
        crumbs={[{ label: lt('crumbs.home', 'Home'), to: '/' }, { label: lt('crumbs.current', 'Certifications & Compliance') }]}
        slides={heroSlides.certifications.map((s, i) => ({
          ...s,
          title: lt(`hero.${i}.title`, s.title),
          accent: s.accent && lt(`hero.${i}.accent`, s.accent),
          desc: s.desc && lt(`hero.${i}.desc`, s.desc),
        }))}
        scrollTo="content"
      />

      <section id="content" className="section-pad">
        <div className="container-page">
          <SectionHeading
            eyebrow={lt('intro.eyebrow', 'Our Certifications')}
            title={lt('intro.title', 'Quality You Can Verify')}
            desc={lt('intro.desc', 'Independently audited and certified by TÜV Rheinland and the Government of India. Click any certificate to open the full document.')}
          />

          {/* The ISO and ZED certificates go through the SAME card and the same view-only
              viewer as the PDFs below. They used to be hand-rolled cards whose "View
              Certificate" linked straight at the .jpg, which opened the raw file and offered
              it for download, so the page was view-only for half its certificates and
              download-anything for the other half. `image` in place of `pdf` is the only
              difference the card sees.

              The per-index `certs.N.scope` / `certs.N.note` translation keys are resolved
              here and passed down, so the translations that already exist for them keep
              working rather than needing new keys under `docs.`. */}
          <div className={`mt-12 grid gap-6 ${gridFor(company.certifications.length)}`}>
            {company.certifications.map((c, i) => (
              <CertificateDocCard
                key={c.name}
                doc={{
                  ...c,
                  scope: lt(`certs.${i}.scope`, c.scope),
                  note: lt(`certs.${i}.note`, c.note),
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* The full certificates, as PDFs. The whole section disappears when no links have been
          pasted into data/certificateDocuments.js yet, so an unfilled slot never reaches the
          live site as an empty heading. */}
      {publishedCertificateDocuments.length > 0 && (
        /* Bottom padding only, spelled out rather than `section-pad pt-0`: `section-pad` sets
           its padding through a `lg:` variant, which outranks a plain `pt-0` and left 57px of
           top padding in place. With the heading gone, that padding plus the grid's old
           `mt-12` and the section above's own bottom padding stacked up to a 162px void
           between the two sets of cards. The gap is now one section's worth. */
        <section id="documents" className="pb-[37px] sm:pb-[47px] lg:pb-[57px]">
          <div className="container-page">
            <div className={`grid gap-6 ${gridFor(publishedCertificateDocuments.length)}`}>
              {/* Keyed by position: the list is three fixed slots that are never reordered or
                  filtered on screen, and neither the link nor the name is guaranteed unique
                  while somebody is still pasting values in. */}
              {publishedCertificateDocuments.map((doc, i) => (
                <CertificateDocCard key={i} doc={doc} />
              ))}
            </div>
          </div>
        </section>
      )}

      
    </>
  );
}
