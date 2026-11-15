# 🌍 Globo de Análogos

Projeto para o **NASA Space Apps Challenge 2026**, desafio **Terrestrial Analogs**.

Um globo 3D da Terra: você clica num lugar (deserto, polo, vulcão ou caverna) e o site mostra quais lugares de **Marte** ou da **Lua** são mais parecidos com ele, com a % de semelhança.

> ✅ O site usa **somente dados reais**: nos 12 locais da Terra, nos 6 de Marte e nos 4 da Lua (NASA, mais um complemento da NOAA no relevo de McMurdo, avisado no site). Não existe mais nenhum dado de exemplo ou estimado. A geologia ficou fora do cálculo (não temos dado comparável). Veja "Como calculamos" no site para o que cada número é e quais são os limites.

> 🌐 O site abre em **inglês** e tem o botão **EN | PT** no canto de cima para trocar para o português (a escolha fica guardada no navegador).

## Como abrir

**Jeito 1, duplo clique:** abra o arquivo `index.html`. É preciso estar conectado à internet, porque o globo e o gráfico vêm de lá.

**Jeito 2, servidor local:** abra um terminal nesta pasta e rode:

```bash
python -m http.server
```

Depois abra <http://localhost:8000> no navegador. No Linux ou no Mac, talvez o comando seja `python3`.

## Aspectos comparados (6)

Temperatura média, **amplitude dia/noite**, rugosidade do relevo, **declividade**, gelo e vento/poeira. A amplitude dia/noite e a declividade foram acrescentadas por dividirem o peso da temperatura e o do relevo do desafio ao meio (o total de cada categoria não muda). Limites, em linguagem direta:

- **Declividade:** depende do tamanho do pixel, então Terra, Marte e Lua foram medidas na mesma escala (~3,7 km por pixel).
- **Amplitude dia/noite:** na Terra é a média do ano de (MODIS dia − noite); na Lua é máximo − mínimo do dia lunar (só locais equatoriais; nos polos o produto tem só médias); em Marte **não há dado** (fica nulo, com o motivo no JSON). A diferença real é enorme (Lua ~230 a 300 K, Terra ~1 a 34 K), então nenhum lugar da Terra se parece com a Lua nesse aspecto, e isso baixa a % dos locais equatoriais da Lua.
- Para recalcular só esses dois campos da Terra sem login: `python scripts/01_terra.py --raw raw --saida data --anos 2020 --zonas estrategicas --local` (usa os arquivos MODIS e SRTM que já estão em `raw/terra`), depois `02`, `03`, `04` e `05`.

## Referências no site

O botão **References / Referências** (no topo do site) leva à seção com todas as fontes: (1) os recursos da aba "Resources" da página do desafio da NASA que foram usados e como (Earthdata Search pelo catálogo CMR, PDS, LRO e Diviner; Worldview e os parceiros CSA, ESA e JAXA não foram usados e por isso não aparecem); (2) os produtos de dados, com versão e DOI ou link; (3) as fontes que não são da NASA (ETOPO 2022, GTOPO30, IAU, Wikimedia Commons); (4) o que serviu só para conferir. O texto está em `i18n.js` (chaves `ref.*`) e a tabela em `index.html` (`id="referencias"`); o `07_verificar_dados.py` confere se todos os links respondem.

## Temperatura de Marte (dados dos rovers)

Não existe no PDS um mapa global pronto de temperatura da superfície de Marte, então a temperatura do solo e a amplitude dia/noite de Marte vêm **dos rovers**, só nos dois locais onde há rover: **Gale** (Curiosity, instrumento REMS) e **Jezero** (Perseverance, instrumento MEDA). Os outros 4 locais ficam sem esses aspectos (null, com o motivo escrito), e o site avisa quantos aspectos cada comparação usou.

- `scripts/02b_marte_rovers.py` baixa 24 sols (dias marcianos) espalhados pelo primeiro ano marciano (~300 MB, só na primeira vez), resume a temperatura do solo em 24 faixas de hora local e grava `data/mars_rovers.json`. Depois rode `02_marte.py`, `04`, `05` e `07`.
- É uma **amostra** de sols (cerca de 20 com curva completa), em **um ponto**, e não uma média de todos os sols numa janela de 2°. No Jezero a temperatura é calculada do infravermelho térmico supondo emissividade 1 (subestima alguns kelvin).
- **Vento de Marte não entra no cálculo:** a REMS tem quase todo o vento descartado por qualidade, e o do Jezero só existe até o sol ~300 (meia estação), a ~1,5 m de altura. O valor do Jezero aparece no painel como informação.

## Idiomas (EN | PT)

O site abre sempre em inglês. O botão **EN | PT** troca todo o texto na hora (inclusive o painel aberto e os resultados do Planejar missão) e lembra a escolha. Para corrigir ou acrescentar uma tradução, edite `i18n.js`. O teste `node tests/i18n.teste.js` confere que toda frase existe nos dois idiomas, que nenhuma palavra de um idioma "vazou" para o outro e que os nomes e descrições dos locais estão em `pt` e `en`.

## Arquivos

