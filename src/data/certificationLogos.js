/**
 * The certification marks for the floating strip on the home page
 * (components/home/CertificationStrip.jsx).
 *
 * ---------------------------------------------------------------------------------------
 * HOW TO ADD A MARK — this is the only file you need to touch.
 * ---------------------------------------------------------------------------------------
 * 1. Upload the badge in the Cloudinary dashboard (same "keaa-assets" account as the rest of
 *    the site). A transparent PNG or an SVG reads best against the white band.
 * 2. Copy either the asset's `public_id` OR the full delivery URL — both work, paste
 *    whichever Cloudinary hands you:
 *
 *      { name: 'CE Certified',   id: 'certs/ce_ab12cd' }
 *      { name: 'Ct-PAT',         id: 'https://res.cloudinary.com/keaa-assets/image/upload/v1/ctpat_xy34.png' }
 *
 * 3. Paste it into the `id` of the matching row below. That is it.
 *
 * NOTHING BREAKS WHILE THE IDS ARE STILL EMPTY. A row with no `id` keeps rendering as its
 * name in text — exactly what this strip showed before the badges existed — so the marks can
 * be uploaded one at a time and the strip is never half-empty or broken in between.
 *
 * `name` is the image's alt text as well as that text fallback, so it must stay readable.
 * `body` is the one-line scope; it is not shown in the strip (the full set with scopes lives
 * on /certifications) but it keeps each row self-describing here.
 */
export const certificationLogos = [
  // ---- PASTE THE CLOUDINARY KEYS HERE ------------------------------------------------
  { name: 'ISO 9001, 14001, 45001', body: 'Quality, Environment, Health and safety', id: 'ISO_9001_14001_45001_wrszlx' },
  { name: 'CE Certified', body: 'European Union', id: 'CE_Certified_heisan' },
  { name: 'DIN EN 1090-1', body: 'Factory Production Control', id: 'DIN_EN_1090-1_fwxhqh' },
  { name: 'Ct-PAT', body: 'Voluntary supply chain security program', id: 'Ct-PAT_z5gdra' },
  { name: 'CTO & CTE', body: 'Environment consent Air, Water and Noise', id: 'CTO_CTE_xtttnf' },
  { name: 'EN 1090 Part 2 and Part 3', body: 'Welding Certificate', id: 'EN_1090_Part_2_and_Part_3_dp5fl6' },
  { name: 'BSCI Compliant', body: 'Social Standards', id: 'BSCI_Compliant_epigki' },
  // { name: 'CETA', body: 'Standards and testing credentials', id: '' },
  // { name: 'DoP', body: 'Construction & Industrial Manufacturing Performance', id: '' },
  // // ------------------------------------------------------------------------------------
];
