# Contexts — composição de dependências

## Responsabilidade

`src/contexts` é o composition root do projeto. Esses arquivos conhecem implementações concretas e as conectam aos contratos esperados pelos casos de uso e commands.

```text
src/contexts/
├── app.context.ts
├── database.context.ts
├── discord.context.ts
├── useChannelCases.context.ts
├── useHistoricalSyncCases.context.ts
├── useMessageCases.context.ts
├── useMessageReactionCases.context.ts
├── useRoleCases.context.ts
├── useUserCases.context.ts
├── useVoiceEventCases.context.ts
└── userEventUseCases.context.ts
```

## Inicialização do worker

`initializeApp()` executa, em essência:

1. cria `Logger`;
2. cria `PrismaClient`, `PrismaService` e sete repositórios por `initializeDatabase()`;
3. cria o client e `DiscordService` por `initializeDiscord()`;
4. lê `TOKEN_BOT`;
5. cria os casos de uso de usuário, voz, presença, mensagens, reações, cargos e canais;
6. instancia os commands, que registram seus handlers;
7. chama `discordService.registerEvents()`;
8. chama `discordService.client.login(TOKEN_BOT)`.

Se `TOKEN_BOT` não existir, o context registra o erro, mas não interrompe explicitamente a função antes de chamar `login`. Esse é o comportamento real atual.

## Database context

`initializeDatabase(logger, prismaService?)` devolve:

- `userRepository`;
- `messageRepository`;
- `messageReactionRepository`;
- `channelRepository`;
- `audioEventRepository`;
- `userEventRepository`;
- `roleRepository`.

O parâmetro opcional permite injetar um `PrismaService` em testes. Mesmo quando ele é fornecido, o código atual também instancia um `PrismaClient` que fica sem uso; isso é uma característica existente, não uma recomendação.

## Discord context

`initializeDiscord()`:

- calcula intents a partir de `EVENT_INTENTS_MAP`;
- configura partials de mensagem, canal, reação e usuário;
- cria o `Client` do Discord.js;
- envolve o client em `DiscordService`.

Ele não faz login; o login pertence ao entry point/context que controla o ciclo de vida.

## Contexts de casos de uso

| Context                   | Casos montados                                     |
| ------------------------- | -------------------------------------------------- |
| `useUserCases`            | `CreateUser`, `FindUser`, `UpdateUser`             |
| `useRoleCases`            | `UpdateUserRole`                                   |
| `useChannelCases`         | `CreateChannel`, `UpdateChannel`, `DeleteChannel`  |
| `useMessageCases`         | `RegisterMessage`                                  |
| `useMessageReactionCases` | `RegisterMessageReaction`, `RemoveMessageReaction` |
| `useVoiceEventCases`      | `RegisterVoiceEvent`, `FinalizeVoiceEvent`         |
| `userEventUseCases`       | `CreateUserEvent`                                  |

Alguns casos existem no código, mas não fazem parte do worker em tempo real, como `FindUser` retornado pelo context e os casos de importação histórica.

## Context histórico

`initializeHistoricalSyncUseCases(client, logger)` é chamado apenas por `historicalSync.ts`. Ele cria um `PrismaClient` próprio, `DiscordHistoryFetcher`, `HistoricalImportRepository`, os seis importadores e `SyncHistoryRange`.

Esse isolamento mantém o ciclo de vida do backfill separado do `initializeApp()` e permite desconectar explicitamente Prisma e Discord ao final.

## Dependências de ambiente

- `TOKEN_BOT` é lido pelos entry points/contexts antes do login;
- `DATABASE_URL` é lido internamente pelo Prisma;
- as demais variáveis `DB_*` são usadas pelo Compose e para compor a URL no ambiente.

## Leituras relacionadas

- [Application Layer](./3%20-%20Application%20Layer.md)
- [Infrastructure Layer](./4%20-%20Infrastructure%20Layer.md)
- [Sincronização Histórica](./8%20-%20Sincroniza%C3%A7%C3%A3o%20Hist%C3%B3rica.md)
