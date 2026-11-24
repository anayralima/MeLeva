import { useEffect, useRef, useState } from "react";
import AppShell from "../components/AppShell.jsx";
import { EmptyState, link } from "../components/ui.jsx";
import { Icon } from "../icons.jsx";
import { useStore } from "../store.jsx";
import { canChat, canDirectMessage, findActivity, isPast, normalize, sendMessage, statusOf } from "../services/rules.js";
import { clock, friendlyWhen, timeAgo } from "../utils/format.js";

const AUTO_REPLIES = ["Boa! 🙌", "Combinado!", "Fechou, até lá!", "Show, obrigado por avisar", "👍"];

function useChats() {
  const { state, user } = useStore();
  const activityChats = state.activities
    .filter((a) => canChat(a) && a.status === "published" && !isPast(a))
    .map((a) => ({
      id: a.id,
      title: a.title,
      image: a.image,
      subtitle: `${a.participants.length} participantes • ${friendlyWhen(a.start)}`,
      activity: a,
    }));
  const dms = state.connections
    .filter((id) => canDirectMessage(state, id))
    .map((id) => ({ id: `dm:${id}`, title: user(id).name, image: user(id).avatar, subtitle: user(id).level, person: user(id), round: true }));
  return [...activityChats, ...dms]
    .map((chat) => {
      const list = state.messages[chat.id] ?? [];
      const last = list[list.length - 1];
      const unread = list.filter((m) => m.from !== "me" && m.at > (state.readChats[chat.id] ?? 0)).length;
      return { ...chat, last, unread };
    })
    .sort((a, b) => (b.last?.at ?? 0) - (a.last?.at ?? 0));
}

/** Tela 16 — Mensagens: chat do grupo só para confirmados (RF26, RN05). */
export default function Messages({ param }) {
  const { state, run, update, user } = useStore();
  const chats = useChats();
  const [search, setSearch] = useState("");
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  const chatId = param ? decodeURIComponent(param) : null;
  const current = chats.find((c) => c.id === chatId);
  const blockedActivity = chatId && !chatId.startsWith("dm:") && !current ? findActivity(state, chatId) : null;
  const messages = current ? state.messages[current.id] ?? [] : [];

  useEffect(() => {
    if (current) update((s) => ({ ...s, readChats: { ...s.readChats, [current.id]: Date.now() } }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id, messages.length]);

  useEffect(() => {
    const box = endRef.current?.parentElement;
    if (box) box.scrollTop = box.scrollHeight;
  }, [messages.length, current?.id, typing]);

  function send(event) {
    event.preventDefault();
    const { result } = run(sendMessage, current.id, text);
    if (result !== "sent") return;
    setText("");
    // Simula uma resposta do grupo para a demo ficar viva.
    const others = current.activity ? current.activity.participants.filter((p) => p !== "me" && !/^a\d+$/.test(p)) : [current.person.id];
    if (!others.length) return;
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const from = others[Math.floor(Math.random() * others.length)];
      update((s) => ({
        ...s,
        messages: { ...s.messages, [current.id]: [...(s.messages[current.id] ?? []), { from, text: AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)], at: Date.now() }] },
      }));
    }, 1600);
  }

  const filtered = chats.filter((c) => normalize(c.title).includes(normalize(search)));

  return (
    <AppShell active="mensagens">
      <h1 className="page-title">Mensagens</h1>
      <div className={chatId ? "chat chat--open" : "chat"}>
        <aside className="chat__list">
          <label className="chat__search">
            {Icon.search}
            <input placeholder="Buscar conversa" aria-label="Buscar conversa" value={search} onChange={(e) => setSearch(e.target.value)} />
          </label>
          {filtered.length === 0 && <p className="hint">Nenhuma conversa. Confirme presença numa atividade para entrar no chat do grupo.</p>}
          <ul>
            {filtered.map((chat) => (
              <li key={chat.id}>
                <a className={chat.id === chatId ? "conv is-active" : "conv"} href={link(`mensagens/${chat.id}`)} aria-current={chat.id === chatId ? "true" : undefined}>
                  <img className={chat.round ? "conv__img conv__img--round" : "conv__img"} src={chat.image} alt="" />
                  <span className="conv__text">
                    <strong>{chat.title}</strong>
                    <small>
                      {chat.last ? `${chat.last.from === "me" ? "Você" : user(chat.last.from).firstName}: ${chat.last.text}` : "Diga oi para o grupo 👋"}
                    </small>
                  </span>
                  <span className="conv__meta">
                    <small>{chat.last ? timeAgo(chat.last.at) : ""}</small>
                    {chat.unread > 0 && <span className="badge-count" aria-label={`${chat.unread} novas`}>{chat.unread}</span>}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </aside>

        <section className="chat__main">
          {blockedActivity ? (
            <EmptyState icon={Icon.lock} title="Chat só para confirmados" text={statusOf(blockedActivity) === "waitlist" ? "Você está na lista de espera. Se uma vaga abrir, o chat libera pra você." : "Confirme presença na atividade para conversar com o grupo."}>
              <a className="btn btn--gradient" href={link(`atividade/${blockedActivity.id}`)}>Ver atividade</a>
            </EmptyState>
          ) : !current ? (
            <EmptyState icon={Icon.chat} title="Escolha uma conversa" text="Os chats de grupo aparecem aqui quando você confirma presença numa atividade." />
          ) : (
            <>
              <header className="chat__head">
                <a className="icon-btn chat__back" href={link("mensagens")} aria-label="Voltar para as conversas">{Icon.arrowLeft}</a>
                <img className={current.round ? "conv__img conv__img--round" : "conv__img"} src={current.image} alt="" />
                <span>
                  <strong>{current.title}</strong>
                  <small>{current.subtitle}</small>
                </span>
                {current.activity ? (
                  <a className="btn btn--lilac btn--sm" href={link(`atividade/${current.id}`)}>{Icon.arrowRight} Ver atividade</a>
                ) : (
                  <a className="btn btn--lilac btn--sm" href={link(`pessoa/${current.person.id}`)}>Ver perfil</a>
                )}
              </header>
              {current.activity && (
                <div className="chat__info">
                  <span>{Icon.mapPin} {current.activity.address.split("—")[0].trim()}</span>
                  <span>{Icon[current.activity.weather.icon]} {current.activity.weather.temp}°C no horário</span>
                  <span className="tag tag--lilac">{Icon.lock} Só participantes confirmados</span>
                </div>
              )}
              <div className="chat__messages" aria-live="polite">
                {messages.length === 0 && <p className="hint chat__empty">Ninguém falou ainda. Que tal começar?</p>}
                {messages.map((m, index) => {
                  const mine = m.from === "me";
                  const person = user(m.from);
                  return (
                    <div key={index} className={mine ? "msg msg--mine" : "msg"}>
                      {!mine && <img src={person.avatar} alt="" />}
                      <div className="msg__bubble">
                        {!mine && current.activity && <strong>{person.name}</strong>}
                        <p>{m.text}</p>
                        <small>{clock(m.at)}</small>
                      </div>
                    </div>
                  );
                })}
                {typing && <p className="typing">alguém está digitando…</p>}
                <span ref={endRef} />
              </div>
              <form className="chat__form" onSubmit={send}>
                <input placeholder="Escreva uma mensagem..." aria-label="Mensagem" value={text} onChange={(e) => setText(e.target.value)} />
                <button className="send-btn" type="submit" aria-label="Enviar" disabled={!text.trim()}>
                  {Icon.send}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </AppShell>
  );
}
