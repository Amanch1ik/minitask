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
        className={`block h-9 w-full rounded-md border bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 transition-shadow ${
          error
            ? "border-red-300 focus-visible:ring-red-200"
            : "border-zinc-200 focus-visible:ring-zinc-900/15 focus-visible:border-zinc-400"
        }`}
        {...rest}
      />
      {(hint || error) && (
        <p className={`mt-1.5 text-xs ${error ? "text-red-600" : "text-zinc-500"}`}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
});

export default Input;
