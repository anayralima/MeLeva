import { useState } from "react";
import { Icon } from "../icons.jsx";
import { useStore } from "../store.jsx";
import { isStrongPassword, isValidEmail, passwordChecks } from "../services/rules.js";
import { link } from "../components/ui.jsx";

const benefits = [
  "Atividades perto de casa, no seu horário",
  "Gente do seu nível — do iniciante ao avançado",
  "Grátis pra criar e participar",
];

export function Steps({ current }) {
  return (
    <ol className="steps-bar flex gap-2 list-none [&_li]:flex [&_li]:flex-1 [&_li]:flex-col [&_li]:gap-1.5 [&_li]:text-[12px] [&_li]:font-semibold [&_li]:text-secundario [&_li_span]:block [&_li_span]:h-1.25 [&_li_span]:overflow-hidden [&_li_span]:rounded-full [&_li_span]:bg-borda [&_li_span]:text-transparent [&_li_span]:text-[length:0]" aria-label={`Passo ${current} de 3`}>
      {["Conta", "Interesses", "Perfil"].map((label, index) => (
        <li key={label} className={index + 1 <= current ? "[.steps-bar_&]:text-rosa-texto [.steps-bar_&]:[&_span]:[background:var(--gradiente-marca)]" : ""} aria-current={index + 1 === current ? "step" : undefined}>
          <span>{index + 1}</span>
          {label}
        </li>
      ))}
    </ol>
  );
}

