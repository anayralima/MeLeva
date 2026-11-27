import { useState } from "react";
import { Icon } from "../icons.jsx";
import { useStore } from "../store.jsx";
import { link } from "./ui.jsx";

const navItems = [
  { id: "home", label: "Início", icon: Icon.home },
  { id: "explorar", label: "Explorar", icon: Icon.compass },
  { id: "minhas", label: "Minhas atividades", icon: Icon.calendar },
  { id: "mensagens", label: "Mensagens", icon: Icon.chat },
  { id: "favoritos", label: "Favoritos", icon: Icon.heart },
  { id: "perfil", label: "Perfil", icon: Icon.user },
];

const tabItems = [
  { id: "home", label: "Início", icon: Icon.home },
  { id: "explorar", label: "Explorar", icon: Icon.compass },
  { id: "criar", label: "Criar", icon: Icon.plus, cta: true },
  { id: "mensagens", label: "Mensagens", icon: Icon.chat },
  { id: "perfil", label: "Perfil", icon: Icon.user },
];

export default function AppShell({ active = "home", children }) {
  const { state, me, openModal, update, toast } = useStore();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const unread = state.notifications.some((n) => !n.read);

  function search(event) {
    event.preventDefault();
    window.location.hash = `#/explorar?q=${encodeURIComponent(query.trim())}`;
  }

  function logout() {
    update({ session: null });
    toast("Você saiu da sua conta");
    window.location.hash = "#/";
  }

  return (
    <div className="flex min-h-screen bg-pagina">
      <a className="skip-link" href="#conteudo" onClick={(e) => { e.preventDefault(); document.getElementById("conteudo")?.focus(); }}>
        Pular para o conteúdo
      </a>
      <aside className="pt-7 pb-5 px-4 sticky top-0 flex flex-col gap-6 shrink-0 w-62 h-screen border-r border-r-borda bg-pagina max-xl:hidden">
        <a className="text-[26px] font-extrabold tracking-[-0.8px] pl-2 [&_span]:text-rosa" href={link("home")} aria-label="Me Leva, ir para o início">
          Me <span>Leva</span>
        </a>

        <nav className="flex flex-col gap-1" aria-label="Menu principal">
          {navItems.map((item) => (
            <a
              key={item.id}
              className={item.id === active ? "py-2.5 px-3 flex items-center gap-3 rounded-[12px] text-[14px] bg-rosa-suave text-rosa-texto font-semibold hover:bg-lilas" : "py-2.5 px-3 flex items-center gap-3 rounded-[12px] text-[14px] font-medium text-principal hover:bg-lilas"}
              href={link(item.id)}
              aria-current={item.id === active ? "page" : undefined}
            >
              <span className="shrink-0 size-5">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <a className="btn btn--gradient btn--block p-3 mt-1 text-[14px]" href={link("criar")}>
          {Icon.plus}
          Criar atividade
        </a>

        <div className="side-invite p-4 flex flex-col items-start gap-1.5 mt-auto rounded-[16px] bg-lilas [&_strong]:text-[14px] [&_strong]:font-semibold [&_p]:text-[13px] [&_p]:leading-[1.35] [&_p]:text-secundario">
          <span className="size-5.5 text-roxo">{Icon.users}</span>
          <strong>Chame a galera</strong>
          <p>Convide amigos e pratiquem juntos.</p>
          <button className="btn btn--ghost btn--sm" type="button" onClick={() => openModal("convidar")}>
            Convidar
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="py-5 px-8 flex items-center gap-4 max-md:p-4 max-md:gap-2.5 max-md:flex-wrap">
          <a className="text-[26px] font-extrabold tracking-[-0.8px] hidden max-xl:block max-xl:shrink-0 max-xl:text-[22px] max-md:mr-auto [&_span]:text-rosa" href={link("home")} aria-label="Me Leva, ir para o início">
            Me <span>Leva</span>
          </a>
          <form className="py-0 px-4 border border-borda flex items-center gap-2.5 flex-1 h-11 rounded-[14px] bg-superficie text-secundario max-md:order-5 max-md:basis-full [&_input]:border-0 [&_input]:flex-1 [&_input]:min-w-0 [&_input]:[outline:0] [&_input]:bg-transparent [&_input]:font-sans [&_input]:text-[14px] [&_input]:text-principal" role="search" onSubmit={search}>
            <span className="shrink-0 size-4.5">{Icon.search}</span>
            <input
              placeholder="Buscar atividades, esportes ou locais..."
              aria-label="Buscar atividades, esportes ou locais"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </form>

          <button className="py-0 px-4 border border-borda flex items-center gap-2 h-11 rounded-full bg-superficie font-sans text-[13px] font-medium text-principal whitespace-nowrap cursor-pointer max-md:hidden [&_svg:first-child]:size-4 [&_svg:first-child]:text-rosa [&_svg:last-child]:size-3.5 [&_svg:last-child]:text-secundario" type="button" onClick={() => openModal("cidade")}>
            {Icon.pin}
            {state.city}, RJ
            {Icon.chevron}
          </button>

          <a className="p-3 border border-borda relative grid shrink-0 place-items-center size-11 rounded-full bg-superficie text-principal cursor-pointer [&_span]:border-[1.5px] [&_span]:border-white [&_span]:absolute [&_span]:top-2.5 [&_span]:right-2.75 [&_span]:size-2 [&_span]:rounded-full [&_span]:bg-rosa" href={link("notificacoes")} aria-label={unread ? "Notificações (há novas)" : "Notificações"}>
            {Icon.bell}
            {unread && <span />}
          </a>

          <div className="relative">
            <button
              className="p-1 border-0 flex items-center gap-2.5 bg-transparent text-left cursor-pointer [&_img]:size-10 [&_img]:rounded-full [&_img]:object-cover [&>span]:flex [&>span]:flex-col [&>span]:text-[12px] [&>span]:leading-[1.3] [&>span]:text-secundario max-md:[&>span]:hidden [&_strong]:text-[14px] [&_strong]:font-bold [&_strong]:text-principal [&_svg]:size-4 [&_svg]:text-secundario max-md:[&>svg]:hidden"
              type="button"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <img src={me.avatar} alt="" />
              <span>
                <strong>{me.name}</strong>
                {me.level}
              </span>
              {Icon.chevron}
            </button>
            {menuOpen && (
              <div className="p-2 border border-borda absolute top-[calc(100%_+_8px)] right-0 z-60 flex flex-col min-w-55 rounded-[16px] bg-superficie shadow-[0_20px_40px_rgba(36,16,91,0.14)] [&_svg]:size-4 [&_svg]:shrink-0 [&_a]:py-2.5 [&_a]:px-3 [&_a]:border-0 [&_a]:flex [&_a]:items-center [&_a]:gap-2.5 [&_a]:rounded-[10px] [&_a]:bg-transparent [&_a]:text-[14px] [&_a]:text-principal [&_a]:text-left [&_a]:cursor-pointer [&_button]:py-2.5 [&_button]:px-3 [&_button]:border-0 [&_button]:flex [&_button]:items-center [&_button]:gap-2.5 [&_button]:rounded-[10px] [&_button]:bg-transparent [&_button]:text-[14px] [&_button]:text-principal [&_button]:text-left [&_button]:cursor-pointer [&_a:hover]:bg-lilas [&_button:hover]:bg-lilas" role="menu" onClick={() => setMenuOpen(false)}>
                <a role="menuitem" href={link("perfil")}>{Icon.user} Meu perfil</a>
                <a role="menuitem" href={link("perfil/editar")}>{Icon.edit} Editar perfil</a>
                <a role="menuitem" href={link("notificacoes")}>{Icon.bell} Notificações</a>
                <button role="menuitem" type="button" onClick={() => openModal("plano")}>{Icon.medal} Plano Organizador</button>
                <button role="menuitem" type="button" onClick={logout}>{Icon.logout} Sair</button>
              </div>
            )}
          </div>
        </header>

        <main className="pt-0 pb-8 px-8 flex-1 max-xl:pb-24 max-md:pr-4 max-md:pl-4" id="conteudo" tabIndex={-1}>
          {children}
        </main>
      </div>

      <nav className="hidden max-xl:pt-2 max-xl:pb-[calc(8px_+_env(safe-area-inset-bottom))] max-xl:px-2 max-xl:fixed max-xl:right-0 max-xl:bottom-0 max-xl:left-0 max-xl:z-50 max-xl:grid max-xl:grid-cols-[repeat(5,1fr)] max-xl:items-center max-xl:border-t max-xl:border-t-borda max-xl:bg-[rgba(255,255,255,0.97)] max-xl:[backdrop-filter:blur(8px)]" aria-label="Menu principal (celular)">
        {tabItems.map((item) => (
          <a
            key={item.id}
            href={link(item.id)}
            className={[
              "tabbar-item",
              item.cta ? "tabbar-item--cta" : "",
              item.id === active ? "tabbar-item--active" : "",
            ].join(" ")}
            aria-current={item.id === active ? "page" : undefined}
          >
            <span className="max-xl:size-5.5 max-xl:[.tabbar-item--cta_&]:p-3.5 max-xl:[.tabbar-item--cta_&]:size-13 max-xl:[.tabbar-item--cta_&]:-mt-5.5 max-xl:[.tabbar-item--cta_&]:rounded-full max-xl:[.tabbar-item--cta_&]:[background:var(--gradiente-marca)] max-xl:[.tabbar-item--cta_&]:text-white max-xl:[.tabbar-item--cta_&]:shadow-[0_10px_24px_rgba(233,27,122,0.35)]">{item.icon}</span>
            <span className={item.cta ? "sr-only" : ""}>{item.label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
