# 🚀 Checkin Discord Bot

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

O **Checkin Discord Bot** transforma sinais mínimos de participação em um servidor Discord em dados relacionais que podem ajudar a comunidade a compreender sua própria dinâmica. Construído com **Node.js**, **TypeScript**, **Discord.js**, **Prisma** e **MariaDB**, ele oferece uma base para análises agregadas sobre atividade, retenção, canais, reações e eventos de voz sem armazenar o conteúdo das mensagens.

O bot não é um sistema de autenticação, ponto, moderação ou avaliação individual. Telegram, e-mail, servidor HTTP e rotinas antigas permanecem em `src/oldApp/` apenas como legado e não participam do fluxo iniciado por `src/index.ts`.

## 📈 Funcionalidades

Hoje, o projeto acompanha o ciclo de participação no Discord desde a chegada de um membro até suas interações em mensagens, reações e canais de voz. No código atual, isso inclui:

- cadastro, atualização, inativação e reativação de membros;
- sincronização do estado atual de cargos;
- criação, alteração e exclusão de canais;
- registro de metadados de mensagens e reações;
- registro de eventos agendados e de presença em canais de voz;
- sincronização histórica sob demanda de usuários, cargos, canais, mensagens, reações e eventos agendados;
- persistência relacional com Prisma e MariaDB/MySQL;
- testes automatizados com Jest.

Não são armazenados texto de mensagens, anexos, mídias ou gravações. O schema ainda contém um campo opcional `email`, herdado da modelagem, mas o fluxo atual do Discord não coleta e-mail.

## 🏗️ Arquitetura em uma visão

```text
Discord Gateway
    -> infrastructure/discord/DiscordService
    -> application/command/*Command
    -> domain/useCases/*
    -> domain/interfaces/repositories/*
    -> infrastructure/persistence/repositories/*
    -> Prisma
    -> MariaDB/MySQL
```

O projeto adota uma separação inspirada em **Clean Architecture**. Na prática, cada evento percorre um caminho previsível: o Discord entrega o sinal, a aplicação o traduz, o domínio decide o que fazer e a infraestrutura cuida da persistência. Os casos de uso estão atualmente em `src/domain/useCases`, enquanto a camada `application` adapta eventos do Discord e registra handlers.

A estrutura também reserva espaços distintos para commands e queries. Essa separação indica a direção de CQRS escolhida pelo projeto, mas a leitura ainda não está implementada: `src/application/query/userQuery.ts` permanece vazio.

Consulte [arquitecture.md](arquitecture.md) para o mapa das camadas e [a documentação técnica](docs/1%20-%20Documenta%C3%A7%C3%A3o%20t%C3%A9cnica.md) para os fluxos completos.

## 📚 Tecnologias Utilizadas

- Node.js 20+
- TypeScript
- Discord.js 14
- Prisma 6
- MariaDB/MySQL
- Docker Compose
- Jest, ESLint e Prettier

## ⚙️ Pré-requisitos

- Node.js 20 ou superior;
- Docker com Docker Compose;
- Git;
- uma aplicação de bot no Discord com os intents e permissões descritos em [Como criar um bot no Discord](docs/Criar-bot-Discord.md).

## 🔢 Instalação

```bash
git clone https://github.com/Coletivo-Popular-Design-Desenvolvimento/checkin-discord-bot-v1.git
cd checkin-discord-bot-v1
npm ci
cp .env.example .env
```

Preencha `TOKEN_BOT` no `.env`. Para execução dentro do Compose, mantenha `DB_HOST=db` e a porta interna `3306` na `DATABASE_URL`:

```env
TOKEN_BOT=seu-token-do-bot
PORT=3000
DB_HOST=db
DB_PORT=3306
DB_PASSWORD=troque-esta-senha
DB_DATABASE=checkindb
DATABASE_URL="mysql://root:${DB_PASSWORD}@${DB_HOST}:3306/${DB_DATABASE}?auth_plugin=mysql_native_password"
```

`DB_PORT` controla a porta publicada no host pelo `compose.override.yml`. Dentro da rede Docker, a aplicação sempre alcança o serviço `db` em `db:3306`.

Nunca publique o token do Discord nem credenciais reais do banco.

## 🚀 Subindo o projeto para desenvolvimento local

Com o ambiente configurado, um único comando constrói e inicia o banco, o phpMyAdmin e a aplicação, e depois acompanha os logs do bot:

