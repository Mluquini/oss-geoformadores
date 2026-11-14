// =====================================================================
// GLOBO DE ANÁLOGOS: o "cérebro" do site (modo Explorar)
// Todos os textos vêm de i18n.js (inglês e português) e de data/textos (nomes e descrições { pt, en }).
// Os números vêm de data/dados_reais.js, gerado pelo pipeline (scripts/01 a 05).
// O ranking de semelhança é calculado pelo pipeline (04_normalizar.py), não aqui:
// assim o site e o relatório sempre mostram os mesmos números.
// =====================================================================

// ---------- 1. CONFIGURAÇÕES ----------

const ASPECTOS = ["temperatura", "relevo", "gelo", "vento"];
const nomeAsp = a => t("asp." + a);   // nome do aspecto no idioma escolhido

// Cores dos tipos de ambiente (o nome de cada tipo vem de i18n.js: type.<id>)
const TIPOS = {
  "deserto":   { cor: "#f4b544" },
  "polar":     { cor: "#6fd3ff" },
  "vulcânico": { cor: "#ff4d4d" },
  "caverna":   { cor: "#b388ff" }
};
const nomeTipo = id => t("type." + id);

// Onde a analogia falha (diferenças que nenhum lugar da Terra consegue imitar): textos fail.marte.1... em i18n.js
const FALHAS = ["1", "2", "3"];

// Imagens do globo (vêm da internet)
const IMG = "https://cdn.jsdelivr.net/npm/three-globe@2.45.3/example/img/";

// Os dados reais (gerados pelo pipeline)
const D = window.DADOS_REAIS;

// Atalhos do módulo de idiomas
const t = (k, p) => I18N.t(k, p);
const L = o => I18N.L(o);


// ---------- 2. ESTADO (o que está escolhido agora) ----------
let alvo = "marte";                            // "marte" ou "lua"
let localSelecionado = null;                   // local da Terra clicado
let tiposAtivos = new Set(Object.keys(TIPOS)); // filtros marcados
let grafico = null;                            // gráfico de radar (Chart.js)
let globo = null;                              // o globo 3D


// ---------- 3. FUNÇÕES AUXILIARES ----------

// Número no formato do idioma escolhido (1.5 / 1,5). Sem valor => "no data" / "sem dado".
function fmt(x, casas = 1, unidade = "") {
  if (x === null || x === undefined || Number.isNaN(x)) return t("nodata");
  const s = x.toLocaleString(I18N.locale(), { minimumFractionDigits: casas, maximumFractionDigits: casas });
  return unidade ? `${s} ${unidade}` : s;
}

const semDado = v => v === null || v === undefined || Number.isNaN(v);

function acharAlvo(id) { return D[alvo].find(a => a.id === id); }
const ondeAlvo = () => t("where." + alvo);   // "on Mars" / "on the Moon"

function esc(t) {   // evita que um texto vire HTML por acidente
  return String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}


// ---------- 4. O GLOBO 3D ----------
function criarGlobo() {
  const div = document.getElementById("globo");

  if (typeof Globe === "undefined") {
    div.innerHTML = `<p style="padding:20px">${esc(t("err.globe"))}</p>`;
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
      return `<div class="rotulo">${foto}<b>${esc(L(l.nome))}</b><br>${esc(nomeTipo(l.tipo))} · ${esc(L(l.pais))}</div>`;
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
  caixa.innerHTML = "";
  for (const [id, tipo] of Object.entries(TIPOS)) {
    const label = document.createElement("label");
    label.className = "filtro";
    label.innerHTML = `<input type="checkbox" ${tiposAtivos.has(id) ? "checked" : ""} value="${id}">
      <span class="bolinha" style="background:${tipo.cor}"></span> ${esc(nomeTipo(id))}`;
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
    b.dataset.id = l.id;
    b.innerHTML = `<span class="bolinha" style="background:${TIPOS[l.tipo].cor}"></span>${esc(L(l.nome))}`;
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
    b.classList.toggle("selecionado", b.dataset.id === local.id);
  });

  preencherPainel(local);
  document.getElementById("painel").hidden = false;
}

function fecharPainel() {
  document.getElementById("painel").hidden = true;
  localSelecionado = null;
  if (globo) globo.ringsData([]);
  document.querySelectorAll(".local-btn").forEach(b => b.classList.remove("selecionado"));
}


// ---------- 8. PREENCHER O PAINEL ----------

