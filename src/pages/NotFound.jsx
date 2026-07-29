import Button from '../components/ui/Button';
import { useLT } from '../i18n/LocaleContext';

/**
 * 404 page: the catch-all "page not found" screen with a link back home.
 *
 * Rendered by App.jsx on the wildcard route (path="*"), so it shows for any
 * URL that matches no other route. Edit the copy or the Back to Home link here.
 */
export default function NotFound() {
  const lt = useLT('notFound');
  return (
    <section className="flex min-h-[60vh] items-center justify-center bg-surface">
      <div className="container-page text-center">
        <h1 className="font-display text-4xl font-bold text-text">404</h1>
        <p className="body-copy mx-auto text-center mt-2">{lt('message', 'The page you’re looking for doesn’t exist or has moved.')}</p>
        <Button to="/" className="mt-6">
          {lt('back', 'Back to Home')}
        </Button>
      </div>
    </section>
  );
}
