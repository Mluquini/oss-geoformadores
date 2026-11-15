#!/usr/bin/env python3
"""
02b_marte_rovers.py: temperatura do solo e vento medidos NO LOCAL pelos rovers da NASA em Marte (dados reais, PDS).

O que ele faz, em português simples:
  - Gale (rover Curiosity, instrumento REMS): baixa alguns dias marcianos ("sols") espalhados pelo primeiro ano marciano
    e mede a temperatura do solo hora a hora e o vento. Salva um resumo em data/mars_rovers.json.
  - Jezero (rover Perseverance, instrumento MEDA): faz o mesmo com os produtos "derivados" do MEDA (temperatura do solo a
    partir do fluxo de infravermelho térmico, sensor TIRS, e vento).

POR QUE SÓ ALGUNS DIAS: cada sol da REMS tem ~13 MB (1 medida por segundo) e o primeiro ano marciano tem ~668 sols (~9 GB).
Usamos N sols igualmente espaçados (padrão 24), o que cobre as estações. A temperatura média anual e a amplitude dia/noite
são, portanto, ESTIMATIVAS por amostragem (a média dos sols amostrados), e isso fica escrito no JSON.

Como rodar:
    python scripts/02b_marte_rovers.py --raw raw --saida data
"""
import argparse
import re
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import comum as c  # noqa: E402

REMS = "https://atmos.nmsu.edu/PDS/data/PDS4/msl_rems_bundle/data_calibrated"
PRIMEIRO_ANO_SOLS = (1, 668)       # primeiro ano marciano de Curiosity (1 ano marciano = 668,6 sols)
MIN_HORAS_VALIDAS = 20             # de 24 faixas de hora local, para o sol entrar na temperatura
MIN_AMOSTRAS_FAIXA = 30            # pelo menos tantas medidas (de 1 s) para uma faixa de hora contar
COLUNAS = dict(vento=3, ws_conf=6, gts=7, gts_conf=10, ltst=2)   # posições (0 = primeira) no produto RMD da REMS
MEDA = "https://atmos.nmsu.edu/PDS/data/PDS4/Mars2020/mars2020_meda/data_derived_env"
SIGMA = 5.670374e-8                # constante de Stefan-Boltzmann (W/m²/K⁴)
MIN_SOLS_FAIXA_VENTO = 4           # para o vento: cada faixa de hora precisa de dados em pelo menos tantos sols
MIN_FAIXAS_VENTO = 20              # e pelo menos tantas das 24 faixas de hora precisam estar cobertas


def listar(url):
    import requests
    html = requests.get(url, timeout=60).text
    return [h for h in re.findall(r'href="([^"?]+)"', html) if not h.startswith("/") and not h.startswith("http")]


def escolher_sols(n):
    """N sols igualmente espaçados no primeiro ano marciano, trocados pelo sol mais próximo que existe no arquivo."""
    blocos = [b for b in listar(REMS + "/") if b.startswith("SOL_")]
    existentes = {}
    for b in blocos:
        ini, fim = (int(x) for x in re.findall(r"\d+", b)[:2])
        if fim < PRIMEIRO_ANO_SOLS[0] or ini > PRIMEIRO_ANO_SOLS[1]:
            continue
        for d in listar(f"{REMS}/{b}"):
            m = re.match(r"SOL(\d+)/", d)
            if m and PRIMEIRO_ANO_SOLS[0] <= int(m.group(1)) <= PRIMEIRO_ANO_SOLS[1]:
                existentes[int(m.group(1))] = f"{REMS}/{b}{d}"
    alvos = np.linspace(PRIMEIRO_ANO_SOLS[0] + 4, PRIMEIRO_ANO_SOLS[1] - 3, n)
    lista = sorted(existentes)
    escolhidos = []
    for t in alvos:
        s = min(lista, key=lambda x: abs(x - t))
        if s not in escolhidos:
            escolhidos.append(s)
    return [(s, existentes[s]) for s in escolhidos]


def baixar_rmd(url_sol, destino):
    arqs = [a for a in listar(url_sol) if "RMD" in a and a.endswith(".TAB")]
    if len(arqs) != 1:
        raise RuntimeError(f"esperava 1 arquivo RMD em {url_sol}, achei {arqs}")
    return c.baixar(url_sol + arqs[0], destino / arqs[0])


def ler_sol(caminho):
    """Lê um produto RMD da REMS. Devolve (hora_local[h], temp_solo_K ou nan, vento_ms ou nan)."""
    import pandas as pd
    df = pd.read_csv(caminho, header=None, skipinitialspace=True, quotechar='"', low_memory=False)
    ltst = df[COLUNAS["ltst"]].astype(str).str.strip()
    hora = ltst.str[6:8].astype(float) + ltst.str[9:11].astype(float) / 60.0       # "00100 00:37:07" -> 0,62 h
    bt = df[COLUNAS["gts"]].astype(float).values
    ok_t = (bt > -900) & (df[COLUNAS["gts_conf"]].astype(str).str.strip() == "1111").values   # 4 bytes, todos "bom"
    ws = df[COLUNAS["vento"]].astype(float).values
    # vento: bytes 0 a 3 "bom" (temperatura, ruído, rover parado, configuração); o byte 5 ("confiável") quase nunca é 1
    ok_w = (ws > -900) & df[COLUNAS["ws_conf"]].astype(str).str.strip().str[:4].eq("1111").values
    return hora.values, np.where(ok_t, bt, np.nan), np.where(ok_w, ws, np.nan)


