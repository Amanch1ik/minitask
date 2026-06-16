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
const spring = { type: "spring", stiffness: 320, damping: 30 };
const tinySpring = { type: "spring", stiffness: 520, damping: 32 };

export default function TaskCard({ task, owner, onEdit, onMove, onDelete }) {
  const idx = STATUS_ORDER.indexOf(task.status);
  const canBack = idx > 0;
  const canForward = idx < STATUS_ORDER.length - 1;
  const dlState = deadlineState(task.deadline);
  const dlLabel = formatDeadline(task.deadline);

  return (
    <motion.article
      // layoutId ties the same card together when it moves between columns,
      // so dragging a task across status lanes FLIP-animates between its old
      // and new position rather than fading out and in.
      layoutId={`task-${task.id}`}
      layout
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.16 } }}
      whileHover={{ y: -2 }}
      transition={spring}
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
            className={`flex-1 text-[14px] font-medium leading-snug transition-colors ${
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
          <motion.span
            layout="position"
            className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium ${priorityPill[task.priority]}`}
          >
            {PRIO_RU[task.priority]}
          </motion.span>
          {dlLabel && (
            <motion.span
              layout="position"
              className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] tabular ${
                dlState === "overdue"
                  ? "bg-asana-coral-soft text-asana-coral-dark"
                  : "bg-asana-side-bg text-asana-muted"
              }`}
            >
              <CalIcon className="h-3 w-3" />
              {dlLabel}
            </motion.span>
          )}
          <span className="ml-auto">
            <Avatar name={owner ?? ""} size={22} />
          </span>
        </div>
      </button>

      <motion.div
        layout="position"
        className="mt-2.5 ml-7 flex items-center justify-between border-t border-asana-border pt-2 text-[12px] transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100"
      >
        <div className="flex gap-0.5">
          <motion.button
            type="button"
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.88 }}
            transition={tinySpring}
            disabled={!canBack}
            onClick={() => onMove(task, STATUS_ORDER[idx - 1])}
            className="grid h-6 w-6 place-items-center rounded text-asana-muted hover:bg-asana-side-bg hover:text-asana-ink disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Назад"
          >
            ←
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.88 }}
            transition={tinySpring}
            disabled={!canForward}
            onClick={() => onMove(task, STATUS_ORDER[idx + 1])}
            className="grid h-6 w-6 place-items-center rounded text-asana-muted hover:bg-asana-side-bg hover:text-asana-ink disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Вперёд"
          >
            →
          </motion.button>
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          transition={tinySpring}
          onClick={() => onDelete(task)}
          className="text-asana-muted hover:text-asana-coral"
        >
          Удалить
        </motion.button>
      </motion.div>
    </motion.article>
  );
}

function Checkbox({ done }) {
  return (
    <motion.span
      animate={done ? "done" : "todo"}
      variants={{
        done: { backgroundColor: "#10b981", borderColor: "#10b981" },
        todo: { backgroundColor: "rgba(0,0,0,0)", borderColor: "#bfbfc1" },
      }}
      transition={{ type: "spring", stiffness: 460, damping: 26 }}
      className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border-[1.5px] text-white"
      aria-hidden
    >
      <motion.svg
        viewBox="0 0 12 12"
        className="h-2.5 w-2.5"
        initial={false}
        animate={{ opacity: done ? 1 : 0, scale: done ? 1 : 0.6 }}
        transition={{ type: "spring", stiffness: 520, damping: 30 }}
      >
        <path
          d="M2.5 6.5 5 9l4.5-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.svg>
    </motion.span>
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
