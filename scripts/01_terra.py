#!/usr/bin/env python3
"""
01_terra.py: gera data/earth_grid.json (grade global de 2 graus) com os 5 aspectos da Terra.

PRECISA de conta gratuita no NASA Earthdata (https://urs.earthdata.nasa.gov).
A senha NUNCA vai no código. Defina variáveis de ambiente antes de rodar:
    export EARTHDATA_USERNAME="seu_usuario"
    export EARTHDATA_PASSWORD="sua_senha"       (ou EARTHDATA_TOKEN="...")
No Google Colab, veja o guia em relatorio/COLAB.md.

Produtos NASA usados (nomes e versões conferidos no catálogo CMR da NASA em 14/11/2026):
  Temperatura : MOD11C3 v061   (MODIS/Terra LST mensal, 0,05°)
  Gelo        : MOD10CM v61    (MODIS/Terra neve mensal, 0,05°) + temperatura do MOD11C3
  Relevo      : SRTMGL30 v002  (SRTM 30 arco-segundos). COMPLEMENTO fora da NASA: ETOPO 2022 (NOAA)
                nas células sem SRTM (acima de 60°N e abaixo de 56°S)
  Geologia    : AG5KMMOH v041  (ASTER GED mensal, 0,05°): índice de quartzo
  Vento/poeira: M2TMNXFLX (SPEED) e M2TMNXAER (DUSMASS), MERRA-2 v5.12.4, médias mensais

Exemplos (rode pelo caminho do script):
    python scripts/01_terra.py --autoteste                      # testa as contas, sem internet
    python scripts/01_terra.py --raw raw --saida data --anos 2020 --regiao 20 40 50 65   # só o Irã (Lut)
    python scripts/01_terra.py --raw raw --saida data --anos 2020 --zonas estrategicas  # só zonas estratégicas
    python scripts/01_terra.py --raw raw --saida data --anos 2020                       # mundo todo
"""
import argparse
import io
import json
import math
import os
import sys
import traceback
import warnings
import zipfile
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import comum as c  # noqa: E402

# Pixels de mar/noite polar viram NaN de propósito; os avisos de 'média de fatia vazia' são esperados.
warnings.filterwarnings("ignore", category=RuntimeWarning)

PASSO = 2.0                 # tamanho da célula em graus
N_LAT, N_LON = 90, 180      # 180/2 e 360/2
MIN_MESES_T = 9             # mínimo de meses válidos por pixel para a média anual de temperatura
MIN_MESES_NEVE = 6          # idem para neve (a noite polar gera meses sem dado)
MIN_FRAC_VALIDA = 0.25      # fração mínima de pixels de terra válidos na célula
MIN_PIXELS_TERRA = 5        # mínimo de pixels de terra na célula (ilhas pequenas passam)
NEVE_MIN_VALIDO, NEVE_MAX_VALIDO = 0, 100   # códigos 0-100 = % de neve; 211/250/253/254/255 = sem dado
SRTM_NODATA = -32768
ETOPO_URL = ("https://www.ngdc.noaa.gov/thredds/fileServer/global/ETOPO2022/60s/"
             "60s_surface_elev_netcdf/ETOPO_2022_v1_60s_N90W180_surface.nc")
RAIO_TERRA_M = 6_371_000.0


# =====================================================================
# 1. CONTAS (funções puras: testáveis sem internet)
# =====================================================================
def centros():
    lat = -90 + PASSO / 2 + PASSO * np.arange(N_LAT)
    lon = -180 + PASSO / 2 + PASSO * np.arange(N_LON)
    return lat, lon


def ao_sul_primeiro(a):
    """Os arquivos MODIS/ASTER/SRTM começam no Polo NORTE (linha 0 = 90°N); nossa grade começa no Polo SUL
    (linha 0 = -90°). Esta função inverte as linhas para a ordem da nossa grade (ver centros())."""
    return np.ascontiguousarray(np.asarray(a)[::-1])


def indices_tile(lat_n, linhas, lon_w):
    """Posição (i0, j0) de um tile SRTM na grade de 2° (linha 0 = -90°). lat_n = latitude da borda NORTE do tile."""
    lat_s = lat_n - linhas / 120.0
    return int(round((lat_s + 90.0) / PASSO)), int(round((lon_w + 180.0) / PASSO))


def estatisticas_tile(arr, lat_n):
    """Estatísticas por célula de 2° de um tile SRTM (arr [linhas, colunas] em metros, topo = lat_n).
    O SRTM marca o mar com 0 m e áreas sem dado com -32768: os dois ficam de fora (pixels com exatamente
    0 m são descartados, o que também descarta alguma terra ao nível do mar).
    Devolve (media, desvio, n_pixels, declividade_media), todos [células, células] na ordem SUL-primeiro."""
    valido = (arr != SRTM_NODATA) & (arr != 0)
    el = np.where(valido, arr, np.nan)
    lat_lin = lat_n - (np.arange(arr.shape[0]) + 0.5) / 120.0
    dec = declividade_graus(el, lat_lin, 120)
    m, d, n = estatisticas_blocos(np.nan_to_num(el), valido, 240, 240)
    md, _, _ = estatisticas_blocos(np.nan_to_num(dec), valido & np.isfinite(dec), 240, 240)
    return ao_sul_primeiro(m), ao_sul_primeiro(d), ao_sul_primeiro(n), ao_sul_primeiro(md)


def salvar_cache(raw, chave, meta, **arrs):
    """Guarda o resultado de um produto para uma rodada parcial (--so) não perdê-lo."""
    Path(raw).mkdir(parents=True, exist_ok=True)
    np.savez_compressed(Path(raw) / f"_cache_{chave}.npz", _meta=np.array(meta), **arrs)


def carregar_cache(raw, chave, meta):
    p = Path(raw) / f"_cache_{chave}.npz"
    if not p.exists():
        return None
    z = np.load(p, allow_pickle=False)
    if str(z["_meta"]) != meta:
        print(f"  (cache de {chave} ignorado: foi gerado com outros parâmetros)", file=sys.stderr)
        return None
    return {k: z[k] for k in z.files if k != "_meta"}