def resumo_sol(hora, temp, vento):
    """Curva de 24 faixas de hora local (média por faixa). Faixas sem dado suficiente são interpoladas (circular).
    Também guarda, por faixa de hora, a média do vento (e quantas medidas), para juntar vários sols depois."""
    faixa = np.floor(hora).astype(int) % 24
    curva = np.full(24, np.nan)
    vento_h = [None] * 24
    for h in range(24):
        v = temp[(faixa == h) & np.isfinite(temp)]
        if v.size >= MIN_AMOSTRAS_FAIXA:
            curva[h] = v.mean()
        w = vento[(faixa == h) & np.isfinite(vento)]
        if w.size >= MIN_AMOSTRAS_FAIXA:
            vento_h[h] = float(w.mean())
    ok = np.isfinite(curva)
    saida = dict(n_horas=int(ok.sum()), vento_por_hora=vento_h, n_medidas_vento=int(np.isfinite(vento).sum()))
    if ok.sum() >= MIN_HORAS_VALIDAS:
        horas = np.arange(24)
        interp = np.interp(horas, np.r_[horas[ok] - 24, horas[ok], horas[ok] + 24], np.r_[curva[ok], curva[ok], curva[ok]])
        saida.update(media_K=float(interp.mean()), maximo_K=float(np.nanmax(curva)), minimo_K=float(np.nanmin(curva)))
    return saida


def juntar(por_sol, rotulo):
    """Resumo de vários sols: temperatura e amplitude (média entre sols) e vento (média de 24 faixas de hora, juntando os sols)."""
    usados = {s: r for s, r in por_sol.items() if "media_K" in r}
    assert len(usados) >= 12, f"{rotulo}: só {len(usados)} sols com curva completa; pouco para uma média confiável"
    faixas = []
    for h in range(24):
        v = [r["vento_por_hora"][h] for r in por_sol.values() if r["vento_por_hora"][h] is not None]
        faixas.append(float(np.mean(v)) if len(v) >= MIN_SOLS_FAIXA_VENTO else None)
    n_faixas = sum(f is not None for f in faixas)
    vento = float(np.mean([f for f in faixas if f is not None])) if n_faixas >= MIN_FAIXAS_VENTO else None
    return dict(
        sols_amostrados=sorted(por_sol), sols_com_curva=sorted(usados),
        temperatura_media_K=float(np.mean([r["media_K"] for r in usados.values()])),
        temperatura_media_K_desvio_entre_sols=float(np.std([r["media_K"] for r in usados.values()])),
        amplitude_diurna_K=float(np.mean([r["maximo_K"] - r["minimo_K"] for r in usados.values()])),
        amplitude_diurna_K_desvio_entre_sols=float(np.std([r["maximo_K"] - r["minimo_K"] for r in usados.values()])),
        vento_ms=vento, vento_faixas_cobertas=n_faixas,
        sols_com_vento=sorted(s for s, r in por_sol.items() if r["n_medidas_vento"] > 0),
        n_medidas_vento=int(sum(r["n_medidas_vento"] for r in por_sol.values())),
        vento_motivo_nulo=None if vento is not None else
        f"Dado insuficiente: {sum(r['n_medidas_vento'] for r in por_sol.values())} medidas de vento em {len(por_sol)} sols, cobrindo "
        f"só {n_faixas} das 24 faixas de hora local (mínimo {MIN_FAIXAS_VENTO}, cada uma com dados de pelo menos {MIN_SOLS_FAIXA_VENTO} sols). "
        "O vento tem ciclo diário forte, então uma média de poucas horas seria enganosa.",
        por_sol=por_sol)


def mostrar(s, r):
    print(f"  sol {s:4d}: horas válidas {r['n_horas']:2d}  " +
          (f"média {r['media_K'] - 273.15:6.1f} °C  amplitude {r['maximo_K'] - r['minimo_K']:5.1f} K" if "media_K" in r else "sem curva completa") +
          f"  vento: {r['n_medidas_vento']} medidas")


def gale(raw, n_sols):
    pasta = raw / "marte" / "rems"
    pasta.mkdir(parents=True, exist_ok=True)
    sols = escolher_sols(n_sols)
    print(f"Gale/REMS: {len(sols)} sols amostrados: {[s for s, _ in sols]}")
    por_sol = {}
    for s, url in sols:
        h, t, w = ler_sol(baixar_rmd(url, pasta))
        por_sol[s] = resumo_sol(h, t, w)
        mostrar(s, por_sol[s])
    return juntar(por_sol, "Gale")


