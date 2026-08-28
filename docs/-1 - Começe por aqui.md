# 👋 Começe por aqui - Checkin Bot

## 🎯 O que é este projeto?

O **Checkin Bot** é um projeto open source do CPDD que transforma sinais mínimos de participação no Discord em dados relacionais. A ideia é simples: oferecer à comunidade um jeito de enxergar sua própria dinâmica, observando tendências como atividade por período, canais mobilizadores e participação em voz sem guardar o conteúdo das conversas.

O projeto não é ponto, autenticação, moderação nem ferramenta de avaliação individual.

### 📊 O que coletamos

Para cumprir esse propósito, o bot registra somente os metadados necessários para relacionar pessoas, momentos e espaços de participação:

- membros e seu estado atual no servidor;
- canais e cargos;
- data, autoria e canal de mensagens, sem o texto;
- emoji, autoria, mensagem e data disponível de reações;
- eventos agendados de voz e entradas/saídas observadas em tempo real.

O schema possui um campo opcional de e-mail por herança da modelagem, mas o fluxo atual não obtém e-mail do Discord. Dados analíticos devem excluir esse campo e privilegiar agregações.

## 🏗️ Como ele funciona

```text
Discord -> comandos da aplicação -> casos de uso -> repositórios -> Prisma -> MariaDB
```

Há dois entry points:

- `src/index.ts`: coleta contínua enquanto o bot está conectado;
- `src/historicalSync.ts`: importação manual de parte do histórico disponível pela API.

O código ativo está organizado em `domain`, `application`, `infrastructure` e `contexts`. A pasta `src/oldApp` é legado preservado e não participa da inicialização atual.

## 🗂️ Documentação

A documentação foi organizada para começar pelo propósito e avançar, pouco a pouco, até os detalhes técnicos. A ordem recomendada é:

1. [Documentação de Produto](./0%20-%20Documenta%C3%A7%C3%A3o%20de%20Produto.md)
2. [Documentação técnica](./1%20-%20Documenta%C3%A7%C3%A3o%20t%C3%A9cnica.md)
3. [Entidades Principais](./6%20-%20Entidades%20Principais.md)
4. [Casos de Uso](./7%20-%20Use%20Cases.md)
5. [Sincronização Histórica](./8%20-%20Sincroniza%C3%A7%C3%A3o%20Hist%C3%B3rica.md)

Para navegar por perfil, use o [Índice de Leitura](./%F0%9F%97%82%EF%B8%8F%20%C3%8Dndice%20de%20Leitura%20-%20Checkin%20Bot.md).

## 🚀 Status do Projeto

Os fluxos de coleta em tempo real, o backfill parcial, a persistência com Prisma e os testes automatizados já estão implementados. Esse conjunto forma a base de dados do projeto.

A camada de leitura ainda é um próximo passo: não existe API de consulta, interface web, dashboard ou geração de relatórios no código atual. O arquivo `application/query/userQuery.ts` está reservado para essa evolução futura.

## 💡 Por onde começar?

### 👨‍💻 Se você é desenvolvedor

Comece pela [Documentação Técnica](./1%20-%20Documenta%C3%A7%C3%A3o%20t%C3%A9cnica.md), percorra os [Use Cases](./7%20-%20Use%20Cases.md) e depois aprofunde as camadas que mais se relacionam à sua tarefa.

### 🏗️ Se você quer entender a arquitetura

Use o mapa em [`arquitecture.md`](../arquitecture.md) para formar uma visão rápida e, em seguida, percorra Domain, Application, Infrastructure e Contexts. As notas deixam explícitas tanto as fronteiras desejadas quanto as particularidades do código atual.

### 📊 Se você trabalha com dados

Leia primeiro a [Documentação de Produto](./0%20-%20Documenta%C3%A7%C3%A3o%20de%20Produto.md) e as [Entidades Principais](./6%20-%20Entidades%20Principais.md). Depois, consulte a [Sincronização Histórica](./8%20-%20Sincroniza%C3%A7%C3%A3o%20Hist%C3%B3rica.md) para compreender a cobertura e as limitações dos dados.

### 🚀 Se você quer executar o projeto

Siga o [README](../README.md) para instalar e subir o ambiente. Se ainda não possui uma aplicação Discord, consulte [Como criar um bot no Discord](./Criar-bot-Discord.md).
