# Como rodar o pipeline no Google Colab

> **Estado atual (honesto):** os scripts `02_marte.py`, `03_lua.py`, `04_normalizar.py` e `05_exportar_site.py` foram **rodados de verdade**.
> O `01_terra.py` rodou com dados reais nas **zonas estratégicas** (MODIS, SRTM/ETOPO e ASTER). O **MERRA-2 (vento e poeira) ainda falha**
> no download, provavelmente por falta de autorizar o aplicativo "NASA GESDISC DATA ARCHIVE" no perfil Earthdata; o script agora diz o código HTTP.
> O mundo todo ainda não foi rodado.

## 1. Conta Earthdata (grátis)

Crie uma conta em <https://urs.earthdata.nasa.gov>. Depois, em <https://urs.earthdata.nasa.gov/profile>,
aprove (em "Applications → Authorized Apps") os aplicativos **LP DAAC Data Pool**, **NSIDC DAAC** e **GES DISC**.
Sem essa aprovação o download dá erro 401/403.

## 2. Guardar a senha com segurança no Colab

Na barra da esquerda do Colab, clique na chave 🔑 (**Secrets**) e crie dois segredos:
`EARTHDATA_USERNAME` e `EARTHDATA_PASSWORD`. Ative "Notebook access" nos dois.
**Nunca escreva a senha numa célula nem no GitHub.**

## 3. Preparar o ambiente (uma célula)

```python
import os
from google.colab import userdata
os.environ["EARTHDATA_USERNAME"] = userdata.get("EARTHDATA_USERNAME")
os.environ["EARTHDATA_PASSWORD"] = userdata.get("EARTHDATA_PASSWORD")

!git clone https://github.com/Mluquini/constelacao-zero-nasa.git
%cd constelacao-zero-nasa
!pip install -q earthaccess h5py pyhdf netCDF4 pandas requests numpy
```

Se o `pyhdf` falhar ao instalar (não testei no Colab), rode `!apt-get install -y libhdf4-dev` e tente de novo.

## 4. Rodar em ordem (cada comando numa célula, pelo caminho do script)

```python
# 4.1 Testar as contas, sem internet (leva 1 segundo)
!python scripts/01_terra.py --autoteste
!python scripts/04_normalizar.py --autoteste

# 4.2 Marte e Lua (não precisam de senha; ~1,1 GB de download na primeira vez, por causa do polo sul da Lua)
!python scripts/02_marte.py --raw raw --saida data
!python scripts/03_lua.py   --raw raw --saida data

# 4.3 TERRA: PRIMEIRO só uma região pequena (Irã, onde fica o Deserto do Lut)
!python scripts/01_terra.py --raw raw --saida data --anos 2020 --regiao 20 40 50 65

# 4.3b Ou, melhor: só as zonas estratégicas (os 12 locais do site + 3 zonas de conferência)
!python scripts/01_terra.py --raw raw --saida data --anos 2020 --zonas estrategicas

# 4.4 Se o 4.3 deu certo, o mundo todo (opcional)
!python scripts/01_terra.py --raw raw --saida data --anos 2020

# 4.5 Semelhança + relatório + conferência
!python scripts/04_normalizar.py --dados data --relatorio relatorio --conferir

# 4.6 Atualizar o SITE com os dados novos (gera data/dados_reais.js)
!python scripts/05_exportar_site.py --dados data
```

Espaço em disco: ~1 GB por ano de MODIS temperatura, ~0,3 GB de SRTM, ~0,3 GB de ASTER, 0,5 GB de ETOPO, mais o MERRA-2
(não medi). O Colab tem bastante espaço; só não apague a pasta `raw/` no meio do caminho (ela vale como cache).

Se algum produto falhar, o script **não para nem inventa número**: grava `null` e escreve o motivo em `problemas`
dentro de `data/earth_grid.json` (e na seção 3 do relatório). Mande esse texto para quem for corrigir.

## 5. Como saber se os números fazem sentido

O comando `--conferir` (passo 4.5) olha células conhecidas e avisa `ATENÇÃO` quando algo foge do esperado:

| Lugar | O que deve aparecer |
|---|---|
| Deserto do Lut (Irã) | média anual **muito quente** (> 20 °C), **sem neve** |
| Interior da Antártida | **muito frio** (< −35 °C), **muito gelo** (neve > 0,8), quase sempre abaixo de 0 °C |
| Saara | quente (> 20 °C), sem neve |
| Himalaia/Tibete | relevo **muito rugoso** (> 1000 m) e elevação média > 3000 m |
| Amazônia | quente e estável (22 a 32 °C), sem neve |
| Groenlândia | muito frio (< −15 °C), muito gelo |

`ATENÇÃO` não prova que está errado (o limite é uma estimativa), mas é onde olhar primeiro. Confira também:

- **Marte:** Valles Marineris deve ser de longe o mais rugoso; Hellas deve ter a média de elevação mais baixa (cerca de −6,4 km).
- **Lua:** Tranquillitatis deve ter máxima de ~395 K (cerca de 120 °C) e mínima de ~94 K; Shackleton deve ter parte da área abaixo de 110 K.
- **Células `null`:** oceanos e a noite polar do MODIS ficam `null`. Veja a % por campo no relatório.
- **Mapa rápido:** abra `data/earth_grid.json` com `pandas` e faça um gráfico de dispersão de `lon` x `lat` colorido por temperatura.
  Se parecer o mapa-múndi com os desertos quentes e os polos frios, está no caminho certo.

## 6. Cuidados com o que o resultado quer dizer

Leia a seção 4 do `relatorio/data_report.md` antes de apresentar os números. Em especial:
em Marte só entram **relevo e gelo** (35% dos pesos originais), então a % de semelhança com Marte diz pouco sobre o todo.
A **geologia fica de fora** do cálculo, porque os índices dos três corpos não medem a mesma coisa.
