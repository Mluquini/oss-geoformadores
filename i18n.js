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
    "asp.diurna": ["Day–night range", "Amplitude dia/noite"],
    "asp.declividade": ["Slope", "Declividade"],
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
    "res.decl": ["mean slope {v}°", "declividade média {v}°"],
    "res.diurna": ["day–night range {v} K", "amplitude dia/noite {v} K"],
    "res.agua": ["water in the soil {v}% by mass", "água no solo {v}% em massa"],
    "res.temp": ["mean temperature {v} °C", "temperatura média {v} °C"],
    "res.tempmax": ["maximum {v} °C", "máxima {v} °C"],
    "res.ventorover": ["wind measured by the rover {v} m/s (only part of the year, not used in the similarity)", "vento medido pelo rover {v} m/s (só parte do ano, não entra na semelhança)"],
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
    "val.diurna": ["Day–night range (MODIS day − night, yearly mean)", "Amplitude dia/noite (MODIS dia − noite, média do ano)"],
    "val.elev": ["Mean elevation", "Elevação média"],
    "val.rug": ["Relief roughness (elevation deviation)", "Rugosidade do relevo (desvio da elevação)"],
    "val.slope": ["Mean slope", "Declividade média"],
    "val.slope3": ["Mean slope at the ~3.7 km scale (used to compare)", "Declividade média na escala de ~3,7 km (a usada na comparação)"],
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
    "pasp.diurna": ["Day–night temperature range", "Amplitude de temperatura dia/noite"],
    "pasp.relevo": ["Terrain roughness", "Rugosidade do relevo"],
    "pasp.declividade": ["Mean slope (~3.7 km scale)", "Declividade média (escala de ~3,7 km)"],
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
    "test.diurna": ["Test electronics and batteries under very large day–night temperature swings.", "Testar eletrônica e baterias sob variações enormes de temperatura entre o dia e a noite."],
    "test.decl.alta": ["Test rover climbs, descents and stability on steep slopes.", "Testar subidas, descidas e a estabilidade de rovers em encostas inclinadas."],
    "test.decl.baixa": ["Test landing and driving on gentle, almost flat slopes.", "Testar pouso e deslocamento em terreno de inclinação suave, quase plano."],
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
    "como.p1": ["Each place gets a <strong>score from 0 to 1</strong> in up to 6 aspects. For the score to be comparable across Earth, Mars and the Moon, we use <strong>the same physical range for all three</strong> (table below), not a different range for each planet.",
                "Cada lugar recebe uma <strong>nota de 0 a 1</strong> em até 6 aspectos. Para a nota ser comparável entre a Terra, Marte e a Lua, usamos <strong>a mesma faixa física para os três</strong> (tabela abaixo), e não uma faixa diferente para cada planeta."],
    "como.l.temp": ["<strong>Temperature</strong>: mean surface temperature (Earth: annual day-and-night average from MODIS; Moon: average over the lunar day, Diviner). <strong>Day–night range</strong>: how much hotter the day is than the night (Earth: yearly mean of MODIS day minus night, an approximation of the daily maximum minus minimum; Moon: maximum minus minimum over the lunar day, Diviner, only at the equatorial places). Mars has no data for this.",
                    "<strong>Temperatura</strong>: temperatura média da superfície (Terra: média anual de dia e noite do MODIS; Lua: média ao longo do dia lunar, Diviner). <strong>Amplitude dia/noite</strong>: quanto o dia é mais quente que a noite (Terra: média do ano de MODIS dia menos noite, uma aproximação do máximo menos o mínimo do dia; Lua: máximo menos mínimo ao longo do dia lunar, Diviner, só nos locais equatoriais). Marte não tem dado para isso."],
    "como.l.relevo": ["<strong>Relief</strong>: roughness, that is, the standard deviation of elevation in a ~2° window (Earth: SRTMGL30; Mars: MOLA; Moon: LOLA). <strong>Slope</strong>: the mean inclination of the terrain. Slope depends on pixel size, so all three bodies are measured at the same ~3.7 km scale.",
                      "<strong>Relevo</strong>: rugosidade, isto é, o desvio padrão da elevação numa janela de ~2° (Terra: SRTMGL30; Marte: MOLA; Lua: LOLA). <strong>Declividade</strong>: a inclinação média do terreno. Ela depende do tamanho do pixel, então os três corpos são medidos na mesma escala de ~3,7 km."],
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
    "como.weights.note": ["These are the challenge's weights (Mars: temperature 25%, relief 20%, ice 15%, geology 25%, wind 15%; Moon: 30%, 25%, 30%, 15% and 0%) <strong>without geology</strong>, renormalized to add up to 100%. The challenge does not split them, so we <strong>split the weight of temperature in half</strong> (mean temperature and day–night range) <strong>and the weight of relief in half</strong> (roughness and slope): the total of each category stays the same.",
                          "São os pesos do desafio (Marte: temperatura 25%, relevo 20%, gelo 15%, geologia 25%, vento 15%; Lua: 30%, 25%, 30%, 15% e 0%) <strong>sem a geologia</strong>, renormalizados para somar 100%. O desafio não os divide, então <strong>dividimos o peso da temperatura ao meio</strong> (temperatura média e amplitude dia/noite) <strong>e o do relevo ao meio</strong> (rugosidade e declividade): o total de cada categoria continua o mesmo."],
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
    "como.lim.7": ["The <strong>day–night range</strong> is physically very different: about 230–300 K on the Moon but only about 1–34 K on Earth (humid air and soil soften the cycle). No place on Earth resembles the Moon in this aspect, so it lowers the similarity of the equatorial Moon places. This is real, not an error. Mars has no data for it, and the polar Moon places lack it too (the polar product gives only yearly averages).",
                   "A <strong>amplitude dia/noite</strong> é fisicamente muito diferente: cerca de 230–300 K na Lua e só cerca de 1–34 K na Terra (o ar e o solo úmidos amortecem o ciclo). Nenhum lugar da Terra se parece com a Lua nesse aspecto, e isso derruba a semelhança dos locais equatoriais da Lua. Isso é real, e não um erro. Marte não tem dado para ela, e os locais polares da Lua também não (o produto polar traz só médias do ano)."],
    "como.lim.6": ["<strong>Not everything is a direct NASA measurement.</strong> Earth relief: SRTMGL30 (NASA) goes from 90°N to 60°S, but the radar only covered 60°N to 56°S; above 60°N (Holuhraun, Haughton, Svalbard) the values almost certainly come from the GTOPO30 (USGS) embedded in the product, and in the far south (McMurdo Dry Valleys) they come from ETOPO 2022 (NOAA), which is not NASA. Earth wind and dust: MERRA-2 is a reanalysis (a model corrected by observations). Moon temperature at the poles: a value derived by the Diviner team, not a direct measurement.",
                   "<strong>Nem tudo é medida direta da NASA.</strong> Relevo da Terra: o SRTMGL30 (NASA) vai de 90°N a 60°S, mas o radar só cobriu 60°N a 56°S; acima de 60°N (Holuhraun, Haughton, Svalbard) os valores vêm, quase com certeza, do GTOPO30 (USGS) embutido no produto, e no extremo sul (Vales Secos de McMurdo) vêm do ETOPO 2022 (NOAA), que não é da NASA. Vento e poeira da Terra: o MERRA-2 é uma reanálise (modelo corrigido por observações). Temperatura da Lua nos polos: valor derivado pela equipe do Diviner, e não medida direta."],
    "como.lim.8": ["<strong>Mars temperature, day–night range and wind come from the rovers.</strong> Only Gale (Curiosity, REMS) and Jezero (Perseverance, MEDA) have them, measured at one point (not over a 2° window) and averaged over a sample of sols (24 spread over the first Martian year, of which about 20 had a usable full-day curve). Gale gives the temperature of the ground; at Jezero it is computed from thermal infrared assuming emissivity 1, which underestimates it by a few kelvin. The rovers also measured wind, but not over a full year (the Jezero wind product ends around sol 300 and almost all Gale wind was discarded) and at about 1.5 m high, so wind is <strong>not</strong> used for Mars. Because only two Mars places have these aspects, <strong>percentages between places that were compared with a different number of aspects are less comparable</strong>: the panel always says how many aspects were used.",
                   "<strong>A temperatura, a amplitude dia/noite e o vento de Marte vêm dos rovers.</strong> Só Gale (Curiosity, REMS) e Jezero (Perseverance, MEDA) têm esses dados, medidos num ponto (não numa janela de 2°) e como média de uma amostra de sols (24 espalhados pelo primeiro ano marciano, dos quais uns 20 tinham uma curva completa do dia). Em Gale é a temperatura do solo; no Jezero ela é calculada do infravermelho térmico supondo emissividade 1, o que subestima alguns kelvin. Os rovers também mediram vento, mas não durante um ano inteiro (o produto de vento do Jezero termina por volta do sol 300 e quase todo o vento de Gale foi descartado) e a cerca de 1,5 m de altura; por isso o vento <strong>não</strong> é usado em Marte. Como só dois locais de Marte têm esses aspectos, <strong>as porcentagens entre locais comparados com números diferentes de aspectos são menos comparáveis</strong>: o painel sempre diz quantos aspectos entraram."],
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
    "unit.declividade": ["degrees (mean terrain slope at a ~3.7 km pixel scale)", "graus (inclinação média do terreno na escala de ~3,7 km por pixel)"],
    "unit.diurna": ["K or °C (difference between day and night temperature)", "K ou °C (diferença entre a temperatura do dia e a da noite)"],
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
    "status.marte_extra": [" Only at {sites} (where a rover measured them) it also uses: {list}.", " Só em {sites} (onde um rover mediu) ela usa também: {list}."],
    "status.missing": [" Aspects with no data on Earth: {list}.", " Aspectos sem dado na Terra: {list}."],
    "como.generated": ["{status} Data generated on {date}. Earth: year(s) {years} (MODIS and MERRA-2).",
                       "{status} Dados gerados em {date}. Terra: ano(s) {years} (MODIS e MERRA-2)."],
    "nav.refs": ["References", "Referências"],
    "ref.title": ["References", "Referências"],
    "ref.intro": ["Everything shown on this site comes from the sources below. Direct NASA measurements are kept apart from models and from non-NASA sources. The data were downloaded in 2026 and checked by an independent script (see the verification report at the end).", "Tudo o que aparece neste site vem das fontes abaixo. As medidas diretas da NASA ficam separadas dos modelos e das fontes que não são da NASA. Os dados foram baixados em 2026 e conferidos por um script independente (veja o relatório de verificação no fim)."],
    "ref.res.title": ["1. Resources from the “Resources” tab of the NASA challenge page that were used", "1. Recursos da aba “Resources” da página do desafio da NASA que foram usados"],
    "ref.res.intro": ["These are the resources from that tab used on this site, and exactly how each one was used.", "Estes são os recursos dessa aba usados neste site, e exatamente como cada um foi usado."],
    "ref.th.resource": ["Resource", "Recurso"],
    "ref.th.used": ["Used?", "Usado?"],
    "ref.th.how": ["How it was used", "Como foi usado"],
    "ref.th.product": ["Product / source", "Produto / fonte"],
    "ref.th.gives": ["What we take from it", "O que tiramos dele"],
    "ref.th.link": ["Reference", "Referência"],
    "ref.yes": ["YES", "SIM"],
    "ref.yes.cat": ["YES (through its catalog)", "SIM (pelo catálogo)"],
    "ref.r.earthdata": ["All Earth data (MODIS, SRTM, MERRA-2, ASTER) were found and downloaded through NASA's CMR catalog, the same catalog behind Earthdata Search, using the earthaccess library. The Earthdata Search web page itself was not opened.", "Todos os dados da Terra (MODIS, SRTM, MERRA-2, ASTER) foram encontrados e baixados pelo catálogo CMR da NASA, o mesmo por trás do Earthdata Search, usando a biblioteca earthaccess. A página web do Earthdata Search em si não foi aberta."],
    "ref.r.pds": ["All data for Mars and the Moon come from the PDS: the Geosciences Node (MOLA, GRS, LOLA, Diviner) and the Atmospheres Node (rover instruments REMS and MEDA).", "Todos os dados de Marte e da Lua vêm do PDS: o nó de Geociências (MOLA, GRS, LOLA, Diviner) e o nó de Atmosferas (instrumentos dos rovers, REMS e MEDA)."],
    "ref.r.lro": ["LOLA (altitude and slope) and Diviner (temperature, day–night range, cold traps, composition). LEND, LROC and Mini-RF were not used.", "LOLA (altitude e declividade) e Diviner (temperatura, amplitude dia/noite, armadilhas frias, composição). LEND, LROC e Mini-RF não foram usados."],
    "ref.r.diviner": ["The south polar resource product (PRP) gives the yearly mean temperature and the cold-trap area of Shackleton and Malapert, which are compared with cold, icy places on Earth.", "O produto de recursos do polo sul (PRP) dá a temperatura média anual e a área de armadilha fria de Shackleton e Malapert, que são comparadas com lugares frios e com gelo na Terra."],
    "ref.res.note": ["Also, the pages of the resources above were used only to find the data; the numbers on the site come from the files listed in section 2.", "As páginas dos recursos acima serviram só para achar os dados; os números do site vêm dos arquivos listados na seção 2."],
    "ref.prod.title": ["2. Data products behind the numbers", "2. Produtos de dados por trás dos números"],
    "ref.earth": ["Earth (NASA Earthdata)", "Terra (NASA Earthdata)"],
    "ref.mars": ["Mars (NASA PDS)", "Marte (NASA PDS)"],
    "ref.moon": ["Moon (NASA PDS, LRO)", "Lua (NASA PDS, LRO)"],
    "ref.g.mod11": ["Mean temperature, yearly range, day–night range and fraction of the year below 0 °C", "Temperatura média, variação ao longo do ano, amplitude dia/noite e fração do ano abaixo de 0 °C"],
    "ref.g.mod10": ["Fraction of the year with snow (used with the temperature to build the “ice” aspect)", "Fração do ano com neve (junto com a temperatura forma o aspecto “gelo”)"],
    "ref.g.srtm": ["Elevation, roughness and slope of the terrain", "Elevação, rugosidade e declividade do terreno"],
    "ref.g.merra": ["Wind and dust (a reanalysis: a model corrected by observations, not a direct measurement)", "Vento e poeira (uma reanálise: modelo corrigido por observações, e não medida direta)"],
    "ref.g.aster": ["Quartz index (geology): only used in the Plan a mission mode; not compared with Mars or the Moon", "Índice de quartzo (geologia): só usado no modo Planejar missão; não é comparado com Marte nem com a Lua"],
    "ref.g.mola": ["Altitude: terrain roughness and slope of the Mars places", "Altitude: rugosidade e declividade dos locais de Marte"],
    "ref.g.grs": ["Water in the soil (% by mass)", "Água no solo (% em massa)"],
    "ref.g.rems": ["Ground temperature and day–night range at Gale (sample of 24 sols of the first Martian year)", "Temperatura do solo e amplitude dia/noite em Gale (amostra de 24 sols do primeiro ano marciano)"],
    "ref.g.meda": ["Ground temperature and day–night range at Jezero (same sampling). Its wind data are shown but not used in the similarity", "Temperatura do solo e amplitude dia/noite no Jezero (mesma amostragem). O vento dele é mostrado, mas não entra na semelhança"],
    "ref.g.lola": ["Altitude: terrain roughness and slope of the Moon places", "Altitude: rugosidade e declividade dos locais da Lua"],
    "ref.g.gcp": ["Mean temperature and day–night range at the equatorial Moon places", "Temperatura média e amplitude dia/noite nos locais equatoriais da Lua"],
    "ref.g.prp": ["Yearly mean temperature and cold-trap area at the polar Moon places (a product derived and modelled by the Diviner team)", "Temperatura média anual e área de armadilha fria nos locais polares da Lua (produto derivado e modelado pela equipe do Diviner)"],
    "ref.g.cf": ["Composition (Christiansen Feature): kept in the data, not used in the similarity", "Composição (Christiansen Feature): guardada nos dados, mas não usada na semelhança"],
    "ref.other.title": ["3. Sources that are not from NASA", "3. Fontes que não são da NASA"],
    "ref.g.etopo": ["NOAA. Relief of the McMurdo Dry Valleys, where SRTM does not cover (marked on the site)", "NOAA. Relevo dos Vales Secos de McMurdo, onde o SRTM não cobre (avisado no site)"],
    "ref.g.gtopo": ["USGS. Fills SRTMGL30 above 60°N (Holuhraun, Haughton, Svalbard); it is embedded in the NASA product", "USGS. Preenche o SRTMGL30 acima de 60°N (Holuhraun, Haughton, Svalbard); está embutido no produto da NASA"],
    "ref.g.iau": ["Official centers of the Mars and Moon places (USGS Astrogeology)", "Centros oficiais dos locais de Marte e da Lua (USGS Astrogeology)"],
    "ref.g.commons": ["The 12 place photos, with a free license (author and license in each photo's caption and in the credits file)", "As 12 fotos dos lugares, com licença livre (autor e licença na legenda de cada foto e no arquivo de créditos)"],
    "ref.check.title": ["4. Used to check, not as data", "4. Usados para conferir, e não como dado"],
    "ref.g.wikidata": ["Checks that the coordinates of the 12 Earth places are right (all within 2°)", "Confere se as coordenadas dos 12 locais da Terra estão certas (todas a menos de 2°)"],
    "ref.g.fact": ["Gravity, atmosphere and lunar day quoted in “Where the analogy fails”", "Gravidade, atmosfera e dia lunar citados em “Onde a analogia falha”"],
    "ref.g.williams": ["Describes how the Diviner temperature products (GCP) were made", "Descreve como foram feitos os produtos de temperatura do Diviner (GCP)"],
    "ref.g.report": ["Our independent check: it re-reads the raw NASA files and recomputes the numbers", "Nossa conferência independente: relê os arquivos brutos da NASA e recalcula os números"],
    "ref.credits": ["Photo credits (file)", "Créditos das fotos (arquivo)"],
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
