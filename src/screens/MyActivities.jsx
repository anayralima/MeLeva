import { useState } from "react";
import AppShell from "../components/AppShell.jsx";
import { AvatarStack, EmptyState, link, PageHead, StatusTag } from "../components/ui.jsx";
import { Icon } from "../icons.jsx";
import { useStore } from "../store.jsx";
import { canRate, isCanceled, isPast, statusOf } from "../services/rules.js";
import { dayDiff, inDays, monthLong, monthShort, timeRange } from "../utils/format.js";

function DateBox({ iso }) {
  const d = new Date(iso);
  return (
    <span className="flex shrink-0 flex-col items-center justify-center w-16 h-18 rounded-[14px] bg-rosa-suave text-rosa-texto [&_strong]:text-[24px] [&_strong]:leading-[1] [&_small]:text-[11px] [&_small]:font-bold">
      <strong>{d.getDate()}</strong>
      <small>{monthShort(d).toUpperCase()}</small>
    </span>
  );
}

function Item({ activity, action }) {
  return (
    <article className="p-3 border border-borda flex items-center gap-4 rounded-[18px] bg-superficie max-md:flex-wrap">
      <DateBox iso={activity.start} />
      <img className="shrink-0 w-25 h-18 rounded-[12px] object-cover max-md:hidden" src={activity.image} alt="" />
      <div className="flex flex-1 flex-col gap-1.5 min-w-0 max-md:basis-[calc(100%_-_84px)] [&_h3]:text-[16px]">
        <div className="row-card-tags flex flex-wrap items-center gap-2">
          {action.tag ?? <StatusTag activity={activity} />}
          <small className="text-secundario [&_svg]:size-4 [&_svg]:shrink-0 [.profile-head-info_&]:flex [.profile-head-info_&]:flex-wrap [.profile-head-info_&]:items-center [.profile-head-info_&]:gap-1 [.profile-head-info_&]:text-[13px]">{action.when ?? inDays(activity.start)}</small>
        </div>
        <h3>
          <a href={link(`atividade/${activity.id}`)}>{activity.title}</a>
        </h3>
        <ul className="flex flex-wrap gap-y-1 gap-x-4 list-none text-[13px] text-secundario [&_svg]:shrink-0 [&_svg]:size-3.5 [&_li]:flex [&_li]:items-center [&_li]:gap-1.5">
          <li>{Icon.clock} {timeRange(activity.start, activity.durationMin)}</li>
          <li>{Icon.mapPin} {activity.region}</li>
        </ul>
      </div>
      <div className="flex flex-col items-end gap-2.5 max-md:flex-row max-md:justify-between max-md:w-full">
        <AvatarStack ids={activity.participants.filter((p) => p !== "me")} />
        {action.button}
      </div>
    </article>
  );
}

function Calendar({ activities }) {
  const [offset, setOffset] = useState(0);
  const now = new Date();
  const month = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const marked = new Set(
    activities
      .filter((a) => {
        const d = new Date(a.start);
        return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear();
      })
      .map((a) => new Date(a.start).getDate()),
  );
  const isThisMonth = offset === 0;

  return (
    <section className="card calendar">
      <header className="card-row">
        <h2 className="text-[16px] font-bold">
          {monthLong(month).replace(/^./, (c) => c.toUpperCase())} {month.getFullYear()}
        </h2>
        <span className="flex gap-1.5">
          <button className="icon-btn icon-btn--sm" type="button" aria-label="Mês anterior" onClick={() => setOffset(offset - 1)}>{Icon.arrowLeft}</button>
          <button className="icon-btn icon-btn--sm" type="button" aria-label="Próximo mês" onClick={() => setOffset(offset + 1)}>{Icon.arrowRight}</button>
        </span>
      </header>
      <div className="calendar-grid grid grid-cols-[repeat(7,1fr)] gap-1 text-center [&>span]:relative [&>span]:grid [&>span]:place-items-center [&>span]:h-8.5 [&>span]:rounded-[10px] [&>span]:text-[13px]" role="grid">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
          <span key={i} className="font-semibold text-secundario text-[12px]!">{d}</span>
        ))}
        {Array.from({ length: month.getDay() }).map((_, i) => (
          <span key={`e${i}`} />
        ))}
        {Array.from({ length: days }).map((_, i) => {
          const day = i + 1;
          const today = isThisMonth && day === now.getDate();
          return (
            <span key={day} className={[today ? "[.calendar-grid_&]:[background:var(--gradiente-marca)] [.calendar-grid_&]:font-bold [.calendar-grid_&]:text-white" : "", marked.has(day) ? "[.calendar-grid_&]:font-bold [.calendar-grid_&]:text-rosa-texto [.calendar-grid_&]:after:absolute [.calendar-grid_&]:after:bottom-0.75 [.calendar-grid_&]:after:size-1 [.calendar-grid_&]:after:rounded-full [.calendar-grid_&]:after:bg-rosa" : ""].join(" ")}>
              {day}
            </span>
          );
        })}
      </div>
    </section>
  );
}

