import { useState } from "react";
import { motion } from "motion/react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Calendar } from "lucide-react";
import Avatar from "../ui/Avatar.jsx";
import { formatDeadline, deadlineState } from "../../lib/format.js";

const PRIO_RU = { low: "Низкий", medium: "Средний", high: "Высокий" };

// Priority → left accent bar + pill colours. Functional colour always pairs
// with a text label, never colour alone (vault / a11y rule).
const PRIO_BAR = { high: "bg-clay", medium: "bg-amber", low: "bg-cream-dark" };
const PRIO_PILL = {
  high: "bg-clay-soft text-[#9c3a33]",
  medium: "bg-amber-soft text-[#92560f]",
  low: "bg-cream-deep text-asana-muted",
};

const spring = { type: "spring", stiffness: 360, damping: 34 };

/**
 * Presentational card body. Shared by the live draggable card and the
 * DragOverlay so the dragged copy looks identical.
 */
export function TaskCardView({ task, owner, dragging = false, overlay = false }) {
  const done = task.status === "done";
  const dlState = deadlineState(task.deadline);
  const dlLabel = formatDeadline(task.deadline);

  return (
    <div
      className={`relative flex overflow-hidden rounded-lg border border-asana-border bg-white/95 backdrop-blur-sm transition-shadow ${
        overlay ? "shadow-drag" : "shadow-card hover:shadow-lift"
      } ${done ? "opacity-75" : ""}`}
    >
      {/* priority accent rail */}
      <span className={`w-1 shrink-0 ${PRIO_BAR[task.priority]}`} aria-hidden />

      <div className="min-w-0 flex-1 p-3 pl-2.5">
        <div className="flex items-start gap-2">
          <CheckDot done={done} />
          <h3
            className={`min-w-0 flex-1 break-words text-[14px] font-medium leading-snug ${
              done ? "text-asana-subtle line-through" : "text-charcoal"
            }`}
          >
            {task.title}
          </h3>
          <span className="shrink-0">
            <Avatar name={owner ?? ""} size={22} />
          </span>
        </div>

        {task.description && (
          <p className="mt-1.5 ml-6 line-clamp-2 text-[12.5px] leading-relaxed text-asana-muted">
            {task.description}
          </p>
        )}

        <div className="mt-2.5 ml-6 flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${PRIO_PILL[task.priority]}`}
          >
            {PRIO_RU[task.priority]}
          </span>
          {dlLabel && (
            <span
              className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium tabular ${
                dlState === "overdue"
                  ? "bg-clay-soft text-[#9c3a33]"
                  : "bg-cream-deep text-asana-muted"
              }`}
            >
              <Calendar className="h-3 w-3" strokeWidth={2} />
              {dlLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Live card on the board. The whole surface is a drag handle (with a 6px
 * activation distance so a plain click still opens the editor), plus always-
 * visible controls: a grip affordance, a checkbox to toggle done, and a delete
 * button with a two-step inline confirm (no blocking native confirm()).
 */
export default function TaskCard({ task, owner, onEdit, onToggleDone, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: task.id, data: { task } });

  const style = {
    transform: CSS.Translate.toString(transform),
    // While dragging, the DragOverlay shows the moving copy — fade the origin.
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: isDragging ? 0.35 : 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.16 } }}
      transition={spring}
      className="group relative"
    >
      <div className="relative flex overflow-hidden rounded-lg border border-asana-border bg-white/95 shadow-card transition-shadow hover:shadow-lift">
        <span className={`w-1 shrink-0 ${PRIO_BAR[task.priority]}`} aria-hidden />

        {/* grip — visible drag affordance, also the keyboard pick-up point */}
        <button
          type="button"
          {...listeners}
          {...attributes}
          aria-label="Перетащить задачу"
          className="grabbable flex w-5 shrink-0 items-center justify-center text-asana-subtle/50 transition-colors hover:text-asana-muted focus:outline-none focus-visible:text-teal"
        >
          <GripVertical className="h-3.5 w-3.5" strokeWidth={2} />
        </button>

        <div className="min-w-0 flex-1 py-3 pr-2.5">
          <div className="flex items-start gap-2">
            <Checkbox
              done={task.status === "done"}
              onToggle={() => onToggleDone(task)}
            />
            <button
              type="button"
              onClick={() => onEdit(task)}
              className="min-w-0 flex-1 text-left focus:outline-none"
            >
              <h3
                className={`break-words text-[14px] font-medium leading-snug transition-colors ${
                  task.status === "done"
                    ? "text-asana-subtle line-through"
                    : "text-charcoal group-hover:text-charcoal"
                }`}
              >
                {task.title}
              </h3>
            </button>

            {/* delete with inline confirm */}
            <DeleteControl
              confirming={confirming}
              onArm={() => setConfirming(true)}
              onCancel={() => setConfirming(false)}
              onConfirm={() => {
                setConfirming(false);
                onDelete(task);
              }}
            />
            <span className="shrink-0">
              <Avatar name={owner ?? ""} size={22} />
            </span>
          </div>

          <button
            type="button"
            onClick={() => onEdit(task)}
            className="block w-full text-left focus:outline-none"
          >
            {task.description && (
              <p className="mt-1.5 ml-6 line-clamp-2 text-[12.5px] leading-relaxed text-asana-muted">
                {task.description}
              </p>
            )}

            <div className="mt-2.5 ml-6 flex flex-wrap items-center gap-1.5">
              <span
                className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${PRIO_PILL[task.priority]}`}
              >
                {PRIO_RU[task.priority]}
              </span>
              {formatDeadline(task.deadline) && (
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium tabular ${
                    deadlineState(task.deadline) === "overdue"
                      ? "bg-clay-soft text-[#9c3a33]"
                      : "bg-cream-deep text-asana-muted"
                  }`}
                >
                  <Calendar className="h-3 w-3" strokeWidth={2} />
                  {formatDeadline(task.deadline)}
                </span>
              )}
            </div>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function DeleteControl({ confirming, onArm, onCancel, onConfirm }) {
  if (confirming) {
    return (
      <span className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-md bg-clay px-2 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-[#a8473f]"
        >
          Удалить
        </button>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Отмена"
          className="rounded-md px-1.5 py-1 text-[11px] text-asana-muted hover:text-charcoal"
        >
          Нет
        </button>
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onArm}
      aria-label="Удалить задачу"
      className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-asana-subtle/60 transition-colors hover:bg-clay-soft hover:text-clay focus:outline-none focus-visible:bg-clay-soft focus-visible:text-clay"
    >
      <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
    </button>
  );
}

function Checkbox({ done, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      role="checkbox"
      aria-checked={done}
      aria-label={done ? "Снять отметку «готово»" : "Отметить готовой"}
      className="mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center focus:outline-none"
    >
      <motion.span
        animate={done ? "done" : "todo"}
        variants={{
          done: { backgroundColor: "#14b8a6", borderColor: "#14b8a6" },
          todo: { backgroundColor: "rgba(0,0,0,0)", borderColor: "#c4bbab" },
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
        done ? "border-teal bg-teal text-white" : "border-[#c4bbab]"
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
