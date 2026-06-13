import { AnimatePresence, motion } from "motion/react";
import TaskCard from "./TaskCard.jsx";

const COLUMN_META = {
  todo: { label: "К выполнению", dot: "bg-asana-subtle" },
  in_progress: { label: "В работе", dot: "bg-chip-blue" },
  done: { label: "Готово", dot: "bg-chip-green" },
};

const ease = [0.16, 1, 0.3, 1];

export default function StatusColumn({
  status,
  tasks,
  owner,
  index = 0,
  onEdit,
  onMove,
  onDelete,
  onAdd,
}) {
  const meta = COLUMN_META[status];
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease, delay: 0.04 * index }}
      className="flex min-w-0 flex-col rounded-xl bg-asana-side-bg/60 p-3"
    >
      <header className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-asana-ink">
            {meta.label}
          </h2>
          <span className="rounded bg-white px-1.5 text-[11px] tabular text-asana-muted ring-1 ring-asana-border">
            {tasks.length}
          </span>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="grid h-6 w-6 place-items-center rounded-md text-asana-muted hover:bg-white hover:text-asana-ink"
          aria-label="Добавить задачу"
        >
          +
        </button>
      </header>

      <motion.ul layout className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {tasks.map((task) => (
            <motion.li key={task.id} layout>
              <TaskCard
                task={task}
                owner={owner}
                onEdit={onEdit}
                onMove={onMove}
                onDelete={onDelete}
              />
            </motion.li>
          ))}
        </AnimatePresence>

        {tasks.length === 0 && (
          <li>
            <button
              type="button"
              onClick={onAdd}
              className="block w-full rounded-md border border-dashed border-asana-border-strong/60 px-3 py-3 text-left text-[13px] text-asana-subtle hover:border-asana-coral hover:text-asana-coral"
            >
              + Добавить задачу
            </button>
          </li>
        )}
      </motion.ul>
    </motion.section>
  );
}
