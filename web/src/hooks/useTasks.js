import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client.js";

/**
 * Owns the task list and the CRUD calls. Mutations are optimistic-by-merge:
 * we wait for the api response (single source of truth), then patch the local
 * list. No background polling — every action that mutates the server also
 * returns the canonical record.
 */
export default function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listTasks();
      setTasks(data);
    } catch (err) {
      setError(err?.message ?? "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const create = useCallback(async (payload) => {
    const created = await api.createTask(payload);
    setTasks((prev) => [created, ...prev]);
    return created;
  }, []);

  const update = useCallback(async (id, payload) => {
    const updated = await api.updateTask(id, payload);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  }, []);

  const remove = useCallback(async (id) => {
    await api.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { tasks, loading, error, reload, create, update, remove };
}
