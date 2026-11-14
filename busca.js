// =====================================================================
// BUSCA REVERSA ("Planejar missão"): a parte que faz as CONTAS, sem mexer na tela.
//
// A pergunta aqui é invertida: em vez de "este lugar da Terra se parece com qual lugar de Marte?",
// é "o que a missão precisa → onde na Terra eu testo?". Os números da Terra vêm de data/celulas.js
// (células de 2°) e as faixas físicas fixas vêm de data/dados_reais.js (as MESMAS do resto do site).
//
// Este arquivo não usa o DOM: dá para testar com o Node (veja tests/busca.teste.js).
// =====================================================================
(function (raiz) {
  "use strict";

  // ---------- 1. Os aspectos que o usuário pode pedir ----------
  // slider = faixa do controle (igual à faixa física fixa, para o controle não prometer o que não existe).
  // Atenção: "gelo" é digitado em % (0 a 100) e vira fração 0-1 na conta; "geologia" é o índice de quartzo do ASTER
  // (só existe para a Terra: serve para um alvo personalizado, não é comparável com Marte e Lua).
  // tol = diferença (na unidade do controle) que AINDA consideramos "parecida". Serve só para escrever as frases de
  // "onde combina / onde não combina": a % de semelhança continua usando as faixas físicas fixas do site. A faixa de
  // temperatura (-250 a 100 °C) é larguíssima, então 12 °C vira só 3% na escala 0-1 e enganaria a frase.
  // Os valores de tol são julgamento nosso (revisáveis), não limites científicos.
  // Os NOMES (rótulos) dos aspectos e grupos não ficam aqui: vêm de i18n.js (pasp.<id> e pgrp.<grupo>), nos dois idiomas.
  const ASPECTOS = [
    { id: "temperatura", grupo: "temperatura", unidade: "°C", casas: 0,
      faixaDe: "temperatura", tol: 8, slider: { min: -250, max: 100, passo: 1, inicial: -20 } },
    { id: "amplitude", grupo: "temperatura", unidade: "°C", casas: 0,
      faixaDe: "amplitude", tol: 8, slider: { min: 0, max: 60, passo: 1, inicial: 20 } },
    { id: "relevo", grupo: "relevo", unidade: "m", casas: 0,
      faixaDe: "relevo", tol: 250, slider: { min: 0, max: 3000, passo: 50, inicial: 300 } },
    { id: "gelo", grupo: "gelo", unidade: "%", casas: 0, fator: 100,
      faixaDe: "gelo", tol: 15, slider: { min: 0, max: 100, passo: 5, inicial: 50 } },
    { id: "geologia", grupo: "geologia", unidade: "", casas: 3,
      faixaDe: "geologia", tol: 0.01, slider: { min: 0.99, max: 1.10, passo: 0.005, inicial: 1.0 } },
    { id: "vento", grupo: "vento", unidade: "m/s", casas: 1,
      faixaDe: "vento", tol: 2, slider: { min: 0, max: 12, passo: 0.5, inicial: 6 } },
    { id: "poeira", grupo: "vento", unidade: "µg/m³", casas: 0,
      faixaDe: "poeira", tol: 30, slider: { min: 0, max: 300, passo: 5, inicial: 50 } }
  ];
  const POR_ID = {};
  ASPECTOS.forEach(a => { POR_ID[a.id] = a; });

  const IMPORTANCIA = [1, 2, 3];   // vira peso 1, 2 ou 3 (nomes: imp.1, imp.2, imp.3 em i18n.js)

  // ---------- 2. Modelos prontos (valores SUGERIDOS por nós, não são dados: o usuário pode mexer em tudo depois) ----------
  // Título e descrição de cada modelo: i18n.js (model.<id>.title e model.<id>.desc).
  // valor = unidade do controle; imp = importância (1 a 3). Aspecto que não aparece fica em "tanto faz".
  const MODELOS = [
    { id: "rover",
      valores: { relevo: { valor: 1500, imp: 3 }, poeira: { valor: 60, imp: 1 } } },
    { id: "isru",
      valores: { gelo: { valor: 60, imp: 3 }, temperatura: { valor: -20, imp: 2 }, relevo: { valor: 100, imp: 1 } } },
    { id: "frio",
      valores: { temperatura: { valor: -50, imp: 3 }, amplitude: { valor: 40, imp: 2 },
                 vento: { valor: 8, imp: 2 }, gelo: { valor: 80, imp: 1 } } },
    { id: "pouso",
      valores: { relevo: { valor: 50, imp: 3 }, vento: { valor: 3, imp: 2 }, poeira: { valor: 20, imp: 1 } } }
  ];

  // ---------- 3. Contas básicas ----------
  function normalizar(x, faixa) {            // 0 a 1 dentro da faixa fixa; fora da faixa, corta em 0 ou 1
    if (x === null || x === undefined || Number.isNaN(x) || !faixa) return null;
    return Math.max(0, Math.min(1, (x - faixa.min) / (faixa.max - faixa.min)));
  }

  function faixaDoAspecto(id, faixas, faixasBusca) {
    const nome = POR_ID[id].faixaDe;
    return (faixas && faixas[nome]) || (faixasBusca && faixasBusca[nome]) || null;
  }

  // Valor do controle (ex.: 60 %) -> nota 0-1
  function paraNota(id, valorUI, faixas, faixasBusca) {
    const a = POR_ID[id];
    const v = a.fator ? valorUI / a.fator : valorUI;
    return normalizar(v, faixaDoAspecto(id, faixas, faixasBusca));
  }

  // Nota 0-1 -> valor "equivalente" na unidade do controle (usado para explicar o alvo em palavras)
  function deNota(id, nota, faixas, faixasBusca) {
    if (nota === null || nota === undefined) return null;
    const f = faixaDoAspecto(id, faixas, faixasBusca);
    const v = f.min + nota * (f.max - f.min);
    return POR_ID[id].fator ? v * POR_ID[id].fator : v;
  }

  // Idioma e textos vêm do i18n.js quando ele existe (no navegador); nos testes com Node, inglês.
  const I = () => raiz.I18N || null;
  const loc = () => (I() ? I().locale() : "en-US");
  const idi = () => (I() ? I().idioma() : "en");

  function formatarValor(id, v) {
    if (v === null || v === undefined || Number.isNaN(v)) return I() ? I().t("nodata") : "no data";
    const a = POR_ID[id];
    const s = v.toLocaleString(loc(), { minimumFractionDigits: a.casas, maximumFractionDigits: a.casas });
    return a.unidade ? `${s} ${a.unidade}` : s;
  }

  function distanciaGraus(lat1, lon1, lat2, lon2) {   // distância no círculo máximo, em graus de arco
    const r = Math.PI / 180;
    const c = Math.sin(lat1 * r) * Math.sin(lat2 * r) +
              Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.cos((lon2 - lon1) * r);
    return Math.acos(Math.max(-1, Math.min(1, c))) / r;
  }

  // ---------- 4. Células da Terra ----------
  // Valor "físico" de cada aspecto numa célula. Gelo = média da fração com neve e da fração abaixo de 0 °C
  // (a MESMA definição do resto do site).
  function valorDaCelula(cel, id) {
    switch (id) {
      case "temperatura": return cel.temp;
      case "amplitude": return cel.amp;
      case "relevo": return cel.rug;
      case "gelo": {
        const p = [cel.neve, cel.t0].filter(v => v !== null && v !== undefined);
        return p.length ? 100 * p.reduce((s, v) => s + v, 0) / p.length : null;   // em %
      }
      case "geologia": return cel.qi;
      case "vento": return cel.vento;
      case "poeira": return cel.poeira;
      default: return null;
    }
  }

  // data/celulas.js tem listas compactas; aqui viram objetos com as notas já calculadas.
  function prepararCelulas(pacote, faixas, faixasBusca) {
    const nomes = pacote.campos;
    return pacote.dados.map(linha => {
      const c = {};
      nomes.forEach((n, i) => { c[n] = linha[i]; });
      // Só vale como "terra" quem tem temperatura, relevo ou neve (célula de mar só tem vento e poeira)
      c.terra = c.temp !== null || c.rug !== null || c.neve !== null;
      c.valores = {};
      c.notas = {};
      ASPECTOS.forEach(a => {
        const v = valorDaCelula(c, a.id);
        c.valores[a.id] = v;
        c.notas[a.id] = v === null ? null : paraNota(a.id, v, faixas, faixasBusca);
      });
      return c;
    });
  }

  // ---------- 5. Alvos ----------
  // Alvo personalizado: entradas = { aspecto: { valor, imp } }; aspecto ausente = "tanto faz".
  function alvoPersonalizado(entradas, faixas, faixasBusca) {
    const notas = {}, pesos = {}, valores = {};
    ASPECTOS.forEach(a => {
      const e = entradas[a.id];
      if (e && e.valor !== null && e.valor !== undefined && !Number.isNaN(e.valor)) {
        notas[a.id] = paraNota(a.id, e.valor, faixas, faixasBusca);
        pesos[a.id] = e.imp || 1;
        valores[a.id] = e.valor;
      } else {
        notas[a.id] = null; pesos[a.id] = 0; valores[a.id] = null;
      }
    });
    return { notas, pesos, valores };
  }

  // Alvo real (Marte ou Lua): usa as notas reais dos nossos JSONs e os MESMOS pesos do resto do site.
  // Aspectos que o alvo real não tem (amplitude, geologia, poeira, ou sem dado) ficam de fora.
  function alvoReal(local, pesosDoCorpo, faixas, faixasBusca) {
    const notas = {}, pesos = {}, valores = {};
    ASPECTOS.forEach(a => {
      const n = local.notas ? local.notas[a.id] : undefined;
      if (n !== null && n !== undefined && pesosDoCorpo[a.id] > 0) {
        notas[a.id] = n; pesos[a.id] = pesosDoCorpo[a.id]; valores[a.id] = deNota(a.id, n, faixas, faixasBusca);
      } else {
        notas[a.id] = null; pesos[a.id] = 0; valores[a.id] = null;
      }
    });
    return { notas, pesos, valores };
  }

  // ---------- 6. Semelhança (a MESMA fórmula do resto do site) ----------
  // semelhança = 100% × (1 − √( Σ peso' × (nota_alvo − nota_lugar)² )), com peso' renormalizado entre os
  // aspectos que existem nos DOIS lados. Aspecto "tanto faz" (sem peso) ou sem dado fica de fora.
  function similaridade(alvo, notasCel) {
    let soma = 0, somaAtiva = 0;
    const usados = [];
    ASPECTOS.forEach(a => {
      const w = alvo.pesos[a.id];
      if (!(w > 0) || alvo.notas[a.id] === null) return;
      somaAtiva += w;
      if (notasCel[a.id] === null || notasCel[a.id] === undefined) return;
      usados.push(a.id);
      soma += w;
    });
    if (!usados.length) return null;
    let d2 = 0;
    usados.forEach(id => { d2 += (alvo.pesos[id] / soma) * Math.pow(alvo.notas[id] - notasCel[id], 2); });
    return { pct: 100 * (1 - Math.sqrt(d2)), usados, cobertura: soma / somaAtiva };
  }

  // Compara o alvo com TODAS as células de terra. Célula que não consegue avaliar pelo menos 60% do que o
  // usuário pediu (em peso) fica de fora, para não ganhar "no escuro".
  function buscar(alvo, celulas, coberturaMinima) {
    const minimo = coberturaMinima === undefined ? 0.6 : coberturaMinima;
    const saida = [];
    celulas.forEach(c => {
      if (!c.terra) return;
      const s = similaridade(alvo, c.notas);
      if (s && s.cobertura >= minimo) saida.push({ cel: c, pct: s.pct, usados: s.usados, cobertura: s.cobertura });
    });
    saida.sort((x, y) => y.pct - x.pct);
    return saida;
  }

  // ---------- 7. Agrupar células vizinhas (para o Top 5 não repetir a mesma região) ----------
  function agrupar(resultados, n, raioGraus) {
    const total = n || 5, raio = raioGraus || 5;
    const escolhidos = [];
    for (const r of resultados) {
      if (escolhidos.length >= total) break;
      if (escolhidos.some(e => distanciaGraus(e.cel.lat, e.cel.lon, r.cel.lat, r.cel.lon) < raio)) continue;
      // Quantas células vizinhas parecidas formam esta região (até 3 pontos abaixo da melhor)
      const vizinhas = resultados.filter(o =>
        distanciaGraus(o.cel.lat, o.cel.lon, r.cel.lat, r.cel.lon) < raio && o.pct >= r.pct - 3).length;
      escolhidos.push(Object.assign({}, r, { vizinhas }));
    }
    return escolhidos;
  }

  // ---------- 8. Nome aproximado da região ----------
  // Tabela pequena, feita à mão (não é um catálogo oficial): [latitude, longitude, raio em graus, nome].
  const REGIOES = [
    [23, 10, 24, "Deserto do Saara", "Sahara Desert"], [23, 47, 9, "Península Arábica", "Arabian Peninsula"],
    [31, 58, 5, "Deserto do Irã (região do Lut)", "Iranian desert (Lut region)"],
    [43, 105, 9, "Deserto de Gobi", "Gobi Desert"], [39, 83, 5, "Deserto de Taklamakan", "Taklamakan Desert"],
    [32, 88, 7, "Planalto Tibetano", "Tibetan Plateau"], [28, 85, 3, "Himalaia", "Himalayas"],
    [-24, -69, 5, "Deserto do Atacama", "Atacama Desert"], [-18, -68, 4, "Altiplano andino", "Andean Altiplano"],
    [-34, -70, 4, "Andes centrais", "Central Andes"], [-45, -70, 7, "Patagônia", "Patagonia"],
    [-24, 16, 5, "Deserto do Namibe", "Namib Desert"], [-24, 22, 5, "Deserto do Kalahari", "Kalahari Desert"],
    [-25, 133, 12, "Interior da Austrália", "Australian interior"],
    [34, -115, 6, "Desertos de Mojave e Sonora (EUA/México)", "Mojave and Sonoran Deserts (USA/Mexico)"],
    [40, -117, 5, "Grande Bacia (EUA)", "Great Basin (USA)"],
    [38, -110, 4, "Planalto do Colorado (Utah, EUA)", "Colorado Plateau (Utah, USA)"],
    [44, -110, 7, "Montanhas Rochosas (EUA)", "Rocky Mountains (USA)"],
    [42, -121, 3, "Vulcões do noroeste dos EUA", "Volcanoes of the northwestern USA"],
    [64, -150, 9, "Alasca", "Alaska"], [75, -90, 10, "Ártico canadense", "Canadian Arctic"],
    [72, -40, 10, "Groenlândia", "Greenland"], [65, -18, 4, "Islândia", "Iceland"], [78, 16, 4, "Svalbard", "Svalbard"],
    [65, 15, 7, "Escandinávia", "Scandinavia"], [65, 100, 16, "Sibéria", "Siberia"],
    [12, 41, 4, "Depressão de Afar (Etiópia)", "Afar Depression (Ethiopia)"], [20, -156, 3, "Havaí", "Hawaii"],
    [28, -15, 3, "Ilhas Canárias", "Canary Islands"], [39, 35, 5, "Anatólia (Turquia)", "Anatolia (Turkey)"],
    [42, 44, 3, "Cáucaso", "Caucasus"], [46, 9, 3, "Alpes", "Alps"],
    [18, 78, 6, "Planalto do Deccan (Índia)", "Deccan Plateau (India)"], [-5, -62, 10, "Amazônia", "Amazon"],
    [0, 22, 8, "Bacia do Congo", "Congo Basin"], [-2, 37, 4, "Leste africano (Quênia e Tanzânia)", "East Africa (Kenya and Tanzania)"]
  ];   // [lat, lon, raio, nome em português, nome em inglês]

  // Devolve { nome: { pt, en }, tipo: "dentro" | "perto" | "coord" }
  function nomeAproximado(lat, lon) {
    if (lat <= -66) {
      const leste = lon > -30 && lon < 165;
      return { nome: leste ? { pt: "Antártida Oriental", en: "East Antarctica" }
                           : { pt: "Antártida Ocidental / Mar de Ross", en: "West Antarctica / Ross Sea" }, tipo: "dentro" };
    }
    if (lat >= 80) return { nome: { pt: "Ártico (ao norte de 80°)", en: "Arctic (north of 80°)" }, tipo: "dentro" };
    let melhor = null, folga = Infinity;
    for (const [la, lo, raio, pt, en] of REGIOES) {
      const d = distanciaGraus(lat, lon, la, lo);
      if (d - raio < folga) { folga = d - raio; melhor = { pt, en }; }
    }
    if (folga <= 0) return { nome: melhor, tipo: "dentro" };
    if (folga <= 6) return { nome: melhor, tipo: "perto" };
    const ns = lat >= 0 ? "N" : "S";
    return { nome: { pt: `Região a ${Math.abs(lat)}°${ns}, ${Math.abs(lon)}°${lon >= 0 ? "L" : "O"}`,
                     en: `Region at ${Math.abs(lat)}°${ns}, ${Math.abs(lon)}°${lon >= 0 ? "E" : "W"}` }, tipo: "coord" };
  }

  function textoDoNome(n) {
    const nome = n.nome[idi()] || n.nome.en;
    return n.tipo === "perto" ? (I() ? I().t("near", { name: nome }) : `Near: ${nome}`) : nome;
  }

  // ---------- 9. "Novidade": fora dos locais que já estão no site ----------
  function sitioMaisPerto(lat, lon, sitios) {
    let melhor = null, dist = Infinity;
    sitios.forEach(s => {
      const d = distanciaGraus(lat, lon, s.lat, s.lon);
      if (d < dist) { dist = d; melhor = s; }
    });
    return { sitio: melhor, distancia: dist };
  }

  function ehNovidade(lat, lon, sitios, limiteGraus) {
    const lim = limiteGraus === undefined ? 3 : limiteGraus;
    const m = sitioMaisPerto(lat, lon, sitios);
    return { novidade: m.distancia > lim, sitio: m.sitio, distancia: m.distancia };
  }

  // ---------- 10. Onde combina / onde NÃO combina ----------
  // razao = (diferença física) / (tolerância do aspecto). Até 1 = ainda parecido.
  function categoria(razao) {
    if (razao <= 0.5) return "alta";      // textos em i18n.js: cat.alta, cat.ok, cat.parcial, cat.nao
    if (razao <= 1) return "ok";
    if (razao <= 2) return "parcial";
    return "nao";
  }

  function analisar(alvo, cel, faixas, faixasBusca) {
    const itens = [];
    ASPECTOS.forEach(a => {
      if (!(alvo.pesos[a.id] > 0) || alvo.notas[a.id] === null || cel.notas[a.id] === null) return;
      const valorAlvo = alvo.valores[a.id] !== null && alvo.valores[a.id] !== undefined
        ? alvo.valores[a.id] : deNota(a.id, alvo.notas[a.id], faixas, faixasBusca);
      const valorLugar = cel.valores[a.id];
      const razao = Math.abs(valorAlvo - valorLugar) / a.tol;
      itens.push({
        id: a.id, peso: alvo.pesos[a.id], valorAlvo, valorLugar, razao,
        diff: Math.abs(alvo.notas[a.id] - cel.notas[a.id]),      // diferença na escala 0-1 (a que entra na semelhança)
        categoria: categoria(razao)
      });
    });
    // As frases são montadas na tela (planejar.js), no idioma escolhido.
    const combina = itens.filter(i => i.razao <= 1).sort((x, y) => x.razao - y.razao).slice(0, 3);
    const naoCombina = itens.filter(i => i.razao > 2).sort((x, y) => y.razao - x.razao).slice(0, 3);
    return { itens, combina, naoCombina };
  }

  // ---------- 11. Teste de missão recomendado (regras simples, só para os aspectos que combinam) ----------
  // Devolve CHAVES de texto (test.*, em i18n.js); a tela traduz.
  function testesRecomendados(analise) {
    const testes = [];
    analise.itens.filter(i => i.razao <= 1).sort((x, y) => x.razao - y.razao).forEach(i => {
      const v = i.valorAlvo;
      switch (i.id) {
        case "gelo": testes.push(v >= 20 ? "test.gelo.alto" : "test.gelo.baixo"); break;
        case "relevo": testes.push(v >= 500 ? "test.relevo.alto" : "test.relevo.baixo"); break;
        case "temperatura":
          testes.push(v <= -20 ? "test.temp.frio" : v >= 25 ? "test.temp.quente" : "test.temp.medio");
          break;
        case "amplitude": if (v >= 30) testes.push("test.amplitude"); break;
        case "vento": if (v >= 8) testes.push("test.vento"); break;
        case "poeira": if (v >= 50) testes.push("test.poeira"); break;
        case "geologia": testes.push("test.geologia"); break;
        default: break;
      }
    });
    if (!testes.length) testes.push("test.nenhum");
    return testes.slice(0, 4);
  }

  const api = {
    ASPECTOS, MODELOS, IMPORTANCIA, REGIOES,
    normalizar, paraNota, deNota, formatarValor, distanciaGraus, valorDaCelula,
    prepararCelulas, alvoPersonalizado, alvoReal, similaridade, buscar, agrupar,
    nomeAproximado, textoDoNome, sitioMaisPerto, ehNovidade, categoria, analisar, testesRecomendados
  };
  raiz.BUSCA = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
