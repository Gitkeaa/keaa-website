import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useRegion } from '../context/RegionContext';
import { useAdminAuth } from '../admin/auth/AdminAuthContext';
import { useLT, useT } from '../i18n/LocaleContext';
import GalleryHero from '../components/gallery/GalleryHero';
import { heroSlides } from '../data/heroSlides';
import Button from '../components/ui/Button';
import CountrySelect from '../components/ui/CountrySelect';
import PhoneField from '../components/ui/PhoneField';
import EmailField from '../components/ui/EmailField';
import WordLimitTextarea from '../components/ui/WordLimitTextarea';
import { getAllProductLines } from '../data/productLines';
import { defaultCountry } from '../data/countriesData';
import { submitPublicForm } from '../data/adminApi';
import useSEO from '../hooks/useSEO';
import { EASE } from '../lib/motion';

/**
 * Request for Quotation page: the tabbed RFQ and Export Inquiry form that posts leads to /api/rfq.
 *
 * Rendered at the /rfq route (App.jsx) and linked from the header region switcher. Adjust the
 * offered product lines via getAllProductLines, and the submit payload or lead routing in handleSubmit.
 */
const tabs = [
  { id: 'rfq', label: 'RFQ Form' },
  { id: 'export', label: 'Export Inquiry' },
];

const formIntros = {
  rfq: {
    title: "Let's Build the Right Solution Together",
    paras: [
      "Whether you're planning a construction project, sourcing scaffolding systems, or looking for custom manufacturing solutions, our team is here to help. Complete the Request for Quotation form with your project requirements, and our specialists will prepare a tailored quotation based on your specifications.",
      'Please include product details, quantity, destination, and any technical requirements to help us provide the most accurate pricing and recommendations.',
    ],
    perks: [
      'Customized Quotation',
      'Competitive Factory Pricing',
      'Fast Response within 24 Business Hours',
      'Global Export & OEM Manufacturing Support',
    ],
  },
  export: {
    title: 'Expand Your Business with KEAA International',
    paras: [
      'Looking to import high-quality engineering products from India? Submit your export inquiry, and our international sales team will assist you with product information, pricing, export documentation, shipping options, and country-specific requirements.',
      "Whether you're a distributor, wholesaler, importer, contractor, or project developer, we'll provide reliable export solutions tailored to your market.",
      'Please share your product interest, destination country, estimated order quantity, and any specific requirements so we can respond with the most suitable proposal.',
    ],
    perks: [
      'International Shipping Support',
      'Export Documentation Assistance',
      'Flexible OEM & Private Label Solutions',
      'Dedicated International Sales Team',
    ],
  },
};

/**
 * The quote form offers every line KEAA sells — which is NOT the nav's list.
 *
 * Safety Products has no catalogue page yet (no photography), but it is a real line and
 * the top bar advertises it on every page. Drop it from this dropdown and those leads
 * simply stop arriving. Scaffolding and formwork are one line, not two — the old list
 * split them, which is why it offered five options for four lines.
 *
 * See src/data/enquiryLines.js.
 */
const productLines = getAllProductLines();

