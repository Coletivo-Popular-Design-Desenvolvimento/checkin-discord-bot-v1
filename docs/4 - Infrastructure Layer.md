# Infrastructure Layer - Checkin Bot

**Status**: ✅ Atualizada - Novembro 2025
**Versão**: 1.0 (Pré-Alpha)

---

## Visão Geral

A camada de infraestrutura (`src/infrastructure/`) implementa as interfaces definidas no domain layer e gerencia toda comunicação com sistemas externos. É responsável pela persistência de dados e integração com APIs externas.

## Estrutura

```
src/infrastructure/
├── discord/          # Integração com Discord API
│   └── DiscordService.ts
└── persistence/      # Persistência de dados
    ├── prisma/
    │   ├── prismaService.ts
    │   └── models/
    │       └── schema.prisma
    └── repositories/
        ├── UserRepository.ts
        ├── ChannelRepository.ts
        ├── MessageRepository.ts
        ├── AudioEventRepository.ts
        ├── MessageReactionRepository.ts
        └── RoleRepository.ts
```

## Discord Integration

### DiscordService

**Arquivo**: `src/infrastructure/discord/DiscordService.ts`

**Responsabilidades**:

- Abstrai a Discord.js API
- Implementa `IDiscordService<Message, GuildMember, PartialGuildMember, Client>`
- Gerencia event handlers de forma desacoplada
- Facilita testing através de interface

**Event Handlers Implementados**:

- `onDiscordStart()` - Quando bot conecta (ClientReady)
- `onMessage()` - Quando mensagem é enviada (MessageCreate)
- `onNewUser()` - Quando usuário entra (GuildMemberAdd)
- `onUserLeave()` - Quando usuário sai (GuildMemberRemove)

**Arquitetura de Events**:

```typescript
export class DiscordService {
  private onDiscordStartHandlers: (() => void)[] = [];
  private onMessageHandlers: ((message: Message) => void)[] = [];
  private onNewUserHandlers: ((member: GuildMember) => void)[] = [];
  private onUserLeaveHandlers: ((
    member: GuildMember | PartialGuildMember,
  ) => void)[] = [];

  public registerEvents() {
    this.client.once(Events.ClientReady, () => {
      this.onDiscordStartHandlers.forEach((fn) => fn());
    });

    this.client.on(Events.MessageCreate, (message) => {
      this.onMessageHandlers.forEach((fn) => fn(message));
    });
    // ... outros eventos
  }
}
```

**Padrão Observer**:

- Commands registram handlers através dos métodos `on*()`
- DiscordService chama todos os handlers registrados quando eventos ocorrem
- Permite múltiplos observers para o mesmo evento

**Event Intents Management**:

- Configurado em `contexts/discord.context.ts`
- Mapeamento entre eventos e intents necessários
- Comentários indicam quando adicionar novos intents

## Database Layer

### PrismaService

**Arquivo**: `src/infrastructure/persistence/prisma/prismaService.ts`

**Responsabilidades**:

- Gerencia conexão com o banco MySQL
- Singleton pattern para client Prisma
- Configuração de connection pooling

**Implementação**:

```typescript
export class PrismaService {
  private client: PrismaClient;

  constructor() {
    this.client = new PrismaClient();
  }

  getClient(): PrismaClient {
    return this.client;
  }
}
```

### Database Schema

**Arquivo**: `src/infrastructure/persistence/prisma/models/schema.prisma`

**Entidades Principais**:

#### User

```prisma
model User {
  id                  Int               @id @default(autoincrement())
  username            String
  global_name         String?
  joined_at           DateTime?
  update_at           DateTime?         @updatedAt
  last_active         DateTime?
  create_at           DateTime?         @default(now())
  bot                 Boolean
  email               String?
  status              Int
  platform_created_at DateTime?
  platform_id         String            @unique

  // Relacionamentos
  audio_event         AudioEvent[]
  message             Message[]
  message_reaction    MessageReaction[]
  user_channel        UserChannel[]
  user_event          userEvent[]
  user_role           UserRole[]
}
```

#### AudioEvent

```prisma
model AudioEvent {
  id          Int         @id @default(autoincrement())
  channel_id  String
  creator_id  String
  name        String
  description String?
  status_id   String
  start_at    DateTime
  end_at      DateTime
  user_count  Int
  image       String?
  created_at  DateTime    @default(now())
  platform_id String      @unique

  // Foreign Keys
  channel     Channel     @relation(fields: [channel_id], references: [platform_id])
  creator     User        @relation(fields: [creator_id], references: [platform_id])
  status      EventStatus @relation(fields: [status_id], references: [platform_id])
  user_event  userEvent[]
}
```

**Relacionamentos Implementados**:

- **User ↔ Role**: Many-to-Many através de `UserRole`
- **User ↔ Channel**: Many-to-Many através de `UserChannel`
- **User → Message**: One-to-Many
- **User → AudioEvent**: One-to-Many (creator)
- **Channel → Message**: One-to-Many
- **Message → MessageReaction**: One-to-Many

## Repository Pattern

### UserRepository

**Arquivo**: `src/infrastructure/persistence/repositories/UserRepository.ts`

**Implementa**: `IUserRepository` do domain layer

**Métodos Principais**:

#### `create(user: Omit<UserEntity, "id">): Promise<UserEntity>`

- Cria novo usuário no banco
- Converte entity para formato Prisma
- Retorna entity do domain

