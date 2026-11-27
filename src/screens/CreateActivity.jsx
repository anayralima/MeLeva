import { useState } from "react";
import AppShell from "../components/AppShell.jsx";
import { ActivityCard, go, PageHead, Segmented } from "../components/ui.jsx";
import { Icon } from "../icons.jsx";
import { useStore } from "../store.jsx";
import { findActivity, LEVELS, saveActivity, validateActivity } from "../services/rules.js";
import { inputDate } from "../utils/format.js";

const SPORT_OPTIONS = ["Corrida", "Trilha", "Ciclismo", "Futebol", "Yoga", "Vôlei", "Beach tênis", "Natação", "Funcional"];
const REGIONS = ["Centro", "Alto", "Várzea", "Comary", "Agriões", "Soberbo", "Tijuca", "Granja Guarani"];
const COVERS = [
  "/assets/landing/atividade-corrida.webp",
  "/assets/app/atividade-parque.webp",
  "/assets/landing/atividade-trilha.webp",
  "/assets/app/atividade-pedal.webp",
  "/assets/landing/atividade-yoga.webp",
  "/assets/landing/esporte-futebol.webp",
  "/assets/app/atividade-beach-tenis.webp",
  "/assets/app/atividade-funcional.webp",
];

function emptyForm() {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  return {
    id: null,
    sport: "Corrida",
    title: "",
    date: inputDate(date),
    time: "07:00",
    durationMin: 90,
    region: "Centro",
    address: "",
    level: "Iniciante",
    spots: 6,
    audience: "Todos",
    hasCost: false,
    description: "",
    image: COVERS[0],
    distanceText: "",
  };
}

function fromActivity(activity) {
  const d = new Date(activity.start);
  return {
    id: activity.id,
    sport: activity.sport,
    title: activity.title,
    date: inputDate(d),
    time: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
    durationMin: activity.durationMin,
    region: activity.region,
    address: activity.address,
    level: activity.level,
    spots: activity.spots,
    audience: activity.audience,
    hasCost: false,
    description: activity.description,
    image: activity.image,
    distanceText: activity.stats?.distance === "—" ? "" : activity.stats?.distance ?? "",
  };
}