export default function RequestQuotation() {
  const lt = useLT('rfq');
  useSEO({
    title: lt('seo.title', 'Request a Quote'),
    description:
      lt('seo.description', 'Request a quote or export inquiry from KEAA International.'),
  });

  const [tab, setTab] = useState('rfq');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [showIntro, setShowIntro] = useState(false);
  const [country, setCountry] = useState(defaultCountry);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [details, setDetails] = useState('');

  /**
   * The header's region control links here as `/rfq?region=<key>`. Adopting it means the
   * enquiry carries the desk that should answer it (Eindhoven for Europe, Ludhiana
   * otherwise) without asking the visitor to restate what they already told us.
   * `setRegion` ignores an unknown key, so a hand-edited URL cannot corrupt the preference.
   */
  const [searchParams] = useSearchParams();
  const { region, setRegion, meta: regionMeta, office } = useRegion();

  /*
    PREFILL FOR A SIGNED-IN TEAM MEMBER.

    Timing is the whole problem here. AdminAuthContext resolves who you are from
    GET /api/auth/me, which lands well AFTER this page mounts — so anything that only reads
    `user` during the first render silently prefills nothing.

    Name is an UNCONTROLLED input (the submit handler reads it back with querySelector), and
    `defaultValue` is only consulted on mount, so a late-arriving name would be ignored.
    Rather than convert the field to controlled state — which would mean threading a value
    and onChange through the shared <Field> and diverging from the other uncontrolled fields
    on this form — the field is REMOUNTED by keying it on the user id. A remount re-reads
    defaultValue, and it costs one throwaway DOM node on a transition that happens at most
    once per page load. Note the key changes on sign-out too, which correctly clears it.

    Email IS controlled, so it just needs an effect — but one that never overwrites what the
    visitor has already typed. The functional update below reads the CURRENT value at the
    moment it runs, which is why `email` is not a dependency: adding it would re-run this on
    every keystroke.
  */
  const t = useT();
  const { user } = useAdminAuth();
  const prefilledFor = useRef(null);

  useEffect(() => {
    if (!user?.email) return;
    if (prefilledFor.current === user.id) return;
    prefilledFor.current = user.id;
    setEmail((current) => (current.trim() ? current : user.email));
  }, [user]);

  useEffect(() => {
    const requested = searchParams.get('region');
    if (requested && requested !== region) setRegion(requested);
    // `region` is intentionally not a dependency: this should react to the URL changing,
    // not fight the user if they pick a different region from the header afterwards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, setRegion]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const val = (id) => form.querySelector('#' + id)?.value?.trim() || '';
    const port = val('port');
    setSending(true);
    setSendError('');
    try {
      await submitPublicForm('/api/rfq', {
        name: val('name'),
        company: val('company'),
        email,
        phone: `${country?.dial || ''} ${phone || ''}`.trim(),
        country: country?.name || '',
        category: val('product'),
        // Which desk owns this: the Export tab routes to the admin's Export Inquiries screen,
        // everything else is a normal quote request. Defaults server-side to "quote" too.
        type: tab === 'export' ? 'export' : 'quote',
        // The region line tells whoever picks this up which desk owns it — the backend
        // takes a flat `message`, so it rides along as a labelled trailer rather than a
        // new field the API would drop.
        message: [
          details,
          port ? `Port of destination: ${port}` : '',
          `Sales region: ${regionMeta.label}, handled by ${office.name}`,
        ]
          .filter(Boolean)
          .join('\n\n'),
      });
      setSubmitted(true);
    } catch {
      setSendError(lt('form.submitError', 'Could not submit your request. Please try again, or email us directly.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <GalleryHero
        eyebrow={lt('hero.eyebrow', 'Request for Quotation')}
        crumbs={[{ label: lt('crumbs.home', 'Home'), to: '/' }, { label: lt('crumbs.rfq', 'Request for Quotation') }]}
        slides={heroSlides.rfq}
        scrollTo="content"
      />

      <section id="content" className="section-pad">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_320px]">
          <div className="rounded-card border border-navy-100 p-7 shadow-card">
            <div className="flex flex-wrap gap-2 border-b border-navy-100 pb-5">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center rounded-card px-4 py-2 text-sm font-medium transition-colors ${
                    tab === t.id ? 'bg-navy-700 text-white' : 'text-ink hover:bg-navy-50'
                  }`}
                >
                  {lt(`tabs.${t.id}`, t.label)}
                </button>
              ))}
            </div>

            {/* Tap-to-open guidance — content per tab */}
            <div className="mt-5 flex items-center gap-3.5">
              <motion.button
                type="button"
                onClick={() => setShowIntro((v) => !v)}
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                aria-expanded={showIntro}
                aria-label={lt('guide.toggle', 'Toggle form guidance')}
                className="flex h-11 flex-shrink-0 items-center justify-center rounded-card bg-primary-dark px-4 text-[13px] font-bold uppercase tracking-[0.12em] text-white shadow-lg shadow-primary/30 transition-transform hover:scale-105"
              >
                {lt('guide.button', 'Guide')}
              </motion.button>
              <button
                type="button"
                onClick={() => setShowIntro((v) => !v)}
                aria-expanded={showIntro}
                className="flex flex-1 items-center text-left"
              >
                <h3 className="font-display text-base font-bold text-text border-b border-transparent pb-0.5 transition-colors hover:border-primary hover:text-primary-darker sm:text-lg">
                  {lt(`intro.${tab}.title`, formIntros[tab].title)}
                </h3>
              </button>
            </div>

            <AnimatePresence initial={false}>
              {showIntro && (
                <motion.div
                  key="rfq-intro"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 rounded-card border border-primary/20 bg-primary/[0.05] p-5">
                    {formIntros[tab].paras.map((p, i) => (
                      <p key={i} className={`body-copy ${i > 0 ? 'mt-8' : ''}`}>
                        {lt(`intro.${tab}.p${i}`, p)}
                      </p>
                    ))}
                    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                      {formIntros[tab].perks.map((perk, i) => (
                        <li
                          key={perk}
                          className="border-l-2 border-primary/40 pl-4 text-body-compact font-medium text-text"
                        >
                          {lt(`intro.${tab}.perks.${i}`, perk)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {submitted ? (
              <div className="mt-8 rounded-card bg-navy-50 p-10 text-center">
                <p className="font-display text-lg font-semibold text-text">
                  {lt('submitted.title', 'Your Request Has Been Submitted')}
                </p>
                <p className="mt-2 text-body-compact text-ink">
                  {lt('submitted.body', 'Our export team will review your requirement and respond within 24 hours.')}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 grid gap-5 sm:grid-cols-2">
                {user && (
                  <p className="text-body-compact text-muted sm:col-span-2">
                    {t('auth.signedInAs')} {user.name}
                  </p>
                )}
                {/* Keyed on the user id so a name arriving after mount actually lands — see
                    the prefill note above. */}
                <Field
                  key={`name-${user?.id ?? 'anon'}`}
                  label={lt('form.name', 'Full Name')}
                  id="name"
                  required
                  defaultValue={user?.name || ''}
                />
                {/* Company is NOT prefilled: the backend user object is {id,name,email,role}
                    and has no company, and guessing one would put a wrong name on a quote. */}
                <Field label={lt('form.company', 'Company Name')} id="company" required />
                <EmailField value={email} onChange={setEmail} required />

                <CountrySelect value={country} onChange={setCountry} required />
                <PhoneField country={country} value={phone} onChange={setPhone} required />

                <div>
                  <label htmlFor="product" className="text-sm font-medium text-navy-800">
                    {lt('form.product', 'Product Category')}
                  </label>
                  <select
                    id="product"
                    className="mt-1.5 w-full rounded-card border border-navy-100 px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                  >
                    {productLines.map((c) => (
                      <option key={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {tab === 'export' && (
                  <Field
                    label={lt('form.port', 'Port of Destination')}
                    id="port"
                    className="sm:col-span-2"
                    placeholder={lt('form.portPlaceholder', 'e.g. Jebel Ali Port, Dubai (UAE), or Rotterdam, Netherlands')}
                  />
                )}

                <WordLimitTextarea
                  className="sm:col-span-2"
                  id="details"
                  label={lt('form.details', 'Requirement Details')}
                  value={details}
                  onChange={setDetails}
                  required
                  maxWords={250}
                  placeholder={lt('form.detailsPlaceholder', 'Tell us about specifications, quantities, timelines and destination port...')}
                />

                <div className="sm:col-span-2">
                  {sendError && (
                    <p role="alert" className="mb-3 rounded-card bg-red-50 px-3 py-2 text-body-compact text-red-700">
                      {sendError}
                    </p>
                  )}
                  <Button type="submit" disabled={sending}>
                    {sending ? lt('form.submitting', 'Submitting…') : lt('form.submit', 'Submit Request')}
                  </Button>
                </div>
              </form>
            )}
          </div>

          <aside className="space-y-5">
            <div className="rounded-card border border-navy-100 bg-navy-50 p-6">
              <h4 className="font-display text-sm font-semibold text-text">{lt('aside.nextTitle', 'What Happens Next?')}</h4>
              <ol className="mt-4 space-y-3 text-sm text-ink">
                <li className="flex gap-2.5">
                  <span className="font-mono text-xs font-semibold text-primary-darker">01</span>
                  {lt('aside.step1', 'Our export team reviews your requirement.')}
                </li>
                <li className="flex gap-2.5">
                  <span className="font-mono text-xs font-semibold text-primary-darker">02</span>
                  {lt('aside.step2', 'We respond with pricing, lead time and specs within 24 hours.')}
                </li>
                <li className="flex gap-2.5">
                  <span className="font-mono text-xs font-semibold text-primary-darker">03</span>
                  {lt('aside.step3', 'We finalise the order and manage dispatch end-to-end.')}
                </li>
              </ol>
            </div>
            <div className="rounded-card border border-navy-100 p-6 shadow-card">
              <h4 className="font-display text-sm font-semibold text-text">{lt('aside.talkTitle', 'Prefer to Talk?')}</h4>
              <p className="mt-2 text-body-compact text-ink">{lt('aside.talkBody', 'Call or email our export team directly.')}</p>
              <p className="mt-3 text-body-compact font-medium text-text">+91 98767 01926</p>
              <p className="text-body-compact font-medium text-text break-all">raveesh@keaa-international.net</p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

function Field({
  label,
  id,
  type = 'text',
  required = false,
  className = '',
  placeholder = '',
  defaultValue = undefined,
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-medium text-navy-800">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="mt-1.5 w-full rounded-card border border-navy-100 px-3.5 py-2.5 text-sm outline-none focus:border-primary"
      />
    </div>
  );
}