/** Tela 03 — Cadastro, passo 1 de 3 (RF01). */
export default function Signup() {
  const { state, update, openModal, toast } = useStore();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", terms: false });
  const [errors, setErrors] = useState({});
  const checks = passwordChecks(form.password);
  const set = (key) => (event) => setForm({ ...form, [key]: event.target.type === "checkbox" ? event.target.checked : event.target.value });

  function submit(event) {
    event.preventDefault();
    const next = {};
    if (form.name.trim().split(/\s+/).length < 2) next.name = "Digite nome e sobrenome.";
    if (!isValidEmail(form.email)) next.email = "Digite um e-mail válido.";
    else if (state.accounts.some((a) => a.email.toLowerCase() === form.email.trim().toLowerCase())) next.email = "Esse e-mail já tem conta. Que tal entrar?";
    if (!isStrongPassword(form.password)) next.password = "A senha precisa ter 8+ caracteres, número e símbolo.";
    if (form.confirm !== form.password) next.confirm = "As senhas não são iguais.";
    if (!form.terms) next.terms = "Para continuar, aceite os termos de uso.";
    setErrors(next);
    if (Object.keys(next).length) return;

    const name = form.name.trim();
    update((s) => ({
      ...s,
      accounts: [...s.accounts, { email: form.email.trim(), password: form.password, userId: "me" }],
      session: { email: form.email.trim(), at: Date.now() },
      users: { ...s.users, me: { ...s.users.me, name, firstName: name.split(" ")[0], email: form.email.trim() } },
    }));
    toast("Conta criada! Agora, seus esportes");
    window.location.hash = "#/interesses";
  }

  const fieldClass = (key) => (errors[key] ? "field-box field-box--error" : "field-box");

  return (
    <div className="pt-6 pb-12 px-30 flex items-center gap-14 min-h-screen bg-pagina max-2xl:gap-10 max-2xl:pr-16 max-2xl:pl-16 max-xl:py-10 max-xl:px-6 max-xl:justify-center">
      <form className="flex shrink-0 flex-col gap-4.5 w-full max-w-140 min-w-0" onSubmit={submit} noValidate>
        <Steps current={1} />
        <div className="flex flex-col gap-2 mb-2 [&_h1]:leading-[1.1] [&_h1]:font-bold [&_h1]:text-[40px] [&_h1]:tracking-[-0.6px] [&_p]:text-[16px] [&_p]:text-secundario">
          <h1>Crie sua conta</h1>
          <p>Leva menos de 1 minuto. Depois você escolhe seus esportes.</p>
        </div>

        <label className="field">
          <span>Nome completo</span>
          <span className={fieldClass("name")}>
            <span className="field-icon">{Icon.user}</span>
            <input type="text" placeholder="Mariana Souza" autoComplete="name" value={form.name} onChange={set("name")} aria-invalid={Boolean(errors.name)} />
          </span>
          {errors.name && <small className="form-error">{errors.name}</small>}
        </label>

        <label className="field">
          <span>E-mail</span>
          <span className={fieldClass("email")}>
            <span className="field-icon">{Icon.mail}</span>
            <input type="email" placeholder="mariana@unifeso.com.vc" autoComplete="email" value={form.email} onChange={set("email")} aria-invalid={Boolean(errors.email)} />
          </span>
          {errors.email && <small className="form-error">{errors.email}</small>}
        </label>

        <div className="signup-passwords flex gap-4">
          <label className="field">
            <span>Senha</span>
            <span className={fieldClass("password")}>
              <input type="password" placeholder="••••••••" autoComplete="new-password" value={form.password} onChange={set("password")} aria-invalid={Boolean(errors.password)} />
            </span>
          </label>

          <label className="field">
            <span>Confirmar senha</span>
            <span className={fieldClass("confirm")}>
              <input type="password" placeholder="••••••••" autoComplete="new-password" value={form.confirm} onChange={set("confirm")} aria-invalid={Boolean(errors.confirm)} />
            </span>
            {errors.confirm && <small className="form-error">{errors.confirm}</small>}
          </label>
        </div>

        <ul className="pw-checks flex flex-wrap gap-y-1.5 gap-x-4 list-none text-[12px] font-medium text-secundario [&_svg]:size-4 [&_svg]:shrink-0 [&_li]:flex [&_li]:items-center [&_li]:gap-1 [&_li_svg]:p-0.5 [&_li_svg]:size-3.5 [&_li_svg]:rounded-full [&_li_svg]:bg-borda" aria-label="Regras da senha">
          <li className={checks.length ? "[.pw-checks_&]:text-verde-texto [.pw-checks_&]:[&_svg]:bg-verde" : ""}>{Icon.check} 8+ caracteres</li>
          <li className={checks.number ? "[.pw-checks_&]:text-verde-texto [.pw-checks_&]:[&_svg]:bg-verde" : ""}>{Icon.check} um número</li>
          <li className={checks.symbol ? "[.pw-checks_&]:text-verde-texto [.pw-checks_&]:[&_svg]:bg-verde" : ""}>{Icon.check} um símbolo</li>
        </ul>
        {errors.password && <small className="form-error">{errors.password}</small>}

        <label className="flex items-center gap-2.5 text-[14px] text-secundario [&_a]:text-rosa-texto [&_input]:m-0 [&_input]:border-[1.5px] [&_input]:border-borda [&_input]:relative [&_input]:shrink-0 [&_input]:size-5 [&_input]:rounded-[6px] [&_input]:bg-superficie [&_input]:appearance-none [&_input]:cursor-pointer [&_input:checked]:border-transparent [&_input:checked]:[background:linear-gradient(135deg,#d4136f_0%,#7b2ad8_100%)] [&_input:checked::after]:border-white [&_input:checked::after]:absolute [&_input:checked::after]:top-0.75 [&_input:checked::after]:left-1.75 [&_input:checked::after]:w-1 [&_input:checked::after]:h-2.25 [&_input:checked::after]:border-t-0 [&_input:checked::after]:border-r-2 [&_input:checked::after]:border-b-2 [&_input:checked::after]:border-l-0 [&_input:checked::after]:[transform:rotate(45deg)]">
          <input type="checkbox" checked={form.terms} onChange={set("terms")} />
          <span>
            Li e concordo com os{" "}
            <button type="button" className="p-0 border-0 inline-flex items-center gap-1.5 bg-transparent text-[13px] font-semibold text-rosa-texto underline [text-underline-offset:2px] cursor-pointer [&_svg]:size-4 [&_svg]:shrink-0 [.safety-links_&]:text-secundario [.safety-links_&]:no-underline" onClick={() => openModal("termos")}>
              Termos de uso
            </button>{" "}
            e a{" "}
            <button type="button" className="p-0 border-0 inline-flex items-center gap-1.5 bg-transparent text-[13px] font-semibold text-rosa-texto underline [text-underline-offset:2px] cursor-pointer [&_svg]:size-4 [&_svg]:shrink-0 [.safety-links_&]:text-secundario [.safety-links_&]:no-underline" onClick={() => openModal("termos")}>
              Política de privacidade
            </button>
            .
          </span>
        </label>
        {errors.terms && <small className="form-error">{errors.terms}</small>}

        <button className="btn btn--gradient-reverse btn--block" type="submit">
          Continuar
          {Icon.arrowRight}
        </button>

        <p className="text-center text-[14px] text-secundario">
          Já tem conta?{" "}
          <a className="text-rosa-texto font-semibold" href={link("login")}>
            Entrar
          </a>
        </p>
      </form>

      <aside className="relative flex-1 min-w-0 h-200 max-h-[calc(100vh_-_72px)] overflow-hidden rounded-[32px] bg-lilas max-xl:hidden">
        <img className="absolute inset-0 size-full object-cover" src="/assets/app/cadastro-hero.webp" alt="" />
        <div className="absolute inset-0 [background:linear-gradient(_180deg,rgba(49,16,78,0.05)_30%,rgba(49,16,78,0.9)_100%_)]" />

        <div className="pt-0 pb-10 px-10 absolute right-0 bottom-0 left-0 flex flex-col gap-4.5 text-white [&_h2]:max-w-130 [&_h2]:text-[32px] [&_h2]:leading-[1.1] [&_h2]:tracking-[-0.48px] [&_h2]:font-bold [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-4.5 [&_ul]:list-none">
          <h2>Seu próximo time está a um cadastro de distância.</h2>
          <ul>
            {benefits.map((benefit) => (
              <li className="flex items-center gap-3 text-[16px] font-medium" key={benefit}>
                <span className="flex shrink-0 items-center justify-center size-6.5 rounded-full bg-[rgba(255,255,255,0.2)] [&_svg]:size-3.75">{Icon.check}</span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
