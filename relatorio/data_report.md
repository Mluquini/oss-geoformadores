# Relatório de dados: Globo de Análogos

Gerado automaticamente por `scripts/04_normalizar.py` em 2026-11-14.
> Tudo aqui vem dos metadados que os scripts 01, 02 e 03 gravaram junto com os números. Quando um campo está `null`, o motivo aparece na seção 3.
## 1. Produtos usados
| Corpo | Aspecto | Produto | Versão | Instrumento | Resolução | Período | Link |
|---|---|---|---|---|---|---|---|
| Terra | temperatura | MOD11C3 | 061 | Terra/MODIS | 0,05° (agregado em células de 2°) | ver nota abaixo | https://doi.org/10.5067/MODIS/MOD11C3.061 |
| Terra | gelo | MOD10CM (neve) + MOD11C3 (T<0 °C) | 61 / 061 | Terra/MODIS | 0,05° (células de 2°) | ver nota abaixo | https://doi.org/10.5067/MODIS/MOD10CM.061 |
| Terra | relevo | SRTMGL30 | 002 | SRTM (Shuttle) | 30 arco-seg (~1 km), células de 2° | ver nota abaixo | https://doi.org/10.5067/MEASURES/SRTM/SRTMGL30.002 |
| Terra | vento | M2TMNXFLX (SPEED) e M2TMNXAER (DUSMASS) | 5.12.4 | MERRA-2 (reanálise, GMAO/NASA) | 0,5° x 0,625° (células de 2°) | ver nota abaixo | https://doi.org/10.5067/0JRLVL8YV2Y4 |
| Marte | gelo | ODY-M-GRS-5-ELEMENTS-V1.0 (arquivo h2o_sr_5x5, v2.0) | 2.0 | Mars Odyssey/GRS | bins de 5° (suavizado com média móvel de 10°; pegada do GRS ~300 km) | 2002-06-04 a 2005-04-03 | https://pds-geosciences.wustl.edu/ody/ody-m-grs-5-elements-v1/odgm_xxxx/data/smoothed/h2o_sr_5x5.tab |
| Marte | relevo | MGS-M-MOLA-5-MEGDR-L3-V1.0 (arquivo megt90n000eb, versão do produto 2.0) | 2.0 | MGS/MOLA | 16 pixels/grau (~3.71 km/pixel no equador) | 1997-09-15 a 2001-06-30 | https://pds-geosciences.wustl.edu/mgs/mgs-m-mola-5-megdr-l3-v1/mgsl_300x/meg016/megt90n000eb.img |
| Lua | gelo | LRO-L-DLRE-5-GCP-V1.0 (derivado do mesmo GCP) | 002 | LRO/Diviner | 0,5° (~15 km): armadilhas frias menores não são resolvidas | 2009-07-05 a 2015-04-01 | https://pds-geosciences.wustl.edu/lro/urn-nasa-pds-lro_diviner_derived1/data_derived_gcp/global_cumul_avg_cyl_00n10n_002.tab ; https://pds-geosciences.wustl.edu/lro/urn-nasa-pds-lro_diviner_derived1/data_derived_gcp/global_cumul_avg_cyl_50s40s_002.tab |
| Lua | gelo | LRO-L-DLRE-5-PRP-V2.0 (campo temp_max) | 2 | LRO/Diviner | malha triangular (2.880.000 triângulos no polo sul) | ver PRP | https://pds-geosciences.wustl.edu/lro/urn-nasa-pds-lro_diviner_derived1/data_derived_prp/dlre_prp_south.tab |
| Lua | relevo | LRO-L-LOLA-4-GDR-V1.0 (ldem_16, versão do produto V3.1) | V3.1 | LRO/LOLA | 16 pixels/grau (~1895 m/pixel) | 2009-07-13 a 2016-11-29 | https://pds-geosciences.wustl.edu/lro/lro-l-lola-3-rdr-v1/lrolol_1xxx/data/lola_gdr/cylindrical/img/ldem_16.img |
| Lua | temperatura | LRO-L-DLRE-5-GCP-V1.0 (global_cumul_avg_cyl, coluna tbol, versão do arquivo 002) | 002 (arquivo) / produto GCP V1.0 | LRO/Diviner | 0,5° de lat/lon e 0,25 h de hora local | 2009-07-05 a 2015-04-01 | https://pds-geosciences.wustl.edu/lro/urn-nasa-pds-lro_diviner_derived1/data_derived_gcp/global_cumul_avg_cyl_00n10n_002.tab ; https://pds-geosciences.wustl.edu/lro/urn-nasa-pds-lro_diviner_derived1/data_derived_gcp/global_cumul_avg_cyl_50s40s_002.tab |
| Lua | temperatura | LRO-L-DLRE-5-PRP-V2.0 (dlre_prp_south, versão do produto 2) | 2 | LRO/Diviner | malha triangular (2.880.000 triângulos no polo sul) | derivado de dados de 2009-2016 (ver descrição oficial) | https://pds-geosciences.wustl.edu/lro/urn-nasa-pds-lro_diviner_derived1/data_derived_prp/dlre_prp_south.tab |

