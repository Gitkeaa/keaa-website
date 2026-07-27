import Button from '../components/ui/Button';

/**
 * 404 page: the catch-all "page not found" screen with a link back home.
 *
 * Rendered by App.jsx on the wildcard route (path="*"), so it shows for any
 * URL that matches no other route. Edit the copy or the Back to Home link here.
 */
export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center bg-surface">
      <div className="container-page text-center">
        <h1 className="font-display text-4xl font-bold text-text">404</h1>
        <p className="body-copy mx-auto text-center mt-2">The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.</p>
        <Button to="/" className="mt-6">
          Back to Home
        </Button>
      </div>
    </section>
  );
}
