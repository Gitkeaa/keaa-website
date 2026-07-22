import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import HelpDrawer from './HelpDrawer';

/**
 * Owns the single help drawer for the whole admin shell. Any component — the topbar Help
 * button, the dashboard SOP card, a future tooltip's "learn more" — calls `openHelp(guide)`
 * with a resolved guide object (see useSop.js) and the one drawer shows it. Callers resolve
 * WHICH guide (page vs role); the provider only knows how to display one.
 */
const HelpContext = createContext(null);

export function HelpProvider({ children }) {
  const [guide, setGuide] = useState(null);

  const openHelp = useCallback((g) => setGuide(g || null), []);
  const closeHelp = useCallback(() => setGuide(null), []);

  const value = useMemo(() => ({ openHelp, closeHelp, isOpen: Boolean(guide) }), [openHelp, closeHelp, guide]);

  return (
    <HelpContext.Provider value={value}>
      {children}
      <HelpDrawer guide={guide} onClose={closeHelp} />
    </HelpContext.Provider>
  );
}

export function useHelp() {
  const ctx = useContext(HelpContext);
  if (!ctx) throw new Error('useHelp must be used inside <HelpProvider>');
  return ctx;
}
