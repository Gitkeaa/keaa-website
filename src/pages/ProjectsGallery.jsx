import { useState } from 'react';
import { Play, ArrowRight, FileText } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import SectionHeading from '../components/ui/SectionHeading';
import ImagePlaceholder from '../components/ui/ImagePlaceholder';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
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
} from '../data/content';
import { img } from '../data/images';
import useSEO from '../hooks/useSEO';
import CtaBand from '../components/CtaBand';

const projectFilters = ['All Projects', 'Infrastructure', 'Industrial', 'Commercial', 'Residential', 'International'];

// Real KEAA films shown below the featured factory film. Thumbnails are stock
// stand-ins for now — swap `thumb` for an actual frame from each video later.
const galleryVideos = [
  { title: 'Naymo International Pvt. Ltd', url: naymoFilmUrl, thumb: img.factoryMachines },
  { title: 'Raas Industries', url: raasFilmUrl, thumb: img.weldersFactory },
];

export default function ProjectsGallery() {
  useSEO({
    title: 'Projects & Gallery',
    description:
      '500+ completed projects across 42+ countries. Browse KEAA\'s featured projects, factory gallery and product photography.',
  });

  const [projectFilter, setProjectFilter] = useState('All Projects');
  const [galleryFilter, setGalleryFilter] = useState('All');

  const projects = featuredProjects
    .map((p, i) => ({ ...p, image: featuredProjectImages[i] }))
    .filter((p) => projectFilter === 'All Projects' || p.category === projectFilter);

  const gallery =
    galleryFilter === 'All' ? galleryItems : galleryItems.filter((g) => g.category === galleryFilter);

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
      <section className="section-pad">
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
                    : 'border-navy-100 text-ink/60 hover:border-navy-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <StaggerGroup className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {projects.map((p) => (
              <StaggerItem key={p.title}>
                <Card className="overflow-hidden">
                  <ImagePlaceholder src={p.image} label={p.title} ratio="aspect-[4/3]" />
                  <div className="p-4">
                    <Badge tone="gold">{p.category}</Badge>
                    <h3 className="mt-2 font-display text-sm font-semibold text-navy-800">{p.title}</h3>
                    <p className="text-xs text-ink/50">{p.location}</p>
                    <p className="mt-2 text-sm text-ink/60">{p.desc}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-navy-700">
                      View Details <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* GALLERY */}
      <section className="section-pad">
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
                    : 'border-navy-100 bg-white text-ink/60 hover:border-navy-300'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <StaggerGroup className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-4" stagger={0.05}>
            {gallery.map((g) => (
              <StaggerItem key={g.id}>
                <ImagePlaceholder src={galleryImages[g.id]} label={g.label} ratio="aspect-square" />
              </StaggerItem>
            ))}
          </StaggerGroup>
          <div className="mt-8 text-center">
            <Button variant="outlineNavy" icon={ArrowRight}>
              View More Gallery
            </Button>
          </div>
        </div>
      </section>

      {/* VIDEOS */}
      <section className="section-pad">
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
              className="group relative mt-8 block overflow-hidden rounded-2xl shadow-card"
              aria-label="Watch the KEAA International factory film (opens in a new tab)"
            >
              <img
                src={img.factoryInterior}
                alt="Inside the KEAA International manufacturing facility"
                loading="lazy"
                className="aspect-[16/9] w-full object-cover transition-transform duration-700 group-hover:scale-105 sm:aspect-[21/9]"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/25 to-transparent" />
              {/* centre play button */}
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="relative flex h-16 w-16 items-center justify-center">
                  <span
                    className="absolute inset-0 rounded-full bg-primary/30 animate-ping motion-reduce:animate-none"
                    style={{ animationDuration: '2.8s' }}
                  />
                  <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary-dark text-white shadow-lg shadow-primary/40 transition-transform duration-300 group-hover:scale-110">
                    <Play className="h-6 w-6 translate-x-[2px] fill-current" />
                  </span>
                </span>
              </span>
              {/* caption */}
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                <Badge tone="gold">Inside the Factory</Badge>
                <h3 className="mt-2 font-display text-xl font-bold text-white sm:text-2xl">
                  KEAA International Pvt. Ltd.
                </h3>
                <p className="mt-1 max-w-xl text-sm text-white/75">
                  An inside look at our 25,000 sq. m in-house manufacturing facility in Ludhiana, Punjab.
                </p>
              </div>
            </a>
          </Reveal>

          <StaggerGroup className="mt-6 grid gap-6 sm:grid-cols-2" stagger={0.08}>
            {galleryVideos.map((v) => (
              <StaggerItem key={v.title}>
                <a
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block overflow-hidden rounded-2xl shadow-card"
                  aria-label={`Watch ${v.title} (opens in a new tab)`}
                >
                  <img
                    src={v.thumb}
                    alt={v.title}
                    loading="lazy"
                    className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/20 to-transparent" />
                  {/* centre play button */}
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary-dark text-white shadow-lg shadow-primary/40 transition-transform duration-300 group-hover:scale-110">
                      <Play className="h-5 w-5 translate-x-[2px] fill-current" />
                    </span>
                  </span>
                  {/* title */}
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                    <h3 className="font-display text-lg font-semibold text-white">{v.title}</h3>
                  </div>
                </a>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* FINAL CTA */}
      <CtaBand
        title="Have a Project"
        accent="in Mind?"
        desc="Let&rsquo;s build something great together."
        cta={{ label: 'Request a Quote', to: '/rfq', icon: FileText }}
      />
    </>
  );
}