// Por que um aspecto ficou de fora da comparação?
function motivoFora(aspecto, local, alvoItem) {
  if (aspecto === "vento" && alvo === "lua") return t("why.moonwind");
  const semTerra = local.notas[aspecto] == null;
  const semAlvo = alvoItem && alvoItem.notas[aspecto] == null;
  if (semTerra && semAlvo) return t("why.both", { where: ondeAlvo() });
  if (semTerra) return t("why.earth");
  return t("why.target", { where: ondeAlvo() });
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
  img.alt = t("photo.alt", { name: L(local.nome) });
  const lic = seguro(im.licenca_url)
    ? `<a href="${esc(im.licenca_url)}" target="_blank" rel="noopener">${esc(im.licenca)}</a>` : esc(im.licenca);
  const orig = seguro(im.origem_url)
    ? `<a href="${esc(im.origem_url)}" target="_blank" rel="noopener">${esc(t("photo.source"))}</a>` : esc(t("photo.source"));
  document.getElementById("p-foto-credito").innerHTML = t("photo.credit", { author: esc(im.autor), lic, src: orig });
  fig.hidden = false;
}

function resumoAlvo(a) {
  // Frase "Dados reais: ..." montada a partir dos NÚMEROS do alvo (nada de texto pronto vindo do pipeline)
  const v = a.valores || {};
  const p = [];
  if (!semDado(v.temperatura_C)) {
    p.push(t("res.temp", { v: fmt(v.temperatura_C, 0) }) +
      (semDado(v.temperatura_max_C) ? "" : ` (${t("res.tempmax", { v: fmt(v.temperatura_max_C, 0) })})`));
  }
  if (!semDado(v.relevo_m)) p.push(t("res.relevo", { v: fmt(v.relevo_m, 0) }));
  if (!semDado(v.agua_pct)) p.push(t("res.agua", { v: fmt(v.agua_pct, 1) }));
  if (!semDado(v.armadilha_fria_pct)) p.push(t("res.frio", { v: fmt(v.armadilha_fria_pct, 0) }));
  return p.join(" · ") || "—";
}

