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
        <header className="modal-head">
          <h2>Filtros</h2>
          <button className="icon-btn" type="button" aria-label="Fechar filtros" onClick={onClose}>
            {Icon.close}
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-[22px] overflow-y-auto px-6 pt-2 pb-6">
          <fieldset>
            <legend className="label">Esporte</legend>
            <div className="flex gap-2 flex-wrap">
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
            <div className="flex gap-2 flex-wrap">
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
            <input className="w-full accent-rosa" type="range" min="1" max="10" step="1" value={draft.maxKm} onChange={(e) => set("maxKm", Number(e.target.value))} />
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

        <footer className="modal-foot">
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
      <div className="flex items-end justify-between gap-4 mb-5 max-md:flex-col max-md:items-stretch [&_svg]:size-4 [&_svg]:shrink-0 [&_h1]:text-[30px] [&_h1]:font-extrabold [&_h1]:tracking-[-0.6px] max-md:[&_h1]:text-[24px] [&_p]:mt-1 [&_p]:text-[14px] [&_p]:text-secundario">
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

      <div className="flex gap-2 flex-nowrap mb-5 pb-1 overflow-x-auto [scrollbar-width:none]" role="group" aria-label="Filtros rápidos">
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

      <div className={view === "" ? "explore explore--map grid gap-6 items-start grid-cols-[340px_minmax(0,1fr)] max-2xl:grid-cols-[minmax(0,1fr)_300px] max-xl:grid-cols-[1fr]" : "explore grid grid-cols-[minmax(0,1fr)_340px] gap-6 items-start max-2xl:grid-cols-[minmax(0,1fr)_300px] max-xl:grid-cols-[1fr]"}>
        <section className="max-xl:[.explore--map_&]:order-2" aria-live="polite" aria-busy={loading}>
          <div className="flex items-center justify-between gap-3 mb-3.5 [&_h2]:text-[18px]">
            <h2>Perto de você</h2>
            <label className="flex items-center gap-1.5 text-[13px] text-secundario [&_select]:border-0 [&_select]:bg-transparent [&_select]:font-sans [&_select]:text-[13px] [&_select]:font-semibold [&_select]:text-principal [&_select]:cursor-pointer">
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
              <div className="empty-actions">
                <button className="btn btn--lilac" type="button" onClick={clear}>
                  Limpar filtros
                </button>
                <a className="btn btn--gradient" href={link("criar")}>
                  {Icon.plus} Criar atividade
                </a>
              </div>
            </EmptyState>
          ) : view === "list" ? (
            <div className="flex flex-col gap-3.5">
              {results.map((activity) => (
                <ActivityRow key={activity.id} activity={activity} selected={selected?.id === activity.id} onSelect={setSelectedId} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {results.map((activity) => (
                <button key={activity.id} type="button" className={selected?.id === activity.id ? "is-active p-2.5 border border-rosa flex items-center gap-3 rounded-[14px] text-left cursor-pointer bg-[#fff7fb] [&_img]:size-13 [&_img]:rounded-[10px] [&_img]:object-cover [&_span]:flex [&_span]:flex-col [&_span]:gap-0.5 [&_span]:text-[14px] [&_span]:text-principal [&_small]:text-[12px] [&_small]:text-secundario" : "p-2.5 border border-borda flex items-center gap-3 rounded-[14px] bg-superficie text-left cursor-pointer [&_img]:size-13 [&_img]:rounded-[10px] [&_img]:object-cover [&_span]:flex [&_span]:flex-col [&_span]:gap-0.5 [&_span]:text-[14px] [&_span]:text-principal [&_small]:text-[12px] [&_small]:text-secundario"} onClick={() => setSelectedId(activity.id)}>
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

        <aside className="p-5 border border-borda rounded-[20px] bg-superficie shadow-[0_6px_20px_rgba(36,15,92,0.07)] sticky top-4 max-xl:static [.explore--map_&]:order-2 max-2xl:[.explore--map_&]:order-0 max-xl:[.explore:not(.explore--map)_&]:hidden">
          <header className="flex items-center justify-between gap-3 mb-3.5 [&_h2]:text-[17px] [&_h2]:font-semibold">
            <h2>Mapa</h2>
            {view === "list" && (
              <button className="link" type="button" onClick={() => setView("map")}>
                Ampliar
              </button>
            )}
          </header>
          <MapView activities={loading ? [] : results} selectedId={selected?.id} onSelect={setSelectedId} />
          <p className="my-3 mx-0 flex items-center gap-1.5 text-[12px] font-medium text-roxo [&_svg]:size-4 [&_svg]:shrink-0">
            {Icon.lock} Locais aproximados • ponto exato só pra quem participa
          </p>
          {selected && !loading && results.length > 0 && (
            <a className="p-2.5 flex items-center gap-3 rounded-[14px] bg-pagina [&_img]:size-16 [&_img]:rounded-[10px] [&_img]:object-cover [&>span:nth-child(2)]:flex [&>span:nth-child(2)]:flex-1 [&>span:nth-child(2)]:flex-col [&>span:nth-child(2)]:gap-0.75 [&>span:nth-child(2)]:min-w-0 [&>span:nth-child(2)]:text-[14px] [&_small]:text-[12px] [&_small]:text-secundario" href={link(`atividade/${selected.id}`)}>
              <img src={selected.image} alt="" />
              <span>
                <strong>{selected.title}</strong>
                <small>
                  {place(selected)} • {friendlyWhen(selected.start)}
                </small>
                <span className="flex items-center gap-2">
                  <SpotsText activity={selected} />
                  <LevelTag level={selected.level} />
                </span>
              </span>
              <span className="size-5 text-rosa">{Icon.arrowRight}</span>
            </a>
          )}
        </aside>
      </div>

      {view === "list" && (
        <button className="hidden max-xl:py-3 max-xl:px-5 max-xl:border-0 max-xl:fixed max-xl:bottom-23 max-xl:left-1/2 max-xl:z-40 max-xl:flex max-xl:items-center max-xl:gap-2 max-xl:rounded-full max-xl:bg-principal max-xl:shadow-[0_12px_30px_rgba(36,16,91,0.3)] max-xl:text-[14px] max-xl:font-semibold max-xl:text-white max-xl:[transform:translateX(-50%)] max-xl:cursor-pointer max-xl:[&_svg]:size-4.5" type="button" onClick={() => setView("map")}>
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