def agregar_blocos(valores, validos, bl, bc):
    """Média por bloco (bl x bc pixels) considerando só pixels válidos.
    Devolve (media[n_lin/bl, n_col/bc], n_validos). `valores` precisa ter forma múltipla do bloco."""
    n_l, n_c = valores.shape
    assert n_l % bl == 0 and n_c % bc == 0, (valores.shape, bl, bc)
    v = np.where(validos, valores, 0.0).astype(np.float64).reshape(n_l // bl, bl, n_c // bc, bc)
    m = validos.reshape(n_l // bl, bl, n_c // bc, bc)
    n = m.sum(axis=(1, 3))
    soma = v.sum(axis=(1, 3))
    with np.errstate(invalid="ignore", divide="ignore"):
        media = np.where(n > 0, soma / n, np.nan)
    return media, n


def estatisticas_blocos(valores, validos, bl, bc):
    """Média, desvio padrão e contagem por bloco."""
    n_l, n_c = valores.shape
    media, n = agregar_blocos(valores, validos, bl, bc)
    v2, _ = agregar_blocos(valores.astype(np.float64) ** 2, validos, bl, bc)
    with np.errstate(invalid="ignore"):
        desvio = np.sqrt(np.maximum(v2 - media ** 2, 0.0))
    return media, desvio, n


def temperatura_pixel(dia_k, noite_k):
    """dia_k, noite_k: arrays [mes, lin, col] em Kelvin (NaN = sem dado).
    Devolve (media_anual_C, amplitude_C, n_meses, frac_meses_abaixo_de_0C) por pixel."""
    tm = (dia_k + noite_k) / 2.0                       # temperatura média diária aproximada do mês
    n = np.isfinite(tm).sum(axis=0)
    ok = n >= MIN_MESES_T
    with np.errstate(invalid="ignore", all="ignore"):
        media = np.nanmean(tm, axis=0) - 273.15
        ampl = np.nanmax(tm, axis=0) - np.nanmin(tm, axis=0)
        abaixo = (np.where(np.isfinite(tm), tm < 273.15, False)).sum(axis=0) / np.maximum(n, 1)
    media = np.where(ok, media, np.nan)
    ampl = np.where(ok, ampl, np.nan)
    abaixo = np.where(ok, abaixo, np.nan)
    return media, ampl, n, abaixo


def neve_pixel(codigos):
    """codigos: [mes, lin, col] uint8 do Snow_Cover_Monthly_CMG.
    Fração média do tempo com neve = média de (% de neve / 100) nos meses com dado (0-100)."""
    valido = (codigos >= NEVE_MIN_VALIDO) & (codigos <= NEVE_MAX_VALIDO)
    f = np.where(valido, codigos / 100.0, np.nan)
    n = valido.sum(axis=0)
    with np.errstate(invalid="ignore", all="ignore"):
        media = np.nanmean(f, axis=0)
    return np.where(n >= MIN_MESES_NEVE, media, np.nan), n


def indice_quartzo(emis):
    """emis: [5, lin, col] emissividade das bandas ASTER 10..14 (8,3; 8,6; 9,1; 10,6; 11,3 µm).
    Índice de quartzo (Ninomiya) QI = e11*e11 / (e10*e12). Maior = mais rico em sílica/quartzo."""
    e10, e11, e12 = emis[0], emis[1], emis[2]
    with np.errstate(invalid="ignore", divide="ignore"):
        return (e11 * e11) / (e10 * e12)


def declividade_graus(elev_m, lat_centro_linhas, ppd):
    """Declividade (graus) pixel a pixel. elev_m [lin, col] (NaN = sem dado);
    lat_centro_linhas [lin] latitudes dos centros das linhas; ppd = pixels por grau."""
    passo_lat = math.radians(1.0 / ppd) * RAIO_TERRA_M
    passo_lon = passo_lat * np.cos(np.radians(lat_centro_linhas))[:, None]
    with np.errstate(invalid="ignore", divide="ignore"):
        dz_lat = np.gradient(elev_m, axis=0) / passo_lat
        dz_lon = np.gradient(elev_m, axis=1) / np.maximum(passo_lon, 1.0)
        return np.degrees(np.arctan(np.hypot(dz_lat, dz_lon)))


def pontos_para_celulas(lat_pts, lon_pts, valores):
    """Média de pontos de uma grade (ex.: MERRA-2) dentro de cada célula de 2°.
    lat_pts [n_lat], lon_pts [n_lon] (lon em -180..180); valores [n_lat, n_lon]. Devolve [90, 180]."""
    il = np.clip(np.floor((lat_pts + 90) / PASSO).astype(int), 0, N_LAT - 1)
    jl = np.clip(np.floor((lon_pts + 180) / PASSO).astype(int), 0, N_LON - 1)
    soma = np.zeros((N_LAT, N_LON))
    cont = np.zeros((N_LAT, N_LON))
    ok = np.isfinite(valores)
    v = np.where(ok, valores, 0.0)
    np.add.at(soma, (il[:, None].repeat(len(jl), 1), jl[None, :].repeat(len(il), 0)), v)
    np.add.at(cont, (il[:, None].repeat(len(jl), 1), jl[None, :].repeat(len(il), 0)), ok.astype(float))
    with np.errstate(invalid="ignore", divide="ignore"):
        return np.where(cont > 0, soma / cont, np.nan)


# Zonas estratégicas: os 12 locais de referência do site (caixa de ±3° ao redor) + 3 zonas de CONFERÊNCIA
# (lugares extremos conhecidos, só para checar se os números fazem sentido).
# Formato: nome -> (latitude, longitude)
LOCAIS_ESTRATEGICOS = {
    "Atacama": (-24.50, -69.25), "Vales Secos de McMurdo": (-77.50, 162.00), "Deserto do Lut": (30.50, 58.50),
    "Danakil": (14.24, 40.30), "Mauna Kea": (19.82, -155.47), "Holuhraun (Islândia)": (64.85, -16.83),
    "Haughton (Canadá)": (75.38, -89.68), "Namibe": (-24.75, 15.30), "Lanzarote": (29.16, -13.44),
    "Lava Beds (EUA)": (41.71, -121.51), "San Rafael/MDRS (EUA)": (38.41, -110.79), "Svalbard": (79.40, 13.30),
    "[conferência] Antártida interior": (-80.0, 100.0), "[conferência] Saara": (25.0, 10.0),
    "[conferência] Tibete": (29.0, 87.0),
}
RAIO_ZONA_GRAUS = 3.0


def zonas_estrategicas():
    """Lista de caixas (lat_min, lat_max, lon_min, lon_max) ao redor dos locais estratégicos."""
    r = RAIO_ZONA_GRAUS
    return [(max(-90.0, la - r), min(90.0, la + r), lo - r, lo + r) for la, lo in LOCAIS_ESTRATEGICOS.values()]


def normalizar_regioes(regiao):
    """Aceita None, uma caixa (4 números) ou uma lista de caixas. Devolve lista de tuplas ou None."""
    if not regiao:
        return None
    if isinstance(regiao[0], (int, float)):
        return [tuple(float(x) for x in regiao)]
    return [tuple(float(x) for x in r) for r in regiao]


def mascara_celulas(regiao):
    """Máscara [90,180] das células cujo centro está dentro de alguma caixa
    (lat_min, lat_max, lon_min, lon_max), ou todas se regiao for None."""
    lat, lon = centros()
    regs = normalizar_regioes(regiao)
    if not regs:
        return np.ones((N_LAT, N_LON), bool)
    m = np.zeros((N_LAT, N_LON), bool)
    for la0, la1, lo0, lo1 in regs:
        m |= ((lat[:, None] >= la0) & (lat[:, None] <= la1) & (lon[None, :] >= lo0) & (lon[None, :] <= lo1))
    return m


# =====================================================================
# 2. AUTOTESTE (sem internet)
# =====================================================================
def autoteste():
    print("Autoteste das contas (dados sintéticos, sem internet)")
    # 2.1 blocos
    a = np.arange(16, dtype=float).reshape(4, 4)
    m, n = agregar_blocos(a, np.ones_like(a, bool), 2, 2)
    assert np.allclose(m, [[2.5, 4.5], [10.5, 12.5]]) and (n == 4).all()
    v = np.ones((4, 4), bool); v[0, 0] = False
    m, n = agregar_blocos(a, v, 2, 2)
    assert np.isclose(m[0, 0], (1 + 4 + 5) / 3) and n[0, 0] == 3
    _, d, _ = estatisticas_blocos(np.array([[0., 2.], [0., 2.]]), np.ones((2, 2), bool), 2, 2)
    assert np.isclose(d[0, 0], 1.0)
    # 2.2 temperatura: 12 meses de 300 K de dia e 280 K de noite -> média 290 K = 16,85 °C, amplitude 0
    dia = np.full((12, 2, 2), 300.0); noi = np.full((12, 2, 2), 280.0)
    med, amp, nm, ab = temperatura_pixel(dia, noi)
    assert np.allclose(med, 16.85) and np.allclose(amp, 0) and (nm == 12).all() and np.allclose(ab, 0)
    # com ciclo sazonal e metade do ano abaixo de zero
    dia2 = dia.copy(); noi2 = noi.copy()
    dia2[:6] = 270.0; noi2[:6] = 260.0; dia2[6:] = 290.0; noi2[6:] = 280.0
    med, amp, nm, ab = temperatura_pixel(dia2, noi2)
    assert np.allclose(amp, 285 - 265) and np.allclose(ab, 0.5), (amp, ab)
    # poucos meses -> NaN
    dia3 = dia.copy(); dia3[:4] = np.nan
    med, *_ = temperatura_pixel(dia3, noi)
    assert np.isnan(med).all()
    # 2.3 neve: códigos 0-100 válidos; 211 (noite), 250, 254 inválidos
    cod = np.full((12, 1, 1), 100, np.uint8); cod[:3] = 211; cod[3:5] = 254
    f, nn = neve_pixel(cod)
    assert np.isclose(f[0, 0], 1.0) and nn[0, 0] == 7
    cod2 = np.full((12, 1, 1), 50, np.uint8); cod2[:7] = 250
    f, _ = neve_pixel(cod2)
    assert np.isnan(f[0, 0])      # só 5 meses válidos (< 6)
    # 2.4 quartzo: emissividade plana -> QI = 1
    e = np.full((5, 2, 2), 0.95)
    assert np.allclose(indice_quartzo(e), 1.0)
    e2 = e.copy(); e2[1] = 0.90      # banda 11 mais baixa (feição do quartzo)
    assert np.all(indice_quartzo(e2) < 1.0)
    # 2.5 declividade: plano inclinado de 1 m a cada pixel de ~925 m -> ~0,06°
    el = np.tile(np.arange(10, dtype=float), (10, 1))
    d = declividade_graus(el, np.zeros(10), 120)
    assert 0.05 < d[5, 5] < 0.07, d[5, 5]
    # 2.6 pontos -> células (lat -0,25 | 0,25 e 1,25 ; lon -0,3 | 0,3)
    lat_p = np.array([-0.25, 0.25, 1.25]); lon_p = np.array([-0.3, 0.3])
    cel = pontos_para_celulas(lat_p, lon_p, np.array([[1., 2.], [3., 4.], [5., 6.]]))
    assert np.isclose(cel[44, 89], 1.0) and np.isclose(cel[44, 90], 2.0)      # lat -0,25 (célula [-2,0))
    assert np.isclose(cel[45, 89], np.mean([3., 5.])) and np.isclose(cel[45, 90], np.mean([4., 6.]))
    assert np.isnan(cel[0, 0])                                                # célula sem pontos
    # 2.8 ORIENTAÇÃO: linha 0 do arquivo = 90°N; na nossa grade, a última linha = +89°
    x = np.zeros((N_LAT, N_LON)); x[0, :] = 1.0
    y = ao_sul_primeiro(x); lat_c, _ = centros()
    assert y[-1, 0] == 1.0 and y[0, 0] == 0.0 and lat_c[-1] == 89.0 and lat_c[0] == -89.0
    # 2.9 posição dos tiles SRTM (lat_n = borda norte; 6000 linhas = 50°)
    assert indices_tile(90, 6000, -20) == (65, 80) and lat_c[65] == 41.0          # 90N..40N, 20W
    assert indices_tile(40, 6000, 60) == (40, 120) and lat_c[40] == -9.0          # 40N..10S, 60E
    assert indices_tile(-10, 6000, -180) == (15, 0) and lat_c[15] == -59.0        # 10S..60S, 180W
    # 2.10 tile sintético: metade norte = 100 m, metade sul = 0 m (mar) -> célula sul sem dado, célula norte = 100 m
    tile = np.zeros((480, 480), np.int16); tile[:240, :] = 100
    m, d, n, md = estatisticas_tile(tile, 10.0)       # borda norte em 10°N, cobre 10N..6N (2 células de 2°)
    assert m.shape == (2, 2) and n[0, 0] == 0 and n[1, 0] == 57600 and np.isclose(m[1, 0], 100.0) and np.isclose(d[1, 0], 0.0)
    assert np.isnan(m[0, 0])                           # o mar (0 m) não vira "elevação 0"
    # 2.11 cache: guarda e recupera; parâmetros diferentes invalidam
    import tempfile
    with tempfile.TemporaryDirectory() as tmp:
        salvar_cache(tmp, "t", "A", x=np.arange(3.0))
        assert np.allclose(carregar_cache(tmp, "t", "A")["x"], [0, 1, 2]) and carregar_cache(tmp, "t", "B") is None
    # 2.7 região
    mk = mascara_celulas((20, 40, 50, 65))
    lat, lon = centros()
    assert mk.sum() == 10 * 8 and lat[np.where(mk.any(1))[0][0]] == 21.0
    print("  OK: todas as contas passaram.")


# =====================================================================
# 3. DOWNLOADS (earthaccess) E LEITURA
# =====================================================================
def entrar_earthdata():
    import earthaccess
    if not any(os.environ.get(k) for k in ("EARTHDATA_TOKEN", "EARTHDATA_USERNAME")):
        sys.exit("ERRO: defina EARTHDATA_USERNAME e EARTHDATA_PASSWORD (ou EARTHDATA_TOKEN) "
                 "como variáveis de ambiente. Nunca coloque senha no código.")
    auth = earthaccess.login(strategy="environment")
    if not getattr(auth, "authenticated", True):
        sys.exit("ERRO: login no Earthdata falhou. Confira usuário e senha.")
    return earthaccess


def diagnosticar_download(ea, granulo):
    """Quando um download falha, o earthaccess só levanta uma exceção vazia. Aqui pedimos o primeiro arquivo
    de novo e traduzimos a resposta HTTP em uma mensagem que diz o que fazer."""
    try:
        url = granulo.data_links()[0]
        r = ea.get_requests_https_session().get(url, stream=True, allow_redirects=True, timeout=60)
        status, final, tipo = r.status_code, r.url, r.headers.get("content-type", "")
        r.close()
    except Exception as e:           # sem rede, DNS etc.
        return f"Não consegui diagnosticar o download ({type(e).__name__}: {e})."
    base = f"HTTP {status} ao baixar {url.split('/')[-1]} (resposta final de {final.split('/')[2]}, tipo '{tipo}')."
    if status in (401, 403) or "urs.earthdata" in final:
        return (base + " Provável causa: o aplicativo desse servidor não está autorizado no seu perfil Earthdata. "
                "Abra https://urs.earthdata.nasa.gov/profile > Applications > Authorized Apps e autorize "
                "'NASA GESDISC DATA ARCHIVE' (MERRA-2), 'LP DAAC Data Pool' (MODIS, SRTM, ASTER) e 'NSIDC DAAC' (neve). "
                "Se já estiverem autorizados, confira usuário e senha.")
    if status == 404:
        return base + " O arquivo não existe nesse endereço (o ano pedido tem dados?)."
    if status == 200:
        return base + " Este arquivo baixou agora; a falha pode ter sido momentânea (rede/limite do servidor). Rode de novo."
    return base


def buscar_e_baixar(ea, short_name, versao, anos, pasta, bbox=None, limite=None, filtro=None):
    pasta.mkdir(parents=True, exist_ok=True)
    resultados = []
    for ano in anos:
        kw = dict(short_name=short_name, version=versao, temporal=(f"{ano}-01-01", f"{ano}-12-31"))
        if bbox:
            kw["bounding_box"] = bbox
        resultados += ea.search_data(count=limite or 400, **kw)
    if filtro:
        resultados = [r for r in resultados if filtro(r)]
    if not resultados:
        raise RuntimeError(f"Nenhum arquivo encontrado para {short_name} v{versao} em {anos}")
    print(f"  {short_name} v{versao}: {len(resultados)} arquivo(s)")
    try:
        return [Path(p) for p in ea.download(resultados, str(pasta))]
    except Exception as e:
        raise RuntimeError(diagnosticar_download(ea, resultados[0])) from e


def mes_do_doy(ano, doy):
    """Mês (1-12) a partir do dia do ano (1-366)."""
    acum = np.cumsum([0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31])
    if ano % 4 == 0 and (ano % 100 != 0 or ano % 400 == 0):
        acum[2:] += 1
    return int(np.searchsorted(acum, doy, side="left"))


def mes_do_arquivo(caminho):
    """(mês, ano) a partir do nome (MODIS usa .A<AAAA><DDD>., MERRA-2 usa .AAAAMM.nc4)."""
    import re
    n = Path(caminho).name
    m = re.search(r"\.A(\d{4})(\d{3})\.", n)
    if m:
        return mes_do_doy(int(m.group(1)), int(m.group(2))), int(m.group(1))
    m = re.search(r"\.(\d{4})(\d{2})\.nc4", n)
    if m:
        return int(m.group(2)), int(m.group(1))
    raise ValueError(f"não entendi a data em {n}")


def ler_hdf4(caminho, sds):
    from pyhdf.SD import SD, SDC
    f = SD(str(caminho), SDC.READ)
    s = f.select(sds)
    arr = s[:]
    attrs = s.attributes()
    s.endaccess(); f.end()
    return arr, attrs


# ---------------------------------------------------------------------
# 3.1 MODIS temperatura + gelo
# ---------------------------------------------------------------------
def processar_modis(ea, anos, raw, log):
    arqs_t = buscar_e_baixar(ea, "MOD11C3", "061", anos, raw / "MOD11C3")
    arqs_n = buscar_e_baixar(ea, "MOD10CM", "61", anos, raw / "MOD10CM")

    def por_mes(arqs):
        d = {}
        for p in arqs:
            mes, ano = mes_do_arquivo(p)
            d.setdefault(mes, []).append(p)
        return d

    tm, nm = por_mes(arqs_t), por_mes(arqs_n)
    meses_t = sorted(tm)
    print(f"  meses com temperatura: {meses_t}")
    dia = np.full((12, 3600, 7200), np.nan, np.float32)
    noi = np.full((12, 3600, 7200), np.nan, np.float32)
    terra = None
    for mes in meses_t:
        acc_d, acc_n = [], []
        for p in tm[mes]:
            d, ad = ler_hdf4(p, "LST_Day_CMG")
            n, an = ler_hdf4(p, "LST_Night_CMG")
            esc = float(ad.get("scale_factor", 0.02))
            assert abs(esc - 0.02) < 1e-9, f"scale_factor inesperado: {esc}"
            acc_d.append(np.where(d >= 7500, d * esc, np.nan)); acc_n.append(np.where(n >= 7500, n * esc, np.nan))
            if terra is None:
                pl, _ = ler_hdf4(p, "Percent_land_in_grid")
                terra = pl >= 50
        with np.errstate(all="ignore"):
            dia[mes - 1] = np.nanmean(acc_d, axis=0); noi[mes - 1] = np.nanmean(acc_n, axis=0)
    med, ampl, n_meses, abaixo = temperatura_pixel(dia, noi)
    del dia, noi

    neve = np.full((12, 3600, 7200), 255, np.uint8)
    for mes, ps in nm.items():
        cods = [ler_hdf4(p, "Snow_Cover_Monthly_CMG")[0] for p in ps]
        # com vários anos: média dos códigos válidos 0-100; senão fica o código do 1º ano
        v = np.array(cods, float)
        ok = (v >= 0) & (v <= 100)
        with np.errstate(all="ignore"):
            m = np.where(ok.any(0), np.nanmean(np.where(ok, v, np.nan), axis=0), np.nan)
        neve[mes - 1] = np.where(np.isfinite(m), np.round(m), cods[0]).astype(np.uint8)
    frac_neve, n_neve = neve_pixel(neve)
    del neve

    def celula(campo):
        valido = np.isfinite(campo) & terra
        m, n = agregar_blocos(np.nan_to_num(campo), valido, 40, 40)
        n_terra = terra.reshape(90, 40, 180, 40).sum(axis=(1, 3))
        bom = (n_terra >= MIN_PIXELS_TERRA) & (n >= MIN_FRAC_VALIDA * np.maximum(n_terra, 1))
        return ao_sul_primeiro(np.where(bom, m, np.nan))

    log["modis"] = "ok"
    return dict(temp_media_C=celula(med), temp_amplitude_C=celula(ampl), frac_T_abaixo_0C=celula(abaixo),
                frac_neve=celula(frac_neve)), terra


# ---------------------------------------------------------------------
# 3.2 Relevo: SRTM + complemento ETOPO
# ---------------------------------------------------------------------
def ler_tile_srtm(caminho):
    nome = Path(caminho).name.lower()
    import re
    m = re.match(r"([ew])(\d{3})([ns])(\d{2})", nome)
    lon_w = int(m.group(2)) * (1 if m.group(1) == "e" else -1)
    lat_n = int(m.group(4)) * (1 if m.group(3) == "n" else -1)
    with zipfile.ZipFile(caminho) as z:
        membro = [n for n in z.namelist() if n.lower().endswith(".dem")][0]
        dados = z.read(membro)
    cols, linhas = 4800, len(dados) // 2 // 4800
    if cols * linhas * 2 != len(dados) or linhas not in (6000, 3600):
        raise ValueError(f"{nome}: tamanho {len(dados)} bytes não bate com 4800 colunas")
    for dt in (">i2", "<i2"):
        arr = np.frombuffer(dados, dtype=dt).reshape(linhas, cols)
        v = arr[arr != SRTM_NODATA]
        if v.size == 0 or ((v > -500) & (v < 9000)).mean() > 0.99:
            return arr.astype(np.float32), lat_n, lon_w, dt
    raise ValueError(f"{nome}: valores fora do intervalo plausível nas duas ordens de bytes")


def processar_srtm(ea, raw, regiao, log):
    regs = normalizar_regioes(regiao)
    # SRTMGL30 não tem data útil para filtro temporal (fev/2000): busca sem 'temporal'.
    # Uma busca por caixa; tiles repetidos entram uma vez só.
    if regs:
        vistos, resultados = set(), []
        for la0, la1, lo0, lo1 in regs:
            for g in ea.search_data(short_name="SRTMGL30", version="002", count=100,
                                    bounding_box=(lo0 - 2, la0 - 2, lo1 + 2, la1 + 2)):
                ur = g["umm"]["GranuleUR"]
                if ur not in vistos:
                    vistos.add(ur); resultados.append(g)
    else:
        resultados = ea.search_data(short_name="SRTMGL30", version="002", count=100)
    pasta = raw / "SRTMGL30"; pasta.mkdir(parents=True, exist_ok=True)
    arqs = [Path(p) for p in ea.download(resultados, str(pasta))]
    print(f"  SRTMGL30: {len(arqs)} tile(s)")
    elev = np.full((N_LAT, N_LON), np.nan); rug = elev.copy(); decl = elev.copy(); npx = np.zeros((N_LAT, N_LON), int)
    ordens = set()
    for p in arqs:
        arr, lat_n, lon_w, dt = ler_tile_srtm(p)
        ordens.add(dt)
        m, d, n, md = estatisticas_tile(arr, lat_n)
        i0, j0 = indices_tile(lat_n, arr.shape[0], lon_w)
        sl = (slice(i0, i0 + m.shape[0]), slice(j0, j0 + m.shape[1]))
        usa = n >= 25
        elev[sl] = np.where(usa, m, elev[sl]); rug[sl] = np.where(usa, d, rug[sl])
        decl[sl] = np.where(usa, md, decl[sl]); npx[sl] = np.where(usa, n, npx[sl])
    fonte = np.where(np.isfinite(elev), "SRTMGL30", "")
    log["srtm_ordem_bytes"] = sorted(ordens)
    return elev, rug, decl, fonte


def complemento_etopo(raw, elev, rug, decl, fonte, regiao):
    """Preenche as células sem SRTM com ETOPO 2022 (NOAA, 60 arco-segundos, superfície com gelo).
    Só usa pixels acima do nível do mar (terra e gelo) para não misturar batimetria."""
    precisa = ~np.isfinite(elev) & mascara_celulas(regiao)
    if not precisa.any():
        return elev, rug, decl, fonte, False
    import netCDF4
    arq = c.baixar(ETOPO_URL, raw / "ETOPO" / "ETOPO_2022_v1_60s_N90W180_surface.nc")
    ds = netCDF4.Dataset(arq)
    lat = ds["lat"][:]; lon = ds["lon"][:]
    z = ds["z"]
    for i, j in zip(*np.where(precisa)):
        la0, lo0 = -90 + i * PASSO, -180 + j * PASSO
        a = np.where((lat >= la0) & (lat < la0 + PASSO))[0]; b = np.where((lon >= lo0) & (lon < lo0 + PASSO))[0]
        if a.size == 0 or b.size == 0:
            continue
        bloco = np.array(z[a[0]:a[-1] + 1, b[0]:b[-1] + 1], float)
        terra = bloco > 0
        if terra.sum() < 25:
            continue
        elev[i, j] = bloco[terra].mean(); rug[i, j] = bloco[terra].std()
        d = declividade_graus(np.where(terra, bloco, np.nan), lat[a[0]:a[-1] + 1], 60)
        decl[i, j] = np.nanmean(d) if np.isfinite(d).any() else np.nan
        fonte[i, j] = "ETOPO2022 (complemento NOAA)"
    ds.close()
    return elev, rug, decl, fonte, True


# ---------------------------------------------------------------------
# 3.3 Geologia: ASTER GED
# ---------------------------------------------------------------------
def processar_aster(ea, raw, ano_aster, mes_aster, terra, log):
    import re
    import h5py
    # O catálogo tem UM arquivo por mês de cada ano (2000-2015): escolhemos ano E mês.
    res = ea.search_data(short_name="AG5KMMOH", version="041", count=50,
                         temporal=(f"{ano_aster}-01-01", f"{ano_aster}-12-31"))
    escolhido = []
    for g in res:
        m = re.search(r"_A(\d{4})(\d{3})", g["umm"]["GranuleUR"])
        if m and mes_do_doy(int(m.group(1)), int(m.group(2))) == mes_aster:
            escolhido.append(g)
    if len(escolhido) != 1:
        raise RuntimeError(f"AG5KMMOH: esperava 1 arquivo para {ano_aster}-{mes_aster:02d}, achei {len(escolhido)}")
    pasta = raw / "AG5KMMOH"; pasta.mkdir(parents=True, exist_ok=True)
    arq = Path(ea.download(escolhido, str(pasta))[0])
    achados = []
    with h5py.File(arq, "r") as f:
        def visita(nome, obj):
            if isinstance(obj, h5py.Dataset):
                achados.append((nome, obj.shape, obj.dtype))
        f.visititems(visita)
        cand = [x for x in achados if len(x[1]) == 3 and 5 in x[1] and x[2] == np.uint8
                and "emis" in x[0].lower() and "unc" not in x[0].lower() and "sdev" not in x[0].lower()]
        if not cand:
            log["aster_estrutura"] = [(n, list(s), str(d)) for n, s, d in achados]
            raise RuntimeError("Não achei o dataset de emissividade (5 bandas) no HDF5. Estrutura salva no log.")
        nome, shape, _ = sorted(cand, key=lambda x: len(x[0]))[0]
        ds = f[nome]
        esc = float(np.ravel(ds.attrs.get("Scale Factor", [0.002]))[0]); off = float(np.ravel(ds.attrs.get("Offset", [0.49]))[0])
        assert abs(esc - 0.002) < 1e-9 and abs(off - 0.49) < 1e-9, (esc, off)
        dn = ds[()]
    eixo = shape.index(5)
    dn = np.moveaxis(dn, eixo, 0)
    assert dn.shape == (5, 3600, 7200), dn.shape
    emis = np.where(dn >= 1, dn * esc + off, np.nan)
    qi = indice_quartzo(emis)
    valido = np.isfinite(qi) & terra
    m, n = agregar_blocos(np.nan_to_num(qi), valido, 40, 40)
    n_terra = terra.reshape(90, 40, 180, 40).sum(axis=(1, 3))
    bom = (n_terra >= MIN_PIXELS_TERRA) & (n >= MIN_FRAC_VALIDA * np.maximum(n_terra, 1))
    log["aster"] = dict(arquivo=arq.name, dataset=nome, ano=ano_aster, mes=mes_aster)
    return ao_sul_primeiro(np.where(bom, m, np.nan))


# ---------------------------------------------------------------------
# 3.4 Vento e poeira: MERRA-2
# ---------------------------------------------------------------------
def processar_merra(ea, anos, raw, log):
    import netCDF4
    saida = {}
    for short, var, chave, conv in (("M2TMNXFLX", "SPEED", "vento_ms", 1.0), ("M2TMNXAER", "DUSMASS", "poeira_ugm3", 1e9)):
        arqs = buscar_e_baixar(ea, short, "5.12.4", anos, raw / short)
        campos = []
        meta = {}
        for p in arqs:
            ds = netCDF4.Dataset(p)
            v = ds[var]
            meta = dict(long_name=getattr(v, "long_name", None), units=getattr(v, "units", None), arquivo=Path(p).name)
            campos.append(np.ma.filled(v[0].astype(float), np.nan))
            lat = ds["lat"][:]; lon = ds["lon"][:]
            ds.close()
        media = np.nanmean(campos, axis=0) * conv
        saida[chave] = pontos_para_celulas(np.array(lat), np.array(lon), media)
        log[f"merra_{var}"] = dict(meta, n_arquivos=len(arqs))
    return saida


# =====================================================================
# 4. MONTAGEM DO JSON
# =====================================================================
METADADOS_PRODUTOS = {
    "temperatura": dict(
        produto="MOD11C3", versao="061", instrumento="Terra/MODIS", resolucao="0,05° (agregado em células de 2°)",
        link="https://doi.org/10.5067/MODIS/MOD11C3.061", unidade_media="°C", unidade_amplitude="°C",
        metodo="Por pixel: média dos 12 meses de (LST dia + LST noite)/2, em °C; amplitude = máx - mín das médias mensais; "
               f"exige ≥{MIN_MESES_T} meses válidos. Por célula: média dos pixels de terra válidos "
               f"(terra = Percent_land_in_grid ≥ 50; célula exige ≥{MIN_FRAC_VALIDA:.0%} dos pixels de terra válidos)."),
    "gelo": dict(
        produto="MOD10CM (neve) + MOD11C3 (T<0 °C)", versao="61 / 061", instrumento="Terra/MODIS", resolucao="0,05° (células de 2°)",
        link="https://doi.org/10.5067/MODIS/MOD10CM.061", unidade="fração do tempo (0 a 1)",
        metodo=f"frac_neve = média dos meses com dado (códigos 0-100) de % de neve/100; exige ≥{MIN_MESES_NEVE} meses "
               "(meses de noite polar, código 211, ficam de fora: pode subestimar o gelo polar). "
               "frac_T_abaixo_0C = fração dos meses com temperatura média diária < 0 °C."),
    "relevo": dict(
        produto="SRTMGL30", versao="002", instrumento="SRTM (Shuttle)", resolucao="30 arco-seg (~1 km), células de 2°",
        link="https://doi.org/10.5067/MEASURES/SRTM/SRTMGL30.002", unidade="m (elevação, desvio padrão) e graus (declividade)",
        metodo="Por célula: média, desvio padrão (rugosidade) da elevação e média da declividade (gradiente) dos pixels de 30\". O SRTMGL30 (NASA, LP DAAC) vai de 90°N a 60°S, mas o radar do SRTM só cobriu 60°N a 56°S: acima de 60°N (Holuhraun, Haughton, Svalbard) os valores vêm, quase com certeza, do GTOPO30 (USGS), que o produto usa para preencher o que o radar não alcançou. Fora do SRTMGL30 (extremo sul, McMurdo) usamos ETOPO 2022 60\" (NOAA, COMPLEMENTO, não é NASA), só pixels acima do nível do mar."),
    "geologia": dict(
        produto="AG5KMMOH", versao="041", instrumento="Terra/ASTER (GED)", resolucao="0,05° (células de 2°)",
        link="https://doi.org/10.5067/COMMUNITY/ASTER_GED/AG5KMMOH.041", unidade="índice sem unidade (≈1)",
        metodo="Índice de quartzo QI = e11*e11/(e10*e12), bandas ASTER 10-14 (8,3; 8,6; 9,1; 10,6; 11,3 µm); fórmula da "
               "literatura (Ninomiya et al.), NÃO conferida contra o artigo nesta execução. Usa UM único mês do GED (ano e mês no log). "
               "NÃO é comparável diretamente com o Christiansen Feature da Lua."),
    "vento": dict(
        produto="M2TMNXFLX (SPEED) e M2TMNXAER (DUSMASS)", versao="5.12.4", instrumento="MERRA-2 (reanálise, GMAO/NASA)",
        resolucao="0,5° x 0,625° (células de 2°)", link="https://doi.org/10.5067/0JRLVL8YV2Y4",
        unidade="m/s (vento) e µg/m³ (poeira)",
        metodo="Média anual das médias mensais, e média dos pontos da grade dentro de cada célula (inclui oceano). SPEED é a velocidade escalar média (não a magnitude da média dos vetores, que subestima). ATENÇÃO: SPEED não traz a altura nos atributos; o arquivo tem HLML (altura do nível mais baixo do modelo, ~50-70 m nos pontos conferidos), então o vento é provavelmente desse nível e NÃO o vento a 10 m: tende a ser maior que o de 10 m."),
}


def r(x, nd=3):
    return None if (x is None or not np.isfinite(x)) else round(float(x), nd)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--raw", default="raw")
    ap.add_argument("--saida", default="data")
    ap.add_argument("--anos", nargs="+", type=int, default=[2020], help="anos de MODIS/MERRA-2 (padrão: 2020)")
    ap.add_argument("--regiao", nargs=4, type=float, metavar=("LAT_MIN", "LAT_MAX", "LON_MIN", "LON_MAX"),
                    help="só estas células (teste rápido). Ex.: 20 40 50 65")
    ap.add_argument("--zonas", choices=["estrategicas"],
                    help="só as zonas ao redor dos 12 locais de referência + 3 de conferência (±3°)")
    ap.add_argument("--ano-aster", type=int, default=2015, help="ano do ASTER GED (2000-2015)")
    ap.add_argument("--mes-aster", type=int, default=7, help="mês do ASTER GED (1-12)")
    ap.add_argument("--so", nargs="+", choices=["modis", "srtm", "aster", "merra"],
                    help="roda só estes produtos (os outros ficam null)")
    ap.add_argument("--autoteste", action="store_true", help="testa as contas com dados sintéticos e sai")
    a = ap.parse_args()
    if a.autoteste:
        autoteste(); return

    raw, saida = Path(a.raw) / "terra", Path(a.saida)
    if a.zonas == "estrategicas":
        a.regiao = zonas_estrategicas()
    a.regiao = normalizar_regioes(a.regiao)
    quais = set(a.so or ["modis", "srtm", "aster", "merra"])
    ea = entrar_earthdata()
    log, problemas = {}, {}
    nan = np.full((N_LAT, N_LON), np.nan)
    campos = dict(temp_media_C=nan, temp_amplitude_C=nan, frac_T_abaixo_0C=nan, frac_neve=nan,
                  elev=nan, rug=nan, decl=nan, qi=nan, vento=nan, poeira=nan)
    fonte_relevo = np.full((N_LAT, N_LON), "", dtype=object)
    terra = None

    def tentar(nome, fn):
        try:
            return fn()
        except Exception as e:      # registra o motivo; não inventa valor
            tb = traceback.format_exc().strip().splitlines()
            problemas[nome] = f"{type(e).__name__}: {e} | {' / '.join(x.strip() for x in tb[-4:])}"
            print(f"  FALHOU {nome}:", file=sys.stderr)
            traceback.print_exc()
            return None

    meta = json.dumps(dict(anos=a.anos, regiao=a.regiao, ano_aster=a.ano_aster, mes_aster=a.mes_aster), sort_keys=True)

    # --- MODIS (temperatura e neve) ---
    if "modis" in quais:
        print("MODIS (temperatura e neve)")
        r_ = tentar("modis", lambda: processar_modis(ea, a.anos, raw, log))
        if r_:
            d, terra = r_
            campos.update(temp_media_C=d["temp_media_C"], temp_amplitude_C=d["temp_amplitude_C"],
                          frac_T_abaixo_0C=d["frac_T_abaixo_0C"], frac_neve=d["frac_neve"])
            salvar_cache(raw, "modis", meta, **d)
    else:
        cd = carregar_cache(raw, "modis", meta)
        if cd:
            campos.update(cd); print("  MODIS: usando resultado guardado (cache)")

    # --- SRTM + ETOPO (relevo) ---
    if "srtm" in quais:
        print("SRTM + ETOPO (relevo)")
        r_ = tentar("srtm", lambda: processar_srtm(ea, raw, a.regiao, log))
        if r_:
            elev, rug, decl, fonte = r_
            r2 = tentar("etopo", lambda: complemento_etopo(raw, elev, rug, decl, fonte, a.regiao))
            if r2:
                elev, rug, decl, fonte, usou = r2
                log["etopo_usado"] = usou
            campos.update(elev=elev, rug=rug, decl=decl); fonte_relevo = fonte
            salvar_cache(raw, "srtm", meta, elev=elev, rug=rug, decl=decl, fonte=np.asarray(fonte).astype("U40"))
    else:
        cd = carregar_cache(raw, "srtm", meta)
        if cd:
            campos.update(elev=cd["elev"], rug=cd["rug"], decl=cd["decl"]); fonte_relevo = cd["fonte"]
            print("  SRTM: usando resultado guardado (cache)")

    # --- ASTER GED (geologia) ---
    if "aster" in quais:
        print("ASTER GED (geologia)")
        if terra is None:
            try:   # precisa da máscara de terra do MOD11C3
                arq = sorted((raw / "MOD11C3").glob("*.hdf"))[0]
                terra = ler_hdf4(arq, "Percent_land_in_grid")[0] >= 50
            except Exception:
                terra = None
        if terra is None:
            problemas["aster"] = "Sem máscara de terra (MOD11C3 não baixado)."
        else:
            r_ = tentar("aster", lambda: processar_aster(ea, raw, a.ano_aster, a.mes_aster, terra, log))
            if r_ is not None:
                campos["qi"] = r_
                salvar_cache(raw, "aster", meta, qi=r_)
    else:
        cd = carregar_cache(raw, "aster", meta)
        if cd:
            campos["qi"] = cd["qi"]; print("  ASTER: usando resultado guardado (cache)")

    # --- MERRA-2 (vento e poeira) ---
    if "merra" in quais:
        print("MERRA-2 (vento e poeira)")
        r_ = tentar("merra", lambda: processar_merra(ea, a.anos, raw, log))
        if r_:
            campos["vento"], campos["poeira"] = r_["vento_ms"], r_["poeira_ugm3"]
            salvar_cache(raw, "merra", meta, vento=campos["vento"], poeira=campos["poeira"])
    else:
        cd = carregar_cache(raw, "merra", meta)
        if cd:
            campos["vento"], campos["poeira"] = cd["vento"], cd["poeira"]; print("  MERRA-2: usando resultado guardado (cache)")

    lat, lon = centros()
    sel = mascara_celulas(a.regiao)
    celulas = []
    for i in range(N_LAT):
        for j in range(N_LON):
            if not sel[i, j]:
                continue
            celulas.append(dict(
                lat=float(lat[i]), lon=float(lon[j]),
                temperatura=dict(media_anual_C=r(campos["temp_media_C"][i, j]), amplitude_C=r(campos["temp_amplitude_C"][i, j])),
                relevo=dict(elevacao_media_m=r(campos["elev"][i, j], 1), rugosidade_desvio_m=r(campos["rug"][i, j], 1),
                            declividade_media_graus=r(campos["decl"][i, j]), fonte=(fonte_relevo[i, j] or None)),
                gelo=dict(frac_neve=r(campos["frac_neve"][i, j]), frac_T_abaixo_0C=r(campos["frac_T_abaixo_0C"][i, j])),
                geologia=dict(indice_quartzo=r(campos["qi"][i, j], 4)),
                vento=dict(vento_ms=r(campos["vento"][i, j]), poeira_ugm3=r(campos["poeira"][i, j]))))
    c.salvar_json(dict(
        corpo="Terra", gerado_por="scripts/01_terra.py", passo_graus=PASSO, anos=a.anos, regiao=a.regiao,
        aspectos=METADADOS_PRODUTOS, log=log, problemas=problemas,
        complementos=["ETOPO 2022 (NOAA), usado só onde o SRTMGL30 não tem dado (extremo sul, McMurdo): não é produto NASA."],
        celulas=celulas), saida / "earth_grid.json")
    if problemas:
        print("\nPROBLEMAS (campos ficaram null):")
        for k, v in problemas.items():
            print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
