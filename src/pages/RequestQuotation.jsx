import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Send, FileText, Globe2, ChevronDown, Lightbulb, CheckCircle2 } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import Button from '../components/ui/Button';
import CountrySelect from '../components/ui/CountrySelect';
import PhoneField from '../components/ui/PhoneField';
import EmailField from '../components/ui/EmailField';
import WordLimitTextarea from '../components/ui/WordLimitTextarea';
import { getAllProductLines } from '../data/productLines';
import { defaultCountry } from '../data/countriesData';
import { img } from '../data/images';
import useSEO from '../hooks/useSEO';

const tabs = [
  { id: 'rfq', label: 'RFQ Form', icon: FileText },
  { id: 'export', label: 'Export Inquiry', icon: Globe2 },
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
  useSEO({
    title: 'Request a Quote',
    description:
      'Request a quote or export inquiry from KEAA International.',
  });

  const [tab, setTab] = useState('rfq');
  const [submitted, setSubmitted] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [country, setCountry] = useState(defaultCountry);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [details, setDetails] = useState('');

  return (
    <>
      <PageHero
        eyebrow="Request for Quotation"
        title="Request a"
        accent="Quote."
        desc="Tell us what you need — our team responds to every inquiry within 24 hours with the best solution and pricing."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Request for Quotation' }]}
      image={img.scaffoldRacks}
      />

      <section className="section-pad">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_320px]">
          <div className="rounded-2xl border border-black p-7 shadow-card">
            <div className="flex flex-wrap gap-2 border-b border-navy-100 pb-5">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    tab === t.id ? 'bg-navy-700 text-white' : 'text-ink/60 hover:bg-navy-50'
                  }`}
                >
                  <t.icon className="h-4 w-4" /> {t.label}
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
                aria-label="Toggle form guidance"
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary-dark text-white shadow-lg shadow-primary/30 transition-transform hover:scale-105"
              >
                <Lightbulb className="h-5 w-5" />
              </motion.button>
              <button
                type="button"
                onClick={() => setShowIntro((v) => !v)}
                aria-expanded={showIntro}
                className="flex flex-1 items-center gap-1.5 text-left"
              >
                <h3 className="font-display text-base font-bold text-navy-800 sm:text-lg">
                  {formIntros[tab].title}
                </h3>
                <ChevronDown
                  className={`h-4 w-4 flex-shrink-0 text-primary-darker transition-transform duration-300 ${
                    showIntro ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            <AnimatePresence initial={false}>
              {showIntro && (
                <motion.div
                  key="rfq-intro"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 rounded-xl border border-primary/20 bg-primary/[0.05] p-5">
                    {formIntros[tab].paras.map((p, i) => (
                      <p key={i} className={`text-sm leading-relaxed text-ink/70 ${i > 0 ? 'mt-2.5' : ''}`}>
                        {p}
                      </p>
                    ))}
                    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                      {formIntros[tab].perks.map((perk) => (
                        <li key={perk} className="flex items-center gap-2 text-sm font-medium text-navy-700">
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                          {perk}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {submitted ? (
              <div className="mt-8 rounded-xl bg-navy-50 p-10 text-center">
                <p className="font-display text-lg font-semibold text-navy-800">
                  Your Request Has Been Submitted
                </p>
                <p className="mt-2 text-sm text-ink/60">
                  Our export team will review your requirement and respond within 24 hours.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
                className="mt-6 grid gap-5 sm:grid-cols-2"
              >
                <Field label="Full Name" id="name" required />
                <Field label="Company Name" id="company" required />
                <EmailField value={email} onChange={setEmail} required />

                <CountrySelect value={country} onChange={setCountry} required />
                <PhoneField country={country} value={phone} onChange={setPhone} required />

                <div>
                  <label htmlFor="product" className="text-sm font-medium text-navy-800">
                    Product Category
                  </label>
                  <select
                    id="product"
                    className="mt-1.5 w-full rounded-md border border-navy-100 px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                  >
                    {productLines.map((c) => (
                      <option key={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {tab === 'export' && (
                  <Field
                    label="Port of Destination"
                    id="port"
                    className="sm:col-span-2"
                    placeholder="e.g. Jebel Ali Port, Dubai (UAE) — or Rotterdam, Netherlands"
                  />
                )}

                <WordLimitTextarea
                  className="sm:col-span-2"
                  id="details"
                  label="Requirement Details"
                  value={details}
                  onChange={setDetails}
                  required
                  maxWords={250}
                  placeholder="Tell us about specifications, quantities, timelines and destination port..."
                />

                <div className="sm:col-span-2">
                  <Button type="submit" icon={Send}>
                    Submit Request
                  </Button>
                </div>
              </form>
            )}
          </div>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-navy-100 bg-navy-50 p-6">
              <h4 className="font-display text-sm font-semibold text-navy-800">What Happens Next?</h4>
              <ol className="mt-4 space-y-3 text-sm text-ink/65">
                <li className="flex gap-2.5">
                  <span className="font-mono text-xs font-semibold text-primary-darker">01</span>
                  Our export team reviews your requirement.
                </li>
                <li className="flex gap-2.5">
                  <span className="font-mono text-xs font-semibold text-primary-darker">02</span>
                  We respond with pricing, lead time and specs within 24 hours.
                </li>
                <li className="flex gap-2.5">
                  <span className="font-mono text-xs font-semibold text-primary-darker">03</span>
                  We finalise the order and manage dispatch end-to-end.
                </li>
              </ol>
            </div>
            <div className="rounded-2xl border border-black p-6 shadow-card">
              <h4 className="font-display text-sm font-semibold text-navy-800">Prefer to Talk?</h4>
              <p className="mt-2 text-sm text-ink/60">Call or email our export team directly.</p>
              <p className="mt-3 text-sm font-medium text-navy-700">+91 98767 01926</p>
              <p className="text-sm font-medium text-navy-700 break-all">raveesh@keaa-international.net</p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

function Field({ label, id, type = 'text', required = false, className = '', placeholder = '' }) {
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
        className="mt-1.5 w-full rounded-md border border-navy-100 px-3.5 py-2.5 text-sm outline-none focus:border-primary"
      />
    </div>
  );
}
