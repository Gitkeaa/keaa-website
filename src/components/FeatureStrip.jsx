import { motion, useReducedMotion } from 'framer-motion';
import BrandTexture from './ui/BrandTexture';
import useSplashDone from '../hooks/useSplash';

/**
 * A row of supporting promises -- Products' perks, Contact's help strip -- rendered as a
 * white card on the brand texture rather than as a full-bleed navy block.
 *
 * Two navy strips were the last dark bands outside the footer. They now read as the same
 * object as the closing CTA: same card, same ring, same icon chip, same backdrop.
 *
 * `lead` turns the row into a two-column band with a heading on the left. Without it the
 * items share the card evenly.
 *
 * The lead track is a fixed 22rem rather than `1fr`: against an `auto` item track the
 * three items claim their full content width and squeeze the heading into a two-word
 * ribbon.
 */

const EASE = [0.22, 1, 0.36, 1];

export default function FeatureStrip({ items, lead, photo = true, className = '' }) {
  const reduce = useReducedMotion();
  const splashDone = useSplashDone();

  return (
    <section className={`relative isolate overflow-hidden bg-surface py-10 sm:py-12 ${className}`}>
      <BrandTexture photo={photo} />

      {/* Wide tier (2040), shared with CtaBand so the two cards line up. */}
      <div className="container-wide relative z-10">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={splashDone ? { opacity: 1, y: 0 } : undefined}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: EASE }}
          className={`gap-8 rounded-2xl bg-surface-raised p-6 shadow-[0_1px_2px_-1px_rgb(var(--color-text)_/_0.08),0_28px_64px_-34px_rgb(var(--color-text)_/_0.35)] ring-1 ring-border sm:rounded-3xl sm:p-7 ${
            lead ? 'grid lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-center' : 'block'
          }`}
        >
          {lead && (
            <div className="lg:pr-10">
              <h3 className="font-display text-xl font-bold leading-tight tracking-[-0.01em] text-text sm:text-[1.375rem]">
                {lead.title} {lead.accent && <span className="text-primary-dark">{lead.accent}</span>}
              </h3>
              {lead.desc && <p className="mt-2 text-[13px] leading-relaxed text-text-muted">{lead.desc}</p>}
            </div>
          )}

          <ul
            className={`grid gap-6 sm:grid-cols-3 ${
              lead ? 'border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0' : ''
            }`}
          >
            {items.map(({ icon: Icon, title, desc }) => (
              <li key={title} className="flex items-start gap-3.5">
                <span
                  aria-hidden
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ring-1 ring-border"
                  style={{
                    background:
                      'linear-gradient(150deg, rgb(var(--color-primary-light) / 0.18), rgb(var(--color-primary) / 0.06))',
                  }}
                >
                  <Icon className="h-5 w-5 text-primary-dark" strokeWidth={1.6} />
                </span>
                <div className="min-w-0">
                  <h4 className="font-display text-sm font-semibold text-text">{title}</h4>
                  <p className="mt-1 text-[13px] leading-relaxed text-text-muted">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
