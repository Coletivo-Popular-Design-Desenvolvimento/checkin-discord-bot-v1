# 👋 Começe por aqui - Checkin Bot

**Bem-vindo ao projeto Checkin Bot!**

---

## 🎯 O que é este projeto?

O **Checkin Bot** é um bot Discord desenvolvido para o **Coletivo Popular de Design e Desenvolvimento (CPDD)** que coleta **metadados de engajamento** dos membros do servidor Discord.

### Propósito

- 📊 **Medir engajamento** através de dados objetivos
- 🎯 **Apoiar decisões estratégicas** baseadas em evidências
- 📈 **Melhorar retenção** de membros do coletivo
- 🔍 **Gerar insights** sobre comportamento da comunidade

### O que coletamos

✅ **Metadados apenas** - IDs, timestamps, contadores
❌ **Nunca** - conteúdo de mensagens, mídias, dados pessoais

---

## 🏗️ Arquitetura

Este projeto segue **Clean Architecture + CQRS**, garantindo:

- 🧩 **Separação clara** de responsabilidades
- 🧪 **Alta testabilidade** e manutenibilidade
- 🔄 **Independência** de frameworks externos
- 📖 **Código legível** e bem estruturado

### Stack Tecnológica

- **Runtime**: Node.js + TypeScript
- **Framework**: Discord.js v14
- **Database**: MySQL + Prisma ORM
- **Testing**: Jest
- **Containerização**: Docker

---

## 🗂️ Documentação

### 📚 **Primeiros Passos**

- [📋 Documentação de Produto](./0%20-%20Documentação%20de%20Produto.md) - Visão de negócio e objetivos
- [🔧 Documentação Técnica](./1%20-%20Documentação%20técnica.md) - Overview completo da implementação
- [🤖 Criar bot no Discord](./Criar-bot-Discord.md) - Passo a passo com prints (token, OAuth2, convite)
- [🗂️ Índice de Leitura](./🗂️%20Índice%20de%20Leitura%20-%20Checkin%20Bot.md) - Guia de navegação por perfil

### 🏛️ **Arquitetura Detalhada**

- [🏗️ Domain Layer](./2%20-%20Domain%20Layer.md) - Regras de negócio e entidades
- [⚙️ Application Layer](./3%20-%20Application%20Layer.md) - CQRS e orquestração
- [🔧 Infrastructure Layer](./4%20-%20Infrastructure%20Layer.md) - Discord + Database
- [🔌 Contexts](./5%20-%20Contexts.md) - Dependency Injection

### 📊 **Modelos e Casos de Uso**

- [📋 Entidades Principais](./6%20-%20Entidades%20Principais.md) - Modelos de dados
- [🔄 Use Cases](./7%20-%20Use%20Cases.md) - Regras de negócio implementadas

---

## 🚀 Status do Projeto

### ✅ **Fase 1 - Concluída**

- Clean Architecture implementada
- Sistema de usuários (CRUD completo)
- Integração básica Discord
- Testes automatizados

### 🔄 **Fase 2 - Em Andamento**

- Coleta de mensagens e eventos
- Migração de código legado
- Testes de integração

### 📋 **Próximos Passos**

- Deploy em produção
- Relatórios de engajamento
- Integração com projeto "Dados"

---

## 🎯 Por onde começar?

### 👨‍💻 **Se você é desenvolvedor:**

1. Leia a [Documentação Técnica](./1%20-%20Documentação%20técnica.md) para entender o contexto
2. Explore as [Entidades Principais](./6%20-%20Entidades%20Principais.md) para entender os dados
3. Veja os [Use Cases](./7%20-%20Use%20Cases.md) para entender as operações
4. Mergulhe no [Domain Layer](./2%20-%20Domain%20Layer.md) para as regras de negócio

### 🏗️ **Se você é arquiteto:**

1. Comece pela [Documentação Técnica](./1%20-%20Documentação%20técnica.md) para visão macro
2. Aprofunde-se nas camadas: [Domain](./2%20-%20Domain%20Layer.md) → [Application](./3%20-%20Application%20Layer.md) → [Infrastructure](./4%20-%20Infrastructure%20Layer.md)
3. Entenda a [Dependency Injection](./5%20-%20Contexts.md)

### 📊 **Se você trabalha com dados:**

1. Veja a [Documentação de Produto](./0%20-%20Documentação%20de%20Produto.md) para objetivos
2. Entenda o [modelo de dados](./6%20-%20Entidades%20Principais.md)
3. Veja como [dados são coletados](./7%20-%20Use%20Cases.md)

---

## 💡 Dicas

- 🔍 Use o **Obsidian Graph View** para visualizar conexões entre conceitos
- 📝 Todos os links são **relativos** e funcionam tanto no GitHub quanto no Obsidian
- 🤝 Esta documentação evolui com o projeto - mantenha-a atualizada!

---

**Boa codada! 🚀**

_Qualquer dúvida, consulte o [Índice de Leitura](./🗂️%20Índice%20de%20Leitura%20-%20Checkin%20Bot.md) ou entre em contato via Discord do CPDD._
