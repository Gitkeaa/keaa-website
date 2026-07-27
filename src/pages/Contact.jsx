import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
/* Full-colour brand marks, the sanctioned exception to the site's icon-free rule. The client
   asked this row specifically to show each platform in its own colour (see BrandIconsColor). */
import {
  FacebookColor,
  LinkedinColor,
  XColor,
  InstagramColor,
  YoutubeColor,
  WhatsAppColor,
} from '../components/ui/BrandIconsColor';
import GalleryHero from '../components/gallery/GalleryHero';
import { heroSlides } from '../data/heroSlides';
import Button from '../components/ui/Button';
import CountrySelect from '../components/ui/CountrySelect';
import PhoneField from '../components/ui/PhoneField';
import EmailField from '../components/ui/EmailField';
import MultiSelect from '../components/ui/MultiSelect';
import WordLimitTextarea from '../components/ui/WordLimitTextarea';
import { getAllProductLines } from '../data/productLines';
import Reveal from '../components/ui/Reveal';
import { company } from '../data/company';
import { img } from '../data/images';
import { defaultCountry } from '../data/countriesData';
import { submitPublicForm } from '../data/adminApi';
import { useConsent, openCookiePreferences } from '../components/CookieConsent';
import useSEO from '../hooks/useSEO';
import { EASE } from '../lib/motion';

/**
 * Filtered on `href` for the same reason as the footer's row: these render as large,
 * hover-lifted cards, so a channel with no account was the most convincingly clickable
 * dead element on the site. A null entry in company.js now simply drops its card.
 */
/* Order follows the reference the client sent. Any channel still `null` in company.js drops
   out, so the row only shows icons that go somewhere. */
const socials = [
  { icon: FacebookColor, name: 'Facebook', href: company.social.facebook },
  { icon: LinkedinColor, name: 'LinkedIn', href: company.social.linkedin },
  { icon: XColor, name: 'X', href: company.social.x },
  { icon: InstagramColor, name: 'Instagram', href: company.social.instagram },
  { icon: YoutubeColor, name: 'YouTube', href: company.social.youtube },
  { icon: WhatsAppColor, name: 'WhatsApp', href: company.social.whatsapp },
].filter((s) => Boolean(s.href));

/**
 * The map, gated on consent.
 *
 * A Google Maps `<iframe>` sets google.com cookies and discloses the visitor's IP to Google
 * the moment it mounts. It used to render unconditionally on this page — the page EU buyers
 * are most likely to open — which is precisely what ePrivacy Art. 5(3) requires prior
 * consent for. `loading="lazy"` is a performance hint, not a consent gate.
 *
 * So: nothing third-party loads until `embeds` is allowed. Until then the visitor gets the
 * address and a plain link, which sets nothing, plus a one-click "Load map" that turns the
 * embed on for this visit only. `useConsent` re-renders on withdrawal too, so revoking in
 * the preferences dialog unmounts the iframe immediately rather than at the next reload.
 */
