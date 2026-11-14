#!/usr/bin/env python3
"""
02_marte.py: gera data/mars_sites.json com dados REAIS (PDS Geosciences, NASA).

O que ele faz, em português simples:
  1. Baixa o mapa de altitude de Marte (MGS/MOLA) e o mapa de água no solo
     (Mars Odyssey/GRS). Não precisa de senha: os dois são públicos.
  2. Para cada um dos 6 locais, mede os pixels num círculo de 1 grau de raio
     ao redor do local (janela de ~2 graus).
  3. Salva tudo no JSON. O que NÃO conseguimos medir fica null, com o motivo.

Como rodar (pelo caminho do script, passando as pastas):
    python scripts/02_marte.py --raw raw --saida data
"""
import argparse
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import comum as c  # noqa: E402

PDS = "https://pds-geosciences.wustl.edu"
MOLA_URL = f"{PDS}/mgs/mgs-m-mola-5-megdr-l3-v1/mgsl_300x/meg016/megt90n000eb"
GRS_URL = f"{PDS}/ody/ody-m-grs-5-elements-v1/odgm_xxxx/data/smoothed/h2o_sr_5x5"
RAIO_MARTE_M = 3_396_000.0

# Centros OFICIAIS (graus; lon em Leste 0-360), do Gazetteer da IAU (campos center_lat / center_lon).
# Atenção: "Meridiani Planum" é o centro da planície inteira (~1000 km), não o ponto de pouso do Opportunity.
COORD_FONTE = ("Gazetteer of Planetary Nomenclature da IAU (USGS Astrogeology), campos center_lat/center_lon, "
               "arquivo MARS_nomenclature_center_pts baixado em 2026-11-14")
LOCAIS = [
    ("jezero",    "Cratera Jezero",   18.4082,   77.6873),
    ("gale",      "Cratera Gale",     -5.3672,  137.8110),
    ("meridiani", "Meridiani Planum", -0.0400,  356.8600),
    ("valles",    "Valles Marineris", -14.0059, 301.4123),
    ("hellas",    "Bacia de Hellas",  -42.4301,  70.5025),
    ("utopia",    "Utopia Planitia",  46.7363,  117.5168),
]

