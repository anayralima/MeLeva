import AppShell from "../components/AppShell.jsx";
import { AvatarStack, EmptyState, FavoriteButton, go, LevelTag, link, MapView, spotsSummary } from "../components/ui.jsx";
import { Icon } from "../icons.jsx";
import { useStore } from "../store.jsx";
import {
  canRate,
  canSeeAddress,
  cancelActivity,
  findActivity,
  isCanceled,
  isFull,
  isPast,
  join,
  leave,
  requestConnection,
  statusOf,
  toIcs,
  waitlistPosition,
} from "../services/rules.js";
import { hour, km, longDate, names, place, timeRange } from "../utils/format.js";

export function downloadIcs(activity) {
  const blob = new Blob([toIcs(activity, canSeeAddress(activity))], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${activity.id}.ics`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function forecast(activity) {
  const start = new Date(activity.start);
  return [-1, 0, 1, 2].map((offset) => {
    const d = new Date(start.getTime() + offset * 3600000);
    return { label: hour(d), temp: activity.weather.temp + (offset === -1 ? -3 : offset), now: offset === 0 };
  });
}

/** Telas 09 e 09b — Detalhes da atividade (RF17–RF20, RN03–RN08). */
export default function ActivityDetails({ param }) {
  const { state, run, toast, openModal, user } = useStore();
  const activity = findActivity(state, param);

  if (!activity || state.blocked.includes(activity.organizer)) {
    return (
      <AppShell active="explorar">
        <EmptyState title="Atividade não encontrada" text="Ela pode ter sido removida pelo organizador.">
          <a className="btn btn--gradient" href={link("explorar")}>Explorar atividades</a>
        </EmptyState>
      </AppShell>
    );
  }

  const status = statusOf(activity);
  const full = isFull(activity);
  const past = isPast(activity);
  const canceled = isCanceled(activity);
  const showAddress = canSeeAddress(activity);
  const organizer = user(activity.organizer);
  const others = activity.participants.filter((id) => id !== "me");
  const percent = Math.round((activity.participants.length / activity.spots) * 100);
  const following = state.following.includes(activity.organizer);

  function handleJoin() {
    const { result } = run(join, activity.id);
    if (result === "confirmed") go(`confirmada/${activity.id}`);
    else if (result === "waitlist") toast(`Você entrou na lista de espera • ${activity.waitlist.length + 1}º da fila`);
  }

  function handleLeave() {
    openModal("confirmar", {
      title: status === "waitlist" ? "Sair da lista de espera?" : "Cancelar sua participação?",
      text:
        status === "waitlist"
          ? "Você perde seu lugar na fila."
          : "Sua vaga vai para o próximo da lista de espera e você perde o acesso ao endereço exato e ao chat do grupo.",
      confirmLabel: status === "waitlist" ? "Sair da fila" : "Cancelar participação",
      onConfirm: () => {
        const output = run(leave, activity.id);
        toast(output.result === "left" ? "Participação cancelada. A vaga foi liberada." : "Você saiu da lista de espera");
      },
    });
  }

  function handleCancelActivity() {
    openModal("confirmar", {
      title: "Cancelar esta atividade?",
      text: `Todas as ${activity.participants.length - 1} pessoas confirmadas serão avisadas. Isso não pode ser desfeito.`,
      confirmLabel: "Cancelar atividade",
      onConfirm: () => {
        run(cancelActivity, activity.id);
        toast("Atividade cancelada. Avisamos o grupo.");
      },
    });
  }

  function share() {
    openModal("convidar", {
      title: "Chame a galera",
      lead: `Compartilhe ${activity.title}. Quem abrir o link vê a região, mas o endereço exato só aparece depois de confirmar.`,
      url: `https://meleva.app/a/${activity.id}`,
      text: `Bora? ${activity.title} • ${longDate(activity.start)}:`,
    });
  }

  return (
    <AppShell active="explorar">
      <section className="detail-hero" style={{ backgroundImage: `linear-gradient(180deg, rgba(36,16,91,.05) 30%, rgba(36,16,91,.78)), url(${activity.image})` }}>
        <button className="icon-btn icon-btn--white detail-hero__back" type="button" aria-label="Voltar" onClick={() => history.back()}>
          {Icon.arrowLeft}
        </button>
        <div className="detail-hero__tools">
          <button className="icon-btn icon-btn--white" type="button" aria-label="Compartilhar" onClick={share}>
            {Icon.share}
          </button>
          <FavoriteButton activity={activity} className="icon-btn icon-btn--white icon-btn--fav" />
        </div>
        <div className="detail-hero__text">
          <div className="row-card__tags">
            <span className="tag tag--dark">{activity.sport}</span>
            <LevelTag level={activity.level} />
            {activity.hot && <span className="tag tag--hot">{Icon.flame} Em alta</span>}
            {full && <span className="tag tag--danger">Lotada</span>}
            {canceled && <span className="tag tag--danger">Cancelada</span>}
          </div>
          <h1>{activity.title}</h1>
          <ul className="detail-hero__meta">
            <li>{Icon.calendar} {longDate(activity.start)}</li>
            <li>{Icon.clock} {timeRange(activity.start, activity.durationMin)}</li>
            <li>{Icon.mapPin} {place(activity)}</li>
          </ul>
        </div>
      </section>

      <div className="detail">
        <div className="detail__main">
          <div className="stat-boxes">
            <div className="stat-box"><span className="stat-box__icon stat-box__icon--rose">{Icon.compass}</span><span><small>Distância</small><strong>{activity.stats.distance}</strong></span></div>
            <div className="stat-box"><span className="stat-box__icon stat-box__icon--lilac">{Icon.clock}</span><span><small>Ritmo</small><strong>{activity.stats.pace}</strong></span></div>
            <div className="stat-box"><span className="stat-box__icon stat-box__icon--green">{Icon.trophy}</span><span><small>Nível</small><strong>{activity.level}</strong></span></div>
            <div className="stat-box"><span className="stat-box__icon stat-box__icon--blue">{Icon.users}</span><span><small>Vagas</small><strong>{activity.participants.length} de {activity.spots}</strong></span></div>
          </div>

          <section className="card">
            <h2>Sobre a atividade</h2>
            <p className="card__text">{activity.description}</p>
            <h3>O que levar</h3>
            <ul className="bring">
              {activity.bring.map((item) => (
                <li key={item}>{Icon.check} {item}</li>
              ))}
            </ul>
          </section>

          <section className="card meet">
            {showAddress ? (
              <div className="meet__map">
                <MapView activities={[activity]} selectedId={activity.id} onSelect={() => {}} compact />
              </div>
            ) : (
              <div className="meet__map meet__map--locked" aria-hidden="true">
                <MapView activities={[]} compact />
                <span className="meet__lock">{Icon.lock}</span>
              </div>
            )}
            <div>
              <h2>Ponto de encontro</h2>
              {showAddress ? (
                <>
                  <p className="meet__address">{activity.address}</p>
                  <a className="link" href={`https://www.google.com/maps/search/${encodeURIComponent(`${activity.address}, Teresópolis`)}`} target="_blank" rel="noreferrer">
                    Abrir no mapa {Icon.arrowRight}
                  </a>
                </>
              ) : (
                <>
                  <p className="meet__address">Região: {activity.region}, Teresópolis • {km(activity.distanceKm)} de você</p>
                  <p className="alert alert--lilac">
                    {Icon.lock}
                    <span>
                      {status === "waitlist"
                        ? "Você está na fila. O endereço exato aparece se uma vaga abrir pra você."
                        : "O endereço exato aparece quando você confirmar presença. Assim ninguém de fora sabe onde o grupo vai estar."}
                    </span>
                  </p>
                </>
              )}
            </div>
          </section>

          <section className="card">
            <h2 className="card__title-icon"><span>{Icon.shield}</span> Pratique com segurança</h2>
            <div className="safety">
              <div><span>{Icon.shield}</span><strong>{organizer.verified ? "Organizador(a) verificado(a)" : "E-mail e celular confirmados"}</strong><small>{organizer.verified ? "E-mail, celular e boa reputação" : "Confira as avaliações antes de ir"}</small></div>
              <div><span>{Icon.mapPin}</span><strong>Encontro em local público</strong><small>Ponto de encontro movimentado</small></div>
              <div><span>{Icon.users}</span><strong>Avise alguém de confiança</strong><small>Compartilhe sua localização de 1h antes até 1h depois</small></div>
            </div>
            <div className="safety__links">
              <button className="text-btn" type="button" onClick={() => openModal("reportar", { activityId: activity.id })}>
                {Icon.alert} Reportar esta atividade
              </button>
              {status === "confirmed" && (
                <button className="text-btn" type="button" onClick={() => openModal("denunciar", { activityId: activity.id })}>
                  {Icon.flag} Denunciar alguém deste grupo
                </button>
              )}
            </div>
          </section>
        </div>

        <aside className="detail__side">
          <section className="card join-card">
            <header className="join-card__head">
              <h2>{canceled ? "Atividade cancelada" : past ? "Atividade encerrada" : full ? "Lotada" : spotsSummary(activity)}</h2>
              <span className="free">Grátis</span>
            </header>
            <div className="bar" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Vagas preenchidas">
              <span style={{ width: `${percent}%` }} />
            </div>
            <div className="join-card__people">
              <AvatarStack ids={others} />
              <span>{others.length
                ? `${others.length > 3 ? `${others.slice(0, 3).map((id) => user(id).firstName).join(", ")} e +${others.length - 3}` : names(others.map((id) => user(id).firstName))} já ${others.length === 1 ? "vai" : "vão"}`
                : "Seja a primeira pessoa!"}</span>
            </div>

            {canceled ? (
              <p className="alert alert--danger">{Icon.alert} O organizador cancelou esta atividade.</p>
            ) : past ? (
              canRate(state, activity) ? (
                <a className="btn btn--gradient btn--block" href={link(`avaliar/${activity.id}`)}>{Icon.star} Avaliar atividade</a>
              ) : (
                <p className="alert alert--lilac">{Icon.check} {state.ratings[activity.id] ? "Você já avaliou esta atividade. Valeu!" : "Essa atividade já aconteceu."}</p>
              )
            ) : status === "none" ? (
              full ? (
                <>
                  <button className="btn btn--gradient btn--block" type="button" onClick={handleJoin}>{Icon.clock} Entrar na lista de espera</button>
                  <p className="alert alert--lilac">{Icon.info} {activity.waitlist.length ? `${activity.waitlist.length} na fila. ` : ""}Se alguém cancelar, a vaga vai pro próximo da fila e você é avisado.</p>
                </>
              ) : (
                <>
                  <button className="btn btn--gradient btn--block" type="button" onClick={handleJoin}>{Icon.check} Quero participar</button>
                  <p className="alert alert--lilac">{Icon.lock} O chat do grupo libera quando você confirmar presença.</p>
                </>
              )
            ) : status === "waitlist" ? (
              <>
                <p className="alert alert--lilac">{Icon.clock} <span>Você está em <strong>{waitlistPosition(activity)}º lugar na fila</strong>. Avisamos se uma vaga abrir.</span></p>
                <button className="btn btn--lilac btn--block" type="button" onClick={handleLeave}>Sair da lista de espera</button>
              </>
            ) : (
              <>
                <p className="alert alert--success">{Icon.check} {status === "organizer" ? "Você organiza esta atividade." : "Você está dentro!"}</p>
                <a className="btn btn--gradient btn--block" href={link(`mensagens/${activity.id}`)}>{Icon.chat} Abrir chat do grupo</a>
                {status === "organizer" ? (
                  <div className="join-card__row">
                    <a className="btn btn--lilac btn--sm" href={link(`editar/${activity.id}`)}>{Icon.edit} Editar</a>
                    <button className="btn btn--lilac btn--sm" type="button" onClick={share}>{Icon.share} Chamar a galera</button>
                    <button className="btn btn--ghost btn--sm" type="button" onClick={handleCancelActivity}>Cancelar atividade</button>
                  </div>
                ) : (
                  <div className="join-card__row">
                    <button className="btn btn--lilac btn--sm" type="button" onClick={() => { downloadIcs(activity); toast("Adicionado à sua agenda"); }}>{Icon.calendar} Agenda</button>
                    <button className="btn btn--ghost btn--sm" type="button" onClick={handleLeave}>Cancelar participação</button>
                  </div>
                )}
              </>
            )}
          </section>

          <section className="card">
            <header className="card__row">
              <h2 className="h3">Previsão pro horário</h2>
              <small className="muted">{hour(activity.start)}</small>
            </header>
            <div className="weather-now">
              <span className="weather-now__icon">{Icon[activity.weather.icon]}</span>
              <span>
                <strong>{activity.weather.temp}°C • {activity.weather.label}</strong>
                <small>Sensação de {activity.weather.temp - 1}°C • vento fraco</small>
              </span>
            </div>
            <div className="hours">
              {forecast(activity).map((h) => (
                <div key={h.label} className={h.now ? "is-now" : ""}>
                  <small>{h.label}</small>
                  {Icon[activity.weather.icon]}
                  <strong>{h.temp}°</strong>
                </div>
              ))}
            </div>
            <p className={activity.weather.rain >= 50 ? "rain rain--high" : "rain"}>
              {activity.weather.rain >= 50 ? Icon.rain : Icon.check}
              {activity.weather.rain}% de chuva {activity.weather.rain >= 50 ? "— combine com o grupo" : "— tudo certo"}
            </p>
          </section>

          <section className="card">
            <small className="muted">Organizado por</small>
            <div className="organizer">
              <a href={activity.organizer === "me" ? link("perfil") : link(`pessoa/${organizer.id}`)}>
                <img src={organizer.avatar} alt="" />
              </a>
              <span>
                <a href={activity.organizer === "me" ? link("perfil") : link(`pessoa/${organizer.id}`)}>
                  <strong>{activity.organizer === "me" ? "Você" : organizer.name}</strong> {organizer.verified && <span className="verified" aria-label="verificado">{Icon.check}</span>}
                </a>
                <small>{Icon.star} {organizer.rating?.toFixed(1)} • {organizer.created ?? 1} atividades criadas</small>
              </span>
              {activity.organizer !== "me" && (
                <button
                  className={following ? "btn btn--lilac btn--sm" : "btn btn--ghost btn--sm"}
                  type="button"
                  onClick={() => {
                    run((s) => ({ state: { ...s, following: following ? s.following.filter((f) => f !== organizer.id) : [...s.following, organizer.id] } }));
                    toast(following ? `Você deixou de seguir ${organizer.firstName}` : `Agora você segue ${organizer.firstName}`);
                  }}
                >
                  {following ? "Seguindo" : "Seguir"}
                </button>
              )}
            </div>
          </section>

          <section className="card">
            <h2 className="h3">Quem vai ({activity.participants.length})</h2>
            {showAddress ? (
              <ul className="who">
                {activity.participants.map((id) => {
                  const person = user(id);
                  return (
                    <li key={id}>
                      <img src={person.avatar} alt="" />
                      <span>
                        <strong>{id === "me" ? "Você" : person.name}</strong>
                        <small>{id === activity.organizer ? "Organização" : person.level}</small>
                      </span>
                      {id !== "me" && !/^a\d+$/.test(id) && (
                        state.connections.includes(id) ? (
                          <a className="link" href={link(`pessoa/${id}`)}>Ver perfil</a>
                        ) : (
                          <button className="link" type="button" onClick={() => { run(requestConnection, id); toast("Pedido de conexão enviado"); }}>
                            {state.pendingConnections.includes(id) ? "Enviado" : "Conectar"}
                          </button>
                        )
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="alert alert--lilac">{Icon.lock} A lista completa de quem vai aparece só para quem confirmou presença.</p>
            )}
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
