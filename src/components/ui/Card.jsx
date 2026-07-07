import { motion } from 'framer-motion';

export default function Card({ children, className = '', hover = true, as: Tag = 'div', ...rest }) {
  const MotionTag = motion[Tag] || motion.div;

  return (
    <MotionTag
      className={`rounded-xl border border-navy-100 bg-white shadow-card ${className}`}
      whileHover={hover ? { y: -6, boxShadow: '0 16px 36px -10px rgba(10,35,66,0.22)' } : undefined}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
