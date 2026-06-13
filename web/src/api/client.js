const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

/**
 * Thin fetch wrapper. Two responsibilities:
 *   1. send credentials so the session cookie travels on every call;
 *   2. normalise errors to a single shape — `{ status, message }` — so the
 *      ui doesn't have to know about fetch quirks (rejected promises only
 *      on network failure, body parsing, etc).
 */
async function request(path, { method = "GET", body, signal } = {}) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      credentials: "include",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw { status: 0, message: "Network error. Is the api running?" };
  }

  if (response.status === 204) return null;

  const text = await response.text();
  const data = text ? safeJson(text) : null;

  if (!response.ok) {
    throw {
      status: response.status,
      message: extractMessage(data) ?? response.statusText,
    };
  }
  return data;
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function extractMessage(data) {
  if (!data) return null;
  if (typeof data.detail === "string") return data.detail;
  // Pydantic 422 — flatten the first issue so the user sees something useful.
  if (Array.isArray(data.detail) && data.detail[0]?.msg) return data.detail[0].msg;
  return null;
}

export const api = {
  // --- auth ---
  register: (email, password) =>
    request("/auth/register", { method: "POST", body: { email, password } }),
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: { email, password } }),
  me: () => request("/auth/me"),
  logout: () => request("/auth/logout", { method: "POST" }),

  // --- tasks ---
  listTasks: () => request("/tasks"),
  createTask: (payload) => request("/tasks", { method: "POST", body: payload }),
  updateTask: (id, payload) =>
    request(`/tasks/${id}`, { method: "PATCH", body: payload }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: "DELETE" }),
};
