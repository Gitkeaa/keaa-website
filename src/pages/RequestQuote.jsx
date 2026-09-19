import { Link } from 'react-router-dom';
import SectionHeading from '../components/ui/SectionHeading';
import Reveal from '../components/ui/Reveal';
import Button from '../components/ui/Button';
import { company } from '../data/company';
import { getAllCategories } from '../data/categories';
import useSEO, { absoluteUrl } from '../hooks/useSEO';
import { useLT } from '../i18n/LocaleContext';

/**
 * /request-a-quote: the landing page for quotation intent.
 *
 * WHY IT IS NOT JUST THE FORM AGAIN
 * ---------------------------------
 * The quote form already lives on the contact page as a tab, and every Request a Quote button
 * on the site points there. Duplicating the form here would create two addresses competing
 * for the same searches with the same content, which is the duplication problem this whole
 * programme exists to remove.
 *
 * What this page adds instead is the thing the form cannot: an answer to "what do I need to
 * send you, and what happens next". Someone searching "scaffolding manufacturer quote" is
 * deciding whether to bother asking. Telling them what a useful enquiry contains, and how the
 * reply works, is what turns that search into an enquiry. The form itself stays in one place,
 * one address, one set of submissions.
 *
 * Everything factual here comes from company.js. Nothing is promised about response times or
 * commercial terms, because neither is published anywhere on this site and inventing either
 * would be a commitment the company never made.
 */
export default function RequestQuote() {
  const lt = useLT('quotePage');
  const categories = getAllCategories();

  useSEO({
    title: lt('seo.title', 'Request a Quote from the Manufacturer'),
    description: lt(
      'seo.description',
      'Ask an ISO 9001:2015 certified scaffolding, formwork and steel hardware manufacturer for a quotation. What to include in your enquiry and how the process works.'
    ),
    breadcrumbs: [{ label: lt('crumbs.home', 'Home'), to: '/' }, { label: lt('crumbs.current', 'Request a Quote') }],
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Request a Quote',
      url: absoluteUrl('/request-a-quote'),
      description:
        'How to request a quotation for scaffolding, formwork, livestock housing and timber connectors from KEAA International.',
    },
  });

  const checklist = [
    {
      key: 'what',
      title: lt('checklist.what.title', 'What you need'),
      body: lt('checklist.what.body', 'Item names or codes from the catalogue, or a drawing, or simply a description and a photograph. We can quote from any of the three.'),
    },
    {
      key: 'quantity',
      title: lt('checklist.quantity.title', 'How many'),
      body: lt('checklist.quantity.body', 'Quantities per item, and whether this is a one-off or a repeating requirement. Repeat volumes change what we can do on price.'),
    },
    {
      key: 'standard',
      title: lt('checklist.standard.title', 'Which standard'),
      body: lt('checklist.standard.body', 'If your market enforces a specification, name it. EN 1065 for props, EN 74 for couplers, EN 12810 and EN 12811 for system scaffolds. It determines what we quote.'),
    },
    {
      key: 'finish',
      title: lt('checklist.finish.title', 'What finish'),
      body: lt('checklist.finish.body', 'Hot dip galvanized, powder coated, electroplated or self colour. All four are done in our own plant, and the choice affects both price and lead time.'),
    },
    {
      key: 'destination',
      title: lt('checklist.destination.title', 'Where it ships'),
      body: lt('checklist.destination.body', 'The destination country and port. For overseas orders this decides the packing and the shipping basis we quote on.'),
    },
  ];

  return (
    <>
      <section className="section-pad border-b border-navy-100 bg-gradient-to-b from-navy-50/60 via-white to-white">
        <div className="container-page">
          <nav aria-label={lt('crumbs.aria', 'Breadcrumb')} className="text-sm text-muted">
            <Link to="/" className="transition-colors hover:text-primary-dark">
              {lt('crumbs.home', 'Home')}
            </Link>
            <span aria-hidden className="mx-2">/</span>
            <span className="text-navy-800">{lt('crumbs.current', 'Request a Quote')}</span>
          </nav>

          <div className="mt-6 max-w-3xl">
            <span className="eyebrow text-primary-darker">{lt('hero.eyebrow', 'Quotations')}</span>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
              {lt('hero.title', 'Get a quote direct from the manufacturer')}
            </h1>
            <p className="body-copy mt-5">
              {lt(
                'hero.body',
                'We make scaffolding, formwork, livestock housing and timber connectors in our own plant and quote against your specification rather than a fixed price list. Tell us what you need and we will come back with pricing and a lead time.'
              )}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button to="/contact?tab=rfq">{lt('hero.cta', 'Open the quotation form')}</Button>
              <Button to="/contact?tab=export" variant="secondary">
                {lt('hero.ctaExport', 'Export enquiry instead')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-page">
          <SectionHeading
            align="left"
            eyebrow={lt('checklist.eyebrow', 'Before you send it')}
            title={lt('checklist.title', 'What makes a quotation quick')}
            desc={lt('checklist.desc', 'None of it is mandatory. Every line you can answer is a round of questions we do not have to send back.')}
            className="!mx-0"
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {checklist.map((c, i) => (
              <Reveal key={c.key} delay={i * 0.05}>
                <div className="h-full rounded-card border border-navy-100 bg-white p-5 shadow-card">
                  <p className="font-display text-base font-bold text-text">{c.title}</p>
                  <p className="body-copy mt-2 text-sm">{c.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-navy-50/40">
        <div className="container-page">
          <SectionHeading
            align="left"
            eyebrow={lt('ranges.eyebrow', 'What we quote for')}
            title={lt('ranges.title', 'The product ranges')}
            className="!mx-0"
          />
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {categories.map((c) => (
              <Link
                key={c.slug}
                to={`/products/${c.slug}`}
                className="group rounded-card border border-navy-100 bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-cardHover"
              >
                <p className="font-display text-base font-bold text-text transition-colors group-hover:text-primary-dark">
                  {c.name}
                </p>
                <p className="mt-1.5 text-sm text-muted">
                  {lt('ranges.count', '{n} products', { n: String(c.count) })}
                </p>
                {c.short && <p className="body-copy mt-3 text-sm">{c.short}</p>}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-page">
          <div className="mx-auto max-w-3xl rounded-card border border-navy-100 bg-white p-8 text-center shadow-card">
            <h2 className="font-display text-2xl font-bold text-text">
              {lt('form.title', 'Ready when you are')}
            </h2>
            <p className="body-copy mx-auto mt-3 text-center">
              {lt('form.body', 'The quotation form takes the item list, the quantities and the destination. Attach drawings if you have them.')}
            </p>
            <Button to="/contact?tab=rfq" className="mt-6">
              {lt('form.cta', 'Request a Quote')}
            </Button>
            <p className="mt-6 text-sm text-muted">
              {lt('form.phone', 'Or call {phone}', { phone: company.phones[0] })}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
