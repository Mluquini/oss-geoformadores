// =====================================================================
// GLOBO DE ANÁLOGOS: o "cérebro" do site
// Os números vêm de data/dados_reais.js, gerado pelo pipeline (scripts/01 a 05).
// O ranking de semelhança é calculado pelo pipeline (04_normalizar.py), não aqui:
// assim o site e o relatório sempre mostram os mesmos números.
// =====================================================================

// ---------- 1. CONFIGURAÇÕES ----------

const ASPECTOS = ["temperatura", "relevo", "gelo", "vento"];
const NOMES_ASPECTOS = {
  temperatura: "Temperatura",
  relevo: "Relevo",
  gelo: "Gelo",
  vento: "Vento/poeira"
};

// Cores e nomes dos tipos de ambiente
const TIPOS = {
  "deserto":   { nome: "Deserto",   cor: "#f4b544" },
  "polar":     { nome: "Polar",     cor: "#6fd3ff" },
  "vulcânico": { nome: "Vulcânico", cor: "#ff4d4d" },
  "caverna":   { nome: "Caverna",   cor: "#b388ff" }
};

// Onde a analogia falha (diferenças que nenhum lugar da Terra consegue imitar)
const FALHAS = {
  marte: [
    "<strong>Gravidade:</strong> em Marte ela é só 38% da Terra. Aqui, rovers, pessoas e poeira pesam mais de 2,5 vezes.",
    "<strong>Atmosfera:</strong> o ar de Marte é quase todo CO₂ e cerca de 100 vezes mais fino. Não dá para respirar, e a água líquida evapora ou congela rápido.",
    "<strong>Radiação:</strong> Marte não tem campo magnético global nem atmosfera grossa, então recebe muito mais radiação do Sol e do espaço."
  ],
  lua: [
    "<strong>Gravidade:</strong> na Lua ela é só 17% da Terra (cerca de 1/6). Andar, cavar e pousar funcionam de outro jeito.",
    "<strong>Atmosfera:</strong> a Lua quase não tem atmosfera (é praticamente vácuo). Não há vento, nem som, nem ar para resfriar os equipamentos.",
    "<strong>Radiação:</strong> sem atmosfera e sem campo magnético, a superfície recebe radiação direta. Além disso, o dia e a noite duram cerca de 14 dias terrestres cada."
  ]
};

// Imagens do globo (vêm da internet)
const IMG = "https://cdn.jsdelivr.net/npm/three-globe@2.45.3/example/img/";

// Os dados reais (gerados pelo pipeline)
const D = window.DADOS_REAIS;


// ---------- 2. ESTADO (o que está escolhido agora) ----------
let alvo = "marte";                            // "marte" ou "lua"
let localSelecionado = null;                   // local da Terra clicado
let tiposAtivos = new Set(Object.keys(TIPOS)); // filtros marcados
let grafico = null;                            // gráfico de radar (Chart.js)
let globo = null;                              // o globo 3D


// ---------- 3. FUNÇÕES AUXILIARES ----------

// Número no formato brasileiro (vírgula). Sem valor => "sem dado".
function fmt(x, casas = 1, unidade = "") {
  if (x === null || x === undefined || Number.isNaN(x)) return "sem dado";
  const s = x.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
  return unidade ? `${s} ${unidade}` : s;
}

function listaPt(itens) {
  if (itens.length <= 1) return itens.join("");
  return itens.slice(0, -1).join(", ") + " e " + itens[itens.length - 1];
}

function nomeAlvo() { return alvo === "marte" ? "Marte" : "a Lua"; }

function acharAlvo(id) { return D[alvo].find(a => a.id === id); }

function esc(t) {   // evita que um texto vire HTML por acidente
  return String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}


