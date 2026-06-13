import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

/**
 * Same look as Button but the element follows the cursor slightly when the
 * pointer is near, then springs back. Used for the auth submit / primary
 * CTAs. Falls back to a plain `<button>` for touch and reduced-motion users.
 */
const variants = {
  primary:
    "bg-zinc-900 text-white hover:bg-zinc-800 active:bg-zinc-700 disabled:bg-zinc-300 disabled:text-zinc-500 disabled:cursor-not-allowed shadow-lift",
  secondary:
    "bg-white text-zinc-900 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 active:bg-zinc-100 disabled:opacity-50 shadow-card",
};

const sizes = {
  md: "h-10 px-4 text-sm rounded-lg",
  lg: "h-11 px-5 text-sm rounded-xl",
};

export default function MagneticButton({
  variant = "primary",
  size = "lg",
  pull = 14,
  className = "",
  children,
  ...rest
}) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 14, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 14, mass: 0.4 });

  function onMove(e) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set(((e.clientX - cx) / rect.width) * pull * 2);
    y.set(((e.clientY - cy) / rect.height) * pull * 2);
  }
  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.button
      ref={ref}
      style={{ x: sx, y: sy }}
      whileTap={{ scale: 0.97 }}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className={`inline-flex items-center justify-center gap-2 font-medium transition-colors focus:outline-none focus-visible:shadow-ringFocus ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
