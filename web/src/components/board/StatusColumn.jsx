import { AnimatePresence, motion } from "motion/react";
import TaskCard from "./TaskCard.jsx";

const COLUMN_META = {
  todo: { label: "Todo", dot: "bg-zinc-400" },
  in_progress: { label: "In progress", dot: "bg-blue-500" },
  done: { label: "Done", dot: "bg-emerald-500" },
};

export default function StatusColumn({ status, tasks, onEdit, onMove, onDelete }) {
  const meta = COLUMN_META[status];
  return (
    <section className="flex min-w-0 flex-col">
      <header className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
          <h2 className="text-sm font-semibold text-zinc-900">{meta.label}</h2>
          <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs tabular text-zinc-600">
            {tasks.length}
          </span>
        </div>
      </header>

      <motion.ul
        layout
        className="flex flex-col gap-2"
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <AnimatePresence initial={false}>
          {tasks.map((task) => (
            <li key={task.id}>
              <TaskCard
                task={task}
                onEdit={onEdit}
                onMove={onMove}
                onDelete={onDelete}
              />
            </li>
          ))}
        </AnimatePresence>

        {tasks.length === 0 && (
          <li className="rounded-lg border border-dashed border-zinc-200 px-3 py-5 text-center text-xs text-zinc-400">
            No tasks
          </li>
        )}
      </motion.ul>
    </section>
  );
}
