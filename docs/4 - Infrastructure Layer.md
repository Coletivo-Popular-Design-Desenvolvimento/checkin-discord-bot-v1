# Infrastructure Layer

## Responsabilidade atual

`src/infrastructure` contém os adapters concretos para Discord.js e Prisma.

```text
src/infrastructure/
├── discord/
│   ├── DiscordService.ts
│   └── fetchers/DiscordHistoryFetcher.ts
└── persistence/
    ├── prisma/
    │   ├── models/
    │   │   ├── dbml/
    │   │   ├── migrations/
    │   │   └── schema.prisma
    │   └── prismaService.ts
    └── repositories/
        ├── AudioEventRepository.ts
        ├── ChannelRepository.ts
        ├── HistoricalImportRepository.ts
        ├── MessageReactionRepository.ts
        ├── MessageRepository.ts
        ├── PrismaMapper.ts
        ├── RoleRepository.ts
        ├── UserEventRepository.ts
        └── UserRepository.ts
```

## DiscordService

`DiscordService` implementa `IDiscordService` sobre um `Client` do Discord.js. Ele:

- guarda listas de handlers registrados pelos commands;
- conecta essas listas aos eventos do client em `registerEvents()`;
- busca partials de reações quando necessário;
- normaliza eventos agendados para os tipos do domínio;
- expõe o client para login, fetch de guild e encerramento.

Eventos conectados atualmente:

- `ClientReady`;
- `MessageCreate`;
- `GuildMemberAdd`, `GuildMemberRemove` e `GuildMemberUpdate`;
- `VoiceStateUpdate`;
- `GuildScheduledEventCreate`, `GuildScheduledEventUpdate` e `GuildScheduledEventDelete`;
- `MessageReactionAdd` e `MessageReactionRemove`;
- `ChannelCreate`, `ChannelUpdate` e `ChannelDelete`.

## DiscordHistoryFetcher

O fetcher histórico usa a API Discord.js de forma ativa, em vez de esperar eventos do gateway. Ele oferece:

- membros atuais da guild;
- canais de texto atuais;
- cargos atuais por membro;
- mensagens paginadas por canal e intervalo;
- reações das mensagens paginadas;
- eventos agendados ainda retornados pela API.

Ele não recupera conteúdo para persistência. Mensagens e reações de bots são descartadas. Limitações e paginação estão detalhadas em [Sincronização Histórica](./8%20-%20Sincroniza%C3%A7%C3%A3o%20Hist%C3%B3rica.md).

## Prisma

`PrismaService` apenas encapsula uma instância de `PrismaClient`, expõe `getClient()` e `disconnect()`. A conexão é configurada exclusivamente por `DATABASE_URL`.

`schema.prisma` é a fonte canônica do modelo persistido. Migrations versionam sua evolução e o gerador `prisma-dbml-generator` mantém a representação DBML usada pelo CI.

## Repositórios

Os repositórios de tempo real implementam as portas do domínio e convertem registros Prisma por meio de `PrismaMapper` ou mapeadores locais. Em geral, capturam erros, registram no logger e retornam `null`, `false` ou lista vazia conforme o contrato.

`HistoricalImportRepository` é exclusivo do backfill. Ele grava lotes em transações, usa upserts e `skipDuplicates` e não substitui os repositórios do fluxo contínuo.

## Integridade e chaves

- entidades vindas do Discord possuem `platform_id` único;
- relacionamentos usam `platform_id` como chave estrangeira em várias tabelas;
- `UserRole` e `UserChannel` usam chaves primárias compostas;
- reação é única por usuário, mensagem e emoji;
- índices existem para as principais chaves estrangeiras de mensagem, evento e reação.

## O que não está nesta camada atual

- integração ativa com Telegram;
- envio de e-mail;
- servidor Express e health check;
- cron do aplicativo antigo;
- API de leitura;
- ferramenta de BI.

Esses itens podem aparecer em dependências ou em `src/oldApp`, mas não são importados pelos entry points atuais.

## Leituras relacionadas

- [Documentação técnica](./1%20-%20Documenta%C3%A7%C3%A3o%20t%C3%A9cnica.md)
- [Entidades Principais](./6%20-%20Entidades%20Principais.md)
- [Contexts](./5%20-%20Contexts.md)
