# Documentação técnica — Check-in Bot

## Visão geral

O sistema é um worker Node.js/TypeScript que recebe eventos do Discord Gateway e grava metadados em MariaDB/MySQL por meio do Prisma. Um segundo entry point executa sincronização histórica sob demanda.

O repositório usa uma separação inspirada em Clean Architecture:

| Camada           | Responsabilidade real                                                        |
| ---------------- | ---------------------------------------------------------------------------- |
| `domain`         | Entidades, tipos, contratos e casos de uso.                                  |
| `application`    | Adaptação dos eventos Discord em chamadas aos casos de uso e serviço de log. |
| `infrastructure` | Integração Discord.js, fetch histórico, Prisma e repositórios.               |
| `contexts`       | Composition root e injeção manual das dependências.                          |
| `tests`          | Testes de casos de uso, commands, adapters, repositórios e contexts.         |
| `oldApp`         | Código legado preservado, fora dos entry points atuais.                      |

Os casos de uso concretos ficam em `domain/useCases`, portanto a fronteira atual não é uma Clean Architecture estrita. A pasta `application/query` existe, mas sua única unidade, `userQuery.ts`, está vazia; assim, CQRS é uma direção estrutural, não uma camada de leitura implementada.

## Entry points

### Worker em tempo real

`src/index.ts` carrega `.env` e chama `initializeApp()`.

```text
index.ts
  -> app.context.ts
     -> database.context.ts
     -> discord.context.ts
     -> contexts de casos de uso
     -> instancia commands
     -> DiscordService.registerEvents()
     -> client.login(TOKEN_BOT)
```

Os constructors dos commands registram callbacks no `DiscordService`. Depois disso, `registerEvents()` conecta esses callbacks aos eventos do Discord.js.

### Sincronização histórica

`src/historicalSync.ts` possui ciclo de vida separado:

```text
historicalSync.ts
  -> login e espera ClientReady
  -> useHistoricalSyncCases.context.ts
  -> SyncHistoryRange
  -> DiscordHistoryFetcher + HistoricalImportRepository
  -> encerra Prisma e cliente Discord
```

Veja [8 - Sincronização Histórica](./8%20-%20Sincroniza%C3%A7%C3%A3o%20Hist%C3%B3rica.md).

## Fluxo em tempo real

| Evento Discord                            | Command                  | Caso de uso principal                             | Efeito persistido                                                          |
| ----------------------------------------- | ------------------------ | ------------------------------------------------- | -------------------------------------------------------------------------- |
| `ClientReady`                             | `UserCommand`            | `CreateUser.executeMany`                          | sincroniza membros não-bot disponíveis                                     |
| `GuildMemberAdd`                          | `UserCommand`            | `CreateUser`/`UpdateUser`                         | cria ou reativa membro                                                     |
| `GuildMemberRemove`                       | `UserCommand`            | `UpdateUser.executeInvertUserStatus`              | marca membro como inativo                                                  |
| `GuildMemberUpdate`                       | `RoleUpdateCommand`      | `UpdateUserRole.syncUserRoles`                    | sincroniza relações atuais de cargos                                       |
| `ChannelCreate/Update/Delete`             | `ChannelCommand`         | `CreateChannel`/`UpdateChannel`/`DeleteChannel`   | mantém canais                                                              |
| `MessageCreate`                           | `MessageCommand`         | `RegisterMessage`                                 | grava metadados da mensagem                                                |
| `MessageReactionAdd/Remove`               | `MessageReactionCommand` | `RegisterMessageReaction`/`RemoveMessageReaction` | inclui ou remove reação                                                    |
| `GuildScheduledEventCreate/Update/Delete` | `VoiceEventCommand`      | `RegisterVoiceEvent`/`FinalizeVoiceEvent`         | persiste transição ativa e finalização; demais estados ficam apenas no log |
| `VoiceStateUpdate`                        | `UserEventCommand`       | `CreateUserEvent`                                 | registra entrada/saída em voz                                              |

O conteúdo de `Message.content` não é enviado aos casos de uso nem ao banco.

## Estrutura

```text
src/
├── application/
│   ├── command/
│   ├── query/
│   └── services/
├── contexts/
├── domain/
│   ├── dtos/
│   ├── entities/
│   ├── interfaces/
│   ├── types/
│   └── useCases/
├── infrastructure/
│   ├── discord/
│   └── persistence/
├── oldApp/
├── tests/
├── historicalSync.ts
└── index.ts
```

## Direção de dependências observada

