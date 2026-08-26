# Spike 0001 — Ferramenta open source de análise de dados

**Data da pesquisa:** 26 de agosto de 2026
**Status:** comparação e PoC concluídas; validação coletiva pendente
**Ferramenta favorita para a PoC:** Metabase Open Source

## Descrição

### O que é esta atividade?

Este Spike analisa e compara ferramentas open source de análise e visualização de dados para integrar o ecossistema do Check-In. A pesquisa considera Metabase, Apache Superset e Grafana e propõe uma prova de conceito com a alternativa que melhor atende às necessidades atuais do projeto.

### Por que ela é necessária?

O Check-In já transforma sinais mínimos de participação no Discord em dados relacionais, mas ainda não oferece uma camada de leitura acessível. A ferramenta escolhida precisa equilibrar eficiência técnica, custo de infraestrutura, segurança e, sobretudo, simplicidade para que pessoas contribuidoras com diferentes níveis de conhecimento consigam interpretar e discutir a saúde da comunidade.

O painel não será um instrumento de vigilância individual. Ele deve usar dados agregados, não expor conteúdo de conversas e não mostrar nomes, e-mails, identificadores ou rankings de pessoas.

## Estado dos critérios de aceite

- [x] **Mapeamento de ferramentas:** Metabase, Apache Superset e Grafana foram avaliados quanto a licença, arquitetura e self-hosting.
- [x] **Matriz comparativa:** requisitos técnicos, conectores, acessibilidade e controle de acesso foram comparados abaixo.
- [x] **Prova de Conceito:** ambiente reproduzível, dataset simulado, views somente leitura e painel com 11 cartões foram implementados e medidos.
- [ ] **Recomendação final:** o [ADR](../adr/0001-metabase-para-analise-de-dados.md) está proposto e só poderá ser aceito após a PoC e a validação coletiva.

## Critérios da comparação

| Critério               | Pergunta simples                                                                                    |
| ---------------------- | --------------------------------------------------------------------------------------------------- |
| Licença                | Podemos usar, estudar e hospedar a ferramenta como software livre?                                  |
| Arquitetura e operação | Quantos componentes precisam ser mantidos e quão difícil é subir o ambiente?                        |
| Conectores             | A ferramenta consulta MariaDB/MySQL sem uma integração feita pelo projeto?                          |
| Recursos               | Qual é a expectativa inicial de consumo e o que precisa ser medido na PoC?                          |
| Acessibilidade         | Uma pessoa não especialista consegue entender um painel e aplicar filtros?                          |
| Segurança e RBAC       | É possível separar quem administra, edita e apenas consulta? Quais limites existem na edição livre? |

As avaliações de consumo e facilidade de uso são hipóteses comparativas. Elas não substituem as medições e o teste com pessoas previstos para a PoC.

## Mapeamento das ferramentas

### Metabase Open Source

O Metabase é uma ferramenta de BI voltada à exploração de bancos relacionais por interface gráfica, com suporte a perguntas, filtros, coleções e dashboards. A edição comunitária é distribuída sob AGPL e possui imagem Docker oficial. O projeto pode conectar o Metabase ao MariaDB/MySQL sem desenvolver um conector próprio.

Para este projeto, sua principal vantagem é a menor barreira de entrada esperada para quem não trabalha diariamente com SQL. A principal limitação está nas permissões: a edição open source permite organizar conteúdo em coleções com acesso de curadoria, visualização ou nenhum acesso, mas permissões granulares sobre dados, linhas, colunas e partes administrativas ficam nos planos Pro e Enterprise. Portanto, a proteção principal da PoC deve existir no próprio MariaDB, por meio de um usuário somente leitura e views que já excluam dados pessoais.

Arquitetura inicial para self-hosting:

```text
Metabase (aplicação JVM)
    ├── banco da aplicação, para usuários, perguntas e dashboards
    └── conexão somente leitura com as views analíticas do Check-In
```

Leitura inicial:

- **Self-hosting:** simples para uma PoC, com imagem Docker oficial e um serviço principal.
- **Conector:** oficial para MySQL/MariaDB.
- **Recursos:** expectativa de consumo intermediário por executar na JVM; os números reais ainda serão medidos.
- **Aprendizado:** menor curva esperada entre as três opções para perguntas e filtros básicos.
- **RBAC OSS:** adequado para separar curadoria e visualização de coleções, mas insuficiente para isolamento granular de dados dentro do próprio Metabase.

