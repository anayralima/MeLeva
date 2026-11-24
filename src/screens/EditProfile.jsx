import { useState } from "react";
import AppShell from "../components/AppShell.jsx";
import ProfileForm, { validateProfile } from "../components/ProfileForm.jsx";
import { go, link, PageHead, Toggle } from "../components/ui.jsx";
import { Icon } from "../icons.jsx";
import { useStore } from "../store.jsx";
import { MIN_INTERESTS } from "../services/rules.js";

/** Tela 14 — Editar perfil, privacidade, contato de confiança e conta (RF08, LGPD). */
export default function EditProfile() {
  const { state, me, update, toast, openModal, reset, user } = useStore();
  const [form, setForm] = useState({
    avatar: me.avatar,
    age: me.age,
    level: me.level,
    availability: me.availability,
    bio: me.bio,
    sports: me.sports,
  });
  const [privacy, setPrivacy] = useState({ showAge: me.showAge !== false });
  const [trust, setTrust] = useState(state.trustContact);
  const [errors, setErrors] = useState({});

  function save(event) {
    event.preventDefault();
    const next = validateProfile(form);
    if (form.sports.length < MIN_INTERESTS) next.sports = `Escolha pelo menos ${MIN_INTERESTS} esportes.`;
    setErrors(next);
    if (Object.keys(next).length) return toast("Confira os campos destacados", "error");
    update((s) => ({
      ...s,
      trustContact: trust,
      users: { ...s.users, me: { ...s.users.me, ...form, age: Number(form.age), showAge: privacy.showAge } },
    }));
    toast("Perfil atualizado");
    go("perfil");
  }

  function logout() {
    update({ session: null });
    toast("Você saiu da sua conta");
    go("");
  }

  return (
    <AppShell active="perfil">
      <form onSubmit={save} noValidate>
        <PageHead title="Editar perfil" subtitle="Você controla o que fica público.">
          <a className="btn btn--lilac" href={link("perfil")}>Cancelar</a>
          <button className="btn btn--gradient" type="submit">{Icon.check} Salvar</button>
        </PageHead>

        <div className="edit">
          <div className="card">
            <ProfileForm form={form} setForm={setForm} errors={errors} withSports />
          </div>

          <aside className="edit__side">
            <section className="card">
              <h2 className="h3">Privacidade</h2>
              <div className="switch-row">
                <span><strong>Mostrar minha idade</strong><small>Aparece no seu perfil público</small></span>
                <Toggle checked={privacy.showAge} onChange={(v) => setPrivacy({ ...privacy, showAge: v })} label="Mostrar minha idade" />
              </div>
              <div className="switch-row">
                <span><strong>Mensagens diretas</strong><small>Só de pessoas conectadas (padrão de segurança)</small></span>
                <Toggle checked onChange={() => toast("Por segurança, mensagens diretas são só entre conexões")} label="Mensagens diretas só de conexões" />
              </div>
              <p className="hint">{Icon.lock} Sua localização exata nunca aparece para outras pessoas.</p>
            </section>

            <section className="card">
              <h2 className="h3">Contato de confiança</h2>
              <div className="form-grid">
                <label className="field">
                  <span>Nome</span>
                  <span className="field__box"><input value={trust.name} onChange={(e) => setTrust({ ...trust, name: e.target.value })} /></span>
                </label>
                <label className="field">
                  <span>Celular</span>
                  <span className="field__box"><input type="tel" value={trust.phone} onChange={(e) => setTrust({ ...trust, phone: e.target.value })} /></span>
                </label>
              </div>
              <div className="switch-row">
                <span><strong>Avisar automaticamente</strong><small>Envia sua localização durante cada atividade</small></span>
                <Toggle checked={trust.enabled} onChange={(v) => setTrust({ ...trust, enabled: v })} label="Avisar contato de confiança automaticamente" />
              </div>
            </section>

            {state.blocked.length > 0 && (
              <section className="card">
                <h2 className="h3">Pessoas bloqueadas</h2>
                <ul className="who">
                  {state.blocked.map((id) => (
                    <li key={id}>
                      <img src={user(id).avatar} alt="" />
                      <span><strong>{user(id).name}</strong></span>
                      <button
                        className="link"
                        type="button"
                        onClick={() => {
                          update((s) => ({ ...s, blocked: s.blocked.filter((b) => b !== id) }));
                          toast(`${user(id).firstName} foi desbloqueado(a)`);
                        }}
                      >
                        Desbloquear
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="card">
              <h2 className="h3">Conta</h2>
              <div className="account-actions">
                <button className="btn btn--lilac btn--block" type="button" onClick={() => openModal("termos")}>{Icon.shield} Termos e privacidade</button>
                <button className="btn btn--lilac btn--block" type="button" onClick={logout}>{Icon.logout} Sair da conta</button>
                <button
                  className="btn btn--ghost btn--block"
                  type="button"
                  onClick={() =>
                    openModal("confirmar", {
                      title: "Restaurar dados da demonstração?",
                      text: "Tudo o que você fez nesta demo (presenças, atividades criadas, mensagens) volta ao estado inicial.",
                      confirmLabel: "Restaurar",
                      onConfirm: () => {
                        reset();
                        toast("Demo restaurada");
                        go("");
                      },
                    })
                  }
                >
                  Restaurar demonstração
                </button>
                <button
                  className="text-btn text-btn--danger"
                  type="button"
                  onClick={() =>
                    openModal("confirmar", {
                      title: "Excluir conta e dados?",
                      text: "Pela LGPD, você pode apagar sua conta e seus dados a qualquer momento. Na demo, isso restaura os dados iniciais.",
                      confirmLabel: "Excluir",
                      onConfirm: () => {
                        reset();
                        toast("Conta e dados excluídos");
                        go("");
                      },
                    })
                  }
                >
                  {Icon.trash} Excluir minha conta
                </button>
              </div>
            </section>
          </aside>
        </div>
      </form>
    </AppShell>
  );
}
