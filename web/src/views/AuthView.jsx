import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Input from "../components/ui/Input.jsx";
import Logo from "../components/ui/Logo.jsx";
import RollButton from "../components/ui/RollButton.jsx";
import ShaderBackdrop from "../components/ui/ShaderBackdrop.jsx";
import { useAuth } from "../stores/auth.js";

const spring = { type: "spring", stiffness: 320, damping: 30 };

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
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16"
      style={{
        background:
          "radial-gradient(60% 50% at 18% 22%, #fff5ec 0%, transparent 65%)," +
          "radial-gradient(55% 60% at 85% 78%, #fde4d8 0%, transparent 60%)," +
          "radial-gradient(45% 50% at 78% 14%, #fee2d6 0%, transparent 55%)," +
          "linear-gradient(135deg, #fafafa 0%, #f7f5f1 50%, #fffaf4 100%)",
      }}
    >
      <ShaderBackdrop />
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
        }}
        className="w-full max-w-[400px]"
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 8 },
            show: { opacity: 1, y: 0, transition: spring },
          }}
          className="mb-8 text-center"
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0, rotate: -8 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 360, damping: 22 }}
            className="mb-4 inline-flex"
          >
            <Logo size={40} />
          </motion.div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="font-display text-2xl font-semibold tracking-tight text-asana-ink">
                {isLogin ? "С возвращением" : "Создать аккаунт"}
              </h1>
              <p className="mt-1.5 text-sm text-asana-muted">
                {isLogin
                  ? "Войдите, чтобы продолжить работу с задачами."
                  : "Доска для задач, без лишнего."}
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 12 },
            show: { opacity: 1, y: 0, transition: spring },
          }}
          className="rounded-2xl border border-asana-border bg-white/80 p-6 shadow-card backdrop-blur-xl"
        >
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

            <RollButton
              type="submit"
              disabled={busy}
              className="w-full justify-between"
            >
              {busy ? "Один момент..." : isLogin ? "Войти" : "Создать аккаунт"}
            </RollButton>
          </form>
        </motion.div>

        <motion.p
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { delay: 0.2 } },
          }}
          className="mt-5 text-center text-[13px] text-asana-muted"
        >
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
        </motion.p>
      </motion.div>
    </main>
  );
}
