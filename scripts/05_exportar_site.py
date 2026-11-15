#!/usr/bin/env python3
"""
05_exportar_site.py: transforma os dados do pipeline em data/dados_reais.js, o arquivo que o SITE lê.

Por que .js e não .json? Porque o site precisa abrir com duplo clique no index.html, e o navegador
não deixa a página ler arquivos .json nesse caso. O conteúdo é JSON normal dentro de
`window.DADOS_REAIS = {...};`.

O que ele faz, em português simples:
  1. Lê data/earth_grid.json, data/similaridade.json, data/mars_sites.json e data/moon_sites.json.
  2. Para cada um dos 12 locais da Terra do site, acha a célula de 2° que contém o local e junta:
     valores medidos, notas 0-1 e o ranking de Marte e da Lua (calculado no 04_normalizar.py).
  3. Escreve um texto de status que diz, sem inventar, o que já é dado real e o que ainda falta.
  4. Escreve data/celulas.js: as células de TERRA em lista compacta, para o modo "Planejar missão" (busca reversa).

Os textos dos locais (nome, descrição, "útil para testar"), em português e inglês, vêm de data/textos/*.js. Só os
TEXTOS: nenhum número de dado fica nesses arquivos. O site monta as frases no idioma escolhido a partir de números e
códigos, por isso este script não grava frases prontas.

Como rodar (depois de 01, 02, 03 e 04):
    python scripts/05_exportar_site.py --dados data
"""
import argparse
import json
import math
import sys
from datetime import date
from pathlib import Path

def ler_js_array(caminho):
    """Lê um arquivo `window.X = [ ...JSON... ];` e devolve a lista."""
    linhas = [l for l in Path(caminho).read_text(encoding="utf-8").splitlines() if not l.strip().startswith("//")]
    t = "\n".join(linhas)
    return json.loads(t[t.index("["): t.rindex("]") + 1])


def centro_da_celula(lat, lon, passo=2.0):
    i = min(max(int(math.floor((lat + 90) / passo)), 0), int(180 / passo) - 1)
    j = min(max(int(math.floor((lon + 180) / passo)), 0), int(360 / passo) - 1)
    return -90 + passo / 2 + passo * i, -180 + passo / 2 + passo * j


ASPECTOS_TODOS = ("temperatura", "diurna", "relevo", "declividade", "gelo", "vento")


