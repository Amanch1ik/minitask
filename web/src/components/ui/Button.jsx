import { motion } from "motion/react";

const variants = {
  primary:
    "bg-charcoal text-cream hover:bg-charcoal-soft disabled:bg-charcoal-mute disabled:cursor-not-allowed",
  ghost:
    "bg-transparent text-charcoal hover:bg-charcoal/5 border border-transparent disabled:opacity-40",
  outline:
    "bg-transparent text-charcoal hover:bg-cream-dark border border-charcoal/15 disabled:opacity-40",
  danger:
    "bg-transparent text-charcoal-mute hover:text-amber border border-transparent",
};

const sizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-12 px-6 text-base",
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
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] }}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-colors ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
