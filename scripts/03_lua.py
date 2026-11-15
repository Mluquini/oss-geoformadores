#!/usr/bin/env python3
"""
03_lua.py: gera data/moon_sites.json com dados REAIS (PDS Geosciences, NASA).

O que ele faz, em português simples:
  1. Altitude da Lua (LRO/LOLA): média e "rugosidade" numa janela ao redor do local.
  2. Composição (LRO/Diviner, Christiansen Feature): onde o mapa existe (entre 60°N e 60°S).
  3. Temperatura (LRO/Diviner):
       - locais perto do equador: tabelas "GCP" (temperatura por hora local do dia lunar);
       - locais perto do polo sul: tabela "PRP" (temperatura média e máxima do ano, e
         área das "armadilhas frias", onde nunca passa de 110 K).
  4. Vento/poeira: "não se aplica" (a Lua não tem atmosfera).
  O que não conseguimos medir fica null, com o motivo.

Como rodar:
    python scripts/03_lua.py --raw raw --saida data
Os downloads pesados (GCP ~156 MB por local; PRP ~605 MB) só são baixados uma vez.
Para testar rápido, sem eles:  --sem-pesados
"""
import argparse
import re
import sys
from pathlib import Path

import numpy as np
import requests

sys.path.insert(0, str(Path(__file__).resolve().parent))
import comum as c  # noqa: E402

PDS = "https://pds-geosciences.wustl.edu/lro"
LOLA_URL = f"{PDS}/lro-l-lola-3-rdr-v1/lrolol_1xxx/data/lola_gdr/cylindrical/img/ldem_16"
CF_URL = f"{PDS}/urn-nasa-pds-lro_diviner_derived1/data_derived_gdr_l3/cylindrical/img/dgdr_nen_cf_clc_cyl_032_img"
GCP_URL = f"{PDS}/urn-nasa-pds-lro_diviner_derived1/data_derived_gcp/global_cumul_avg_cyl_{{faixa}}_002"
PRP_URL = f"{PDS}/urn-nasa-pds-lro_diviner_derived1/data_derived_prp/dlre_prp_south"
RAIO_LUA_M = 1_737_400.0
T_ARMADILHA_FRIA_K = 110.0   # abaixo disso, gelo de água é estável por bilhões de anos
MAX_LACUNA_HORAS = 2.0       # maior buraco aceito na curva de temperatura do dia lunar

# Centros OFICIAIS (graus; lon Leste), do Gazetteer da IAU (campos center_lat / center_lon).
# "Monte Malapert" = Mons Malapert (nome adotado pela IAU em 2024); a cratera Malapert fica em outro lugar.
COORD_FONTE = ("Gazetteer of Planetary Nomenclature da IAU (USGS Astrogeology), campos center_lat/center_lon, "
               "arquivo MOON_nomenclature_center_pts baixado em 2026-11-14")
LOCAIS = [
    ("shackleton",      "Polo Sul (Cratera Shackleton)", -89.6700, 129.7800),
    ("tranquillitatis", "Mare Tranquillitatis",            8.3487,  30.8346),
    ("tycho",           "Cratera Tycho",                 -43.2958, 348.7847),
    ("malapert",        "Monte Malapert",                -85.9800, 358.3300),
]
LIMITE_POLAR = 80.0   # |lat| >= isto usa o PRP; abaixo disso usa o GCP

NAO_SE_APLICA = "Não se aplica: a Lua não tem atmosfera, então não há vento nem poeira em suspensão."


def nulo(unidade, motivo):
    return c.campo(None, produto="-", instrumento="-", versao="-", periodo="-", resolucao="-", link="-",
                   unidade=unidade, motivo_nulo=motivo)


