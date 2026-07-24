import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import GalleryHero from '../components/gallery/GalleryHero';
import { heroSlides } from '../data/heroSlides';
import Reveal from '../components/ui/Reveal';
import SectionHeading from '../components/ui/SectionHeading';
import Button from '../components/ui/Button';
import { PANEL_CARD } from '../components/ui/panelCard';
import { faqs, allFaqs } from '../data/faqs';
import { testimonials } from '../data/content';
import useSEO from '../hooks/useSEO';

/**
 * Answers are native <details>/<summary>, not a JS accordion.
 *
 * That buys three things for free that a hand-rolled one has to implement and usually gets
 * wrong: keyboard operation, the correct expanded/collapsed announcement to screen readers,
 * and — the one that matters most here — in-page find. Ctrl-F finds text inside a closed
 * <details> and the browser opens it; text hidden behind `display: none` in a React
 * accordion is simply not findable.
 *
 * It also means the answers are in the DOM at load, so the build-time search index
 * (scripts/gen-search-index.mjs) picks up every answer as searchable page content.
 */
/* The accordion keeps at most this many answers open at once. */
const MAX_OPEN = 2;

export default function FAQ() {
  /*
    `open` is the list of open question ids, OLDEST FIRST. The accordion is not single-open:
    a visitor can leave one answer open and read a second alongside it. Opening a THIRD does
    not collapse everything — it evicts the oldest of the two still-open answers, so the two
    most-recently-opened always stay. Closing an answer by hand always works and just removes
    it from the list.
  */
  const [open, setOpen] = useState([]);

  const toggleFaq = (id, isOpen) =>
    setOpen((prev) => {
      if (!isOpen) return prev.filter((x) => x !== id); // manual close
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      // Past the cap, drop from the FRONT (the oldest still-open answer).
      return next.length > MAX_OPEN ? next.slice(next.length - MAX_OPEN) : next;
    });

  useSEO({
    title: 'FAQ & Customer Testimonials',
    description:
      'Answers on KEAA International’s products, manufacturing, certifications, export markets, ordering and quotations, plus what our customers say about working with us.',
    breadcrumbs: [{ label: 'Home', to: '/' }, { label: 'FAQ & Testimonials' }],
    /**
     * FAQPage structured data. Google can surface these as expandable answers directly in
     * the results, which is the single highest-yield schema type for a page like this.
     * It is generated from the same array the page renders, so the markup and the copy can
     * never drift apart.
     */
    schema: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: allFaqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  });

  return (
    <>
      <GalleryHero
        eyebrow="FAQ & Testimonials"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'FAQ & Testimonials' }]}
        slides={heroSlides.faq}
        scrollTo="content"
      />

      <section id="content" className="section-pad">
        <div className="container-page">
          <div className={PANEL_CARD}>
            <div className="grid gap-12 lg:grid-cols-[16rem_1fr] lg:gap-16">
              {/* Jump list. Plain anchors — each group heading carries the matching id, so
                  these work with the browser's own history and are copyable links. */}
              <Reveal>
                <p className="eyebrow text-primary-darker">On this page</p>
                {/* Two columns while the list is full-width (phone/tablet), so the jump links
                    fill the row instead of stacking down the left. At `lg` it becomes the narrow
                    sidebar again — a single vertical column, unchanged. */}
                <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 lg:block lg:space-y-3">
                  {faqs.map((g) => (
                    <li key={g.group}>
                      <a
                        href={`#${slug(g.group)}`}
                        className="border-b border-transparent pb-0.5 text-sm font-medium text-ink transition-colors hover:border-primary hover:text-primary-darker"
                      >
                        {g.group}
                      </a>
                    </li>
                  ))}
                </ul>

                <div className="mt-10 border-t border-navy-100 pt-8">
                  <p className="text-sm font-semibold text-text">Still have a question?</p>
                  <p className="mt-1.5 text-body-compact text-ink">
                    Our team answers every enquiry within one business day.
                  </p>
                  <Button to="/contact" variant="outlineNavy" size="sm" className="mt-4">
                    Contact us
                  </Button>
                </div>
              </Reveal>

              <div className="space-y-14">
                {faqs.map((group) => (
                  <Reveal key={group.group}>
                    <h2 id={slug(group.group)} className="font-display text-2xl font-bold text-text">
                      {group.group}
                    </h2>

                    <div className="mt-6 divide-y divide-navy-100 border-y border-navy-100">
                      {group.items.map((item) => {
                        const id = `${slug(group.group)}-${slug(item.q)}`;
                        return (
                          <details
                            key={item.q}
                            open={open.includes(id)}
                            onToggle={(e) => toggleFaq(id, e.currentTarget.open)}
                            className="group py-5"
                          >
                            <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-left">
                              <span className="text-base font-semibold text-text transition-colors group-hover:text-primary-darker">
                                {item.q}
                              </span>
                              {/* Typographic +/− rather than a chevron glyph, matching the
                                  mobile drawer's expanders. */}
                              <span
                                aria-hidden
                                className="mt-0.5 flex-shrink-0 text-lg leading-none text-primary-dark"
                              >
                                {open.includes(id) ? '–' : '+'}
                              </span>
                            </summary>
                            <p className="body-copy mt-3 max-w-3xl">{item.a}</p>
                          </details>
                        );
                      })}
                    </div>
                  </Reveal>
                ))}

                <Reveal>
                  <p className="text-body-compact text-muted">
                    Looking for the full product catalogues instead?{' '}
                    <Link
                      to="/downloads"
                      className="border-b border-transparent font-semibold text-primary-dark transition-colors hover:border-primary hover:text-primary-darker"
                    >
                      Browse the Downloads Center
                    </Link>
                    .
                  </p>
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials. They used to be the top half of a separate Customer Success Stories
          page; that page is gone and they live here, where a visitor weighing up an order is
          already reading. `#testimonials` is a stable anchor for the nav and the footer. */}
      <section id="testimonials" className="section-pad pt-0">
        <div className="container-page">
          <SectionHeading eyebrow="What Our Customers Say" title="Testimonials" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {testimonials.map((t) => (
              <Reveal key={t.name}>
                <figure className="h-full rounded-card border border-navy-100 bg-white p-6 shadow-card">
                  <Rating value={t.rating} />
                  <blockquote className="mt-4 text-body-compact leading-relaxed text-ink">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-4">
                    <p className="font-display text-body-compact font-semibold text-text">{t.name}</p>
                    <p className="text-xs text-muted">{t.company}</p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/**
 * A five-star rating row.
 *
 * The stars are decorative (`aria-hidden`) and the score is carried by one screen-reader
 * sentence beside them, so the rating is never communicated by colour or shape alone — and a
 * screen reader announces "Rated 5 out of 5" once instead of the word "star" five times.
 */
const MAX_STARS = 5;

function Rating({ value = MAX_STARS }) {
  return (
    <p className="flex items-center gap-0.5">
      {Array.from({ length: MAX_STARS }, (_, i) => (
        <Star
          key={i}
          aria-hidden
          className={`h-4 w-4 ${i < value ? 'fill-accent text-accent' : 'fill-navy-100 text-navy-100'}`}
          strokeWidth={0}
        />
      ))}
      <span className="sr-only">Rated {value} out of {MAX_STARS}</span>
    </p>
  );
}

/** Stable ids for the jump links, from the heading text itself. */
function slug(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}
