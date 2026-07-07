import { motion } from 'framer-motion';

/**
 * Wraps any content in a graceful scroll-reveal animation. Animates once when
 * it enters the viewport (whileInView + viewport.once) so it never re-fires
 * on scroll-back, keeping the page calm rather than jittery.
 */
export default function Reveal({
  children,
  delay = 0,
  y = 24,
  x = 0,
  duration = 0.6,
  className = '',
  as: Tag = 'div',
  ...rest
}) {
  const MotionTag = motion[Tag] || motion.div;

  return (
    <MotionTag
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Stagger container: animates direct children in sequence. Pair with
 * <StaggerItem> for each child.
 */
export function StaggerGroup({ children, className = '', stagger = 0.08, ...rest }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      transition={{ staggerChildren: stagger }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = '', y = 20, ...rest }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
