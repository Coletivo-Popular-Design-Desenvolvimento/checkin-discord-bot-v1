# Changelog

## [1.1.0] - 2026-08-26

### Adicionado

- Documentação do Spike com comparação entre Metabase, Apache Superset e Grafana.
- ADR propondo o Metabase Open Source como ferramenta de análise do Check-In.
- Profile Docker Compose `analytics` com banco analítico simulado, views agregadas e painel Metabase reproduzível.
- Dataset de demonstração sem nomes, e-mails, identificadores pessoais ou conteúdo de mensagens.
- Usuário de leitura do BI limitado a `SELECT` nas views analíticas.
- Contas locais de administração, curadoria e leitura, com permissões de coleção verificadas na PoC.

### Validado

- Build, lint e suíte completa de testes automatizados.
- Subida limpa da PoC em ambiente isolado.
- Acesso ao painel, filtros por período e canal e retorno de dados nas consultas.
- Bloqueio de escrita do usuário analítico e separação entre edição e visualização.
