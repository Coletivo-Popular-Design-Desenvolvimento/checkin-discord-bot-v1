# Application Layer - Checkin Bot

## Visão Geral

A camada de aplicação (`src/application`) faz a ponte entre os eventos externos do Discord e os casos de uso. Os commands registram callbacks no `IDiscordService`, descartam eventos fora do escopo, convertem objetos do Discord.js em entradas compreendidas pelo domínio e então delegam as decisões.

## Estrutura

```text
src/application/
├── command/
│   ├── channelCommand.ts
│   ├── messageCommand.ts
│   ├── messageReactionCommand.ts
│   ├── roleUpdateCommand.ts
│   ├── userCommand.ts
│   ├── userEventCommand.ts
│   └── voiceEventCommand.ts
├── query/
│   └── userQuery.ts       # vazio; leitura ainda não implementada
└── services/
    └── Logger.ts
```

## CQRS Implementation

### Commands (Operações de Escrita)

| Command                  | Eventos observados                                 | Delegação                                                                                        |
| ------------------------ | -------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `UserCommand`            | início do bot, entrada e saída de membro           | criação em lote, criação/reativação e inativação                                                 |
| `RoleUpdateCommand`      | atualização de membro                              | sincronização do conjunto atual de cargos                                                        |
| `ChannelCommand`         | criação, atualização e exclusão de canal           | casos de uso de canal                                                                            |
| `MessageCommand`         | nova mensagem                                      | registro de metadados; ignora bot e mensagem sem guild                                           |
| `MessageReactionCommand` | adição e remoção de reação                         | registro ou remoção por usuário, mensagem e emoji                                                |
| `VoiceEventCommand`      | criação, atualização e exclusão de evento agendado | registra evento quando fica ativo e finaliza quando concluído; outros estados são apenas logados |
| `UserEventCommand`       | mudança de estado de voz                           | criação de evento `JOINED` ou `LEFT`                                                             |

Os commands importam tipos do Discord.js. Isso é intencional na estrutura atual: eles são adapters de entrada, não regras de domínio puras.

## 🔄 Fluxo de Execução

### Commands e listeners

Os constructors chamam métodos como `executeMessage()` ou `handleCreateChannel()`, que registram funções no `DiscordService`. O serviço guarda os handlers em listas. Somente depois de todos os commands serem criados, `app.context.ts` chama `discordService.registerEvents()` para ligar essas listas aos eventos do client.

Essa ordem é relevante: um command criado depois de `registerEvents()` ainda pode acrescentar handlers às listas, mas o fluxo atual cria quase todos antes; `ChannelCommand` é instanciado depois do login e do registro, embora os callbacks continuem usando as mesmas listas mutáveis.

### Queries (Operações de Leitura)

O diretório separa nominalmente `command` de `query`, porém `userQuery.ts` está vazio. Portanto:

- commands de escrita estão implementados;
- não há handlers de consulta;
- não há API, endpoint ou dashboard consumindo queries;
- chamar a arquitetura de “CQRS completo” seria incorreto.

## Services

### Logger

`Logger` implementa `ILoggerService`. `logToConsole` formata e escreve mensagens em stdout. `logToDatabase` existe para satisfazer o contrato, mas está vazio; logs persistidos não estão implementados.

## Padrões Aplicados

### Fronteiras

- command valida e adapta o evento externo;
- caso de uso decide como assegurar dependências e persistir;
- repositório executa operações Prisma;
- context monta as dependências concretas.

Os commands não importam `PrismaClient` nem repositórios concretos.

## Relacionamento com Outras Camadas

- [Documentação técnica](./1%20-%20Documenta%C3%A7%C3%A3o%20t%C3%A9cnica.md)
- [Domain Layer](./2%20-%20Domain%20Layer.md)
- [Contexts](./5%20-%20Contexts.md)
- [Use Cases](./7%20-%20Use%20Cases.md)