- os casos de uso dependem de interfaces de repositório e serviço;
- os repositórios Prisma implementam as interfaces do domínio;
- os commands dependem das interfaces dos casos de uso e de tipos Discord.js para adaptação;
- os contexts podem conhecer todas as implementações necessárias para montar o grafo;
- o domínio não importa Prisma, Express ou configuração de ambiente;
- `src/oldApp` não é importado pelo fluxo novo.

## Discord Gateway

`discord.context.ts` deriva as intents do mapa de eventos e habilita partials de mensagem, canal, reação e usuário. Os fluxos atuais precisam de:

- `Guilds`;
- `GuildMembers`;
- `GuildMessages`;
- `GuildMessageReactions`;
- `GuildScheduledEvents`;
- `GuildVoiceStates`.

O Server Members Intent também precisa ser habilitado no Discord Developer Portal. Permissões de leitura de canais e histórico dependem da configuração do bot no servidor.

## Persistência

O schema canônico está em `src/infrastructure/persistence/prisma/models/schema.prisma`. Ele usa o provider Prisma `mysql`, compatível com MariaDB/MySQL, e gera também um DBML em `models/dbml/`.

Repositórios de tempo real:

- `UserRepository`;
- `RoleRepository`;
- `ChannelRepository`;
- `MessageRepository`;
- `MessageReactionRepository`;
- `AudioEventRepository`;
- `UserEventRepository`.

O backfill usa `HistoricalImportRepository`, separado dos repositórios acima, para gravar lotes em transações e suportar reexecução.

## Configuração

| Variável                 | Uso                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------ |
| `TOKEN_BOT`              | autenticação do cliente Discord                                                      |
| `DATABASE_URL`           | conexão usada pelo Prisma                                                            |
| `DB_PASSWORD`            | senha root fornecida ao container MariaDB                                            |
| `DB_PORT`                | porta do banco publicada no host no override local                                   |
| `PORT`                   | porta publicada para o container app; o worker atual não abre servidor HTTP          |
| `DB_HOST`, `DB_DATABASE` | auxiliam a composição documentada da URL, mas o Prisma lê `DATABASE_URL` diretamente |

## Docker Compose

- `compose.yml`: serviços base `db` e `app`, volume e perfis;
- `compose.override.yml`: portas, phpMyAdmin, bind mount e comando de desenvolvimento;
- `compose.prod.yml`: imagem de homologação usada no deploy atual.

O comando `npm run dev` sobe o perfil `dev` e acompanha os logs. Dentro do Compose, o host do banco é `db:3306`; processos executados no host usam `localhost` e a porta publicada.

## Testes e CI

Os testes vivem em `src/tests` e cobrem repositórios, casos de uso, commands, contexts e o fetcher histórico. A pipeline de Pull Request para `homol` executa:

1. `npm ci`;
2. `npm run build`;
3. `npm run lint`;
4. `npm test` com MariaDB;
5. `npx prisma format --check`;
6. regeneração do DBML e verificação de diff.

Não há teste arquitetural automatizado ou regra de lint de fronteiras no repositório.

## Entrega

- pushes em `homol` constroem e publicam a imagem no GHCR;
- tags presentes em `main` ou `homol` recebem tags de imagem conforme o workflow;
- após o workflow de imagem em `homol`, `deploy-prod.yml` conecta ao servidor configurado e sobe `compose.yml` com `compose.prod.yml`;
- `historical-sync.yml` permite executar o backfill manualmente com secrets do GitHub.

Apesar do nome `deploy-prod.yml`, o fluxo observado acompanha `homol` e usa a imagem `:homol`; a documentação não o apresenta como deploy de `main`.

## Lacunas atuais

- a camada de query analítica não está implementada;
- não existe API ou interface web ativa;
- não existe dashboard ou relatório gerado pelo código;
- `oldApp` ainda mantém dependências e código legado;
- o logger possui contrato para banco, mas a implementação atual apenas registra no console;
- políticas de retenção, autorização analítica e descarte não estão implementadas nesta aplicação.

## Leituras relacionadas

- [Domain Layer](./2%20-%20Domain%20Layer.md)
- [Application Layer](./3%20-%20Application%20Layer.md)
- [Infrastructure Layer](./4%20-%20Infrastructure%20Layer.md)
- [Contexts](./5%20-%20Contexts.md)
- [Entidades Principais](./6%20-%20Entidades%20Principais.md)
- [Use Cases](./7%20-%20Use%20Cases.md)
