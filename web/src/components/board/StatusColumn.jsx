import { AnimatePresence, motion } from "motion/react";
import TaskCard from "./TaskCard.jsx";

const COLUMN_LABEL = {
  todo: "Todo",
  in_progress: "In progress",
  done: "Done",
};

export default function StatusColumn({ status, tasks, onEdit, onMove, onDelete }) {
  return (
    <section className="flex min-w-0 flex-col gap-4">
      <header className="flex items-baseline justify-between gap-3">
        <h2 className="eyebrow">{COLUMN_LABEL[status]}</h2>
        <span className="tabular text-xs text-charcoal-mute">{tasks.length}</span>
      </header>
      <div className="h-px bg-cream-deeper" />

      <motion.ul
        layout
        className="flex flex-col gap-3"
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
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
          <li className="rounded-card border border-dashed border-cream-deeper p-6 text-center text-xs text-charcoal-mute">
            nothing here yet
          </li>
        )}
      </motion.ul>
    </section>
  );
}