| Arquivo | Para que serve |
|---|---|
| `index.html` | O esqueleto da página (o que aparece) |
| `style.css` | O visual (cores, tamanhos, celular) |
| `i18n.js` | **Todos os textos do site, em inglês e em português**, num só lugar (`"chave": [inglês, português]`), e o botão EN \| PT |
| `script.js` | O cérebro (globo, painel, gráfico de barras). Não calcula a semelhança: lê o ranking pronto |
| `busca.js` | As **contas** do modo Planejar missão (semelhança, agrupamento, nomes de região, regras de teste). Não mexe na tela |
| `planejar.js` | A **tela** do modo Planejar missão (sliders, mapa de calor, marcadores, painel de resultado) |
| `data/celulas.js` | As células da Terra em lista compacta, para a busca reversa. Gerado por `scripts/05_exportar_site.py` |
| `tests/busca.teste.js` | Testes automáticos do `busca.js` (`node tests/busca.teste.js`) |
| `tests/i18n.teste.js` | Testes dos idiomas (`node tests/i18n.teste.js`) |
| `data/dados_reais.js` | **Os dados que o site lê.** Gerado por `scripts/05_exportar_site.py`: não edite à mão |
| `data/imagens.js` e `assets/lugares/` | As **fotos** dos 12 lugares e os créditos (autor, licença, link). Gerados por `scripts/06_baixar_imagens.py`. Todas do Wikimedia Commons, com licença livre: veja `assets/lugares/CREDITOS.md` |
| `data/textos/*.js` | Só os **textos** dos locais, em português e inglês (nome, país, descrição, "útil para testar") e as coordenadas aproximadas dos locais da Terra. **Nenhum número de dado**: eles vêm da NASA pelo pipeline |
| `scripts/` | O pipeline que baixa e processa os dados da NASA (veja mais abaixo) |

## Como atualizar os dados e os textos

- **Mudar um texto** (nome, descrição, "útil para testar") de um local da Terra, de Marte ou da Lua: edite o arquivo em `data/textos/` (os dois idiomas: `pt` e `en`) e rode de novo o `05_exportar_site.py`. Textos da interface (botões, frases, "Como calculamos") ficam em `i18n.js`.
- **Atualizar os números:** rode os scripts do pipeline em ordem (`02`, `03`, `01`, `04`) e depois o `05`. O passo a passo está em [relatorio/COLAB.md](relatorio/COLAB.md).
- **Adicionar um local novo na Terra:** acrescente o bloco no `data/textos/earth_sites.js` (só os textos em `pt` e `en`, `lat`, `lon` e `tipo`; o `tipo` é `deserto`, `polar`, `vulcânico` ou `caverna`). Se o local estiver fora das zonas já calculadas, inclua-o em `LOCAIS_ESTRATEGICOS` no `scripts/01_terra.py` e rode o `01` de novo.
- **Por que `.js` e não `.json`?** Por segurança, os navegadores não deixam a página ler arquivos `.json` quando ela é aberta com duplo clique. Por isso `dados_reais.js` começa com `window.DADOS_REAIS = `. Tudo que vem depois é JSON normal.
- **Mudar os pesos ou as faixas do cálculo:** edite `PESOS` e `FAIXAS` no `scripts/04_normalizar.py` e rode o `04` e o `05`. A seção "Como calculamos" do site se atualiza sozinha (a tabela de pesos do `index.html` é fixa: atualize-a junto).

## Como calculamos

```
semelhança = 100% × (1 − √( Σ peso × (notaTerra − notaAlvo)² ))
```

| Aspecto | Marte | Lua |
|---|---|---|
| Temperatura | 25% | 30% |
| Relevo | 20% | 25% |
| Gelo | 15% | 30% |
| Geologia | 25% | 15% |
| Vento/poeira | 15% | 0% (não se aplica) |

## Como sabemos que os dados são verdadeiros

O `scripts/07_verificar_dados.py` refaz as contas **do zero**, sem reaproveitar o código que gerou os dados, lendo os arquivos brutos da NASA em `raw/`: ele confere as 148 células da Terra (temperatura, neve, relevo, vento, poeira), os locais de Marte e da Lua, os pontos famosos (Olympus Mons, Hellas, o ponto mais fundo da Lua, Mauna Kea, Dallol) e os números das frases do site contra as fichas oficiais da NASA. Também checa que os produtos existem nos catálogos oficiais que as coordenadas dos 12 locais da Terra batem com o Wikidata (até 2°), que as frases de fatos (gravidade, atmosfera, dia lunar) batem com as fichas da NASA **nos dois idiomas**, e que nenhum dado de exemplo ou estimado sobrou. Testamos o verificador estragando os dados de propósito: ele acusou todos os erros. O resultado está em [relatorio/verificacao_dados.md](relatorio/verificacao_dados.md).

**O que isso não prova:** que os produtos da NASA em si estão corretos, nem que a média de uma célula de 2° vale para o ponto exato. E **nem tudo é medida direta da NASA**: veja as limitações no site.

## Modo "Planejar missão" (busca reversa)

