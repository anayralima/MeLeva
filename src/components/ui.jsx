/** @file Componentes reutilizáveis (RNF07: design system). */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Icon } from "../icons.jsx";
import { useStore } from "../store.jsx";
import { isFull, mapPosition, spotsLeft, statusOf, toggleFavorite, waitlistPosition } from "../services/rules.js";
import { friendlyWhen, place, shortDate, weatherText } from "../utils/format.js";

export function link(path) {
  return `#/${path}`;
}

export function go(path) {
  window.location.hash = `#/${path}`;
}

const LEVEL_TONE = {
  Iniciante: "green",
  Intermediário: "blue",
  Intermediária: "blue",
  Avançado: "pink",
  Avançada: "pink",
  "Todos os níveis": "lilac",
};

export function LevelTag({ level }) {
  return <span className={`tag tag--${LEVEL_TONE[level] ?? "lilac"}`}>{level}</span>;
}

export function WeatherIcon({ activity }) {
  return Icon[activity.weather.icon] ?? Icon.sun;
}

export function AvatarStack({ ids, max = 3, small = true }) {
  const { user } = useStore();
  return (
    <div className={small ? "people__avatars people__avatars--sm" : "people__avatars"}>
      {ids.slice(0, max).map((id) => {
        const person = user(id);
        return <img key={id} src={person.avatar} alt={person.name} />;
      })}
    </div>
  );
}

export function FavoriteButton({ activity, className = "activity__favorite" }) {
  const { state, run, toast } = useStore();
  const active = state.favorites.includes(activity.id);
  return (
    <button
      className={active ? `${className} is-active` : className}
      type="button"
      aria-pressed={active}
      aria-label={active ? `Remover ${activity.title} dos favoritos` : `Salvar ${activity.title} nos favoritos`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        const { result } = run(toggleFavorite, activity.id);
        toast(result === "added" ? "Salvo nos favoritos" : "Removido dos favoritos");
      }}
    >
      {Icon.heart}
    </button>
  );
}

export function SpotsText({ activity }) {
  if (isFull(activity)) {
    return <span className="spots spots--full">Lotada • {activity.participants.length}/{activity.spots}</span>;
  }
  return (
    <span className="spots">
      {activity.participants.length}/{activity.spots} vagas
    </span>
  );
}

export function StatusTag({ activity }) {
  const status = statusOf(activity);
  if (status === "organizer") return <span className="tag tag--pink">Organizando</span>;
  if (status === "confirmed") return <span className="tag tag--green">Confirmado</span>;
  if (status === "waitlist") return <span className="tag tag--lilac">Na lista de espera • {waitlistPosition(activity)}º</span>;
  return null;
}

/** Card de atividade em grade (Início, Favoritos, prévia do Criar). */
export function ActivityCard({ activity, preview = false }) {
  const Wrapper = preview ? "div" : "a";
  return (
    <article className="activity">
      <Wrapper className="activity__link" {...(preview ? {} : { href: link(`atividade/${activity.id}`) })}>
        <div className="activity__cover">
          <img src={activity.image} alt={`Foto da atividade ${activity.title}`} loading="lazy" />
          {activity.hot && <span className="tag tag--hot">{Icon.flame} Em alta</span>}
        </div>

        <div className="activity__body">
          <span className="activity__sport">{activity.sport}</span>
          <h3>{activity.title}</h3>
          <ul className="activity__meta">
            <li>
              {Icon.calendar}
              {shortDate(activity.start)}
            </li>
            <li>
              {Icon.mapPin}
              {place(activity)}
            </li>
            <li>
              <WeatherIcon activity={activity} />
              {weatherText(activity)}
            </li>
          </ul>
        </div>

        <div className="activity__footer">
          <div className="activity__people">
            <AvatarStack ids={activity.participants} />
            <SpotsText activity={activity} />
          </div>
          <LevelTag level={activity.level} />
        </div>
      </Wrapper>
      {!preview && <FavoriteButton activity={activity} />}
    </article>
  );
}

/** Card em linha (Explorar). */
export function ActivityRow({ activity, selected, onSelect }) {
  const full = isFull(activity);
  const status = statusOf(activity);
  return (
    <article
      className={selected ? "row-card row-card--selected" : "row-card"}
      onMouseEnter={() => onSelect?.(activity.id)}
    >
      <a className="row-card__img" href={link(`atividade/${activity.id}`)} tabIndex={-1} aria-hidden="true">
        <img src={activity.image} alt="" loading="lazy" />
      </a>
      <div className="row-card__body">
        <div className="row-card__tags">
          <span className="activity__sport">{activity.sport}</span>
          {activity.hot && <span className="tag tag--hot tag--xs">{Icon.flame} Em alta</span>}
          <StatusTag activity={activity} />
        </div>
        <h3>
          <a href={link(`atividade/${activity.id}`)}>{activity.title}</a>
        </h3>
        <ul className="row-card__meta">
          <li>
            {Icon.calendar}
            {friendlyWhen(activity.start)}
          </li>
          <li>
            {Icon.mapPin}
            {place(activity)}
          </li>
          <li>
            <WeatherIcon activity={activity} />
            {weatherText(activity)}
          </li>
        </ul>
        <div className="row-card__foot">
          <AvatarStack ids={activity.participants} />
          <SpotsText activity={activity} />
          <LevelTag level={activity.level} />
        </div>
      </div>
      <div className="row-card__side">
        <FavoriteButton activity={activity} className="icon-btn" />
        <a className="btn btn--lilac btn--sm" href={link(`atividade/${activity.id}`)}>
          {status === "none" && full ? "Lista de espera" : "Ver detalhes"}
        </a>
      </div>
    </article>
  );
}

