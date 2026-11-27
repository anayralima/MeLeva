import { useState } from "react";
import { Icon } from "../icons.jsx";
import { useStore } from "../store.jsx";
import { MIN_INTERESTS, SPORTS } from "../services/rules.js";
import { Steps } from "./Signup.jsx";

const EMOJI = {
  Corrida: "🏃", Trilha: "🥾", Ciclismo: "🚴", Futebol: "⚽", Yoga: "🧘", Vôlei: "🏐", "Beach tênis": "🎾",
  Natação: "🏊", Funcional: "💪", Tênis: "🎾", Skate: "🛹", Escalada: "🧗", Basquete: "🏀", Caminhada: "🚶", Dança: "💃",
};

/** Tela 04 — Interesses, passo 2 de 3 (RF06 / RN13: pelo menos 3 esportes). */
export default function Interests() {
  const { me, update } = useStore();
  const [selected, setSelected] = useState(me.sports ?? []);
  const [error, setError] = useState("");
  const missing = Math.max(0, MIN_INTERESTS - selected.length);

  function toggle(sport) {
    setError("");
    setSelected((list) => (list.includes(sport) ? list.filter((s) => s !== sport) : [...list, sport]));
  }

  function submit(event) {
    event.preventDefault();
    if (missing) return setError(`Escolha mais ${missing} para personalizar suas recomendações.`);
    update((s) => ({ ...s, users: { ...s.users, me: { ...s.users.me, sports: selected } } }));
    window.location.hash = "#/perfil-inicial";
  }

  return (
    <main className="py-8 px-4 grid min-h-screen place-items-center [background:radial-gradient(circle_at_15%_10%,#fbe1f0,transparent_40%),radial-gradient(circle_at_90%_90%,#f1eaf8,transparent_40%),var(--fundo-pagina)]">
      <form className="p-8 flex flex-col gap-4.5 w-[min(640px,100%)] rounded-[28px] bg-superficie shadow-[var(--sombra-card)] max-md:py-5.5 max-md:px-4.5 [&_h1]:text-[30px] [&_h1]:font-extrabold [&_h1]:tracking-[-0.6px] max-md:[&_h1]:text-[24px]" onSubmit={submit}>
        <Steps current={2} />
        <h1>O que você curte praticar?</h1>
        <p className="text-[15px] text-secundario">Escolha pelo menos {MIN_INTERESTS} esportes. Usamos isso para recomendar atividades e pessoas.</p>
        <div className="sport-chips flex flex-wrap gap-2.5" role="group" aria-label="Esportes">
          {SPORTS.map((sport) => {
            const on = selected.includes(sport);
            return (
              <button key={sport} type="button" className={on ? "chip chip--active" : "chip"} aria-pressed={on} onClick={() => toggle(sport)}>
                <span aria-hidden="true">{EMOJI[sport]}</span> {sport}
                {on && <span className="chip-check">{Icon.check}</span>}
              </button>
            );
          })}
        </div>
        <p className={missing ? "text-[13px] font-semibold text-secundario" : "text-[13px] font-semibold text-verde-texto [.pw-checks_&]:[&_svg]:bg-verde"} aria-live="polite">
          {missing ? `${selected.length} de ${MIN_INTERESTS} escolhidos` : `${selected.length} escolhidos. Boa!`}
        </p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="flex justify-between gap-2.5">
          <a className="btn btn--lilac" href="#/cadastro">Voltar</a>
          <button className="btn btn--gradient" type="submit" aria-disabled={Boolean(missing)}>
            Continuar {Icon.arrowRight}
          </button>
        </div>
      </form>
    </main>
  );
}