function preencherPainel(local) {
  const tipo = TIPOS[local.tipo];
  const ranking = (local.ranking && local.ranking[alvo]) || [];

  // Nome, tipo e descrição
  const etiqueta = document.getElementById("p-tipo");
  etiqueta.textContent = nomeTipo(local.tipo);
  etiqueta.style.background = tipo.cor;
  document.getElementById("p-nome").textContent = `${L(local.nome)} (${L(local.pais)})`;
  document.getElementById("p-desc").textContent = L(local.descricao);
  mostrarFoto(local);

  // Top 3
  document.getElementById("p-titulo-top").textContent = t("top.title." + alvo);
  const ol = document.getElementById("p-top3");
  ol.innerHTML = "";
  if (!ranking.length) {
    ol.innerHTML = `<li><small>${esc(t("top.empty", { body: t("top.empty." + alvo) }))}</small></li>`;
  }
  ranking.slice(0, 3).forEach((m, i) => {
    const a = acharAlvo(m.id);
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="linha"><span>${i + 1}. ${esc(L(a.nome))}</span><span class="pct">${fmt(m.semelhanca, 1)}%</span></div>
      <div class="barra"><span style="width:${Math.max(0, Math.min(100, m.semelhanca))}%"></span></div>
      <small>${esc(L(a.descricao))}</small>
      <small class="dados">${esc(t("top.real", { text: resumoAlvo(a) }))}</small>`;
    ol.appendChild(li);
  });

  // Quanto do peso original entrou na conta
  const topo = ranking[0];
  const topoAlvo = topo ? acharAlvo(topo.id) : null;
  const cob = document.getElementById("p-cobertura");
  if (topo) {
    const usados = topo.aspectos_usados.map(a => nomeAsp(a).toLowerCase());
    const fora = ASPECTOS.filter(a => !topo.aspectos_usados.includes(a))
      .map(a => `${nomeAsp(a).toLowerCase()} (${motivoFora(a, local, topoAlvo)})`);
    cob.innerHTML = t("cov.text", { n: topo.aspectos_usados.length, total: ASPECTOS.length,
      pct: fmt(100 * topo.peso_original_coberto, 0), used: esc(I18N.lista(usados)), out: esc(I18N.lista(fora)) });
  } else {
    cob.textContent = "";
  }

  // Gráfico de barras: Terra × o mais parecido (só os aspectos que entraram na conta)
  desenharRadar(local, topoAlvo, topo);
  document.getElementById("p-nota-lua").hidden = alvo !== "lua";

  // Valores medidos (da célula de 2° que contém o local)
  preencherValores(local);

  // Onde falha
  document.getElementById("p-falha").innerHTML = FALHAS.map(n => `<li>${t("fail." + alvo + "." + n)}</li>`).join("");

  // Útil para testar
  document.getElementById("p-util").textContent = L(local.util_para_testar[alvo]);

  // Fontes dos dados
  document.getElementById("p-fontes").textContent = t("src.line", {
    terra: textoFontesTerra(), comp: textoComplementos(true), body: t("body." + alvo), alvo: D.fontes[alvo].join(" · ") });

  // Volta o painel para o topo
  document.getElementById("painel").scrollTop = 0;
}

// Produtos da Terra: "Temperature: MOD11C3 v061 · ..." (nomes de produto não são traduzidos)
function textoFontesTerra() {
  return D.fontes.terra.map(f => `${nomeAsp(f.aspecto)}: ${f.produto} v${f.versao}`).join(" · ");
}
function textoComplementos(comPrefixo) {
  const c = (D.fontes.complementos || []).map(k => t("comp." + k));
  if (!c.length) return "";
  return comPrefixo ? t("src.comp", { text: c.join(" · ") }) : c.join(" · ");
}

function preencherValores(local) {
  const v = local.valores || {};
  const t_ = document.getElementById("p-valores");
  const pct = x => semDado(x) ? t("nodata") : fmt(100 * x, 0, "%");
  const linhas = [
    [t("val.temp"), fmt(v.temperatura_C, 1, "°C")],
    [t("val.amp"), fmt(v.amplitude_C, 1, "°C")],
    [t("val.elev"), fmt(v.elevacao_m, 0, "m")],
    [t("val.rug"), fmt(v.rugosidade_m, 0, "m")],
    [t("val.slope"), fmt(v.declividade_graus, 1, "°")],
    [t("val.snow"), pct(v.frac_neve)],
    [t("val.t0"), pct(v.frac_T_abaixo_0C)],
    [t("val.wind"), fmt(v.vento_ms, 1, "m/s")],
    [t("val.dust"), fmt(v.poeira_ugm3, 1, "µg/m³")]
  ];
  t_.innerHTML = linhas.map(([k, val]) =>
    `<tr><td>${esc(k)}</td><td class="${val === t("nodata") ? "sd" : ""}">${esc(val)}</td></tr>`).join("");

  const n = local.notas || {};
  const notas = ASPECTOS.map(a => `${nomeAsp(a).toLowerCase()} ${n[a] == null ? t("nodata") : fmt(n[a], 2)}`);
  document.getElementById("p-celula").textContent = local.tem_dado
    ? t("cell.note", { notas: notas.join(" · "), size: local.celula.tamanho_graus, lat: fmt(local.celula.lat, 0), lon: fmt(local.celula.lon, 0) })
    : t("cell.nodata");
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
  const rotulos = ASPECTOS.map(a => usados.includes(a) ? nomeAsp(a) : t("chart.out", { asp: nomeAsp(a) }));
  const valores = n => ASPECTOS.map(a => usados.includes(a) ? n[a] : null);

  grafico = new Chart(document.getElementById("radar"), {
    type: "bar",
    data: {
      labels: rotulos,
      datasets: [
        { label: t("chart.earth", { name: L(local.nome) }), data: valores(local.notas), backgroundColor: "rgba(124,196,255,0.9)", borderRadius: 4 },
        { label: L(localAlvo.nome), data: valores(localAlvo.notas), backgroundColor: corAlvo + "e6", borderRadius: 4 }
      ]
    },
    options: {
      indexAxis: "y",
      maintainAspectRatio: false,
      scales: {
        x: {
          min: 0, max: 1,
          title: { display: true, text: t("chart.axis"), color: "#9aa6c2" },
          ticks: { color: "#9aa6c2", stepSize: 0.25, callback: v => fmt(v, 2) },
          grid: { color: "#24304d" }
        },
        y: { ticks: { color: "#e8ecf6", font: { size: 12 } }, grid: { display: false } }
      },
      plugins: {
        legend: { labels: { color: "#e8ecf6" } },
        tooltip: { callbacks: { label: c => t("chart.tip", { label: c.dataset.label, v: fmt(c.parsed.x, 2) }) } }
      }
    }
  });
  nota.textContent = t("chart.note", { n: usados.length });
}


// ---------- 10. AVISO, "COMO CALCULAMOS" E COMEÇAR ----------
function preencherSecaoComo() {
  // Pesos base (pesos do desafio sem a geologia, renormalizados para somar 100%)
  document.getElementById("tabela-pesos").innerHTML =
    `<thead><tr><th>${esc(t("th.aspect"))}</th><th>${esc(t("th.wmars"))}</th><th>${esc(t("th.wmoon"))}</th></tr></thead><tbody>` +
    ASPECTOS.map(a => `<tr><td>${esc(nomeAsp(a))}</td><td>${fmt(100 * D.pesos.marte[a], 1)}%</td>` +
      `<td>${fmt(100 * D.pesos.lua[a], 1)}%${a === "vento" ? " " + esc(t("na")) : ""}</td></tr>`).join("") +
    "</tbody>";

  const f = D.faixas;
  const linhas = ASPECTOS.filter(k => f[k]).map(k =>
    `<tr><td>${esc(nomeAsp(k))}</td><td>${fmt(f[k].min, 0)} – ${fmt(f[k].max, 0)}</td>` +
    `<td>${esc(t("unit." + k))}</td></tr>`);
  document.getElementById("tabela-faixas").innerHTML =
    `<thead><tr><th>${esc(t("th.aspect"))}</th><th>${esc(t("th.range"))}</th><th>${esc(t("th.unit"))}</th></tr></thead><tbody>` +
    linhas.join("") + "</tbody>";

  const li = [];
  li.push(`<li><strong>${esc(t("src.earth"))}:</strong> ${esc(textoFontesTerra())}.` +
    (D.fontes.complementos.length ? ` ${esc(t("src.nonnasa", { text: textoComplementos(false) }))}.` : "") + "</li>");
  li.push(`<li><strong>${esc(t("src.mars"))}:</strong> ${esc(D.fontes.marte.join(" · "))}.</li>`);
  li.push(`<li><strong>${esc(t("src.moon"))}:</strong> ${esc(D.fontes.lua.join(" · "))}.</li>`);
  document.getElementById("lista-fontes").innerHTML = li.join("");

  // Frase de status montada no idioma escolhido, a partir dos números e códigos do pipeline
  const st = D.status;
  const lista = ids => I18N.lista(ids.map(a => nomeAsp(a).toLowerCase()));
  let status = t("status.base", { n: st.n_com, total: st.n_total, mars: lista(st.marte_usa), moon: lista(st.lua_usa) });
  if (st.terra_sem_dado.length) status += t("status.missing", { list: lista(st.terra_sem_dado) });
  document.getElementById("como-gerado").textContent =
    t("como.generated", { status, date: D.gerado_em, years: (D.anos_terra || []).join(", ") });
}

// Guia de uso: botão que abre e fecha o cartão; lembra a escolha (e começa fechado no celular)
let guiaAberto = true;
function rotularGuia() {
  const btn = document.getElementById("guia-btn");
  if (btn) btn.textContent = t(guiaAberto ? "guide.close" : "guide.open");
}
function criarGuia() {
  const btn = document.getElementById("guia-btn");
  const corpo = document.getElementById("guia-corpo");
  if (!document.getElementById("guia") || !btn || !corpo) return;
  guiaAberto = window.innerWidth > 700;
  try {
    const salvo = localStorage.getItem("guia-aberto");
    if (salvo !== null) guiaAberto = salvo === "1";
  } catch (e) { /* sem armazenamento: usa o padrão */ }
  function mostrar() {
    corpo.hidden = !guiaAberto;
    btn.setAttribute("aria-expanded", String(guiaAberto));
    rotularGuia();
  }
  btn.addEventListener("click", () => {
    guiaAberto = !guiaAberto;
    mostrar();
    try { localStorage.setItem("guia-aberto", guiaAberto ? "1" : "0"); } catch (e) { /* ignora */ }
  });
  mostrar();
}

function iniciar() {
  criarGuia();
  if (!D || !D.terra) {
    document.getElementById("globo").innerHTML =
      `<p style="padding:56px 20px 20px;color:#ff9a9a">${esc(t("err.data"))}</p>`;
    return;
  }

  criarFiltros();
  criarBotoesAlvo();
  criarGlobo();
  preencherSecaoComo();
  document.getElementById("fechar").addEventListener("click", fecharPainel);
  document.addEventListener("keydown", e => { if (e.key === "Escape") fecharPainel(); });

  // Troca de idioma: redesenha tudo o que o JavaScript escreveu (os textos fixos do HTML o i18n.js troca sozinho)
  document.addEventListener("idiomaMudou", () => {
    rotularGuia();
    criarFiltros();
    desenharLista(D.terra.filter(l => tiposAtivos.has(l.tipo)));   // só a lista: os pins do globo não mudam
    preencherSecaoComo();
    if (localSelecionado) preencherPainel(localSelecionado);
  });
}

iniciar();
