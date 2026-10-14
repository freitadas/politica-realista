# Mandato v8 — Carreira, eleições e governo (simulação brasileira)

**Jogo de navegador estático (HTML, CSS e JavaScript).** Não utiliza backend, não exige instalação e pode ser publicado em um Static Site do Render.

## Mudanças em relação à v6

- Correção de apuração: o percentual de derrota sempre pertence ao jogador, não ao candidato que ficou em primeiro lugar.
- Segundo turno: presidente, governador e prefeito de município **com mais de 200 mil eleitores** (eleitorado informado pelo jogador para a simulação). Senado e municípios de até 200 mil eleitores têm turno único.
- Senado: simulação com duas vagas no ciclo 2026 e uma no ciclo 2030, alternando a cada quatro anos. Mandato simulado de 96 meses.
- Cargos proporcionais: substituição da regra errada de 15% por distribuição didática com quociente eleitoral, quociente partidário, listas nominais e sobras por médias. Todos os votos, cadeiras municipais, listas e quocientes são gerados na partida — **não são uma apuração oficial nem reproduzem todas as exceções legais**.
- 27 unidades federativas: os pesos fictícios são normalizados para aproximadamente 100%. Mapa clicável de regiões. Usa cartograma esquemático offline; quando o navegador consegue carregar GeoJSON público CC0, apresenta os limites geográficos estaduais.
- Campanha: os adversários agora praticam ações semanais simuladas com despesas próprias; painel de atividades na aba Mídia.
- Partido: organização, coesão, controle de contas e formação de quadros (atributos totalmente fictícios). Possibilidade de organizar diretórios, convenção e auditoria interna na aba Alianças. Mudança de legenda ao iniciar outra candidatura.
- Debate: quatro perguntas por debate, com escolha de respostas e **réplica para cada pergunta**; impactos dependem de preparação, temas, orientação escolhida e aleatoriedade. Salva tanto a resposta quanto a fase de réplica.
- Exercício do mandato: ações diferentes por esfera e Poder. Chefes do Executivo administram políticas públicas; parlamentares propõem leis, participam de votação e fiscalização, sem usar diretamente orçamento do Executivo.
- Carreira: calendário de eleições simuladas (ciclos gerais 2026/2030 etc. e municipais 2028/2032 etc.), histórico de eleições e mandatos, candidatura em outro estado ou cargo. Mudança de cargo durante mandato executivo exibe advertência sobre renúncia simulada; regras reais de filiação, prazos e desincompatibilização não são modeladas integralmente.
- Salvar/carregar: preserva recursos, debates, eventos políticos pendentes, histórico e decisões; aceita saves legados v5/v6, com migração. Backup JSON pode ser exportado e importado manualmente.
- Render: `render.yaml` corrigido para `staticPublishPath: .` (arquivos na raiz).

## Publicar no GitHub e Render

1. Extraia o ZIP e envie **todos os arquivos diretamente à raiz** do repositório `freitadas/politica-realista`, substituindo os anteriores. Não envie a pasta que contém os arquivos.
2. Faça commit na branch `main`.
3. Mantenha no Render: **Static Site**, Branch `main`, **Build Command** `echo "Static site ready"` e **Publish Directory** `.`.
4. Caso Auto-Deploy não esteja ativo, selecione **Manual Deploy → Deploy latest commit**.
5. Se um salvamento anterior estiver neste mesmo navegador e endereço, use **Continuar campanha**. Como segurança, **Baixar backup** antes de atualizações maiores.

## Arquivos

- `index.html` — interface e abas.
- `styles.css` — aparência, layout e dispositivos móveis.
- `app.js` — motor da simulação, eleições, carreiras, debates, armazenamento.
- `render.yaml` — implantação estática.
- `.gitignore` — exclusões.
- `README.md` — documentação.

## Resultados dos testes

A base v7 passou por 17 cenários principais e verificações adicionais (partidos, migração da v6, pesos estaduais e largura de celular) em Chromium automatizado, sem erros JavaScript na página: prefeito sem/com segundo turno, derrota no primeiro turno, três eleições proporcionais, Senado, mandato legislativo, carreira entre estados/partidos, debate com réplica salvo/carregado, evento pendente salvo/carregado, e botão de salvamento no celular. Verificação de sintaxe JS, ausência de IDs HTML duplicados e integridade do ZIP realizadas à parte.

