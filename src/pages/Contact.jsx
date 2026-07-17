import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, ArrowRight, Zap, Headset, Globe2, Linkedin, Facebook, Instagram, Youtube, MessageCircle, ChevronDown } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import FeatureStrip from '../components/FeatureStrip';
import Button from '../components/ui/Button';
import CountrySelect from '../components/ui/CountrySelect';
import PhoneField from '../components/ui/PhoneField';
import EmailField from '../components/ui/EmailField';
import WordLimitTextarea from '../components/ui/WordLimitTextarea';
import ImagePlaceholder from '../components/ui/ImagePlaceholder';
import Reveal from '../components/ui/Reveal';
import { company } from '../data/company';
import { defaultCountry } from '../data/countriesData';
import { img } from '../data/images';
import { submitPublicForm } from '../data/adminApi';
import useSEO from '../hooks/useSEO';

const helpStrip = [
  { icon: Zap, title: 'Quick Response', desc: 'We respond within 24 hours' },
  { icon: Headset, title: 'Expert Support', desc: 'Get professional advice from our experts' },
  { icon: Globe2, title: 'Global Delivery', desc: 'We deliver worldwide with reliability' },
];

const socials = [
  { icon: Linkedin, name: 'LinkedIn', href: company.social.linkedin, desc: 'Company updates, industry news and hiring announcements.' },
  { icon: Facebook, name: 'Facebook', href: company.social.facebook, desc: 'Behind-the-scenes factory moments and product highlights.' },
  { icon: Instagram, name: 'Instagram', href: company.social.instagram, desc: 'Visual stories from our manufacturing floor and project sites.' },
  { icon: Youtube, name: 'YouTube', href: company.social.youtube, desc: 'Factory tours, product demos and installation guides.' },
  { icon: MessageCircle, name: 'WhatsApp', href: company.social.whatsapp, desc: 'Quick, direct support for inquiries and order updates.' },
];

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
        subject: val('subject'),
        // The ContactMessage entity holds one message body; fold the extra context in
        // so nothing the visitor typed is lost.
        message: `${message}\n\n— Company: ${val('company') || '—'} · Phone: ${country?.dial || ''} ${phone || '—'} · Country: ${country?.name || '—'}`,
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
      <PageHero
        eyebrow="Contact Us"
        title="Let's Build Stronger"
        accent="Together."
        desc="Get in touch with our team for inquiries, quotes or partnership opportunities."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Contact Us' }]}
        image={img.scaffoldOnBuilding}
      />

      <section className="section-pad">
        <div className="container-page grid gap-10 lg:grid-cols-[340px_1fr]">
          {/* GET IN TOUCH */}
          <Reveal className="space-y-5">
            <span className="eyebrow text-primary-darker">
              Get in Touch
            </span>
            <div className="rounded-2xl border border-black p-6 shadow-card">
              <div className="flex gap-3">
                <MapPin className="h-5 w-5 flex-shrink-0 text-primary-dark" />
                <div>
                  <h4 className="font-display text-sm font-semibold text-navy-800">
                    {company.manufacturing.label}
                  </h4>
                  <p className="mt-1 text-sm text-ink/60">
                    {company.manufacturing.line1}
                    <br />
                    {company.manufacturing.line2}
                  </p>
                </div>
              </div>
              <div className="mt-5 flex gap-3">
                <Phone className="h-5 w-5 flex-shrink-0 text-primary-dark" />
                <div>
                  <h4 className="font-display text-sm font-semibold text-navy-800">Phone</h4>
                  {company.phones.map((p) => (
                    <p key={p} className="text-sm text-ink/60">
                      <a href={`tel:${p}`} className="hover:text-navy-700">
                        {p}
                      </a>
                    </p>
                  ))}
                  {landlineNumbers.map((line) => (
                    <p key={line} className="text-sm text-ink/60">
                      <a href={`tel:${line.replace(/[^\d+]/g, '')}`} className="hover:text-navy-700">
                        Tel: {line}
                      </a>
                    </p>
                  ))}
                  <p className="text-sm text-ink/60">Fax: {company.fax}</p>
                </div>
              </div>
              <div className="mt-5 flex gap-3">
                <Mail className="h-5 w-5 flex-shrink-0 text-primary-dark" />
                <div>
                  <h4 className="font-display text-sm font-semibold text-navy-800">Email</h4>
                  {company.emails.map((e) => (
                    <p key={e} className="text-sm text-ink/60 break-all">
                      <a href={`mailto:${e}`} className="hover:text-navy-700">
                        {e}
                      </a>
                    </p>
                  ))}
                </div>
              </div>
              <div className="mt-5 flex gap-3">
                <Clock className="h-5 w-5 flex-shrink-0 text-primary-dark" />
                <div>
                  <h4 className="font-display text-sm font-semibold text-navy-800">Business Hours</h4>
                  <p className="text-sm text-ink/60">Monday – Saturday</p>
                  <p className="text-sm text-ink/60">9:00 AM – 6:00 PM (IST)</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-navy-100 bg-navy-50 p-6">
              <h4 className="font-display text-sm font-semibold text-navy-800">
                {company.salesOffice.label}
              </h4>
              <p className="mt-1 text-sm text-ink/60">
                {company.salesOffice.line1}, {company.salesOffice.line2}
              </p>
              <p className="mt-2 text-sm text-ink/60">{company.salesOffice.phone}</p>
              <p className="text-sm text-ink/60">{company.salesOffice.email}</p>
            </div>
          </Reveal>

          {/* FORM */}
          <Reveal delay={0.1} className="relative rounded-2xl border border-black p-7 shadow-card">
            <div className="flex items-center gap-3.5">
              <motion.button
                type="button"
                onClick={() => setShowConsult((v) => !v)}
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                aria-expanded={showConsult}
                aria-label="Toggle consultation details"
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary-dark text-white shadow-lg shadow-primary/30 transition-transform hover:scale-105"
              >
                <Headset className="h-6 w-6" />
              </motion.button>
              <div>
                <h3 className="font-display text-xl font-bold text-navy-800">Send Us a Message</h3>
                <button
                  type="button"
                  onClick={() => setShowConsult((v) => !v)}
                  aria-expanded={showConsult}
                  className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-primary-darker transition-colors hover:text-primary-deep"
                >
                  Request a Consultation
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-300 ${showConsult ? 'rotate-180' : ''}`}
                  />
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
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="mt-4 rounded-xl border border-primary/20 bg-primary/[0.05] p-4 text-sm leading-relaxed text-ink/70">
                    Planning your next construction or industrial project? Tell us about your
                    requirements, and our specialists will recommend the right products, pricing, and
                    manufacturing solutions tailored to your business. From initial inquiry to final
                    delivery, we&rsquo;re committed to supporting your success.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {submitted ? (
              <div className="mt-8 rounded-xl bg-navy-50 p-8 text-center">
                <p className="font-display text-lg font-semibold text-navy-800">Message Sent</p>
                <p className="mt-2 text-sm text-ink/60">
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
                <WordLimitTextarea
                  className="sm:col-span-2"
                  id="message"
                  label="Message"
                  value={message}
                  onChange={setMessage}
                  required
                  maxWords={250}
                  placeholder="Tell us how we can help — product, quantity, timeline, destination…"
                />
                <div className="sm:col-span-2">
                  {sendError && (
                    <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                      {sendError}
                    </p>
                  )}
                  <Button type="submit" icon={Send} disabled={sending}>
                    {sending ? 'Sending…' : 'Send Message'}
                  </Button>
                </div>
              </form>
            )}
          </Reveal>
        </div>
      </section>

      {/* REQUEST A QUOTE STRIP */}
      <section className="overflow-hidden">
        <div className="container-page grid items-center gap-8 py-12 lg:grid-cols-[1fr_300px]">
          <Reveal>
            <span className="eyebrow text-primary-darker">
              Request a Quote
            </span>
            <h3 className="mt-2 font-display text-xl font-semibold text-navy-800">
              Share your requirements and our team will get back to you with the best solution.
            </h3>
            <Button to="/rfq" icon={ArrowRight} className="mt-5">
              Request a Quote
            </Button>
          </Reveal>
          <Reveal delay={0.1}>
            <ImagePlaceholder src={img.scaffoldFrame} label="Scaffolding & formwork product range" ratio="aspect-[4/3]" />
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
            <h3 className="mt-2 font-display text-xl font-semibold text-navy-800">
              {company.manufacturing.line1}, {company.manufacturing.line2}
            </h3>
          </Reveal>
          <Reveal delay={0.1} className="mt-5 overflow-hidden rounded-xl border border-black shadow-card">
            <iframe
              title="KEAA International location map"
              src={mapEmbedSrc}
              className="aspect-[16/6] w-full"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Reveal>
        </div>
      </section>
      {/* BOOK YOUR RIDE */}
      <section className="section-pad">
        <div className="container-page">
          <Reveal>
            <span className="eyebrow text-primary-darker">
              Book Your Ride
            </span>
            <h3 className="mt-2 font-display text-xl font-semibold text-navy-800">
              Get to KEAA International — Dehlon Road, Ludhiana, Pujab-India
            </h3>
            <p className="mt-1 text-sm text-ink/55">
              Click any app below — destination is pre-filled with our factory location.
            </p>
          </Reveal>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href={rideLinks.uber}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-black bg-white px-6 py-4 shadow-card transition-all hover:-translate-y-1 hover:shadow-cardHover"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white font-bold text-lg">U</span>
              <div>
                <p className="font-display text-sm font-semibold text-navy-800">Uber</p>
                <p className="text-xs text-ink/50">Ride to KEAA</p>
              </div>
            </a>

            <a
              href={rideLinks.ola}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-black bg-white px-6 py-4 shadow-card transition-all hover:-translate-y-1 hover:shadow-cardHover"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3CB371] text-white font-bold text-lg">O</span>
              <div>
                <p className="font-display text-sm font-semibold text-navy-800">Ola</p>
                <p className="text-xs text-ink/50">Cab to KEAA</p>
              </div>
            </a>

            <a
              href={rideLinks.rapido}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-black bg-white px-6 py-4 shadow-card transition-all hover:-translate-y-1 hover:shadow-cardHover"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFCC00] text-black font-bold text-lg">R</span>
              <div>
                <p className="font-display text-sm font-semibold text-navy-800">Rapido</p>
                <p className="text-xs text-ink/50">Bike to KEAA</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* FIND US ON SOCIAL MEDIA */}
      <section className="section-pad">
        <div className="container-page">
          <Reveal>
            <span className="eyebrow text-primary-darker">
              Follow Us
            </span>
            <h3 className="mt-2 font-display text-xl font-semibold text-navy-800">Find Us on Social Media</h3>
          </Reveal>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {socials.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target={s.href !== '#' ? '_blank' : undefined}
                rel={s.href !== '#' ? 'noopener noreferrer' : undefined}
                className="group flex flex-col items-center rounded-xl border border-black p-6 text-center shadow-card transition-all hover:-translate-y-1 hover:shadow-cardHover"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-50 text-navy-700 transition-colors group-hover:bg-navy-700 group-hover:text-white">
                  <s.icon className="h-5 w-5" />
                </span>
                <h4 className="mt-4 font-display text-sm font-semibold text-navy-800">{s.name}</h4>
                <p className="mt-1.5 text-xs text-ink/60">{s.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* HELP STRIP. Last section before the footer, so it keeps the photograph.
          Entities like `&rsquo;` only decode in JSX text, not in a string prop. */}
      <FeatureStrip
        lead={{ title: 'We’re Here', accent: 'to Help You.', desc: 'Reach out to us today!' }}
        items={helpStrip}
      />
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
        className="mt-1.5 w-full rounded-md border border-navy-100 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary"
      />
    </div>
  );
}
