Churrasco VIP — Full Stack Event Management

Aplicação web full stack para divulgação de eventos e gerenciamento de confirmações de presença, desenvolvida com HTML5, CSS3, JavaScript, Node.js, Express e PostgreSQL.

O projeto oferece uma landing page responsiva e interativa, integrada a um backend para registro de convidados e a um painel administrativo protegido por autenticação.

Principais recursos

Interface responsiva com animações personalizadas.
Confirmação de presença integrada ao banco de dados (reenviar o mesmo nome atualiza a quantidade, sem duplicar).
Painel administrativo com paginação, total de pessoas confirmadas e gerenciamento de convidados.
Atualização de status e exportação CSV protegida contra injeção de fórmulas.
Autenticação com bcrypt, sessões, proteção CSRF e limite de tentativas.
Vídeo real da carne na brasa no topo da página, com som ambiente opcional (ligado só pelo botão). O vídeo carrega só quando visível, pausa fora da tela e respeita "reduzir movimento" e economia de dados (public/js/churrasco-video.js).
Prévia de link para WhatsApp (Open Graph) e foco em acessibilidade.
Player de música com seleção de arquivos locais: o código está em public/js/script.js e só é ativado quando a página contém os elementos musicFiles, audioPlayer, playlist e trackTitle. O HTML do player não faz parte do index.html atual.
Hospedagem no Render e banco de dados no Supabase.

Stack: HTML · CSS · JavaScript · Node.js · Express · PostgreSQL · Supabase · Render

Demonstração: https://churrasco-vip.onrender.com

Estrutura
server.js              API Express e servidor de arquivos estáticos
db/001_migrate.sql     migração do esquema antigo para o atual
scripts/hash-password.js  gera o hash da senha do painel
public/                site (index.html, admin.html, css/, js/, img/, media/)
public/media/          vídeo (desktop e celular), posters e áudio ambiente
.env.example           modelo das variáveis de ambiente
Instalação

Requisitos: Node.js 20 ou superior e um projeto Supabase (PostgreSQL).

bash
npm install
cp .env.example .env     # preencha os valores
npm run hash-password    # gera ADMIN_PASSWORD_HASH (mínimo de 12 caracteres)
npm start
Variáveis de ambiente
Variável	Descrição
SESSION_SECRET	Segredo da sessão, com 32 ou mais caracteres aleatórios.
ADMIN_PASSWORD_HASH	Hash bcrypt da senha do painel.
DATABASE_URL	URI do pooler do Supabase.
DB_CA_PATH	Caminho do certificado CA do Supabase (padrão: /etc/secrets/supabase-ca.crt).
NODE_ENV	Use production em produção (cookie secure e proxy confiável).
DB_SSL	disable apenas em desenvolvimento local, sem TLS. Ignorado em produção.

Configure as variáveis sensíveis no painel do Render. Nunca faça commit do .env.

Banco de dados

Instalação nova: o servidor cria as tabelas automaticamente na primeira execução.

Projeto já existente (esquema antigo): faça um backup e execute db/001_migrate.sql no SQL Editor do Supabase antes de subir esta versão. A migração:

converte guestCount (texto) em guest_count numérico (5 = "5 ou mais");
renomeia createdAt para created_at;
cria o índice de nome único (aborta se houver nomes duplicados);
ativa RLS nas tabelas;
não apaga dados: a coluna antiga fica como guest_count_legacy.

Se o servidor detectar o esquema antigo, ele se recusa a iniciar e informa o motivo.

Segurança
RLS ativado em guests e user_sessions, sem políticas: a Data API pública do Supabase não acessa essas tabelas. O servidor usa o papel postgres, que ignora RLS.
TLS com validação de certificado em produção.
CSP restritiva, sem unsafe-inline.
Limites por IP a cada 15 minutos: 20 confirmações, 8 tentativas de login e 300 requisições gerais.
Sessão com cookie httpOnly, sameSite=strict e regeneração no login. Rotas do admin exigem token CSRF.
Mais detalhes e boas práticas em SECURITY.md.
Privacidade (LGPD)

São coletados apenas nome e quantidade de pessoas, para a organização do evento. Apague os registros depois da festa (pelo painel ou removendo as linhas de guests no Supabase).

Projeto desenvolvido para fins práticos de aprendizagem, aplicação de conceitos de Engenharia de Software e construção de portfólio.

Mídia (vídeo e áudio)

O vídeo original é 4K e pesa 20 MB; o site usa versões otimizadas (1280 px com 1,7 MB no desktop e 720 px em 5:4 com cerca de 1,4 MB no celular), com faststart, para começar a tocar logo. Para trocar o vídeo, gere novas versões com o mesmo formato e mude o nome dos arquivos (o servidor guarda /media em cache por 7 dias).
