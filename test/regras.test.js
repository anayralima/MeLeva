/**
 * Testes das regras de negócio do Me Leva (documento de requisitos, seção 5).
 * Rodar: npm test
 */
import { describe, expect, it } from "vitest";
import { createSeed } from "../src/services/seed.js";
import {
  attemptLogin,
  blockPerson,
  canChat,
  canRate,
  canDirectMessage,
  canSeeAddress,
  cancelConnectionRequest,
  declineConnection,
  incomingRequests,
  removeConnection,
  requestConnection,
  filterActivities,
  findActivity,
  isStrongPassword,
  join,
  leave,
  mapPosition,
  rateActivity,
  routeKm,
  reportPerson,
  sendMessage,
  statusOf,
  validateActivity,
  visibleActivities,
  weekSummary,
} from "../src/services/rules.js";

const fresh = () => createSeed(new Date("2026-11-24T10:00:00").getTime());
// `join` confere o relógio real: estes testes usam a data de hoje para a atividade ser futura.
const today = () => createSeed(Date.now());

describe("Confirmar presença (RF18, RN02, RN03, RN05)", () => {
  it("confirma direto, sem aprovação do organizador, e libera endereço e chat", () => {
    const { state, result } = join(today(), "corrida-parque");
    const activity = findActivity(state, "corrida-parque");
    expect(result).toBe("confirmed");
    expect(statusOf(activity)).toBe("confirmed");
    expect(canSeeAddress(activity)).toBe(true);
    expect(canChat(activity)).toBe(true);
  });

  it("quem não confirmou não vê o endereço nem o chat, e o mapa é aproximado (RN04)", () => {
    const activity = findActivity(fresh(), "corrida-parque");
    expect(canSeeAddress(activity)).toBe(false);
    expect(canChat(activity)).toBe(false);
    expect(mapPosition(activity).exact).toBe(false);
  });

  it("não altera o estado original (funções puras)", () => {
    const state = fresh();
    join(state, "corrida-parque");
    expect(findActivity(state, "corrida-parque").participants).not.toContain("me");
  });
});

describe("Lista de espera (RF19, RF20, RN06, RN07, RN08)", () => {
  it("atividade lotada coloca na lista de espera, sem acesso ao chat", () => {
    // Usa a data de hoje: `join` confere o relógio real, e o futebol do seed precisa ser futuro.
    let state = createSeed(Date.now());
    state = leave(state, "futebol-society").state; // sai da fila do seed
    const { state: next, result } = join(state, "futebol-society");
    const activity = findActivity(next, "futebol-society");
    expect(result).toBe("waitlist");
    expect(canChat(activity)).toBe(false);
    expect(canSeeAddress(activity)).toBe(false);
  });

  it("quando alguém cancela, o primeiro da fila entra (por ordem de chegada)", () => {
    // "pedro" (confirmado) cancela — a primeira da fila é "beatriz", depois "me"
    const { state: next, promoted } = leave(fresh(), "futebol-society", "pedro");
    const updated = findActivity(next, "futebol-society");
    expect(promoted).toBe("beatriz");
    expect(updated.participants).toContain("beatriz");
    expect(updated.waitlist).toEqual(["me"]);
  });

  it("quem cancela perde endereço e chat", () => {
    let state = join(today(), "corrida-parque").state;
    state = leave(state, "corrida-parque").state;
    const activity = findActivity(state, "corrida-parque");
    expect(canSeeAddress(activity)).toBe(false);
    expect(canChat(activity)).toBe(false);
  });
});

describe("Avaliação (RF30, RN10, RN12)", () => {
  const now = new Date("2026-11-24T10:00:00").getTime();

  it("só avalia atividade que já aconteceu e da qual participou", () => {
    const state = fresh();
    expect(canRate(state, findActivity(state, "pedal-soberbo"), now)).toBe(true);
    expect(canRate(state, findActivity(state, "corrida-parque"), now)).toBe(false); // futura
  });

  it("não deixa avaliar duas vezes", () => {
    const state = fresh();
    const first = rateActivity(state, "pedal-soberbo", { stars: 5 }, now);
    expect(first.result).toBe("rated");
    expect(rateActivity(first.state, "pedal-soberbo", { stars: 4 }, now).result).toBe("not-allowed");
  });
});

describe("Filtros do Explorar (RF13)", () => {
  const now = new Date("2026-11-24T10:00:00").getTime();

  it("filtra por esporte e esconde lotadas quando pedido", () => {
    const list = visibleActivities(fresh());
    const corridas = filterActivities(list, { sports: ["Corrida"] }, now);
    expect(corridas.every((a) => a.sport === "Corrida")).toBe(true);
    const abertas = filterActivities(list, { openOnly: true }, now);
    expect(abertas.find((a) => a.id === "futebol-society")).toBeUndefined();
  });

  it("busca por texto ignora acentos", () => {
    const result = filterActivities(visibleActivities(fresh()), { query: "natacao" }, now);
    expect(result).toHaveLength(1);
  });

  it("não mostra atividades passadas", () => {
    const result = filterActivities(visibleActivities(fresh()), {}, now);
    expect(result.find((a) => a.id === "pedal-soberbo")).toBeUndefined();
  });
});

