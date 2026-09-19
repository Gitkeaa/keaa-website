import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Mail } from 'lucide-react';
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
import ProductLineItems, { emptyLineItem } from '../components/ui/ProductLineItems';
import WordLimitTextarea from '../components/ui/WordLimitTextarea';
import { getAllProductLines } from '../data/productLines';
import Reveal from '../components/ui/Reveal';
import { company, leadership, waLink } from '../data/company';
import { img } from '../data/images';
import { defaultCountry } from '../data/countriesData';
import { submitPublicForm } from '../data/adminApi';
import Photo from '../components/ui/Photo';
import { track, EVENTS } from '../lib/analytics';
import { useConsent, openCookiePreferences } from '../components/CookieConsent';
import { useRegion } from '../context/RegionContext';
import { useAdminAuth } from '../admin/auth/AdminAuthContext';
import useSEO from '../hooks/useSEO';
import { EASE } from '../lib/motion';
import { useLT, useT } from '../i18n/LocaleContext';

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
 * The sales team, shown as reachable contact cards further down this page. They used to sit on
 * the About page as a scrolling rail, which put the people you can actually call on a page that
 * has no way to call them.
 *
 * The CMD and the two Managing Directors are excluded: they carry the company's voice and keep
 * their full message blocks on About rather than becoming one card among seven here.
 */
