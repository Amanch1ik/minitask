import { AnimatePresence, motion } from "motion/react";
import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import TaskCard from "./TaskCard.jsx";
import AnimatedCounter from "../ui/AnimatedCounter.jsx";

const COLUMN_META = {
  todo: { label: "К выполнению", dot: "bg-asana-subtle" },
  in_progress: { label: "В работе", dot: "bg-amber" },
  done: { label: "Готово", dot: "bg-teal" },
};

const spring = { type: "spring", stiffness: 320, damping: 32 };

export default function StatusColumn({
  status,
  tasks,
  owner,
  index = 0,
  onEdit,
  onToggleDone,
  onDelete,
  onAdd,
}) {
  const meta = COLUMN_META[status];
  const { setNodeRef, isOver } = useDroppable({ id: status, data: { status } });

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 0.06 * index }}
      className="flex min-w-0 flex-col"
    >
      <header className="mb-2.5 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-charcoal">
            {meta.label}
          </h2>
          <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-md bg-cream-deep px-1.5 text-[11px] font-medium tabular text-asana-muted">
            <AnimatedCounter value={tasks.length} />
          </span>
        </div>
        <motion.button
          type="button"
          onClick={onAdd}
          whileHover={{ scale: 1.08, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          transition={spring}
          className="grid h-7 w-7 place-items-center rounded-md text-asana-muted transition-colors hover:bg-cream-deep hover:text-charcoal focus:outline-none focus-visible:shadow-focus"
          aria-label={`Добавить задачу в «${meta.label}»`}
        >
          <Plus className="h-4 w-4" strokeWidth={2.2} />
        </motion.button>
      </header>

      <motion.div
        ref={setNodeRef}
        animate={{
          backgroundColor: isOver ? "rgba(20,184,166,0.08)" : "rgba(241,235,225,0.55)",
          borderColor: isOver ? "rgba(20,184,166,0.55)" : "rgba(233,226,214,0.9)",
        }}
        transition={{ duration: 0.18 }}
        className="flex min-h-[140px] flex-1 flex-col gap-2 rounded-xl border p-2 shadow-column backdrop-blur-sm"
      >
        <AnimatePresence initial={false} mode="popLayout">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              owner={owner}
              onEdit={onEdit}
              onToggleDone={onToggleDone}
              onDelete={onDelete}
            />
          ))}
        </AnimatePresence>

        {tasks.length === 0 && (
          <motion.button
            layout
            type="button"
            onClick={onAdd}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ y: -1 }}
            transition={spring}
            className="flex flex-1 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-asana-border-strong/70 px-3 py-6 text-center text-[12.5px] text-asana-subtle transition-colors hover:border-teal/50 hover:text-teal focus:outline-none focus-visible:border-teal"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            <span>{isOver ? "Отпустите здесь" : "Добавить задачу"}</span>
          </motion.button>
        )}
      </motion.div>
    </motion.section>
  );
}
