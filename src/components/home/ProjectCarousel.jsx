import CardRail from '../ui/CardRail';
import ProjectCard from '../ui/ProjectCard';
import { useLT } from '../../i18n/LocaleContext';

/**
 * The Featured Projects rail.
 *
 * Both the card and the rail-with-dots live elsewhere — see ui/ProjectCard and ui/CardRail —
 * so this only decides what goes on the rail and how wide each card sits at each breakpoint.
 */
export default function ProjectCarousel({ projects, images }) {
  const lt = useLT('home');
  // Same keys as the Gallery page (see ProjectsGallery.jsx) — `projects` here IS
  // featuredProjects, index-aligned with the `gallery.projects.*` dictionary entries.
  const ltGallery = useLT('gallery');
  const translated = projects.map((p, i) => ({
    ...p,
    title: ltGallery(`projects.${i}.title`, p.title),
    location: ltGallery(`projects.${i}.location`, p.location),
    category: ltGallery(`projects.${i}.category`, p.category),
    desc: ltGallery(`projects.${i}.desc`, p.desc),
  }));
  return (
    <CardRail label={lt('projects.rail.label', 'Featured projects')} labels={translated.map((p) => lt('projects.rail.show', 'Show {title}', { title: p.title }))}>
      {translated.map((p, i) => (
        <ProjectCard
          key={projects[i].title}
          project={p}
          image={images[i]}
          to="/projects-gallery"
          className="w-[82%] flex-none snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
        />
      ))}
    </CardRail>
  );
}
