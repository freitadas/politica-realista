from pathlib import Path
p=Path(__file__).resolve().parents[1]
jsfile=p/'app.js'; js=jsfile.read_text(encoding='utf8')

def replace_once(a,b,tag):
 global js
 if js.count(a)!=1:raise AssertionError(f'{tag}: expected 1 occurrence, got {js.count(a)}')
 js=js.replace(a,b,1)

anchor='''  const rosterKey=(office,uf,city)=>`${String(uf||"ES").toUpperCase()}|${normalizeElectoralName(city||"")}|${office}`;'''
replace_once(anchor,'''  const CANDIDATE_DATA_ROOT = "rosters";
  const loadedNationalRosters = new Map();
  let rosterLoadError = "";
  let tallyRowsVisible = 30;
  let tallySearchTerm = "";
  const rosterKey=(office,uf,city)=>`${String(uf||"ES").toUpperCase()}|${normalizeElectoralName(city||"")}|${office}`;''','candidate cache')
anchor='''  function historicalRegistry(office,uf,city){
    const id=rosterKey(office,uf,city);
    // Imported TSE CSV overrides the bundled historical snapshots for the same district.
    try{
      const stored=localStorage.getItem(`mandato_tse_roster_${id}`);
      if(stored){const data=JSON.parse(stored);if(data?.members?.length)return data;}
    }catch(err){console.warn("Cadastro eleitoral local indisponível",err);}
    return window.MANDATO_CANDIDATOS_HISTORICOS?.[id]||null;
  }'''
replacement='''  function historicalRegistry(office,uf,city){
    const id=rosterKey(office,uf,city);
    // Imported official CSV overrides any pre-built historical roster for the same district.
    try{
      const stored=localStorage.getItem(`mandato_tse_roster_${id}`);
      if(stored){const data=JSON.parse(stored);if(data?.members?.length)return data;}
    }catch(err){console.warn("Cadastro eleitoral local indisponível",err);}
    return loadedNationalRosters.get(id) || window.MANDATO_CANDIDATOS_HISTORICOS?.[id] || null;
  }
  function rosterAssetPath(office,uf,city){
    if(office==="presidente")return `${CANDIDATE_DATA_ROOT}/2026/BR.json`;
    if(office==="vereador"||office==="prefeito"){
      const code=normalizeElectoralName(city).replace(/[^A-Z0-9]+/g,"-").replace(/^-|-$/g,"");
      return `${CANDIDATE_DATA_ROOT}/2024/${String(uf).toUpperCase()}/${code}.json`;
    }
    return `${CANDIDATE_DATA_ROOT}/2026/${String(uf).toUpperCase()}.json`;
  }
  async function ensureNationalRoster(office,uf,city){
    if(historicalRegistry(office,uf,city)?.members?.length)return true;
    const path=rosterAssetPath(office,uf,city);
    const id=rosterKey(office,uf,city);
    try {
      const controller=new AbortController();
      const timeout=setTimeout(()=>controller.abort(),18000);
      let response;
      try{response=await fetch(new URL(path,document.baseURI),{signal:controller.signal,cache:"force-cache"});}
      finally{clearTimeout(timeout);}
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const source=await response.json();
      const data=source.offices?.[office];
      if(!Array.isArray(data) || data.length<2)throw new Error(`Sem candidatos suficientes no arquivo ${path}`);
      const members=data.filter(v=>Array.isArray(v)&&v[0]&&v[1]).map(([name,party])=>({name,party}));
      if(members.length<2)throw new Error(`Cadastro insuficiente: ${path}`);
      loadedNationalRosters.set(id,{members,year:source.year,source:source.source,sourceLabel:source.sourceLabel||"Dados Abertos do TSE"});
      rosterLoadError="";
      return true;
    } catch(err){
      rosterLoadError=`Não encontrei o cadastro TSE (${office}, ${uf}${city?", "+city:""}): ${err.message}. Gere as bases nacionais durante a publicação no Render ou importe o CSV oficial para esta eleição.`;
      console.warn(rosterLoadError);
      return false;
    }
  }
  async function requireNationalRoster(office,uf,city){
    if(await ensureNationalRoster(office,uf,city))return true;
    alert(rosterLoadError);
    return false;
  }'''
