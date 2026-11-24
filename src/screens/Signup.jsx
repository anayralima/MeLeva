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
    <ol className="steps-bar" aria-label={`Passo ${current} de 3`}>
      {["Conta", "Interesses", "Perfil"].map((label, index) => (
        <li key={label} className={index + 1 <= current ? "is-done" : ""} aria-current={index + 1 === current ? "step" : undefined}>
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

  const fieldClass = (key) => (errors[key] ? "field__box field__box--error" : "field__box");

  return (
    <div className="signup">
      <form className="signup__form" onSubmit={submit} noValidate>
        <Steps current={1} />
        <div className="auth__intro signup__intro">
          <h1>Crie sua conta</h1>
          <p>Leva menos de 1 minuto. Depois você escolhe seus esportes.</p>
        </div>

        <label className="field">
          <span>Nome completo</span>
          <span className={fieldClass("name")}>
            <span className="field__icon">{Icon.user}</span>
            <input type="text" placeholder="Mariana Souza" autoComplete="name" value={form.name} onChange={set("name")} aria-invalid={Boolean(errors.name)} />
          </span>
          {errors.name && <small className="form-error">{errors.name}</small>}
        </label>

        <label className="field">
          <span>E-mail</span>
          <span className={fieldClass("email")}>
            <span className="field__icon">{Icon.mail}</span>
            <input type="email" placeholder="mariana@unifeso.com.vc" autoComplete="email" value={form.email} onChange={set("email")} aria-invalid={Boolean(errors.email)} />
          </span>
          {errors.email && <small className="form-error">{errors.email}</small>}
        </label>

        <div className="signup__passwords">
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

        <ul className="pw-checks" aria-label="Regras da senha">
          <li className={checks.length ? "is-ok" : ""}>{Icon.check} 8+ caracteres</li>
          <li className={checks.number ? "is-ok" : ""}>{Icon.check} um número</li>
          <li className={checks.symbol ? "is-ok" : ""}>{Icon.check} um símbolo</li>
        </ul>
        {errors.password && <small className="form-error">{errors.password}</small>}

        <label className="signup__terms">
          <input type="checkbox" checked={form.terms} onChange={set("terms")} />
          <span>
            Li e concordo com os{" "}
            <button type="button" className="text-btn" onClick={() => openModal("termos")}>
              Termos de uso
            </button>{" "}
            e a{" "}
            <button type="button" className="text-btn" onClick={() => openModal("termos")}>
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

        <p className="auth__foot">
          Já tem conta?{" "}
          <a className="auth__link" href={link("login")}>
            Entrar
          </a>
        </p>
      </form>

      <aside className="signup__visual">
        <img className="signup__photo" src="/assets/app/cadastro-hero.webp" alt="" />
        <div className="signup__overlay" />

        <div className="signup__benefits">
          <h2>Seu próximo time está a um cadastro de distância.</h2>
          <ul>
            {benefits.map((benefit) => (
              <li className="signup__benefit" key={benefit}>
                <span className="signup__benefit-icon">{Icon.check}</span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
