# 🚀 Plano de implantação do Metabase

**Estado:** planejado — ainda não implantado em homologação ou produção.

Este documento explica como transformar a prova de conceito local do Metabase em um serviço privado para apoiar conversas sobre a saúde da comunidade. A proposta preserva o papel do Checkin Bot: coletar sinais mínimos de participação e oferecer uma leitura agregada, sem criar uma ferramenta de vigilância ou avaliação individual.

## Por que existe um plano separado

A PoC já demonstrou que o Metabase consegue abrir um painel, aplicar filtros e consultar views somente leitura. Porém, ela foi construída para experimentação local. O profile `analytics` atual cria o banco `checkindb_analytics_poc`, carrega dados simulados e usa credenciais padrão de demonstração.

Colocar a PoC no ar sem adaptação publicaria uma demonstração, não uma solução conectada com segurança aos dados reais. A implantação precisa separar três responsabilidades:

- o **banco operacional**, onde o Checkin Bot grava os metadados coletados;
- o **banco da aplicação Metabase**, onde ficam contas, perguntas, coleções e dashboards;
- a **camada analítica**, formada por views agregadas e uma conta de banco somente leitura.

O comando local `docker compose --profile analytics up -d` continua sendo útil para testar a PoC. Ele não deve ser usado sem mudanças no servidor compartilhado.

## O que significa “colocar no ar”

Na primeira entrega, o Metabase será uma aplicação separada do worker do Discord. Pessoas autorizadas acessarão uma URL privada, entrarão com suas próprias contas e verão o painel “Saúde da Comunidade”.

Não está planejado nesta etapa:

- criar uma interface web dentro do Checkin Bot;
- publicar o painel anonimamente;
- expor tabelas com nomes, e-mails ou IDs de pessoas;
- permitir alterações no banco operacional;
- executar análises em tempo real;
- usar o painel para pontuar, comparar ou ranquear integrantes.

## Arquitetura proposta

```text
Discord Gateway
    ↓
Checkin Bot
    ↓ escrita
MariaDB operacional
    ↓ leitura agregada
Views analytics_*
    ↓ SELECT com analytics_reader
Metabase
    ├── banco próprio da aplicação
    └── painel “Saúde da Comunidade”
            ↓
    HTTPS + login de pessoas autorizadas
```

As views são a principal fronteira de segurança. O Metabase não precisa conhecer as tabelas que contêm identificadores pessoais: ele recebe apenas resultados agregados que já foram preparados para análise comunitária.

## Caminho recomendado

A implantação deve acontecer em duas etapas. Primeiro sobe uma homologação privada para validar dados, acesso e consumo de recursos. Produção só acontece depois dessa validação e da conversa coletiva já prevista no Spike.

| Etapa                | Para que serve                                                         | Recomendação inicial                                                 |
| -------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Homologação privada  | Confirmar segurança, funcionamento, legibilidade e impacto no servidor | Mesmo droplet, com serviço e configuração isolados                   |
| Produção comunitária | Oferecer o painel de forma contínua para o grupo autorizado            | Servidor ou capacidade separados se houver disputa por recursos      |
| Evolução futura      | Reduzir carga no banco operacional e permitir agregações mais custosas | Réplica somente leitura ou banco analítico atualizado periodicamente |

Usar o mesmo droplet na homologação reduz o custo e acelera o aprendizado. Essa escolha não deve ser tratada como definitiva. A PoC consumiu aproximadamente `1,4 GiB` após carregar o painel; o teste no servidor precisa mostrar se esse consumo convive bem com o bot e o MariaDB.

## 1. Preparar a leitura dos dados reais

O arquivo `analytics/database/schema-and-seed.sql` pertence à PoC. Ele recria um schema compatível e insere dados simulados. A implantação precisa de um segundo arquivo, planejado como `analytics/database/production-views.sql`, com regras diferentes:

