const variants = {
  primary:
    "bg-zinc-900 text-white hover:bg-zinc-800 active:bg-zinc-700 disabled:bg-zinc-300 disabled:text-zinc-500 disabled:cursor-not-allowed",
  secondary:
    "bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50 active:bg-zinc-100 disabled:opacity-50",
  ghost:
    "bg-transparent text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200 disabled:opacity-50",
  danger:
    "bg-transparent text-zinc-500 hover:text-red-600 hover:bg-red-50 active:bg-red-100",
};

const sizes = {
  sm: "h-8 px-3 text-sm rounded-md",
  md: "h-9 px-3.5 text-sm rounded-md",
  lg: "h-10 px-4 text-sm rounded-md",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 focus-visible:ring-offset-2 ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
