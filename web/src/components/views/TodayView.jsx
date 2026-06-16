import { AnimatePresence } from "motion/react";
import TaskRow from "../board/TaskRow.jsx";
import { todayLabel, capitalizeFirst } from "../../lib/format.js";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * "На сегодня" — what actually needs attention now: anything overdue, plus
 * everything due today. Completed tasks are excluded.
 */
export default function TodayView({ tasks, owner, projectMap, onEdit, onMove, onDelete }) {
  const start = startOfToday();
  const end = endOfToday();

  const pending = tasks.filter((t) => t.status !== "done" && t.deadline);
  const overdue = pending
    .filter((t) => new Date(t.deadline) < start)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  const today = pending
    .filter((t) => {
      const d = new Date(t.deadline);
      return d >= start && d <= end;
    })
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  const empty = overdue.length === 0 && today.length === 0;

  return (
    <div className="space-y-6">
      <p className="text-sm text-asana-muted">{capitalizeFirst(todayLabel())}</p>

      {empty ? (
        <EmptyState />
      ) : (
        <div className="space-y-6">
          <Group title="Просрочено" tone="overdue" items={overdue} {...{ owner, projectMap, onEdit, onMove, onDelete }} />
          <Group title="Сегодня" tone="today" items={today} {...{ owner, projectMap, onEdit, onMove, onDelete }} />
        </div>
      )}
    </div>
  );
}

function Group({ title, tone, items, owner, projectMap, onEdit, onMove, onDelete }) {
  if (items.length === 0) return null;
  return (
    <section>
      <div className="mb-2 flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${tone === "overdue" ? "bg-asana-coral" : "bg-chip-blue"}`}
        />
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-asana-ink">
          {title}
        </h2>
        <span className="text-[12px] text-asana-subtle tabular">{items.length}</span>
      </div>
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {items.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              owner={owner}
              projectId={projectMap[task.id]}
              onEdit={onEdit}
              onMove={onMove}
              onDelete={onDelete}
            />
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-asana-border-strong/60 bg-asana-side-bg/40 px-6 py-16 text-center">
      <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-chip-green/15 text-2xl">
        ✓
      </div>
      <p className="text-[15px] font-medium text-asana-ink">На сегодня всё чисто</p>
      <p className="mt-1 text-[13px] text-asana-subtle">
        Нет просроченных задач и задач с дедлайном на сегодня.
      </p>
    </div>
  );
}
