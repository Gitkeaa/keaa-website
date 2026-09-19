import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import Button from '../components/ui/Button';
import CtaBand from '../components/CtaBand';
import { getPost, getPosts } from '../data/blog';
import { company } from '../data/company';
import useSEO, { absoluteUrl } from '../hooks/useSEO';
import { useLT } from '../i18n/LocaleContext';

/**
 * /blog/:slug: one article.
 *
 * Structure follows what the SEO brief asks of an Article template: one h1, an Article
 * schema block, a visible last-updated date, and at least two links into the catalogue. The
 * links are declared with the post in src/data/blog.js and resolved to real category and
 * subcategory URLs there, so an article cannot link to a page that does not exist.
 *
 * Body paragraphs are split on blank lines rather than carrying markup. The content is
 * prose, and giving it a markup language would mean shipping a parser to render five
 * articles.
 */
export default function BlogPost() {
  const { slug } = useParams();
  const lt = useLT('blog');
  const post = getPost(slug);
  const [openFaq, setOpenFaq] = useState(null);

  const others = getPosts().filter((p) => p.slug !== slug).slice(0, 2);

  useSEO({
    title: post ? lt(`posts.${post.slug}.title`, post.title) : lt('notFound.title', 'Guide not found'),
    description: post ? lt(`posts.${post.slug}.description`, post.description) : undefined,
    breadcrumbs: post
      ? [
          { label: lt('crumbs.home', 'Home'), to: '/' },
          { label: lt('crumbs.current', 'Guides'), to: '/blog' },
          { label: lt(`posts.${post.slug}.title`, post.title) },
        ]
      : undefined,
    noindex: !post,
    schema: post
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: lt(`posts.${post.slug}.title`, post.title),
            description: lt(`posts.${post.slug}.description`, post.description),
            url: absoluteUrl(`/blog/${post.slug}`),
            dateModified: post.updated,
            datePublished: post.updated,
            author: { '@type': 'Organization', name: company.name },
            publisher: { '@type': 'Organization', name: company.name },
            mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
          },
          ...(post.faqs?.length
            ? [
                {
                  '@context': 'https://schema.org',
                  '@type': 'FAQPage',
                  mainEntity: post.faqs.map((f, i) => ({
                    '@type': 'Question',
                    name: lt(`posts.${post.slug}.faqs.${i}.q`, f.q),
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: lt(`posts.${post.slug}.faqs.${i}.a`, f.a),
                    },
                  })),
                },
              ]
            : []),
        ]
      : undefined,
  });

  if (!post) {
    return (
      <section className="container-page py-24 text-center">
        <h1 className="font-display text-2xl font-bold text-text">{lt('notFound.title', 'Guide not found')}</h1>
        <p className="body-copy mx-auto mt-2 text-center">
          {lt('notFound.body', 'This article may have been moved or renamed.')}
        </p>
        <Button to="/blog" className="mt-6">
          {lt('notFound.back', 'All guides')}
        </Button>
      </section>
    );
  }

  return (
    <>
      <section className="section-pad border-b border-navy-100 bg-gradient-to-b from-navy-50/60 via-white to-white">
        <div className="container-page">
          <nav aria-label={lt('crumbs.aria', 'Breadcrumb')} className="text-sm text-muted">
            <Link to="/" className="transition-colors hover:text-primary-dark">
              {lt('crumbs.home', 'Home')}
            </Link>
            <span aria-hidden className="mx-2">/</span>
            <Link to="/blog" className="transition-colors hover:text-primary-dark">
              {lt('crumbs.current', 'Guides')}
            </Link>
          </nav>

          <div className="mt-6 max-w-3xl">
            <p className="eyebrow text-primary-darker">{lt(`topics.${post.topic}`, post.topic)}</p>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl lg:leading-[1.15]">
              {lt(`posts.${post.slug}.title`, post.title)}
            </h1>
            <p className="mt-5 text-sm text-muted">
              {lt('meta.updated', 'Updated {date}', { date: post.updated })}
              <span aria-hidden className="mx-2">·</span>
              {lt('list.readTime', '{n} min read', { n: String(post.readMinutes) })}
            </p>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
            <article className="max-w-3xl">
              <p className="body-copy text-lg">{lt(`posts.${post.slug}.intro`, post.intro)}</p>

              {post.sections.map((sec, i) => (
                <div key={sec.heading} className="mt-10">
                  <h2 className="font-display text-xl font-bold text-text">
                    {lt(`posts.${post.slug}.sections.${i}.heading`, sec.heading)}
                  </h2>
                  {lt(`posts.${post.slug}.sections.${i}.body`, sec.body)
                    .split('\n\n')
                    .map((para, j) => (
                      <p key={j} className="body-copy mt-3">
                        {para}
                      </p>
                    ))}
                </div>
              ))}

              {post.faqs?.length > 0 && (
                <div className="mt-14">
                  <h2 className="font-display text-xl font-bold text-text">
                    {lt('faqTitle', 'Common questions')}
                  </h2>
                  <div className="mt-5 divide-y divide-navy-100 rounded-card border border-navy-100 bg-white">
                    {post.faqs.map((f, i) => {
                      const open = openFaq === i;
                      return (
                        <div key={f.q}>
                          <button
                            type="button"
                            onClick={() => setOpenFaq(open ? null : i)}
                            aria-expanded={open}
                            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                          >
                            <span className="text-sm font-semibold text-navy-800">
                              {lt(`posts.${post.slug}.faqs.${i}.q`, f.q)}
                            </span>
                            <ChevronDown
                              className={`h-4 w-4 flex-shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
                              aria-hidden
                            />
                          </button>
                          {/* Hidden with CSS rather than unmounted, so the answers are in the
                              HTML the FAQPage markup describes. */}
                          <div className={open ? 'px-5 pb-5' : 'hidden'}>
                            <p className="body-copy">{lt(`posts.${post.slug}.faqs.${i}.a`, f.a)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </article>

            {/* The links that make the article worth writing: every one goes into the
                catalogue, and they are declared with the post so they cannot rot. */}
            <aside className="lg:sticky lg:top-28">
              <div className="rounded-card border border-navy-100 bg-navy-50/40 p-6">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-darker">
                  {lt('aside.products', 'What we make')}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {post.links.map((l) => (
                    <li key={l.to}>
                      <Link
                        to={l.to}
                        className="text-sm font-semibold text-navy-800 underline-offset-4 transition-colors hover:text-primary-dark hover:underline"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Button to="/contact?tab=rfq" className="mt-6 w-full">
                  {lt('aside.cta', 'Request a Quote')}
                </Button>
              </div>

              {others.length > 0 && (
                <div className="mt-6 rounded-card border border-navy-100 bg-white p-6">
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-darker">
                    {lt('aside.more', 'More guides')}
                  </h2>
                  <ul className="mt-4 space-y-3">
                    {others.map((p) => (
                      <li key={p.slug}>
                        <Link
                          to={`/blog/${p.slug}`}
                          className="text-sm font-semibold text-navy-800 underline-offset-4 transition-colors hover:text-primary-dark hover:underline"
                        >
                          {lt(`posts.${p.slug}.title`, p.title)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
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