### Apache Superset

O Apache Superset é uma plataforma de exploração e visualização de dados mais orientada a pessoas analistas e a cenários com consultas e dashboards avançados. Usa licença Apache-2.0 e possui um modelo de segurança granular baseado no Flask AppBuilder, com papéis como Admin, Alpha e Gamma e permissões por fonte de dados.

Essa flexibilidade cobra um custo operacional maior. A configuração Docker Compose oficial envolve mais peças e a própria documentação alerta que o ambiente fornecido não está pronto para produção sem trabalho adicional. O uso de MySQL/MariaDB também requer configurar o driver correspondente.

Arquitetura inicial para self-hosting:

```text
Superset web
    ├── banco de metadados
    ├── cache e workers quando usados recursos assíncronos
    └── conexão com o banco analítico do Check-In
```

Leitura inicial:

- **Self-hosting:** reproduzível por Docker, mas com mais componentes e configuração.
- **Conector:** compatível com MySQL/MariaDB mediante driver.
- **Recursos:** expectativa de maior consumo e manutenção entre as três opções.
- **Aprendizado:** mais poderoso, porém menos direto para pessoas iniciantes.
- **RBAC OSS:** é o modelo mais granular das alternativas avaliadas.

### Grafana Open Source

O Grafana é muito maduro para observabilidade, monitoramento e séries temporais. A edição open source usa AGPL e pode ser executada por imagem Docker. Seu datasource MySQL é integrado e também suporta MariaDB; a documentação recomenda um usuário dedicado com permissão apenas de leitura.

Ele oferece papéis de organização como administrador, editor e visualizador, além de permissões de dashboards e pastas. Entretanto, sua experiência principal é mais adequada a painéis operacionais e séries temporais do que à exploração livre de um modelo relacional por pessoas não especialistas.

Arquitetura inicial para self-hosting:

```text
Grafana
    ├── armazenamento da configuração e dos dashboards
    └── datasource MySQL/MariaDB somente leitura
```

Leitura inicial:

- **Self-hosting:** simples, com imagem Docker oficial e um serviço principal.
- **Conector:** datasource MySQL integrado e compatível com MariaDB.
- **Recursos:** expectativa de consumo baixo a intermediário; precisa ser medido em cenário equivalente para uma conclusão numérica.
- **Aprendizado:** simples para consumir dashboards, mas menos amigável para exploração relacional sem SQL.
- **RBAC OSS:** papéis claros de administrador, editor e visualizador; controles mais avançados variam conforme a edição.

## Matriz comparativa

| Dimensão                          | Metabase Open Source                                    | Apache Superset                                                | Grafana Open Source                                               |
| --------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------- |
| Licença                           | AGPL para a edição comunitária                          | Apache-2.0                                                     | AGPLv3                                                            |
| Foco principal                    | BI e exploração de dados relacionais                    | BI avançado e exploração analítica                             | Observabilidade e séries temporais                                |
| Arquitetura da PoC                | Aplicação JVM + banco de metadados                      | Aplicação web + metadados; cache/workers conforme configuração | Servidor Grafana + armazenamento de configuração                  |
| Facilidade de self-hosting        | **Alta** para ambiente local                            | **Média**; mais peças e configuração                           | **Alta** para ambiente local                                      |
| MariaDB/MySQL                     | Conector oficial                                        | Compatível mediante driver                                     | Datasource integrado                                              |
| Consumo esperado                  | Médio; medir na PoC                                     | Médio/alto; arquitetura mais ampla                             | Baixo/médio; depende das consultas                                |
| Criação sem SQL                   | **Muito favorável** para perguntas comuns               | Favorável, com mais conceitos analíticos                       | Possível, mas o datasource relacional frequentemente exige SQL    |
| Leitura por não especialistas     | **Hipótese mais forte**                                 | Boa depois de treinamento                                      | Boa em painéis prontos, menos autônoma na exploração              |
| Controle de conteúdo              | Coleções com Curate, View e No access                   | Papéis e permissões granulares                                 | Papéis e permissões de dashboards/pastas                          |
| Limite relevante da edição OSS    | Permissões granulares de dados e da aplicação são pagas | Maior complexidade de configuração e manutenção                | Viewer ainda consulta datasources; RBAC avançado varia por edição |
| Adequação ao objetivo comunitário | **Alta**                                                | Média/alta                                                     | Média                                                             |

