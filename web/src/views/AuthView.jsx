import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Input from "../components/ui/Input.jsx";
import Logo from "../components/ui/Logo.jsx";
import RollButton from "../components/ui/RollButton.jsx";
import { api } from "../api/client.js";
import { useAuth } from "../stores/auth.js";

const spring = { type: "spring", stiffness: 320, damping: 30 };

const ERROR_RU = {
  "Invalid email or password": "Неверный email или пароль",
  "Email already registered": "Этот email уже зарегистрирован",
  "Email not verified": "Сначала подтвердите email — мы отправили ссылку на почту.",
  "Not authenticated": "Сессия истекла, войдите снова",
  "Too many requests, slow down a bit.":
    "Слишком много попыток, подождите минуту",
};

const TITLES = {
  login: { h: "С возвращением", p: "Войдите, чтобы продолжить работу с задачами." },
  register: { h: "Создать аккаунт", p: "Доска для задач, без лишнего." },
  forgot: { h: "Сброс пароля", p: "Пришлём ссылку для сброса на вашу почту." },
};

export default function AuthView() {
  const [mode, setMode] = useState("login"); // login | register | forgot
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  // notice: { kind: "check-email" | "reset-sent", email }
  const [notice, setNotice] = useState(null);
  // set when login is refused because the email is not yet confirmed
  const [needsVerify, setNeedsVerify] = useState(null);

  const { login, register } = useAuth();
  const title = TITLES[mode];

  function switchMode(next) {
    setMode(next);
    setError(null);
    setNeedsVerify(null);
    setNotice(null);
  }

  function ruError(err) {
    const raw = err?.message ?? "";
    return ERROR_RU[raw] ?? raw ?? "Что-то пошло не так.";
  }

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setNeedsVerify(null);
    setBusy(true);
    try {
      if (mode === "login") {
        await login(email, password); // success flips the store → board
      } else if (mode === "register") {
        await register(email, password);
        setNotice({ kind: "check-email", email });
      } else {
        await api.forgotPassword(email);
        setNotice({ kind: "reset-sent", email });
      }
    } catch (err) {
      if (mode === "login" && err?.status === 403) {
        setNeedsVerify(email);
      } else {
        setError(ruError(err));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
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
              key={notice ? "notice" : mode}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="eyebrow text-teal">Минитаск</p>
              <h1 className="mt-2 font-display text-[32px] font-medium leading-tight tracking-tight text-charcoal">
                {notice ? "Проверьте почту" : title.h}
              </h1>
              <p className="mt-2 text-[14px] leading-relaxed text-asana-muted">
                {notice ? notice.email : title.p}
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 12 },
            show: { opacity: 1, y: 0, transition: spring },
          }}
          className="rounded-2xl border border-asana-border bg-white/85 p-6 shadow-lift backdrop-blur-md"
        >
          {notice ? (
            <NoticePanel notice={notice} onBack={() => switchMode("login")} />
          ) : (
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
              {mode !== "forgot" && (
                <Input
                  label="Пароль"
                  type="password"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="не короче 8 символов"
                />
              )}

              <AnimatePresence>
                {needsVerify && (
                  <ResendBanner key="resend" email={needsVerify} />
                )}
                {error && (
                  <motion.p
                    key="error"
                    initial={{ opacity: 0, y: -4, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={spring}
                    className="overflow-hidden rounded-md border border-clay/40 bg-clay-soft px-3 py-2 text-sm text-[#9c3a33]"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <RollButton type="submit" disabled={busy} className="w-full justify-between">
                {busy
                  ? "Один момент..."
                  : mode === "login"
                    ? "Войти"
                    : mode === "register"
                      ? "Создать аккаунт"
                      : "Отправить ссылку"}
              </RollButton>

              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => switchMode("forgot")}
                  className="block w-full text-center text-[13px] text-asana-muted hover:text-asana-ink"
                >
                  Забыли пароль?
                </button>
              )}
            </form>
          )}
        </motion.div>

        {!notice && (
          <motion.p
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { delay: 0.2 } },
            }}
            className="mt-5 text-center text-[13px] text-asana-muted"
          >
            {mode === "login" ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
            <button
              type="button"
              onClick={() => switchMode(mode === "login" ? "register" : "login")}
              className="font-medium text-asana-coral hover:underline underline-offset-4"
            >
              {mode === "login" ? "Создать" : "Войти"}
            </button>
          </motion.p>
        )}
      </motion.div>
    </main>
  );
}

function NoticePanel({ notice, onBack }) {
  const text =
    notice.kind === "check-email"
      ? "Мы отправили ссылку для подтверждения. Откройте её, чтобы завершить регистрацию и войти."
      : "Если такой аккаунт существует, мы отправили ссылку для сброса пароля.";

  return (
    <div className="space-y-4 text-center">
      <p className="text-sm text-asana-muted">{text}</p>
      {notice.kind === "check-email" && <ResendBanner email={notice.email} inline />}
      <button
        type="button"
        onClick={onBack}
        className="text-[13px] font-medium text-asana-coral hover:underline underline-offset-4"
      >
        Вернуться ко входу
      </button>
    </div>
  );
}

function ResendBanner({ email, inline = false }) {
  const [state, setState] = useState("idle"); // idle | sending | sent

  async function resend() {
    setState("sending");
    try {
      await api.resendVerification(email);
    } finally {
      setState("sent");
    }
  }

  const base = inline
    ? "text-sm text-asana-muted"
    : "overflow-hidden rounded-md border border-amber-300/60 bg-amber-50 px-3 py-2 text-sm text-amber-800";

  const content =
    state === "sent" ? (
      <span>Письмо отправлено повторно.</span>
    ) : (
      <>
        {!inline && <span>Email не подтверждён. </span>}
        <button
          type="button"
          onClick={resend}
          disabled={state === "sending"}
          className="font-medium text-asana-coral hover:underline underline-offset-4 disabled:opacity-50"
        >
          {state === "sending" ? "Отправляем..." : "Отправить письмо ещё раз"}
        </button>
      </>
    );

  if (inline) return <p className={base}>{content}</p>;

  return (
    <motion.p
      initial={{ opacity: 0, y: -4, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={spring}
      className={base}
    >
      {content}
    </motion.p>
  );
}
