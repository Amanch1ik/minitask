import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";
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
  onQuickCreate,
}) {
  const meta = COLUMN_META[status];
  const { setNodeRef, isOver } = useDroppable({ id: status, data: { status } });
  const [adding, setAdding] = useState(false);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 0.06 * index }}
      className="flex min-w-0 flex-col"
    >
      <header className="mb-2.5 flex items-center justify-between px-1">
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
          onClick={() => setAdding(true)}
          whileHover={{ scale: 1.08, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          transition={spring}
          className="grid h-7 w-7 place-items-center rounded-md text-asana-muted hover:bg-white hover:text-asana-ink focus:outline-none focus-visible:shadow-focus"
          aria-label={`Добавить задачу в «${meta.label}»`}
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
        </motion.button>
      </header>

      <motion.div
        ref={setNodeRef}
        animate={{
          backgroundColor: isOver ? "rgba(240,106,106,0.07)" : "rgba(246,245,243,0.6)",
          boxShadow: isOver
            ? "inset 0 0 0 1.5px rgba(240,106,106,0.55)"
            : "inset 0 0 0 0px rgba(240,106,106,0)",
        }}
        transition={{ duration: 0.18 }}
        className="flex min-h-[140px] flex-1 flex-col gap-2 rounded-xl p-2.5"
      >
        <AnimatePresence initial={false}>
          {adding && (
            <Composer
              key="composer"
              status={status}
              onQuickCreate={onQuickCreate}
              onClose={() => setAdding(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence initial={false} mode="popLayout">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              owner={owner}
              onEdit={onEdit}
              onMove={onMove}
              onDelete={onDelete}
            />
          ))}
        </AnimatePresence>

        {!adding &&
          (tasks.length === 0 ? (
            <motion.button
              layout
              type="button"
              onClick={() => setAdding(true)}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -1, borderColor: "#f06a6a" }}
              transition={spring}
              className="flex flex-1 items-center justify-center rounded-md border border-dashed border-asana-border-strong/60 px-3 py-6 text-center text-[13px] text-asana-subtle hover:text-asana-coral focus:outline-none focus-visible:border-asana-coral"
            >
              {isOver ? "Отпустите здесь" : "+ Добавить задачу"}
            </motion.button>
          ) : (
            <motion.button
              layout
              type="button"
              onClick={() => setAdding(true)}
              whileHover={{ x: 1 }}
              transition={spring}
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-[13px] text-asana-muted hover:bg-white hover:text-asana-ink focus:outline-none focus-visible:shadow-focus"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              Добавить задачу
            </motion.button>
          ))}
      </motion.div>
    </motion.section>
  );
}

/**
 * Inline quick-add — Asana style. Type a title, press Enter to create and keep
 * going, Esc or "Отмена" to dismiss. No modal for the common case.
 */
function Composer({ status, onQuickCreate, onClose }) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  async function submit() {
    const title = value.trim();
    if (!title || busy) return;
    setBusy(true);
    try {
      await onQuickCreate(title, status);
      setValue("");
      ref.current?.focus();
    } finally {
      setBusy(false);
    }
  }

  function onKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={spring}
      className="rounded-lg border border-asana-coral/50 bg-white p-2.5 shadow-card"
    >
      <textarea
        ref={ref}
        rows={2}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Название задачи…"
        className="block w-full resize-none bg-transparent text-[14px] leading-snug text-asana-ink placeholder:text-asana-subtle focus:outline-none"
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="hidden text-[11px] text-asana-subtle sm:inline">
          Enter — добавить
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded px-2 py-1 text-[12px] text-asana-muted hover:text-asana-ink focus:outline-none"
          >
            Отмена
          </button>
          <motion.button
            type="button"
            onClick={submit}
            disabled={!value.trim() || busy}
            whileTap={{ scale: 0.95 }}
            transition={spring}
            className="rounded-md bg-asana-coral px-2.5 py-1 text-[12px] font-medium text-white hover:bg-asana-coral-dark disabled:opacity-40 focus:outline-none focus-visible:shadow-focus"
          >
            Добавить
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
