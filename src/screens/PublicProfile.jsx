import AppShell from "../components/AppShell.jsx";
import { EmptyState, go, LevelTag, link } from "../components/ui.jsx";
import { Icon } from "../icons.jsx";
import { useStore } from "../store.jsx";
import { acceptConnection, blockPerson, canDirectMessage, isPast, requestConnection, visibleActivities } from "../services/rules.js";
import { friendlyWhen, place } from "../utils/format.js";
import { sportImage } from "./Profile.jsx";

/** Tela 19 — Perfil público (RF09, RF10, RF31, RF32). */
export default function PublicProfile({ param }) {
  const { state, run, toast, openModal, user } = useStore();
  const person = state.users[param];

  if (!person || param === "me" || state.blocked.includes(param)) {
    if (param === "me") go("perfil");
    return (
      <AppShell active="perfil">
        <EmptyState icon={Icon.user} title="Perfil indisponível" text="Essa pessoa não está disponível ou foi bloqueada por você." />
      </AppShell>
    );
  }

  const connected = state.connections.includes(person.id);
  const pending = state.pendingConnections.includes(person.id);
  const incoming = state.notifications.some((n) => n.request === person.id);
  const following = state.following.includes(person.id);
  const upcoming = visibleActivities(state).filter((a) => !isPast(a) && (a.organizer === person.id || a.participants.includes(person.id))).slice(0, 3);
  const together = state.activities.filter((a) => a.participants.includes("me") && a.participants.includes(person.id)).length;

  function block() {
    openModal("confirmar", {
      title: `Bloquear ${person.firstName}?`,
      text: "Essa pessoa deixa de ver seu perfil e suas atividades, e você não verá as dela. Ela não é avisada.",
      confirmLabel: "Bloquear",
      onConfirm: () => {
        run(blockPerson, person.id);
        toast(`${person.firstName} foi bloqueado(a)`);
        go("home");
      },
    });
  }

  return (
    <AppShell active="perfil">
      <section className="profile-head card">
        <div className="profile-head__cover" style={{ backgroundImage: `url(${sportImage(person.sports[0])})` }} />
        <div className="profile-head__row">
          <img className="profile-head__avatar" src={person.avatar} alt={`Foto de ${person.name}`} />
          <div className="profile-head__info">
            <h1>
              {person.name} {person.verified && <span className="verified" aria-label="verificado">{Icon.check}</span>} <LevelTag level={person.level} />
            </h1>
            <p className="muted">
              {Icon.pin} {person.city} • {person.age} anos • No Me Leva desde {person.since}
            </p>
            <p>{person.bio}</p>
          </div>
          <div className="profile-head__actions">
            {connected ? (
              <span className="tag tag--green">{Icon.check} Conectados</span>
            ) : incoming ? (
              <button className="btn btn--gradient" type="button" onClick={() => { run(acceptConnection, person.id); toast("Conexão aceita"); }}>
                {Icon.userPlus} Aceitar conexão
              </button>
            ) : (
              <button className="btn btn--gradient" type="button" disabled={pending} onClick={() => { run(requestConnection, person.id); toast("Pedido de conexão enviado"); }}>
                {Icon.userPlus} {pending ? "Pedido enviado" : "Conectar"}
              </button>
            )}
            <button
              className="btn btn--lilac"
              type="button"
              onClick={() => {
                run((s) => ({ state: { ...s, following: following ? s.following.filter((f) => f !== person.id) : [...s.following, person.id] } }));
                toast(following ? `Você deixou de seguir ${person.firstName}` : `Agora você segue ${person.firstName}`);
              }}
            >
              {following ? "Seguindo" : "Seguir"}
            </button>
            {canDirectMessage(state, person.id) ? (
              <a className="btn btn--lilac" href={link(`mensagens/dm:${person.id}`)}>{Icon.chat} Mensagem</a>
            ) : (
              <button className="btn btn--lilac" type="button" onClick={() => toast("Mensagens diretas só entre pessoas conectadas", "info")}>
                {Icon.lock} Mensagem
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="stat-boxes">
        <div className="stat-box"><span className="stat-box__icon stat-box__icon--rose">{Icon.calendar}</span><span><strong>{person.created ?? 0}</strong><small>atividades criadas</small></span></div>
        <div className="stat-box"><span className="stat-box__icon stat-box__icon--lilac">{Icon.compass}</span><span><strong>{person.km} km</strong><small>percorridos</small></span></div>
        <div className="stat-box"><span className="stat-box__icon stat-box__icon--blue">{Icon.users}</span><span><strong>{together}</strong><small>treinos com você</small></span></div>
        <div className="stat-box"><span className="stat-box__icon stat-box__icon--green">{Icon.star}</span><span><strong>{person.rating?.toFixed(1)}</strong><small>avaliação média</small></span></div>
      </div>

      <div className="profile-grid">
        <div className="profile-grid__main">
          <section className="card">
            <h2>Próximas atividades de {person.firstName}</h2>
            {upcoming.length === 0 && <p className="hint">Nenhuma atividade marcada.</p>}
            <ul className="recent">
              {upcoming.map((a) => (
                <li key={a.id}>
                  <img src={a.image} alt="" />
                  <span>
                    <a href={link(`atividade/${a.id}`)}><strong>{a.title}</strong></a>
                    <small>{friendlyWhen(a.start)} • {place(a)}</small>
                  </span>
                  {a.organizer === person.id && <span className="tag tag--pink">Organiza</span>}
                  <a className="link" href={link(`atividade/${a.id}`)}>Ver</a>
                </li>
              ))}
            </ul>
          </section>
          <section className="card">
            <h2>Esportes</h2>
            <div className="chips chips--wrap">
              {person.sports.map((s) => (
                <span key={s} className="tag tag--lilac">{s}</span>
              ))}
            </div>
          </section>
        </div>
        <aside className="profile-grid__side">
          <section className="card">
            <h2>Confiança</h2>
            <ul className="ticks">
              <li>{Icon.check} E-mail e celular confirmados</li>
              {person.verified && <li>{Icon.check} Boa reputação nas atividades</li>}
              <li>{Icon.check} {Math.round((person.rating ?? 4.5) * 20)}% de presença confirmada</li>
            </ul>
            <div className="safety__links safety__links--col">
              <button className="text-btn text-btn--danger" type="button" onClick={() => openModal("denunciar", { personId: person.id, afterBlock: () => go("home") })}>
                {Icon.flag} Denunciar {person.firstName}
              </button>
              <button className="text-btn" type="button" onClick={block}>
                {Icon.ban} Bloquear
              </button>
            </div>
          </section>
          <section className="card">
            <h2>Conexões em comum</h2>
            <div className="people__avatars people__avatars--sm">
              {state.connections.filter((c) => c !== person.id).map((c) => (
                <img key={c} src={user(c).avatar} alt={user(c).name} />
              ))}
            </div>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
