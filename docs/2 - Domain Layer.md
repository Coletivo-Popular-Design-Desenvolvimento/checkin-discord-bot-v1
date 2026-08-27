# Domain Layer

## Responsabilidade atual

`src/domain` reúne o vocabulário do sistema, os contratos que isolam dependências e os casos de uso. Essa é a camada que concentra as decisões de criação, atualização, busca e importação dos metadados.

```text
src/domain/
├── dtos/          # Formatos genéricos de saída e entradas auxiliares
├── entities/      # Objetos do domínio
├── interfaces/
│   ├── commands/
│   ├── repositories/
│   ├── services/
│   └── useCases/
├── types/         # Enums e tipos compartilhados
└── useCases/      # Implementações dos casos de uso
```

## Entidades

As classes atuais são:

- `UserEntity`;
- `RoleEntity`;
- `ChannelEntity`;
- `MessageEntity`;
- `MessageReactionEntity`;
- `AudioEventEntity`;
- `EventStatusEntity`;
- `UserEventEntity`;
- `LogEventEntity`.

Essas classes são estruturas de dados construídas pelos casos de uso e pelo `PrismaMapper`; a maior parte das regras está nos casos de uso, não em métodos das entidades.

## Contratos

### Repositórios

As interfaces em `interfaces/repositories` descrevem persistência sem importar Prisma:

- usuários, cargos, canais, mensagens e reações;
- eventos de áudio e eventos de usuário;
- importação histórica em lote;
- contrato de logger legado em `repositories/ILogger.ts`.

### Serviços

- `IDiscordService`: eventos necessários do gateway e acesso ao client abstrato;
- `IDiscordHistoryFetcher`: paginação e leitura histórica;
- `ILoggerService`: registro no console e contrato de registro em banco.

### Casos de uso e commands

Cada operação pública possui uma interface própria em `interfaces/useCases`. Alguns commands implementam interfaces em `interfaces/commands`; outros ainda são classes concretas sem porta equivalente. A documentação não assume uniformidade que o código não possui.

## Tipos relevantes

- `UserStatus`: `ACTIVE = 1` e `INACTIVE = 2`;
- `EventType`: `JOINED` e `LEFT`;
- `DiscordEventTypes`: formato neutro de evento agendado/voz e seus estados;
- `LoggerContextEnum`: contexto, entidade e status de log;
- `GenericOutputDto<T>`: retorno com `data`, `success` e mensagem opcional.

## Dependências

O código fora de `oldApp` em `src/domain` não importa Prisma, Discord.js, Express nem variáveis de ambiente. Ele depende de seus próprios contratos e tipos.

Há uma ressalva arquitetural: em uma Clean Architecture mais estrita, implementações de casos de uso costumam ficar na camada de aplicação. Neste repositório elas vivem em `domain/useCases`; qualquer futura mudança dessa fronteira deve ser tratada como refatoração deliberada, não como descrição retroativa.

## Onde aprofundar

- [Entidades Principais](./6%20-%20Entidades%20Principais.md)
- [Use Cases](./7%20-%20Use%20Cases.md)
- [Application Layer](./3%20-%20Application%20Layer.md)
- [Infrastructure Layer](./4%20-%20Infrastructure%20Layer.md)
