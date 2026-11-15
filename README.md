# 🌍 Analog Globe – Geoformadores

Project for the **NASA Space Apps Challenge 2026**, challenge **Terrestrial Analogs**.

A 3D globe of Earth: you click a place (desert, pole, volcano or cave) and the site shows which places on **Mars** or the **Moon** are most similar to it, with a % of similarity.

> ✅ The site uses **real data only**: for the 12 Earth places, the 6 Mars places and the 4 Moon places (NASA, plus one NOAA complement for the relief at McMurdo, flagged on the site). There is no example or estimated data left. Geology was left out of the calculation (we have no comparable data). See "How we calculate" on the site for what each number is and what the limits are.

> 🌐 The site opens in **English** and has an **EN | PT** button at the top to switch to Portuguese (the choice is saved in the browser).

Live site: <https://mluquini.github.io/oss-geoformadores/>

## How to open

**Option 1, double-click:** open the `index.html` file. You need to be online, because the globe and the chart libraries are loaded from the internet.

**Option 2, local server:** open a terminal in this folder and run:

```bash
python -m http.server
```

Then open <http://localhost:8000> in your browser. On Linux or Mac the command may be `python3`.

## Compared aspects (6)

Mean temperature, **day–night range**, terrain roughness, **slope**, ice and wind/dust. The day–night range and the slope were added by splitting the challenge's temperature weight and relief weight in half (the total of each category does not change). Limits, in plain words:

- **Slope:** it depends on the pixel size, so Earth, Mars and the Moon were measured on the same scale (~3.7 km per pixel).
- **Day–night range:** on Earth it is the yearly mean of (MODIS day − night); on the Moon it is max − min over the lunar day (equatorial places only; at the poles the product only has means); on Mars it comes **only from the rovers** (see below), and elsewhere it is null, with the reason in the JSON. The real difference is huge (Moon ~230 to 300 K, Earth ~1 to 34 K), so no place on Earth resembles the Moon in this aspect, and this lowers the % of the Moon's equatorial places.
- To recompute only these two Earth fields without logging in: `python scripts/01_terra.py --raw raw --saida data --anos 2020 --zonas estrategicas --local` (it uses the MODIS and SRTM files already in `raw/terra`), then `02`, `03`, `04` and `05`.

## References on the site

The **References** button (at the top of the site) leads to the section with all the sources: (1) the resources from the "Resources" tab of the NASA challenge page that were used, and how (Earthdata Search through the CMR catalog, PDS, LRO and Diviner; Worldview and the partners CSA, ESA and JAXA were not used, so they do not appear); (2) the data products, with version and DOI or link; (3) the sources that are not from NASA (ETOPO 2022, GTOPO30, IAU, Wikimedia Commons); (4) what was only used for checking. The text is in `i18n.js` (`ref.*` keys) and the table is in `index.html` (`id="referencias"`); `07_verificar_dados.py` checks that every link responds.

## Mars temperature (rover data)

PDS has no ready-made global map of Mars surface temperature, so the ground temperature and the day–night range of Mars come **from the rovers**, only at the two places that have a rover: **Gale** (Curiosity, REMS instrument) and **Jezero** (Perseverance, MEDA instrument). The other 4 places have no such aspects (null, with the reason written), and the site tells how many aspects each comparison used.

- `scripts/02b_marte_rovers.py` downloads 24 sols (Martian days) spread over the first Martian year (~300 MB, only the first time), summarizes the ground temperature in 24 local-time bins and writes `data/mars_rovers.json`. Then run `02_marte.py`, `04`, `05` and `07`.
- It is a **sample** of sols (about 20 with a full curve), at **one point**, not an average of all sols over a 2° window. At Jezero the temperature is computed from thermal infrared assuming emissivity 1 (it underestimates by a few kelvin).
- **Mars wind is not used in the calculation:** REMS has almost all its wind data discarded by quality flags, and the Jezero wind only exists up to sol ~300 (half a season), at ~1.5 m height. The Jezero value is shown in the panel as information only.

## Languages (EN | PT)

The site always opens in English. The **EN | PT** button changes all the text instantly (including the open panel and the Plan a mission results) and remembers the choice. To fix or add a translation, edit `i18n.js`. The test `node tests/i18n.teste.js` checks that every phrase exists in both languages, that no word of one language "leaked" into the other, and that the names and descriptions of the places exist in `pt` and `en`.

## Files

