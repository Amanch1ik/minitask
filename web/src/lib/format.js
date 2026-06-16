const dayFmt = new Intl.DateTimeFormat("ru", { day: "numeric", month: "short" });
const dayFmtLong = new Intl.DateTimeFormat("ru", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatDeadline(value) {
  if (!value) return null;
  const date = new Date(value);
  const today = new Date();
  const sameYear = date.getFullYear() === today.getFullYear();
  return sameYear ? dayFmt.format(date) : dayFmtLong.format(date);
}

export function deadlineState(value) {
  if (!value) return "none";
  const date = new Date(value);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  if (diff < 0) return "overdue";
  if (diff < 1000 * 60 * 60 * 24 * 2) return "soon";
  return "later";
}

export function todayLabel() {
  return new Intl.DateTimeFormat("ru", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
}

export function toDateInput(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

/** Uppercase only the first letter — Russian month/weekday names are lowercase. */
export function capitalizeFirst(text) {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}
