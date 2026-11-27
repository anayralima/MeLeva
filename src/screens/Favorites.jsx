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
          <div className="activities--app grid gap-5 grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
            {upcoming.map((a) => (
              <ActivityCard key={a.id} activity={a} />
            ))}
          </div>
          {past.length > 0 && (
            <>
              <h2 className="mt-2 mb-1 mx-0 text-[13px] font-bold text-secundario">Já aconteceram</h2>
              <div className="activities--app grid gap-5 grid-cols-[repeat(auto-fill,minmax(260px,1fr))] opacity-60">
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