/** Telas 12, 12b, 12c — Minhas atividades: próximas, criadas e histórico (RF29). */
export default function MyActivities({ query }) {
  const { state, openModal, run, toast } = useStore();
  const [tab, setTab] = useState(query.aba === "criadas" ? "created" : query.aba === "historico" ? "history" : "next");

  const mine = state.activities.filter((a) => statusOf(a) !== "none" && !state.blocked.includes(a.organizer));
  const upcoming = mine
    .filter((a) => !isPast(a) && a.status === "published")
    .sort((a, b) => new Date(a.start) - new Date(b.start));
  const created = state.activities.filter((a) => a.organizer === "me" && a.status !== "canceled" && !isPast(a));
  const drafts = created.filter((a) => a.status === "draft");
  const publishedMine = created.filter((a) => a.status === "published");
  const history = mine
    .filter((a) => (isPast(a) || isCanceled(a)) && a.status !== "draft" && statusOf(a) !== "waitlist")
    .sort((a, b) => new Date(b.start) - new Date(a.start));

  const thisWeek = upcoming.filter((a) => dayDiff(a.start) < 7);
  const later = upcoming.filter((a) => dayDiff(a.start) >= 7);
  const ratedCount = Object.keys(state.ratings).length;

  const tabs = [
    { id: "next", label: "Próximas", count: upcoming.length },
    { id: "created", label: "Criadas por mim", count: created.length },
    { id: "history", label: "Histórico", count: history.length },
  ];

  function nextButton(activity) {
    const status = statusOf(activity);
    if (status === "organizer") return <a className="btn btn--lilac btn--sm" href={link(`atividade/${activity.id}`)}>Gerenciar</a>;
    if (status === "confirmed") return <a className="btn btn--lilac btn--sm" href={link(`mensagens/${activity.id}`)}>{Icon.chat} Chat</a>;
    return <a className="btn btn--lilac btn--sm" href={link(`atividade/${activity.id}`)}>Ver detalhes</a>;
  }

  return (
    <AppShell active="minhas">
      <PageHead title="Minhas atividades" subtitle="O que você vai fazer, o que criou e tudo que já rolou." />
      <div className="flex gap-6 mb-5 border-b border-b-borda overflow-x-auto" role="tablist">
        {tabs.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} className={tab === t.id ? "tab is-active" : "tab"} type="button" onClick={() => setTab(t.id)}>
            {t.label} <span className="tab-count">{t.count}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_320px] gap-6 items-start max-2xl:grid-cols-[minmax(0,1fr)_300px] max-xl:grid-cols-[1fr]">
        <div className="flex flex-col gap-3">
          {tab === "next" && (
            <>
              {upcoming.length === 0 && (
                <EmptyState icon={Icon.calendar} title="Nada marcado ainda" text="Encontre uma atividade perto de você e confirme presença.">
                  <a className="btn btn--gradient" href={link("explorar")}>Explorar atividades</a>
                </EmptyState>
              )}
              {thisWeek.length > 0 && <h2 className="mt-2 mb-1 mx-0 text-[13px] font-bold text-secundario">Esta semana</h2>}
              {thisWeek.map((a) => (
                <Item key={a.id} activity={a} action={{ button: nextButton(a) }} />
              ))}
              {later.length > 0 && <h2 className="mt-2 mb-1 mx-0 text-[13px] font-bold text-secundario">Mais pra frente</h2>}
              {later.map((a) => (
                <Item key={a.id} activity={a} action={{ button: nextButton(a) }} />
              ))}
            </>
          )}

          {tab === "created" && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="mt-2 mb-1 mx-0 text-[13px] font-bold text-secundario">Publicadas</h2>
                <a className="btn btn--gradient btn--sm" href={link("criar")}>{Icon.plus} Nova atividade</a>
              </div>
              {publishedMine.length === 0 && <p className="hint">Você ainda não publicou nenhuma atividade.</p>}
              {publishedMine.map((a) => (
                <Item
                  key={a.id}
                  activity={a}
                  action={{
                    when: `${a.participants.length}/${a.spots} confirmados`,
                    button: (
                      <span className="flex gap-1.5">
                        <a className="btn btn--lilac btn--sm" href={link(`editar/${a.id}`)}>{Icon.edit} Editar</a>
                        <button
                          className="btn btn--ghost btn--sm"
                          type="button"
                          onClick={() => openModal("convidar", { title: "Chame a galera", url: `https://meleva.app/a/${a.id}`, lead: "Compartilhe o link da sua atividade." })}
                        >
                          {Icon.share}
                          <span className="sr-only">Compartilhar</span>
                        </button>
                      </span>
                    ),
                  }}
                />
              ))}
              <h2 className="mt-2 mb-1 mx-0 text-[13px] font-bold text-secundario">Rascunhos</h2>
              {drafts.length === 0 && <p className="hint">Nenhum rascunho. Use “Salvar rascunho” ao criar para continuar depois.</p>}
              {drafts.map((a) => (
                <Item
                  key={a.id}
                  activity={a}
                  action={{
                    tag: <span className="tag tag--lilac">Rascunho</span>,
                    when: "não publicado",
                    button: (
                      <span className="flex gap-1.5">
                        <a className="btn btn--lilac btn--sm" href={link(`editar/${a.id}`)}>Continuar</a>
                        <button
                          className="icon-btn icon-btn--sm"
                          type="button"
                          aria-label="Excluir rascunho"
                          onClick={() => {
                            run((s) => ({ state: { ...s, activities: s.activities.filter((x) => x.id !== a.id) } }));
                            toast("Rascunho excluído");
                          }}
                        >
                          {Icon.trash}
                        </button>
                      </span>
                    ),
                  }}
                />
              ))}
            </>
          )}

          {tab === "history" && (
            <>
              {history.length === 0 && <EmptyState icon={Icon.clock} title="Seu histórico aparece aqui" />}
              {history.map((a) => {
                const rating = state.ratings[a.id];
                const canceled = isCanceled(a);
                return (
                  <Item
                    key={a.id}
                    activity={a}
                    action={{
                      tag: canceled ? <span className="tag tag--danger">Cancelada</span> : <span className="tag tag--green">Concluída</span>,
                      when: inDays(a.start),
                      button: canceled ? null : rating ? (
                        <span className="flex items-center gap-1 text-[14px] font-bold [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-[#e3a008] [&_svg]:[fill:#e3a008]">{Icon.star} {rating.stars.toFixed(1)}</span>
                      ) : canRate(state, a) ? (
                        <a className="btn btn--gradient btn--sm" href={link(`avaliar/${a.id}`)}>{Icon.star} Avaliar</a>
                      ) : null,
                    }}
                  />
                );
              })}
            </>
          )}
        </div>

        <aside className="flex flex-col gap-3">
          <Calendar activities={upcoming} />
          <section className="card">
            <h2 className="text-[16px] font-bold">Seu mês</h2>
            <div className="grid grid-cols-[repeat(3,1fr)] gap-2 [&>div]:p-3 [&>div]:flex [&>div]:flex-col [&>div]:rounded-[12px] [&>div]:bg-pagina [&_strong]:text-[22px] [&_small]:text-[12px] [&_small]:text-secundario">
              <div><strong>{upcoming.length + history.length}</strong><small>atividades</small></div>
              <div><strong>{created.length}</strong><small>criadas</small></div>
              <div><strong>{ratedCount}</strong><small>avaliadas</small></div>
            </div>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
