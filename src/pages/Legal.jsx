import PageHero from '../components/ui/PageHero';
import { company } from '../data/company';

const content = {
  privacy: {
    title: 'Privacy Policy',
    sections: [
      {
        h: 'Information We Collect',
        p: 'We collect information you provide directly to us — such as your name, company, email and phone number — when you submit an inquiry, request a quote, or subscribe to our newsletter.',
      },
      {
        h: 'How We Use Your Information',
        p: 'Information submitted through our forms is used solely to respond to your inquiry, process quotation requests, and — where you have opted in — to send relevant product and company updates.',
      },
      {
        h: 'Data Sharing',
        p: 'We do not sell or rent your personal information. Data may be shared with our logistics and export partners strictly to fulfil an order you have requested.',
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
};

export default function Legal({ type }) {
  const data = content[type];
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title={data.title}
        crumbs={[{ label: 'Home', to: '/' }, { label: data.title }]}
      />
      <section className="section-pad">
        <div className="container-page max-w-3xl space-y-8">
          {data.sections.map((s) => (
            <div key={s.h}>
              <h3 className="font-display text-lg font-semibold text-navy-800">{s.h}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">{s.p}</p>
            </div>
          ))}
          <p className="text-xs text-ink/40">Last updated: June 2026.</p>
        </div>
      </section>
    </>
  );
}
