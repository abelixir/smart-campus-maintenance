import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="bg-slate-50">
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-20 text-center sm:pt-24">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
          Smart facilities operations
        </div>
        <h1 className="mb-6 mt-6 text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
          Smart Campus Maintenance
          <br />
          <span className="text-blue-600">and Complaint Management</span>
        </h1>

        <p className="mx-auto max-w-2xl text-lg text-slate-600">
          Report issues, track progress, and resolve maintenance problems efficiently across your campus with a streamlined system built for faster action.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-3.5 text-base font-medium text-white shadow-sm transition hover:bg-blue-700"
          >
            Login to System
          </Link>
          <Link
            to="/submit-complaint"
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-8 py-3.5 text-base font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Submit a Complaint
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-800">Easy Reporting</h3>
            <p className="text-sm leading-relaxed text-slate-600">
              Submit maintenance issues with detailed descriptions, location data, and optional photos in just a few steps.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-800">Track Progress</h3>
            <p className="text-sm leading-relaxed text-slate-600">
              Follow each complaint from submission through resolution with clear status updates and task visibility.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-800">Role-Based Access</h3>
            <p className="text-sm leading-relaxed text-slate-600">
              Tailored views for staff, technicians, and administrators to ensure the right people see the right work.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;