replace_once(anchor,replacement,'registry')
anchor='''  function historicOpponents(office,uf,city,player){
    if(office==="presidente")return opponents.map(o=>({...o}));
    const roster=historicalRegistry(office,uf,city);
    if(roster && roster.members.length){
      return roster.members.filter(r=>normalizeElectoralName(r.name)!==normalizeElectoralName(player))
        .slice(0,office==="prefeito"?6:8).map((r,i)=>({id:`hist${i}`,name:r.name,party:r.party,poll:[30.5,26.2,12.4,8,6,5,4,3][i]}));
    }
    // A campanha pode funcionar sem cadastro, mas não inventa vínculo de pessoa real a uma legenda.
    return fictionalRivals.map((o,i)=>({id:`anon${i}`,name:`Oponente simulado ${i+1}`,party:o.party,poll:o.poll}));
  }'''
replacement='''  function historicOpponents(office,uf,city,player){
    const roster=historicalRegistry(office,uf,city);
    if(!roster?.members?.length)return [];
    // Fixed-size AI opponents for campaign performance. The apuração uses all registered names.
    return roster.members.filter(r=>normalizeElectoralName(r.name)!==normalizeElectoralName(player))
      .slice(0,office==="prefeito"?6:8).map((r,i)=>({id:`hist${i}`,name:r.name,party:r.party,poll:[30.5,26.2,12.4,8,6,5,4,3][i]}));
  }'''
replace_once(anchor,replacement,'opponents')
replace_once('''    const partyIds=[playerParty,...[...grouped.entries()].filter(([p])=>p!==playerParty).sort((a,b)=>b[1].length-a[1].length).map(([p])=>p)].slice(0,registry?12:9);''','''    const partyIds=[playerParty,...[...grouped.entries()].filter(([p])=>p!==playerParty).sort((a,b)=>b[1].length-a[1].length).map(([p])=>p)];''','all parties')
replace_once('''  function startGame() {
    if(localProfileList().length>=5)return showToast("Cinco carreiras já salvas. Exclua uma antes de iniciar outra.");''','''  async function startGame() {
    if(localProfileList().length>=5)return showToast("Cinco carreiras já salvas. Exclua uma antes de iniciar outra.");''','async game')
replace_once('''    state = newState();
    previousNational = nationalSupport();''','''    if(!await requireNationalRoster(selectedOffice(),$("stateChoice").value,$("cityChoice").value.trim()))return;
    state = newState();
    previousNational = nationalSupport();''','new game preload')
replace_once('''  function startNextCampaign() {''','''  async function startNextCampaign() {''','async campaign')
replace_once('''    if ((draft.office==="prefeito"||draft.office==="vereador") && (!Number.isInteger(Number(draft.electorate))||Number(draft.electorate)<1000)) return showToast("Informe um eleitorado municipal simulado válido");''','''    if ((draft.office==="prefeito"||draft.office==="vereador") && (!Number.isInteger(Number(draft.electorate))||Number(draft.electorate)<1000)) return showToast("Informe um eleitorado municipal simulado válido");
    if(!await requireNationalRoster(draft.office,draft.uf,city))return;''','campaign preload')
replace_once('''  function startApuracao(round){
    if(state.apuracao && state.phase==="counting"){navTo("apuracao");return;}''','''  async function startApuracao(round){
    if(state.apuracao && state.phase==="counting"){navTo("apuracao");return;}
    if(!await requireNationalRoster(state.office,state.stateUF,state.municipality))return;
    tallySearchTerm="";tallyRowsVisible=30;''','election guard')
# update restart apuracao for saved games
replace_once('''  function restartApuracaoWithRealNames(){
    if(!state||state.phase!=='counting'||!state.apuracao)return;
    const old=state.apuracao,reg=officeRegistry();''','''  async function restartApuracaoWithRealNames(){
    if(!state||state.phase!=='counting'||!state.apuracao)return;
    if(!await requireNationalRoster(state.office,state.stateUF,state.municipality))return;
    const old=state.apuracao,reg=officeRegistry();''','restart preload')
# save loading will refresh opponents on reload before game UI, but keep previous games stable for counting
replace_once('''  function renderApuracao(){''','''  function searchTally(value){
    tallySearchTerm=value;
    tallyRowsVisible=30;
    renderApuracao();
    const input=$("tallySearch");
    if(input){input.focus();input.setSelectionRange(input.value.length,input.value.length);}
  }
  function moreTallyRows(){tallyRowsVisible+=50;renderApuracao();}
  function renderApuracao(){''','search action')
