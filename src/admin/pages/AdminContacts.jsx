import InquiryManager from '../components/InquiryManager';

/** Contact messages — the general-enquiry stream of the unified inquiry pipeline. */
export default function AdminContacts() {
  return (
    <InquiryManager
      type="CONTACT"
      title="Contact Messages"
      subtitle="Enquiries from the website's contact form, routed to the owning team member."
    />
  );
}
