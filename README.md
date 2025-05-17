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

- Node.js v20 ou superior
- Docker Desktop + WSL2 (caso use Windows)
- Git instalado
- Um bot criado no **Discord Developer Portal**

## 🔢 Instalação

### 1. Clone o projeto

```bash
git clone https://github.com/seu-usuario/checkin-discord-bot-v1.git
cd checkin-discord-bot-v1
```

### 2. Instale as dependências do Node.js

```bash
npm install
```

### 3. Configure o `.env`

Crie um arquivo `.env` na raiz com o seguinte conteúdo — ajuste os valores conforme seu ambiente:

```env
TOKEN_BOT=seu-token-do-bot

DB_HOST=localhost (dev) / db (prod)
DB_PORT=3306 (dev *ou qualquer outra porta não utilizada na sua máquina, ex: use 3307 caso 3306 já esteja sendo usada por outro cointainer) / 3306 (prod)
DB_USER=root
DB_PASSWORD=Coletivo1917
DB_DATABASE=checkindb

DATABASE_URL="mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}"
```

> **Nunca** compartilhe seu token publicamente.

## 🐳 Como configurar Docker & WSL2 (Windows)

1. Instalar **Docker Desktop**

   - Acesse: [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
   - Baixe e instale normalmente.

2. Instalar **WSL2 (Windows Subsystem for Linux)**

   - No Windows Terminal, rode:
     ```bash
     wsl --install
     ```
   - Caso já tenha WSL1, atualize para WSL2 com:
     ```bash
     wsl --set-default-version 2
     ```
   - Siga o tutorial oficial: [Documentação WSL2](https://learn.microsoft.com/pt-br/windows/wsl/install)

3. Configurar o Docker para usar o WSL2

   - Abra o **Docker Desktop**.
   - Vá em **Settings** > **General** > Marque a opção **Use the WSL 2 based engine**.
   - Em **Settings** > **Resources** > **WSL Integration**: habilite a distribuição Linux que está usando (ex: Ubuntu).

4. Certificar-se de que o Docker está rodando
   - Rode:
     ```bash
     docker run hello-world
     ```
   - Se funcionar e mostrar a versão, está tudo pronto!

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

Isso subirá a aplicação na sua máquina, utilizando o banco de dados do docker

> ⚠️ **Atenção Usuários Windows:** Se você possui uma instalação local do MariaDB ou MySQL no seu Windows, você poderá encontrar um erro relacionado ao plugin `auth_gssapi_client` ao tentar rodar `npm run dev` (especificamente durante as etapas do Prisma). Isso ocorre porque o Prisma pode tentar usar o cliente de banco de dados instalado globalmente em vez do esperado.
>
> **Soluções possíveis:**
>
> 1.  Configure sua instalação local do MariaDB/MySQL para utilizar `mysql_native_password` como plugin de autenticação padrão.
> 2.  Considere desinstalar a versão local do MariaDB/MySQL do seu Windows se ela não for estritamente necessária para outros projetos, permitindo que o ambiente Docker funcione sem interferências.

Em caso de problemas com versões incompatíveis de migrations, caso esteja disposto(a) a resetar o banco de dados completamente, execute os comandos:

```bash
docker compose --profile dev up -d
npm run db:migrate-reset
```

Isso alinhará as suas migrations com as migrations do projeto. Tome cuidado para sempre que mexer na definição das tabelas, gerar uma nova migration com o comando

```bash
npm run db:migrate
```

## 🚀 Subindo o projeto em produção

Subir os containers:

```bash
docker compose -f compose.yml --profile prod up -d --build
```

## 🔧 Comandos úteis

| Ação                | Comando                        |
| ------------------- | ------------------------------ |
| Subir containers    | `docker compose up -d --build` |
| Derrubar containers | `docker compose down`          |
| Logs do bot         | `docker logs -f node_app`      |
| Acessar terminal    | `docker exec -it node_app sh`  |

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