const TEAM = leadership.filter(
  (l) => l.role !== 'Chief Managing Director' && l.role !== 'Managing Director'
);

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
  const lt = useLT('contact');
  const allowed = useConsent('embeds');
  const [loadedOnce, setLoadedOnce] = useState(false);

  // Withdrawing consent must also cancel a one-off "Load map" from earlier in the session.
  useEffect(() => {
    if (!allowed) setLoadedOnce(false);
  }, [allowed]);

  if (allowed || loadedOnce) {
    return (
      <iframe
        title={lt('map.iframeTitle', 'KEAA International location map')}
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
        loading="lazy"
        decoding="async"
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-navy-950/70" />
      <p className="max-w-md text-body-compact text-white/85">
        {lt('map.consentNote', 'The interactive map is hosted by Google. Loading it shares your IP address with Google.')}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="primary" size="sm" onClick={() => setLoadedOnce(true)}>
          {lt('map.load', 'Load map')}
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
          {lt('map.openExternal', 'Open in Google Maps')}
        </a>
      </div>
      <button
        type="button"
        onClick={openCookiePreferences}
        className="text-xs font-semibold text-white/70 underline underline-offset-2 transition-colors hover:text-white"
      >
        {lt('map.allowEmbeds', 'Always allow embedded content')}
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

/* Catalogue categories + enquiry-only lines like Safety Products, so a plain contact lead
   can flag which ones it is about. */
/* The VALUE is the English line name the backend routes on; the label is translated where the
   select renders (rfq.lines.<slug>), so the visitor reads it in their language. */
const productCategoryOptions = getAllProductLines().map((c) => ({ value: c.name, label: c.name, slug: c.slug }));

/* The RFQ/Export tabs also use this exact list for their "Product Category" select — the
   backend's AssignmentService auto-routes a submission by matching `category` AGAINST A
   REP'S TERRITORY STRING EXACTLY (see BACKEND_GUIDE.md/BACKEND_FEEDBACK.md), so this field
   must stay a single value from a fixed, backend-known vocabulary. It CANNOT be derived from
   the specific catalogue products picked in ProductLineItems below: those are searched
   straight against products.json, whose category strings cover only 3 of these 4 lines
   ("Safety Products" has no catalogue entry at all), and picking items from two different
   categories would produce a joined string ("A, B") that matches no rep's territory either.
   So the select stays the single source of truth for routing; the picked products/quantities
   ride along as supplementary detail in the message body. */
const productLines = getAllProductLines();

/* The three switchable modes this one page now covers — a plain enquiry, a product quote
   request, and an export/distributor enquiry — replacing what used to be a separate /rfq
   page with its own tabs. `/rfq` still works: it redirects here with `?tab=rfq` (see App.jsx). */
const MAIN_TABS = [
  { id: 'contact', label: 'Contact Us' },
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

export default function Contact() {
  const lt = useLT('contact');
  const ltRfq = useLT('rfq');
  const t = useT();
  useSEO({
    title: lt('seo.title', 'Contact Us'),
    description:
      lt('seo.description', 'Get in touch with KEAA International for inquiries, quotes and partnership opportunities. Manufacturing plant in Ludhiana, Punjab, India.'),
  });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = MAIN_TABS.some((tb) => tb.id === searchParams.get('tab')) ? searchParams.get('tab') : 'contact';
  const [mainTab, setMainTab] = useState(initialTab);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [showConsult, setShowConsult] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [country, setCountry] = useState(defaultCountry);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [details, setDetails] = useState('');
  const [categories, setCategories] = useState([]);
  // Kept as two separate lists — a product/quantity picked while on the RFQ tab must not
  // bleed into the Export Inquiry tab (or vice versa), since they are two distinct requests.
  const [rfqItems, setRfqItems] = useState(() => [emptyLineItem()]);
  const [exportItems, setExportItems] = useState(() => [emptyLineItem()]);
  const lineItems = mainTab === 'export' ? exportItems : rfqItems;
  const setLineItems = mainTab === 'export' ? setExportItems : setRfqItems;
  // Same independence for the routing category — this is what the backend actually matches
  // against a rep's territory, so each tab keeps its own (see the note on productLines above).
  const [rfqCategory, setRfqCategory] = useState(() => productLines[0]?.name || '');
  const [exportCategory, setExportCategory] = useState(() => productLines[0]?.name || '');
  const category = mainTab === 'export' ? exportCategory : rfqCategory;
  const setCategory = mainTab === 'export' ? setExportCategory : setRfqCategory;

  // Switching tabs clears any previous submit result/error so a visitor moving from a
  // finished RFQ to the plain contact form does not still see "Your Request Has Been Submitted".
  useEffect(() => {
    setSubmitted(false);
    setSendError('');
  }, [mainTab]);

  /* The header's region control links to `/rfq?region=<key>`, redirected here with the same
     query string (see RfqRedirect in App.jsx) — adopting it routes the enquiry to the desk
     that should answer it without asking the visitor to restate what they already told us. */
  const { region, setRegion, meta: regionMeta, office } = useRegion();
  useEffect(() => {
    const requested = searchParams.get('region');
    if (requested && requested !== region) setRegion(requested);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, setRegion]);

  /* Prefill for a signed-in team member — see the RFQ tab's name/email fields below. Name is
     read back uncontrolled on submit, so it is remounted (keyed on user id) rather than made
     controlled; email is controlled but only filled in if the visitor has not already typed. */
  const { user } = useAdminAuth();
  const prefilledFor = useRef(null);
  useEffect(() => {
    if (!user?.email) return;
    if (prefilledFor.current === user.id) return;
    prefilledFor.current = user.id;
    setEmail((current) => (current.trim() ? current : user.email));
  }, [user]);

  const handleContactSubmit = async (e) => {
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
      track(EVENTS.contactMessage, { country: country?.name || '' });
      // Only after the POST resolved, so a lead can never be lost to this navigation.
      navigate('/thank-you/contact');
    } catch {
      setSendError(lt('form.sendError', 'Could not send your message. Please try again, or email us directly.'));
    } finally {
      setSending(false);
    }
  };

  const handleRfqSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const val = (id) => form.querySelector('#' + id)?.value?.trim() || '';
    const port = val('port');
    // Only rows where a catalogue product was actually picked count — an empty search row
    // (or one left over after the visitor removed their pick) contributes nothing.
    const pickedItems = lineItems.filter((it) => it.product);
    setSending(true);
    setSendError('');
    try {
      await submitPublicForm('/api/rfq', {
        name: val('name'),
        company: val('company'),
        email,
        phone: `${country?.dial || ''} ${phone || ''}`.trim(),
        country: country?.name || '',
        // The single value the backend routes on — see the note on productLines above for why
        // this can't be derived from the picked catalogue products instead.
        category,
        // Which desk owns this: the Export tab routes to the admin's Export Inquiries screen,
        // everything else is a normal quote request. Defaults server-side to "quote" too.
        type: mainTab === 'export' ? 'export' : 'quote',
        message: [
          details,
          pickedItems.length
            ? `Products requested:\n${pickedItems
                .map((it) => `- ${it.product.name} (${it.product.itemCode || 'N/A'}) × ${it.quantity}`)
                .join('\n')}`
            : '',
          port ? `Port of destination: ${port}` : '',
          `Sales region: ${regionMeta.label}, handled by ${office.name}`,
        ]
          .filter(Boolean)
          .join('\n\n'),
      });
      setSubmitted(true);
      track(mainTab === 'export' ? EVENTS.exportEnquiry : EVENTS.quoteRequest, {
        category: category || '',
        country: country?.name || '',
        items: pickedItems.length,
      });
      navigate(mainTab === 'export' ? '/thank-you/export' : '/thank-you/quote');
    } catch {
      setSendError(ltRfq('form.submitError', 'Could not submit your request. Please try again, or email us directly.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <GalleryHero
        eyebrow={lt('hero.eyebrow', 'Contact Us')}
        crumbs={[{ label: lt('crumbs.home', 'Home'), to: '/' }, { label: lt('crumbs.contact', 'Contact Us') }]}
        slides={heroSlides.contact.map((s, i) => ({
          ...s,
          title: lt(`hero.${i}.title`, s.title),
          accent: s.accent && lt(`hero.${i}.accent`, s.accent),
          desc: s.desc && lt(`hero.${i}.desc`, s.desc),
        }))}
        scrollTo="content"
      />

      <section id="content" className="section-pad">
        <div className="container-page grid gap-10 lg:grid-cols-[340px_1fr]">
          {/* GET IN TOUCH */}
          <Reveal className="space-y-5">
            <span className="eyebrow text-primary-darker">
              {lt('info.eyebrow', 'Get in Touch')}
            </span>
            <div className="rounded-card border border-navy-100 p-6 shadow-card">
              <div>
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-darker">
                    {lt('info.addressLabel', company.manufacturing.label)}
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
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-darker">{lt('info.phone', 'Phone')}</h4>
                  {company.phones.map((p) => (
                    <p key={p} className="text-body-compact text-ink">
                      <a href={`tel:${p}`} className="hover:text-navy-700">
                        {p}
                      </a>
                    </p>
                  ))}
                </div>
              </div>
              <div className="mt-5">
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-darker">{lt('info.email', 'Email')}</h4>
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
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-darker">{lt('info.hours', 'Business Hours')}</h4>
                  <p className="text-body-compact text-ink">{lt('info.hoursDays', 'Monday – Saturday')}</p>
                  <p className="text-body-compact text-ink">{lt('info.hoursTime', '9:00 AM – 6:00 PM (IST)')}</p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* FORM — switchable between a plain enquiry, an RFQ, and an export inquiry. All
              three post to the desk that handles that lead type; only the fields and the
              endpoint change underneath the same card. */}
          <Reveal delay={0.1} className="relative rounded-card border border-navy-100 p-7 shadow-card">
            <div className="flex flex-wrap gap-2 border-b border-navy-100 pb-5">
              {MAIN_TABS.map((tb) => (
                <button
                  key={tb.id}
                  type="button"
                  onClick={() => setMainTab(tb.id)}
                  className={`flex items-center rounded-card px-4 py-2 text-sm font-medium transition-colors ${
                    mainTab === tb.id ? 'bg-navy-700 text-white' : 'text-ink hover:bg-navy-50'
                  }`}
                >
                  {tb.id === 'contact' ? lt('form.tab', tb.label) : ltRfq(`tabs.${tb.id}`, tb.label)}
                </button>
              ))}
            </div>

            {mainTab === 'contact' ? (
              <>
                <div className="mt-5">
                  <h3 className="font-display text-xl font-bold text-text">{lt('form.title', 'Send Us a Message')}</h3>
                  <button
                    type="button"
                    onClick={() => setShowConsult((v) => !v)}
                    aria-expanded={showConsult}
                    className="mt-0.5 inline-block border-b border-transparent pb-0.5 text-[11px] font-semibold uppercase tracking-wider text-primary-darker transition-colors hover:border-primary hover:text-primary-deep"
                  >
                    {lt('form.consultToggle', 'Request a Consultation')}
                  </button>
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
                        {lt('form.consultBody', 'Planning your next construction or industrial project? Tell us about your requirements, and our specialists will recommend the right products, pricing, and manufacturing solutions tailored to your business. From initial inquiry to final delivery, we’re committed to supporting your success.')}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {submitted ? (
                  <div className="mt-8 rounded-card bg-navy-50 p-8 text-center">
                    <p className="font-display text-lg font-semibold text-text">{lt('form.sentTitle', 'Message Sent')}</p>
                    <p className="mt-2 text-body-compact text-ink">
                      {lt('form.sentBody', 'Thank you for reaching out. Our team will get back to you within 24 hours.')}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="mt-6 grid gap-5 sm:grid-cols-2">
                    <Field label={lt('form.name', 'Your Name')} id="name" required />
                    <Field label={lt('form.company', 'Company Name')} id="company" />
                    <EmailField value={email} onChange={setEmail} required />
                    <CountrySelect value={country} onChange={setCountry} required />
                    <PhoneField country={country} value={phone} onChange={setPhone} />
                    <Field
                      label={lt('form.subject', 'Subject')}
                      id="subject"
                      required
                      placeholder={lt('form.subjectPlaceholder', 'e.g. Bulk order inquiry for Cuplock scaffolding')}
                    />
                    <MultiSelect
                      className="sm:col-span-2"
                      label={lt('form.category', 'Product Category')}
                      placeholder={lt('form.categoryPlaceholder', 'Select one or more categories…')}
                      options={productCategoryOptions.map((o) => ({ value: o.value, label: ltRfq(`lines.${o.slug}`, o.label) }))}
                      value={categories}
                      onChange={setCategories}
                    />
                    <WordLimitTextarea
                      className="sm:col-span-2"
                      id="message"
                      label={lt('form.message', 'Message')}
                      value={message}
                      onChange={setMessage}
                      required
                      maxWords={250}
                      placeholder={lt('form.messagePlaceholder', 'Tell us how we can help: product, quantity, timeline, destination…')}
                    />
                    <div className="sm:col-span-2">
                      {sendError && (
                        <p role="alert" className="mb-3 rounded-card bg-red-50 px-3 py-2 text-body-compact text-red-700">
                          {sendError}
                        </p>
                      )}
                      <Button type="submit" disabled={sending}>
                        {sending ? lt('form.sending', 'Sending…') : lt('form.submit', 'Send Message')}
                      </Button>
                    </div>
                  </form>
                )}
              </>
            ) : (
              <>
                {/* Tap-to-open guidance — content per tab (RFQ / Export) */}
                <div className="mt-5 flex items-center gap-3.5">
                  <motion.button
                    type="button"
                    onClick={() => setShowIntro((v) => !v)}
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                    aria-expanded={showIntro}
                    aria-label={ltRfq('guide.toggle', 'Toggle form guidance')}
                    className="flex h-11 flex-shrink-0 items-center justify-center rounded-card bg-primary-dark px-4 text-[13px] font-bold uppercase tracking-[0.12em] text-white shadow-lg shadow-primary/30 transition-transform hover:scale-105"
                  >
                    {ltRfq('guide.button', 'Guide')}
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => setShowIntro((v) => !v)}
                    aria-expanded={showIntro}
                    className="flex flex-1 items-center text-left"
                  >
                    <h3 className="font-display text-base font-bold text-text border-b border-transparent pb-0.5 transition-colors hover:border-primary hover:text-primary-darker sm:text-lg">
                      {ltRfq(`intro.${mainTab}.title`, formIntros[mainTab].title)}
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
                        {formIntros[mainTab].paras.map((p, i) => (
                          <p key={i} className={`body-copy ${i > 0 ? 'mt-8' : ''}`}>
                            {ltRfq(`intro.${mainTab}.p${i}`, p)}
                          </p>
                        ))}
                        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                          {formIntros[mainTab].perks.map((perk, i) => (
                            <li
                              key={perk}
                              className="border-l-2 border-primary/40 pl-4 text-body-compact font-medium text-text"
                            >
                              {ltRfq(`intro.${mainTab}.perks.${i}`, perk)}
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
                      {ltRfq('submitted.title', 'Your Request Has Been Submitted')}
                    </p>
                    <p className="mt-2 text-body-compact text-ink">
                      {ltRfq('submitted.body', 'Our export team will review your requirement and respond within 24 hours.')}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleRfqSubmit} className="mt-6 grid gap-5 sm:grid-cols-2">
                    {user && (
                      <p className="text-body-compact text-muted sm:col-span-2">
                        {t('auth.signedInAs')} {user.name}
                      </p>
                    )}
                    <Field
                      key={`name-${user?.id ?? 'anon'}`}
                      label={ltRfq('form.name', 'Full Name')}
                      id="name"
                      required
                      defaultValue={user?.name || ''}
                    />
                    <Field label={ltRfq('form.company', 'Company Name')} id="company" required />
                    <EmailField value={email} onChange={setEmail} required />
                    <CountrySelect value={country} onChange={setCountry} required />
                    <PhoneField country={country} value={phone} onChange={setPhone} required />
                    <div>
                      <label htmlFor="category" className="text-sm font-medium text-navy-800">
                        {ltRfq('form.product', 'Product Category')}
                      </label>
                      <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="mt-1.5 w-full rounded-card border border-navy-100 px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                      >
                        {productLines.map((c) => (
                          <option key={c.slug} value={c.name}>
                            {ltRfq(`lines.${c.slug}`, c.name)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <ProductLineItems
                      items={lineItems}
                      onChange={setLineItems}
                      labels={{
                        label: ltRfq('form.products', 'Products & Quantities Required'),
                        add: ltRfq('form.addProduct', '+ Add another product'),
                        searchPlaceholder: ltRfq(
                          'form.productSearchPlaceholder',
                          'Search by item code or product name…'
                        ),
                        quantity: ltRfq('form.quantity', 'Quantity'),
                        change: ltRfq('form.changeProduct', 'Change product'),
                        remove: ltRfq('form.removeProduct', 'Remove product'),
                        noResults: ltRfq('form.noProductResults', 'No matching products'),
                        alreadyAdded: ltRfq(
                          'form.productAlreadyAdded',
                          'Already added — adjust its quantity above instead'
                        ),
                        loading: ltRfq('form.loadingProducts', 'Loading products…'),
                      }}
                    />
                    {mainTab === 'export' && (
                      <Field
                        label={ltRfq('form.port', 'Port of Destination')}
                        id="port"
                        className="sm:col-span-2"
                        placeholder={ltRfq('form.portPlaceholder', 'e.g. Jebel Ali Port, Dubai (UAE), or Rotterdam, Netherlands')}
                      />
                    )}
                    <WordLimitTextarea
                      className="sm:col-span-2"
                      id="details"
                      label={ltRfq('form.details', 'Requirement Details')}
                      value={details}
                      onChange={setDetails}
                      required
                      maxWords={250}
                      placeholder={ltRfq('form.detailsPlaceholder', 'Tell us about specifications, quantities, timelines and destination port...')}
                    />
                    <div className="sm:col-span-2">
                      {sendError && (
                        <p role="alert" className="mb-3 rounded-card bg-red-50 px-3 py-2 text-body-compact text-red-700">
                          {sendError}
                        </p>
                      )}
                      <Button type="submit" disabled={sending}>
                        {sending ? ltRfq('form.submitting', 'Submitting…') : ltRfq('form.submit', 'Submit Request')}
                      </Button>
                    </div>
                  </form>
                )}
              </>
            )}
          </Reveal>
        </div>
      </section>

      {/* SALES TEAM — moved here from the About page: these are the people a buyer actually
          reaches, so they belong on the page they are reached from. Each card's WhatsApp and
          email button renders only when that field is filled in data/company.js, so a person
          with nothing on file yet shows their photo and role without any dead links. */}
      <section id="team" className="section-pad">
        <div className="container-page">
          <Reveal>
            <span className="eyebrow text-primary-darker">{lt('team.eyebrow', 'Our Team')}</span>
            <h3 className="mt-2 font-display text-xl font-semibold text-text">
              {lt('team.title', 'Talk to Our Sales Team Directly')}
            </h3>
          </Reveal>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {TEAM.map((l, i) => (
              <Reveal key={l.name} delay={Math.min(i, 3) * 0.05}>
                <article className="group flex h-full flex-col overflow-hidden rounded-card ring-1 ring-text/[0.08] transition-all duration-300 hover:-translate-y-1 hover:ring-text/[0.16]">
                  {/* Same photo-or-initials fallback the About rail used, so a missing
                      portrait leaves a branded tile rather than a hole in the grid. */}
                  {l.photo ? (
                    <Photo
                      src={l.photo}
                      alt={l.name}
                      /* A portrait tile, never full width: one column on a phone, then two,
                         three and four as the grid widens. Telling the browser that is what
                         stops it fetching a desktop rendition for a 360px screen. */
                      sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                      width={640}
                      className="aspect-[3/4] w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <span
                      aria-hidden
                      className="flex aspect-[3/4] w-full items-center justify-center bg-gradient-to-br from-navy-800 to-navy-950 font-display text-4xl font-bold tracking-[0.08em] text-primary-light"
                    >
                      {l.name.split(' ').map((n) => n[0]).join('')}
                    </span>
                  )}

                  <div className="flex flex-1 flex-col bg-navy-50 p-5">
                    <h4 className="font-display text-lg font-bold leading-snug text-text">{l.name}</h4>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-darker">
                      {lt(`team.${i}.role`, l.role)}
                    </p>
                    <p className="mt-3 text-body-compact leading-relaxed text-ink">
                      {lt(`team.${i}.bio`, l.bio)}
                    </p>

                    <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-4">
                      {waLink(l.whatsapp) && (
                        <a
                          href={waLink(l.whatsapp)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-text transition-opacity hover:opacity-70"
                          aria-label={lt('team.whatsappLabel', 'Message {name} on WhatsApp', { name: l.name })}
                        >
                          <WhatsAppColor className="h-5 w-5" />
                          {lt('team.whatsapp', 'WhatsApp')}
                        </a>
                      )}
                      {l.email && (
                        <a
                          href={`mailto:${l.email.trim()}`}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-text transition-opacity hover:opacity-70"
                          aria-label={lt('team.emailLabel', 'Email {name}', { name: l.name })}
                        >
                          <Mail className="h-5 w-5 text-navy-700" />
                          {lt('team.email', 'Email')}
                        </a>
                      )}
                      {l.linkedin && (
                        <a
                          href={l.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-text transition-opacity hover:opacity-70"
                          aria-label={lt('team.linkedinLabel', '{name} on LinkedIn', { name: l.name })}
                        >
                          <LinkedinColor className="h-5 w-5" />
                          {lt('team.linkedin', 'LinkedIn')}
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* MAP */}
      <section className="section-pad">
        <div className="container-page">
          <Reveal>
            <span className="eyebrow text-primary-darker">
              {lt('location.eyebrow', 'Our Location')}
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
              <span className="eyebrow text-primary-darker">{lt('ride.eyebrow', 'Book Your Ride')}</span>
              <h3 className="mt-2 font-display text-xl font-semibold text-text">
                {lt('ride.title', 'Get to KEAA International, Dehlon Road, Ludhiana, Punjab, India')}
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
              <span className="eyebrow text-primary-darker">{lt('social.eyebrow', 'Follow Us')}</span>
              <h3 className="mt-2 font-display text-xl font-semibold text-text">
                {lt('social.title', 'Find Us on Social Media')}
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

function Field({ label, id, type = 'text', required = false, className = '', placeholder = '', defaultValue = undefined }) {
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
        className="mt-1.5 w-full rounded-card border border-navy-100 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary"
      />
    </div>
  );
}