| File | What it is for |
|---|---|
| `index.html` | The skeleton of the page (what appears) |
| `style.css` | The look (colors, sizes, mobile) |
| `i18n.js` | **All the site text, in English and Portuguese**, in one place (`"key": [english, portuguese]`), and the EN \| PT button |
| `script.js` | The brain (globe, panel, bar chart). It does not compute the similarity: it reads the ready ranking |
| `busca.js` | The **calculations** of the Plan a mission mode (similarity, grouping, region names, test rules). It does not touch the screen |
| `planejar.js` | The **screen** of the Plan a mission mode (sliders, heat map, markers, result panel) |
| `data/celulas.js` | The Earth cells as a compact list, for the reverse search. Generated by `scripts/05_exportar_site.py` |
| `tests/busca.teste.js` | Automatic tests of `busca.js` (`node tests/busca.teste.js`) |
| `tests/i18n.teste.js` | Language tests (`node tests/i18n.teste.js`) |
| `data/dados_reais.js` | **The data the site reads.** Generated by `scripts/05_exportar_site.py`: do not edit by hand |
| `data/imagens.js` and `assets/lugares/` | The **photos** of the 12 places and the credits (author, license, link). Generated by `scripts/06_baixar_imagens.py`. All from Wikimedia Commons, with free licenses: see `assets/lugares/CREDITOS.md` |
| `data/textos/*.js` | Only the **texts** of the places, in Portuguese and English (name, country, description, "useful for testing") and the approximate coordinates of the Earth places. **No data numbers**: they come from NASA through the pipeline |
| `scripts/` | The pipeline that downloads and processes the NASA data (see below) |

## How to update the data and the texts

- **Change a text** (name, description, "useful for testing") of an Earth, Mars or Moon place: edit the file in `data/textos/` (both languages: `pt` and `en`) and run `05_exportar_site.py` again. Interface texts (buttons, phrases, "How we calculate") are in `i18n.js`.
- **Update the numbers:** run the pipeline scripts in order (`02`, `03`, `01`, `04`) and then `05`. The step by step is in [relatorio/COLAB.md](relatorio/COLAB.md).
- **Add a new place on Earth:** add the block to `data/textos/earth_sites.js` (only the texts in `pt` and `en`, `lat`, `lon` and `tipo`; `tipo` is `deserto`, `polar`, `vulcânico` or `caverna`). If the place is outside the zones already computed, include it in `LOCAIS_ESTRATEGICOS` in `scripts/01_terra.py` and run `01` again.
- **Why `.js` and not `.json`?** For security, browsers do not let a page read `.json` files when it is opened by double-click. That is why `dados_reais.js` starts with `window.DADOS_REAIS = `. Everything after that is normal JSON.
- **Change the weights or the ranges of the calculation:** edit `PESOS` and `FAIXAS` in `scripts/04_normalizar.py` and run `04` and `05`. The "How we calculate" section of the site updates itself (the weights table in `index.html` is fixed: update it too).

## How we calculate

```
similarity = 100% × (1 − √( Σ weight′ × (scoreEarth − scoreTarget)² ))
```

Each aspect is turned into a score from 0 to 1 using **fixed physical ranges** that are the same for Earth, Mars and the Moon. The weights are the challenge weights without geology, renormalized, with the temperature and relief weights split in half between their two new parts (day–night range and slope). If an aspect has no data for a place, it is ignored and the weights are renormalized.

| Aspect | Mars | Moon |
|---|---|---|
| Mean temperature | 16.7% | 17.6% |
| Day–night range | 16.7% | 17.6% |
| Relief (roughness) | 13.3% | 14.7% |
| Slope | 13.3% | 14.7% |
| Ice | 20.0% | 35.3% |
| Wind/dust | 20.0% | 0% (not applicable) |

Geology is out of the calculation. In practice Mars uses 3 of the 6 aspects at 4 places (47% of the weight) and 5 of 6 at Gale and Jezero (80%); the Moon uses up to 5 (the day–night range only at equatorial places).

## How we know the data is real

`scripts/07_verificar_dados.py` redoes the calculations **from scratch**, without reusing the code that generated the data, reading the raw NASA files in `raw/`: it checks the 148 Earth cells (temperature, snow, relief, slope, day–night range, wind, dust), the Mars and Moon places, the rover numbers, the famous points (Olympus Mons, Hellas, the deepest point of the Moon, Mauna Kea, Dallol) and the numbers in the site phrases against the official NASA fact sheets. It also checks that the products exist in the official catalogs, that the coordinates of the 12 Earth places match Wikidata (within 2°), that the fact phrases (gravity, atmosphere, lunar day) match the NASA fact sheets **in both languages**, that every link in the References tab responds, and that no example or estimated data is left. We tested the verifier by deliberately breaking the data: it flagged all the errors. The result is in [relatorio/verificacao_dados.md](relatorio/verificacao_dados.md) (62 checks, 0 failures at the last full run).

