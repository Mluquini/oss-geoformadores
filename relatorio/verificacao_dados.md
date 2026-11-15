# Verificação dos dados

Gerado por `scripts/07_verificar_dados.py` em 2026-11-15.
**Resultado: 62 verificações OK, 0 FALHAS, 0 avisos, 0 não verificadas.**
## Como a verificação foi feita
O script **não reaproveita o código** dos scripts que geraram os dados: refaz as contas do zero, lendo os arquivos brutos da NASA, para pegar erros que o próprio gerador não enxergaria (por exemplo, latitudes invertidas). Na Terra, confere **todas as células**.
## O que isto prova, e o que não prova
- **Prova:** os produtos existem nos catálogos oficiais da NASA; os números do site são exatamente os que saem dos arquivos brutos; a leitura (orientação, escala, unidades) está certa nos pontos conhecidos; não há dado de exemplo ou estimado no que o site carrega.
- **NÃO prova:** que os produtos da NASA em si estão corretos (confiamos neles); que cada média de uma célula de 2° representa o ponto exato; frases de interpretação (por exemplo, 'útil para testar').
- **Não é tudo medida direta da NASA:** veja a seção Limitações do site e do `relatorio/data_report.md` (GTOPO30 acima de 60°N e ETOPO 2022 no extremo sul no relevo; MERRA-2 é reanálise; temperatura polar da Lua é derivada).

## 1 Origem

| Resultado | Verificação | Detalhe |
|---|---|---|
| OK | MOD11C3 v061 existe no catálogo oficial | provedor LPCLOUD (NASA LP DAAC); DOI 10.5067/MODIS/MOD11C3.061 |
| OK | MOD10CM v61 existe no catálogo oficial | provedor NSIDC_CPRD (NASA NSIDC DAAC); DOI 10.5067/MODIS/MOD10CM.061 |
| OK | SRTMGL30 v002 existe no catálogo oficial | provedor LPCLOUD (NASA LP DAAC); DOI 10.5067/MEASURES/SRTM/SRTMGL30.002 |
| OK | AG5KMMOH v041 existe no catálogo oficial | provedor LPCLOUD (NASA LP DAAC); DOI 10.5067/COMMUNITY/ASTER_GED/AG5KMMOH.041 |
| OK | M2TMNXFLX v5.12.4 existe no catálogo oficial | provedor GES_DISC (NASA GES DISC); DOI 10.5067/0JRLVL8YV2Y4 |
| OK | M2TMNXAER v5.12.4 existe no catálogo oficial | provedor GES_DISC (NASA GES DISC); DOI 10.5067/FH9A0MLJPC7N |
| OK | 5 DOIs do pipeline resolvem | doi.org respondeu para todos |
| OK | 9 arquivos de dados do PDS respondem | servidor pds-geosciences.wustl.edu (PDS Geosciences Node) |
| OK | PDS Geosciences Node é um nó da NASA | a página oficial se identifica como NASA |
| OK | Rótulos PDS dos arquivos brutos trazem os DATA_SET_ID da NASA | MOLA, GRS, LOLA, Diviner (CF, GCP, PRP): MGS-M-MOLA-5-MEGDR-L3-V1.0, ODY-M-GRS-5-ELEMENTS-V1.0, LRO-L-LOLA-4-GDR-V1.0, LRO-L-DLRE-5-GDR-V1.0, LRO-L-DLRE-5-PRP-V2.0, LRO-L-DLRE-5-GCP-V1.0 |
| OK | Os arquivos brutos baixados têm os nomes oficiais dos produtos da NASA | 12 meses de 2020 em cada produto mensal |
| OK | Coordenadas dos 12 locais da Terra x Wikidata | 12 dentro de 2° (atacama 0.00°; vales-secos 0.00°; lut 0.68°; danakil 0.00°; mauna-kea 0.00°; holuhraun 0.00°; haughton 0.45°; namibe 0.04°; lanzarote 0.00°; lava-beds 0.00°; utah-mdrs 0.00°; svalbard 0.08°) |
| OK | Links da seção Referências do site | 27 links externos e 1 locais respondem |

## 2 Nada falso

