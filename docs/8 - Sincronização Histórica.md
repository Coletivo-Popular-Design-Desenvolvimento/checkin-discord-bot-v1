# Sincronização Histórica (Backfill)

**Status**: ✅ Implementado
**Versão**: 1.0

---

## Visão Geral

A sincronização histórica é um fluxo **paralelo e independente** do consumidor em tempo real (`DiscordService` + `application/command/*Command.ts`). Ela existe para popular o banco com dados que já existiam no servidor Discord **antes** do bot começar a rodar, através de um script CLI de execução única (_Single Execution Strategy_), sem tocar no caminho do bot ao vivo.

**⚠️ Escopo dos dados**: este backfill importa **usuários**, **cargos**, **canais**, **mensagens**, **reações de mensagens** e **eventos de voz/áudio** (Discord Scheduled Events). Ele não importa histórico de entrada/saída de usuários (`UserEvent`) — isso continua existindo apenas a partir do momento em que o bot está rodando e capturando os eventos do gateway em tempo real.

**⚠️ Limitação de eventos de voz**: a API REST de Guild Scheduled Events do Discord **não tem filtro por intervalo de datas** e **não retém eventos concluídos/passados indefinidamente**. O backfill importa o que `guild.scheduledEvents.fetch()` retornar no momento da execução, filtrado no lado do cliente pelo intervalo `startDate`/`endDate` pedido. Ou seja, a cobertura de eventos de voz antigos será **parcial** — isso é uma limitação conhecida da API do Discord, não um bug do bot.

**⚠️ Limitação de reações (`reactedAt`)**: a API do Discord não expõe o timestamp real de quando uma reação foi adicionada, apenas quem reagiu _agora_. Por isso `reactedAt` é aproximado pelo `platformCreatedAt` (data de criação) da mensagem reagida — mesma natureza da limitação já descrita acima para eventos de voz.

**⚠️ Limitação de cargos (`Role`/`UserRole`)**: a API do Discord não retém histórico de **quando** um cargo foi atribuído/removido (apenas o audit log, com retenção curta e permissão dedicada). `ImportUserRoles` importa apenas o **estado atual** de atribuição de cada membro, não uma linha do tempo de mudanças — e nunca remove uma atribuição existente que não veio no lote mais recente (o backfill é somente aditivo).

**⚠️ Pré-requisito: Server Members Intent**: `ImportUsers`/`ImportUserRoles` dependem de `guild.members.fetch()`, que exige o "Server Members Intent" (privileged intent) habilitado no Developer Portal do bot. O client já registra `GatewayIntentBits.GuildMembers` no código (`discord.context.ts`) — falta apenas habilitar o toggle no portal. Sem isso, a busca de membros falha ou retorna lista parcial; o erro é isolado (`runIsolated`) e não impede os demais passos.

## Por que existe separado do fluxo em tempo real

|                         | Fluxo em tempo real                               | Sincronização histórica                                     |
| ----------------------- | ------------------------------------------------- | ----------------------------------------------------------- |
| **Trigger**             | Eventos do gateway Discord (push)                 | Script CLI (`npm run sync:history`)                         |
| **Direção**             | Discord → bot (evento chega)                      | Bot → Discord (busca ativamente / pull)                     |
| **Onde vive**           | `application/command/*Command.ts`                 | `src/historicalSync.ts` (não integrado a `initializeApp()`) |
| **Repositórios usados** | `MessageRepository`, `AudioEventRepository`, etc. | `HistoricalImportRepository` (dedicado)                     |
| **Quando roda**         | Continuamente, enquanto o bot está online         | Sob demanda, uma vez por intervalo de datas                 |

Os repositórios existentes (`MessageRepository`, `AudioEventRepository`, `ChannelRepository`, `UserRepository`) **não são usados nem modificados** pelo backfill — isso minimiza o risco de regressão no caminho que já está em produção.

## Arquitetura

