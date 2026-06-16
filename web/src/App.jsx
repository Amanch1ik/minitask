import { useEffect } from "react";
import { useAuth } from "./stores/auth.js";
import AuthView from "./views/AuthView.jsx";
import BoardView from "./views/BoardView.jsx";
import VerifyView from "./views/VerifyView.jsx";
import ResetPasswordView from "./views/ResetPasswordView.jsx";
import VideoBackground from "./components/ui/VideoBackground.jsx";

export default function App() {
  const { user, hydrated, hydrate } = useAuth();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Email-link landing pages — handled by path, no router dependency needed.
  const path = window.location.pathname;
  if (path === "/verify") {
    return (
      <>
        <VideoBackground />
        <VerifyView />
      </>
    );
  }
  if (path === "/reset-password") {
    return (
      <>
        <VideoBackground />
        <ResetPasswordView />
      </>
    );
  }

  if (!hydrated) return null;

  // One shared video backdrop behind every screen, so the look is identical
  // on auth and on the board.
  return (
    <>
      <VideoBackground />
      {user ? <BoardView /> : <AuthView />}
    </>
  );
}
