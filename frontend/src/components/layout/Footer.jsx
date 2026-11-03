import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V7.5A2.5 2.5 0 0 1 5.5 5H18.5A2.5 2.5 0 0 1 21 7.5V21M9 21V13H15V21M7 9h10" />
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-900">CampusCare</span>
          </div>
          <p className="max-w-md text-sm leading-6 text-slate-600">
            Smart campus maintenance and complaint management for faster issue resolution, better communication, and safer facilities.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Quick Links</h3>
          <ul className="space-y-3 text-sm text-slate-600">
            <li><Link to="/" className="hover:text-slate-900">Home</Link></li>
            <li><Link to="/dashboard" className="hover:text-slate-900">Dashboard</Link></li>
            <li><Link to="/submit-complaint" className="hover:text-slate-900">Submit Complaint</Link></li>
            <li><Link to="/my-complaints" className="hover:text-slate-900">My Complaints</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Contact</h3>
          <ul className="space-y-3 text-sm text-slate-600">
            <li>support@campuscare.io</li>
            <li>+1 (800) 234-5678</li>
            <li>Building A, Admin Block</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 text-sm text-slate-500 sm:px-6 lg:px-8">
          <span>© 2026 CampusCare. All rights reserved.</span>
          <span>Built for efficient campus operations</span>
        </div>
      </div>
    </footer>
  );
}
