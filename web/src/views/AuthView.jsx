import { useState } from "react";
import { motion } from "motion/react";
import Input from "../components/ui/Input.jsx";
import Logo from "../components/ui/Logo.jsx";
import Button from "../components/ui/Button.jsx";
import { useAuth } from "../stores/auth.js";

const ERROR_RU = {
  "Invalid email or password": "Неверный email или пароль",
  "Email already registered": "Этот email уже зарегистрирован",
  "Not authenticated": "Сессия истекла, войдите снова",
  "Too many requests, slow down a bit.":
    "Слишком много попыток, подождите минуту",
};

export default function AuthView() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const { login, register } = useAuth();
  const isLogin = mode === "login";

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (isLogin) await login(email, password);
      else await register(email, password);
    } catch (err) {
      const raw = err?.message ?? "";
      setError(ERROR_RU[raw] ?? raw ?? "Что-то пошло не так.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-asana-bg px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[400px]"
      >
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex">
            <Logo size={40} />
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-asana-ink">
            {isLogin ? "С возвращением" : "Создать аккаунт"}
          </h1>
          <p className="mt-1.5 text-sm text-asana-muted">
            {isLogin
              ? "Войдите, чтобы продолжить работу с задачами."
              : "Доска для задач, без лишнего."}
          </p>
        </div>

        <div className="rounded-lg border border-asana-border bg-asana-surface p-6 shadow-card">
          <form onSubmit={submit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              placeholder="вы@example.com"
            />
            <Input
              label="Пароль"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="не короче 8 символов"
            />

            {error && (
              <p className="rounded-md border border-asana-coral/40 bg-asana-coral-soft px-3 py-2 text-sm text-asana-coral-dark">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" disabled={busy} className="w-full">
              {busy ? "..." : isLogin ? "Войти" : "Создать аккаунт"}
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-[13px] text-asana-muted">
          {isLogin ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(isLogin ? "register" : "login");
              setError(null);
            }}
            className="font-medium text-asana-coral hover:underline underline-offset-4"
          >
            {isLogin ? "Создать" : "Войти"}
          </button>
        </p>
      </motion.div>
    </main>
  );
}
