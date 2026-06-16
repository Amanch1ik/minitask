import { forwardRef, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { MoreHorizontal, Trash2, ArrowRight } from "lucide-react";
import Avatar from "../ui/Avatar.jsx";
import useDismiss from "../../hooks/useDismiss.js";
import { formatDeadline, deadlineState } from "../../lib/format.js";

const PRIO_RU = { low: "Низкий", medium: "Средний", high: "Высокий" };
const priorityPill = {
  high: "bg-asana-coral-soft text-asana-coral-dark",
  medium: "bg-amber-50 text-amber-700",
  low: "bg-asana-side-bg text-asana-muted",
};

const STATUS_LABELS = {
  todo: "К выполнению",
  in_progress: "В работе",
  done: "Готово",
};
const STATUS_ORDER = ["todo", "in_progress", "done"];

const spring = { type: "spring", stiffness: 320, damping: 30 };
const DRAG_THRESHOLD = 6;

/**
 * Presentational card body — shared by the live card and the DragOverlay so the
 * floating copy is pixel-identical. Like Asana: completion circle + title on the
 * first row, custom-field pills below, due date and assignee on the footer.
 */
export function TaskCardView({ task, owner, overlay = false }) {
  const done = task.status === "done";
  const dlState = deadlineState(task.deadline);
  const dlLabel = formatDeadline(task.deadline);

  return (
    <div
      className={`rounded-lg border border-asana-border bg-white p-3 ${
        overlay ? "shadow-drag" : "shadow-card"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <CheckDot done={done} />
        <div className="min-w-0 flex-1">
          <h3
            className={`break-words text-[14px] font-medium leading-snug ${
              done ? "text-asana-subtle line-through" : "text-asana-ink"
            }`}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-asana-muted">
              {task.description}
            </p>
          )}
          <PriorityRow priority={task.priority} />
          <CardFooter owner={owner} dlLabel={dlLabel} dlState={dlState} />
        </div>
      </div>
    </div>
  );
}

/**
 * Live board card — Asana style. The whole card is the drag source (no grip
 * handle); a plain click opens the editor, while dragging past a small distance
 * threshold moves it between sections. Status moves and deletion live behind a
 * hover-revealed "…" menu, exactly like Asana's task context menu.
 */
const TaskCard = forwardRef(function TaskCard(
  { task, owner, onEdit, onMove, onDelete },
  popRef,
) {
  const downPos = useRef(null);
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: task.id, data: { task } });

  // Merge dnd-kit's node ref with the ref AnimatePresence's popLayout injects,
  // so the card can be both a drag source and measured for exit animations.
  const setRefs = (node) => {
    setNodeRef(node);
    if (typeof popRef === "function") popRef(node);
    else if (popRef) popRef.current = node;
  };

  const done = task.status === "done";
  const dlState = deadlineState(task.deadline);
  const dlLabel = formatDeadline(task.deadline);

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.35 : 1,
  };

  // A real drag moves the pointer; a click does not. Measuring displacement is
  // independent of dnd-kit internals, so a click never accidentally fires after
  // a drag (and a drag never opens the editor).
  function handlePointerDownCapture(event) {
    downPos.current = { x: event.clientX, y: event.clientY };
  }
  function handleClick(event) {
    const start = downPos.current;
    if (start) {
      const moved = Math.hypot(event.clientX - start.x, event.clientY - start.y);
      if (moved > DRAG_THRESHOLD) return;
    }
    onEdit(task);
  }

  return (
    <motion.article
      ref={setRefs}
      style={style}
      layout
      {...listeners}
      {...attributes}
      onPointerDownCapture={handlePointerDownCapture}
      onClick={handleClick}
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: isDragging ? 0.35 : 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.16 } }}
      transition={spring}
      className="group cursor-pointer touch-none select-none rounded-lg border border-asana-border bg-white p-3 shadow-card outline-none transition-shadow hover:shadow-lift focus-visible:shadow-focus"
    >
      <div className="flex items-start gap-2.5">
        <Checkbox
          done={done}
          onToggle={() => onMove(task, done ? "todo" : "done")}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-1.5">
            <h3
              className={`min-w-0 flex-1 break-words text-[14px] font-medium leading-snug transition-colors ${
                done ? "text-asana-subtle line-through" : "text-asana-ink"
              }`}
            >
              {task.title}
            </h3>
            <CardMenu task={task} onMove={onMove} onDelete={onDelete} />
          </div>

          {task.description && (
            <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-asana-muted">
              {task.description}
            </p>
          )}

          <PriorityRow priority={task.priority} />
          <CardFooter owner={owner} dlLabel={dlLabel} dlState={dlState} />
        </div>
      </div>
    </motion.article>
  );
});

export default TaskCard;

function PriorityRow({ priority }) {
  if (!priority) return null;
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      <span
        className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium ${priorityPill[priority]}`}
      >
        {PRIO_RU[priority]}
      </span>
    </div>
  );
}

function CardFooter({ owner, dlLabel, dlState }) {
  return (
    <div className="mt-2.5 flex items-center justify-between">
      {dlLabel ? (
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
      ) : (
        <span aria-hidden />
      )}
      <Avatar name={owner ?? ""} size={22} className="shrink-0" />
    </div>
  );
}

/**
 * Hover-revealed "…" menu, mirroring Asana's card context menu: move the task to
 * another section, or delete it. Stops pointer/click propagation so it never
 * starts a drag or opens the editor.
 */
function CardMenu({ task, onMove, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const stop = (event) => event.stopPropagation();
  const targets = STATUS_ORDER.filter((s) => s !== task.status);

  useDismiss(ref, open, () => setOpen(false));

  return (
    <div ref={ref} className="relative shrink-0" onPointerDownCapture={stop}>
      <button
        type="button"
        onClick={(e) => {
          stop(e);
          setOpen((v) => !v);
        }}
        aria-label="Действия с задачей"
        aria-haspopup="menu"
        aria-expanded={open}
        className={`grid h-6 w-6 place-items-center rounded text-asana-muted transition-opacity hover:bg-asana-side-bg hover:text-asana-ink focus:outline-none focus-visible:shadow-focus ${
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
            className="absolute right-0 top-7 z-50 w-44 overflow-hidden rounded-lg border border-asana-border bg-white py-1 shadow-pop"
            onClick={stop}
          >
              {targets.map((s) => (
                <button
                  key={s}
                  type="button"
                  role="menuitem"
                  onClick={(e) => {
                    stop(e);
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
                onClick={(e) => {
                  stop(e);
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
  const stop = (event) => event.stopPropagation();
  return (
    <button
      type="button"
      onPointerDownCapture={stop}
      onClick={(e) => {
        stop(e);
        onToggle();
      }}
      role="checkbox"
      aria-checked={done}
      aria-label={done ? "Снять отметку «готово»" : "Отметить готовой"}
      className="mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center focus:outline-none"
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
    </button>
  );
}

function CheckDot({ done }) {
  return (
    <span
      className={`mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border-[1.5px] ${
        done ? "border-[#10b981] bg-[#10b981] text-white" : "border-[#bfbfc1]"
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
      <rect x="1.5" y="2.5" width="9" height="8" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1.5 5h9M4 1.5v2M8 1.5v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