#### `findByPlatformId(id: string, includeInactive?: boolean): Promise<UserEntity | null>`

- Busca usuário pelo ID do Discord
- Suporte a filtro por status (ativo/inativo)
- Usado para verificar duplicatas

#### `createMany(users: Omit<UserEntity, "id">[]): Promise<number>`

- Criação em lote de usuários
- `skipDuplicates: true` para evitar erros
- Retorna quantidade criada

#### `updateById(id: number, user: Partial<UserEntity>): Promise<UserEntity | null>`

- Atualização parcial de usuário
- Usado para mudanças de status

**Data Mapping**:

```typescript
private toDomain(user: User): UserEntity {
  return new UserEntity(
    user.id,
    user.platform_id,
    user.username,
    user.bot,
    user.status,
    user.global_name,
    user.joined_at,
    user.platform_created_at,
    user.create_at,
    user.update_at,
    user.last_active,
    user.email,
  );
}

private toPersistence(user: Partial<UserEntity>) {
  return {
    platform_id: user.platformId,
    username: user.username,
    bot: user.bot,
    status: user.status,
    global_name: user.globalName,
    joined_at: user.joinedAt,
    platform_created_at: user.platformCreatedAt,
    update_at: user.updateAt,
    last_active: user.lastActive,
    email: user.email,
  };
}
```

### Outros Repositories

#### ChannelRepository

**Arquivo**: `src/infrastructure/persistence/repositories/ChannelRepository.ts`

- Gerencia canais do Discord
- Relacionamentos com mensagens e eventos

#### MessageRepository

**Arquivo**: `src/infrastructure/persistence/repositories/MessageRepository.ts`

- Persiste mensagens do Discord
- Suporte a soft delete (`is_deleted`)

#### AudioEventRepository

**Arquivo**: `src/infrastructure/persistence/repositories/AudioEventRepository.ts`

- Gerencia eventos de áudio/voz
- Tracking de participantes e métricas

#### RoleRepository

**Arquivo**: `src/infrastructure/persistence/repositories/RoleRepository.ts`

- Gerencia cargos do Discord
- Relacionamento Many-to-Many com usuários

#### MessageReactionRepository

**Arquivo**: `src/infrastructure/persistence/repositories/MessageReactionRepository.ts`

- Persiste reações em mensagens
- Métricas de engajamento

## Error Handling

### Padrão Implementado

- Try-catch em todos os métodos de repository
- Logging estruturado com contexto `REPOSITORY`
- Não propagação de exceções (return null/undefined)
- Logs detalhados para debugging

### Exemplo:

```typescript
async create(user: Omit<UserEntity, "id">): Promise<UserEntity> {
  try {
    const result = await this.client.user.create({
      data: this.toPersistence(user),
    });
    return this.toDomain(result);
  } catch (error) {
    this.logger.logToConsole(
      LoggerContextStatus.ERROR,
      LoggerContext.REPOSITORY,
      LoggerContextEntity.USER,
      `create | ${error.message}`,
    );
  }
}
```

## Database Configuration

### Connection Setup

- **Provider**: MySQL
- **ORM**: Prisma Client
- **Connection Pooling**: Configurado automaticamente
- **Environment Variables**: `DATABASE_URL`

### Migration Strategy

- **Development**: `npx prisma migrate dev`
- **Production**: `npx prisma migrate deploy`
- **Schema Generation**: `npx prisma generate`

### Testing Database

- **Separate database** para testes
- **Migration reset** antes dos testes
- **Transaction rollback** para isolamento

## Performance Considerations

### Query Optimization

- **Indexes** nos campos mais consultados (`platform_id`, `status`)
- **Selective queries** com filtros de status
- **Batch operations** para criação em lote

### Connection Management

- **Singleton pattern** para Prisma client
- **Connection pooling** automático
- **Graceful shutdown** handling

## Legacy Migration Status

### ✅ Migrado para Nova Arquitetura

- **UserRepository**: Completo com todos os CRUDs
- **DiscordService**: Event handling básico implementado
- **Database Schema**: Estrutura completa definida

### 🚧 Em Migração (da pasta `oldApp/`)

- **Message handling**: Eventos e persistência
- **AudioEvent tracking**: Monitoramento de chamadas
- **Report generation**: Sistema de relatórios
- **Cron jobs**: Tarefas agendadas
- **Email service**: Notificações
- **Telegram integration**: Bot secundário

### 📋 Planejado

- **Cache layer**: Redis para queries frequentes
- **Event sourcing**: Auditoria completa de eventos
- **Monitoring**: Métricas de performance
- **Backup strategies**: Estratégias de backup automático

## Relacionamento com Outras Camadas

- **Domain**: Implementa todas as interfaces de repository e service
- **Application**: Fornece implementações concretas via DI
- **Contexts**: É instanciada e configurada pelos contexts

---

**Links Relacionados**:

- [1 - Documentação técnica](./1%20-%20Documentação%20técnica.md)
- [2 - Domain Layer](./2%20-%20Domain%20Layer.md)
- [3 - Application Layer](./3%20-%20Application%20Layer.md)
- [4 - Infrastructure Layer](./4%20-%20Infrastructure%20Layer.md) (Database schema está documentado aqui)
- [4 - Infrastructure Layer](./4%20-%20Infrastructure%20Layer.md) (Discord integration está documentada aqui)
- [4 - Infrastructure Layer](./4%20-%20Infrastructure%20Layer.md) (Repository pattern está documentado aqui)
