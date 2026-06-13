import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { useAuth } from "../stores/auth.js";
import useTasks from "../hooks/useTasks.js";
import Button from "../components/ui/Button.jsx";
import StatusColumn from "../components/board/StatusColumn.jsx";
import TaskDialog from "../components/board/TaskDialog.jsx";

const STATUSES = ["todo", "in_progress", "done"];

export default function BoardView() {
  const { user, logout } = useAuth();
  const { tasks, loading, error, create, update, remove } = useTasks();
  const [editing, setEditing] = useState(null);

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
    if (!confirm("Delete this task?")) return;
    await remove(task.id);
  }

  return (
    <div className="min-h-screen bg-white">
      <Header email={user?.email} onLogout={logout} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mb-6 flex flex-wrap items-end justify-between gap-3"
        >
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Your tasks
            </h1>
            <p className="mt-1 text-sm text-zinc-500 tabular">
              {active} active · {done} done
            </p>
          </div>
          <Button onClick={() => setEditing({})}>
            <span aria-hidden>+</span>
            New task
          </Button>
        </motion.div>

        {error && (
          <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="grid gap-6 sm:grid-cols-3">
          {STATUSES.map((status) => (
            <StatusColumn
              key={status}
              status={status}
              tasks={grouped[status]}
              onEdit={setEditing}
              onMove={handleMove}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {loading && tasks.length === 0 && (
          <p className="mt-8 text-center text-xs text-zinc-400">Loading…</p>
        )}
      </main>

      <TaskDialog
        open={editing !== null}
        initial={editing && editing.id ? editing : null}
        onClose={() => setEditing(null)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

function Header({ email, onLogout }) {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-zinc-900 text-xs font-bold text-white">
            m
          </span>
          <span className="text-sm font-semibold tracking-tight text-zinc-900">
            minitask
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-zinc-500 sm:inline">{email}</span>
          <button
            type="button"
            onClick={onLogout}
            className="text-sm text-zinc-500 hover:text-zinc-900"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
