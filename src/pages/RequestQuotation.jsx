import { useState } from 'react';
import { Send, FileText, Package, Globe2, Factory } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import Button from '../components/ui/Button';
import { productCategories } from '../data/products';
import { countries } from '../data/company';
import { img } from '../data/images';
import useSEO from '../hooks/useSEO';

const tabs = [
  { id: 'rfq', label: 'RFQ Form', icon: FileText },
  { id: 'oem', label: 'OEM Inquiry', icon: Factory },
  { id: 'bulk', label: 'Bulk Order', icon: Package },
  { id: 'export', label: 'Export Inquiry', icon: Globe2 },
];

export default function RequestQuotation() {
  useSEO({
    title: 'Request a Quote',
    description:
      'Request a quote, bulk order, OEM manufacturing or export inquiry from KEAA International.',
  });

  const [tab, setTab] = useState('rfq');
  const [submitted, setSubmitted] = useState(false);

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
          <div className="rounded-2xl border border-navy-100 p-7 shadow-card">
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
                <Field label="Email Address" id="email" type="email" required />
                <Field label="Phone Number" id="phone" type="tel" required />

                <div>
                  <label htmlFor="country" className="text-sm font-medium text-navy-800">
                    Country
                  </label>
                  <select
                    id="country"
                    className="mt-1.5 w-full rounded-md border border-navy-100 px-3.5 py-2.5 text-sm outline-none focus:border-gold-400"
                  >
                    {countries.map((c) => (
                      <option key={c.name}>{c.name}</option>
                    ))}
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="product" className="text-sm font-medium text-navy-800">
                    Product Category
                  </label>
                  <select
                    id="product"
                    className="mt-1.5 w-full rounded-md border border-navy-100 px-3.5 py-2.5 text-sm outline-none focus:border-gold-400"
                  >
                    {productCategories.map((c) => (
                      <option key={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {tab === 'bulk' && <Field label="Quantity Required" id="qty" className="sm:col-span-2" />}
                {tab === 'export' && (
                  <Field label="Port of Destination" id="port" className="sm:col-span-2" />
                )}
                {tab === 'oem' && (
                  <Field label="OEM Specification / Drawing Reference" id="oem-spec" className="sm:col-span-2" />
                )}

                <div className="sm:col-span-2">
                  <label htmlFor="details" className="text-sm font-medium text-navy-800">
                    Requirement Details
                  </label>
                  <textarea
                    id="details"
                    rows={5}
                    required
                    placeholder="Tell us about specifications, quantities, timelines and destination port..."
                    className="mt-1.5 w-full rounded-md border border-navy-100 px-3.5 py-2.5 text-sm outline-none focus:border-gold-400"
                  />
                </div>

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
                  <span className="font-mono text-xs font-semibold text-gold-600">01</span>
                  Our export team reviews your requirement.
                </li>
                <li className="flex gap-2.5">
                  <span className="font-mono text-xs font-semibold text-gold-600">02</span>
                  We respond with pricing, lead time and specs within 24 hours.
                </li>
                <li className="flex gap-2.5">
                  <span className="font-mono text-xs font-semibold text-gold-600">03</span>
                  We finalise the order and manage dispatch end-to-end.
                </li>
              </ol>
            </div>
            <div className="rounded-2xl border border-navy-100 p-6 shadow-card">
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

function Field({ label, id, type = 'text', required = false, className = '' }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-medium text-navy-800">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        className="mt-1.5 w-full rounded-md border border-navy-100 px-3.5 py-2.5 text-sm outline-none focus:border-gold-400"
      />
    </div>
  );
}
