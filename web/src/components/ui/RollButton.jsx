import { ArrowRight } from "lucide-react";

/**
 * Adapted from the Axion landing — the label slides up by 100% on hover
 * (slot-machine style, with a duplicated copy taking its place) and the
 * arrow icon rotates -45deg out of a contrasting circle. Same easing curve
 * Axion uses for "feels expensive": cubic-bezier(0.25, 0.1, 0.25, 1).
 */
const variants = {
  // Asana coral — primary
  coral: {
    pill: "bg-asana-coral text-white hover:bg-asana-coral-dark",
    circle: "bg-white text-asana-coral",
    arrow: "text-asana-coral",
  },
  // Ink dark — alternative on light backgrounds
  ink: {
    pill: "bg-asana-ink text-white hover:bg-asana-ink/85",
    circle: "bg-white text-asana-ink",
    arrow: "text-asana-ink",
  },
};

const EASE = "ease-[cubic-bezier(0.25,0.1,0.25,1)]";

export default function RollButton({
  variant = "coral",
  children,
  className = "",
  type = "button",
  disabled = false,
  ...rest
}) {
  const v = variants[variant];
  return (
    <button
      type={type}
      disabled={disabled}
      className={`group inline-flex items-center gap-2.5 rounded-full pl-5 pr-1.5 py-1.5 text-[14px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${v.pill} ${className}`}
      {...rest}
    >
      <span className="block h-[20px] overflow-hidden leading-[20px]">
        <span
          className={`flex flex-col transition-transform duration-500 ${EASE} group-hover:-translate-y-1/2`}
        >
          <span className="block leading-[20px]">{children}</span>
          <span className="block leading-[20px]">{children}</span>
        </span>
      </span>
      <span
        className={`grid h-7 w-7 place-items-center rounded-full transition-transform duration-500 ${EASE} group-hover:-rotate-45 ${v.circle}`}
      >
        <ArrowRight size={14} strokeWidth={2.4} />
      </span>
    </button>
  );
}
