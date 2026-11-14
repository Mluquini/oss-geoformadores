// =====================================================================
// MODO "PLANEJAR MISSÃO" (busca reversa): a TELA.
// As contas ficam em busca.js; aqui só ligamos botões, sliders, mapa de calor, marcadores e painéis.
// Este arquivo não muda nada do modo Explorar: ele só liga e desliga camadas do globo quando você troca de modo.
// Usa funções e variáveis do script.js: D, globo, esc, fmt, t, L, fecharPainel, atualizarPontos.
// Todos os textos vêm de i18n.js; ao trocar o idioma (evento idiomaMudou) tudo é redesenhado.
// =====================================================================
(function () {
  "use strict";

  const B = window.BUSCA;
  const PACOTE = window.CELULAS_TERRA;
  const btnModoPlanejar = document.getElementById("modo-planejar");

  // Sem dados ou sem busca.js: esconde o botão e deixa o modo Explorar como está.
  if (!B || !PACOTE || typeof D === "undefined" || !D || !D.terra) {
    if (btnModoPlanejar) btnModoPlanejar.hidden = true;
    return;
  }

  // ---------- elementos ----------
  const $ = id => document.getElementById(id);
  const el = {
    explorar: $("modo-explorar"), planejar: btnModoPlanejar, plano: $("plano"), fecharPlano: $("plano-fechar"),
    abaReal: $("aba-real"), abaCustom: $("aba-custom"), blocoReal: $("bloco-real"), blocoCustom: $("bloco-custom"),
    menuReal: $("alvo-real-menu"), infoReal: $("alvo-real-info"), modelos: $("modelos"), sliders: $("sliders"),
    resumo: $("plano-resumo"), resultados: $("plano-resultados"), legenda: $("plano-legenda"),
    legMin: $("leg-min"), legMax: $("leg-max"), detalhe: $("plano-detalhe"), fecharDetalhe: $("plano-detalhe-fechar")
  };

  // ---------- estado ----------
  const celulas = B.prepararCelulas(PACOTE, D.faixas, D.faixas_busca);
  const sitios = D.terra.map(x => ({ id: x.id, nome: x.nome, lat: x.lat, lon: x.lon }));   // nome = { pt, en }
  let modo = "explorar";
  let tipoAlvo = "real";             // "real" | "custom"
  let modeloAtivo = null;
  const entradas = {};               // alvo personalizado: { aspecto: { valor, imp, ativo } }
  let alvo = null;                   // { notas, pesos, valores }
  let resultados = [];               // todas as células comparadas (ordenadas)
  let top = [];                      // Top 5 (regiões agrupadas)
  let selecionado = -1;
  let graficoPD = null;
  let temporizador = null;
  const cacheMaterial = {};
  // A biblioteca não expõe o three.js. Guardamos UMA vez o material padrão dela (antes de trocarmos o accessor)
  // e clonamos esse material, só mudando a cor.
  let materialBase = null;
  if (globo) {
    const acessor = globo.tileMaterial();
    materialBase = typeof acessor === "function" ? acessor({}) : acessor;
  }

  // ---------- pequenas ajudas ----------
  const dir = k => t("dir." + k);
  const coordTxt = (lat, lon) => `${Math.abs(lat)}°${dir(lat >= 0 ? "N" : "S")}, ${Math.abs(lon)}°${dir(lon >= 0 ? "E" : "W")}`;
  const nomeAspecto = id => t("pasp." + id);
  const minusc = txt => txt.toLocaleLowerCase(I18N.locale());
  const pct1 = x => x.toLocaleString(I18N.locale(), { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const nomeRegiao = r => (r.nov.novidade ? B.textoDoNome(r.nome) : L(r.nov.sitio.nome));   // nome do resultado

  // ---------- 1. Troca de modo ----------
  function ajustarTopo() {
    const topo = document.querySelector(".topo");
    const h = topo ? Math.max(0, Math.round(topo.getBoundingClientRect().bottom)) : 0;
    document.documentElement.style.setProperty("--topo-h", h + "px");
  }

  const subtitulo = document.querySelector(".titulo p");
  const rotularSubtitulo = () => { if (subtitulo) subtitulo.textContent = t(modo === "planejar" ? "plan.sub" : "app.sub"); };

  function entrarPlanejar() {
    if (modo === "planejar") return;
    modo = "planejar";
    rotularSubtitulo();
    document.body.classList.add("modo-planejar");
    el.explorar.classList.remove("ativo"); el.planejar.classList.add("ativo");
    if (typeof fecharPainel === "function") fecharPainel();         // fecha o painel do modo Explorar
    if (globo) { globo.pointsData([]); globo.ringsData([]); globo.controls().autoRotate = false; }
    el.plano.hidden = false;
    el.legenda.hidden = false;
    ajustarTopo();
    recalcular();
  }

  function sairPlanejar() {
    if (modo !== "planejar") return;
    modo = "explorar";
    rotularSubtitulo();
    document.body.classList.remove("modo-planejar");
    el.planejar.classList.remove("ativo"); el.explorar.classList.add("ativo");
    el.plano.hidden = true; el.legenda.hidden = true; el.detalhe.hidden = true;
    selecionado = -1;
    if (globo) { globo.tilesData([]); globo.htmlElementsData([]); globo.ringsData([]); }
    if (typeof atualizarPontos === "function") atualizarPontos();   // os pins do modo Explorar voltam
  }

  // ---------- 2. Alvo real (menu) ----------
  function montarMenuReal() {
    const anterior = el.menuReal.value || "marte:jezero";
    const grupo = (corpo, lista) =>
      `<optgroup label="${esc(t("body." + corpo))}">` + lista.map(a => `<option value="${corpo}:${esc(a.id)}">${esc(L(a.nome))}</option>`).join("") + "</optgroup>";
    el.menuReal.innerHTML = grupo("marte", D.marte) + grupo("lua", D.lua);
    el.menuReal.value = anterior;
  }

  function alvoRealEscolhido() {
    const [corpo, id] = el.menuReal.value.split(":");
    const item = D[corpo].find(a => a.id === id);
    return { corpo, item, alvo: B.alvoReal(item, D.pesos[corpo], D.faixas, D.faixas_busca) };
  }

  // ---------- 3. Alvo personalizado (sliders) ----------
  function iniciarEntradas() {
    B.ASPECTOS.forEach(a => { entradas[a.id] = { valor: a.slider.inicial, imp: 2, ativo: false }; });
  }

  function linhaSlider(a) {
    const s = a.slider;
    const nome = nomeAspecto(a.id);
    const div = document.createElement("div");
    div.className = "sl-linha off";
    div.dataset.aspecto = a.id;
    div.innerHTML = `
      <div class="sl-topo"><span class="sl-rot">${esc(nome)}</span><span class="sl-valor">${esc(t("sl.any"))}</span></div>
      <input type="range" min="${s.min}" max="${s.max}" step="${s.passo}" value="${s.inicial}" aria-label="${esc(nome)}">
      <div class="sl-rodape">
        <label><input type="checkbox" class="sl-tf" checked> ${esc(t("sl.any"))}</label>
        <label>${esc(t("sl.imp"))}
          <select class="sl-imp" aria-label="${esc(t("sl.imp.aria", { name: nome }))}">
            ${B.IMPORTANCIA.map(n => `<option value="${n}"${n === 2 ? " selected" : ""}>${esc(t("imp." + n))}</option>`).join("")}
          </select></label>
      </div>`;
    const faixa = div.querySelector("input[type=range]");
    const tf = div.querySelector(".sl-tf");
    const imp = div.querySelector(".sl-imp");
    faixa.addEventListener("input", () => {
      entradas[a.id].valor = parseFloat(faixa.value);
      entradas[a.id].ativo = true; tf.checked = false;          // mexeu no controle: o aspecto passa a valer
      semModelo(); pintarLinha(a.id); agendar();
    });
    tf.addEventListener("change", () => { entradas[a.id].ativo = !tf.checked; semModelo(); pintarLinha(a.id); agendar(); });
    imp.addEventListener("change", () => { entradas[a.id].imp = parseInt(imp.value, 10); semModelo(); agendar(); });
    return div;
  }

  function montarSliders() {
    const grupos = {};
    B.ASPECTOS.forEach(a => { (grupos[a.grupo] = grupos[a.grupo] || []).push(a); });
    el.sliders.innerHTML = "";
    Object.keys(grupos).forEach(nome => {
      const g = document.createElement("div");
      g.className = "sl-grupo";
      g.innerHTML = `<h4>${esc(t("pgrp." + nome))}</h4>`;
      grupos[nome].forEach(a => g.appendChild(linhaSlider(a)));
      el.sliders.appendChild(g);
    });
  }

  function pintarLinha(id) {
    const linha = el.sliders.querySelector(`[data-aspecto="${id}"]`);
    if (!linha) return;
    const e = entradas[id];
    linha.classList.toggle("off", !e.ativo);
    linha.querySelector(".sl-valor").textContent = e.ativo ? B.formatarValor(id, e.valor) : t("sl.any");
    linha.querySelector("input[type=range]").value = e.valor;
    linha.querySelector(".sl-tf").checked = !e.ativo;
    linha.querySelector(".sl-imp").value = String(e.imp);
  }

  function montarModelos() {
    el.modelos.innerHTML = "";
    B.MODELOS.forEach(m => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "modelo-btn" + (m.id === modeloAtivo ? " ativo" : ""); b.dataset.modelo = m.id;
      b.title = t("model." + m.id + ".desc");
      b.textContent = t("model." + m.id + ".title");
      b.addEventListener("click", () => aplicarModelo(m));
      el.modelos.appendChild(b);
    });
  }

  function aplicarModelo(m) {
    B.ASPECTOS.forEach(a => {
      const v = m.valores[a.id];
      if (v) entradas[a.id] = { valor: v.valor, imp: v.imp, ativo: true };
      else entradas[a.id].ativo = false;
      pintarLinha(a.id);
    });
    modeloAtivo = m.id;
    el.modelos.querySelectorAll(".modelo-btn").forEach(b => b.classList.toggle("ativo", b.dataset.modelo === m.id));
    recalcular();
  }

  function semModelo() {
    modeloAtivo = null;
    el.modelos.querySelectorAll(".modelo-btn").forEach(b => b.classList.remove("ativo"));
  }

  function alvoPersonalizadoAtual() {
    const ativos = {};
    B.ASPECTOS.forEach(a => { if (entradas[a.id].ativo) ativos[a.id] = { valor: entradas[a.id].valor, imp: entradas[a.id].imp }; });
    return { alvo: B.alvoPersonalizado(ativos, D.faixas, D.faixas_busca), nAtivos: Object.keys(ativos).length };
  }

  // ---------- 4. Cálculo ----------
  function agendar() { clearTimeout(temporizador); temporizador = setTimeout(recalcular, 140); }

  function recalcular() {
    if (modo !== "planejar") return;
    let descricao = "";
    el.infoReal.textContent = "";
    if (tipoAlvo === "real") {
      const r = alvoRealEscolhido();
      alvo = r.alvo;
      const tem = B.ASPECTOS.filter(a => alvo.pesos[a.id] > 0).map(a => minusc(nomeAspecto(a.id)));
      el.infoReal.innerHTML = t("plan.real.info", { text: esc(L(r.item.descricao)) + "<br>", list: esc(I18N.lista(tem)), body: t("bodyof." + r.corpo) });
      descricao = L(r.item.nome);
    } else {
      const p = alvoPersonalizadoAtual();
      alvo = p.nAtivos ? p.alvo : null;
      descricao = t("plan.custom.name");
    }

    if (!alvo) {
      resultados = []; top = [];
      el.resumo.textContent = t("plan.pick");
      desenharLista(); desenharGlobo(); fecharDetalhe();
      return;
    }

    resultados = B.buscar(alvo, celulas);
    top = B.agrupar(resultados, 5, 5).map((r, i) => Object.assign(r, {
      rank: i + 1, nome: B.nomeAproximado(r.cel.lat, r.cel.lon), nov: B.ehNovidade(r.cel.lat, r.cel.lon, sitios, 3)
    }));

    const ativos = B.ASPECTOS.filter(a => alvo.pesos[a.id] > 0).map(a => minusc(nomeAspecto(a.id)));
    let txt = t("plan.summary", { desc: descricao, list: I18N.lista(ativos), n: resultados.length });
    if ((PACOTE.total_celulas_no_grid || 0) < 5000) txt += t("plan.limit", { n: PACOTE.total_celulas_no_grid });
    el.resumo.textContent = txt;
    selecionado = -1;
    desenharLista(); desenharGlobo(); fecharDetalhe();
  }

  // ---------- 5. Lista do Top 5 ----------
  function desenharLista() {
    el.resultados.innerHTML = "";
    if (!top.length) {
      if (alvo) el.resultados.innerHTML = `<li class="nota">${esc(t("plan.none"))}</li>`;
      return;
    }
    top.forEach((r, i) => {
      const li = document.createElement("li");
      const b = document.createElement("button");
      b.type = "button"; b.className = "res-card" + (i === selecionado ? " ativo" : "");
      const nome = nomeRegiao(r);
      const selo = r.nov.novidade ? `<span class="selo novidade">${esc(t("badge.new"))}</span>`
                                  : `<span class="selo conhecido">${esc(t("badge.known"))}</span>`;
      b.innerHTML = `<span class="res-num">${r.rank}</span>
        <span class="res-corpo"><span class="res-nome">${esc(nome)}</span><br>
        <span class="res-sub">${selo}${esc(coordTxt(r.cel.lat, r.cel.lon))}</span></span>
        <span class="res-pct">${pct1(r.pct)}%</span>`;
      b.addEventListener("click", () => selecionar(i));
      li.appendChild(b);
      el.resultados.appendChild(li);
    });
  }

  // ---------- 6. Globo: mapa de calor e marcadores ----------
  // Paleta tipo "inferno" (roxo -> magenta -> laranja -> amarelo claro): contrasta com o azul do mar e o verde da terra.
  const PARADAS = [[0, [45, 15, 87]], [0.34, [181, 54, 122]], [0.7, [249, 142, 9]], [1, [252, 255, 164]]];
  function corCalor(t) {
    t = Math.max(0, Math.min(1, t));
    for (let i = 1; i < PARADAS.length; i++) {
      if (t <= PARADAS[i][0]) {
        const [t0, c0] = PARADAS[i - 1], [t1, c1] = PARADAS[i];
        const k = (t - t0) / (t1 - t0);
        const c = c0.map((v, j) => Math.round(v + (c1[j] - v) * k));
        return "#" + c.map(v => v.toString(16).padStart(2, "0")).join("");
      }
    }
    return "#fcffa4";
  }

  function materialDaCor(hex) {
    if (!cacheMaterial[hex]) {
      const m = materialBase.clone();
      m.color.set(hex); m.opacity = 0.85; m.transparent = true;
      cacheMaterial[hex] = m;
    }
    return cacheMaterial[hex];
  }

  function desenharGlobo() {
    if (!globo || !materialBase) return;
    if (!resultados.length) { globo.tilesData([]); globo.htmlElementsData([]); el.legenda.hidden = true; return; }
    el.legenda.hidden = false;
    // Cores RELATIVAS: do pior ao melhor lugar calculado (senão quase tudo ficaria da mesma cor)
    const pcts = resultados.map(r => r.pct);
    const hi = Math.max.apply(null, pcts), lo = Math.min.apply(null, pcts);
    const passo = hi - lo || 1;
    el.legMin.textContent = t("legend.min", { pct: Math.round(lo) });
    el.legMax.textContent = t("legend.max", { pct: Math.round(hi) });
    const ladrilhos = resultados.map(r => ({ lat: r.cel.lat, lng: r.cel.lon, cor: corCalor((r.pct - lo) / passo) }));
    globo.tilesTransitionDuration(0)
      .tilesData(ladrilhos).tileLat("lat").tileLng("lng").tileWidth(2).tileHeight(2).tileAltitude(0.012)
      .tileMaterial(d => materialDaCor(d.cor));

    top.forEach((r, i) => {
      const m = document.createElement("div");
      m.className = "marcador-top" + (r.nov.novidade ? " novidade" : "") + (i === selecionado ? " ativo" : "");
      m.textContent = String(r.rank);
      m.title = t("marker.title", { rank: r.rank, name: nomeRegiao(r), pct: pct1(r.pct) });
      m.style.pointerEvents = "auto";
      m.addEventListener("click", ev => { ev.stopPropagation(); selecionar(i); });
      r.elemento = m;
    });
    globo.htmlElementsData(top).htmlLat(d => d.cel.lat).htmlLng(d => d.cel.lon).htmlAltitude(0.03)
      .htmlElement(d => d.elemento);
  }

  // ---------- 7. Selecionar um resultado: voa até o local e abre o painel ----------
  function selecionar(i) {
    selecionado = i;
    const r = top[i];
    if (globo) {
      globo.pointOfView({ lat: r.cel.lat, lng: r.cel.lon, altitude: 1.5 }, 1200);
      globo.ringsData([{ lat: r.cel.lat, lon: r.cel.lon }]);
    }
    el.resultados.querySelectorAll(".res-card").forEach((b, k) => b.classList.toggle("ativo", k === i));
    top.forEach((x, k) => { if (x.elemento) x.elemento.classList.toggle("ativo", k === i); });
    abrirDetalhe(r);
  }

  function fecharDetalhe() {
    el.detalhe.hidden = true;
    selecionado = -1;
    if (globo) globo.ringsData([]);
    el.resultados.querySelectorAll(".res-card").forEach(b => b.classList.remove("ativo"));
    top.forEach(x => { if (x.elemento) x.elemento.classList.remove("ativo"); });
  }

  // ---------- 8. Painel de detalhe do resultado ----------
  function abrirDetalhe(r) {
    const nome = nomeRegiao(r);
    $("pd-selos").innerHTML = r.nov.novidade
      ? `<span class="selo novidade">${esc(t("badge.new"))}</span><span class="selo conhecido">${esc(t("badge.outside"))}</span>`
      : `<span class="selo conhecido">${esc(t("badge.known2", { name: L(r.nov.sitio.nome) }))}</span>`;
    $("pd-nome").textContent = t("pd.name", { rank: r.rank, name: nome });
    $("pd-coord").textContent = r.vizinhas > 1
      ? t("pd.coord.n", { coord: coordTxt(r.cel.lat, r.cel.lon), n: r.vizinhas })
      : t("pd.coord", { coord: coordTxt(r.cel.lat, r.cel.lon) });

    // Foto: só para lugares que já estão no site (as fotos são desses 12)
    const fig = $("pd-foto");
    const im = !r.nov.novidade && window.IMAGENS_LUGARES ? window.IMAGENS_LUGARES[r.nov.sitio.id] : null;
    if (im) {
      const img = $("pd-foto-img");
      img.onerror = () => { fig.hidden = true; };
      img.src = im.arquivo; img.alt = t("photo.alt", { name: L(r.nov.sitio.nome) });
      $("pd-foto-credito").textContent = t("photo.credit", { author: im.autor, lic: im.licenca, src: t("photo.source") });
      fig.hidden = false;
    } else { fig.hidden = true; }

    $("pd-pct").innerHTML = t("pd.pct", { pct: pct1(r.pct) });
    const pedidos = B.ASPECTOS.filter(a => alvo.pesos[a.id] > 0).map(a => a.id);
    const faltam = pedidos.filter(id => r.usados.indexOf(id) < 0);
    $("pd-cobertura").textContent = t("pd.cov", { n: r.usados.length, total: pedidos.length, pct: Math.round(100 * r.cobertura) }) +
      (faltam.length ? t("pd.cov.missing", { list: I18N.lista(faltam.map(id => minusc(nomeAspecto(id)))) }) : "");

    desenharGraficoPD(r);

    const an = B.analisar(alvo, r.cel, D.faixas, D.faixas_busca);
    const frase = i => t("pd.line", { label: nomeAspecto(i.id), a: B.formatarValor(i.id, i.valorAlvo), b: B.formatarValor(i.id, i.valorLugar) });
    const lista = (id, itens, vazio) => {
      $(id).innerHTML = itens.length
        ? itens.map(i => `<li>${esc(frase(i))} <small>(${esc(t("cat." + i.categoria))})</small></li>`).join("")
        : `<li>${esc(vazio)}</li>`;
    };
    lista("pd-combina", an.combina, t("pd.match.empty"));
    lista("pd-nao-combina", an.naoCombina, t("pd.nomatch.empty"));
    $("pd-testes").innerHTML = B.testesRecomendados(an).map(k => `<li>${esc(t(k))}</li>`).join("");
    $("pd-fontes").textContent = t("pd.fontes");
    el.detalhe.hidden = false;
    el.detalhe.scrollTop = 0;
  }

  function desenharGraficoPD(r) {
    if (graficoPD) { graficoPD.destroy(); graficoPD = null; }
    const nota = $("pd-nota-grafico");
    if (typeof Chart === "undefined") { nota.textContent = ""; return; }
    const ids = r.usados;
    const rot = ids.map(id => nomeAspecto(id));
    const dAlvo = ids.map(id => alvo.notas[id]);
    const dLugar = ids.map(id => r.cel.notas[id]);
    const usarRadar = ids.length >= 3;           // radar com 1 ou 2 eixos vira só uma linha: nesse caso, barras
    const conj = [
      { label: t("pd.chart.target"), data: dAlvo, borderColor: "#ff8a5b", backgroundColor: usarRadar ? "rgba(255,138,91,0.22)" : "rgba(255,138,91,0.9)", pointBackgroundColor: "#ff8a5b" },
      { label: t("pd.chart.here"), data: dLugar, borderColor: "#7cc4ff", backgroundColor: usarRadar ? "rgba(124,196,255,0.22)" : "rgba(124,196,255,0.9)", pointBackgroundColor: "#7cc4ff" }
    ];
    const comum = { labels: rot, datasets: conj };
    if (usarRadar) {
      graficoPD = new Chart($("pd-grafico"), {
        type: "radar", data: comum,
        options: { maintainAspectRatio: false,
          scales: { r: { min: 0, max: 1, ticks: { stepSize: 0.25, display: false }, grid: { color: "#24304d" },
                         angleLines: { color: "#24304d" }, pointLabels: { color: "#e8ecf6", font: { size: 12 } } } },
          plugins: { legend: { labels: { color: "#e8ecf6" } } } }
      });
    } else {
      graficoPD = new Chart($("pd-grafico"), {
        type: "bar", data: comum,
        options: { indexAxis: "y", maintainAspectRatio: false,
          scales: { x: { min: 0, max: 1, ticks: { color: "#9aa6c2", stepSize: 0.25, callback: v => fmt(v, 2) }, grid: { color: "#24304d" },
                         title: { display: true, text: t("chart.axis"), color: "#9aa6c2" } },
                    y: { ticks: { color: "#e8ecf6" }, grid: { display: false } } },
          plugins: { legend: { labels: { color: "#e8ecf6" } } } }
      });
    }
    nota.textContent = t("pd.chart.note", { n: ids.length });
  }

  // ---------- 9. Ligações ----------
  function trocarTipo(tipo) {
    tipoAlvo = tipo;
    el.abaReal.classList.toggle("ativo", tipo === "real");
    el.abaCustom.classList.toggle("ativo", tipo === "custom");
    el.blocoReal.hidden = tipo !== "real";
    el.blocoCustom.hidden = tipo !== "custom";
    recalcular();
  }

  function iniciarPlanejador() {
    iniciarEntradas();
    montarMenuReal();
    montarSliders();
    montarModelos();
    el.menuReal.addEventListener("change", recalcular);
    el.abaReal.addEventListener("click", () => trocarTipo("real"));
    el.abaCustom.addEventListener("click", () => trocarTipo("custom"));
    el.planejar.addEventListener("click", entrarPlanejar);
    el.explorar.addEventListener("click", sairPlanejar);
    el.fecharPlano.addEventListener("click", sairPlanejar);
    el.fecharDetalhe.addEventListener("click", fecharDetalhe);
    document.addEventListener("keydown", e => { if (e.key === "Escape" && modo === "planejar") fecharDetalhe(); });
    window.addEventListener("resize", ajustarTopo);
    window.addEventListener("scroll", ajustarTopo, { passive: true });
    document.addEventListener("idiomaMudou", aoMudarIdioma);
  }

  // Troca de idioma: refaz menus, controles, resultados e o painel aberto (sem mexer na câmera do globo)
  function aoMudarIdioma() {
    rotularSubtitulo();
    montarMenuReal();
    montarSliders();
    B.ASPECTOS.forEach(a => pintarLinha(a.id));
    montarModelos();
    if (modo !== "planejar") return;
    const sel = selecionado;
    recalcular();
    if (sel >= 0 && top[sel]) {
      selecionado = sel;
      el.resultados.querySelectorAll(".res-card").forEach((b, k) => b.classList.toggle("ativo", k === sel));
      top.forEach((x, k) => { if (x.elemento) x.elemento.classList.toggle("ativo", k === sel); });
      if (globo) globo.ringsData([{ lat: top[sel].cel.lat, lon: top[sel].cel.lon }]);
      abrirDetalhe(top[sel]);
    }
  }

  iniciarPlanejador();

  // Gancho só para testes automáticos no navegador (não é usado pelo site)
  window.PLANEJAR_DEBUG = { entrar: entrarPlanejar, sair: sairPlanejar, trocarTipo, aplicarModelo,
                            estado: () => ({ modo, tipoAlvo, top, resultados: resultados.length, alvo, selecionado }), selecionar };
})();
