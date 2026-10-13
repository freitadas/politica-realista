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

  const opponents = [
    { id: "lula", name: "Luiz Inácio Lula da Silva", party: "PT", poll: 30.5 },
    { id: "flavio", name: "Flávio Bolsonaro", party: "PL", poll: 26.2 },
    { id: "caiado", name: "Ronaldo Caiado", party: "PSD", poll: 12.4 }
  ];

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

    return {
      version: 4,
      phase: "campaign",
      office: "presidente",
      administration: null,
      electionHistory: [],
      candidate: $("candidateName").value.trim() || "Alex Moreira",
      party: $("partyName").value.trim() || "Aliança Cívica",
      ideology,
      difficulty: diff,
      week: 24,
      energy: 3,
      maxEnergy: 3,
      funds: modifiers.funds + bonus.funds,
      reputation: 52 + bonus.rep,
      media: bonus.media,
      ground: 24,
      digital: 20,
      debate: 35,
      scandal: 6,
      integrity: 65,
      corruptionRisk: 0,
      investigation: 0,
      illicitFunds: 0,
      ai: modifiers.ai,
      regions: baseRegions.map(r => ({...r, support: r.support + modifiers.support})),
      opponents: opponents.map(o => ({...o})),
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
    state.investigation = clamp(state.investigation ?? 0, 0, 100);
    state.funds = Math.max(0, state.funds);
    state.regions.forEach(r => {
      r.support = clamp(r.support, 4, 62);
      r.organization = clamp(r.organization, 0, 100);
      r.undecided = clamp(r.undecided, 3, 28);
    });
  }

  function takeTurn() {
    if (state.finished) return;
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

    state.opponents.forEach((o, idx) => {
      o.poll = clamp(o.poll + rnd(-.6,.8) + state.ai * rnd(0,.3), 8, 40);
    });

    state.funds += 0.8 + state.ground / 160 + Math.max(0, state.reputation - 50) / 90;
    resolveIntegrityTurn();
    state.media *= .82;
    state.week--;
    state.turns++;
    state.energy = state.maxEnergy;

    if (state.turns % 3 === 0) {
      triggerEvent(events[Math.floor(Math.random()*events.length)]);
    } else {
      addNews("Nova rodada de pesquisas", "Institutos registram pequenas oscilações após mais uma semana de campanha.");
    }

    normalize();
    renderAll();
  }

  function triggerEvent(event) {
    $("modalTitle").textContent = event.title;
    $("modalText").textContent = event.text;
    $("modalChoices").innerHTML = "";
    event.choices.forEach(choice => {
      const b = document.createElement("button");
      b.className = "choice-btn";
      b.innerHTML = `<strong>${choice.label}</strong><span>${choice.hint}</span>`;
      b.onclick = () => {
        choice.effect(state);
        normalize();
        $("modalBackdrop").classList.add("hidden");
        renderAll();
      };
      $("modalChoices").appendChild(b);
    });
    $("modalBackdrop").classList.remove("hidden");
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
    state.electionHistory.push({round:1,results:estimates});
    state.week=0;
    if (estimates[0].votes>50) return concludeElection(estimates[0].name === state.candidate,estimates[0].votes,1);
    const finalist=estimates.slice(0,2);
    if(!finalist.some(c=>c.name===state.candidate)) return concludeElection(false,estimates.find(c=>c.name===state.candidate).votes,1);
    state.phase="runoff";
    state.runoffRival=finalist.find(c=>c.name!==state.candidate).name;
    state.energy=3;
    state.week=2;
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
    state.electionHistory.push({round:2,results:[{name:state.candidate,votes:round1(share)},{name:state.runoffRival,votes:round1(100-share)}]});
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
    if(won) {
      state.phase="government";
      state.administration={month:1,maxMonths:48,approval:clamp(state.reputation+5,30,80),congress:46,
        inflation:5.8,unemployment:8.4,gdp:1.6,debt:74,health:48,education:49,security:45,
        budget:80,coalition:0,policies:[],history:[]};
      state.energy=3;
      addNews("Posse presidencial fictícia",`Vitória com ${round1(percent)}% no ${round}º turno. Começa a fase de governo.`);
      showDecision("Eleição vencida",`Você obteve ${round1(percent)}% dos votos na simulação. O mandato começa agora: governe por 48 meses.`,"Assumir presidência",()=>navTo("government"));
    } else {
      state.phase="ended"; state.finished=true;
      showDecision("Derrota eleitoral",`Sua candidatura terminou com ${round1(percent)}% no ${round}º turno da eleição simulada.`,"Ver resultados",()=>navTo("overview"));
    }
    renderAll();
  }

  const policyDefs=[
    {id:"health",title:"Expandir atenção básica",desc:"Melhora saúde, requer orçamento.",cost:9,congress:2,approval:2,health:8,debt:1.1},
    {id:"education",title:"Investir na educação",desc:"Amplia escolas e qualificação.",cost:8,congress:1,approval:2,education:8,debt:0.8},
    {id:"security",title:"Programa integrado de segurança",desc:"Coordenação e prevenção.",cost:7,congress:1,approval:1,security:8,debt:0.5},
    {id:"tax",title:"Reforma tributária",desc:"Melhora arrecadação, exige base parlamentar.",cost:2,congress:-6,approval:-1,debt:-2,gdp:.4},
    {id:"jobs",title:"Plano de emprego e infraestrutura",desc:"Gera empregos com custo fiscal.",cost:12,congress:1,approval:2,unemployment:-.7,gdp:.6,debt:1.3},
    {id:"austerity",title:"Ajuste fiscal",desc:"Reduz dívida, mas provoca desgaste.",cost:0,congress:-3,approval:-4,debt:-3,inflation:-.3,gdp:-.3}
  ];
  function governmentPolicy(id){
    const g=state?.administration,p=policyDefs.find(x=>x.id===id);
    if(!g || !p || state.energy<1 || g.budget<p.cost)return showToast("Ações ou orçamento insuficientes");
    state.energy--;g.budget-=p.cost;
    const votes=clamp(g.congress+g.coalition+rnd(-12,12),0,100);
    if(votes<50){g.approval-=1;addNews("Projeto rejeitado no Congresso",`A proposta “${p.title}” não obteve votos suficientes (${Math.round(votes)}% de apoio).`);renderAll();return;}
    for(const [key,val] of Object.entries(p))if(typeof val==="number"&&key!=="cost"&&key!=="congress")g[key]=(g[key]||0)+val;
    g.congress=clamp(g.congress+p.congress,0,100);
    g.policies.push({month:g.month,title:p.title,votes:Math.round(votes)});
    addNews("Projeto aprovado",`${p.title}: aprovado com ${Math.round(votes)}% de apoio simulado no Congresso.`);
    renderAll();
  }
  function cabinetAction(type){
    const g=state?.administration;if(!g || state.energy<1)return;
    state.energy--;
    if(type==="coalition") {g.coalition=clamp(g.coalition+7,0,25);g.congress=clamp(g.congress+3,0,100);g.approval-=1;addNews("Acordo parlamentar fictício","A base de sustentação do governo aumenta.");}
    if(type==="transparent") {state.integrity=clamp(state.integrity+9,0,100);state.corruptionRisk=clamp(state.corruptionRisk-10,0,100);g.approval+=2;addNews("Portal de transparência","Controle social e fiscalização administrativa reforçados.");}
    if(type==="communicate") {g.approval+=2;g.budget=Math.max(0,g.budget-2);addNews("Prestação de contas","Governo apresentou resultados e desafios à população.");}
    normalize();renderAll();
  }
  function governmentTurn(){
    const g=state.administration;if(!g || state.finished)return;
    const shock=rnd(-1,1);g.approval=clamp(g.approval+shock+(g.gdp-1.5)/4-(g.inflation-5)/6-(g.unemployment-8)/5-(state.investigation||0)/125,0,100);
    g.inflation=clamp(g.inflation+rnd(-.4,.45),0,30);g.unemployment=clamp(g.unemployment+rnd(-.3,.3),1,30);
    g.gdp=clamp(g.gdp+rnd(-.2,.2),-8,12);g.debt=clamp(g.debt+(.15+(g.inflation-5)/70),0,160);
    g.budget+=7;g.congress=clamp(g.congress+rnd(-2,2),0,100);
    resolveIntegrityTurn();g.history.push({month:g.month,approval:round1(g.approval),inflation:round1(g.inflation)});
    if(g.month>=g.maxMonths){state.finished=true;state.phase="ended";showDecision("Fim do mandato",`Aprovação final de ${round1(g.approval)}%. Você aprovou ${g.policies.length} projetos. O resultado de sua gestão foi registrado no histórico.`,"Ver balanço",()=>navTo("government"));}
    else {g.month++;state.energy=3;addNews("Novo mês de governo",`Mês ${g.month} de 48: inflação ${round1(g.inflation)}%, desemprego ${round1(g.unemployment)}%.`);}
    renderAll();
  }
  function renderGovernment(){
    const el=$("governmentContent");if(!el)return;
    const g=state.administration;
    if(!g){el.innerHTML='<div class="panel">Vença a eleição para assumir a presidência. Após a posse você poderá governar por 48 meses.</div>';return;}
    const metric=(name,v,unit="")=>`<div class="metric-card"><span>${name}</span><strong>${round1(v)}${unit}</strong></div>`;
    el.innerHTML=`<div class="metric-grid" style="margin-top:0">
      ${metric("Aprovação",g.approval,"%")}${metric("Inflação (simulada)",g.inflation,"%")}${metric("Desemprego (simulado)",g.unemployment,"%")}${metric("PIB (crescimento simulado)",g.gdp,"%")}
      ${metric("Dívida pública/PIB",g.debt,"%")}${metric("Base no Congresso",g.congress+g.coalition,"%")}${metric("Orçamento do mandato",g.budget," bi")}${metric("Mês de governo",g.month," / 48")}
    </div>
    <div class="panel" style="margin-top:14px"><h3>Políticas públicas</h3><p>Votações simuladas dependem da força da base parlamentar. Cada proposta custa 1 ação.</p><div class="action-grid">${policyDefs.map(p=>`<div class="action-card"><div><h4>${p.title}</h4><p>${p.desc} Custo: ${p.cost} bilhões fictícios.</p></div><button class="btn btn-primary" ${state.energy<1||g.budget<p.cost||state.finished?'disabled':''} onclick="window.__game.governmentPolicy('${p.id}')">Propor</button></div>`).join('')}</div></div>
    <div class="panel" style="margin-top:14px"><h3>Gabinete e governabilidade</h3><div class="card-actions"><button class="btn" onclick="window.__game.cabinetAction('coalition')" ${state.energy<1||state.finished?'disabled':''}>Negociar base</button><button class="btn" onclick="window.__game.cabinetAction('transparent')" ${state.energy<1||state.finished?'disabled':''}>Fiscalização e transparência</button><button class="btn" onclick="window.__game.cabinetAction('communicate')" ${state.energy<1||state.finished?'disabled':''}>Prestar contas</button></div><p>Projetos aprovados: ${g.policies.length} • Saúde ${Math.round(g.health)} • Educação ${Math.round(g.education)} • Segurança ${Math.round(g.security)}</p></div>`;
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
    const gain = rnd(18, 34) + state.reputation / 15;
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
    $("candidateSubtitle").textContent = `${state.party} · ${ideologyLabel(state.ideology)}`;
    $("nationalPoll").textContent = `${round1(nat)}%`;
    $("fundsMetric").textContent = money(state.funds);
    $("reputationMetric").textContent = Math.round(state.reputation);
    $("mediaMetric").textContent = `${state.media >= 0 ? "+" : ""}${round1(state.media)}`;
    $("mediaMetric").className = state.media > 2 ? "positive" : state.media < -2 ? "negative" : "";
    $("groundMetric").textContent = Math.round(state.ground);
    $("weekDisplay").textContent = state.phase === "government" ? `${state.administration.month}/48` : state.week;
    $("energyDisplay").textContent = `${state.energy}/${state.maxEnergy}`;
    $("campaignPhase").textContent = state.phase === "government" ? "GOVERNO FEDERAL · SIMULAÇÃO" : state.phase === "runoff" ? "SEGUNDO TURNO" : state.week > 16 ? "PRÉ-CAMPANHA NACIONAL" : state.week > 5 ? "CAMPANHA NACIONAL" : "RETA FINAL";
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
    $("nextTurn").textContent=state.phase==="government"?"Avançar um mês":state.phase==="runoff"?"Avançar segundo turno":"Avançar uma semana";
    writeSave(false);
  }

  function renderPolls(nat) {
    const candidates = [
      { name: state.candidate, poll: nat, you: true },
      ...state.opponents.map(o => ({name:o.name, poll:o.poll, you:false}))
    ].sort((a,b) => b.poll-a.poll);

    $("pollBars").innerHTML = candidates.map(c => `
      <div class="poll-row ${c.you ? "you" : ""}">
        <div class="poll-label"><span>${c.name}</span><strong>${round1(c.poll)}%</strong></div>
        <div class="poll-track"><div class="poll-fill" style="width:${clamp(c.poll*2.2, 3, 100)}%"></div></div>
      </div>`).join("");
  }

  function renderIssues() {
    const dynamic = [...issues].map((x,i) => ({...x, weight: x.weight + rnd(-1.2,1.2)})).sort((a,b) => b.weight-a.weight);
    $("issueList").innerHTML = dynamic.map((x,i) => `
      <div class="issue">
        <div class="issue-rank">${i+1}</div>
        <div><strong>${x.name}</strong><small>${Math.round(x.weight)}% citam como prioridade</small></div>
      </div>`).join("");
  }

  function renderNews() {
    $("newsFeed").innerHTML = state.news.map(n => `
      <div class="news-item"><strong>${n.title}</strong><p>${n.text}</p></div>`).join("");
  }

  function renderRegions() {
    $("regionGrid").innerHTML = state.regions.map(r => `
      <div class="region-card">
        <div class="card-top">
          <div>
            <h4>${r.name}</h4>
            <p>Tema dominante: ${r.issue}</p>
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

  function renderCoalitions() {
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
    if (!state || state.finished) return;
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
        <div class="action-card"><div><h4>Rejeitar oferta irregular</h4><p>Um personagem fictício oferece verba não declarada. Recuse e registre a tentativa.</p><div class="action-meta"><span class="mini-chip">1 ação</span><span class="mini-chip">aumenta integridade</span></div></div><button class="btn btn-primary" ${state.energy<1||state.finished?'disabled':''} onclick="window.__game.integrityAction('reject')">Recusar</button></div>
        <div class="action-card"><div><h4>Auditar as contas</h4><p>Contrate fiscalização interna fictícia e reduza exposição a irregularidades.</p><div class="action-meta"><span class="mini-chip">1 ação</span><span class="mini-chip">R$ 0,8 mi</span></div></div><button class="btn btn-primary" ${state.energy<1||state.funds<.8||state.finished?'disabled':''} onclick="window.__game.integrityAction('audit')">Auditar</button></div>
        <div class="action-card"><div><h4>Aceitar caixa dois (fictício)</h4><p>Receba recursos simulados não declarados: caixa aumenta, mas há risco de investigação, sanções e perda de votos. Não representa acusação contra pessoa ou partido real.</p><div class="action-meta"><span class="mini-chip">1 ação</span><span class="mini-chip">risco alto</span></div></div><button class="btn btn-danger" ${state.energy<1||state.finished?'disabled':''} onclick="window.__game.integrityAction('illegal')">Aceitar</button></div>
      </div>`;
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
      Array.isArray(obj.regions) && (obj.regions.length === 4 || obj.regions.length === 27) &&
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
    state.phase ??= state.finished ? "ended":"campaign";
    state.electionHistory ??= [];
    state.administration ??= null;
    state.integrity ??= 65;
    state.corruptionRisk ??= 0;
    state.investigation ??= 0;
    state.illicitFunds ??= 0;
    previousNational = nationalSupport();
    $("setup").classList.add("hidden");
    $("game").classList.remove("hidden");
    renderAll();
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
    if (confirm("Iniciar uma nova campanha? O estado atual não salvo será perdido.")) {
      state = null;
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
      government: "Presidência"
    };
    $("pageTitle").textContent = labels[view];
  }

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
    governmentPolicy, cabinetAction
  };
})();
