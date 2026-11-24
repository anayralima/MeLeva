/** @file Formatação de datas, distâncias e textos em pt-BR. */

const WEEK_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const WEEK_LONG = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
const MONTH_SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const MONTH_LONG = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

export const monthShort = (date) => MONTH_SHORT[new Date(date).getMonth()];
export const monthLong = (date) => MONTH_LONG[new Date(date).getMonth()];

export function hour(date) {
  const d = new Date(date);
  const m = d.getMinutes();
  return `${String(d.getHours()).padStart(2, "0")}h${m ? String(m).padStart(2, "0") : ""}`;
}

/** "Sáb, 17 out • 07h" */
export function shortDate(iso) {
  const d = new Date(iso);
  return `${WEEK_SHORT[d.getDay()]}, ${d.getDate()} ${MONTH_SHORT[d.getMonth()]} • ${hour(d)}`;
}

/** "Sábado, 17 de outubro" */
export function longDate(iso) {
  const d = new Date(iso);
  return `${WEEK_LONG[d.getDay()]}, ${d.getDate()} de ${MONTH_LONG[d.getMonth()]}`;
}

/** "07h às 08h30" */
export function timeRange(iso, durationMin) {
  const start = new Date(iso);
  const end = new Date(start.getTime() + durationMin * 60000);
  return `${hour(start)} às ${hour(end)}`;
}

/** "Hoje • 17h", "Amanhã • 07h" ou data curta. */
export function friendlyWhen(iso, now = Date.now()) {
  const days = dayDiff(iso, now);
  if (days === 0) return `Hoje • ${hour(iso)}`;
  if (days === 1) return `Amanhã • ${hour(iso)}`;
  return shortDate(iso);
}

export function dayDiff(iso, now = Date.now()) {
  const a = new Date(iso);
  const b = new Date(now);
  const da = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const db = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((da - db) / 86400000);
}

/** "em 4 dias", "hoje", "amanhã" */
export function inDays(iso, now = Date.now()) {
  const days = dayDiff(iso, now);
  if (days === 0) return "hoje";
  if (days === 1) return "amanhã";
  if (days < 0) return `há ${-days} dias`;
  return `em ${days} dias`;
}

/** "há 5 min", "há 2 h", "ontem" */
export function timeAgo(at, now = Date.now()) {
  const min = Math.round((now - at) / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.round(h / 24);
  return d === 1 ? "ontem" : `há ${d} dias`;
}

export function clock(at) {
  const d = new Date(at);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function km(value) {
  return value < 1 ? `${Math.round(value * 1000)} m` : `${String(value).replace(".", ",")} km`;
}

export function place(activity) {
  return `${activity.region} • ${km(activity.distanceKm)}`;
}

export function weatherText(activity) {
  return `${activity.weather.temp}°C • ${activity.weather.label}`;
}

export function names(list) {
  if (list.length <= 1) return list.join("");
  return `${list.slice(0, -1).join(", ")} e ${list[list.length - 1]}`;
}

/** Data local no formato do <input type="date">. */
export function inputDate(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
