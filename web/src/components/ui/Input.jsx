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
        <label
          htmlFor={id}
          className="mb-1.5 block text-[13px] font-medium text-charcoal"
        >
          {label}
          {rest.required && (
            <span className="ml-0.5 text-teal" aria-hidden>
              *
            </span>
          )}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={`block h-10 w-full rounded-md border bg-white px-3 text-[14px] text-charcoal placeholder:text-asana-subtle transition-all focus:outline-none ${
          error
            ? "border-clay focus-visible:shadow-focus"
            : "border-asana-border hover:border-asana-border-strong focus:border-teal focus-visible:border-teal focus-visible:shadow-focus"
        }`}
        {...rest}
      />
      {(hint || error) && (
        <p
          className={`mt-1.5 text-xs ${error ? "text-clay" : "text-asana-muted"}`}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
});

export default Input;
