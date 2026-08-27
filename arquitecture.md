# Arquitetura atual

Este arquivo é um mapa rápido da estrutura executada hoje. A descrição detalhada está em [docs/1 - Documentação técnica.md](docs/1%20-%20Documenta%C3%A7%C3%A3o%20t%C3%A9cnica.md).

```text
src/
├── application/
│   ├── command/          # Handlers: eventos Discord -> entradas dos casos de uso
│   ├── query/            # Espaço para leitura CQRS; userQuery.ts ainda está vazio
│   └── services/         # Implementação atual do logger
├── contexts/             # Composition root e injeção manual de dependências
├── domain/
│   ├── dtos/             # Formatos de retorno compartilhados
│   ├── entities/         # Objetos do domínio
│   ├── interfaces/       # Portas de repositórios, serviços, comandos e casos de uso
│   ├── types/            # Enums e tipos
│   └── useCases/         # Operações de negócio e sincronização
├── infrastructure/
│   ├── discord/
│   │   ├── DiscordService.ts                 # Adapter do Discord Gateway
│   │   └── fetchers/DiscordHistoryFetcher.ts # Coleta histórica via API
│   └── persistence/
│       ├── prisma/       # PrismaService, schema, migrations e DBML
│       └── repositories/ # Implementações das portas de persistência
├── oldApp/               # Código legado não importado pelo fluxo atual
├── tests/                # Testes unitários e de integração
├── historicalSync.ts     # Entry point do backfill sob demanda
└── index.ts              # Entry point do worker em tempo real
```

## Direção das dependências

```text
contexts -> application commands -> domain use cases -> domain interfaces
    |                                                    ^
    +-> infrastructure adapters ------------------------+
```

- `domain` define entidades, regras e contratos;
- `application` conhece o Discord.js para traduzir eventos externos em entradas do domínio;
- `infrastructure` implementa os contratos de Discord e persistência;
- `contexts` instancia e conecta implementações concretas;
- o schema Prisma é a fonte canônica do modelo persistido.

Essa organização é inspirada em Clean Architecture, mas não é uma implementação estrita: os casos de uso concretos vivem em `domain/useCases` e os comandos da aplicação importam tipos do Discord.js. A documentação registra essa realidade em vez de atribuir fronteiras que o código ainda não possui.

## Fluxos executáveis

### Tempo real

`src/index.ts` carrega o ambiente e chama `initializeApp()`. O composition root cria os repositórios e casos de uso, registra os comandos no `DiscordService`, registra os listeners e efetua login no Discord.

### Histórico

`src/historicalSync.ts` autentica um cliente Discord separado, monta `DiscordHistoryFetcher`, `HistoricalImportRepository` e os casos de importação, executa o intervalo solicitado e encerra as conexões.

### Legado

`src/oldApp` contém integrações antigas com Telegram, e-mail, Express, cron e arquivos locais. Nenhum arquivo dessa pasta é importado por `src/index.ts`, `src/historicalSync.ts` ou pelos contexts atuais; portanto, não compõe a arquitetura em execução.
