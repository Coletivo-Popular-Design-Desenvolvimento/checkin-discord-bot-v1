---
status: proposed
date: 2026-08-26
---

# Metabase Open Source para análise dos dados do Check-In

Propomos o Metabase Open Source como primeira ferramenta de análise e visualização do Check-In porque ele oferece o melhor equilíbrio inicial entre self-hosting, conexão com MariaDB/MySQL e acessibilidade para pessoas não especialistas. A decisão permanecerá proposta até a PoC comprovar ambiente reproduzível, painel conectado e autonomia de uso em uma validação coletiva.

Os cenários técnicos de reprodutibilidade, conexão, filtros, somente leitura e permissões de coleção foram aprovados em 26 de agosto de 2026. A decisão continua proposta porque a sessão de diálogo e autonomia com pessoas de diferentes perfis ainda precisa ser realizada, e o grupo deve avaliar se o consumo observado de aproximadamente 1,4 GiB é aceitável.

## Opções consideradas

- **Metabase Open Source:** favorito pela interface de BI voltada à exploração de dados relacionais e pela expectativa de menor curva de aprendizado.
- **Apache Superset:** segunda opção por oferecer análise avançada e permissões mais granulares, com maior custo operacional e de aprendizado.
- **Grafana Open Source:** adequado para observabilidade e séries temporais, mas menos alinhado à exploração comunitária de dados relacionais.

## Consequências

- A PoC usará apenas dados simulados e agregados.
- O Metabase se conectará por um usuário MariaDB somente leitura a views analíticas que excluem nomes, e-mails, IDs pessoais e conteúdo de mensagens.
- O painel inicial será “Saúde da Comunidade”, com filtros de período e canal e sem rankings individuais.
- A validação considerará apenas recursos disponíveis na edição open source.
- Permissões de coleção serão usadas para testar administração, curadoria e visualização; permissões granulares de dados e da aplicação, disponíveis nos planos pagos, não serão tratadas como capacidades da PoC.
- Se qualquer um dos três cenários de homologação falhar de forma relevante, o Metabase não será aceito e o Apache Superset será a alternativa seguinte.

As evidências, a matriz comparativa, o dicionário de métricas e o protocolo de validação estão no [relatório do Spike](../spike/0001-ferramenta-analise-dados.md).