describe("Conta (RF01, RF04)", () => {
  it("senha forte: 8+ caracteres, número e símbolo", () => {
    expect(isStrongPassword("abc")).toBe(false);
    expect(isStrongPassword("abcdefgh1")).toBe(false);
    expect(isStrongPassword("MeLeva@2026")).toBe(true);
  });

  it("bloqueia por 15 minutos depois de 5 tentativas erradas", () => {
    let state = fresh();
    const now = Date.now();
    for (let i = 0; i < 4; i += 1) state = attemptLogin(state, "mariana@meleva.app", "errada", now).state;
    const fifth = attemptLogin(state, "mariana@meleva.app", "errada", now);
    expect(fifth.result).toBe("locked");
    // nem a senha certa entra durante o bloqueio
    expect(attemptLogin(fifth.state, "mariana@meleva.app", "MeLeva@2026", now + 60000).result).toBe("locked");
    // depois de 15 minutos, entra
    expect(attemptLogin(fifth.state, "mariana@meleva.app", "MeLeva@2026", now + 16 * 60000).result).toBe("ok");
  });
});

describe("Criar atividade (RF22, RN09)", () => {
  const base = { sport: "Corrida", title: "Corrida teste", date: "2099-01-10", time: "07:00", address: "Praça Santa Teresa", spots: 6 };

  it("aceita um formulário válido", () => {
    expect(validateActivity(base)).toEqual({});
  });

  it("exige data futura e ponto de encontro", () => {
    const errors = validateActivity({ ...base, date: "2000-01-01", address: "" });
    expect(errors.date).toBeDefined();
    expect(errors.address).toBeDefined();
  });

  it("atividade com custo precisa avisar na descrição", () => {
    expect(validateActivity({ ...base, hasCost: true, description: "Vamos correr" }).description).toBeDefined();
    expect(validateActivity({ ...base, hasCost: true, description: "Custo de R$ 10 da quadra" }).description).toBeUndefined();
  });
});

describe("Segurança (RF26, RF31, RF32, RN11)", () => {
  it("não deixa mandar mensagem no chat de atividade sem confirmar", () => {
    expect(sendMessage(fresh(), "corrida-parque", "oi").result).toBe("not-allowed");
    expect(sendMessage(fresh(), "trilha-sino", "oi").result).toBe("sent");
  });

  it("mensagem direta só entre pessoas conectadas", () => {
    expect(sendMessage(fresh(), "dm:lucas", "oi").result).toBe("sent");
    expect(sendMessage(fresh(), "dm:rafael", "oi").result).toBe("not-allowed");
  });

  it("denúncia gera protocolo e pode bloquear a pessoa", () => {
    const { state, result } = reportPerson(fresh(), { personId: "rafael", reason: "Assédio", block: true });
    expect(result).toMatch(/^ML-\d{8}-\d{4}$/);
    expect(state.blocked).toContain("rafael");
  });

  it("atividades de quem você bloqueou somem da busca", () => {
    const { state } = blockPerson(fresh(), "rafael");
    expect(visibleActivities(state).find((a) => a.organizer === "rafael")).toBeUndefined();
  });
});

describe("Conexões (RF10)", () => {
  it("lista o pedido recebido da Beatriz e permite recusar", () => {
    const state = fresh();
    expect(incomingRequests(state)).toContain("beatriz");
    expect(incomingRequests(declineConnection(state, "beatriz").state)).not.toContain("beatriz");
  });

  it("desfazer conexão tira a mensagem direta", () => {
    const state = fresh();
    expect(canDirectMessage(state, "lucas")).toBe(true);
    expect(canDirectMessage(removeConnection(state, "lucas").state, "lucas")).toBe(false);
  });

  it("pedido enviado pode ser cancelado", () => {
    const sent = requestConnection(fresh(), "pedro").state;
    expect(sent.pendingConnections).toContain("pedro");
    expect(cancelConnectionRequest(sent, "pedro").state.pendingConnections).not.toContain("pedro");
  });
});

describe("Sua semana no Início (RF11)", () => {
  const NOW = new Date("2026-11-24T10:00:00").getTime();

  it("lê o percurso informado pelo organizador", () => {
    expect(routeKm({ stats: { distance: "24 km" } })).toBe(24);
    expect(routeKm({ stats: { distance: "1.500 m" } })).toBe(1.5);
    expect(routeKm({ stats: { distance: "Quadra" } })).toBe(0);
  });

  it("soma só as atividades que a pessoa já fez nos últimos 7 dias", () => {
    const week = weekSummary(fresh(), NOW);
    expect(week.done).toBe(1);
    expect(week.km).toBe(24);
    expect(week.days).toHaveLength(7);
  });

  it("não conta atividade futura nem de quem não confirmou", () => {
    const state = fresh();
    const week = weekSummary(state, NOW);
    const future = state.activities.filter((a) => new Date(a.start).getTime() > NOW);
    expect(future.length).toBeGreaterThan(0);
    expect(week.done).toBe(1);
  });
});
