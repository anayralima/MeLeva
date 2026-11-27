/** @file Campos de perfil compartilhados por Perfil inicial (05) e Editar perfil (14). */
import { Icon } from "../icons.jsx";
import { Segmented } from "./ui.jsx";
import { SPORTS } from "../services/rules.js";

export const AVATARS = [8, 5, 3, 2, 6, 10, 1, 4, 7, 9].map((n) => `/assets/landing/avatar-${n}.webp`);
export const PROFILE_LEVELS = ["Iniciante", "Intermediária", "Avançada"];
export const AVAILABILITY = ["Manhã", "Tarde", "Noite", "Fim de semana"];

export function validateProfile(form) {
  const errors = {};
  const age = Number(form.age);
  if (!(age >= 18 && age <= 99)) errors.age = "O Me Leva é para maiores de 18 anos.";
  if (!form.level) errors.level = "Escolha seu nível.";
  if (!form.availability?.length) errors.availability = "Escolha pelo menos um horário.";
  if ((form.bio ?? "").length > 160) errors.bio = "Use até 160 caracteres.";
  return errors;
}

function toggleIn(list, value) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function ProfileForm({ form, setForm, errors = {}, withSports = false }) {
  const set = (key, value) => setForm({ ...form, [key]: value });
  return (
    <div className="form-stack">
      <fieldset className="avatar-pick">
        <legend>Foto</legend>
        <div className="avatar-pick__list">
          {AVATARS.map((src, index) => (
            <label key={src} className={form.avatar === src ? "avatar-pick__item is-active" : "avatar-pick__item"}>
              <input type="radio" name="avatar" checked={form.avatar === src} onChange={() => set("avatar", src)} />
              <img src={src} alt={`Foto ${index + 1}`} />
            </label>
          ))}
        </div>
        <small className="hint">{Icon.camera} No app final, você envia uma foto sua. Aqui, escolha uma das opções.</small>
      </fieldset>

      <div className="form-grid">
        <label className="field">
          <span>Cidade</span>
          <span className="field__box field__box--readonly">
            <span className="field__icon">{Icon.pin}</span>
            <input value="Teresópolis, RJ" readOnly aria-readonly="true" />
          </span>
        </label>
        <label className="field">
          <span>Idade</span>
          <span className={errors.age ? "field__box field__box--error" : "field__box"}>
            <input type="number" min="18" max="99" value={form.age} onChange={(e) => set("age", e.target.value)} aria-invalid={Boolean(errors.age)} />
          </span>
          {errors.age && <small className="form-error">{errors.age}</small>}
        </label>
      </div>

      <fieldset>
        <legend className="label">Nível</legend>
        <Segmented
          label="Nível"
          options={PROFILE_LEVELS.map((level) => ({ id: level, label: level }))}
          value={form.level}
          onChange={(level) => set("level", level)}
        />
        {errors.level && <small className="form-error">{errors.level}</small>}
      </fieldset>

      <fieldset>
        <legend className="label">Disponibilidade</legend>
        <div className="chips chips--wrap">
          {AVAILABILITY.map((slot) => {
            const on = form.availability.includes(slot);
            return (
              <button key={slot} type="button" aria-pressed={on} className={on ? "chip chip--active" : "chip"} onClick={() => set("availability", toggleIn(form.availability, slot))}>
                {slot}
              </button>
            );
          })}
        </div>
        {errors.availability && <small className="form-error">{errors.availability}</small>}
      </fieldset>

      {withSports && (
        <fieldset>
          <legend className="label">Esportes (mínimo 3)</legend>
          <div className="chips chips--wrap">
            {SPORTS.map((sport) => {
              const on = form.sports.includes(sport);
              return (
                <button key={sport} type="button" aria-pressed={on} className={on ? "chip chip--active" : "chip"} onClick={() => set("sports", toggleIn(form.sports, sport))}>
                  {sport}
                </button>
              );
            })}
          </div>
          {errors.sports && <small className="form-error">{errors.sports}</small>}
        </fieldset>
      )}

      <label className="field">
        <span>Bio</span>
        <textarea className="textarea" rows={3} maxLength={200} placeholder="Conte em uma frase como você gosta de treinar." value={form.bio} onChange={(e) => set("bio", e.target.value)} />
        <small className={form.bio.length > 160 ? "form-error" : "hint"}>{form.bio.length}/160</small>
      </label>
    </div>
  );
}

export function ProfilePreview({ form, name }) {
  return (
    <div className="profile-preview">
      <span className="label">Prévia do seu perfil</span>
      <img src={form.avatar} alt="" />
      <strong>{name}</strong>
      <span className="profile-preview__meta">
        Teresópolis, RJ{form.age ? ` • ${form.age} anos` : ""}
      </span>
      {form.level && <span className="tag tag--blue">{form.level}</span>}
      <p>{form.bio || "Sua bio aparece aqui."}</p>
      <div className="chips chips--wrap chips--center">
        {(form.sports ?? []).slice(0, 4).map((s) => (
          <span key={s} className="tag tag--lilac">{s}</span>
        ))}
      </div>
    </div>
  );
}
