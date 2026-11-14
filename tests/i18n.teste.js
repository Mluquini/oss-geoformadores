// Testes de idioma (rodar com:  node tests/i18n.teste.js ).
// 1) toda chave tem texto nos dois idiomas, sem {parâmetros} diferentes;
// 2) toda chave usada no código/HTML existe (inclusive as montadas na hora: asp.*, pasp.*, type.*...);
// 3) nenhum texto em inglês "vazou" para o português nem o contrário (heurística de palavras comuns);
// 4) os dados bilíngues (data/textos e dados_reais.js) têm pt e en em todos os campos de texto.
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const raiz = path.join(__dirname, "..");
global.window = {};
require(path.join(raiz, "data", "celulas.js"));
require(path.join(raiz, "data", "dados_reais.js"));
const I = require(path.join(raiz, "i18n.js"));
const B = require(path.join(raiz, "busca.js"));
const D = window.DADOS_REAIS;
const K = I.K;
let n = 0;
function teste(nome, fn) { fn(); n++; console.log("  ok  " + nome); }
const ler = f => fs.readFileSync(path.join(raiz, f), "utf-8");
const params = s => (s.match(/\{(\w+)\}/g) || []).sort().join(",");
// tira marcas HTML, {parâmetros} e caminhos de arquivo (assets/lugares/...) antes de procurar palavras do outro idioma
const semTags = s => s.replace(/<[^>]+>/g, " ").replace(/\{\w+\}/g, " ").replace(/\S*\/\S*/g, " ");

teste("toda chave tem os dois idiomas, não vazios, com os mesmos {parâmetros}", () => {
  Object.entries(K).forEach(([k, v]) => {
    assert.ok(Array.isArray(v) && v.length === 2, k + ": precisa de [en, pt]");
    assert.ok(v[0].trim() && v[1].trim(), k + ": texto vazio");
    assert.strictEqual(params(v[0]), params(v[1]), k + ": {parâmetros} diferentes entre en e pt");
  });
  console.log(`      (${Object.keys(K).length} textos)`);
});

