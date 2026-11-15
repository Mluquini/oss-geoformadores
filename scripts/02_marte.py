#!/usr/bin/env python3
"""
02_marte.py: gera data/mars_sites.json com dados REAIS (PDS Geosciences, NASA).

O que ele faz, em português simples:
  1. Baixa o mapa de altitude de Marte (MGS/MOLA) e o mapa de água no solo
     (Mars Odyssey/GRS). Não precisa de senha: os dois são públicos.
  2. Para cada um dos 6 locais, mede os pixels num círculo de 1 grau de raio
     ao redor do local (janela de ~2 graus).
  3. Se existir data/mars_rovers.json (rode antes o scripts/02b_marte_rovers.py), junta a temperatura do solo e a
     amplitude dia/noite medidas NO LOCAL pelos rovers (Gale: Curiosity/REMS; Jezero: Perseverance/MEDA). Os outros
     locais não têm esse dado: ficam null.
  4. Salva tudo no JSON. O que NÃO conseguimos medir fica null, com o motivo.

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
# Escala comum da declividade (pixels de ~3,7 km): o MOLA de 16 pixels/grau já está nela (1° = 59,3 km). Terra e Lua
# são reduzidas para essa mesma escala nos scripts 01 e 03.

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
        "Atmospheres do PDS (não verificado). Só Gale (Curiosity/REMS) e Jezero (Perseverance/MEDA) têm temperatura medida no "
        "local por rover (scripts/02b_marte_rovers.py); nos outros locais não há medida."),
    "geologia": (
        "Não encontrei no PDS um mapa global pronto de índice de composição silicática do MGS/TES. "
        "O Si do GRS (Odyssey) é abundância de silício, uma medida diferente e não comparável com o "
        "índice de emissividade do ASTER nem com o Christiansen Feature do Diviner."),
    "amplitude_diurna": (
        "Não encontrei no PDS um produto global pronto de temperatura de superfície de Marte por hora do dia "
        "(TES/MCS): o que existe são os dados por observação (mgs-m-tes-3-tsdr-v2), enormes e sem agregação em mapa, "
        "e o mapa de inércia térmica, que NÃO é temperatura. Só Gale e Jezero têm essa amplitude, medida no local pelos "
        "rovers; nos outros locais ela fica de fora (não foi estimada)."),
    "vento": (
        "Não existe medição orbital global direta de vento na superfície de Marte. Opacidade de "
        "poeira (TES/MCS) seria um proxy, mas não encontrei um mapa global pronto no PDS "
        "(não verificado)."),
}


def aplicar_rovers(locais, saida):
    """Preenche temperatura e amplitude dia/noite de Gale e Jezero com o resumo dos rovers (data/mars_rovers.json)."""
    import json
    arq = Path(saida) / "mars_rovers.json"
    if not arq.exists():
        print("  AVISO: data/mars_rovers.json não existe; temperatura e amplitude dia/noite de Marte ficam null "
              "(rode scripts/02b_marte_rovers.py).", file=sys.stderr)
        return
    rov = json.load(open(arq, encoding="utf-8"))["locais"]
    for l in locais:
        r = rov.get(l["id"])
        if not r:
            continue
        comum = dict(
            produto=r["produto"], instrumento=r["instrumento"], versao="-", periodo=r["periodo"],
            resolucao="1 medida por segundo, resumida em 24 faixas de hora local; amostra de "
                      f"{len(r['sols_com_curva'])} sols com curva completa (de {len(r['sols_amostrados'])} sols sorteados)",
            link=r["link"], papel="medida no local por rover (um ponto, não uma janela de 2°; média de sols amostrados)")
        a = l["aspectos"]
        a["temperatura"] = c.campo(
            r["temperatura_media_K"], unidade="K (temperatura do solo, média das 24 faixas de hora e dos sols amostrados)",
            metodo="Temperatura do SOLO medida pelo rover (REMS: sensor GTS, temperatura de brilho; MEDA: sensor TIRS, a partir do "
                   "infravermelho térmico supondo emissividade 1, o que subestima um pouco). Média dos sols amostrados; "
                   "é uma estimativa da média anual, não uma média de todos os sols.",
            incerteza_1sigma=round(r["temperatura_media_K_desvio_entre_sols"], 2), **comum)
        a["amplitude_diurna"] = c.campo(
            r["amplitude_diurna_K"], unidade="K (máximo - mínimo da curva do dia, média dos sols amostrados)",
            metodo="Máximo menos mínimo da curva média por hora local do sol, médio entre os sols amostrados.",
            incerteza_1sigma=round(r["amplitude_diurna_K_desvio_entre_sols"], 2), **comum)
        if r.get("vento_ms") is not None:
            ate = max(r["sols_com_vento"]); de = min(r["sols_com_vento"])
            a["vento"]["motivo_nulo"] = (
                f"O rover mediu vento, mas só em {len(r['sols_com_vento'])} dos sols amostrados (sols {de} a {ate}, o vento derivado "
                "deixa de existir depois), a ~1,5 m de altura (o vento da Terra no site vem do MERRA-2 a 50-70 m). A média "
                f"({r['vento_ms']:.1f} m/s) não cobre o ano todo e por isso NÃO entra no cálculo. Fica em extras.vento_rover_ms.")
            l["extras"]["vento_rover_ms"] = round(r["vento_ms"], 2)
        else:
            a["vento"]["motivo_nulo"] = r["vento_motivo_nulo"] + " Não entra no cálculo."


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
        decl_campo = c.campo(
            decl, unidade="graus (declividade média na escala de ~3,7 km)",
            metodo=f"Gradiente do MOLA de 16 pixels/grau (~3,7 km por pixel) dentro do círculo de {c.RAIO_JANELA_GRAUS:g}° "
                   "de raio, sem a borda de 1 pixel. Mesma escala usada na Terra (blocos de 4x4 pixels de 30\") e na Lua "
                   "(blocos de 2x2 do LOLA de 16 pixels/grau), porque a declividade muda com o tamanho do pixel.",
            motivo_nulo=None if decl is not None else "Sem pixels válidos na janela.", **mola_args)
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
                declividade=decl_campo,
                amplitude_diurna=c.campo(None, produto="-", instrumento="-", versao="-", periodo="-", resolucao="-",
                                         link="-", unidade="K", motivo_nulo=MOTIVOS_NULOS["amplitude_diurna"]),
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

    aplicar_rovers(locais_saida, saida)
    c.salvar_json(dict(
        corpo="Marte",
        gerado_por="scripts/02_marte.py",
        convencoes="Longitude em graus Leste (0-360). Elevação em metros acima do areoide MOLA.",
        locais=locais_saida,
    ), saida / "mars_sites.json")


if __name__ == "__main__":
    main()
