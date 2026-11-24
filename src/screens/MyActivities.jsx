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
    <span className="datebox">
      <strong>{d.getDate()}</strong>
      <small>{monthShort(d).toUpperCase()}</small>
    </span>
  );
}

function Item({ activity, action }) {
  return (
    <article className="my-item">
      <DateBox iso={activity.start} />
      <img className="my-item__img" src={activity.image} alt="" />
      <div className="my-item__body">
        <div className="row-card__tags">
          {action.tag ?? <StatusTag activity={activity} />}
          <small className="muted">{action.when ?? inDays(activity.start)}</small>
        </div>
        <h3>
          <a href={link(`atividade/${activity.id}`)}>{activity.title}</a>
        </h3>
        <ul className="row-card__meta">
          <li>{Icon.clock} {timeRange(activity.start, activity.durationMin)}</li>
          <li>{Icon.mapPin} {activity.region}</li>
        </ul>
      </div>
      <div className="my-item__side">
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
      <header className="card__row">
        <h2 className="h3">
          {monthLong(month).replace(/^./, (c) => c.toUpperCase())} {month.getFullYear()}
        </h2>
        <span className="calendar__nav">
          <button className="icon-btn icon-btn--sm" type="button" aria-label="Mês anterior" onClick={() => setOffset(offset - 1)}>{Icon.arrowLeft}</button>
          <button className="icon-btn icon-btn--sm" type="button" aria-label="Próximo mês" onClick={() => setOffset(offset + 1)}>{Icon.arrowRight}</button>
        </span>
      </header>
      <div className="calendar__grid" role="grid">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
          <span key={i} className="calendar__dow">{d}</span>
        ))}
        {Array.from({ length: month.getDay() }).map((_, i) => (
          <span key={`e${i}`} />
        ))}
        {Array.from({ length: days }).map((_, i) => {
          const day = i + 1;
          const today = isThisMonth && day === now.getDate();
          return (
            <span key={day} className={[today ? "is-today" : "", marked.has(day) ? "is-marked" : ""].join(" ")}>
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
      <div className="tabs" role="tablist">
        {tabs.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} className={tab === t.id ? "tab is-active" : "tab"} type="button" onClick={() => setTab(t.id)}>
            {t.label} <span className="tab__count">{t.count}</span>
          </button>
        ))}
      </div>

      <div className="my">
        <div className="my__list">
          {tab === "next" && (
            <>
              {upcoming.length === 0 && (
                <EmptyState icon={Icon.calendar} title="Nada marcado ainda" text="Encontre uma atividade perto de você e confirme presença.">
                  <a className="btn btn--gradient" href={link("explorar")}>Explorar atividades</a>
                </EmptyState>
              )}
              {thisWeek.length > 0 && <h2 className="group-title">Esta semana</h2>}
              {thisWeek.map((a) => (
                <Item key={a.id} activity={a} action={{ button: nextButton(a) }} />
              ))}
              {later.length > 0 && <h2 className="group-title">Mais pra frente</h2>}
              {later.map((a) => (
                <Item key={a.id} activity={a} action={{ button: nextButton(a) }} />
              ))}
            </>
          )}

          {tab === "created" && (
            <>
              <div className="created-head">
                <h2 className="group-title">Publicadas</h2>
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
                      <span className="my-item__btns">
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
              <h2 className="group-title">Rascunhos</h2>
              {drafts.length === 0 && <p className="hint">Nenhum rascunho. Use “Salvar rascunho” ao criar para continuar depois.</p>}
              {drafts.map((a) => (
                <Item
                  key={a.id}
                  activity={a}
                  action={{
                    tag: <span className="tag tag--lilac">Rascunho</span>,
                    when: "não publicado",
                    button: (
                      <span className="my-item__btns">
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
                        <span className="stars-inline">{Icon.star} {rating.stars.toFixed(1)}</span>
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

        <aside className="my__side">
          <Calendar activities={upcoming} />
          <section className="card">
            <h2 className="h3">Seu mês</h2>
            <div className="month-stats">
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
