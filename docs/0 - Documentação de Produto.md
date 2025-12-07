# Documentação de Produto - Checkin Bot

**Status**: ✅ Atualizada - Novembro 2025
**Versão**: 1.0 (Pré-Alpha)

---

## 📋 Visão Geral do Projeto

### O que é o Checkin Bot

O **Checkin Bot** é um bot Discord desenvolvido para monitorar e medir o engajamento dos membros do **Coletivo Popular de Design e Desenvolvimento (CPDD)**. O projeto surge da necessidade de ter visibilidade sobre como os membros interagem no servidor, fornecendo dados essenciais para melhorar estratégias de engajamento e retenção.

### Contexto e Motivação

O CPDD precisa de **dados concretos** sobre o comportamento e engajamento dos membros para:

- Tomar decisões estratégicas baseadas em evidências
- Melhorar a retenção de membros
- Otimizar conteúdos de eventos, cursos e informativos
- Identificar áreas que necessitam atenção

## 🎯 Objetivos de Negócio

### Objetivo Principal

**Fornecer visibilidade sobre o engajamento no servidor Discord** através da coleta automatizada de dados mínimos necessários para análise estratégica.

### Objetivos Específicos

1. **Medir engajamento da comunidade** através de métricas objetivas
2. **Identificar padrões de comportamento** dos membros
3. **Fornecer base de dados** para o projeto "Dados" do coletivo
4. **Apoiar tomada de decisão** das lideranças com dados concretos
5. **Melhorar estratégias** de conteúdo e eventos

### Alinhamento Estratégico

O Checkin Bot é um **componente fundamental** da estratégia de dados do CPDD, servindo como fonte primária de informações sobre engajamento para análises posteriores realizadas pelo time de dados.

## 📊 Integração com Projeto "Dados"

O Checkin Bot é a **primeira ferramenta** de um ecossistema maior de análise de dados do coletivo:

- **Checkin Bot**: Coleta dados de engajamento do Discord
- **Projeto "Dados"**: Analisa e interpreta os dados coletados
- **Outras ferramentas**: Futuras fontes de dados a serem integradas

## ⚖️ Regras de Negócio

### RN001 - Registro Automático de Usuários

**Regra**: Usuários são automaticamente registrados quando entram na comunidade

- **Ação**: Salvar ID do usuário, ID do Discord, data de entrada
- **Exceção**: Bots não são registrados no sistema
- **Reativação**: Usuários que retornam são automaticamente reativados

### RN002 - Coleta de Interações

**Regra**: Todas as interações relevantes são registradas automaticamente

- **Escopo**: Mensagens, reações, eventos de áudio
- **Dados**: Apenas metadados (IDs, timestamps, contadores)
- **Segurança**: Dados relacionais para integridade

### RN003 - Conformidade LGPD

**Regra**: Usuários são informados sobre coleta de dados

- **Transparência**: Dados coletados especificados nos termos do servidor
- **Consentimento**: Implícito pela participação no servidor
- **Direitos**: Possibilidade de remoção de dados mediante solicitação

### RN004 - Minimização de Dados

**Regra**: Coletar apenas dados estritamente necessários

- **Princípio**: Dados mínimos para análise de engajamento
- **Proibido**: Conteúdo de mensagens, mídias, gravações
- **Foco**: Metadados quantitativos

## 🛠️ Escopo do Produto

### Funcionalidades Principais

#### ✅ Coleta de Dados Core

**Usuários**

- ID interno e ID Discord
- Nome de usuário e nome global
- Data de entrada no servidor
- Status (ativo/inativo)
- Última atividade registrada

**Mensagens**

- Metadados temporais (quando foi enviada)
- Relacionamento usuário-canal
- Status (ativa/deletada)
- Reações recebidas

**Eventos de Áudio**

- ID do evento e criador
- Nome e descrição
- Horários de início e fim
- Número de participantes
- Canal onde ocorreu

**Canais**

- ID e nome do canal
- URL de acesso
- Relacionamentos com usuários e mensagens

#### ✅ Persistência Relacional

- Banco de dados MySQL com Prisma ORM
- Estrutura normalizada e otimizada
- Integridade referencial garantida
- Backup e recuperação

#### 🔄 Funcionalidades em Desenvolvimento

- **Relatórios básicos**: Estatísticas de engajamento
- **API de consulta**: Interface para acesso aos dados
- **Dashboard simples**: Visualização inicial dos dados

### Funcionalidades Secundárias (Futuras)

#### 📋 Planejadas para V2

