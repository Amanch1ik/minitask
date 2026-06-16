import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import { toDateInput } from "../../lib/format.js";

const EMPTY = {
  title: "",
  description: "",
  priority: "medium",
  deadline: "",
  status: "todo",
};

const spring = { type: "spring", stiffness: 360, damping: 32 };

export default function TaskDialog({
  open,
  initial,
  initialStatus = "todo",
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
          }
        : { ...EMPTY, status: initialStatus },
    );
  }, [open, initial, initialStatus]);

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
      };
      await onSubmit(payload);
    } catch (err) {
      setError(err?.message ?? "Не удалось сохранить.");
    } finally {
      setBusy(false);
    }
  }

  const isEdit = Boolean(initial && initial.id);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
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
                <div className="grid grid-cols-2 gap-4">
                  <Segmented
                    label="Приоритет"
                    value={form.priority}
                    options={[
                      { v: "low", label: "Низкий" },
                      { v: "medium", label: "Сред" },
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
                      className="block h-10 w-full rounded-md border border-asana-border bg-white px-2.5 text-[14px] tabular text-asana-ink focus:border-asana-coral focus:outline-none focus:shadow-focus transition-shadow"
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
    </AnimatePresence>
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

function Segmented({ label, value, options, onChange, layoutKey = "seg" }) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-medium text-asana-ink">
        {label}
      </label>
      <div className="inline-flex rounded-md border border-asana-border bg-asana-side-bg p-0.5">
        {options.map((opt) => {
          const active = value === opt.v;
          return (
            <button
              key={opt.v}
              type="button"
              onClick={() => onChange(opt.v)}
              className={`relative px-2.5 py-1 text-[12px] font-medium rounded transition-colors ${
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
              <span className="relative z-10">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
