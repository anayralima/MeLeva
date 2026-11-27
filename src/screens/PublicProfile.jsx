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
      <section className="card p-0 gap-0 overflow-hidden">
        <div className="h-35 [background-position:center] [background-size:cover]" style={{ backgroundImage: `url(${sportImage(person.sports[0])})` }} />
        <div className="pt-0 pb-5.5 px-6 flex items-end gap-5 max-md:flex-col max-md:items-start max-md:gap-1.5">
          <img className="border-5 border-white shrink-0 size-30 -mt-15 rounded-full object-cover" src={person.avatar} alt={`Foto de ${person.name}`} />
          <div className="profile-head-info flex flex-1 flex-col gap-1.5 min-w-0 pt-3.5 text-[14px] max-md:pt-0 [&_h1]:flex [&_h1]:flex-wrap [&_h1]:items-center [&_h1]:gap-2 [&_h1]:text-[26px] [&_h1]:font-extrabold max-md:[&_h1]:text-[22px]">
            <h1>
              {person.name} {person.verified && <span className="p-0.75 border-[1.5px] border-azul-texto inline-grid place-items-center size-4.5 rounded-full text-azul-texto align-middle" aria-label="verificado">{Icon.check}</span>} <LevelTag level={person.level} />
            </h1>
            <p className="text-secundario [&_svg]:size-4 [&_svg]:shrink-0 [.profile-head-info_&]:flex [.profile-head-info_&]:flex-wrap [.profile-head-info_&]:items-center [.profile-head-info_&]:gap-1 [.profile-head-info_&]:text-[13px]">
              {Icon.pin} {person.city} • {person.age} anos • No Me Leva desde {person.since}
            </p>
            <p>{person.bio}</p>
          </div>
          <div className="profile-head-actions flex flex-wrap gap-2.5">
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

      <div className="my-4 mx-0 grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3.5 max-md:grid-cols-[1fr_1fr] [.detail-main_&]:m-0">
        <div className="stat-box"><span className="stat-box-icon stat-box-icon--rose">{Icon.calendar}</span><span><strong>{person.created ?? 0}</strong><small>atividades criadas</small></span></div>
        <div className="stat-box"><span className="stat-box-icon stat-box-icon--lilac">{Icon.compass}</span><span><strong>{person.km} km</strong><small>percorridos</small></span></div>
        <div className="stat-box"><span className="stat-box-icon stat-box-icon--blue">{Icon.users}</span><span><strong>{together}</strong><small>treinos com você</small></span></div>
        <div className="stat-box"><span className="stat-box-icon stat-box-icon--green">{Icon.star}</span><span><strong>{person.rating?.toFixed(1)}</strong><small>avaliação média</small></span></div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_320px] gap-5 items-start max-2xl:grid-cols-[minmax(0,1fr)_300px] max-xl:grid-cols-[1fr]">
        <div className="flex flex-col gap-4">
          <section className="card">
            <h2>Próximas atividades de {person.firstName}</h2>
            {upcoming.length === 0 && <p className="hint">Nenhuma atividade marcada.</p>}
            <ul className="flex flex-col gap-3 list-none [&_li]:flex [&_li]:items-center [&_li]:gap-3 [&_img]:w-14 [&_img]:h-12 [&_img]:rounded-[10px] [&_img]:object-cover [&_li>span:nth-child(2)]:flex [&_li>span:nth-child(2)]:flex-1 [&_li>span:nth-child(2)]:flex-col [&_li>span:nth-child(2)]:min-w-0 [&_li>span:nth-child(2)]:text-[14px] [&_small]:text-[12px] [&_small]:text-secundario">
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
            <div className="flex gap-2 flex-wrap">
              {person.sports.map((s) => (
                <span key={s} className="tag tag--lilac">{s}</span>
              ))}
            </div>
          </section>
        </div>
        <aside className="flex flex-col gap-4">
          <section className="card">
            <h2>Confiança</h2>
            <ul className="flex flex-col gap-2.5 list-none text-[14px] [&_svg]:p-0.5 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:rounded-full [&_svg]:bg-verde [&_svg]:text-verde-texto [&_li]:flex [&_li]:items-start [&_li]:gap-2">
              <li>{Icon.check} E-mail e celular confirmados</li>
              {person.verified && <li>{Icon.check} Boa reputação nas atividades</li>}
              <li>{Icon.check} {Math.round((person.rating ?? 4.5) * 20)}% de presença confirmada</li>
            </ul>
            <div className="safety-links safety-links--col flex flex-wrap gap-y-2.5 gap-x-6 flex-col [&_svg]:size-4 [&_svg]:shrink-0">
              <button className="p-0 border-0 inline-flex items-center gap-1.5 bg-transparent text-[13px] font-semibold underline [text-underline-offset:2px] cursor-pointer text-erro [&_svg]:size-4 [&_svg]:shrink-0 [.safety-links_&]:text-secundario [.safety-links_&]:no-underline [.safety-links--col_&]:text-erro" type="button" onClick={() => openModal("denunciar", { personId: person.id, afterBlock: () => go("home") })}>
                {Icon.flag} Denunciar {person.firstName}
              </button>
              <button className="p-0 border-0 inline-flex items-center gap-1.5 bg-transparent text-[13px] font-semibold text-rosa-texto underline [text-underline-offset:2px] cursor-pointer [&_svg]:size-4 [&_svg]:shrink-0 [.safety-links_&]:text-secundario [.safety-links_&]:no-underline" type="button" onClick={block}>
                {Icon.ban} Bloquear
              </button>
            </div>
          </section>
          <section className="card">
            <h2>Conexões em comum</h2>
            <div className="flex [&_img]:border-2 [&_img]:border-white [&_img]:rounded-full [&_img]:object-cover [&_img]:size-6 [&_img+img]:-ml-2.5">
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