```
src/
├── domain/
│   ├── interfaces/
│   │   ├── services/IDiscordHistoryFetcher.ts        # Contrato do fetcher
│   │   ├── repositories/IHistoricalImportRepository.ts
│   │   └── useCases/{user,role,channel,message,messageReaction,audioEvent,sync}/I*.ts
│   ├── useCases/
│   │   ├── user/ImportUsers.ts                       # Busca e importa todos os membros da guild em chunks
│   │   ├── role/ImportUserRoles.ts                    # Busca e importa os cargos atuais de todos os membros em chunks
│   │   ├── channel/ImportChannels.ts                  # Busca e importa todos os canais de texto em chunks
│   │   ├── message/ImportMessages.ts                 # Pagina mensagens em lotes
│   │   ├── messageReaction/ImportMessageReactions.ts  # Pagina reações de mensagens em lotes
│   │   ├── audioEvent/ImportAudioEvents.ts            # Busca e importa eventos em chunks
│   │   └── sync/SyncHistoryRange.ts                   # Orquestra os seis, com isolamento de falha
│   └── types/DiscordEventTypes.ts                     # Helpers de status compartilhados com VoiceEventCommand
├── infrastructure/
│   ├── discord/fetchers/DiscordHistoryFetcher.ts       # Busca dados brutos via discord.js
│   └── persistence/repositories/HistoricalImportRepository.ts  # Escreve em transações, idempotente
├── contexts/useHistoricalSyncCases.context.ts          # Wiring de DI isolado do app.context.ts
└── historicalSync.ts                                   # Entry point da CLI (irmão de index.ts)
```

### Fluxo de execução

```mermaid
graph TD
    A[npm run sync:history] --> B[historicalSync.ts]
    B --> C[Login no Discord + aguarda ClientReady]
    C --> D[useHistoricalSyncCases.context.ts]
    D --> E[SyncHistoryRange.execute]
    E --> U[ImportUsers]
    E --> R[ImportUserRoles]
    E --> CH[ImportChannels]
    E --> F[ImportMessages]
    E --> MR[ImportMessageReactions]
    E --> G[ImportAudioEvents]
    U --> UF[DiscordHistoryFetcher.fetchGuildMembers]
    R --> RF[DiscordHistoryFetcher.fetchGuildMemberRoles]
    CH --> CHF[DiscordHistoryFetcher.fetchGuildChannels]
    F --> H[DiscordHistoryFetcher.fetchNextMessageBatch]
    MR --> MRF[DiscordHistoryFetcher.fetchNextMessageReactionsBatch]
    G --> I[DiscordHistoryFetcher.fetchAudioEventsInRange]
    U --> UJ[HistoricalImportRepository.saveUsersBatch]
    R --> RJ[HistoricalImportRepository.saveUserRolesBatch]
    CH --> CHJ[HistoricalImportRepository.saveChannelsBatch]
    F --> J[HistoricalImportRepository.saveMessagesBatch]
    MR --> MRJ[HistoricalImportRepository.saveMessageReactionsBatch]
    G --> K[HistoricalImportRepository.saveAudioEventsBatch]
    UJ --> L[(MySQL)]
    RJ --> L
    CHJ --> L
    J --> L
    MRJ --> L
    K --> L
```

`SyncHistoryRange` roda os seis passos em sequência — **Usuários → Cargos → Canais → Mensagens → Reações → Eventos de áudio** — cada um dentro do seu próprio try/catch (`runIsolated`) — uma falha em um não interrompe os demais, e o resultado final traz as contagens e mensagens de erro de cada um separadamente. A ordem é obrigatória pelas FKs do schema: cargos dependem de usuários já persistidos (`user_role.user_platform_id`), e reações dependem de mensagens já persistidas (`message_reaction.message_id`). `ImportAudioEvents` mantém sua posição atual (por último), sem dependência dos novos passos.

### Fetcher (`DiscordHistoryFetcher`)

