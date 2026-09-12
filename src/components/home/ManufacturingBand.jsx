import Button from '../ui/Button';
import Reveal from '../ui/Reveal';
import { PANEL_CARD } from '../ui/panelCard';
import { company } from '../../data/company';
import { useLT } from '../../i18n/LocaleContext';
import { cldImage } from '../../data/cloudinary';

/**
 * "Manufacturing Excellence" — the home page's production-capability band.
 *
 * The pitch and its proof points sit on the left, the four headline capabilities as a 2x2 on
 * the right, and the scale figures run along the bottom. It replaced a photograph-and-list
 * layout: the photo showed a machine shop but said nothing specific, whereas these cards name
 * the four processes KEAA actually runs in-house, which is the claim the section is making.
 *
 * EVERYTHING HERE IS DERIVED FROM company.js. That is deliberate and load-bearing — the
 * design this was built from carried "600+ Skilled Professionals" and "200+ Advanced
 * Machines", and neither is true: `company.stats` says 1000+ employees, and there is no
 * machine count anywhere in the data. Both would have been invented numbers on a
 * manufacturer's home page. The figures below read from the same source as the About page,
 * so the two can never disagree.
 *
 * Icon-free and single-accent by house rule. The design's gold rules under the eyebrow and
 * beside the section label are also omitted: short decorative dashes were removed from the
 * whole site, and re-adding them here would reopen exactly that.
 */

/**
 * The four processes to feature, named by their `company.machinery` entry so the copy stays
 * in sync with the Manufacturing page. `short` is the display name — the data uses the plant
 * name ("Automatic Powder Coating Plant") where a heading wants the process.
 */
const FEATURED = [
  { key: 'Sheet Laser Cutting', short: 'Laser Cutting', image: 'Sheet_laser_Cutting_oa7ib6' },
  { key: 'Robotic Welding Stations', short: 'Robotic Welding', image: 'Robotic_Welding_Stations_vnvqos' },
  { key: 'Hot Dip Galvanizing Plant', short: 'Hot-Dip Galvanizing', image: 'Hot_Dip_Galvanizing_Plant_ze1vep' },
  { key: 'Automatic Powder Coating Plant', short: 'Powder Coating', image: 'Automatic_Powder_Coating_Plant_guv3pr' },
];

const CAPABILITIES = FEATURED.map((f) => {
  const entry = company.machinery.find((m) => m.name === f.key);
  return entry ? { ...f, title: f.short, desc: entry.desc } : null;
}).filter(Boolean);

/** Pull a headline figure out of `company.stats` by its label, so nothing is retyped here. */
const statValue = (label) => company.stats.find((s) => s.label === label)?.value;

const SCALE = [
  /* `facilities.area` already carries its unit ("25,000 sq. m."), so it is printed whole. */
  { value: company.facilities.area, label: 'Manufacturing Area' },
  { value: company.facilities.capacity, label: 'Annual Capacity' },
  /* The argument to statValue() is a LOOKUP KEY into company.stats, not display text — it has
     to stay 'Skilled Employees' or the figure comes back undefined and the cell is filtered
     out. `label` is the caption; the value ("1000+") already prints above it. */
  { value: statValue('Skilled Employees'), label: 'Skilled Workforce' },
  { value: statValue('Countries Exported'), label: 'Countries Served' },
].filter((s) => s.value);

const PROOF = [
  'State-of-the-art facilities over 100,000+ sq. m.',
  'Advanced machinery & technology at global standards',
  'Strict in-house quality control at every stage',
  'Large production capacity to meet global demand',
];

export default function ManufacturingBand() {
  const lt = useLT('home');
  return (
    <section className="section-pad">
      <div className="container-page">
        {/* One PANEL_CARD around the whole band, so this section's content sits on the same
            inset as every other carded band on the page. Without it the eyebrow started at the
            container edge (58px) while the card above it inset its content to 106px, so the two
            read as misaligned down the left. */}
        <div className={PANEL_CARD}>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          {/* ------------------------------------------------------------------ PITCH */}
          <Reveal>
            <span className="eyebrow text-primary-darker">{lt('mfg.eyebrow', 'Manufacturing Excellence')}</span>
            <h2 className="mt-3 font-display text-3xl font-bold leading-[1.08] tracking-[-0.02em] text-text sm:text-4xl">
              {lt('mfg.title', 'Advanced Manufacturing, Strong Production Capability')}
            </h2>
            <p className="body-copy mt-5 max-w-xl">
              {lt('mfg.body', 'Five integrated units in Ludhiana (laser cutting, robotic welding, in-house hot-dip galvanizing and powder coating) engineered for precision, consistency and scale on every order.')}
            </p>

            {/* The rule is the LIST's own left edge, one continuous line down the group,
                rather than a dash per row — it groups the four claims into one block. */}
            <ul className="mt-7 space-y-3.5 border-l-2 border-primary/40 pl-5 text-sm text-text">
              {PROOF.map((text, i) => (
                <li key={text}>{lt(`mfg.proof.${i}`, text)}</li>
              ))}
            </ul>

            <Button to="/manufacturing" variant="navy" size="sm" className="mt-8">
              {lt('mfg.cta', 'View Manufacturing')}
            </Button>
          </Reveal>

          {/* ----------------------------------------------------------- CAPABILITIES */}
          <Reveal delay={0.1}>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-text">
              {lt('mfg.strength', 'Our Manufacturing Strength')}
            </h3>
            {/* Soft navy-50 fill, no border. The tiles sit inside the white PANEL_CARD now,
                and a bordered white tile on a white panel is the card-in-card the rest of the
                site avoids — the border would be the only thing showing, stacked inside the
                panel's own ring. A tint reads as a distinct tile without a second border, and
                echoes the scale strip below. */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {CAPABILITIES.map((c, i) => (
                <div key={c.title} className="rounded-card bg-navy-50 overflow-hidden">
                  {c.image && (
                    <img
                      src={cldImage(c.image, { w: 400, h: 300, crop: 'fill' })}
                      alt={c.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-5">
                    <h4 className="font-display text-base font-semibold text-text">{lt(`mfg.cap.${i}.title`, c.title)}</h4>
                    <p className="mt-2 text-body-compact text-text-muted">{lt(`mfg.cap.${i}.desc`, c.desc)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* ----------------------------------------------------------------- SCALE */}
        <Reveal delay={0.15}>
          <div className="mt-10 rounded-card bg-navy-50 p-6 sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-center lg:gap-10">
              <p className="font-display text-base font-bold leading-snug text-text">
                {lt('mfg.scale.lead1', 'Built for scale.')}
                <span className="block">{lt('mfg.scale.lead2', 'Delivered with consistency.')}</span>
              </p>
              <ul className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
                {SCALE.map((s, i) => (
                  <li
                    key={s.label}
                    /* Hairlines BETWEEN the figures only, and only once they sit on one
                       row — a divider on the first cell of a wrapped grid reads as a
                       stray mark. */
                    className={i > 0 ? 'sm:border-l sm:border-border sm:pl-6' : ''}
                  >
                    <div className="font-display text-xl font-bold leading-none text-text">
                      {s.value}
                    </div>
                    <div className="mt-1.5 text-xs text-text-muted">{lt(`mfg.scale.${i}.label`, s.label)}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
        </div>
      </div>
    </section>
  );
}
