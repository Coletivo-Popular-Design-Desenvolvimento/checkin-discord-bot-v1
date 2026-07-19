# Use Cases - Checkin Bot

**Status**: ✅ Atualizada - Novembro 2025
**Versão**: 1.0 (Pré-Alpha)

---

## Visão Geral

Os Use Cases (`src/domain/useCases/`) implementam as **regras de negócio** da aplicação. Eles representam as ações que o sistema pode executar, seguindo os princípios de Clean Architecture onde a lógica de negócio é independente de frameworks e tecnologias externas.

## Estrutura

```
src/domain/useCases/
└── user/
    ├── CreateUser.ts     # Criação de usuários
    ├── UpdateUser.ts     # Atualização de usuários
    ├── FindUser.ts       # Busca de usuários
    └── DeleteUser.ts     # Exclusão de usuários
```

## User Use Cases

### 👤 CreateUser Use Case

**Arquivo**: `src/domain/useCases/user/CreateUser.ts`
**Interface**: `ICreateUser`

#### Responsabilidades

- Validar entrada de dados
- Verificar se usuário já existe
- Aplicar regras de negócio para criação
- Reativar usuários inativos quando necessário
- Criar novos usuários quando apropriado

#### Regras de Negócio Implementadas

##### 1. Filtro de Bots

```typescript
if (input.bot) {
  return {
    data: null,
    success: false,
    message: ErrorMessages.NO_BOT,
  };
}
```

**Regra**: Bots não são persistidos no sistema de engajamento.

##### 2. Verificação de Usuário Existente

```typescript
const existingUser = await this.userRepository.findByPlatformId(
  input.platformId,
  true, // includeInactive
);
```

**Regra**: Sempre verificar duplicatas antes de criar.

##### 3. Reativação Automática

```typescript
if (existingUser && existingUser.status === UserStatus.INACTIVE) {
  const reactivatedUser = await this.userRepository.updateById(
    existingUser.id,
    { status: UserStatus.ACTIVE },
  );
  return {
    data: reactivatedUser,
    success: true,
    message: CommonMessages.REACTIVATE_USER,
  };
}
```

**Regra**: Usuários inativos são automaticamente reativados ao retornar.

##### 4. Prevenção de Duplicatas

```typescript
if (existingUser) {
  return {
    data: existingUser,
    success: false,
    message: ErrorMessages.USER_ALREADY_EXISTS,
  };
}
```

**Regra**: Não permite usuários ativos duplicados.

#### Métodos

##### `execute(input: CreateUserInput): Promise<GenericOutputDto<UserEntity>>`

Cria um único usuário com todas as validações.

**Input**: `CreateUserInput`

```typescript
interface CreateUserInput {
  platformId: string;
  username: string;
  globalName?: string | null;
  bot: boolean;
  status: UserStatus;
  platformCreatedAt?: Date;
  joinedAt?: Date;
  lastActive?: Date;
}
```

**Output**: `GenericOutputDto<UserEntity>`

- `data`: UserEntity criado ou reativado
- `success`: boolean indicando sucesso
- `message`: Mensagem descritiva (opcional)

##### `executeMany(users: CreateUserInput[]): Promise<GenericOutputDto<CreateManyUserOutputDto>>`

Criação em lote para sincronização inicial.

**Características**:

- Filtra bots automaticamente
- Usa `createMany` do Prisma com `skipDuplicates: true`
- Retorna contador de sucessos/falhas

### 🔄 UpdateUser Use Case

**Arquivo**: `src/domain/useCases/user/UpdateUser.ts`
**Interface**: `IUpdateUser`

#### Responsabilidades

- Atualizar dados de usuários existentes
- Alterar status (ativo/inativo)
- Manter histórico de atualizações

#### Métodos Principais

##### `executeInvertUserStatus(platformId: string): Promise<GenericOutputDto<UserEntity>>`

Inverte o status do usuário (ativo ↔ inativo).

**Uso típico**: Quando usuário sai do servidor Discord.

**Implementação**:

1. Busca usuário por platformId
2. Verifica se existe
3. Inverte status atual
4. Atualiza no repositório

### 🔍 FindUser Use Case

**Arquivo**: `src/domain/useCases/user/FindUser.ts`
**Interface**: `IFindUser`

#### Responsabilidades

- Buscar usuários por diferentes critérios
- Aplicar filtros de status
- Retornar dados formatados

#### Métodos Planejados

- `findById(id: number): Promise<UserEntity | null>`
- `findByPlatformId(platformId: string): Promise<UserEntity | null>`
- `findActiveUsers(): Promise<UserEntity[]>`
- `findByUsername(username: string): Promise<UserEntity[]>`

### 🗑️ DeleteUser Use Case

**Arquivo**: `src/domain/useCases/user/DeleteUser.ts`
**Interface**: `IDeleteUser`

#### Responsabilidades

- Exclusão lógica de usuários (soft delete)
- Manter dados para auditoria
- Aplicar regras de retenção

#### Implementação

- **Soft Delete**: Marca como inativo em vez de deletar
- **Data Retention**: Preserva dados históricos
- **Cascade Rules**: Define comportamento para dados relacionados

## Padrões Aplicados

### Result Pattern

Todos os Use Cases retornam `GenericOutputDto<T>`:

```typescript
interface GenericOutputDto<T> {
  data: T | null;
  success: boolean;
  message?: string;
}
```

**Vantagens**:

- **Explicit Error Handling**: Erros são parte do contrato
- **No Exceptions**: Evita propagação de exceções
- **Consistent API**: Interface uniforme para todos os Use Cases