- `fetchGuildMembers()`: busca todos os membros não-bot da guild via `guild.members.fetch()` (requer o "Server Members Intent", ver limitação acima).
- `fetchGuildChannels()`: reaproveita a mesma listagem de canais de texto (`ChannelType.GuildText`) usada por `fetchNextMessageBatch`, retornando todos os canais independentemente de terem mensagem no período.
- `fetchGuildMemberRoles()`: reaproveita o mesmo `guild.members.fetch()` de `fetchGuildMembers()` (o membro já vem com `.roles.cache`), evitando buscar a lista de membros duas vezes.
- `fetchNextMessageBatch({ startDate, endDate, batchSize, cursor? })`: resolve a guild da mesma forma que `userCommand.ts` já faz, lista os canais de texto (`ChannelType.GuildText`) uma vez, e pagina cada canal via `channel.messages.fetch({ limit: 100, before })` — o limite de 100 é do próprio Discord, então o fetcher pagina múltiplas vezes **sequencialmente** (nunca em paralelo) até juntar `batchSize` mensagens ou esgotar todos os canais. Devolve `{ messages, cursor, done }`; o `cursor` (índice do canal + id da última mensagem) permite que o use case dirija o loop lote a lote sem o fetcher guardar estado entre chamadas.
- `fetchNextMessageReactionsBatch({ startDate, endDate, batchSize, cursor? })`: mesma caminhada de canais/mensagens de `fetchNextMessageBatch`, mas para cada mensagem itera `message.reactions.cache` e chama `.users.fetch()` por emoji, coletando quem reagiu. **Nota de performance**: isso re-percorre canais/mensagens já lidos por `fetchNextMessageBatch` (chamadas adicionais ao Discord por emoji/mensagem) — aceito como trade-off, mesmo espírito de isolamento entre passos independentes já existente entre `ImportMessages`/`ImportAudioEvents`.
- `fetchAudioEventsInRange({ startDate, endDate })`: uma única chamada a `guild.scheduledEvents.fetch({ withUserCount: true })`, filtrada no cliente por `scheduledStartAt` dentro do intervalo.
- Mensagens e reações de bots são descartadas automaticamente, assim como no fluxo em tempo real (`messageCommand.ts`).

### Repositório (`HistoricalImportRepository`)

Cada lote é gravado em **uma única transação** (`prisma.$transaction`):

1. Upsert de canais e usuários por `platform_id` (idempotente — seguro rodar o mesmo intervalo mais de uma vez).
2. Upsert de `Role` por `platform_id` (mesmo padrão de upsert de usuários/canais).
3. Upsert do `EventStatus` necessário (mesmo padrão de `AudioEventRepository.findOrCreateEventStatus`).
4. `message.createMany({ skipDuplicates: true })` para mensagens; `audioEvent.upsert` por evento (permite reimportar sem duplicar nem quebrar em uma re-execução parcial); `userRole.createMany({ skipDuplicates: true })` para atribuições de cargo (apoiado na PK composta `@@id([user_platform_id, role_platform_id])` — nunca remove atribuições existentes); `messageReaction.createMany({ skipDuplicates: true })` para reações (apoiado na constraint única `@@unique([user_id, message_id, reaction_emoji])`).

## Como executar via CLI

### 1. Pré-requisitos

- `.env` configurado com `TOKEN_BOT` (token do bot Discord) e `DATABASE_URL` apontando para o banco que você quer popular.
- O bot precisa estar **no servidor (guild)** e ter permissão para ler o histórico dos canais de texto que você quer importar.
- Dependências instaladas (`npm install`).

### 2. Rodar o comando

```bash
npm run sync:history -- --start=2026-01-01 --end=2026-04-01 --batchSize=1000
```

| Argumento     | Obrigatório | Formato                  | Padrão se omitido  |
| ------------- | ----------- | ------------------------ | ------------------ |
| `--start`     | Não         | `YYYY-MM-DD` ou ISO 8601 | Hoje menos 3 meses |
| `--end`       | Não         | `YYYY-MM-DD` ou ISO 8601 | Data/hora atual    |
| `--batchSize` | Não         | inteiro                  | `1000`             |

Rodar sem nenhum argumento (`npm run sync:history`) importa os últimos 3 meses com lotes de 1000 registros.

### 3. O que esperar na saída

