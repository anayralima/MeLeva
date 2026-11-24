import { lazy, Suspense, useEffect, useState } from "react";
import { StoreProvider, useStore } from "./store.jsx";
import ModalHost from "./components/Modals.jsx";
import Landing from "./screens/Landing.jsx";
import Login from "./screens/Login.jsx";
import Signup from "./screens/Signup.jsx";
import Home from "./screens/Home.jsx";
import Explore from "./screens/Explore.jsx";
import ActivityDetails from "./screens/ActivityDetails.jsx";
import Confirmed from "./screens/Confirmed.jsx";
import CreateActivity from "./screens/CreateActivity.jsx";
import Published from "./screens/Published.jsx";
import MyActivities from "./screens/MyActivities.jsx";
import RateActivity from "./screens/RateActivity.jsx";
import Profile from "./screens/Profile.jsx";
import EditProfile from "./screens/EditProfile.jsx";
import PublicProfile from "./screens/PublicProfile.jsx";
import Messages from "./screens/Messages.jsx";
import Favorites from "./screens/Favorites.jsx";
import Notifications from "./screens/Notifications.jsx";
import Connections from "./screens/Connections.jsx";
import RecoverPassword from "./screens/RecoverPassword.jsx";
import Interests from "./screens/Interests.jsx";
import InitialProfile from "./screens/InitialProfile.jsx";

/* Ferramenta de armazenamento: só existe no modo de desenvolvimento. */
const StorageTool = import.meta.env.DEV ? lazy(() => import("./screens/StorageTool.jsx")) : null;

/** Lê o hash: "#/atividade/corrida-parque?x=1" → { name, param, query } */
export function parseRoute(hash = window.location.hash) {
  const clean = hash.startsWith("#/") ? hash.slice(2) : "";
  const [path, search = ""] = clean.split("?");
  const [name = "", ...rest] = path.split("/");
  return { name: name || "landing", param: rest.join("/") || null, query: Object.fromEntries(new URLSearchParams(search)) };
}

const SCREENS = {
  home: Home,
  explorar: Explore,
  atividade: ActivityDetails,
  confirmada: Confirmed,
  criar: CreateActivity,
  editar: CreateActivity,
  publicada: Published,
  minhas: MyActivities,
  avaliar: RateActivity,
  perfil: Profile,
  pessoa: PublicProfile,
  mensagens: Messages,
  favoritos: Favorites,
  notificacoes: Notifications,
  conexoes: Connections,
  interesses: Interests,
  "perfil-inicial": InitialProfile,
};

function Router() {
  const { state } = useStore();
  const [route, setRoute] = useState(parseRoute);

  useEffect(() => {
    function onHashChange() {
      if (!window.location.hash.startsWith("#/") && window.location.hash !== "") return;
      setRoute(parseRoute());
      window.scrollTo(0, 0);
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const { name, param, query } = route;
  const loggedIn = Boolean(state.session);

  useEffect(() => {
    const titles = { landing: "Me Leva • Treine junto em Teresópolis", login: "Entrar • Me Leva" };
    document.title = titles[name] ?? "Me Leva";
  }, [name]);

  if (name === "storage" && StorageTool) {
    return (
      <Suspense fallback={null}>
        <StorageTool onNavigate={(next, event) => { event?.preventDefault(); window.location.hash = `#/${next}`; }} />
      </Suspense>
    );
  }
  if (name === "login") return <Login />;
  if (name === "cadastro" || name === "signup") return <Signup />;
  if (name === "recuperar-senha") return <RecoverPassword />;

  const Screen = name === "perfil" && param === "editar" ? EditProfile : SCREENS[name];
  if (Screen) {
    return loggedIn ? <Screen param={param} query={query} /> : <Login next={`${name}${param ? `/${param}` : ""}`} />;
  }
  return <Landing />;
}

export default function App() {
  return (
    <StoreProvider>
      <Router />
      <ModalHost />
    </StoreProvider>
  );
}
