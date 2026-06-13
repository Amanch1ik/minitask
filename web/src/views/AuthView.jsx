import { useState } from "react";
import { motion } from "motion/react";
import Input from "../components/ui/Input.jsx";
import Logo from "../components/ui/Logo.jsx";
import MagneticButton from "../components/ui/MagneticButton.jsx";
import { useAuth } from "../stores/auth.js";

const ease = [0.16, 1, 0.3, 1];

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
      setError(err?.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 28, rotateX: -6 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.8, ease, delay: 0.05 }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative w-full max-w-lg"
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.15 }}
          className="mb-10 flex flex-col items-center text-center"
        >
          <Logo size={56} className="mb-7" />

          <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-zinc-200/70 bg-white/60 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-500 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-soft" />
            tasks · v0.1
          </p>

          <h1 className="display text-5xl text-zinc-900 sm:text-6xl">
            {isLogin ? (
              <>
                Welcome <em>back</em>
              </>
            ) : (
              <>
                A board for <em>your</em> tasks
              </>
            )}
          </h1>
          <p className="mt-4 max-w-sm text-[15px] text-zinc-500">
            {isLogin
              ? "Sign in to pick up where you left off."
              : "Three lanes, priority, deadline. Nothing in the way."}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.3 }}
          className="shine-border relative rounded-2xl bg-white/70 p-7 shadow-card backdrop-blur-2xl ring-1 ring-zinc-200/50 sm:p-8"
          style={{ transformStyle: "preserve-3d" }}
        >
          <form onSubmit={submit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="at least 8 characters"
            />

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-rose-200 bg-rose-50/80 px-3 py-2 text-sm text-rose-700 backdrop-blur-sm"
              >
                {error}
              </motion.p>
            )}

            <MagneticButton type="submit" disabled={busy} className="w-full">
              {busy ? "…" : isLogin ? "Sign in" : "Create account"}
              <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </MagneticButton>
          </form>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease, delay: 0.45 }}
          className="mt-6 text-center text-sm text-zinc-500"
        >
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(isLogin ? "register" : "login");
              setError(null);
            }}
            className="font-medium text-zinc-900 underline-offset-4 hover:underline"
          >
            {isLogin ? "Create one" : "Sign in"}
          </button>
        </motion.p>
      </motion.div>
    </main>
  );
}