def faixa_gcp(lat0):
    """Nome da faixa de 10° do GCP que contém o local (ex.: '00n10n', '50s40s')."""
    lo = int(np.floor(lat0 / 10.0)) * 10
    hi = lo + 10
    s = lambda v, n_ou_s: f"{abs(v):02d}{n_ou_s}"
    a = s(lo, "n" if lo >= 0 else "s")
    b = s(hi, "n" if hi > 0 else "s")
    return a + b


def temperatura_gcp(lat0, lon0, raw):
    """Curva de temperatura ao longo do dia lunar no local, a partir do GCP."""
    faixa = faixa_gcp(lat0)
    url = GCP_URL.format(faixa=faixa)
    tab = c.baixar(url + ".tab", raw / f"gcp_{faixa}.tab")
    c.baixar(url + ".lbl", raw / f"gcp_{faixa}.lbl")
    lon0 = ((lon0 + 180) % 360) - 180
    # colunas: clon, clat, ltim, t3..t9, tbol. Cabeçalho na 1ª linha. Usamos só 4 colunas.
    dados = np.genfromtxt(tab, delimiter=",", skip_header=1, usecols=(0, 1, 2, 10), dtype=float)
    clon, clat, ltim, tbol = dados.T
    tbol = np.where(tbol <= -9990, np.nan, tbol)       # -9999 = sem observação
    dist = c.distancia_angular_graus(clat, clon, lat0, lon0)
    dentro = dist <= c.RAIO_JANELA_GRAUS
    if not dentro.any():
        return None
    # Janela precisa caber na faixa de latitude do arquivo
    lat_lo = clat[dentro].min()
    horas = np.unique(ltim[dentro])
    curva = np.array([np.nanmean(tbol[dentro & (ltim == h)]) if np.isfinite(tbol[dentro & (ltim == h)]).any()
                      else np.nan for h in horas])
    ok = np.isfinite(curva)
    if ok.sum() < 2:
        return dict(media=None, motivo="menos de 2 faixas de hora local com dado")
    # Buracos na curva: a maior lacuna (circular, em horas) entre faixas com dado não pode passar de 2 h.
    h_ok = horas[ok]
    lacunas = np.diff(np.r_[h_ok, h_ok[0] + 24.0])
    if lacunas.max() > MAX_LACUNA_HORAS:
        return dict(media=None, motivo=f"lacuna de {lacunas.max():.1f} h sem dado na curva do dia")
    # Média do dia: interpolação linear periódica nas faixas sem dado, depois média das 96 faixas.
    interp = np.interp(horas, np.r_[h_ok - 24.0, h_ok, h_ok + 24.0], np.r_[curva[ok], curva[ok], curva[ok]])
    # Armadilha fria: fração dos "tiles" (0,5°) cujo máximo ao longo do dia fica abaixo de 110 K
    tiles = {}
    for lo, la, t in zip(clon[dentro], clat[dentro], tbol[dentro]):
        tiles.setdefault((lo, la), []).append(t)
    tmax_tiles = np.array([np.nanmax(v) if np.isfinite(v).any() else np.nan for v in tiles.values()])
    ok_t = np.isfinite(tmax_tiles)
    return dict(
        media=float(interp.mean()), maximo=float(np.nanmax(curva)), minimo=float(np.nanmin(curva)),
        n_tiles=len(tiles), n_horas_validas=int(ok.sum()), n_horas=len(horas),
        frac_armadilha_fria=float((tmax_tiles[ok_t] < T_ARMADILHA_FRIA_K).mean()) if ok_t.any() else None,
        faixa=faixa, lat_min_tiles=float(lat_lo),
    )


_PRP_CACHE = {}


def carregar_prp(raw):
    if "df" in _PRP_CACHE:
        return _PRP_CACHE["df"]
    import pandas as pd
    tab = c.baixar(PRP_URL + ".tab", raw / "dlre_prp_south.tab")
    c.baixar(PRP_URL + ".lbl", raw / "dlre_prp_south.lbl")
    print("  lendo a tabela PRP (2,88 milhões de linhas)...")
    df = pd.read_csv(tab, skipinitialspace=True)
    df.columns = [x.strip() for x in df.columns]
    _PRP_CACHE["df"] = df
    return df


