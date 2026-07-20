import { NavLink } from 'react-router-dom';
import { ADMIN_ICONS as Icons } from '../adminIcons';
import { navForRole, ROLE_LABELS } from '../auth/roles';
import { useAdminAuth } from '../auth/AdminAuthContext';

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
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-dark font-display text-lg font-bold">
          K
        </span>
        <div className="leading-tight">
          <p className="font-display text-sm font-bold tracking-tight">KEAA Admin</p>
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
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/10 font-display text-sm font-bold uppercase">
            {(user?.name || '?').charAt(0)}
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-medium capitalize">{user?.name}</p>
            <p className="truncate text-[11px] text-white/50">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