### Single Responsibility

Cada Use Case tem uma responsabilidade específica:

- **CreateUser**: Apenas criação
- **UpdateUser**: Apenas atualização
- **FindUser**: Apenas consultas
- **DeleteUser**: Apenas exclusão

### Dependency Inversion

Use Cases dependem apenas de abstrações:

```typescript
export class CreateUser implements ICreateUser {
  constructor(
    private readonly userRepository: IUserRepository, // Interface
    private readonly logger: ILoggerService, // Interface
  ) {}
}
```

## Error Handling Strategy

### Try-Catch Pattern

```typescript
async execute(input: CreateUserInput): Promise<GenericOutputDto<UserEntity>> {
  try {
    // Business logic here
    return { data: newUser, success: true };
  } catch (error) {
    this.logger.logToConsole(
      LoggerContextStatus.ERROR,
      LoggerContext.USECASE,
      LoggerContextEntity.USER,
      `createUser.execute | ${error.message}`,
    );
    return {
      data: null,
      success: false,
      message: error instanceof Error ? error.message : ErrorMessages.UNKNOWN_ERROR,
    };
  }
}
```

### Structured Logging

- **Context**: USECASE
- **Entity**: USER, MESSAGE, CHANNEL, etc.
- **Action**: Nome do método + erro
- **Detailed Message**: Stack trace quando necessário

## Historical Sync Use Cases

**Localização**: `src/domain/useCases/{message,audioEvent,sync}/`
**Status**: ✅ **Implementado** — ver [8 - Sincronização Histórica](./8%20-%20Sincronização%20Histórica.md)

Diferente dos use cases acima (que reagem a eventos do gateway Discord em tempo real), estes são acionados sob demanda pelo script `src/historicalSync.ts` para fazer backfill de dados que já existiam antes do bot ficar online. Seguem o mesmo padrão `GenericOutputDto` + try/catch + `ILoggerService`, mas cada um acumula contagens de lote (`fetched`/`created`/`skipped`/`failed`) em vez de retornar uma única entidade.

- **`ImportMessages`**: pagina o `IDiscordHistoryFetcher` lote a lote, monta canais/usuários únicos e grava via `IHistoricalImportRepository.saveMessagesBatch`.
- **`ImportAudioEvents`**: busca os eventos de voz disponíveis no intervalo (uma única chamada, sem paginação — limitação da API do Discord) e grava em chunks de `batchSize`.
- **`SyncHistoryRange`**: orquestra os dois acima sequencialmente, cada um isolado em seu próprio try/catch (falha em um não interrompe o outro), com defaults de "últimos 3 meses" e `batchSize=1000` quando não informados.

**Escopo**: só mensagens e eventos de voz — reações, cargos e entrada/saída de usuários não fazem parte do backfill.

#### Analytics Use Cases

- **GenerateEngagementReport**: Relatórios de atividade
- **CalculateUserMetrics**: Métricas individuais
- **GetChannelStats**: Estatísticas por canal

### Migration from Legacy Code

#### Current Legacy (`oldApp/`)

- Sistema de relatórios em `bot/report.ts`
- Tracking de mensagens em `bot/message.ts`
- Eventos de áudio em `bot/events.ts`

#### Migration Strategy

1. **Extract Business Logic**: Identificar regras em código legado
2. **Create Use Cases**: Implementar em nova arquitetura
3. **Write Tests**: Garantir compatibilidade
4. **Switch Implementation**: Usar novos Use Cases
5. **Remove Legacy**: Limpar código antigo

## Testing Strategy

### Unit Tests

```typescript
describe("CreateUser Use Case", () => {
  let createUser: CreateUser;
  let mockRepository: jest.Mocked<IUserRepository>;
  let mockLogger: jest.Mocked<ILoggerService>;

  beforeEach(() => {
    mockRepository = createMockUserRepository();
    mockLogger = createMockLogger();
    createUser = new CreateUser(mockRepository, mockLogger);
  });

  it("should create new user successfully", async () => {
    // Arrange
    const input: CreateUserInput = {
      /* test data */
    };
    mockRepository.findByPlatformId.mockResolvedValue(null);
    mockRepository.create.mockResolvedValue(expectedUser);

    // Act
    const result = await createUser.execute(input);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data).toEqual(expectedUser);
  });
});
```

### Integration Tests

- **Real Database**: Usando test database
- **Transaction Rollback**: Isolamento entre testes
- **Seed Data**: Dados consistentes para testes

## Performance Considerations

### Database Optimization

- **Selective Queries**: Apenas campos necessários
- **Batch Operations**: `createMany` para bulk inserts
- **Indexing**: Platform IDs indexados para busca rápida

### Caching Strategy

- **Repository Level**: Cache em repository quando apropriado
- **Use Case Level**: Cache de resultados computados
- **TTL**: Time-to-live apropriado para cada tipo de dado

---

**Links Relacionados**:

- [1 - Documentação técnica](./1%20-%20Documentação%20técnica.md)
- [2 - Domain Layer](./2%20-%20Domain%20Layer.md)
- [3 - Application Layer](./3%20-%20Application%20Layer.md)
- [6 - Entidades Principais](./6%20-%20Entidades%20Principais.md)
- [4 - Infrastructure Layer](./4%20-%20Infrastructure%20Layer.md) (Repository pattern está documentado aqui)
- [7 - Use Cases](./7%20-%20Use%20Cases.md) (Error handling está documentado aqui)
