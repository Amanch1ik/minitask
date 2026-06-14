import { AnimatePresence, motion } from "motion/react";
import TaskCard from "./TaskCard.jsx";
import AnimatedCounter from "../ui/AnimatedCounter.jsx";

const COLUMN_META = {
  todo: { label: "К выполнению", dot: "bg-asana-subtle" },
  in_progress: { label: "В работе", dot: "bg-chip-blue" },
  done: { label: "Готово", dot: "bg-chip-green" },
};

const spring = { type: "spring", stiffness: 320, damping: 32 };

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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 0.06 * index }}
      className="flex min-w-0 flex-col rounded-xl bg-asana-side-bg/60 p-3"
    >
      <header className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.span
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ ...spring, delay: 0.12 + 0.06 * index }}
            className={`h-2 w-2 rounded-full ${meta.dot}`}
          />
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-asana-ink">
            {meta.label}
          </h2>
          <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded bg-white px-1.5 text-[11px] tabular text-asana-muted ring-1 ring-asana-border">
            <AnimatedCounter value={tasks.length} />
          </span>
        </div>
        <motion.button
          type="button"
          onClick={onAdd}
          whileHover={{ scale: 1.08, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          transition={spring}
          className="grid h-6 w-6 place-items-center rounded-md text-asana-muted hover:bg-white hover:text-asana-ink"
          aria-label="Добавить задачу"
        >
          +
        </motion.button>
      </header>

      <motion.ul layout className="flex flex-col gap-2">
        <AnimatePresence initial={false} mode="popLayout">
          {tasks.map((task) => (
            <motion.li
              key={task.id}
              layout
              transition={spring}
            >
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
          <motion.li
            layout
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={spring}
          >
            <motion.button
              type="button"
              onClick={onAdd}
              whileHover={{ y: -1, borderColor: "#f06a6a" }}
              transition={spring}
              className="block w-full rounded-md border border-dashed border-asana-border-strong/60 px-3 py-3 text-left text-[13px] text-asana-subtle hover:text-asana-coral"
            >
              + Добавить задачу
            </motion.button>
          </motion.li>
        )}
      </motion.ul>
    </motion.section>
  );
}
