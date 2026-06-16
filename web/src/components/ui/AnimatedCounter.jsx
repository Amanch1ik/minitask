import { AnimatePresence, motion } from "motion/react";

/**
 * Number that softly slides + fades when its value changes — old digit drifts
 * up and out, new digit rises into place. Gives the stats line a small "the
 * board is alive" pulse whenever a task moves between lanes.
 *
 * Note: intentionally no `overflow:hidden` here. An inline-block with a clipped
 * overflow reports its *bottom edge* as the baseline (a CSS quirk), which pushes
 * the digit above the surrounding text. Keeping overflow visible preserves the
 * real text baseline, so the number sits flush with the words next to it.
 */
export default function AnimatedCounter({ value, className = "" }) {
  return (
    <span
      className={`relative inline-block align-baseline tabular ${className}`}
      style={{ minWidth: "0.6em" }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: "0.4em", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-0.4em", opacity: 0 }}
          transition={{ type: "spring", stiffness: 480, damping: 38 }}
          className="inline-block"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
