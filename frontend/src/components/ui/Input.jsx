export default function Input({
  label,
  id,
  type = 'text',
  placeholder,
  className = '',
  required = false,
  as = 'input',
  ...props
}) {
  const Component = as;

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <Component
        id={id}
        type={as === 'input' ? type : undefined}
        placeholder={placeholder}
        required={required}
        className={`w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 ${className}`}
        {...props}
      />
    </div>
  );
}
