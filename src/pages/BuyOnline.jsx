import { ExternalLink, ShoppingCart } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import SectionHeading from '../components/ui/SectionHeading';
import Button from '../components/ui/Button';
import { marketplaces } from '../data/content';
import { img } from '../data/images';
import useSEO from '../hooks/useSEO';

export default function BuyOnline() {
  useSEO({
    title: 'Buy Online',
    description:
      'Purchase KEAA International products through trusted global marketplaces including IndiaMART, TradeIndia and Amazon.',
  });

  return (
    <>
      <PageHero
        eyebrow="Buy Online"
        title="Purchase Through"
        accent="Trusted Marketplaces."
        desc="Find KEAA International products on the global B2B and e-commerce marketplaces you already trust."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Buy Online' }]}
      image={img.cargoContainers}
      />

      <section className="section-pad">
        <div className="container-page">
          <SectionHeading eyebrow="Available On" title="Shop KEAA Products Online" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {marketplaces.map((m) => (
              <div key={m.name} className="flex flex-col rounded-xl border border-navy-100 p-6 shadow-card">
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
                  <ShoppingCart className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-base font-semibold text-navy-800">{m.name}</h3>
                <p className="mt-1.5 flex-1 text-sm text-ink/60">{m.desc}</p>
                <Button variant="outlineNavy" size="sm" icon={ExternalLink} className="mt-4 self-start">
                  Visit Marketplace
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy-900">
        <div className="container-page flex flex-col items-center justify-between gap-6 py-12 sm:flex-row">
          <div>
            <h3 className="font-display text-2xl font-bold text-white">Prefer to Order Directly?</h3>
            <p className="mt-1 text-white/60">Reach out for bulk pricing, OEM manufacturing or export inquiries.</p>
          </div>
          <Button to="/rfq" className="flex-shrink-0">
            Request a Quote
          </Button>
        </div>
      </section>
    </>
  );
}
