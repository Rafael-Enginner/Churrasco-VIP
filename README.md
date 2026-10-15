# 🔥 Churrasco VIP

Site-convite imersivo e animado para um Churrasco em Brasília/DF. 
Os convidados confirmam presença, informam quantas pessoas vão e escolhem o que levar; o organizador acompanha tudo em um painel protegido por login.

Construído com **HTML, CSS e JavaScript puros**, sem etapa de build, sem framework e sem dependências para instalar.

## ✨ Destaques

- **Experiência imersiva:** brasas animadas em canvas, brilho que segue o cursor, parallax e inclinação 3D na foto principal, barra de progresso de rolagem.
- **Animações de entrada:** título revelado linha a linha, seções que surgem ao rolar e um espeto de churrasco que desliza entre as seções.
- **Contagem regressiva** em tempo real até o início do evento.
- **Confirmação de presença** com lista de sugestões do que levar, campo livre e atalho para avisar o organizador no WhatsApp.
- **Painel do organizador** com total de confirmações, estimativa de pessoas, ranking dos itens e remoção de registros.
- **Responsivo e acessível:** layout mobile-first, rótulos de formulário, `aria-live` na contagem e respeito a `prefers-reduced-motion`.

## 🧱 Stack

| Camada | Tecnologia |
| --- | --- |
| Interface | HTML5, CSS3 (variáveis, `color-mix`, `oklch`), JavaScript (ES2022) |
| Dados e autenticação | [Supabase](https://supabase.com) (Postgres + Auth + RLS) via `supabase-js` por CDN |
| Tipografia | Oswald e DM Sans (Google Fonts) |

## 📁 Estrutura

```
churrasco-vip/
├── index.html          # página do convite
├── admin.html          # painel do organizador (login + lista)
├── css/styles.css      # estilos e animações
├── js/
│   ├── config.js       # configurações do evento e do Supabase
│   ├── app.js          # animações, contagem e confirmação de presença
│   └── admin.js        # lógica do painel
├── assets/img/         # imagens
└── db/schema.sql       # tabelas, funções e políticas de segurança
```

## 🚀 Como rodar localmente

Não há nada para instalar. Sirva a pasta com qualquer servidor estático:

```bash
# Python
python3 -m http.server 8080

# ou Node
npx serve .
```

Abra `http://localhost:8080`.

## 🗄️ Configurando o banco (Supabase)

1. Crie um projeto em [supabase.com](https://supabase.com) (ou use o existente).
2. No **SQL Editor**, execute o conteúdo de [`db/schema.sql`](db/schema.sql). Ele cria as tabelas `rsvps` e `user_roles`, a função `has_role` e as políticas de segurança (RLS).
3. Em **Project Settings → API**, copie a **URL** e a chave **anon/publishable**.
4. Cole os valores em [`js/config.js`](js/config.js):

   ```js
   SUPABASE_URL: "https://SEU-PROJETO.supabase.co",
   SUPABASE_ANON_KEY: "sua-chave-publishable",
   ```

5. Acesse `/admin.html` e **crie a conta do organizador**. A primeira conta criada recebe o papel de administrador automaticamente (gatilho `handle_first_admin`). Depois disso, considere desativar novos cadastros em **Authentication → Providers → Email → Allow new users to sign up**.

> Sem a chave configurada o site continua funcionando: a confirmação apenas segue para o WhatsApp, sem salvar no banco, e o painel exibe um aviso.

## 🔐 Segurança

- A chave `anon/publishable` é pública por natureza. Quem protege os dados são as **políticas RLS**: qualquer pessoa pode **inserir** uma confirmação, mas só administradores podem **ler** e **remover**.
- **Nunca** coloque a chave `service_role` no front-end.
- Os dados exibidos no painel são inseridos com `textContent`, evitando injeção de HTML.
- O formulário limita tamanhos (nome 80, item extra 200, até 20 itens), e o banco reforça essas regras com `CHECK`.

## ☁️ Publicação

Por ser um site estático, funciona em qualquer hospedagem: **GitHub Pages**, **Netlify**, **Vercel**, **Cloudflare Pages** ou servidor próprio. Basta publicar a pasta inteira, sem comando de build.

## 🛠️ Personalização

Quase tudo está em `js/config.js`: data do evento, link do mapa, WhatsApp do organizador e lista de sugestões. Para trocar as cores, edite as variáveis no topo de `css/styles.css`. Textos e imagem ficam em `index.html` e `assets/img/`.

## 📄 Licença

Projeto pessoal. Defina a licença que preferir antes de tornar o repositório público.

---

Feito pra reunir. Temperado com resenha. 🥩