**What this does not prove:** that the NASA products themselves are correct, or that the average of a 2° cell holds for the exact point. And **not everything is a direct NASA measurement**: see the limitations on the site.

## "Plan a mission" mode (reverse search)

The **Plan a mission** button, at the top, flips the question: instead of "which place on Mars is this place on Earth similar to?", you say **what the mission needs** and the site shows **where on Earth it is worth testing**.

- **Real target:** choose a place on Mars or the Moon. It uses the real data we have for it.
- **Custom target:** controls in physical units (mean temperature and yearly variation, day–night range, roughness, slope, ice in %, quartz index, wind and dust). Each one has **"don't care"** and an **importance** (low, medium, high). There are ready-made templates with **suggested** values that you can change.
- **Result:** a heat map on the globe, a Top 5 with numbered markers (clicking flies to the place) and a panel with the target × place chart, "where it matches", "where it does not match" and the recommended mission test.
- **The calculation is the same as in the rest of the site:** same fixed physical ranges and same formula. An aspect that is "don't care" or has no data is ignored and the weights are renormalized (the test `tests/busca.teste.js` checks that the search gives the same numbers as the Explore mode ranking).

**Our choices (open to review):**
- The Top 5 merges cells less than **5°** apart, so the same region is not repeated.
- The **New** badge marks results more than **3°** (~330 km) away from any of the 12 places on the site.
- The "matches / does not match" phrases use a **physical tolerance** per aspect (for example 8 °C, 250 m, 15 ice points, 2 m/s), defined in `busca.js`. The similarity % still uses the fixed ranges.
- Region names come from a small hand-made table in `busca.js`: they are **approximate**.
- The **quartz index** (geology) only exists for Earth: it works for a custom target and does **not** enter the Earth × Mars/Moon comparison.

**Limit today:** we only have **148 cells** (zones around the 12 places, plus the Sahara, Tibet and Antarctica), so the Top 5 only sees these areas. To search the whole world, run `01_terra.py` **without** `--zonas` (it needs the Earthdata password), then `04` and `05`. `04` limits the size of `similaridade.json` by itself when there are many cells (`--limite-ranking`).

## Publish for free on GitHub Pages

1. Send the files to GitHub (in the terminal, inside the folder):
   ```bash
   git add .
   git commit -m "Analog Globe: update"
   git push
   ```
2. On the GitHub site, open the repository and go to **Settings → Pages**.
3. Under **Source**, choose **Deploy from a branch**. Under **Branch**, choose `main` and the folder `/ (root)`. Click **Save**.
4. Wait 1 or 2 minutes and refresh the page. The link will appear there, something like
   `https://YOUR-USER.github.io/oss-geoformadores/`.

Each new `git push` updates the site by itself.

## Real data pipeline (NASA)

The scripts in `scripts/` build the real data the site shows:

| Script | What it does | State |
|---|---|---|
| `01_terra.py` | 2° grid of Earth (MODIS, SRTM, ASTER, MERRA-2). Needs an Earthdata account. | ran with real data in the **strategic zones** (`--zonas estrategicas`); the whole world was not run |
| `02_marte.py` | 6 Mars places (MOLA, GRS) plus the rover temperature | ran with real data |
| `02b_marte_rovers.py` | Ground temperature and day–night range at Gale (REMS) and Jezero (MEDA) | ran with real data |
| `03_lua.py` | 4 Moon places (LOLA, Diviner) | ran with real data |
| `04_normalizar.py` | Earth × Mars/Moon similarity and report | ran with the real data |
| `05_exportar_site.py` | Puts everything into `data/dados_reais.js`, the file the site reads | ran |
| `06_baixar_imagens.py` | Downloads the photos of the places (Wikimedia Commons) and saves the credits | ran; 12 photos, all with free licenses |
| `07_verificar_dados.py` | **Checks that the data is real**: re-reads the raw NASA files with independent code, checks every cell and the famous points, and checks the phrases with numbers against the NASA fact sheets | 62 checks OK; writes `relatorio/verificacao_dados.md` |

Report with sources, problems and decisions: [relatorio/data_report.md](relatorio/data_report.md) (generated automatically; it is in Portuguese).
Step by step for Google Colab: [relatorio/COLAB.md](relatorio/COLAB.md).

## Credits

- Globe: [Globe.gl](https://globe.gl) · Chart: [Chart.js](https://www.chartjs.org)
- Earth images: NASA Blue Marble (through the three-globe package)
- Data: MODIS, SRTM, ASTER, MERRA-2 (Earth) · MOLA, GRS, REMS, MEDA (Mars) · LOLA, Diviner (Moon)
