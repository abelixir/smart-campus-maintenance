const variants = {
  primary: 'bg-blue-600 text-white shadow-sm hover:bg-blue-700',
  secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700',
};

const sizes = {
  sm: 'h-10 px-3 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
};

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
