import { useState } from "react";
import AppShell from "../components/AppShell.jsx";
import { EmptyState, go, link, Segmented } from "../components/ui.jsx";
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
      <form className="card my-0 mx-auto max-w-190 gap-5.5" onSubmit={submit}>
        <header className="flex items-center gap-4 max-md:flex-col max-md:items-start [&_img]:size-24 [&_img]:rounded-[16px] [&_img]:object-cover [&_h1]:text-[24px] [&_h1]:font-extrabold [&_p]:text-[14px] [&_p]:text-secundario">
          <img src={activity.image} alt="" />
          <div>
            <small className="text-secundario [&_svg]:size-4 [&_svg]:shrink-0 [.profile-head-info_&]:flex [.profile-head-info_&]:flex-wrap [.profile-head-info_&]:items-center [.profile-head-info_&]:gap-1 [.profile-head-info_&]:text-[13px]">{shortDate(activity.start)}</small>
            <h1>Como foi {activity.title}?</h1>
            <p>Sua avaliação é da atividade e ajuda outras pessoas a escolher.</p>
          </div>
        </header>

        <fieldset className="[&>div]:flex [&>div]:items-center [&>div]:gap-1.5">
          <legend className="label">Sua nota</legend>
          <div role="radiogroup" aria-label="Nota de 1 a 5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" role="radio" aria-checked={stars === n} aria-label={`${n} estrela${n > 1 ? "s" : ""}`} className={n <= stars ? "p-1.5 border-0 size-11 bg-transparent cursor-pointer text-[#f5b301] [&_svg_path]:[fill:currentColor]" : "p-1.5 border-0 size-11 bg-transparent text-[#d9d3e6] cursor-pointer"} onClick={() => { setStars(n); setError(""); }}>
                {Icon.star}
              </button>
            ))}
            <span className="ml-2 font-bold text-rosa-texto">{LABELS[stars]}</span>
          </div>
        </fieldset>

        <fieldset>
          <legend className="label">O que foi legal?</legend>
          <div className="flex gap-2 flex-wrap">
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
          <Segmented
            label="Foi como o descrito?"
            options={[
              { id: "yes", label: "Sim" },
              { id: "partly", label: "Mais ou menos" },
              { id: "no", label: "Não" },
            ]}
            value={asDescribed}
            onChange={setAsDescribed}
          />
        </fieldset>

        <label className="field">
          <span>Comentário (opcional)</span>
          <textarea className="textarea" rows={3} maxLength={300} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Conte como foi" />
        </label>

        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="safety-links flex flex-wrap gap-y-2.5 gap-x-6 [&_svg]:size-4 [&_svg]:shrink-0">
            <button className="p-0 border-0 inline-flex items-center gap-1.5 bg-transparent text-[13px] font-semibold text-rosa-texto underline [text-underline-offset:2px] cursor-pointer [&_svg]:size-4 [&_svg]:shrink-0 [.safety-links_&]:text-secundario [.safety-links_&]:no-underline" type="button" onClick={() => openModal("reportar", { activityId: activity.id })}>{Icon.alert} Reportar a atividade</button>
            <button className="p-0 border-0 inline-flex items-center gap-1.5 bg-transparent text-[13px] font-semibold text-rosa-texto underline [text-underline-offset:2px] cursor-pointer [&_svg]:size-4 [&_svg]:shrink-0 [.safety-links_&]:text-secundario [.safety-links_&]:no-underline" type="button" onClick={() => openModal("denunciar", { activityId: activity.id })}>{Icon.flag} Problema com uma pessoa? Denunciar</button>
          </div>
          <button className="btn btn--gradient" type="submit">Enviar avaliação</button>
        </div>
      </form>
    </AppShell>
  );
}
