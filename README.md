# Churrasco VIP — PostgreSQL / Supabase

Projeto adaptado do ZIP original. Mantém o site, player local, animações, RSVP e painel `/admin`. O cadastro e as sessões do administrador são armazenados no PostgreSQL do Supabase, **não no SQLite local**.

## 1. Criar o banco gratuito no Supabase
1. Acesse https://supabase.com e crie um projeto.
2. Em **Connect**, obtenha a **connection string PostgreSQL**. Para Render, prefira o **Session pooler** (porta 5432, compatível com IPv4) quando disponível. Copie a URI completa e substitua a senha de banco; o usuário pode ser diferente de `postgres`.
3. Guarde a URI **somente** na variável de ambiente `DATABASE_URL` do servidor. Nunca a coloque em `public/`, no GitHub ou no JavaScript do navegador.
4. O servidor cria automaticamente as tabelas `guests` e `user_sessions` na primeira inicialização. O usuário de conexão precisa de permissão de criação no schema.

## 2. Gerar credenciais
- Instale Node.js 20+.
- Execute `npm install`.
- Execute `npm run hash-password` para gerar `ADMIN_PASSWORD_HASH` a partir de uma senha forte.
- Gere `SESSION_SECRET` aleatório com 32+ caracteres (ex.: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`).
- Não publique o hash, segredo ou `DATABASE_URL`.

## 3. Testar localmente
1. Copie `.env.example` para `.env` e preencha os valores.
2. Defina `NODE_ENV=development` e `TRUST_PROXY=0`.
3. Execute `node --env-file=.env server.js` (Node 20.6+) ou configure as variáveis do sistema e use `npm start`.
4. Site: http://localhost:3000 | Painel: http://localhost:3000/admin.
5. Teste envio de RSVP, login, listagem, confirmação, exclusão e exportação CSV.

## 4. Publicar gratuitamente no Render
1. Suba os arquivos do projeto no GitHub, **sem o `.env`**.
2. Em https://render.com crie **New > Web Service**, conecte o repositório e selecione runtime Node.
3. Build command: `npm install`
4. Start command: `npm start`
5. Configure estas variáveis no Render:
   - `NODE_ENV=production`
   - `TRUST_PROXY=1`
   - `SESSION_SECRET=<segredo aleatório>`
   - `ADMIN_PASSWORD_HASH=<hash bcrypt>`
   - `DATABASE_URL=<URI PostgreSQL do Supabase>`
6. Publique e acesse `https://seu-servico.onrender.com` e `/admin`.
7. Teste HTTPS, cookies, persistência dos registros e login após reinicialização.

**Atenção:** o Render gratuito pode suspender a aplicação por inatividade e o Supabase gratuito pode pausar o projeto. Verifique os limites atuais dos planos. O uso de um banco remoto evita perda de dados por disco efêmero do Render, mas não substitui backups.

## Segurança e privacidade
- SQL parametrizado, sessões no PostgreSQL, senha bcrypt, CSRF e cookies `HttpOnly` / `Secure` em produção.
- O front-end não recebe `DATABASE_URL`, `SESSION_SECRET` ou `ADMIN_PASSWORD_HASH`.
- A lista contém dados pessoais: proteja acesso e remova informações após o evento.
- O formulário de RSVP não verifica identidade nem impede duplicatas; evite tratar o registro como confirmação autenticada.
- A senha de conexão do banco **não** é a chave pública `anon` nem a `service_role` do Supabase.
- **TLS:** o cliente PostgreSQL exige validação de certificado. Se a conexão falhar por certificado, configure a CA apropriada para seu ambiente; não desative a verificação TLS em produção.
- As músicas escolhidas pelo visitante ficam no dispositivo, sem upload ao servidor.

## Arquivos
- `server.js`: API e persistência PostgreSQL
- `public/`: site e painel
- `scripts/hash-password.js`: gerador de hash de senha
- `.env.example`: exemplo sem segredos
