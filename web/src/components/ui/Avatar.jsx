/**
 * Avatar circle with initials. The colour comes from a stable hash of the
 * input string so the same user keeps the same colour.
 */
const palette = [
  ["#818cf8", "#c084fc"], // indigo→violet
  ["#34d399", "#10b981"], // emerald
  ["#fb923c", "#f59e0b"], // orange
  ["#60a5fa", "#3b82f6"], // blue
  ["#f472b6", "#ec4899"], // pink
  ["#a78bfa", "#7c3aed"], // violet
  ["#2dd4bf", "#0d9488"], // teal
];

function colourFor(seed = "") {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return palette[Math.abs(h) % palette.length];
}

export default function Avatar({ name = "", size = 28, className = "" }) {
  const initials = name
    .split(/[\s.@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const [a, b] = colourFor(name);
  return (
    <span
      className={`avatar ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, Math.round(size * 0.4)),
        background: `linear-gradient(135deg, ${a}, ${b})`,
      }}
      aria-hidden
    >
      {initials || "·"}
    </span>
  );
}
