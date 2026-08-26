const baseUrl = process.env.METABASE_URL ?? "http://metabase:3000";
const adminEmail = process.env.METABASE_ADMIN_EMAIL;
const adminPassword = process.env.METABASE_ADMIN_PASSWORD;
const editorEmail = process.env.METABASE_EDITOR_EMAIL;
const editorPassword = process.env.METABASE_EDITOR_PASSWORD;
const viewerEmail = process.env.METABASE_VIEWER_EMAIL;
const viewerPassword = process.env.METABASE_VIEWER_PASSWORD;
const analyticsReaderPassword = process.env.ANALYTICS_READER_PASSWORD;

const requiredEnvironmentVariables = {
  METABASE_ADMIN_EMAIL: adminEmail,
  METABASE_ADMIN_PASSWORD: adminPassword,
  METABASE_EDITOR_EMAIL: editorEmail,
  METABASE_EDITOR_PASSWORD: editorPassword,
  METABASE_VIEWER_EMAIL: viewerEmail,
  METABASE_VIEWER_PASSWORD: viewerPassword,
  ANALYTICS_READER_PASSWORD: analyticsReaderPassword,
};

for (const [name, value] of Object.entries(requiredEnvironmentVariables)) {
  if (!value) {
    throw new Error(`Variável obrigatória ausente: ${name}`);
  }
}

let sessionId;

async function request(pathname, options = {}) {
  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(sessionId ? { "X-Metabase-Session": sessionId } : {}),
    ...options.headers,
  };
  const response = await fetch(`${baseUrl}${pathname}`, {
    ...options,
    headers,
    body:
      options.body && typeof options.body !== "string"
        ? JSON.stringify(options.body)
        : options.body,
  });
  const responseText = await response.text();
  const responseBody = responseText
    ? (() => {
        try {
          return JSON.parse(responseText);
        } catch {
          return responseText;
        }
      })()
    : null;

  if (!response.ok) {
    throw new Error(
      `${options.method ?? "GET"} ${pathname} retornou ${response.status}: ${JSON.stringify(responseBody)}`,
    );
  }

  return responseBody;
}

