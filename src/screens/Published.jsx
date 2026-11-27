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
      <div className="my-6 mx-auto grid grid-cols-[1fr_340px] gap-10 items-center max-w-250 max-xl:grid-cols-[1fr]">
        <div className="flex flex-col items-start gap-3.5 [&_h1]:text-[38px] [&_h1]:font-extrabold [&_h1]:tracking-[-1px] max-md:[&_h1]:text-[26px] [&_p]:text-[16px] [&_p]:text-secundario">
          <span className="p-3.75 grid place-items-center rounded-full [animation:pop_0.4s_ease] size-14 bg-verde text-verde-texto">{Icon.check}</span>
          <h1>Atividade publicada! 🎉</h1>
          <p>Ela já aparece no Explorar para quem está em Teresópolis. Agora é chamar a galera.</p>
          <div className="flex flex-wrap gap-2.5">
            <button
              className="btn btn--gradient btn--lg"
              type="button"
              onClick={() => openModal("convidar", { title: "Chame a galera", lead: "Compartilhe o link da sua atividade.", url, text })}
            >
              {Icon.users} Chame a galera
            </button>
            <a className="p-3 border border-borda inline-flex items-center justify-center gap-2 rounded-[14px] bg-superficie text-[13px] font-semibold cursor-pointer text-[#128c4a] [&_svg]:size-4 [&_svg]:shrink-0" href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`} target="_blank" rel="noreferrer" onClick={() => toast("Abrindo o WhatsApp")}>
              {Icon.whatsapp} WhatsApp
            </a>
            <button className="p-3 border border-borda inline-flex items-center justify-center gap-2 rounded-[14px] bg-superficie text-[13px] font-semibold cursor-pointer text-[#c13584] [&_svg]:size-4 [&_svg]:shrink-0" type="button" onClick={() => toast("Abrindo o Instagram")}>
              {Icon.instagram} Instagram
            </button>
            <button
              className="p-3 border border-borda inline-flex items-center justify-center gap-2 rounded-[14px] bg-superficie text-[13px] font-semibold text-principal cursor-pointer [&_svg]:size-4 [&_svg]:shrink-0"
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(url).catch(() => {});
                toast("Link copiado!");
              }}
            >
              {Icon.link} Copiar link
            </button>
          </div>
          <div className="flex flex-wrap gap-5">
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
