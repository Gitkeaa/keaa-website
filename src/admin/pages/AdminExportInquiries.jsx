import InquiryManager from '../components/InquiryManager';

/** Export inquiries — the export stream of the unified inquiry pipeline. */
export default function AdminExportInquiries() {
  return (
    <InquiryManager
      type="EXPORT"
      title="Export Inquiries"
      subtitle="International / export enquiries, auto-assigned by country and product line."
    />
  );
}
