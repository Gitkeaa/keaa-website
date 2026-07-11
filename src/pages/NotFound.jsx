import { Compass } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center bg-surface">
      <div className="container-page text-center">
        <Compass className="mx-auto h-12 w-12 text-primary-dark" />
        <h1 className="mt-5 font-display text-4xl font-bold text-navy-800">404</h1>
        <p className="mt-2 text-ink/60">The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.</p>
        <Button to="/" className="mt-6">
          Back to Home
        </Button>
      </div>
    </section>
  );
}