```bash
npm run dev
```

Serviços locais:

| Serviço    | Endereço                     | Observação                                                                                               |
| ---------- | ---------------------------- | -------------------------------------------------------------------------------------------------------- |
| Aplicação  | sem interface web            | O código atual é um worker Discord; `PORT` é publicado pelo Compose, mas nenhuma rota HTTP é registrada. |
| MariaDB    | `localhost:${DB_PORT:-3306}` | Use apenas para clientes executados no host.                                                             |
| phpMyAdmin | `http://localhost:8090`      | Disponível no perfil `dev`.                                                                              |

Comandos úteis:

| Ação                                  | Comando                                      |
| ------------------------------------- | -------------------------------------------- |
| Subir somente o banco                 | `docker compose --profile dev up -d db`      |
| Subir toda a stack de desenvolvimento | `docker compose --profile dev up -d --build` |
| Ver os serviços                       | `docker compose --profile dev ps`            |
| Acompanhar logs da aplicação          | `docker compose --profile dev logs -f app`   |
| Parar a stack                         | `docker compose --profile dev down`          |
| Abrir Prisma Studio                   | `npm run db:studio`                          |

Se o Prisma reportar `P1001`, confirme que o Docker está ativo e que o serviço `db` está saudável com `docker compose --profile dev ps`.

## 🧰 Execução sem o container da aplicação

Suba o banco e ajuste temporariamente a conexão do processo local para `localhost` e para a porta publicada:

```bash
docker compose --profile dev up -d db
npm start
```

Nesse modo, `DATABASE_URL` deve apontar para `localhost:${DB_PORT}`; não use `db`, pois esse nome só existe na rede do Compose.

## 🕰️ Sincronização histórica

```bash
npm run sync:history -- --start=2026-01-01 --end=2026-04-01 --batchSize=1000
```

Sem argumentos, o script considera os últimos três meses e lotes de 1000 registros. O fluxo é independente do worker em tempo real. Limites da API, idempotência e execução pelo GitHub Actions estão documentados em [Sincronização Histórica](docs/8%20-%20Sincroniza%C3%A7%C3%A3o%20Hist%C3%B3rica.md).

## 🧪 Qualidade

```bash
npm run build
npm run lint
NODE_ENV=test npm test
npx prisma format --check
```

Os testes usam a configuração de `.env.test` e precisam de um MariaDB de teste disponível.

## 🚀 Produção e homologação

Para construir localmente com o perfil de produção:

```bash
docker compose -f compose.yml --profile prod up -d --build
```

O deploy automatizado usa `compose.yml` com `compose.prod.yml`, que referencia a imagem `ghcr.io/coletivo-popular-design-desenvolvimento/checkin-discord-bot-v1:homol`. Os workflows vigentes estão em `.github/workflows/`.

## 📂 Estrutura do Projeto

```text
src/
├── application/
│   ├── command/          # Adapta eventos do Discord e chama casos de uso
│   ├── query/            # Reservado para leituras; ainda sem implementação
│   └── services/         # Logger atual
├── contexts/             # Composição manual das dependências
├── domain/
│   ├── dtos/
│   ├── entities/
│   ├── interfaces/       # Portas de comandos, repositórios, serviços e casos de uso
│   ├── types/
│   └── useCases/         # Regras e coordenação das operações
├── infrastructure/
│   ├── discord/          # Gateway e fetcher histórico
│   └── persistence/      # Prisma, migrations, mapeadores e repositórios
├── oldApp/               # Legado preservado, fora do entry point atual
├── tests/
├── historicalSync.ts     # Entry point da sincronização histórica
└── index.ts              # Entry point do worker em tempo real
```

## 🗂️ Documentação

Comece por [Comece por aqui](docs/-1%20-%20Come%C3%A7e%20por%20aqui.md) ou pelo [índice de leitura](docs/%F0%9F%97%82%EF%B8%8F%20%C3%8Dndice%20de%20Leitura%20-%20Checkin%20Bot.md).

## 🤝 Contribuindo com o projeto

Crie branches de trabalho a partir de `homol`. Prefixos usados pelo projeto incluem `feature/`, `fix/`, `hotfix/`, `docs/`, `refactor/`, `chore/`, `test/` e `spike/`. Ao concluir, abra um Pull Request para `homol` usando o template do repositório.

## 📜 Licença

Este projeto está licenciado sob a [GNU Affero General Public License v3](LICENSE).
