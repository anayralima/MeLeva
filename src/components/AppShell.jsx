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
    <div className="app">
      <a className="skip-link" href="#conteudo" onClick={(e) => { e.preventDefault(); document.getElementById("conteudo")?.focus(); }}>
        Pular para o conteúdo
      </a>
      <aside className="side">
        <a className="logo side__logo" href={link("home")} aria-label="Me Leva, ir para o início">
          Me <span>Leva</span>
        </a>

        <nav className="side__nav" aria-label="Menu principal">
          {navItems.map((item) => (
            <a
              key={item.id}
              className={item.id === active ? "side__item side__item--active" : "side__item"}
              href={link(item.id)}
              aria-current={item.id === active ? "page" : undefined}
            >
              <span className="side__icon">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <a className="btn btn--gradient btn--block side__cta" href={link("criar")}>
          {Icon.plus}
          Criar atividade
        </a>

        <div className="side__invite">
          <span className="side__invite-icon">{Icon.users}</span>
          <strong>Chame a galera</strong>
          <p>Convide amigos e pratiquem juntos.</p>
          <button className="btn btn--ghost btn--sm" type="button" onClick={() => openModal("convidar")}>
            Convidar
          </button>
        </div>
      </aside>

      <div className="app__body">
        <header className="topbar">
          <a className="logo topbar__logo" href={link("home")} aria-label="Me Leva, ir para o início">
            Me <span>Leva</span>
          </a>
          <form className="topbar__search" role="search" onSubmit={search}>
            <span className="topbar__search-icon">{Icon.search}</span>
            <input
              placeholder="Buscar atividades, esportes ou locais..."
              aria-label="Buscar atividades, esportes ou locais"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </form>

          <button className="topbar__place" type="button" onClick={() => openModal("cidade")}>
            {Icon.pin}
            {state.city}, RJ
            {Icon.chevron}
          </button>

          <a className="topbar__bell" href={link("notificacoes")} aria-label={unread ? "Notificações (há novas)" : "Notificações"}>
            {Icon.bell}
            {unread && <span />}
          </a>

          <div className="topbar__menu-wrap">
            <button
              className="topbar__user"
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
              <div className="menu" role="menu" onClick={() => setMenuOpen(false)}>
                <a role="menuitem" href={link("perfil")}>{Icon.user} Meu perfil</a>
                <a role="menuitem" href={link("perfil/editar")}>{Icon.edit} Editar perfil</a>
                <a role="menuitem" href={link("notificacoes")}>{Icon.bell} Notificações</a>
                <button role="menuitem" type="button" onClick={() => openModal("plano")}>{Icon.medal} Plano Organizador</button>
                <button role="menuitem" type="button" onClick={logout}>{Icon.logout} Sair</button>
              </div>
            )}
          </div>
        </header>

        <main className="app__content" id="conteudo" tabIndex={-1}>
          {children}
        </main>
      </div>

      <nav className="tabbar" aria-label="Menu principal (celular)">
        {tabItems.map((item) => (
          <a
            key={item.id}
            href={link(item.id)}
            className={[
              "tabbar__item",
              item.cta ? "tabbar__item--cta" : "",
              item.id === active ? "tabbar__item--active" : "",
            ].join(" ")}
            aria-current={item.id === active ? "page" : undefined}
          >
            <span className="tabbar__icon">{item.icon}</span>
            <span className={item.cta ? "sr-only" : ""}>{item.label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
