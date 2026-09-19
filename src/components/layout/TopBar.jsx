import { Globe2, Phone, Mail, Linkedin } from 'lucide-react';
import { company } from '../../data/company';
import { useLT } from '../../i18n/LocaleContext';
import { track, EVENTS } from '../../lib/analytics';

export default function TopBar() {
  const lt = useLT('common');
  return (
    <div className="hidden bg-navy-900 text-white/75 lg:block">
      <div className="container-page flex items-center justify-between py-2 text-xs">
        {/* The long "Manufacturer & Exporter of…" tagline was dropped — the hero headline
            already says what KEAA makes, so this bar is just a slim utility strip now. */}
        <span className="flex items-center gap-1.5">
          <Globe2 className="h-3.5 w-3.5 text-primary-light" />
          {lt('topBar.tagline', 'Exporting to 42+ countries worldwide')}
        </span>
        <div className="flex items-center gap-6 flex-shrink-0 pl-6">
          <a
            href={`tel:${company.phones[0]}`}
            onClick={() => track(EVENTS.phoneClick, { location: 'topbar' })}
            className="flex items-center gap-1.5 transition-colors hover:text-white"
          >
            <Phone className="h-3.5 w-3.5 text-primary-light" />
            {company.phones[0]}
          </a>
          <a href={`mailto:${company.emails[0]}`} className="flex items-center gap-1.5 transition-colors hover:text-white">
            <Mail className="h-3.5 w-3.5 text-primary-light" />
            {company.emails[0]}
          </a>
          <a href={company.social.linkedin} className="transition-colors hover:text-primary-light" aria-label="LinkedIn">
            <Linkedin className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
