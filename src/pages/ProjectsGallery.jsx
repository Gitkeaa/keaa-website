import { useState } from 'react';
import PageHero from '../components/ui/PageHero';
import SectionHeading from '../components/ui/SectionHeading';
import ImagePlaceholder from '../components/ui/ImagePlaceholder';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ProjectCard from '../components/ui/ProjectCard';
import Reveal, { StaggerGroup, StaggerItem } from '../components/ui/Reveal';
import {
  featuredProjects,
  featuredProjectImages,
  galleryCategories,
  galleryItems,
  galleryImages,
  droneFilmUrl,
  naymoFilmUrl,
  raasFilmUrl,
  galleryFilms,
} from '../data/content';
import { img, atWidth } from '../data/images';
import useSEO from '../hooks/useSEO';
import CtaBand from '../components/CtaBand';

const projectFilters = ['All Projects', 'Infrastructure', 'Industrial', 'Commercial', 'Residential', 'International'];

// Real KEAA films shown below the featured factory film. Thumbnails are stock
// stand-ins for now — swap `thumb` for an actual frame from each video later.
// The extra films come from `galleryFilms` (data/content.js); their thumbnails cycle
// through this stock set until real frames are captured.
const FILM_THUMBS = [
  img.factoryInterior,
  img.metalSparks,
  img.grinderMetal,
  img.metalPour,
  img.steelFrame,
  img.manOnMachine,
  img.welderFactory,
  img.powerTool,
  img.personTool,
  img.metalBuilding,
  img.scaffoldCrane,
  img.containersStacked,
];

// Stock thumbs are built at 1920px (see data/images.js) but the video grid renders them
// only a few hundred px wide, so ask the CDN for a ~640px version — a big byte saving
// across the grid, without touching the full-size images used elsewhere.
const small = (url) => atWidth(url, 640);

const galleryVideos = [
  { title: 'Naymo International Pvt. Ltd', url: naymoFilmUrl, thumb: small(img.factoryMachines) },
  { title: 'Raas Industries', url: raasFilmUrl, thumb: small(img.weldersFactory) },
  ...galleryFilms.map((f, i) => ({ ...f, thumb: small(FILM_THUMBS[i % FILM_THUMBS.length]) })),
];

// How many video cards render before the "Show all" button. Keeps the initial paint light
// even as the film list grows — the rest mount only when asked.
const VIDEOS_PREVIEW = 8;

// The gallery grid follows the same preview-then-expand rule as the videos above. It used
// to render every item at once under a "View More Gallery" button that did nothing.
const GALLERY_PREVIEW = 12;

