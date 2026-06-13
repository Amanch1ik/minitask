import { AnimatePresence, motion } from "motion/react";
import TaskCard from "./TaskCard.jsx";

const COLUMN_META = {
  todo: { label: "Todo", dot: "bg-zinc-400", ring: "ring-zinc-300/40" },
  in_progress: {
    label: "In progress",
    dot: "bg-indigo-500",
    ring: "ring-indigo-400/30",
  },
  done: { label: "Done", dot: "bg-emerald-500", ring: "ring-emerald-400/30" },
};

const ease = [0.16, 1, 0.3, 1];

export default function StatusColumn({
  status,
  tasks,
  index = 0,
  onEdit,
  onMove,
  onDelete,
}) {
  const meta = COLUMN_META[status];
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease, delay: 0.06 * index }}
      className="flex min-w-0 flex-col"
      style={{ transformStyle: "preserve-3d" }}
    >
      <header className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`h-1.5 w-1.5 rounded-full ring-2 ${meta.dot} ${meta.ring}`}
          />
          <h2 className="text-sm font-semibold text-zinc-900">{meta.label}</h2>
          <span className="rounded-md bg-zinc-100/80 px-1.5 py-0.5 text-xs tabular text-zinc-600 backdrop-blur-sm">
            {tasks.length}
          </span>
        </div>
      </header>

      <motion.ul layout className="flex flex-col gap-2.5">
        <AnimatePresence initial={false}>
          {tasks.map((task) => (
            <motion.li key={task.id} layout>
              <TaskCard
                task={task}
                onEdit={onEdit}
                onMove={onMove}
                onDelete={onDelete}
              />
            </motion.li>
          ))}
        </AnimatePresence>

        {tasks.length === 0 && (
          <li className="rounded-xl border border-dashed border-zinc-200 px-3 py-6 text-center text-xs text-zinc-400">
            No tasks
          </li>
        )}
      </motion.ul>
    </motion.section>
  );
}