MOTIVOS_NULOS = {
    "temperatura": (
        "Não encontrei no PDS um mapa global de temperatura de superfície de Marte (TES ou MCS) "
        "já agregado. O que existe para o MGS/TES é inércia térmica (mgs-m-tes-5-timap-v1), que "
        "NÃO é temperatura, e os dados de temperatura por observação (mgs-m-tes-3-tsdr-v2) são "
        "enormes e exigem um processamento próprio. Candidato a investigar: MRO/MCS no nó "
        "Atmospheres do PDS (não verificado)."),
    "geologia": (
        "Não encontrei no PDS um mapa global pronto de índice de composição silicática do MGS/TES. "
        "O Si do GRS (Odyssey) é abundância de silício, uma medida diferente e não comparável com o "
        "índice de emissividade do ASTER nem com o Christiansen Feature do Diviner."),
    "vento": (
        "Não existe medição orbital global direta de vento na superfície de Marte. Opacidade de "
        "poeira (TES/MCS) seria um proxy, mas não encontrei um mapa global pronto no PDS "
        "(não verificado)."),
}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--raw", default="raw", help="pasta dos downloads brutos")
    ap.add_argument("--saida", default="data", help="pasta dos JSONs finais")
    a = ap.parse_args()
    raw = Path(a.raw) / "marte"
    saida = Path(a.saida)

    # ---------------- MOLA ----------------
    print("1/2 MOLA (altitude)")
    lbl = c.baixar(MOLA_URL + ".lbl", raw / "megt90n000eb.lbl")
    img = c.baixar(MOLA_URL + ".img", raw / "megt90n000eb.img")
    et = c.ler_etiqueta_pds3(lbl)
    linhas, colunas = int(et["LINES"]), int(et["LINE_SAMPLES"])
    ppd = c.numero(et["MAP_RESOLUTION"])
    assert (et["SAMPLE_TYPE"], et["SAMPLE_BITS"], et["UNIT"]) == ("MSB_INTEGER", "16", "METER"), et
    mola = c.carregar_grade_cilindrica(img, linhas, colunas, ">i2").astype(float)  # metros acima do areoide
    mola_id = f'{et["DATA_SET_ID"]} (arquivo megt90n000eb, versão do produto {et["PRODUCT_VERSION_ID"]})'
    mola_periodo = f'{et["START_TIME"][:10]} a {et["STOP_TIME"][:10]}'
    mola_res = f"{ppd:g} pixels/grau (~{c.numero(et['MAP_SCALE']):.2f} km/pixel no equador)"

    # ---------------- GRS ----------------
    print("2/2 GRS (água no solo)")
    glbl = c.baixar(GRS_URL + ".lbl", raw / "h2o_sr_5x5.lbl")
    gtab = c.baixar(GRS_URL + ".tab", raw / "h2o_sr_5x5.tab")
    ge = c.ler_etiqueta_pds3(glbl)
    tab = np.array([l.split() for l in Path(gtab).read_text().splitlines() if l.strip()], float)
    assert tab.shape == (2592, 5), tab.shape
    lat_b, lon_b, conc, sigma = tab[:, 0], tab[:, 1], tab[:, 2], tab[:, 3]
    NA = 9999.999

    locais_saida = []
    for id_, nome, lat0, lon0 in LOCAIS:
        print(f"  - {nome}")
        e = c.estatisticas_janela(mola, 90.0, 0.0, ppd, lat0, lon0)
        if e["n_pixels"] == 0:
            relevo_media = relevo_desv = decl = None
        else:
            relevo_media, relevo_desv = e["media"], e["desvio"]
            decl = c.declividade_media_graus(e["_sub"], e["_lat"], e["_dentro"], ppd, RAIO_MARTE_M)

        # GRS: bin de 5 graus mais próximo do local (a resolução do GRS é ~300 km)
        d = c.distancia_angular_graus(lat_b, lon_b, lat0, lon0)
        k = int(np.argmin(d))
        h2o = None if conc[k] == NA else float(conc[k])
        h2o_sig = None if sigma[k] == NA else float(sigma[k])

        mola_args = dict(produto=mola_id, instrumento="MGS/MOLA", versao=et["PRODUCT_VERSION_ID"],
                         periodo=mola_periodo, resolucao=mola_res,
                         link=MOLA_URL + ".img")
        rel_metodo = f"Círculo de {c.RAIO_JANELA_GRAUS:g}° de raio ao redor do centro; {e['n_pixels']} pixels."
        locais_saida.append(dict(
            id=id_, nome=nome, lat=lat0, lon_leste=lon0, coord_verificada=True, coord_fonte=COORD_FONTE,
            janela=f"círculo de {c.RAIO_JANELA_GRAUS:g}° de raio",
            aspectos=dict(
                temperatura=c.campo(None, produto="-", instrumento="-", versao="-", periodo="-", resolucao="-",
                                    link="-", unidade="K", motivo_nulo=MOTIVOS_NULOS["temperatura"]),
                relevo=c.campo(relevo_desv, unidade="m (desvio padrão da elevação na janela)", metodo=rel_metodo,
                               motivo_nulo=None if relevo_desv is not None else "Sem pixels válidos na janela.",
                               **mola_args),
                gelo=c.campo(h2o, unidade="% em massa (água equivalente, H2O)",
                             produto=f'{ge["DATA_SET_ID"]} (arquivo h2o_sr_5x5, v{ge["PRODUCT_VERSION_ID"]})',
                             instrumento="Mars Odyssey/GRS", versao=ge["PRODUCT_VERSION_ID"],
                             periodo=f'{ge["START_TIME"][:10]} a {ge["STOP_TIME"][:10]}',
                             resolucao="bins de 5° (suavizado com média móvel de 10°; pegada do GRS ~300 km)",
                             link=GRS_URL + ".tab",
                             metodo=f"Bin de 5° mais próximo do centro (centro do bin: lat {lat_b[k]:g}, lon {lon_b[k]:g}). "
                                    "Concentração em camada superficial de ~1 m, não é gelo exposto.",
                             incerteza_1sigma=h2o_sig,
                             motivo_nulo=None if h2o is not None else
                             "O produto GRS marca este bin como 'não aplicável' (9999.999)."),
                geologia=c.campo(None, produto="-", instrumento="-", versao="-", periodo="-", resolucao="-",
                                 link="-", unidade="-", motivo_nulo=MOTIVOS_NULOS["geologia"]),
                vento=c.campo(None, produto="-", instrumento="-", versao="-", periodo="-", resolucao="-",
                              link="-", unidade="m/s", motivo_nulo=MOTIVOS_NULOS["vento"]),
            ),
            extras=dict(
                elevacao_media_m=None if relevo_media is None else round(relevo_media, 1),
                elevacao_minima_m=None if e["n_pixels"] == 0 else round(e["minimo"], 1),
                elevacao_maxima_m=None if e["n_pixels"] == 0 else round(e["maximo"], 1),
                declividade_media_graus=None if decl is None else round(decl, 3),
                n_pixels_mola=e["n_pixels"],
            ),
        ))

    c.salvar_json(dict(
        corpo="Marte",
        gerado_por="scripts/02_marte.py",
        convencoes="Longitude em graus Leste (0-360). Elevação em metros acima do areoide MOLA.",
        locais=locais_saida,
    ), saida / "mars_sites.json")


if __name__ == "__main__":
    main()
