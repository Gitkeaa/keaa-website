import { Globe2, Phone, Mail, Linkedin } from 'lucide-react';
import { company } from '../../data/company';

export default function TopBar() {
  return (
    <div className="hidden bg-navy-900 text-white/80 lg:block">
      <div className="container-page flex items-center justify-between py-2 text-xs">
        <p className="truncate">
          Manufacturer &amp; Exporter of Scaffolding Systems, Formwork Accessories, Safety Products,
          Livestock Housing Solutions &amp; Garden Hardware.
        </p>
        <div className="flex items-center gap-5 flex-shrink-0 pl-6">
          <span className="flex items-center gap-1.5">
            <Globe2 className="h-3.5 w-3.5 text-primary-light" />
            Exporting to 42+ Countries
          </span>
          <a href={`tel:${company.phones[0]}`} className="flex items-center gap-1.5 hover:text-white">
            <Phone className="h-3.5 w-3.5 text-primary-light" />
            {company.phones[0]}
          </a>
          <a href={`mailto:${company.emails[0]}`} className="flex items-center gap-1.5 hover:text-white">
            <Mail className="h-3.5 w-3.5 text-primary-light" />
            {company.emails[0]}
          </a>
          <a href={company.social.linkedin} className="hover:text-primary-light" aria-label="LinkedIn">
            <Linkedin className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
