import { Link } from 'react-router-dom';
import SectionHeading from '../components/ui/SectionHeading';
import Reveal from '../components/ui/Reveal';
import CtaBand from '../components/CtaBand';
import { getPosts } from '../data/blog';
import useSEO, { absoluteUrl } from '../hooks/useSEO';
import { useLT } from '../i18n/LocaleContext';

/**
 * /blog: the article index.
 *
 * The articles answer the question a specifier asks before they look for a supplier, which
 * no product page can rank for. This page exists to gather them and to be the thing an
 * external link points at. See src/data/blog.js for the content and the accuracy rules it
 * is written under.
 */
export default function Blog() {
  const lt = useLT('blog');
  const posts = getPosts();

  useSEO({
    title: lt('seo.title', 'Guides on scaffolding, formwork and steel hardware'),
    description: lt(
      'seo.description',
      'Practical guides from a manufacturer: choosing between scaffold systems, specifying props and couplers to European standards, and getting livestock and timber hardware right.'
    ),
    breadcrumbs: [{ label: lt('crumbs.home', 'Home'), to: '/' }, { label: lt('crumbs.current', 'Guides') }],
    /**
     * A Blog carrying its posts, rather than one Article per entry. Article markup belongs on
     * the article's own page, where the text it describes actually is.
     */
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'KEAA International guides',
      url: absoluteUrl('/blog'),
      blogPost: posts.map((p) => ({
        '@type': 'BlogPosting',
        headline: p.title,
        description: p.description,
        url: absoluteUrl(`/blog/${p.slug}`),
        dateModified: p.updated,
      })),
    },
  });

  return (
    <>
      <section className="section-pad border-b border-navy-100 bg-gradient-to-b from-navy-50/60 via-white to-white">
        <div className="container-page">
          <nav aria-label={lt('crumbs.aria', 'Breadcrumb')} className="text-sm text-muted">
            <Link to="/" className="transition-colors hover:text-primary-dark">
              {lt('crumbs.home', 'Home')}
            </Link>
            <span aria-hidden className="mx-2">/</span>
            <span className="text-navy-800">{lt('crumbs.current', 'Guides')}</span>
          </nav>
          <div className="mt-6 max-w-3xl">
            <span className="eyebrow text-primary-darker">{lt('hero.eyebrow', 'Guides')}</span>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
              {lt('hero.title', 'How to choose, from the people who make it')}
            </h1>
            <p className="body-copy mt-5">
              {lt(
                'hero.body',
                'Comparisons and specification notes on the equipment we manufacture. Written to answer the question before the purchase order, not to sell a part number.'
              )}
            </p>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-page">
          <SectionHeading
            align="left"
            eyebrow={lt('list.eyebrow', 'All guides')}
            title={lt('list.title', 'Articles')}
            className="!mx-0"
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.05}>
                <article className="flex h-full flex-col rounded-card border border-navy-100 bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-cardHover">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-darker">
                    {lt(`topics.${p.topic}`, p.topic)}
                  </p>
                  <h2 className="mt-3 font-display text-lg font-bold leading-snug text-text">
                    <Link to={`/blog/${p.slug}`} className="transition-colors hover:text-primary-dark">
                      {lt(`posts.${p.slug}.title`, p.title)}
                    </Link>
                  </h2>
                  <p className="body-copy mt-3 flex-1 text-sm">{lt(`posts.${p.slug}.description`, p.description)}</p>
                  <p className="mt-5 text-xs text-muted">
                    {lt('list.readTime', '{n} min read', { n: String(p.readMinutes) })}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        eyebrow={lt('cta.eyebrow', 'Still deciding')}
        title={lt('cta.title', 'Tell us the application')}
        desc={lt('cta.desc', 'Send the drawings, the standard or just the problem, and we will tell you what fits.')}
        cta={{ label: lt('cta.label', 'Request a Quote'), to: '/contact?tab=rfq' }}
      />
    </>
  );
}
