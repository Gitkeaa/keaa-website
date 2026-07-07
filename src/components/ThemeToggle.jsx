import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import useTheme from '../hooks/useTheme';

export default function ThemeToggle() {
  const { dark, toggle } = useTheme();

  return (
    <motion.button
      onClick={toggle}
      aria-label="Toggle light/dark theme"
      initial={false}
      animate={{ backgroundColor: dark ? '#0A2342' : '#F5B400' }}
      transition={{ duration: 0.4 }}
      className="fixed bottom-20 right-6 z-40 relative flex h-14 w-7 flex-col items-center justify-between rounded-full border border-white/20 px-1 py-1.5 shadow-lg"
    >
      {/* SUN icon — top */}
      <motion.span
        animate={{ opacity: dark ? 0.3 : 1, scale: dark ? 0.7 : 1 }}
        transition={{ duration: 0.3 }}
      >
        <Sun className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
      </motion.span>

      {/* Sliding knob */}
      <motion.span
        layout
        animate={{ y: dark ? 16 : -16 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="absolute h-5 w-5 rounded-full bg-white shadow"
        style={{ top: '50%', marginTop: '-10px' }}
      />

      {/* MOON icon — bottom */}
      <motion.span
        animate={{ opacity: dark ? 1 : 0.3, scale: dark ? 1 : 0.7 }}
        transition={{ duration: 0.3 }}
      >
        <Moon className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
      </motion.span>
    </motion.button>
  );
}