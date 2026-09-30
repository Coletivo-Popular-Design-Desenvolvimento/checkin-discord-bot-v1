# Documentação de Produto - Checkin Bot

## 📋 Visão Geral do Projeto

### O que é o Checkin Bot

O **Checkin Bot** é um bot open source do CPDD que coleta metadados de participação no Discord e os organiza em um banco relacional. Sua intenção é oferecer uma base concreta para conversas sobre retenção, eventos, conteúdos e comunicação da comunidade.

A analogia adequada é um termômetro comunitário: ele indica mudanças de atividade, mas não explica sozinho motivações, opiniões, sentimentos ou a qualidade das relações.

### Contexto e Motivação

O Discord é um espaço onde a comunidade conversa, organiza reuniões, compartilha atividades e também convive de maneira informal. Quando esses sinais são observados de forma responsável e agregada, eles podem ajudar a perceber mudanças na participação e orientar novos diálogos.

## 🎯 Objetivos de Negócio

### Objetivo Principal

Permitir análises coletivas como:

- evolução de membros ativos por período;
- atividade por canal e faixa de horário;
- entradas, saídas e retorno de membros;
- participação em eventos e canais de voz;
- reação da comunidade às mensagens, sem ler seu conteúdo;
- cobertura e qualidade da própria coleta.

## 🚫 Limitações Explícitas

O Checkin Bot não é:

- sistema de autenticação ou atribuição de acesso;
- mecanismo de ponto ou presença obrigatória;
- bot de moderação;
- monitoramento fora do servidor;
- análise de conteúdo, opinião ou sentimento;
- ranking de desempenho de pessoas.

O código atual não oferece API, dashboard ou relatórios prontos. Ele coleta e persiste a matéria-prima; uma camada de leitura analítica ainda precisa ser construída.

## 🛠️ Escopo do Produto

### Dados coletados

| Sinal    | Dados persistidos                                                                           | Dados não persistidos                   |
| -------- | ------------------------------------------------------------------------------------------- | --------------------------------------- |
| Membro   | identificador Discord, nomes públicos, status, datas de entrada/atividade e relações atuais | mensagens privadas, atividade externa   |
| Mensagem | identificador, autor, canal, data original e indicador de exclusão                          | texto, anexos e mídia                   |
| Reação   | usuário, mensagem, canal, emoji e data disponível                                           | interpretação da reação                 |
| Canal    | identificador, nome e URL                                                                   | conteúdo do canal                       |
| Cargo    | identificador, nome e associação atual                                                      | histórico completo de concessão/remoção |
| Voz      | evento, canal, criador, horários, status, contagem e entradas/saídas observadas             | áudio ou gravação                       |

O campo opcional `User.email` existe no schema, mas não é preenchido pelos adaptadores atuais do Discord. Ele não deve ser exposto em análises.

## ⚖️ Princípios de uso responsável

- minimização: coletar somente o necessário;
- finalidade: usar os dados para compreender fenômenos coletivos;
- transparência: comunicar o que é coletado e para qual finalidade;
- acesso restrito: disponibilizar dados identificáveis apenas quando necessário e autorizado;
- agregação: preferir grupos, períodos e canais a rankings individuais;
- contexto: mostrar limites e cobertura junto das métricas;
- revisão humana: dados apoiam diálogo e decisão, não substituem interpretação comunitária.

Esta documentação descreve princípios do produto, não certifica conformidade jurídica. Base legal, retenção, atendimento a titulares, descarte e controles de acesso precisam de definição e revisão organizacional próprias.

## 📐 Regras de Negócio Observáveis no Código

As regras abaixo mantêm a nomenclatura de negócio do projeto, mas descrevem somente o comportamento que pode ser confirmado no código atual.

### RN001 - Registro Automático de Usuários

- bots são ignorados nos principais fluxos de criação e atividade;
- uma entrada cria o membro ou reativa um cadastro inativo;
- a saída do servidor inverte o status para inativo, sem apagar o registro;
- o evento `ClientReady` sincroniza os membros que o Discord disponibiliza;
- alterações de membro sincronizam o conjunto atual de cargos.

### RN002 - Coleta de Interações

- mensagens de bots e mensagens sem guild são ignoradas;
- mensagens asseguram a existência de autor e canal antes da persistência;
- reações podem criar os registros dependentes ausentes e são únicas por usuário, mensagem e emoji;
- eventos agendados são observados; o fluxo atual persiste o início ativo e finaliza eventos concluídos, enquanto outros estados são apenas registrados no log;
- mudanças de voz criam `UserEvent` de entrada ou saída e podem criar uma sessão de voz automática quando não existe evento ativo para o canal.

### RN003 - Transparência e Proteção dos Dados

O produto assume transparência, minimização e acesso responsável como princípios. A aplicação, sozinha, não implementa todo o processo organizacional necessário para afirmar conformidade jurídica: base legal, retenção, descarte e atendimento a titulares continuam sendo decisões de governança.

### RN004 - Minimização de Dados

O fluxo não persiste texto, anexos, mídia ou gravações. O campo opcional `email` permanece no schema por herança da modelagem, mas não é coletado pelos adapters atuais e não deve ser exposto na camada analítica.

### 🕰️ Sincronização Histórica

- usuários, cargos e canais representam o estado disponível no momento da importação;
- mensagens, reações e eventos agendados respeitam o intervalo solicitado dentro dos limites da API;
- o histórico de `UserEvent` não é recuperado;
- reações históricas não possuem timestamp real e usam uma aproximação documentada;
- a importação é aditiva/idempotente e não reconstrói toda a história do servidor.

## 📈 Critérios de Sucesso

O sucesso deve ser avaliado por evidências, não por percentuais presumidos:

- coleta executa sem armazenar conteúdo;
- eventos suportados chegam ao banco com relações válidas;
- falhas e lacunas de cobertura ficam visíveis;
- métricas possuem definições compartilhadas;
- análises agregadas ajudam pessoas técnicas e não técnicas a dialogar;
- acesso e exposição respeitam as decisões de governança da comunidade.

## 🚀 Roadmap e Próximos Passos

- definir dicionário de métricas: membro ativo, retenção, reativação e presença;
- definir política de retenção e descarte;
- revisar a necessidade do campo `email`;
- criar uma camada analítica somente leitura;
- validar visualizações com pessoas de diferentes níveis técnicos;
- documentar responsáveis e processo para solicitações sobre dados.

## 📚 Links Relacionados

- [Documentação técnica](./1%20-%20Documenta%C3%A7%C3%A3o%20t%C3%A9cnica.md)
- [Entidades Principais](./6%20-%20Entidades%20Principais.md)
- [Sincronização Histórica](./8%20-%20Sincroniza%C3%A7%C3%A3o%20Hist%C3%B3rica.md)
- [Licença AGPL-3.0](../LICENSE)
