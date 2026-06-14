import { useId } from "react";

/**
 * Минитаск brand mark — a rounded "app-icon" square with a coral gradient and a
 * white checkmark (the "task done" metaphor). Optionally followed by the
 * wordmark. SVG, so it stays crisp at any size.
 */
export default function Logo({ className = "", size = 28, withWord = false }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={size} />
      {withWord && (
        <span
          className="font-display font-semibold tracking-tight text-asana-ink"
          style={{ fontSize: Math.round(size * 0.56) }}
        >
          Минитаск
        </span>
      )}
    </span>
  );
}

export function LogoMark({ size = 28 }) {
  const id = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="Минитаск"
      style={{ display: "block", flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f87a6a" />
          <stop offset="1" stopColor="#ec4f4f" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${id})`} />
      {/* soft inner highlight for a little depth */}
      <rect
        x="0.75"
        y="0.75"
        width="30.5"
        height="30.5"
        rx="8.25"
        stroke="#ffffff"
        strokeOpacity="0.22"
        strokeWidth="1.5"
      />
      <path
        d="M9 16.5 L14 21.3 L23 10.7"
        stroke="#ffffff"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
