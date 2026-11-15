#!/usr/bin/env python3
"""
07_verificar_dados.py: confere se os dados do site são VERDADEIROS e se vêm da NASA.

Ele NÃO reaproveita o código dos scripts 01 a 05. De propósito: reescreve as contas do zero, lendo os arquivos
brutos de raw/, para pegar erros de leitura (como as latitudes invertidas que já tivemos) que o próprio script
que gerou o dado não enxergaria.

O que confere, em português simples:
  1. ORIGEM       os produtos existem nos catálogos oficiais da NASA, com versão e DOI, e os links respondem.
  2. NADA FALSO   nada de exemplo ou estimado em tudo o que o site carrega; sem NaN; valores fisicamente possíveis;
                  os arquivos do site batem com os JSONs do pipeline (ninguém editou número à mão).
  3. RECÁLCULO    relê os arquivos brutos (MODIS, SRTM/ETOPO, MERRA-2, MOLA, GRS, LOLA, Diviner) e recalcula cada
                  número, comparando com o JSON. Na Terra confere TODAS as células.
  4. DECODIFICAÇÃO pontos famosos: Olympus Mons, Hellas, o ponto mais fundo da Lua, Mauna Kea, Dallol, Everest...
  5. FATOS        números das frases do site (gravidade, pressão, temperatura lunar) contra as fichas da NASA.

Como rodar (precisa dos arquivos de raw/ e do ambiente com pyhdf, netCDF4, pandas):
    .venv/bin/python scripts/07_verificar_dados.py
    .venv/bin/python scripts/07_verificar_dados.py --sem-rede      # pula o que precisa de internet
O resultado fica em relatorio/verificacao_dados.md. O código de saída é 1 se alguma verificação FALHAR.

O que isto NÃO prova: que os produtos da NASA em si estão certos (confiamos neles), nem frases de interpretação.
"""
import argparse
import glob
import json
import math
import re
import sys
import time
import urllib.error
import urllib.request
import zipfile
from datetime import date
from pathlib import Path

import warnings

import numpy as np

warnings.filterwarnings("ignore", category=RuntimeWarning)   # pixels sem dado viram NaN de propósito

RAIZ = Path(__file__).resolve().parent.parent
UA = {"User-Agent": "GloboDeAnalogos-projeto-escolar/1.0"}
RESULTADOS = []      # (secao, nome, status, detalhe)
OK, FALHA, AVISO, PULADO = "OK", "FALHA", "AVISO", "NÃO VERIFICADO"


def reg(secao, nome, status, detalhe=""):
    RESULTADOS.append((secao, nome, status, detalhe))
    marca = {"OK": "  ok   ", "FALHA": "  FALHA", "AVISO": "  aviso", "NÃO VERIFICADO": "  ?     "}[status]
    print(f"{marca} [{secao}] {nome}" + (f"  ->  {detalhe}" if detalhe else ""))


def tentar(secao, nome, fn):
    """Roda uma verificação; se der exceção, registra como FALHA (nunca esconde um problema)."""
    try:
        fn()
    except FileNotFoundError as e:
        reg(secao, nome, PULADO, f"arquivo ausente: {Path(str(e.filename)).name if e.filename else e}")
    except ImportError as e:
        reg(secao, nome, PULADO, f"biblioteca ausente: {e.name}")
    except AssertionError as e:
        reg(secao, nome, FALHA, str(e))
    except Exception as e:                                   # noqa: BLE001
        reg(secao, nome, FALHA, f"erro ao verificar: {type(e).__name__}: {e}")


# ---------------------------------------------------------------------
# utilidades
# ---------------------------------------------------------------------
def ler_js(caminho, variavel):
    t = Path(caminho).read_text(encoding="utf-8")
    t = "\n".join(l for l in t.splitlines() if not l.strip().startswith("//"))
    i = t.index("=", t.index(variavel)) + 1
    return json.loads(t[i:t.rindex(";")])


def haversine(lat1, lon1, lat2, lon2):
    """Distância em graus de arco (aceita arrays)."""
    p1, p2 = np.radians(lat1), np.radians(lat2)
    c = np.sin(p1) * np.sin(p2) + np.cos(p1) * np.cos(p2) * np.cos(np.radians(lon2 - lon1))
    return np.degrees(np.arccos(np.clip(c, -1, 1)))


def declividade_independente(z, lat_linhas, ppd, raio_corpo_m, bordas=False):
    """Inclinação (graus) pixel a pixel por diferenças centrais EXPLÍCITAS (não usa np.gradient, ao contrário do pipeline).
    z [lin, col] em metros (NaN = sem dado); lat_linhas = latitude do centro de cada linha. As bordas ficam NaN, a não ser
    com bordas=True (diferença unilateral, como o pipeline faz dentro de uma célula do ETOPO sem margem)."""
    dy = math.radians(1.0 / ppd) * raio_corpo_m
    dx = np.maximum(dy * np.cos(np.radians(lat_linhas))[:, None], 1e-6)
    gy = np.full(z.shape, np.nan); gx = np.full(z.shape, np.nan)
    gy[1:-1, :] = (z[2:, :] - z[:-2, :]) / (2 * dy)
    gx[:, 1:-1] = (z[:, 2:] - z[:, :-2]) / (2 * dx)
    if bordas:
        gy[0, :] = (z[1, :] - z[0, :]) / dy; gy[-1, :] = (z[-1, :] - z[-2, :]) / dy
        gx[:, 0] = (z[:, 1] - z[:, 0]) / dx[:, 0]; gx[:, -1] = (z[:, -1] - z[:, -2]) / dx[:, 0]
    return np.degrees(np.arctan(np.hypot(gy, gx)))


