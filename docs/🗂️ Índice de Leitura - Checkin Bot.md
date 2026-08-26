# 🗂️ Índice de Leitura - Checkin Bot

## Ordem Recomendada de Leitura

Para desenvolvedores que querem entender o projeto Checkin Bot, recomendamos seguir esta sequência:

### 📚 Documentação Básica

1. **[0 - Documentação de Produto](./0%20-%20Documentação%20de%20Produto.md)** - Visão de produto e objetivos
2. **[1 - Documentação técnica](./1%20-%20Documentação%20técnica.md)** - Overview técnico completo e arquitetura

### 🏗️ Arquitetura e Estrutura

3. **[2 - Domain Layer](./2%20-%20Domain%20Layer.md)** - Camada de domínio (regras de negócio)
4. **[3 - Application Layer](./3%20-%20Application%20Layer.md)** - Camada de aplicação (CQRS)
5. **[4 - Infrastructure Layer](./4%20-%20Infrastructure%20Layer.md)** - Camada de infraestrutura (Discord + DB)
6. **[5 - Contexts](./5%20-%20Contexts.md)** - Dependency Injection e configuração

### 🧩 Componentes Específicos

7. **[6 - Entidades Principais](./6%20-%20Entidades%20Principais.md)** - Modelos de domínio e relacionamentos
8. **[7 - Use Cases](./7%20-%20Use%20Cases.md)** - Casos de uso e regras de negócio
9. **[8 - Sincronização Histórica](./8%20-%20Sincronização%20Histórica.md)** - Backfill de mensagens e eventos de voz via CLI

### 📊 Análise de Dados e Decisões

10. **[Spike 0001 - Ferramenta de análise de dados](./spike/0001-ferramenta-analise-dados.md)** - Comparativo entre Metabase, Apache Superset e Grafana
11. **[ADR 0001 - Metabase para análise dos dados](./adr/0001-metabase-para-analise-de-dados.md)** - Decisão proposta e condições para aceitação

## Sequência por Perfil

### 👨‍💻 **Para Desenvolvedores Iniciantes**

1. [1 - Documentação técnica](./1%20-%20Documentação%20técnica.md) - Entender o contexto
2. [1 - Documentação técnica](./1%20-%20Documentação%20técnica.md) - Visão macro (arquitetura)
3. [6 - Entidades Principais](./6%20-%20Entidades%20Principais.md) - Entender os dados
4. [7 - Use Cases](./7%20-%20Use%20Cases.md) - Entender as operações
5. [2 - Domain Layer](./2%20-%20Domain%20Layer.md) - Aprofundar no domínio

### 🏗️ **Para Arquitetos de Software**

1. [1 - Documentação técnica](./1%20-%20Documentação%20técnica.md) - Arquitetura macro
2. [2 - Domain Layer](./2%20-%20Domain%20Layer.md) - Regras de negócio
3. [3 - Application Layer](./3%20-%20Application%20Layer.md) - CQRS implementation
4. [4 - Infrastructure Layer](./4%20-%20Infrastructure%20Layer.md) - Detalhes técnicos
5. [5 - Contexts](./5%20-%20Contexts.md) - Dependency Injection

### 📊 **Para Analistas de Dados**

1. [0 - Documentação de Produto](./0%20-%20Documentação%20de%20Produto.md) - Objetivos de negócio
2. [6 - Entidades Principais](./6%20-%20Entidades%20Principais.md) - Modelo de dados
3. [4 - Infrastructure Layer](./4%20-%20Infrastructure%20Layer.md) - Database schema
4. [7 - Use Cases](./7%20-%20Use%20Cases.md) - Como os dados são coletados
5. [Spike 0001 - Ferramenta de análise de dados](./spike/0001-ferramenta-analise-dados.md) - Como os dados poderão ser visualizados

### 🚀 **Para DevOps/Deploy**

1. [1 - Documentação técnica](./1%20-%20Documentação%20técnica.md) - Tecnologias utilizadas
2. [5 - Contexts](./5%20-%20Contexts.md) - Configuração da aplicação
3. [4 - Infrastructure Layer](./4%20-%20Infrastructure%20Layer.md) - Dependências externas
4. [8 - Sincronização Histórica](./8%20-%20Sincronização%20Histórica.md) - Rodar o backfill via CLI ou GitHub Actions

## Glossário Rápido

| Termo                  | Significado                                                                  |
| ---------------------- | ---------------------------------------------------------------------------- |
| **Clean Architecture** | Arquitetura em camadas com dependências direcionadas para dentro             |
| **CQRS**               | Command Query Responsibility Segregation - separação entre leitura e escrita |
| **Domain Entity**      | Objetos que representam conceitos de negócio                                 |
| **Use Case**           | Implementação de uma regra de negócio específica                             |
| **Repository**         | Padrão para acesso a dados abstraindo a persistência                         |
| **Context**            | Sistema de Dependency Injection manual                                       |
| **Discord.js**         | Biblioteca para integração com Discord API                                   |
| **Prisma**             | ORM para TypeScript/JavaScript                                               |

## Status da Documentação

### ✅ Completo

- Arquitetura geral
- Domain Layer
- Application Layer
- Infrastructure Layer
- Contexts
- Entidades principais
- Use Cases principais

### 🔄 Em Desenvolvimento

- Guias de desenvolvimento
- Exemplos de código
- Troubleshooting
- Performance guidelines

### 📋 Planejado

- API documentation
- Deployment guides
- Monitoring setup
- Backup strategies

## Convenções da Documentação

### 🎯 **Símbolos Utilizados**

- ✅ = Implementado/Completo
- 🔄 = Em desenvolvimento
- 📋 = Planejado
- 🚧 = Em migração
- ⚠️ = Atenção necessária

### 📝 **Estrutura das Notas**

- **Visão Geral**: Propósito e contexto
- **Estrutura**: Organização de arquivos/pastas
- **Implementação**: Detalhes técnicos
- **Padrões**: Design patterns aplicados
- **Links Relacionados**: Navegação entre notas

### 🔗 **Navegação**

- Links bidirecionais entre notas relacionadas
- Referências específicas com linha de código quando relevante
- Índice de navegação em cada nota principal

---

**💡 Dica**: Use o Obsidian Graph View para visualizar as conexões entre os conceitos!

**🤝 Contribuições**: Esta documentação evolui com o projeto. Mantenha-a atualizada conforme implementa novas funcionalidades.
