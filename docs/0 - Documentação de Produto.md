# Documentação de Produto — Check-in Bot

## O que é

O Check-in é um bot open source do CPDD que coleta metadados de participação no Discord e os organiza em um banco relacional. Sua intenção é fornecer uma base factual para conversas sobre retenção, eventos, conteúdos e comunicação da comunidade.

A analogia adequada é um termômetro comunitário: ele indica mudanças de atividade, mas não explica sozinho motivações, opiniões, sentimentos ou a qualidade das relações.

## Objetivo

Permitir análises coletivas como:

- evolução de membros ativos por período;
- atividade por canal e faixa de horário;
- entradas, saídas e retorno de membros;
- participação em eventos e canais de voz;
- reação da comunidade às mensagens, sem ler seu conteúdo;
- cobertura e qualidade da própria coleta.

## Limites do produto

O Check-in não é:

- sistema de autenticação ou atribuição de acesso;
- mecanismo de ponto ou presença obrigatória;
- bot de moderação;
- monitoramento fora do servidor;
- análise de conteúdo, opinião ou sentimento;
- ranking de desempenho de pessoas.

O código atual não oferece API, dashboard ou relatórios prontos. Ele coleta e persiste a matéria-prima; uma camada de leitura analítica ainda precisa ser construída.

## Dados coletados

| Sinal    | Dados persistidos                                                                           | Dados não persistidos                   |
| -------- | ------------------------------------------------------------------------------------------- | --------------------------------------- |
| Membro   | identificador Discord, nomes públicos, status, datas de entrada/atividade e relações atuais | mensagens privadas, atividade externa   |
| Mensagem | identificador, autor, canal, data original e indicador de exclusão                          | texto, anexos e mídia                   |
| Reação   | usuário, mensagem, canal, emoji e data disponível                                           | interpretação da reação                 |
| Canal    | identificador, nome e URL                                                                   | conteúdo do canal                       |
| Cargo    | identificador, nome e associação atual                                                      | histórico completo de concessão/remoção |
| Voz      | evento, canal, criador, horários, status, contagem e entradas/saídas observadas             | áudio ou gravação                       |

O campo opcional `User.email` existe no schema, mas não é preenchido pelos adaptadores atuais do Discord. Ele não deve ser exposto em análises.

## Princípios de uso responsável

- minimização: coletar somente o necessário;
- finalidade: usar os dados para compreender fenômenos coletivos;
- transparência: comunicar o que é coletado e para qual finalidade;
- acesso restrito: disponibilizar dados identificáveis apenas quando necessário e autorizado;
- agregação: preferir grupos, períodos e canais a rankings individuais;
- contexto: mostrar limites e cobertura junto das métricas;
- revisão humana: dados apoiam diálogo e decisão, não substituem interpretação comunitária.

Esta documentação descreve princípios do produto, não certifica conformidade jurídica. Base legal, retenção, atendimento a titulares, descarte e controles de acesso precisam de definição e revisão organizacional próprias.

## Regras observáveis no código

### Membros

- bots são ignorados nos principais fluxos de criação e atividade;
- uma entrada cria o membro ou reativa um cadastro inativo;
- a saída do servidor inverte o status para inativo, sem apagar o registro;
- o evento `ClientReady` sincroniza os membros que o Discord disponibiliza;
- alterações de membro sincronizam o conjunto atual de cargos.

### Participação

- mensagens de bots e mensagens sem guild são ignoradas;
- mensagens asseguram a existência de autor e canal antes da persistência;
- reações podem criar os registros dependentes ausentes e são únicas por usuário, mensagem e emoji;
- eventos agendados são observados; o fluxo atual persiste o início ativo e finaliza eventos concluídos, enquanto outros estados são apenas registrados no log;
- mudanças de voz criam `UserEvent` de entrada ou saída e podem criar uma sessão de voz automática quando não existe evento ativo para o canal.

### Histórico

- usuários, cargos e canais representam o estado disponível no momento da importação;
- mensagens, reações e eventos agendados respeitam o intervalo solicitado dentro dos limites da API;
- o histórico de `UserEvent` não é recuperado;
- reações históricas não possuem timestamp real e usam uma aproximação documentada;
- a importação é aditiva/idempotente e não reconstrói toda a história do servidor.

## Critérios de sucesso recomendados

O sucesso deve ser avaliado por evidências, não por percentuais presumidos:

- coleta executa sem armazenar conteúdo;
- eventos suportados chegam ao banco com relações válidas;
- falhas e lacunas de cobertura ficam visíveis;
- métricas possuem definições compartilhadas;
- análises agregadas ajudam pessoas técnicas e não técnicas a dialogar;
- acesso e exposição respeitam as decisões de governança da comunidade.

## Próximas decisões de produto

- definir dicionário de métricas: membro ativo, retenção, reativação e presença;
- definir política de retenção e descarte;
- revisar a necessidade do campo `email`;
- criar uma camada analítica somente leitura;
- validar visualizações com pessoas de diferentes níveis técnicos;
- documentar responsáveis e processo para solicitações sobre dados.

## Leituras relacionadas

- [Documentação técnica](./1%20-%20Documenta%C3%A7%C3%A3o%20t%C3%A9cnica.md)
- [Entidades Principais](./6%20-%20Entidades%20Principais.md)
- [Sincronização Histórica](./8%20-%20Sincroniza%C3%A7%C3%A3o%20Hist%C3%B3rica.md)
- [Licença AGPL-3.0](../LICENSE)
