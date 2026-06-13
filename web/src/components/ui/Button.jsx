import { motion } from "motion/react";

const variants = {
  primary:
    "bg-zinc-900 text-white hover:bg-zinc-800 active:bg-zinc-700 disabled:bg-zinc-300 disabled:text-zinc-500 disabled:cursor-not-allowed shadow-card hover:shadow-lift",
  secondary:
    "bg-white text-zinc-900 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 active:bg-zinc-100 disabled:opacity-50 shadow-card",
  ghost:
    "bg-transparent text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200 disabled:opacity-50",
  danger:
    "bg-transparent text-zinc-500 hover:text-rose-600 hover:bg-rose-50 active:bg-rose-100",
};

const sizes = {
  sm: "h-8 px-3 text-sm rounded-md",
  md: "h-9 px-3.5 text-sm rounded-md",
  lg: "h-10 px-4 text-sm rounded-lg",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}) {
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ y: 0, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 380, damping: 24 }}
      className={`inline-flex items-center justify-center gap-1.5 font-medium transition-colors focus:outline-none focus-visible:shadow-ringFocus ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
