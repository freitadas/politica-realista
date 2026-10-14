# Mandato v9 — Versão Integral

Jogo de estratégia política em HTML, CSS e JavaScript. A versão 9 reúne, em **um único pacote**, as melhorias de eleições, debates, partido, adversários, mandato, carreira, eleitorado, integridade, mapa, apuração e salvamento.

**Importante:** todas as porcentagens, resultados, promessas, eventos, investigações, apoios e ações atribuídas a candidaturas são inteiramente **simulados**. Não são pesquisas, notícias, acusações ou resultados oficiais sobre qualquer pessoa ou legenda real. Os cálculos legislativos, eleitorais e econômicos são aproximações didáticas, não simulador jurídico completo.

## O que está implementado

- **7 cargos:** presidente, governador, senador, deputado federal, deputado estadual/distrital, prefeito e vereador.
- **Estados e municípios:** 26 estados e DF; mapa interativo cartográfico esquemático offline e opção de malha geográfica online.
- **Campanhas:** 24 semanas, orçamento, reputação, imprensa, organização territorial, arrecadação e propaganda.
- **Partidos:** siglas reais identificadas por seus nomes; atributos internos fictícios, convenção, organização, auditoria, disputa de liderança, formação de quadros e criação de partido *fictício* com nome escolhido.
- **Adversários:** rotinas simuladas de publicidade, visitas, alianças e movimentações de recursos. Atributos internos **não** reproduzem avaliações reais de políticos.
- **Debates:** perguntas por campanha, resposta, réplica e tréplica, consequências contextuais, agenda de debates e salvamento no meio do evento.
- **Eleitorado:** seis grupos agregados por prioridades públicas fictícias; confiança e engajamento variam com políticas e repercutem no apoio regional de novas rodadas.
- **Apuração:** das 17h às 00h, avanço manual, votos por candidatura, porcentagens, brancos, nulos, abstenções, comparecimento e boletins fictícios. No pleito presidencial há quadro de avanço por UF. O resultado é gerado uma única vez por eleição, então avançar ou recarregar não muda o resultado final.
- **Mandato:** ações distintas para Executivo e Legislativo, política econômica, serviços públicos, projetos, votações, articulação parlamentar e crises simuladas.
- **Gabinete e Congresso:** escolha entre assessores e secretários inventados, audiências, fiscalização, orçamento e série temporal de aprovação.
- **Carreira:** disputar outro cargo/estado, mudar de partido e levar reputação acumulada e histórico para eleições futuras.
- **Corrupção e integridade:** eventos fictícios com fiscalização, riscos, investigação e consequência. Não são acusações a partidos ou personalidades reais.
- **Dados:** salvamento automático local, backup JSON, migração de salvamentos antigos e cinco espaços de carreira no mesmo navegador.
- **Contas e nuvem opcionais:** backend Node/PostgreSQL incluído na pasta `cloud-server`, com login, 5 carreiras por conta, envio e restauração manual. Exige outro serviço e banco PostgreSQL configurados no Render; não está hospedado automaticamente.

## Como atualizar o site que já funciona no Render

1. Na partida atual, clique em **Baixar backup** e guarde o arquivo JSON.
2. Extraia este ZIP.
3. Envie `index.html`, `app.js`, `styles.css`, `render.yaml` e `README.md` **diretamente à raiz** do repositório `freitadas/politica-realista`, sobrescrevendo os anteriores. A pasta `cloud-server` é opcional; pode ser enviada para guardar o código do backend.
4. Faça commit na branch `main`.
5. No Render, mantenha **Static Site**, Build Command `echo "Static site ready"` e Publish Directory `.`. Caso o Auto-Deploy esteja desativado, execute **Manual Deploy → Deploy latest commit**.
6. Abra o site, teste o carregamento da carreira anterior e confira o botão **Carreiras** ou a aba **Salvamentos**.

**O jogo principal não necessita de instalação de dependências ou de backend.** É um aplicativo estático.

## Habilitar salvamento online entre dispositivos (opcional)

1. Crie um PostgreSQL no Render.
2. Crie um **segundo serviço**, do tipo Web Service / Node, com `Root Directory = cloud-server`, `Build Command = npm install --omit=dev` e `Start Command = npm start`.
3. Configure as variáveis `DATABASE_URL` (URL interna PostgreSQL), `JWT_SECRET` (segredo aleatório longo, 32 ou mais caracteres) e `CLIENT_ORIGIN` (domínio HTTPS exato do site estático, sem barra final).
4. O endpoint `https://SEU-BACKEND.onrender.com/api/health` deve retornar `ok: true`.
5. No jogo, em **Salvamentos**, cole a URL HTTPS do backend, crie uma conta, entre, escolha **Salvar na nuvem** e posteriormente **Ver carreiras na nuvem / Restaurar**.

Provisionamento, custos de serviço, credenciais e administração do banco dependem da sua conta Render. O backend não foi implantado nem validado contra um PostgreSQL externo nesta entrega. Leia `cloud-server/README.md`.

## Testes efetuados

- `node --check app.js` e `node --check cloud-server/server.js` sem erros de sintaxe.
- Chromium: criar campanha, indicador de eleitorado, liderança partidária, espaço de salvamento local, debate com resposta/réplica/tréplica e retomada, apuração, posse, nomeação de assessor, ação parlamentar, nova candidatura em outro estado e largura de 375 px.
- Simulações do motor: 35 eleições em 7 cargos, derrota e segundo turno, consistência da soma de votos por hora, brancos/nulos/abstenções.
- Não houve teste de carga do backend, revisão de acessibilidade integral ou teste público do deploy no Render.

## Estrutura

```
index.html
styles.css
app.js
render.yaml
README.md
cloud-server/
  server.js
  package.json
  render-cloud.yaml
  README.md
```

O arquivo `render-cloud.yaml` é um exemplo de configuração do segundo serviço, e **não** substitui o `render.yaml` do Static Site.
