import AppShell from "../components/AppShell.jsx";
import { LevelTag, link } from "../components/ui.jsx";
import { Icon } from "../icons.jsx";
import { useStore } from "../store.jsx";
import { isPast, statusOf } from "../services/rules.js";
import { shortDate } from "../utils/format.js";

const SPORT_IMG = {
  Corrida: "/assets/landing/esporte-corrida.webp",
  Trilha: "/assets/landing/esporte-trilha.webp",
  Ciclismo: "/assets/landing/esporte-ciclismo.webp",
  Futebol: "/assets/landing/esporte-futebol.webp",
  Yoga: "/assets/landing/esporte-yoga.webp",
  Vôlei: "/assets/landing/esporte-volei.webp",
  "Beach tênis": "/assets/landing/esporte-beach-tenis.webp",
  Natação: "/assets/landing/esporte-natacao.webp",
};

export function sportImage(sport) {
  return SPORT_IMG[sport] ?? "/assets/app/atividade-funcional.webp";
}

/** Tela 13 — Perfil próprio (RF08). */
export default function Profile() {
  const { state, me, openModal } = useStore();
  const done = state.activities.filter((a) => isPast(a) && a.participants.includes("me"));
  const mineAll = state.activities.filter((a) => ["confirmed", "organizer"].includes(statusOf(a)) || (isPast(a) && a.participants.includes("me")));

  return (
    <AppShell active="perfil">
      <section className="card p-0 gap-0 overflow-hidden">
        <div className="h-35 [background-position:center] [background-size:cover]" style={{ backgroundImage: "url(/assets/landing/atividade-trilha.webp)" }} />
        <div className="pt-0 pb-5.5 px-6 flex items-end gap-5 max-md:flex-col max-md:items-start max-md:gap-1.5">
          <img className="border-5 border-white shrink-0 size-30 -mt-15 rounded-full object-cover" src={me.avatar} alt={`Foto de ${me.name}`} />
          <div className="profile-head-info flex flex-1 flex-col gap-1.5 min-w-0 pt-3.5 text-[14px] max-md:pt-0 [&_h1]:flex [&_h1]:flex-wrap [&_h1]:items-center [&_h1]:gap-2 [&_h1]:text-[26px] [&_h1]:font-extrabold max-md:[&_h1]:text-[22px]">
            <h1>
              {me.name} {me.verified && <span className="p-0.75 border-[1.5px] border-azul-texto inline-grid place-items-center size-4.5 rounded-full text-azul-texto align-middle" aria-label="verificada">{Icon.check}</span>} <LevelTag level={me.level} />
            </h1>
            <p className="text-secundario [&_svg]:size-4 [&_svg]:shrink-0 [.profile-head-info_&]:flex [.profile-head-info_&]:flex-wrap [.profile-head-info_&]:items-center [.profile-head-info_&]:gap-1 [.profile-head-info_&]:text-[13px]">
              {Icon.pin} {me.city}
              {me.showAge !== false && ` • ${me.age} anos`} • {Icon.calendar} No Me Leva desde {me.since}
            </p>
            <p>{me.bio}</p>
          </div>
          <div className="profile-head-actions flex flex-wrap gap-2.5">
            <button className="btn btn--lilac" type="button" onClick={() => openModal("convidar", { title: "Compartilhar perfil", url: "https://meleva.app/u/mariana", lead: "Mande seu perfil para quem quer treinar com você." })}>
              {Icon.share} Compartilhar
            </button>
            <a className="btn btn--gradient" href={link("perfil/editar")}>
              {Icon.edit} Editar perfil
            </a>
          </div>
        </div>
      </section>

      <div className="my-4 mx-0 grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3.5 max-md:grid-cols-[1fr_1fr] [.detail-main_&]:m-0">
        <div className="stat-box"><span className="stat-box-icon stat-box-icon--rose">{Icon.calendar}</span><span><strong>{mineAll.length}</strong><small>atividades</small></span></div>
        <div className="stat-box"><span className="stat-box-icon stat-box-icon--lilac">{Icon.compass}</span><span><strong>{me.km} km</strong><small>percorridos</small></span></div>
        <a className="stat-box" href={link("conexoes")}><span className="stat-box-icon stat-box-icon--blue">{Icon.users}</span><span><strong>{state.connections.length}</strong><small>conexões</small></span></a>
        <div className="stat-box"><span className="stat-box-icon stat-box-icon--green">{Icon.star}</span><span><strong>{me.rating.toFixed(1)}</strong><small>avaliação média</small></span></div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_320px] gap-5 items-start max-2xl:grid-cols-[minmax(0,1fr)_300px] max-xl:grid-cols-[1fr]">
        <div className="flex flex-col gap-4">
          <section className="card">
            <h2>Meus esportes</h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2.5">
              {me.sports.map((sport) => (
                <div key={sport} className="p-2.5 flex items-center gap-2.5 rounded-[14px] bg-pagina [&_img]:size-11 [&_img]:rounded-[10px] [&_img]:object-cover [&_span]:flex [&_span]:flex-col [&_span]:text-[14px] [&_small]:text-[12px] [&_small]:text-secundario">
                  <img src={sportImage(sport)} alt="" />
                  <span>
                    <strong>{sport}</strong>
                    <small>{state.activities.filter((a) => a.sport === sport && a.participants.includes("me")).length} atividades</small>
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <header className="card-row">
              <h2>Atividades recentes</h2>
              <a className="link" href={link("minhas?aba=historico")}>Ver histórico</a>
            </header>
            <ul className="flex flex-col gap-3 list-none [&_li]:flex [&_li]:items-center [&_li]:gap-3 [&_img]:w-14 [&_img]:h-12 [&_img]:rounded-[10px] [&_img]:object-cover [&_li>span:nth-child(2)]:flex [&_li>span:nth-child(2)]:flex-1 [&_li>span:nth-child(2)]:flex-col [&_li>span:nth-child(2)]:min-w-0 [&_li>span:nth-child(2)]:text-[14px] [&_small]:text-[12px] [&_small]:text-secundario">
              {done.map((a) => (
                <li key={a.id}>
                  <img src={a.image} alt="" />
                  <span>
                    <a href={link(`atividade/${a.id}`)}><strong>{a.title}</strong></a>
                    <small>{shortDate(a.start)}</small>
                  </span>
                  <span className="tag tag--green">Concluída</span>
                  {state.ratings[a.id] ? (
                    <span className="flex items-center gap-1 text-[14px] font-bold [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-[#e3a008] [&_svg]:[fill:#e3a008]">{Icon.star} {state.ratings[a.id].stars.toFixed(1)}</span>
                  ) : (
                    <a className="link" href={link(`avaliar/${a.id}`)}>Avaliar</a>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="flex flex-col gap-4">
          <section className="card">
            <h2>Conquistas</h2>
            <div className="grid grid-cols-[repeat(3,1fr)] gap-2 [&>div]:py-3 [&>div]:px-1.5 [&>div]:flex [&>div]:flex-col [&>div]:items-center [&>div]:gap-2 [&>div]:rounded-[14px] [&>div]:bg-pagina [&>div]:text-[12px] [&>div]:font-semibold [&>div]:text-center">
              <div><span className="badges-icon badges-icon--rose">{Icon.flame}</span>Madrugadora</div>
              <div><span className="badges-icon badges-icon--lilac">{Icon.trophy}</span>Primeiros 50 km</div>
              <div><span className="badges-icon badges-icon--blue">{Icon.users}</span>Agregadora</div>
            </div>
          </section>
          <section className="card">
            <h2>O que dizem</h2>
            <blockquote className="p-3.5 flex flex-col gap-2.5 rounded-[14px] bg-pagina text-[14px] leading-[1.5] [&_footer]:flex [&_footer]:items-center [&_footer]:gap-2 [&_footer]:text-[12px] [&_footer]:text-secundario [&_img]:size-6 [&_img]:rounded-full">
              “Super pontual e animada, puxou o ritmo da galera toda. Quero correr junto de novo!”
              <footer>
                <img src="/assets/landing/avatar-9.webp" alt="" /> Lucas • Corrida no Lago
              </footer>
            </blockquote>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
