# 🚀 Checkin Discord Bot

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

Checkin Discord Bot é um bot de autenticação e monitoramento de usuários para Discord, construído com **Node.js**, **MariaDB**, **Prisma ORM** e **Docker**.

## 📈 Funcionalidades

- Registro automático de usuários no Discord
- Atribuição de cargos após autenticação
- Monitoramento de mensagens e chamadas de voz
- Geração de relatórios de engajamento

## 📚 Tecnologias Utilizadas

- Node.js v20+
- TypeScript
- Discord.js v14
- Prisma ORM
- MariaDB
- Docker & Docker Compose
- PM2 (opcional)

## ⚙️ Pré‑requisitos

- Um bot criado no **Discord Developer Portal**

## 🔢 Instalação

### 1. Prepare o ambiente de desenvolvimento

Estará acessível no menu `Code > Codespaces > + (Create a codespace on main)`, ou neste [link](https://github.com/codespaces/new?repo=Coletivo-Popular-Design-Desenvolvimento%2Fcheckin-discord-bot-v1).

Caso prefira desenvolver localmente, há algumas alternativas:

- [Se conectar ao codespace no Visual Studio Code](https://docs.github.com/en/codespaces/developing-in-a-codespace/using-github-codespaces-in-visual-studio-code)
- [Criar o ambiente completo na sua própria máquina](https://code.visualstudio.com/docs/devcontainers/tutorial)
- [Usar alguma ferramenta compatível com dev containers](https://containers.dev/supporting)

### 3. Configure o `.env`

Crie um arquivo `.env` na raiz com o seguinte conteúdo:

```env
TOKEN_BOT=seu-token-do-bot
```

> **Nunca** compartilhe seu token publicamente.

## 🐳 Solicitando acesso ao servidor de teste

Antes de configurar o bot, solicite acesso ao servidor de testes Discord:

- Nome do servidor: TPDD - Teste Popular de Desenvolvimento
- Solicite ao administrador a permissão para adicionar o bot

> **Somente após ter acesso autorizado** prossiga para as etapas seguintes.

## 🚀 Subindo o projeto para desenvolvimento local

Basta executar o comando

```bash
npm run dev
```

## 🚀 Subindo o projeto em produção

Subir os containers:

```bash
docker compose -f compose.yml --profile prod up -d --build
```

## 🔖 Como criar o Bot no Discord

1. Acesse o [Discord Developer Portal](https://discord.com/developers/applications)
2. Clique em **New Application**
3. Adicione um nome padrão neste formato **teste-tpdd-bot-seu-nome**
4. Copie o **Token** e adicione no `.env`
5. Em **OAuth2** → **Client information**:

   - **Client ID**: `Copie o id`

6. Gere uma URL de permissão

```
https://discord.com/oauth2/authorize?client_id=SEU_CLIENT_ID&permissions=1759218604441591&scope=bot applications.commands
```

7. Autorizar o Bot no seu servidor
   - Acesse o link gerado trocando o clint_id pelo do seu bot criado.
   - Escolha o servidor **TPDD - Teste Popular de Desenvolvimento**
   - Aceite as permissões.
   - Clique em **Authorize**.

## 📂 Estrutura do Projeto

```
checkin-discord-bot-v1

├── src/
|   │   ├── entities/              # Entidades (User.ts, Event.ts)
|   │   └── aggregates/            # Agregados (ex.: Engagement.ts)
|   ├── application/               # Casos de uso
|   ├── core/                      # Domínio puro (regras de negócio)
|   │   ├── commands/              # Command handlers (ex.: UpdateEngagementCommand.ts)
|   │   ├── queries/               # Query handlers (ex.: GenerateReportQuery.ts)
|   │   └── events/                # Eventos de domínio (ex.: EngagementUpdated.ts)
|   ├── infrastructure/
|   │   ├── discord/               # Tudo do Discord
|   │   │   ├── listeners/         # Antigo bot/events.ts, bot/message.ts
|   │   │   ├── actions/           # Trechos de bot/report.ts que enviam mensagens
|   │   │   ├── fetchers/          # Busca de dados do Discord (ex.: cargos de usuário)
|   │   │   └── client/            # Antigo bot/bot.ts, bot/init.ts
|   │   ├── telegram/              # Antigo bot/telegram.ts
|   │   ├── email/                 # Antigo bot/email.ts
|   │   ├── database/              # Substituirá users.json e evento_teste.json
|   │   │   ├── repositories/      # Classes para acesso a dados (ex.: UserRepository.ts)
|   │   │   └── models/            # Schemas (se usar ORM/ODM)
|   │   ├── server/                # Antigo rotas/server.ts, rotas/health.ts
|   │   └── cron/                  # Antigo rotas/cron.ts
|   ├── presentation/
|   │   ├── discord/               # Formatação de mensagens (ex.: relatórios)
|   │   └── telegram/              # Formatadores para mensagens do Telegram
|   ├── services/                  # Camada de serviços (ex.: UserService)
|   ├── config/                    # Centraliza .env, .env.example
|   │   └── env.ts                 # Carregador de variáveis de ambiente
|   ├── shared/                    # Utilitários globais
|   │   ├── errors/                # Antigo shuterror.ts
|   │   ├── logger/                # Sistema de logs
|   │   └── utils/                 # Funções genéricas (ex.: bot/file.ts)
|   └── tests/                     # Testes
├── .env
├── .gitignore
├── compose.yml
├── Containerfile (Dockerfile)
├── eslint.config.js
├── jest.config.js
├── package.json
├── README.md
└── tsconfig.json
```

## 📜 Licença

Este projeto está licenciado sob a [Licença AGPL](LICENSE).

## 🧠 Observação Final

- Nunca compartilhe seu **Token do Discord** publicamente.
- Adicione o `.env` ao seu `.gitignore`:

```gitignore
.env
node_modules/
dist/
```

---

✅ Projeto pronto para desenvolvimento e deploy, venceremos ☭!
