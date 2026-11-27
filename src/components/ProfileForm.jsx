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
    <div className="flex flex-col gap-4.5">
      <fieldset className="[&_legend]:text-[13px] [&_legend]:font-semibold">
        <legend>Foto</legend>
        <div className="my-2 mx-0 flex flex-wrap gap-2.5">
          {AVATARS.map((src, index) => (
            <label key={src} className={form.avatar === src ? "is-active border-3 border-rosa relative rounded-full cursor-pointer [&_input]:absolute [&_input]:opacity-0 [&_img]:size-13 [&_img]:rounded-full [&_img]:object-cover focus-within:shadow-[var(--foco)]" : "border-3 border-transparent relative rounded-full cursor-pointer [&_input]:absolute [&_input]:opacity-0 [&_img]:size-13 [&_img]:rounded-full [&_img]:object-cover focus-within:shadow-[var(--foco)]"}>
              <input type="radio" name="avatar" checked={form.avatar === src} onChange={() => set("avatar", src)} />
              <img src={src} alt={`Foto ${index + 1}`} />
            </label>
          ))}
        </div>
        <small className="hint">{Icon.camera} No app final, você envia uma foto sua. Aqui, escolha uma das opções.</small>
      </fieldset>

      <div className="grid grid-cols-[1fr_1fr] gap-4 max-md:grid-cols-[1fr]">
        <label className="field">
          <span>Cidade</span>
          <span className="field-box field-box--readonly">
            <span className="field-icon">{Icon.pin}</span>
            <input value="Teresópolis, RJ" readOnly aria-readonly="true" />
          </span>
        </label>
        <label className="field">
          <span>Idade</span>
          <span className={errors.age ? "field-box field-box--error" : "field-box"}>
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
        <div className="flex gap-2 flex-wrap">
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
          <div className="flex gap-2 flex-wrap">
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
    <div className="p-6 sticky top-4 flex flex-col items-center gap-2 rounded-[20px] bg-pagina text-center max-xl:static [&_img]:size-24 [&_img]:rounded-full [&_img]:object-cover [&_strong]:text-[18px] [&_p]:text-[14px] [&_p]:text-secundario">
      <span className="label">Prévia do seu perfil</span>
      <img src={form.avatar} alt="" />
      <strong>{name}</strong>
      <span className="text-[13px] text-secundario">
        Teresópolis, RJ{form.age ? ` • ${form.age} anos` : ""}
      </span>
      {form.level && <span className="tag tag--blue">{form.level}</span>}
      <p>{form.bio || "Sua bio aparece aqui."}</p>
      <div className="flex gap-2 flex-wrap justify-center">
        {(form.sports ?? []).slice(0, 4).map((s) => (
          <span key={s} className="tag tag--lilac">{s}</span>
        ))}
      </div>
    </div>
  );
}
