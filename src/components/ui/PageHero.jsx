import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';

export default function PageHero({ eyebrow, title, accent, desc, crumbs = [], stats = [], image }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, 90]);

  return (
    <section
      ref={ref}
      className={`relative flex min-h-[420px] items-center overflow-hidden text-white sm:min-h-[480px] lg:min-h-[540px] ${
        image ? 'bg-navy-950' : 'bg-diagonal-steel'
      }`}
    >
      {image ? (
        <>
          <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ y: parallaxY }}
            className="absolute inset-0"
          >
            <img src={image} alt="" className="h-[120%] w-full object-cover" />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-950/80 to-navy-950/45" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-transparent to-navy-950/20" />
        </>
      ) : (
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold-500/10 blur-3xl" />
      )}
      <div className="absolute inset-0 bg-spec-grid bg-[size:38px_38px] opacity-[0.15]" />

      <div className="container-page relative w-full max-w-full py-16 sm:py-20 lg:py-24">
        {crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-xs text-white/60">
            {crumbs.map((c, i) => (
              <span key={c.label} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="h-3 w-3" />}
                {c.to ? (
                  <Link to={c.to} className="hover:text-white">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-white/90" aria-current="page">
                    {c.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        )}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {eyebrow && <span className="eyebrow text-gold-400">{eyebrow}</span>}
          <h1 className="mt-3 max-w-2xl font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.1]">
            {title} {accent && <span className="text-gold-400">{accent}</span>}
          </h1>
          {desc && <p className="mt-4 max-w-xl text-white/70 text-base sm:text-lg leading-relaxed">{desc}</p>}
        </motion.div>

        {stats.length > 0 && (
          <div className="mt-9 flex flex-wrap gap-x-10 gap-y-5 border-t border-white/15 pt-7">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="font-display text-2xl font-bold text-gold-400">
                  <AnimatedCounter value={s.value} />
                </div>
                <div className="text-xs text-white/60">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
