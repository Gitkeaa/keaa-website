import GalleryHero from '../components/gallery/GalleryHero';
import { heroSlides } from '../data/heroSlides';
import SectionHeading from '../components/ui/SectionHeading';
import ImagePlaceholder from '../components/ui/ImagePlaceholder';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { testimonials, featuredProjects } from '../data/content';
import useSEO from '../hooks/useSEO';

export default function CustomerSuccessStories() {
  useSEO({
    title: 'Customer Success Stories',
    description:
      'Real testimonials and case studies from KEAA International customers across 42+ countries.',
  });

  return (
    <>
      <GalleryHero
        eyebrow="Customer Success Stories"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Customer Success Stories' }]}
        slides={heroSlides.customerSuccess}
        stats={[
          { value: '2000+', label: 'Happy Customers' },
          { value: '42+', label: 'Countries Served' },
          { value: '98%', label: 'Customer Satisfaction' },
        ]}
        scrollTo="content"
      />

      <section id="content" className="section-pad">
        <div className="container-page">
          <SectionHeading eyebrow="What Our Customers Say" title="Testimonials" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-card border border-navy-100 p-6 shadow-card">
                <p className="text-body-compact leading-relaxed text-ink">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-darker">
                    Rating
                  </p>
                  <p className="mt-1 text-body-compact text-ink">5 out of 5</p>
                </div>
                <p className="mt-3 font-display text-body-compact font-semibold text-text">{t.name}</p>
                <p className="text-xs text-muted">{t.company}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button variant="outlineNavy">View More Testimonials</Button>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-page">
          <SectionHeading eyebrow="Case Study Highlights" title="Success Stories from the Field" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProjects.slice(0, 4).map((p) => (
              <Card key={p.title} className="overflow-hidden">
                <ImagePlaceholder label={p.title} ratio="aspect-[4/3]" />
                <div className="p-4">
                  <h4 className="font-display text-sm font-semibold text-text">{p.title}</h4>
                  <p className="text-xs text-muted">{p.location}</p>
                  <span className="mt-2 inline-block border-b border-transparent pb-0.5 text-xs font-medium text-navy-700 transition-colors hover:border-primary hover:text-primary-darker">
                    View Case Study
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
