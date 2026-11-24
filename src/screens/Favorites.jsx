import AppShell from "../components/AppShell.jsx";
import { ActivityCard, EmptyState, link, PageHead } from "../components/ui.jsx";
import { Icon } from "../icons.jsx";
import { useStore } from "../store.jsx";
import { isPast } from "../services/rules.js";

/** Tela 17 — Favoritos (RF14). */
export default function Favorites() {
  const { state } = useStore();
  const saved = state.favorites
    .map((id) => state.activities.find((a) => a.id === id))
    .filter((a) => a && a.status === "published" && !state.blocked.includes(a.organizer));
  const upcoming = saved.filter((a) => !isPast(a));
  const past = saved.filter((a) => isPast(a));

  return (
    <AppShell active="favoritos">
      <PageHead title="Favoritos" subtitle={`${upcoming.length} atividades salvas para decidir depois.`} />
      {saved.length === 0 ? (
        <EmptyState icon={Icon.heart} title="Nenhum favorito ainda" text="Toque no coração de uma atividade para salvar aqui.">
          <a className="btn btn--gradient" href={link("explorar")}>Explorar atividades</a>
        </EmptyState>
      ) : (
        <>
          <div className="activities activities--app activities--fill">
            {upcoming.map((a) => (
              <ActivityCard key={a.id} activity={a} />
            ))}
          </div>
          {past.length > 0 && (
            <>
              <h2 className="group-title">Já aconteceram</h2>
              <div className="activities activities--app activities--fill is-faded">
                {past.map((a) => (
                  <ActivityCard key={a.id} activity={a} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </AppShell>
  );
}
