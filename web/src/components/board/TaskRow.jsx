import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MoreHorizontal, Trash2, ArrowRight, Pencil } from "lucide-react";
import Avatar from "../ui/Avatar.jsx";
import useDismiss from "../../hooks/useDismiss.js";
import { projectById } from "../../lib/projects.js";
import { formatDeadline, deadlineState } from "../../lib/format.js";

const PRIO_RU = { low: "Низкий", medium: "Средний", high: "Высокий" };
const priorityPill = {
  high: "bg-asana-coral-soft text-asana-coral-dark",
  medium: "bg-amber-50 text-amber-700",
  low: "bg-asana-side-bg text-asana-muted",
};
const STATUS_LABELS = { todo: "К выполнению", in_progress: "В работе", done: "Готово" };
const STATUS_ORDER = ["todo", "in_progress", "done"];
const spring = { type: "spring", stiffness: 320, damping: 30 };

/**
 * Horizontal task row for the list-style views (Today, Archive). Click to edit,
 * checkbox to complete, "…" menu to move between sections or delete.
 */
export default function TaskRow({ task, owner, projectId, onEdit, onMove, onDelete }) {
  const done = task.status === "done";
  const dlState = deadlineState(task.deadline);
  const dlLabel = formatDeadline(task.deadline);
  const project = projectById(projectId);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.16 } }}
      transition={spring}
      onClick={() => onEdit(task)}
      className="group flex cursor-pointer items-center gap-3 rounded-lg border border-asana-border bg-white px-3 py-2.5 shadow-card transition-shadow hover:shadow-lift"
    >
      <Checkbox
        done={done}
        onToggle={() => onMove(task, done ? "todo" : "done")}
      />

      <div className="min-w-0 flex-1">
        <h3
          className={`truncate text-[14px] font-medium leading-snug ${
            done ? "text-asana-subtle line-through" : "text-asana-ink"
          }`}
        >
          {task.title}
        </h3>
        {(project || task.description) && (
          <div className="mt-0.5 flex items-center gap-2 text-[12px] text-asana-muted">
            {project && (
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-[3px]" style={{ backgroundColor: project.color }} />
                {project.label}
              </span>
            )}
            {project && task.description && <span className="text-asana-border">·</span>}
            {task.description && <span className="truncate">{task.description}</span>}
          </div>
        )}
      </div>

      {dlLabel && (
        <span
          className={`hidden shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[11px] tabular sm:inline-flex ${
            dlState === "overdue" && !done
              ? "bg-asana-coral-soft text-asana-coral-dark"
              : "bg-asana-side-bg text-asana-muted"
          }`}
        >
          {dlLabel}
        </span>
      )}

      <span
        className={`hidden shrink-0 rounded px-1.5 py-0.5 text-[11px] font-medium sm:inline-flex ${priorityPill[task.priority]}`}
      >
        {PRIO_RU[task.priority]}
      </span>

      <Avatar name={owner ?? ""} size={22} className="shrink-0" />

      <RowMenu task={task} onEdit={onEdit} onMove={onMove} onDelete={onDelete} />
    </motion.div>
  );
}

function RowMenu({ task, onEdit, onMove, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const stop = (e) => e.stopPropagation();
  const targets = STATUS_ORDER.filter((s) => s !== task.status);

  useDismiss(ref, open, () => setOpen(false));

  return (
    <div ref={ref} className="relative shrink-0" onClick={stop}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Действия с задачей"
        aria-haspopup="menu"
        aria-expanded={open}
        className={`grid h-7 w-7 place-items-center rounded text-asana-muted transition-opacity hover:bg-asana-side-bg hover:text-asana-ink focus:outline-none focus-visible:shadow-focus ${
          open ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <MoreHorizontal className="h-4 w-4" strokeWidth={2} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-8 z-50 w-44 overflow-hidden rounded-lg border border-asana-border bg-white py-1 shadow-pop"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onEdit(task);
              }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] text-asana-ink hover:bg-asana-side-bg"
            >
              <Pencil className="h-3.5 w-3.5 text-asana-subtle" strokeWidth={2} />
              Изменить
            </button>
            {targets.map((s) => (
              <button
                key={s}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onMove(task, s);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] text-asana-ink hover:bg-asana-side-bg"
              >
                <ArrowRight className="h-3.5 w-3.5 text-asana-subtle" strokeWidth={2} />
                В «{STATUS_LABELS[s]}»
              </button>
            ))}
            <div className="my-1 h-px bg-asana-border" />
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onDelete(task);
              }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] text-asana-coral-dark hover:bg-asana-coral-soft"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
              Удалить
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Checkbox({ done, onToggle }) {
  const stop = (e) => e.stopPropagation();
  return (
    <button
      type="button"
      onClick={(e) => {
        stop(e);
        onToggle();
      }}
      role="checkbox"
      aria-checked={done}
      aria-label={done ? "Снять отметку «готово»" : "Отметить готовой"}
      className="grid h-[18px] w-[18px] shrink-0 place-items-center focus:outline-none"
    >
      <motion.span
        animate={done ? "done" : "todo"}
        variants={{
          done: { backgroundColor: "#10b981", borderColor: "#10b981" },
          todo: { backgroundColor: "rgba(0,0,0,0)", borderColor: "#bfbfc1" },
        }}
        transition={{ type: "spring", stiffness: 460, damping: 26 }}
        className="grid h-full w-full place-items-center rounded-full border-[1.5px] text-white"
      >
        <motion.svg
          viewBox="0 0 12 12"
          className="h-2.5 w-2.5"
          initial={false}
          animate={{ opacity: done ? 1 : 0, scale: done ? 1 : 0.6 }}
          transition={{ type: "spring", stiffness: 520, damping: 30 }}
        >
          <path d="M2.5 6.5 5 9l4.5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </motion.span>
    </button>
  );
}
