(() => {
  const $ = (id) => document.getElementById(id);
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const rnd = (min, max) => Math.random() * (max - min) + min;
  const round1 = (n) => Math.round(n * 10) / 10;
  const money = (n) => `R$ ${round1(n)} mi`;

  const baseRegions = [
    { id: "ac", name: "Acre", uf:"AC", voters:0.6, issue:"Infraestrutura", support:19, undecided:15, organization:14, media:0 },
    { id: "al", name: "Alagoas", uf:"AL", voters:2.0, issue:"Saúde", support:26, undecided:18, organization:19, media:0 },
    { id: "ap", name: "Amapá", uf:"AP", voters:0.5, issue:"Infraestrutura", support:24, undecided:21, organization:24, media:0 },
    { id: "am", name: "Amazonas", uf:"AM", voters:2.6, issue:"Infraestrutura", support:22, undecided:17, organization:15, media:0 },
    { id: "ba", name: "Bahia", uf:"BA", voters:7.7, issue:"Emprego e renda", support:20, undecided:20, organization:20, media:0 },
    { id: "ce", name: "Ceará", uf:"CE", voters:4.9, issue:"Saúde", support:27, undecided:16, organization:25, media:0 },
    { id: "df", name: "Distrito Federal", uf:"DF", voters:1.7, issue:"Segurança pública", support:25, undecided:19, organization:16, media:0 },
    { id: "es", name: "Espírito Santo", uf:"ES", voters:2.3, issue:"Segurança pública", support:23, undecided:15, organization:21, media:0 },
    { id: "go", name: "Goiás", uf:"GO", voters:4.0, issue:"Custo de vida", support:21, undecided:18, organization:26, media:0 },
    { id: "ma", name: "Maranhão", uf:"MA", voters:3.7, issue:"Emprego e renda", support:19, undecided:21, organization:17, media:0 },
    { id: "mt", name: "Mato Grosso", uf:"MT", voters:2.1, issue:"Infraestrutura", support:26, undecided:17, organization:22, media:0 },
    { id: "ms", name: "Mato Grosso do Sul", uf:"MS", voters:1.6, issue:"Custo de vida", support:24, undecided:20, organization:27, media:0 },
    { id: "mg", name: "Minas Gerais", uf:"MG", voters:11.3, issue:"Emprego e renda", support:22, undecided:16, organization:18, media:0 },
    { id: "pa", name: "Pará", uf:"PA", voters:4.4, issue:"Infraestrutura", support:20, undecided:19, organization:23, media:0 },
    { id: "pb", name: "Paraíba", uf:"PB", voters:2.4, issue:"Saúde", support:27, undecided:15, organization:14, media:0 },
    { id: "pr", name: "Paraná", uf:"PR", voters:6.3, issue:"Emprego e renda", support:25, undecided:18, organization:19, media:0 },
    { id: "pe", name: "Pernambuco", uf:"PE", voters:5.1, issue:"Saúde", support:23, undecided:21, organization:24, media:0 },
    { id: "pi", name: "Piauí", uf:"PI", voters:1.9, issue:"Saúde", support:21, undecided:17, organization:15, media:0 },
    { id: "rj", name: "Rio de Janeiro", uf:"RJ", voters:9.0, issue:"Segurança pública", support:19, undecided:20, organization:20, media:0 },
    { id: "rn", name: "Rio Grande do Norte", uf:"RN", voters:2.0, issue:"Saúde", support:26, undecided:16, organization:25, media:0 },
    { id: "rs", name: "Rio Grande do Sul", uf:"RS", voters:6.1, issue:"Custo de vida", support:24, undecided:19, organization:16, media:0 },
    { id: "ro", name: "Rondônia", uf:"RO", voters:0.9, issue:"Infraestrutura", support:22, undecided:15, organization:21, media:0 },
    { id: "rr", name: "Roraima", uf:"RR", voters:0.4, issue:"Infraestrutura", support:20, undecided:18, organization:26, media:0 },
    { id: "sc", name: "Santa Catarina", uf:"SC", voters:4.4, issue:"Emprego e renda", support:27, undecided:21, organization:17, media:0 },
    { id: "sp", name: "São Paulo", uf:"SP", voters:23.8, issue:"Emprego e renda", support:25, undecided:17, organization:22, media:0 },
    { id: "se", name: "Sergipe", uf:"SE", voters:1.2, issue:"Saúde", support:23, undecided:20, organization:27, media:0 },
    { id: "to", name: "Tocantins", uf:"TO", voters:0.9, issue:"Infraestrutura", support:21, undecided:16, organization:18, media:0 },
  ];

  // Synthetic weighting only: the source numbers are invented and normalized to 100.
  const simulatedWeightTotal = baseRegions.reduce((sum, r) => sum + r.voters, 0);
  baseRegions.forEach(r => r.voters = Math.round(r.voters / simulatedWeightTotal * 10000) / 100);

  const officeNames = {presidente:"Presidente da República",governador:"Governador",senador:"Senador",deputado_federal:"Deputado federal",deputado_estadual:"Deputado estadual / distrital",prefeito:"Prefeito",vereador:"Vereador"};
  const executiveOffices = new Set(["presidente","governador","prefeito"]);
  const legislativeOffices = new Set(["senador","deputado_federal","deputado_estadual","vereador"]);
  const citiesByState = {ES:"Vitória",SP:"São Paulo",RJ:"Rio de Janeiro",MG:"Belo Horizonte",BA:"Salvador",PR:"Curitiba",RS:"Porto Alegre",SC:"Florianópolis",DF:"Brasília",GO:"Goiânia",PE:"Recife",CE:"Fortaleza",AM:"Manaus",PA:"Belém",MA:"São Luís",PB:"João Pessoa",RN:"Natal",AL:"Maceió",SE:"Aracaju",PI:"Teresina",MT:"Cuiabá",MS:"Campo Grande",RO:"Porto Velho",RR:"Boa Vista",AP:"Macapá",AC:"Rio Branco",TO:"Palmas"};
  const nextElectionYear = (office, afterYear=2025) => {
    const first = office === "prefeito" || office === "vereador" ? 2028 : 2026;
    return first > afterYear ? first : first + 4 * (Math.floor((afterYear-first)/4)+1);
  };
  const fictionalRivals = [
    {id:"local1",name:"Marina Duarte",party:"MDB",poll:30.5},
    {id:"local2",name:"Eduardo Campos Filho",party:"PSD",poll:26.2},
    {id:"local3",name:"Clara Monteiro",party:"PL",poll:12.4}
  ];
  function selectedOffice(){return $("officeChoice").value;}
  function selectedLocation(office=selectedOffice()){
    if(office==="presidente")return "Brasil";
    if(office==="prefeito"||office==="vereador")return ($("cityChoice").value.trim()||citiesByState[$("stateChoice").value]||"Município")+" / "+$("stateChoice").value;
    return $("stateChoice").value;
  }
  function electionDistricts(office,uf,city){
    if(office==="presidente")return baseRegions.map(r=>({...r}));
    const original=baseRegions.find(r=>r.uf===uf)||baseRegions[0];
    if(office==="prefeito"||office==="vereador")return ["Centro","Zona Norte","Zona Sul","Zona Leste","Zona Oeste"].map((zone,i)=>({...original,id:"mun"+i,name:zone+" — "+city,uf,voters:20,support:clamp(original.support+[-1,1,2,-2,0][i],8,50),organization:18+i}));
    return ["Capital e região metropolitana","Interior urbano","Interior rural","Região norte","Região sul"].map((zone,i)=>({...original,id:"est"+i,name:zone+" — "+original.name,uf,voters:[36,22,18,12,12][i],support:clamp(original.support+[2,-1,-2,1,0][i],8,50),organization:18+i}));
  }
  const opponents = [
    { id: "lula", name: "Luiz Inácio Lula da Silva", party: "PT", poll: 30.5 },
    { id: "flavio", name: "Flávio Bolsonaro", party: "PL", poll: 26.2 },
    { id: "caiado", name: "Ronaldo Caiado", party: "PSD", poll: 12.4 }
  ];

  // Fictional party-management attributes. No real party is being assessed or ranked.
  function newPartyProfile(label){
    const seed=[...String(label||"Partido")].reduce((a,ch)=>((a*33+ch.charCodeAt(0))>>>0),17);
    return {organization:42+seed%25,cohesion:45+(seed>>>4)%28,compliance:46+(seed>>>9)%25,
      development:32+(seed>>>13)%25};
  }
  const ideologyEffects = {
    centro: { rep: 2, funds: 1.5, media: 1 },
    social: { rep: 1, funds: 0, media: 0 },
    liberal: { rep: 0, funds: 3, media: 0 },
    verde: { rep: 2, funds: -0.5, media: 2 },
    conservador: { rep: 1, funds: 1, media: -1 }
  };

  const issues = [
    { name: "Custo de vida", weight: 28 },
    { name: "Emprego e renda", weight: 24 },
    { name: "Segurança pública", weight: 20 },
    { name: "Saúde", weight: 16 },
    { name: "Infraestrutura", weight: 12 }
  ];

  const actionDefs = [
    {
      id: "rally",
      title: "Grande comício",
      desc: "Mobiliza base e gera cobertura local. Melhor em regiões onde sua organização já existe.",
      cost: 1.4, tag: "território",
      run: (s) => {
        const r = chooseRegion();
        if (!r) return false;
        const gain = rnd(0.5, 1.4) + r.organization / 100;
        r.support = clamp(r.support + gain, 5, 60);
        r.organization = clamp(r.organization + rnd(2, 5), 0, 100);
        s.reputation = clamp(s.reputation + rnd(-0.5, 1.2), 0, 100);
        addNews(`Comício em ${r.name}`, `A campanha mobilizou apoiadores e reforçou presença territorial.`);
        return true;
      }
    },
    {
      id: "fundraise",
      title: "Rodada de arrecadação",
      desc: "Reúne doadores e amplia o caixa, com pequeno custo reputacional se usado em excesso.",
      cost: 0, tag: "finanças",
      run: (s) => {
        const raised = rnd(2.2, 4.8);
        s.funds += raised;
        s.reputation = clamp(s.reputation - rnd(0, 0.7), 0, 100);
        addNews("Campanha reforça caixa", `Evento de arrecadação captou ${money(raised)}.`);
        return true;
      }
    },
    {
      id: "digital",
      title: "Campanha digital",
      desc: "Aumenta alcance, engajamento e intenção de voto entre indecisos, com risco de saturação.",
      cost: 0.9, tag: "comunicação",
      run: (s) => {
        s.digital = clamp(s.digital + rnd(4, 8), 0, 100);
        s.media = clamp(s.media + rnd(0.3, 1.3), -50, 50);
        s.regions.forEach(r => r.support = clamp(r.support + rnd(0.1, 0.6), 5, 60));
        addNews("Ofensiva digital", "Novas peças de campanha aumentaram o alcance nas redes.");
        return true;
      }
    },
    {
      id: "tv",
      title: "Publicidade em TV",
      desc: "Compra exposição nacional. Cara, mas eficiente quando sua reputação está alta.",
      cost: 3.2, tag: "mídia",
      run: (s) => {
        const bonus = s.reputation > 55 ? 0.8 : 0.35;
        s.regions.forEach(r => r.support = clamp(r.support + rnd(0.2, 0.7) + bonus * .25, 5, 60));
        s.media = clamp(s.media + rnd(0.6, 1.8), -50, 50);
        addNews("Campanha entra em rede nacional", "Nova inserção de TV amplia reconhecimento do candidato.");
        return true;
      }
    },
    {
      id: "debate",
      title: "Preparação para debate",
      desc: "Reduz risco de desempenho ruim e aumenta sua capacidade de resposta a ataques.",
      cost: 0.5, tag: "debate",
      run: (s) => {
        s.debate = clamp(s.debate + rnd(7, 14), 0, 100);
        s.reputation = clamp(s.reputation + rnd(0.2, 0.9), 0, 100);
        addNews("Equipe fecha preparação", "A candidatura reservou a semana para treinamento de debate.");
        return true;
      }
    },
    {
      id: "press",
      title: "Entrevista longa",
      desc: "Pode melhorar a imagem de competência, mas uma resposta ruim gera manchetes negativas.",
      cost: 0, tag: "imprensa",
      run: (s) => {
        const score = rnd(0, 100) + s.reputation * .25 + s.debate * .2;
        if (score > 70) {
          s.media = clamp(s.media + rnd(2, 4), -50, 50);
          s.reputation = clamp(s.reputation + rnd(1, 2.5), 0, 100);
          addNews("Entrevista repercute bem", "Analistas destacaram respostas consistentes e domínio dos temas.");
        } else {
          s.media = clamp(s.media - rnd(1.5, 3.5), -50, 50);
          s.reputation = clamp(s.reputation - rnd(.5, 2), 0, 100);
          addNews("Entrevista gera ruído", "Trechos da conversa provocaram críticas e dominaram o noticiário.");
        }
        return true;
      }
    }
  ];

  const proposals = [
    {
      id: "tax",
      title: "Política tributária",
      text: "Defina a prioridade fiscal de sua candidatura.",
      options: [
        { id: "progressive", label: "Mais progressividade e desoneração da base", rep: 1, funds: -0.5, region: { leste: .8, centro: .3, sul: -.3 } },
        { id: "neutral", label: "Simplificação sem alterar carga total", rep: 1.3, funds: 0.2, region: { leste: .3, centro: .5, sul: .3 } },
        { id: "cuts", label: "Redução de impostos e gasto público", rep: -.4, funds: 1.4, region: { leste: -.2, centro: .2, sul: .9 } }
      ]
    },
    {
      id: "security",
      title: "Segurança pública",
      text: "Escolha a ênfase da política nacional de segurança.",
      options: [
        { id: "prevention", label: "Prevenção, inteligência e políticas sociais", rep: .8, funds: 0, region: { centro: .4, leste: .4 } },
        { id: "balanced", label: "Integração policial, inteligência e prevenção", rep: 1.4, funds: 0, region: { centro: .9, leste: .3, sul: .2 } },
        { id: "hardline", label: "Endurecimento penal e expansão policial", rep: -.3, funds: .3, region: { centro: 1.1, sul: .5, norte: -.2 } }
      ]
    },
    {
      id: "economy",
      title: "Estratégia econômica",
      text: "Determine o eixo central do plano econômico.",
      options: [
        { id: "industry", label: "Política industrial e investimento público", rep: .5, funds: -.6, region: { leste: 1, norte: .4 } },
        { id: "productivity", label: "Produtividade, infraestrutura e qualificação", rep: 1.5, funds: 0, region: { leste: .6, centro: .6, sul: .4 } },
        { id: "market", label: "Abertura, privatizações e ambiente de negócios", rep: -.2, funds: 1.5, region: { centro: .3, sul: .7, leste: -.2 } }
      ]
    }
  ];

  const coalitionDefs = [
    { id: "civic", name: "Rede Cívica Municipal", desc: "Prefeitos e lideranças locais. Amplia capilaridade no interior.", progress: 20, cost: 1.4, rep: 0.4, ground: 7 },
    { id: "labor", name: "Confederação do Trabalho", desc: "Apoio sindical moderado, relevante nos centros industriais.", progress: 12, cost: .8, rep: 0.2, ground: 5 },
    { id: "business", name: "Fórum Produtivo", desc: "Setores empresariais e associações econômicas.", progress: 18, cost: 0, rep: -0.3, ground: 2 },
    { id: "green", name: "Pacto Ambiental", desc: "Movimentos climáticos, pesquisadores e lideranças urbanas.", progress: 16, cost: .5, rep: 1.0, ground: 3 }
  ];

  const events = [
    {
      title: "Debate televisionado",
      text: "Os quatro principais candidatos participam do maior debate da campanha. Você precisa escolher a postura.",
      choices: [
        { label: "Atacar o líder", hint: "Maior ganho potencial, maior risco", effect: s => {
          const x = rnd(0,100) + s.debate * .5;
          if (x > 80) { s.media += 4; s.reputation += 2; shiftAll(s, .8); addNews("Ataque muda o debate", "Sua ofensiva colocou o favorito na defensiva."); }
          else { s.media -= 3; s.reputation -= 2.5; shiftAll(s, -.4); addNews("Ataque não funciona", "A postura agressiva foi criticada por comentaristas."); }
        }},
        { label: "Defender propostas", hint: "Estratégia segura e institucional", effect: s => {
          s.reputation += 2; s.media += 1; shiftAll(s, .35); addNews("Campanha aposta em propostas", "Desempenho estável reforçou a imagem de preparo.");
        }},
        { label: "Buscar confronto moderado", hint: "Equilíbrio entre risco e ganho", effect: s => {
          const x = rnd(0,100) + s.debate * .3;
          if (x > 55) { s.reputation += 1.5; s.media += 2; shiftAll(s, .5); }
          else { s.media -= 1; }
          addNews("Debate equilibrado", "A candidatura combinou contraste político e apresentação de programa.");
        }}
      ]
    },
    {
      title: "Acusação contra um aliado",
      text: "Um dirigente regional que declarou apoio à sua candidatura é citado em investigação financeira. Não há acusação contra você.",
      choices: [
        { label: "Romper imediatamente", hint: "+ reputação, - organização local", effect: s => {
          s.reputation += 3; s.ground -= 4; s.regions.forEach(r => r.organization -= 2);
          addNews("Campanha rompe com aliado", "A decisão foi vista como sinal de controle de danos.");
        }},
        { label: "Aguardar fatos", hint: "Menor custo imediato, risco de mídia", effect: s => {
          if (Math.random() < .5) { s.media -= 3; s.reputation -= 1.5; }
          else { s.media += .5; }
          addNews("Campanha pede cautela", "A equipe afirmou que aguardará informações oficiais.");
        }},
        { label: "Defender o aliado", hint: "Preserva base, aumenta risco reputacional", effect: s => {
          s.ground += 3; s.reputation -= 3; s.media -= 2;
          addNews("Candidato mantém apoio", "A decisão preserva alianças, mas aumenta pressão da imprensa.");
        }}
      ]
    },
    {
      title: "Choque no preço dos alimentos",
      text: "Uma alta inesperada nos preços domina a agenda econômica e muda a prioridade do eleitorado.",
      choices: [
        { label: "Propor pacote emergencial", hint: "Custo fiscal e ganho entre indecisos", effect: s => {
          s.reputation += 1.5; s.funds -= .4; s.regions.forEach(r => r.support += rnd(.2,.7));
          addNews("Pacote emergencial anunciado", "A campanha reage à inflação de alimentos com medidas temporárias.");
        }},
        { label: "Defender disciplina fiscal", hint: "Melhora confiança econômica, ganho menor imediato", effect: s => {
          s.reputation += .7; s.funds += .4; s.regions.forEach(r => r.support += rnd(-.1,.35));
          addNews("Campanha prega disciplina", "O plano enfatiza previsibilidade e controle de gastos.");
        }},
        { label: "Culpar o governo atual", hint: "Pode mobilizar oposição, mas eleva polarização", effect: s => {
          const gain = rnd(-.3,.8); shiftAll(s, gain); s.media += gain > 0 ? 1 : -1.5;
          addNews("Candidato responsabiliza governo", "A reação aumenta o tom da disputa econômica.");
        }}
      ]
    },
    {
      title: "Manifestação nacional",
      text: "Grandes atos de rua cobram melhoria nos serviços públicos e transparência.",
      choices: [
        { label: "Participar dos atos", hint: "Alta visibilidade, risco de apropriação", effect: s => {
          s.media += 2; s.reputation += rnd(-1,2.5); shiftAll(s, .25);
          addNews("Candidato aparece em manifestação", "Presença nas ruas gera forte repercussão.");
        }},
        { label: "Apoiar sem comparecer", hint: "Posição mais segura", effect: s => {
          s.reputation += 1.2; s.media += .4;
          addNews("Campanha apoia reivindicações", "Nota pública reconhece demandas sem participar dos atos.");
        }},
        { label: "Defender institucionalidade", hint: "Ganho de estabilidade, menor mobilização", effect: s => {
          s.reputation += .8; s.media -= .2;
          addNews("Candidato pede diálogo institucional", "Discurso prioriza negociação e continuidade democrática.");
        }}
      ]
    }
  ];

  let state = null;
  let previousNational = 0;

  function newState() {
    const diff = $("difficulty").value;
    const modifiers = diff === "expert" ? { funds: 11, support: -2, ai: .9 } :
                      diff === "hard" ? { funds: 13, support: -1, ai: .55 } :
                      { funds: 15, support: 0, ai: .35 };
    const ideology = $("ideology").value;
    const bonus = ideologyEffects[ideology];
    const partyProfile = newPartyProfile($("partyName").value);

    return {
      version: 7,
      phase: "campaign",
      office: selectedOffice(),
      stateUF: $("stateChoice").value,
      municipality: $("cityChoice").value.trim(),
      municipalityElectorate: Number($("electorateChoice").value) || 300000,
      rivalActivity: [],
      pendingEvent: null,
      lastElection: null,
      district: selectedLocation(),
      administration: null,
      electionHistory: [],
      careerHistory: [],
      careerDraft: null,
      campaignNumber: 1,
      electionYear: nextElectionYear(selectedOffice()),
      debateHistory: [],
      debateAvailable: null,
      pendingDebate: null,
      candidate: $("candidateName").value.trim() || "Alex Moreira",
      party: $("partyName").value.trim() || "Aliança Cívica",
      ideology,
      partyProfile,
      difficulty: diff,
      week: 24,
      energy: 3,
      maxEnergy: 3,
      funds: modifiers.funds + bonus.funds + (partyProfile.development-45)/35,
      reputation: 52 + bonus.rep,
      media: bonus.media,
      ground: clamp(19 + partyProfile.organization/9,20,38),
      digital: 20,
      debate: 35,
      scandal: 6,
      integrity: 65,
      corruptionRisk: 0,
      investigation: 0,
      illicitFunds: 0,
      ai: modifiers.ai,
      regions: electionDistricts(selectedOffice(), $("stateChoice").value, $("cityChoice").value.trim()).map(r => ({...r, support: r.support + modifiers.support})),
      opponents: (selectedOffice()==="presidente"? opponents: fictionalRivals).map((o,i) => ({...o, funds: 11 + i*2, activity:"Preparando a campanha"})),
      proposals: {},
      coalitions: coalitionDefs.map(c => ({...c, secured: false})),
      news: [
        { title: "Campanha oficialmente lançada", text: "Cenário alternativo: ações, pesquisas e acontecimentos políticos são simulados e não refletem fatos reais." },
        { title: "Eleitorado fragmentado", text: "Pesquisas mostram corrida aberta, com parcela relevante de indecisos." }
      ],
      turns: 0,
      finished: false
    };
  }

  function startGame() {
    if(["prefeito","vereador"].includes(selectedOffice())) {
      const elect=Number($("electorateChoice").value);
      if(!Number.isSafeInteger(elect)||elect<1000||elect>15000000)return showToast("Informe eleitorado simulado entre 1.000 e 15 milhões");
    }
    state = newState();
    previousNational = nationalSupport();
    $("setup").classList.add("hidden");
    $("game").classList.remove("hidden");
    renderAll();
    showToast("Campanha iniciada");
  }

  function nationalSupport() {
    if (!state) return 0;
    const total = state.regions.reduce((a,r) => a + r.voters, 0);
    return state.regions.reduce((a,r) => a + r.support * r.voters, 0) / total;
  }

  function shiftAll(s, amount) {
    s.regions.forEach(r => r.support = clamp(r.support + amount, 5, 60));
  }

  function addNews(title, text) {
    state.news.unshift({ title, text });
    state.news = state.news.slice(0, 12);
  }

  function chooseRegion() {
    const options = state.regions.map((r,i) => `${i+1}. ${r.name} — ${round1(r.support)}%`);
    const answer = prompt(`Escolha a região:\n${options.join("\n")}`);
    const idx = Number(answer) - 1;
    if (!Number.isInteger(idx) || !state.regions[idx]) return null;
    return state.regions[idx];
  }

  function spendAction(def) {
    if (state.finished || state.phase === "government") return;
    if (state.energy <= 0) return showToast("Sem pontos de agenda nesta semana");
    if (state.funds < def.cost) return showToast("Caixa insuficiente");
    state.funds -= def.cost;
    const ok = def.run(state);
    if (ok === false) {
      state.funds += def.cost;
      return;
    }
    state.energy--;
    state.scandal = clamp(state.scandal + rnd(-.3,.5), 0, 100);
    normalize();
    renderAll();
  }

  function normalize() {
    state.reputation = clamp(state.reputation, 0, 100);
    state.media = clamp(state.media, -50, 50);
    state.ground = clamp(state.ground, 0, 100);
    state.digital = clamp(state.digital, 0, 100);
    state.debate = clamp(state.debate, 0, 100);
    state.integrity = clamp(state.integrity ?? 65, 0, 100);
    state.corruptionRisk = clamp(state.corruptionRisk ?? 0, 0, 100);
    if(state.partyProfile){for(const k of Object.keys(state.partyProfile))state.partyProfile[k]=clamp(state.partyProfile[k],0,100);}
    state.investigation = clamp(state.investigation ?? 0, 0, 100);
    state.funds = Math.max(0, state.funds);
    state.regions.forEach(r => {
      r.support = clamp(r.support, 4, 62);
      r.organization = clamp(r.organization, 0, 100);
      r.undecided = clamp(r.undecided, 3, 28);
    });
  }

  function takeTurn() {
    if (state.finished || state.phase === "ended") { navTo("career"); return; }
    if (state.pendingEvent !== null && state.pendingEvent !== undefined) { triggerEvent(events[state.pendingEvent],state.pendingEvent); return; }
    if (state.debateAvailable || state.pendingDebate) { navTo("debate"); showToast("Responda ao debate antes de avançar"); return; }
    if (state.phase === "government") return governmentTurn();
    if (state.phase === "runoff") return runoffElection();
    if (state.week <= 1) return election();

    previousNational = nationalSupport();

    // Natural campaign dynamics
    state.regions.forEach(r => {
      const organizationEffect = (r.organization - 20) / 180;
      const mediaEffect = state.media / 500;
      const reputationEffect = (state.reputation - 50) / 450;
      const uncertainty = rnd(-.45, .45);
      const aiPressure = state.ai * rnd(.05,.3);
      r.support += organizationEffect + mediaEffect + reputationEffect + uncertainty - aiPressure;
      r.undecided = clamp(r.undecided - rnd(.2,.8), 3, 28);
    });

    advanceRivals();

    state.funds += 0.8 + state.ground / 160 + Math.max(0, state.reputation - 50) / 90;
    resolveIntegrityTurn();
    state.media *= .82;
    state.week--;
    state.turns++;
    state.energy = state.maxEnergy;

    const scheduled = scheduleDebateIfDue();
    if (scheduled) {
      addNews("Debate marcado", `${scheduled.title}: vá à aba Debate ao vivo para responder às perguntas.`);
    } else if (state.turns % 3 === 0) {
      // O antigo evento de debate de um único clique foi substituído pelos debates interativos.
      const others = events.filter(event => event.title !== "Debate televisionado");
      const chosen=others[Math.floor(Math.random()*others.length)];
      triggerEvent(chosen, events.indexOf(chosen));
    } else {
      addNews("Nova rodada de pesquisas", "Institutos registram pequenas oscilações após mais uma semana de campanha.");
    }

    normalize();
    renderAll();
    if (scheduled) navTo("debate");
  }

  function triggerEvent(event, eventIndex = events.indexOf(event)) {
    if (!event) return;
    state.pendingEvent = eventIndex;
    writeSave(false);
    $("modalTitle").textContent = event.title;
    $("modalText").textContent = event.text;
    $("modalChoices").innerHTML = "";
    event.choices.forEach(choice => {
      const b = document.createElement("button");
      b.className = "choice-btn";
      b.innerHTML = `<strong>${choice.label}</strong><span>${choice.hint}</span>`;
      b.onclick = () => {
        state.pendingEvent = null;
        choice.effect(state);
        normalize();
        $("modalBackdrop").classList.add("hidden");
        renderAll();
      };
      $("modalChoices").appendChild(b);
    });
    $("modalBackdrop").classList.remove("hidden");
  }

  function advanceRivals() {
    state.rivalActivity ??= [];
    const tactics = ["Visita regional", "Publicidade", "Entrevista", "Alianças locais", "Mobilização digital"];
    for (const rival of state.opponents) {
      rival.funds = (rival.funds ?? 12) + rnd(.6,1.6);
      const tactic = Math.floor(Math.random()*tactics.length);
      const boost = [rnd(.15,.5),rnd(.3,.7),rnd(-.25,.6),rnd(.1,.55),rnd(.15,.5)][tactic];
      rival.poll = clamp(rival.poll + boost + state.ai*rnd(-.15,.2) - rnd(.15,.6),5,48);
      rival.funds = Math.max(0,rival.funds - [1.3,2.5,0,.9,.8][tactic]);
      rival.activity = tactics[tactic];
      const item = {title:`${rival.name} — ação simulada`,text:`${tactics[tactic]} · ${rival.party}. Atividade criada pelo jogo; não é notícia real.`};
      state.rivalActivity.unshift(item);
    }
    state.rivalActivity = state.rivalActivity.slice(0,9);
  }

  // Approximate proportional distribution: QE/QP, 10% QE individual minimum,
  // 80% QE party and 20% QE candidate for early largest-average leftovers.
  // Artificial totals and lists are for play; not an official TSE calculation.
  function calculateProportional(share) {
    const stateSize={SP:70,MG:53,RJ:46,BA:39,RS:31,PR:30,PE:25,CE:22,PA:17,SC:16,GO:17,MA:18,ES:10,DF:8};
    const isCity=state.office==="vereador";
    const seats=isCity ? clamp(Math.round((state.municipalityElectorate||150000)/50000)+9,9,55)
      : state.office==="deputado_federal" ? (stateSize[state.stateUF]||8)
      : clamp(Math.round((stateSize[state.stateUF]||8)*1.35)+12,24,94);
    const validVotes=Math.round(isCity ? Math.max(1000,state.municipalityElectorate||150000)*.72 : 1200000);
    const qe=Math.max(1,Math.round(validVotes/seats));
    // The user's visible support is an individual preference proxy, NOT their party vote.
    const partyIds=[state.party,'PT','PL','PSD','MDB','PSB','UNIÃO','REPUBLICANOS','PDT','NOVO']
      .filter((x,i,a)=>a.indexOf(x)===i).slice(0,9);
    const playerVoteShare=clamp(share,4,54);
    const partyWeights=partyIds.map((p,i)=>i===0?clamp(10+playerVoteShare*.38,9,34):rnd(6,21));
    const wsum=partyWeights.reduce((a,b)=>a+b,0);
    const parties=partyIds.map((id,i)=>{
      const totalVotes=Math.round(validVotes*partyWeights[i]/wsum);
      const listSize=Math.max(12,Math.ceil(seats*.35));
      const raw=Array.from({length:listSize},(_,j)=>rnd(.35,2.8)/Math.sqrt(j+1));
      if(i===0) raw[0]=clamp(playerVoteShare/20, .45, 3.1);
      const sw=raw.reduce((a,b)=>a+b,0);
      const members=raw.map((x,j)=>({name:i===0&&j===0?state.candidate:`Candidato fictício ${j+1} (${id})`,votes:Math.floor(totalVotes*x/sw)}));
      // Deterministically adjust rounding to conserve the simulated party vote total
      members[0].votes+=totalVotes-members.reduce((a,c)=>a+c.votes,0);
      members.sort((a,b)=>b.votes-a.votes);
      return {id,votes:totalVotes,members,seats:0,winners:[]};
    });
    let distributed=0;
    for(const p of parties){
      const earned=Math.floor(p.votes/qe);
      const eligible=p.members.filter(c=>c.votes>=.10*qe);
      p.seats=Math.min(earned,eligible.length);
      p.winners=eligible.slice(0,p.seats);
      distributed+=p.seats;
    }
    while(distributed<seats){
      // Progressive eligibility relaxation after the first remainder pass.
      let eligible=parties.filter(p=>p.votes>=.8*qe && p.members.some(c=> !p.winners.includes(c) && c.votes>=.2*qe));
      if(!eligible.length) eligible=parties.filter(p=>p.members.some(c=>!p.winners.includes(c) && c.votes>=.1*qe));
      if(!eligible.length) break;
      eligible.sort((a,b)=>b.votes/(b.seats+1)-a.votes/(a.seats+1));
      const p=eligible[0];
      const candidate=p.members.find(c=>!p.winners.includes(c) && c.votes>=(p.votes>=.8*qe?.2:.1)*qe);
      if(!candidate)break;
      p.winners.push(candidate);p.seats++;distributed++;
    }
    const own=parties[0];
    const player=own.members.find(c=>c.name===state.candidate);
    return {elected:own.winners.some(c=>c.name===state.candidate),seats,qe,votes:player?.votes||0,
      partyVotes:own.votes,partySeats:own.seats,party:own.id,validVotes,
      details:parties.map(p=>({party:p.id,seats:p.seats,votes:p.votes}))};
  }

  function hasRunoff() {
    if(state.office==="presidente"||state.office==="governador")return true;
    return state.office==="prefeito" && Number(state.municipalityElectorate||0)>200000;
  }

  function election() {
    const estimates = [
      {name: state.candidate, votes: nationalSupport() + (state.ground-25)/40 + (state.reputation-50)/60 + rnd(-1,1)},
      ...state.opponents.map(o => ({name:o.name,votes:o.poll+rnd(-1,1)}))
    ];
    const total = estimates.reduce((x,c)=>x+Math.max(c.votes,1),0);
    estimates.forEach(c => c.votes = round1(100*Math.max(c.votes,1)/total));
    estimates.sort((a,b)=>b.votes-a.votes);
    state.electionHistory = state.electionHistory || [];
    state.electionHistory.push({round:1,office:state.office,district:state.district,year:state.electionYear,campaign:state.campaignNumber,results:estimates});
    state.week=0;
    const own=estimates.find(c=>c.name===state.candidate);
    if (["deputado_federal","deputado_estadual","vereador"].includes(state.office)) {
      const result=calculateProportional(own.votes);
      state.lastElection={...result,kind:"proportional",office:state.office};
      addNews("Apuração proporcional simulada",`${result.party}: ${result.partySeats} de ${result.seats} cadeiras; QE simulado de ${result.qe.toLocaleString("pt-BR")} votos.`);
      return concludeElection(result.elected,round1(result.votes/result.validVotes*100),1);
    }
    if (state.office==="senador") {
      // In alternating general elections, the simulated state elects two or one senators.
      const seats = ((state.electionYear-2026)%8===0)?2:1;
      state.lastElection={kind:"senate",seats};
      return concludeElection(estimates.slice(0,seats).some(c=>c.name===state.candidate),own.votes,1);
    }
    if (!hasRunoff()) return concludeElection(estimates[0].name===state.candidate,own.votes,1);
    if (estimates[0].votes>50) return concludeElection(estimates[0].name === state.candidate,own.votes,1);
    const finalist=estimates.slice(0,2);
    if(!finalist.some(c=>c.name===state.candidate)) return concludeElection(false,estimates.find(c=>c.name===state.candidate).votes,1);
    state.phase="runoff";
    state.runoffRival=finalist.find(c=>c.name!==state.candidate).name;
    state.energy=3;
    state.week=2;
    state.debateAvailable={id:`${state.campaignNumber}-segundo-turno`,week:2,round:2,title:"Debate do segundo turno"};
    state.runoffBase=clamp(50+(estimates.find(c=>c.name===state.candidate).votes - finalist.find(c=>c.name!==state.candidate).votes)*.55,32,68);
    addNews("Segundo turno confirmado",`Disputa final contra ${state.runoffRival} em duas rodadas decisivas.`);
    showDecision("Segundo turno",`Sua candidatura enfrentará ${state.runoffRival}. As duas próximas semanas serão decisivas.`,"Continuar",()=>navTo("overview"));
    renderAll();
  }

  function runoffElection() {
    if (state.week>1) {
      state.runoffBase=clamp(state.runoffBase+(nationalSupport()-25)/25+rnd(-1.5,1.5),25,75);
      state.week--;
      state.energy=3;
      addNews("Pesquisa de segundo turno",`Disputa permanece competitiva contra ${state.runoffRival}.`);
      renderAll(); return;
    }
    const share=clamp(state.runoffBase+(state.reputation-50)/30+state.media/22+rnd(-2,2),15,85);
    state.electionHistory.push({round:2,office:state.office,district:state.district,year:state.electionYear,campaign:state.campaignNumber,results:[{name:state.candidate,votes:round1(share)},{name:state.runoffRival,votes:round1(100-share)}]});
    concludeElection(share>50,share,2);
  }

  function showDecision(title,text,button,callback) {
    $("modalTitle").textContent=title;
    $("modalText").textContent=text;
    $("modalChoices").innerHTML="";
    const b=document.createElement("button");b.className="btn btn-primary full";b.textContent=button;
    b.onclick=()=>{$("modalBackdrop").classList.add("hidden");callback?.();renderAll();};
    $("modalChoices").appendChild(b);$("modalBackdrop").classList.remove("hidden");
  }

  function concludeElection(won,percent,round) {
    state.week=0;
    state.careerHistory ??= [];
    state.lastElection ??= {kind:"majoritarian"};
    if(won) {
      state.careerHistory.push({kind:"mandate", office:state.office,district:state.district,party:state.party,
        result:"eleito",status:"em curso",months:1,total:state.office==="senador"?96:48,
        approval:round1(state.reputation+5),vote:round1(percent),round,election:state.campaignNumber,year:state.electionYear,apportionment:state.lastElection?.kind==="proportional"?{...state.lastElection}:null});
      state.phase="government";
      state.administration={month:1,maxMonths:(state.office==="senador"?96:48),approval:clamp(state.reputation+5,30,80),congress:46,
        inflation:5.8,unemployment:8.4,gdp:1.6,debt:74,health:48,education:49,security:45,
        budget:80,coalition:0,policies:[],history:[]};
      state.energy=3;
      addNews("Posse fictícia",`Eleição para ${officeNames[state.office]} em ${state.district}: ${round1(percent)}% no ${round}º turno. Começa o mandato.`);
      showDecision("Eleição vencida",state.lastElection?.kind==="proportional" ? `Você foi eleito(a) pela distribuição proporcional simulada. ${state.party} conquistou ${state.lastElection.partySeats} de ${state.lastElection.seats} cadeiras; sua votação nominal simulada foi de ${state.lastElection.votes.toLocaleString("pt-BR")} votos.` : `Você obteve ${round1(percent)}% dos votos na simulação e foi eleito para ${officeNames[state.office]} (${state.district}). Começa o seu mandato.`,"Assumir mandato",()=>navTo("government"));
    } else {
      state.phase="ended"; state.finished=true;
      state.careerHistory.push({kind:"election",office:state.office,district:state.district,party:state.party,
        result:"não eleito",vote:round1(percent),round,election:state.campaignNumber,year:state.electionYear,apportionment:state.lastElection?.kind==="proportional"?{...state.lastElection}:null});
      showDecision("Derrota eleitoral",state.lastElection?.kind==="proportional" ? `Você não obteve uma das cadeiras na distribuição proporcional simulada. Sua votação nominal simulada foi de ${state.lastElection.votes.toLocaleString("pt-BR")} votos.` : `Sua candidatura terminou com ${round1(percent)}% no ${round}º turno da eleição simulada.`,"Ver resultados",()=>navTo("overview"));
    }
    renderAll();
  }

  const policyDefs = [
    {id:"health",title:"Expandir atenção básica",desc:"Aprimora a rede de saúde na esfera de governo",cost:9,congress:2,approval:2,health:8,debt:.8,for:["presidente","governador","prefeito"]},
    {id:"education",title:"Programa educacional",desc:"Financiamento e monitoramento da rede de ensino",cost:8,congress:1,approval:2,education:8,debt:.7,for:["presidente","governador","prefeito"]},
    {id:"security",title:"Plano de segurança integrada",desc:"Coordenação institucional e prevenção",cost:7,congress:1,approval:1,security:8,debt:.5,for:["presidente","governador"]},
    {id:"tax",title:"Reforma tributária federal",desc:"Política tributária dependente de aprovação legislativa",cost:2,congress:-5,approval:-1,debt:-2,gdp:.4,for:["presidente"]},
    {id:"jobs",title:"Emprego e infraestrutura",desc:"Investimento público com custo fiscal",cost:12,congress:1,approval:2,unemployment:-.7,gdp:.6,debt:1.3,for:["presidente","governador"]},
    {id:"transport",title:"Melhorar transporte municipal",desc:"Mobilidade, rotas e manutenção urbana",cost:7,congress:2,approval:3,security:2,for:["prefeito"]},
    {id:"sanitation",title:"Saneamento e limpeza urbana",desc:"Contratos, fiscalização e serviços locais",cost:9,congress:1,approval:3,health:5,for:["prefeito"]},
    {id:"localtax",title:"Revisão tributária municipal",desc:"Requer proposta aprovada pela Câmara Municipal",cost:1,congress:-4,approval:-1,debt:-1,for:["prefeito"]},
    {id:"fiscal",title:"Plano de equilíbrio fiscal",desc:"Reduz gasto e dívida, pode diminuir aprovação",cost:0,congress:-3,approval:-3,debt:-2,for:["presidente","governador","prefeito"]},
    {id:"leg_health",title:"Projeto de lei sobre transparência na saúde",desc:"Propõe regras gerais e fiscalização, sem gerir hospitais",cost:1,congress:2,approval:1,health:2,for:["senador","deputado_federal","deputado_estadual","vereador"]},
    {id:"leg_edu",title:"Projeto de lei de acompanhamento da educação",desc:"Tramitação em comissões e votação",cost:1,congress:1,approval:1,education:2,for:["senador","deputado_federal","deputado_estadual","vereador"]},
    {id:"leg_control",title:"Requerimento de fiscalização",desc:"Instrumentos de controle conforme esfera parlamentar",cost:0,congress:-1,approval:2,integrity:3,for:["senador","deputado_federal","deputado_estadual","vereador"]},
    {id:"leg_budget",title:"Debater diretrizes orçamentárias",desc:"Proposta ou emenda, sem autorizar despesas executivas",cost:1,congress:0,approval:1,for:["senador","deputado_federal","deputado_estadual","vereador"]},
  ];
  const chamberNames={presidente:"Congresso Nacional",governador:"Assembleia Legislativa",prefeito:"Câmara Municipal",senador:"Senado Federal",deputado_federal:"Câmara dos Deputados",deputado_estadual:"Assembleia Legislativa",vereador:"Câmara Municipal"};
  function governmentPolicy(id){
    const g=state?.administration,p=policyDefs.find(x=>x.id===id);
    if(!g||!p||!p.for.includes(state.office))return;
    if(state.energy<1||g.budget<p.cost)return showToast("Ações ou orçamento insuficientes");
    state.energy--;g.budget-=p.cost;
    const isLeg=legislativeOffices.has(state.office);
    const votes=clamp(g.congress+g.coalition+rnd(-15,15),0,100);
    // A legislature approves or rejects the player's bill; an executive requests legislative support.
    if(votes<50){g.approval-=1;addNews(isLeg?"Projeto não aprovado":"Proposta rejeitada",`“${p.title}” recebeu ${Math.round(votes)}% do apoio simulado no(a) ${chamberNames[state.office]}.`);renderAll();return;}
    for(const [key,val] of Object.entries(p))if(typeof val==="number"&&key!=="cost"&&key!=="congress") {
      if(key==="integrity")state.integrity+=val;
      else g[key]=(g[key]||0)+val;
    }
    g.congress=clamp(g.congress+p.congress,0,100);
    g.policies.push({month:g.month,title:p.title,votes:Math.round(votes),kind:isLeg?"projeto legislativo":"política executiva"});
    addNews(isLeg?"Projeto legislativo aprovado":"Política pública aprovada",`${p.title}: ${Math.round(votes)}% do apoio simulado no(a) ${chamberNames[state.office]}.`);
    normalize();renderAll();
  }
  function cabinetAction(type){
    const g=state?.administration;if(!g||state.energy<1||state.finished)return;
    state.energy--;
    const leg=legislativeOffices.has(state.office);
    if(type==="coalition") {g.coalition=clamp(g.coalition+7,0,25);g.congress=clamp(g.congress+3,0,100);g.approval-=1;addNews(leg?"Articulação de bancada":"Articulação de governo","Apoio legislativo da simulação aumentou.");}
    if(type==="transparent") {state.integrity=clamp(state.integrity+9,0,100);state.corruptionRisk=clamp(state.corruptionRisk-10,0,100);g.approval+=2;addNews("Transparência pública","Fiscalização e controle administrativo reforçados.");}
    if(type==="communicate") {g.approval+=1.5;g.budget=Math.max(0,g.budget-2);addNews("Prestação de contas","Resultados e limites institucionais apresentados à população.");}
    normalize();renderAll();
  }
  function governmentTurn(){
    const g=state.administration;if(!g||state.finished)return;
    const executive=executiveOffices.has(state.office);
    const shock=rnd(-1.3,1.3);
    g.approval=clamp(g.approval+shock+(executive?(g.gdp-1.5)/4-(g.inflation-5)/6-(g.unemployment-8)/5:0)-(state.investigation||0)/125,0,100);
    if(executive){
      g.inflation=clamp(g.inflation+rnd(-.4,.45),0,30);g.unemployment=clamp(g.unemployment+rnd(-.3,.3),1,30);
      g.gdp=clamp(g.gdp+rnd(-.2,.2),-8,12);g.debt=clamp(g.debt+(.15+(g.inflation-5)/70),0,160);
    }
    g.budget+=executive?7:1.6;
    g.congress=clamp(g.congress+rnd(-2,2),0,100);
    resolveIntegrityTurn();g.history.push({month:g.month,approval:round1(g.approval),inflation:round1(g.inflation)});
    const rec=[...(state.careerHistory||[])].reverse().find(h=>h.kind==="mandate"&&h.status==="em curso");
    if(rec){rec.approval=round1(g.approval);rec.months=g.month;rec.policies=g.policies.length;}
    if(g.month>=g.maxMonths){
      state.finished=true;state.phase="ended";
      closeCareerMandate("concluído");
      showDecision("Fim do mandato",`Aprovação final de ${round1(g.approval)}%. Você aprovou ${g.policies.length} propostas. Sua carreira continua: dispute uma nova eleição.`,"Abrir carreira",()=>navTo("career"));
    } else {g.month++;state.energy=3;addNews("Novo mês de mandato",`Mês ${g.month} de ${g.maxMonths}: aprovação ${round1(g.approval)}% e ${g.policies.length} propostas aprovadas.`);}
    renderAll();
  }
  function renderGovernment(){
    const el=$("governmentContent");if(!el)return;
    const g=state.administration;
    if(!g){el.innerHTML=`<div class="panel">Vença a eleição para ${officeNames[state.office]||"o cargo escolhido"} para assumir seu mandato em ${safeText(state.district||"seu território")}.</div>`;return;}
    const executive=executiveOffices.has(state.office);
    const metric=(name,v,unit="")=>`<div class="metric-card"><span>${name}</span><strong>${round1(v)}${unit}</strong></div>`;
    const cards=executive?
      metric(state.office==="presidente"?"Inflação nacional simulada":"Pressão de preços simulada",g.inflation,"%")+
      metric(state.office==="prefeito"?"Desemprego municipal simulado":"Desemprego simulado",g.unemployment,"%")+
      metric("Atividade econômica simulada",g.gdp,"%")+metric("Dívida pública simulada",g.debt,"%"):
      metric("Propostas aprovadas",g.policies.length)+metric("Tramitação/apoio",g.congress+g.coalition,"%")+
      metric("Fiscalização e controle",state.integrity,"/100")+metric("Propostas analisadas",g.history.length);
    const allowed=policyDefs.filter(p=>p.for.includes(state.office));
    el.innerHTML=`<div class="panel"><p class="eyebrow">${executive?"PODER EXECUTIVO":"PODER LEGISLATIVO"}</p><h3>${officeNames[state.office]} · ${safeText(state.district)}</h3>
      <p>${executive?"Você administra serviços e propõe políticas dentro da esfera do cargo. Projetos que exigem lei dependem do Legislativo.":"Você legisla, vota, debate políticas e fiscaliza. Não pode executar diretamente o orçamento do Poder Executivo."} Cenário institucional e valores fictícios.</p></div>
      <div class="metric-grid">${metric("Aprovação",g.approval,"%")}${cards}${metric(executive?"Orçamento executivo simulado":"Recursos parlamentares operacionais",g.budget," u.")}${metric("Mês de mandato",g.month,` / ${g.maxMonths}`)}</div>
      <div class="panel" style="margin-top:14px"><h3>${executive?"Políticas do governo":"Projetos e fiscalização"}</h3><p>${chamberNames[state.office]} · 1 ação por medida.</p>
      <div class="action-grid">${allowed.map(p=>`<div class="action-card"><div><h4>${p.title}</h4><p>${p.desc} Custo operacional simulado: ${p.cost} u.</p></div><button class="btn btn-primary" ${state.energy<1||g.budget<p.cost||state.finished?'disabled':''} onclick="window.__game.governmentPolicy('${p.id}')">${executive?"Propor":"Protocolar"}</button></div>`).join('')}</div></div>
      <div class="panel" style="margin-top:14px"><h3>Carreira política</h3><p>Você pode disputar outra eleição. O histórico do cargo atual será preservado.</p><button class="btn btn-primary" onclick="window.__game.openCareer()">Escolher próximo cargo</button></div>
      <div class="panel" style="margin-top:14px"><h3>${executive?"Gabinete e governabilidade":"Atuação parlamentar"}</h3><div class="card-actions">
      <button class="btn" onclick="window.__game.cabinetAction('coalition')" ${state.energy<1||state.finished||state.phase==="government"?'disabled':''}>${executive?"Negociar base":"Articular bancada"}</button>
      <button class="btn" onclick="window.__game.cabinetAction('transparent')" ${state.energy<1||state.finished||state.phase==="government"?'disabled':''}>Transparência</button>
      <button class="btn" onclick="window.__game.cabinetAction('communicate')" ${state.energy<1||state.finished||state.phase==="government"?'disabled':''}>Prestação de contas</button></div><p>Propostas aprovadas: ${g.policies.length} · Saúde ${Math.round(g.health)} · Educação ${Math.round(g.education)} · Segurança ${Math.round(g.security)}</p></div>`;
  }

  function chooseProposal(proposalId, optionId) {
    if (state.phase === "government") return showToast("Use a aba Presidência");
    if (state.energy <= 0) return showToast("Sem pontos de agenda nesta semana");
    if (state.proposals[proposalId]) return showToast("Essa posição já foi definida");

    const proposal = proposals.find(p => p.id === proposalId);
    const option = proposal.options.find(o => o.id === optionId);
    state.proposals[proposalId] = optionId;
    state.energy--;

    state.reputation += option.rep || 0;
    state.funds += option.funds || 0;
    // Propostas distribuem seu efeito pelas UFs conforme a prioridade temática.
    const totalEffect=Object.values(option.region || {}).reduce((a,v)=>a+v,0);
    state.regions.forEach(r => {
      const focus = proposalId === "security" ? "Segurança pública" : proposalId === "economy" ? "Emprego e renda" : "Custo de vida";
      r.support += totalEffect / 5 * (r.issue === focus ? 1.4 : .6);
    });
    addNews(`Proposta: ${proposal.title}`, `Campanha apresentou posição oficial: "${option.label}".`);
    normalize();
    renderAll();
  }

  function negotiateCoalition(id) {
    const c = state.coalitions.find(x => x.id === id);
    if (!c || c.secured) return;
    if (state.energy <= 0) return showToast("Sem pontos de agenda nesta semana");
    if (state.funds < c.cost) return showToast("Caixa insuficiente");

    state.energy--;
    state.funds -= c.cost;
    const gain = rnd(18, 34) + state.reputation / 15 + ((state.partyProfile?.cohesion||50)-50)/8;
    c.progress = clamp(c.progress + gain, 0, 100);

    if (c.progress >= 100) {
      c.secured = true;
      state.ground += c.ground;
      state.reputation += c.rep;
      shiftAll(state, .35);
      addNews(`Apoio confirmado: ${c.name}`, "A coalizão formalizou apoio e passou a integrar a estrutura nacional da campanha.");
    } else {
      addNews(`Negociação com ${c.name}`, "Conversas avançaram, mas ainda não há apoio formal.");
    }
    normalize();
    renderAll();
  }

  function regionalVisit(id) {
    const r = state.regions.find(x => x.id === id);
    if (!r) return;
    if (state.energy <= 0) return showToast("Sem pontos de agenda nesta semana");
    if (state.funds < .7) return showToast("Caixa insuficiente");

    state.energy--;
    state.funds -= .7;
    r.organization += rnd(4,8);
    r.support += rnd(.25,.8);
    addNews(`Visita a ${r.name}`, `Agenda regional reforçou a organização e a presença política no território.`);
    normalize();
    renderAll();
  }

  function renderAll() {
    if (!state) return;
    const nat = nationalSupport();
    const delta = nat - previousNational;

    $("candidateTitle").textContent = state.candidate;
    $("candidateSubtitle").textContent = `${state.party} · ${officeNames[state.office]||"Presidente"} · ${state.district||"Brasil"} · Eleição ${state.electionYear} · ${ideologyLabel(state.ideology)}`;
    $("nationalPoll").textContent = `${round1(nat)}%`;
    $("fundsMetric").textContent = money(state.funds);
    $("reputationMetric").textContent = Math.round(state.reputation);
    $("mediaMetric").textContent = `${state.media >= 0 ? "+" : ""}${round1(state.media)}`;
    $("mediaMetric").className = state.media > 2 ? "positive" : state.media < -2 ? "negative" : "";
    $("groundMetric").textContent = Math.round(state.ground);
    $("weekDisplay").textContent = state.phase === "government" ? `${state.administration.month}/${state.administration.maxMonths}` : state.week;
    $("energyDisplay").textContent = `${state.energy}/${state.maxEnergy}`;
    $("campaignPhase").textContent = state.phase === "government" ? `MANDATO · ${officeNames[state.office]||"Presidente"} · ${state.district||"Brasil"}` : state.phase === "runoff" ? "SEGUNDO TURNO" : state.week > 16 ? "PRÉ-CAMPANHA NACIONAL" : state.week > 5 ? "CAMPANHA NACIONAL" : "RETA FINAL";
    $("trendBadge").textContent = Math.abs(delta) < .15 ? "estável" : delta > 0 ? `+${round1(delta)} p.p.` : `${round1(delta)} p.p.`;
    $("trendBadge").className = `badge ${delta > .15 ? "positive" : delta < -.15 ? "negative" : ""}`;

    renderPolls(nat);
    renderIssues();
    renderNews();
    renderRegions();
    renderActions();
    renderProposals();
    renderMedia();
    renderCoalitions();
    renderIntegrity();
    renderGovernment();
    renderCareer();
    renderDebate();
    renderBrazilMap();
    const rivalPanel=$("rivalActivity");
    if(rivalPanel)rivalPanel.innerHTML=(state.rivalActivity||[]).length?(state.rivalActivity||[]).slice(0,6).map(x=>`<div class="news-item"><strong>${safeText(x.title)}</strong><p>${safeText(x.text)}</p></div>`).join(""):`<p class="muted-text">A atividade dos adversários aparecerá após a primeira semana.</p>`;
    $("pollLabel").textContent = state.phase === "government" ? "Apoio da última campanha" : "Intenção de voto simulada";
    $("pollRaceTitle").textContent = `Disputa: ${officeNames[state.office]||"Presidente"}`;
    $("nextTurn").textContent=state.phase==="ended"?"Disputar outra eleição":(state.debateAvailable||state.pendingDebate)?"Participar do debate":state.phase==="government"?"Avançar um mês":state.phase==="runoff"?"Avançar segundo turno":"Avançar uma semana";
    writeSave(false);
  }

  function renderPolls(nat) {
    const candidates = [
      { name: state.candidate, poll: nat, you: true },
      ...state.opponents.map(o => ({name:o.name, poll:o.poll, you:false}))
    ].sort((a,b) => b.poll-a.poll);

    const sum=candidates.reduce((total,c)=>total+Math.max(.01,c.poll),0);
    $("pollBars").innerHTML = candidates.map(c => `
      <div class="poll-row ${c.you ? "you" : ""}">
        <div class="poll-label"><span>${safeText(c.name)}</span><strong>${round1(c.poll/sum*100)}%</strong></div>
        <div class="poll-track"><div class="poll-fill" style="width:${clamp(c.poll/sum*210, 3, 100)}%"></div></div>
      </div>`).join("");
  }

  function renderIssues() {
    const dynamic = [...issues].sort((a,b) => b.weight-a.weight);
    $("issueList").innerHTML = dynamic.map((x,i) => `
      <div class="issue">
        <div class="issue-rank">${i+1}</div>
        <div><strong>${x.name}</strong><small>${Math.round(x.weight)}% citam como prioridade</small></div>
      </div>`).join("");
  }

  function renderNews() {
    $("newsFeed").innerHTML = state.news.map(n => `
      <div class="news-item"><strong>${safeText(n.title)}</strong><p>${safeText(n.text)}</p></div>`).join("");
  }

  // 27-state map. Offline-safe selectable cartogram; if optional GeoJSON loads,
  // draw actual boundaries using an equirectangular projection (no external JS library).
  const ufGrid={AC:[1,6],AM:[2,4],RR:[3,1],RO:[3,6],PA:[5,3],AP:[7,1],TO:[6,6],MA:[8,4],PI:[9,5],CE:[11,4],RN:[13,4],PB:[13,5],PE:[12,6],AL:[13,7],SE:[13,8],BA:[10,8],MT:[5,7],MS:[5,10],GO:[7,9],DF:[8,9],MG:[9,11],ES:[11,11],RJ:[10,12],SP:[8,12],PR:[7,13],SC:[7,14],RS:[6,15]};
  let geoFeatures = null, geoStarted = false;
  function locateRegion(id) {
    const node=document.getElementById(`region-${id}`);
    if(node){node.scrollIntoView({behavior:"smooth",block:"center"});node.classList.add("region-highlight");setTimeout(()=>node.classList.remove("region-highlight"),1600);}
  }
  function renderBrazilMap() {
    const el=$("brazilMap");if(!el||!state)return;
    if(state.office!=="presidente"){
      el.innerHTML=`<p class="muted-text">A candidatura atual abrange ${safeText(state.district)}. O mapa nacional ficará disponível para campanhas presidenciais.</p>`;
      $("mapSource").textContent="Circunscrição: "+state.district;return;
    }
    const geo=geoFeatures;
    if(geo && geo.length){
      const project=(lon,lat)=>[(lon+75)*12, (7-lat)*12];
      const toPath=(coords)=>coords.map(ring=>ring.map((pt,i)=>`${i?'L':'M'}${project(pt[0],pt[1]).map(n=>n.toFixed(1)).join(' ')}`).join(' ')+' Z').join(' ');
      const paths=geo.map(f=>{
        const uf=f.properties?.sigla||f.properties?.uf;
        const region=state.regions.find(r=>r.uf===uf);
        if(!region)return '';
        let rings=[];
        if(f.geometry.type==="Polygon")rings=f.geometry.coordinates;
        else if(f.geometry.type==="MultiPolygon")rings=f.geometry.coordinates.flatMap(poly=>poly);
        return `<path class="state-shape" data-uf="${uf}" data-region="${region.id}" d="${toPath(rings)}" fill="${colorSupport(region.support)}"><title>${safeText(region.name)} · ${round1(region.support)}% simulado</title></path>`;
      }).join('');
      el.innerHTML=`<svg viewBox="0 0 560 520" role="img" aria-label="Mapa de limites estaduais do Brasil, valores eleitorais simulados">${paths}</svg>`;
      $("mapSource").textContent="Malha estadual (IBGE / CC0)";
    }else{
      el.innerHTML=`<div class="map-grid" role="group" aria-label="Mapa esquemático clicável">${state.regions.map(r=>{
        const [x,y]=ufGrid[r.uf]||[1,1];
        return `<button class="map-tile" style="grid-column:${x};grid-row:${y};background:${colorSupport(r.support)}" data-region="${r.id}" title="${safeText(r.name)}: ${round1(r.support)}% simulados">${r.uf}</button>`;
      }).join("")}</div>`;
      $("mapSource").textContent="Mapa esquemático (offline)";
    }
    el.querySelectorAll('[data-region]').forEach(node=>{node.onclick=()=>locateRegion(node.dataset.region);});
    if(!geoStarted && typeof fetch==="function"){
      geoStarted=true;
      fetch('https://cdn.jsdelivr.net/gh/henriquemalvar/br-geojson@main/dist/estados.geojson')
        .then(res=>{if(!res.ok)throw Error('geodata unavailable');return res.json()})
        .then(data=>{if(data.type==="FeatureCollection" && Array.isArray(data.features)&&data.features.length>=27){geoFeatures=data.features;renderBrazilMap();}})
        .catch(()=>{});
    }
  }
  function colorSupport(v){const n=clamp((v-10)/42,0,1);return `hsl(${165-n*95} 44% ${28+n*18}%)`;}

  function renderRegions() {
    $("regionGrid").innerHTML = state.regions.map(r => `
      <div class="region-card" id="region-${r.id}">
        <div class="card-top">
          <div>
            <h4>${safeText(r.name)}</h4>
            <p>Tema dominante: ${safeText(r.issue)}</p>
          </div>
          <div class="big-number">${round1(r.support)}%</div>
        </div>
        <div class="substats">
          <div class="substat"><span>Peso eleitoral</span><strong>${r.voters}%</strong></div>
          <div class="substat"><span>Indecisos</span><strong>${round1(r.undecided)}%</strong></div>
          <div class="substat"><span>Organização</span><strong>${Math.round(r.organization)}</strong></div>
        </div>
        <div class="card-actions">
          <button class="btn btn-primary" onclick="window.__game.regionalVisit('${r.id}')">Visitar região · ${money(.7)}</button>
        </div>
      </div>`).join("");
  }

  function renderActions() {
    $("actionGrid").innerHTML = actionDefs.map(a => `
      <div class="action-card">
        <div>
          <h4>${a.title}</h4>
          <p>${a.desc}</p>
          <div class="action-meta">
            <span class="mini-chip">1 ação</span>
            <span class="mini-chip">${a.cost ? money(a.cost) : "sem custo"}</span>
            <span class="mini-chip">${a.tag}</span>
          </div>
        </div>
        <button class="btn btn-primary" ${state.finished || state.energy<=0 || state.funds<a.cost || state.phase==="government" ? "disabled" : ""}
          onclick="window.__game.spendAction('${a.id}')">Executar</button>
      </div>`).join("");
  }

  function renderProposals() {
    $("proposalGrid").innerHTML = proposals.map(p => {
      const selected = state.proposals[p.id];
      return `<div class="proposal-card">
        <h4>${p.title}</h4>
        <p>${p.text}</p>
        <div class="option-stack">
          ${p.options.map(o => `<button class="option-btn ${selected===o.id ? "selected" : ""}"
            ${selected || state.finished || state.energy<=0 || state.phase==="government" ? "disabled" : ""}
            onclick="window.__game.chooseProposal('${p.id}','${o.id}')">${o.label}</button>`).join("")}
        </div>
      </div>`;
    }).join("");
  }

  function renderMedia() {
    const tone = state.media > 5 ? "favorável" : state.media < -5 ? "hostil" : "equilibrado";
    const score = Math.round(state.media);
    const segments = Array.from({length:11}, (_,i) => {
      const index = i - 5;
      const on = score > 0 ? index > 0 && index <= Math.ceil(score/10) : index < 0 && index >= -Math.ceil(Math.abs(score)/10);
      return `<span class="${on ? `on ${score>=0?"good":"bad"}` : ""}"></span>`;
    }).join("");

    $("mediaContent").innerHTML = `
      <div class="media-layout">
        <div class="media-stat">
          <p class="eyebrow">COBERTURA</p>
          <h4>Tom geral: ${tone}</h4>
          <div class="media-score ${score>2?"positive":score<-2?"negative":""}">${score>=0?"+":""}${score}</div>
          <p>A cobertura altera a velocidade com que reputação e acontecimentos chegam aos eleitores.</p>
          <div class="media-meter">${segments}</div>
        </div>
        <div class="media-stat">
          <p class="eyebrow">CAPACIDADES</p>
          <h4>Estrutura de comunicação</h4>
          ${progress("Digital", state.digital)}
          ${progress("Debates", state.debate)}
          ${progress("Resposta a crises", clamp((state.reputation + state.debate)/2,0,100))}
        </div>
      </div>`;
  }

  function progress(label, value) {
    return `<div class="progress-line">
      <div class="progress-head"><span>${label}</span><strong>${Math.round(value)}</strong></div>
      <div class="progress-track"><div class="progress-value" style="width:${clamp(value,0,100)}%"></div></div>
    </div>`;
  }

  function partyAction(id){
    if(!state || state.finished || !["campaign","runoff"].includes(state.phase))return;
    if(state.energy<1)return showToast("Sem ações para esta semana");
    const costs={organization:.9,convention:1.1,compliance:.7};
    if(!(id in costs)||state.funds<costs[id])return showToast("Caixa insuficiente");
    state.energy--;state.funds-=costs[id];
    const party=state.partyProfile;
    if(id==="organization"){
      party.organization+=7;state.ground+=3.2;
      state.regions.forEach(r=>r.organization+=1.6);
      addNews("Diretórios se organizam",`Equipe de ${state.party} ampliou a rede fictícia de voluntários.`);
    }else if(id==="convention"){
      party.cohesion+=9;state.reputation+=.5;state.media+=.4;
      addNews("Convenção partidária simulada",`A campanha fortaleceu a coordenação interna de ${state.party}.`);
    }else if(id==="compliance"){
      party.compliance+=11;state.integrity+=6;state.corruptionRisk-=5;
      addNews("Controle financeiro partidário",`Auditoria interna fictícia reforça governança e documentação das despesas.`);
    }
    normalize();renderAll();
  }

  function renderCoalitions() {
    const party=state.partyProfile||newPartyProfile(state.party);
    const partyPanel=$('partyPanel');
    if(partyPanel)partyPanel.innerHTML=`<div class="panel"><p class="eyebrow">DIRETÓRIO PARTIDÁRIO FICTÍCIO</p><h3>${safeText(state.party)} · Organização interna</h3>
      <p class="muted-text">Atributos gerados para o jogo, sem retratar características reais da legenda.</p>
      <div class="party-bars">${progress("Organização",party.organization)}${progress("Coesão",party.cohesion)}${progress("Controle de contas",party.compliance)}${progress("Formação de quadros",party.development)}</div>
      <div class="card-actions"><button class="btn" onclick="window.__game.partyAction('organization')" ${state.energy<1||state.funds<.9||state.finished||state.phase==='government'?'disabled':''}>Organizar diretórios · R$ 0,9 mi</button>
      <button class="btn" onclick="window.__game.partyAction('convention')" ${state.energy<1||state.funds<1.1||state.finished||state.phase==='government'?'disabled':''}>Convenção · R$ 1,1 mi</button>
      <button class="btn" onclick="window.__game.partyAction('compliance')" ${state.energy<1||state.funds<.7||state.finished||state.phase==='government'?'disabled':''}>Auditar partido · R$ 0,7 mi</button></div></div>`;
    $("coalitionGrid").innerHTML = state.coalitions.map(c => `
      <div class="coalition-card">
        <div class="card-top">
          <div><h4>${c.name}</h4><p>${c.desc}</p></div>
          <span class="badge ${c.secured ? "positive" : ""}">${c.secured ? "apoio fechado" : `${Math.round(c.progress)}%`}</span>
        </div>
        ${progress("Negociação", c.progress)}
        <div class="card-actions">
          <button class="btn btn-primary" ${c.secured || state.finished || state.energy<=0 || state.funds<c.cost ? "disabled" : ""}
            onclick="window.__game.negotiateCoalition('${c.id}')">Negociar · ${c.cost ? money(c.cost) : "sem custo"}</button>
        </div>
      </div>`).join("");
  }


  // Corrupção é mecânica de jogo inteiramente ficcional: NÃO descreve os partidos reais.
  function integrityAction(kind) {
    if (!state || state.finished || !["campaign","runoff"].includes(state.phase)) return showToast("Durante o mandato, use as medidas de fiscalização do gabinete");
    if (state.energy < 1) return showToast("Sem pontos de agenda");
    if (kind === "audit" && state.funds < .8) return showToast("Caixa insuficiente");
    if (kind === "reject") {
      state.energy--;
      state.integrity += 10; state.corruptionRisk -= 6; state.reputation += 1.3;
      addNews("Campanha rejeita oferta irregular", "Um operador fictício ofereceu verba não declarada; a campanha recusou e registrou a tentativa.");
    } else if (kind === "audit") {
      state.energy--; state.funds -= .8;
      state.integrity += 12; state.corruptionRisk -= 14;
      state.investigation = Math.max(0, state.investigation - 8);
      addNews("Auditoria fictícia reforçada", "Controles internos ampliam a transparência das despesas da campanha.");
    } else if (kind === "illegal") {
      if (!confirm("Decisão fictícia: aceitar recursos ilícitos simulados? Isso pode levar a investigação, sanções e perda eleitoral.")) return;
      state.energy--;
      state.funds += 4.5; state.illicitFunds = (state.illicitFunds || 0) + 4.5;
      state.corruptionRisk += 34; state.integrity -= 27; state.reputation -= 3;
      addNews("Operação irregular simulada", "Personagens fictícios ocultaram movimentações financeiras; risco de investigação aumentou.");
    }
    normalize(); renderAll();
  }

  function resolveIntegrityTurn() {
    if (!state || (state.corruptionRisk || 0) < 3) return;
    const chance = Math.min(.85, state.corruptionRisk / 135);
    if (Math.random() < chance) {
      state.investigation = clamp((state.investigation || 0) + rnd(12, 27), 0, 100);
      state.media -= rnd(2, 6); state.reputation -= rnd(2, 6);
      shiftAll(state, -rnd(.4, 1.4));
      addNews("Investigação fictícia na campanha", "Órgãos de controle simulados apuram movimentações irregulares de personagens inventados. Há perda de apoio eleitoral.");
      if (state.investigation > 72) {
        state.funds = Math.max(0, state.funds - 3); shiftAll(state, -1.8);
        addNews("Sanção eleitoral simulada", "Processo fictício bloqueia recursos e reduz apoio eleitoral.");
      }
    }
    state.corruptionRisk = Math.max(0, state.corruptionRisk - 1.2);
  }

  function renderIntegrity() {
    const el = $("integrityContent");
    if (!el) return;
    const risk = state.corruptionRisk || 0, trust = state.integrity ?? 65, investigation = state.investigation || 0;
    el.innerHTML = `
      <div class="metric-grid" style="margin-top:0">
        <div class="metric-card"><span>Integridade (simulada)</span><strong>${Math.round(trust)}/100</strong><small>transparência da campanha</small></div>
        <div class="metric-card"><span>Risco de corrupção</span><strong class="${risk>30?'negative':''}">${Math.round(risk)}/100</strong><small>risco de detecção</small></div>
        <div class="metric-card"><span>Investigação fictícia</span><strong>${Math.round(investigation)}/100</strong><small>consequências eleitorais</small></div>
        <div class="metric-card"><span>Recursos ilícitos simulados</span><strong>${money(state.illicitFunds||0)}</strong><small>não representa fato real</small></div>
      </div>
      <div class="action-grid" style="margin-top:16px">
        <div class="action-card"><div><h4>Rejeitar oferta irregular</h4><p>Um personagem fictício oferece verba não declarada. Recuse e registre a tentativa.</p><div class="action-meta"><span class="mini-chip">1 ação</span><span class="mini-chip">aumenta integridade</span></div></div><button class="btn btn-primary" ${state.energy<1||state.finished||state.phase==="government"?'disabled':''} onclick="window.__game.integrityAction('reject')">Recusar</button></div>
        <div class="action-card"><div><h4>Auditar as contas</h4><p>Contrate fiscalização interna fictícia e reduza exposição a irregularidades.</p><div class="action-meta"><span class="mini-chip">1 ação</span><span class="mini-chip">R$ 0,8 mi</span></div></div><button class="btn btn-primary" ${state.energy<1||state.funds<.8||state.finished?'disabled':''} onclick="window.__game.integrityAction('audit')">Auditar</button></div>
        <div class="action-card"><div><h4>Aceitar caixa dois (fictício)</h4><p>Receba recursos simulados não declarados: caixa aumenta, mas há risco de investigação, sanções e perda de votos. Não representa acusação contra pessoa ou partido real.</p><div class="action-meta"><span class="mini-chip">1 ação</span><span class="mini-chip">risco alto</span></div></div><button class="btn btn-danger" ${state.energy<1||state.finished||state.phase==="government"?'disabled':''} onclick="window.__game.integrityAction('illegal')">Aceitar</button></div>
      </div>`;
  }


  // --- Carreira persistente entre mandatos e diferentes eleições ---
  function safeText(text) {
    return String(text ?? "").replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }

  function closeCareerMandate(status) {
    const entries = state.careerHistory || [];
    const record = [...entries].reverse().find(h=>h.kind==="mandate" && h.status==="em curso");
    if (record && state.administration) {
      record.status=status;
      record.months=state.administration.month;
      record.approval=round1(state.administration.approval);
      record.policies=state.administration.policies.length;
    }
  }

  function updateCareerFormVisibility() {
    const office = $("careerOffice")?.value;
    if (!office) return;
    $("careerStateLabel").classList.toggle("hidden",office==="presidente");
    $("careerCityLabel").classList.toggle("hidden",!(office==="prefeito"||office==="vereador"));
    $("careerElectorateLabel")?.classList.toggle("hidden",!(office==="prefeito"||office==="vereador"));
  }

  function changeCareerDraft(field,value) {
    if (!state) return;
    const draft = state.careerDraft || {office:"presidente",uf:state.stateUF||"ES",municipality:state.municipality||"",electorate:state.municipalityElectorate||300000,party:state.party};
    if (!(["office","uf","municipality","electorate","party"].includes(field))) return;
    draft[field]=value;
    if (field==="uf" && (draft.office==="prefeito"||draft.office==="vereador")) draft.municipality=citiesByState[value]||"";
    state.careerDraft=draft;
    if (field==="uf" && $("careerCity")) $("careerCity").value=draft.municipality;
    updateCareerFormVisibility();
    writeSave(false);
  }

  function startNextCampaign() {
    if (!state || !["government","ended"].includes(state.phase)) return showToast("Primeiro conclua a eleição atual");
    const draft=state.careerDraft;
    if (!draft || !officeNames[draft.office] || !baseRegions.some(r=>r.uf===draft.uf)) return showToast("Selecione cargo e estado válidos");
    const city=(draft.municipality||citiesByState[draft.uf]||"").trim();
    if ((draft.office==="prefeito"||draft.office==="vereador") && !city) return showToast("Informe o município");
    if ((draft.office==="prefeito"||draft.office==="vereador") && (!Number.isInteger(Number(draft.electorate))||Number(draft.electorate)<1000)) return showToast("Informe um eleitorado municipal simulado válido");
    if (state.phase==="government") {
      const executiveSwitch=executiveOffices.has(state.office) && draft.office!==state.office;
      const note=executiveSwitch?" A mudança para outro cargo pressupõe, na realidade, renúncia no prazo legal; o jogo registra uma renúncia simulada, sem calcular datas de desincompatibilização.":"";
      const msg=`Iniciar uma nova candidatura para ${officeNames[draft.office]}? Na simulação, o mandato atual será encerrado no mês ${state.administration.month} e ficará no histórico.`;
      if (!confirm(msg+note)) return;
      closeCareerMandate(executiveSwitch?"renunciou (simulação)":"encerrou antecipadamente");
    }
    const previousApproval=state.administration?.approval ?? 50;
    const oldOffice=state.office;
    if(draft.party && draft.party!==state.party){
      state.party=draft.party;
      state.reputation=clamp(state.reputation-2,0,100);
      addNews("Mudança partidária na carreira",`O candidato mudou de sigla antes da nova disputa. Regras de filiação e fidelidade não são modeladas integralmente.`);
    }
    const oldElectionYear=state.electionYear || nextElectionYear(state.office);
    state.campaignNumber=(state.campaignNumber||1)+1;
    state.electionYear=nextElectionYear(draft.office,oldElectionYear);
    state.office=draft.office; state.stateUF=draft.uf;
    state.municipality=(draft.office==="vereador"||draft.office==="prefeito")?city:"";
    state.district = state.office==="presidente"?"Brasil":
       (state.office==="prefeito"||state.office==="vereador")?`${city} / ${draft.uf}`:draft.uf;
    state.phase="campaign";state.finished=false;state.week=24;state.turns=0;
    state.energy=state.maxEnergy||3;
    // Caixa de campanha é reiniciado; orçamento do mandato anterior jamais vira verba eleitoral.
    state.partyProfile=newPartyProfile(state.party);
    state.funds=(state.difficulty==="expert"?11:state.difficulty==="hard"?13:15)+(state.partyProfile.development-45)/35;
    state.reputation=clamp(state.reputation*.60+previousApproval*.40,23,83);
    state.ground=clamp(18+state.ground*.18+(state.partyProfile.organization-50)/14,18,38);
    state.media=0;state.digital=clamp(state.digital*.4,12,48);state.debate=clamp(state.debate*.6,20,70);
    state.regions=electionDistricts(draft.office,draft.uf,city).map(r=>({...r,
      support:clamp(r.support+(state.reputation-50)*.09,5,57)}));
    state.opponents=(draft.office==="presidente"?opponents:fictionalRivals).map((o,i)=>({...o,funds:11+i*2,activity:"Preparando a campanha"}));
    state.municipalityElectorate=Number(draft.electorate)||300000;
    state.rivalActivity=[];
    state.pendingEvent=null;
    state.lastElection=null;
    state.coalitions=coalitionDefs.map(c=>({...c,secured:false}));
    state.proposals={};state.administration=null;
    state.debateAvailable=null;state.pendingDebate=null;state.runoffRival=null;state.runoffBase=null;
    state.careerDraft=null;
    previousNational=nationalSupport();
    addNews("Nova candidatura registrada",`Após ${officeNames[oldOffice]}, começa a campanha alternativa de ${state.electionYear} para ${officeNames[state.office]} (${state.district}).`);
    normalize(); renderAll(); navTo("overview");
    showToast("Nova campanha iniciada; carreira preservada");
  }

  function renderCareer() {
    const el=$("careerContent");if(!el)return;
    if (!state.careerDraft) state.careerDraft={office:"presidente",uf:state.stateUF||"ES",municipality:state.municipality||"",electorate:state.municipalityElectorate||300000,party:state.party};
    const d=state.careerDraft;
    const canRun=["government","ended"].includes(state.phase);
    const current=state.phase==="government"?`${officeNames[state.office]} — ${state.district} (${state.administration.month}/${state.administration.maxMonths} meses)`:
      state.phase==="ended"?"Sem mandato ativo. Você pode iniciar outra campanha.":`Candidatura atual: ${officeNames[state.office]} — ${state.district}`;
    const records=(state.careerHistory||[]).slice().reverse();
    el.innerHTML=`
      <div class="panel career-current"><p class="eyebrow">SITUAÇÃO ATUAL</p><h3>${safeText(current)}</h3>
      <p>Nome político: ${safeText(state.candidate)} · Partido: ${safeText(state.party)} · Campanha ${state.campaignNumber||1} · Eleição ${state.electionYear||"simulada"}</p>
      </div>
      <div class="panel" style="margin-top:14px">
       <p class="eyebrow">NOVA CANDIDATURA</p><h3>Escolha sua próxima eleição</h3>
       <p>O novo pleito começa com 24 semanas de campanha. A carreira, os resultados e os debates anteriores são mantidos no salvamento. A troca de cargo é uma simplificação de jogabilidade, não representa requisitos jurídicos ou calendário eleitoral real.</p>
       <div class="setup-grid" style="margin-top:16px">
         <label><span>Cargo</span><select id="careerOffice" onchange="window.__game.changeCareerDraft('office',this.value)">
           ${Object.entries(officeNames).map(([id,label])=>`<option value="${id}" ${id===d.office?"selected":""}>${label}</option>`).join("")}
         </select></label>
         <label id="careerStateLabel"><span>Estado</span><select id="careerState" onchange="window.__game.changeCareerDraft('uf',this.value)">
           ${baseRegions.map(r=>`<option value="${r.uf}" ${r.uf===d.uf?"selected":""}>${r.name} (${r.uf})</option>`).join("")}
         </select></label>
         <label id="careerCityLabel"><span>Município</span><input id="careerCity" maxlength="60" value="${safeText(d.municipality)}" onchange="window.__game.changeCareerDraft('municipality',this.value)" placeholder="Ex.: Vitória" /></label>
         <label id="careerElectorateLabel"><span>Eleitorado municipal simulado</span><input type="number" min="1000" max="15000000" value="${Number(d.electorate)||300000}" onchange="window.__game.changeCareerDraft('electorate',this.value)" /></label>
         <label><span>Partido para a próxima eleição</span><select onchange="window.__game.changeCareerDraft('party',this.value)">
           ${[...$("partyName").options].map(o=>`<option value="${safeText(o.value)}" ${(d.party||state.party)===o.value?"selected":""}>${safeText(o.textContent)}</option>`).join("")}
         </select></label>
       </div>
       <div class="card-actions"><button class="btn btn-primary" ${!canRun?"disabled":""} onclick="window.__game.startNextCampaign()">Disputar nova eleição</button></div>
       ${!canRun?"<p>Conclua a campanha em andamento antes de iniciar outra.</p>":""}
      </div>
      <div class="panel" style="margin-top:14px"><p class="eyebrow">HISTÓRICO</p><h3>Trajetória eleitoral e mandatos</h3>
        <div class="career-history">${records.length?records.map(h=>`<div class="career-record">
          <div><strong>${safeText(officeNames[h.office]||h.office)} · ${safeText(h.district)}</strong> <small>${safeText(h.party||state.party)} · Campanha ${h.election||1} · Ano ${h.year||"simulado"}</small></div>
          <div class="career-meta"><span class="badge">${safeText(h.kind==="mandate"?h.status:h.result)}</span><small>${h.kind==="mandate"?`${h.months||0}/${h.total||48} meses · aprovação ${round1(h.approval||0)}%`:`${round1(h.vote||0)}% dos votos simulados`}</small></div>
        </div>`).join(""):"<p>Nenhuma eleição concluída nesta carreira.</p>"}</div>
      </div>`;
    updateCareerFormVisibility();
  }

  // --- Debates programados, perguntas interativas e estado persistente ---
  const debateQuestions=[
    {topic:"Custo de vida",question:"A população relata dificuldades com alimentação e serviços. Que estratégia você detalhará?", options:[
      {text:"Combinar auxílio focalizado e revisão periódica do custo fiscal.",impact:.40,rep:.25,style:"social"},
      {text:"Reduzir entraves à produção e apresentar metas de preços.",impact:.44,rep:.24,style:"liberal"},
      {text:"Pactuar metas de renda, produtividade e controle de despesas.",impact:.42,rep:.26,style:"centro"}]},
    {topic:"Segurança pública",question:"O mediador pergunta sobre segurança e prevenção. Qual será o eixo principal?",options:[
      {text:"Priorizar investigação e prevenção com metas de resultados.",impact:.43,rep:.30,style:"social"},
      {text:"Reforçar policiamento orientado por dados e fiscalização.",impact:.45,rep:.22,style:"conservador"},
      {text:"Integrar polícia, políticas sociais e acompanhamento externo.",impact:.43,rep:.27,style:"centro"}]},
    {topic:"Saúde",question:"Como lidar com filas e financiamento do atendimento?",options:[
      {text:"Expandir equipes de atenção primária com métricas de fila.",impact:.45,rep:.22,style:"social"},
      {text:"Integrar redes públicas e contratadas com auditoria de custos.",impact:.44,rep:.23,style:"liberal"},
      {text:"Focar regulação de acesso, filas transparentes e metas públicas.",impact:.45,rep:.24,style:"centro"}]},
    {topic:"Integridade",question:"Como seu partido prevenirá uso indevido de recursos públicos?",options:[
      {text:"Publicar dados abertos e auditorias periódicas independentes.",impact:.45,rep:.26,style:"verde"},
      {text:"Definir compliance, trilhas de auditoria e responsabilidade individual.",impact:.45,rep:.27,style:"liberal"},
      {text:"Ampliar controles cruzados e acompanhamento institucional.",impact:.46,rep:.24,style:"centro"}]},
    {topic:"Emprego e renda",question:"Como estimular o emprego e o investimento no território?",options:[
      {text:"Investir em qualificação e obras com metas transparentes.",impact:.44,rep:.24,style:"social"},
      {text:"Simplificar regras de empreender e medir novas vagas.",impact:.46,rep:.20,style:"liberal"},
      {text:"Coordenar educação, infraestrutura e acordos produtivos.",impact:.44,rep:.23,style:"centro"}]},
    {topic:"Educação",question:"Professores perguntam sobre qualidade e financiamento. Qual resposta você dará?",options:[
      {text:"Promover formação docente e avaliações com apoio pedagógico.",impact:.45,rep:.26,style:"social"},
      {text:"Priorizar resultados, autonomia das escolas e transparência.",impact:.45,rep:.24,style:"liberal"},
      {text:"Unir metas de aprendizagem e colaboração federativa.",impact:.45,rep:.23,style:"centro"}]}
  ];

  function scheduledQuestions(round,week){
    const offsets=round===2?[3,0,1,4]:week===18?[0,1,2,3]:week===10?[2,3,4,5]:[1,4,5,0];
    return offsets.map(index=>index);
  }

  function scheduleDebateIfDue(){
    if (state.phase!=="campaign" || ![18,10,4].includes(state.week)) return null;
    const d={id:`${state.campaignNumber}-turno1-semana${state.week}`,week:state.week,round:1,
      title:state.week===4?"Debate da reta final":`Debate eleitoral — semana ${state.week}`};
    state.debateAvailable=d;return d;
  }

  function startDebate(){
    if (!state || state.finished) return;
    if(state.pendingDebate) {navTo("debate");return;}
    if(!state.debateAvailable)return showToast("Não há debate agendado nesta semana");
    const d=state.debateAvailable;
    state.pendingDebate={id:d.id,title:d.title,week:d.week,round:d.round,
      questionIds:scheduledQuestions(d.round,d.week),step:0,segment:"answer",currentEffect:0,score:0,answers:[],replies:[]};
    renderAll();navTo("debate");
  }

  function answerDebate(optionIndex){
    const db=state?.pendingDebate;if(!db||state.finished)return;
    db.segment ??="answer";db.replies ??=[];
    const question=debateQuestions[db.questionIds[db.step]];
    if(!question)return;
    if(db.segment==="reply"){
      const replies=[{text:"Responder com dados e reconhecer limitações",rep:.45,media:.1,risk:-.15},
       {text:"Contrapor argumentos e reforçar diferenças",rep:.08,media:.5,risk:.12},
       {text:"Evitar o confronto e retornar à proposta",rep:.25,media:-.1,risk:-.05}];
      const a=replies[optionIndex];if(!a)return;
      const change=a.rep + rnd(-.2,.2) - (state.reputation<35?.13:0);
      const score=clamp(change+a.media+db.currentEffect*.1,-1,1.5);
      state.reputation+=change;state.media+=a.media;
      state.regions.forEach(r=>r.support+=score*.07);
      db.score=round1(db.score+score);
      db.replies.push({topic:question.topic,text:a.text,effect:round1(score)});
      db.step++;db.segment="answer";db.currentEffect=0;
    } else {
      const answer=question.options[optionIndex];if(!answer)return;
      const expertise=(state.debate-35)/115;
      const context=(state.regions.reduce((sum,r)=>sum+(r.issue===question.topic?r.voters:0),0)/100)*.38;
      // Neutral trade-offs: the highest base is not necessarily best for every electorate.
      const tradeoff=answer.style===state.ideology?.24:answer.style==="centro"?.10:0;
      const integrityImpact=question.topic==="Integridade"?(state.integrity-50)/160:0;
      const difficulty=state.difficulty==="expert"?-.22:state.difficulty==="hard"?-.12:0;
      const effect=clamp(answer.impact*.55 + expertise + context + tradeoff + integrityImpact + difficulty + rnd(-.38,.40),-1.7,1.7);
      state.reputation+=answer.rep*.6+effect*.20;state.media+=effect*1.2;
      state.regions.forEach(r=>r.support=clamp(r.support+effect*(r.issue===question.topic?.23:.08),4,62));
      if(state.phase==="runoff")state.runoffBase=clamp(state.runoffBase+effect*.42,25,75);
      db.score=round1(db.score+effect);db.currentEffect=effect;
      db.answers.push({topic:question.topic,answer:answer.text,effect:round1(effect)});
      db.segment="reply";
      // A generic fictional team makes a question; never attribute made-up quotes to named politicians.
      db.rivalResponse=["Equipe adversária questiona os custos previstos.","Equipe adversária pede metas verificáveis.","Equipe adversária contesta o prazo de execução."][Math.floor(Math.random()*3)];
    }
    normalize();
    if(db.step>=db.questionIds.length){
      state.debateHistory ??=[];
      state.debateHistory.push({id:db.id,campaign:state.campaignNumber,office:state.office,district:state.district,
        title:db.title,score:db.score,answers:db.answers,replies:db.replies,week:db.week,round:db.round});
      state.pendingDebate=null;state.debateAvailable=null;
      addNews("Debate concluído",`${db.title}: ${db.answers.length} perguntas e ${db.replies.length} réplicas. Saldo simulado: ${db.score>=0?"+":""}${db.score} pontos.`);
      renderAll();
      showDecision("Debate concluído",`Foram ${db.answers.length} respostas e ${db.replies.length} réplicas. Saldo de desempenho ${db.score>=0?"+":""}${db.score}.`,"Ver análise",()=>navTo("debate"));return;
    }
    renderAll();navTo("debate");
  }

  function renderDebate(){
    const el=$("debateContent");if(!el)return;
    const db=state.pendingDebate;
    const past=(state.debateHistory||[]).slice().reverse();
    let current;
    if(db){
      const question=debateQuestions[db.questionIds[db.step]];
      const reply=(db.segment==="reply");
      const replies=["Responder com dados e reconhecer limitações","Contrapor argumentos e reforçar diferenças","Evitar o confronto e retornar à proposta"];
      current=`<div class="panel debate-live"><p class="eyebrow">AO VIVO · ${safeText(db.title)}</p>
       <div class="debate-step">Pergunta ${db.step+1} de ${db.questionIds.length} · ${reply?"RÉPLICA":"RESPOSTA"} · ${safeText(question.topic)}</div>
       <h3>${reply?"Direito de resposta":safeText(question.question)}</h3>
       <p>${reply?safeText(db.rivalResponse||"Equipe adversária apresenta uma crítica fictícia."):"Escolha sua linha de resposta. Desempenho depende do tema, preparação e do público regional."}</p>
       <div class="debate-answers">${reply?replies.map((text,i)=>`<button class="choice-btn" onclick="window.__game.answerDebate(${i})"><strong>${safeText(text)}</strong><span>Apresentar réplica</span></button>`).join(""):
         question.options.map((option,i)=>`<button class="choice-btn" onclick="window.__game.answerDebate(${i})"><strong>${safeText(option.text)}</strong><span>Responder ao mediador</span></button>`).join("")}</div>
       <p class="debate-score">Desempenho acumulado: <strong>${db.score>=0?"+":""}${round1(db.score)}</strong></p>
       </div>`;
    } else if (state.debateAvailable){
      const d=state.debateAvailable;
      current=`<div class="panel debate-live"><p class="eyebrow">DEBATE MARCADO</p><h3>${safeText(d.title)}</h3>
        <p>Quatro perguntas, cada uma com uma réplica. Escolha respostas contextualizadas; preparação e repercussão influenciam indicadores simulados. O jogo espera o debate para avançar.</p>
        <button class="btn btn-primary" onclick="window.__game.startDebate()">Entrar no estúdio e participar</button></div>`;
    } else {
      current=`<div class="panel"><p class="eyebrow">AGENDA DOS DEBATES</p><h3>${state.phase==="government"||state.phase==="ended"?"Nenhum debate durante o mandato":"Próximo encontro eleitoral"}</h3>
        <p>${state.phase==="campaign"?"Debates estão previstos nas semanas 18, 10 e 4 de cada campanha. Prepare-se na aba Agenda antes da data.":state.phase==="runoff"?"Aguarde a rodada decisiva do segundo turno.":"Novos debates serão disponibilizados quando você iniciar outra candidatura."}</p>
        <div class="card-actions"><button class="btn" onclick="window.__game.openCareer()">Consultar carreira</button></div></div>`;
    }
    el.innerHTML=current+`<div class="panel" style="margin-top:14px"><p class="eyebrow">ARQUIVO DOS DEBATES</p><h3>Participações anteriores</h3>
      <div class="career-history">${past.length?past.map(h=>`<div class="career-record"><div><strong>${safeText(h.title)}</strong><small>${safeText(officeNames[h.office]||h.office)} · ${safeText(h.district)} · Campanha ${h.campaign||1}</small></div><div class="career-meta"><span class="badge">Saldo ${h.score>=0?"+":""}${round1(h.score)}</span><small>${h.answers?.length||0} respostas</small></div></div>`).join(""):"<p>Nenhuma participação registrada.</p>"}</div></div>`;
  }

  function ideologyLabel(v) {
    return {
      centro: "Centro pragmático",
      social: "Social-desenvolvimentista",
      liberal: "Liberal reformista",
      verde: "Verde progressista",
      conservador: "Conservador institucional"
    }[v] || v;
  }

  const SAVE_KEY = "mandato_save_v1";
  function writeSave(announce = false) {
    if (!state) return false;
    try {
      const snapshot = JSON.stringify(state);
      localStorage.setItem(SAVE_KEY, snapshot);
      if (localStorage.getItem(SAVE_KEY) !== snapshot) throw new Error("Falha na confirmação");
      const indicator = $("saveStatus");
      if (indicator) indicator.textContent = "Salvo neste dispositivo";
      if (announce) showToast("Progresso salvo neste dispositivo");
      return true;
    } catch (err) {
      const indicator = $("saveStatus");
      if (indicator) indicator.textContent = "Não foi possível salvar; exporte o backup";
      if (announce) showToast("Armazenamento indisponível: exporte um backup");
      console.warn("Falha ao salvar", err);
      return false;
    }
  }
  function saveGame() { writeSave(true); }

  function isValidSave(obj) {
    return obj && typeof obj === "object" &&
      typeof obj.candidate === "string" && typeof obj.party === "string" &&
      Number.isFinite(obj.week) && Number.isFinite(obj.funds) &&
      Array.isArray(obj.regions) && (obj.regions.length === 4 || obj.regions.length === 5 || obj.regions.length === 27) &&
      obj.regions.every(r => r && typeof r.id === "string" && Number.isFinite(r.support) && Number.isFinite(r.voters)) &&
      Array.isArray(obj.opponents) && Array.isArray(obj.news) &&
      Array.isArray(obj.coalitions) && obj.proposals && typeof obj.proposals === "object";
  }
  function applySave(data) {
    if (!isValidSave(data)) throw new Error("Arquivo de jogo inválido");
    state = data;
    if (state.regions.length === 4) {
      const old=state.regions;
      state.regions=baseRegions.map((r,i)=>({...r,support:clamp(old[i%4].support+rnd(-1.5,1.5),4,62),organization:old[i%4].organization}));
    }
    state.office ??= "presidente";
    state.district ??= "Brasil";
      state.phase ??= state.finished ? "ended":"campaign";
      state.version = 7;
      state.careerHistory ??= [];
      state.careerDraft ??= null;
      state.campaignNumber ??= 1;
      state.electionYear ??= nextElectionYear(state.office);
      state.debateHistory ??= [];
      state.debateAvailable ??= null;
      state.pendingDebate ??= null;
      state.pendingEvent ??= null;
      state.rivalActivity ??= [];
      state.municipalityElectorate ??= 300000;
      state.lastElection ??= null;
      state.opponents.forEach((o,i)=>{o.funds ??= 11+i*2;o.activity ??="Preparando a campanha";});
    // Compatibilidade: um mandato salvo na v5 também aparece no histórico da carreira.
    if (state.administration && !state.careerHistory.some(h => h.kind === "mandate" && h.status === "em curso")) {
      const alreadyEnded = state.phase === "ended";
      state.careerHistory.push({kind:"mandate", office:state.office, district:state.district,
        party:state.party, result:"eleito", status:alreadyEnded?"concluído":"em curso",
        months:state.administration.month, total:state.administration.maxMonths,
        approval:round1(state.administration.approval), election:state.campaignNumber});
    }
    state.electionHistory ??= [];
    state.administration ??= null;
    if (state.careerDraft) {state.careerDraft.party ??= state.party;state.careerDraft.electorate ??= state.municipalityElectorate;}
    state.municipalityElectorate=Math.max(1000,Number(state.municipalityElectorate)||300000);
    state.integrity ??= 65;
    state.partyProfile ??= newPartyProfile(state.party);
    state.corruptionRisk ??= 0;
    state.investigation ??= 0;
    state.illicitFunds ??= 0;
    previousNational = nationalSupport();
    $("setup").classList.add("hidden");
    $("game").classList.remove("hidden");
    renderAll();
    if(state.pendingEvent !== null && state.pendingEvent !== undefined) triggerEvent(events[state.pendingEvent],state.pendingEvent);
  }
  function loadGame() {
    let raw;
    try { raw = localStorage.getItem(SAVE_KEY); }
    catch { return showToast("Navegador bloqueou o armazenamento. Importe um backup."); }
    if (!raw) return showToast("Nenhum salvamento encontrado neste dispositivo");
    try { applySave(JSON.parse(raw)); showToast("Progresso carregado"); }
    catch { showToast("Salvamento inválido; tente importar um backup"); }
  }
  function exportSave() {
    if (!state) return showToast("Comece ou carregue uma campanha primeiro");
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mandato-backup-semana-${state.week}.json`;
    document.body.appendChild(link);
    link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast("Backup exportado");
  }
  async function importSaveFile(file) {
    if (!file) return;
    try {
      if (file.size > 2_000_000) throw new Error("Arquivo muito grande");
      const data = JSON.parse(await file.text());
      applySave(data);
      writeSave(false);
      showToast("Backup importado com sucesso");
    } catch (err) { showToast(`Erro ao importar: ${err.message}`); }
  }

  function newGameConfirm() {
    if (confirm("Iniciar novo jogo e apagar o salvamento local atual? Exporte um backup antes, caso queira guardá-lo.")) {
      state = null;
      try{localStorage.removeItem(SAVE_KEY);}catch{}
      $("game").classList.add("hidden");
      $("setup").classList.remove("hidden");
    }
  }

  let toastTimer;
  function showToast(message) {
    const el = $("toast");
    el.textContent = message;
    el.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add("hidden"), 2200);
  }

  function navTo(view) {
    document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.view === view));
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    $(`${view}View`).classList.add("active");
    const labels = {
      overview: "Visão geral",
      regions: "Regiões",
      agenda: "Agenda",
      proposals: "Propostas",
      media: "Mídia",
      coalitions: "Alianças",
      integrity: "Integridade",
      government: "Mandato",
      career: "Carreira",
      debate: "Debate ao vivo"
    };
    $("pageTitle").textContent = labels[view];
  }

  function updateOfficeForm(){
    const office=selectedOffice();
    $("stateSelectLabel").classList.toggle("hidden",office==="presidente");
    $("citySelectLabel").classList.toggle("hidden",!(office==="prefeito"||office==="vereador"));
    $("electorateSelectLabel").classList.toggle("hidden",!(office==="prefeito"||office==="vereador"));
  }
  $("stateChoice").innerHTML=baseRegions.map(r=>`<option value="${r.uf}">${r.name} (${r.uf})</option>`).join("");
  $("stateChoice").value="ES";
  $("officeChoice").onchange=updateOfficeForm;
  $("stateChoice").onchange=()=>{$("cityChoice").value=citiesByState[$("stateChoice").value]||"";$("electorateChoice").value="300000";};
  updateOfficeForm();
  $("startGame").onclick = startGame;
  $("loadGameSetup").onclick = loadGame;
  $("saveGame").onclick = saveGame;
  $("saveGameTop").onclick = saveGame;
  $("exportGame").onclick = exportSave;
  $("exportGameTop").onclick = exportSave;
  $("importGameSetup").onclick = () => $("backupFile").click();
  $("backupFile").onchange = (e) => { importSaveFile(e.target.files?.[0]); e.target.value = ""; };
  $("newGame").onclick = newGameConfirm;
  $("nextTurn").onclick = takeTurn;
  document.querySelectorAll(".nav-item").forEach(b => b.onclick = () => navTo(b.dataset.view));

  window.__game = {
    spendAction(id) {
      const def = actionDefs.find(a => a.id === id);
      if (def) spendAction(def);
    },
    chooseProposal,
    negotiateCoalition,
    regionalVisit,
    integrityAction,
    governmentPolicy, cabinetAction,
    openCareer: () => navTo("career"),
    changeCareerDraft, startNextCampaign, startDebate, answerDebate, partyAction
  };
})();
