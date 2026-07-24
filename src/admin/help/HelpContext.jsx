import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import HelpDrawer from './HelpDrawer';
import { pageGuide } from './useSop';

/**
 * Owns the single help drawer for the whole admin shell. Any component — the topbar Help
 * button, the dashboard SOP card, a "learn more" link — calls `openHelp(guide)` with a resolved
 * guide object (see useSop.js) and the one drawer shows it. Callers resolve WHICH guide (page vs
 * role); the provider only knows how to display one.
 *
 * The drawer also renders Related Module chips; clicking one opens that module's guide in the
 * same drawer via `openRelated(key)`, so an enterprise "related articles" jump never leaves the
 * page or loses the drawer.
 */
const HelpContext = createContext(null);

export function HelpProvider({ children }) {
  const [guide, setGuide] = useState(null);

  const openHelp = useCallback((g) => setGuide(g || null), []);
  const closeHelp = useCallback(() => setGuide(null), []);
  const openRelated = useCallback((key) => setGuide(pageGuide(key)), []);

  const value = useMemo(
    () => ({ openHelp, closeHelp, isOpen: Boolean(guide) }),
    [openHelp, closeHelp, guide],
  );

  return (
    <HelpContext.Provider value={value}>
      {children}
      <HelpDrawer guide={guide} onClose={closeHelp} onOpenRelated={openRelated} />
    </HelpContext.Provider>
  );
}

export function useHelp() {
  const ctx = useContext(HelpContext);
  if (!ctx) throw new Error('useHelp must be used inside <HelpProvider>');
  return ctx;
}
