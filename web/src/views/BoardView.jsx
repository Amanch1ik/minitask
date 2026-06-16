import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  pointerWithin,
} from "@dnd-kit/core";
import { useAuth } from "../stores/auth.js";
import useTasks from "../hooks/useTasks.js";
import Button from "../components/ui/Button.jsx";
import Sidebar from "../components/layout/Sidebar.jsx";
import TopBar from "../components/layout/TopBar.jsx";
import StatusColumn from "../components/board/StatusColumn.jsx";
import TaskDialog from "../components/board/TaskDialog.jsx";
import { TaskCardView } from "../components/board/TaskCard.jsx";
import AnimatedCounter from "../components/ui/AnimatedCounter.jsx";
import TodayView from "../components/views/TodayView.jsx";
import CalendarView from "../components/views/CalendarView.jsx";
import ArchiveView from "../components/views/ArchiveView.jsx";
import { loadProjectMap, saveProjectMap, projectById } from "../lib/projects.js";

const STATUSES = ["todo", "in_progress", "done"];
const ease = [0.16, 1, 0.3, 1];
const VIEW_META = {
  board: "Моя доска",
  today: "На сегодня",
  calendar: "Календарь",
  archive: "Архив",
};

export default function BoardView() {
  const { user, logout } = useAuth();
  const { tasks, loading, error, create, update, remove } = useTasks();
  const [editing, setEditing] = useState(null);
  const [view, setView] = useState("board");
  const [activeId, setActiveId] = useState(null);
  const [navOpen, setNavOpen] = useState(false);
  const [projectMap, setProjectMap] = useState(loadProjectMap);
  const [activeProject, setActiveProject] = useState(null);

  const sensors = useSensors(
    // 6px travel before a drag begins → a plain click still opens the editor.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  const visibleTasks = useMemo(
    () => (activeProject ? tasks.filter((t) => projectMap[t.id] === activeProject) : tasks),
    [tasks, activeProject, projectMap],
  );

  const grouped = useMemo(() => {
    const acc = { todo: [], in_progress: [], done: [] };
    for (const t of visibleTasks) acc[t.status].push(t);
    return acc;
  }, [visibleTasks]);

  const active = visibleTasks.filter((t) => t.status !== "done").length;
  const done = visibleTasks.length - active;
  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;
  const project = projectById(activeProject);

  function assignProject(taskId, projectId) {
    setProjectMap((prev) => {
      const next = { ...prev };
      if (projectId) next[taskId] = projectId;
      else delete next[taskId];
      saveProjectMap(next);
      return next;
    });
  }

  async function handleSubmit(payload) {
    const { project: projectId, ...fields } = payload;
    const saved =
      editing && editing.id ? await update(editing.id, fields) : await create(fields);
    if (saved?.id) assignProject(saved.id, projectId ?? null);
    setEditing(null);
  }

  async function handleMove(task, nextStatus) {
    await update(task.id, { status: nextStatus });
  }

  function handleDelete(task) {
    remove(task.id);
    assignProject(task.id, null);
  }

  // Asana-style quick add. Inherits the active project filter so the new task
  // stays visible instead of vanishing behind the filter.
  async function handleQuickCreate(title, status) {
    const created = await create({
      title,
      description: null,
      priority: "medium",
      status,
      deadline: null,
    });
    if (activeProject && created?.id) assignProject(created.id, activeProject);
  }

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  async function handleDragEnd(event) {
    const { active: dragged, over } = event;
    setActiveId(null);
    if (!over) return;
    const task = tasks.find((t) => t.id === dragged.id);
    const nextStatus = over.id; // droppable id === status
    if (task && STATUSES.includes(nextStatus) && task.status !== nextStatus) {
      await update(task.id, { status: nextStatus });
    }
  }

  const viewProps = {
    tasks: visibleTasks,
    owner: user?.email,
    projectMap,
    onEdit: setEditing,
    onMove: handleMove,
    onDelete: handleDelete,
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar
        open={navOpen}
        onClose={() => setNavOpen(false)}
        view={view}
        onView={(v) => {
          setView(v);
          setActiveProject(null);
        }}
        activeProject={activeProject}
        onProject={setActiveProject}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          email={user?.email}
          onLogout={logout}
          view={view}
          onView={(v) => {
            setView(v);
            setActiveProject(null);
          }}
          onMenu={() => setNavOpen(true)}
          title={project ? project.label : VIEW_META[view]}
        />

        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease }}
            className="mb-6 flex flex-wrap items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <p className="text-sm text-asana-muted tabular">
                <span className="font-medium text-asana-ink">
                  <AnimatedCounter value={active} />
                </span>{" "}
                в работе ·{" "}
                <span className="font-medium text-asana-ink">
                  <AnimatedCounter value={done} />
                </span>{" "}
                готово
              </p>
              {project && (
                <button
                  type="button"
                  onClick={() => setActiveProject(null)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-asana-border bg-white py-1 pl-2 pr-1.5 text-[12px] text-asana-ink hover:bg-asana-side-bg"
                >
                  <span className="h-2 w-2 rounded-[3px]" style={{ backgroundColor: project.color }} />
                  {project.label}
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-asana-side-active text-[10px] text-asana-muted">
                    ✕
                  </span>
                </button>
              )}
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

          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease }}
            >
              {view === "board" && (
                <DndContext
                  sensors={sensors}
                  collisionDetection={pointerWithin}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragCancel={() => setActiveId(null)}
                >
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
                        onQuickCreate={handleQuickCreate}
                      />
                    ))}
                  </div>

                  <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.16,1,0.3,1)" }}>
                    {activeTask ? (
                      <div className="rotate-2">
                        <TaskCardView task={activeTask} owner={user?.email} overlay />
                      </div>
                    ) : null}
                  </DragOverlay>

                  {loading && tasks.length === 0 && (
                    <p className="mt-8 text-center text-xs text-asana-subtle">Загрузка...</p>
                  )}
                </DndContext>
              )}

              {view === "today" && <TodayView {...viewProps} />}
              {view === "calendar" && <CalendarView tasks={visibleTasks} onEdit={setEditing} />}
              {view === "archive" && <ArchiveView {...viewProps} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <TaskDialog
        open={editing !== null}
        initial={editing && editing.id ? editing : null}
        initialStatus={editing && !editing.id ? editing.status : "todo"}
        initialProject={
          editing && editing.id ? projectMap[editing.id] ?? "" : activeProject ?? ""
        }
        onClose={() => setEditing(null)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
