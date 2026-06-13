import { forwardRef, useId } from "react";

/**
 * Floating-label input. The label sits inside the field as a placeholder, then
 * lifts and shrinks once the field has content or focus — done with a peer-
 * placeholder-shown trick, so it works without any React state and stays
 * keyboard-only friendly.
 *
 * Uses an underline border, not a box, to fit the editorial tone.
 */
const Input = forwardRef(function Input(
  { label, hint, error, className = "", ...rest },
  ref,
) {
  const reactId = useId();
  const id = rest.id ?? reactId;

  return (
    <div className={`relative ${className}`}>
      <input
        ref={ref}
        id={id}
        // Real placeholder is a single space so peer-placeholder-shown fires
        // only when the field is empty.
        placeholder=" "
        className={`peer block w-full bg-transparent border-b ${
          error ? "border-amber" : "border-charcoal/20 focus:border-charcoal"
        } pt-5 pb-2 outline-none text-charcoal text-[15px] transition-colors`}
        {...rest}
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-0 top-5 text-charcoal-mute text-[15px] transition-all duration-200 ease-soft peer-focus:top-0 peer-focus:text-xs peer-focus:text-charcoal-soft peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs"
      >
        {label}
      </label>
      {(hint || error) && (
        <p className={`mt-2 text-xs ${error ? "text-amber" : "text-charcoal-mute"}`}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
});

export default Input;
