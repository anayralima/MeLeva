import { useState } from "react";
import { Icon } from "../icons.jsx";
import { useStore } from "../store.jsx";
import { attemptLogin, isValidEmail, LOGIN_MAX_ATTEMPTS } from "../services/rules.js";
import { DEMO_ACCOUNT } from "../services/seed.js";
import { link } from "../components/ui.jsx";

/** Painel lateral com foto, usado em Login e Recuperar senha. */
export function AuthVisual() {
  return (
    <aside className="relative shrink-0 w-[40.44%] min-h-screen overflow-hidden bg-lilas max-xl:w-[44%] max-lg:hidden">
      <img className="absolute inset-0 size-full object-cover" src="/assets/landing/hero-small.webp" alt="" />
      <div className="absolute inset-0 [background:linear-gradient(_180deg,rgba(49,16,78,0.35)_0%,rgba(128,48,115,0.25)_50%,rgba(49,16,78,0.92)_100%_)]" />

      <a className="absolute left-14 top-12 z-1 text-white text-[30px] font-bold tracking-[-0.6px] max-xl:left-8" href="#/">
        Me Leva
      </a>

      <div className="absolute left-14 right-10 bottom-8 z-1 flex flex-col items-start gap-4 text-white max-xl:left-8 max-xl:right-6 [&_h2]:max-w-140 [&_h2]:text-[length:clamp(36px,3.25vw,52px)] [&_h2]:leading-[1.05] [&_h2]:tracking-[-1.04px] [&_h2]:font-bold [&_p]:max-w-125 [&_p]:text-[18px] [&_p]:text-[rgba(255,255,255,0.85)] max-xl:[&_p]:text-[16px]">
        <h2>Volte para o movimento.</h2>
        <p>Suas próximas atividades — e as pessoas que vão com você — estão esperando.</p>

        <div className="py-3 pr-4.5 pl-3.5 border border-[rgba(255,255,255,0.3)] flex items-center gap-3 rounded-[18px] bg-[rgba(255,255,255,0.14)] text-[14px] font-semibold">
          <div className="flex [&_img]:border-2 [&_img]:border-white [&_img]:size-7.5 [&_img]:rounded-full [&_img]:object-cover [&_img+img]:-ml-2.5">
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
    <div className="flex min-h-screen bg-pagina">
      <AuthVisual />

      <main className="py-12 px-10 grid flex-1 place-items-center max-lg:py-10 max-lg:px-5 max-lg:min-h-screen">
        <form className="flex flex-col gap-5 w-full max-w-110" onSubmit={submit} noValidate>
          <a className="text-[26px] font-extrabold tracking-[-0.8px] hidden max-md:block [&_span]:text-rosa" href="#/">
            Me <span>Leva</span>
          </a>
          <div className="flex flex-col gap-2 mb-2 [&_h1]:text-[34px] [&_h1]:leading-[1.1] [&_h1]:tracking-[-0.68px] [&_h1]:font-bold [&_p]:text-[16px] [&_p]:text-secundario">
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
            <span className={hasError("email") ? "field-box field-box--error" : "field-box"}>
              <span className="field-icon">{Icon.mail}</span>
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
            <span className={hasError("password") ? "field-box field-box--error" : "field-box"}>
              <span className="field-icon">{Icon.lock}</span>
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

          <div className="flex items-center justify-between gap-3 text-[14px] text-secundario">
            <label className="flex items-center gap-2 cursor-pointer [&_input]:m-0 [&_input]:border-[1.5px] [&_input]:border-borda [&_input]:size-4.5 [&_input]:rounded-[5px] [&_input]:bg-superficie [&_input]:appearance-none [&_input]:cursor-pointer [&_input:checked]:border-transparent [&_input:checked]:[background:linear-gradient(135deg,#d4136f_0%,#7b2ad8_100%)]">
              <input type="checkbox" defaultChecked />
              Lembrar de mim
            </label>
            <a className="text-rosa-texto font-semibold" href={link("recuperar-senha")}>
              Esqueci minha senha
            </a>
          </div>

          <button className="btn btn--gradient-reverse btn--block" type="submit">
            Entrar
          </button>

          <div className="p-3.5 border border-dashed border-[#d7c6ef] flex flex-col items-start gap-1.5 rounded-[14px] bg-lilas text-[13px] text-roxo [&_span]:[font-family:ui-monospace,Menlo,monospace] [&_span]:text-[12px] [&_span]:text-principal">
            <strong>Conta de demonstração</strong>
            <span>
              {DEMO_ACCOUNT.email} • {DEMO_ACCOUNT.password}
            </span>
            <button className="btn btn--ghost btn--sm" type="button" onClick={demo}>
              Entrar como Mariana
            </button>
          </div>

          <p className="text-center text-[14px] text-secundario">
            Ainda não tem conta?{" "}
            <a className="text-rosa-texto font-semibold" href={link("cadastro")}>
              Criar conta
            </a>
          </p>
          <p className="sr-only">Após {LOGIN_MAX_ATTEMPTS} tentativas erradas, o acesso fica bloqueado por 15 minutos.</p>
        </form>
      </main>
    </div>
  );
}