```
Iniciando sincronização histórica de 2026-01-01T00:00:00.000Z até 2026-04-01T00:00:00.000Z, batchSize=1000
[USER] lote 1 — 250 registros importados até agora
[USER_ROLE] lote 1 — 380 registros importados até agora
[CHANNEL] lote 1 — 18 registros importados até agora
[MESSAGE] lote 1 — 1000 registros importados até agora
[MESSAGE] lote 2 — 1842 registros importados até agora
[MESSAGE_REACTION] lote 1 — 640 registros importados até agora
[AUDIO_EVENT] lote 1 — 12 registros importados até agora
Resumo final:
  Usuários: fetched=250 created=250 skipped=0 failed=0
  Cargos: fetched=380 created=380 skipped=0 failed=0
  Canais: fetched=18 created=18 skipped=0 failed=0
  Mensagens: fetched=1842 created=1842 skipped=0 failed=0
  Reações: fetched=640 created=640 skipped=0 failed=0
  Eventos de áudio: fetched=12 created=12 skipped=0 failed=0
```

- `created` = registros novos gravados nesta execução.
- `skipped` = já existiam (idempotência via `platform_id`) — normal ao reprocessar um intervalo já importado.
- `failed` = registros que não foram gravados por erro (checar os logs `ERROR` acima do resumo para detalhes).

Em caso de erro fatal (ex.: `TOKEN_BOT` ausente, falha de conexão com o Discord/DB), a mensagem é impressa em `stderr` e o processo termina com código de saída `1`.

### 4. Conferir o resultado

```bash
npm run db:studio
```

Abra as tabelas `user`, `role`/`user_role`, `channel`, `message`, `message_reaction` e `audio_event` e confira se os registros aparecem — usuários/cargos/canais são a lista completa da guild (independente de período), enquanto mensagens/reações/eventos de áudio respeitam `platform_created_at`/`start_at` dentro do intervalo pedido.

### 5. Rodando pelo GitHub Actions (alternativa à CLI local)

Existe um workflow `workflow_dispatch` em [`.github/workflows/historical-sync.yml`](../.github/workflows/historical-sync.yml), independente do build de imagem (`docker-publish.yml`) e dos testes de PR (`ci.yml`). Ele expõe os mesmos três parâmetros (`start_date`, `end_date`, `batch_size`) pela UI do GitHub Actions.

**Pré-requisito único**: os secrets `TOKEN_BOT` e `DATABASE_URL` (apontando para o ambiente que deve ser preenchido) precisam estar cadastrados no repositório/ambiente do GitHub Actions — isso não é feito automaticamente, precisa ser configurado manualmente nas configurações do repositório.

## Reexecução e idempotência

É seguro rodar o mesmo intervalo de datas mais de uma vez: canais, usuários e cargos (`Role`) são upsertados por `platform_id`; mensagens e reações usam `skipDuplicates` (apoiadas em constraints únicas do schema); atribuições de cargo (`UserRole`) usam `skipDuplicates` apoiado na PK composta; e eventos de áudio usam `upsert`. Isso é útil se uma execução for interrompida no meio — basta rodar de novo com o mesmo `--start`/`--end`.

## O que este backfill **não** faz

- ❌ Não importa histórico de entrada/saída de usuários (`UserEvent`) — Discord não expõe timestamps reais de entrada/saída, e o schema atual de `UserEvent` não tem constraint única para suportar isso de forma idempotente.
- ❌ Não importa **quando** um cargo foi atribuído/removido — apenas o estado atual de atribuição (ver limitação de cargos acima).
- ❌ Não garante cobertura completa de eventos de voz antigos — depende do que a API do Discord ainda retiver no momento da execução.
- ❌ Não garante o timestamp real de quando uma reação foi adicionada — `reactedAt` é aproximado pela data da mensagem (ver limitação de reações acima).
- ❌ Não roda automaticamente — é sempre um comando manual (local ou via `workflow_dispatch`).

---

**Links Relacionados**:

- [1 - Documentação técnica](./1%20-%20Documentação%20técnica.md)
- [5 - Contexts](./5%20-%20Contexts.md)
- [7 - Use Cases](./7%20-%20Use%20Cases.md)
