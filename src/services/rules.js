/**
 * @file Regras de negócio do Me Leva (funções puras, sem React nem navegador).
 *
 * Cada ação recebe o estado atual e devolve `{ state, result }` com um estado
 * NOVO (o original nunca é alterado). Isso deixa as regras fáceis de testar
 * (veja a pasta `test/`) e de ligar a um backend no futuro.
 *
 * As regras seguem o documento de requisitos (RN01–RN14).
 *
 * @module services/rules
 */

export const ME = "me";
export const LOGIN_MAX_ATTEMPTS = 5;
export const LOGIN_LOCK_MINUTES = 15;
export const MIN_INTERESTS = 3;
export const SPORTS = [
  "Corrida",
  "Trilha",
  "Ciclismo",
  "Futebol",
  "Yoga",
  "Vôlei",
  "Beach tênis",
  "Natação",
  "Funcional",
  "Tênis",
  "Skate",
  "Escalada",
  "Basquete",
  "Caminhada",
  "Dança",
];
export const LEVELS = ["Iniciante", "Intermediário", "Avançado", "Todos os níveis"];

/* ---------- Leitura ---------- */

/** Busca uma atividade pelo id. */
export function findActivity(state, id) {
  return state.activities.find((activity) => activity.id === id) ?? null;
}

/** Vagas livres (nunca negativo). */
export function spotsLeft(activity) {
  return Math.max(0, activity.spots - activity.participants.length);
}

/** RN06: lotada quando não há vagas. */
export function isFull(activity) {
  return spotsLeft(activity) === 0;
}

/** Já aconteceu? (compara o fim da atividade com `now`). */
export function isPast(activity, now = Date.now()) {
  return new Date(activity.start).getTime() + activity.durationMin * 60000 < now;
}

/**
 * Situação do usuário numa atividade.
 * @returns {"organizer"|"confirmed"|"waitlist"|"none"}
 */
export function statusOf(activity, userId = ME) {
  if (!activity) return "none";
  if (activity.organizer === userId) return "organizer";
  if (activity.participants.includes(userId)) return "confirmed";
  if (activity.waitlist.includes(userId)) return "waitlist";
  return "none";
}

/** Posição na lista de espera (1 = primeiro), ou 0 se não está na fila. */
export function waitlistPosition(activity, userId = ME) {
  return activity.waitlist.indexOf(userId) + 1;
}

/** RN03/RN04/RN08: endereço exato só para confirmados (e quem organiza). */
export function canSeeAddress(activity, userId = ME) {
  const status = statusOf(activity, userId);
  return status === "confirmed" || status === "organizer";
}

/** RN05: chat só para confirmados. Lista de espera não entra. */
export function canChat(activity, userId = ME) {
  return canSeeAddress(activity, userId);
}

/** RN12: só avalia quem participou, depois da data, uma única vez. */
export function canRate(state, activity, now = Date.now(), userId = ME) {
  if (!activity || !isPast(activity, now)) return false;
  if (!activity.participants.includes(userId)) return false;
  return !state.ratings[activity.id];
}

/** Atividades visíveis: publicadas, sem organizador bloqueado. */
export function visibleActivities(state) {
  return state.activities.filter(
    (activity) => activity.status === "published" && !state.blocked.includes(activity.organizer),
  );
}

/**
 * RN03/RN04: posição aproximada no mapa para quem não confirmou.
 * Desloca o ponto de forma determinística (mesmo deslocamento sempre).
 */
