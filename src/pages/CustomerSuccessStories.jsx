import { Star, Quote, ArrowRight } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import SectionHeading from '../components/ui/SectionHeading';
import ImagePlaceholder from '../components/ui/ImagePlaceholder';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { testimonials, featuredProjects } from '../data/content';
import { img } from '../data/images';
import useSEO from '../hooks/useSEO';

export default function CustomerSuccessStories() {
  useSEO({
    title: 'Customer Success Stories',
    description:
      'Real testimonials and case studies from KEAA International customers across 42+ countries.',
  });

  return (
    <>
      <PageHero
        eyebrow="Customer Success Stories"
        title="Trusted"
        accent="Worldwide."
        desc="Real experiences from real customers who trust KEAA International with their construction and farming infrastructure."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Customer Success Stories' }]}
        image={img.scaffoldWorker3}
        stats={[
          { value: '2000+', label: 'Happy Customers' },
          { value: '42+', label: 'Countries Served' },
          { value: '98%', label: 'Customer Satisfaction' },
        ]}
      />

      <section className="section-pad">
        <div className="container-page">
          <SectionHeading eyebrow="What Our Customers Say" title="Testimonials" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-xl border border-black p-6 shadow-card">
                <Quote className="h-5 w-5 text-primary-dark" />
                <p className="mt-3 text-sm leading-relaxed text-ink/70">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-4 flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="mt-3 font-display text-sm font-semibold text-navy-800">{t.name}</p>
                <p className="text-xs text-ink/50">{t.company}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button variant="outlineNavy" icon={ArrowRight}>
              View More Testimonials
            </Button>
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
                  <h4 className="font-display text-sm font-semibold text-navy-800">{p.title}</h4>
                  <p className="text-xs text-ink/50">{p.location}</p>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-navy-700">
                    View Case Study <ArrowRight className="h-3 w-3" />
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
