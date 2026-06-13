const variants = {
  primary:
    "bg-asana-coral text-white hover:bg-asana-coral-dark active:scale-[0.98] disabled:bg-asana-border-strong disabled:text-asana-subtle disabled:cursor-not-allowed",
  secondary:
    "bg-white text-asana-ink border border-asana-border hover:bg-asana-side-bg hover:border-asana-border-strong active:scale-[0.98] disabled:opacity-50",
  ghost:
    "bg-transparent text-asana-muted hover:bg-asana-side-bg hover:text-asana-ink active:bg-asana-side-active",
  danger:
    "bg-transparent text-asana-muted hover:text-asana-coral hover:bg-asana-coral-soft active:scale-[0.98]",
};

const sizes = {
  sm: "h-7 px-2.5 text-[13px] rounded-md",
  md: "h-8 px-3 text-[13px] rounded-md",
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
      className={`inline-flex items-center justify-center gap-1.5 font-medium transition-all focus:outline-none focus-visible:shadow-focus ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