## Recomendação inicial

O **Metabase Open Source** é a ferramenta escolhida para a PoC. Ele apresenta o melhor equilíbrio inicial entre conexão com MariaDB/MySQL, facilidade de self-hosting e autonomia esperada para pessoas não especialistas.

Esta recomendação é **proposta**, não definitiva. O Metabase só será aceito se passar pelos três cenários de homologação. Se falhar, a segunda opção será o Apache Superset, que oferece controle de acesso mais granular, mas exige maior esforço operacional e de aprendizado.

## Arquitetura proposta para a PoC

```text
Dataset simulado e fiel ao schema do Check-In
    ↓
MariaDB/MySQL
    ↓
Views SQL agregadas
    ↓
Usuário com permissão somente SELECT
    ↓
Metabase Open Source
    ↓
Painel “Saúde da Comunidade”
```

Decisões já aceitas:

- executar o Metabase apenas no profile Docker Compose `analytics`;
- disponibilizar a interface localmente na porta `3001`;
- usar dados simulados, determinísticos e sem relação com pessoas reais;
- manter os dados operacionais como fonte de verdade;
- expor ao BI somente views agregadas e um usuário sem escrita;
- atualizar os dados sob demanda ou periodicamente, sem exigir tempo real;
- medir recursos antes de definir um limite rígido;
- testar apenas recursos existentes na edição open source.

O comando de uso é:

```bash
docker compose --profile analytics up -d
```

Esse comando sobe o profile completo para que preparação do banco, Metabase e configuração inicial não sejam esquecidas.

## Como executar a PoC

Pré-requisito: Docker com o plugin Docker Compose.

1. Copie `.env.example` para `.env` caso o ambiente ainda não esteja configurado.
2. Suba o profile analítico:

   ```bash
   docker compose --profile analytics up -d
   ```

3. Acompanhe o provisionamento automático:

   ```bash
   docker compose --profile analytics logs -f metabase-bootstrap
   ```