| Resultado | Verificação | Detalhe |
|---|---|---|
| OK | Nada de exemplo ou estimado nos arquivos que o site carrega | data/dados_reais.js, data/imagens.js, data/celulas.js, i18n.js, busca.js, script.js, planejar.js |
| OK | Nenhum "estimativa": true em todo o repositório | a pasta data/exemplo não existe mais; data/textos guarda só textos, sem números |
| OK | data/textos: só textos (pt e en), sem nenhum número de dado | 22 locais |
| OK | Valores da Terra dentro do fisicamente possível, sem NaN | 1456 valores conferidos em 133 células |
| OK | Os 12 locais do site mostram exatamente o que o pipeline calculou | dados_reais.js == earth_grid.json |
| OK | data/celulas.js (busca reversa) bate com earth_grid.json | 133 células, diferença só de arredondamento |
| OK | A porcentagem de semelhança mostrada bate com a fórmula refeita do zero | 120 rankings, maior diferença 0.050 ponto |
| OK | Notas 0-1 de Marte e da Lua batem com os valores físicos dos JSONs | 38 notas recalculadas |

## 3 Terra (recálculo)

| Resultado | Verificação | Detalhe |
|---|---|---|
| OK | temperatura média anual (MOD11C3): relido do arquivo bruto, 132 células com valor | maior diferença 0.00049 |
| OK | amplitude anual (MOD11C3): relido do arquivo bruto, 132 células com valor | maior diferença 0.00050 |
| OK | amplitude diurna, média do ano de (dia − noite) (MOD11C3): relido do arquivo bruto, 132 células com valor | maior diferença 0.00050 |
| OK | fração do ano abaixo de 0 °C (MOD11C3): relido do arquivo bruto, 132 células com valor | maior diferença 0.00050 |
| OK | fração do ano com neve (MOD10CM): relido do arquivo bruto, 132 células com valor | maior diferença 0.00048 |
| OK | elevação média (SRTMGL30; ETOPO só onde falta): relido do arquivo bruto, 133 células com valor | maior diferença 0.049 m |
| OK | rugosidade do relevo: relido do arquivo bruto, 133 células com valor | maior diferença 0.050 m |
| OK | declividade na escala de 3,7 km (blocos 4x4 do SRTM; 2x2 do ETOPO), refeita com diferenças centrais próprias: 111 células | maior diferença 0.0005°; 21 células coladas na borda de um tile ficaram de fora da comparação |
| OK | Marco conhecido: Mauna Kea (cume ~4.207 m) | max no arquivo = 4120 m (esperado 3900 a 4300 m) |
| OK | Marco conhecido: Everest/Himalaia (cume 8.849 m) | max no arquivo = 8685 m (esperado 7500 a 9000 m) |
| OK | Marco conhecido: Dallol/Danakil (~ -125 m) | min no arquivo = -131 m (esperado -200 a -50 m) |
| OK | vento médio, MERRA-2 SPEED: relido dos 12 arquivos mensais, 148 células | maior diferença 0.00050 |
| OK | poeira em suspensão, MERRA-2 DUSMASS: relido dos 12 arquivos mensais, 148 células | maior diferença 0.00050 |
| OK | Coerência física: poeira do Saara >> Antártida | Saara 120 x Antártida 0.5 µg/m³ |
| OK | Marcos de temperatura (Antártida, Lut, Svalbard) dentro do esperado | (-81.0, 99.0): -55.7 °C; (31.0, 59.0): 30.6 °C; (79.0, 13.0): -12.9 °C |

## 3 Marte e Lua (recálculo)

