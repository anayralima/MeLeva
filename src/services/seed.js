/**
 * @file Monta o estado inicial da demonstração a partir da pasta `data/`.
 *
 * As datas das atividades são relativas a "hoje" (`dayOffset`), para que a
 * demo sempre mostre atividades futuras e um histórico recente.
 */
import usersData from "../../data/usuarios.json";
import activitiesData from "../../data/atividades.json";
import chatsData from "../../data/conversas.json";
import notificationsData from "../../data/notificacoes.json";

export const SEED_VERSION = 4;

export const DEMO_ACCOUNT = { email: "mariana@meleva.app", password: "MeLeva@2026" };

const FILLER_NAMES = ["Gabriel", "Larissa", "Diego", "Patrícia", "Felipe", "Renata", "Bruno", "Sofia", "Igor"];

function fillerUsers() {
  return FILLER_NAMES.map((name, index) => ({
    id: `a${index + 1}`,
    name: `${name} ${["S.", "M.", "R.", "C.", "L."][index % 5]}`,
    firstName: name,
    avatar: `/assets/landing/avatar-${(index % 10) + 1}.webp`,
    level: ["Iniciante", "Intermediário", "Avançado"][index % 3],
    age: 20 + index * 2,
    city: "Teresópolis, RJ",
    since: "2026",
    bio: "",
    sports: ["Futebol", "Funcional"],
    availability: ["Noite"],
    rating: 4.7,
    created: 0,
    km: 20,
    verified: false,
  }));
}

function startFrom(dayOffset, time, now) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date(now);
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

export function createSeed(now = Date.now()) {
  const users = {};
  [...usersData, ...fillerUsers()].forEach((user) => {
    users[user.id] = user;
  });

  const activities = activitiesData.map(({ dayOffset, time, ...activity }) => ({
    ...activity,
    start: startFrom(dayOffset, time, now),
    status: "published",
  }));

  const messages = {};
  Object.entries(chatsData).forEach(([chatId, list]) => {
    messages[chatId] = list.map(({ minutesAgo, ...message }) => ({ ...message, at: now - minutesAgo * 60000 }));
  });

  const notifications = notificationsData.map(({ minutesAgo, ...item }) => ({ ...item, at: now - minutesAgo * 60000 }));

  return {
    version: SEED_VERSION,
    accounts: [{ ...DEMO_ACCOUNT, userId: "me" }],
    session: null,
    auth: { attempts: 0, lockedUntil: null },
    users,
    activities,
    favorites: ["yoga-praca", "beach-clube"],
    messages,
    readChats: {},
    notifications,
    connections: ["lucas", "juliana"],
    pendingConnections: [],
    following: ["juliana"],
    blocked: [],
    reports: [],
    ratings: {
      "corrida-lago": { stars: 5, tags: ["Pontual", "Bem organizada"], asDescribed: "yes", comment: "Muito bom!", at: now - 13 * 86400000 },
      "trilha-mirante": { stars: 4, tags: ["Lugar bonito"], asDescribed: "yes", comment: "", at: now - 19 * 86400000 },
    },
    trustContact: { name: "Mãe", phone: "(21) 99999-0000", enabled: true },
    notificationPrefs: { participants: true, reminders: true, rain: true, connections: true, nearby: true },
    city: "Teresópolis",
    draftActivity: null,
  };
}
