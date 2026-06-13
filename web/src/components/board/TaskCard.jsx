import { motion } from "motion/react";
import { formatDeadline, deadlineState } from "../../lib/format.js";

const priorityDot = {
  high: "bg-red-500",
  medium: "bg-zinc-400",
  low: "bg-zinc-300",
};

const STATUS_ORDER = ["todo", "in_progress", "done"];

export default function TaskCard({ task, onEdit, onMove, onDelete }) {
  const idx = STATUS_ORDER.indexOf(task.status);
  const canBack = idx > 0;
  const canForward = idx < STATUS_ORDER.length - 1;
  const dlState = deadlineState(task.deadline);
  const dlLabel = formatDeadline(task.deadline);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="group rounded-lg border border-zinc-200 bg-white p-3 hover:border-zinc-300 transition-colors"
    >
      <button
        type="button"
        onClick={() => onEdit(task)}
        className="block w-full text-left"
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
            <span className={`h-1.5 w-1.5 rounded-full ${priorityDot[task.priority]}`} />
            {task.priority}
          </span>
          {dlLabel && (
            <>
              <span className="text-zinc-300">·</span>
              <span
                className={`tabular font-mono ${
                  dlState === "overdue" ? "text-red-600" : "text-zinc-500"
                }`}
              >
                {dlLabel}
              </span>
            </>
          )}
        </div>
      </button>

      <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-2 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity">
        <div className="flex gap-0.5">
          <button
            type="button"
            disabled={!canBack}
            onClick={() => onMove(task, STATUS_ORDER[idx - 1])}
            className="h-7 w-7 grid place-items-center rounded text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Move back"
          >
            ←
          </button>
          <button
            type="button"
            disabled={!canForward}
            onClick={() => onMove(task, STATUS_ORDER[idx + 1])}
            className="h-7 w-7 grid place-items-center rounded text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Move forward"
          >
            →
          </button>
        </div>
        <button
          type="button"
          onClick={() => onDelete(task)}
          className="text-xs text-zinc-400 hover:text-red-600 px-2 py-1"
        >
          delete
        </button>
      </div>
    </motion.article>
  );
}
