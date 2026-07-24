/**
 * Frequently asked questions, grouped by the stage of the buying journey they belong to.
 *
 * TWO RULES WERE FOLLOWED WRITING THESE, AND BOTH MATTER:
 *
 * 1. Every factual answer is drawn from something already true in this codebase —
 *    `company` (certifications, facilities, offices, capacity), `categories.json` (the
 *    product lines) and the export-market list. Nothing here asserts a capability the rest
 *    of the site does not.
 *
 * 2. NO COMMERCIAL TERMS ARE STATED. Minimum order quantity, prices, payment terms, lead
 *    times and warranty periods are real commitments that vary per order, and none of them
 *    exist anywhere in this repo — inventing a number here would put a promise on a public
 *    page that nobody at KEAA agreed to. Those questions are answered honestly ("it depends,
 *    ask us") and point at the quotation form.
 *
 * `needsRealAnswer: true` marks the questions where a real figure would serve the customer
 * better than a redirect. It is an authoring note, not something the UI reads. Fill those in
 * with the commercial team, then delete the flag.
 */
import { company } from './company';

export const faqs = [
  {
    group: 'Products & Manufacturing',
    items: [
      {
        q: 'What does KEAA manufacture?',
        a: 'We manufacture and export scaffolding systems, formwork accessories, safety products, livestock housing solutions and garden hardware. Everything is produced in our own facilities in Ludhiana, India: we are a manufacturer, not a trading house.',
      },
      {
        q: 'Do you manufacture in-house, or outsource?',
        a: `All core production is in-house across ${company.facilities.area} of manufacturing. That includes laser cutting, CNC forming, robotic and certified manual welding, ${company.facilities.galvanizingBaths.toLowerCase()}, and an automatic powder coating line, so quality and lead time stay under our control rather than a subcontractor's.`,
      },
      {
        q: 'What finishes are available?',
        a: 'Hot dip galvanizing to DIN EN 1461 is the standard finish for scaffolding and structural components. Powder coating, electro-galvanizing and painted finishes are available depending on the product and the environment it will work in.',
      },
      {
        q: 'Can you manufacture to our own drawings or specification?',
        a: 'Yes. We regularly produce to customer drawings and offer OEM and private-label manufacturing. Our tool room and mould development capability means new components can be tooled in-house. Send your drawings with a quotation request and our engineering team will confirm feasibility.',
      },
    ],
  },
  {
    group: 'Quality & Compliance',
    items: [
      {
        q: 'What certifications do you hold?',
        a: `We are certified to ${company.certifications
          .map((c) => c.name)
          .join(', ')}. Copies of every certificate are available on our Certifications page.`,
      },
      {
        q: 'Do your products meet European standards?',
        a: `Yes. Our welders are certified to EN 1090-2 / 3834-2 through SLV Germany, and our props (EN 1065 Class BD) and couplers (EN 74-1 B/BB) carry the Ü-mark accredited by Sigma Karlsruhe, Germany. Nailing plates hold an ETA from Denmark.`,
      },
      {
        q: 'How is quality controlled during production?',
        a: 'Quality control runs at every stage, not just at the end: raw material inspection on arrival, in-process checks during production, and final testing before dispatch. We run our own tensile, compression, bend and weld-penetration testing in-house, plus third-party inspection where a project calls for it.',
      },
    ],
  },
  {
    group: 'Ordering & Export',
    items: [
      {
        q: 'Which countries do you export to?',
        a: 'We export to 42+ countries across the Middle East, Europe, Africa, Asia and the Americas. European customers are served through our sales office and warehouse in Eindhoven, the Netherlands; every other market is handled directly from our head office in India.',
        // Not a commercial commitment — just where we already ship.
      },
      {
        q: 'What is your minimum order quantity?',
        a: 'It depends on the product and the finish: a standard catalogue item and a custom-tooled component have very different economics. Send us your requirement through the quotation form and we will confirm the minimum for those exact items.',
        needsRealAnswer: true,
      },
      {
        q: 'What are your lead times?',
        a: 'Lead time depends on the quantity, the finish and current production load. We will confirm a firm date with your quotation rather than quote a general figure we might not hold to.',
        needsRealAnswer: true,
      },
      {
        q: 'Do you help with export documentation and shipping?',
        a: 'Yes. We handle export packaging and documentation as standard, and can advise on shipping options and country-specific requirements for your market. KEAA holds an AEO certificate from the Government of India and Star Export House status from the Ministry of Commerce.',
      },
      {
        q: 'How do I request a quotation?',
        a: 'Use the Request a Quote form and include the product or item codes, quantity, required finish and destination port. The more of that you can give us, the closer the first quotation will be. Our team responds within one business day.',
      },
      {
        q: 'Can I get samples before placing an order?',
        a: 'Samples can usually be arranged for catalogue items. Mention it in your quotation request along with the items you want to evaluate, and we will confirm what is possible and on what terms.',
        needsRealAnswer: true,
      },
    ],
  },
  {
    group: 'Working With Us',
    items: [
      {
        q: 'Who do I contact for my region?',
        a: 'Europe is served from our sales office in Eindhoven, the Netherlands. All other regions are served from our head office in Ludhiana, India. Use the region selector in the site header to see the right contact details for your market.',
      },
      {
        q: 'Do you supply to distributors and resellers?',
        a: 'Yes, distributors, wholesalers, importers, contractors and project developers all form part of our customer base, and we offer OEM and private-label options for partners building their own range.',
      },
      {
        q: 'Where can I download your catalogues?',
        a: 'Our Downloads Center holds the full product catalogues: scaffolding and formworks, livestock housing solutions, and wood connectors and garden hardware. For a datasheet, certificate or any document not published there, contact our team and we will send it across.',
      },
    ],
  },
];

/** Flat list, for the FAQPage structured data. */
export const allFaqs = faqs.flatMap((g) => g.items);
