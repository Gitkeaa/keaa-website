import { motion, useReducedMotion } from 'framer-motion';
import Button from './ui/Button';
import BrandTexture from './ui/BrandTexture';
import { company } from '../data/company';

/**
 * The closing call-to-action, sitting between the last page section and the footer.
 *
 * Every page used to close on its own full-bleed navy block. They now all render this
 * card and pass their own copy, so the whole site closes the same way. Two rules carried
 * over from the hero and footer:
 *
 *   - `primary` (#3A86C6) is an accent only. As text on white it measures 3.89:1 and
 *     fails AA, so every blue word here is `primary-dark` (4.87:1) and `primary` is left
 *     to the rules and rings.
 *   - The background artwork stays a texture. The photograph is held at 14% behind a
 *     left-to-right wash of the page colour, so nothing competes with the card.
 */

const PROMISES = [
  { title: 'Quick\nResponse' },
  { title: 'Expert\nSupport' },
  { title: 'Best\nSolutions' },
];

const EASE = [0.22, 1, 0.36, 1];

export default function CtaBand({
  title = 'Looking for Reliable',
  accent = 'Scaffolding & Formwork Solutions?',
  desc = 'Get in touch with our team for the best solutions for your project.',
  note,
  cta = { label: 'Request a Quote', to: '/rfq' },
  showPhone = true,
}) {
  const reduce = useReducedMotion();
  const phone = company.phones[0];

  return (
    <section className="relative isolate overflow-hidden bg-surface pb-5 pt-10 sm:pt-12">
      <BrandTexture />
      {/* Wide tier (2040): the closing CTA sits wider than the centred content column, as
          an accent band should, and shares the tier with FeatureStrip so they line up. */}
      <div className="container-wide relative z-10">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: EASE }}
          className="flex flex-col gap-6 rounded-card bg-surface-raised p-5 shadow-[0_1px_2px_-1px_rgb(var(--color-text)_/_0.08),0_28px_64px_-34px_rgb(var(--color-text)_/_0.35)] ring-1 ring-border sm:p-6 lg:flex-row lg:items-stretch lg:gap-0 lg:p-7"
        >
          {/* Pitch */}
          <div className="flex items-center gap-5 lg:w-[36%] lg:pr-8">
            <div className="min-w-0">
              <h2 className="font-display text-xl font-bold leading-tight tracking-[-0.01em] sm:text-[1.375rem]">
                <span className="block text-text">{title}</span>
                {accent && <span className="block text-primary-dark">{accent}</span>}
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed text-text-muted">{desc}</p>
              {note && (
                <p className="mt-2 font-display text-[13px] font-semibold text-primary-dark">{note}</p>
              )}
            </div>
          </div>

          {/* Promises. Each sits on its own tinted tile rather than being separated by a
              `divide-x` rule: the tile already groups the two words, so a rule between them
              would be a second separator doing the same job. `navy-50` is the faintest tint
              on the palette — every `surface-*` token is pure white, so a tile has to reach
              for the navy ramp to register at all. `lg:pl-8` matches the action column on
              the other side, so the tiles clear the divider by the same gap. */}
          <ul className="grid flex-1 grid-cols-3 gap-2 border-t border-border pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            {PROMISES.map(({ title }) => (
              <li
                key={title}
                className="flex flex-col items-center justify-center rounded-card bg-navy-50 px-2 py-4 text-center"
              >
                <span className="whitespace-pre-line text-[13px] font-semibold leading-snug text-text">
                  {title}
                </span>
              </li>
            ))}
          </ul>

          {/* Action. `to` and `href` are mutually exclusive on Button; pass through whichever
              the page gave so a mailto CTA works as well as a route. */}
          <div className="flex flex-col justify-center gap-2 border-t border-border pt-5 lg:w-[25%] lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <Button
              to={cta.to}
              href={cta.href}
              size="lg"
              className="w-full justify-center"
            >
              {cta.label}
            </Button>
            {showPhone && (
              <p className="text-center text-[13px] text-text-muted">
                or Call Us:{' '}
                <a
                  href={`tel:${phone.replace(/\s/g, '')}`}
                  className="font-semibold text-primary-dark transition-colors hover:text-primary-darker"
                >
                  {phone}
                </a>
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