export default function ProjectsGallery() {
  useSEO({
    title: 'Projects & Gallery',
    description:
      '500+ completed projects across 42+ countries. Browse KEAA\'s featured projects, factory gallery and product photography.',
  });

  const [projectFilter, setProjectFilter] = useState('All Projects');
  const [galleryFilter, setGalleryFilter] = useState('All');
  const [showAllVideos, setShowAllVideos] = useState(false);
  const [showAllGallery, setShowAllGallery] = useState(false);
  const visibleVideos = showAllVideos ? galleryVideos : galleryVideos.slice(0, VIDEOS_PREVIEW);

  const projects = featuredProjects
    .map((p, i) => ({ ...p, image: featuredProjectImages[i] }))
    .filter((p) => projectFilter === 'All Projects' || p.category === projectFilter);

  const gallery =
    galleryFilter === 'All' ? galleryItems : galleryItems.filter((g) => g.category === galleryFilter);
  const visibleGallery = showAllGallery ? gallery : gallery.slice(0, GALLERY_PREVIEW);

  return (
    <>
      <PageHero
        eyebrow="Projects & Gallery"
        title="Building Projects."
        accent="Delivering Excellence."
        desc="Take a look at how our high-quality products are used in real-world applications across industries and countries."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Projects & Gallery' }]}
        image={img.scaffoldHighRise}
        stats={[
          { value: '500+', label: 'Projects Completed' },
          { value: '20+', label: 'Industries Served' },
          { value: '42+', label: 'Countries' },
          { value: '1000+', label: 'Happy Clients' },
        ]}
      />

      {/* FEATURED PROJECTS */}
      <section id="projects" className="section-pad">
        <div className="container-page">
          <Reveal>
            <SectionHeading align="left" eyebrow="Featured Projects" title="Trusted by Clients Worldwide" className="!mx-0" />
          </Reveal>
          <div className="mt-6 flex flex-wrap gap-2">
            {projectFilters.map((f) => (
              <button
                key={f}
                onClick={() => setProjectFilter(f)}
                className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                  projectFilter === f
                    ? 'border-navy-700 bg-navy-700 text-white'
                    : 'border-navy-100 text-ink hover:border-navy-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* The same card as the Home rail — see components/ui/ProjectCard, so the design
              lives in one file. No `to` here: there is still no project-detail route, so the
              card carries no affordance that could never resolve. `withDesc` because this is
              the page where projects are actually read rather than teased. */}
          <StaggerGroup className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {projects.map((p) => (
              <StaggerItem key={p.title}>
                <ProjectCard project={p} image={p.image} withDesc />
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" className="section-pad">
        <div className="container-page">
          <Reveal>
            <SectionHeading align="left" eyebrow="Gallery" title="Factory, Product & Project Gallery" className="!mx-0" />
          </Reveal>
          <div className="mt-6 flex flex-wrap gap-2">
            {galleryCategories.map((c) => (
              <button
                key={c}
                onClick={() => setGalleryFilter(c)}
                className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                  galleryFilter === c
                    ? 'border-navy-700 bg-navy-700 text-white'
                    : 'border-navy-100 bg-white text-ink hover:border-navy-300'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          {/* Same grid and same tile shape as Featured Projects above — see the note there.
              This was `sm:grid-cols-3 gap-4` with square tiles, so its images were both a
              different shape AND a different size from every other tile on the page. */}
          <StaggerGroup className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" stagger={0.05}>
            {visibleGallery.map((g) => (
              <StaggerItem key={g.id}>
                <ImagePlaceholder src={galleryImages[g.id]} label={g.label} ratio="aspect-[4/3]" />
              </StaggerItem>
            ))}
          </StaggerGroup>
          {gallery.length > GALLERY_PREVIEW && (
            <div className="mt-8 text-center">
              <Button
                variant="outlineNavy"
                onClick={() => setShowAllGallery((s) => !s)}
              >
                {showAllGallery ? 'Show fewer images' : `Show all ${gallery.length} images`}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* VIDEOS */}
      <section id="videos" className="section-pad">
        <div className="container-page">
          <Reveal>
            <SectionHeading align="left" eyebrow="Videos" title="Watch Our Manufacturing Process & Product Applications" className="!mx-0" />
          </Reveal>

          {/* Featured factory film — opens the SharePoint video in a new tab */}
          <Reveal>
            <a
              href={droneFilmUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative mt-8 block overflow-hidden rounded-card shadow-card"
              aria-label="Watch the KEAA International factory film (opens in a new tab)"
            >
              <img
                src={img.factoryInterior}
                alt="Inside the KEAA International manufacturing facility"
                loading="lazy"
                className="aspect-[16/9] w-full object-cover transition-transform duration-700 group-hover:scale-105 sm:aspect-[21/9]"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/25 to-transparent" />
              {/* centre watch control */}
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="relative flex items-center justify-center">
                  <span
                    className="absolute inset-0 rounded-full bg-primary/30 animate-ping motion-reduce:animate-none"
                    style={{ animationDuration: '2.8s' }}
                  />
                  <span className="relative flex items-center justify-center rounded-full bg-primary-dark px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.12em] text-white shadow-lg shadow-primary/40 transition-transform duration-300 group-hover:scale-110">
                    Watch
                  </span>
                </span>
              </span>
              {/* caption */}
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                <Badge tone="gold">Inside the Factory</Badge>
                <h3 className="mt-2 font-display text-xl font-bold text-white sm:text-2xl">
                  KEAA International Pvt. Ltd.
                </h3>
                <p className="mt-1 max-w-xl text-body-compact text-white/75">
                  An inside look at our 25,000 sq. m in-house manufacturing facility in Ludhiana, Punjab.
                </p>
              </div>
            </a>
          </Reveal>

          {/* key flips with the toggle so the group remounts and re-runs its entrance
              animation — otherwise the newly revealed cards stay at opacity 0, because
              StaggerGroup's whileInView only fires once and never re-triggers for the
              items added when "Show all" is clicked. */}
          <StaggerGroup
            key={showAllVideos ? 'all' : 'preview'}
            className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            stagger={0.05}
          >
            {visibleVideos.map((v) => (
              <StaggerItem key={v.title}>
                <a
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block overflow-hidden rounded-card shadow-card"
                  aria-label={`Watch ${v.title} (opens in a new tab)`}
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
                  {/* centre watch control */}
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="relative flex items-center justify-center rounded-full bg-primary-dark px-5 py-2.5 text-[13px] font-bold uppercase tracking-[0.12em] text-white shadow-lg shadow-primary/40 transition-transform duration-300 group-hover:scale-110">
                      Watch
                    </span>
                  </span>
                  {/* title */}
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <h3 className="line-clamp-1 font-display text-sm font-semibold text-white">{v.title}</h3>
                  </div>
                </a>
              </StaggerItem>
            ))}
          </StaggerGroup>

          {galleryVideos.length > VIDEOS_PREVIEW && (
            <div className="mt-8 text-center">
              <Button
                variant="outlineNavy"
                onClick={() => setShowAllVideos((s) => !s)}
              >
                {showAllVideos
                  ? 'Show fewer videos'
                  : `Show all ${galleryVideos.length} videos`}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* FINAL CTA */}
      <CtaBand
        title="Have a Project"
        accent="in Mind?"
        desc="Let&rsquo;s build something great together."
        cta={{ label: 'Request a Quote', to: '/rfq' }}
      />
    </>
  );
}
