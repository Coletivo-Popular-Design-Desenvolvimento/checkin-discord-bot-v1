# Decisões do Spike de análise e visualização de dados

**Status:** recomendações aceitas em 26 de agosto de 2026.

Este documento preserva as alternativas consideradas durante a definição do Spike. Todas as opções marcadas como **Recomendada** foram aceitas para orientar a documentação e a futura implementação da PoC.

Documentos resultantes:

- [Relatório do Spike](./0001-ferramenta-analise-dados.md)
- [ADR proposto](../adr/0001-metabase-para-analise-de-dados.md)

Cada item abaixo traz alternativas, uma explicação simples e a decisão aceita.

## 1. Escopo desta entrega

- **A — Comparativo + ADR + PoC mínima — Recomendada**
  Atende os quatro critérios de aceite na mesma branch.
- **B — Somente comparativo e ADR**
  Registra a pesquisa, mas deixa a tarefa incompleta porque não há ambiente executável.
- **C — Somente PoC**
  Prova a ferramenta, mas não documenta por que ela foi escolhida.

**Resposta recomendada: A.**

## 2. Organização da documentação

- **A — Separar Spike e ADR — Recomendada**
  Criar um relatório detalhado em `docs/spikes/0001-ferramenta-analise-dados.md` e um ADR curto em `docs/adr/0001-ferramenta-analise-dados.md`.
- **B — Colocar tudo no ADR**
  É mais simples, mas transforma o ADR em um relatório extenso e difícil de consultar.
- **C — Registrar apenas no README**
  Facilita a descoberta, mas mistura documentação operacional com decisão arquitetural.

**Resposta recomendada: A.** O Spike guarda evidências e a matriz; o ADR registra a decisão e seus motivos.

## 3. Estado inicial da decisão

- **A — Metabase como decisão proposta — Recomendada**
  O documento indica o favorito, mas só muda para “aceito” depois da PoC e do teste com pessoas.
- **B — Metabase já aceito**
  Encerra a decisão antes de validar consumo, permissões e acessibilidade.
- **C — Sem ferramenta favorita**
  Mantém neutralidade, mas ignora que já existe uma hipótese tecnicamente fundamentada.

**Resposta recomendada: A.**

## 4. Ferramentas comparadas

- **A — Metabase, Apache Superset e Grafana — Recomendada**
  Cobre uma ferramenta de BI acessível, uma plataforma analítica avançada e uma solução orientada a observabilidade.
- **B — Comparar cinco ou mais ferramentas**
  Amplia a pesquisa, mas aumenta bastante o Spike sem garantir uma decisão melhor.
- **C — Comparar apenas Metabase e Grafana**
  Não atende ao mínimo de três ferramentas.

**Resposta recomendada: A.**

## 5. Ferramenta usada na PoC

- **A — Metabase Open Source — Recomendada**
  É a hipótese mais coerente para pessoas não especialistas explorarem um banco relacional.
- **B — Apache Superset**
  Oferece mais flexibilidade analítica, com operação e aprendizado mais exigentes.
- **C — Grafana**
  Funciona bem para séries temporais e monitoramento, mas não é a hipótese mais forte para exploração comunitária dos dados.

**Resposta recomendada: A.**

## 6. Fonte de dados da PoC

- **A — Dataset simulado, determinístico e fiel ao schema — Recomendada**
  Qualquer pessoa pode reproduzir o painel sem receber nomes, IDs ou dados reais da comunidade.
- **B — Cópia local restaurada do banco real**
  Permite números reais, mas cria riscos de privacidade e dificulta compartilhar a PoC.
- **C — Banco vazio com consultas demonstrativas**
  É seguro, porém não comprova a construção de gráficos úteis.

**Resposta recomendada: A.** O dataset deve imitar usuários, mensagens, reações, canais e eventos sem representar pessoas reais.

## 7. Forma de acesso ao banco

- **A — Usuário somente leitura e views analíticas — Recomendada**
  A ferramenta enxerga apenas dados preparados para análise e não consegue alterar o banco operacional.
- **B — Usuário comum diretamente nas tabelas**
  É mais rápido de configurar, mas expõe campos desnecessários e permite maior acoplamento.
- **C — Criar uma API antes do BI**
  Dá controle completo, porém expande demasiadamente o escopo do Spike.

**Resposta recomendada: A.**

## 8. Conteúdo do primeiro painel

- **A — Painel “Saúde da Comunidade” — Recomendada**
  Mostra membros ativos, mensagens, reações, canais, eventos e evolução temporal.
- **B — Painel de produtividade individual**
  Facilita rankings, mas contraria a intenção comunitária e aumenta o risco de vigilância.
- **C — Painel somente técnico**
  Mostra banco, memória e disponibilidade, mas não responde às perguntas do produto.

**Resposta recomendada: A.**

O painel inicial deve conter:

- membros ativos no período;
- mensagens e participantes por dia;
- reações por mensagem;
- canais com maior participação;
- eventos de voz e participantes;
- filtros de período e canal;
- indicador de cobertura dos dados.

## 9. Identificação individual

- **A — Apenas métricas agregadas — Recomendada**
  Nomes, IDs, e-mails e rankings pessoais não aparecem no dataset do BI.
- **B — Identificadores pseudonimizados**
  Permite acompanhar indivíduos sem nomes, mas ainda possibilita reconstruir padrões pessoais.
- **C — Nomes reais com acesso restrito**
  Facilita análises individuais, mas entra em conflito com a finalidade declarada do projeto.

**Resposta recomendada: A.**

## 10. Métricas e definições

- **A — Criar um pequeno dicionário de métricas — Recomendada**
  Define exatamente o significado de “ativo”, “retenção”, “participação” e “reativação”.
