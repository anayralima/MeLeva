import { useState } from "react";
import { Icon } from "../icons.jsx";
import { useStore } from "../store.jsx";
import ProfileForm, { ProfilePreview, validateProfile } from "../components/ProfileForm.jsx";
import { Steps } from "./Signup.jsx";

/** Tela 05 — Perfil inicial, passo 3 de 3 (RF07). */
export default function InitialProfile() {
  const { me, update, toast } = useStore();
  const [form, setForm] = useState({
    avatar: me.avatar,
    age: me.age ?? "",
    level: me.level ?? "",
    availability: me.availability ?? [],
    bio: me.bio ?? "",
    sports: me.sports ?? [],
  });
  const [errors, setErrors] = useState({});

  function submit(event) {
    event.preventDefault();
    const next = validateProfile(form);
    setErrors(next);
    if (Object.keys(next).length) return;
    update((s) => ({ ...s, users: { ...s.users, me: { ...s.users.me, ...form, age: Number(form.age) } } }));
    toast("Perfil pronto! Bora se movimentar 🎉");
    window.location.hash = "#/home";
  }

  return (
    <main className="onboarding">
      <form className="onboarding__box onboarding__box--wide" onSubmit={submit} noValidate>
        <Steps current={3} />
        <h1>Agora, um pouco sobre você</h1>
        <p className="onboarding__lead">Assim as pessoas sabem com quem vão treinar. Você controla o que fica público.</p>
        <div className="onboarding__split">
          <ProfileForm form={form} setForm={setForm} errors={errors} />
          <ProfilePreview form={form} name={me.name} />
        </div>
        <div className="onboarding__actions">
          <a className="btn btn--lilac" href="#/interesses">Voltar</a>
          <button className="btn btn--gradient" type="submit">
            Concluir {Icon.check}
          </button>
        </div>
      </form>
    </main>
  );
}
