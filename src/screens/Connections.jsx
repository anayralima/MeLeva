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
    <li className="py-4 px-4.5 border border-borda flex items-center gap-4 rounded-[20px] bg-superficie shadow-[0_6px_20px_rgba(36,15,92,0.05)] max-md:flex-wrap">
      <a className="[&_img]:block [&_img]:size-14 [&_img]:rounded-full [&_img]:object-cover" href={link(`pessoa/${person.id}`)}>
        <img src={person.avatar} alt="" />
      </a>
      <div className="flex flex-1 flex-col gap-1 min-w-0 [&_a]:text-principal [&_a]:no-underline [&_a:hover_strong]:text-rosa-texto">
        <a href={link(`pessoa/${person.id}`)}>
          <strong>{person.name}</strong>
        </a>
        <span className="text-secundario text-[13px]">
          {person.city}
          {person.age ? ` • ${person.age} anos` : ""}
        </span>
        <span className="flex flex-wrap gap-1.5 mt-0.5">
          <LevelTag level={person.level} />
          {common.length > 0 && <span className="tag tag--lilac">{common.slice(0, 2).join(" • ")}</span>}
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0 max-md:w-full [&_svg]:size-4 max-md:[&>*]:flex-1 max-md:[&>*]:justify-center">{children}</div>
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

      <div className="grid grid-cols-[minmax(0,1fr)_340px] gap-6 items-start max-xl:grid-cols-[1fr]">
        <div className="flex flex-col gap-4 min-w-0">
          <div className="flex items-end justify-between gap-4 border-b border-b-borda max-md:flex-col max-md:items-stretch">
            <div className="flex gap-6 overflow-x-auto mb-0 border-b-0 border-b-current" role="tablist">
              {tabs.map((t) => (
                <button key={t.id} role="tab" aria-selected={tab === t.id} className={tab === t.id ? "tab is-active" : "tab"} type="button" onClick={() => setTab(t.id)}>
                  {t.label} <span className="tab-count">{t.count}</span>
                </button>
              ))}
            </div>
            <label className="field-box flex items-center gap-2 w-60 mb-2 max-md:w-full [&_input]:border-0 [&_input]:flex-1 [&_input]:min-w-0 [&_input]:[outline:0] [&_input]:bg-transparent [&_input]:text-principal [&_input]:[font-family:inherit] [&_input]:font-[inherit] [&_input]:[font-style:inherit] [&_input]:[line-height:inherit] [&_input]:text-[14px]">
              <span className="field-icon">{Icon.search}</span>
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
            <ul className="p-0 m-0 list-none flex flex-col gap-3" role="tabpanel">
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

        <aside className="conn-side flex flex-col gap-4 min-w-0">
          <section className="card">
            <h2 className="text-[16px] font-bold">Pessoas com interesses parecidos</h2>
            {suggestions.length === 0 ? (
              <p className="hint">Você já se conectou com todo mundo por aqui!</p>
            ) : (
              <ul className="flex flex-col gap-3.5 [.conn-side_&]:p-0 [.conn-side_&]:m-0 [.conn-side_&]:list-none">
                {suggestions.map(({ person, common: shared }) => (
                  <li className="person flex items-center gap-3 [&>img]:shrink-0 [&>img]:size-10 [&>img]:rounded-full [&>img]:object-cover [&>a:first-child_img]:shrink-0 [&>a:first-child_img]:size-10 [&>a:first-child_img]:rounded-full [&>a:first-child_img]:object-cover [.conn-side_&]:[&>a:first-child_img]:size-11 [.conn-side_&]:[&>a:first-child_img]:rounded-full [.conn-side_&]:[&>a:first-child_img]:object-cover" key={person.id}>
                    <a href={link(`pessoa/${person.id}`)}>
                      <img src={person.avatar} alt="" />
                    </a>
                    <div className="flex flex-1 flex-col min-w-0 text-[12px] text-secundario [&_strong]:text-[13px] [&_strong]:font-semibold [&_strong]:text-principal [&_a]:text-principal">
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
          <p className="flex items-center gap-1.5 -mt-2 text-[12px] font-medium text-roxo [&_svg]:size-4 [&_svg]:shrink-0">{Icon.lock} Sua lista de conexões não aparece para outras pessoas.</p>
        </aside>
      </div>
    </AppShell>
  );
}
