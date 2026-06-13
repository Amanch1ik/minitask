import { motion } from "motion/react";

/**
 * Three layered planes offset in z form a real 3D mark. The back planes are
 * tinted lighter (atmospheric perspective). On idle the whole thing rocks
 * very slowly so you can see the depth even when nobody hovers.
 */
export default function Logo({ className = "", size = 36, withWord = false }) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.42) };
  return (
    <motion.div
      className={`flex items-center gap-2.5 ${className}`}
      initial="rest"
      whileHover="hover"
    >
      <motion.div
        className="logo-3d"
        style={style}
        variants={{
          rest: { rotateX: -16, rotateY: 22 },
          hover: { rotateX: -6, rotateY: -22 },
        }}
        animate={{ rotateZ: [0, 2, 0, -2, 0] }}
        transition={{
          rotateZ: { duration: 9, ease: "easeInOut", repeat: Infinity },
          default: { type: "spring", stiffness: 240, damping: 20 },
        }}
      >
        <span className="lp-back" />
        <span className="lp-mid" />
        <span className="lp-front">m</span>
      </motion.div>
      {withWord && (
        <span className="text-sm font-semibold tracking-tight text-zinc-900">
          minitask
        </span>
      )}
    </motion.div>
  );
}