- usar `CREATE OR REPLACE VIEW` sobre o schema operacional;
- não executar `DROP TABLE`;
- não inserir dados de demonstração;
- não copiar nomes, e-mails ou IDs pessoais para a saída;
- preferir `platform_created_at` para mensagens e outras atividades do Discord;
- explicar cobertura incompleta de reações históricas e eventos de voz;
- não tratar `UserRole` ou `UserChannel` como histórico temporal.

As primeiras views podem manter o vocabulário validado pela PoC:

| View                         | Pergunta respondida em linguagem simples                        |
| ---------------------------- | --------------------------------------------------------------- |
| `analytics_overview`         | Qual é o volume geral disponível para análise?                  |
| `analytics_activity_daily`   | Como a participação agregada mudou ao longo do tempo?           |
| `analytics_channel_activity` | Em quais canais houve atividade, sem comparar pessoas?          |
| `analytics_audio_activity`   | Quantos eventos e movimentos de voz foram registrados?          |
| `analytics_retention_cohort` | Grupos de entrada voltaram a participar nos períodos seguintes? |
| `analytics_data_quality`     | Qual período cada fonte cobre e quais limitações ela possui?    |

Antes de conectar o Metabase, as saídas precisam ser revisadas como se fossem um dataset público interno: se uma coluna permitir identificar uma pessoa, ela não entra na view.

## 2. Criar uma conta de banco somente leitura

O Metabase deve usar uma conta dedicada, como `analytics_reader`. Essa conta terá `SELECT` apenas nas views aprovadas. Ela não receberá acesso às tabelas de origem nem permissões de `INSERT`, `UPDATE`, `DELETE`, `CREATE`, `ALTER` ou `DROP`.

A implantação deve provar essa fronteira com duas verificações:

1. uma consulta agregada retorna dados;
2. uma tentativa de escrita é negada pelo MariaDB.

As permissões do Metabase ajudam a organizar quem pode editar ou visualizar dashboards, mas não substituem a proteção no banco. Mesmo uma conta administradora do Metabase deve continuar limitada pelas permissões de `analytics_reader` ao consultar os dados do Checkin Bot.

## 3. Separar o banco da aplicação Metabase

O Metabase precisa guardar sua própria configuração: contas, grupos, perguntas, filtros e dashboards. Esse banco é diferente do banco analisado.

Para produção, a recomendação é usar PostgreSQL como banco da aplicação Metabase. MariaDB também é compatível e pode servir ao piloto, desde que use um database e uma conta exclusivos. Em qualquer opção:

- não usar o banco H2 embutido;
- manter backup periódico;
- não reutilizar a conta `analytics_reader`;
- não guardar senha no repositório;
- testar restauração antes de considerar o serviço contínuo.

Perder esse banco não apaga os dados coletados pelo bot, mas apaga o trabalho feito dentro do Metabase, como dashboards e configurações de acesso.

## 4. Isolar a infraestrutura de analytics

A implantação será descrita em um Compose próprio, planejado como `compose.analytics.prod.yml`. Ele poderá compartilhar uma rede privada com o MariaDB ou acessar um endereço privado do banco, mas não fará parte obrigatória da inicialização do worker.

O novo Compose deve incluir:

- imagem do Metabase com versão fixada;
- conexão com o banco próprio da aplicação;
- healthcheck em `/api/health`;
- limites de memória e política de reinício adequados ao servidor;
- variáveis obrigatórias sem senhas padrão;
- rede privada para acessar a fonte analítica;
- porta interna acessível somente pelo proxy HTTPS.

O serviço `analytics-init` da PoC não será reutilizado em produção porque ele cria o dataset simulado. A criação das views e dos usuários reais deve ser uma operação explícita, revisada e executada antes da conexão do Metabase.

## 5. Publicar com HTTPS e acesso privado

O Metabase não deve responder diretamente pela porta `3001` na internet. Um proxy reverso, escolhido de acordo com o ambiente do servidor, recebe as conexões HTTPS e encaminha apenas o tráfego autorizado ao container.

