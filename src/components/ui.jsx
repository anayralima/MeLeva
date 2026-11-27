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
    <div className={small ? "flex [&_img]:border-2 [&_img]:border-white [&_img]:rounded-full [&_img]:object-cover [&_img]:size-6 [&_img+img]:-ml-2.5" : "flex [&_img]:border-2 [&_img]:border-pagina [&_img]:size-8.5 [&_img]:rounded-full [&_img]:object-cover [&_img+img]:-ml-2.5"}>
      {ids.slice(0, max).map((id) => {
        const person = user(id);
        return <img key={id} src={person.avatar} alt={person.name} />;
      })}
    </div>
  );
}

export function FavoriteButton({ activity, className = "activity-favorite" }) {
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
    <article className="activity border border-borda flex flex-col rounded-[20px] bg-superficie overflow-hidden relative [transition:box-shadow_0.15s,transform_0.15s] hover:shadow-[var(--sombra-card)] hover:[transform:translateY(-2px)] max-xl:[.create-side_&]:max-w-90">
      <Wrapper className="flex flex-1 flex-col" {...(preview ? {} : { href: link(`atividade/${activity.id}`) })}>
        <div className="relative h-42 [&>img]:size-full [&>img]:object-cover [.activities--app_&]:h-42">
          <img src={activity.image} alt={`Foto da atividade ${activity.title}`} loading="lazy" />
          {activity.hot && <span className="tag tag--hot">{Icon.flame} Em alta</span>}
        </div>

        <div className="pt-4.5 pb-3.5 px-4.5 flex flex-col gap-2 [&_h3]:text-[17px] [&_h3]:font-bold">
          <span className="text-[11px] font-semibold tracking-[0.88px] uppercase text-rosa">{activity.sport}</span>
          <h3>{activity.title}</h3>
          <ul className="flex flex-col gap-1.5 list-none text-[13px] text-secundario [&_li]:flex [&_li]:items-center [&_li]:gap-1.5 [&_svg]:size-3.5 [&_svg]:shrink-0">
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

        <div className="pt-3 pb-4 px-4.5 flex items-center justify-between gap-3 mt-auto border-t border-t-borda">
          <div className="flex items-center gap-2 text-[12px] text-secundario">
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
      className={selected ? "p-3 border border-[#e9c7de] flex gap-4 rounded-[18px] bg-superficie [transition:box-shadow_0.15s,border-color_0.15s] max-md:flex-wrap hover:shadow-[var(--sombra-card)] [&_h3]:text-[17px] [&_h3]:font-bold" : "p-3 border border-borda flex gap-4 rounded-[18px] bg-superficie [transition:box-shadow_0.15s,border-color_0.15s] max-md:flex-wrap hover:shadow-[var(--sombra-card)] [&_h3]:text-[17px] [&_h3]:font-bold"}
      onMouseEnter={() => onSelect?.(activity.id)}
    >
      <a className="shrink-0 w-37.5 max-md:w-24 [&_img]:w-full [&_img]:h-28 [&_img]:rounded-[12px] [&_img]:object-cover max-md:[&_img]:h-24" href={link(`atividade/${activity.id}`)} tabIndex={-1} aria-hidden="true">
        <img src={activity.image} alt="" loading="lazy" />
      </a>
      <div className="py-1 px-0 flex flex-1 flex-col gap-1.5 min-w-0 max-md:basis-[calc(100%_-_112px)]">
        <div className="row-card-tags flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold tracking-[0.88px] uppercase text-rosa">{activity.sport}</span>
          {activity.hot && <span className="tag tag--hot tag--xs">{Icon.flame} Em alta</span>}
          <StatusTag activity={activity} />
        </div>
        <h3>
          <a href={link(`atividade/${activity.id}`)}>{activity.title}</a>
        </h3>
        <ul className="flex flex-wrap gap-y-1 gap-x-4 list-none text-[13px] text-secundario [&_svg]:shrink-0 [&_svg]:size-3.5 [&_li]:flex [&_li]:items-center [&_li]:gap-1.5">
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
        <div className="flex flex-wrap items-center gap-2.5 mt-0.5">
          <AvatarStack ids={activity.participants} />
          <SpotsText activity={activity} />
          <LevelTag level={activity.level} />
        </div>
      </div>
      <div className="row-card-side flex flex-col items-end justify-between gap-3 max-md:flex-row max-md:items-center max-md:w-full">
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
    <div className={compact ? "relative w-full overflow-hidden rounded-[16px] aspect-[16/9] [.meet-map--locked_&]:[filter:blur(2px)] max-xl:[.explore--map_&]:aspect-[4/3]" : "relative w-full aspect-[1/1.25] overflow-hidden rounded-[16px] [.meet-map--locked_&]:[filter:blur(2px)] max-xl:[.explore--map_&]:aspect-[4/3]"}>
      <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <rect width="100" height="100" fill="#eaf3e7" />
        <rect x="6" y="10" width="22" height="26" rx="3" fill="#d7ead1" />
        <rect x="64" y="58" width="24" height="30" rx="3" fill="#d7ead1" />
        <g stroke="#fff" strokeWidth="2.2">
          <path d="M0 34h100M0 64h100M30 0v100M62 0v100M86 0v100" />
          <path d="M0 0 100 100" strokeWidth="1.6" />
        </g>
        <path d="M0 80c14-6 24 4 38 0s22-16 36-12 18 6 26 4" stroke="#cfe0f4" strokeWidth="3" fill="none" />
      </svg>
      <span className="p-0 border-3 border-white absolute size-4.5 rounded-full [transform:translate(-50%,-50%)] bg-roxo shadow-[0_0_0_10px_rgba(106,43,192,0.18)] cursor-default" style={{ left: "52%", top: "52%" }} aria-label="Você está aqui" role="img" />
      {activities.map((activity) => {
        const pos = mapPosition(activity);
        return (
          <button
            key={activity.id}
            type="button"
            className={[
              "mapview-pin",
              pos.exact ? "mapview-pin--exact" : "",
              selectedId === activity.id ? "mapview-pin--active" : "",
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
      <span className="empty-icon">{icon}</span>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {children}
    </div>
  );
}

export function Skeleton({ rows = 3 }) {
  return (
    <div className="flex flex-col gap-3.5" aria-busy="true" aria-label="Carregando atividades">
      {Array.from({ length: rows }).map((_, index) => (
        <div className="p-3 border border-borda flex gap-4 rounded-[18px] bg-superficie" key={index}>
          <span className="rounded-[10px] [background:linear-gradient(90deg,#f1edf7_0%,#faf8fd_50%,#f1edf7_100%)] [background-size:200%_100%] [animation:shimmer_1.2s_infinite_linear] w-37.5 h-28 shrink-0 max-md:size-24" />
          <div className="flex flex-1 flex-col justify-center gap-2.5 [&_span]:rounded-[10px] [&_span]:[background:linear-gradient(90deg,#f1edf7_0%,#faf8fd_50%,#f1edf7_100%)] [&_span]:[background-size:200%_100%] [&_span]:[animation:shimmer_1.2s_infinite_linear] [&_span]:h-3">
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
      <div className={wide ? "modal-box modal-box--wide" : "modal-box"} role="dialog" aria-modal="true" aria-label={title} ref={ref}>
        <header className="modal-head">
          <h2>{title}</h2>
          <button className="icon-btn" type="button" aria-label="Fechar" onClick={onClose}>
            {Icon.close}
          </button>
        </header>
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-foot">{footer}</footer>}
      </div>
    </div>
  );
}

export function PageHead({ title, subtitle, children }) {
  return (
    <header className="flex items-end justify-between gap-4 mb-5 max-md:flex-col max-md:items-stretch [&_svg]:size-4 [&_svg]:shrink-0 [&_h1]:text-[30px] [&_h1]:font-extrabold [&_h1]:tracking-[-0.6px] max-md:[&_h1]:text-[24px] [&_p]:mt-1 [&_p]:text-[14px] [&_p]:text-secundario">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children && <div className="page-head-actions flex flex-wrap gap-2.5">{children}</div>}
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