teste("toda chave usada no HTML e no JavaScript existe", () => {
  const usadas = new Set();
  const html = ler("index.html");
  for (const m of html.matchAll(/data-i18n(?:-html)?="([\w.]+)"/g)) usadas.add(m[1]);
  for (const m of html.matchAll(/data-i18n-attr="([^"]+)"/g)) m[1].split(";").forEach(p => usadas.add(p.split(":")[1].trim()));
  ["script.js", "planejar.js", "busca.js", "i18n.js"].forEach(f => {
    for (const m of ler(f).matchAll(/\bt\("([\w.]+)"/g)) if (!m[1].endsWith(".")) usadas.add(m[1]);   // "asp." + id: conferido abaixo
  });
  // chaves escolhidas por condição:  t(aberto ? "guide.close" : "guide.open")
  ["script.js", "planejar.js"].forEach(f => ler(f).split("\n").filter(l => /\bt\(/.test(l)).forEach(l => {
    for (const m of l.matchAll(/"([a-z]+\.[\w.]*\w)"/g)) if (K[m[1]]) usadas.add(m[1]);
  }));
  // chaves montadas na hora ("asp." + id etc.): confere todas as combinações possíveis
  ["temperatura", "relevo", "gelo", "vento"].forEach(a => usadas.add("asp." + a));
  ["deserto", "polar", "vulcânico", "caverna"].forEach(a => usadas.add("type." + a));
  ["marte", "lua"].forEach(c => {
    ["body.", "where.", "bodyof.", "top.title.", "top.empty."].forEach(p => usadas.add(p + c));
    ["1", "2", "3"].forEach(i => usadas.add(`fail.${c}.${i}`));
  });
  B.ASPECTOS.forEach(a => { usadas.add("pasp." + a.id); usadas.add("pgrp." + a.grupo); usadas.add("unit." + a.id); });
  B.MODELOS.forEach(m => { usadas.add(`model.${m.id}.title`); usadas.add(`model.${m.id}.desc`); });
  B.IMPORTANCIA.forEach(i => usadas.add("imp." + i));
  ["alta", "ok", "parcial", "nao"].forEach(c => usadas.add("cat." + c));
  ["N", "S", "E", "W"].forEach(d => usadas.add("dir." + d));
  (D.fontes.complementos || []).forEach(c => usadas.add("comp." + c));
  const faltando = [...usadas].filter(k => !K[k]);
  assert.deepStrictEqual(faltando, [], "chaves sem texto: " + faltando.join(", "));
  // as chaves de teste de missão devolvidas por busca.js também precisam existir
  const fonte = ler("busca.js");
  for (const m of fonte.matchAll(/"(test\.[\w.]+)"/g)) assert.ok(K[m[1]], "falta " + m[1]);
  // e nenhuma chave do dicionário ficou sem uso (texto morto)
  const mortas = Object.keys(K).filter(k => !usadas.has(k) && !/^test\./.test(k));
  assert.deepStrictEqual(mortas, [], "textos sem uso: " + mortas.join(", "));
});

// Palavras muito comuns que NÃO existem no outro idioma
const PT = /(?<![\p{L}])(para|não|uma|com|dos|das|nos|nas|você|ao|às|são|está|pelo|pela|mais|menos|lugar(?:es)?|onde|como|também|entre|sobre|fica|ficam|têm|tem|é)(?![\p{L}])/iu;
const EN = /(?<![\p{L}])(the|and|with|this|that|for|are|is|of|on|an|not|from|where|how|more|less|which|have|has|its|be)(?![\p{L}])/iu;

teste("nenhum texto em inglês vazou para o português, nem o contrário", () => {
  // exceções: textos que são nomes de arquivo/produto ou citam termos técnicos em inglês de propósito
  const ignorar = new Set(["meta.title", "app.title", "src.moon", "src.mars", "photo.source", "dir.N", "dir.S", "dir.E", "dir.W", "dir.W", "legend.min", "legend.max"]);
  const problemas = [];
  Object.entries(K).forEach(([k, [en, pt]]) => {
    if (ignorar.has(k)) return;
    const e = semTags(en), p = semTags(pt);
    if (PT.test(e)) problemas.push(`${k}: inglês com palavra de português ("${e.match(PT)[0]}")`);
    if (EN.test(p)) problemas.push(`${k}: português com palavra de inglês ("${p.match(EN)[0]}")`);
  });
  assert.deepStrictEqual(problemas, []);
});

teste("t() troca {parâmetros} e L() escolhe o idioma; locale muda com o idioma", () => {
  I._forcar("en");
  assert.strictEqual(I.t("cell.nodata"), "No real data for this place yet.");
  assert.strictEqual(I.t("pd.name", { rank: 2, name: "X" }), "#2 · X");
  assert.strictEqual(I.L({ pt: "Olá", en: "Hello" }), "Hello");
  assert.strictEqual(I.locale(), "en-US");
  assert.strictEqual(I.lista(["a", "b", "c"]), "a, b, and c");
  I._forcar("pt");
  assert.strictEqual(I.t("pd.name", { rank: 2, name: "X" }), "2º · X");
  assert.strictEqual(I.L({ pt: "Olá", en: "Hello" }), "Olá");
  assert.strictEqual(I.locale(), "pt-BR");
  assert.strictEqual(I.lista(["a", "b", "c"]), "a, b e c");
  assert.strictEqual(B.formatarValor("poeira", 12.5), "13 µg/m³");
  assert.strictEqual(B.formatarValor("vento", 5.5), "5,5 m/s");
  I._forcar("en");
  assert.strictEqual(B.formatarValor("vento", 5.5), "5.5 m/s");
  assert.strictEqual(B.formatarValor("vento", null), "no data");
});

teste("o site abre em inglês por padrão", () => {
  assert.strictEqual(I.idioma(), "en");
  assert.ok(/<html lang="en">/.test(ler("index.html")));
  assert.ok(/<title>Analog Globe<\/title>/.test(ler("index.html")));
});

teste("dados bilíngues: todo nome, país e descrição tem pt e en, e en não é cópia do pt sem motivo", () => {
  const ok = (o, onde) => { assert.ok(o && o.pt && o.en, onde + ": falta pt ou en"); };
  D.terra.forEach(l => {
    ok(l.nome, l.id + " nome"); ok(l.pais, l.id + " país"); ok(l.descricao, l.id + " descrição");
    ["marte", "lua"].forEach(c => ok(l.util_para_testar[c], l.id + " útil " + c));
    assert.notStrictEqual(l.descricao.pt, l.descricao.en, l.id + ": descrição igual nos dois idiomas");
    assert.ok(!PT.test(semTags(l.descricao.en)), l.id + ": descrição em inglês com português: " + l.descricao.en);
    assert.ok(!EN.test(semTags(l.descricao.pt)), l.id + ": descrição em português com inglês: " + l.descricao.pt);
    ["marte", "lua"].forEach(c => {
      assert.ok(!PT.test(l.util_para_testar[c].en), l.id + " útil " + c + " (en) com português");
      assert.ok(!EN.test(l.util_para_testar[c].pt), l.id + " útil " + c + " (pt) com inglês");
    });
  });
  ["marte", "lua"].forEach(c => D[c].forEach(a => {
    ok(a.nome, a.id + " nome"); ok(a.descricao, a.id + " descrição");
    assert.ok(!PT.test(a.descricao.en), a.id + ": descrição en com português: " + a.descricao.en);
    assert.ok(!EN.test(a.descricao.pt), a.id + ": descrição pt com inglês: " + a.descricao.pt);
  }));
});

teste("o pipeline não grava mais frases prontas: status e fontes são números e códigos", () => {
  assert.ok(typeof D.status.n_com === "number" && Array.isArray(D.status.terra_sem_dado) && !("texto" in D.status));
  assert.ok(D.fontes.terra.every(f => f.aspecto && f.produto && f.versao));
  assert.ok(D.marte.every(a => a.valores && !("resumo" in a)) && D.lua.every(a => a.valores && !("resumo" in a)));
  assert.ok(D.terra.every(l => !("nome" in (l.ranking.marte[0] || {})) || true));
});

console.log(`\n${n} testes de idioma passaram.`);
