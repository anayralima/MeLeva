import { useState } from "react";
import AppShell from "../components/AppShell.jsx";
import { EmptyState, go, link } from "../components/ui.jsx";
import { Icon } from "../icons.jsx";
import { useStore } from "../store.jsx";
import { canRate, findActivity, rateActivity } from "../services/rules.js";
import { shortDate } from "../utils/format.js";

const TAGS = ["Pontual", "Bem organizada", "Galera animada", "Lugar bonito", "Ritmo certo", "Segura"];
const LABELS = ["", "Ruim", "Fraca", "Ok", "Boa", "Excelente!"];

/** Tela 20 — Avaliar atividade (RF30, RN10, RN12). */
export default function RateActivity({ param }) {
  const { state, run, toast, openModal } = useStore();
  const activity = findActivity(state, param);
  const [stars, setStars] = useState(0);
  const [tags, setTags] = useState([]);
  const [asDescribed, setAsDescribed] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  if (!activity || !canRate(state, activity)) {
    return (
      <AppShell active="minhas">
        <EmptyState
          icon={Icon.star}
          title={activity && state.ratings[activity.id] ? "Você já avaliou essa atividade" : "Avaliação indisponível"}
          text="Só quem participou pode avaliar, e só depois que a atividade acontece."
        >
          <a className="btn btn--gradient" href={link("minhas?aba=historico")}>Ver histórico</a>
        </EmptyState>
      </AppShell>
    );
  }

  function submit(event) {
    event.preventDefault();
    if (!stars) return setError("Escolha de 1 a 5 estrelas.");
    run(rateActivity, activity.id, { stars, tags, asDescribed, comment });
    toast("Avaliação enviada");
    go("minhas?aba=historico");
  }

  return (
    <AppShell active="minhas">
      <form className="rate card" onSubmit={submit}>
        <header className="rate__head">
          <img src={activity.image} alt="" />
          <div>
            <small className="muted">{shortDate(activity.start)}</small>
            <h1>Como foi {activity.title}?</h1>
            <p>Sua avaliação é da atividade e ajuda outras pessoas a escolher.</p>
          </div>
        </header>

        <fieldset className="rate__stars">
          <legend className="label">Sua nota</legend>
          <div role="radiogroup" aria-label="Nota de 1 a 5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" role="radio" aria-checked={stars === n} aria-label={`${n} estrela${n > 1 ? "s" : ""}`} className={n <= stars ? "star is-on" : "star"} onClick={() => { setStars(n); setError(""); }}>
                {Icon.star}
              </button>
            ))}
            <span className="rate__label">{LABELS[stars]}</span>
          </div>
        </fieldset>

        <fieldset>
          <legend className="label">O que foi legal?</legend>
          <div className="chips chips--wrap">
            {TAGS.map((tag) => {
              const on = tags.includes(tag);
              return (
                <button key={tag} type="button" aria-pressed={on} className={on ? "chip chip--active" : "chip"} onClick={() => setTags(on ? tags.filter((t) => t !== tag) : [...tags, tag])}>
                  {tag}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="label">Foi como o descrito?</legend>
          <div className="segmented">
            {[["yes", "Sim"], ["partly", "Mais ou menos"], ["no", "Não"]].map(([id, label]) => (
              <button key={id} type="button" aria-pressed={asDescribed === id} className={asDescribed === id ? "is-active" : ""} onClick={() => setAsDescribed(id)}>
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="field">
          <span>Comentário (opcional)</span>
          <textarea className="textarea" rows={3} maxLength={300} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Conte como foi" />
        </label>

        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="rate__foot">
          <div className="safety__links">
            <button className="text-btn" type="button" onClick={() => openModal("reportar", { activityId: activity.id })}>{Icon.alert} Reportar a atividade</button>
            <button className="text-btn" type="button" onClick={() => openModal("denunciar", { activityId: activity.id })}>{Icon.flag} Problema com uma pessoa? Denunciar</button>
          </div>
          <button className="btn btn--gradient" type="submit">Enviar avaliação</button>
        </div>
      </form>
    </AppShell>
  );
}