| Resultado | Verificação | Detalhe |
|---|---|---|
| OK | MOLA: o ponto mais alto é Olympus Mons | 21171 m em 17.3°N, 227.0°L (orientação e escala corretas) |
| OK | MOLA: Hellas é a bacia mais funda | mínimo -8177 m na região de Hellas |
| OK | MOLA: elevação média dos 6 locais de Marte, relida do arquivo bruto | maior diferença 0.044 m |
| OK | MOLA: rugosidade do relevo dos 6 locais de Marte, relida do arquivo bruto | maior diferença 0.000 m |
| OK | MOLA: declividade (escala de 3,7 km) dos 6 locais de Marte, refeita do arquivo bruto | maior diferença 0.0000°; Valles Marineris 7.6° (o mais inclinado) x Utopia 0.3° (o mais plano) |
| OK | Marte: amplitude diurna fica nula nos locais sem rover, com o motivo escrito (nada foi estimado) | 4 locais |
| OK | GRS: água no solo dos 6 locais de Marte, relida da tabela bruta | valores entre 1 e 12 % em massa, como esperado na faixa equatorial |
| OK | LOLA: extremos da Lua | mais alto 10686 m; mais fundo -8982 m em -70.3°, 187.5°L (bacia Pólo Sul-Aitken) |
| OK | LOLA: elevação média dos 4 locais da Lua, relida do arquivo bruto | maior diferença 0.023 m |
| OK | LOLA: rugosidade do relevo dos 4 locais da Lua, relida do arquivo bruto | maior diferença 0.000 m |
| OK | LOLA: declividade (escala de 3,8 km) dos 4 locais da Lua, refeita do arquivo bruto | maior diferença 0.0102°; Tranquillitatis 0.7° (o mais plano) x Shackleton 12.1° |
| OK | Diviner CF relido; mare (basalto) tem CF maior que o planalto | Tranquillitatis 8.34 µm > Tycho 7.91 µm |
| OK | Diviner GCP: temperatura média, máxima e mínima relidas dos arquivos brutos | tranquillitatis: 94-394 K (média 217); tycho: 114-348 K (média 209) |
| OK | Diviner PRP: Polo Sul (Cratera Shackleton) | média anual 96.3 K; 13.2% da janela abaixo de 110 K; temperatura mínima 28 K |
| OK | Diviner PRP: Monte Malapert | média anual 114.4 K; 2.6% da janela abaixo de 110 K; temperatura mínima 35 K |

## 3 Marte (rovers)

| Resultado | Verificação | Detalhe |
|---|---|---|
| OK | Gale / Curiosity REMS: temperatura do solo e amplitude dia/noite refeitas dos arquivos brutos do rover | 21 sols: média -49.4 °C (223.8 K), amplitude 77.3 K; todos os sols de 1 a 668 (1º ano marciano) |
| OK | Jezero / Perseverance MEDA: temperatura do solo e amplitude dia/noite refeitas dos arquivos brutos do rover | 17 sols: média -48.0 °C (225.2 K), amplitude 77.5 K; todos os sols de 1 a 668 (1º ano marciano) |
| OK | Nenhum valor de temperatura inventado para os outros 4 locais de Marte; vento de Marte fora do cálculo, com motivo | null com motivo escrito |
| OK | Os arquivos dos rovers existem no PDS Atmospheres Node (NASA) | https://atmos.nmsu.edu/PDS/data/PDS4/msl_rems_bundle/data_calibrated/; https://atmos.nmsu.edu/PDS/data/PDS4/Mars2020/mars2020_meda/data_derived_env/ |

## 4 Fatos nos textos

| Resultado | Verificação | Detalhe |
|---|---|---|
| OK | Gravidade de Marte (38%) e da Lua (17%) batem com a ficha da NASA (texto em inglês e em português) | Marte 3.73/9.82 = 38.0%; Lua 1.62/9.8 = 16.5% |
| OK | 'Pesam mais de 2,5 vezes' (en e pt): ficha dá | 2.63 vezes |
| OK | Ar de Marte 'mais de N vezes mais fino' bate com a ficha (6,36 mb), em en e pt | ficha: 6.36 mb contra 1013 mb = 159 vezes; texto: mais de 150 |
| OK | Atmosfera de Marte 'quase toda CO₂' (en e pt) | ficha da NASA: 95.1% de CO₂ em volume |
| OK | Temperatura equatorial da Lua: nosso Diviner x ficha da NASA | ficha 95-390 K; Tranquillitatis (8°N) no Diviner 94-394 K |
| OK | Dia e noite lunares 'cerca de 15 dias' (en e pt) | ficha: período sinódico 29.53 dias; metade = 14.8 dias; texto: 15 |
| OK | Lua 'praticamente vácuo' | ficha: 3 x 10^-15 bar à noite |
