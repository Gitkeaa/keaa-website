import PageHero from '../components/ui/PageHero';
import { company } from '../data/company';
import useSEO from '../hooks/useSEO';

/* The site's own domain, without the www., shown after each legal title in the hero
   accent ("Privacy Policy for keaainternational.com"). Read from company.js so it
   never drifts from the address used elsewhere. */
const WEBSITE = company.website.replace(/^www\./, '');

const content = {
  /*
   * This policy is written to the GDPR Art. 13 checklist because KEAA sells into the EU
   * through Runi Industries B.V. in Eindhoven, which makes that establishment the anchor
   * for EU visitors. It previously ran to four short paragraphs with no controller
   * identity, no legal basis, no retention period, no data-subject rights, no named
   * recipients, and — although the consent bar linked here as its only reference — nothing
   * whatsoever about cookies or local storage.
   *
   * Keep the "Cookies and Local Storage" section in sync with STORAGE keys and CATEGORIES
   * in src/components/CookieConsent.jsx; that is the section the banner points at.
   */
  privacy: {
    title: 'Privacy Policy',
    sections: [
      {
        h: 'Who We Are',
        p: `${company.name} (${company.manufacturing.line1}, ${company.manufacturing.line2}) is the controller of personal data collected through this website. For visitors in the European Union, our EU establishment is ${company.salesOffice.label.replace('Sales Office & Warehouse, ', '')}, ${company.salesOffice.line1}, ${company.salesOffice.line2}. You can reach us about any privacy matter at ${company.emails[0]}.`,
      },
      {
        h: 'Information We Collect',
        p: 'We collect information you provide directly to us, such as your name, company, email and phone number, when you submit an inquiry, request a quote, or apply for a role. If you use the AI assistant on this site, the messages you type are processed to generate a reply. We do not ask for, and ask that you do not send, confidential or special-category information through these channels.',
      },
      {
        h: 'How We Use Your Information, and On What Basis',
        p: 'Information submitted through our forms is used solely to respond to your inquiry, prepare quotations, and assess job applications. We rely on your consent where you have given it (for optional cookies and for marketing), on the steps necessary to enter into or perform a contract where you are requesting a quotation or placing an order, and on our legitimate interest in responding to business enquiries addressed to us.',
      },
      {
        h: 'Cookies and Local Storage',
        p: 'This site sets no advertising or tracking cookies, and runs no analytics tool. It stores four small items in your browser: your cookie choice, the language you select, the sales region you select, and, only if you dismiss it, a note that a promotional message has been shown. All four are strictly necessary or set only because you asked for them, and none are shared with anyone. Separately, our Contact page can embed a Google Map; that is optional external content, it is switched off unless you allow it, and allowing it shares your IP address with Google. You can change or withdraw your choice at any time using the Cookie Preferences link at the bottom of every page. Your choice is remembered for 180 days, after which we ask again.',
      },
      {
        h: 'Third Parties and International Transfers',
        p: 'We do not sell or rent your personal information. Data may be shared with our logistics and export partners strictly to fulfil an order you have requested. This website also relies on: Cloudinary, which hosts our product imagery and video; Google, which provides the Gemini model behind the AI assistant and the optional Contact-page map; and our own application backend, which receives form submissions. Fonts and stylesheets are served from our own servers, so no font provider receives your data. Where information is transferred outside the European Economic Area, including to India, where our manufacturing and export operations are based, we rely on appropriate safeguards such as the European Commission’s Standard Contractual Clauses.',
      },
      {
        h: 'How Long We Keep It',
        p: 'Enquiry and quotation records are retained for as long as needed to serve the commercial relationship and to meet our legal and tax obligations, and are then deleted. Job applications are retained for the duration of the recruitment process unless you ask us to keep them on file. Your cookie choice is stored for 180 days.',
      },
      {
        h: 'Your Rights',
        p: `If you are in the EU or UK you have the right to access, correct, erase, restrict or object to our processing of your personal data, the right to data portability, and the right to withdraw consent at any time without affecting processing already carried out. To exercise any of these, write to ${company.emails[0]}. You also have the right to complain to your supervisory authority, which for visitors in the Netherlands is the Autoriteit Persoonsgegevens.`,
      },
      {
        h: 'Contact',
        p: `For any privacy-related questions, please contact us at ${company.emails[0]}.`,
      },
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    sections: [
      {
        h: 'Use of Website',
        p: 'This website and its content are provided by KEAA International Pvt. Ltd. for general information about our products and services. By using this site, you agree to use it only for lawful purposes.',
      },
      {
        h: 'Product Specifications',
        p: 'All product specifications, dimensions and certifications are provided for reference. KEAA International reserves the right to update designs and specifications without prior notice in line with engineering improvements.',
      },
      {
        h: 'Quotations & Orders',
        p: 'All quotations are subject to confirmation and applicable terms of sale at the time of order. Lead times and pricing communicated through this website are indicative until formally confirmed.',
      },
      {
        h: 'Intellectual Property',
        p: 'All content, branding and product imagery on this website are the property of KEAA International Pvt. Ltd. / Runi Industries B.V. and may not be reproduced without permission.',
      },
    ],
  },
  /*
   * Cookie Policy. The facts here MUST stay in sync with the STORAGE keys and CATEGORIES in
   * src/components/CookieConsent.jsx AND with the "Cookies and Local Storage" section of the
   * privacy policy above — the same four items are described in all three places.
   */
  cookies: {
    title: 'Cookie Policy',
    sections: [
      {
        h: 'What This Policy Covers',
        p: 'This policy explains the cookies and browser storage this website uses. In short: we set no advertising or tracking cookies, we run no analytics tool, and nothing you do here is used to profile you. The few items we store are either strictly necessary for the site to work or are set only because you asked for them.',
      },
      {
        h: 'What We Store, and Why',
        p: 'We keep four small items in your browser: your cookie choice, the language you select, the sales region you select, and — only if you dismiss it — a note that a promotional message has already been shown. All four are strictly necessary or set at your request, none contain personal profiles, and none are shared with anyone.',
      },
      {
        h: 'Optional: Google Maps',
        p: 'Our Contact page can embed a Google Map. That is optional external content: it stays switched off unless you allow it, and allowing it shares your IP address with Google so the map can load. Everything else on the site talks only to our own servers and our image CDN.',
      },
      {
        h: 'Managing Your Preferences',
        p: 'You can change or withdraw your choice at any time using the Cookie Preferences link at the bottom of every page. Your choice is remembered for 180 days, after which we ask again. Clearing your browser storage also resets it.',
      },
      {
        h: 'Contact',
        p: `For any question about cookies or storage on this site, contact us at ${company.emails[0]}.`,
      },
    ],
  },
};

/** Per-type metadata — these two routes previously inherited the homepage's title. */
const seo = {
  privacy: {
    title: 'Privacy Policy',
    description:
      'How KEAA International collects, uses and protects the information you submit through our inquiry and quotation forms.',
  },
  terms: {
    title: 'Terms & Conditions',
    description:
      'Terms governing the use of the KEAA International website, product specifications, quotations and intellectual property.',
  },
  cookies: {
    title: 'Cookie Policy',
    description:
      'The cookies and browser storage KEAA International uses — all strictly necessary or set at your request, with no advertising or analytics tracking.',
  },
};

export default function Legal({ type }) {
  const data = content[type];
  useSEO({
    title: seo[type]?.title || 'Legal',
    description: seo[type]?.description,
    breadcrumbs: [{ label: 'Home', to: '/' }, { label: seo[type]?.title || 'Legal' }],
  });
  return (
    <>
      {/* The domain is folded into `title`, not passed as `accent`: accent renders in
          brand blue, and this heading is wanted all in one colour (black).
          Centred — safe here because the legal hero carries no image (see PageHero). */}
      <PageHero
        eyebrow="Legal"
        align="center"
        title={`${data.title} for ${WEBSITE}`}
        crumbs={[{ label: 'Home', to: '/' }, { label: data.title }]}
      />
      <section className="section-pad">
        <div className="container-page">
          {/* Two columns from lg up, not a single 768px reading column. `.body-copy` already
              caps each paragraph at ~768px, so a lone wide column would leave the same blank
              margins the narrow one did; splitting into columns fills the content tier instead.
              CSS columns (not a grid) so the sections balance by height and flow top-to-bottom
              down the first column before the second; break-inside-avoid keeps a section whole. */}
          <div className="gap-x-14 lg:columns-2">
            {data.sections.map((s) => (
              <div key={s.h} className="mb-8 break-inside-avoid">
                <h3 className="font-display text-lg font-semibold text-text">{s.h}</h3>
                {/* 16px (text-body-compact), not the 18px .body-copy: denser reading size for
                    the legal columns. Weight stays 400 and colour text-ink (#000), so it reads
                    as dark as the rest of the site — only the size steps down. */}
                <p className="mt-2 text-body-compact leading-relaxed text-ink">{s.p}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted">Last updated: June 2026.</p>
        </div>
      </section>
    </>
  );
}