4. Quando o bootstrap mostrar `"status": "ok"`, acesse [http://localhost:3001](http://localhost:3001).

Credenciais padrão exclusivamente locais:

| Perfil           | E-mail                  | Senha local        |
| ---------------- | ----------------------- | ------------------ |
| Administração    | `admin@checkin.local`   | `CheckinLocal123!` |
| Edição/curadoria | `editora@checkin.local` | `CheckinLocal123!` |
| Somente leitura  | `leitora@checkin.local` | `CheckinLocal123!` |

Essas credenciais existem apenas para a PoC. Devem ser substituídas pelas variáveis documentadas em `.env.example` antes de qualquer ambiente compartilhado. O serviço fica vinculado a `127.0.0.1`, sem exposição direta à rede.

Para interromper apenas a interface analítica:

```bash
docker compose stop metabase
```

O bootstrap é idempotente: executar novamente o comando de subida atualiza o dataset simulado e preserva uma única fonte, coleção e dashboard.

Arquivos principais da PoC:

- `compose.yml`: profile `analytics` e serviços de inicialização;
- `analytics/database/bootstrap.sh`: bancos, usuários e prova de bloqueio de escrita;
- `analytics/database/schema-and-seed.sql`: schema compatível, dados simulados e views;
- `analytics/metabase/bootstrap.mjs`: configuração idempotente da fonte, usuários, permissões, perguntas, filtros e dashboard.

## Painel “Saúde da Comunidade”

O primeiro painel deve responder perguntas coletivas, não avaliar indivíduos:

- quantas pessoas participaram no período;
- como mensagens, reações e participação em voz evoluíram no tempo;
- quais canais mobilizaram mais participação agregada;
- quantos eventos de voz ocorreram e quantas presenças tiveram;
- como grupos de entrada permanecem ativos ao longo do tempo;
- qual período e quais fontes possuem dados suficientes para análise.

Filtros mínimos:

- período;
- canal.

Elementos mínimos:

- cartões com usuários, canais, mensagens, reações e eventos;
- série temporal de mensagens e participantes ativos;
- participação agregada por canal;
- eventos e presenças em voz;
- retenção por coorte;
- quadro de cobertura e qualidade dos dados.

## Dicionário inicial de métricas

| Métrica      | Definição inicial                                                                     | Explicação simples                                                      |
| ------------ | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Membro ativo | Pessoa não-bot com ao menos uma mensagem, reação ou participação em voz no período    | Participou de alguma forma observável, sem analisar o conteúdo.         |
| Participação | Ocorrência agregada de mensagem, reação ou presença em voz                            | Mede sinais de presença, não qualidade ou opinião.                      |
| Retenção     | Parcela de uma coorte de entrada que volta a ter participação em um período posterior | Mostra se grupos novos continuam presentes com o passar do tempo.       |
| Reativação   | Pessoa sem participação em uma janela anterior que volta a participar                 | Indica retorno, sem atribuir causa ao comportamento.                    |
| Canal ativo  | Canal com ao menos uma participação registrada no período                             | Mostra onde houve atividade, não se a conversa foi boa ou ruim.         |
| Cobertura    | Intervalo e fontes para os quais a coleta é considerada utilizável                    | Ajuda a não interpretar falta de dados como queda real de participação. |

Para eventos do Discord, a análise deve preferir a data original da plataforma, como `platform_created_at`, e não a data de importação do registro. As regras acima ainda serão materializadas e testadas nas views SQL.

## Privacidade e segurança

A PoC deve aplicar proteção em duas camadas:

1. **No banco:** usuário somente leitura e views que não exponham nome, e-mail, identificador de usuário nem conteúdo de mensagem.
2. **No Metabase:** coleções separadas para administração, curadoria e visualização, dentro do que a edição comunitária realmente oferece.

Não serão permitidos:

- rankings de pessoas;
- tabelas com atividade individual;
- e-mails, nomes ou IDs pessoais;
- conteúdo de mensagens, mídias ou gravações;
- publicação anônima do painel;
- conexão do BI com credenciais capazes de alterar o banco.

O teste de RBAC verificará três experiências: administração, edição/curadoria e somente leitura. Como o Metabase OSS não oferece isolamento granular de dados por grupo, as views e as permissões do MariaDB são uma condição arquitetural, e não apenas uma conveniência.

## Medições da PoC

Medições locais em WSL2, Docker e Metabase `v0.63.14`, em 26 de agosto de 2026:

| Medição                                     |                Resultado observado |
| ------------------------------------------- | ---------------------------------: |
| Reinicialização com banco já preparado      | 16,5 s até `/api/health` responder |
| Memória apó a carga do painel               |           aproximadamente 1,39 GiB |
| Onze consultas sem cache, em sequência      |                    862 ms no total |
| Consulta individual mais lenta              |                             236 ms |
| Renderização e filtro de canal no navegador |      concluídos sem erro funcional |

O consumo de memória é relevante para um projeto pequeno e deve entrar na decisão coletiva. Não houve falta de memória, travamento ou consulta lenta no dataset da PoC, mas um ambiente de homologação deve confirmar se aproximadamente 1,4 GiB é um custo aceitável.

## Como validar em homologação

### Cenário 1: execução e reprodutibilidade

1. Baixar a branch do Spike.
2. Executar o comando documentado de subida do profile `analytics`.
3. Confirmar que o serviço fica saudável e acessível em `http://localhost:3001`.

**Resultado esperado:** o ambiente sobe sem configuração manual não documentada e sem interferir no funcionamento normal do bot.

### Cenário 2: conexão e painel

1. Acessar o Metabase.
2. Confirmar a conexão somente leitura com a fonte simulada.
3. Abrir o painel “Saúde da Comunidade”.
4. Alterar período e canal.

**Resultado esperado:** os gráficos mostram dados legíveis, os filtros funcionam, nenhuma informação individual aparece e a ferramenta não consegue escrever no banco.

### Cenário 3: diálogo e autonomia

1. Convidar pessoas com diferentes níveis de conhecimento técnico.
2. Pedir que interpretem um gráfico, mudem o período e apliquem um filtro básico sem demonstração prévia.
3. Registrar tempo aproximado, dúvidas e dificuldades sem identificar publicamente as pessoas.

**Resultado esperado:** uma pessoa não especialista consegue explicar o gráfico e usar os filtros básicos. Dificuldades relevantes devem virar ajustes ou impedir a aceitação definitiva da ferramenta.

## Evidências

| Evidência                     | Estado                                                                                                                        |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Ambiente reproduzível         | Aprovado em projeto Docker isolado e volume novo                                                                              |
| Dataset simulado              | Aprovado: 30 usuários, sendo 29 membros não-bot, 4 canais, 180 mensagens, 90 reações, 6 eventos de voz e 60 movimentos em voz |
| Views somente leitura         | Aprovado: seis views visíveis; tentativa de `UPDATE` negada                                                                   |
| Painel com filtros            | Aprovado: 11 cartões, filtro de período e filtro de canal provisionados                                                       |
| Medições de recursos          | Concluído no ambiente local; valores registrados acima                                                                        |
| Teste prático de RBAC OSS     | Aprovado nos limites da edição: editora altera a coleção; leitora consulta e recebe `403` ao editar                           |
| Sessão de diálogo e autonomia | Pendente de realização pelo grupo                                                                                             |

## Riscos e próximos passos

- O RBAC de dados da edição open source do Metabase é menos granular que o do Superset. A PoC comprovou a fronteira de banco e views somente leitura, mas o grupo ainda precisa decidir se ela é suficiente para o uso pretendido.
- A documentação arquitetural existente possui trechos divergentes da estrutura atual do código. A correção completa ficará em uma tarefa separada para não ampliar este Spike.
- Dados históricos podem ter cobertura desigual. O painel precisa mostrar essa limitação junto das métricas.
- A aplicação foi normalizada na porta `3000` do `.env.example` e a porta `3001` foi reservada para o Metabase. Arquivos `.env` locais antigos podem precisar do mesmo ajuste caso os profiles `dev` e `analytics` sejam executados juntos.

Próxima sequência:

1. realizar a sessão coletiva de diálogo e autonomia;
2. registrar tempos, dúvidas e dificuldades sem identificar as pessoas;
3. decidir coletivamente se o consumo aproximado de 1,4 GiB é aceitável;
4. aceitar o ADR somente se os três cenários forem aprovados.

## Fontes oficiais

### Metabase

- [Licença do Metabase](https://github.com/metabase/metabase/blob/master/LICENSE.txt)
- [Execução do Metabase Open Source com Docker](https://www.metabase.com/docs/latest/installation-and-operation/running-metabase-on-docker)
- [Conexão com MySQL/MariaDB](https://www.metabase.com/docs/latest/databases/connections/mysql)
- [Permissões de coleções](https://www.metabase.com/docs/latest/permissions/collections)
- [Permissões de dados e limites da edição OSS](https://www.metabase.com/docs/latest/permissions/data)
- [Permissões de aplicação](https://www.metabase.com/docs/latest/permissions/application)

### Apache Superset

- [Licença Apache-2.0](https://github.com/apache/superset/blob/master/LICENSE.txt)
- [Instalação com Docker Compose](https://superset.apache.org/admin-docs/installation/docker-compose/)
- [Segurança, papéis e permissões](https://superset.apache.org/admin-docs/security/)
- [Conexão com MySQL](https://superset.apache.org/docs/databases/supported/mysql/)

### Grafana

- [Licença AGPLv3](https://github.com/grafana/grafana/blob/main/LICENSE)
- [Instalação com Docker](https://grafana.com/docs/grafana/latest/setup-grafana/installation/docker/)
- [Datasource MySQL/MariaDB](https://grafana.com/docs/grafana/latest/datasources/mysql/configure/)
- [Papéis e permissões](https://grafana.com/docs/grafana/latest/administration/roles-and-permissions/)

## Documentos relacionados

- [Decisões aceitas durante o grilling](./grilling.md)
- [ADR proposto: Metabase para análise dos dados](../adr/0001-metabase-para-analise-de-dados.md)
- [Documentação de Produto](../0%20-%20Documentação%20de%20Produto.md)
- [Entidades Principais](../6%20-%20Entidades%20Principais.md)
- [Sincronização Histórica](../8%20-%20Sincronização%20Histórica.md)