## Fontes normativas para o desenho das regras

- Tribunal Superior Eleitoral — Sistema majoritário: https://www.tse.jus.br/comunicacao/noticias/2026/Junho/sabe-o-que-e-o-sistema-eleitoral-majoritario-o-glossario-explica-1
- Tribunal Superior Eleitoral — Quocientes e distribuição proporcional: https://www.tse.jus.br/comunicacao/noticias/2024/Marco/quocientes-eleitoral-e-partidario-entenda-como-um-candidato-a-vereador-e-eleito
- TSE — Resolução 23.677/2021, compilada e atualizada: https://www.tse.jus.br/legislacao/compilada/res/2021/resolucao-no-23-677-de-16-de-dezembro-de-2021
- Lei Complementar 64/1990 (e alterações), prazos de renúncia: https://www.tse.jus.br/legislacao/compilada/lei/complementar/lei-complementar-no-64-de-18-de-maio-de-1990
- Malha estadual GeoJSON (CC0), origem IBGE: https://github.com/henriquemalvar/br-geojson

## Limitações importantes

Os nomes dos partidos e de algumas pessoas públicas são reais, mas **nada que ocorre no jogo representa fatos reais**: pesquisas, adversários, desempenhos, corrupção, investigações, eleições e orçamento são inteiramente fictícios. Os atributos partidários são parâmetros inventados de gameplay, não avaliações das legendas.

O sistema proporcional é uma aproximação com votos inventados e não cobre integralmente quóruns, federações, inelegibilidades, sobras, faixas de votação e demais particularidades. A distribuição de cadeiras municipais é arbitrária na simulação, não reflete automaticamente os limites legais exatos de cada município. O calendário de carreira é simplificado; executar mandatos ou se candidatar novamente não equivale a observar a legislação real de desincompatibilização. Os indicadores de gestão são abstratos.

O jogo **não possui contas, sincronização em nuvem nem banco de dados**. O progresso é armazenado por navegador e origem (`localStorage`); o arquivo JSON é o meio de transferir o progresso para outro dispositivo. O mapa geográfico verdadeiro depende de carregamento externo; quando não disponível, o cartograma esquemático funciona offline.


## Novidade da versão 8 — Apuração eleitoral, 17h–00h

- Inicia automaticamente quando termina a campanha e a eleição ocorre (inclusive segundo turno).
- Aba **Apuração eleitoral** com horários 17h, 18h, 19h, 20h, 21h, 22h, 23h e 00h; cada horário avança com um clique.
- Apresenta eleitores aptos, comparecimento apurado, votos válidos, votos individuais por candidato, percentuais dos votos válidos, brancos, nulos e, às 00h, abstenções definitivas.
- Antes do fim, o campo "Ainda não apurados ou ausentes" **não** é chamado de abstenção, pois inclui votos ainda não processados.
- Salva os totais finais e a distribuição de cada hora, sem recálculo ao recarregar; permite continuar a apuração após fechar a página.
- Arquiva as apurações anteriores, que podem ser vistas na aba, e integra os resultados às carreiras, eleições majoritárias, Senado e eleições proporcionais simuladas.
- Nas eleições proporcionais, os votos nominais e o quociente partidário usam a mesma base simulada de votos válidos; nos anos em que se disputam duas vagas no Senado, cada eleitor tem duas opções de voto na simulação.
- Todos os números e horários são **fictícios**, para o jogo. Não são resultados oficiais nem estimativas sobre eleições reais.


### Testes específicos da v8

- 35 simulações do motor de apuração, cinco para cada cargo, incluindo conservação de votos por horário, início às 17h e encerramento às 00h.
- Simulações adicionais de vitória, derrota e segundo turno.
- Teste real em Chromium com primeiro e segundo turno, visualização de históricos e seletor de eleições anteriores.
- Teste visual de tela mobile com viewport de 375 px; nenhum erro JavaScript observado nos fluxos testados.
