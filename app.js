(() => {
  const $ = (id) => document.getElementById(id);
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const rnd = (min, max) => Math.random() * (max - min) + min;
  const round1 = (n) => Math.round(n * 10) / 10;
  const money = (n) => `R$ ${round1(n)} mi`;

  const baseRegions = [
    { id: "norte", name: "Norte", voters: 13, issue: "Infraestrutura", support: 19, undecided: 20, organization: 18, media: 0 },
    { id: "leste", name: "Leste Industrial", voters: 31, issue: "Emprego e renda", support: 22, undecided: 16, organization: 22, media: 0 },
    { id: "centro", name: "Centro Metropolitano", voters: 27, issue: "Segurança pública", support: 24, undecided: 18, organization: 20, media: 0 },
    { id: "sul", name: "Sul Agrícola", voters: 29, issue: "Custo de vida", support: 20, undecided: 19, organization: 17, media: 0 }
  ];

  const opponents = [
    { id: "helena", name: "Helena Vasconcelos", party: "União Nacional", poll: 30.5 },
    { id: "ricardo", name: "Ricardo Nunes", party: "Frente Popular", poll: 26.2 },
    { id: "sofia", name: "Sofia Amaral", party: "Movimento Futuro", poll: 12.4 }
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
      version: 1,
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
      ai: modifiers.ai,
      regions: baseRegions.map(r => ({...r, support: r.support + modifiers.support})),
      opponents: opponents.map(o => ({...o})),
      proposals: {},
      coalitions: coalitionDefs.map(c => ({...c, secured: false})),
      news: [
        { title: "Campanha oficialmente lançada", text: "A candidatura inicia a disputa nacional com 24 semanas até a votação." },
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
    if (state.finished) return;
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
    state.funds = Math.max(0, state.funds);
    state.regions.forEach(r => {
      r.support = clamp(r.support, 4, 62);
      r.organization = clamp(r.organization, 0, 100);
      r.undecided = clamp(r.undecided, 3, 28);
    });
  }

  function takeTurn() {
    if (state.finished) return;
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
    const base = nationalSupport();
    const orgBonus = (state.ground - 25) / 40;
    const repBonus = (state.reputation - 50) / 60;
    const randomShock = rnd(-1.5, 1.5);
    const finalVote = clamp(base + orgBonus + repBonus + randomShock, 5, 60);

    const rival = Math.max(...state.opponents.map(o => o.poll + rnd(-1,1)));
    const won = finalVote > rival;
    state.finished = true;
    state.week = 0;

    $("modalTitle").textContent = won ? "Vitória eleitoral" : "Fim da campanha";
    $("modalText").innerHTML = `
      <div class="election-result">
        <span>Resultado estimado</span>
        <strong>${round1(finalVote)}%</strong>
        <h3>${won ? "Você venceu a eleição." : "A candidatura não alcançou a primeira colocação."}</h3>
        <p>${won
          ? "A combinação de voto territorial, reputação e organização foi suficiente para formar a maior coalizão eleitoral."
          : "O desempenho final ficou abaixo do principal adversário. O resultado pode ser usado para recalibrar uma nova campanha."}</p>
      </div>`;
    $("modalChoices").innerHTML = "";
    const b = document.createElement("button");
    b.className = "btn btn-primary full";
    b.textContent = "Ver painel final";
    b.onclick = () => {
      $("modalBackdrop").classList.add("hidden");
      renderAll();
    };
    $("modalChoices").appendChild(b);
    $("modalBackdrop").classList.remove("hidden");
  }

  function chooseProposal(proposalId, optionId) {
    if (state.energy <= 0) return showToast("Sem pontos de agenda nesta semana");
    if (state.proposals[proposalId]) return showToast("Essa posição já foi definida");

    const proposal = proposals.find(p => p.id === proposalId);
    const option = proposal.options.find(o => o.id === optionId);
    state.proposals[proposalId] = optionId;
    state.energy--;

    state.reputation += option.rep || 0;
    state.funds += option.funds || 0;
    Object.entries(option.region || {}).forEach(([id,val]) => {
      const r = state.regions.find(x => x.id === id);
      if (r) r.support += val;
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
    $("weekDisplay").textContent = state.week;
    $("energyDisplay").textContent = `${state.energy}/${state.maxEnergy}`;
    $("campaignPhase").textContent = state.week > 16 ? "PRÉ-CAMPANHA NACIONAL" : state.week > 5 ? "CAMPANHA NACIONAL" : "RETA FINAL";
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
        <button class="btn btn-primary" ${state.finished || state.energy<=0 || state.funds<a.cost ? "disabled" : ""}
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
            ${selected || state.finished || state.energy<=0 ? "disabled" : ""}
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

  function ideologyLabel(v) {
    return {
      centro: "Centro pragmático",
      social: "Social-desenvolvimentista",
      liberal: "Liberal reformista",
      verde: "Verde progressista",
      conservador: "Conservador institucional"
    }[v] || v;
  }

  function saveGame() {
    if (!state) return;
    localStorage.setItem("mandato_save_v1", JSON.stringify(state));
    showToast("Jogo salvo neste navegador");
  }

  function loadGame() {
    const raw = localStorage.getItem("mandato_save_v1");
    if (!raw) return showToast("Nenhum salvamento encontrado");
    try {
      state = JSON.parse(raw);
      previousNational = nationalSupport();
      $("setup").classList.add("hidden");
      $("game").classList.remove("hidden");
      renderAll();
      showToast("Salvamento carregado");
    } catch {
      showToast("Salvamento inválido");
    }
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
      coalitions: "Alianças"
    };
    $("pageTitle").textContent = labels[view];
  }

  $("startGame").onclick = startGame;
  $("loadGameSetup").onclick = loadGame;
  $("saveGame").onclick = saveGame;
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
    regionalVisit
  };
})();
