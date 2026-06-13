import { useEffect } from "react";

/**
 * Stacks the page-wide ambient layers and wires the spotlight to the cursor.
 *   - noise: subtle grain over the white canvas
 *   - bg: dotted-grid that drifts
 *   - mesh: three blurred chromatic blobs slowly orbiting
 *   - spot: warm radial light following the cursor (CSS var driven)
 *   - shapes: two slow-floating abstract SVG meshes in opposite corners
 *
 * Everything sits under content via negative z-index.
 */
export default function Ambient() {
  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;
    let pendingX = window.innerWidth / 2;
    let pendingY = window.innerHeight * 0.3;

    function apply() {
      frame = 0;
      root.style.setProperty("--spot-x", `${pendingX}px`);
      root.style.setProperty("--spot-y", `${pendingY}px`);
    }
    function onMove(e) {
      pendingX = e.clientX;
      pendingY = e.clientY;
      if (!frame) frame = requestAnimationFrame(apply);
    }
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <div className="ambient-noise" aria-hidden />
      <div className="ambient-bg" aria-hidden />
      <div className="ambient-mesh" aria-hidden>
        <i />
        <i />
        <i />
      </div>
      <div className="ambient-spot" aria-hidden />

      {/* Top-left abstract sphere */}
      <svg
        aria-hidden
        className="float-shape animate-float hidden md:block"
        style={{
          top: "12vh",
          left: "-8vw",
          width: 180,
          height: 180,
          opacity: 0.85,
        }}
        viewBox="0 0 200 200"
      >
        <defs>
          <radialGradient id="g1" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#a5b4fc" />
            <stop offset="55%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="78" fill="url(#g1)" opacity="0.85" />
        <circle cx="76" cy="78" r="14" fill="#fff" opacity="0.5" />
      </svg>

      {/* Bottom-right abstract torus knot (svg path) */}
      <svg
        aria-hidden
        className="float-shape animate-float hidden md:block"
        style={{
          bottom: "10vh",
          right: "-8vw",
          width: 220,
          height: 220,
          opacity: 0.7,
          animationDelay: "-3.5s",
        }}
        viewBox="0 0 200 200"
      >
        <defs>
          <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        <path
          d="M100 30 Q160 60 160 100 Q160 160 100 170 Q40 160 40 100 Q40 60 100 30 Z"
          fill="url(#g2)"
          opacity="0.55"
          transform="rotate(-12 100 100)"
        />
        <path
          d="M100 55 Q140 75 140 100 Q140 140 100 145 Q60 140 60 100 Q60 75 100 55 Z"
          fill="#fff"
          opacity="0.3"
        />
      </svg>
    </>
  );
}
