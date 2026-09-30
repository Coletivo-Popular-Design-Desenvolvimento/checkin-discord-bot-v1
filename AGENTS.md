# AGENTS.md - Especificação do Checkin Bot

Estas instruções valem para todo o repositório. Toda alteração de código, dados, infraestrutura ou documentação deve preservar a identidade, os limites e as fontes de verdade descritos abaixo.

## 🎯 Identidade e propósito

- Use o nome **Checkin Bot** ou **Checkin Discord Bot**. Não transforme a nomenclatura em “Check-in” sem uma decisão explícita do projeto.
- O Checkin Bot transforma sinais mínimos de participação no Discord em uma leitura da saúde da comunidade.
- A finalidade é apoiar diálogos e decisões coletivas sobre retenção, eventos, conteúdos e comunicação.
- O projeto não é sistema de ponto, autenticação, moderação, vigilância ou avaliação individual.
- Não atribua intenção, sentimento, opinião ou qualidade às interações apenas com base nos metadados.

## ✍️ Tom da documentação

- Escreva em português brasileiro, com voz acolhedora, comunitária e tecnicamente precisa.
- Prefira uma progressão narrativa: **por que existe → o que faz → como funciona → limites → próximos passos**.
- Apresente primeiro a ideia em linguagem simples e depois aprofunde os detalhes técnicos.
- Ajude a pessoa leitora a construir contexto; não escreva apenas uma lista seca de classes, arquivos e ressalvas.
- Preserve emojis existentes, especialmente em títulos e marcadores de navegação, como `🚀`, `📈`, `🏗️`, `📚`, `🧪` e `📊`.
- Preserve títulos familiares, nomes de seções e nomenclaturas do projeto sempre que ainda forem corretos. Exemplos: `Domain Layer`, `Application Layer`, `Infrastructure Layer`, `Contexts`, `Use Cases`, `User Entity` e regras `RN001`–`RN004`.
- Não traduza nomes reais de classes, métodos, eventos, tabelas, campos, scripts ou diretórios.
- Use tabelas quando elas facilitarem comparações ou mapeamentos; use diagramas pequenos quando ajudarem a explicar fluxos e relações.
- Integre limitações ao texto de forma clara e respeitosa. Evite transformar toda a documentação em um relatório frio de auditoria.
- Não use datas, versões, percentuais de sucesso ou status de fase que não sejam mantidos e verificáveis.

## ✅ Precisão e estado das funcionalidades

- Diferencie explicitamente o que está **implementado**, o que está **planejado** e o que existe apenas como **legado**.
- Não descreva intenção arquitetural como capacidade entregue.
- Não afirme que existem API de consulta, interface web, dashboard ou relatórios prontos enquanto eles não estiverem no código executável.
- Não descreva CQRS como completo: há commands implementados, mas `src/application/query/userQuery.ts` ainda está vazio.
- Não apresente conformidade jurídica como garantida pelo software. Base legal, retenção, descarte, atendimento a titulares e governança exigem decisões organizacionais próprias.
- Ao alterar comportamento, atualize a documentação correspondente na mesma entrega.

## 🏗️ Arquitetura atual

O fluxo executável em tempo real é:

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

- `src/index.ts` é o entry point do worker em tempo real.
- `src/historicalSync.ts` é o entry point independente da sincronização histórica.
- `src/contexts` é o composition root e realiza a injeção manual de dependências.
- `src/domain` contém entidades, tipos, contratos e os casos de uso na organização atual.
- `src/application` adapta eventos do Discord e oferece o logger atual.
- `src/infrastructure` implementa Discord.js, fetch histórico, Prisma e repositories.
- `src/oldApp` contém Telegram, e-mail, Express, cron e outros códigos legados. Nada dessa pasta deve ser descrito como parte do runtime atual sem confirmar uma importação a partir dos entry points ativos.
- A estrutura é inspirada em Clean Architecture, mas não deve ser idealizada: os Use Cases concretos vivem em `domain/useCases`, e os commands importam tipos do Discord.js.

## 🗄️ Modelo de dados e análise

- O schema Prisma em `src/infrastructure/persistence/prisma/models/schema.prisma` é a fonte canônica do modelo persistido.
- Para atividade no Discord, prefira `platform_created_at` a `created_at`; o segundo pode representar apenas a importação local.
- `UserRole` e `UserChannel` representam relações sem dimensão temporal e não devem ser apresentados como histórico.
- O backfill não recupera o histórico de `UserEvent`.
- Eventos antigos de voz dependem do que a API do Discord ainda disponibiliza.
- O timestamp de reação histórica é aproximado pela data da mensagem porque a API não informa a data real da reação.
- O campo opcional `User.email` existe no schema, mas não é coletado pelo fluxo Discord atual e não deve ser exposto em datasets analíticos.
- Prefira métricas agregadas e evite nomes, IDs, e-mails e rankings individuais em painéis.
- Mostre cobertura, período e limitações junto das métricas para não apresentar lacunas de coleta como mudanças reais de participação.

## 🔒 Minimização e segurança

- Não persista conteúdo de mensagens, anexos, imagens, vídeos, áudio ou gravações.
- Não inclua tokens, senhas ou credenciais reais em código, documentação, commits ou Pull Requests.
- Use contas de banco somente leitura e views agregadas para futuras ferramentas de análise sempre que possível.
- Mudanças que ampliem coleta, identificação ou exposição de dados exigem justificativa explícita e revisão dos limites de produto.

## 🧭 Fontes de verdade

Antes de documentar ou alterar uma capacidade, consulte:

1. comportamento executável em `src`, excluindo `src/oldApp`;
2. modelo persistido no schema Prisma e nas migrations;
3. scripts em `package.json`;
4. serviços e perfis nos arquivos `compose*.yml`;
5. automações em `.github/workflows`;
6. intenção e limites em `docs/0 - Documentação de Produto.md`.

Se essas fontes divergirem, descreva o comportamento real e registre a divergência. Não complete lacunas com suposições.

## 🧪 Validação

- Execute primeiro a verificação mais próxima da alteração.
- Para mudanças documentais, rode Prettier, `git diff --check` e valide os links locais.
- Antes de finalizar uma entrega, rode os equivalentes disponíveis de:

```bash
npm run build
npm run lint
NODE_ENV=test npm test
npx prisma format --check
```

- Os testes de integração precisam de um MariaDB de teste vazio ou controlado; estado residual pode causar colisões entre fixtures.
- Não altere código de produção apenas para contornar estado local de teste.

## 🌿 Git e entrega

- Crie branches de trabalho a partir de `homol` e abra Pull Requests para `homol`, salvo orientação diferente.
- Use o template em `.github/pull_request_template.md` e descreva comportamento, motivação, validações e documentação relacionada.
- Preserve alterações paralelas do usuário e prepare no commit somente os arquivos da entrega.
- `$finalizar` autoriza validação, changelog, versão e commit local.
- `$finalizar e subir` também autoriza push e publicação da entrega solicitada.
