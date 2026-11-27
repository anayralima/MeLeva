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
    <main className="py-8 px-4 grid min-h-screen place-items-center [background:radial-gradient(circle_at_15%_10%,#fbe1f0,transparent_40%),radial-gradient(circle_at_90%_90%,#f1eaf8,transparent_40%),var(--fundo-pagina)]">
      <form className="p-8 flex flex-col gap-4.5 rounded-[28px] bg-superficie shadow-[var(--sombra-card)] w-[min(920px,100%)] max-md:py-5.5 max-md:px-4.5 [&_h1]:text-[30px] [&_h1]:font-extrabold [&_h1]:tracking-[-0.6px] max-md:[&_h1]:text-[24px]" onSubmit={submit} noValidate>
        <Steps current={3} />
        <h1>Agora, um pouco sobre você</h1>
        <p className="text-[15px] text-secundario">Assim as pessoas sabem com quem vão treinar. Você controla o que fica público.</p>
        <div className="grid grid-cols-[minmax(0,1fr)_280px] gap-6 items-start max-xl:grid-cols-[1fr]">
          <ProfileForm form={form} setForm={setForm} errors={errors} />
          <ProfilePreview form={form} name={me.name} />
        </div>
        <div className="flex justify-between gap-2.5">
          <a className="btn btn--lilac" href="#/interesses">Voltar</a>
          <button className="btn btn--gradient" type="submit">
            Concluir {Icon.check}
          </button>
        </div>
      </form>
    </main>
  );
}
