import { motion, useReducedMotion } from "motion/react";

/**
 * Signature Editorial-Medical backdrop (vault: Patterns/ui-components →
 * GlowBackground). A calm cream field with two soft radial glows — teal in
 * one corner, amber in the other — plus a faint film grain so the surface
 * reads as warm and intentional rather than a flat AI gradient.
 *
 * Mounted once at the App root, behind every screen. Pointer-events are off so
 * it never intercepts clicks. The glows drift very slowly; under
 * `prefers-reduced-motion` they hold still.
 */

// Tiny tiling fractal-noise grain, inlined so there's no extra asset request.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function GlowBackground() {
  const reduce = useReducedMotion();

  const drift = (x, y) =>
    reduce
      ? {}
      : {
          animate: { x: [0, x, 0], y: [0, y, 0] },
          transition: { duration: 22, repeat: Infinity, ease: "easeInOut" },
        };

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-cream"
      aria-hidden
    >
      {/* Teal glow — top-left */}
      <motion.div
        {...drift(40, 30)}
        className="absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-teal/15 blur-[120px]"
      />
      {/* Amber glow — bottom-right */}
      <motion.div
        {...drift(-50, -36)}
        className="absolute -bottom-48 -right-40 h-[40rem] w-[40rem] rounded-full bg-amber/12 blur-[130px]"
      />
      {/* Faint cool glow — center, ties the two corners together */}
      <div className="absolute left-1/2 top-1/3 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-teal/[0.06] blur-[140px]" />

      {/* Film grain */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-multiply"
        style={{ backgroundImage: GRAIN, backgroundSize: "160px 160px" }}
      />
    </div>
  );
}