// ---------- 4. O GLOBO 3D ----------
function criarGlobo() {
  const div = document.getElementById("globo");

  if (typeof Globe === "undefined") {
    div.innerHTML = '<p style="padding:20px">Não foi possível carregar o globo. Verifique a sua conexão com a internet.</p>';
    return;
  }

  globo = new Globe(div)
    .globeImageUrl(IMG + "earth-blue-marble.jpg")      // textura da Terra
    .bumpImageUrl(IMG + "earth-topology.png")          // relevo
    .backgroundImageUrl(IMG + "night-sky.png")         // estrelas
    .width(div.clientWidth)
    .height(div.clientHeight)

    // Pontos dos locais
    .pointLat("lat")
    .pointLng("lon")
    .pointColor(l => TIPOS[l.tipo].cor)
    .pointAltitude(0.04)
    .pointRadius(0.7)
    .pointLabel(l => {
      const im = (window.IMAGENS_LUGARES || {})[l.id];
      const foto = im ? `<img src="${esc(im.arquivo)}" alt="">` : "";
      return `<div class="rotulo">${foto}<b>${esc(l.nome)}</b><br>${TIPOS[l.tipo].nome} · ${esc(l.pais)}</div>`;
    })
    .onPointClick(l => selecionarLocal(l))

    // Anel pulsando em volta do local escolhido
    .ringLat("lat")
    .ringLng("lon")
    .ringColor(() => t => `rgba(124,196,255,${1 - t})`)
    .ringMaxRadius(5)
    .ringPropagationSpeed(3)
    .ringRepeatPeriod(900);

  globo.pointOfView({ lat: 15, lng: -30, altitude: 2.3 });
  globo.controls().autoRotate = true;       // gira sozinho no começo
  globo.controls().autoRotateSpeed = 0.4;

  // Ajusta o tamanho quando a janela muda (ex.: girar o celular)
  window.addEventListener("resize", () => {
    globo.width(div.clientWidth).height(div.clientHeight);
  });

  atualizarPontos();
}

// Mostra só os pontos dos tipos marcados nos filtros
function atualizarPontos() {
  const visiveis = D.terra.filter(l => tiposAtivos.has(l.tipo));
  if (globo) globo.pointsData(visiveis);
  desenharLista(visiveis);
}


// ---------- 5. FILTROS E LISTA ----------
function criarFiltros() {
  const caixa = document.getElementById("filtros");
  for (const [id, tipo] of Object.entries(TIPOS)) {
    const label = document.createElement("label");
    label.className = "filtro";
    label.innerHTML = `<input type="checkbox" checked value="${id}">
      <span class="bolinha" style="background:${tipo.cor}"></span> ${tipo.nome}`;
    label.querySelector("input").addEventListener("change", e => {
      if (e.target.checked) tiposAtivos.add(id);
      else tiposAtivos.delete(id);
      atualizarPontos();
    });
    caixa.appendChild(label);
  }
}

function desenharLista(locais) {
  const nav = document.getElementById("lista-locais");
  nav.innerHTML = "";
  for (const l of locais) {
    const b = document.createElement("button");
    b.className = "local-btn" + (localSelecionado === l ? " selecionado" : "");
    b.innerHTML = `<span class="bolinha" style="background:${TIPOS[l.tipo].cor}"></span>${esc(l.nome)}`;
    b.addEventListener("click", () => selecionarLocal(l));
    nav.appendChild(b);
  }
}


// ---------- 6. BOTÃO MARTE / LUA ----------
function criarBotoesAlvo() {
  document.querySelectorAll(".alvo-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      alvo = btn.dataset.alvo;
      // Acende todos os botões do alvo escolhido (cabeçalho e painel)
      document.querySelectorAll(".alvo-btn").forEach(b => b.classList.toggle("ativo", b.dataset.alvo === alvo));
      if (localSelecionado) preencherPainel(localSelecionado); // recalcula
    });
  });
}


// ---------- 7. SELECIONAR UM LOCAL ----------
function selecionarLocal(local) {
  localSelecionado = local;

  if (globo) {
    globo.controls().autoRotate = false;
    globo.pointOfView({ lat: local.lat, lng: local.lon, altitude: 1.6 }, 1200);
    globo.ringsData([local]);
  }

  document.querySelectorAll(".local-btn").forEach(b => {
    b.classList.toggle("selecionado", b.textContent === local.nome);
  });

  preencherPainel(local);
  document.getElementById("painel").hidden = false;
  document.body.classList.add("painel-aberto");   // o CSS afasta o aviso do painel
}

function fecharPainel() {
  document.getElementById("painel").hidden = true;
  document.body.classList.remove("painel-aberto");
  localSelecionado = null;
  if (globo) globo.ringsData([]);
  document.querySelectorAll(".local-btn").forEach(b => b.classList.remove("selecionado"));
}


