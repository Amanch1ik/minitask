import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Input from "../components/ui/Input.jsx";
import Logo from "../components/ui/Logo.jsx";
import RollButton from "../components/ui/RollButton.jsx";
import { api } from "../api/client.js";

const spring = { type: "spring", stiffness: 320, damping: 30 };

/**
 * Lands here from the reset email: /reset-password?token=... — sets a new
 * password, then sends the user back to the login screen.
 */
export default function ResetPasswordView() {
  const token = new URLSearchParams(window.location.search).get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Пароли не совпадают.");
      return;
    }
    if (!token) {
      setError("Ссылка недействительна. Запросите сброс заново.");
      return;
    }
    setBusy(true);
    try {
      await api.resetPassword(token, password);
      setDone(true);
      // The reset call set the session — boot straight onto the board.
      setTimeout(() => window.location.replace("/"), 900);
    } catch (err) {
      const raw = err?.message ?? "";
      setError(raw || "Ссылка устарела или уже использована.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="w-full max-w-[400px]"
      >
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex">
            <Logo size={40} />
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-asana-ink">
            {done ? "Пароль обновлён" : "Новый пароль"}
          </h1>
          <p className="mt-1.5 text-sm text-asana-muted">
            {done
              ? "Готово — открываем доску..."
              : "Придумайте новый пароль для аккаунта."}
          </p>
        </div>

        <div className="rounded-2xl border border-asana-border bg-white/95 p-6 shadow-card">
          {done ? (
            <div className="text-center">
              <button
                type="button"
                onClick={() => window.location.replace("/")}
                className="text-[13px] font-medium text-asana-coral hover:underline underline-offset-4"
              >
                Открыть доску
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <Input
                label="Новый пароль"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                placeholder="не короче 8 символов"
              />
              <Input
                label="Повторите пароль"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="ещё раз"
              />

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

              <RollButton type="submit" disabled={busy} className="w-full justify-between">
                {busy ? "Сохраняем..." : "Сохранить пароль"}
              </RollButton>
            </form>
          )}
        </div>
      </motion.div>
    </main>
  );
}
