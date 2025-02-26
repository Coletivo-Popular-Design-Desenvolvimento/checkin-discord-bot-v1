# AuthEngageBot

AuthEngageBot é um bot para Discord que realiza autenticação de usuários e monitoramento de engajamento, como contagem de mensagens e participação em reuniões de voz. Este projeto é uma Proof of Concept (PoC).

## Funcionalidades

- Registro de usuários com nome de usuário e senha.
- Autenticação de usuários.
- Atribuição de cargo após autenticação.
- Monitoramento de mensagens enviadas por mês.
- Monitoramento de participação em reuniões de voz (entradas e duração).
- Geração de relatórios de engajamento.

## Pré-requisitos

- Node.js v14 ou superior
- npm (gerenciador de pacotes do Node.js)
- PM2 (gerenciador de processos para Node.js)
- Um servidor Discord
- Um bot do Discord configurado com permissões adequadas

## Dependências

- Bcryptjs: ^3.0.2 (Criar hashs para salvar senhas)
- Discord.js: 14.15.3 (Biblioteca Node.js com integração a api do Discord)

## Instalação

1. Clone este repositório:
    ```bash
    git clone https://github.com/seu-usuario/AuthEngageBot.git
    cd AuthEngageBot
    ```

2. Instale as dependências:
    ```bash
    npm install
    ```

3. Instale o PM2 globalmente (se ainda não estiver instalado):
    ```bash
    npm install -g pm2
    ```

4. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
    ```env
    SECRET_KEY=seu-bot-token
    ALLOWED_ROLEID=id-do-cargo-permitido
    AUTH_ROLE_ID=id-do-cargo-autenticado
    AUTH_CHANNEL_ID=id-do-canal-de-autenticacao
    PROTECTED_CHANNEL_ID=id-do-canal-protegido
    ```

5. Crie um arquivo `users.json` na raiz do projeto:
    ```json
    {}
    ```

## Como usar

1. Inicie o bot com PM2:
    ```bash
    pm2 start index.js --name auth-engage-bot
    ```

2. Para visualizar o status do bot:
    ```bash
    pm2 status
    ```

3. Para visualizar os logs do bot:
    ```bash
    pm2 logs auth-engage-bot
    ```

4. No Discord, vá ao canal de autenticação configurado e use o comando `!register`:
    ```text
    !register
    ```

5. O bot enviará uma mensagem direta (DM) para o usuário solicitando o nome de usuário e a senha. O usuário deve responder na DM no formato:
    ```text
    <username> <password>
    ```

6. Para fazer login e acessar um módulo específico, use o comando `!login` no canal de autenticação:
    ```text
    !login <username> <password> <module>
    ```

7. Para gerar um relatório de engajamento, use o comando `!report` no canal de relatórios:
    ```text
    !report
    ```

## Estrutura do Projeto

- `index.js`: Código principal do bot.
- `package.json`: Arquivo de configuração do npm.
- `users.json`: Arquivo de armazenamento de usuários.

## Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.