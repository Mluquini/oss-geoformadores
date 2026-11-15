# How to run the pipeline on Google Colab

> **Current state (honest):** the scripts `02_marte.py`, `03_lua.py`, `04_normalizar.py` and `05_exportar_site.py` were **really run**.
> `01_terra.py` ran with real data in the **strategic zones** (MODIS, SRTM/ETOPO, ASTER and MERRA-2). The whole world has not been run yet.
> If the MERRA-2 download (wind and dust) fails, it is probably because the "NASA GESDISC DATA ARCHIVE" application is not authorized in the Earthdata profile; the script prints the HTTP code.

## 1. Earthdata account (free)

Create an account at <https://urs.earthdata.nasa.gov>. Then, at <https://urs.earthdata.nasa.gov/profile>,
approve (under "Applications → Authorized Apps") the applications **LP DAAC Data Pool**, **NSIDC DAAC** and **GES DISC**.
Without this approval the download fails with error 401/403.

## 2. Keep the password safe in Colab

In the left bar of Colab, click the key 🔑 (**Secrets**) and create two secrets:
`EARTHDATA_USERNAME` and `EARTHDATA_PASSWORD`. Turn on "Notebook access" for both.
**Never write the password in a cell or on GitHub.**

## 3. Prepare the environment (one cell)

```python
import os
from google.colab import userdata
os.environ["EARTHDATA_USERNAME"] = userdata.get("EARTHDATA_USERNAME")
os.environ["EARTHDATA_PASSWORD"] = userdata.get("EARTHDATA_PASSWORD")

!git clone https://github.com/Mluquini/oss-geoformadores.git
%cd oss-geoformadores
!pip install -q earthaccess h5py pyhdf netCDF4 pandas requests numpy
```

If `pyhdf` fails to install (not tested on Colab), run `!apt-get install -y libhdf4-dev` and try again.

## 4. Run in order (each command in a cell, using the script path)

```python
# 4.1 Test the calculations, offline (takes 1 second)
!python scripts/01_terra.py --autoteste
!python scripts/04_normalizar.py --autoteste

# 4.2 Mars and Moon (no password needed; ~1.1 GB download the first time, because of the Moon's south pole)
!python scripts/02_marte.py --raw raw --saida data
!python scripts/03_lua.py   --raw raw --saida data

# 4.2b Mars rovers (ground temperature at Gale and Jezero; ~300 MB the first time), then Mars again
!python scripts/02b_marte_rovers.py
!python scripts/02_marte.py --raw raw --saida data

# 4.3 EARTH: FIRST only a small region (Iran, where the Lut Desert is)
!python scripts/01_terra.py --raw raw --saida data --anos 2020 --regiao 20 40 50 65

# 4.3b Or, better: only the strategic zones (the site's 12 places + 3 check zones)
!python scripts/01_terra.py --raw raw --saida data --anos 2020 --zonas estrategicas

# 4.4 If 4.3 worked, the whole world (optional)
!python scripts/01_terra.py --raw raw --saida data --anos 2020

# 4.5 Similarity + report + sanity check
!python scripts/04_normalizar.py --dados data --relatorio relatorio --conferir

# 4.6 Update the SITE with the new data (writes data/dados_reais.js and data/celulas.js)
!python scripts/05_exportar_site.py --dados data
```

**Check that the data is real** (re-reads the raw NASA files with independent code and checks every cell):
`!python scripts/07_verificar_dados.py`. The result is saved in `relatorio/verificacao_dados.md`. If any check fails, the script exits with an error.

**For the "Plan a mission" mode to search the whole world**, run step 4.4 (`01_terra.py` **without** `--zonas`) before 4.5 and 4.6.
With many cells, `04_normalizar.py` only saves the per-cell ranking for the site's places (option `--limite-ranking`); the site search
uses `data/celulas.js`, which `05` generates with all the land cells.

Disk space: ~1 GB per year of MODIS temperature, ~0.3 GB of SRTM, ~0.3 GB of ASTER, 0.5 GB of ETOPO, plus MERRA-2
(not measured). Colab has plenty of space; just do not delete the `raw/` folder midway (it works as a cache).

If a product fails, the script **does not stop and does not invent a number**: it writes `null` and puts the reason in `problemas`
inside `data/earth_grid.json` (and in section 3 of the report). Send that text to whoever will fix it.

## 5. How to tell whether the numbers make sense

The `--conferir` option (step 4.5) looks at known cells and prints `ATENÇÃO` (warning) when something is off:

| Place | What should appear |
|---|---|
| Lut Desert (Iran) | **very hot** yearly mean (> 20 °C), **no snow** |
| Antarctic interior | **very cold** (< −35 °C), **a lot of ice** (snow > 0.8), almost always below 0 °C |
| Sahara | hot (> 20 °C), no snow |
| Himalaya/Tibet | **very rough** relief (> 1000 m) and mean elevation > 3000 m |
| Amazon | hot and stable (22 to 32 °C), no snow |
| Greenland | very cold (< −15 °C), a lot of ice |

A warning does not prove it is wrong (the limit is an estimate), but it is where to look first. Also check:

- **Mars:** Valles Marineris should be by far the roughest; Hellas should have the lowest mean elevation (about −6.4 km).
- **Moon:** Tranquillitatis should have a maximum of ~395 K (about 120 °C) and a minimum of ~94 K; Shackleton should have part of its area below 110 K.
- **`null` cells:** oceans and the MODIS polar night are `null`. See the % per field in the report.
- **Quick map:** open `data/earth_grid.json` with `pandas` and make a scatter plot of `lon` × `lat` colored by temperature.
  If it looks like the world map with hot deserts and cold poles, you are on the right track.

## 6. What the result means (care when presenting)

Read section 4 of `relatorio/data_report.md` before presenting the numbers. In particular:
**geology is left out** of the calculation, because the indexes of the three bodies do not measure the same thing;
Mars compares fewer aspects than the Moon (3 of 6 at four places, 5 of 6 at Gale and Jezero), so the Mars similarity % says less about the whole;
and Mars wind is not used, because the rover data does not cover a full year.
