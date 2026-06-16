import { useEffect } from "react";

/**
 * Closes a popover when the user points/taps outside `ref` or presses Escape.
 *
 * Deliberately uses a document listener instead of a full-screen overlay div.
 * A `fixed inset-0` click-away layer (especially one mounted inside an
 * AnimatePresence fragment) can get stuck on screen and silently swallow every
 * click — the classic "buttons work once, then nothing" freeze. A document
 * listener has nothing to get stuck.
 */
export default function useDismiss(ref, open, onClose) {
  useEffect(() => {
    if (!open) return;

    const onPointer = (event) => {
      if (ref.current && !ref.current.contains(event.target)) onClose();
    };
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };

    // capture phase so it runs even when inner handlers stop propagation
    document.addEventListener("pointerdown", onPointer, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [ref, open, onClose]);
}