- **Ferramenta de visualização avançada**: Dashboard completo
- **Integração com outras plataformas**: Telegram, etc.
- **Relatórios automatizados**: Geração periódica

#### 🌟 Visão de Longo Prazo

- **Adaptação para outras organizações**: Versão genérica
- **Machine Learning**: Predição de engajamento
- **Integração com CRM**: Gestão de membros

### Limitações Explícitas

#### 🚫 O que NÃO fazemos

- **Conteúdo de mensagens**: Não armazenamos texto das mensagens
- **Mídias**: Não coletamos imagens, vídeos, áudios
- **Dados pessoais**: Apenas IDs e nomes públicos do Discord
- **Monitoramento invasivo**: Não rastreamos fora do servidor
- **Automatizações de moderação**: Não é um bot de moderação

#### 🔒 Garantias de Privacidade

- Dados coletados são **mínimos e necessários**
- **Transparência total** sobre o que é coletado
- **Acesso restrito** apenas ao time autorizado
- **Conformidade** com LGPD e políticas do Discord

## 👥 Público-Alvo

### Pessoas Chave

- **Diretoria do CPDD**: Tomada de decisão estratégica
- **Lideranças técnicas**: Implementação e manutenção
- **Time de dados**: Análise e interpretação

### Focos Secundários

- **Membros do coletivo**: Beneficiários indiretos das melhorias
- **Desenvolvedores externos**: Possíveis contribuidores (projeto aberto)

### Usuários dos Dados

- **@Eder Borella e @Intra**: Diretoria
- **@Milena C**: Liderança de desenvolvimento
- **@Paulo Costa**: Liderança de dados

## 📈 Critérios de Sucesso

### Métricas de Implementação

- **Cobertura**: 100% dos eventos relevantes capturados
- **Precisão**: 99%+ de accuracy na coleta de dados
- **Performance**: < 100ms latência na coleta
- **Disponibilidade**: 99.9% uptime do bot

### Métricas de Produto

- **Adoção**: Dados sendo usados para decisões estratégicas
- **Insights**: Descobertas acionáveis sobre engajamento
- **Impacto**: Melhorias mensuráveis na retenção de membros

### Critérios de Aceitação por Fase

#### Fase Alpha ✅

- [x] Arquitetura Clean implementada
- [x] Coleta básica de usuários funcionando
- [x] Testes automatizados implementados
- [x] Documentação técnica completa

#### Fase Beta 🔄

- [ ] Coleta completa de todos os eventos
- [ ] API básica de consulta
- [ ] Deploy em ambiente de testes
- [ ] Validação com pessoas chave

#### Fase Produção 📋

- [ ] Deploy em produção
- [ ] Monitoramento e alertas
- [ ] Primeiro relatório de engajamento
- [ ] Integração com projeto "Dados"

## 🚀 Roadmap e Próximos Passos

### Prioridade 1 - Completar Migração

- Implementar coleta de mensagens e eventos
- Testes de integração completos

### Prioridade 2 - Deploy e Validação

- Setup de ambiente de produção
- Testes com dados reais (sandbox)
- Validação com stakeholders

### Prioridade 3 - Análise Inicial

- Primeiros relatórios de engajamento
- Integração com time de dados
- Refinamento baseado em feedback

### Prioridade 4 - Expansão

- Dashboard de visualização
- Alertas automáticos
- Otimizações de performance

## 🔧 Aspectos Técnicos

### Arquitetura

- **Clean Architecture** com CQRS
- **TypeScript** + Node.js
- **Discord.js** para integração
- **Prisma** + MySQL para persistência

### Conformidade

- **LGPD**: Dados mínimos, transparência, direito de remoção
- **Discord ToS**: Conformidade com termos de serviço
- **Segurança**: Acesso restrito, logs auditáveis

### Open Source

- **Licença**: A definir (provavelmente MIT ou GPL)
- **Contribuições**: Welcomes de desenvolvedores externos
- **Documentação**: Técnica e de produto disponíveis

---

## 📚 Links Relacionados

- **Documentação Técnica**: [1 - Documentação técnica](1%20-%20Documentação%20técnica.md)
- **Arquitetura**: [2 - Arquitetura Geral - Checkin Bot](2%20-%20Arquitetura%20Geral%20-%20Checkin%20Bot)
- **Guia de Leitura**: [🗂️ Índice de Leitura - Checkin Bot](🗂️%20Índice%20de%20Leitura%20-%20Checkin%20Bot.md)

---

**Última atualização**: Dezembro 2024
**Próxima revisão**: Após deploy em produção
