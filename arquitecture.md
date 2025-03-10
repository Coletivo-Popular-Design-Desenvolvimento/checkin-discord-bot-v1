src/
├── core/                      # Domínio puro (regras de negócio)
│   ├── entities/              # Entidades (User.ts, Event.ts)
│   └── aggregates/            # Agregados (ex.: Engagement.ts)
├── application/               # Casos de uso
│   ├── commands/              # Command handlers (ex.: UpdateEngagementCommand.ts)
│   ├── queries/               # Query handlers (ex.: GenerateReportQuery.ts)
│   └── events/                # Eventos de domínio (ex.: EngagementUpdated.ts)
├── infrastructure/
│   ├── discord/               # Tudo do Discord
│   │   ├── listeners/         # Antigo bot/events.ts, bot/message.ts
│   │   ├── actions/           # Trechos de bot/report.ts que enviam mensagens
│   │   ├── fetchers/          # Busca de dados do Discord (ex.: cargos de usuário)
│   │   └── client/            # Antigo bot/bot.ts, bot/init.ts
│   ├── telegram/              # Antigo bot/telegram.ts
│   ├── email/                 # Antigo bot/email.ts
│   ├── database/              # Substituirá users.json e evento_teste.json
│   │   ├── repositories/      # Classes para acesso a dados (ex.: UserRepository.ts)
│   │   └── models/            # Schemas (se usar ORM/ODM)
│   ├── server/                # Antigo rotas/server.ts, rotas/health.ts
│   └── cron/                  # Antigo rotas/cron.ts
├── presentation/
│   ├── discord/               # Formatação de mensagens (ex.: relatórios)
│   ├── web/                   # Rotas HTTP (rotas/health.ts, rotas/index.ts)
│   └── telegram/              # Formatadores para mensagens do Telegram
├── config/                    # Centraliza .env, .env.example
│   └── env.ts                 # Carregador de variáveis de ambiente
├── shared/                    # Utilitários globais
│   ├── errors/                # Antigo shuterror.ts
│   ├── logger/                # Sistema de logs
│   └── utils/                 # Funções genéricas (ex.: bot/file.ts)
└── tests/                     # Testes