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
    <div className="flex min-h-screen bg-pagina">
      <AuthVisual />
      <main className="py-12 px-10 grid flex-1 place-items-center max-lg:py-10 max-lg:px-5 max-lg:min-h-screen">
        <form className="flex flex-col gap-5 w-full max-w-110" onSubmit={submit} noValidate>
          <a className="text-rosa-texto font-semibold inline-flex items-center gap-1.5 [&_svg]:size-4 [&_svg]:shrink-0" href={link("login")}>
            {Icon.arrowLeft} Voltar para o login
          </a>
          <div className="flex flex-col gap-2 mb-2 [&_h1]:text-[34px] [&_h1]:leading-[1.1] [&_h1]:tracking-[-0.68px] [&_h1]:font-bold [&_p]:text-[16px] [&_p]:text-secundario">
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
              <span className={error ? "field-box field-box--error" : "field-box"}>
                <span className="field-icon">{Icon.mail}</span>
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
