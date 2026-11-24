import AppShell from "../components/AppShell.jsx";
import { link, PageHead, Toggle } from "../components/ui.jsx";
import { Icon } from "../icons.jsx";
import { useStore } from "../store.jsx";
import { acceptConnection } from "../services/rules.js";
import { timeAgo } from "../utils/format.js";

const TYPE_ICON = {
  participant: { icon: Icon.users, tone: "rose" },
  rain: { icon: Icon.rain, tone: "blue" },
  connection: { icon: Icon.userPlus, tone: "lilac" },
  reminder: { icon: Icon.clock, tone: "green" },
  nearby: { icon: Icon.mapPin, tone: "rose" },
  rate: { icon: Icon.star, tone: "lilac" },
};

const PREFS = [
  ["participants", "Novos participantes", "Quando alguém confirma na sua atividade"],
  ["reminders", "Lembretes", "1 dia e 1 hora antes"],
  ["rain", "Aviso de chuva", "Previsão ruim pro horário"],
  ["connections", "Conexões", "Pedidos e aceites"],
  ["nearby", "Atividades perto", "Novidades nos seus esportes"],
];

function group(at) {
  const days = (Date.now() - at) / 86400000;
  if (days < 1) return "Hoje";
  if (days < 7) return "Esta semana";
  return "Antes";
}

/** Tela 18 — Notificações (RF10, RF27). */
export default function Notifications() {
  const { state, update, run, toast, user } = useStore();
  const groups = {};
  state.notifications.forEach((n) => {
    (groups[group(n.at)] ??= []).push(n);
  });

  function markAll() {
    update((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
    toast("Tudo marcado como lido");
  }

  function open(id) {
    update((s) => ({ ...s, notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) }));
  }

  return (
    <AppShell>
      <PageHead title="Notificações" subtitle="Novidades das suas atividades e conexões.">
        <button className="btn btn--lilac" type="button" onClick={markAll}>{Icon.check} Marcar todas como lidas</button>
      </PageHead>
      <div className="notif">
        <div className="notif__list">
          {Object.entries(groups).map(([title, items]) => (
            <section key={title}>
              <h2 className="group-title">{title}</h2>
              <ul className="card notif__card">
                {items.map((n) => {
                  const type = TYPE_ICON[n.type] ?? TYPE_ICON.nearby;
                  return (
                    <li key={n.id} className={n.read ? "notif__item" : "notif__item is-unread"}>
                      {n.request ? (
                        <img className="notif__avatar" src={user(n.request).avatar} alt="" />
                      ) : (
                        <span className={`notif__icon notif__icon--${type.tone}`}>{type.icon}</span>
                      )}
                      <a href={link(n.link)} onClick={() => open(n.id)}>
                        <p>{n.text}</p>
                        <small>{timeAgo(n.at)}</small>
                      </a>
                      {n.request && (
                        <span className="notif__actions">
                          <button className="btn btn--gradient btn--sm" type="button" onClick={() => { run(acceptConnection, n.request); toast("Conexão aceita"); }}>Aceitar</button>
                          <button className="btn btn--lilac btn--sm" type="button" onClick={() => update((s) => ({ ...s, notifications: s.notifications.filter((x) => x.id !== n.id) }))}>Recusar</button>
                        </span>
                      )}
                      {n.accepted && <span className="tag tag--green">Conectados</span>}
                      {!n.read && <span className="notif__dot" aria-label="não lida" />}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
        <aside className="card notif__prefs">
          <h2 className="h3">Me avise sobre</h2>
          {PREFS.map(([key, title, hint]) => (
            <div className="switch-row" key={key}>
              <span><strong>{title}</strong><small>{hint}</small></span>
              <Toggle
                checked={state.notificationPrefs[key]}
                label={title}
                onChange={(v) => update((s) => ({ ...s, notificationPrefs: { ...s.notificationPrefs, [key]: v } }))}
              />
            </div>
          ))}
        </aside>
      </div>
    </AppShell>
  );
}
