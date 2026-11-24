import { Icon } from "../icons.jsx";
import { useStore } from "../store.jsx";
import { isPast, visibleActivities } from "../services/rules.js";
import { place, shortDate, weatherText } from "../utils/format.js";

const LEVEL_TONE = { Iniciante: "green", Intermediário: "blue", Avançado: "pink", "Todos os níveis": "lilac" };

/** Atividades em destaque para visitantes: sem endereço exato (RN03). */
function featured(state) {
  return visibleActivities(state)
    .filter((a) => !isPast(a) && a.participants.length < a.spots)
    .sort((a, b) => Number(b.hot) - Number(a.hot) || new Date(a.start) - new Date(b.start))
    .slice(0, 3)
    .map((a) => ({
      sport: a.sport,
      title: a.title,
      image: a.image,
      date: shortDate(a.start),
      place: place(a),
      weather: weatherText(a),
      spots: `${a.participants.length}/${a.spots} vagas`,
      level: a.level,
      tone: LEVEL_TONE[a.level] ?? "lilac",
      hot: a.hot,
      people: a.participants.slice(0, 3).map((id) => state.users[id]?.avatar ?? "/assets/landing/avatar-1.webp"),
    }));
}

const sports = [
  { name: "Corrida", count: 42, image: "/assets/landing/esporte-corrida.webp" },
  { name: "Trilha", count: 18, image: "/assets/landing/esporte-trilha.webp" },
  { name: "Ciclismo", count: 23, image: "/assets/landing/esporte-ciclismo.webp" },
  { name: "Futebol", count: 31, image: "/assets/landing/esporte-futebol.webp" },
  { name: "Yoga", count: 12, image: "/assets/landing/esporte-yoga.webp" },
  { name: "Vôlei", count: 9, image: "/assets/landing/esporte-volei.webp" },
  { name: "Beach tênis", count: 15, image: "/assets/landing/esporte-beach-tenis.webp" },
  { name: "Natação", count: 7, image: "/assets/landing/esporte-natacao.webp" },
];

const steps = [
  {
    number: "01",
    icon: Icon.user,
    title: "Escolha seus esportes",
    text: "Conte o que você gosta de praticar, seu nível e quando costuma ter tempo livre.",
  },
  {
    number: "02",
    icon: Icon.search,
    title: "Encontre uma atividade",
    text: "Veja o que está rolando perto de você e filtre por esporte, dia, horário e nível.",
  },
  {
    number: "03",
    icon: Icon.users,
    title: "Participe e conheça gente",
    text: "Garanta sua vaga, combine no chat e vá praticar com quem tem o mesmo ritmo.",
  },
];