Período dos dados da Terra (MODIS e MERRA-2): anos [2020]. SRTM é de fev/2000; (O ASTER GED foi baixado, mas a geologia foi retirada do projeto.)
**Complementos (fora da NASA):** ETOPO 2022 (NOAA), usado só onde o SRTMGL30 não tem dado (extremo sul, McMurdo): não é produto NASA.
### Métodos da Terra
- **temperatura**: Por pixel: média dos 12 meses de (LST dia + LST noite)/2, em °C; amplitude = máx - mín das médias mensais; exige ≥9 meses válidos. Por célula: média dos pixels de terra válidos (terra = Percent_land_in_grid ≥ 50; célula exige ≥25% dos pixels de terra válidos).
- **gelo**: frac_neve = média dos meses com dado (códigos 0-100) de % de neve/100; exige ≥6 meses (meses de noite polar, código 211, ficam de fora: pode subestimar o gelo polar). frac_T_abaixo_0C = fração dos meses com temperatura média diária < 0 °C.
- **relevo**: Por célula: média, desvio padrão (rugosidade) da elevação e média da declividade (gradiente) dos pixels de 30". O SRTMGL30 (NASA, LP DAAC) vai de 90°N a 60°S, mas o radar do SRTM só cobriu 60°N a 56°S: acima de 60°N (Holuhraun, Haughton, Svalbard) os valores vêm, quase com certeza, do GTOPO30 (USGS), que o produto usa para preencher o que o radar não alcançou. Fora do SRTMGL30 (extremo sul, McMurdo) usamos ETOPO 2022 60" (NOAA, COMPLEMENTO, não é NASA), só pixels acima do nível do mar.
- **vento**: Média anual das médias mensais, e média dos pontos da grade dentro de cada célula (inclui oceano). SPEED é a velocidade escalar média (não a magnitude da média dos vetores, que subestima). ATENÇÃO: SPEED não traz a altura nos atributos; o arquivo tem HLML (altura do nível mais baixo do modelo, ~50-70 m nos pontos conferidos), então o vento é provavelmente desse nível e NÃO o vento a 10 m: tende a ser maior que o de 10 m.

## 2. Normalização e semelhança
| Aspecto | Faixa fixa | Unidade | Motivo |
|---|---|---|---|
| temperatura | -250 a 100 | °C (temperatura média anual/diária da superfície) | Cobre de ~ -233 °C (armadilhas frias lunares, ~40 K) até +100 °C. A média anual de superfície mais quente da Terra fica bem abaixo de +100 °C, então o topo da faixa nunca satura na Terra. |
| relevo | 0 a 3000 | m (desvio padrão da elevação numa janela de ~2°) | 0 = planície perfeita. 3000 m já é o de Valles Marineris (cânion de ~7 km); acima disso a nota satura em 1. |
| gelo | 0 a 1 | fração 0-1 | Terra = média de (fração do tempo com neve) e (fração do tempo com T < 0 °C). Lua = fração da área com temperatura máxima < 110 K (armadilha fria). Marte = % em massa de água do GRS dividido por 100 (100% = gelo puro). ATENÇÃO: as três quantidades têm significados físicos DIFERENTES (neve na superfície x gelo enterrado x área fria). É um proxy comum, não uma medida idêntica; revisar com a equipe. |
| vento | 0 a 12 | m/s (velocidade média do vento no nível mais baixo do MERRA-2, ~50-70 m) | Nas células calculadas as médias anuais do MERRA-2 vão de ~4 a ~15 m/s; acima de 12 a nota satura em 1. Não é o vento a 10 m. Marte e Lua não têm medição comparável (o vento da Terra não entra em nenhum ranking). |

**Geologia:** Geologia foi RETIRADA do projeto: não há dado comparável entre os três corpos (Terra: índice de quartzo do ASTER; Lua: Christiansen Feature do Diviner; Marte: sem dado), e uma faixa 0-1 comum exigiria calibração com espectros de laboratório. Os pesos originais do desafio (Marte 25%, Lua 15%) foram redistribuídos entre os outros aspectos. Os valores brutos de geologia seguem guardados nos JSONs, sem uso.

