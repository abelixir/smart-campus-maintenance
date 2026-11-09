import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="w-full px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-slate-50 via-white to-blue-50/60 px-6 py-14 sm:px-10 lg:px-16 lg:py-20">
        <div className="mx-auto max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">
            Campus operations
          </div>

          <h1 className="mx-auto mt-6 max-w-5xl text-4xl font-black leading-[1.02] tracking-[-0.06em] text-slate-900 sm:text-5xl lg:text-7xl">
            Smarter campus maintenance built for action.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Report issues, assign work, and keep the campus running smoothly with one clear system.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-[0_16px_40px_rgba(37,99,235,0.28)] transition hover:-translate-y-0.5"
            >
              Login to system
            </Link>
            <Link
              to="/submit-complaint"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              Submit a complaint
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;