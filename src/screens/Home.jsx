import AppShell from "../components/AppShell.jsx";
import { ActivityCard, LevelTag, link, MapView } from "../components/ui.jsx";
import { Icon } from "../icons.jsx";
import { useStore } from "../store.jsx";
import { isPast, requestConnection, statusOf, visibleActivities } from "../services/rules.js";
import { dayDiff, friendlyWhen, place } from "../utils/format.js";

const SPORT_CHIPS = ["Corrida", "Trilha", "Ciclismo", "Futebol", "Yoga", "Vôlei", "Beach tênis", "Natação"];

const challenges = [
  { icon: Icon.flame, title: "5K no mês", progress: 62 },
  { icon: Icon.bike, title: "Semana de bike", progress: 40 },
  { icon: Icon.leaf, title: "7 dias de movimento", progress: 28 },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

/** Tela 06 — Início (RF11, RF15). */
export default function Home() {
  const { state, me, run, toast, user } = useStore();
  const future = visibleActivities(state)
    .filter((a) => !isPast(a))
    .sort((a, b) => new Date(a.start) - new Date(b.start));
  const upcoming = future.slice(0, 3);
  const recommended = future
    .filter((a) => !upcoming.includes(a) && statusOf(a) === "none")
    .sort((a, b) => Number(me.sports.includes(b.sport)) - Number(me.sports.includes(a.sport)))
    .slice(0, 4);
  const nearby = future.filter((a) => a.distanceKm <= 5);
  const weekCount = future.filter((a) => dayDiff(a.start) < 7).length;
  const mine = future.filter((a) => ["confirmed", "organizer"].includes(statusOf(a)) && dayDiff(a.start) < 7);

  const people = Object.values(state.users)
    .filter((u) => u.id !== "me" && !/^a\d+$/.test(u.id) && !state.connections.includes(u.id) && !state.blocked.includes(u.id))
    .map((u) => ({ ...u, common: u.sports.filter((s) => me.sports.includes(s)) }))
    .filter((u) => u.common.length)
    .sort((a, b) => b.common.length - a.common.length)
    .slice(0, 3);

  const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];
  const today = new Date().getDay();

  return (
    <AppShell active="home">
      <div className="home">
        <div className="home__main">
          <section className="hi">
            <div className="hi__text">
              <span className="hi__badge">
                {Icon.flame}
                {weekCount} atividades perto de você esta semana
              </span>
              <h1>
                {greeting()}, {me.firstName}!
                <br />
                Bora se movimentar hoje?
              </h1>
              <p>Encontre gente com o mesmo ritmo que o seu e transforme o treino em encontro.</p>
              <div className="hi__actions">
                <a className="btn btn--white" href={link("explorar")}>
                  Explorar atividades
                  {Icon.arrowRight}
                </a>
                <a className="btn btn--outline-white" href={link("criar")}>
                  {Icon.plus}
                  Criar atividade
                </a>
              </div>
            </div>
            <img className="hi__img" src="/assets/app/hero-inicio.webp" alt="Grupo correndo junto ao ar livre" />
          </section>

          <nav className="chips" aria-label="Atalhos por esporte">
            <a className="chip chip--active" href={link("explorar")}>
              Todas
            </a>
            {SPORT_CHIPS.map((sport) => (
              <a className="chip" key={sport} href={`#/explorar?esporte=${encodeURIComponent(sport)}`}>
                {sport}
              </a>
            ))}
            <a className="chip chip--filter" href="#/explorar?filtros=1">
              {Icon.filter}
              Filtros
            </a>
          </nav>

          <section className="block">
            <div className="block__head">
              <h2>Próximas atividades</h2>
              <a className="link" href={link("explorar")}>
                Ver todas
                {Icon.arrowRight}
              </a>
            </div>

            <div className="activities activities--app">
              {upcoming.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          </section>

          <section className="block">
            <div className="block__head">
              <h2>Recomendadas para você</h2>
              <a className="link" href={link("explorar")}>
                Ver mais
                {Icon.arrowRight}
              </a>
            </div>

            <div className="recs">
              {recommended.map((item) => (
                <a className="rec" key={item.id} href={link(`atividade/${item.id}`)}>
                  <img src={item.image} alt="" loading="lazy" />
                  <div className="rec__info">
                    <h3>{item.title}</h3>
                    <p>
                      {Icon.clock}
                      {friendlyWhen(item.start)}
                    </p>
                    <p>
                      {Icon.mapPin}
                      {place(item)}
                    </p>
                    <LevelTag level={item.level} />
                  </div>
                </a>
              ))}
            </div>
          </section>
        </div>

        <aside className="home__side">
          <section className="panel">
            <header className="panel__head">
              <h2>Sua semana</h2>
              <span className="panel__trophy">{Icon.trophy}</span>
            </header>

            <div className="week-stats">
              <div>
                <strong>{mine.length}</strong>
                <span>agendadas</span>
              </div>
              <div>
                <strong>8,4 km</strong>
                <span>percorridos</span>
              </div>
              <div>
                <strong>3 dias</strong>
                <span>seguidos</span>
              </div>
            </div>

            <div className="week-chart" aria-hidden="true">
              {weekDays.map((day, index) => {
                const active = [1, 3, today].includes(index);
                return (
                  <div className="week-chart__col" key={`${day}-${index}`}>
                    <span className={active ? "week-chart__bar week-chart__bar--on" : "week-chart__bar"} style={{ height: `${active ? 60 + index * 6 : 30}%` }} />
                    <small>{day}</small>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="panel">
            <header className="panel__head">
              <h2>Perto de você</h2>
              <a className="link" href="#/explorar?view=mapa">
                Ver no mapa
                {Icon.arrowRight}
              </a>
            </header>

            <MapView activities={nearby} compact />

            <div className="legend">
              <span>
                <i className="dot dot--rose" />
                {nearby.length} atividades
              </span>
              <span>
                <i className="dot dot--purple" />
                Você
              </span>
            </div>
          </section>

          <section className="panel">
            <header className="panel__head">
              <h2>Desafios da semana</h2>
            </header>

            <div className="challenges">
              {challenges.map((challenge) => (
                <div className="challenge" key={challenge.title}>
                  <span className="challenge__icon">{challenge.icon}</span>
                  <div className="challenge__body">
                    <div className="challenge__row">
                      <strong>{challenge.title}</strong>
                      <span>{challenge.progress}%</span>
                    </div>
                    <div className="progress" role="progressbar" aria-valuenow={challenge.progress} aria-valuemin={0} aria-valuemax={100} aria-label={challenge.title}>
                      <span style={{ width: `${challenge.progress}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <header className="panel__head">
              <h2>Pessoas com interesses parecidos</h2>
            </header>

            <div className="people-list">
              {people.length === 0 && <p className="hint">Você já se conectou com todo mundo por aqui!</p>}
              {people.map((person) => {
                const pending = state.pendingConnections.includes(person.id);
                return (
                  <div className="person" key={person.id}>
                    <a href={link(`pessoa/${person.id}`)}>
                      <img src={user(person.id).avatar} alt="" />
                    </a>
                    <div className="person__info">
                      <a href={link(`pessoa/${person.id}`)}>
                        <strong>{person.name}</strong>
                      </a>
                      <span>{person.common.join(" • ")}</span>
                    </div>
                    <button
                      className="btn btn--ghost btn--sm"
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        run(requestConnection, person.id);
                        toast("Pedido de conexão enviado");
                      }}
                    >
                      {pending ? "Enviado" : "Conectar"}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
