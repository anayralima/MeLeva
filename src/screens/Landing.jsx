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
    <div className="my-0 mx-auto max-w-400 bg-pagina overflow-hidden">
      <header className="py-5.5 px-[clamp(20px,5vw,80px)] flex items-center justify-between gap-6 bg-pagina">
        <a className="text-[26px] font-extrabold tracking-[-0.8px] [&_span]:text-rosa" href="#/">
          Me <span>Leva</span>
        </a>
        <nav className="flex gap-14 text-[14px] font-medium max-2xl:gap-8 max-lg:hidden [&_a]:text-principal [&_a]:opacity-90 [&_a:hover]:text-rosa">
          <a href="#como-funciona">Como funciona</a>
          <a href="#atividades">Atividades</a>
          <a href="#esportes">Esportes</a>
        </nav>
        <div className="flex gap-3">
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

      <section className="pt-10 pb-16 px-[clamp(20px,5vw,80px)] flex gap-[clamp(24px,3.5vw,56px)] max-lg:flex-col">
        <div className="flex flex-1 flex-col items-start gap-6 [&_h1]:text-[length:clamp(38px,3.75vw,60px)] [&_h1]:leading-[1.05] [&_h1]:tracking-[-1.2px] [&_h1]:font-bold">
          <span className="py-1.5 px-3 inline-flex items-center gap-1.5 rounded-full bg-rosa-suave text-rosa-texto text-[12px] font-semibold">
            <span className="block size-3.5 [.mini-card-tag_&]:size-3">{Icon.pin}</span>
            Agora em Teresópolis, RJ
          </span>

          <h1>
            Encontre gente pra
            <br />
            praticar o esporte que
            <br />
            <span className="text-rosa">você ama.</span>
          </h1>

          <p className="max-w-115 text-[17px] leading-[1.5] text-secundario">
            O Me Leva conecta você a pessoas e atividades esportivas perto de casa — no lugar,
            no horário e no nível que fazem sentido pra você.
          </p>

          <div className="flex gap-3 max-sm:flex-wrap">
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

          <div className="flex items-center gap-3 [&_p]:flex [&_p]:flex-col [&_p]:text-[13px] [&_p]:leading-[1.35] [&_p_strong]:font-bold [&_p_span]:text-secundario">
            <div className="flex [&_img]:border-2 [&_img]:border-pagina [&_img]:size-8.5 [&_img]:rounded-full [&_img]:object-cover [&_img+img]:-ml-2.5">
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

        <div className="relative shrink-0 w-[clamp(440px,38.75vw,620px)] aspect-[620/520] max-lg:w-full max-lg:max-w-130 max-sm:max-w-full">
          <img className="w-[83.9%] h-[96.2%] ml-auto rounded-[24px] object-cover" src="/assets/landing/hero-main.webp" alt="Grupo de amigos correndo juntos num parque" />
          <img className="border-6 border-pagina absolute left-0 top-[48.1%] w-[35.5%] h-[46.2%] rounded-[20px] object-cover" src="/assets/landing/hero-small.webp" alt="Pessoas fazendo trilha na serra" />

          <div className="py-2.5 pr-3.5 pl-2.5 absolute top-6 right-6.5 flex items-center gap-2.5 rounded-[16px] bg-superficie shadow-[var(--sombra-card)] max-sm:right-0 [&_img]:size-9 [&_img]:rounded-full [&_img]:object-cover [&_p]:flex [&_p]:flex-col [&_p]:text-[11px] [&_p_strong]:text-[12px] [&_p_strong]:font-semibold [&_p_span]:text-secundario">
            <img src="/assets/landing/avatar-5.webp" alt="" />
            <p>
              <strong>Camila entrou na sua trilha!</strong>
              <span>Trilha Pedra do Sino • Dom 06h</span>
            </p>
          </div>

          <div className="p-3.5 absolute right-0 bottom-0 w-[40%] min-w-54 rounded-[18px] bg-superficie shadow-[var(--sombra-card)] max-sm:w-[46%]">
            <div className="flex items-center justify-between gap-2">
              <span className="mini-card-tag inline-flex items-center gap-1 text-rosa-texto text-[12px] font-bold whitespace-nowrap">
                <span className="block size-3.5 [.mini-card-tag_&]:size-3">{Icon.spark}</span>
                Corrida no Parque
              </span>
              <div className="flex items-center [&_img]:border [&_img]:border-white [&_img]:size-4.5 [&_img]:rounded-full [&_img]:object-cover [&_img+img]:-ml-1.5 [&_span]:ml-1 [&_span]:text-[10px] [&_span]:text-secundario">
                {[6, 7, 8].map((n) => (
                  <img key={n} src={`/assets/landing/avatar-${n}.webp`} alt="" />
                ))}
                <span>+3</span>
              </div>
            </div>
            <p className="mt-1.5 text-[11px] text-secundario">Sáb, 17 out • 07h • 1,2 km</p>
            <span className="py-1 px-2 inline-block mt-2 rounded-full bg-rosa-suave text-rosa-texto text-[10px] font-semibold">3 vagas restantes</span>
          </div>
        </div>
      </section>

      <section className="py-0 px-[clamp(20px,5vw,80px)]">
        <div className="py-7.25 px-[clamp(20px,3vw,48px)] border border-borda grid grid-cols-[repeat(4,1fr)] rounded-[20px] bg-superficie max-2xl:grid-cols-[repeat(2,1fr)] max-2xl:gap-6 max-sm:grid-cols-[1fr]">
          <div className="flex items-center gap-3.5 [&_p]:flex [&_p]:flex-col [&_p]:leading-[1.3] [&_p_strong]:text-[22px] [&_p_strong]:font-bold [&_p_span]:text-[13px] [&_p_span]:text-secundario">
            <span className="p-2.75 grid place-items-center size-10 rounded-[12px] bg-rosa-suave text-rosa">{Icon.calendar}</span>
            <p>
              <strong>+120</strong>
              <span>atividades por semana</span>
            </p>
          </div>
          <div className="flex items-center gap-3.5 [&_p]:flex [&_p]:flex-col [&_p]:leading-[1.3] [&_p_strong]:text-[22px] [&_p_strong]:font-bold [&_p_span]:text-[13px] [&_p_span]:text-secundario">
            <span className="p-2.75 grid place-items-center size-10 rounded-[12px] bg-rosa-suave text-rosa">{Icon.trophy}</span>
            <p>
              <strong>15</strong>
              <span>esportes diferentes</span>
            </p>
          </div>
          <div className="flex items-center gap-3.5 [&_p]:flex [&_p]:flex-col [&_p]:leading-[1.3] [&_p_strong]:text-[22px] [&_p_strong]:font-bold [&_p_span]:text-[13px] [&_p_span]:text-secundario">
            <span className="p-2.75 grid place-items-center size-10 rounded-[12px] bg-rosa-suave text-rosa">{Icon.mapPin}</span>
            <p>
              <strong>3,2 km</strong>
              <span>distância média até você</span>
            </p>
          </div>
          <div className="flex items-center gap-3.5 [&_p]:flex [&_p]:flex-col [&_p]:leading-[1.3] [&_p_strong]:text-[22px] [&_p_strong]:font-bold [&_p_span]:text-[13px] [&_p_span]:text-secundario">
            <span className="p-2.75 grid place-items-center size-10 rounded-[12px] bg-rosa-suave text-rosa">{Icon.heart}</span>
            <p>
              <strong>4,8 de 5</strong>
              <span>avaliação dos encontros</span>
            </p>
          </div>
        </div>
      </section>

      <section className="pt-22 pb-0 px-[clamp(20px,5vw,80px)]" id="como-funciona">
        <div className="flex flex-col gap-2 mb-7 [&_h2]:text-[length:clamp(28px,2.5vw,40px)] [&_h2]:leading-[1.1] [&_h2]:tracking-[-0.8px] [&_h2]:font-bold max-sm:[&_h2]:text-[28px] [&_p]:text-[15px] [&_p]:text-secundario">
          <h2>Como funciona</h2>
          <p>Do “queria ir” ao “bora?” em três passos.</p>
        </div>

        <div className="grid grid-cols-[repeat(3,1fr)] gap-6 max-lg:grid-cols-[repeat(2,1fr)] max-sm:grid-cols-[1fr]">
          {steps.map((step, index) => (
            <article className={index === 1 ? "step--active p-7 border border-transparent relative min-h-52.75 rounded-[20px] [background:var(--gradiente-marca)] text-white [&_h3]:mt-5.5 [&_h3]:text-[18px] [&_h3]:font-semibold [&_p]:mt-2 [&_p]:max-w-95 [&_p]:text-[13px] [&_p]:leading-[1.5] [&_p]:text-[rgba(255,255,255,0.86)]" : "p-7 border border-borda relative min-h-52.75 rounded-[20px] bg-superficie [&_h3]:mt-5.5 [&_h3]:text-[18px] [&_h3]:font-semibold [&_p]:mt-2 [&_p]:max-w-95 [&_p]:text-[13px] [&_p]:leading-[1.5] [&_p]:text-secundario"} key={step.number}>
              <span className="absolute top-5 right-6 text-[40px] font-bold text-lilas [.step--active_&]:text-[rgba(255,255,255,0.28)]">{step.number}</span>
              <span className="p-3 grid place-items-center size-12 rounded-[14px] bg-rosa-suave text-rosa [.step--active_&]:bg-[rgba(255,255,255,0.18)] [.step--active_&]:text-white">{step.icon}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="pt-22 pb-0 px-[clamp(20px,5vw,80px)]" id="esportes">
        <div className="flex flex-col gap-2 mb-7 [&_h2]:text-[length:clamp(28px,2.5vw,40px)] [&_h2]:leading-[1.1] [&_h2]:tracking-[-0.8px] [&_h2]:font-bold max-sm:[&_h2]:text-[28px] [&_p]:text-[15px] [&_p]:text-secundario">
          <h2>Encontre seu esporte</h2>
          <p>Do pedal de domingo ao futebol depois do trabalho.</p>
        </div>

        <div className="grid grid-cols-[repeat(4,1fr)] gap-5 max-lg:grid-cols-[repeat(2,1fr)] max-sm:grid-cols-[1fr]">
          {sports.map((sport) => (
            <a className="relative h-45 rounded-[16px] overflow-hidden isolate [&_img]:size-full [&_img]:object-cover [&_img]:[transition:transform_0.3s_ease] hover:[&_img]:[transform:scale(1.04)] after:absolute after:inset-0 after:[background:linear-gradient(180deg,rgba(24,8,40,0)_35%,rgba(18,6,32,0.78)_100%)]" href="#/cadastro" key={sport.name}>
              <img src={sport.image} alt={`Pessoas praticando ${sport.name}`} loading="lazy" />
              <div className="absolute left-4.5 bottom-4 z-1 flex flex-col text-white [&_strong]:text-[20px] [&_strong]:font-bold [&_span]:text-[13px] [&_span]:opacity-85">
                <strong>{sport.name}</strong>
                <span>{sport.count} atividades</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="pt-22 pb-0 px-[clamp(20px,5vw,80px)]" id="atividades">
        <div className="flex mb-7 flex-row items-end justify-between gap-6 [&_h2]:text-[length:clamp(28px,2.5vw,40px)] [&_h2]:leading-[1.1] [&_h2]:tracking-[-0.8px] [&_h2]:font-bold max-sm:[&_h2]:text-[28px] [&_p]:text-[15px] [&_p]:text-secundario">
          <div>
            <h2>Veja o que já está rolando</h2>
            <p>Atividades com vagas abertas esta semana.</p>
          </div>
          <a className="link" href="#/cadastro">
            Ver todas
            {Icon.arrowRight}
          </a>
        </div>

        <div className="grid grid-cols-[repeat(3,1fr)] gap-6 max-lg:grid-cols-[repeat(2,1fr)] max-sm:grid-cols-[1fr]">
          {activities.map((activity) => (
            <article className="activity border border-borda flex flex-col rounded-[20px] bg-superficie overflow-hidden relative [transition:box-shadow_0.15s,transform_0.15s] hover:shadow-[var(--sombra-card)] hover:[transform:translateY(-2px)] max-xl:[.create-side_&]:max-w-90" key={activity.title}>
              <div className="relative h-42 [&>img]:size-full [&>img]:object-cover [.activities--app_&]:h-42">
                <img src={activity.image} alt={`Foto da atividade ${activity.title}`} loading="lazy" />
                {activity.hot && <span className="tag tag--hot">Em alta</span>}
                <a className="activity-favorite" href="#/cadastro" aria-label={`Criar conta para salvar ${activity.title}`}>
                  {Icon.heart}
                </a>
              </div>

              <div className="pt-4.5 pb-3.5 px-4.5 flex flex-col gap-2 [&_h3]:text-[17px] [&_h3]:font-bold">
                <span className="text-[11px] font-semibold tracking-[0.88px] uppercase text-rosa">{activity.sport}</span>
                <h3>
                  <a href="#/cadastro">{activity.title}</a>
                </h3>

                <ul className="flex flex-col gap-1.5 list-none text-[13px] text-secundario [&_li]:flex [&_li]:items-center [&_li]:gap-1.5 [&_svg]:size-3.5 [&_svg]:shrink-0">
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

              <div className="pt-3 pb-4 px-4.5 flex items-center justify-between gap-3 mt-auto border-t border-t-borda">
                <div className="flex items-center gap-2 text-[12px] text-secundario">
                  <div className="flex [&_img]:border-2 [&_img]:border-white [&_img]:rounded-full [&_img]:object-cover [&_img]:size-6 [&_img+img]:-ml-2.5">
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

      <section className="pt-22 pb-0 px-[clamp(20px,5vw,80px)]">
        <div className="py-13 px-14 flex items-center justify-between gap-10 rounded-[24px] [background:var(--gradiente-marca)] text-white max-lg:p-9 max-lg:flex-col max-lg:items-start [&_h2]:text-[length:clamp(26px,2.5vw,40px)] [&_h2]:leading-[1.1] [&_h2]:tracking-[-0.8px] [&_h2]:font-bold [&_p]:mt-2 [&_p]:text-[15px] [&_p]:text-[rgba(255,255,255,0.86)]">
          <div>
            <h2>Pronto pra se movimentar?</h2>
            <p>Crie sua conta grátis e encontre sua próxima atividade em minutos.</p>
          </div>
          <div className="flex gap-3 max-sm:flex-wrap">
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

      <footer className="py-10 px-[clamp(20px,5vw,80px)] flex items-center justify-between gap-6 text-[12px] text-secundario max-sm:flex-col max-sm:items-start" id="sobre">
        <a className="font-extrabold tracking-[-0.8px] text-[20px] [&_span]:text-rosa" href="#/">
          Me <span>Leva</span>
        </a>
        <p>Projeto MVP Front-end • Teresópolis, RJ • 2026</p>
        <nav className="flex gap-6 [&_a:hover]:text-rosa [&_button]:border-0 [&_button]:bg-transparent [&_button]:[font-size:inherit] [&_button]:text-inherit [&_button]:cursor-pointer">
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
