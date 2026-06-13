/**
 * Asana-style brand mark — a square with rounded corners, coral fill, and a
 * lowercase "m". Optionally followed by the wordmark.
 */
export default function Logo({ className = "", size = 28, withWord = false }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span
        className="brand-mark"
        style={{ width: size, height: size, fontSize: Math.round(size * 0.48) }}
      >
        м
      </span>
      {withWord && (
        <span className="text-[15px] font-semibold tracking-tight text-asana-ink">
          Минитаск
        </span>
      )}
    </div>
  );
}
