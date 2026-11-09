import ComplaintForm from '../components/forms/ComplaintForm';

export default function SubmitComplaint() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-[28px] border border-slate-200 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)] backdrop-blur-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">Report an issue</p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-slate-900">Submit a complaint</h1>
          </div>
          <p className="text-sm text-slate-500">We aim to resolve priority issues within 24–48 hours.</p>
        </div>
      </div>

      <ComplaintForm />
    </div>
  );
}
