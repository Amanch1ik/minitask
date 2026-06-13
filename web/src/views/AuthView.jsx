import { useState } from "react";
import { motion } from "motion/react";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import { useAuth } from "../stores/auth.js";

export default function AuthView() {
  const [mode, setMode] = useState("login"); // "login" | "register"
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
    <main className="relative min-h-screen overflow-hidden">
      <div className="glow-corner pointer-events-none absolute inset-0" />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-6xl items-center gap-16 px-6 py-16 lg:grid-cols-[5fr_7fr] lg:py-24">
        {/* Left — typography panel */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          <p className="eyebrow">
            {isLogin ? "Enter · session" : "Create · account"}
          </p>
          <h1 className="font-display text-[clamp(2.5rem,5vw,4rem)] leading-[1.05] tracking-tight">
            {isLogin ? (
              <>
                Welcome <em className="not-italic text-teal">back</em>
                <br />
                to your tasks.
              </>
            ) : (
              <>
                A quiet place
                <br />
                for <em className="not-italic text-teal">your</em> tasks.
              </>
            )}
          </h1>
          <p className="max-w-md text-charcoal-soft">
            One board, three lanes, no clutter. Drag work between todo, in
            progress and done. Your session stays for thirty days; sign out
            ends it sooner.
          </p>
        </motion.section>

        {/* Right — form panel */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="relative rounded-card bg-cream-dark/40 p-8 shadow-card backdrop-blur-sm md:p-10">
            <form onSubmit={submit} className="space-y-6">
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
              <Input
                label="Password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                hint={isLogin ? undefined : "at least 8 characters"}
              />

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm text-amber"
                >
                  {error}
                </motion.p>
              )}

              <div className="flex items-center justify-between gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode(isLogin ? "register" : "login");
                    setError(null);
                  }}
                  className="text-sm text-charcoal-mute underline-offset-4 transition-colors hover:text-charcoal hover:underline"
                >
                  {isLogin ? "Create account" : "I have an account"}
                </button>
                <Button type="submit" size="lg" disabled={busy}>
                  {busy ? "…" : isLogin ? "Enter" : "Create"}
                  <span aria-hidden>→</span>
                </Button>
              </div>
            </form>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
