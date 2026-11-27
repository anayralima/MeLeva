import AppShell from "../components/AppShell.jsx";
import { AvatarStack, EmptyState, link, Toggle } from "../components/ui.jsx";
import { Icon } from "../icons.jsx";
import { useStore } from "../store.jsx";
import { findActivity, statusOf } from "../services/rules.js";
import { names, shortDate } from "../utils/format.js";
import { downloadIcs } from "./ActivityDetails.jsx";

/** Tela 15 — Participação confirmada (RF18, RF21, RF34). */
export default function Confirmed({ param }) {
  const { state, update, toast, openModal, user } = useStore();
  const activity = findActivity(state, param);

  if (!activity || !["confirmed", "organizer"].includes(statusOf(activity))) {
    return (
      <AppShell active="explorar">
        <EmptyState title="Você ainda não confirmou presença aqui" text="Abra a atividade e toque em “Quero participar”.">
          <a className="btn btn--gradient" href={link(activity ? `atividade/${activity.id}` : "explorar")}>Ver atividade</a>
        </EmptyState>
      </AppShell>
    );
  }

  const others = activity.participants.filter((id) => id !== "me");
  const trust = state.trustContact;

  return (
    <AppShell active="explorar">
      <div className="confirmed">
        <section className="confirmed__card">
          <header className="confirmed__hero" style={{ backgroundImage: `linear-gradient(180deg, rgba(106,43,192,.55), rgba(233,27,122,.65)), url(${activity.image})` }}>
            <span className="confirmed__check">{Icon.check}</span>
            <h1>Você está dentro! 🎉</h1>
            <p>Sua vaga em {activity.title} está garantida.</p>
          </header>

          <div className="confirmed__body">
            <div className="info-boxes">
              <div><span>{Icon.calendar}</span><small>Quando</small><strong>{shortDate(activity.start)}</strong></div>
              <div><span>{Icon.mapPin}</span><small>Onde</small><strong>{activity.address.split("—")[0].trim()}</strong></div>
              <div><span>{Icon.users}</span><small>Quem vai</small><strong>{activity.participants.length} de {activity.spots} pessoas</strong></div>
            </div>

            <a className="crew" href={link(`mensagens/${activity.id}`)}>
              <AvatarStack ids={others} max={4} />
              <span>
                <strong>{names(others.slice(0, 4).map((id) => user(id).firstName))}</strong>
                <small>Diga oi no chat do grupo e combine os detalhes</small>
              </span>
            </a>

            <div className="next-steps">
              <h2 className="h3">Próximos passos</h2>
              <ul className="ticks">
                <li>{Icon.check} Lembrete 1 dia antes e 1 hora antes</li>
                <li>{Icon.check} Chegue 10 min antes no ponto de encontro: {activity.address}</li>
                <li>{Icon.check} Se não puder ir, cancele pra liberar a vaga</li>
              </ul>
              <button className="text-btn text-btn--danger" type="button" onClick={() => openModal("reportar", { activityId: activity.id })}>
                {Icon.alert} Chegou lá e não era o combinado? Reportar a atividade
              </button>
            </div>

            <div className="trust">
              <span className="trust__icon">{Icon.shield}</span>
              <span>
                <strong>Avisar um contato de confiança</strong>
                <small>{trust.name} • recebe sua localização de 1h antes até 1h depois da atividade</small>
              </span>
              <Toggle
                checked={trust.enabled}
                label="Avisar um contato de confiança"
                onChange={(enabled) => {
                  update((s) => ({ ...s, trustContact: { ...s.trustContact, enabled } }));
                  toast(enabled ? `${trust.name} vai receber sua localização de 1h antes até 1h depois da atividade` : "Contato de confiança desligado");
                }}
              />
            </div>

            <div className="confirmed__actions">
              <button className="btn btn--ghost" type="button" onClick={() => { downloadIcs(activity); toast("Adicionado à sua agenda"); }}>
                {Icon.calendar} Adicionar à agenda
              </button>
              <a className="btn btn--lilac" href={link(`mensagens/${activity.id}`)}>
                {Icon.chat} Abrir chat do grupo
              </a>
              <a className="btn btn--gradient" href={link("minhas")}>
                {Icon.arrowRight} Minhas atividades
              </a>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