// ---------- 8. PREENCHER O PAINEL ----------

// Por que um aspecto ficou de fora da comparação?
function motivoFora(aspecto, local, alvoItem) {
  if (aspecto === "vento" && alvo === "lua") return "não se aplica: a Lua não tem atmosfera";
  const semTerra = local.notas[aspecto] == null;
  const semAlvo = alvoItem && alvoItem.notas[aspecto] == null;
  const onde = alvo === "marte" ? "em Marte" : "na Lua";
  if (semTerra && semAlvo) return "sem dado na Terra nem " + onde;
  if (semTerra) return "sem dado na Terra";
  return "sem dado " + onde;
}

// Foto do lugar + crédito (autor, licença e link de origem vêm de data/imagens.js)
function mostrarFoto(local) {
  const fig = document.getElementById("p-foto");
  const im = (window.IMAGENS_LUGARES || {})[local.id];
  if (!im) { fig.hidden = true; return; }
  const seguro = u => typeof u === "string" && u.startsWith("https://");   // só links https
  const img = document.getElementById("p-foto-img");
  img.onerror = () => { fig.hidden = true; };
  img.src = im.arquivo;
  img.alt = `Foto de ${local.nome}`;
  const lic = seguro(im.licenca_url)
    ? `<a href="${esc(im.licenca_url)}" target="_blank" rel="noopener">${esc(im.licenca)}</a>` : esc(im.licenca);
  const orig = seguro(im.origem_url)
    ? `<a href="${esc(im.origem_url)}" target="_blank" rel="noopener">Wikimedia Commons</a>` : "Wikimedia Commons";
  document.getElementById("p-foto-credito").innerHTML = `Foto: ${esc(im.autor)} · ${lic} · ${orig}`;
  fig.hidden = false;
}

