import { useState } from "react";
import { Icon } from "../icons.jsx";
import { useStore } from "../store.jsx";
import { isValidEmail } from "../services/rules.js";
import { link } from "../components/ui.jsx";
import { AuthVisual } from "./Login.jsx";

/** Tela 02b — Recuperar senha (RF03). */
export default function RecoverPassword() {
  const { toast, update } = useStore();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  function submit(event) {
    event.preventDefault();
    if (!isValidEmail(email)) return setError("Digite um e-mail válido.");
    setError("");
    setSent(true);
    update({ auth: { attempts: 0, lockedUntil: null } });
    toast("Link enviado pro e-mail");
  }

  return (
    <div className="auth">
      <AuthVisual />
      <main className="auth__main">
        <form className="auth__form" onSubmit={submit} noValidate>
          <a className="auth__link back-link" href={link("login")}>
            {Icon.arrowLeft} Voltar para o login
          </a>
          <div className="auth__intro">
            <h1>Esqueceu a senha?</h1>
            <p>Sem problema. Digite seu e-mail e enviamos um link para criar uma nova.</p>
          </div>

          {sent ? (
            <div className="alert alert--success" role="status">
              {Icon.mailOpen}
              <span>
                Pronto! Se <strong>{email}</strong> tiver conta no Me Leva, o link chega em alguns minutos. Confira também o spam.
              </span>
            </div>
          ) : (
            <label className="field">
              <span>E-mail</span>
              <span className={error ? "field__box field__box--error" : "field__box"}>
                <span className="field__icon">{Icon.mail}</span>
                <input type="email" placeholder="seuemail@exemplo.com" value={email} aria-invalid={Boolean(error)} onChange={(e) => setEmail(e.target.value)} />
              </span>
              {error && <small className="form-error" role="alert">{error}</small>}
            </label>
          )}

          {sent ? (
            <a className="btn btn--gradient-reverse btn--block" href={link("login")}>
              Voltar para o login
            </a>
          ) : (
            <button className="btn btn--gradient-reverse btn--block" type="submit">
              Enviar link
            </button>
          )}
        </form>
      </main>
    </div>
  );
}