O botão **Planejar missão**, no topo, inverte a pergunta: em vez de "este lugar da Terra se parece com qual lugar de Marte?", você diz **o que a missão precisa** e o site mostra **onde, na Terra, vale testar**.

- **Alvo real:** escolha um lugar de Marte ou da Lua. Vale o que temos de dado real dele (Marte: relevo e gelo; Lua: temperatura, relevo e gelo).
- **Alvo personalizado:** 7 controles em unidades físicas, agrupados em 5 (temperatura média e variação ao ano, rugosidade, gelo em %, índice de quartzo, vento e poeira). Cada um tem **"tanto faz"** e uma **importância** (baixa, média, alta). Há 4 modelos prontos, com valores **sugeridos** que vocês podem mudar.
- **Resultado:** mapa de calor no globo, Top 5 com marcadores numerados (clicar voa até o local) e um painel com o gráfico alvo × lugar, "onde combina", "onde não combina" e o teste de missão recomendado.
- **A conta é a mesma do resto do site:** mesmas faixas físicas fixas e mesma fórmula. Aspecto "tanto faz" ou sem dado é ignorado e os pesos são renormalizados (o teste `tests/busca.teste.js` confere que a busca dá os mesmos números do ranking do modo Explorar).

**Escolhas nossas (revisáveis):**
- O Top 5 junta células a menos de **5°** umas das outras, para não repetir a mesma região.
- O selo **Novidade** marca resultados a mais de **3°** (~330 km) de qualquer um dos 12 locais do site.
- As frases de "combina / não combina" usam uma **tolerância física** por aspecto (por exemplo 8 °C, 250 m, 15 pontos de gelo, 2 m/s), definida em `busca.js`. A % de semelhança continua usando as faixas fixas.
- Os nomes de região vêm de uma tabela pequena feita à mão em `busca.js`: são **aproximados**.
- O **índice de quartzo** (geologia) só existe para a Terra: serve para um alvo personalizado e **não** entra na comparação Terra × Marte/Lua.

**Limite de hoje:** só temos **148 células** (zonas ao redor dos 12 locais, mais Saara, Tibete e Antártida), então o Top 5 só enxerga essas áreas. Para buscar no mundo todo, rodem o `01_terra.py` **sem** `--zonas` (precisa da senha do Earthdata), depois o `04` e o `05`. O `04` limita sozinho o tamanho do `similaridade.json` quando há muitas células (`--limite-ranking`).

## Publicar de graça no GitHub Pages

1. Envie os arquivos para o GitHub (no terminal, dentro da pasta):
   ```bash
   git add .
   git commit -m "Globo de Análogos: versão básica"
   git push
   ```
2. No site do GitHub, abra o repositório e vá em **Settings → Pages**.
3. Em **Source**, escolha **Deploy from a branch**. Em **Branch**, escolha `main` e a pasta `/ (root)`. Clique em **Save**.
4. Espere 1 ou 2 minutos e atualize a página. O link vai aparecer lá, algo como
   `https://SEU-USUARIO.github.io/constelacao-zero-nasa/`.

Cada `git push` novo atualiza o site sozinho.

## Pipeline de dados reais (NASA)

Os scripts em `scripts/` constroem os dados reais que o site mostra:

| Script | O que faz | Estado |
|---|---|---|
| `01_terra.py` | Grade de 2° da Terra (MODIS, SRTM, ASTER, MERRA-2). Precisa de conta Earthdata. | rodou com dados reais nas **zonas estratégicas** (`--zonas estrategicas`); o MERRA-2 (vento/poeira) ainda falha, e o mundo todo não foi rodado |
| `02_marte.py` | 6 locais de Marte (MOLA, GRS) | rodou com dados reais |
| `03_lua.py` | 4 locais da Lua (LOLA, Diviner) | rodou com dados reais |
| `04_normalizar.py` | Semelhança Terra x Marte/Lua e relatório | rodou com os dados reais |
| `05_exportar_site.py` | Junta tudo em `data/dados_reais.js`, o arquivo que o site lê | rodou |
| `07_verificar_dados.py` | **Confere se os dados são verdadeiros**: relê os arquivos brutos da NASA com código independente, confere todas as células e os pontos famosos, e checa as frases com número contra as fichas da NASA | 50 verificações OK; gera `relatorio/verificacao_dados.md` |
| `06_baixar_imagens.py` | Baixa as fotos dos lugares (Wikimedia Commons) e guarda os créditos | rodou; 12 fotos, todas com licença livre |

Relatório com fontes, problemas e decisões: [relatorio/data_report.md](relatorio/data_report.md).
Passo a passo para o Google Colab: [relatorio/COLAB.md](relatorio/COLAB.md).

## Créditos

- Globo: [Globe.gl](https://globe.gl) · Gráfico: [Chart.js](https://www.chartjs.org)
- Imagens da Terra: NASA Blue Marble (pelo pacote three-globe)
- Dados futuros: MODIS, NASADEM, MERRA-2, ASTER (Terra) · THEMIS, MOLA, CRISM (Marte) · Diviner, LOLA, LEND (Lua)