function preencherPainel(local) {
  const tipo = TIPOS[local.tipo];
  const ranking = (local.ranking && local.ranking[alvo]) || [];

  // Nome, tipo e descrição
  const etiqueta = document.getElementById("p-tipo");
  etiqueta.textContent = tipo.nome;
  etiqueta.style.background = tipo.cor;
  document.getElementById("p-nome").textContent = `${local.nome} (${local.pais})`;
  document.getElementById("p-desc").textContent = local.descricao;
  mostrarFoto(local);

  // Top 3
  document.getElementById("p-titulo-top").textContent =
    `Top 3 lugares parecidos ${alvo === "marte" ? "em Marte" : "na Lua"}`;
  const ol = document.getElementById("p-top3");
  ol.innerHTML = "";
  if (!ranking.length) {
    ol.innerHTML = '<li><small>Ainda não há dado real suficiente neste local para comparar com ' + nomeAlvo() + '.</small></li>';
  }
  ranking.slice(0, 3).forEach((m, i) => {
    const a = acharAlvo(m.id) || { descricao: "", resumo: "" };
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="linha"><span>${i + 1}. ${esc(m.nome)}</span><span class="pct">${fmt(m.semelhanca, 1)}%</span></div>
      <div class="barra"><span style="width:${Math.max(0, Math.min(100, m.semelhanca))}%"></span></div>
      <small>${esc(a.descricao)}</small>
      <small class="dados">Dados reais: ${esc(a.resumo || "—")}</small>`;
    ol.appendChild(li);
  });

  // Quanto do peso original entrou na conta
  const topo = ranking[0];
  const topoAlvo = topo ? acharAlvo(topo.id) : null;
  const cob = document.getElementById("p-cobertura");
  if (topo) {
    const usados = topo.aspectos_usados.map(a => NOMES_ASPECTOS[a].toLowerCase());
    const fora = ASPECTOS.filter(a => !topo.aspectos_usados.includes(a))
      .map(a => `${NOMES_ASPECTOS[a].toLowerCase()} (${motivoFora(a, local, topoAlvo)})`);
    cob.innerHTML = `Esta comparação usa <strong>${topo.aspectos_usados.length} de ${ASPECTOS.length} aspectos</strong> ` +
      `(${fmt(100 * topo.peso_original_coberto, 0)}% do peso total): ${listaPt(usados)}. ` +
      `Ficaram de fora: ${esc(listaPt(fora))}.`;
  } else {
    cob.textContent = "";
  }

  // Gráfico de radar: Terra × o mais parecido (só os aspectos que entraram na conta)
  desenharRadar(local, topoAlvo, topo);
  document.getElementById("p-nota-lua").hidden = alvo !== "lua";

  // Valores medidos (da célula de 2° que contém o local)
  preencherValores(local);

  // Onde falha
  document.getElementById("p-falha").innerHTML = FALHAS[alvo].map(f => `<li>${f}</li>`).join("");

  // Útil para testar
  document.getElementById("p-util").textContent = local.util_para_testar[alvo];

  // Fontes dos dados
  document.getElementById("p-fontes").textContent =
    `Dados da Terra: ${D.fontes.terra.join(" · ")}` +
    (D.fontes.complementos.length ? ` · Complemento: ${D.fontes.complementos.join(" ")}` : "") +
    `. ${alvo === "marte" ? "Marte" : "Lua"}: ${D.fontes[alvo].join(" · ")}.`;

  // Volta o painel para o topo
  document.getElementById("painel").scrollTop = 0;
}

function preencherValores(local) {
  const v = local.valores || {};
  const t = document.getElementById("p-valores");
  const linhas = [
    ["Temperatura média anual", fmt(v.temperatura_C, 1, "°C")],
    ["Variação ao longo do ano (máx. − mín. mensal)", fmt(v.amplitude_C, 1, "°C")],
    ["Elevação média", fmt(v.elevacao_m, 0, "m")],
    ["Rugosidade do relevo (desvio da elevação)", fmt(v.rugosidade_m, 0, "m")],
    ["Declividade média", fmt(v.declividade_graus, 1, "°")],
    ["Fração do ano com neve", v.frac_neve == null ? "sem dado" : fmt(100 * v.frac_neve, 0, "%")],
    ["Fração do ano abaixo de 0 °C", v.frac_T_abaixo_0C == null ? "sem dado" : fmt(100 * v.frac_T_abaixo_0C, 0, "%")],
    ["Vento médio (nível mais baixo do modelo, ~50–70 m)", fmt(v.vento_ms, 1, "m/s")],
    ["Poeira em suspensão", fmt(v.poeira_ugm3, 1, "µg/m³")]
  ];
  t.innerHTML = linhas.map(([k, val]) =>
    `<tr><td>${esc(k)}</td><td class="${val === "sem dado" ? "sd" : ""}">${esc(val)}</td></tr>`).join("");

  const n = local.notas || {};
  const notas = ASPECTOS
    .map(a => `${NOMES_ASPECTOS[a].toLowerCase()} ${n[a] == null ? "sem dado" : fmt(n[a], 2)}`);
  document.getElementById("p-celula").textContent =
    local.tem_dado
      ? `Notas de 0 a 1 nas faixas fixas: ${notas.join(" · ")}. Os valores são médias de uma célula de ` +
        `${local.celula.tamanho_graus}° (~220 km) com centro em ${fmt(local.celula.lat, 0)}°, ${fmt(local.celula.lon, 0)}°, ` +
        `e não do ponto exato.`
      : "Sem dado real para este local ainda.";
}


// ---------- 9. GRÁFICO DE BARRAS (Terra × lugar mais parecido) ----------
// Antes era um gráfico de teia (radar), mas com só 2 ou 3 aspectos com dado ele virava uma linha achatada.
// Barras funcionam bem com qualquer quantidade de aspectos.
function desenharRadar(local, localAlvo, topo) {
  const nota = document.getElementById("p-nota-radar");
  if (grafico) { grafico.destroy(); grafico = null; }
  if (!topo || !localAlvo || typeof Chart === "undefined") {
    nota.textContent = "";
    return;
  }
  const corAlvo = alvo === "marte" ? "#ff7a45" : "#cfd6e4";
  const usados = topo.aspectos_usados;

  // Aspectos que não entraram na comparação ficam sem barra (nunca viram zero)
  const rotulos = ASPECTOS.map(a => usados.includes(a) ? NOMES_ASPECTOS[a] : `${NOMES_ASPECTOS[a]} (fora)`);
  const valores = n => ASPECTOS.map(a => usados.includes(a) ? n[a] : null);

  grafico = new Chart(document.getElementById("radar"), {
    type: "bar",
    data: {
      labels: rotulos,
      datasets: [
        { label: local.nome + " (Terra)", data: valores(local.notas), backgroundColor: "rgba(124,196,255,0.9)", borderRadius: 4 },
        { label: localAlvo.nome, data: valores(localAlvo.notas), backgroundColor: corAlvo + "e6", borderRadius: 4 }
      ]
    },
    options: {
      indexAxis: "y",
      maintainAspectRatio: false,
      scales: {
        x: {
          min: 0, max: 1,
          title: { display: true, text: "nota de 0 a 1", color: "#9aa6c2" },
          ticks: { color: "#9aa6c2", stepSize: 0.25, callback: v => fmt(v, 2) },
          grid: { color: "#24304d" }
        },
        y: { ticks: { color: "#e8ecf6", font: { size: 12 } }, grid: { display: false } }
      },
      plugins: {
        legend: { labels: { color: "#e8ecf6" } },
        tooltip: { callbacks: { label: c => `${c.dataset.label}: nota ${fmt(c.parsed.x, 2)}` } }
      }
    }
  });
  nota.textContent = `O gráfico mostra só os ${usados.length} aspectos que entram na comparação (nota de 0 a 1, nas faixas fixas). ` +
    `Barras do mesmo tamanho querem dizer lugares parecidos naquele aspecto.`;
}


// ---------- 10. AVISO, "COMO CALCULAMOS" E COMEÇAR ----------
function preencherSecaoComo() {
  // Pesos base (pesos do desafio sem a geologia, renormalizados para somar 100%)
  document.getElementById("tabela-pesos").innerHTML =
    "<thead><tr><th>Aspecto</th><th>Peso Marte</th><th>Peso Lua</th></tr></thead><tbody>" +
    ASPECTOS.map(a => `<tr><td>${NOMES_ASPECTOS[a]}</td><td>${fmt(100 * D.pesos.marte[a], 1)}%</td>` +
      `<td>${fmt(100 * D.pesos.lua[a], 1)}%${a === "vento" ? " (não se aplica)" : ""}</td></tr>`).join("") +
    "</tbody>";

  const f = D.faixas;
  const linhas = ["temperatura", "relevo", "gelo", "vento"].filter(k => f[k]).map(k =>
    `<tr><td>${NOMES_ASPECTOS[k]}</td><td>${fmt(f[k].min, 0)} a ${fmt(f[k].max, 0)}</td>` +
    `<td>${esc(f[k].unidade)}</td></tr>`);
  document.getElementById("tabela-faixas").innerHTML =
    "<thead><tr><th>Aspecto</th><th>Faixa</th><th>Unidade</th></tr></thead><tbody>" + linhas.join("") + "</tbody>";

  const li = [];
  li.push(`<li><strong>Terra:</strong> ${esc(D.fontes.terra.join(" · "))}.` +
    (D.fontes.complementos.length ? ` Complemento fora da NASA: ${esc(D.fontes.complementos.join(" "))}` : "") + "</li>");
  li.push(`<li><strong>Marte:</strong> ${esc(D.fontes.marte.join(" · "))}.</li>`);
  li.push(`<li><strong>Lua:</strong> ${esc(D.fontes.lua.join(" · "))}.</li>`);
  document.getElementById("lista-fontes").innerHTML = li.join("");

  document.getElementById("como-gerado").textContent =
    `Dados gerados em ${D.gerado_em}. Terra: ano(s) ${(D.anos_terra || []).join(", ")} (MODIS e MERRA-2).`;
}

function iniciar() {
  const aviso = document.getElementById("aviso");
  if (!D || !D.terra) {
    aviso.textContent = "⚠️ Não encontrei data/dados_reais.js. Rode scripts/05_exportar_site.py.";
    aviso.classList.add("erro");
    return;
  }
  aviso.textContent = (D.status.completo ? "✅ " : "⚠️ ") + D.status.texto;
  if (D.status.completo) aviso.classList.add("ok");

  criarFiltros();
  criarBotoesAlvo();
  criarGlobo();
  preencherSecaoComo();
  document.getElementById("fechar").addEventListener("click", fecharPainel);
  document.addEventListener("keydown", e => { if (e.key === "Escape") fecharPainel(); });
}

iniciar();
