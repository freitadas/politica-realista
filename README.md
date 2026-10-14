# Mandato Cloud — opcional

O jogo permanece um **Static Site**. Este backend é um serviço separado para criar contas e sincronizar até cinco carreiras entre dispositivos.

## Deploy

1. Crie um banco PostgreSQL no Render (os planos/preços dependem da oferta atual).
2. Crie um Web Service Node com Root Directory `cloud-server`, Build `npm install --omit=dev`, Start `npm start` e Health Check `/api/health`.
3. Configure `DATABASE_URL` com a URL de conexão PostgreSQL adequada ao serviço, `JWT_SECRET` com pelo menos 32 caracteres aleatórios (não compartilhe) e `CLIENT_ORIGIN` com a origem EXATA do site estático (ex.: `https://seu-jogo.onrender.com`), sem barra final.
4. Espere `/api/health` retornar `{"ok":true,...}`.
5. No jogo, acesse Salvamentos, informe a URL HTTPS do backend e crie uma conta. Sincronizar e restaurar exigem login.

A implantação opcional **não é automática**: requer conta, provisionamento do banco, ambiente e eventuais custos externos. Não utilize um banco efêmero para dados importantes.

Autenticação com bcrypt e JWT (expira em sete dias). HTTPS no Render, CORS configurável e limites de requisições. O servidor não analisa o conteúdo político do jogo; armazena somente o arquivo de progresso submetido pelo usuário.
