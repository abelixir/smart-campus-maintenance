export default function Card({ children, className = '', hover = false }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-[0_12px_35px_rgba(15,23,42,0.04)] ${
        hover ? 'transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(15,23,42,0.06)]' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
