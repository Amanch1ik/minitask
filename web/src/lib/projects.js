/**
 * Projects are a lightweight, client-side grouping layer on top of tasks. The
 * backend task model has no project column, so the task → project assignment is
 * persisted in localStorage and merged in the UI. Self-contained, no migration.
 */
export const PROJECTS = [
  { id: "p1", label: "Личное", color: "#f472b6" },
  { id: "p2", label: "Работа", color: "#60a5fa" },
  { id: "p3", label: "Учёба", color: "#34d399" },
];

const KEY = "minitask:projects:v1";

export function loadProjectMap() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") || {};
  } catch {
    return {};
  }
}

export function saveProjectMap(map) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    /* storage unavailable — assignments just won't persist this session */
  }
}

export function projectById(id) {
  return PROJECTS.find((p) => p.id === id) ?? null;
}
