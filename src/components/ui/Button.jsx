import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * KEAA button system.
 *
 * Palette note, because it is not obvious and it drove the colour choices below.
 * The brand blue is #3A86C6. Measured against WCAG AA:
 *
 *   white on #3A86C6 ................ 3.89:1   fails (needs 4.5:1)
 *   #3A86C6 on white ............... 3.89:1   fails
 *   white on #2F74B8 ................ 4.87:1   passes
 *   #2F74B8 on white ............... 4.87:1   passes
 *   #3A86C6 on deep navy #071426 ... 4.75:1   passes
 *
 * So #3A86C6 is a fine *accent* — borders, rings, icon strokes, footer links on navy —
 * but it cannot carry white label text, and it cannot be label text on a white card.
 * Anywhere text sits on or in the brand blue, the surface steps one shade darker.
 * Change SURFACE back to #3A86C6 and every primary CTA on the site drops below AA.
 */
const EASE = [0.22, 1, 0.36, 1];

/**
 * These class strings must stay literal. Tailwind scans the source as plain text, so a
 * class assembled from a variable — `bg-[${SURFACE}]` — is never generated and the
 * button silently renders with no background.
 *
 *   #3A86C6 brand accent (borders/rings)   #2F74B8 blue that carries white text
 *   #27639F pressed/hover blue             #071426 deep navy
 */
const variants = {
  primary: `text-white bg-primary-dark hover:bg-primary-darker
    shadow-[0_1px_0_0_rgba(255,255,255,0.18)_inset,0_8px_18px_-8px_rgb(var(--color-primary-dark)_/_0.55)]
    hover:shadow-[0_1px_0_0_rgba(255,255,255,0.24)_inset,0_16px_30px_-12px_rgb(var(--color-primary-dark)_/_0.70)]`,

  navy: `text-white bg-surface-deep hover:bg-surface-deep-raised
    shadow-[0_1px_0_0_rgba(255,255,255,0.10)_inset,0_8px_18px_-8px_rgb(var(--color-surface-deep)_/_0.55)]
    hover:shadow-[0_1px_0_0_rgba(255,255,255,0.14)_inset,0_16px_30px_-12px_rgb(var(--color-surface-deep)_/_0.65)]`,

  // For dark backgrounds (hero overlays). Stays white so it reads there.
  outline: `text-white border border-white/40 hover:border-white/70 hover:bg-white/10`,

  // The secondary button: white, blue border, blue text; the fill sweeps in on hover.
  // Note there is no `hover:text-white` here — the white label is a separate clipped
  // layer (see `wipe` below), so no glyph is ever the same colour as what is behind it.
  // `bg-surface-raised`, not `bg-white`: index.css ships `.dark .bg-white { !important }`
  // and would invert this button the moment a visitor flips the theme.
  outlineNavy: `text-primary-dark bg-surface-raised border border-primary/55
    hover:border-primary-dark
    shadow-[0_1px_2px_0_rgb(var(--color-surface-deep)_/_0.05)] hover:shadow-[0_12px_26px_-14px_rgb(var(--color-surface-deep)_/_0.35)]`,

  ghost: `text-primary-dark hover:bg-surface`,
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-3 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

// Defined once. Building this inside render would give React a new component type on
// every pass, remounting the link and killing its hover state mid-interaction.
const MotionLink = motion(Link);

export default function Button({
  children,
  to,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'right',
  className = '',
  type = 'button',
  ...rest
}) {
  const reduce = useReducedMotion();

  const classes = [
    'group relative isolate inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg',
    'font-display font-semibold tracking-wide',
    'transition-[color,background-color,border-color,box-shadow] duration-300 ease-out',
    variants[variant],
    sizes[size],
    className,
  ].join(' ');

  const lift = reduce ? undefined : { y: -2, scale: 1.01 };
  const press = reduce ? undefined : { scale: 0.985, y: 0 };
  const transition = { duration: 0.22, ease: EASE };

  // A slow specular sweep across filled buttons. Purely decorative, hidden from AT,
  // and it sits behind the label (z-0 vs z-10).
  const sheen = (variant === 'primary' || variant === 'navy') && (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full motion-reduce:hidden"
    />
  );

  const iconEl = Icon && (
    <Icon
      className={`h-4 w-4 transition-transform duration-300 ease-out ${
        iconPosition === 'right' ? 'group-hover:translate-x-1' : 'group-hover:-translate-x-1'
      } motion-reduce:transform-none`}
    />
  );

  const label = (
    <>
      {iconPosition === 'left' && iconEl}
      <span>{children}</span>
      {iconPosition === 'right' && iconEl}
    </>
  );

  /**
   * The secondary button fills from the left. Recolouring one label mid-wipe would leave
   * half its glyphs sitting on their own colour for ~300ms, so the white label is a
   * duplicate layer clipped to exactly the same edge as the fill.
   *
   * The two clips MUST be complements. The blue base label paints above the wipe (z-10 vs
   * z-1), so if it is left unclipped it covers the white duplicate the instant the fill
   * arrives — blue-on-blue, with the white label bleeding out around the glyph edges as a
   * ghost. The base therefore hides from the left by exactly as much as the wipe reveals:
   *
   *   wipe   inset(0 100% 0 0)  ->  inset(0 0 0 0)      reveals from the left
   *   base   inset(0 0 0 0)     ->  inset(0 0 0 100%)   hides from the left
   *
   * At every frame the edge is in the same place: white-on-blue to its left,
   * blue-on-white to its right.
   */
  const isWipe = variant === 'outlineNavy';

  const wipe = isWipe && (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center gap-2 bg-primary-dark text-white [clip-path:inset(0_100%_0_0)] transition-[clip-path] duration-300 ease-out group-hover:[clip-path:inset(0_0_0_0)] motion-reduce:transition-none"
    >
      {label}
    </span>
  );

  const content = (
    <>
      {sheen}
      {wipe}
      <span
        className={`relative z-10 inline-flex items-center gap-2 ${
          isWipe
            ? '[clip-path:inset(0_0_0_0)] transition-[clip-path] duration-300 ease-out group-hover:[clip-path:inset(0_0_0_100%)] motion-reduce:transition-none'
            : ''
        }`}
      >
        {label}
      </span>
    </>
  );

  const motionProps = { whileHover: lift, whileTap: press, transition };

  if (to) {
    return (
      <MotionLink to={to} onClick={onClick} className={classes} {...motionProps} {...rest}>
        {content}
      </MotionLink>
    );
  }

  if (href) {
    return (
      <motion.a href={href} onClick={onClick} className={classes} {...motionProps} {...rest}>
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button type={type} onClick={onClick} className={classes} {...motionProps} {...rest}>
      {content}
    </motion.button>
  );
}
