import { GrainGradient, MeshGradient, Swirl } from "@paper-design/shaders-react";

/**
 * Layered WebGL backdrop adapted from the Axion shader stack — tuned for the
 * Asana surface. Four layers:
 *   1. MeshGradient — soft blobs of coral / blush / cream / ink that drift
 *   2. Swirl — adds depth through low-detail rotation
 *   3. GrainGradient — coral-tinted noise gradient layered on top
 *   4. SVG turbulence — static film grain so big flat areas have texture
 */
export default function ShaderBackdrop({ className = "" }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}
      aria-hidden
    >
      {/* Static CSS fallback — sits beneath the shaders. Even if the WebGL
          context lags (or is disabled), the surface is never a flat gray. */}
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

      <MeshGradient
        className="absolute inset-0 h-full w-full"
        style={{ opacity: 0.7, mixBlendMode: "multiply" }}
        colors={["#fffaf4", "#fde4d8", "#f06a6a", "#ffffff", "#fff5ec"]}
        distortion={0.8}
        swirl={0.5}
        speed={0.25}
      />

      <Swirl
        className="absolute inset-0 h-full w-full"
        style={{ opacity: 0.35, mixBlendMode: "soft-light" }}
        colorA="#ffffff"
        colorB="#fde4d8"
        bgColor="#00000000"
        detail={1.7}
        speed={0.3}
        proportion={0.45}
      />

      <GrainGradient
        className="absolute inset-0 h-full w-full"
        style={{ opacity: 0.45, mixBlendMode: "soft-light" }}
        colors={["#ffffff", "#fee2d6", "#f06a6a"]}
        softness={1}
        intensity={0.55}
        noise={0.25}
        shape="corners"
        speed={0.18}
      />

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
