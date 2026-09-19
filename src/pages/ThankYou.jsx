import { Link, useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import Button from '../components/ui/Button';
import { company } from '../data/company';
import useSEO from '../hooks/useSEO';
import { useLT } from '../i18n/LocaleContext';

/**
 * /thank-you/:type: the page a visitor lands on after a form goes through.
 *
 * WHY A URL RATHER THAN AN INLINE PANEL
 * -------------------------------------
 * A form that swaps its own contents for a success message leaves no trace anywhere a
 * measurement tool can see. There is no page view, no address, nothing to count. Every
 * analytics setup, and every ads platform, counts conversions by "someone reached this
 * address", so an enquiry that never changes the address is an enquiry nobody can count.
 * Giving each form its own thank-you URL is what turns rankings into a number the owner can
 * check, which is the whole point of section 6 of the SEO brief.
 *
 * Nothing is lost by moving it here: the submission has already succeeded before the
 * navigation happens, so a lead can never be lost to this redirect. If the POST fails, the
 * form stays where it is and shows the error.
 *
 * noindex, because a thank-you page has no business in search results. Someone arriving here
 * from Google has not submitted anything and would just be confused, and the address would
 * report conversions that never happened.
 */

/** What each form is called, and where it makes sense to send the person next. */
const TYPES = {
  quote: {
    heading: 'Your quotation request is with us',
    body: 'Our sales team will come back to you with pricing and a lead time. If your enquiry included drawings or a parts list, it has gone through with the request.',
  },
  export: {
    heading: 'Your export enquiry is with us',
    body: 'Our export desk will come back to you with a quotation. If you told us the destination port and the volumes, that is with the enquiry.',
  },
  contact: {
    heading: 'Thanks, your message is with us',
    body: 'Someone from the right team will reply to you directly.',
  },
  catalogue: {
    heading: 'Your catalogue request is with us',
    body: 'The download should have opened already. If it did not, the link is on the downloads page.',
  },
  careers: {
    heading: 'Your application is with us',
    body: 'Our HR team reviews every application and will be in touch if there is a fit.',
  },
};

export default function ThankYou() {
  const { type } = useParams();
  const lt = useLT('thankYou');
  const meta = TYPES[type] || TYPES.contact;
  const known = Boolean(TYPES[type]);

  useSEO({
    title: lt('seo.title', 'Thank you'),
    description: lt('seo.description', 'We have received your enquiry.'),
    noindex: true,
  });

  return (
    <section className="section-pad">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary-dark">
            <CheckCircle2 className="h-7 w-7" aria-hidden />
          </span>
          <h1 className="mt-5 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
            {lt(`${known ? type : 'contact'}.heading`, meta.heading)}
          </h1>
          <p className="body-copy mx-auto mt-4 text-center">
            {lt(`${known ? type : 'contact'}.body`, meta.body)}
          </p>

          <p className="mt-6 text-sm text-muted">
            {lt('urgent', 'If it is urgent, call {phone}.', { phone: company.phones[0] })}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button to="/products">{lt('browse', 'Browse the product range')}</Button>
            <Button to="/downloads" variant="secondary">
              {lt('catalogues', 'Download the catalogues')}
            </Button>
          </div>

          <p className="mt-10 text-sm text-muted">
            <Link to="/" className="underline-offset-4 transition-colors hover:text-primary-dark hover:underline">
              {lt('home', 'Back to the homepage')}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