function ConsentedMap() {
  const allowed = useConsent('embeds');
  const [loadedOnce, setLoadedOnce] = useState(false);

  // Withdrawing consent must also cancel a one-off "Load map" from earlier in the session.
  useEffect(() => {
    if (!allowed) setLoadedOnce(false);
  }, [allowed]);

  if (allowed || loadedOnce) {
    return (
      <iframe
        title="KEAA International location map"
        src={mapEmbedSrc}
        className="aspect-[16/6] w-full"
        style={{ border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    );
  }

  return (
    <div className="relative isolate flex aspect-[16/6] w-full flex-col items-center justify-center gap-3 overflow-hidden px-6 text-center">
      {/* A KEAA plant photo stands in for the map until Google is allowed. It is served through
          Cloudinary — the one external host a pre-consent visitor may reach — so showing it sets
          nothing, unlike the Google iframe it replaces. Before this the slot was an empty navy
          wash, which read as a broken/loading map; the photo makes the gate look deliberate. A
          navy scrim over it keeps the copy and controls legible. */}
      <img
        src={img.factoryInterior}
        alt=""
        aria-hidden
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-navy-950/70" />
      <p className="max-w-md text-body-compact text-white/85">
        The interactive map is hosted by Google. Loading it shares your IP address with Google.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="primary" size="sm" onClick={() => setLoadedOnce(true)}>
          Load map
        </Button>
        {/* A plain link sets nothing until it is clicked, so it is always safe to show. */}
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `${company.manufacturing.line1}, ${company.manufacturing.line2}`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="border-b border-transparent pb-0.5 text-sm font-semibold text-white transition-colors hover:border-white/70"
        >
          Open in Google Maps
        </a>
      </div>
      <button
        type="button"
        onClick={openCookiePreferences}
        className="text-xs font-semibold text-white/70 underline underline-offset-2 transition-colors hover:text-white"
      >
        Always allow embedded content
      </button>
    </div>
  );
}

const mapEmbedSrc =
  'https://www.google.com/maps?q=Dehlon+Road,+Ludhiana,+Punjab,+India&output=embed';

const rideLocation = {
  latitude: 30.8368,
  longitude: 75.8952,
  name: 'KEAA International Pvt Ltd Ludhiana',
  address: 'Dehlon Road, Ludhiana, Punjab, India',
};

const rideLinks = {
  uber: `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff%5Blatitude%5D=${rideLocation.latitude}&dropoff%5Blongitude%5D=${rideLocation.longitude}&dropoff%5Bnickname%5D=${encodeURIComponent(
    rideLocation.name,
  )}&dropoff%5Bformatted_address%5D=${encodeURIComponent(rideLocation.address)}`,
  ola: `https://book.olacabs.com/?pickup_lat=&pickup_lng=&pickup_name=&drop_lat=${rideLocation.latitude}&drop_lng=${rideLocation.longitude}&drop_name=${encodeURIComponent(
    rideLocation.name,
  )}&utm_source=keaa`,
  rapido: `https://rapido.bike/?drop_lat=${rideLocation.latitude}&drop_lng=${rideLocation.longitude}&drop_name=${encodeURIComponent(
    rideLocation.name,
  )}&utm_source=keaa`,
};

/* Rendered exactly like `socials` — a plain badge + name row, no card — so the two columns
   read as one system. Each badge is the app's initial on its brand colour, since these have
   no lucide/brand SVG the way the social channels do. */
const rideApps = [
  { name: 'Uber', href: rideLinks.uber, badge: 'U', badgeClass: 'bg-black text-white' },
  { name: 'Ola', href: rideLinks.ola, badge: 'O', badgeClass: 'bg-[#3CB371] text-white' },
  { name: 'Rapido', href: rideLinks.rapido, badge: 'R', badgeClass: 'bg-[#FFCC00] text-black' },
];

/* Same product lines the RFQ form offers (catalogue categories + enquiry-only lines like
   Safety Products), so a contact lead can flag which ones it is about. */
const productCategoryOptions = getAllProductLines().map((c) => ({ value: c.name, label: c.name }));

export default function Contact() {
  useSEO({
    title: 'Contact Us',
    description:
      'Get in touch with KEAA International for inquiries, quotes and partnership opportunities. Manufacturing plant in Ludhiana, Punjab, India.',
  });

  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [showConsult, setShowConsult] = useState(false);
  const [country, setCountry] = useState(defaultCountry);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [categories, setCategories] = useState([]);
  const landlineNumbers = Array.isArray(company.landline) ? company.landline : [company.landline];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const val = (id) => form.querySelector('#' + id)?.value?.trim() || '';
    setSending(true);
    setSendError('');
    try {
      await submitPublicForm('/api/contact', {
        name: val('name'),
        email,
        company: val('company'),
        phone: `${country?.dial || ''} ${phone || ''}`.trim(),
        subject: val('subject'),
        // Top-level country + category drive auto-assignment to the owning rep. The visitor may
        // pick several categories; the first is used for matching, the full list rides in the body.
        country: country?.name || '',
        category: categories[0] || '',
        // The ContactMessage entity holds one message body; fold the extra context in
        // so nothing the visitor typed is lost — including the product categories they picked.
        message: `${message}\n\nProduct interest: ${categories.length ? categories.join(', ') : 'N/A'}\nCompany: ${val('company') || 'N/A'} · Phone: ${country?.dial || ''} ${phone || 'N/A'} · Country: ${country?.name || 'N/A'}`,
      });
      setSubmitted(true);
    } catch {
      setSendError('Could not send your message. Please try again, or email us directly.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <GalleryHero
        eyebrow="Contact Us"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Contact Us' }]}
        slides={heroSlides.contact}
        scrollTo="content"
      />

      <section id="content" className="section-pad">
        <div className="container-page grid gap-10 lg:grid-cols-[340px_1fr]">
          {/* GET IN TOUCH */}
          <Reveal className="space-y-5">
            <span className="eyebrow text-primary-darker">
              Get in Touch
            </span>
            <div className="rounded-card border border-navy-100 p-6 shadow-card">
              <div>
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-darker">
                    {company.manufacturing.label}
                  </h4>
                  <p className="mt-1 text-body-compact text-ink">
                    {company.manufacturing.line1}
                    <br />
                    {company.manufacturing.line2}
                  </p>
                </div>
              </div>
              <div className="mt-5">
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-darker">Phone</h4>
                  {company.phones.map((p) => (
                    <p key={p} className="text-body-compact text-ink">
                      <a href={`tel:${p}`} className="hover:text-navy-700">
                        {p}
                      </a>
                    </p>
                  ))}
                  {landlineNumbers.map((line) => (
                    <p key={line} className="text-body-compact text-ink">
                      <a href={`tel:${line.replace(/[^\d+]/g, '')}`} className="hover:text-navy-700">
                        Tel: {line}
                      </a>
                    </p>
                  ))}
                  <p className="text-body-compact text-ink">Fax: {company.fax}</p>
                </div>
              </div>
              <div className="mt-5">
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-darker">Email</h4>
                  {company.emails.map((e) => (
                    <p key={e} className="text-body-compact text-ink break-all">
                      <a href={`mailto:${e}`} className="hover:text-navy-700">
                        {e}
                      </a>
                    </p>
                  ))}
                </div>
              </div>
              <div className="mt-5">
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-darker">Business Hours</h4>
                  <p className="text-body-compact text-ink">Monday – Saturday</p>
                  <p className="text-body-compact text-ink">9:00 AM – 6:00 PM (IST)</p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* FORM */}
          <Reveal delay={0.1} className="relative rounded-card border border-navy-100 p-7 shadow-card">
            <div>
              <div>
                <h3 className="font-display text-xl font-bold text-text">Send Us a Message</h3>
                <button
                  type="button"
                  onClick={() => setShowConsult((v) => !v)}
                  aria-expanded={showConsult}
                  className="mt-0.5 inline-block border-b border-transparent pb-0.5 text-[11px] font-semibold uppercase tracking-wider text-primary-darker transition-colors hover:border-primary hover:text-primary-deep"
                >
                  Request a Consultation
                </button>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {showConsult && (
                <motion.div
                  key="consult"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="overflow-hidden"
                >
                  <p className="mt-4 rounded-card border border-primary/20 bg-primary/[0.05] p-4 text-body-compact leading-relaxed text-ink">
                    Planning your next construction or industrial project? Tell us about your
                    requirements, and our specialists will recommend the right products, pricing, and
                    manufacturing solutions tailored to your business. From initial inquiry to final
                    delivery, we&rsquo;re committed to supporting your success.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {submitted ? (
              <div className="mt-8 rounded-card bg-navy-50 p-8 text-center">
                <p className="font-display text-lg font-semibold text-text">Message Sent</p>
                <p className="mt-2 text-body-compact text-ink">
                  Thank you for reaching out. Our team will get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field label="Your Name" id="name" required />
                <Field label="Company Name" id="company" />
                <EmailField value={email} onChange={setEmail} required />
                <CountrySelect value={country} onChange={setCountry} required />
                <PhoneField country={country} value={phone} onChange={setPhone} />
                <Field
                  label="Subject"
                  id="subject"
                  required
                  placeholder="e.g. Bulk order inquiry for Cuplock scaffolding"
                />
                <MultiSelect
                  className="sm:col-span-2"
                  label="Product Category"
                  placeholder="Select one or more categories…"
                  options={productCategoryOptions}
                  value={categories}
                  onChange={setCategories}
                />
                <WordLimitTextarea
                  className="sm:col-span-2"
                  id="message"
                  label="Message"
                  value={message}
                  onChange={setMessage}
                  required
                  maxWords={250}
                  placeholder="Tell us how we can help: product, quantity, timeline, destination…"
                />
                <div className="sm:col-span-2">
                  {sendError && (
                    <p role="alert" className="mb-3 rounded-card bg-red-50 px-3 py-2 text-body-compact text-red-700">
                      {sendError}
                    </p>
                  )}
                  <Button type="submit" disabled={sending}>
                    {sending ? 'Sending…' : 'Send Message'}
                  </Button>
                </div>
              </form>
            )}
          </Reveal>
        </div>
      </section>

      {/* MAP */}
      <section className="section-pad">
        <div className="container-page">
          <Reveal>
            <span className="eyebrow text-primary-darker">
              Our Location
            </span>
            <h3 className="mt-2 font-display text-xl font-semibold text-text">
              {company.manufacturing.line1}, {company.manufacturing.line2}
            </h3>
          </Reveal>
          <Reveal delay={0.1} className="mt-5 overflow-hidden rounded-card border border-navy-100 shadow-card">
            <ConsentedMap />
          </Reveal>
        </div>
      </section>
      {/* BOOK YOUR RIDE + FOLLOW US — two ground-level ways to reach KEAA, side by side.
          The ride column gets the extra width so its three app cards sit on one row; both
          columns start at the same top line and stack on a phone. */}
      <section className="section-pad">
        <div className="container-page">
          <div className="grid gap-x-12 gap-y-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            {/* Book Your Ride */}
            <Reveal>
              <span className="eyebrow text-primary-darker">Book Your Ride</span>
              <h3 className="mt-2 font-display text-xl font-semibold text-text">
                Get to KEAA International, Dehlon Road, Ludhiana, Punjab, India
              </h3>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                {rideApps.map((r) => (
                  <a
                    key={r.name}
                    href={r.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 text-sm font-medium text-text transition-opacity hover:opacity-70"
                  >
                    <span
                      className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${r.badgeClass}`}
                    >
                      {r.badge}
                    </span>
                    {r.name}
                  </a>
                ))}
              </div>
            </Reveal>

            {/* Follow Us — icons on one horizontal line under the heading. */}
            <Reveal delay={0.1}>
              <span className="eyebrow text-primary-darker">Follow Us</span>
              <h3 className="mt-2 font-display text-xl font-semibold text-text">
                Find Us on Social Media
              </h3>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                {socials.map((s) => (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 text-sm font-medium text-text transition-opacity hover:opacity-70"
                  >
                    <s.icon className="h-6 w-6" />
                    {s.name}
                  </a>
                ))}
              </div>
            </Reveal>
          </div>
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
        className="mt-1.5 w-full rounded-card border border-navy-100 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary"
      />
    </div>
  );
}
