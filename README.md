# 🔥 Churrasco VIP — Landing Page

Landing page responsiva para divulgação de um evento, criada com HTML, CSS e JavaScript. O projeto combina identidade visual temática, interações acessíveis e integração com serviços externos.

## Funcionalidades
- Layout responsivo para desktop e dispositivos móveis.
- Identidade visual com animações CSS e ilustração de churrasqueira feita com CSS.
- Seletor interativo de ponto da carne.
- Formulário que prepara uma mensagem de confirmação para o WhatsApp.
- Links de localização pelo Google Maps.
- Estados de foco visíveis e link para pular diretamente ao conteúdo.
- Respeito à preferência do sistema por movimento reduzido.

## Tecnologias
- HTML5, CSS3 e JavaScript (Vanilla)
- Google Fonts
- WhatsApp Click to Chat
- Google Maps

## Estrutura
```text
churrasco-vip-landing-page/
├── .github/workflows/html-validation.yml
├── assets/images/
├── css/styles.css
├── js/script.js
├── .gitignore
├── index.html
├── LICENSE
├── README.md
└── SECURITY.md
```

## Como executar
1. Baixe ou clone este repositório.
2. Abra `index.html` no navegador.

Não é necessário instalar dependências de build para executar esta página estática.

## Publicar com GitHub Pages
1. Envie os arquivos para um repositório GitHub.
2. Abra **Settings → Pages**.
3. Selecione a branch principal e a pasta `/ (root)` em **Deploy from a branch**.
4. Salve e aguarde a publicação.

## Segurança e privacidade
- O projeto não contém backend ou banco de dados.
- O formulário prepara a mensagem no navegador; o visitante precisa confirmar o envio no WhatsApp.
- Não adicione credenciais ou segredos ao repositório.
- Consulte `SECURITY.md` para comunicar vulnerabilidades.
- A validação automática de HTML não substitui testes funcionais, de acessibilidade ou auditoria de segurança.

## Antes de publicar
Confirme se a data, a localização, o nome e o telefone do organizador podem ser divulgados publicamente. Atualize essas informações em `index.html` e `js/script.js` se necessário.

## Objetivo
Projeto de portfólio para praticar desenvolvimento front-end, estruturação semântica, responsividade, acessibilidade básica e interações com JavaScript.