def sols_meda(n):
    """N sols igualmente espaçados no primeiro ano marciano da Perseverance que tenham os produtos TIRS e WS."""
    existentes = {}
    for bloco in [b for b in listar(MEDA + "/") if b.startswith("sol_")]:
        ini, fim = (int(x) for x in re.findall(r"\d+", bloco)[:2])
        if fim < PRIMEIRO_ANO_SOLS[0] or ini > PRIMEIRO_ANO_SOLS[1]:
            continue
        for d in listar(f"{MEDA}/{bloco}"):
            m = re.match(r"sol_(\d+)/", d)
            if m and PRIMEIRO_ANO_SOLS[0] <= int(m.group(1)) <= PRIMEIRO_ANO_SOLS[1]:
                existentes[int(m.group(1))] = f"{MEDA}/{bloco}{d}"
    alvos = np.linspace(PRIMEIRO_ANO_SOLS[0] + 4, PRIMEIRO_ANO_SOLS[1] - 3, n)
    escolhidos = []
    for t in alvos:
        s = min(existentes, key=lambda x: abs(x - t))
        if s not in escolhidos:
            escolhidos.append(s)
    return [(s, existentes[s]) for s in sorted(escolhidos)]


def ler_sol_meda(url_sol, pasta):
    """Temperatura (TIRS) e vento (WS) de um sol do MEDA. Cada produto pode faltar: depois de ~sol 300 não há mais vento
    derivado confiável. Devolve (hora_t, temp, hora_w, vento) com None onde o produto não existe."""
    import pandas as pd
    arqs = listar(url_sol)
    tirs = [a for a in arqs if "DER_TIRS" in a and a.endswith(".CSV")]
    ws = [a for a in arqs if "DER_WS" in a and a.endswith(".CSV")]

    def hora(serie):
        x = serie.astype(str).str.strip()
        return (x.str[5:7].astype(float) + x.str[8:10].astype(float) / 60.0).values          # "0099 23:56:47"
    hora_t = temp = hora_w = vento = None
    if len(tirs) == 1:
        t = pd.read_csv(c.baixar(url_sol + tirs[0], pasta / tirs[0]), low_memory=False)
        up = t["UPWARD_LW_IRRADIANCE"].astype(float)
        # Só com o solo fora da sombra do rover e rover pouco inclinado; o solo é tratado como corpo negro (emissividade 1),
        # como o próprio produto assume: T = (E / sigma)^(1/4). Isso subestima um pouco a temperatura real (alguns kelvin).
        ok = up.notna() & (up > 0) & (t["TIRS_GROUND_FOOTPRINT_NOT_IN_SHADOW"] == 1) & (t["ROVER_LOW_TILT"] == 1)
        hora_t, temp = hora(t["LTST"]), np.where(ok, (up / SIGMA) ** 0.25, np.nan)
    if len(ws) == 1:
        w = pd.read_csv(c.baixar(url_sol + ws[0], pasta / ws[0]), low_memory=False)
        v = w["HORIZONTAL_WIND_SPEED"].astype(float)
        hora_w, vento = hora(w["LTST"]), np.where(v.notna() & (v != 999999999) & (v >= 0), v, np.nan)
    return hora_t, temp, hora_w, vento


def jezero(raw, n_sols):
    pasta = raw / "marte" / "meda"
    pasta.mkdir(parents=True, exist_ok=True)
    sols = sols_meda(n_sols)
    print(f"Jezero/MEDA: {len(sols)} sols amostrados: {[s for s, _ in sols]}")
    por_sol = {}
    for s, url in sols:
        ht, temp, hw, vento = ler_sol_meda(url, pasta)
        if ht is None:
            print(f"  sol {s}: sem o produto de temperatura (TIRS), ignorado")
            continue
        a = resumo_sol(ht, temp, np.full_like(temp, np.nan))
        if hw is not None:
            b = resumo_sol(hw, np.full_like(vento, np.nan), vento)
            a["vento_por_hora"], a["n_medidas_vento"] = b["vento_por_hora"], b["n_medidas_vento"]
        por_sol[s] = a
        mostrar(s, a)
    return juntar(por_sol, "Jezero")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--raw", default="raw")
    ap.add_argument("--saida", default="data")
    ap.add_argument("--sols", type=int, default=24, help="quantos sols amostrar no primeiro ano marciano (padrão 24)")
    a = ap.parse_args()
    raw, saida = Path(a.raw), Path(a.saida)
    g = gale(raw, a.sols)
    j = jezero(raw, a.sols)
    c.salvar_json(dict(
        gerado_por="scripts/02b_marte_rovers.py",
        locais=dict(
            gale=dict(
                instrumento="MSL/Curiosity REMS",
                produto="msl_rems_bundle (produtos RMD, dados ambientais corrigidos; sensor GTS de temperatura do solo e sensor de vento da REMS)",
                link=REMS + "/", periodo="primeiro ano marciano (sols 1 a 668), amostra de sols", **g),
            jezero=dict(
                instrumento="Mars 2020/Perseverance MEDA",
                produto="mars2020_meda (data_derived_env, produtos DER_TIRS de infravermelho térmico e DER_WS de vento)",
                link=MEDA + "/", periodo="primeiro ano marciano (sols 1 a 668), amostra de sols", **j))),
        saida / "mars_rovers.json")


if __name__ == "__main__":
    main()
