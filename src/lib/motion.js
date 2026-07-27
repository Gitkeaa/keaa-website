/**
 * Shared motion tokens.
 *
 * `EASE` is the site-wide easing curve for framer-motion transitions. It was previously
 * redeclared in ~26 components; keep every animation in step by importing it from here.
 * Used across the public site (Button, Reveal, PageHero, home sections, modals) and the
 * admin console (Modal, AdminLayout, HelpDrawer). Change the curve here to change it everywhere.
 */
export const EASE = [0.22, 1, 0.36, 1];
