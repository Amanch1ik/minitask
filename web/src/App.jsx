import { useEffect } from "react";
import { useAuth } from "./stores/auth.js";
import AuthView from "./views/AuthView.jsx";
import BoardView from "./views/BoardView.jsx";

export default function App() {
  const { user, hydrated, hydrate } = useAuth();

  useEffect(() => {
    // Ask the API whether the session cookie is still valid. Until that round-
    // trip completes we render nothing — flashing the auth screen and then
    // swapping to the board on success is jarring.
    hydrate();
  }, [hydrate]);

  if (!hydrated) {
    return null;
  }

  return user ? <BoardView /> : <AuthView />;
}
