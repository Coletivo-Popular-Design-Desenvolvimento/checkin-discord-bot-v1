# Domain Layer - Checkin Bot

**Status**: ✅ Atualizada - Novembro 2025
**Versão**: 1.0 (Pré-Alpha)

---

## Visão Geral

A camada de domínio (`src/domain/`) é o coração da aplicação, contendo todas as regras de negócio e definições das entidades. Esta camada é completamente independente de frameworks e tecnologias externas.

## Estrutura

```
src/domain/
├── entities/          # Entidades do domínio
├── interfaces/        # Contratos (ports)
├── useCases/         # Implementação das regras de negócio
├── types/            # Enums e tipos personalizados
└── dtos/             # Data Transfer Objects
```

## Entidades do Domínio

### User Entity

**Arquivo**: `src/domain/entities/User.ts`

Representa um usuário do Discord no sistema.

**Propriedades principais**:

- `id`: Identificador interno único
- `platformId`: ID do usuário no Discord
- `username`: Nome de usuário
- `globalName`: Nome global do Discord
- `status`: Status do usuário (ativo/inativo)
- `bot`: Se é um bot ou usuário real
- `joinedAt`: Data de entrada no servidor
- `lastActive`: Última atividade registrada

**Métodos**:

- `fromPersistence()`: Factory method para criar entidade a partir dos dados do banco

### Channel Entity

**Arquivo**: `src/domain/entities/Channel.ts`

Representa um canal do Discord.

**Propriedades principais**:

- `id`: Identificador interno
- `platformId`: ID do canal no Discord
- `name`: Nome do canal
- `url`: URL do canal
- `createdAt`: Data de criação

### Message Entity

**Arquivo**: `src/domain/entities/Message.ts`

Representa uma mensagem enviada em um canal.

**Propriedades principais**:

- `platformId`: ID da mensagem no Discord
- `platformCreatedAt`: Data de criação no Discord
- `isDeleted`: Se a mensagem foi deletada
- `channel`: Canal onde foi enviada
- `user`: Usuário que enviou
- `messageReactions`: Reações na mensagem

### AudioEvent Entity

**Arquivo**: `src/domain/entities/AudioEvent.ts`

Representa um evento de áudio/voz no Discord.

**Propriedades principais**:

- `name`: Nome do evento
- `description`: Descrição opcional
- `startAt`: Data/hora de início
- `endAt`: Data/hora de fim
- `userCount`: Número de participantes
- `statusId`: Status do evento
- `channel`: Canal onde ocorreu
- `creator`: Usuário criador

### Outras Entidades

- **Role Entity**: Cargos dos usuários
- **MessageReaction Entity**: Reações em mensagens
- **EventStatus Entity**: Status dos eventos

## Interfaces (Ports)

### Repositórios

**Localização**: `src/domain/interfaces/repositories/`

Define contratos para persistência de dados:

- **`IUserRepository`**: Operações CRUD para usuários
- **`IChannelRepository`**: Operações para canais
- **`IMessageRepository`**: Operações para mensagens
- **`IAudioEventRepository`**: Operações para eventos de áudio
- **`IRoleRepository`**: Operações para cargos

#### Exemplo - IUserRepository

```typescript
interface IUserRepository {
  create(user: Omit<UserEntity, "id">): Promise<UserEntity>;
  findById(id: number): Promise<UserEntity | null>;
  findByPlatformId(id: string): Promise<UserEntity | null>;
  updateById(id: number, user: Partial<UserEntity>): Promise<UserEntity | null>;
  // ... outros métodos
}
```

### Serviços

**Localização**: `src/domain/interfaces/services/`

- **`IDiscordService`**: Abstração para integração com Discord
- **`ILoggerService`**: Abstração para sistema de logs

### Use Cases

**Localização**: `src/domain/interfaces/useCases/`

Define contratos para cada caso de uso:

- **User Use Cases**:
  - `ICreateUser`: Criação de usuários
  - `IFindUser`: Busca de usuários
  - `IUpdateUser`: Atualização de usuários
  - `IDeleteUser`: Exclusão de usuários

### Commands

**Localização**: `src/domain/interfaces/commands/`

- **`IUserCommand`**: Interface para comandos relacionados a usuários

## Use Cases (Regras de Negócio)

### User Use Cases

**Localização**: `src/domain/useCases/user/`

#### CreateUser

**Arquivo**: `src/domain/useCases/user/CreateUser.ts`

**Responsabilidades**:

- Validar se não é um bot
- Verificar se usuário já existe
- Reativar usuário inativo se necessário
- Criar novo usuário

**Regras de Negócio**:

- Bots não são persistidos no sistema
- Usuários inativos são reativados automaticamente
- Não permite duplicação de usuários ativos

#### UpdateUser

**Arquivo**: `src/domain/useCases/user/UpdateUser.ts`

**Responsabilidades**:

- Atualizar dados do usuário
- Alterar status (ativo/inativo)

#### FindUser

**Arquivo**: `src/domain/useCases/user/FindUser.ts`

**Responsabilidades**:

- Buscar usuários por diferentes critérios
- Aplicar filtros de status

#### DeleteUser

**Arquivo**: `src/domain/useCases/user/DeleteUser.ts`

**Responsabilidades**:

- Exclusão lógica de usuários (soft delete)

## Types e Enums

### UserStatusEnum

**Arquivo**: `src/domain/types/UserStatusEnum.ts`

```typescript
export enum UserStatus {
  ACTIVE = 1,
  INACTIVE = 0,
}
```

### LoggerContextEnum

**Arquivo**: `src/domain/types/LoggerContextEnum.ts`

Define contextos para logging estruturado:

- `APP_CONTEXT`: Contexto da aplicação
- `REPOSITORY`: Contexto de repositórios
- `USECASE`: Contexto de casos de uso
- `COMMAND`: Contexto de comandos

### Messages

- **`CommonMessages.ts`**: Mensagens comuns do sistema
- **`ErrorMessages.ts`**: Mensagens de erro padronizadas

## DTOs (Data Transfer Objects)

### CreateManyUserOutputDto

**Arquivo**: `src/domain/dtos/CreateManyUserOutputDto.ts`

Usado para retornar resultado de criação em lote de usuários.

### GenericOutputDto

**Arquivo**: `src/domain/dtos/GenericOutputDto.ts`

DTO genérico para padronizar retornos de operações:

```typescript
interface GenericOutputDto<T> {
  data: T | null;
  success: boolean;
  message?: string;
}
```

## Princípios Aplicados

### Dependency Inversion

- Interfaces definem contratos
- Implementações ficam nas camadas externas
- Domain não depende de infraestrutura

### Single Responsibility

- Cada Use Case tem uma responsabilidade específica
- Entidades focam em representar conceitos de negócio

### Open/Closed

- Extensível através de novas implementações de interfaces
- Fechado para modificação das regras centrais

## Relacionamento com Outras Camadas

- **Application Layer**: Usa as interfaces e Use Cases definidos aqui
- **Infrastructure Layer**: Implementa as interfaces de repositórios e serviços
- **Contexts**: Injeta implementações concretas nos Use Cases

---

**Links Relacionados**:

- [1 - Documentação técnica](./1%20-%20Documentação%20técnica.md)
- [3 - Application Layer](./3%20-%20Application%20Layer.md)
- [4 - Infrastructure Layer](./4%20-%20Infrastructure%20Layer.md)
- [6 - Entidades Principais](./6%20-%20Entidades%20Principais.md)
- [7 - Use Cases](./7%20-%20Use%20Cases.md)
