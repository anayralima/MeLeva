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
      <div className="grid [place-items:start_center] pt-3">
        <section className="w-[min(720px,100%)] overflow-hidden rounded-[24px] bg-superficie shadow-[var(--sombra-card)]">
          <header className="py-9 px-6 flex flex-col items-center gap-2 [background-position:center] [background-size:cover] text-white text-center [&_h1]:text-[32px] [&_h1]:font-extrabold max-md:[&_h1]:text-[26px]" style={{ backgroundImage: `linear-gradient(180deg, rgba(106,43,192,.55), rgba(233,27,122,.65)), url(${activity.image})` }}>
            <span className="p-5 grid place-items-center size-18 rounded-full bg-white text-rosa [animation:pop_0.4s_ease]">{Icon.check}</span>
            <h1>Você está dentro! 🎉</h1>
            <p>Sua vaga em {activity.title} está garantida.</p>
          </header>

          <div className="p-6 flex flex-col gap-4.5">
            <div className="grid grid-cols-[repeat(3,1fr)] gap-2.5 max-md:grid-cols-[1fr] [&>div]:p-3 [&>div]:grid [&>div]:grid-cols-[36px_1fr] [&>div]:grid-rows-[auto_auto] [&>div]:gap-x-2.5 [&>div]:items-center [&>div]:rounded-[14px] [&>div]:bg-pagina [&>div>span]:p-2.25 [&>div>span]:row-[span_2] [&>div>span]:size-9 [&>div>span]:rounded-[10px] [&>div>span]:bg-rosa-suave [&>div>span]:text-rosa [&_small]:text-[11px] [&_small]:text-secundario [&_strong]:text-[13px]">
              <div><span>{Icon.calendar}</span><small>Quando</small><strong>{shortDate(activity.start)}</strong></div>
              <div><span>{Icon.mapPin}</span><small>Onde</small><strong>{activity.address.split("—")[0].trim()}</strong></div>
              <div><span>{Icon.users}</span><small>Quem vai</small><strong>{activity.participants.length} de {activity.spots} pessoas</strong></div>
            </div>

            <a className="py-3 px-3.5 flex items-center gap-3 rounded-[14px] bg-lilas [&>span]:flex [&>span]:flex-col [&>span]:text-[14px] [&_small]:text-[12px] [&_small]:text-secundario" href={link(`mensagens/${activity.id}`)}>
              <AvatarStack ids={others} max={4} />
              <span>
                <strong>{names(others.slice(0, 4).map((id) => user(id).firstName))}</strong>
                <small>Diga oi no chat do grupo e combine os detalhes</small>
              </span>
            </a>

            <div className="flex flex-col items-start gap-2.5">
              <h2 className="text-[16px] font-bold">Próximos passos</h2>
              <ul className="flex flex-col gap-2.5 list-none text-[14px] [&_svg]:p-0.5 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:rounded-full [&_svg]:bg-verde [&_svg]:text-verde-texto [&_li]:flex [&_li]:items-start [&_li]:gap-2">
                <li>{Icon.check} Lembrete 1 dia antes e 1 hora antes</li>
                <li>{Icon.check} Chegue 10 min antes no ponto de encontro: {activity.address}</li>
                <li>{Icon.check} Se não puder ir, cancele pra liberar a vaga</li>
              </ul>
              <button className="p-0 border-0 inline-flex items-center gap-1.5 bg-transparent text-[13px] font-semibold underline [text-underline-offset:2px] cursor-pointer text-erro [&_svg]:size-4 [&_svg]:shrink-0 [.safety-links_&]:text-secundario [.safety-links_&]:no-underline [.safety-links--col_&]:text-erro" type="button" onClick={() => openModal("reportar", { activityId: activity.id })}>
                {Icon.alert} Chegou lá e não era o combinado? Reportar a atividade
              </button>
            </div>

            <div className="p-3.5 flex items-center gap-3 rounded-[14px] bg-azul [&>span:nth-child(2)]:flex [&>span:nth-child(2)]:flex-1 [&>span:nth-child(2)]:flex-col [&>span:nth-child(2)]:text-[14px] [&_small]:text-[12px] [&_small]:text-secundario">
              <span className="size-6 text-azul-texto">{Icon.shield}</span>
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

            <div className="confirmed-actions flex flex-wrap gap-2.5">
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
