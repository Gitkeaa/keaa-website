import { useState } from 'react';
import { Link } from 'react-router-dom';
import GalleryHero from '../components/gallery/GalleryHero';
import { heroSlides } from '../data/heroSlides';
import Reveal from '../components/ui/Reveal';
import Button from '../components/ui/Button';
import { PANEL_CARD } from '../components/ui/panelCard';
import { faqs, allFaqs } from '../data/faqs';
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
    title: 'Frequently Asked Questions',
    description:
      'Answers on KEAA International’s products, manufacturing, certifications, export markets, ordering and quotations.',
    breadcrumbs: [{ label: 'Home', to: '/' }, { label: 'FAQ' }],
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
        eyebrow="Help & Support"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'FAQ' }]}
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
                <ul className="mt-5 space-y-3">
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
                    Looking for technical documents instead?{' '}
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

    </>
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
