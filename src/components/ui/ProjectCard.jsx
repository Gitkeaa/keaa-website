import { Link } from 'react-router-dom';
import { useLT } from '../../i18n/LocaleContext';

/**
 * A project card: the photograph fills the card and the copy sits on top of it over a scrim,
 * rather than in a white block underneath.
 *
 * The scrim is anchored to the bottom because the copy only ever occupies the lower third —
 * a flat overlay would dull the whole photograph just to protect two lines of type.
 *
 * Two props carry the differences between the places it is used, so the design itself only
 * exists once:
 *
 *   `to`        optional. The Home page links these through to the gallery. On the gallery
 *               page there is nowhere further to go — there is no project-detail route — so
 *               the card renders as a plain block rather than showing an affordance that
 *               could never resolve.
 *   `withDesc`  the gallery is where projects are actually browsed, so it shows the one-line
 *               description as well. Home keeps to label + title, which is all a teaser rail
 *               needs.
 */
export default function ProjectCard({ project, image, to, withDesc = false, className = '' }) {
  const lt = useLT('gallery');
  const body = (
    <>
      <img
        src={image}
        alt={project.title}
        loading="lazy"
        className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <span
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/45 to-transparent"
      />
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <p className="text-[13px] font-bold leading-tight text-white/85">
          {/* The separator appears only when there is a location to separate. Application
              areas carry none; a real project record does, and this renders it again with no
              other change. */}
          {project.category}
          {project.location ? <> &middot; {project.location}</> : null}
        </p>
        <h3 className="mt-1.5 font-display text-xl font-semibold leading-snug text-white">
          {project.title}
        </h3>
        {withDesc && project.desc && (
          <p className="mt-2 text-body-compact leading-relaxed text-white/80">{project.desc}</p>
        )}
        {to && (
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-white">
            {lt('card.learnMore', 'Learn more')}
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
              &rarr;
            </span>
          </span>
        )}
      </div>
    </>
  );

  const shell = `group relative block overflow-hidden rounded-card ${className}`;

  return to ? (
    <Link to={to} className={shell}>
      {body}
    </Link>
  ) : (
    <div className={shell}>{body}</div>
  );
}
