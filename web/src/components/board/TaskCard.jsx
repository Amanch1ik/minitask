import { motion } from "motion/react";
import Avatar from "../ui/Avatar.jsx";
import { formatDeadline, deadlineState } from "../../lib/format.js";

const PRIO_RU = { low: "Низкий", medium: "Средний", high: "Высокий" };
const priorityPill = {
  high: "bg-asana-coral-soft text-asana-coral-dark",
  medium: "bg-amber-50 text-amber-700",
  low: "bg-asana-side-bg text-asana-muted",
};

const STATUS_ORDER = ["todo", "in_progress", "done"];

export default function TaskCard({ task, owner, onEdit, onMove, onDelete }) {
  const idx = STATUS_ORDER.indexOf(task.status);
  const canBack = idx > 0;
  const canForward = idx < STATUS_ORDER.length - 1;
  const dlState = deadlineState(task.deadline);
  const dlLabel = formatDeadline(task.deadline);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="group rounded-lg border border-asana-border bg-white p-3 transition-shadow hover:shadow-lift"
    >
      <button
        type="button"
        onClick={() => onEdit(task)}
        className="block w-full text-left"
      >
        <div className="flex items-start gap-2.5">
          <Checkbox done={task.status === "done"} />
          <h3
            className={`flex-1 text-[14px] font-medium leading-snug ${
              task.status === "done"
                ? "text-asana-subtle line-through"
                : "text-asana-ink"
            }`}
          >
            {task.title}
          </h3>
        </div>

        {task.description && (
          <p className="mt-1.5 ml-7 line-clamp-2 text-[13px] leading-relaxed text-asana-muted">
            {task.description}
          </p>
        )}

        <div className="mt-3 ml-7 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium ${priorityPill[task.priority]}`}
          >
            {PRIO_RU[task.priority]}
          </span>
          {dlLabel && (
            <span
              className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] tabular ${
                dlState === "overdue"
                  ? "bg-asana-coral-soft text-asana-coral-dark"
                  : "bg-asana-side-bg text-asana-muted"
              }`}
            >
              <CalIcon className="h-3 w-3" />
              {dlLabel}
            </span>
          )}
          <span className="ml-auto">
            <Avatar name={owner ?? ""} size={22} />
          </span>
        </div>
      </button>

      <div className="mt-2.5 ml-7 flex items-center justify-between border-t border-asana-border pt-2 text-[12px] transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
        <div className="flex gap-0.5">
          <button
            type="button"
            disabled={!canBack}
            onClick={() => onMove(task, STATUS_ORDER[idx - 1])}
            className="grid h-6 w-6 place-items-center rounded text-asana-muted hover:bg-asana-side-bg hover:text-asana-ink disabled:opacity-30"
            aria-label="Назад"
          >
            ←
          </button>
          <button
            type="button"
            disabled={!canForward}
            onClick={() => onMove(task, STATUS_ORDER[idx + 1])}
            className="grid h-6 w-6 place-items-center rounded text-asana-muted hover:bg-asana-side-bg hover:text-asana-ink disabled:opacity-30"
            aria-label="Вперёд"
          >
            →
          </button>
        </div>
        <button
          type="button"
          onClick={() => onDelete(task)}
          className="text-asana-muted hover:text-asana-coral"
        >
          Удалить
        </button>
      </div>
    </motion.article>
  );
}

function Checkbox({ done }) {
  return (
    <span
      className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border-[1.5px] transition-colors ${
        done
          ? "border-emerald-500 bg-emerald-500 text-white"
          : "border-asana-border-strong"
      }`}
      aria-hidden
    >
      {done && (
        <svg viewBox="0 0 12 12" className="h-2.5 w-2.5">
          <path
            d="M2.5 6.5 5 9l4.5-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}

function CalIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="none">
      <rect
        x="1.5"
        y="2.5"
        width="9"
        height="8"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M1.5 5h9M4 1.5v2M8 1.5v2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
