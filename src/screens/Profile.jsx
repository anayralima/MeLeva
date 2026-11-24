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
      <section className="profile-head card">
        <div className="profile-head__cover" style={{ backgroundImage: "url(/assets/landing/atividade-trilha.webp)" }} />
        <div className="profile-head__row">
          <img className="profile-head__avatar" src={me.avatar} alt={`Foto de ${me.name}`} />
          <div className="profile-head__info">
            <h1>
              {me.name} {me.verified && <span className="verified" aria-label="verificada">{Icon.check}</span>} <LevelTag level={me.level} />
            </h1>
            <p className="muted">
              {Icon.pin} {me.city}
              {me.showAge !== false && ` • ${me.age} anos`} • {Icon.calendar} No Me Leva desde {me.since}
            </p>
            <p>{me.bio}</p>
          </div>
          <div className="profile-head__actions">
            <button className="btn btn--lilac" type="button" onClick={() => openModal("convidar", { title: "Compartilhar perfil", url: "https://meleva.app/u/mariana", lead: "Mande seu perfil para quem quer treinar com você." })}>
              {Icon.share} Compartilhar
            </button>
            <a className="btn btn--gradient" href={link("perfil/editar")}>
              {Icon.edit} Editar perfil
            </a>
          </div>
        </div>
      </section>

      <div className="stat-boxes">
        <div className="stat-box"><span className="stat-box__icon stat-box__icon--rose">{Icon.calendar}</span><span><strong>{mineAll.length}</strong><small>atividades</small></span></div>
        <div className="stat-box"><span className="stat-box__icon stat-box__icon--lilac">{Icon.compass}</span><span><strong>{me.km} km</strong><small>percorridos</small></span></div>
        <a className="stat-box" href={link("conexoes")}><span className="stat-box__icon stat-box__icon--blue">{Icon.users}</span><span><strong>{state.connections.length}</strong><small>conexões</small></span></a>
        <div className="stat-box"><span className="stat-box__icon stat-box__icon--green">{Icon.star}</span><span><strong>{me.rating.toFixed(1)}</strong><small>avaliação média</small></span></div>
      </div>

      <div className="profile-grid">
        <div className="profile-grid__main">
          <section className="card">
            <h2>Meus esportes</h2>
            <div className="my-sports">
              {me.sports.map((sport) => (
                <div key={sport} className="my-sport">
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
            <header className="card__row">
              <h2>Atividades recentes</h2>
              <a className="link" href={link("minhas?aba=historico")}>Ver histórico</a>
            </header>
            <ul className="recent">
              {done.map((a) => (
                <li key={a.id}>
                  <img src={a.image} alt="" />
                  <span>
                    <a href={link(`atividade/${a.id}`)}><strong>{a.title}</strong></a>
                    <small>{shortDate(a.start)}</small>
                  </span>
                  <span className="tag tag--green">Concluída</span>
                  {state.ratings[a.id] ? (
                    <span className="stars-inline">{Icon.star} {state.ratings[a.id].stars.toFixed(1)}</span>
                  ) : (
                    <a className="link" href={link(`avaliar/${a.id}`)}>Avaliar</a>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="profile-grid__side">
          <section className="card">
            <h2>Conquistas</h2>
            <div className="badges">
              <div><span className="badges__icon badges__icon--rose">{Icon.flame}</span>Madrugadora</div>
              <div><span className="badges__icon badges__icon--lilac">{Icon.trophy}</span>Primeiros 50 km</div>
              <div><span className="badges__icon badges__icon--blue">{Icon.users}</span>Agregadora</div>
            </div>
          </section>
          <section className="card">
            <h2>O que dizem</h2>
            <blockquote className="quote">
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
