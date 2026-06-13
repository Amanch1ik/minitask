import { forwardRef, useId } from "react";

const Input = forwardRef(function Input(
  { label, hint, error, className = "", ...rest },
  ref,
) {
  const reactId = useId();
  const id = rest.id ?? reactId;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-zinc-800">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={`block h-10 w-full rounded-lg border bg-white/80 px-3 text-sm text-zinc-900 placeholder:text-zinc-400 backdrop-blur-sm focus:outline-none transition-all ${
          error
            ? "border-rose-300 focus-visible:shadow-[0_0_0_3px_rgba(244,63,94,0.18)]"
            : "border-zinc-200 hover:border-zinc-300 focus-visible:border-accent focus-visible:shadow-ringFocus"
        }`}
        {...rest}
      />
      {(hint || error) && (
        <p className={`mt-1.5 text-xs ${error ? "text-rose-600" : "text-zinc-500"}`}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
});

export default Input;
