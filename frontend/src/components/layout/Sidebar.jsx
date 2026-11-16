import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ open, onToggle }) {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const role = user?.role || 'reporter';
  const initials = (user?.name || 'User')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const isNavItemActive = (path) => {
    if (path.includes('?')) {
      return location.pathname + location.search === path;
    }
    return location.pathname === path;
  };

  const navItems = useMemo(() => {
    const profileItem = { label: 'Profile', to: '/profile' };

    if (role === 'reporter') {
      return [
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Submit complaint', to: '/submit-complaint' },
        { label: 'My complaints', to: '/my-complaints' },
        profileItem,
      ];
    }

    if (role === 'technician') {
      return [
        { label: 'My Tasks', to: '/dashboard' },
        profileItem,
      ];
    }

    if (role === 'supervisor') {
      return [
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Evaluation', to: '/evaluation' },
        profileItem,
      ];
    }

    // admin – single clean Admin Panel link
    return [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Evaluation', to: '/evaluation' },
      { label: 'Admin Panel', to: '/admin' },
      profileItem,
    ];
  }, [role]);

  const handleLogout = () => {
    logout();
    if (onToggle) onToggle(false);
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-slate-950 text-slate-50 transition-transform duration-200 ease-out md:static md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 px-5">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V7.5A2.5 2.5 0 0 1 5.5 5H18.5A2.5 2.5 0 0 1 21 7.5V21M9 21V13H15V21M7 9h10" />
              </svg>
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-white">CampusCare</div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Operations</div>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => onToggle && onToggle(false)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 text-slate-300 md:hidden"
            aria-label="Close sidebar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation (scrollable if many items) */}
        <div className="flex-1 overflow-y-auto px-4 py-5">
          <div className="mb-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Overview</p>
            <p className="mt-1 text-sm font-semibold text-white">Campus control</p>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => onToggle && onToggle(false)}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                  isNavItemActive(item.to)
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-blue-400" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* User + Logout – always visible at bottom */}
        <div className="shrink-0 border-t border-slate-800 p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-sm font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{user?.name || 'User'}</p>
              <p className="truncate text-[10px] uppercase tracking-[0.14em] text-slate-400">{role}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => onToggle && onToggle(false)}
          className="fixed inset-0 z-30 bg-slate-950/50 md:hidden"
        />
      )}
    </>
  );
}