import { useEffect, useState } from "react";
import { MeshGradient } from "@paper-design/shaders-react";

/**
 * Layered backdrop for the auth surface. One animated WebGL layer only —
 * stacking several full-viewport shaders (each with its own rAF loop and
 * blend pass) pegs the GPU and freezes the page, especially under a
 * `backdrop-filter` element. The mesh gradient carries the drifting-colour
 * look on its own; static CSS + SVG grain do the rest for free.
 *
 * Under `prefers-reduced-motion` the WebGL layer is dropped entirely and only
 * the static fallback renders — CSS media queries do not pause a rAF shader.
 */
export default function ShaderBackdrop({ className = "" }) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}
      aria-hidden
    >
      {/* Static CSS fallback — always present, so the surface is never flat
          gray even if WebGL is disabled or motion is reduced. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 60% at 18% 22%, #fff5ec 0%, transparent 60%)," +
            "radial-gradient(70% 60% at 85% 80%, #fde4d8 0%, transparent 60%)," +
            "radial-gradient(60% 60% at 80% 12%, #fee2d6 0%, transparent 55%)," +
            "linear-gradient(135deg, #fafafa 0%, #f7f6f4 100%)",
        }}
      />

      {!reducedMotion && (
        <MeshGradient
          className="absolute inset-0 h-full w-full"
          style={{ opacity: 0.7, mixBlendMode: "multiply" }}
          colors={["#fffaf4", "#fde4d8", "#f06a6a", "#ffffff", "#fff5ec"]}
          distortion={0.8}
          swirl={0.5}
          speed={0.25}
        />
      )}

      {/* SVG fractal turbulence — film grain. Static, cheap, no GPU. */}
      <div
        className="absolute inset-0 h-full w-full opacity-[0.06] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='2' seed='4'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
      />
    </div>
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