def media_por_blocos(z, lado):
    """Média de blocos lado x lado (sem NaN); recorta o que não completa um bloco."""
    n_l, n_c = (z.shape[0] // lado) * lado, (z.shape[1] // lado) * lado
    return z[:n_l, :n_c].reshape(n_l // lado, lado, n_c // lado, lado).mean(axis=(1, 3))


def http(url, metodo="HEAD", timeout=60):
    req = urllib.request.Request(url, headers=UA, method=metodo)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.status, r.read() if metodo == "GET" else b""


def comparar(nome_campo, esperados, obtidos, tol):
    """Compara duas listas (None = sem valor). Devolve (n_comparados, n_erros, maior_diferenca, exemplos)."""
    n = erros = 0
    maior = 0.0
    ex = []
    for chave, a, b in zip(range(len(esperados)), esperados, obtidos):
        n += 1
        if (a is None) != (b is None):
            erros += 1; ex.append((chave, a, b)); continue
        if a is None:
            continue
        d = abs(a - b)
        maior = max(maior, d)
        if d > tol:
            erros += 1; ex.append((chave, a, b))
    return n, erros, maior, ex[:3]


# ---------------------------------------------------------------------
# 1. ORIGEM
# ---------------------------------------------------------------------
PRODUTOS_NASA = [   # (short_name, versão, provedores aceitos no CMR, centro de dados)
    ("MOD11C3", "061", {"LPCLOUD"}, "NASA LP DAAC"),
    ("MOD10CM", "61", {"NSIDC_CPRD", "NSIDC_ECS"}, "NASA NSIDC DAAC"),
    ("SRTMGL30", "002", {"LPCLOUD"}, "NASA LP DAAC"),
    ("AG5KMMOH", "041", {"LPCLOUD"}, "NASA LP DAAC"),
    ("M2TMNXFLX", "5.12.4", {"GES_DISC"}, "NASA GES DISC"),
    ("M2TMNXAER", "5.12.4", {"GES_DISC"}, "NASA GES DISC"),
]


def sec1_origem(sem_rede, grid, marte, lua):
    S = "1 Origem"
    if sem_rede:
        reg(S, "Catálogo CMR e links", PULADO, "rodado com --sem-rede"); return
    dois = {}
    for short, versao, provedores, centro in PRODUTOS_NASA:
        def um(short=short, versao=versao, provedores=provedores, centro=centro):
            st, corpo = http(f"https://cmr.earthdata.nasa.gov/search/collections.umm_json?short_name={short}&version={versao}", "GET")
            itens = json.loads(corpo)["items"]
            assert itens, f"{short} v{versao} NÃO existe no catálogo CMR da NASA"
            prov = itens[0]["meta"]["provider-id"]
            doi = itens[0]["umm"].get("DOI", {}).get("DOI", "?")
            assert prov in provedores, f"{short}: provedor {prov} não é um DAAC da NASA esperado"
            dois[short] = doi
            reg(S, f"{short} v{versao} existe no catálogo oficial", OK, f"provedor {prov} ({centro}); DOI {doi}")
        tentar(S, f"{short} v{versao}", um)

    def doi_resolve():
        links = {a["link"] for a in grid["aspectos"].values() if str(a.get("link", "")).startswith("https://doi.org/")}
        ruins = []
        for url in sorted(links):
            try:
                st, _ = http(url);
                if st >= 400: ruins.append(url)
            except urllib.error.HTTPError as e:
                if e.code >= 400: ruins.append(f"{url} ({e.code})")
        assert not ruins, "DOIs que não resolvem: " + ", ".join(ruins)
        reg(S, f"{len(links)} DOIs do pipeline resolvem", OK, "doi.org respondeu para todos")
    tentar(S, "DOIs", doi_resolve)

    def pds_links():
        urls = set()
        for js in (marte, lua):
            for l in js["locais"]:
                for a in l["aspectos"].values():
                    if a.get("valor") is not None and str(a.get("link", "")).startswith("http"):
                        urls.add(a["link"])
        ruins = []
        for u in sorted(urls):
            try:
                http(u)
            except urllib.error.HTTPError as e:
                ruins.append(f"{u} ({e.code})")
        assert not ruins, "links de dados que não respondem: " + ", ".join(ruins)
        reg(S, f"{len(urls)} arquivos de dados do PDS respondem", OK, "servidor pds-geosciences.wustl.edu (PDS Geosciences Node)")
        st, corpo = http("https://pds-geosciences.wustl.edu/", "GET")
        txt = corpo.decode("utf-8", "ignore")
        assert "NASA" in txt, "a página do PDS Geosciences Node não menciona NASA"
        reg(S, "PDS Geosciences Node é um nó da NASA", OK, "a página oficial se identifica como NASA")
    tentar(S, "PDS", pds_links)

    def ids_nos_rotulos():
        esperados = {
            "raw/marte/megt90n000eb.lbl": "MGS-M-MOLA-5-MEGDR-L3-V1.0",
            "raw/marte/h2o_sr_5x5.lbl": "ODY-M-GRS-5-ELEMENTS-V1.0",
            "raw/lua/ldem_16.lbl": "LRO-L-LOLA-4-GDR-V1.0",
            "raw/lua/dgdr_nen_cf_clc_cyl_032_img.lbl": "LRO-L-DLRE-5-GDR-V1.0",
            "raw/lua/dlre_prp_south.lbl": "LRO-L-DLRE-5-PRP-V2.0",
            "raw/lua/gcp_00n10n.lbl": "LRO-L-DLRE-5-GCP-V1.0"}
        for rel, did in esperados.items():
            t = (RAIZ / rel).read_text(errors="ignore")
            assert did in t, f"{rel}: DATA_SET_ID esperado {did} não está no rótulo"
        reg(S, "Rótulos PDS dos arquivos brutos trazem os DATA_SET_ID da NASA", OK,
            "MOLA, GRS, LOLA, Diviner (CF, GCP, PRP): " + ", ".join(esperados.values()))
    tentar(S, "Rótulos PDS", ids_nos_rotulos)

    def nomes_dos_arquivos_brutos():
        padroes = {"raw/terra/MOD11C3": "MOD11C3.A2020", "raw/terra/MOD10CM": "MOD10CM.A2020",
                   "raw/terra/M2TMNXFLX": "MERRA2_4", "raw/terra/M2TMNXAER": "MERRA2_4"}
        for pasta, pref in padroes.items():
            arqs = sorted((RAIZ / pasta).glob("*"))
            assert len(arqs) == 12 and all(a.name.startswith(pref) for a in arqs), f"{pasta}: esperava 12 arquivos {pref}*, achei {len(arqs)}"
        reg(S, "Os arquivos brutos baixados têm os nomes oficiais dos produtos da NASA", OK, "12 meses de 2020 em cada produto mensal")
    tentar(S, "Arquivos brutos", nomes_dos_arquivos_brutos)


# ---------------------------------------------------------------------
# 2. NADA FALSO
# ---------------------------------------------------------------------
BUSCAS_WIKIDATA = {   # termos de busca no Wikidata (em inglês) para cada local da Terra
    "atacama": ["Atacama Desert"], "vales-secos": ["McMurdo Dry Valleys"], "lut": ["Dasht-e Lut", "Lut Desert"],
    "danakil": ["Danakil Depression", "Dallol"], "mauna-kea": ["Mauna Kea"], "holuhraun": ["Holuhraun"],
    "haughton": ["Haughton crater", "Devon Island"], "namibe": ["Namib Desert", "Namib"],
    "lanzarote": ["Lanzarote", "Cueva de los Verdes"], "lava-beds": ["Lava Beds National Monument"],
    "utah-mdrs": ["Mars Desert Research Station"], "svalbard": ["Bockfjorden", "Svalbard"],
}


def sec1_coordenadas(sem_rede):
    """Confere as coordenadas dos 12 locais da Terra (data/textos) contra uma fonte externa: o Wikidata (propriedade P625).
    Distância maior que 2° (uma célula) vira AVISO, não FALHA: o Wikidata é colaborativo e um 'lugar' pode ser uma área enorme."""
    S = "1 Origem"
    nome = "Coordenadas dos 12 locais da Terra x Wikidata"
    if sem_rede:
        reg(S, nome, PULADO, "rodado com --sem-rede"); return
    import urllib.parse
    sitios = ler_js(RAIZ / "data" / "textos" / "earth_sites.js", "EARTH_SITES")
    base = "https://www.wikidata.org/w/api.php?format=json&"

    import time

    def consulta(params):
        # O Wikidata limita pedidos seguidos (erro 429): vamos devagar e tentamos de novo com espera maior.
        for espera in (1.5, 6, 15, 30):
            time.sleep(espera if espera > 1.5 else 1.0)
            try:
                return json.loads(http(base + urllib.parse.urlencode(params), "GET", timeout=40)[1].decode("utf-8"))
            except urllib.error.HTTPError as e:
                if e.code not in (429, 503):
                    raise
        raise RuntimeError("Wikidata recusou os pedidos (limite de uso)")

    def coords_do_termo(termo):
        ids = [r["id"] for r in consulta({"action": "wbsearchentities", "search": termo, "language": "en", "limit": 6}).get("search", [])]
        if not ids:
            return []
        ents = consulta({"action": "wbgetentities", "ids": "|".join(ids), "props": "claims|labels", "languages": "en"}).get("entities", {})
        achados = []
        for e in ents.values():
            for c in e.get("claims", {}).get("P625", []):
                v = c.get("mainsnak", {}).get("datavalue", {}).get("value")
                if v:
                    achados.append((v["latitude"], v["longitude"], e.get("labels", {}).get("en", {}).get("value", e.get("id"))))
        return achados

    boas, ruins, sem = [], [], []
    for sit in sitios:
        melhor = None
        try:
            for termo in BUSCAS_WIKIDATA.get(sit["id"], [sit["nome"]["en"]]):
                for la, lo, rotulo in coords_do_termo(termo):
                    d = float(haversine(sit["lat"], sit["lon"], la, lo))
                    if melhor is None or d < melhor[0]:
                        melhor = (d, rotulo, la, lo)
        except Exception as e:                                           # noqa: BLE001
            sem.append(f"{sit['id']} (erro de rede: {type(e).__name__} {getattr(e, 'code', '')})"); continue
        if melhor is None:
            sem.append(f"{sit['id']} (nada no Wikidata)")
        elif melhor[0] > 2.0:
            ruins.append(f"{sit['id']}: {melhor[0]:.1f}° de '{melhor[1]}' ({melhor[2]:.2f}, {melhor[3]:.2f})")
        else:
            boas.append(f"{sit['id']} {melhor[0]:.2f}°")
    detalhe = f"{len(boas)} dentro de 2° ({'; '.join(boas)})"
    if ruins or sem:
        reg(S, nome, AVISO, detalhe + (" | LONGE: " + "; ".join(ruins) if ruins else "") + (" | sem conferência: " + "; ".join(sem) if sem else ""))
    else:
        reg(S, nome, OK, detalhe)


def sec3_rovers(marte, sem_rede):
    """Temperatura e amplitude dia/noite de Gale (REMS) e Jezero (MEDA): refeitas dos arquivos brutos dos rovers."""
    S = "3 Marte (rovers)"
    import csv

    def curva_e_stats(horas, temps):
        """24 faixas de hora (média por faixa, >= 30 medidas), interpolação circular; devolve (media, amplitude) ou None."""
        faixa = np.floor(np.asarray(horas)).astype(int) % 24
        temps = np.asarray(temps, float)
        curva = np.full(24, np.nan)
        for h in range(24):
            v = temps[(faixa == h) & np.isfinite(temps)]
            if v.size >= 30:
                curva[h] = v.mean()
        ok = np.isfinite(curva)
        if ok.sum() < 20:
            return None
        h = np.arange(24)
        interp = np.interp(h, np.r_[h[ok] - 24, h[ok], h[ok] + 24], np.r_[curva[ok], curva[ok], curva[ok]])
        return float(interp.mean()), float(np.nanmax(curva) - np.nanmin(curva))

    def rems():
        pasta = RAIZ / "raw" / "marte" / "rems"
        por_sol = {}
        for arq in sorted(pasta.glob("*.TAB")):
            hs, ts = [], []
            sol = None
            with open(arq, newline="") as f:
                for lin in csv.reader(f, skipinitialspace=True):
                    sol = sol or int(lin[1].strip()[:5])
                    bt = float(lin[7])
                    if bt > -900 and lin[10].strip() == "1111":
                        hh = lin[2].strip()
                        hs.append(int(hh[6:8]) + int(hh[9:11]) / 60.0); ts.append(bt)
            r = curva_e_stats(hs, ts)
            if r:
                por_sol[sol] = r
        return por_sol

    def meda():
        pasta = RAIZ / "raw" / "marte" / "meda"
        por_sol = {}
        sigma = 5.670374419e-8
        for arq in sorted(pasta.glob("WE__*DER_TIRS*.CSV")):
            sol = int(arq.name[4:8])
            hs, ts = [], []
            with open(arq, newline="") as f:
                for lin in csv.DictReader(f):
                    up = lin["UPWARD_LW_IRRADIANCE"]
                    if up and float(up) > 0 and lin["TIRS_GROUND_FOOTPRINT_NOT_IN_SHADOW"] == "1" and lin["ROVER_LOW_TILT"] == "1":
                        hh = lin["LTST"].strip()
                        hs.append(int(hh[5:7]) + int(hh[8:10]) / 60.0); ts.append((float(up) / sigma) ** 0.25)
            r = curva_e_stats(hs, ts)
            if r:
                por_sol[sol] = r
        return por_sol

    def conferir(nome, por_sol, id_):
        rov = json.load(open(RAIZ / "data" / "mars_rovers.json", encoding="utf-8"))["locais"][id_]
        assert sorted(por_sol) == sorted(rov["sols_com_curva"]), f"{nome}: sols com curva completa diferem: {sorted(por_sol)} x {sorted(rov['sols_com_curva'])}"
        media = float(np.mean([v[0] for v in por_sol.values()])); amp = float(np.mean([v[1] for v in por_sol.values()]))
        assert abs(media - rov["temperatura_media_K"]) < 0.01 and abs(amp - rov["amplitude_diurna_K"]) < 0.01, \
            f"{nome}: recalculado {media:.2f} K / {amp:.2f} K x JSON {rov['temperatura_media_K']:.2f} / {rov['amplitude_diurna_K']:.2f}"
        loc = next(l for l in marte["locais"] if l["id"] == id_)["aspectos"]
        assert abs(loc["temperatura"]["valor"] - media) < 1e-3 and abs(loc["amplitude_diurna"]["valor"] - amp) < 1e-3, f"{nome}: mars_sites.json difere do resumo"
        assert 205 <= media <= 245 and 55 <= amp <= 100, f"{nome}: fora do esperado para o solo marciano ({media:.0f} K; {amp:.0f} K de amplitude)"
        assert all(sol <= 668 for sol in por_sol) and len(por_sol) >= 12
        reg(S, f"{nome}: temperatura do solo e amplitude dia/noite refeitas dos arquivos brutos do rover", OK,
            f"{len(por_sol)} sols: média {media - 273.15:.1f} °C ({media:.1f} K), amplitude {amp:.1f} K; todos os sols de 1 a 668 (1º ano marciano)")
    tentar(S, "Gale (REMS)", lambda: conferir("Gale / Curiosity REMS", rems(), "gale"))
    tentar(S, "Jezero (MEDA)", lambda: conferir("Jezero / Perseverance MEDA", meda(), "jezero"))

    def so_dois():
        com = sorted(l["id"] for l in marte["locais"] if l["aspectos"]["temperatura"]["valor"] is not None)
        assert com == ["gale", "jezero"], f"só Gale e Jezero deveriam ter temperatura de rover: {com}"
        for l in marte["locais"]:
            if l["id"] not in com:
                assert l["aspectos"]["temperatura"]["valor"] is None and l["aspectos"]["temperatura"].get("motivo_nulo")
            assert l["aspectos"]["vento"]["valor"] is None and l["aspectos"]["vento"].get("motivo_nulo"), f"{l['id']}: o vento de Marte não deveria entrar"
        reg(S, "Nenhum valor de temperatura inventado para os outros 4 locais de Marte; vento de Marte fora do cálculo, com motivo", OK, "null com motivo escrito")
    tentar(S, "Só dois locais", so_dois)

    def links():
        if sem_rede:
            reg(S, "Arquivos dos rovers existem no PDS Atmospheres Node", PULADO, "rodado com --sem-rede"); return
        rov = json.load(open(RAIZ / "data" / "mars_rovers.json", encoding="utf-8"))["locais"]
        for k, r in rov.items():
            st, _ = http(r["link"], "HEAD", timeout=60)
            assert st == 200, f"{k}: {r['link']} respondeu {st}"
        reg(S, "Os arquivos dos rovers existem no PDS Atmospheres Node (NASA)", OK, "; ".join(r["link"] for r in rov.values()))
    tentar(S, "Links dos rovers", links)


def sec1_referencias(sem_rede):
    """Todos os links da seção "References" do site (index.html) respondem? (falha de rede ou bloqueio vira AVISO)."""
    S = "1 Origem"
    nome = "Links da seção Referências do site"
    html = (RAIZ / "index.html").read_text(encoding="utf-8")
    sec = html[html.index('id="referencias"'):html.index('<footer')]
    links = sorted(set(re.findall(r'href="(https?://[^"]+)"', sec)))
    assert len(links) >= 25, f"esperava ao menos 25 links na seção Referências, achei {len(links)}"
    locais = sorted(set(re.findall(r'href="(?!https?://)([^"#][^"]*)"', sec)))
    for l in locais:
        assert (RAIZ / l).exists(), f"link local da seção Referências não existe: {l}"
    if sem_rede:
        reg(S, nome, PULADO, "rodado com --sem-rede"); return
    def responde(u):
        """HEAD primeiro; alguns portais recusam HEAD ou o nosso User-Agent, então tenta de novo com GET e User-Agent de navegador."""
        try:
            return http(u, "HEAD", timeout=40)[0] < 400
        except Exception:                                                # noqa: BLE001
            req = urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=40) as r:
                return r.status < 400
    ruins = []
    for u in links:
        try:
            if not responde(u):
                ruins.append(u)
        except Exception as e:                                           # noqa: BLE001
            ruins.append(f"{u} ({type(e).__name__} {getattr(e, 'code', '')})")
    if ruins:
        reg(S, nome, AVISO, f"{len(links) - len(ruins)} de {len(links)} respondem; sem resposta: " + "; ".join(ruins))
    else:
        reg(S, nome, OK, f"{len(links)} links externos e {len(locais)} locais respondem")


def textos_i18n():
    """Lê o dicionário de i18n.js: { chave: (inglês, português) }. Os textos do site em cada idioma ficam nesse arquivo."""
    t = (RAIZ / "i18n.js").read_text(encoding="utf-8")
    padrao = re.compile(r'"([\w.]+)":\s*\[\s*"((?:[^"\\]|\\.)*)",\s*"((?:[^"\\]|\\.)*)"\s*\]', re.S)
    return {k: (en, pt) for k, en, pt in padrao.findall(t)}


def sec2_nada_falso(grid, marte, lua, sim, D, C):
    S = "2 Nada falso"

    def carregados():
        html = (RAIZ / "index.html").read_text(encoding="utf-8")
        locais = [s for s in re.findall(r'src="([^"]+)"', html) if not s.startswith("http")]
        proibidos = re.compile(r'"estimativa"|valores? de exemplo|data/exemplo')
        for rel in locais:
            t = (RAIZ / rel).read_text(encoding="utf-8")
            assert not proibidos.search(t), f"{rel} contém marca de dado de exemplo/estimado"
        reg(S, "Nada de exemplo ou estimado nos arquivos que o site carrega", OK, ", ".join(locais))
    tentar(S, "Arquivos carregados", carregados)

    def repositorio_limpo():
        ruins = []
        for p in RAIZ.rglob("*"):
            if not p.is_file() or any(x in p.parts for x in (".git", ".venv", "raw", "node_modules", "__pycache__")):
                continue
            if p.suffix in (".js", ".json", ".py", ".md", ".html") and p.name not in ("07_verificar_dados.py", "verificacao_dados.md"):
                t = p.read_text(encoding="utf-8", errors="ignore")
                if re.search(r'"estimativa"\s*:\s*true', t):
                    ruins.append(str(p.relative_to(RAIZ)))
        assert not ruins, "dados estimados (falsos) ainda no repositório: " + ", ".join(ruins)
        assert not (RAIZ / "data" / "exemplo").exists(), "a pasta data/exemplo não deveria mais existir"
        reg(S, 'Nenhum "estimativa": true em todo o repositório', OK, "a pasta data/exemplo não existe mais; data/textos guarda só textos, sem números")
    tentar(S, "Repositório limpo", repositorio_limpo)

    def textos_sem_numeros():
        # data/textos: só nome, país, descrição, "útil para testar", tipo e coordenadas aproximadas do local.
        permitido = {"id", "nome", "pais", "descricao", "util_para_testar", "tipo", "lat", "lon"}
        n = 0
        for arq, var in (("earth_sites.js", "EARTH_SITES"), ("mars_sites.js", "MARS_SITES"), ("moon_sites.js", "MOON_SITES")):
            for item in ler_js(RAIZ / "data" / "textos" / arq, var):
                extra = set(item) - permitido
                assert not extra, f"{arq}: {item['id']} tem campos que não são texto: {sorted(extra)}"
                if var != "EARTH_SITES":
                    assert not ({"lat", "lon", "tipo"} & set(item)), f"{arq}: {item['id']} não deveria ter coordenadas aqui"
                for campo in ("nome", "descricao"):
                    assert item[campo].get("pt") and item[campo].get("en"), f"{arq}: {item['id']} sem {campo} em pt e en"
                n += 1
        reg(S, "data/textos: só textos (pt e en), sem nenhum número de dado", OK, f"{n} locais")
    tentar(S, "Pasta de textos", textos_sem_numeros)

    def faixas_fisicas():
        lim = {"temp": (-95, 60), "amp": (0, 80), "rug": (0, 4000), "neve": (0, 1), "t0": (0, 1), "vento": (0, 40),
               "poeira": (0, 1000), "qi": (0.9, 1.2), "elev": (-500, 9000), "diu": (0, 60), "decl3": (0, 15)}
        cab = C["campos"]
        n = 0
        for linha in C["dados"]:
            for k, (lo, hi) in lim.items():
                v = linha[cab.index(k)]
                if v is None: continue
                assert isinstance(v, (int, float)) and math.isfinite(v), f"valor inválido em {k}: {v}"
                assert lo <= v <= hi, f"{k}={v} fora do possível ({lo}..{hi}) na célula {linha[0]},{linha[1]}"
                n += 1
        reg(S, "Valores da Terra dentro do fisicamente possível, sem NaN", OK, f"{n} valores conferidos em {len(C['dados'])} células")
    tentar(S, "Faixas físicas", faixas_fisicas)

    def site_bate_com_pipeline():
        cel = {(c["lat"], c["lon"]): c for c in grid["celulas"]}
        for t in D["terra"]:
            c = cel[(t["celula"]["lat"], t["celula"]["lon"])]
            v = t["valores"]
            pares = [(v["temperatura_C"], c["temperatura"]["media_anual_C"]), (v["amplitude_C"], c["temperatura"]["amplitude_C"]),
                     (v["elevacao_m"], c["relevo"]["elevacao_media_m"]), (v["rugosidade_m"], c["relevo"]["rugosidade_desvio_m"]),
                     (v["frac_neve"], c["gelo"]["frac_neve"]), (v["frac_T_abaixo_0C"], c["gelo"]["frac_T_abaixo_0C"]),
                     (v["vento_ms"], c["vento"]["vento_ms"]), (v["poeira_ugm3"], c["vento"]["poeira_ugm3"]),
                     (v["amplitude_diurna_C"], c["temperatura"]["amplitude_diurna_C"]),
                     (v["declividade_3km_graus"], c["relevo"]["declividade_3km_graus"])]
            for a, b in pares:
                assert a == b, f"{t['id']}: o site mostra {a} mas o pipeline tem {b}"
        reg(S, "Os 12 locais do site mostram exatamente o que o pipeline calculou", OK, "dados_reais.js == earth_grid.json")
        # células compactas (busca reversa)
        cab = C["campos"]; n = 0
        for linha in C["dados"]:
            c = cel[(linha[0], linha[1])]
            esperado = [c["temperatura"]["media_anual_C"], c["temperatura"]["amplitude_C"], c["relevo"]["elevacao_media_m"],
                        c["relevo"]["rugosidade_desvio_m"], c["gelo"]["frac_neve"], c["gelo"]["frac_T_abaixo_0C"],
                        c["vento"]["vento_ms"], c["vento"]["poeira_ugm3"], c["geologia"]["indice_quartzo"],
                        c["temperatura"]["amplitude_diurna_C"], c["relevo"]["declividade_3km_graus"]]
            obtido = [linha[cab.index(k)] for k in ("temp", "amp", "elev", "rug", "neve", "t0", "vento", "poeira", "qi", "diu", "decl3")]
            # tolerância = o arredondamento que o celulas.js aplica (temp/amp 0,1; elev/rug 1 m; neve/t0 0,001; vento 0,01; poeira 0,1; qi 0,0001)
            tols = [0.0501, 0.0501, 0.5001, 0.5001, 0.0011, 0.0011, 0.0051, 0.0501, 0.00011, 0.0501, 0.0051]
            for e, o, tol in zip(esperado, obtido, tols):
                assert (e is None and o is None) or (e is not None and o is not None and abs(e - o) <= tol), \
                    f"celulas.js difere do pipeline em {linha[0]},{linha[1]}: {e} x {o}"
            n += 1
        reg(S, "data/celulas.js (busca reversa) bate com earth_grid.json", OK, f"{n} células, diferença só de arredondamento")
    tentar(S, "Site x pipeline", site_bate_com_pipeline)

    def semelhanca_python_igual_site():
        # reimplementação em Python da fórmula, a partir das notas e dos pesos, comparada com o que o site mostra
        maior = 0.0; n = 0
        for t in D["terra"]:
            for corpo, lista in (("marte", D["marte"]), ("lua", D["lua"])):
                pesos = D["pesos"][corpo]
                for r in t["ranking"][corpo]:
                    alvo = next(a for a in lista if a["id"] == r["id"])
                    soma = 0.0; usados = []
                    for asp, w in pesos.items():
                        if w > 0 and t["notas"].get(asp) is not None and alvo["notas"].get(asp) is not None:
                            usados.append(asp); soma += w
                    d2 = sum(pesos[a] / soma * (t["notas"][a] - alvo["notas"][a]) ** 2 for a in usados)
                    s = 100 * (1 - math.sqrt(d2))
                    maior = max(maior, abs(s - r["semelhanca"])); n += 1
                    assert abs(s - r["semelhanca"]) <= 0.06, f"{t['id']} x {r['id']}: site {r['semelhanca']} x conta {s:.2f}"
        reg(S, "A porcentagem de semelhança mostrada bate com a fórmula refeita do zero", OK, f"{n} rankings, maior diferença {maior:.3f} ponto")
    tentar(S, "Fórmula", semelhanca_python_igual_site)

    def notas_marte_lua():
        faixas = D["faixas"]
        def nota(asp, x):
            f = faixas[asp]; return max(0.0, min(1.0, (x - f["min"]) / (f["max"] - f["min"])))
        n = 0
        for js, lista, corpo in ((marte, D["marte"], "marte"), (lua, D["lua"], "lua")):
            for l in js["locais"]:
                a = l["aspectos"]; site = next(x for x in lista if x["id"] == l["id"])
                esp = {"relevo": nota("relevo", a["relevo"]["valor"]), "declividade": nota("declividade", a["declividade"]["valor"])}
                if a["amplitude_diurna"]["valor"] is not None:
                    esp["diurna"] = nota("diurna", a["amplitude_diurna"]["valor"])
                if corpo == "marte":
                    esp["gelo"] = nota("gelo", a["gelo"]["valor"] / 100.0)
                else:
                    esp["gelo"] = nota("gelo", a["gelo"]["valor"])
                    if a["temperatura"]["valor"] is not None:
                        esp["temperatura"] = nota("temperatura", a["temperatura"]["valor"] - 273.15)
                for k, v in esp.items():
                    assert abs(site["notas"][k] - v) < 1e-3, f"{corpo}/{l['id']}/{k}: site {site['notas'][k]} x {v}"; n += 1
        reg(S, "Notas 0-1 de Marte e da Lua batem com os valores físicos dos JSONs", OK, f"{n} notas recalculadas")
    tentar(S, "Notas", notas_marte_lua)


# ---------------------------------------------------------------------
# 3. RECÁLCULO INDEPENDENTE: TERRA
# ---------------------------------------------------------------------
def sec3_terra(grid):
    S = "3 Terra (recálculo)"
    cel = grid["celulas"]
    base = RAIZ / "raw" / "terra"

    # --- 3.1 MODIS: temperatura, amplitude, fração < 0 °C e neve -----------------------------------------
    def modis():
        from pyhdf.SD import SD, SDC
        arq_t = sorted((base / "MOD11C3").glob("*.hdf"))
        arq_n = sorted((base / "MOD10CM").glob("*.hdf"))
        assert len(arq_t) == 12 and len(arq_n) == 12
        sd_t = [SD(str(p), SDC.READ) for p in arq_t]
        sd_n = [SD(str(p), SDC.READ) for p in arq_n]
        esp = {"temp": [], "amp": [], "t0": [], "neve": [], "diu": []}; obt = {"temp": [], "amp": [], "t0": [], "neve": [], "diu": []}
        for c in cel:
            # linha 0 do arquivo = 90°N; 20 pixels por grau (0,05°); célula = 2° x 2° = 40 x 40 pixels
            r0 = int(round((90 - (c["lat"] + 1)) * 20)); c0 = int(round((c["lon"] - 1 + 180) * 20))
            sl = (slice(r0, r0 + 40), slice(c0, c0 + 40))
            terra = sd_t[0].select("Percent_land_in_grid")[sl] >= 50
            dia = np.array([s.select("LST_Day_CMG")[sl] for s in sd_t], float)
            noi = np.array([s.select("LST_Night_CMG")[sl] for s in sd_t], float)
            ok = (dia >= 7500) & (noi >= 7500)
            tm = np.where(ok, (dia + noi) * 0.02 / 2, np.nan)
            n_m = ok.sum(0)
            bom = (n_m >= 9) & terra
            n_terra = int(terra.sum())
            if n_terra >= 5 and bom.sum() >= 0.25 * n_terra:
                with np.errstate(all="ignore"):
                    media = np.nanmean(tm, 0) - 273.15
                    ampl = np.nanmax(tm, 0) - np.nanmin(tm, 0)
                    abaixo = np.where(ok, tm < 273.15, False).sum(0) / np.maximum(n_m, 1)
                obt["temp"].append(float(media[bom].mean())); obt["amp"].append(float(ampl[bom].mean()))
                obt["t0"].append(float(abaixo[bom].mean()))
                # amplitude diurna = média do ano de (LST dia - LST noite), refeita aqui direto dos dois campos
                dif = np.where(ok, (dia - noi) * 0.02, np.nan)
                with np.errstate(all="ignore"):
                    dm = np.nanmean(dif, 0)
                obt["diu"].append(float(dm[bom].mean()))
            else:
                for k in ("temp", "amp", "t0", "diu"): obt[k].append(None)
            # neve (códigos 0-100 = % de neve; 211, 250, 253, 254, 255 = sem dado)
            cod = np.array([s.select("Snow_Cover_Monthly_CMG")[sl] for s in sd_n], float)
            val = (cod >= 0) & (cod <= 100)
            nv = val.sum(0)
            frac = np.where(nv >= 6, np.where(val, cod / 100.0, 0).sum(0) / np.maximum(nv, 1), np.nan)
            bom_n = np.isfinite(frac) & terra
            obt["neve"].append(float(frac[bom_n].mean()) if (n_terra >= 5 and bom_n.sum() >= 0.25 * n_terra) else None)
            esp["temp"].append(c["temperatura"]["media_anual_C"]); esp["amp"].append(c["temperatura"]["amplitude_C"])
            esp["t0"].append(c["gelo"]["frac_T_abaixo_0C"]); esp["neve"].append(c["gelo"]["frac_neve"])
            esp["diu"].append(c["temperatura"]["amplitude_diurna_C"])
        tol = {"temp": 0.01, "amp": 0.01, "t0": 0.002, "neve": 0.002, "diu": 0.01}
        nomes = {"temp": "temperatura média anual (MOD11C3)", "amp": "amplitude anual (MOD11C3)",
                 "t0": "fração do ano abaixo de 0 °C (MOD11C3)", "neve": "fração do ano com neve (MOD10CM)",
                 "diu": "amplitude diurna, média do ano de (dia − noite) (MOD11C3)"}
        for k in ("temp", "amp", "diu", "t0", "neve"):
            n, erros, maior, ex = comparar(k, esp[k], obt[k], tol[k])
            if erros:
                reg(S, f"{nomes[k]}, {n} células", FALHA, f"{erros} diferenças; maior {maior:.4f}; ex.: {ex}")
            else:
                nn = sum(1 for v in esp[k] if v is not None)
                reg(S, f"{nomes[k]}: relido do arquivo bruto, {nn} células com valor", OK, f"maior diferença {maior:.5f}")
    tentar(S, "MODIS", modis)

    # --- 3.2 SRTM + ETOPO: elevação média e rugosidade ---------------------------------------------------
    def relevo():
        import netCDF4
        tiles = {}
        for z in (base / "SRTMGL30").glob("*.zip"):
            m = re.match(r"([ew])(\d{3})([ns])(\d{2})", z.name.lower())
            lon_w = int(m.group(2)) * (1 if m.group(1) == "e" else -1); lat_n = int(m.group(4)) * (1 if m.group(3) == "n" else -1)
            with zipfile.ZipFile(z) as f:
                dados = f.read([n for n in f.namelist() if n.lower().endswith(".dem")][0])
            a = np.frombuffer(dados, dtype=">i2").reshape(-1, 4800)
            assert a.shape[0] == 6000, f"{z.name}: forma inesperada {a.shape}"
            tiles[(lat_n, lon_w)] = a
        assert tiles, "nenhum tile SRTM"
        nc = netCDF4.Dataset(str(next((base / "ETOPO").glob("*.nc"))))
        la_e, lo_e = np.array(nc["lat"][:]), np.array(nc["lon"][:])
        esp_e, obt_e, esp_r, obt_r = [], [], [], []
        esp_d, obt_d = [], []; pulados = []
        for c in cel:
            la0, lo0 = c["lat"] - 1, c["lon"] - 1               # canto sudoeste da célula
            lat_n = 90 if la0 >= 40 else (40 if la0 >= -10 else (-10 if la0 >= -60 else None))
            lon_w = int(math.floor((lo0 + 180) / 40.0)) * 40 - 180
            media = desv = None; decl = None; borda = False
            if lat_n is not None and (lat_n, lon_w) in tiles:
                a = tiles[(lat_n, lon_w)]
                r0 = int(round((lat_n - (la0 + 2)) * 120)); c0 = int(round((lo0 - lon_w) * 120))
                bloco = a[r0:r0 + 240, c0:c0 + 240].astype(float)
                v = bloco[(bloco != -32768) & (bloco != 0)]           # -32768 = sem dado; 0 = mar
                if v.size >= 25:
                    media, desv = float(v.mean()), float(v.std())
                    # Declividade na escala de ~3,7 km: blocos de 4x4, com 1 bloco de margem para o gradiente nas bordas da célula
                    ra, rb = max(r0 - 4, 0), min(r0 + 244, a.shape[0]); ca, cb = max(c0 - 4, 0), min(c0 + 244, a.shape[1])
                    borda = (ra != r0 - 4) or (rb != r0 + 244) or (ca != c0 - 4) or (cb != c0 + 244)
                    ext = a[ra:rb, ca:cb].astype(float)
                    bom = (ext != -32768) & (ext != 0)
                    soma = media_por_blocos(np.where(bom, ext, 0.0), 4) * 16; nb = media_por_blocos(bom.astype(float), 4) * 16
                    grosso = np.where(nb >= 8, soma / np.maximum(nb, 1), np.nan)
                    lat_g = lat_n - (ra + 2 + 4 * np.arange(grosso.shape[0])) / 120.0
                    dg = declividade_independente(grosso, lat_g, 30, 6_371_000.0)
                    i_ini, j_ini = (r0 - ra) // 4, (c0 - ca) // 4
                    miolo = dg[i_ini:i_ini + 60, j_ini:j_ini + 60]
                    decl = float(np.nanmean(miolo)) if np.isfinite(miolo).any() else None
            if media is None:                                          # fora do SRTMGL30: ETOPO 2022 (NOAA, complemento)
                ia = np.where((la_e >= la0) & (la_e < la0 + 2))[0]; ib = np.where((lo_e >= lo0) & (lo_e < lo0 + 2))[0]
                z = np.array(nc["z"][ia[0]:ia[-1] + 1, ib[0]:ib[-1] + 1], float)
                v = z[z > 0]
                if v.size >= 25:
                    media, desv = float(v.mean()), float(v.std())
                    # ETOPO (60"): blocos de 2x2 (~3,7 km); o gradiente é só dentro da célula (sem margem), como no pipeline
                    terra_e = z > 0
                    h, w = (z.shape[0] // 2) * 2, (z.shape[1] // 2) * 2
                    bom = terra_e[:h, :w]
                    soma = media_por_blocos(np.where(bom, z[:h, :w], 0.0), 2) * 4; nb = media_por_blocos(bom.astype(float), 2) * 4
                    grosso = np.where(nb >= 2, soma / np.maximum(nb, 1), np.nan)
                    lat_g = la_e[ia[0]:ia[0] + h:2] + (la_e[1] - la_e[0]) / 2
                    dg = declividade_independente(grosso, lat_g, 30, 6_371_000.0, bordas=True)
                    decl = float(np.nanmean(dg)) if np.isfinite(dg).any() else None
            obt_e.append(media); obt_r.append(desv)
            esp_e.append(c["relevo"]["elevacao_media_m"]); esp_r.append(c["relevo"]["rugosidade_desvio_m"])
            if borda:       # célula colada na borda de um tile SRTM: o gradiente da borda é unilateral no pipeline; não comparável
                pulados.append(f"{c['lat']:g},{c['lon']:g}"); esp_d.append(None); obt_d.append(None)
            else:
                esp_d.append(c["relevo"]["declividade_3km_graus"]); obt_d.append(decl)
        for nome, e, o in (("elevação média (SRTMGL30; ETOPO só onde falta)", esp_e, obt_e), ("rugosidade do relevo", esp_r, obt_r)):
            n, erros, maior, ex = comparar(nome, e, o, 0.06)
            if erros: reg(S, f"{nome}, {n} células", FALHA, f"{erros} diferenças; maior {maior:.2f} m; ex.: {ex}")
            else: reg(S, f"{nome}: relido do arquivo bruto, {sum(1 for v in e if v is not None)} células com valor", OK, f"maior diferença {maior:.3f} m")
        n, erros, maior, ex = comparar("declividade", esp_d, obt_d, 0.01)
        if erros: reg(S, f"declividade na escala de 3,7 km, {n} células", FALHA, f"{erros} diferenças; maior {maior:.3f}°; ex.: {ex}")
        else: reg(S, f"declividade na escala de 3,7 km (blocos 4x4 do SRTM; 2x2 do ETOPO), refeita com diferenças centrais próprias: {sum(1 for v in esp_d if v is not None)} células", OK,
                  f"maior diferença {maior:.4f}°" + (f"; {len(pulados)} células coladas na borda de um tile ficaram de fora da comparação" if pulados else ""))
        # pontos famosos (fatos públicos): checa que a decodificação e a orientação estão certas
        def janela(lat_n, lon_w, la, lo, r):
            a = tiles[(lat_n, lon_w)]
            i0 = int(round((lat_n - (la + r)) * 120)); i1 = int(round((lat_n - (la - r)) * 120))
            j0 = int(round((lo - r - lon_w) * 120)); j1 = int(round((lo + r - lon_w) * 120))
            b = a[i0:i1, j0:j1].astype(float); return b[b != -32768]
        marcos = [("Mauna Kea (cume ~4.207 m)", -180, 40, 19.82, -155.47, 0.15, "max", 3900, 4300),
                  ("Everest/Himalaia (cume 8.849 m)", 60, 40, 28.0, 86.9, 1.5, "max", 7500, 9000),
                  ("Dallol/Danakil (~ -125 m)", 20, 40, 14.24, 40.30, 0.25, "min", -200, -50)]
        for nome, lon_w, lat_n, la, lo, r, modo, lo_ok, hi_ok in marcos:
            if (lat_n, lon_w) not in tiles:
                reg(S, f"Marco: {nome}", PULADO, "tile SRTM ausente"); continue
            v = janela(lat_n, lon_w, la, lo, r)
            x = float(v.max() if modo == "max" else v.min())
            assert lo_ok <= x <= hi_ok, f"{nome}: {modo} no SRTMGL30 = {x:.0f} m, esperado entre {lo_ok} e {hi_ok}"
            reg(S, f"Marco conhecido: {nome}", OK, f"{modo} no arquivo = {x:.0f} m (esperado {lo_ok} a {hi_ok} m)")
    tentar(S, "Relevo", relevo)

    # --- 3.3 MERRA-2: vento e poeira ----------------------------------------------------------------------
    def merra():
        import netCDF4
        fx = sorted((base / "M2TMNXFLX").glob("*.nc4")); fa = sorted((base / "M2TMNXAER").glob("*.nc4"))
        assert len(fx) == 12 and len(fa) == 12
        campos_v = []; campos_p = []
        lat = lon = None
        for a, b in zip(fx, fa):
            d1 = netCDF4.Dataset(str(a)); d2 = netCDF4.Dataset(str(b))
            campos_v.append(np.ma.filled(d1["SPEED"][0].astype(float), np.nan))
            campos_p.append(np.ma.filled(d2["DUSMASS"][0].astype(float), np.nan) * 1e9)    # kg/m3 -> ug/m3
            lat = np.array(d1["lat"][:]); lon = np.array(d1["lon"][:])
        V = np.nanmean(campos_v, 0); P = np.nanmean(campos_p, 0)
        ev, ov, ep, op = [], [], [], []
        for c in cel:
            m_la = (lat >= c["lat"] - 1) & (lat < c["lat"] + 1); m_lo = (lon >= c["lon"] - 1) & (lon < c["lon"] + 1)
            ov.append(float(np.nanmean(V[np.ix_(m_la, m_lo)]))); op.append(float(np.nanmean(P[np.ix_(m_la, m_lo)])))
            ev.append(c["vento"]["vento_ms"]); ep.append(c["vento"]["poeira_ugm3"])
        for nome, e, o, tol in (("vento médio, MERRA-2 SPEED", ev, ov, 0.002), ("poeira em suspensão, MERRA-2 DUSMASS", ep, op, 0.002)):
            n, erros, maior, ex = comparar(nome, e, o, tol)
            if erros: reg(S, f"{nome}, {n} células", FALHA, f"{erros} diferenças; maior {maior:.4f}; ex.: {ex}")
            else: reg(S, f"{nome}: relido dos 12 arquivos mensais, {n} células", OK, f"maior diferença {maior:.5f}")
        # fatos: a poeira do Saara/Arábia é muito maior que a da Antártida; vento do oceano austral > continente
        d = {(c["lat"], c["lon"]): c["vento"] for c in cel}
        assert d[(25.0, 9.0)]["poeira_ugm3"] > 50 > d[(-81.0, 99.0)]["poeira_ugm3"], "poeira do Saara deveria superar muito a da Antártida"
        reg(S, "Coerência física: poeira do Saara >> Antártida", OK, f"Saara {d[(25.0, 9.0)]['poeira_ugm3']:.0f} x Antártida {d[(-81.0, 99.0)]['poeira_ugm3']:.1f} µg/m³")
    tentar(S, "MERRA-2", merra)

    # --- 3.4 Fatos físicos conhecidos sobre a temperatura (fontes independentes) ----------------------------
    def temperatura_marcos():
        d = {(c["lat"], c["lon"]): c["temperatura"]["media_anual_C"] for c in cel}
        regras = [((-81.0, 99.0), -65, -45, "Antártida interior: média anual de Vostok é ~ -55 °C"),
                  ((31.0, 59.0), 20, 40, "Lut: LST média anual quente"),
                  ((79.0, 13.0), -20, -5, "Svalbard: Ártico")]
        for k, lo, hi, txt in regras:
            assert d[k] is not None and lo <= d[k] <= hi, f"{txt}: valor {d[k]} fora de {lo}..{hi}"
        reg(S, "Marcos de temperatura (Antártida, Lut, Svalbard) dentro do esperado", OK,
            "; ".join(f"{k}: {d[k]:.1f} °C" for k, *_ in regras))
    tentar(S, "Marcos de temperatura", temperatura_marcos)


# ---------------------------------------------------------------------
# 3b. RECÁLCULO INDEPENDENTE: MARTE E LUA
# ---------------------------------------------------------------------
def janela_pixels(grade, lat_topo, ppd, lat0, lon0, raio=1.0, lon_oeste=0.0):
    """Valores dos pixels a menos de `raio` graus do ponto, calculados pixel a pixel (código independente)."""
    n_lin, n_col = grade.shape
    i0 = max(0, int((lat_topo - (lat0 + raio + 0.2)) * ppd)); i1 = min(n_lin, int((lat_topo - (lat0 - raio - 0.2)) * ppd) + 2)
    lat_c = lat_topo - (np.arange(i0, i1) + 0.5) / ppd
    lon_c = lon_oeste + (np.arange(n_col) + 0.5) / ppd
    d = haversine(lat_c[:, None], lon_c[None, :], lat0, lon0)
    sub = grade[i0:i1]
    return sub[(d <= raio) & np.isfinite(sub)]


def sec3_marte_lua(marte, lua):
    S = "3 Marte e Lua (recálculo)"
    # --- Marte: MOLA --------------------------------------------------------------------------------------
    def mola():
        mola = np.fromfile(RAIZ / "raw/marte/megt90n000eb.img", dtype=">i2").reshape(2880, 5760).astype(float)
        i, j = np.unravel_index(np.argmax(mola), mola.shape)
        la, lo = 90 - (i + 0.5) / 16, (j + 0.5) / 16
        assert abs(la - 18.65) < 3 and abs(lo - 226.2) < 3, f"o ponto mais alto de Marte caiu em {la:.1f}, {lo:.1f}; Olympus Mons fica em 18,65°N, 226,2°L"
        assert 21000 <= mola[i, j] <= 21500, f"altura do Olympus Mons {mola[i, j]:.0f} m (esperado ~21.200 m)"
        reg(S, "MOLA: o ponto mais alto é Olympus Mons", OK, f"{mola[i, j]:.0f} m em {la:.1f}°N, {lo:.1f}°L (orientação e escala corretas)")
        lat_c = 90 - (np.arange(2880) + 0.5) / 16; lon_c = (np.arange(5760) + 0.5) / 16
        caixa = mola[np.ix_((lat_c > -55) & (lat_c < -30), (lon_c > 55) & (lon_c < 95))]
        assert caixa.min() <= -8000, f"Hellas: mínimo {caixa.min():.0f} m (esperado ~ -8.200 m)"
        reg(S, "MOLA: Hellas é a bacia mais funda", OK, f"mínimo {caixa.min():.0f} m na região de Hellas")
        esp_m, obt_m, esp_r, obt_r = [], [], [], []
        for l in marte["locais"]:
            v = janela_pixels(mola, 90.0, 16, l["lat"], l["lon_leste"])
            obt_m.append(float(v.mean())); obt_r.append(float(v.std()))
            esp_m.append(l["extras"]["elevacao_media_m"]); esp_r.append(l["aspectos"]["relevo"]["valor"])
        for nome, e, o in (("elevação média", esp_m, obt_m), ("rugosidade do relevo", esp_r, obt_r)):
            n, erros, maior, ex = comparar(nome, e, o, 0.2)
            assert not erros, f"MOLA {nome}: {erros} diferenças, ex.: {ex}"
            reg(S, f"MOLA: {nome} dos {n} locais de Marte, relida do arquivo bruto", OK, f"maior diferença {maior:.3f} m")
        # declividade na escala de ~3,7 km (o MOLA de 16 pixels/grau já está nela), diferenças centrais próprias
        lat_all = 90 - (np.arange(2880) + 0.5) / 16
        dec = declividade_independente(mola, lat_all, 16, 3_396_000.0)
        lon_all = (np.arange(5760) + 0.5) / 16
        esp_dc, obt_dc = [], []
        for l in marte["locais"]:
            d_ = haversine(lat_all[:, None], lon_all[None, :], l["lat"], l["lon_leste"])
            m_ = (d_ <= 1.0) & np.isfinite(dec)
            obt_dc.append(float(dec[m_].mean())); esp_dc.append(l["aspectos"]["declividade"]["valor"])
        n, erros, maior, ex = comparar("declividade", esp_dc, obt_dc, 0.02)
        assert not erros, f"MOLA declividade: {erros} diferenças, ex.: {ex}"
        v_ = dict(zip([l["id"] for l in marte["locais"]], esp_dc))
        assert v_["valles"] == max(v_.values()) and v_["utopia"] == min(v_.values()), f"Valles deveria ser o mais inclinado e Utopia o mais plano: {v_}"
        reg(S, f"MOLA: declividade (escala de 3,7 km) dos {n} locais de Marte, refeita do arquivo bruto", OK,
            f"maior diferença {maior:.4f}°; Valles Marineris {v_['valles']:.1f}° (o mais inclinado) x Utopia {v_['utopia']:.1f}° (o mais plano)")
        sem_rover = [l for l in marte["locais"] if l["id"] not in ("gale", "jezero")]
        for l in sem_rover:
            ad = l["aspectos"]["amplitude_diurna"]
            assert ad["valor"] is None and ad.get("motivo_nulo"), f"{l['id']}: amplitude diurna deveria ser nula, com motivo (só Gale e Jezero têm rover)"
        reg(S, "Marte: amplitude diurna fica nula nos locais sem rover, com o motivo escrito (nada foi estimado)", OK, f"{len(sem_rover)} locais")
    tentar(S, "MOLA", mola)

    # --- Marte: GRS (água no solo) ------------------------------------------------------------------------
    def grs():
        linhas = [l.split() for l in (RAIZ / "raw/marte/h2o_sr_5x5.tab").read_text().splitlines() if l.strip()]
        tab = np.array(linhas, float)
        assert tab.shape == (2592, 5), tab.shape
        n = 0
        for l in marte["locais"]:
            d = haversine(tab[:, 0], tab[:, 1], l["lat"], l["lon_leste"])
            k = int(np.argmin(d))
            esp = None if tab[k, 2] == 9999.999 else tab[k, 2]
            obt = l["aspectos"]["gelo"]["valor"]
            assert (esp is None and obt is None) or abs(esp - obt) < 1e-3, f"GRS {l['id']}: tabela {esp} x JSON {obt}"
            assert esp is not None and 1.0 <= esp <= 12.0, f"GRS {l['id']}: {esp} wt% fora do esperado para a faixa equatorial (1 a 12)"
            n += 1
        reg(S, f"GRS: água no solo dos {n} locais de Marte, relida da tabela bruta", OK, "valores entre 1 e 12 % em massa, como esperado na faixa equatorial")
    tentar(S, "GRS", grs)

    # --- Lua: LOLA ------------------------------------------------------------------------------------------
    def lola():
        h = np.fromfile(RAIZ / "raw/lua/ldem_16.img", dtype="<i2").reshape(2880, 5760).astype(float) * 0.5
        assert 10500 <= h.max() <= 11000, f"altura máxima {h.max():.0f} m (esperado ~10.780 m)"
        assert -9500 <= h.min() <= -8800, f"altura mínima {h.min():.0f} m (esperado ~ -9.100 m)"
        i, j = np.unravel_index(np.argmin(h), h.shape)
        la, lo = 90 - (i + 0.5) / 16, (j + 0.5) / 16
        assert la < -60 and 160 <= lo <= 215, f"o ponto mais fundo da Lua caiu em {la:.1f}, {lo:.1f}; deveria ser na bacia Pólo Sul-Aitken"
        reg(S, "LOLA: extremos da Lua", OK, f"mais alto {h.max():.0f} m; mais fundo {h.min():.0f} m em {la:.1f}°, {lo:.1f}°L (bacia Pólo Sul-Aitken)")
        esp_m, obt_m, esp_r, obt_r = [], [], [], []
        for l in lua["locais"]:
            v = janela_pixels(h, 90.0, 16, l["lat"], l["lon_leste"])
            obt_m.append(float(v.mean())); obt_r.append(float(v.std()))
            esp_m.append(l["extras"]["elevacao_media_m"]); esp_r.append(l["aspectos"]["relevo"]["valor"])
        for nome, e, o in (("elevação média", esp_m, obt_m), ("rugosidade do relevo", esp_r, obt_r)):
            n, erros, maior, ex = comparar(nome, e, o, 0.2)
            assert not erros, f"LOLA {nome}: {erros} diferenças, ex.: {ex}"
            reg(S, f"LOLA: {nome} dos {n} locais da Lua, relida do arquivo bruto", OK, f"maior diferença {maior:.3f} m")
        # declividade: LOLA de 16 pixels/grau reduzido por blocos de 2x2 (8 pixels/grau, ~3,8 km), diferenças centrais próprias
        h2 = media_por_blocos(h, 2)
        lat_all = 90 - (np.arange(h2.shape[0]) + 0.5) / 8
        lon_all = (np.arange(h2.shape[1]) + 0.5) / 8
        dec = declividade_independente(h2, lat_all, 8, 1_737_400.0)
        esp_dc, obt_dc = [], []
        for l in lua["locais"]:
            d_ = haversine(lat_all[:, None], lon_all[None, :], l["lat"], l["lon_leste"])
            m_ = (d_ <= 1.0) & np.isfinite(dec)
            obt_dc.append(float(dec[m_].mean())); esp_dc.append(l["aspectos"]["declividade"]["valor"])
        n, erros, maior, ex = comparar("declividade", esp_dc, obt_dc, 0.05)
        assert not erros, f"LOLA declividade: {erros} diferenças, ex.: {ex}"
        v_ = dict(zip([l["id"] for l in lua["locais"]], esp_dc))
        assert v_["tranquillitatis"] == min(v_.values()) and max(v_.values()) > 5, f"o mare deveria ser o mais plano e os polos/Tycho mais inclinados: {v_}"
        reg(S, f"LOLA: declividade (escala de 3,8 km) dos {n} locais da Lua, refeita do arquivo bruto", OK,
            f"maior diferença {maior:.4f}°; Tranquillitatis {v_['tranquillitatis']:.1f}° (o mais plano) x Shackleton {v_['shackleton']:.1f}°")
    tentar(S, "LOLA", lola)

    # --- Lua: Diviner CF (composição; fora do cálculo, mas continua nos JSONs) -----------------------------
    def cf():
        raw = np.fromfile(RAIZ / "raw/lua/dgdr_nen_cf_clc_cyl_032_img.img", dtype="<i2").reshape(3840, 11520)
        g = np.where(raw == -32768, np.nan, raw * 0.001)
        assert 6.9 <= np.nanmin(g) and np.nanmax(g) <= 9.2, f"CF fora de 6,96-9,09 µm: {np.nanmin(g)}..{np.nanmax(g)}"
        valores = {}
        for l in lua["locais"]:
            if abs(l["lat"]) + 1 <= 60:
                v = janela_pixels(g, 60.0, 32, l["lat"], l["lon_leste"])
                valores[l["id"]] = float(v.mean())
                assert abs(valores[l["id"]] - l["aspectos"]["geologia"]["valor"]) < 0.002, f"CF {l['id']}"
        assert valores["tranquillitatis"] > 8.2 > 8.1 > valores["tycho"], "o mare (basalto) deveria ter CF maior que o planalto (feldspático)"
        reg(S, "Diviner CF relido; mare (basalto) tem CF maior que o planalto", OK, f"Tranquillitatis {valores['tranquillitatis']:.2f} µm > Tycho {valores['tycho']:.2f} µm")
    tentar(S, "Diviner CF", cf)

    # --- Lua: Diviner GCP (temperatura equatorial) ----------------------------------------------------------
    def gcp():
        resumo = {}
        for l in lua["locais"]:
            a = l["aspectos"]["temperatura"]
            if l["extras"].get("temperatura_fonte") != "GCP":
                continue
            faixa = f"{int(math.floor(l['lat'] / 10)) * 10:+03d}"
            lo_, hi_ = int(math.floor(l["lat"] / 10)) * 10, int(math.floor(l["lat"] / 10)) * 10 + 10
            nome = lambda v, par: f"{abs(v):02d}{'n' if (v > 0 or par == 'lo' and v == 0) else 's'}"
            arq = RAIZ / "raw/lua" / f"gcp_{nome(lo_, 'lo')}{nome(hi_, 'hi')}.tab"
            d = np.genfromtxt(arq, delimiter=",", skip_header=1, usecols=(0, 1, 2, 10))
            clon, clat, ltim, tbol = d.T
            tb = np.where(tbol <= -9990, np.nan, tbol)
            lon0 = ((l["lon_leste"] + 180) % 360) - 180
            dentro = haversine(clat, clon, l["lat"], lon0) <= 1.0
            horas = np.unique(ltim[dentro])
            curva = np.array([np.nanmean(tb[dentro & (ltim == h)]) if np.isfinite(tb[dentro & (ltim == h)]).any() else np.nan for h in horas])
            ok = np.isfinite(curva)
            interp = np.interp(horas, np.r_[horas[ok] - 24, horas[ok], horas[ok] + 24], np.r_[curva[ok], curva[ok], curva[ok]])
            tmax, tmin, tmed = float(np.nanmax(curva)), float(np.nanmin(curva)), float(interp.mean())
            assert abs(tmed - a["valor"]) < 0.3 and abs(tmax - a["maximo_K"]) < 0.3 and abs(tmin - a["minimo_K"]) < 0.3, \
                f"GCP {l['id']}: recalculado {tmed:.1f}/{tmax:.1f}/{tmin:.1f} K x JSON {a['valor']}/{a['maximo_K']}/{a['minimo_K']}"
            resumo[l["id"]] = (tmin, tmax, tmed)
            ad = l["aspectos"]["amplitude_diurna"]["valor"]
            assert ad is not None and abs(ad - (tmax - tmin)) < 0.6, f"amplitude diurna {l['id']}: JSON {ad} x recalculada {tmax - tmin:.1f} K"
        for l in lua["locais"]:
            if l["extras"].get("temperatura_fonte") != "GCP":
                ad = l["aspectos"]["amplitude_diurna"]
                assert ad["valor"] is None and ad.get("motivo_nulo"), f"{l['id']}: sem GCP, a amplitude diurna deveria ser nula, com motivo"
        assert resumo, "nenhum local usa GCP"
        reg(S, "Diviner GCP: temperatura média, máxima e mínima relidas dos arquivos brutos", OK,
            "; ".join(f"{k}: {v[0]:.0f}-{v[1]:.0f} K (média {v[2]:.0f})" for k, v in resumo.items()))
        return resumo
    tentar(S, "Diviner GCP", gcp)

    # --- Lua: Diviner PRP (polos) ---------------------------------------------------------------------------
    def prp():
        import pandas as pd
        df = pd.read_csv(RAIZ / "raw/lua/dlre_prp_south.tab", skipinitialspace=True)
        df.columns = [c.strip() for c in df.columns]
        assert len(df) == 2880000, f"PRP deveria ter 2.880.000 triângulos, tem {len(df)}"
        for l in lua["locais"]:
            if l["extras"].get("temperatura_fonte") != "PRP":
                continue
            d = haversine(df["tri_clat"].values, df["tri_clon"].values, l["lat"], l["lon_leste"])
            s = df[d <= 1.0]
            v1 = s[["tri1_x", "tri1_y", "tri1_z"]].values; v2 = s[["tri2_x", "tri2_y", "tri2_z"]].values; v3 = s[["tri3_x", "tri3_y", "tri3_z"]].values
            area = 0.5 * np.sqrt(((np.cross(v2 - v1, v3 - v1)) ** 2).sum(1))
            ta, tm = s["temp_avg"].values, s["temp_max"].values
            ok = (ta > 0) & (tm > 0)
            media = float(np.average(ta[ok], weights=area[ok]))
            fria = float(area[ok][tm[ok] < 110].sum() / area[ok].sum())
            assert abs(media - l["aspectos"]["temperatura"]["valor"]) < 0.05, f"PRP {l['id']}: média {media:.2f} x JSON {l['aspectos']['temperatura']['valor']}"
            assert abs(fria - l["aspectos"]["gelo"]["valor"]) < 0.001, f"PRP {l['id']}: armadilha fria {fria:.4f} x JSON {l['aspectos']['gelo']['valor']}"
            assert fria > 0 and ta[ok].min() > 20, f"PRP {l['id']}: sem armadilhas frias ou temperatura impossível"
            reg(S, f"Diviner PRP: {l['nome']}", OK, f"média anual {media:.1f} K; {100 * fria:.1f}% da janela abaixo de 110 K; temperatura mínima {ta[ok].min():.0f} K")
    tentar(S, "Diviner PRP", prp)


# ---------------------------------------------------------------------
# 4. FATOS NOS TEXTOS (fichas oficiais da NASA)
# ---------------------------------------------------------------------
def sec4_fatos(sem_rede, resumo_gcp):
    S = "4 Fatos nos textos"
    K = textos_i18n()
    assert K, "não consegui ler o dicionário de i18n.js"
    # Os textos de cada idioma, juntos; as frases de fato (gravidade, atmosfera, dia lunar) vivem em i18n.js
    TEXTO = {"en": "\n".join(v[0] for v in K.values()), "pt": "\n".join(v[1] for v in K.values())}

    def fichas():
        if sem_rede:
            reg(S, "Fichas da NASA", PULADO, "rodado com --sem-rede"); return
        def linhas(nome):
            _, h = http(f"https://nssdc.gsfc.nasa.gov/planetary/factsheet/{nome}.html", "GET")
            h = re.sub(r"<sup>(.*?)</sup>", r"^\1", h.decode("utf-8", "ignore"))
            out = []
            for tr in re.findall(r"<tr[^>]*>(.*?)</tr>", h, re.S | re.I):
                c = [re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", x)).strip() for x in re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", tr, re.S | re.I)]
                if c: out.append(c)
            return h, out
        hm, lm = linhas("marsfact"); hl, ll = linhas("moonfact")
        g_marte = float(next(l for l in lm if l[0].startswith("Surface gravity"))[1]); g_terra = float(next(l for l in lm if l[0].startswith("Surface gravity"))[2])
        g_lua = float(next(l for l in ll if l[0].startswith("Surface gravity"))[1]); g_terra2 = float(next(l for l in ll if l[0].startswith("Surface gravity"))[2])
        r_m, r_l = g_marte / g_terra, g_lua / g_terra2
        FR = {   # as mesmas frases, em cada idioma
            "en": dict(g_marte=r"on Mars it is only (\d+)% of Earth", g_lua=r"on the Moon it is only (\d+)% of Earth",
                       vezes=r"more than 2\.5 times", fino=r"more than (\d+) times thinner", co2="almost all CO₂",
                       dias=r"about (\d+) Earth days"),
            "pt": dict(g_marte=r"em Marte ela é só (\d+)% da Terra", g_lua=r"na Lua ela é só (\d+)% da Terra",
                       vezes=r"mais de 2,5 vezes", fino=r"mais de (\d+) vezes mais fino", co2="quase todo CO₂",
                       dias=r"cerca de (\d+) dias terrestres"),
        }
        for lang in ("en", "pt"):
            texto_js, f = TEXTO[lang], FR[lang]
            m_g = re.search(f["g_marte"], texto_js)
            assert m_g and abs(int(m_g.group(1)) - 100 * r_m) < 1, f"[{lang}] gravidade de Marte: ficha {100 * r_m:.1f}%, texto do site diz {m_g.group(1) + '%' if m_g else '(não achei a frase)'}"
            l_g = re.search(f["g_lua"], texto_js)
            assert l_g and abs(int(l_g.group(1)) - 100 * r_l) < 1, f"[{lang}] gravidade da Lua: ficha {100 * r_l:.1f}%, texto do site diz {l_g.group(1) + '%' if l_g else '(não achei a frase)'}"
            assert abs(g_terra / g_marte - 2.6) < 0.2 and re.search(f["vezes"], texto_js), f"[{lang}] o texto 'mais de 2,5 vezes' não bate com a ficha"
        reg(S, "Gravidade de Marte (38%) e da Lua (17%) batem com a ficha da NASA (texto em inglês e em português)", OK,
            f"Marte {g_marte}/{g_terra} = {100 * r_m:.1f}%; Lua {g_lua}/{g_terra2} = {100 * r_l:.1f}%")
        reg(S, "'Pesam mais de 2,5 vezes' (en e pt): ficha dá", OK, f"{g_terra / g_marte:.2f} vezes")
        # pressão do ar de Marte
        t = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", hm.decode("utf-8", "ignore") if isinstance(hm, bytes) else hm))
        p = float(re.search(r"Surface pressure:\s*([\d.]+)\s*mb", t).group(1))
        vezes = 1013.25 / p
        usados = []
        for lang in ("en", "pt"):
            m = re.search(FR[lang]["fino"], TEXTO[lang])
            assert m, f"[{lang}] o texto do site não diz 'mais de N vezes mais fino' (deveria, com N <= {vezes:.0f})"
            assert int(m.group(1)) <= vezes, f"[{lang}] texto diz mais de {m.group(1)} vezes, mas a ficha dá {vezes:.0f}"
            usados.append(m.group(1))
        reg(S, "Ar de Marte 'mais de N vezes mais fino' bate com a ficha (6,36 mb), em en e pt", OK, f"ficha: {p} mb contra 1013 mb = {vezes:.0f} vezes; texto: mais de {usados[0]}")
        co2 = float(re.search(r"Carbon Dioxide \(CO 2 \) - ([\d.]+)%", t).group(1))
        assert co2 >= 90 and all(FR[l]["co2"] in TEXTO[l] for l in ("en", "pt")), f"CO₂ de Marte na ficha: {co2}%"
        reg(S, "Atmosfera de Marte 'quase toda CO₂' (en e pt)", OK, f"ficha da NASA: {co2}% de CO₂ em volume")
        # temperatura equatorial da Lua x ficha x nosso Diviner
        tt = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", hl.decode("utf-8", "ignore") if isinstance(hl, bytes) else hl))
        mm = re.search(r"Diurnal temperature range \(equator\):\s*(\d+) K to (\d+) K", tt)
        assert mm, "faixa de temperatura da Lua não achada na ficha"
        tmin_f, tmax_f = int(mm.group(1)), int(mm.group(2))
        if resumo_gcp and "tranquillitatis" in resumo_gcp:
            tmin, tmax, _ = resumo_gcp["tranquillitatis"]
            assert abs(tmin - tmin_f) <= 10 and abs(tmax - tmax_f) <= 10, f"Diviner {tmin:.0f}-{tmax:.0f} K x ficha {tmin_f}-{tmax_f} K"
            reg(S, "Temperatura equatorial da Lua: nosso Diviner x ficha da NASA", OK,
                f"ficha {tmin_f}-{tmax_f} K; Tranquillitatis (8°N) no Diviner {tmin:.0f}-{tmax:.0f} K")
        else:
            reg(S, "Temperatura equatorial da Lua x ficha", PULADO, "sem o resumo do GCP")
        sinodico = float(next(l for l in ll if l[0].startswith("Synodic period"))[1])
        metade = sinodico / 2
        dias = []
        for lang in ("en", "pt"):
            m2 = re.search(FR[lang]["dias"], TEXTO[lang])
            assert m2 and abs(int(m2.group(1)) - metade) <= 1, f"[{lang}] texto diz {m2.group(1) if m2 else '?'} dias, ficha dá {metade:.1f}"
            dias.append(m2.group(1))
        reg(S, "Dia e noite lunares 'cerca de 15 dias' (en e pt)", OK, f"ficha: período sinódico {sinodico} dias; metade = {metade:.1f} dias; texto: {dias[0]}")
        mm2 = re.search(r"Surface pressure \(night\):\s*(\d+) x 10 \^?\s*-(\d+) bar", tt)
        assert mm2 and int(mm2.group(2)) >= 12, "a pressão noturna da Lua deveria ser ~1e-15 bar (vácuo)"
        reg(S, "Lua 'praticamente vácuo'", OK, f"ficha: {mm2.group(1)} x 10^-{mm2.group(2)} bar à noite")
    tentar(S, "Fichas", fichas)


# ---------------------------------------------------------------------
# relatório
# ---------------------------------------------------------------------
def escrever_relatorio():
    cont = {s: sum(1 for r in RESULTADOS if r[2] == s) for s in (OK, FALHA, AVISO, PULADO)}
    md = [f"# Verificação dos dados\n\nGerado por `scripts/07_verificar_dados.py` em {date.today().isoformat()}.\n",
          f"**Resultado: {cont[OK]} verificações OK, {cont[FALHA]} FALHAS, {cont[AVISO]} avisos, {cont[PULADO]} não verificadas.**\n",
          "## Como a verificação foi feita\n",
          "O script **não reaproveita o código** dos scripts que geraram os dados: refaz as contas do zero, lendo os arquivos brutos da NASA, "
          "para pegar erros que o próprio gerador não enxergaria (por exemplo, latitudes invertidas). Na Terra, confere **todas as células**.\n",
          "## O que isto prova, e o que não prova\n",
          "- **Prova:** os produtos existem nos catálogos oficiais da NASA; os números do site são exatamente os que saem dos arquivos brutos; "
          "a leitura (orientação, escala, unidades) está certa nos pontos conhecidos; não há dado de exemplo ou estimado no que o site carrega.\n",
          "- **NÃO prova:** que os produtos da NASA em si estão corretos (confiamos neles); que cada média de uma célula de 2° representa o ponto exato; "
          "frases de interpretação (por exemplo, 'útil para testar').\n",
          "- **Não é tudo medida direta da NASA:** veja a seção Limitações do site e do `relatorio/data_report.md` "
          "(GTOPO30 acima de 60°N e ETOPO 2022 no extremo sul no relevo; MERRA-2 é reanálise; temperatura polar da Lua é derivada).\n"]
    secoes = []
    for r in RESULTADOS:
        if r[0] not in secoes: secoes.append(r[0])
    for s in secoes:
        md.append(f"\n## {s}\n\n| Resultado | Verificação | Detalhe |\n|---|---|---|\n")
        for sec, nome, st, det in RESULTADOS:
            if sec == s:
                md.append(f"| {st} | {nome} | {det.replace('|', '/')} |\n")
    (RAIZ / "relatorio").mkdir(exist_ok=True)
    (RAIZ / "relatorio" / "verificacao_dados.md").write_text("".join(md), encoding="utf-8")
    return cont


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--sem-rede", action="store_true", help="pula as verificações que precisam de internet")
    a = ap.parse_args()
    d = RAIZ / "data"
    grid = json.load(open(d / "earth_grid.json", encoding="utf-8"))
    marte = json.load(open(d / "mars_sites.json", encoding="utf-8"))
    lua = json.load(open(d / "moon_sites.json", encoding="utf-8"))
    sim = json.load(open(d / "similaridade.json", encoding="utf-8"))
    D = ler_js(d / "dados_reais.js", "DADOS_REAIS")
    C = ler_js(d / "celulas.js", "CELULAS_TERRA")
    sec1_origem(a.sem_rede, grid, marte, lua)
    sec1_coordenadas(a.sem_rede)
    sec1_referencias(a.sem_rede)
    sec2_nada_falso(grid, marte, lua, sim, D, C)
    sec3_terra(grid)
    sec3_marte_lua(marte, lua)
    sec3_rovers(marte, a.sem_rede)
    resumo = {}
    for sec, nome, st, det in RESULTADOS:
        if nome.startswith("Diviner GCP: temperatura") and st == OK:
            for par in det.split("; "):
                m = re.match(r"(\w+): (\d+)-(\d+) K \(média (\d+)\)", par)
                if m: resumo[m.group(1)] = (float(m.group(2)), float(m.group(3)), float(m.group(4)))
    sec4_fatos(a.sem_rede, resumo)
    cont = escrever_relatorio()
    print(f"\n==== {cont[OK]} OK | {cont[FALHA]} FALHAS | {cont[AVISO]} avisos | {cont[PULADO]} não verificadas ====")
    print(f"Relatório: {RAIZ / 'relatorio' / 'verificacao_dados.md'}")
    sys.exit(1 if cont[FALHA] else 0)


if __name__ == "__main__":
    main()