`semelhança = 100% × (1 − √(Σ pesoʹ × (nota_Terra − nota_alvo)²))`, em que `pesoʹ` são os pesos base dos aspectos disponíveis nos DOIS lados, renormalizados para somar 1. Pesos base Marte: temperatura 33.3%, relevo 26.7%, gelo 20.0%, vento 20.0%. Pesos base Lua: temperatura 35.3%, relevo 29.4%, gelo 35.3%, vento 0.0%. (São os pesos do desafio sem a geologia, renormalizados.)

**Cada ranking traz `peso_original_coberto`**: a fração dos pesos originais que de fato entrou na conta. Com Marte, hoje, só relevo e gelo entram (47% do peso); com a Lua entram temperatura, relevo e gelo (100% do peso). Quanto menor esse número, menos a % de semelhança diz sobre o todo.

## 3. O que NÃO foi possível obter, e por quê
- **Marte / temperatura:** Não encontrei no PDS um mapa global de temperatura de superfície de Marte (TES ou MCS) já agregado. O que existe para o MGS/TES é inércia térmica (mgs-m-tes-5-timap-v1), que NÃO é temperatura, e os dados de temperatura por observação (mgs-m-tes-3-tsdr-v2) são enormes e exigem um processamento próprio. Candidato a investigar: MRO/MCS no nó Atmospheres do PDS (não verificado).
- **Marte / vento:** Não existe medição orbital global direta de vento na superfície de Marte. Opacidade de poeira (TES/MCS) seria um proxy, mas não encontrei um mapa global pronto no PDS (não verificado).
- **Lua / vento:** Não se aplica: a Lua não tem atmosfera, então não há vento nem poeira em suspensão.

Células da Terra sem valor (de 148):

| Campo | Células null | % |
|---|---|---|
| temperatura média | 16 | 11% |
| rugosidade do relevo | 15 | 10% |
| fração de neve | 16 | 11% |
| vento | 0 | 0% |

- **Marte e Lua / coordenadas:** os centros dos locais vêm do Gazetteer da IAU (USGS), campos center_lat/center_lon (`coord_verificada: true` nos JSONs). Meridiani Planum é o centro da planície inteira, não o ponto de pouso do Opportunity.
- **Lua / LEND:** não usado. A pasta de dados derivados (`lro-l-lend-4_5-rdr-v1`) redirecionou para a de dados brutos (`lro-l-lend-2-edr-v1`) e não verifiquei nenhum mapa derivado de supressão de nêutrons.

## 4. Limitações científicas

- **Gravidade, atmosfera e radiação não são reproduzidas na Terra.** Marte tem 38% da gravidade da Terra, ar ~100x mais fino e
  muito mais radiação; a Lua tem 17% da gravidade, quase nenhuma atmosfera e radiação direta. Nenhuma célula da Terra imita isso.
- **Resoluções muito diferentes:** Terra em células de 2° a partir de pixels de 1 a 5 km; Marte e Lua em janelas circulares de
  1° de raio ao redor de UM ponto, a partir de mapas de ~1 a 4 km (relevo), 5° (água do GRS, pegada ~300 km) e 0,5° (temperatura
  lunar). A rugosidade é o desvio padrão da elevação na janela e muda com a resolução do pixel.
- **Grandezas diferentes sob o mesmo nome:** "gelo" (neve na superfície x água enterrada x área fria), "temperatura" (LST do MODIS
  dia+noite / 2 x temperatura bolométrica média x temperatura anual modelada do PRP) e "relevo" (σ da elevação em janelas
  de tamanhos parecidos mas resoluções distintas).
- **Relevo da Terra:** o SRTMGL30 (NASA) vai de 90°N a 60°S, mas o radar só cobriu 60°N a 56°S; acima de 60°N os valores
  são quase com certeza do GTOPO30 (USGS) embutido no produto. No extremo sul (McMurdo) o relevo é do ETOPO 2022 (NOAA),
  que não é produto NASA. **Vento da Terra:** o MERRA-2 é uma reanálise (modelo corrigido por observações), não medida direta.
- **Temperatura da Lua nos polos** vem do PRP, que é um produto derivado/modelado pela equipe Diviner, não uma medição direta.
- **Marte:** só relevo (MOLA) e água (GRS) foram obtidos. O GRS tem pegada de ~300 km e vê só ~1 m de profundidade; o produto
  suavizado usado aqui não cobre as latitudes mais altas.
- **Neve do MODIS:** os meses de noite polar (código 211) não têm dado e são descartados; a fração de neve polar pode ser
  subestimada. Células com poucos meses válidos ficam `null`.
- **Terra, 1 ano:** por padrão 1 ano de MODIS e MERRA-2 (ver `anos`); não é uma climatologia de décadas.
- **Os valores normalizados dependem das faixas escolhidas** (seção 2). Outras faixas dão outros rankings.
