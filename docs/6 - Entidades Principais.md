# Entidades e modelo de dados

## Fonte canônica

As classes em `src/domain/entities` representam os objetos manipulados pela aplicação. O formato persistido, suas chaves e relações são definidos por `src/infrastructure/persistence/prisma/models/schema.prisma`; em caso de divergência sobre o banco, o schema Prisma é a fonte canônica.

## Visão relacional

```text
User ───< Message >─── Channel
  │          │             │
  │          └──< MessageReaction >── User
  │
  ├──< UserEvent >── AudioEvent >── Channel
  ├──< UserRole >──── Role
  └──< UserChannel >─ Channel

AudioEvent >── EventStatus
AudioEvent >── User (creator)
```

## Tabelas

### `User`

Representa um membro conhecido do Discord.

| Campo relevante           | Significado                                                   |
| ------------------------- | ------------------------------------------------------------- |
| `platform_id`             | identificador único no Discord                                |
| `username`, `global_name` | nomes públicos disponíveis                                    |
| `bot`                     | identifica conta automatizada                                 |
| `status`                  | `1` ativo, `2` inativo                                        |
| `joined_at`               | entrada conhecida no servidor                                 |
| `platform_created_at`     | criação da conta no Discord                                   |
| `last_active`             | última atividade atualizada pelos fluxos que a informam       |
| `create_at`, `update_at`  | criação e atualização do registro local                       |
| `email`                   | campo opcional herdado; não coletado pelo fluxo Discord atual |

O cadastro não é apagado quando a pessoa sai; o status é invertido para inativo.

### `Role` e `UserRole`

`Role` guarda identificador, nome e data original do cargo. `UserRole` mantém a associação atual entre usuário e cargo com chave composta. Não há campos temporais na associação, portanto ela não representa histórico de mudanças.

### `Channel` e `UserChannel`

`Channel` guarda identificador, nome, URL e criação local. A classe de domínio também recebe uma data de criação na construção, mas o schema não mantém uma coluna `platform_created_at` para canal.

`UserChannel` é uma relação de chave composta. Ela não possui datas e não deve ser interpretada automaticamente como histórico de participação.

### `Message`

Guarda autor, canal, identificador Discord, `platform_created_at`, criação local e `is_deleted`. Não há coluna para texto, anexos ou mídia.

Para atividade histórica, use `platform_created_at`; `created_at` pode ser apenas a data em que um backfill inseriu o registro.

### `MessageReaction`

Relaciona usuário, mensagem e canal, com emoji opcional e `reacted_at`. A constraint única é `(user_id, message_id, reaction_emoji)`.

No fluxo em tempo real, `reacted_at` usa o momento observado. No backfill, a API não fornece a data real da reação e o fetcher usa a data da mensagem como aproximação.

### `AudioEvent` e `EventStatus`

`AudioEvent` representa evento agendado ou sessão de voz conhecida, com:

- identificador Discord ou identificador `auto-*` para sessão criada a partir de presença;
- canal e criador;
- nome e descrição opcional;
- status (`scheduled`, `active`, `completed` ou `canceled`);
- início, fim opcional e contagem de usuários;
- imagem opcional e criação local.

`EventStatus` normaliza o status em tabela própria e é criado sob demanda pelos repositórios.

### `UserEvent`

Registra uma entrada (`JOINED`) ou saída (`LEFT`) observada em uma sessão de voz, relacionando usuário, evento e data. Não possui constraint de idempotência e não é importado pelo backfill.

### `LogEventEntity`

Existe como entidade do domínio, porém não existe tabela correspondente no schema atual e `Logger.logToDatabase` não está implementado. Logs persistidos não fazem parte do sistema executável.

## Datas analíticas

| Pergunta                         | Campo recomendado             | Limite                                                                |
| -------------------------------- | ----------------------------- | --------------------------------------------------------------------- |
| Quando a mensagem ocorreu?       | `Message.platform_created_at` | data original disponível                                              |
| Quando a reação ocorreu?         | `MessageReaction.reacted_at`  | aproximada no backfill                                                |
| Quando o evento começou?         | `AudioEvent.start_at`         | eventos antigos podem não estar disponíveis                           |
| Quando a presença foi observada? | `UserEvent.created_at`        | somente enquanto o gateway estava ativo                               |
| Quando o membro entrou?          | `User.joined_at`              | estado obtido do Discord; não é trilha completa de entradas repetidas |

## Cuidados para análise

- filtrar contas com `bot = false`;
- não expor `email`, nomes ou IDs em painéis agregados;
- não tratar `UserRole` e `UserChannel` como séries históricas;
- mostrar cobertura do bot e do backfill junto às métricas;
- documentar a aproximação de datas de reação;
- aplicar limiar mínimo para grupos pequenos.

## Leituras relacionadas

- [Documentação de Produto](./0%20-%20Documenta%C3%A7%C3%A3o%20de%20Produto.md)
- [Infrastructure Layer](./4%20-%20Infrastructure%20Layer.md)
- [Use Cases](./7%20-%20Use%20Cases.md)
