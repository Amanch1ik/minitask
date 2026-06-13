import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { formatDeadline, deadlineState } from "../../lib/format.js";

const priorityDot = {
  high: "bg-rose-500 ring-rose-400/30",
  medium: "bg-zinc-400 ring-zinc-300/30",
  low: "bg-zinc-300 ring-zinc-200/30",
};

const STATUS_ORDER = ["todo", "in_progress", "done"];

/**
 * Mouse-parallax tilt — rotateX/Y tracks the cursor position over the card,
 * sprung so it doesn't jitter. Disabled on touch (the card has no hover state
 * anyway). Children layered with translateZ so the title floats above the
 * background.
 */
export default function TaskCard({ task, onEdit, onMove, onDelete }) {
  const ref = useRef(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

  const sx = useSpring(mx, { stiffness: 180, damping: 18, mass: 0.4 });
  const sy = useSpring(my, { stiffness: 180, damping: 18, mass: 0.4 });

  const rotateY = useTransform(sx, [0, 1], [-6, 6]);
  const rotateX = useTransform(sy, [0, 1], [4, -4]);
  const glareX = useTransform(sx, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(sy, [0, 1], ["0%", "100%"]);

  function handleMove(e) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  }
  function reset() {
    mx.set(0.5);
    my.set(0.5);
  }

  const idx = STATUS_ORDER.indexOf(task.status);
  const canBack = idx > 0;
  const canForward = idx < STATUS_ORDER.length - 1;
  const dlState = deadlineState(task.deadline);
  const dlLabel = formatDeadline(task.deadline);

  return (
    <motion.article
      ref={ref}
      layout
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1000,
        transformStyle: "preserve-3d",
      }}
      whileHover={{ y: -2 }}
      className="group relative rounded-xl border border-zinc-200/80 bg-white/85 p-3.5 shadow-card backdrop-blur-md hover:shadow-lift focus-within:shadow-glow transition-shadow"
    >
      {/* Specular glare — a soft light spot that follows the cursor across the
          surface. Pure CSS, no extra paint. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: useTransform(
            [glareX, glareY],
            ([x, y]) =>
              `radial-gradient(220px circle at ${x} ${y}, rgba(99,102,241,0.10), transparent 60%)`,
          ),
        }}
      />

      <button
        type="button"
        onClick={() => onEdit(task)}
        className="relative block w-full text-left"
        style={{ transform: "translateZ(20px)" }}
      >
        <h3 className="text-sm font-medium leading-snug text-zinc-900 break-words">
          {task.title}
        </h3>

        {task.description && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-zinc-500">
            {task.description}
          </p>
        )}

        <div className="mt-2.5 flex items-center gap-2 text-xs text-zinc-500">
          <span className="inline-flex items-center gap-1.5">
            <span
              className={`h-1.5 w-1.5 rounded-full ring-2 ${priorityDot[task.priority]}`}
            />
            {task.priority}
          </span>
          {dlLabel && (
            <>
              <span className="text-zinc-300">·</span>
              <span
                className={`tabular font-mono ${
                  dlState === "overdue" ? "text-rose-600" : "text-zinc-500"
                }`}
              >
                {dlLabel}
              </span>
            </>
          )}
        </div>
      </button>

      <div
        className="relative mt-3 flex items-center justify-between border-t border-zinc-100 pt-2 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100"
        style={{ transform: "translateZ(18px)" }}
      >
        <div className="flex gap-0.5">
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            disabled={!canBack}
            onClick={() => onMove(task, STATUS_ORDER[idx - 1])}
            className="h-7 w-7 grid place-items-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Move back"
          >
            ←
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            disabled={!canForward}
            onClick={() => onMove(task, STATUS_ORDER[idx + 1])}
            className="h-7 w-7 grid place-items-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Move forward"
          >
            →
          </motion.button>
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={() => onDelete(task)}
          className="text-xs text-zinc-400 hover:text-rose-600 px-2 py-1"
        >
          delete
        </motion.button>
      </div>
    </motion.article>
  );
}
