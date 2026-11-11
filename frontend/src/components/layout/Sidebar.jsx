import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ open, onToggle }) {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const role = user?.role || 'reporter';
  const initials = (user?.name || 'User')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const isNavItemActive = (item) => {
    const targetPath = item.to.split('?')[0];
    const targetSearch = item.to.includes('?') ? item.to.split('?')[1] : '';

    if (location.pathname !== targetPath) {
      return false;
    }

    if (!targetSearch) {
      return !location.search || location.search === '?view=dashboard' || location.search === '?view=overview';
    }

    return location.search.includes(targetSearch);
  };

  const navItems = useMemo(() => {
    const baseItems = [{ label: 'Dashboard', to: '/dashboard' }];
    const profileItem = { label: 'Profile', to: '/profile' };

    if (role === 'reporter') {
      return [
        ...baseItems,
        { label: 'Submit complaint', to: '/submit-complaint' },
        { label: 'My complaints', to: '/my-complaints' },
        profileItem,
      ];
    }

    if (role === 'technician') {
      return [
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'My assigned tasks', to: '/dashboard?view=assigned' },
        profileItem,
      ];
    }

    if (role === 'supervisor') {
      return [
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'All complaints', to: '/dashboard?view=all' },
        profileItem,
      ];
    }

    return [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Users', to: '/admin?view=users' },
      { label: 'System overview', to: '/admin?view=overview' },
      profileItem,
    ];
  }, [role]);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    if (onToggle) onToggle(false);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col border-r border-slate-200 bg-slate-950 text-slate-50 shadow-[0_20px_60px_rgba(15,23,42,0.25)]">
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-5">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-[0_12px_30px_rgba(59,130,246,0.32)]">
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
          onClick={() => {
            setIsMobileMenuOpen(false);
            if (onToggle) onToggle(false);
          }}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-300 transition hover:border-slate-600 hover:text-white md:hidden"
          aria-label="Close sidebar"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 px-4 py-5">
        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Overview</p>
          <p className="mt-2 text-lg font-semibold text-white">Campus control</p>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (onToggle) onToggle(false);
              }}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                isNavItemActive(item)
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

      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 font-bold text-white">
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
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:text-white"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );

  if (!isAuthenticated) return null;

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-200 ease-out md:static md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      <button
        type="button"
        aria-label="Toggle sidebar"
        onClick={() => {
          setIsMobileMenuOpen(false);
          if (onToggle) onToggle(!open);
        }}
        className="fixed inset-0 z-30 bg-slate-950/45 md:hidden"
        style={{ display: open ? 'block' : 'none' }}
      />
    </>
  );
}