O desenho esperado é:

```text
Pessoa autorizada
    ↓ https://subdomínio-a-definir
Proxy reverso com TLS
    ↓ rede privada
Metabase:3000
```

O subdomínio ainda precisa ser decidido. Homologação e produção devem usar endereços diferentes para evitar que uma validação seja confundida com o serviço oficial.

Não haverá compartilhamento público de perguntas ou dashboards. Cada pessoa receberá uma conta própria e o acesso será removido quando deixar de ser necessário.

## 6. Fazer um deploy independente do bot

O workflow atual `.github/workflows/deploy-prod.yml` acompanha a imagem do worker e executa o profile `prod`. Ele não sobe o profile `analytics`, e essa separação é saudável.

A proposta é criar um workflow próprio para analytics, inicialmente manual com `workflow_dispatch`. Ele deverá:

1. confirmar que as validações da branch foram aprovadas;
2. conectar ao servidor autorizado;
3. atualizar somente os arquivos da stack analítica;
4. baixar a imagem fixada do Metabase;
5. subir `compose.analytics.prod.yml`;
6. aguardar o healthcheck;
7. executar um smoke test sem dados pessoais;
8. encerrar com falha se a saúde ou as permissões estiverem incorretas.

Depois que homologação estiver estável, o grupo poderá decidir se produção continuará manual ou terá uma automação própria. Uma publicação do bot não deve reiniciar o Metabase sem necessidade, e uma manutenção do Metabase não deve interromper a coleta do Discord.

## 7. Configurar o painel sem credenciais de demonstração

O script `analytics/metabase/bootstrap.mjs` comprovou que a fonte, as coleções e o dashboard podem ser criados de forma repetível. Para um ambiente compartilhado, ele precisa deixar de depender das contas locais `@checkin.local` e das senhas de demonstração.

A implantação pode manter a automação dos objetos de conteúdo, mas deve tratar pessoas e senhas separadamente:

- administração cria ou convida contas reais por um canal seguro;
- os segredos ficam somente no ambiente do servidor ou no cofre adotado pelo projeto;
- o bootstrap não imprime senhas nos logs;
- uma reexecução não amplia permissões por acidente;
- contas de leitura não recebem permissão de curadoria.

Os três perfis continuam úteis:

| Perfil           | Pode fazer                                                  |
| ---------------- | ----------------------------------------------------------- |
| Administração    | Configurar a instância e administrar acessos                |
| Edição/curadoria | Criar e organizar perguntas e painéis na coleção autorizada |
| Somente leitura  | Abrir dashboards e usar os filtros disponíveis              |

## 8. Validar homologação antes de produção

Homologação não termina quando a página abre. A validação precisa percorrer o caminho completo:

```text
browser → HTTPS → Metabase → analytics_reader → views → MariaDB
```

### 🧪 Validações obrigatórias

- `/api/health` responde com o serviço saudável;
- a URL pública usa HTTPS e a porta interna não fica exposta;
- cada perfil acessa apenas o que foi previsto;
- uma pessoa leitora não consegue editar a coleção;
- `analytics_reader` consulta as views e não consegue escrever;
- nenhuma pergunta, download ou metadado expõe nome, e-mail ou ID pessoal;
- filtros de período e canal funcionam com dados reais autorizados;
- cobertura e limitações aparecem junto das métricas;
- o uso de CPU e memória não prejudica o worker nem o MariaDB;
- backup e restauração do banco da aplicação Metabase são exercitados;
- a sessão coletiva de leitura e autonomia prevista no Spike é realizada.

Dados reais só devem entrar nessa homologação depois da revisão das views e da autorização organizacional de acesso. A implantação técnica não substitui decisões sobre base legal, retenção, descarte ou atendimento a titulares.

## 9. Publicar produção de forma gradual

Depois da homologação, a primeira abertura de produção deve ser pequena:

