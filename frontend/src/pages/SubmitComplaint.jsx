import ComplaintForm from '../components/forms/ComplaintForm';

export default function SubmitComplaint() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">Report an issue</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Submit a complaint</h1>
        </div>
        <p className="text-sm text-slate-500">We aim to resolve priority issues within 24–48 hours.</p>
      </div>

      <ComplaintForm />
    </div>
  );
}
