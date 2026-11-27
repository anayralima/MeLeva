import { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell.jsx";
import { ActivityRow, EmptyState, LevelTag, link, MapView, Segmented, Skeleton, SpotsText, Toggle } from "../components/ui.jsx";
import { Icon } from "../icons.jsx";
import { useStore } from "../store.jsx";
import { countFilters, DEFAULT_FILTERS, filterActivities, findActivity, LEVELS, SPORTS, visibleActivities } from "../services/rules.js";
import { friendlyWhen, place } from "../utils/format.js";

const QUICK_WHEN = [
  { id: "all", label: "Todas" },
  { id: "today", label: "Hoje" },
  { id: "week", label: "Esta semana" },
  { id: "weekend", label: "Fim de semana" },
];
const QUICK_SPORTS = ["Corrida", "Trilha", "Futebol", "Yoga", "Ciclismo"];
const SORTS = [
  { id: "date", label: "Mais próximas no tempo" },
  { id: "distance", label: "Mais perto de mim" },
  { id: "spots", label: "Mais vagas" },
];

function initialFilters(query) {
  return {
    ...DEFAULT_FILTERS,
    query: query.q ?? "",
    sports: query.esporte ? [query.esporte] : [],
  };
}

/** Painel de filtros — tela 08 (RF13). */
function FilterPanel({ filters, onApply, onClose }) {
  const [draft, setDraft] = useState(filters);
  const set = (key, value) => setDraft({ ...draft, [key]: value });
  const toggle = (key, value) => set(key, draft[key].includes(value) ? draft[key].filter((v) => v !== value) : [...draft[key], value]);

  return (
    <div
      className="fixed inset-0 z-[150] grid grid-rows-[minmax(0,1fr)] justify-items-end bg-[rgba(24,10,60,0.45)] animate-[fade_0.15s_ease]"
      role="dialog"
      aria-modal="true"
      aria-label="Filtros"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form
        className="flex h-full min-h-0 w-full max-w-[420px] flex-col bg-superficie animate-[slide_0.2s_ease]"
        onSubmit={(e) => {
          e.preventDefault();
          onApply(draft);
        }}
      >
        <header className="modal__head">
          <h2>Filtros</h2>
          <button className="icon-btn" type="button" aria-label="Fechar filtros" onClick={onClose}>
            {Icon.close}
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-[22px] overflow-y-auto px-6 pt-2 pb-6">
          <fieldset>
            <legend className="label">Esporte</legend>
            <div className="chips chips--wrap">
              {SPORTS.slice(0, 10).map((sport) => (
                <button key={sport} type="button" aria-pressed={draft.sports.includes(sport)} className={draft.sports.includes(sport) ? "chip chip--active" : "chip"} onClick={() => toggle("sports", sport)}>
                  {sport}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="label">Data</legend>
            <Segmented label="Data" options={QUICK_WHEN} value={draft.when} onChange={(id) => set("when", id)} />
          </fieldset>

          <fieldset>
            <legend className="label">Horário</legend>
            <Segmented
              label="Horário"
              options={[
                { id: "all", label: "Qualquer" },
                { id: "morning", label: "Manhã" },
                { id: "afternoon", label: "Tarde" },
                { id: "night", label: "Noite" },
              ]}
              value={draft.period}
              onChange={(id) => set("period", id)}
            />
          </fieldset>

          <fieldset>
            <legend className="label">Nível</legend>
            <div className="chips chips--wrap">
              {LEVELS.slice(0, 3).map((level) => (
                <button key={level} type="button" aria-pressed={draft.levels.includes(level)} className={draft.levels.includes(level) ? "chip chip--active" : "chip"} onClick={() => toggle("levels", level)}>
                  {level}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="field">
            <span className="label">
              Distância máxima: <strong>{draft.maxKm} km</strong>
            </span>
            <input className="range" type="range" min="1" max="10" step="1" value={draft.maxKm} onChange={(e) => set("maxKm", Number(e.target.value))} />
          </label>

          <div className="switch-row">
            <span>
              <strong>Só com vagas abertas</strong>
              <small>Esconde as lotadas</small>
            </span>
            <Toggle checked={draft.openOnly} onChange={(v) => set("openOnly", v)} label="Só com vagas abertas" />
          </div>
          <div className="switch-row switch-row--disabled">
            <span>
              <strong>Só atividades gratuitas</strong>
              <small>Em breve • no MVP todas são grátis</small>
            </span>
            <Toggle checked onChange={() => {}} label="Só atividades gratuitas (em breve)" />
          </div>
        </div>

        <footer className="modal__foot">
          <button className="btn btn--lilac" type="button" onClick={() => setDraft({ ...DEFAULT_FILTERS, query: draft.query, sort: draft.sort })}>
            Limpar
          </button>
          <button className="btn btn--gradient" type="submit">
            Ver resultados
          </button>
        </footer>
      </form>
    </div>
  );
}

/** Telas 07, 07b, 07c, 07d — Explorar em lista/mapa, sem resultados e carregando (RF12, RF16). */
export default function Explore({ query }) {
  const { state } = useStore();
  const [filters, setFilters] = useState(() => initialFilters(query));
  const [view, setView] = useState(query.view === "mapa" ? "map" : "list");
  const [panel, setPanel] = useState(query.filtros === "1");
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  // Atualiza quando a busca do topo muda a URL.
  useEffect(() => {
    setFilters((f) => ({ ...f, query: query.q ?? "", sports: query.esporte ? [query.esporte] : f.sports }));
  }, [query.q, query.esporte]);

  // Estado de carregamento (07d) a cada nova busca — simula a resposta do servidor.
  const key = JSON.stringify(filters);
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(timer);
  }, [key]);

  const results = useMemo(() => filterActivities(visibleActivities(state), filters), [state, filters]);
  const selected = findActivity(state, selectedId) ?? results[0];
  const active = countFilters(filters);

  const setQuick = (patch) => setFilters({ ...filters, ...patch });
  const clear = () => setFilters({ ...DEFAULT_FILTERS });

  return (
    <AppShell active="explorar">
      <div className="page-head">
        <div>
          <h1>Explorar atividades</h1>
          <p>
            {loading ? "Buscando atividades…" : `${results.length} ${results.length === 1 ? "atividade" : "atividades"} em Teresópolis`}
            {filters.query && ` para “${filters.query}”`}
          </p>
        </div>
        <Segmented
          pill
          tabs
          label="Modo de visualização"
          options={[
            { id: "list", label: "Lista", icon: Icon.list },
            { id: "map", label: "Mapa", icon: Icon.map },
          ]}
          value={view}
          onChange={setView}
        />
      </div>

      <div className="chips chips--scroll" role="group" aria-label="Filtros rápidos">
        <button className="chip chip--dark" type="button" onClick={() => setPanel(true)}>
          {Icon.filter} Filtros{active ? ` • ${active}` : ""}
        </button>
        {QUICK_WHEN.map((w) => (
          <button key={w.id} type="button" aria-pressed={filters.when === w.id} className={filters.when === w.id ? "chip chip--active" : "chip"} onClick={() => setQuick({ when: w.id })}>
            {w.label}
          </button>
        ))}
        {QUICK_SPORTS.map((sport) => {
          const on = filters.sports.includes(sport);
          return (
            <button key={sport} type="button" aria-pressed={on} className={on ? "chip chip--active" : "chip"} onClick={() => setQuick({ sports: on ? filters.sports.filter((s) => s !== sport) : [...filters.sports, sport] })}>
              {sport}
            </button>
          );
        })}
        <button type="button" aria-pressed={filters.levels.includes("Iniciante")} className={filters.levels.includes("Iniciante") ? "chip chip--active" : "chip"} onClick={() => setQuick({ levels: filters.levels.includes("Iniciante") ? [] : ["Iniciante"] })}>
          Iniciante
        </button>
      </div>

      <div className={view === "map" ? "explore explore--map" : "explore"}>
        <section className="explore__list" aria-live="polite" aria-busy={loading}>
          <div className="explore__bar">
            <h2>Perto de você</h2>
            <label className="sort">
              Ordenar:
              <select value={filters.sort} onChange={(e) => setQuick({ sort: e.target.value })}>
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {loading ? (
            <Skeleton rows={3} />
          ) : results.length === 0 ? (
            <EmptyState icon={Icon.compass} title="Nada por aqui… ainda!" text="Não achamos atividades com esses filtros. Tente ampliar a distância ou mudar a data — ou crie a sua e chame a galera.">
              <div className="empty__actions">
                <button className="btn btn--lilac" type="button" onClick={clear}>
                  Limpar filtros
                </button>
                <a className="btn btn--gradient" href={link("criar")}>
                  {Icon.plus} Criar atividade
                </a>
              </div>
            </EmptyState>
          ) : view === "list" ? (
            <div className="row-list">
              {results.map((activity) => (
                <ActivityRow key={activity.id} activity={activity} selected={selected?.id === activity.id} onSelect={setSelectedId} />
              ))}
            </div>
          ) : (
            <div className="map-list">
              {results.map((activity) => (
                <button key={activity.id} type="button" className={selected?.id === activity.id ? "map-item is-active" : "map-item"} onClick={() => setSelectedId(activity.id)}>
                  <img src={activity.image} alt="" />
                  <span>
                    <strong>{activity.title}</strong>
                    <small>
                      {place(activity)} • {friendlyWhen(activity.start)}
                    </small>
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        <aside className="panel explore__map">
          <header className="panel__head">
            <h2>Mapa</h2>
            {view === "list" && (
              <button className="link" type="button" onClick={() => setView("map")}>
                Ampliar
              </button>
            )}
          </header>
          <MapView activities={loading ? [] : results} selectedId={selected?.id} onSelect={setSelectedId} />
          <p className="map-note">
            {Icon.lock} Locais aproximados • ponto exato só pra quem participa
          </p>
          {selected && !loading && results.length > 0 && (
            <a className="map-card" href={link(`atividade/${selected.id}`)}>
              <img src={selected.image} alt="" />
              <span>
                <strong>{selected.title}</strong>
                <small>
                  {place(selected)} • {friendlyWhen(selected.start)}
                </small>
                <span className="map-card__foot">
                  <SpotsText activity={selected} />
                  <LevelTag level={selected.level} />
                </span>
              </span>
              <span className="map-card__go">{Icon.arrowRight}</span>
            </a>
          )}
        </aside>
      </div>

      {view === "list" && (
        <button className="fab-map" type="button" onClick={() => setView("map")}>
          {Icon.map} Ver no mapa
        </button>
      )}

      {panel && (
        <FilterPanel
          filters={filters}
          onClose={() => setPanel(false)}
          onApply={(next) => {
            setFilters(next);
            setPanel(false);
          }}
        />
      )}
    </AppShell>
  );
}
