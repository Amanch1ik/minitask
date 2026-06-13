import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { useAuth } from "../stores/auth.js";
import useTasks from "../hooks/useTasks.js";
import Button from "../components/ui/Button.jsx";
import Sidebar from "../components/layout/Sidebar.jsx";
import TopBar from "../components/layout/TopBar.jsx";
import StatusColumn from "../components/board/StatusColumn.jsx";
import TaskDialog from "../components/board/TaskDialog.jsx";

const STATUSES = ["todo", "in_progress", "done"];
const ease = [0.16, 1, 0.3, 1];

export default function BoardView() {
  const { user, logout } = useAuth();
  const { tasks, loading, error, create, update, remove } = useTasks();
  const [editing, setEditing] = useState(null);
  const [view, setView] = useState("board");

  const grouped = useMemo(() => {
    const acc = { todo: [], in_progress: [], done: [] };
    for (const t of tasks) acc[t.status].push(t);
    return acc;
  }, [tasks]);

  const active = tasks.filter((t) => t.status !== "done").length;
  const done = tasks.length - active;

  async function handleSubmit(payload) {
    if (editing && editing.id) await update(editing.id, payload);
    else await create(payload);
    setEditing(null);
  }

  async function handleMove(task, nextStatus) {
    await update(task.id, { status: nextStatus });
  }

  async function handleDelete(task) {
    if (!confirm("Удалить задачу?")) return;
    await remove(task.id);
  }

  return (
    <div className="flex min-h-screen bg-asana-bg">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          email={user?.email}
          onLogout={logout}
          view={view}
          onView={setView}
        />

        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease }}
            className="mb-6 flex flex-wrap items-center justify-between gap-3"
          >
            <div className="flex items-center gap-4">
              <p className="text-sm text-asana-muted tabular">
                <span className="font-medium text-asana-ink">{active}</span>{" "}
                в работе ·{" "}
                <span className="font-medium text-asana-ink">{done}</span>{" "}
                готово
              </p>
            </div>
            <Button size="md" onClick={() => setEditing({})}>
              <span aria-hidden className="text-base leading-none">+</span>
              Новая задача
            </Button>
          </motion.div>

          {error && (
            <p className="mb-4 rounded-md border border-asana-coral/40 bg-asana-coral-soft px-3 py-2 text-sm text-asana-coral-dark">
              {error}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            {STATUSES.map((status, i) => (
              <StatusColumn
                key={status}
                status={status}
                tasks={grouped[status]}
                owner={user?.email}
                index={i}
                onEdit={setEditing}
                onMove={handleMove}
                onDelete={handleDelete}
                onAdd={() => setEditing({ status })}
              />
            ))}
          </div>

          {loading && tasks.length === 0 && (
            <p className="mt-8 text-center text-xs text-asana-subtle">
              Загрузка...
            </p>
          )}
        </main>
      </div>

      <TaskDialog
        open={editing !== null}
        initial={editing && editing.id ? editing : null}
        initialStatus={editing && !editing.id ? editing.status : "todo"}
        onClose={() => setEditing(null)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
