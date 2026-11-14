// =====================================================================
// IDIOMAS (English / Português): TODO texto do site mora aqui, em um só lugar.
// Cada linha é  "chave": ["texto em inglês", "texto em português"].
// - O site começa SEMPRE em inglês. O botão EN | PT troca e lembra a escolha (localStorage).
// - No HTML: data-i18n="chave" (texto), data-i18n-html="chave" (texto com <strong> etc.) e
//   data-i18n-attr="aria-label:chave;title:chave" (atributos).
// - No JavaScript: I18N.t('chave', { parametro: valor }) troca {parametro} no texto.
// - Textos dos locais (nome, descrição) ficam em data/textos/*.js como { pt, en } e são lidos com I18N.L(obj).
// - Nomes de arquivos, produtos da NASA, unidades (°C, m, m/s) e códigos de produto não são traduzidos.
// - tests/i18n.teste.js confere que toda chave existe nos dois idiomas e que nenhum texto "vazou" para o idioma errado.
// =====================================================================
(function (raiz) {
  "use strict";

  const K = {
    // ---------- página ----------
    "meta.title": ["Analog Globe", "Globo de Análogos"],
    "meta.desc": ["Click a place on Earth and find out which regions of Mars or the Moon are most similar. NASA Space Apps 2026: Terrestrial Analogs.",
                  "Clique num lugar da Terra e descubra quais regiões de Marte ou da Lua são mais parecidas. NASA Space Apps 2026: Terrestrial Analogs."],
    "app.title": ["Analog Globe", "Globo de Análogos"],
    "app.sub": ["Click a point on Earth to see the most similar places on another world.",
                "Clique num ponto da Terra para ver os lugares mais parecidos em outro mundo."],
    "lang.aria": ["Language", "Idioma"],
    "mode.aria": ["Site mode", "Modo do site"],
    "mode.explore": ["🌍 Explore", "🌍 Explorar"],
    "mode.plan": ["🛰️ Plan a mission", "🛰️ Planejar missão"],
    "target.aria": ["Compare with", "Comparar com"],
    "target.mars": ["🔴 Mars", "🔴 Marte"],
    "target.moon": ["⚪ Moon", "⚪ Lua"],
    "filters.aria": ["Filter by type", "Filtrar por tipo"],
    "list.aria": ["List of places", "Lista de locais"],
    "nodata": ["no data", "sem dado"],
    "close": ["Close", "Fechar"],

    // ---------- guia de uso ----------
    "guide.aria": ["Usage guide", "Guia de uso"],
    "guide.open": ["❔ How to use", "❔ Como usar"],
    "guide.close": ["✕ Close guide", "✕ Fechar guia"],
    "guide.1": ["<b>Spin the globe:</b> drag with the mouse or your finger. Scroll (or use two fingers) to zoom.",
                "<b>Gire o globo:</b> arraste com o mouse ou o dedo. Role (ou use dois dedos) para aproximar."],
    "guide.2": ["<b>Pick a place:</b> click a colored point or a name in the list below.",
                "<b>Escolha um lugar:</b> clique num ponto colorido ou num nome da lista embaixo."],
    "guide.3": ["<b>Mars or Moon:</b> the button switches what the place is compared with.",
                "<b>Marte ou Lua:</b> o botão troca com o que o lugar é comparado."],
    "guide.4": ["<b>Filter:</b> check or uncheck the types (desert, polar, volcanic, cave).",
                "<b>Filtre:</b> marque ou desmarque os tipos (deserto, polar, vulcânico, caverna)."],
    "guide.5": ["<b>In the panel:</b> photo, Top 3, chart and values. Esc or ✕ closes it.",
                "<b>No painel:</b> foto, Top 3, gráfico e valores. Esc ou ✕ fecham."],

    // ---------- tipos e aspectos ----------
    "type.deserto": ["Desert", "Deserto"],
    "type.polar": ["Polar", "Polar"],
    "type.vulcânico": ["Volcanic", "Vulcânico"],
    "type.caverna": ["Cave", "Caverna"],
    "asp.temperatura": ["Temperature", "Temperatura"],
    "asp.relevo": ["Relief", "Relevo"],
    "asp.gelo": ["Ice", "Gelo"],
    "asp.vento": ["Wind/dust", "Vento/poeira"],
    "body.marte": ["Mars", "Marte"],
    "body.lua": ["Moon", "Lua"],
    "where.marte": ["on Mars", "em Marte"],
    "where.lua": ["on the Moon", "na Lua"],
    "bodyof.marte": ["Mars", "de Marte"],
    "bodyof.lua": ["the Moon", "da Lua"],

    // ---------- painel do modo Explorar ----------
    "panel.close": ["Close panel", "Fechar painel"],
    "panel.compare": ["Comparison of aspects", "Comparação dos aspectos"],
    "panel.moonnote": ["On the Moon there is no wind or atmosphere, so “wind/dust” <strong>does not apply</strong> and is left out of the calculation.",
                       "Na Lua não existe vento nem atmosfera, então “vento/poeira” <strong>não se aplica</strong> e fica fora do cálculo."],
    "panel.values": ["Values measured at this place", "Valores medidos neste local"],
    "panel.fails": ["⚠️ Where the analogy fails", "⚠️ Onde a analogia falha"],
    "panel.useful": ["🧪 Useful for testing", "🧪 Útil para testar"],
    "top.title.marte": ["Top 3 similar places on Mars", "Top 3 lugares parecidos em Marte"],
    "top.title.lua": ["Top 3 similar places on the Moon", "Top 3 lugares parecidos na Lua"],
    "top.empty": ["There is not yet enough real data at this place to compare with {body}.",
                  "Ainda não há dado real suficiente neste local para comparar com {body}."],
    "top.empty.marte": ["Mars", "Marte"],
    "top.empty.lua": ["the Moon", "a Lua"],
    "top.real": ["Real data: {text}", "Dados reais: {text}"],
    "res.relevo": ["terrain roughness {v} m", "rugosidade do relevo {v} m"],
    "res.agua": ["water in the soil {v}% by mass", "água no solo {v}% em massa"],
    "res.temp": ["mean temperature {v} °C", "temperatura média {v} °C"],
    "res.tempmax": ["maximum {v} °C", "máxima {v} °C"],
    "res.frio": ["{v}% of the area is a cold trap", "{v}% da área é armadilha fria"],
    "cov.text": ["This comparison uses <strong>{n} of {total} aspects</strong> ({pct}% of the total weight): {used}. Left out: {out}.",
                 "Esta comparação usa <strong>{n} de {total} aspectos</strong> ({pct}% do peso total): {used}. Ficaram de fora: {out}."],
    "why.moonwind": ["not applicable: the Moon has no atmosphere", "não se aplica: a Lua não tem atmosfera"],
    "why.both": ["no data on Earth or {where}", "sem dado na Terra nem {where}"],
    "why.earth": ["no data on Earth", "sem dado na Terra"],
    "why.target": ["no data {where}", "sem dado {where}"],
    "photo.alt": ["Photo of {name}", "Foto de {name}"],
    "photo.credit": ["Photo: {author} · {lic} · {src}", "Foto: {author} · {lic} · {src}"],
    "photo.source": ["Wikimedia Commons", "Wikimedia Commons"],
    "val.temp": ["Mean annual temperature", "Temperatura média anual"],
    "val.amp": ["Variation over the year (monthly max − min)", "Variação ao longo do ano (máx. − mín. mensal)"],
    "val.elev": ["Mean elevation", "Elevação média"],
    "val.rug": ["Relief roughness (elevation deviation)", "Rugosidade do relevo (desvio da elevação)"],
    "val.slope": ["Mean slope", "Declividade média"],
    "val.snow": ["Fraction of the year with snow", "Fração do ano com neve"],
    "val.t0": ["Fraction of the year below 0 °C", "Fração do ano abaixo de 0 °C"],
    "val.wind": ["Mean wind (lowest model level, ~50–70 m)", "Vento médio (nível mais baixo do modelo, ~50–70 m)"],
    "val.dust": ["Suspended dust", "Poeira em suspensão"],
    "cell.note": ["Scores from 0 to 1 on the fixed ranges: {notas}. The values are averages of a {size}° cell (~220 km) centered at {lat}°, {lon}°, not of the exact point.",
                  "Notas de 0 a 1 nas faixas fixas: {notas}. Os valores são médias de uma célula de {size}° (~220 km) com centro em {lat}°, {lon}°, e não do ponto exato."],
    "cell.nodata": ["No real data for this place yet.", "Sem dado real para este local ainda."],
    "src.line": ["Earth data: {terra}{comp}. {body}: {alvo}.", "Dados da Terra: {terra}{comp}. {body}: {alvo}."],
    "src.comp": [" · Supplement: {text}", " · Complemento: {text}"],
    "fail.marte.1": ["<strong>Gravity:</strong> on Mars it is only 38% of Earth's. Here, rovers, people and dust weigh more than 2.5 times as much.",
                     "<strong>Gravidade:</strong> em Marte ela é só 38% da Terra. Aqui, rovers, pessoas e poeira pesam mais de 2,5 vezes."],
    "fail.marte.2": ["<strong>Atmosphere:</strong> Martian air is almost all CO₂ (95%) and more than 150 times thinner (about 6 mb, versus ~1,013 mb on Earth). It cannot be breathed, and liquid water quickly evaporates or freezes.",
                     "<strong>Atmosfera:</strong> o ar de Marte é quase todo CO₂ (95%) e mais de 150 vezes mais fino (cerca de 6 mb, contra ~1.013 mb na Terra). Não dá para respirar, e a água líquida evapora ou congela rápido."],
    "fail.marte.3": ["<strong>Radiation:</strong> Mars has no global magnetic field and no thick atmosphere, so it receives much more radiation from the Sun and from space.",
                     "<strong>Radiação:</strong> Marte não tem campo magnético global nem atmosfera grossa, então recebe muito mais radiação do Sol e do espaço."],
    "fail.lua.1": ["<strong>Gravity:</strong> on the Moon it is only 17% of Earth's (about 1/6). Walking, digging and landing work differently.",
                   "<strong>Gravidade:</strong> na Lua ela é só 17% da Terra (cerca de 1/6). Andar, cavar e pousar funcionam de outro jeito."],
    "fail.lua.2": ["<strong>Atmosphere:</strong> the Moon has almost no atmosphere (it is practically a vacuum). There is no wind, no sound, and no air to cool equipment.",
                   "<strong>Atmosfera:</strong> a Lua quase não tem atmosfera (é praticamente vácuo). Não há vento, nem som, nem ar para resfriar os equipamentos."],
    "fail.lua.3": ["<strong>Radiation:</strong> with no atmosphere and no magnetic field, the surface receives direct radiation. Also, day and night each last about 15 Earth days.",
                   "<strong>Radiação:</strong> sem atmosfera e sem campo magnético, a superfície recebe radiação direta. Além disso, o dia e a noite duram cerca de 15 dias terrestres cada."],
    "chart.earth": ["{name} (Earth)", "{name} (Terra)"],
    "chart.out": ["{asp} (out)", "{asp} (fora)"],
    "chart.axis": ["score from 0 to 1", "nota de 0 a 1"],
    "chart.tip": ["{label}: score {v}", "{label}: nota {v}"],
    "chart.note": ["The chart shows only the {n} aspects used in the comparison (score from 0 to 1, on the fixed ranges). Bars of the same size mean the places are similar in that aspect.",
                   "O gráfico mostra só os {n} aspectos que entram na comparação (nota de 0 a 1, nas faixas fixas). Barras do mesmo tamanho querem dizer lugares parecidos naquele aspecto."],
    "err.globe": ["The globe could not be loaded. Check your internet connection.",
                  "Não foi possível carregar o globo. Verifique a sua conexão com a internet."],
    "err.data": ["I could not find data/dados_reais.js. Run scripts/05_exportar_site.py.",
                 "Não encontrei data/dados_reais.js. Rode scripts/05_exportar_site.py."],

    // ---------- Planejar missão ----------
    "plan.aria": ["Plan a mission", "Planejar missão"],
    "plan.close.aria": ["Back to Explore mode", "Voltar ao modo Explorar"],
    "plan.title": ["🛰️ Plan a mission", "🛰️ Planejar missão"],
    "plan.sub": ["Describe the environment the mission needs and see where on Earth it is worth testing.",
                 "Descreva o ambiente que a missão precisa e veja onde, na Terra, vale testar."],
    "plan.desc": ["Tell us the environment the mission needs. The site compares it with the Earth cells and shows where it is worth testing.",
                  "Diga o ambiente que a missão precisa. O site compara com as células da Terra e mostra onde vale testar."],
    "plan.tabs.aria": ["Target type", "Tipo de alvo"],
    "plan.tab.real": ["Real target", "Alvo real"],
    "plan.tab.custom": ["Custom target", "Alvo personalizado"],
    "plan.real.label": ["Choose a place on Mars or the Moon", "Escolha um lugar de Marte ou da Lua"],
    "plan.real.info": ["{text}Aspects this target has (and that count in the search): <strong>{list}</strong>. The others do not exist in our data for {body} and are left out.",
                       "{text}Aspectos que este alvo tem (e que valem na busca): <strong>{list}</strong>. Os outros não existem nos nossos dados {body} e ficam de fora."],
    "plan.custom.note": ["Start from a ready-made template (<strong>suggested</strong> values, you can change everything) or move the controls. Check <strong>“don't care”</strong> to ignore an aspect.",
                         "Comece por um modelo pronto (valores <strong>sugeridos</strong>, você pode mudar tudo) ou mexa nos controles. Marque <strong>“tanto faz”</strong> para ignorar um aspecto."],
    "plan.best": ["Best places on Earth", "Melhores lugares da Terra"],
    "plan.warn": ["⚠️ Gravity, atmosphere and radiation are <strong>not</strong> reproduced on Earth.",
                  "⚠️ Gravidade, atmosfera e radiação <strong>não</strong> são reproduzidas na Terra."],
    "plan.pick": ["Pick at least one aspect: uncheck “don't care” on a control or use a ready-made template.",
                  "Escolha pelo menos um aspecto: desmarque “tanto faz” em algum controle ou use um modelo pronto."],
    "plan.summary": ["{desc}: compares {list}. {n} land cells were compared.",
                     "{desc}: compara {list}. Foram comparadas {n} células de terra."],
    "plan.limit": [" ⚠️ Today we only have {n} cells (zones around the 12 places, plus the Sahara, Tibet and Antarctica), so the Top 5 only sees those areas. To search the whole world you need to run 01_terra.py without --zonas.",
                   " ⚠️ Hoje só temos {n} células (zonas ao redor dos 12 locais, mais Saara, Tibete e Antártida), então o Top 5 só enxerga essas áreas. Para buscar no mundo todo é preciso rodar o 01_terra.py sem --zonas."],
    "plan.none": ["No cell has enough data for this target.", "Nenhuma célula tem dado suficiente para este alvo."],
    "plan.custom.name": ["Custom target", "Alvo personalizado"],
    "legend.min": ["less similar ({pct}%)", "menos parecido ({pct}%)"],
    "legend.max": ["more similar ({pct}%)", "mais parecido ({pct}%)"],
    "legend.min0": ["less similar", "menos parecido"],
    "legend.max0": ["more similar", "mais parecido"],
    "badge.new": ["New", "Novidade"],
    "badge.known": ["Already on the site", "Já no site"],
    "badge.known2": ["Already on the site: {name}", "Já no site: {name}"],
    "badge.outside": ["outside the site's 12 places", "fora dos 12 locais do site"],
    "near": ["Near: {name}", "Perto de: {name}"],
    "marker.title": ["#{rank}: {name} ({pct}%)", "{rank}º: {name} ({pct}%)"],
    "sl.any": ["don't care", "tanto faz"],
    "sl.imp": ["Importance", "Importância"],
    "sl.imp.aria": ["Importance of {name}", "Importância de {name}"],
    "imp.1": ["Low", "Baixa"],
    "imp.2": ["Medium", "Média"],
    "imp.3": ["High", "Alta"],
    "pgrp.temperatura": ["Temperature", "Temperatura"],
    "pgrp.relevo": ["Relief", "Relevo"],
    "pgrp.gelo": ["Ice", "Gelo"],
    "pgrp.geologia": ["Geology", "Geologia"],
    "pgrp.vento": ["Wind and dust", "Vento e poeira"],
    "pasp.temperatura": ["Mean temperature", "Temperatura média"],
    "pasp.amplitude": ["Variation over the year", "Variação ao longo do ano"],
    "pasp.relevo": ["Terrain roughness", "Rugosidade do relevo"],
    "pasp.gelo": ["Ice (fraction of the year)", "Gelo (fração do ano)"],
    "pasp.geologia": ["Quartz index", "Índice de quartzo"],
    "pasp.vento": ["Mean wind", "Vento médio"],
    "pasp.poeira": ["Suspended dust", "Poeira em suspensão"],
    "model.rover.title": ["Test a rover on sloping terrain", "Testar rover em terreno inclinado"],
    "model.rover.desc": ["Very rugged terrain matters most; a bit of dust helps test wheels and panels.",
                         "Relevo muito acidentado é o que mais importa; um pouco de poeira ajuda a testar rodas e painéis."],
    "model.isru.title": ["Base with ice for water (ISRU)", "Base com gelo para água (ISRU)"],
    "model.isru.desc": ["Lots of ice during the year, cold, and very flat terrain to set up the base.",
                        "Muito gelo no ano, frio e terreno bem plano para montar a base."],
    "model.frio.title": ["Habitat shielded from extreme cold", "Habitat protegido do frio extremo"],
    "model.frio.desc": ["Very strong cold, big variation over the year and wind to test thermal insulation.",
                        "Frio muito forte, grande variação ao longo do ano e vento para testar o isolamento térmico."],
    "model.pouso.title": ["Landing on flat, safe terrain", "Pouso em terreno plano e seguro"],
    "model.pouso.desc": ["Very flat terrain, little wind and little dust.", "Terreno bem plano, pouco vento e pouca poeira."],

    // ---------- detalhe de um resultado ----------
    "pd.aria": ["Place details", "Detalhe do lugar"],
    "pd.name": ["#{rank} · {name}", "{rank}º · {name}"],
    "pd.coord": ["2° cell centered at {coord}. Region name is approximate.", "Célula de 2° com centro em {coord}. Nome da região aproximado."],
    "pd.coord.n": ["2° cell centered at {coord} · {n} similar cells in the region. Region name is approximate.",
                   "Célula de 2° com centro em {coord} · {n} células parecidas na região. Nome da região aproximado."],
    "pd.pct": ["{pct}% <small>similarity</small>", "{pct}% <small>de semelhança</small>"],
    "pd.cov": ["Compared {n} of {total} requested aspects ({pct}% of the weight).",
               "Comparou {n} de {total} aspectos pedidos ({pct}% do peso)."],
    "pd.cov.missing": [" No data at this place: {list}.", " Sem dado neste lugar: {list}."],
    "pd.vs": ["Target × this place", "Alvo × este lugar"],
    "pd.chart.target": ["Target", "Alvo"],
    "pd.chart.here": ["This place", "Este lugar"],
    "pd.chart.note": ["Shows only the {n} aspects used in the comparison (score from 0 to 1, on the site's fixed ranges). The more alike the shapes (or bars), the more similar the place.",
                      "Mostra só os {n} aspectos que entram na comparação (nota de 0 a 1, nas faixas fixas do site). Quanto mais parecidas as formas (ou barras), mais parecido o lugar."],
    "pd.match": ["✅ Where it matches", "✅ Onde combina"],
    "pd.nomatch": ["❌ Where it does NOT match", "❌ Onde NÃO combina"],
    "pd.tests": ["🧪 Recommended mission test", "🧪 Teste de missão recomendado"],
    "pd.match.empty": ["No aspect matches very well.", "Nenhum aspecto combina muito bem."],
    "pd.nomatch.empty": ["No aspect is very different among those compared.", "Nenhum aspecto muito diferente entre os que foram comparados."],
    "pd.warn": ["⚠️ <strong>Note:</strong> gravity, atmosphere and radiation are <strong>not</strong> reproduced on Earth. This place only imitates the environment in the aspects above.",
                "⚠️ <strong>Atenção:</strong> gravidade, atmosfera e radiação <strong>não</strong> são reproduzidas na Terra. Este lugar só imita o ambiente nos aspectos acima."],
    "pd.fontes": ["Values for this place: average of a 2° Earth cell (MODIS, SRTM/ETOPO, MERRA-2, ASTER). See “How we calculate” at the end of the page.",
                  "Valores deste lugar: média de uma célula de 2° da Terra (MODIS, SRTM/ETOPO, MERRA-2, ASTER). Veja “Como calculamos” no fim da página."],
    "pd.line": ["{label}: target {a}, place {b}", "{label}: alvo {a}, lugar {b}"],
    "cat.alta": ["matches a lot", "combina muito"],
    "cat.ok": ["matches", "combina"],
    "cat.parcial": ["partly matches", "combina em parte"],
    "cat.nao": ["does not match", "não combina"],
    "test.gelo.alto": ["Test drilling and ice collection (and making water from it).", "Testar perfuração e coleta de gelo (e a produção de água a partir dele)."],
    "test.gelo.baixo": ["Test equipment on dry terrain, with no ice on the surface.", "Testar equipamentos em terreno seco, sem gelo na superfície."],
    "test.relevo.alto": ["Test rover mobility on rugged terrain and on climbs.", "Testar a mobilidade de rovers em terreno acidentado e em subidas."],
    "test.relevo.baixo": ["Test landing and navigation on flat terrain.", "Testar pouso e navegação em terreno plano."],
    "test.temp.frio": ["Test batteries, suits and electronics in extreme cold.", "Testar baterias, trajes e eletrônica em frio extremo."],
    "test.temp.quente": ["Test the cooling of equipment and suits in strong heat.", "Testar o resfriamento de equipamentos e trajes em calor forte."],
    "test.temp.medio": ["Test energy use and thermal comfort at moderate temperatures.", "Testar o gasto de energia e o conforto térmico em temperaturas moderadas."],
    "test.amplitude": ["Test materials and joints under large temperature swings (heating and cooling).", "Testar materiais e juntas sob grandes variações de temperatura (aquecer e esfriar)."],
    "test.vento": ["Test the stability of structures, antennas and probes in strong wind.", "Testar a estabilidade de estruturas, antenas e sondas com vento forte."],
    "test.poeira": ["Test filters, seals and solar panels against dust.", "Testar filtros, vedações e painéis solares contra poeira."],
    "test.geologia": ["Test instruments that identify minerals in quartz-rich rock.", "Testar instrumentos que identificam minerais em rocha rica em quartzo."],
    "test.nenhum": ["No aspect matches well: use this place only as a partial reference.", "Nenhum aspecto combina bem: use este lugar só como referência parcial."],
    "dir.N": ["N", "N"],
    "dir.S": ["S", "S"],
    "dir.E": ["E", "L"],
    "dir.W": ["W", "O"],

    // ---------- Como calculamos ----------
    "como.title": ["How we calculate", "Como calculamos"],
    "como.p1": ["Each place gets a <strong>score from 0 to 1</strong> in up to 4 aspects. For the score to be comparable across Earth, Mars and the Moon, we use <strong>the same physical range for all three</strong> (table below), not a different range for each planet.",
                "Cada lugar recebe uma <strong>nota de 0 a 1</strong> em até 4 aspectos. Para a nota ser comparável entre a Terra, Marte e a Lua, usamos <strong>a mesma faixa física para os três</strong> (tabela abaixo), e não uma faixa diferente para cada planeta."],
    "como.l.temp": ["<strong>Temperature</strong>: mean surface temperature (Earth: annual day-and-night average from MODIS; Moon: average over the lunar day, Diviner).",
                    "<strong>Temperatura</strong>: temperatura média da superfície (Terra: média anual de dia e noite do MODIS; Lua: média ao longo do dia lunar, Diviner)."],
    "como.l.relevo": ["<strong>Relief</strong>: roughness, that is, the standard deviation of elevation in a ~2° window (Earth: SRTMGL30; Mars: MOLA; Moon: LOLA).",
                      "<strong>Relevo</strong>: rugosidade, isto é, o desvio padrão da elevação numa janela de ~2° (Terra: SRTMGL30; Marte: MOLA; Lua: LOLA)."],
    "como.l.gelo": ["<strong>Ice</strong>: a common indicator, but of <em>different things</em>. Earth: fraction of the time with snow and with temperature below 0 °C. Mars: water in the soil (% by mass, GRS). Moon: fraction of the area in a “cold trap” (maximum below 110 K).",
                    "<strong>Gelo</strong>: um indicador comum, mas de <em>coisas diferentes</em>. Terra: fração do tempo com neve e com temperatura abaixo de 0 °C. Marte: água no solo (% em massa, GRS). Lua: fração da área em “armadilha fria” (máxima abaixo de 110 K)."],
    "como.l.vento": ["<strong>Wind/dust</strong>: Earth via MERRA-2 (wind at the lowest model level, ~50–70 m, not at 10 m). Mars has no global wind measurement and the Moon has no atmosphere, so Earth's wind shows up in the panel but does not enter any ranking.",
                     "<strong>Vento/poeira</strong>: Terra via MERRA-2 (vento no nível mais baixo do modelo, ~50–70 m, e não a 10 m). Marte não tem medição global de vento e a Lua não tem atmosfera, então o vento da Terra aparece no painel, mas não entra em nenhum ranking."],
    "como.p2": ["To compare a place on Earth with one on Mars (or the Moon):", "Para comparar um lugar da Terra com um de Marte (ou da Lua):"],
    "como.s1": ["We use only the aspects that exist <strong>on both sides</strong>. If an aspect has no data, it is left out, not turned into zero.",
                "Usamos só os aspectos que existem <strong>nos dois lados</strong>. Se um aspecto não tem dado, ele fica de fora, e não vira zero."],
    "como.s2": ["For each aspect, we compute the <strong>difference</strong> between the scores and square it.",
                "Para cada aspecto, calculamos a <strong>diferença</strong> entre as notas e elevamos ao quadrado."],
    "como.s3": ["We multiply by the aspect's <strong>weight</strong>. The weights that remain are <strong>renormalized</strong> to add up to 100%.",
                "Multiplicamos pelo <strong>peso</strong> do aspecto. Os pesos que sobraram são <strong>renormalizados</strong> para somar 100%."],
    "como.s4": ["We add them up and take the <strong>square root</strong>: that is the distance (0 = identical, 1 = opposite).",
                "Somamos e tiramos a <strong>raiz quadrada</strong>: é a distância (0 = iguais, 1 = opostos)."],
    "como.s5": ["<strong>Similarity = 100% − distance</strong>.", "<strong>Semelhança = 100% − distância</strong>."],
    "como.formula": ["similarity = 100% × (1 − √( Σ weight′ × (score<sub>Earth</sub> − score<sub>target</sub>)² ))",
                     "semelhança = 100% × (1 − √( Σ peso′ × (nota<sub>Terra</sub> − nota<sub>alvo</sub>)² ))"],
    "como.cov": ["Each result reports <strong>how much of the total weight</strong> went into the calculation. With few aspects, the percentage says less about the overall similarity.",
                 "Cada resultado informa <strong>quanto do peso total</strong> entrou na conta. Com poucos aspectos, a porcentagem diz menos sobre a semelhança como um todo."],
    "como.weights": ["Weight of each aspect", "Pesos de cada aspecto"],
    "como.weights.note": ["These are the challenge's weights (Mars: temperature 25%, relief 20%, ice 15%, geology 25%, wind 15%; Moon: 30%, 25%, 30%, 15% and 0%) <strong>without geology</strong>, renormalized to add up to 100%.",
                          "São os pesos do desafio (Marte: temperatura 25%, relevo 20%, gelo 15%, geologia 25%, vento 15%; Lua: 30%, 25%, 30%, 15% e 0%) <strong>sem a geologia</strong>, renormalizados para somar 100%."],
    "como.ranges": ["Fixed physical ranges (score 0 to 1)", "Faixas físicas fixas (nota 0 a 1)"],
    "como.sources": ["Where the data comes from", "De onde vêm os dados"],
    "como.limits": ["Limitations", "Limitações"],
    "como.lim.1": ["Gravity, atmosphere and radiation are <strong>not</strong> reproduced by any place on Earth.",
                   "Gravidade, atmosfera e radiação <strong>não</strong> são reproduzidas por nenhum lugar da Terra."],
    "como.lim.2": ["<strong>Geology</strong> was left out of the project: the indices for Earth (ASTER), the Moon (Diviner) and Mars (no data) do not measure the same thing, and comparing them would need a calibration we do not have.",
                   "A <strong>geologia</strong> ficou fora do projeto: os índices da Terra (ASTER), da Lua (Diviner) e de Marte (sem dado) não medem a mesma coisa, e compará-los exigiria uma calibração que não temos."],
    "como.lim.3": ["Earth values are <strong>averages of a 2° cell</strong> (~220 km) around the place, not of the exact point. On Mars and the Moon, the window is a circle about 2° across.",
                   "Os valores da Terra são <strong>médias de uma célula de 2°</strong> (~220 km) ao redor do local, e não do ponto exato. Em Marte e na Lua, a janela é um círculo de ~2° de diâmetro."],
    "como.lim.4": ["The centers of the Mars and Moon places come from the official IAU catalog. Each place on Mars and the Moon is a single central point, but they are large features (Meridiani Planum is ~1000 km across), so the ~2° window may not represent the whole feature.",
                   "Os centros dos locais de Marte e da Lua vêm do catálogo oficial da IAU. Em Marte e na Lua cada local é um ponto central, mas são feições grandes (Meridiani Planum tem ~1000 km), então a janela de ~2° pode não representar a feição inteira."],
    "como.lim.5": ["The Earth data cover one year (see below); they are not a decades-long climatology.",
                   "Os dados da Terra cobrem um ano (ver abaixo); não são uma climatologia de décadas."],
    "como.lim.6": ["<strong>Not everything is a direct NASA measurement.</strong> Earth relief: SRTMGL30 (NASA) goes from 90°N to 60°S, but the radar only covered 60°N to 56°S; above 60°N (Holuhraun, Haughton, Svalbard) the values almost certainly come from the GTOPO30 (USGS) embedded in the product, and in the far south (McMurdo Dry Valleys) they come from ETOPO 2022 (NOAA), which is not NASA. Earth wind and dust: MERRA-2 is a reanalysis (a model corrected by observations). Moon temperature at the poles: a value derived by the Diviner team, not a direct measurement.",
                   "<strong>Nem tudo é medida direta da NASA.</strong> Relevo da Terra: o SRTMGL30 (NASA) vai de 90°N a 60°S, mas o radar só cobriu 60°N a 56°S; acima de 60°N (Holuhraun, Haughton, Svalbard) os valores vêm, quase com certeza, do GTOPO30 (USGS) embutido no produto, e no extremo sul (Vales Secos de McMurdo) vêm do ETOPO 2022 (NOAA), que não é da NASA. Vento e poeira da Terra: o MERRA-2 é uma reanálise (modelo corrigido por observações). Temperatura da Lua nos polos: valor derivado pela equipe do Diviner, e não medida direta."],
    "como.verified": ["The numbers were checked by an independent script that re-reads the raw NASA files and recomputes everything (see <code>relatorio/verificacao_dados.md</code> in the repository).",
                      "Os números foram conferidos por um script independente, que relê os arquivos brutos da NASA e recalcula tudo (veja <code>relatorio/verificacao_dados.md</code> no repositório)."],
    "th.aspect": ["Aspect", "Aspecto"],
    "th.wmars": ["Mars weight", "Peso Marte"],
    "th.wmoon": ["Moon weight", "Peso Lua"],
    "th.range": ["Range", "Faixa"],
    "th.unit": ["Unit", "Unidade"],
    "na": ["(not applicable)", "(não se aplica)"],
    "unit.temperatura": ["°C (mean surface temperature)", "°C (temperatura média da superfície)"],
    "unit.relevo": ["m (standard deviation of elevation in a ~2° window)", "m (desvio padrão da elevação numa janela de ~2°)"],
    "unit.gelo": ["fraction 0–1", "fração 0–1"],
    "unit.vento": ["m/s (mean wind at the lowest MERRA-2 level, ~50–70 m)", "m/s (vento médio no nível mais baixo do MERRA-2, ~50–70 m)"],
    "unit.amplitude": ["°C (variation over the year)", "°C (variação ao longo do ano)"],
    "unit.poeira": ["µg/m³ (suspended dust, annual mean)", "µg/m³ (poeira em suspensão, média anual)"],
    "unit.geologia": ["ASTER quartz index (no unit)", "índice de quartzo do ASTER (sem unidade)"],
    "src.earth": ["Earth", "Terra"],
    "src.mars": ["Mars", "Marte"],
    "src.moon": ["Moon", "Lua"],
    "src.nonnasa": ["Non-NASA supplement: {text}", "Complemento fora da NASA: {text}"],
    "comp.etopo2022": ["ETOPO 2022 (NOAA), relief where SRTM does not cover (McMurdo Dry Valleys)",
                       "ETOPO 2022 (NOAA), relevo onde o SRTM não cobre (Vales Secos de McMurdo)"],
    "status.base": ["Real NASA data at {n} of {total} Earth places. The Mars comparison uses: {mars}. The Moon comparison uses: {moon}.",
                    "Dados reais da NASA em {n} dos {total} locais da Terra. A comparação com Marte usa: {mars}. A comparação com a Lua usa: {moon}."],
    "status.missing": [" Aspects with no data on Earth: {list}.", " Aspectos sem dado na Terra: {list}."],
    "como.generated": ["{status} Data generated on {date}. Earth: year(s) {years} (MODIS and MERRA-2).",
                       "{status} Dados gerados em {date}. Terra: ano(s) {years} (MODIS e MERRA-2)."],
    "footer": ["NASA Space Apps Challenge 2026 · Terrestrial Analogs challenge<br>Place photos: Wikimedia Commons, freely licensed (the author and license of each photo appear in the panel and in assets/lugares/CREDITOS.md)",
               "NASA Space Apps Challenge 2026 · Desafio Terrestrial Analogs<br>Fotos dos lugares: Wikimedia Commons, com licença livre (autor e licença de cada foto aparecem no painel e em assets/lugares/CREDITOS.md)"]
  };

  // ---------- Motor ----------
  const IDIOMAS = ["en", "pt"];
  const LOCALES = { en: "en-US", pt: "pt-BR" };
  let idioma = "en";                         // o site sempre abre em inglês
  try {
    const salvo = raiz.localStorage && raiz.localStorage.getItem("idioma");
    if (IDIOMAS.indexOf(salvo) >= 0) idioma = salvo;
  } catch (e) { /* sem armazenamento: fica em inglês */ }

  function t(chave, params) {
    const par = K[chave];
    if (!par) {
      if (typeof console !== "undefined") console.warn("i18n: chave sem texto:", chave);
      return chave;
    }
    let s = par[idioma === "pt" ? 1 : 0];
    if (params) s = s.replace(/\{(\w+)\}/g, (m, k) => (k in params ? params[k] : m));
    return s;
  }

  // Texto de dados bilíngues { pt, en } (ou string simples)
  function L(obj) {
    if (obj === null || obj === undefined) return "";
    if (typeof obj === "string") return obj;
    return obj[idioma] || obj.pt || obj.en || "";
  }

  function locale() { return LOCALES[idioma]; }

  // "A, B and C" / "A, B e C"
  function lista(itens) {
    if (typeof Intl !== "undefined" && Intl.ListFormat) {
      return new Intl.ListFormat(locale(), { style: "long", type: "conjunction" }).format(itens);
    }
    if (itens.length <= 1) return itens.join("");
    return itens.slice(0, -1).join(", ") + (idioma === "pt" ? " e " : " and ") + itens[itens.length - 1];
  }

  // Aplica os textos fixos do HTML
  function aplicar() {
    const doc = raiz.document;
    if (!doc) return;
    doc.documentElement.lang = idioma === "pt" ? "pt-BR" : "en";
    doc.title = t("meta.title");
    const meta = doc.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", t("meta.desc"));
    doc.querySelectorAll("[data-i18n]").forEach(e => { e.textContent = t(e.getAttribute("data-i18n")); });
    doc.querySelectorAll("[data-i18n-html]").forEach(e => { e.innerHTML = t(e.getAttribute("data-i18n-html")); });
    doc.querySelectorAll("[data-i18n-attr]").forEach(e => {
      e.getAttribute("data-i18n-attr").split(";").forEach(par => {
        const i = par.indexOf(":");
        if (i > 0) e.setAttribute(par.slice(0, i).trim(), t(par.slice(i + 1).trim()));
      });
    });
    doc.querySelectorAll("[data-lang]").forEach(b => {
      const ativo = b.getAttribute("data-lang") === idioma;
      b.classList.toggle("ativo", ativo);
      b.setAttribute("aria-pressed", String(ativo));
    });
  }

  function setIdioma(novo) {
    if (IDIOMAS.indexOf(novo) < 0 || novo === idioma) return;
    idioma = novo;
    try { raiz.localStorage.setItem("idioma", novo); } catch (e) { /* ignora */ }
    aplicar();
    if (raiz.document) raiz.document.dispatchEvent(new raiz.CustomEvent("idiomaMudou", { detail: novo }));
  }

  function iniciar() {
    aplicar();
    raiz.document.querySelectorAll("[data-lang]").forEach(b => {
      b.addEventListener("click", () => setIdioma(b.getAttribute("data-lang")));
    });
  }

  const api = { K, t, L, locale, lista, aplicar, setIdioma, iniciar, idioma: () => idioma, IDIOMAS,
                // só para testes: força o idioma sem mexer no armazenamento
                _forcar: l => { idioma = l; } };
  raiz.I18N = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (raiz.document) iniciar();
})(typeof window !== "undefined" ? window : globalThis);