def produtos_unicos(js):
    """Lista 'Instrumento: produto (versão)' sem repetir, a partir dos metadados de Marte/Lua."""
    vistos = []
    for l in js["locais"]:
        for f in l["aspectos"].values():
            if f.get("valor") is not None:
                t = f"{f['instrumento']}: {f['produto'].split(' (')[0]}"    # sem o detalhe entre parênteses
                if t not in vistos:
                    vistos.append(t)
    return vistos


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--dados", default="data")
    a = ap.parse_args()
    d = Path(a.dados)
    for f in ("earth_grid.json", "similaridade.json", "mars_sites.json", "moon_sites.json"):
        if not (d / f).exists():
            sys.exit(f"Falta {d / f}. Rode antes os scripts 01 a 04.")
    grid = json.load(open(d / "earth_grid.json", encoding="utf-8"))
    sim = json.load(open(d / "similaridade.json", encoding="utf-8"))
    marte = json.load(open(d / "mars_sites.json", encoding="utf-8"))
    lua = json.load(open(d / "moon_sites.json", encoding="utf-8"))
    meta_terra = ler_js_array(d / "textos" / "earth_sites.js")
    meta_marte = {m["id"]: m for m in ler_js_array(d / "textos" / "mars_sites.js")}
    meta_lua = {m["id"]: m for m in ler_js_array(d / "textos" / "moon_sites.js")}
    cel_grid = {(c["lat"], c["lon"]): c for c in grid["celulas"]}
    cel_sim = {(c["lat"], c["lon"]): c for c in sim["celulas"]}

    # ---------------- Terra ----------------
    terra = []
    for m in meta_terra:
        clat, clon = centro_da_celula(m["lat"], m["lon"])
        g, s = cel_grid.get((clat, clon)), cel_sim.get((clat, clon))
        item = dict(id=m["id"], nome=m["nome"], pais=m["pais"], tipo=m["tipo"], lat=m["lat"], lon=m["lon"],
                    descricao=m["descricao"], util_para_testar=m["util_para_testar"],
                    celula=dict(lat=clat, lon=clon, tamanho_graus=2), tem_dado=bool(g and s))
        if g and s:
            item["valores"] = dict(
                temperatura_C=g["temperatura"]["media_anual_C"], amplitude_C=g["temperatura"]["amplitude_C"],
                amplitude_diurna_C=g["temperatura"].get("amplitude_diurna_C"),
                elevacao_m=g["relevo"]["elevacao_media_m"], rugosidade_m=g["relevo"]["rugosidade_desvio_m"],
                declividade_graus=g["relevo"]["declividade_media_graus"],
                declividade_3km_graus=g["relevo"].get("declividade_3km_graus"), fonte_relevo=g["relevo"]["fonte"],
                frac_neve=g["gelo"]["frac_neve"], frac_T_abaixo_0C=g["gelo"]["frac_T_abaixo_0C"],
                vento_ms=g["vento"]["vento_ms"], poeira_ugm3=g["vento"]["poeira_ugm3"])
            item["notas"] = s["notas"]
            item["ranking"] = dict(marte=s["marte"], lua=s["lua"])
        else:
            item["valores"], item["notas"], item["ranking"] = {}, {}, dict(marte=[], lua=[])
        terra.append(item)

    # ---------------- Marte e Lua ----------------
    def alvo(js, meta, notas, valores_fn):
        out = []
        for l in js["locais"]:
            md = meta[l["id"]]
            out.append(dict(id=l["id"], nome=md["nome"], descricao=md["descricao"], lat=l["lat"],
                            lon_leste=l["lon_leste"], coord_verificada=l.get("coord_verificada", False),
                            notas=notas[l["id"]], valores=valores_fn(l)))
        return out

    def valores_marte(l):
        a_ = l["aspectos"]
        t = a_["temperatura"]["valor"]
        return dict(temperatura_C=None if t is None else t - 273.15,
                    amplitude_diurna_K=a_.get("amplitude_diurna", {}).get("valor"),
                    relevo_m=a_["relevo"]["valor"], declividade_graus=a_.get("declividade", {}).get("valor"),
                    agua_pct=a_["gelo"]["valor"], vento_rover_ms=l["extras"].get("vento_rover_ms"))

    def valores_lua(l):
        a_ = l["aspectos"]
        t = a_["temperatura"]
        return dict(temperatura_C=None if t["valor"] is None else t["valor"] - 273.15,
                    temperatura_max_C=None if t.get("maximo_K") is None else t["maximo_K"] - 273.15,
                    amplitude_diurna_K=a_.get("amplitude_diurna", {}).get("valor"),
                    relevo_m=a_["relevo"]["valor"], declividade_graus=a_.get("declividade", {}).get("valor"),
                    armadilha_fria_pct=None if a_["gelo"]["valor"] is None else 100 * a_["gelo"]["valor"])

    lista_marte = alvo(marte, meta_marte, sim["notas_marte"], valores_marte)
    lista_lua = alvo(lua, meta_lua, sim["notas_lua"], valores_lua)

    # ---------------- Status (calculado do que realmente existe) ----------------
    def aspectos_com_dado(notas_por_item):
        return [k for k in ASPECTOS_TODOS
                if any(n.get(k) is not None for n in notas_por_item)]

    asp_terra = aspectos_com_dado([t["notas"] for t in terra if t["tem_dado"]])
    asp_marte = aspectos_com_dado([x["notas"] for x in lista_marte])
    asp_lua = aspectos_com_dado([x["notas"] for x in lista_lua])
    sem_terra = [k for k in ASPECTOS_TODOS if k not in asp_terra]
    n_com = sum(1 for t in terra if t["tem_dado"])
    # Só números e códigos: o site monta a frase no idioma escolhido.
    # Aspectos de Marte que só alguns locais têm (os medidos por rover): quais e em que locais
    marte_todos = [k for k in ASPECTOS_TODOS if all(x["notas"].get(k) is not None for x in lista_marte)]
    marte_parcial = [k for k in ASPECTOS_TODOS if k in asp_marte and k not in marte_todos]
    marte_locais_parcial = [x["id"] for x in lista_marte if any(x["notas"].get(k) is not None for k in marte_parcial)]
    status = dict(n_com=n_com, n_total=len(terra), terra_sem_dado=sem_terra, marte_usa=marte_todos,
                  marte_usa_so_em=dict(aspectos=marte_parcial, locais=marte_locais_parcial), lua_usa=asp_lua)

    # ---------------- Fontes ----------------
    # Só lista a fonte de um aspecto se ele tem dado em alguma célula (não cita produto que falhou).
    def tem_valor(chave, campos):
        return any(c[chave][f] is not None for c in grid["celulas"] for f in campos)
    presentes = dict(
        temperatura=tem_valor("temperatura", ["media_anual_C", "amplitude_diurna_C"]),
        gelo=tem_valor("gelo", ["frac_neve", "frac_T_abaixo_0C"]),
        relevo=tem_valor("relevo", ["rugosidade_desvio_m", "declividade_3km_graus"]),
        vento=tem_valor("vento", ["vento_ms", "poeira_ugm3"]))
    # Produto e versão de cada aspecto da Terra (nomes neutros; o site traduz o nome do aspecto).
    PRODUTOS_TERRA = dict(temperatura=("MOD11C3", "061"), gelo=("MOD10CM + MOD11C3", "61 / 061"),
                          relevo=("SRTMGL30", "002"), vento=("M2TMNXFLX (SPEED) + M2TMNXAER (DUSMASS)", "5.12.4"))
    fontes_terra = [dict(aspecto=k, produto=p, versao=v) for k, (p, v) in PRODUTOS_TERRA.items() if presentes.get(k)]
    complementos = ["etopo2022"] if grid.get("complementos") else []
    saida = dict(
        gerado_em=date.today().isoformat(), anos_terra=grid.get("anos"), status=status,
        faixas=sim["faixas"], pesos=sim["pesos"], faixas_busca=sim.get("faixas_busca", {}),
        fontes=dict(terra=fontes_terra, complementos=complementos, marte=produtos_unicos(marte), lua=produtos_unicos(lua)),
        terra=terra, marte=lista_marte, lua=lista_lua)

    # ---------------- Células para a busca reversa ("Planejar missão") ----------------
    # Lista compacta: só células de TERRA (as de mar não têm temperatura, relevo nem neve). Arredondado para ficar leve.
    campos = ["lat", "lon", "temp", "amp", "elev", "rug", "neve", "t0", "vento", "poeira", "qi", "diu", "decl3"]

    def arred(x, n):
        return None if x is None else round(x, n)
    linhas = []
    for c in grid["celulas"]:
        t, r_, gl, v, ge = c["temperatura"], c["relevo"], c["gelo"], c["vento"], c["geologia"]
        if t["media_anual_C"] is None and r_["rugosidade_desvio_m"] is None and gl["frac_neve"] is None:
            continue
        linhas.append([c["lat"], c["lon"], arred(t["media_anual_C"], 1), arred(t["amplitude_C"], 1),
                       arred(r_["elevacao_media_m"], 0), arred(r_["rugosidade_desvio_m"], 0),
                       arred(gl["frac_neve"], 3), arred(gl["frac_T_abaixo_0C"], 3),
                       arred(v["vento_ms"], 2), arred(v["poeira_ugm3"], 1), arred(ge["indice_quartzo"], 4),
                       arred(t.get("amplitude_diurna_C"), 1), arred(r_.get("declividade_3km_graus"), 2)])
    celulas_js = dict(gerado_em=date.today().isoformat(), tamanho_graus=grid.get("passo_graus", 2), campos=campos,
                      total_celulas_no_grid=len(grid["celulas"]), anos=grid.get("anos"), dados=linhas)
    (d / "celulas.js").write_text(
        "// Gerado por scripts/05_exportar_site.py: NÃO edite à mão.\nwindow.CELULAS_TERRA = "
        + json.dumps(celulas_js, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
    print(f"salvo: {d / 'celulas.js'}  ({(d / 'celulas.js').stat().st_size / 1024:.0f} KB, {len(linhas)} células de terra)")

    destino = d / "dados_reais.js"
    destino.write_text("// Gerado por scripts/05_exportar_site.py: NÃO edite à mão.\nwindow.DADOS_REAIS = "
                       + json.dumps(saida, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
    print(f"salvo: {destino}  ({destino.stat().st_size / 1024:.0f} KB)")
    print("status:", status)
    for t in terra:
        print(f"  {t['nome']['pt']:34s} célula ({t['celula']['lat']:g},{t['celula']['lon']:g}) dado={t['tem_dado']}")


if __name__ == "__main__":
    main()
