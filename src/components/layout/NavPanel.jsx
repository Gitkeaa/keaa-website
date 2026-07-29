import { Link } from 'react-router-dom';
import { img } from '../../data/images';
import { useLT, useT } from '../../i18n/LocaleContext';

/**
 * The half-height panel a nav item opens.
 *
 * Layout: two columns of links on the left, a single promo card on the right. The card is
 * what stops a panel being a list you read past — it gives each section one thing to go and
 * do, with a picture attached.
 *
 * NO ICONS ANYWHERE, including on the trigger. There is no chevron: the nav item is the
 * affordance, and a glyph beside it would be the only one left in a header that states
 * everything else in words.
 *
 * Links are split into two columns by CSS (`columns-2`), not by slicing the array in JS —
 * so a panel with five links and one with nine both balance, and adding a link to
 * data/navigation.js never requires rebalancing anything here.
 */
export default function NavPanel({ item, categories = [], onNavigate }) {
  /*
    THE PARENT PAGE LEADS. The header's own nav item no longer navigates — it only opens
    this panel — so the row pointing at `item.to` ("All Products", "About KEAA", ...) is the
    single way to reach that page from the header, and it has to be the first thing read.
    Categories used to lead here; they now follow, because a visitor who wants one category
    picks it directly and one who wants the whole page needs the top row to be obvious.
  */
  const lt = useLT('common');
  const t = useT();
  const children = item.children || [];
  const parentRow = children.find((c) => c.to === item.to);

  const rows = [
    ...(parentRow ? [parentRow] : []),
    ...categories.map((c) => ({
      label: lt(`cat.${c.slug}`, c.name),
      to: `/products/${c.slug}`,
      desc: lt('nav.productCount', '{n} products', { n: c.count }),
    })),
    ...children.filter((c) => c !== parentRow),
  ];

  const feature = item.feature;
  // `image` is a key into the shared image map rather than a URL, so the panel data stays
  // free of CDN paths and every image keeps its Cloudinary sizing.
  const featureImage = feature ? img[feature.image] : null;

  return (
    <div className="absolute inset-x-0 top-full border-t border-border bg-white shadow-[0_18px_40px_-24px_rgb(10,35,66,0.35)]">
      {/* No `min-h` — the panel hugs its content. It used to force `min-h-[38vh]`, which left
          a large empty band under the links on the shorter panels. `py-12` still gives it
          generous top and bottom breathing room. */}
      <div className="container-full grid gap-x-14 gap-y-10 py-12 xl:grid-cols-[1fr_24rem] 2xl:grid-cols-[1fr_26rem]">
        <div>
          <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-primary-darker">
            {t(item.key)}
          </p>

          <ul className="mt-8 gap-x-12 sm:columns-2">
            {rows.map((row) => (
              // `break-inside-avoid` — without it a link and its description can be split
              // across the column boundary.
              <li key={`${row.to}-${row.label}`} className="mb-7 break-inside-avoid">
                <Link to={row.to} onClick={onNavigate} className="group block">
                  <span className="block text-base font-semibold text-navy-900 transition-colors group-hover:text-primary-darker">
                    {lt(`nav.row.${row.to}.label`, row.label)}
                  </span>
                  {row.desc && (
                    <span className="mt-1 block text-body-compact text-muted">{lt(`nav.row.${row.to}.desc`, row.desc)}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {feature && (
          /* `xl` matches the nav's own breakpoint in Header.jsx. Below it the nav is
             display:none, so this panel cannot be opened at all and the drawer serves the
             same links flat — the class is defensive, not something a visitor ever hits. */
          <div className="hidden xl:block">
            <Link
              to={feature.cta.to}
              onClick={onNavigate}
              className="group flex h-full flex-col overflow-hidden rounded-card border border-border transition-colors hover:border-primary/40"
            >
              {featureImage && (
                /* `flex-1` + a min-height floor, NOT a fixed aspect ratio. A fixed
                   aspect-[16/10] set the image height from its width, which made this card
                   taller than the two link columns beside it; the grid then stretched to the
                   card and left a dead band under the (shorter) links. As a flex child the
                   image instead fills whatever height the LINKS define, so the panel hugs its
                   tallest real content. The floor stops it collapsing when the links are few. */
                <div className="relative min-h-[8.5rem] w-full flex-1 overflow-hidden bg-navy-50">
                  <img
                    src={featureImage}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="flex flex-col p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-darker">
                  {lt(`${item.key}.feature.eyebrow`, feature.eyebrow)}
                </p>
                <p className="mt-2 text-lg font-bold leading-snug text-text">{lt(`${item.key}.feature.title`, feature.title)}</p>
                <span className="mt-auto pt-4 text-sm font-semibold text-primary-dark">
                  <span className="border-b border-transparent pb-0.5 transition-colors group-hover:border-primary">
                    {lt(`${item.key}.feature.cta`, feature.cta.label)}
                  </span>
                </span>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