export default function Landing() {
  const { state, openModal } = useStore();
  const loggedIn = Boolean(state.session);
  const activities = featured(state);
  return (
    <div className="page">
      <header className="nav">
        <a className="logo" href="#/">
          Me <span>Leva</span>
        </a>
        <nav className="nav__links">
          <a href="#como-funciona">Como funciona</a>
          <a href="#atividades">Atividades</a>
          <a href="#esportes">Esportes</a>
          <a href="#sobre">Sobre</a>
        </nav>
        <div className="nav__actions">
          {loggedIn ? (
            <a className="btn btn--gradient" href="#/home">
              Ir para o app
              {Icon.arrowRight}
            </a>
          ) : (
            <>
              <a className="btn btn--ghost" href="#/login">
                Entrar
              </a>
              <a className="btn btn--gradient" href="#/cadastro">
                Criar conta
              </a>
            </>
          )}
        </div>
      </header>

      <section className="hero">
        <div className="hero__text">
          <span className="badge">
            <span className="badge__icon">{Icon.pin}</span>
            Agora em Teresópolis, RJ
          </span>

          <h1>
            Encontre gente pra
            <br />
            praticar o esporte que
            <br />
            <span className="text-rose">você ama.</span>
          </h1>

          <p className="hero__lead">
            O Me Leva conecta você a pessoas e atividades esportivas perto de casa — no lugar,
            no horário e no nível que fazem sentido pra você.
          </p>

          <div className="hero__actions">
            <a
              className="btn btn--gradient btn--lg"
              href="#/cadastro"
            >
              Começar agora
              {Icon.arrowRight}
            </a>
            <a
              className="btn btn--ghost btn--lg"
              href="#/login"
            >
              Já tenho conta
            </a>
          </div>

          <div className="people">
            <div className="people__avatars">
              {[1, 2, 3, 4].map((n) => (
                <img key={n} src={`/assets/landing/avatar-${n}.webp`} alt="" />
              ))}
            </div>
            <p>
              <strong>+1.200 pessoas</strong>
              <span>já se movimentando juntas</span>
            </p>
          </div>
        </div>

        <div className="collage">
          <img className="collage__main" src="/assets/landing/hero-main.webp" alt="Grupo de amigos correndo juntos num parque" />
          <img className="collage__small" src="/assets/landing/hero-small.webp" alt="Pessoas fazendo trilha na serra" />

          <div className="notice">
            <img src="/assets/landing/avatar-5.webp" alt="" />
            <p>
              <strong>Camila entrou na sua trilha!</strong>
              <span>Trilha Pedra do Sino • Dom 06h</span>
            </p>
          </div>

          <div className="mini-card">
            <div className="mini-card__head">
              <span className="mini-card__tag">
                <span className="badge__icon">{Icon.spark}</span>
                Corrida no Parque
              </span>
              <div className="mini-card__avatars">
                {[6, 7, 8].map((n) => (
                  <img key={n} src={`/assets/landing/avatar-${n}.webp`} alt="" />
                ))}
                <span>+3</span>
              </div>
            </div>
            <p className="mini-card__meta">Sáb, 17 out • 07h • 1,2 km</p>
            <span className="mini-card__spots">3 vagas restantes</span>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="stats__inner">
          <div className="stat">
            <span className="stat__icon">{Icon.calendar}</span>
            <p>
              <strong>+120</strong>
              <span>atividades por semana</span>
            </p>
          </div>
          <div className="stat">
            <span className="stat__icon">{Icon.trophy}</span>
            <p>
              <strong>15</strong>
              <span>esportes diferentes</span>
            </p>
          </div>
          <div className="stat">
            <span className="stat__icon">{Icon.mapPin}</span>
            <p>
              <strong>3,2 km</strong>
              <span>distância média até você</span>
            </p>
          </div>
          <div className="stat">
            <span className="stat__icon">{Icon.heart}</span>
            <p>
              <strong>4,8 de 5</strong>
              <span>avaliação dos encontros</span>
            </p>
          </div>
        </div>
      </section>

      <section className="section" id="como-funciona">
        <div className="section__head">
          <h2>Como funciona</h2>
          <p>Do “queria ir” ao “bora?” em três passos.</p>
        </div>

        <div className="steps">
          {steps.map((step, index) => (
            <article className={index === 1 ? "step step--active" : "step"} key={step.number}>
              <span className="step__number">{step.number}</span>
              <span className="step__icon">{step.icon}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="esportes">
        <div className="section__head">
          <h2>Encontre seu esporte</h2>
          <p>Do pedal de domingo ao futebol depois do trabalho.</p>
        </div>

        <div className="sports">
          {sports.map((sport) => (
            <a className="sport" href="#/cadastro" key={sport.name}>
              <img src={sport.image} alt={`Pessoas praticando ${sport.name}`} loading="lazy" />
              <div className="sport__text">
                <strong>{sport.name}</strong>
                <span>{sport.count} atividades</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="section" id="atividades">
        <div className="section__head section__head--row">
          <div>
            <h2>Veja o que já está rolando</h2>
            <p>Atividades com vagas abertas esta semana.</p>
          </div>
          <a className="link" href="#/cadastro">
            Ver todas
            {Icon.arrowRight}
          </a>
        </div>

        <div className="activities">
          {activities.map((activity) => (
            <article className="activity" key={activity.title}>
              <div className="activity__cover">
                <img src={activity.image} alt={`Foto da atividade ${activity.title}`} loading="lazy" />
                {activity.hot && <span className="tag tag--hot">Em alta</span>}
                <a className="activity__favorite" href="#/cadastro" aria-label={`Criar conta para salvar ${activity.title}`}>
                  {Icon.heart}
                </a>
              </div>

              <div className="activity__body">
                <span className="activity__sport">{activity.sport}</span>
                <h3>
                  <a href="#/cadastro">{activity.title}</a>
                </h3>

                <ul className="activity__meta">
                  <li>
                    {Icon.calendar}
                    {activity.date}
                  </li>
                  <li>
                    {Icon.mapPin}
                    {activity.place}
                  </li>
                  <li>
                    {Icon.sun}
                    {activity.weather}
                  </li>
                </ul>
              </div>

              <div className="activity__footer">
                <div className="activity__people">
                  <div className="people__avatars people__avatars--sm">
                    {activity.people.map((src) => (
                      <img key={src} src={src} alt="" />
                    ))}
                  </div>
                  <span>{activity.spots}</span>
                </div>
                <span className={`tag tag--${activity.tone}`}>{activity.level}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="cta">
        <div className="cta__box">
          <div>
            <h2>Pronto pra se movimentar?</h2>
            <p>Crie sua conta grátis e encontre sua próxima atividade em minutos.</p>
          </div>
          <div className="cta__actions">
            <a
              className="btn btn--white"
              href="#/cadastro"
            >
              {Icon.arrowRight}
              Criar minha conta
            </a>
            <a className="btn btn--outline-white" href={loggedIn ? "#/explorar" : "#/login"}>
              Explorar atividades
            </a>
          </div>
        </div>
      </section>

      <footer className="footer" id="sobre">
        <a className="logo logo--sm" href="#/">
          Me <span>Leva</span>
        </a>
        <p>Projeto MVP Front-end • Teresópolis, RJ • 2026</p>
        <nav className="footer__links">
          <button type="button" onClick={() => openModal("termos")}>
            Termos
          </button>
          <button type="button" onClick={() => openModal("termos")}>
            Privacidade
          </button>
          <a href="mailto:contato@meleva.app">Contato</a>
        </nav>
      </footer>
    </div>
  );
}
