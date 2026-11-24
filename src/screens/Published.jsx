import AppShell from "../components/AppShell.jsx";
import { ActivityCard, EmptyState, link } from "../components/ui.jsx";
import { Icon } from "../icons.jsx";
import { useStore } from "../store.jsx";
import { findActivity } from "../services/rules.js";
import { longDate } from "../utils/format.js";

/** Tela 11 — Atividade publicada (RF24). */
export default function Published({ param }) {
  const { state, openModal, toast } = useStore();
  const activity = findActivity(state, param);
  if (!activity) {
    return (
      <AppShell active="minhas">
        <EmptyState title="Atividade não encontrada" />
      </AppShell>
    );
  }
  const url = `https://meleva.app/a/${activity.id}`;
  const text = `Bora? ${activity.title} • ${longDate(activity.start)}:`;

  return (
    <AppShell active="minhas">
      <div className="published">
        <div className="published__text">
          <span className="confirmed__check confirmed__check--small">{Icon.check}</span>
          <h1>Atividade publicada! 🎉</h1>
          <p>Ela já aparece no Explorar para quem está em Teresópolis. Agora é chamar a galera.</p>
          <div className="published__share">
            <button
              className="btn btn--gradient btn--lg"
              type="button"
              onClick={() => openModal("convidar", { title: "Chame a galera", lead: "Compartilhe o link da sua atividade.", url, text })}
            >
              {Icon.users} Chame a galera
            </button>
            <a className="share-btn share-btn--whatsapp" href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`} target="_blank" rel="noreferrer" onClick={() => toast("Abrindo o WhatsApp")}>
              {Icon.whatsapp} WhatsApp
            </a>
            <button className="share-btn share-btn--instagram" type="button" onClick={() => toast("Abrindo o Instagram")}>
              {Icon.instagram} Instagram
            </button>
            <button
              className="share-btn"
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(url).catch(() => {});
                toast("Link copiado!");
              }}
            >
              {Icon.link} Copiar link
            </button>
          </div>
          <div className="published__links">
            <a className="link" href={link(`atividade/${activity.id}`)}>Ver página da atividade {Icon.arrowRight}</a>
            <a className="link" href={link("minhas?aba=criadas")}>Minhas atividades {Icon.arrowRight}</a>
          </div>
        </div>
        <div className="published__card">
          <ActivityCard activity={activity} />
        </div>
      </div>
    </AppShell>
  );
}
