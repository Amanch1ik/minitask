import { AnimatePresence } from "motion/react";
import TaskRow from "../board/TaskRow.jsx";

/**
 * "Архив" — completed tasks. The row checkbox un-completes (restores to
 * «К выполнению»); the menu also offers move/delete.
 */
export default function ArchiveView({ tasks, owner, projectMap, onEdit, onMove, onDelete }) {
  const done = tasks
    .filter((t) => t.status === "done")
    .sort((a, b) => new Date(b.updated_at ?? b.created_at) - new Date(a.updated_at ?? a.created_at));

  if (done.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-asana-border-strong/60 bg-asana-side-bg/40 px-6 py-16 text-center">
        <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-asana-side-active text-2xl">
          🗂
        </div>
        <p className="text-[15px] font-medium text-asana-ink">Архив пуст</p>
        <p className="mt-1 text-[13px] text-asana-subtle">
          Завершённые задачи появятся здесь.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="mb-1 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-chip-green" />
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-asana-ink">
          Завершено
        </h2>
        <span className="text-[12px] text-asana-subtle tabular">{done.length}</span>
      </div>
      <AnimatePresence initial={false}>
        {done.map((task) => (
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
  );
}
