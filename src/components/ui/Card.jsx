import { motion } from 'framer-motion';

export default function Card({ children, className = '', ...rest }) {
  return (
    <motion.div
      className={`rounded-xl border border-black bg-white shadow-card ${className}`}
      whileHover={{ y: -6, boxShadow: '0 16px 36px -10px rgba(10,35,66,0.22)' }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