/** Tela 10 — Criar atividade, com prévia ao vivo e rascunho (RF22, RF23, RF25). */
export default function CreateActivity({ param }) {
  const { state, run, toast, openModal } = useStore();
  const editing = param ? findActivity(state, param) : null;
  const [form, setForm] = useState(() => (editing ? fromActivity(editing) : emptyForm()));
  const [errors, setErrors] = useState({});
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const isPublished = editing?.status === "published";

  const preview = {
    id: "preview",
    sport: form.sport,
    title: form.title || "Título da sua atividade",
    image: form.image,
    start: new Date(`${form.date}T${form.time || "07:00"}`).toISOString(),
    region: form.region,
    distanceKm: 1.2,
    weather: { temp: 22, label: "céu limpo", icon: "sun", rain: 0 },
    participants: editing?.participants ?? ["me"],
    spots: Number(form.spots) || 0,
    level: form.level,
  };

  function publish(event) {
    event.preventDefault();
    const next = validateActivity(form);
    setErrors(next);
    if (Object.keys(next).length) {
      toast("Confira os campos destacados", "error");
      document.querySelector("[aria-invalid='true']")?.focus();
      return;
    }
    const { result } = run(saveActivity, form);
    if (isPublished) {
      toast("Alterações salvas");
      go(`atividade/${result}`);
    } else {
      go(`publicada/${result}`);
    }
  }

  function saveDraft() {
    const { result } = run(saveActivity, form, { draft: true });
    setForm((f) => ({ ...f, id: result }));
    toast("Rascunho salvo");
  }

  function upload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) return toast("Escolha uma foto de até 1,5 MB", "error");
    const reader = new FileReader();
    reader.onload = () => {
      set("image", reader.result);
      toast("Foto atualizada");
    };
    reader.readAsDataURL(file);
  }

  const err = (key) => (errors[key] ? <small className="form-error">{errors[key]}</small> : null);
  const box = (key) => (errors[key] ? "field__box field__box--error" : "field__box");

  return (
    <AppShell active={editing ? "minhas" : "criar"}>
      <form onSubmit={publish} noValidate>
        <PageHead title={isPublished ? "Editar atividade" : "Criar atividade"} subtitle="Preencha o básico e chame a galera pra se movimentar com você.">
          {!isPublished && (
            <button className="btn btn--ghost" type="button" onClick={saveDraft}>
              Salvar rascunho
            </button>
          )}
          <button className="btn btn--gradient" type="submit">
            {Icon.check} {isPublished ? "Salvar alterações" : "Publicar atividade"}
          </button>
        </PageHead>

        <div className="create">
          <div className="card create__form">
            <h2 className="step-title"><span>1</span> O básico</h2>
            <fieldset>
              <legend className="label">Esporte</legend>
              <div className="chips chips--wrap">
                {SPORT_OPTIONS.map((sport) => (
                  <button key={sport} type="button" aria-pressed={form.sport === sport} className={form.sport === sport ? "chip chip--active" : "chip"} onClick={() => set("sport", sport)}>
                    {sport}
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="field">
              <span>Título</span>
              <span className={box("title")}>
                <input value={form.title} maxLength={50} placeholder="Ex.: Corrida no Parque" aria-invalid={Boolean(errors.title)} onChange={(e) => set("title", e.target.value)} />
              </span>
              {err("title")}
            </label>

            <h2 className="step-title"><span>2</span> Quando e onde</h2>
            <div className="form-grid form-grid--3">
              <label className="field">
                <span>Data</span>
                <span className={box("date")}>
                  <input type="date" value={form.date} min={inputDate(new Date())} aria-invalid={Boolean(errors.date)} onChange={(e) => set("date", e.target.value)} />
                </span>
                {err("date")}
              </label>
              <label className="field">
                <span>Horário</span>
                <span className={box("time")}>
                  <input type="time" value={form.time} aria-invalid={Boolean(errors.time)} onChange={(e) => set("time", e.target.value)} />
                </span>
                {err("time")}
              </label>
              <label className="field">
                <span>Duração</span>
                <span className="field__box">
                  <select value={form.durationMin} onChange={(e) => set("durationMin", Number(e.target.value))}>
                    {[30, 45, 60, 90, 120, 180, 240, 360].map((m) => (
                      <option key={m} value={m}>
                        {m < 60 ? `${m} min` : `${Math.floor(m / 60)}h${m % 60 ? m % 60 : ""}`}
                      </option>
                    ))}
                  </select>
                </span>
              </label>
            </div>
            <div className="form-grid">
              <label className="field">
                <span>Bairro (aparece no card)</span>
                <span className="field__box">
                  <select value={form.region} onChange={(e) => set("region", e.target.value)}>
                    {REGIONS.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </span>
              </label>
              <label className="field">
                <span>Distância ou percurso (opcional)</span>
                <span className="field__box">
                  <input value={form.distanceText} placeholder="Ex.: 5 km" onChange={(e) => set("distanceText", e.target.value)} />
                </span>
              </label>
            </div>
            <label className="field">
              <span>Ponto de encontro</span>
              <span className={box("address")}>
                <span className="field__icon">{Icon.mapPin}</span>
                <input value={form.address} placeholder="Ex.: Portão principal do Parque Municipal" aria-invalid={Boolean(errors.address)} onChange={(e) => set("address", e.target.value)} />
              </span>
              {err("address")}
            </label>
            <p className="note-lilac">{Icon.lock} Só quem confirmar presença vê o endereço exato. No card aparece apenas a região ({form.region}).</p>

            <h2 className="step-title"><span>3</span> Quem pode participar</h2>
            <div className="form-grid form-grid--level">
              <fieldset>
                <legend className="label">Nível</legend>
                <Segmented
                  label="Nível"
                  options={LEVELS.map((level) => ({ id: level, label: level === "Todos os níveis" ? "Todos" : level }))}
                  value={form.level}
                  onChange={(level) => set("level", level)}
                />
              </fieldset>
              <div className="field">
                <span>Vagas</span>
                <div className={errors.spots ? "stepper stepper--error" : "stepper"}>
                  <button type="button" aria-label="Menos uma vaga" onClick={() => set("spots", Math.max(2, Number(form.spots) - 1))}>{Icon.minus}</button>
                  <span aria-live="polite">{form.spots} pessoas</span>
                  <button type="button" aria-label="Mais uma vaga" onClick={() => set("spots", Math.min(50, Number(form.spots) + 1))}>{Icon.plus}</button>
                </div>
                {err("spots")}
              </div>
            </div>

            <div className="cost-box">
              <span className="cost-box__icon">{Icon.info}</span>
              <span>
                <strong>Atividades entre pessoas são sempre grátis.</strong>
                <small>
                  Se houver custo (ex.: aluguel de quadra) ou divulgação de marca, avise na descrição.{" "}
                  <button type="button" className="text-btn" onClick={() => openModal("plano")}>Pagas e patrocinadas: plano Organizador (em breve)</button>
                </small>
              </span>
            </div>

            <label className="field">
              <span>Descrição</span>
              <textarea className={errors.description ? "textarea textarea--error" : "textarea"} rows={4} maxLength={600} value={form.description} placeholder="Conte o ritmo, o percurso e o clima da atividade." aria-invalid={Boolean(errors.description)} onChange={(e) => set("description", e.target.value)} />
              {err("description")}
            </label>

            <fieldset>
              <legend className="label">Foto de capa</legend>
              <div className="covers">
                {COVERS.map((src, index) => (
                  <label key={src} className={form.image === src ? "cover is-active" : "cover"}>
                    <input type="radio" name="cover" checked={form.image === src} onChange={() => set("image", src)} />
                    <img src={src} alt={`Capa ${index + 1}`} />
                  </label>
                ))}
                {!COVERS.includes(form.image) && (
                  <span className="cover is-active">
                    <img src={form.image} alt="Sua foto" />
                  </span>
                )}
                <label className="cover cover--upload">
                  <input type="file" accept="image/*" onChange={upload} />
                  {Icon.camera}
                  Enviar foto
                </label>
              </div>
            </fieldset>
          </div>

          <aside className="create__side">
            <p className="label">{Icon.eye} Prévia ao vivo do seu card</p>
            <ActivityCard activity={preview} preview />
            <div className="tips">
              <strong>{Icon.trophy} Dicas pra lotar sua atividade</strong>
              <ul>
                <li>{Icon.check} Use uma foto real do lugar</li>
                <li>{Icon.check} Diga o ritmo ou o nível esperado</li>
                <li>{Icon.check} Marque um ponto de encontro fácil</li>
              </ul>
            </div>
          </aside>
        </div>
      </form>
    </AppShell>
  );
}
