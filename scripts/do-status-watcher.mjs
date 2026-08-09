// Verifica o status da DigitalOcean uma vez e alerta no Discord se algo mudou.
// Pensado para rodar via GitHub Actions (cron) + actions/cache para persistir estado.

import { readFile, writeFile } from "fs/promises";
import path from "path";

const STATUS_API = "https://status.digitalocean.com/api/v2/summary.json";
const STATE_FILE = path.resolve("./.do-status-state.json");
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

if (!WEBHOOK_URL) {
  console.error("Defina a variável de ambiente DISCORD_WEBHOOK_URL.");
  process.exit(1);
}

async function loadState() {
  try {
    const raw = await readFile(STATE_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { components: {}, incidents: {}, initialized: false };
  }
}

async function saveState(state) {
  await writeFile(STATE_FILE, JSON.stringify(state, null, 2));
}

function colorForStatus(status) {
  switch (status) {
    case "operational":
      return 0x2ecc71;
    case "degraded_performance":
      return 0xf1c40f;
    case "partial_outage":
      return 0xe67e22;
    case "major_outage":
      return 0xe74c3c;
    default:
      return 0x95a5a6;
  }
}

async function sendDiscordAlert({ title, description, color }) {
  const payload = {
    embeds: [
      {
        title,
        description,
        color,
        timestamp: new Date().toISOString(),
        footer: { text: "DigitalOcean Status" },
      },
    ],
  };

  const res = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    console.error("Falha ao enviar para o Discord:", res.status, await res.text());
    process.exitCode = 1;
  }
}

async function checkStatus() {
  const res = await fetch(STATUS_API);
  const data = await res.json();

  const state = await loadState();
  const isFirstRun = !state.initialized;

  // 1) Mudanças de status por componente
  for (const component of data.components ?? []) {
    const prev = state.components[component.id]?.status;
    if (prev !== component.status) {
      if (!isFirstRun) {
        await sendDiscordAlert({
          title: `⚠️ ${component.name}: ${prev} → ${component.status}`,
          description: `Componente **${component.name}** mudou de status.`,
          color: colorForStatus(component.status),
        });
      }
      state.components[component.id] = { name: component.name, status: component.status };
    }
  }

  // 2) Incidentes novos ou atualizados
  for (const incident of data.incidents ?? []) {
    const lastUpdate = incident.updated_at;
    const known = state.incidents[incident.id];

    if (!known || known.updated_at !== lastUpdate) {
      if (!isFirstRun) {
        const latestBody =
          incident.incident_updates?.[0]?.body?.slice(0, 500) ?? "Sem detalhes.";

        await sendDiscordAlert({
          title: `🚨 ${incident.name} — ${incident.status}`,
          description: `${latestBody}\n\n[Ver incidente](${incident.shortlink})`,
          color: colorForStatus(incident.impact === "none" ? "operational" : "major_outage"),
        });
      }
      state.incidents[incident.id] = { updated_at: lastUpdate, status: incident.status };
    }
  }

  // 3) Limpa incidentes resolvidos antigos
  const activeIds = new Set((data.incidents ?? []).map((i) => i.id));
  for (const id of Object.keys(state.incidents)) {
    if (!activeIds.has(id) && state.incidents[id].status === "resolved") {
      delete state.incidents[id];
    }
  }

  state.initialized = true;
  await saveState(state);
}

checkStatus().catch((err) => {
  console.error("Erro ao verificar status:", err);
  process.exit(1);
});
