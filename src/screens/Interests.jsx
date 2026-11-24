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
    <main className="onboarding">
      <form className="onboarding__box" onSubmit={submit}>
        <Steps current={2} />
        <h1>O que você curte praticar?</h1>
        <p className="onboarding__lead">Escolha pelo menos {MIN_INTERESTS} esportes. Usamos isso para recomendar atividades e pessoas.</p>
        <div className="sport-chips" role="group" aria-label="Esportes">
          {SPORTS.map((sport) => {
            const on = selected.includes(sport);
            return (
              <button key={sport} type="button" className={on ? "chip chip--active" : "chip"} aria-pressed={on} onClick={() => toggle(sport)}>
                <span aria-hidden="true">{EMOJI[sport]}</span> {sport}
                {on && <span className="chip__check">{Icon.check}</span>}
              </button>
            );
          })}
        </div>
        <p className={missing ? "onboarding__count" : "onboarding__count is-ok"} aria-live="polite">
          {missing ? `${selected.length} de ${MIN_INTERESTS} escolhidos` : `${selected.length} escolhidos. Boa!`}
        </p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="onboarding__actions">
          <a className="btn btn--lilac" href="#/cadastro">Voltar</a>
          <button className="btn btn--gradient" type="submit" aria-disabled={Boolean(missing)}>
            Continuar {Icon.arrowRight}
          </button>
        </div>
      </form>
    </main>
  );
}
