import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  const role = user?.role || 'reporter';

  const navItems = [
    { label: 'Home', path: '/' },
    ...(isAuthenticated
      ? [
          { label: 'Dashboard', path: '/dashboard' },
          ...(role === 'reporter'
            ? [
                { label: 'Submit Complaint', path: '/submit-complaint' },
                { label: 'My Complaints', path: '/my-complaints' },
              ]
            : []),
          ...(role === 'technician' ? [{ label: 'My Assignments', path: '/dashboard' }] : []),
          ...(role === 'supervisor' || role === 'admin'
            ? [
                { label: 'Admin', path: '/admin' },
                { label: 'My Complaints', path: '/my-complaints' },
              ]
            : []),
        ]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V7.5A2.5 2.5 0 0 1 5.5 5H18.5A2.5 2.5 0 0 1 21 7.5V21M9 21V13H15V21M7 9h10" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">CampusCare</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `text-sm font-medium transition ${isActive ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="hidden text-sm font-medium text-slate-700 sm:inline">Hi, {user?.name?.split(' ')[0] || 'User'}</span>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 sm:inline-flex"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
