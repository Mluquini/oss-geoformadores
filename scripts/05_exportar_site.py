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

Os textos dos locais (nome, descrição, "útil para testar") vêm de data/exemplo/*.js. Só os TEXTOS:
nenhum número de exemplo é usado.

Como rodar (depois de 01, 02, 03 e 04):
    python scripts/05_exportar_site.py --dados data
"""
import argparse
import json
import math
import sys
from datetime import date
from pathlib import Path

NOMES = dict(temperatura="temperatura", relevo="relevo", gelo="gelo", vento="vento/poeira")


def ler_js_array(caminho):
    """Lê um arquivo `window.X = [ ...JSON... ];` e devolve a lista."""
    linhas = [l for l in Path(caminho).read_text(encoding="utf-8").splitlines() if not l.strip().startswith("//")]
    t = "\n".join(linhas)
    return json.loads(t[t.index("["): t.rindex("]") + 1])


def num(x, casas=1):
    """Número no formato brasileiro (vírgula decimal)."""
    if x is None:
        return None
    s = f"{x:.{casas}f}".replace(".", ",")
    return s.replace("-", "−")


def lista_pt(itens):
    itens = list(itens)
    if not itens:
        return ""
    if len(itens) == 1:
        return itens[0]
    return ", ".join(itens[:-1]) + " e " + itens[-1]


def centro_da_celula(lat, lon, passo=2.0):
    i = min(max(int(math.floor((lat + 90) / passo)), 0), int(180 / passo) - 1)
    j = min(max(int(math.floor((lon + 180) / passo)), 0), int(360 / passo) - 1)
    return -90 + passo / 2 + passo * i, -180 + passo / 2 + passo * j


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
    meta_terra = ler_js_array(d / "exemplo" / "earth_sites.js")
    meta_marte = {m["id"]: m for m in ler_js_array(d / "exemplo" / "mars_sites.js")}
    meta_lua = {m["id"]: m for m in ler_js_array(d / "exemplo" / "moon_sites.js")}
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
                elevacao_m=g["relevo"]["elevacao_media_m"], rugosidade_m=g["relevo"]["rugosidade_desvio_m"],
                declividade_graus=g["relevo"]["declividade_media_graus"], fonte_relevo=g["relevo"]["fonte"],
                frac_neve=g["gelo"]["frac_neve"], frac_T_abaixo_0C=g["gelo"]["frac_T_abaixo_0C"],
                vento_ms=g["vento"]["vento_ms"], poeira_ugm3=g["vento"]["poeira_ugm3"])
            item["notas"] = s["notas"]
            item["ranking"] = dict(marte=s["marte"], lua=s["lua"])
        else:
            item["valores"], item["notas"], item["ranking"] = {}, {}, dict(marte=[], lua=[])
        terra.append(item)

    # ---------------- Marte e Lua ----------------
    def alvo(js, meta, notas, resumo_fn):
        out = []
        for l in js["locais"]:
            md = meta.get(l["id"], {})
            out.append(dict(id=l["id"], nome=l["nome"], descricao=md.get("descricao", ""), lat=l["lat"],
                            lon_leste=l["lon_leste"], coord_verificada=l.get("coord_verificada", False),
                            notas=notas[l["id"]], resumo=resumo_fn(l)))
        return out

    def resumo_marte(l):
        a_ = l["aspectos"]
        p = []
        if a_["relevo"]["valor"] is not None:
            p.append(f"rugosidade do relevo {num(a_['relevo']['valor'], 0)} m")
        if a_["gelo"]["valor"] is not None:
            p.append(f"água no solo {num(a_['gelo']['valor'], 1)}% (em massa)")
        return " · ".join(p)

    def resumo_lua(l):
        a_ = l["aspectos"]
        p = []
        t = a_["temperatura"]
        if t["valor"] is not None:
            s = f"temperatura média {num(t['valor'] - 273.15, 0)} °C"
            if t.get("maximo_K") is not None:
                s += f" (máx. {num(t['maximo_K'] - 273.15, 0)} °C)"
            p.append(s)
        if a_["relevo"]["valor"] is not None:
            p.append(f"rugosidade do relevo {num(a_['relevo']['valor'], 0)} m")
        if a_["gelo"]["valor"] is not None:
            p.append(f"área em armadilha fria {num(100 * a_['gelo']['valor'], 0)}%")
        return " · ".join(p)

    lista_marte = alvo(marte, meta_marte, sim["notas_marte"], resumo_marte)
    lista_lua = alvo(lua, meta_lua, sim["notas_lua"], resumo_lua)

    # ---------------- Status (calculado do que realmente existe) ----------------
    def aspectos_com_dado(notas_por_item):
        return [k for k in ("temperatura", "relevo", "gelo", "vento")
                if any(n.get(k) is not None for n in notas_por_item)]

    asp_terra = aspectos_com_dado([t["notas"] for t in terra if t["tem_dado"]])
    asp_marte = aspectos_com_dado([x["notas"] for x in lista_marte])
    asp_lua = aspectos_com_dado([x["notas"] for x in lista_lua])
    sem_terra = [NOMES[k] for k in ("temperatura", "relevo", "gelo", "vento") if k not in asp_terra]
    n_com = sum(1 for t in terra if t["tem_dado"])
    partes = [f"Dados reais da NASA em {n_com} dos {len(terra)} locais da Terra (média de uma célula de 2°)."]
    if sem_terra:
        partes.append(f"Ainda sem dado na Terra: {lista_pt(sem_terra)}.")
    partes.append(f"Marte usa {lista_pt(NOMES[k] for k in asp_marte)}; a Lua usa {lista_pt(NOMES[k] for k in asp_lua)}.")
    status = dict(texto=" ".join(partes), terra_sem_dado=sem_terra,
                  completo=not sem_terra and {"temperatura", "relevo", "gelo"} <= set(asp_marte))

    # ---------------- Fontes ----------------
    # Só lista a fonte de um aspecto se ele tem dado em alguma célula (não cita produto que falhou).
    def tem_valor(chave, campos):
        return any(c[chave][f] is not None for c in grid["celulas"] for f in campos)
    presentes = dict(
        temperatura=tem_valor("temperatura", ["media_anual_C"]),
        gelo=tem_valor("gelo", ["frac_neve", "frac_T_abaixo_0C"]),
        relevo=tem_valor("relevo", ["rugosidade_desvio_m"]),
        vento=tem_valor("vento", ["vento_ms", "poeira_ugm3"]))
    fontes_terra = []
    for k, v in grid["aspectos"].items():
        if k == "geologia" or not presentes.get(k):
            continue
        fontes_terra.append(f"{k}: {v['produto']} v{v['versao']}")
    comp = grid.get("complementos") or []
    saida = dict(
        gerado_em=date.today().isoformat(), anos_terra=grid.get("anos"), status=status,
        faixas=sim["faixas"], pesos=sim["pesos"],
        fontes=dict(terra=fontes_terra, complementos=comp, marte=produtos_unicos(marte), lua=produtos_unicos(lua)),
        terra=terra, marte=lista_marte, lua=lista_lua)

    destino = d / "dados_reais.js"
    destino.write_text("// Gerado por scripts/05_exportar_site.py: NÃO edite à mão.\nwindow.DADOS_REAIS = "
                       + json.dumps(saida, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
    print(f"salvo: {destino}  ({destino.stat().st_size / 1024:.0f} KB)")
    print("status:", status["texto"])
    for t in terra:
        print(f"  {t['nome']:34s} célula ({t['celula']['lat']:g},{t['celula']['lon']:g}) dado={t['tem_dado']}")


if __name__ == "__main__":
    main()
