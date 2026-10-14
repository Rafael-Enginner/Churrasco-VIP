# Churrasco VIP — Full-stack

Landing page com animações, player de música local, registro de presença em SQLite e painel administrativo protegido por senha.

## Onde colocar os arquivos?

Envie **todo o conteúdo desta pasta** para a raiz do repositório GitHub. O GitHub armazena o código, mas **GitHub Pages não executa Node.js**. Para ter o cadastro e painel funcionando publicamente, publique o projeto completo em uma hospedagem Node.js com **disco persistente** (para o SQLite).

## Como iniciar no computador

1. Instale Node.js 20+ e execute `npm install` na pasta do projeto.
2. Copie `.env.example` para `.env`.
3. Execute `npm run hash-password`, escolha uma senha forte e copie o hash para `ADMIN_PASSWORD_HASH` no `.env`.
4. Defina `SESSION_SECRET` com um valor aleatório de pelo menos 32 caracteres.
5. Execute `npm start`. **Atenção:** Node.js não carrega `.env` automaticamente nesta versão; inicie com `node --env-file=.env server.js` no Node 20.6+ ou configure as variáveis no ambiente.
6. Site: `http://localhost:3000`; painel: `http://localhost:3000/admin`.

## Como publicar

- Conecte o repositório a um provedor de hospedagem Node.js.
- Instale dependências com `npm install` e inicie com `npm start`.
- Configure `NODE_ENV=production`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET` e `DB_PATH` nas variáveis de ambiente do provedor.
- Configure HTTPS e armazenamento persistente para `DB_PATH`, com backups.
- Configure `TRUST_PROXY=1` **somente** se a hospedagem usar proxy reverso confiável.
- Teste `/api/health`, o formulário e `/admin`.

## Recursos

- API `POST /api/rsvp`: registra nome e quantidade de pessoas.
- Painel `/admin`: lista convidados, inclui manualmente, altera status, exclui e exporta CSV.
- API administrativa exige sessão e token CSRF.
- Player: cada visitante pode selecionar arquivos MP3 ou outros formatos compatíveis. **O arquivo permanece no dispositivo**.
- O projeto não inclui gravações comerciais de música sertaneja/modão, pois exigem direitos de distribuição.
- O seletor de ponto da carne foi removido integralmente.

## Privacidade

Os dados do formulário ficam no SQLite do servidor; o organizador deve proteger a lista, informar essa finalidade aos convidados e excluir dados quando não forem necessários. O WhatsApp abre para envio opcional; o cadastro ocorre antes da abertura. Não há integração com API oficial do WhatsApp.

## Observações

O código é uma base funcional para testes, **não foi validado em produção**. Revise permissões e privacidade antes de divulgar. Confirme data, endereço e telefone antes da publicação.
