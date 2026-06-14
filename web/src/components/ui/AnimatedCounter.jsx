import { AnimatePresence, motion } from "motion/react";

/**
 * Number that slides up/down when its value changes. Old digit exits up,
 * new digit enters from below — gives the stats line a small but constant
 * "the board is alive" feedback whenever a task moves between lanes.
 */
export default function AnimatedCounter({ value, className = "" }) {
  return (
    <span
      className={`relative inline-block overflow-hidden align-baseline tabular ${className}`}
      style={{ height: "1em", minWidth: "0.6em" }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 480, damping: 38 }}
          className="inline-block"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