export function mapPosition(activity, userId = ME) {
  if (canSeeAddress(activity, userId)) return { x: activity.x, y: activity.y, exact: true };
  const seed = [...activity.id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const dx = ((seed % 7) - 3) * 1.4;
  const dy = (((seed >> 3) % 7) - 3) * 1.4;
  return { x: clamp(activity.x + dx, 4, 96), y: clamp(activity.y + dy, 4, 96), exact: false };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/* ---------- Filtros (RF13) ---------- */

export const DEFAULT_FILTERS = {
  query: "",
  sports: [],
  when: "all", // all | today | week | weekend
  period: "all", // all | morning | afternoon | night
  levels: [],
  maxKm: 10,
  openOnly: false,
  womenOnly: false,
  sort: "date", // date | distance | spots
};

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Aplica os filtros do Explorar. Só mostra atividades futuras. */
export function filterActivities(list, filters, now = Date.now()) {
  const f = { ...DEFAULT_FILTERS, ...filters };
  const today = new Date(now);
  const query = normalize(f.query);

  const result = list.filter((activity) => {
    if (isPast(activity, now)) return false;
    const start = new Date(activity.start);
    const days = (start - new Date(today.getFullYear(), today.getMonth(), today.getDate())) / 86400000;

    if (query) {
      const text = normalize(`${activity.title} ${activity.sport} ${activity.region}`);
      if (!text.includes(query)) return false;
    }
    if (f.sports.length && !f.sports.includes(activity.sport)) return false;
    if (f.when === "today" && !sameDay(start, today)) return false;
    if (f.when === "week" && days >= 7) return false;
    if (f.when === "weekend" && ![0, 6].includes(start.getDay())) return false;

    const hour = start.getHours();
    if (f.period === "morning" && hour >= 12) return false;
    if (f.period === "afternoon" && (hour < 12 || hour >= 18)) return false;
    if (f.period === "night" && hour < 18) return false;

    if (f.levels.length && !f.levels.includes(activity.level) && activity.level !== "Todos os níveis") return false;
    if (activity.distanceKm > f.maxKm) return false;
    if (f.openOnly && isFull(activity)) return false;
    if (f.womenOnly && activity.audience !== "Só mulheres") return false;
    return true;
  });

  const sorters = {
    date: (a, b) => new Date(a.start) - new Date(b.start),
    distance: (a, b) => a.distanceKm - b.distanceKm,
    spots: (a, b) => spotsLeft(b) - spotsLeft(a),
  };
  return result.sort(sorters[f.sort] ?? sorters.date);
}

/** Quantos filtros estão ativos (para o botão "Filtros • N"). */
export function countFilters(filters) {
  const f = { ...DEFAULT_FILTERS, ...filters };
  return (
    (f.sports.length ? 1 : 0) +
    (f.when !== "all" ? 1 : 0) +
    (f.period !== "all" ? 1 : 0) +
    (f.levels.length ? 1 : 0) +
    (f.maxKm !== DEFAULT_FILTERS.maxKm ? 1 : 0) +
    (f.openOnly ? 1 : 0) +
    (f.womenOnly ? 1 : 0)
  );
}

export function normalize(text = "") {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

/* ---------- Ações ---------- */

function updateActivity(state, id, change) {
  return {
    ...state,
    activities: state.activities.map((activity) => (activity.id === id ? { ...activity, ...change(activity) } : activity)),
  };
}

function notify(state, notification) {
  const item = { id: `n${Date.now()}${Math.random().toString(16).slice(2, 6)}`, read: false, at: Date.now(), ...notification };
  return { ...state, notifications: [item, ...state.notifications] };
}

/**
 * RF18/RF19/RN02: confirmar presença. Sem aprovação do organizador.
 * Se lotada, entra na lista de espera (RN06).
 */
export function join(state, id, userId = ME) {
  const activity = findActivity(state, id);
  if (!activity) return { state, result: "not-found" };
  const status = statusOf(activity, userId);
  if (status !== "none") return { state, result: status };
  if (isPast(activity)) return { state, result: "past" };
  if (activity.status && activity.status !== "published") return { state, result: "unavailable" };

  if (isFull(activity)) {
    const next = updateActivity(state, id, (a) => ({ waitlist: [...a.waitlist, userId] }));
    return { state: next, result: "waitlist" };
  }
  const next = updateActivity(state, id, (a) => ({ participants: [...a.participants, userId] }));
  return { state: next, result: "confirmed" };
}

/**
 * RF20/RN07/RN08: cancelar participação. A vaga vai para o primeiro da fila,
 * por ordem de chegada; quem cancelou perde endereço e chat.
 */
export function leave(state, id, userId = ME) {
  const activity = findActivity(state, id);
  if (!activity) return { state, result: "not-found" };
  const status = statusOf(activity, userId);

  if (status === "waitlist") {
    const next = updateActivity(state, id, (a) => ({ waitlist: a.waitlist.filter((u) => u !== userId) }));
    return { state: next, result: "left-waitlist" };
  }
  if (status !== "confirmed") return { state, result: status };

  let promoted = null;
  let next = updateActivity(state, id, (a) => {
    const participants = a.participants.filter((u) => u !== userId);
    const [first, ...rest] = a.waitlist;
    if (first) {
      promoted = first;
      return { participants: [...participants, first], waitlist: rest };
    }
    return { participants };
  });
  if (promoted === ME) {
    next = notify(next, { type: "participant", text: `Abriu uma vaga e você entrou em ${activity.title}! O endereço já está liberado.`, link: `atividade/${id}` });
  }
  return { state: next, result: "left", promoted };
}

/** RF14: favoritar / desfavoritar. */
export function toggleFavorite(state, id) {
  const has = state.favorites.includes(id);
  return {
    state: { ...state, favorites: has ? state.favorites.filter((f) => f !== id) : [...state.favorites, id] },
    result: has ? "removed" : "added",
  };
}

/** Valida o formulário de criação (RF22). Devolve um objeto de erros. */
export function validateActivity(form, now = Date.now()) {
  const errors = {};
  if (!form.sport) errors.sport = "Escolha o esporte.";
  if (!form.title || form.title.trim().length < 4) errors.title = "Dê um título com pelo menos 4 letras.";
  if (!form.date) errors.date = "Escolha a data.";
  if (!form.time) errors.time = "Escolha o horário.";
  if (form.date && form.time && new Date(`${form.date}T${form.time}`).getTime() < now) {
    errors.date = "A data precisa ser no futuro.";
  }
  if (!form.address || form.address.trim().length < 6) errors.address = "Informe o ponto de encontro.";
  if (!(form.spots >= 2 && form.spots <= 50)) errors.spots = "Entre 2 e 50 vagas.";
  if (form.hasCost && !/(r\$|custo|pago|patroc|marca|inscri)/i.test(form.description || "")) {
    errors.description = "Atividade com custo ou marca precisa dizer isso na descrição (RN09).";
  }
  return errors;
}

/** Converte o formulário em atividade e publica (ou salva rascunho — RF25). */
export function saveActivity(state, form, { draft = false } = {}) {
  const id = form.id || `${slug(form.title || "atividade")}-${Date.now().toString(36)}`;
  const existing = findActivity(state, id);
  const activity = {
    id,
    sport: form.sport,
    title: form.title?.trim() || "Atividade sem título",
    image: form.image,
    start: form.date && form.time ? new Date(`${form.date}T${form.time}`).toISOString() : new Date().toISOString(),
    durationMin: Number(form.durationMin) || 60,
    region: form.region || "Centro",
    distanceKm: existing?.distanceKm ?? 1,
    address: form.address?.trim() || "",
    x: existing?.x ?? 46,
    y: existing?.y ?? 48,
    level: form.level,
    spots: Number(form.spots),
    audience: form.audience,
    organizer: ME,
    participants: existing?.participants ?? [ME],
    waitlist: existing?.waitlist ?? [],
    hot: false,
    stats: { distance: form.distanceText || "—", pace: form.level },
    bring: existing?.bring ?? ["Água"],
    description: form.description?.trim() || "",
    weather: existing?.weather ?? { temp: 21, label: "céu limpo", icon: "sun", rain: 0 },
    status: draft ? "draft" : "published",
  };
  const activities = existing
    ? state.activities.map((a) => (a.id === id ? activity : a))
    : [activity, ...state.activities];
  return { state: { ...state, activities }, result: id };
}

export function slug(text) {
  return normalize(text)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

/** RF30/RN10/RN12: avaliação é da atividade. */
export function rateActivity(state, id, rating, now = Date.now()) {
  const activity = findActivity(state, id);
  if (!canRate(state, activity, now)) return { state, result: "not-allowed" };
  if (!(rating.stars >= 1 && rating.stars <= 5)) return { state, result: "invalid" };
  return { state: { ...state, ratings: { ...state.ratings, [id]: { ...rating, at: now } } }, result: "rated" };
}

/** RN11: protocolo de denúncia com data e hora. */
export function protocol(now = Date.now(), random = Math.random) {
  const d = new Date(now);
  const pad = (n) => String(n).padStart(2, "0");
  const code = Math.floor(random() * 9000 + 1000);
  return `ML-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${code}`;
}

/** RF31/RF32: denunciar (e opcionalmente bloquear) uma pessoa. */
export function reportPerson(state, { personId, reason, story, activityId, block }, now = Date.now()) {
  if (!personId || !reason) return { state, result: "invalid" };
  const id = protocol(now);
  let next = { ...state, reports: [...state.reports, { id, kind: "person", personId, reason, story, activityId, at: now }] };
  if (block) next = blockPerson(next, personId).state;
  return { state: next, result: id };
}

/** RF33: reportar atividade. */
export function reportActivity(state, { activityId, reasons, story }, now = Date.now()) {
  if (!activityId || !reasons?.length) return { state, result: "invalid" };
  const id = protocol(now);
  return { state: { ...state, reports: [...state.reports, { id, kind: "activity", activityId, reasons, story, at: now }] }, result: id };
}

/** RF32: bloquear. A pessoa some das listas e perde a conexão. */
export function blockPerson(state, personId) {
  if (state.blocked.includes(personId)) return { state, result: "already" };
  return {
    state: {
      ...state,
      blocked: [...state.blocked, personId],
      connections: state.connections.filter((c) => c !== personId),
      following: state.following.filter((c) => c !== personId),
    },
    result: "blocked",
  };
}

/** RF10: enviar pedido de conexão. */
export function requestConnection(state, personId) {
  if (state.connections.includes(personId) || state.pendingConnections.includes(personId)) return { state, result: "already" };
  return { state: { ...state, pendingConnections: [...state.pendingConnections, personId] }, result: "sent" };
}

/** RF10: aceitar pedido de conexão recebido. */
export function acceptConnection(state, personId) {
  if (state.connections.includes(personId)) return { state, result: "already" };
  return {
    state: {
      ...state,
      connections: [...state.connections, personId],
      notifications: state.notifications.map((n) => (n.request === personId ? { ...n, request: null, read: true, accepted: true } : n)),
    },
    result: "accepted",
  };
}

/** Decisão pendente do grupo, assumida no MVP: mensagem direta só entre conectados. */
export function canDirectMessage(state, personId) {
  return state.connections.includes(personId) && !state.blocked.includes(personId);
}

/** RF26: enviar mensagem num chat (de atividade ou direto). */
export function sendMessage(state, chatId, text, now = Date.now()) {
  const clean = text.trim();
  if (!clean) return { state, result: "empty" };
  if (chatId.startsWith("dm:")) {
    if (!canDirectMessage(state, chatId.slice(3))) return { state, result: "not-allowed" };
  } else if (!canChat(findActivity(state, chatId))) {
    return { state, result: "not-allowed" };
  }
  const messages = { ...state.messages, [chatId]: [...(state.messages[chatId] ?? []), { from: ME, text: clean, at: now }] };
  return { state: { ...state, messages }, result: "sent" };
}

/* ---------- Conta (RF01–RF07) ---------- */

/** Regra de senha forte do cadastro: 8+ caracteres, número e símbolo. */
export function passwordChecks(password = "") {
  return {
    length: password.length >= 8,
    number: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
}

export function isStrongPassword(password) {
  return Object.values(passwordChecks(password)).every(Boolean);
}

export function isValidEmail(email = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * RF04: tentativa de login. Bloqueia por 15 min após 5 erros seguidos.
 * As contas ficam em `state.accounts` (protótipo: sem backend).
 */
export function attemptLogin(state, email, password, now = Date.now()) {
  const auth = state.auth;
  if (auth.lockedUntil && auth.lockedUntil > now) {
    return { state, result: "locked", minutes: Math.ceil((auth.lockedUntil - now) / 60000) };
  }
  const account = state.accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
  if (account && account.password === password) {
    return { state: { ...state, auth: { attempts: 0, lockedUntil: null }, session: { email: account.email, at: now } }, result: "ok" };
  }
  const attempts = (auth.lockedUntil && auth.lockedUntil <= now ? 0 : auth.attempts) + 1;
  const locked = attempts >= LOGIN_MAX_ATTEMPTS;
  return {
    state: { ...state, auth: { attempts: locked ? 0 : attempts, lockedUntil: locked ? now + LOGIN_LOCK_MINUTES * 60000 : null } },
    result: locked ? "locked" : "wrong",
    remaining: LOGIN_MAX_ATTEMPTS - attempts,
    minutes: locked ? LOGIN_LOCK_MINUTES : 0,
  };
}

/** RF13 (calendário): gera um arquivo .ics para adicionar à agenda (RF21). */
export function toIcs(activity, showAddress) {
  const start = new Date(activity.start);
  const end = new Date(start.getTime() + activity.durationMin * 60000);
  const fmt = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const where = showAddress ? activity.address : `${activity.region}, Teresópolis`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Me Leva//MVP//PT-BR",
    "BEGIN:VEVENT",
    `UID:${activity.id}@meleva`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${activity.title} (Me Leva)`,
    `LOCATION:${where.replace(/,/g, "\\,")}`,
    `DESCRIPTION:${activity.description.replace(/\n/g, " ").replace(/,/g, "\\,")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/** Organizador cancela a própria atividade: todos são avisados. */
export function cancelActivity(state, id) {
  const activity = findActivity(state, id);
  if (!activity || activity.organizer !== ME) return { state, result: "not-allowed" };
  return { state: updateActivity(state, id, () => ({ status: "canceled" })), result: "canceled" };
}

/** Cancelada pelo organizador? */
export function isCanceled(activity) {
  return activity?.status === "canceled";
}
