import { useState } from "react";
import AppShell from "../components/AppShell.jsx";
import { EmptyState, LevelTag, link, PageHead } from "../components/ui.jsx";
import { Icon } from "../icons.jsx";
import { useStore } from "../store.jsx";
import {
  acceptConnection,
  cancelConnectionRequest,
  declineConnection,
  incomingRequests,
  removeConnection,
  normalize,
  requestConnection,
} from "../services/rules.js";

const isFiller = (id) => /^a\d+$/.test(id);

function PersonCard({ person, common, children }) {
  return (
    <li className="conn-card">
      <a className="conn-card__photo" href={link(`pessoa/${person.id}`)}>
        <img src={person.avatar} alt="" />
      </a>
      <div className="conn-card__info">
        <a href={link(`pessoa/${person.id}`)}>
          <strong>{person.name}</strong>
        </a>
        <span className="conn-card__meta">
          {person.city}
          {person.age ? ` • ${person.age} anos` : ""}
        </span>
        <span className="conn-card__tags">
          <LevelTag level={person.level} />
          {common.length > 0 && <span className="tag tag--lilac">{common.slice(0, 2).join(" • ")}</span>}
        </span>
      </div>
      <div className="conn-card__actions">{children}</div>
    </li>
  );
}

/** Tela de conexões: suas conexões, pedidos recebidos, pedidos enviados e sugestões (RF10). */
export default function Connections({ query = {} }) {
  const { state, me, user, run, toast, openModal } = useStore();
  const [tab, setTab] = useState(query.aba === "pedidos" ? "received" : query.aba === "enviados" ? "sent" : "connected");
  const [search, setSearch] = useState("");

  const common = (person) => (person.sports ?? []).filter((s) => me.sports.includes(s));
  const matches = (person) => !search || normalize(person.name).includes(normalize(search));
  const people = (ids) => ids.filter((id) => !state.blocked.includes(id)).map(user).filter(matches);

  const connected = people(state.connections);
  const received = people(incomingRequests(state));
  const sent = people(state.pendingConnections.filter((id) => !state.connections.includes(id)));
  const suggestions = Object.values(state.users)
    .filter(
      (u) =>
        u.id !== "me" &&
        !isFiller(u.id) &&
        !state.connections.includes(u.id) &&
        !state.pendingConnections.includes(u.id) &&
        !state.blocked.includes(u.id) &&
        !incomingRequests(state).includes(u.id),
    )
    .map((u) => ({ person: u, common: common(u) }))
    .filter((s) => s.common.length)
    .sort((a, b) => b.common.length - a.common.length)
    .slice(0, 4);

  const tabs = [
    { id: "connected", label: "Conexões", count: connected.length },
    { id: "received", label: "Pedidos", count: received.length },
    { id: "sent", label: "Enviados", count: sent.length },
  ];
  const list = { connected, received, sent }[tab];

  function confirmRemove(person) {
    openModal("confirmar", {
      title: `Desfazer conexão com ${person.firstName}?`,
      text: "Vocês deixam de trocar mensagens diretas. Dá para se conectar de novo depois.",
      confirmLabel: "Desfazer",
      onConfirm: () => {
        run(removeConnection, person.id);
        toast(`Conexão com ${person.firstName} desfeita`);
      },
    });
  }

  const empty = {
    connected: { icon: Icon.users, title: search ? "Ninguém com esse nome" : "Você ainda não tem conexões", text: "Conecte-se com quem treina com você para trocar mensagens diretas." },
    received: { icon: Icon.userPlus, title: "Nenhum pedido pendente", text: "Quando alguém quiser se conectar com você, o pedido aparece aqui." },
    sent: { icon: Icon.send, title: "Nenhum pedido enviado", text: "Os pedidos que você enviar aparecem aqui até a pessoa responder." },
  }[tab];

  return (
    <AppShell active="perfil">
      <PageHead title="Conexões" subtitle="Quem treina com você. Só pessoas conectadas trocam mensagens diretas.">
        <a className="btn btn--ghost" href={link("perfil")}>
          {Icon.arrowLeft} Voltar ao perfil
        </a>
      </PageHead>

      <div className="conn">
        <div className="conn__main">
          <div className="conn__toolbar">
            <div className="tabs conn__tabs" role="tablist">
              {tabs.map((t) => (
                <button key={t.id} role="tab" aria-selected={tab === t.id} className={tab === t.id ? "tab is-active" : "tab"} type="button" onClick={() => setTab(t.id)}>
                  {t.label} <span className="tab__count">{t.count}</span>
                </button>
              ))}
            </div>
            <label className="field__box conn__search">
              <span className="field__icon">{Icon.search}</span>
              <input type="search" placeholder="Buscar pelo nome" aria-label="Buscar conexões pelo nome" value={search} onChange={(e) => setSearch(e.target.value)} />
            </label>
          </div>

          {list.length === 0 ? (
            <div className="card">
              <EmptyState icon={empty.icon} title={empty.title} text={empty.text}>
                {tab !== "received" && !search && (
                  <a className="btn btn--gradient" href={link("explorar")}>Encontrar atividades</a>
                )}
              </EmptyState>
            </div>
          ) : (
            <ul className="conn-list" role="tabpanel">
              {list.map((person) => (
                <PersonCard key={person.id} person={person} common={common(person)}>
                  {tab === "connected" && (
                    <>
                      <a className="btn btn--lilac btn--sm" href={link(`mensagens/dm:${person.id}`)}>
                        {Icon.chat} Mensagem
                      </a>
                      <button className="btn btn--ghost btn--sm" type="button" onClick={() => confirmRemove(person)}>
                        Desfazer
                      </button>
                    </>
                  )}
                  {tab === "received" && (
                    <>
                      <button className="btn btn--gradient btn--sm" type="button" onClick={() => { run(acceptConnection, person.id); toast(`Agora você e ${person.firstName} estão conectados`); }}>
                        Aceitar
                      </button>
                      <button className="btn btn--ghost btn--sm" type="button" onClick={() => { run(declineConnection, person.id); toast("Pedido recusado"); }}>
                        Recusar
                      </button>
                    </>
                  )}
                  {tab === "sent" && (
                    <>
                      <span className="tag tag--lilac">{Icon.clock} Aguardando</span>
                      <button className="btn btn--ghost btn--sm" type="button" onClick={() => { run(cancelConnectionRequest, person.id); toast("Pedido cancelado"); }}>
                        Cancelar
                      </button>
                    </>
                  )}
                </PersonCard>
              ))}
            </ul>
          )}
        </div>

        <aside className="conn__side">
          <section className="card">
            <h2 className="h3">Pessoas com interesses parecidos</h2>
            {suggestions.length === 0 ? (
              <p className="hint">Você já se conectou com todo mundo por aqui!</p>
            ) : (
              <ul className="people-list">
                {suggestions.map(({ person, common: shared }) => (
                  <li className="person" key={person.id}>
                    <a href={link(`pessoa/${person.id}`)}>
                      <img src={person.avatar} alt="" />
                    </a>
                    <div className="person__info">
                      <a href={link(`pessoa/${person.id}`)}>
                        <strong>{person.name}</strong>
                      </a>
                      <span>{shared.join(" • ")}</span>
                    </div>
                    <button className="btn btn--ghost btn--sm" type="button" onClick={() => { run(requestConnection, person.id); toast("Pedido de conexão enviado"); }}>
                      Conectar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <p className="note-lilac">{Icon.lock} Sua lista de conexões não aparece para outras pessoas.</p>
        </aside>
      </div>
    </AppShell>
  );
}