old='''    const list=totalVotes.map((c,i)=>`<div class="count-candidate ${c.name===state.candidate?'mine':''}"><div class="count-label"><span><strong>${safeText(c.name)}</strong><small>${safeText(c.party)}${c.name===state.candidate?' · Você':''}</small></span><span><strong>${fmtVotes(c.votes)} votos</strong><small>${c.share.toFixed(2).replace('.',',')}% válidos</small></span></div><div class="poll-track"><div class="poll-fill" style="width:${clamp(c.share,0,100)}%"></div></div></div>`).join("");'''
new='''    const filteredVotes=totalVotes.filter(c=>!tallySearchTerm || normalizeElectoralName(c.name+" "+c.party).includes(normalizeElectoralName(tallySearchTerm)));
    const list=filteredVotes.slice(0,tallyRowsVisible).map((c,i)=>`<div class="count-candidate ${c.name===state.candidate?'mine':''}"><div class="count-label"><span><strong>${safeText(c.name)}</strong><small>${safeText(c.party)}${c.name===state.candidate?' · Você':''}</small></span><span><strong>${fmtVotes(c.votes)} votos</strong><small>${c.share.toFixed(2).replace('.',',')}% válidos</small></span></div><div class="poll-track"><div class="poll-fill" style="width:${clamp(c.share,0,100)}%"></div></div></div>`).join("");'''
replace_once(old,new,'tally list')
old='''<h3>Votação por candidato</h3></div><span class="badge">${totalVotes.length} candidaturas simuladas</span></div><div class="count-list">${list}</div></div>'''
new='''<h3>Votação por candidato</h3></div><span class="badge">${totalVotes.length} candidaturas históricas + jogador</span></div><label style="margin:12px 0"><span>Buscar nome ou partido</span><input id="tallySearch" placeholder="Pesquisar no placar..." value="${safeText(tallySearchTerm)}" oninput="window.__game.searchTally(this.value)" /></label><p class="muted-text">Exibindo ${Math.min(filteredVotes.length,tallyRowsVisible)} de ${filteredVotes.length} candidatos encontrados.</p><div class="count-list">${list}</div>${filteredVotes.length>tallyRowsVisible?`<button type="button" class="btn btn-ghost full" onclick="window.__game.moreTallyRows()">Mostrar mais 50 candidatos</button>`:''}</div>'''
replace_once(old,new,'tally UI')
replace_once('''    cloudAction,importRosterClick,restartApuracaoWithRealNames''','''    cloudAction,importRosterClick,restartApuracaoWithRealNames,searchTally,moreTallyRows''','exposed controls')
# Update info in setup / apuracao
js=js.replace('''`Sem cadastro histórico deste cargo e localidade. Importe um CSV oficial em ${TSE_CSV_HELP} para usar nomes reais.`;''','''`Cadastro TSE ainda não carregado. A publicação precisa gerar o diretório rosters a partir do TSE, ou você pode importar um CSV oficial em ${TSE_CSV_HELP}.`;''')
jsfile.write_text(js,encoding='utf8')

htmlfile=p/'index.html';html=htmlfile.read_text(encoding='utf8')
html=html.replace('Mandato v13 — Simulador Político','Mandato v14 — Simulador Político').replace('Mandato <span class="v9-tag">v13</span>','Mandato <span class="v9-tag">v14</span>')
html=html.replace('Vitória e Vila Velha (ES) possuem cadastros históricos de 2024. Para outras localidades, é possível importar dados de candidaturas.','Nomes históricos são carregados por município e estado a partir dos arquivos oficiais de 2024 e 2026. Se ainda não foram publicados, importe CSV do TSE.')
html=html.replace('Simulação de história alternativa: votos, resultados e eventos são fictícios. Nomes de figuras públicas podem ser históricos e não indicam candidaturas atuais.','Simulação de história alternativa: nomes e partidos correspondem à eleição histórica de origem, mas votos e acontecimentos são fictícios. Não representam candidaturas atuais ou futuras.')
htmlfile.write_text(html,encoding='utf8')

renderfile=p/'render.yaml'; cfg=renderfile.read_text(encoding='utf8');cfg=cfg.replace('buildCommand: echo "Static site ready"','buildCommand: python3 scripts/build_rosters.py');renderfile.write_text(cfg,encoding='utf8')