def temperatura_prp(lat0, lon0, raw):
    df = carregar_prp(raw)
    dist = c.distancia_angular_graus(df["tri_clat"].values, df["tri_clon"].values, lat0, lon0)
    sel = df[(dist <= c.RAIO_JANELA_GRAUS)]
    if sel.empty:
        return None
    v1 = sel[["tri1_x", "tri1_y", "tri1_z"]].values
    v2 = sel[["tri2_x", "tri2_y", "tri2_z"]].values
    v3 = sel[["tri3_x", "tri3_y", "tri3_z"]].values
    area = 0.5 * np.linalg.norm(np.cross(v2 - v1, v3 - v1), axis=1)    # km² (vértices em km)
    ta, tm = sel["temp_avg"].values, sel["temp_max"].values
    ok = (ta > 0) & (tm > 0)                                           # -999 = sem valor
    if not ok.any():
        return dict(media=None)
    w = area[ok]
    return dict(
        media=float(np.average(ta[ok], weights=w)), maximo=float(tm[ok].max()),
        maximo_medio=float(np.average(tm[ok], weights=w)), minimo_media_triangulo=float(ta[ok].min()),
        n_triangulos=int(ok.sum()), area_km2=float(w.sum()),
        frac_armadilha_fria=float(w[tm[ok] < T_ARMADILHA_FRIA_K].sum() / w.sum()),
        area_armadilha_fria_km2=float(w[tm[ok] < T_ARMADILHA_FRIA_K].sum()),
    )


