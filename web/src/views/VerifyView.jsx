import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Logo from "../components/ui/Logo.jsx";
import { api } from "../api/client.js";

/**
 * Lands here from the email link: /verify?token=... — confirms the address,
 * then bounces to the board (the verify call sets the session cookie).
 */
export default function VerifyView() {
  const [state, setState] = useState("verifying"); // verifying | success | error

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setState("error");
      return;
    }
    let cancelled = false;
    api
      .verify(token)
      .then(() => {
        if (cancelled) return;
        setState("success");
        // Full reload to "/" so the app boots logged-in on the board.
        setTimeout(() => window.location.replace("/"), 900);
      })
      .catch(() => !cancelled && setState("error"));
    return () => {
      cancelled = true;
    };
  }, []);

  const copy = {
    verifying: { h: "Подтверждаем email...", p: "Секунду." },
    success: { h: "Готово!", p: "Email подтверждён. Открываем доску..." },
    error: {
      h: "Ссылка недействительна",
      p: "Ссылка устарела или уже использована. Войдите и запросите новую.",
    },
  }[state];

  return (
    <AuthCard heading={copy.h} subtitle={copy.p}>
      {state === "error" && (
        <button
          type="button"
          onClick={() => window.location.replace("/")}
          className="text-[13px] font-medium text-asana-coral hover:underline underline-offset-4"
        >
          Вернуться ко входу
        </button>
      )}
    </AuthCard>
  );
}

function AuthCard({ heading, subtitle, children }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className="w-full max-w-[400px]"
      >
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex">
            <Logo size={40} />
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-asana-ink">
            {heading}
          </h1>
          <p className="mt-1.5 text-sm text-asana-muted">{subtitle}</p>
        </div>
        {children && (
          <div className="rounded-2xl border border-asana-border bg-white/95 p-6 text-center shadow-card">
            {children}
          </div>
        )}
      </motion.div>
    </main>
  );
}
