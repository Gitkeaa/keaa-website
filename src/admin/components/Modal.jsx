import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { EASE } from '../../lib/motion';

/** A small centered modal used by the admin forms and confirmations. */
export default function Modal({ open, onClose, title, children, footer, maxWidth = 'max-w-md' }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-navy-950/50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.18, ease: EASE }}
            className={`relative z-10 flex max-h-[92vh] w-full ${maxWidth} flex-col rounded-2xl bg-white shadow-xl`}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="font-display text-lg font-bold text-navy-900">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
            {footer && <div className="flex flex-shrink-0 justify-end gap-2 border-t border-slate-200 px-5 py-3">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
