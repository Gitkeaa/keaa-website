import { useState } from 'react';
import GalleryHero from '../components/gallery/GalleryHero';
import { heroSlides } from '../data/heroSlides';
import SectionHeading from '../components/ui/SectionHeading';
import ProjectCard from '../components/ui/ProjectCard';
import CardRail from '../components/ui/CardRail';
import Pagination from '../components/ui/Pagination';
import Lightbox from '../components/ui/Lightbox';
import Reveal, { StaggerGroup, StaggerItem } from '../components/ui/Reveal';
import {
  featuredProjects,
  featuredProjectImages,
  droneFilmUrl,
  naymoFilmUrl,
  raasFilmUrl,
  galleryFilms,
} from '../data/content';
import { galleryPhotos, galleryCategories, galleryAlt } from '../data/gallery';
import { cldImage, cldSrcSet, cldVideoPoster } from '../data/cloudinary';
import useSEO from '../hooks/useSEO';
import { useLT } from '../i18n/LocaleContext';

/**
 * Projects & Gallery page: a hero, a featured-projects rail, a filterable and paginated
 * photo gallery with a lightbox, and a paginated videos grid.
 *
 * Lazy-loaded in App.jsx and rendered at the public /projects-gallery route. Content comes
 * from data/content.js and data/gallery.js; page sizes are the PER_PAGE constants below.
 */

// Video thumbnails use KEAA's OWN gallery photography (real facility, aerial and product
// shots from Cloudinary), not stock imagery — the stock stand-ins read as generic / AI.
// A true frame-grab from each film is not possible: the films are SharePoint share pages,
// not files we can transform, so those fall back to a real KEAA photo until the film is
// uploaded to Cloudinary. There are more photos (57) than films, so each gets a distinct one.
// w_800 on purpose — the SAME width the gallery grid uses, so a video thumbnail reuses the
// grid's already-generated (and CDN-cached) transformation instead of forcing Cloudinary to
// generate a new size on first view. Cold transformations are ~1.8s each; reuse avoids them.
const REAL_THUMBS = galleryPhotos.map((p) => cldImage(p.id, { w: 800 }));
const thumbAt = (i) => REAL_THUMBS[i % REAL_THUMBS.length];

/*
 * Two of these films ALSO exist on Cloudinary — they are the ones powering the home-page
 * hero background (see heroFilms in data/content.js) — so cldVideoPoster lifts a REAL frame
 * out of the actual .mp4 for them: the aerial/factory film (hero1_a0hnen) and the Raass film
 * (Rass_wixfl0). Every other film is a OneDrive/SharePoint share page, not a file, so no
 * frame can be pulled from it — those keep a real KEAA photo until they too are on Cloudinary.
 */
const FRAME = {
  aerial: cldVideoPoster('hero1_a0hnen', { so: 6, w: 640 }),
  raas: cldVideoPoster('Rass_wixfl0', { so: 8, w: 640 }),
};

// The KEAA factory film is the first card here now (same size as the rest) rather than a
// separate full-width hero above the grid.
const galleryVideos = [
  { title: 'KEAA International Pvt. Ltd.', url: droneFilmUrl, thumb: FRAME.aerial },
  { title: 'Raas Industries', url: raasFilmUrl, thumb: FRAME.raas },
  { title: 'Naymo International Pvt. Ltd', url: naymoFilmUrl, thumb: thumbAt(0) },
  ...galleryFilms.map((f, i) => ({ ...f, thumb: thumbAt(i + 1) })),
];


// Videos and photos both paginate (see components/ui/Pagination): this is the default
// page size, and the dropdown offers the rest. Keeps the initial paint light.
const PER_PAGE_DEFAULT = 8;
const PER_PAGE_OPTIONS = [8, 20, 40, 80];

