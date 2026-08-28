# 🗂️ Índice de Leitura - Checkin Bot

## Ordem Recomendada de Leitura

Cada documento aprofunda uma parte do projeto sem exigir que a pessoa conheça toda a base de código de antemão. Para construir uma visão gradual, siga esta sequência:

1. [Comece por aqui](./-1%20-%20Come%C3%A7e%20por%20aqui.md) — propósito, limites e estado atual.
2. [Documentação de Produto](./0%20-%20Documenta%C3%A7%C3%A3o%20de%20Produto.md) — intenção comunitária e uso responsável.
3. [Documentação técnica](./1%20-%20Documenta%C3%A7%C3%A3o%20t%C3%A9cnica.md) — arquitetura executável e fluxos.
4. [Domain Layer](./2%20-%20Domain%20Layer.md) — entidades, contratos e fronteiras atuais.
5. [Application Layer](./3%20-%20Application%20Layer.md) — adaptação dos eventos do Discord.
6. [Infrastructure Layer](./4%20-%20Infrastructure%20Layer.md) — Discord.js, Prisma e repositórios.
7. [Contexts](./5%20-%20Contexts.md) — composição manual das dependências.
8. [Entidades Principais](./6%20-%20Entidades%20Principais.md) — schema, relações e cuidados analíticos.
9. [Use Cases](./7%20-%20Use%20Cases.md) — operações implementadas e entradas disponíveis.
10. [Sincronização Histórica](./8%20-%20Sincroniza%C3%A7%C3%A3o%20Hist%C3%B3rica.md) — execução, idempotência e limites do backfill.
11. [Como criar um bot no Discord](./Criar-bot-Discord.md) — configuração no Developer Portal.

## Sequência por Perfil

### 🤝 **Para Produto e Comunidade**

Leia “Comece por aqui”, Produto e Entidades. Esses documentos explicam o que os sinais permitem observar e quais interpretações devem ser evitadas.

### 👨‍💻 **Para Desenvolvedores**

Leia a documentação técnica, as quatro notas de camadas/contexts e Casos de Uso. Use o código e o schema Prisma como fontes finais para detalhes de implementação.

### 📊 **Para Analistas de Dados**

Leia Produto, Entidades, Sincronização Histórica e Infrastructure. Dê atenção especial a `platform_created_at`, à ausência de dimensão temporal em cargos/canais e às lacunas do backfill.

### 🚀 **Para DevOps/Deploy**

Leia o [README](../README.md), Contexts, Infrastructure e Sincronização Histórica. Os workflows atuais ficam em `.github/workflows`.

## Glossário Rápido

| Termo                 | Uso neste projeto                                                                             |
| --------------------- | --------------------------------------------------------------------------------------------- |
| Clean Architecture    | inspiração para separar contratos e adapters; a estrutura atual possui ressalvas documentadas |
| Command               | adapter que recebe evento do Discord e delega a um caso de uso                                |
| Query                 | direção futura; ainda não há handler de leitura implementado                                  |
| Caso de uso           | operação que coordena regras e portas do domínio                                              |
| Repositório           | adapter de persistência que implementa uma interface do domínio                               |
| Context               | função que instancia e conecta dependências concretas                                         |
| `platform_id`         | identificador do objeto no Discord                                                            |
| `platform_created_at` | data original disponível na plataforma, preferível à data de importação                       |
| Backfill              | sincronização histórica manual dentro dos limites da API Discord                              |

## 🧭 Fonte de verdade

- comportamento: código em `src`, exceto `src/oldApp`;
- modelo persistido: `schema.prisma` e migrations;
- comandos: `package.json` e arquivos Compose;
- automação: `.github/workflows`;
- intenção e limites: documentação de produto.

Se a documentação divergir dessas fontes, corrija-a na mesma entrega que alterar o comportamento.