- **B — Deixar cada gráfico definir sua regra**
  É rápido, mas diferentes painéis podem apresentar números contraditórios.
- **C — Adiar as definições para depois da PoC**
  Permite experimentar, porém enfraquece a validação dos resultados.

**Resposta recomendada: A.**

Definição inicial sugerida: membro ativo é uma pessoa não-bot que realizou ao menos uma mensagem, reação ou participação em evento de voz no período selecionado.

## 11. Integração com Docker Compose

- **A — Profile separado `analytics` — Recomendada**
  O Metabase só sobe quando solicitado e não aumenta o consumo normal do bot.
- **B — Metabase sempre ativo no profile `dev`**
  Facilita o uso diário, mas torna o ambiente básico mais pesado.
- **C — Compose independente em outra pasta**
  Isola completamente a PoC, porém duplica configurações de rede e banco.

**Resposta recomendada: A.**

Comando esperado:

```bash
docker compose --profile analytics up -d db metabase
```

## 12. Porta da ferramenta

- **A — Porta `3001` — Recomendada**
  Evita conflito com aplicações que normalmente usam `3000`.
- **B — Porta `3000`**
  É convencional para aplicações web, mas pode conflitar com outros serviços.
- **C — Porta configurada aleatoriamente**
  Reduz conflitos locais, porém prejudica a documentação e a reprodutibilidade.

**Resposta recomendada: A.**

## 13. Atualização dos dados

- **A — Atualização sob demanda ou periódica — Recomendada**
  É suficiente para leitura comunitária e reduz complexidade.
- **B — Tempo real obrigatório**
  Parece atraente, mas não é necessário para decisões sobre tendências e retenção.
- **C — Snapshot estático**
  É simples para demonstração, mas não prova a conexão operacional com o banco.

**Resposta recomendada: A.**

## 14. Avaliação de recursos

- **A — Medir e registrar, sem fixar limite antes da PoC — Recomendada**
  Registrar memória em repouso, memória durante consultas, tempo de inicialização e tempo de abertura do painel.
- **B — Definir um limite rígido agora**
  Dá um critério objetivo, mas seria um número arbitrário sem medição do ambiente.
- **C — Não medir recursos**
  Ignora um dos critérios centrais da tarefa.

**Resposta recomendada: A.** A PoC falha se ocorrer falta de memória, travamento ou lentidão que impeça o uso; os números observados serão registrados no ADR.

## 15. Validação de segurança e RBAC

- **A — Testar apenas recursos disponíveis na edição OSS — Recomendada**
  Evita recomendar funcionalidades que exigiriam pagamento posteriormente.
- **B — Considerar recursos pagos na avaliação**
  Mostra possibilidades futuras, mas pode distorcer a decisão open source.
- **C — Avaliar segurança apenas pela documentação**
  É mais rápido, porém não comprova o comportamento real.

**Resposta recomendada: A.** Devem ser testados administrador, pessoa editora e pessoa somente leitora, dentro dos limites reais da edição comunitária.

## 16. Teste de diálogo e autonomia

- **A — Tarefas curtas com pessoas de perfis diferentes — Recomendada**
  Pedir para interpretar um gráfico, alterar um período e aplicar um filtro.
- **B — Demonstração conduzida pela pessoa desenvolvedora**
  Mostra o painel, mas não comprova autonomia.
- **C — Formulário sem interação prática**
  Coleta opiniões gerais, sem verificar se a interface é realmente utilizável.

**Resposta recomendada: A.**

O registro deve guardar dificuldades e tempo aproximado, sem identificar publicamente as pessoas participantes.

## 17. Critério para aceitar definitivamente o Metabase

- **A — Aceitar somente após cumprir os três cenários — Recomendada**
  Exige ambiente reproduzível, painel conectado e validação com pessoas não especialistas.
- **B — Aceitar após o ambiente subir**
  Valida a operação, mas não a utilidade social.
- **C — Aceitar pela matriz teórica**
  Dispensa a PoC e deixa um critério da tarefa sem evidência.

**Resposta recomendada: A.**

## 18. Alternativa caso o Metabase não passe

- **A — Apache Superset como segunda opção — Recomendada**
  Mantém forte capacidade analítica, aceitando uma curva de aprendizado maior.
- **B — Grafana como segunda opção**
  É adequado se a prioridade mudar para monitoramento e séries temporais.
- **C — Encerrar o Spike sem alternativa**
  Obriga uma nova pesquisa completa se o favorito falhar.

**Resposta recomendada: A.**

## 19. Atualização da documentação existente

- **A — Registrar a divergência e abrir correção separada — Recomendada**
  Mantém o Spike focado e deixa claro que o README arquitetural está desatualizado.
- **B — Corrigir toda a documentação nesta mesma entrega**
  Melhora o repositório, mas amplia significativamente o escopo.
- **C — Ignorar a divergência**
  Permite que novas pessoas continuem recebendo informações incorretas.

**Resposta recomendada: A.**

## 20. Resultado final esperado

- **A — PoC reproduzível + evidências + ADR — Recomendada**
  A tarefa termina com comparação, ambiente executável, painel, medições e decisão fundamentada.
- **B — Documento conceitual**
  Entrega conhecimento, mas não comprova viabilidade.
- **C — Ambiente técnico sem decisão**
  Entrega código, mas não responde qual ferramenta deve ser adotada.

**Resposta recomendada: A.**

## Registro da decisão

Em 26 de agosto de 2026, todas as vinte respostas recomendadas foram aceitas. O aceite define o escopo e a hipótese de trabalho, mas não transforma a escolha do Metabase em decisão arquitetural definitiva: isso depende das evidências da PoC e dos três cenários de homologação.