export default function ProjectsGallery() {
  const lt = useLT('gallery');
  useSEO({
    title: lt('seo.title', 'Projects & Gallery'),
    description:
      lt('seo.desc', '500+ completed projects across 42+ countries. Browse KEAA\'s featured projects, factory gallery and product photography.'),
  });

  // Photo gallery: category filter + pagination + a click-to-open lightbox.
  const [galleryCat, setGalleryCat] = useState('All');
  const [galleryPage, setGalleryPage] = useState(1);
  const [galleryPerPage, setGalleryPerPage] = useState(PER_PAGE_DEFAULT);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Videos: pagination only (each card links out to the film, so no lightbox).
  const [videoPage, setVideoPage] = useState(1);
  const [videoPerPage, setVideoPerPage] = useState(PER_PAGE_DEFAULT);

  const projects = featuredProjects.map((p, i) => ({ ...p, image: featuredProjectImages[i] }));

  // Filter, then page. galleryList is the full filtered set (the lightbox pages through all
  // of it, across page boundaries); pageGallery is just the current page's tiles.
  const galleryList =
    galleryCat === 'All' ? galleryPhotos : galleryPhotos.filter((p) => p.category === galleryCat);
  const galleryStart = (galleryPage - 1) * galleryPerPage;
  const pageGallery = galleryList.slice(galleryStart, galleryStart + galleryPerPage);
  const galleryIds = galleryList.map((p) => p.id);

  const videoStart = (videoPage - 1) * videoPerPage;
  const pageVideos = galleryVideos.slice(videoStart, videoStart + videoPerPage);

  return (
    <>
      {/* Framed, Lely-style hero (only this page): a rounded card with the crossfading gallery
          photography behind it, copy bottom-left, Explore hint bottom-right. */}
      <GalleryHero
        eyebrow="Projects & Gallery"
        crumbs={[{ label: lt('crumbs.home', 'Home'), to: '/' }, { label: lt('crumbs.page', 'Projects & Gallery') }]}
        slides={heroSlides.gallery.map((s, i) => ({
          ...s,
          title: lt(`hero.${i}.title`, s.title),
          accent: s.accent && lt(`hero.${i}.accent`, s.accent),
          desc: s.desc && lt(`hero.${i}.desc`, s.desc),
        }))}
        scrollTo="projects"
      />

      {/* FEATURED PROJECTS */}
      <section id="projects" className="section-pad">
        <div className="container-page">
          <Reveal>
            <SectionHeading align="left" eyebrow={lt('featured.eyebrow', 'Featured Projects')} title={lt('featured.title', 'Trusted by Clients Worldwide')} className="!mx-0" />
          </Reveal>

          {/* The same rail as the Home page — a snap-scrolling row of cards with the
              prev / dots / next control underneath (see components/ui/CardRail). It replaces
              the old four-up grid + "Show all" button: on a rail every project is already
              reachable by scrolling or a dot, so the toggle was a second way to do what the
              rail does on its own. No `to` here — there is still no project-detail route — and
              `withDesc` because this is the page where projects are actually read, not teased.
              Card widths mirror the Home rail exactly so the two read as one component. */}
          <CardRail
            label={lt('featured.railLabel', 'Featured projects')}
            labels={projects.map((p, i) => lt('featured.show', 'Show {title}', { title: lt(`projects.${i}.title`, p.title) }))}
          >
            {projects.map((p, i) => (
              <ProjectCard
                key={p.title}
                project={{
                  ...p,
                  title: lt(`projects.${i}.title`, p.title),
                  location: lt(`projects.${i}.location`, p.location),
                  category: lt(`projects.${i}.category`, p.category),
                  desc: lt(`projects.${i}.desc`, p.desc),
                }}
                image={p.image}
                withDesc
                className="w-[82%] flex-none snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
              />
            ))}
          </CardRail>
        </div>
      </section>

      {/* GALLERY — KEAA's own photography from Cloudinary (see data/gallery.js): a category
          filter (categories are editable in that file), a paginated grid, and a click-to-open
          lightbox. */}
      <section id="gallery" className="section-pad">
        <div className="container-page">
          <Reveal>
            <SectionHeading align="left" eyebrow={lt('photos.eyebrow', 'Gallery')} title={lt('photos.title', 'Factory, Product & Project Gallery')} className="!mx-0" />
          </Reveal>

          <div className="mt-6 flex flex-wrap gap-2">
            {galleryCategories.map((c, i) => (
              <button
                key={c}
                onClick={() => {
                  setGalleryCat(c);
                  setGalleryPage(1); // a new filter starts at page 1
                }}
                className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                  galleryCat === c
                    ? 'border-navy-700 bg-navy-700 text-white'
                    : 'border-navy-100 text-ink hover:border-navy-300'
                }`}
              >
                {lt(`filters.${i}`, c)}
              </button>
            ))}
          </div>

          {/* key changes with filter/page/perPage so the group remounts and re-runs its
              entrance animation — StaggerGroup's whileInView fires once, so without this the
              new tiles would stay at opacity 0 after a filter or page change. */}
          <StaggerGroup
            key={`${galleryCat}-${galleryPage}-${galleryPerPage}`}
            className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            stagger={0.04}
          >
            {pageGallery.map((p, i) => (
              <StaggerItem key={p.id}>
                <button
                  type="button"
                  onClick={() => setLightboxIndex(galleryStart + i)}
                  aria-label={lt('photos.open', 'Open image in full-screen viewer')}
                  className="group block w-full overflow-hidden rounded-card ring-1 ring-border"
                >
                  <img
                    /* f_auto,q_auto + a small srcSet — a tile only ever renders a few hundred
                       px wide, so we never ship the full-size original. Keeps Cloudinary
                       bandwidth low across the set. */
                    src={cldImage(p.id, { w: 800 })}
                    /* Just two widths — 400 for 1x, 800 for 2x — not four. Every extra width is
                       a separate Cloudinary transformation that must be generated cold (~1.8s)
                       the first time anyone views it; fewer widths = far fewer cold generations
                       and a faster first load. 800 is shared with the src, the video thumbnails
                       and the lightbox placeholder, so it is generated once and reused. */
                    srcSet={cldSrcSet(p.id, [400, 800])}
                    sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    alt={lt(`photoAlt.${p.category}`, galleryAlt(p.id))}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </button>
              </StaggerItem>
            ))}
          </StaggerGroup>

          <Pagination
            total={galleryList.length}
            page={galleryPage}
            perPage={galleryPerPage}
            perPageOptions={PER_PAGE_OPTIONS}
            onPage={setGalleryPage}
            onPerPage={(n) => {
              setGalleryPerPage(n);
              setGalleryPage(1);
            }}
          />
        </div>
      </section>

      {/* Full-screen viewer — pages through the whole filtered set, across page boundaries. */}
      <Lightbox
        items={galleryIds}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onIndex={setLightboxIndex}
        alt={(id) => lt(`photoAlt.${galleryPhotos.find((g) => g.id === id)?.category}`, galleryAlt(id))}
      />

      {/* VIDEOS */}
      <section id="videos" className="section-pad">
        <div className="container-page">
          <Reveal>
            <SectionHeading align="left" eyebrow={lt('videos.eyebrow', 'Videos')} title={lt('videos.title', 'Watch Our Manufacturing Process & Product Applications')} className="!mx-0" />
          </Reveal>

          {/* The KEAA factory film is no longer a full-width hero above the grid — it is now
              the first card in the grid below, the same size as every other film. */}

          {/* key changes with page/perPage so the group remounts and re-runs its entrance
              animation — StaggerGroup's whileInView fires once, so the next page's cards
              would otherwise stay at opacity 0. */}
          <StaggerGroup
            key={`${videoPage}-${videoPerPage}`}
            className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            stagger={0.05}
          >
            {pageVideos.map((v) => (
              <StaggerItem key={v.title}>
                <a
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block overflow-hidden rounded-card shadow-card"
                  aria-label={lt('videos.watch', 'Watch {title} (opens in a new tab)', { title: v.title })}
                >
                  <img
                    src={v.thumb}
                    alt={v.title}
                    loading="lazy"
                    /* 4/3, matching the project and gallery tiles. These were `aspect-video`
                       (16:9) in a 3-column grid, so a film card was both a different shape
                       and a different width from everything else on the page. The thumbnails
                       are `object-cover`, so the crop simply tightens — nothing distorts. */
                    className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/20 to-transparent" />
                  {/* centre play control — a blue disc with a white play triangle, drawn inline
                      (no asset to host, crisp at any size). */}
                  <span className="absolute inset-0 flex items-center justify-center">
                    <svg
                      viewBox="0 0 64 64"
                      aria-hidden="true"
                      className="h-16 w-16 text-primary drop-shadow-[0_6px_16px_rgba(10,35,66,0.45)] transition-transform duration-300 group-hover:scale-110"
                    >
                      <circle cx="32" cy="32" r="31" fill="currentColor" />
                      <path
                        d="M26 21.5 L45 32 L26 42.5 Z"
                        fill="white"
                        strokeWidth="4"
                        stroke="white"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  {/* title */}
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <h3 className="line-clamp-1 font-display text-sm font-semibold text-white">{v.title}</h3>
                  </div>
                </a>
              </StaggerItem>
            ))}
          </StaggerGroup>

          <Pagination
            total={galleryVideos.length}
            page={videoPage}
            perPage={videoPerPage}
            perPageOptions={PER_PAGE_OPTIONS}
            onPage={setVideoPage}
            onPerPage={(n) => {
              setVideoPerPage(n);
              setVideoPage(1);
            }}
          />
        </div>
      </section>

    </>
  );
}
