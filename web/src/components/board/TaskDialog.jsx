import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import { PROJECTS } from "../../lib/projects.js";
import { toDateInput } from "../../lib/format.js";

const EMPTY = {
  title: "",
  description: "",
  priority: "medium",
  deadline: "",
  status: "todo",
  project: "",
};

const spring = { type: "spring", stiffness: 360, damping: 32 };

export default function TaskDialog({
  open,
  initial,
  initialStatus = "todo",
  initialProject = "",
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setForm(
      initial
        ? {
            title: initial.title ?? "",
            description: initial.description ?? "",
            priority: initial.priority ?? "medium",
            deadline: toDateInput(initial.deadline),
            status: initial.status ?? "todo",
            project: initialProject ?? "",
          }
        : { ...EMPTY, status: initialStatus, project: initialProject ?? "" },
    );
  }, [open, initial, initialStatus, initialProject]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        priority: form.priority,
        status: form.status,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
        project: form.project || null,
      };
      await onSubmit(payload);
    } catch (err) {
      setError(err?.message ?? "Не удалось сохранить.");
    } finally {
      setBusy(false);
    }
  }

  const isEdit = Boolean(initial && initial.id);

  // Portal to <body> — the dialog can't get trapped in a parent stacking
  // context, and AnimatePresence is the sole owner of mount/unmount.
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="task-dialog"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, pointerEvents: "auto" }}
          exit={{ opacity: 0, pointerEvents: "none" }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-asana-ink/40 px-4 backdrop-blur-[2px] sm:items-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 32, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.97 }}
            transition={spring}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[480px] rounded-t-xl bg-white shadow-lift sm:rounded-lg"
            role="dialog"
            aria-modal="true"
          >
            <header className="flex items-center justify-between border-b border-asana-border px-5 py-3.5">
              <h2 className="text-[15px] font-semibold text-asana-ink">
                {isEdit ? "Редактировать задачу" : "Новая задача"}
              </h2>
              <motion.button
                type="button"
                onClick={onClose}
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={spring}
                className="grid h-7 w-7 place-items-center rounded text-asana-muted hover:bg-asana-side-bg hover:text-asana-ink"
                aria-label="Закрыть"
              >
                ✕
              </motion.button>
            </header>

            <motion.form
              onSubmit={submit}
              className="space-y-4 p-5"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.04, delayChildren: 0.08 } },
              }}
            >
              <FormRow>
                <Input
                  label="Название"
                  value={form.title}
                  onChange={set("title")}
                  required
                  maxLength={200}
                  autoFocus
                  placeholder="Что нужно сделать?"
                />
              </FormRow>

              <FormRow>
                <label
                  htmlFor="task-desc"
                  className="mb-1.5 block text-[13px] font-medium text-asana-ink"
                >
                  Описание
                </label>
                <textarea
                  id="task-desc"
                  rows={3}
                  value={form.description}
                  onChange={set("description")}
                  className="block w-full resize-none rounded-md border border-asana-border bg-white p-2.5 text-[14px] text-asana-ink placeholder:text-asana-subtle focus:border-asana-coral focus:outline-none focus:shadow-focus transition-shadow"
                  placeholder="Необязательно"
                />
              </FormRow>

              <FormRow>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Segmented
                    label="Приоритет"
                    value={form.priority}
                    options={[
                      { v: "low", label: "Низкий" },
                      { v: "medium", label: "Средний" },
                      { v: "high", label: "Высокий" },
                    ]}
                    onChange={(v) => setForm((f) => ({ ...f, priority: v }))}
                    layoutKey="prio"
                  />
                  <div>
                    <label
                      htmlFor="task-deadline"
                      className="mb-1.5 block text-[13px] font-medium text-asana-ink"
                    >
                      Дедлайн
                    </label>
                    <input
                      id="task-deadline"
                      type="date"
                      value={form.deadline}
                      onChange={set("deadline")}
                      className="block h-10 w-full rounded-md border border-asana-border bg-white px-3 text-[14px] tabular text-asana-ink focus:border-asana-coral focus:outline-none focus:shadow-focus transition-shadow"
                    />
                  </div>
                </div>
              </FormRow>

              <FormRow>
                <Segmented
                  label="Статус"
                  value={form.status}
                  options={[
                    { v: "todo", label: "К выполнению" },
                    { v: "in_progress", label: "В работе" },
                    { v: "done", label: "Готово" },
                  ]}
                  onChange={(v) => setForm((f) => ({ ...f, status: v }))}
                  layoutKey="status"
                />
              </FormRow>

              <FormRow>
                <ProjectPicker
                  value={form.project}
                  onChange={(v) => setForm((f) => ({ ...f, project: v }))}
                />
              </FormRow>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={spring}
                    className="overflow-hidden rounded-md border border-asana-coral/40 bg-asana-coral-soft px-3 py-2 text-sm text-asana-coral-dark"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <FormRow className="flex items-center justify-end gap-2 border-t border-asana-border pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  disabled={busy}
                >
                  Отмена
                </Button>
                <Button type="submit" disabled={busy || !form.title.trim()}>
                  {busy ? "..." : isEdit ? "Сохранить" : "Создать"}
                </Button>
              </FormRow>
            </motion.form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function FormRow({ children, className = "" }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 6 },
        show: { opacity: 1, y: 0, transition: spring },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ProjectPicker({ value, onChange }) {
  const options = [{ id: "", label: "Без проекта", color: null }, ...PROJECTS];
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-medium text-asana-ink">
        Проект
      </label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = value === opt.id;
          return (
            <button
              key={opt.id || "none"}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-[12px] font-medium transition-colors ${
                active
                  ? "border-asana-coral bg-asana-coral-soft text-asana-coral-dark"
                  : "border-asana-border bg-white text-asana-muted hover:border-asana-border-strong hover:text-asana-ink"
              }`}
            >
              {opt.color && (
                <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ backgroundColor: opt.color }} />
              )}
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Segmented({ label, value, options, onChange, layoutKey = "seg" }) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-medium text-asana-ink">
        {label}
      </label>
      <div className="flex h-10 w-full items-stretch rounded-md border border-asana-border bg-asana-side-bg p-1">
        {options.map((opt) => {
          const active = value === opt.v;
          return (
            <button
              key={opt.v}
              type="button"
              onClick={() => onChange(opt.v)}
              className={`relative flex flex-1 items-center justify-center rounded px-1 text-center text-[12px] font-medium transition-colors ${
                active ? "text-asana-ink" : "text-asana-muted hover:text-asana-ink"
              }`}
            >
              {active && (
                <motion.span
                  layoutId={`seg-${layoutKey}`}
                  className="absolute inset-0 -z-0 rounded bg-white shadow-card"
                  transition={spring}
                />
              )}
              <span className="relative z-10 truncate">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