async function waitForMetabase() {
  for (let attempt = 1; attempt <= 60; attempt += 1) {
    try {
      const health = await request("/api/health");
      if (health?.status === "ok") return;
    } catch {
      // O healthcheck do Compose pode encerrar antes de a rede do sidecar estabilizar.
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  throw new Error("Metabase não ficou saudável no tempo esperado.");
}

async function setupOrLogin() {
  const properties = await request("/api/session/properties");
  const setupToken = properties["setup-token"];

  if (setupToken) {
    await request("/api/setup", {
      method: "POST",
      body: {
        token: setupToken,
        user: {
          email: adminEmail,
          first_name: "Administração",
          last_name: "Check-In",
          password: adminPassword,
        },
        prefs: {
          site_name: "Check-In — Saúde da Comunidade",
          site_locale: "pt_BR",
          allow_tracking: false,
        },
      },
    });
  }

  const session = await request("/api/session", {
    method: "POST",
    body: { username: adminEmail, password: adminPassword },
  });
  sessionId = session.id;
}

async function findOrCreateGroup(name) {
  const groups = await request("/api/permissions/group");
  const existing = groups.find((group) => group.name === name);
  if (existing) return existing;
  return request("/api/permissions/group", {
    method: "POST",
    body: { name },
  });
}

async function findOrCreateUser({ email, password, firstName, groupId }) {
  const usersResponse = await request("/api/user?status=all");
  const users = Array.isArray(usersResponse)
    ? usersResponse
    : (usersResponse.data ?? []);
  let user = users.find((candidate) => candidate.email === email);
  if (!user) {
    user = await request("/api/user", {
      method: "POST",
      body: {
        email,
        first_name: firstName,
        last_name: "Check-In",
        password,
      },
    });
  }

  const memberships = await request("/api/permissions/membership");
  const userMemberships = memberships[String(user.id)] ?? [];
  const isMember = userMemberships.some(
    (membership) => membership.group_id === groupId,
  );
  if (!isMember) {
    await request("/api/permissions/membership", {
      method: "POST",
      body: { user_id: user.id, group_id: groupId },
    });
  }

  return user;
}

async function findOrCreateDatabase() {
  const response = await request("/api/database");
  const databases = response.data ?? response;
  const existing = databases.find(
    (database) => database.name === "Check-In Analytics PoC",
  );
  if (existing) return existing;

  return request("/api/database", {
    method: "POST",
    body: {
      name: "Check-In Analytics PoC",
      engine: "mysql",
      is_full_sync: true,
      is_on_demand: false,
      auto_run_queries: false,
      details: {
        host: "db",
        port: 3306,
        db: "checkindb_analytics_poc",
        user: "analytics_reader",
        password: analyticsReaderPassword,
        ssl: false,
        "tunnel-enabled": false,
      },
    },
  });
}

async function waitForAnalyticsMetadata(databaseId) {
  await request(`/api/database/${databaseId}/sync_schema`, { method: "POST" });

  const expectedViews = new Set([
    "analytics_overview",
    "analytics_activity_daily",
    "analytics_channel_activity",
    "analytics_audio_activity",
    "analytics_retention_cohort",
    "analytics_data_quality",
  ]);

  for (let attempt = 1; attempt <= 60; attempt += 1) {
    const metadata = await request(`/api/database/${databaseId}/metadata`);
    const viewNames = new Set(metadata.tables.map((table) => table.name));
    if ([...expectedViews].every((viewName) => viewNames.has(viewName))) {
      return metadata;
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error(
    "As views analíticas não apareceram no catálogo do Metabase.",
  );
}

function findFieldId(metadata, tableName, fieldName) {
  const table = metadata.tables.find(
    (candidate) => candidate.name === tableName,
  );
  const field = table?.fields.find((candidate) => candidate.name === fieldName);
  if (!field) {
    throw new Error(`Campo analítico ausente: ${tableName}.${fieldName}`);
  }
  return field.id;
}

async function findOrCreateCollection() {
  const collections = await request("/api/collection?archived=false");
  const existing = collections.find(
    (collection) => collection.name === "Saúde da Comunidade",
  );
  if (existing) return existing;

  return request("/api/collection", {
    method: "POST",
    body: {
      name: "Saúde da Comunidade",
      description:
        "Painéis agregados da PoC do Check-In, sem identificação individual.",
      parent_id: null,
    },
  });
}

function fieldFilterTag(name, displayName, fieldId, widgetType) {
  return {
    id: name,
    name,
    "display-name": displayName,
    type: "dimension",
    dimension: ["field", fieldId, null],
    "widget-type": widgetType,
    required: false,
  };
}

async function findOrUpsertCard({
  name,
  description,
  display,
  query,
  templateTags = {},
  visualizationSettings = {},
  collectionId,
  databaseId,
}) {
  const cards = await request("/api/card?f=all");
  const existing = cards.find(
    (card) => card.name === name && card.collection_id === collectionId,
  );
  const body = {
    name,
    description,
    display,
    collection_id: collectionId,
    visualization_settings: visualizationSettings,
    dataset_query: {
      type: "native",
      database: databaseId,
      native: {
        query,
        "template-tags": templateTags,
      },
    },
  };

  if (existing) {
    return request(`/api/card/${existing.id}`, { method: "PUT", body });
  }
  return request("/api/card", { method: "POST", body });
}

async function createCards({ databaseId, collectionId, metadata }) {
  const periodDaily = fieldFilterTag(
    "period",
    "Período",
    findFieldId(metadata, "analytics_activity_daily", "activity_date"),
    "date/all-options",
  );
  const channelActivity = fieldFilterTag(
    "channel",
    "Canal",
    findFieldId(metadata, "analytics_channel_activity", "channel_name"),
    "category",
  );
  const periodAudio = fieldFilterTag(
    "period",
    "Período",
    findFieldId(metadata, "analytics_audio_activity", "event_date"),
    "date/all-options",
  );
  const channelAudio = fieldFilterTag(
    "channel",
    "Canal",
    findFieldId(metadata, "analytics_audio_activity", "channel_name"),
    "category",
  );

  const definitions = [
    ["Membros", "total_members"],
    ["Canais", "total_channels"],
    ["Mensagens", "total_messages"],
    ["Reações", "total_reactions"],
    ["Total de eventos de voz", "total_audio_events"],
    ["Total de movimentos em voz", "total_voice_movements"],
  ].map(([name, column]) => ({
    name,
    description: "Indicador agregado do dataset simulado.",
    display: "scalar",
    query: `SELECT ${column} AS value FROM analytics_overview`,
    visualizationSettings: { "scalar.field": "value" },
  }));

  definitions.push(
    {
      name: "Participação diária",
      description: "Mensagens, reações e membros ativos por dia.",
      display: "line",
      query:
        "SELECT activity_date, messages, reactions, voice_joins, active_members FROM analytics_activity_daily WHERE 1 = 1 [[AND {{period}}]] ORDER BY activity_date",
      templateTags: { period: periodDaily },
      visualizationSettings: {
        "graph.dimensions": ["activity_date"],
        "graph.metrics": ["messages", "reactions", "active_members"],
      },
    },
    {
      name: "Participação por canal",
      description: "Volume agregado por canal, sem ranking de pessoas.",
      display: "row",
      query:
        "SELECT channel_name, messages, reactions, active_members, audio_events FROM analytics_channel_activity WHERE 1 = 1 [[AND {{channel}}]] ORDER BY messages DESC",
      templateTags: { channel: channelActivity },
      visualizationSettings: {
        "graph.dimensions": ["channel_name"],
        "graph.metrics": ["messages", "reactions", "active_members"],
      },
    },
    {
      name: "Eventos de voz",
      description: "Eventos, participantes declarados e duração agregada.",
      display: "bar",
      query:
        "SELECT event_date, channel_name, audio_events, declared_participants, total_minutes FROM analytics_audio_activity WHERE 1 = 1 [[AND {{period}}]] [[AND {{channel}}]] ORDER BY event_date",
      templateTags: { period: periodAudio, channel: channelAudio },
      visualizationSettings: {
        "graph.dimensions": ["event_date"],
        "graph.metrics": ["declared_participants", "total_minutes"],
      },
    },
    {
      name: "Retenção por coorte",
      description: "Retorno agregado de grupos de entrada ao longo dos meses.",
      display: "table",
      query:
        "SELECT cohort_month, activity_month, cohort_size, retained_members, retention_rate FROM analytics_retention_cohort ORDER BY cohort_month, activity_month",
    },
    {
      name: "Qualidade e cobertura dos dados",
      description: "Período coberto e ressalvas de cada fonte.",
      display: "table",
      query:
        "SELECT source_name, row_count, coverage_start, coverage_end, caveat FROM analytics_data_quality ORDER BY source_name",
    },
  );

  const cards = [];
  for (const definition of definitions) {
    cards.push(
      await findOrUpsertCard({
        ...definition,
        collectionId,
        databaseId,
      }),
    );
  }
  return cards;
}

async function findOrCreateDashboard(collectionId) {
  const dashboards = await request("/api/dashboard?f=all");
  const existing = dashboards.find(
    (dashboard) =>
      dashboard.name === "Saúde da Comunidade" &&
      dashboard.collection_id === collectionId,
  );
  if (existing) return existing;

  return request("/api/dashboard", {
    method: "POST",
    body: {
      name: "Saúde da Comunidade",
      description:
        "Leitura agregada da participação comunitária com dados simulados.",
      collection_id: collectionId,
      parameters: [
        {
          id: "period",
          name: "Período",
          slug: "period",
          type: "date/range",
        },
        {
          id: "channel",
          name: "Canal",
          slug: "channel",
          type: "string/=",
        },
      ],
    },
  });
}

function mappingsForCard(card) {
  const parametersByCardName = {
    "Participação diária": ["period"],
    "Participação por canal": ["channel"],
    "Eventos de voz": ["period", "channel"],
  };
  return (parametersByCardName[card.name] ?? []).map((parameterId) => ({
    parameter_id: parameterId,
    card_id: card.id,
    target: ["dimension", ["template-tag", parameterId]],
  }));
}

async function configureDashboard(dashboard, cards) {
  await request(`/api/dashboard/${dashboard.id}`, {
    method: "PUT",
    body: {
      parameters: [
        {
          id: "period",
          name: "Período",
          slug: "period",
          type: "date/range",
        },
        {
          id: "channel",
          name: "Canal",
          slug: "channel",
          type: "string/=",
        },
      ],
      width: "full",
    },
  });

  const current = await request(`/api/dashboard/${dashboard.id}`);
  const existingByCardId = new Map(
    (current.dashcards ?? []).map((dashcard) => [dashcard.card_id, dashcard]),
  );
  let nextTemporaryId = -1;
  const dashboardCards = cards.map((card, index) => {
    const existing = existingByCardId.get(card.id);
    const isKpi = index < 6;
    const position = isKpi
      ? { row: 0, col: index * 4, size_x: 4, size_y: 3 }
      : {
          row: 3 + Math.floor((index - 6) / 2) * 8,
          col: ((index - 6) % 2) * 12,
          size_x: 12,
          size_y: 8,
        };

    return {
      id: existing?.id ?? nextTemporaryId--,
      card_id: card.id,
      ...position,
      visualization_settings: {},
      parameter_mappings: mappingsForCard(card),
      series: [],
    };
  });

  await request(`/api/dashboard/${dashboard.id}/cards`, {
    method: "PUT",
    body: { cards: dashboardCards },
  });
}

async function configureCollectionPermissions(
  collectionId,
  editorGroup,
  viewerGroup,
) {
  const response = await fetch(`${baseUrl}/api/collection/graph`, {
    headers: { "X-Metabase-Session": sessionId },
  });
  if (!response.ok) {
    throw new Error(
      `GET /api/collection/graph retornou ${response.status}; não foi possível validar as permissões OSS.`,
    );
  }
  const graph = await response.json();
  const groups = structuredClone(graph.groups);
  const permissionGroups = await request("/api/permissions/group");
  const allUsersGroup = permissionGroups.find(
    (group) => group.magic_group_type === "all-internal-users",
  );
  if (!allUsersGroup) {
    throw new Error("Grupo interno 'All Users' não encontrado.");
  }
  groups[String(allUsersGroup.id)] = {
    ...(groups[String(allUsersGroup.id)] ?? { root: "write" }),
    [String(collectionId)]: "none",
  };
  groups[String(editorGroup.id)] = {
    ...(groups[String(editorGroup.id)] ?? { root: "none" }),
    [String(collectionId)]: "write",
  };
  groups[String(viewerGroup.id)] = {
    ...(groups[String(viewerGroup.id)] ?? { root: "none" }),
    [String(collectionId)]: "read",
  };

  await request("/api/collection/graph", {
    method: "PUT",
    body: { revision: graph.revision, groups },
  });
}

async function verifyCardQueries(cards) {
  for (const card of cards) {
    const result = await request(`/api/card/${card.id}/query`, {
      method: "POST",
      body: { ignore_cache: true, parameters: [] },
    });
    if (result.status !== "completed" || !result.data?.rows?.length) {
      throw new Error(`A pergunta "${card.name}" não retornou dados.`);
    }
  }

  const channelCard = cards.find(
    (card) => card.name === "Participação por canal",
  );
  const filteredResult = await request(`/api/card/${channelCard.id}/query`, {
    method: "POST",
    body: {
      ignore_cache: true,
      parameters: [
        {
          id: "channel",
          type: "category",
          target: ["dimension", ["template-tag", "channel"]],
          value: ["acolhimento"],
        },
      ],
    },
  });
  if (
    filteredResult.status !== "completed" ||
    filteredResult.data?.rows?.length !== 1
  ) {
    throw new Error("O filtro de canal não restringiu o cartão esperado.");
  }
}

async function loginAs(username, password) {
  const response = await fetch(`${baseUrl}/api/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) {
    throw new Error(`Falha no login de validação para ${username}.`);
  }
  return (await response.json()).id;
}

async function verifyRolePermissions({ dashboard, collection }) {
  const editorSession = await loginAs(editorEmail, editorPassword);
  const viewerSession = await loginAs(viewerEmail, viewerPassword);
  const collectionBody = JSON.stringify({
    description:
      "Painéis agregados da PoC do Check-In, sem identificação individual.",
  });

  const viewerDashboard = await fetch(
    `${baseUrl}/api/dashboard/${dashboard.id}`,
    { headers: { "X-Metabase-Session": viewerSession } },
  );
  const editorUpdate = await fetch(
    `${baseUrl}/api/collection/${collection.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Metabase-Session": editorSession,
      },
      body: collectionBody,
    },
  );
  const viewerUpdate = await fetch(
    `${baseUrl}/api/collection/${collection.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Metabase-Session": viewerSession,
      },
      body: collectionBody,
    },
  );

  if (!viewerDashboard.ok || !editorUpdate.ok || viewerUpdate.status !== 403) {
    throw new Error(
      `RBAC inesperado: dashboard=${viewerDashboard.status}, editora=${editorUpdate.status}, leitora=${viewerUpdate.status}.`,
    );
  }
}

await waitForMetabase();
await setupOrLogin();

const editorGroup = await findOrCreateGroup("Editoras");
const viewerGroup = await findOrCreateGroup("Leitoras");
await findOrCreateUser({
  email: editorEmail,
  password: editorPassword,
  firstName: "Pessoa editora",
  groupId: editorGroup.id,
});
await findOrCreateUser({
  email: viewerEmail,
  password: viewerPassword,
  firstName: "Pessoa leitora",
  groupId: viewerGroup.id,
});

const database = await findOrCreateDatabase();
const metadata = await waitForAnalyticsMetadata(database.id);
const collection = await findOrCreateCollection();
const cards = await createCards({
  databaseId: database.id,
  collectionId: collection.id,
  metadata,
});
const dashboard = await findOrCreateDashboard(collection.id);
await configureDashboard(dashboard, cards);
await configureCollectionPermissions(collection.id, editorGroup, viewerGroup);
await verifyCardQueries(cards);
await verifyRolePermissions({ dashboard, collection });

console.log(
  JSON.stringify(
    {
      status: "ok",
      database: database.name,
      collection: collection.name,
      dashboard: dashboard.name,
      cards: cards.length,
      groups: [editorGroup.name, viewerGroup.name],
    },
    null,
    2,
  ),
);