def descricao_prp():
    """Texto oficial que explica como o PRP calcula temp_avg (vai para o relatório)."""
    try:
        x = requests.get(PRP_URL + ".xml", timeout=60).text
        m = re.search(r"<name>temp_avg</name>.*?<description>(.*?)</description>", x, re.S)
        return re.sub(r"\s+", " ", m.group(1)).strip() if m else None
    except Exception:
        return None


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--raw", default="raw")
    ap.add_argument("--saida", default="data")
    ap.add_argument("--sem-pesados", action="store_true", help="não baixa GCP nem PRP (temperatura fica null)")
    a = ap.parse_args()
    raw = Path(a.raw) / "lua"
    saida = Path(a.saida)

    print("1/3 LOLA (altitude)")
    lbl = c.baixar(LOLA_URL + ".lbl", raw / "ldem_16.lbl")
    img = c.baixar(LOLA_URL + ".img", raw / "ldem_16.img")
    e = c.ler_etiqueta_pds3(lbl)
    L, C, ppd = int(e["LINES"]), int(e["LINE_SAMPLES"]), c.numero(e["MAP_RESOLUTION"])
    assert (e["SAMPLE_TYPE"], e["SAMPLE_BITS"], e["UNIT"]) == ("LSB_INTEGER", "16", "METER"), e
    esc = c.numero(e["SCALING_FACTOR"])
    lola = c.carregar_grade_cilindrica(img, L, C, "<i2").astype(float) * esc    # altura (m) sobre esfera de 1737,4 km
    lola_args = dict(produto=f'{e["DATA_SET_ID"]} (ldem_16, versão do produto {e["PRODUCT_VERSION_ID"]})',
                     instrumento="LRO/LOLA", versao=e["PRODUCT_VERSION_ID"],
                     periodo=f'{e["START_TIME"][:10]} a {e["STOP_TIME"][:10]}',
                     resolucao=f"{ppd:g} pixels/grau (~{c.numero(e['MAP_SCALE']):.0f} m/pixel)", link=LOLA_URL + ".img")

    # Para a declividade, o LOLA é reduzido com blocos de 2x2 (16 -> 8 pixels/grau, ~3,8 km por pixel): é a mesma escala
    # do MOLA em Marte (~3,7 km) e da Terra (blocos de 4x4 de 30" = ~3,7 km). A declividade depende do tamanho do pixel.
    FATOR_BASE_LUA = 2
    lola_base = c.reduzir_grade(lola, FATOR_BASE_LUA)
    ppd_base = ppd / FATOR_BASE_LUA

    print("2/3 Diviner CF (composição)")
    clbl = c.baixar(CF_URL + ".lbl", raw / "dgdr_nen_cf_clc_cyl_032_img.lbl")
    cimg = c.baixar(CF_URL + ".img", raw / "dgdr_nen_cf_clc_cyl_032_img.img")
    ce = c.ler_etiqueta_pds3(clbl)
    CL, CC, cppd = int(ce["LINES"]), int(ce["LINE_SAMPLES"]), c.numero(ce["MAP_RESOLUTION"])
    assert (ce["SAMPLE_TYPE"], ce["SAMPLE_BITS"]) == ("LSB_INTEGER", "16") and c.numero(ce["OFFSET"]) == 0, ce
    cf_raw = c.carregar_grade_cilindrica(cimg, CL, CC, "<i2")
    missing = int(c.numero(ce["MISSING_CONSTANT"]))
    cf = np.where(cf_raw == missing, np.nan, cf_raw * c.numero(ce["SCALING_FACTOR"]))   # micrômetros
    cf_lat_max = c.numero(ce["MAXIMUM_LATITUDE"])
    cf_args = dict(produto=f'{ce["DATA_SET_ID"]} (dgdr_nen_cf_clc_cyl_032, "Normalized equatorial noon CF", {ce["PRODUCT_VERSION_ID"]})',
                   instrumento="LRO/Diviner", versao=ce["PRODUCT_VERSION_ID"],
                   periodo=f'{ce["START_TIME"][:10]} a {ce["STOP_TIME"][:10]}',
                   resolucao=f"{cppd:g} pixels/grau, só entre {-cf_lat_max:g}° e {cf_lat_max:g}° de latitude",
                   link=CF_URL + ".img")

    print("3/3 Diviner temperatura")
    prp_txt = descricao_prp() if not a.sem_pesados else None

    locais_saida = []
    for id_, nome, lat0, lon0 in LOCAIS:
        print(f"  - {nome}")
        # Relevo
        s = c.estatisticas_janela(lola, 90.0, 0.0, ppd, lat0, lon0)
        if s["n_pixels"]:
            decl = c.declividade_media_graus(s["_sub"], s["_lat"], s["_dentro"], ppd, RAIO_LUA_M)
            relevo = c.campo(s["desvio"], unidade="m (desvio padrão da elevação na janela)",
                             metodo=f"Círculo de {c.RAIO_JANELA_GRAUS:g}° de raio; {s['n_pixels']} pixels.", **lola_args)
        else:
            decl = None
            relevo = c.campo(None, unidade="m", motivo_nulo="Sem pixels válidos na janela.", **lola_args)

        sb = c.estatisticas_janela(lola_base, 90.0, 0.0, ppd_base, lat0, lon0)
        decl_base = (c.declividade_media_graus(sb["_sub"], sb["_lat"], sb["_dentro"], ppd_base, RAIO_LUA_M)
                     if sb["n_pixels"] else None)
        declividade = c.campo(
            decl_base, unidade="graus (declividade média na escala de ~3,8 km)",
            metodo=f"Gradiente do LOLA depois de juntar blocos de 2x2 pixels (de {ppd:g} para {ppd_base:g} pixels/grau, "
                   f"~3,8 km por pixel) dentro do círculo de {c.RAIO_JANELA_GRAUS:g}° de raio, sem a borda de 1 pixel. "
                   "Mesma escala usada em Marte (MOLA) e na Terra (blocos de 4x4 de 30\").",
            motivo_nulo=None if decl_base is not None else "Sem pixels válidos na janela.", **lola_args)

        # Geologia (CF)
        if abs(lat0) + c.RAIO_JANELA_GRAUS <= cf_lat_max:
            sc = c.estatisticas_janela(cf, cf_lat_max, 0.0, cppd, lat0, lon0)
            cf_val, cf_desv, cf_n = sc["media"], sc["desvio"], sc["n_pixels"]
        else:
            cf_val = cf_desv = cf_n = None
        geologia = c.campo(
            cf_val, unidade="µm (posição do Christiansen Feature)", **cf_args,
            metodo=None if cf_val is None else f"Média na janela de {cf_n} pixels; desvio {cf_desv:.3f} µm.",
            motivo_nulo=None if cf_val is not None else
            f"O mapa CF do Diviner só cobre ±{cf_lat_max:g}° de latitude; este local está fora (ou os pixels são inválidos).")

        # Temperatura e gelo
        t = None
        fonte_t = None
        if not a.sem_pesados:
            if abs(lat0) >= LIMITE_POLAR:
                if lat0 < 0:
                    t = temperatura_prp(lat0, lon0, raw)
                    fonte_t = "PRP"
            else:
                t = temperatura_gcp(lat0, lon0, raw)
                fonte_t = "GCP"
        if t and t.get("media") is not None and fonte_t == "GCP":
            temp = c.campo(
                t["media"], unidade="K (média ao longo do dia lunar)",
                produto="LRO-L-DLRE-5-GCP-V1.0 (global_cumul_avg_cyl, coluna tbol, versão do arquivo 002)",
                instrumento="LRO/Diviner", versao="002 (arquivo) / produto GCP V1.0",
                periodo="2009-07-05 a 2015-04-01", resolucao="0,5° de lat/lon e 0,25 h de hora local",
                link=GCP_URL.format(faixa=t["faixa"]) + ".tab",
                metodo=f"Curva do dia lunar com {t['n_horas_validas']} das {t['n_horas']} faixas de hora local com dado "
                       f"({t['n_tiles']} tiles de 0,5°); faixas sem dado interpoladas linearmente (nenhum buraco > "
                       f"{MAX_LACUNA_HORAS:g} h), depois média das {t['n_horas']} faixas. É média das temperaturas "
                       "bolométricas ao longo da hora local. Máximo e mínimo são valores observados, sem interpolação.",
                maximo_K=round(t["maximo"], 2), minimo_K=round(t["minimo"], 2))
            gelo_v = t["frac_armadilha_fria"]
            gelo = c.campo(
                gelo_v, unidade="fração da área com temperatura máxima < 110 K",
                produto="LRO-L-DLRE-5-GCP-V1.0 (derivado do mesmo GCP)", instrumento="LRO/Diviner", versao="002",
                periodo="2009-07-05 a 2015-04-01", resolucao="0,5° (~15 km): armadilhas frias menores não são resolvidas",
                link=GCP_URL.format(faixa=t["faixa"]) + ".tab",
                metodo="Fração dos tiles cujo máximo diário (média sobre o período) é < 110 K. Zero aqui significa 'nenhuma "
                       "armadilha fria resolvida nesta resolução', e não prova que não existam menores.")
        elif t and t.get("media") is not None and fonte_t == "PRP":
            temp = c.campo(
                t["media"], unidade="K (média anual, ponderada por área)",
                produto="LRO-L-DLRE-5-PRP-V2.0 (dlre_prp_south, versão do produto 2)",
                instrumento="LRO/Diviner", versao="2", periodo="derivado de dados de 2009-2016 (ver descrição oficial)",
                resolucao="malha triangular (2.880.000 triângulos no polo sul)",
                link=PRP_URL + ".tab",
                metodo="Média ponderada pela área dos triângulos. Descrição oficial do campo temp_avg: "
                       f"{prp_txt or '(não obtida)'}",
                maximo_K=round(t["maximo"], 2), temp_max_media_K=round(t["maximo_medio"], 2),
                papel="oficial (valor derivado/modelado pela equipe Diviner, não medida direta)")
            gelo = c.campo(
                t["frac_armadilha_fria"], unidade="fração da área com temperatura máxima anual < 110 K",
                produto="LRO-L-DLRE-5-PRP-V2.0 (campo temp_max)", instrumento="LRO/Diviner", versao="2",
                periodo="ver PRP", resolucao="malha triangular (2.880.000 triângulos no polo sul)",
                link=PRP_URL + ".tab",
                metodo=f"Área com temp_max < {T_ARMADILHA_FRIA_K:g} K dividida pela área total: "
                       f"{t['area_armadilha_fria_km2']:.0f} km² de {t['area_km2']:.0f} km². "
                       "LEND (supressão de nêutrons) NÃO foi usado; ver motivo no relatório.")
        else:
            motivo = ("Download pesado desativado (--sem-pesados)." if a.sem_pesados else
                      "Sem dado válido de temperatura para este local nas tabelas Diviner usadas"
                      + (f" ({t['motivo']})." if t and t.get("motivo") else "."))
            temp = nulo("K", motivo)
            gelo = nulo("fração", motivo)

        # Amplitude diurna: máximo - mínimo da curva do dia lunar (só onde existe o GCP, que cobre o dia todo)
        if t and t.get("media") is not None and fonte_t == "GCP":
            amp_d = c.campo(
                t["maximo"] - t["minimo"], unidade="K (máximo - mínimo ao longo do dia lunar)",
                produto="LRO-L-DLRE-5-GCP-V1.0 (derivado do mesmo GCP)", instrumento="LRO/Diviner", versao="002",
                periodo="2009-07-05 a 2015-04-01", resolucao="0,5° de lat/lon e 0,25 h de hora local",
                link=GCP_URL.format(faixa=t["faixa"]) + ".tab",
                metodo="Maior menos menor valor da curva de temperatura bolométrica média da janela, ao longo das faixas de "
                       "hora local (as mesmas usadas na temperatura média). A Terra usa dia - noite do MODIS (aproximação).")
        else:
            amp_d = nulo("K", "O Diviner dá a temperatura por hora do dia lunar só no GCP (entre 80°S e 80°N). Perto do polo, "
                              "o PRP traz só a média e o máximo do ano, sem a curva do dia, então não dá para calcular a "
                              "amplitude diurna. Não foi estimada." if fonte_t != "GCP" else
                         "Sem dado válido de temperatura para este local.")

        locais_saida.append(dict(
            id=id_, nome=nome, lat=lat0, lon_leste=lon0, coord_verificada=True, coord_fonte=COORD_FONTE,
            janela=f"círculo de {c.RAIO_JANELA_GRAUS:g}° de raio",
            aspectos=dict(
                temperatura=temp, relevo=relevo, gelo=gelo, geologia=geologia,
                declividade=declividade, amplitude_diurna=amp_d,
                vento=c.campo(None, produto="-", instrumento="-", versao="-", periodo="-", resolucao="-", link="-",
                              unidade="m/s", motivo_nulo=NAO_SE_APLICA, nao_se_aplica=True)),
            extras=dict(
                elevacao_media_m=None if not s["n_pixels"] else round(s["media"], 1),
                declividade_media_graus=None if decl is None else round(decl, 3),
                temperatura_fonte=fonte_t,
                lend="Não usado: nenhum mapa derivado de LEND verificado no PDS."),
        ))

    c.salvar_json(dict(
        corpo="Lua", gerado_por="scripts/03_lua.py",
        convencoes="Longitude em graus Leste. Altura em metros sobre a esfera de referência de 1737,4 km. Temperaturas em K.",
        locais=locais_saida), saida / "moon_sites.json")


if __name__ == "__main__":
    main()
