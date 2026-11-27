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
      <h1 className="text-[30px] font-extrabold tracking-[-0.6px] mb-5 max-md:text-[24px]">Mensagens</h1>
      <div className={chatId ? "chat chat--open border border-borda grid grid-cols-[340px_minmax(0,1fr)] h-[calc(100vh_-_170px)] min-h-120 overflow-hidden rounded-[20px] bg-superficie max-xl:grid-cols-[1fr] max-xl:h-[calc(100vh_-_210px)] max-md:h-[calc(100vh_-_250px)]" : "chat border border-borda grid grid-cols-[340px_minmax(0,1fr)] h-[calc(100vh_-_170px)] min-h-120 overflow-hidden rounded-[20px] bg-superficie max-xl:grid-cols-[1fr] max-xl:h-[calc(100vh_-_210px)] max-md:h-[calc(100vh_-_250px)]"}>
        <aside className="p-3.5 flex flex-col gap-2 border-r border-r-borda overflow-y-auto [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1 [&_ul]:list-none max-xl:[.chat--open_&]:hidden">
          <label className="py-2.5 px-3 flex items-center gap-2 rounded-[12px] bg-pagina text-secundario [&_svg]:size-4 [&_svg]:shrink-0 [&_input]:border-0 [&_input]:flex-1 [&_input]:[outline:0] [&_input]:bg-transparent [&_input]:font-sans [&_input]:text-[13px]">
            {Icon.search}
            <input placeholder="Buscar conversa" aria-label="Buscar conversa" value={search} onChange={(e) => setSearch(e.target.value)} />
          </label>
          {filtered.length === 0 && <p className="hint">Nenhuma conversa. Confirme presença numa atividade para entrar no chat do grupo.</p>}
          <ul>
            {filtered.map((chat) => (
              <li key={chat.id}>
                <a className={chat.id === chatId ? "is-active p-2.5 flex items-center gap-2.5 rounded-[14px] bg-rosa-suave hover:bg-pagina" : "p-2.5 flex items-center gap-2.5 rounded-[14px] hover:bg-pagina"} href={link(`mensagens/${chat.id}`)} aria-current={chat.id === chatId ? "true" : undefined}>
                  <img className={chat.round ? "shrink-0 size-11 object-cover rounded-full" : "shrink-0 size-11 rounded-[10px] object-cover"} src={chat.image} alt="" />
                  <span className="flex flex-1 flex-col gap-0.5 min-w-0 text-[14px] [&_small]:overflow-hidden [&_small]:text-[12px] [&_small]:text-secundario [&_small]:whitespace-nowrap [&_small]:text-ellipsis">
                    <strong>{chat.title}</strong>
                    <small>
                      {chat.last ? `${chat.last.from === "me" ? "Você" : user(chat.last.from).firstName}: ${chat.last.text}` : "Diga oi para o grupo 👋"}
                    </small>
                  </span>
                  <span className="flex flex-col items-end gap-1 text-[11px] text-secundario">
                    <small>{chat.last ? timeAgo(chat.last.at) : ""}</small>
                    {chat.unread > 0 && <span className="py-0 px-1.5 grid place-items-center min-w-5 h-5 rounded-full bg-rosa text-[11px] font-bold text-white" aria-label={`${chat.unread} novas`}>{chat.unread}</span>}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </aside>

        <section className="chat-main flex flex-col min-w-0 max-xl:[.chat:not(.chat--open)_&]:hidden">
          {blockedActivity ? (
            <EmptyState icon={Icon.lock} title="Chat só para confirmados" text={statusOf(blockedActivity) === "waitlist" ? "Você está na lista de espera. Se uma vaga abrir, o chat libera pra você." : "Confirme presença na atividade para conversar com o grupo."}>
              <a className="btn btn--gradient" href={link(`atividade/${blockedActivity.id}`)}>Ver atividade</a>
            </EmptyState>
          ) : !current ? (
            <EmptyState icon={Icon.chat} title="Escolha uma conversa" text="Os chats de grupo aparecem aqui quando você confirma presença numa atividade." />
          ) : (
            <>
              <header className="py-3.5 px-4.5 flex items-center gap-3 border-b border-b-borda [&>span]:flex [&>span]:flex-1 [&>span]:flex-col [&>span]:min-w-0 [&>span]:text-[15px] [&_small]:text-[12px] [&_small]:text-secundario">
                <a className="icon-btn hidden max-xl:grid" href={link("mensagens")} aria-label="Voltar para as conversas">{Icon.arrowLeft}</a>
                <img className={current.round ? "shrink-0 size-11 object-cover rounded-full" : "shrink-0 size-11 rounded-[10px] object-cover"} src={current.image} alt="" />
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
                <div className="py-2.5 px-4.5 flex flex-wrap items-center gap-y-2 gap-x-4 border-b border-b-borda bg-pagina text-[12px] font-medium [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-rosa [&>span]:flex [&>span]:items-center [&>span]:gap-1.5">
                  <span>{Icon.mapPin} {current.activity.address.split("—")[0].trim()}</span>
                  <span>{Icon[current.activity.weather.icon]} {current.activity.weather.temp}°C no horário</span>
                  <span className="tag tag--lilac">{Icon.lock} Só participantes confirmados</span>
                </div>
              )}
              <div className="p-4.5 flex flex-1 flex-col gap-3 overflow-y-auto" aria-live="polite">
                {messages.length === 0 && <p className="hint m-auto">Ninguém falou ainda. Que tal começar?</p>}
                {messages.map((m, index) => {
                  const mine = m.from === "me";
                  const person = user(m.from);
                  return (
                    <div key={index} className={mine ? "msg--mine flex items-end gap-2 max-w-[75%] self-end max-md:max-w-[88%] [&_img]:size-7.5 [&_img]:rounded-full" : "flex items-end gap-2 max-w-[75%] max-md:max-w-[88%] [&_img]:size-7.5 [&_img]:rounded-full"}>
                      {!mine && <img src={person.avatar} alt="" />}
                      <div className="py-2.5 px-3.5 flex flex-col gap-0.5 [border-radius:16px_16px_16px_4px] bg-pagina text-[14px] leading-[1.4] [&_strong]:text-[12px] [&_strong]:text-rosa-texto [&_small]:text-[11px] [&_small]:text-secundario [.msg--mine_&]:[border-radius:16px_16px_4px_16px] [.msg--mine_&]:[background:var(--gradiente-marca)] [.msg--mine_&]:text-white [.msg--mine_&]:[&_small]:text-[rgba(255,255,255,0.8)]">
                        {!mine && current.activity && <strong>{person.name}</strong>}
                        <p>{m.text}</p>
                        <small>{clock(m.at)}</small>
                      </div>
                    </div>
                  );
                })}
                {typing && <p className="text-[12px] italic text-secundario">alguém está digitando…</p>}
                <span ref={endRef} />
              </div>
              <form className="py-3.5 px-4.5 flex gap-2.5 border-t border-t-borda [&_input]:py-3 [&_input]:px-4 [&_input]:border-[1.5px] [&_input]:border-borda [&_input]:flex-1 [&_input]:min-w-0 [&_input]:rounded-full [&_input]:[outline:0] [&_input]:font-sans [&_input]:text-[14px] [&_input:focus]:border-rosa" onSubmit={send}>
                <input placeholder="Escreva uma mensagem..." aria-label="Mensagem" value={text} onChange={(e) => setText(e.target.value)} />
                <button className="p-3 border-0 grid shrink-0 place-items-center size-11.5 rounded-full [background:var(--gradiente-marca)] text-white cursor-pointer" type="submit" aria-label="Enviar" disabled={!text.trim()}>
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