/** Mapa ilustrativo de Teresópolis com pinos (RF12 / RN04). */
export function MapView({ activities, selectedId, onSelect, compact = false }) {
  return (
    <div className={compact ? "mapview mapview--compact" : "mapview"}>
      <svg className="mapview__art" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <rect width="100" height="100" fill="#eaf3e7" />
        <rect x="6" y="10" width="22" height="26" rx="3" fill="#d7ead1" />
        <rect x="64" y="58" width="24" height="30" rx="3" fill="#d7ead1" />
        <g stroke="#fff" strokeWidth="2.2">
          <path d="M0 34h100M0 64h100M30 0v100M62 0v100M86 0v100" />
          <path d="M0 0 100 100" strokeWidth="1.6" />
        </g>
        <path d="M0 80c14-6 24 4 38 0s22-16 36-12 18 6 26 4" stroke="#cfe0f4" strokeWidth="3" fill="none" />
      </svg>
      <span className="mapview__me" style={{ left: "52%", top: "52%" }} aria-label="Você está aqui" role="img" />
      {activities.map((activity) => {
        const pos = mapPosition(activity);
        return (
          <button
            key={activity.id}
            type="button"
            className={[
              "mapview__pin",
              pos.exact ? "mapview__pin--exact" : "",
              selectedId === activity.id ? "mapview__pin--active" : "",
            ].join(" ")}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            aria-label={`${activity.title}, ${place(activity)}${pos.exact ? "" : " (local aproximado)"}`}
            onClick={() => (onSelect ? onSelect(activity.id) : go(`atividade/${activity.id}`))}
          />
        );
      })}
    </div>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={checked ? "switch switch--on" : "switch"}
      onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  );
}

export function EmptyState({ icon = Icon.search, title, text, children }) {
  return (
    <div className="empty">
      <span className="empty__icon">{icon}</span>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {children}
    </div>
  );
}

export function Skeleton({ rows = 3 }) {
  return (
    <div className="skeleton-list" aria-busy="true" aria-label="Carregando atividades">
      {Array.from({ length: rows }).map((_, index) => (
        <div className="skeleton" key={index}>
          <span className="skeleton__img" />
          <div className="skeleton__lines">
            <span style={{ width: "30%" }} />
            <span style={{ width: "60%" }} />
            <span style={{ width: "80%" }} />
            <span style={{ width: "45%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Janela modal acessível: foco inicial, Esc fecha, clique fora fecha. */
export function Modal({ title, onClose, children, footer, wide = false }) {
  const ref = useRef(null);

  useEffect(() => {
    const previous = document.activeElement;
    ref.current?.querySelector("input, textarea, button, select, a")?.focus();
    function onKey(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previous?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="modal" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className={wide ? "modal__box modal__box--wide" : "modal__box"} role="dialog" aria-modal="true" aria-label={title} ref={ref}>
        <header className="modal__head">
          <h2>{title}</h2>
          <button className="icon-btn" type="button" aria-label="Fechar" onClick={onClose}>
            {Icon.close}
          </button>
        </header>
        <div className="modal__body">{children}</div>
        {footer && <footer className="modal__foot">{footer}</footer>}
      </div>
    </div>
  );
}

export function PageHead({ title, subtitle, children }) {
  return (
    <header className="page-head">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children && <div className="page-head__actions">{children}</div>}
    </header>
  );
}

export function spotsSummary(activity) {
  const left = spotsLeft(activity);
  return left === 1 ? "1 vaga restante" : `${left} vagas restantes`;
}

/**
 * Seletor de opções lado a lado (Data, Horário, Nível…), feito com Tailwind.
 * Ocupa a largura toda e reparte o espaço igualmente. Quando as opções não cabem numa
 * linha, passa para 2 por linha (ou 1, se o número de opções for ímpar), sem deixar
 * uma opção sozinha embaixo.
 * `pill`: versão compacta e arredondada (ex.: Lista / Mapa). `tabs`: usa papéis de aba.
 */
export function Segmented({ options, value, onChange, label, pill = false, tabs = false }) {
  const ref = useRef(null);
  const [cols, setCols] = useState(options.length);
  const minWidth = Math.max(...options.map((o) => o.label.length)) * 7.5 + 32;

  useLayoutEffect(() => {
    if (pill || !ref.current) return undefined;
    const el = ref.current;
    const fit = () => {
      const inner = el.clientWidth - 8;
      const n = options.length;
      const need = (k) => k * minWidth + (k - 1) * 4;
      if (inner >= need(n)) setCols(n);
      else setCols(n % 2 === 0 && inner >= need(2) ? 2 : 1);
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, [pill, options.length, minWidth]);

  return (
    <div
      ref={ref}
      role={tabs ? "tablist" : "group"}
      aria-label={label}
      className={pill ? "inline-flex gap-1 rounded-full bg-lilas p-1" : "grid w-full gap-1 rounded-[14px] bg-lilas p-1"}
      style={pill ? undefined : { gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const active = option.id === value;
        const state = tabs ? { role: "tab", "aria-selected": active } : { "aria-pressed": active };
        return (
          <button
            key={option.id}
            type="button"
            {...state}
            onClick={() => onChange(option.id)}
            className={[
              "inline-flex cursor-pointer items-center justify-center gap-1.5 border-0 py-2.5 text-[13px] whitespace-nowrap transition-colors [&_svg]:size-4",
              pill ? "rounded-full px-4" : "rounded-[10px] px-3",
              active
                ? "bg-superficie font-semibold text-rosa-texto shadow-[0_2px_8px_rgba(36,16,91,0.1)]"
                : "bg-transparent font-medium text-secundario hover:text-principal",
            ].join(" ")}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
