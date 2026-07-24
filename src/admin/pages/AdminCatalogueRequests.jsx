import InquiryManager from '../components/InquiryManager';

/**
 * Catalogue Requests — the leads captured by the download gate on the public Downloads Center.
 *
 * A visitor who wants a catalogue fills a short form first; the backend turns that into a
 * CATALOGUE inquiry, so these run the same pipeline as every other lead (auto-assignment,
 * status workflow, activity trail) and need no screen of their own beyond this stream.
 */
export default function AdminCatalogueRequests() {
  return (
    <InquiryManager
      type="CATALOGUE"
      title="Catalogue Requests"
      subtitle="Visitors who downloaded a catalogue from the website, auto-assigned by country and product line."
    />
  );
}
