import AppShell from "../components/AppShell.jsx";
import { ActivityCard, LevelTag, link, MapView } from "../components/ui.jsx";
import { Icon } from "../icons.jsx";
import { useStore } from "../store.jsx";
import { isPast, requestConnection, statusOf, visibleActivities, weekSummary } from "../services/rules.js";
import { dayDiff, friendlyWhen, km, place } from "../utils/format.js";

const SPORT_CHIPS = ["Corrida", "Trilha", "Ciclismo", "Futebol", "Yoga", "Vôlei", "Beach tênis", "Natação"];

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
  const week = weekSummary(state);
  const maxDayKm = Math.max(0, ...week.days.map((day) => day.km));

  return (
    <AppShell active="home">
      <div className="grid grid-cols-[minmax(0,1fr)_360px] gap-6 max-2xl:grid-cols-[1fr]">
        <div className="flex flex-col gap-7 min-w-0">
          <section className="flex min-h-68 rounded-[24px] overflow-hidden [background:linear-gradient(90deg,#31104e_0%,#803073_55%,#f692b6_100%)] text-white max-md:flex-col [&_h1]:text-[34px] [&_h1]:leading-[1.12] [&_h1]:tracking-[-0.51px] [&_h1]:font-bold max-xs:[&_h1]:text-[28px] [&_p]:max-w-105 [&_p]:text-[15px] [&_p]:text-[rgba(255,255,255,0.85)]">
            <div className="py-8.5 pr-5 pl-9 flex flex-1 flex-col justify-center gap-3.5">
              <span className="py-1.25 pr-3 pl-2.5 inline-flex items-center self-start gap-1.5 rounded-full bg-[rgba(255,255,255,0.14)] text-[12px] font-semibold [&_svg]:size-3.5">
                {Icon.flame}
                {weekCount} atividades perto de você esta semana
              </span>
              <h1>
                {greeting()}, {me.firstName}!
                <br />
                Bora se movimentar hoje?
              </h1>
              <p>Encontre gente com o mesmo ritmo que o seu e transforme o treino em encontro.</p>
              <div className="hi-actions flex gap-3 mt-0.5 flex-wrap">
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
            <img className="w-83 object-cover max-xl:w-60 max-md:w-full max-md:h-42.5" src="/assets/app/hero-inicio.webp" alt="Grupo correndo junto ao ar livre" />
          </section>

          <nav className="flex flex-wrap gap-2" aria-label="Atalhos por esporte">
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

          <section className="flex-col gap-4 block">
            <div className="flex items-center justify-between gap-4 [&_h2]:text-[22px] [&_h2]:font-bold [&_h2]:tracking-[-0.3px]">
              <h2>Próximas atividades</h2>
              <a className="link" href={link("explorar")}>
                Ver todas
                {Icon.arrowRight}
              </a>
            </div>

            <div className="activities--app grid grid-cols-[repeat(3,1fr)] gap-5 max-lg:grid-cols-[repeat(2,1fr)] max-sm:grid-cols-[1fr]">
              {upcoming.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          </section>

          <section className="flex-col gap-4 block">
            <div className="flex items-center justify-between gap-4 [&_h2]:text-[22px] [&_h2]:font-bold [&_h2]:tracking-[-0.3px]">
              <h2>Recomendadas para você</h2>
              <a className="link" href={link("explorar")}>
                Ver mais
                {Icon.arrowRight}
              </a>
            </div>

            <div className="grid grid-cols-[1fr_1fr] gap-4 max-md:grid-cols-[1fr]">
              {recommended.map((item) => (
                <a className="p-3 border border-borda flex gap-3.5 rounded-[16px] bg-superficie [transition:box-shadow_0.15s] [&>img]:shrink-0 [&>img]:size-24 [&>img]:rounded-[12px] [&>img]:object-cover hover:shadow-[var(--sombra-card)]" key={item.id} href={link(`atividade/${item.id}`)}>
                  <img src={item.image} alt="" loading="lazy" />
                  <div className="rec-info flex flex-col gap-1 min-w-0 [&_h3]:text-[15px] [&_h3]:font-semibold [&_p]:flex [&_p]:items-center [&_p]:gap-1.5 [&_p]:text-[12px] [&_p]:text-secundario [&_p_svg]:size-3.25 [&_p_svg]:shrink-0">
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

        <aside className="flex flex-col gap-5 max-2xl:grid max-2xl:grid-cols-[repeat(2,1fr)] max-md:grid-cols-[1fr]">
          <section className="p-5 border border-borda rounded-[20px] bg-superficie shadow-[0_6px_20px_rgba(36,15,92,0.07)]">
            <header className="flex items-center justify-between gap-3 mb-3.5 [&_h2]:text-[17px] [&_h2]:font-semibold">
              <h2>Sua semana</h2>
              <span className="size-5 text-rosa">{Icon.trophy}</span>
            </header>

            <div className="flex gap-2.5 mb-3.5 [&>div]:py-2.5 [&>div]:px-3 [&>div]:flex [&>div]:flex-1 [&>div]:flex-col [&>div]:gap-0.5 [&>div]:rounded-[12px] [&>div]:bg-pagina [&_strong]:text-[18px] [&_strong]:font-bold [&_span]:text-[12px] [&_span]:text-secundario">
              <div>
                <strong>{mine.length}</strong>
                <span>agendadas</span>
              </div>
              <div>
                <strong>{week.done}</strong>
                <span>{week.done === 1 ? "feita" : "feitas"}</span>
              </div>
              <div>
                <strong>{week.km === 0 ? "0 km" : km(week.km)}</strong>
                <span>percorridos</span>
              </div>
            </div>

            <div className="flex items-end justify-between gap-1.5 h-32.5 [&_small]:text-[11px] [&_small]:font-medium [&_small]:text-secundario" aria-hidden="true">
              {week.days.map((day) => {
                const active = day.count > 0;
                const height = !active ? 30 : maxDayKm > 0 ? 45 + Math.round((day.km / maxDayKm) * 55) : 60;
                return (
                  <div className="flex flex-1 flex-col items-center justify-end gap-1.5 h-full" key={day.date}>
                    <span className={active ? "w-full max-w-6.5 min-h-2 rounded-[7px] [background:linear-gradient(180deg,var(--marca-rosa),#7b2ad8)]" : "w-full max-w-6.5 min-h-2 rounded-[7px] bg-lilas"} style={{ height: `${height}%` }} />
                    <small>{weekDays[new Date(day.date).getDay()]}</small>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="p-5 border border-borda rounded-[20px] bg-superficie shadow-[0_6px_20px_rgba(36,15,92,0.07)]">
            <header className="flex items-center justify-between gap-3 mb-3.5 [&_h2]:text-[17px] [&_h2]:font-semibold">
              <h2>Perto de você</h2>
              <a className="link" href="#/explorar?view=mapa">
                Ver no mapa
                {Icon.arrowRight}
              </a>
            </header>

            <MapView activities={nearby} compact />

            <div className="flex gap-4 mt-3 text-[12px] text-secundario [&_span]:flex [&_span]:items-center [&_span]:gap-1.5">
              <span>
                <i className="size-2 rounded-full bg-rosa" />
                {nearby.length} atividades
              </span>
              <span>
                <i className="size-2 rounded-full bg-roxo" />
                Você
              </span>
            </div>
          </section>

          <section className="p-5 border border-borda rounded-[20px] bg-superficie shadow-[0_6px_20px_rgba(36,15,92,0.07)]">
            <header className="flex items-center justify-between gap-3 mb-3.5 [&_h2]:text-[17px] [&_h2]:font-semibold">
              <h2>Pessoas com interesses parecidos</h2>
            </header>

            <div className="flex flex-col gap-3.5 [.conn-side_&]:p-0 [.conn-side_&]:m-0 [.conn-side_&]:list-none">
              {people.length === 0 && <p className="hint">Você já se conectou com todo mundo por aqui!</p>}
              {people.map((person) => {
                const pending = state.pendingConnections.includes(person.id);
                return (
                  <div className="person flex items-center gap-3 [&>img]:shrink-0 [&>img]:size-10 [&>img]:rounded-full [&>img]:object-cover [&>a:first-child_img]:shrink-0 [&>a:first-child_img]:size-10 [&>a:first-child_img]:rounded-full [&>a:first-child_img]:object-cover [.conn-side_&]:[&>a:first-child_img]:size-11 [.conn-side_&]:[&>a:first-child_img]:rounded-full [.conn-side_&]:[&>a:first-child_img]:object-cover" key={person.id}>
                    <a href={link(`pessoa/${person.id}`)}>
                      <img src={user(person.id).avatar} alt="" />
                    </a>
                    <div className="flex flex-1 flex-col min-w-0 text-[12px] text-secundario [&_strong]:text-[13px] [&_strong]:font-semibold [&_strong]:text-principal [&_a]:text-principal">
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
