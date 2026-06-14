import { motion } from "motion/react";

/**
 * Text with a shine that sweeps continuously across it, left to right.
 *
 * The fill is a horizontal gradient — base colour, a bright shine band in the
 * middle, base colour again — clipped to the glyphs. We animate the gradient's
 * background-position so the shine band travels across. Base colour sits on
 * both gradient ends, so the loop is seamless with no visible jump.
 *
 * @param {string} children      text to render
 * @param {string} [baseColor]   resting colour of the text
 * @param {string} [shineColor]  colour of the moving highlight
 * @param {number} [speed]       seconds for one full sweep
 * @param {number} [spread]      gradient angle in degrees
 * @param {string} [className]   extra classes (sizing, weight, tracking)
 */
export default function ShinyText({
  children,
  baseColor = "#64CEFB",
  shineColor = "#ffffff",
  speed = 3,
  spread = 100,
  className = "",
}) {
  const gradient =
    `linear-gradient(${spread}deg, ` +
    `${baseColor} 0%, ${baseColor} 38%, ` +
    `${shineColor} 50%, ` +
    `${baseColor} 62%, ${baseColor} 100%)`;

  return (
    <motion.span
      className={className}
      style={{
        display: "inline-block",
        backgroundImage: gradient,
        backgroundSize: "220% 100%",
        backgroundRepeat: "no-repeat",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
        color: "transparent",
      }}
      animate={{ backgroundPosition: ["200% 50%", "-20% 50%"] }}
      transition={{ duration: speed, ease: "linear", repeat: Infinity }}
    >
      {children}
    </motion.span>
  );
}
