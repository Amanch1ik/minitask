import { motion } from "motion/react";
import { formatDeadline, deadlineState } from "../../lib/format.js";

const priorityDot = {
  high: "bg-amber",
  medium: "bg-charcoal-mute",
  low: "bg-cream-deeper",
};

const deadlineTone = {
  overdue: "text-amber",
  soon: "text-charcoal",
  later: "text-charcoal-mute",
  none: "text-charcoal-mute",
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="group relative rounded-card bg-cream p-4 shadow-soft hover:shadow-card ring-1 ring-cream-deeper transition-shadow"
    >
      <button
        type="button"
        onClick={() => onEdit(task)}
        className="block w-full text-left"
      >
        <h3 className="font-medium leading-tight text-charcoal break-words">
          {task.title}
        </h3>

        {task.description && (
          <p className="mt-2 line-clamp-2 text-sm text-charcoal-soft">
            {task.description}
          </p>
        )}

        <div className="mt-3 flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5 text-charcoal-mute uppercase tracking-wide">
            <span className={`h-1.5 w-1.5 rounded-full ${priorityDot[task.priority]}`} />
            {task.priority}
          </span>
          {dlLabel && (
            <span className={`tabular ${deadlineTone[dlState]}`}>
              {dlState === "overdue" ? "overdue · " : ""}{dlLabel}
            </span>
          )}
        </div>
      </button>

      <div className="mt-3 flex items-center justify-between border-t border-cream-deeper pt-3 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <div className="flex gap-1">
          <button
            type="button"
            disabled={!canBack}
            onClick={() => onMove(task, STATUS_ORDER[idx - 1])}
            className="h-7 w-7 rounded-chip text-charcoal-mute hover:bg-cream-dark disabled:opacity-30"
            aria-label="Move back"
          >
            ←
          </button>
          <button
            type="button"
            disabled={!canForward}
            onClick={() => onMove(task, STATUS_ORDER[idx + 1])}
            className="h-7 w-7 rounded-chip text-charcoal-mute hover:bg-cream-dark disabled:opacity-30"
            aria-label="Move forward"
          >
            →
          </button>
        </div>
        <button
          type="button"
          onClick={() => onDelete(task)}
          className="text-xs text-charcoal-mute hover:text-amber"
        >
          delete
        </button>
      </div>
    </motion.article>
  );
}
