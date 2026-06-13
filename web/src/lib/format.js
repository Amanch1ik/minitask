const dayFmt = new Intl.DateTimeFormat("en", { day: "numeric", month: "short" });
const dayFmtLong = new Intl.DateTimeFormat("en", {
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
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
}

export function toDateInput(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}
