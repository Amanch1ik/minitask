import { create } from "zustand";
import { api } from "../api/client.js";

/**
 * Auth state lives in zustand, but the source of truth for "am I logged in?"
 * is the httpOnly cookie — we cannot read it from JS. On mount the app asks
 * the api via GET /auth/me; if that succeeds the user object is populated.
 *
 * Login and register set the cookie server-side and return the user payload,
 * so we just store it. Logout clears server-side and locally.
 */
export const useAuth = create((set) => ({
  user: null,
  hydrated: false,

  hydrate: async () => {
    try {
      const user = await api.me();
      set({ user, hydrated: true });
    } catch {
      set({ user: null, hydrated: true });
    }
  },

  login: async (email, password) => {
    const user = await api.login(email, password);
    set({ user });
  },

  // Register no longer logs in — the account is locked until the email link is
  // clicked. Returns the API message so the UI can prompt "check your inbox".
  register: async (email, password) => {
    const { message } = await api.register(email, password);
    return message;
  },

  logout: async () => {
    try {
      await api.logout();
    } finally {
      set({ user: null });
    }
  },
}));
