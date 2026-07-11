/**
 * The backdrop shared by every light band that closes a page: the export map whispered on
 * the left, the hero tower held right back on the right, and a wash of the page colour
 * pulled across both so nothing competes with the card in front.
 *
 * Extracted so the closing CTA and the feature strips cannot drift apart. Pass
 * `photo={false}` when another textured band follows immediately -- two photographs
 * stacked read as a repeat rather than a crescendo.
 */
export default function BrandTexture({ photo = true }) {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-0 hidden w-1/2 bg-contain bg-left bg-no-repeat opacity-[0.05] lg:block"
        style={{ backgroundImage: "url('/images/global-presence-map.png')" }}
      />
      {photo && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-0 w-2/3 bg-cover bg-center opacity-[0.14]"
          style={{ backgroundImage: "url('/images/hero2.jpg')" }}
        />
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'linear-gradient(90deg, rgb(var(--color-surface)) 0%, rgb(var(--color-surface) / 0.94) 34%, rgb(var(--color-surface) / 0.72) 58%, rgb(var(--color-surface) / 0.55) 100%)',
        }}
      />
    </>
  );
}
