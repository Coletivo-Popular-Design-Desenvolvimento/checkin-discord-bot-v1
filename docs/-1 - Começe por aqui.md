# Comece por aqui — Check-in Bot

## Por que este projeto existe

O Check-in transforma sinais mínimos de participação no Discord em dados relacionais que ajudam o CPDD a compreender a saúde da comunidade. Ele permite observar tendências coletivas — por exemplo, atividade por período, canais mobilizadores e participação em voz — sem guardar o conteúdo das conversas.

O projeto não é ponto, autenticação, moderação nem ferramenta de avaliação individual.

## O que ele coleta

- membros e seu estado atual no servidor;
- canais e cargos;
- data, autoria e canal de mensagens, sem o texto;
- emoji, autoria, mensagem e data disponível de reações;
- eventos agendados de voz e entradas/saídas observadas em tempo real.

O schema possui um campo opcional de e-mail por herança da modelagem, mas o fluxo atual não obtém e-mail do Discord. Dados analíticos devem excluir esse campo e privilegiar agregações.

## Como ele funciona

```text
Discord -> comandos da aplicação -> casos de uso -> repositórios -> Prisma -> MariaDB
```

Há dois entry points:

- `src/index.ts`: coleta contínua enquanto o bot está conectado;
- `src/historicalSync.ts`: importação manual de parte do histórico disponível pela API.

O código ativo está organizado em `domain`, `application`, `infrastructure` e `contexts`. A pasta `src/oldApp` é legado preservado e não participa da inicialização atual.

## Ordem recomendada

1. [Documentação de Produto](./0%20-%20Documenta%C3%A7%C3%A3o%20de%20Produto.md)
2. [Documentação técnica](./1%20-%20Documenta%C3%A7%C3%A3o%20t%C3%A9cnica.md)
3. [Entidades Principais](./6%20-%20Entidades%20Principais.md)
4. [Casos de Uso](./7%20-%20Use%20Cases.md)
5. [Sincronização Histórica](./8%20-%20Sincroniza%C3%A7%C3%A3o%20Hist%C3%B3rica.md)

Para navegar por perfil, use o [Índice de Leitura](./%F0%9F%97%82%EF%B8%8F%20%C3%8Dndice%20de%20Leitura%20-%20Checkin%20Bot.md).

## Estado atual, sem promessas

Estão implementados os fluxos de coleta em tempo real, o backfill parcial, a persistência Prisma e os testes. Não existe API de consulta, interface web, dashboard ou geração de relatórios no código atual. `application/query/userQuery.ts` está reservado para leituras futuras.

## Primeira execução

Siga o [README](../README.md) para instalar e executar. Se ainda não possui uma aplicação Discord, consulte [Como criar um bot no Discord](./Criar-bot-Discord.md).
