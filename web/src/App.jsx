import { useEffect } from "react";
import { useAuth } from "./stores/auth.js";
import AuthView from "./views/AuthView.jsx";
import BoardView from "./views/BoardView.jsx";
import Ambient from "./components/ui/Ambient.jsx";

export default function App() {
  const { user, hydrated, hydrate } = useAuth();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hydrated) {
    return (
      <>
        <Ambient />
      </>
    );
  }

  return (
    <>
      <Ambient />
      {user ? <BoardView /> : <AuthView />}
    </>
  );
}
