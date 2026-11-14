// Testes do busca.js (rodar com:  node tests/busca.teste.js ).  Usa os dados reais de data/.
const assert = require("assert");
const path = require("path");
global.window = {};
require(path.join(__dirname, "..", "data", "celulas.js"));
require(path.join(__dirname, "..", "data", "dados_reais.js"));
const B = require(path.join(__dirname, "..", "busca.js"));
const D = window.DADOS_REAIS, C = window.CELULAS_TERRA;
const cel = B.prepararCelulas(C, D.faixas, D.faixas_busca);
let n = 0;
function teste(nome, fn) { fn(); n++; console.log("  ok  " + nome); }
const perto = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg || ""} esperado ${b}, veio ${a}`);

teste("normalizar corta em 0 e 1 e respeita nulos", () => {
  const f = { min: 0, max: 10 };
  assert.strictEqual(B.normalizar(-5, f), 0); assert.strictEqual(B.normalizar(50, f), 1);
  assert.strictEqual(B.normalizar(5, f), 0.5); assert.strictEqual(B.normalizar(null, f), null);
});

teste("gelo é digitado em % e vira fração; deNota é a inversa", () => {
  perto(B.paraNota("gelo", 60, D.faixas, D.faixas_busca), 0.6, 1e-9);
  perto(B.deNota("gelo", 0.6, D.faixas, D.faixas_busca), 60, 1e-9);
  perto(B.deNota("temperatura", B.paraNota("temperatura", -20, D.faixas, D.faixas_busca), D.faixas, D.faixas_busca), -20, 1e-9);
  perto(B.deNota("geologia", B.paraNota("geologia", 1.04, D.faixas, D.faixas_busca), D.faixas, D.faixas_busca), 1.04, 1e-9);
});

teste("alvo igual ao lugar = 100%; 'tanto faz' é ignorado e os pesos são renormalizados", () => {
  const c = cel.find(x => x.lat === 31 && x.lon === 59);
  const alvo = B.alvoPersonalizado({ temperatura: { valor: c.valores.temperatura, imp: 2 }, relevo: { valor: c.valores.relevo, imp: 1 } }, D.faixas, D.faixas_busca);
  perto(B.similaridade(alvo, c.notas).pct, 100, 1e-9);
  // Só relevo e gelo com diferença 0,5 e 0: d = sqrt(w1/(w1+w2) * 0.25), conta feita à mão
  const a2 = { notas: { relevo: 1.0, gelo: 0.0 }, pesos: { relevo: 0.2, gelo: 0.15 } };
  const s = B.similaridade(a2, { relevo: 0.5, gelo: 0.0, temperatura: 0.9 });
  perto(s.pct, 100 * (1 - Math.sqrt(0.2 / 0.35 * 0.25)), 1e-9);
  assert.deepStrictEqual(s.usados, ["relevo", "gelo"]);
});

teste("MESMA CONTA do site: alvo real x célula dos 12 locais bate com o ranking já exibido", () => {
  let comparados = 0, maior = 0;
  D.terra.forEach(t => {
    const c = cel.find(x => x.lat === t.celula.lat && x.lon === t.celula.lon);
    assert.ok(c, "célula não achada para " + t.id);
    ["marte", "lua"].forEach(corpo => {
      (t.ranking[corpo] || []).forEach(r => {
        const alvoItem = D[corpo].find(a => a.id === r.id);
        const alvo = B.alvoReal(alvoItem, D.pesos[corpo], D.faixas, D.faixas_busca);
        const s = B.similaridade(alvo, c.notas);
        // o ranking do site usa só temperatura, relevo, gelo (e vento quando houver); aqui o vento da Terra entra
        // com peso 0 em Marte/Lua (alvo sem vento), então os resultados precisam ser iguais.
        const dif = Math.abs(s.pct - r.semelhanca); maior = Math.max(maior, dif); comparados++;
        assert.ok(dif <= 0.3, `${t.id} x ${r.id}: site ${r.semelhanca}, busca ${s.pct.toFixed(2)}`);
      });
    });
  });
  console.log(`      (${comparados} comparações; maior diferença ${maior.toFixed(3)} ponto, só por arredondamento dos dados)`);
});

teste("alvo real de Marte usa só relevo e gelo; o da Lua usa temperatura, relevo e gelo", () => {
  const m = B.alvoReal(D.marte.find(a => a.id === "jezero"), D.pesos.marte, D.faixas, D.faixas_busca);
  const l = B.alvoReal(D.lua.find(a => a.id === "shackleton"), D.pesos.lua, D.faixas, D.faixas_busca);
  const ativos = al => B.ASPECTOS.filter(a => al.pesos[a.id] > 0).map(a => a.id);
  assert.deepStrictEqual(ativos(m), ["relevo", "gelo"]);
  assert.deepStrictEqual(ativos(l), ["temperatura", "relevo", "gelo"]);
});

teste("modelo 'Base com gelo (ISRU)' leva a lugares frios e com gelo, e o Top 5 não repete a região", () => {
  const mod = B.MODELOS.find(m => m.id === "isru");
  const alvo = B.alvoPersonalizado(mod.valores, D.faixas, D.faixas_busca);
  const todos = B.buscar(alvo, cel);
  assert.ok(todos.length > 50, "poucos resultados: " + todos.length);
  const top = B.agrupar(todos, 5, 5);
  assert.ok(top.length >= 3, "poucas regiões");
  assert.ok(top[0].cel.valores.gelo > 40 && top[0].cel.valores.temperatura < 0, "o melhor lugar deveria ser frio e com gelo");
  for (let i = 0; i < top.length; i++) for (let j = i + 1; j < top.length; j++)
    assert.ok(B.distanciaGraus(top[i].cel.lat, top[i].cel.lon, top[j].cel.lat, top[j].cel.lon) >= 5, "regiões coladas");
  for (let i = 1; i < top.length; i++) assert.ok(top[i - 1].pct >= top[i].pct, "fora de ordem");
  console.log("      Top 5:", top.map(t => `${B.textoDoNome(B.nomeAproximado(t.cel.lat, t.cel.lon))} ${t.pct.toFixed(1)}%`).join(" | "));
});

teste("modelo 'Rover em terreno inclinado' acha relevo rugoso, e o texto recomenda mobilidade", () => {
  const alvo = B.alvoPersonalizado(B.MODELOS.find(m => m.id === "rover").valores, D.faixas, D.faixas_busca);
  const top = B.agrupar(B.buscar(alvo, cel), 5, 5);
  assert.ok(top[0].cel.valores.relevo > 900, "relevo do melhor lugar: " + top[0].cel.valores.relevo);
  const an = B.analisar(alvo, top[0].cel, D.faixas, D.faixas_busca);
  assert.ok(an.combina.some(i => i.id === "relevo"));
  assert.ok(B.testesRecomendados(an).includes("test.relevo.alto"));   // "Testar a mobilidade de rovers..."
});

teste("as frases julgam pela diferença FÍSICA: 12 °C de diferença não é 'combina muito'", () => {
  const c = { notas: {}, valores: {} };
  B.ASPECTOS.forEach(a => { c.notas[a.id] = null; c.valores[a.id] = null; });
  c.valores.temperatura = -8; c.notas.temperatura = B.paraNota("temperatura", -8, D.faixas, D.faixas_busca);
  c.valores.relevo = 1400; c.notas.relevo = B.paraNota("relevo", 1400, D.faixas, D.faixas_busca);
  const alvo = B.alvoPersonalizado({ temperatura: { valor: -20, imp: 1 }, relevo: { valor: 1500, imp: 1 } }, D.faixas, D.faixas_busca);
  const an = B.analisar(alvo, c, D.faixas, D.faixas_busca);
  const t = an.itens.find(i => i.id === "temperatura"), r = an.itens.find(i => i.id === "relevo");
  assert.strictEqual(t.categoria, "parcial");       // 12 °C / tolerância 8 °C = 1,5
  assert.strictEqual(r.categoria, "alta");          // 100 m / 250 m = 0,4
  assert.ok(an.combina.some(i => i.id === "relevo") && !an.combina.some(i => i.id === "temperatura"));
  c.valores.temperatura = 20; c.notas.temperatura = B.paraNota("temperatura", 20, D.faixas, D.faixas_busca);   // 40 °C de diferença
  const an2 = B.analisar(alvo, c, D.faixas, D.faixas_busca);
  assert.ok(an2.naoCombina.some(i => i.id === "temperatura"), "40 °C de diferença deveria ser 'não combina'");
});

teste("sem aspecto ativo não há busca; aspecto sem dado na célula não vira zero", () => {
  const vazio = B.alvoPersonalizado({}, D.faixas, D.faixas_busca);
  assert.strictEqual(B.buscar(vazio, cel).length, 0);
  const so_geo = B.alvoPersonalizado({ geologia: { valor: 1.05, imp: 1 } }, D.faixas, D.faixas_busca);
  const r = B.buscar(so_geo, cel);
  assert.ok(r.length > 0 && r.every(x => x.cel.qi !== null), "célula sem índice de quartzo entrou na busca");
});

teste("nomes aproximados e 'Novidade'", () => {
  assert.strictEqual(B.nomeAproximado(31, 59).nome.pt, "Deserto do Irã (região do Lut)");
  assert.strictEqual(B.nomeAproximado(31, 59).nome.en, "Iranian desert (Lut region)");
  assert.strictEqual(B.nomeAproximado(-81, 99).nome.en, "East Antarctica");
  assert.strictEqual(B.nomeAproximado(25, 9).nome.pt, "Deserto do Saara");
  assert.strictEqual(B.nomeAproximado(0, -150).tipo, "coord");
  assert.strictEqual(B.nomeAproximado(0, -150).nome.en, "Region at 0°N, 150°W");
  assert.strictEqual(B.nomeAproximado(0, -150).nome.pt, "Região a 0°N, 150°O");
  // todo nome de região existe nos dois idiomas
  B.REGIOES.forEach(r => assert.ok(r[3] && r[4], "região sem tradução: " + r));
  const sitios = D.terra.map(t => ({ lat: t.lat, lon: t.lon, nome: t.nome }));
  assert.strictEqual(B.ehNovidade(31, 59, sitios).novidade, false);     // célula do próprio Lut
  assert.strictEqual(B.ehNovidade(25, 9, sitios).novidade, true);       // Saara: longe dos 12 locais
});

console.log(`\n${n} testes passaram.`);
