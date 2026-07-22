import { NavLink } from 'react-router-dom';
import { ADMIN_ICONS as Icons } from '../adminIcons';
import { navForRole, ROLE_LABELS } from '../auth/roles';
import { useAdminAuth } from '../auth/AdminAuthContext';
import { resolveUpload } from '../api/client';

/** The KEAA cube mark — the same three faces the public logo and the login screen use. */
function CubeMark({ className = 'h-9 w-9' }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <defs>
        <mask id="admin-sidebar-cube">
          <rect x="0" y="0" width="100" height="100" fill="white" />
          <line x1="50" y1="50" x2="5" y2="50" stroke="black" strokeWidth="5.5" />
          <line x1="50" y1="50" x2="73" y2="10" stroke="black" strokeWidth="5.5" />
          <line x1="50" y1="50" x2="73" y2="90" stroke="black" strokeWidth="5.5" />
        </mask>
      </defs>
      <g mask="url(#admin-sidebar-cube)">
        <polygon points="10,50 30,15.36 70,15.36 50,50" fill="#79c7f9" />
        <polygon points="10,50 50,50 70,84.64 30,84.64" fill="#2b84da" />
        <polygon points="50,50 70,15.36 90,50 70,84.64" fill="#2065be" />
      </g>
    </svg>
  );
}

/**
 * The left navigation. Items are filtered to the signed-in user's role, so the same shell
 * serves the future HR / Employee / Sales dashboards — they simply see fewer links.
 */
export default function AdminSidebar({ onNavigate }) {
  const { role, user } = useAdminAuth();
  const items = navForRole(role);

  return (
    <div className="flex h-full flex-col bg-navy-900 text-white">
      {/* Brand */}
      <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-4">
        <CubeMark className="h-9 w-9 flex-shrink-0" />
        <div className="leading-tight">
          <p className="font-display text-sm font-bold tracking-tight">KEAA Portal</p>
          <p className="text-[11px] text-white/50">{ROLE_LABELS[role] || 'Console'}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Admin">
        {items.map((item) => {
          const Icon = Icons[item.icon] || Icons.Circle;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-dark text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon className="h-[18px] w-[18px] flex-shrink-0" strokeWidth={2} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-white/10 px-4 py-3">
        <div className="flex items-center gap-3">
          {user?.avatarUrl ? (
            <img src={resolveUpload(user.avatarUrl)} alt="" className="h-9 w-9 flex-shrink-0 rounded-full object-cover" />
          ) : (
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/10 font-display text-sm font-bold uppercase">
              {(user?.name || '?').charAt(0)}
            </span>
          )}
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-medium capitalize">{user?.name}</p>
            <p className="truncate text-[11px] text-white/50">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
