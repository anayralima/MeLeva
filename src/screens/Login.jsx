import { useState } from "react";
import { Icon } from "../icons.jsx";
import { useStore } from "../store.jsx";
import { attemptLogin, isValidEmail, LOGIN_MAX_ATTEMPTS } from "../services/rules.js";
import { DEMO_ACCOUNT } from "../services/seed.js";
import { link } from "../components/ui.jsx";

/** Painel lateral com foto, usado em Login e Recuperar senha. */
export function AuthVisual() {
  return (
    <aside className="auth__visual">
      <img className="auth__photo" src="/assets/landing/hero-small.webp" alt="" />
      <div className="auth__overlay" />

      <a className="auth__logo" href="#/">
        Me Leva
      </a>

      <div className="auth__message">
        <h2>Volte para o movimento.</h2>
        <p>Suas próximas atividades — e as pessoas que vão com você — estão esperando.</p>

        <div className="auth__pill">
          <div className="auth__pill-avatars">
            {[9, 10, 1].map((n) => (
              <img key={n} src={`/assets/landing/avatar-${n}.webp`} alt="" />
            ))}
          </div>
          <span>Sábado tem corrida no Parque • 3 vagas</span>
        </div>
      </div>
    </aside>
  );
}

/** Tela 02 — Login, com a variante 02c (erro e bloqueio após 5 tentativas). */
export default function Login({ next = "home" }) {
  const { state, run, toast } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  function finish() {
    toast(`Que bom te ver, ${state.users.me.firstName}!`);
    window.location.hash = `#/${next}`;
  }

  function submit(event) {
    event.preventDefault();
    if (!isValidEmail(email)) return setError({ field: "email", text: "Digite um e-mail válido." });
    if (!password) return setError({ field: "password", text: "Digite sua senha." });

    const output = run(attemptLogin, email, password);
    if (output.result === "ok") return finish();
    if (output.result === "locked") {
      return setError({
        field: "password",
        text: `Muitas tentativas. Por segurança, sua conta está bloqueada por ${output.minutes} min. Use "Esqueci minha senha" para entrar agora.`,
        locked: true,
      });
    }
    setError({
      field: "password",
      text: `Senha incorreta. Você tem mais ${output.remaining} ${output.remaining === 1 ? "tentativa" : "tentativas"} antes do bloqueio de 15 min.`,
    });
  }

  function demo() {
    setEmail(DEMO_ACCOUNT.email);
    setPassword(DEMO_ACCOUNT.password);
    const output = run(attemptLogin, DEMO_ACCOUNT.email, DEMO_ACCOUNT.password);
    if (output.result === "ok") finish();
    else setError({ field: "password", text: "Conta bloqueada por excesso de tentativas. Aguarde ou recupere a senha.", locked: true });
  }

  const hasError = (field) => error?.field === field;

  return (
    <div className="auth">
      <AuthVisual />

      <main className="auth__main">
        <form className="auth__form" onSubmit={submit} noValidate>
          <a className="logo auth__mobile-logo" href="#/">
            Me <span>Leva</span>
          </a>
          <div className="auth__intro">
            <h1>Que bom te ver de novo!</h1>
            <p>Entre na sua conta Me Leva.</p>
          </div>

          {error && (
            <div className={error.locked ? "alert alert--danger" : "alert alert--warning"} role="alert">
              {Icon.alert}
              <span>{error.text}</span>
            </div>
          )}

          <label className="field">
            <span>E-mail</span>
            <span className={hasError("email") ? "field__box field__box--error" : "field__box"}>
              <span className="field__icon">{Icon.mail}</span>
              <input
                type="email"
                placeholder="seuemail@exemplo.com"
                autoComplete="email"
                value={email}
                aria-invalid={hasError("email")}
                onChange={(e) => setEmail(e.target.value)}
              />
            </span>
          </label>

          <label className="field">
            <span>Senha</span>
            <span className={hasError("password") ? "field__box field__box--error" : "field__box"}>
              <span className="field__icon">{Icon.lock}</span>
              <input
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                aria-invalid={hasError("password")}
                onChange={(e) => setPassword(e.target.value)}
              />
            </span>
          </label>

          <div className="auth__row">
            <label className="remember">
              <input type="checkbox" defaultChecked />
              Lembrar de mim
            </label>
            <a className="auth__link" href={link("recuperar-senha")}>
              Esqueci minha senha
            </a>
          </div>

          <button className="btn btn--gradient-reverse btn--block" type="submit">
            Entrar
          </button>

          <div className="divider">
            <span />
            ou
            <span />
          </div>

          <button className="btn btn--lilac btn--block" type="button" onClick={demo}>
            Continuar com Google
          </button>

          <div className="demo-box">
            <strong>Conta de demonstração</strong>
            <span>
              {DEMO_ACCOUNT.email} • {DEMO_ACCOUNT.password}
            </span>
            <button className="btn btn--ghost btn--sm" type="button" onClick={demo}>
              Entrar como Mariana
            </button>
          </div>

          <p className="auth__foot">
            Ainda não tem conta?{" "}
            <a className="auth__link" href={link("cadastro")}>
              Criar conta
            </a>
          </p>
          <p className="sr-only">Após {LOGIN_MAX_ATTEMPTS} tentativas erradas, o acesso fica bloqueado por 15 minutos.</p>
        </form>
      </main>
    </div>
  );
}
