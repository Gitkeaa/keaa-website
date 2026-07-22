import InquiryManager from '../components/InquiryManager';

/** RFQ requests — the quotation stream of the unified inquiry pipeline. */
export default function AdminRFQ() {
  return (
    <InquiryManager
      type="RFQ"
      title="RFQ Requests"
      subtitle="Quotation requests from the website, auto-assigned to the owning sales rep."
    />
  );
}