1. criar a instância e restaurar somente configurações aprovadas;
2. conectar a conta somente leitura às views revisadas;
3. convidar um grupo inicial de pessoas autorizadas;
4. acompanhar erros, consultas lentas e consumo de recursos;
5. ampliar o acesso apenas depois de confirmar que o painel apoia a conversa coletiva sem estimular leitura individualizante.

Se as consultas começarem a disputar recursos com a coleta, o próximo passo não é aumentar o acesso ao banco operacional. A evolução recomendada é criar uma réplica somente leitura ou materializar agregados em um banco analítico atualizado periodicamente.

## Plano de retorno

Como o Metabase usa uma conta somente leitura, interromper analytics não precisa interromper o Checkin Bot.

Em caso de problema:

1. retirar a rota pública no proxy ou restringir o acesso;
2. parar somente a stack `compose.analytics.prod.yml`;
3. preservar logs e o banco da aplicação para diagnóstico;
4. restaurar o último backup se a configuração do Metabase tiver sido corrompida;
5. manter o worker e o banco operacional funcionando;
6. reabrir o acesso somente após repetir as validações de homologação.

## Entregas necessárias para implementar este plano

| Entrega                                           | Estado atual |
| ------------------------------------------------- | ------------ |
| Views agregadas sobre o schema real               | Planejada    |
| Usuário de produção somente leitura               | Planejado    |
| `compose.analytics.prod.yml`                      | Planejado    |
| Banco persistente da aplicação Metabase           | Planejado    |
| Proxy HTTPS e subdomínios de homologação/produção | Planejado    |
| Workflow independente de deploy                   | Planejado    |
| Bootstrap sem credenciais locais                  | Planejado    |
| Backup, restauração e observabilidade             | Planejado    |
| Validação coletiva e decisão final do ADR         | Pendente     |

## Critérios para considerar a implantação concluída

A implantação estará pronta quando houver evidência de que:

- homologação e produção são ambientes identificáveis e separados;
- o painel usa apenas views agregadas e uma conta sem escrita;
- o acesso é privado, autenticado e protegido por HTTPS;
- credenciais não aparecem em código, documentação, commits ou logs;
- o banco da aplicação possui backup e restauração testados;
- o Metabase pode ser parado sem interromper o Checkin Bot;
- o consumo de recursos foi aceito para a infraestrutura escolhida;
- as limitações de cobertura aparecem junto dos números;
- a validação coletiva aprovou o uso da ferramenta;
- o ADR deixou de ser apenas proposto e registrou a decisão do grupo.

## Próximos passos

1. revisar este plano com desenvolvimento, dados e pessoas responsáveis pelo servidor;
2. realizar a sessão coletiva ainda pendente na PoC;
3. escolher subdomínios e responsáveis pelos acessos;
4. implementar primeiro as views reais e provar a conta somente leitura;
5. preparar o Compose e o workflow de homologação;
6. validar o fluxo completo antes de decidir pela produção.

## 📚 Documentos relacionados

- [Spike 0001 — Ferramenta de análise de dados](./spike/0001-ferramenta-analise-dados.md)
- [ADR 0001 — Metabase para análise dos dados](./adr/0001-metabase-para-analise-de-dados.md)
- [Sincronização Histórica](./8%20-%20Sincronização%20Histórica.md)
- [Documentação de Produto](./0%20-%20Documentação%20de%20Produto.md)
- [Documentação técnica](./1%20-%20Documentação%20técnica.md)

## Referências oficiais

- [Executar o Metabase com Docker](https://www.metabase.com/docs/latest/installation-and-operation/running-metabase-on-docker)
- [Configurar o banco da aplicação Metabase](https://www.metabase.com/docs/latest/installation-and-operation/configuring-application-database)
- [Usuários, papéis e privilégios no banco analisado](https://www.metabase.com/docs/latest/databases/users-roles-privileges)
- [Configurações gerais, URL do site e HTTPS](https://www.metabase.com/docs/latest/configuring-metabase/settings)
