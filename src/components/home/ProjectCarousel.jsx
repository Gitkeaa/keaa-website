import CardRail from '../ui/CardRail';
import ProjectCard from '../ui/ProjectCard';

/**
 * The Featured Projects rail.
 *
 * Both the card and the rail-with-dots live elsewhere — see ui/ProjectCard and ui/CardRail —
 * so this only decides what goes on the rail and how wide each card sits at each breakpoint.
 */
export default function ProjectCarousel({ projects, images }) {
  return (
    <CardRail label="Featured projects" labels={projects.map((p) => `Show ${p.title}`)}>
      {projects.map((p, i) => (
        <ProjectCard
          key={p.title}
          project={p}
          image={images[i]}
          to="/projects-gallery"
          className="w-[82%] flex-none snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
        />
      ))}
    </CardRail>
  );
}
