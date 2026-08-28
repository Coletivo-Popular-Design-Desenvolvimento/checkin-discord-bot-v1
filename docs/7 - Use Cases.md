# Use Cases - Checkin Bot

## Visão Geral

Os Use Cases traduzem as regras do Checkin Bot em operações pequenas e testáveis. Suas implementações vivem em `src/domain/useCases`, separadas por assunto, e dependem das interfaces de repository, fetcher e logger — nunca de `PrismaClient` diretamente.

## Estrutura

## User Use Cases

| Caso          | Comportamento atual                                                                            |
| ------------- | ---------------------------------------------------------------------------------------------- |
| `CreateUser`  | rejeita bots; evita duplicidade; cria um usuário ou vários e retorna contagens                 |
| `FindUser`    | busca por ID interno ou de plataforma e lista usuários                                         |
| `UpdateUser`  | atualiza por ID interno/plataforma e pode inverter ativo/inativo                               |
| `DeleteUser`  | exclui por ID interno ou de plataforma; existe, mas não é ligado ao fluxo de saída do servidor |
| `ImportUsers` | busca membros atuais pelo fetcher e grava lotes históricos                                     |

No fluxo em tempo real, a saída usa `UpdateUser.executeInvertUserStatus`; não ocorre exclusão física.

## 📺 Channel Use Cases

| Caso             | Comportamento atual                                          |
| ---------------- | ------------------------------------------------------------ |
| `CreateChannel`  | cria quando ainda não existe por `platformId`                |
| `UpdateChannel`  | encontra pelo ID de plataforma e atualiza o registro interno |
| `DeleteChannel`  | encontra pelo ID de plataforma e exclui o registro           |
| `ImportChannels` | busca todos os canais de texto atuais e grava em lote        |

## 💬 Message Use Cases

`RegisterMessage` assegura que usuário e canal existam, cria os registros ausentes com os dados recebidos e persiste apenas metadados da mensagem. O command descarta bots e mensagens fora de guild antes da chamada.

`ImportMessages` controla a paginação histórica por cursor, grava cada lote e acumula contagens de registros buscados, criados, ignorados e falhos.

## 👍 MessageReaction Use Cases

`RegisterMessageReaction` assegura usuário, canal e mensagem, normaliza o emoji e evita duplicidade pela combinação usuário/mensagem/emoji.

`RemoveMessageReaction` localiza essa combinação e remove o registro correspondente.

`ImportMessageReactions` percorre lotes do fetcher e grava reações históricas. O timestamp é aproximado quando a API não fornece a data real.

## 🎭 Role Use Cases

`UpdateUserRole.syncUserRoles`:

1. assegura que o usuário existe;
2. carrega os cargos persistidos;
3. cria cargos ausentes;
4. adiciona relações novas;
5. remove relações que não estão mais no Discord.

Esse comportamento vale para eventos em tempo real. `ImportUserRoles`, usado no backfill, é aditivo: importa o estado atual disponível sem reconstruir datas ou remover associações antigas.

## 🎵 AudioEvent e UserEvent Use Cases

`RegisterVoiceEvent` valida o status, assegura canal e criador, cria o status se necessário via repositório e persiste o evento.

`FinalizeVoiceEvent` encontra o evento por `platformId` e atualiza fim, contagem e status para `completed`.

`CreateUserEvent` registra `JOINED` ou `LEFT`. Se não houver evento ativo no canal, pode criar automaticamente uma sessão `AudioEvent` com ID `auto-{channel}-{timestamp}`. O caso também cria o usuário quando recebe dados Discord suficientes e ignora bots.

`ImportAudioEvents` importa os eventos agendados que a API ainda retorna no intervalo solicitado.

## Historical Sync Use Cases

`SyncHistoryRange` executa em sequência:

1. `ImportUsers`;
2. `ImportUserRoles`;
3. `ImportChannels`;
4. `ImportMessages`;
5. `ImportMessageReactions`;
6. `ImportAudioEvents`.

Cada etapa é isolada para que uma falha não impeça as seguintes. O resultado final agrega contagens e mensagens de erro. A ordem protege dependências de chave estrangeira, especialmente usuários antes de cargos e mensagens antes de reações.

## Status da Implementação

### Casos existentes versus ligados ao runtime

| Situação                                  | Casos                                                                                     |
| ----------------------------------------- | ----------------------------------------------------------------------------------------- |
| Ligados ao worker                         | criação/atualização de usuário, canais, mensagem, reação, cargo, evento de voz e presença |
| Ligados ao CLI histórico                  | seis importadores e `SyncHistoryRange`                                                    |
| Implementados sem entrada atual principal | `FindUser`, `DeleteUser` e algumas operações CRUD dos repositórios                        |

Ter uma classe implementada não significa que exista endpoint ou comando público para acioná-la.

## Relacionamento com Outras Camadas

- [Domain Layer](./2%20-%20Domain%20Layer.md)
- [Application Layer](./3%20-%20Application%20Layer.md)
- [Sincronização Histórica](./8%20-%20Sincroniza%C3%A7%C3%A3o%20Hist%C3%B3rica.md)
