#!/usr/bin/env python3
"""
04_normalizar.py: junta Terra, Marte e Lua, calcula a semelhança e escreve o relatório.

O que ele faz, em português simples:
  1. Lê data/earth_grid.json, data/mars_sites.json e data/moon_sites.json.
  2. Converte cada aspecto para uma nota de 0 a 1 usando FAIXAS FÍSICAS FIXAS, as MESMAS
     para a Terra, Marte e a Lua (nada de normalizar cada planeta separado).
  3. Semelhança = 100% - distância euclidiana ponderada. Aspectos que faltam (null) ficam de
     fora e os pesos que sobram são renormalizados para somar 1.
  4. Escreve data/similaridade.json (ranking por célula da Terra) e relatorio/data_report.md.

Como rodar:
    python scripts/04_normalizar.py --dados data --relatorio relatorio
    python scripts/04_normalizar.py --dados data --relatorio relatorio --conferir   # sanidade
    python scripts/04_normalizar.py --autoteste
"""
import argparse
import json
import math
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import comum as c  # noqa: E402

ASPECTOS = ["temperatura", "relevo", "gelo", "vento"]

# Pesos ORIGINAIS do desafio (com geologia). A geologia foi retirada do projeto (sem dado comparável),
# então os pesos dos outros aspectos são renormalizados para somar 1. Isso NÃO muda o ranking (a conta já
# renormaliza), só muda `peso_original_coberto`: agora é a fração dos pesos que ficaram no projeto.
PESOS_ORIGINAIS = {
    "marte": dict(temperatura=0.25, relevo=0.20, gelo=0.15, geologia=0.25, vento=0.15),
    "lua":   dict(temperatura=0.30, relevo=0.25, gelo=0.30, geologia=0.15, vento=0.00),
}


def _sem_geologia(p):
    total = sum(v for k, v in p.items() if k != "geologia")
    return {k: v / total for k, v in p.items() if k != "geologia"}


PESOS = {corpo: _sem_geologia(p) for corpo, p in PESOS_ORIGINAIS.items()}

# ---------------------------------------------------------------------
# FAIXAS FÍSICAS FIXAS (iguais para os três corpos). Valores fora da faixa são "cortados" em 0 ou 1.
# ---------------------------------------------------------------------
FAIXAS = {
    "temperatura": dict(
        min=-250.0, max=100.0, unidade="°C (temperatura média anual/diária da superfície)",
        motivo="Cobre de ~ -233 °C (armadilhas frias lunares, ~40 K) até +100 °C. A média anual de superfície mais quente "
               "da Terra fica bem abaixo de +100 °C, então o topo da faixa nunca satura na Terra."),
    "relevo": dict(
        min=0.0, max=3000.0, unidade="m (desvio padrão da elevação numa janela de ~2°)",
        motivo="0 = planície perfeita. 3000 m já é o de Valles Marineris (cânion de ~7 km); acima disso a nota satura em 1."),
    "gelo": dict(
        min=0.0, max=1.0, unidade="fração 0-1",
        motivo="Terra = média de (fração do tempo com neve) e (fração do tempo com T < 0 °C). Lua = fração da área com "
               "temperatura máxima < 110 K (armadilha fria). Marte = % em massa de água do GRS dividido por 100 (100% = gelo puro). "
               "ATENÇÃO: as três quantidades têm significados físicos DIFERENTES (neve na superfície x gelo enterrado x área "
               "fria). É um proxy comum, não uma medida idêntica; revisar com a equipe."),
    "vento": dict(
        min=0.0, max=12.0, unidade="m/s (velocidade média do vento no nível mais baixo do MERRA-2, ~50-70 m)",
        motivo="Nas células calculadas as médias anuais do MERRA-2 vão de ~4 a ~15 m/s; acima de 12 a nota satura em 1. "
               "Não é o vento a 10 m. Marte e Lua não têm medição comparável (o vento da Terra não entra em nenhum ranking)."),
}
# Faixas fixas dos aspectos EXTRAS, usados só no modo "Planejar missão" (o alvo é definido pelo usuário e comparado
# com as células da Terra). Não entram na comparação Terra x Marte/Lua. Escolhidas olhando os valores reais das células
# calculadas (com folga), e NÃO são limites físicos absolutos.
FAIXAS_BUSCA = {
    "amplitude": dict(
        min=0.0, max=60.0, unidade="°C (variação ao longo do ano: máx. − mín. das médias mensais)",
        motivo="Nas células calculadas vai de ~5 a ~49 °C; 60 dá folga. Mede variação ao longo do ANO na Terra, não o ciclo dia/noite."),
    "poeira": dict(
        min=0.0, max=300.0, unidade="µg/m³ (poeira em suspensão, média anual)",
        motivo="Nas células calculadas vai de ~0,4 a ~400 µg/m³ (95% abaixo de ~200); acima de 300 a nota satura em 1."),
    "geologia": dict(
        min=0.99, max=1.10, unidade="índice de quartzo do ASTER (sem unidade)",
        motivo="Nas células calculadas vai de ~0,993 a ~1,099. Só existe para a Terra: serve para um alvo personalizado "
               "('rocha rica em quartzo'), e NÃO é comparável com Marte e a Lua."),
}

GEOLOGIA_NOTA = (
    "Geologia foi RETIRADA do projeto: não há dado comparável entre os três corpos (Terra: índice de quartzo do ASTER; "
    "Lua: Christiansen Feature do Diviner; Marte: sem dado), e uma faixa 0-1 comum exigiria calibração com espectros de "
    "laboratório. Os pesos originais do desafio (Marte 25%, Lua 15%) foram redistribuídos entre os outros aspectos. "
    "Os valores brutos de geologia seguem guardados nos JSONs, sem uso."
)


def normalizar(x, aspecto):
    f = FAIXAS.get(aspecto)
    if f is None or x is None:
        return None
    return max(0.0, min(1.0, (x - f["min"]) / (f["max"] - f["min"])))


def semelhanca(terra, alvo, pesos):
    """terra, alvo: dict aspecto -> nota 0-1 ou None. Devolve dict ou None se nenhum aspecto em comum."""
    usados = [a for a in ASPECTOS if pesos[a] > 0 and terra.get(a) is not None and alvo.get(a) is not None]
    if not usados:
        return None
    soma = sum(pesos[a] for a in usados)
    d = math.sqrt(sum(pesos[a] / soma * (terra[a] - alvo[a]) ** 2 for a in usados))
    return dict(semelhanca=round(100.0 * (1.0 - d), 1), aspectos_usados=usados,
                peso_original_coberto=round(soma, 3))


# ---------------------------------------------------------------------
# Conversão de cada corpo para notas 0-1
# ---------------------------------------------------------------------
def notas_terra(cel):
    gelo_parts = [v for v in (cel["gelo"]["frac_neve"], cel["gelo"]["frac_T_abaixo_0C"]) if v is not None]
    gelo = sum(gelo_parts) / len(gelo_parts) if gelo_parts else None
    return dict(
        temperatura=normalizar(cel["temperatura"]["media_anual_C"], "temperatura"),
        relevo=normalizar(cel["relevo"]["rugosidade_desvio_m"], "relevo"),
        gelo=normalizar(gelo, "gelo"),
        vento=normalizar(cel["vento"]["vento_ms"], "vento"))


def notas_marte(local):
    a = local["aspectos"]
    h2o = a["gelo"]["valor"]
    t = a["temperatura"]["valor"]
    return dict(
        temperatura=None if t is None else normalizar(t - 273.15, "temperatura"),
        relevo=normalizar(a["relevo"]["valor"], "relevo"),
        gelo=None if h2o is None else normalizar(h2o / 100.0, "gelo"),
        vento=None)


def notas_lua(local):
    a = local["aspectos"]
    t = a["temperatura"]["valor"]
    return dict(
        temperatura=None if t is None else normalizar(t - 273.15, "temperatura"),
        relevo=normalizar(a["relevo"]["valor"], "relevo"),
        gelo=normalizar(a["gelo"]["valor"], "gelo"),
        vento=None)


def centros_dos_locais(pasta_dados):
    """Centro da célula de 2° de cada um dos locais do site (para saber quais rankings guardar)."""
    arq = Path(pasta_dados) / "textos" / "earth_sites.js"
    if not arq.exists():
        return set()
    linhas = [l for l in arq.read_text(encoding="utf-8").splitlines() if not l.strip().startswith("//")]
    t = "\n".join(linhas)
    locais = json.loads(t[t.index("["): t.rindex("]") + 1])
    def centro(v, base):
        i = min(max(int(math.floor((v + base) / 2.0)), 0), int(2 * base / 2.0) - 1)
        return -base + 1.0 + 2.0 * i
    return {(centro(l["lat"], 90), centro(l["lon"], 180)) for l in locais}


def ranking(terra_notas, alvos, pesos):
    itens = []
    for al in alvos:
        s = semelhanca(terra_notas, al["notas"], pesos)
        if s:
            itens.append(dict(id=al["id"], nome=al["nome"], **s))
    itens.sort(key=lambda x: -x["semelhanca"])
    return itens


# ---------------------------------------------------------------------
# Autoteste
# ---------------------------------------------------------------------
def autoteste():
    print("Autoteste da normalização e da semelhança")
    assert normalizar(-250, "temperatura") == 0 and normalizar(100, "temperatura") == 1
    assert normalizar(5000, "relevo") == 1 and normalizar(-5, "relevo") == 0
    assert normalizar(1.0, "geologia") is None and normalizar(None, "gelo") is None
    p = PESOS["marte"]
    iguais = dict(temperatura=.5, relevo=.5, gelo=.5, vento=.5)
    assert semelhanca(iguais, iguais, p)["semelhanca"] == 100.0
    # Opostos em todos os aspectos disponíveis -> 0 %
    zeros = dict(temperatura=0, relevo=0, gelo=0, vento=0)
    uns = dict(temperatura=1, relevo=1, gelo=1, vento=1)
    assert semelhanca(zeros, uns, p)["semelhanca"] == 0.0
    # Pesos renormalizados: só relevo e gelo disponíveis em Marte (pesos 0,20 e 0,15 do original); diferença 0,5 e 0
    t = dict(temperatura=.9, relevo=.5, gelo=.0, vento=.1)
    m = dict(temperatura=None, relevo=1.0, gelo=.0, vento=None)
    s = semelhanca(t, m, p)
    esperado = round(100 * (1 - math.sqrt(0.20 / 0.35 * 0.25)), 1)
    assert s["semelhanca"] == esperado and s["aspectos_usados"] == ["relevo", "gelo"] and s["peso_original_coberto"] == 0.467, s   # 0,35 de 0,75 (sem a geologia)
    # Lua: vento tem peso 0, nunca entra
    s = semelhanca(uns, uns, PESOS["lua"])
    assert "vento" not in s["aspectos_usados"]
    # Nenhum aspecto em comum -> None
    assert semelhanca(dict(temperatura=1), dict(gelo=1), p) is None
    # Pesos somam 1, e a geologia não existe mais
    for k in PESOS:
        assert abs(sum(PESOS[k].values()) - 1) < 1e-9 and "geologia" not in PESOS[k], k
    assert abs(PESOS["marte"]["relevo"] - 0.20 / 0.75) < 1e-12 and abs(PESOS["lua"]["temperatura"] - 0.30 / 0.85) < 1e-12
    print("  OK")


# ---------------------------------------------------------------------
# Conferência de sanidade (para os alunos)
# ---------------------------------------------------------------------
CONFERENCIAS = [
    # nome, lat, lon, [(descrição, caminho, operador, limite)]
    ("Deserto do Lut (Irã)", 30.5, 58.5, [("muito quente: média anual > 20 °C", ("temperatura", "media_anual_C"), ">", 20),
                                          ("sem neve: frac_neve < 0,05", ("gelo", "frac_neve"), "<", 0.05)]),
    ("Interior da Antártida", -80.0, 100.0, [("muito frio: média anual < -35 °C", ("temperatura", "media_anual_C"), "<", -35),
                                              ("muito gelo: frac_neve > 0,8", ("gelo", "frac_neve"), ">", 0.8),
                                              ("quase sempre abaixo de 0 °C: frac_T_abaixo_0C > 0,9", ("gelo", "frac_T_abaixo_0C"), ">", 0.9)]),
    ("Saara (Argélia/Líbia)", 25.0, 10.0, [("quente: média anual > 20 °C", ("temperatura", "media_anual_C"), ">", 20),
                                           ("sem neve: frac_neve < 0,05", ("gelo", "frac_neve"), "<", 0.05)]),
    ("Himalaia (Nepal/Tibete sul)", 27.0, 87.0, [("relevo muito rugoso: desvio da elevação > 1000 m", ("relevo", "rugosidade_desvio_m"), ">", 1000)]),
    ("Planalto tibetano", 29.0, 87.0, [("muito alto: elevação média > 3000 m", ("relevo", "elevacao_media_m"), ">", 3000)]),
    ("Amazônia", -3.0, -61.0, [("quente e estável: média anual entre 22 e 32 °C", ("temperatura", "media_anual_C"), "between", (22, 32)),
                               ("sem neve: frac_neve < 0,02", ("gelo", "frac_neve"), "<", 0.02)]),
    ("Groenlândia (interior)", 72.0, -40.0, [("muito frio: média anual < -15 °C", ("temperatura", "media_anual_C"), "<", -15),
                                             ("muito gelo: frac_neve > 0,7", ("gelo", "frac_neve"), ">", 0.7)]),
]


def _ok(v, op, lim):
    if v is None:
        return None
    if op == ">":
        return v > lim
    if op == "<":
        return v < lim
    if op == "between":
        return lim[0] <= v <= lim[1]
    raise ValueError(op)


def conferir(earth):
    print("\nCONFERÊNCIA DE SANIDADE (células mais próximas; são sinais de alerta, não prova)")
    cel = earth["celulas"]
    if not cel:
        print("  earth_grid.json não tem células."); return
    for nome, lat, lon, regras in CONFERENCIAS:
        k = min(cel, key=lambda x: (x["lat"] - lat) ** 2 + ((x["lon"] - lon + 180) % 360 - 180) ** 2)
        if abs(k["lat"] - lat) > 2.5 or abs(k["lon"] - lon) > 2.5:
            print(f"  [fora da região rodada] {nome}"); continue
        print(f"  {nome}  (célula {k['lat']:g}, {k['lon']:g})")
        for desc, (g, f), op, lim in regras:
            v = k[g][f]
            ok = _ok(v, op, lim)
            marca = "SEM DADO" if ok is None else ("ok      " if ok else "ATENÇÃO ")
            print(f"     {marca} {desc}  -> valor = {v}")


# ---------------------------------------------------------------------
# Relatório
# ---------------------------------------------------------------------
def produtos_de(local_json):
    """Produtos usados (sem repetir por local) e motivos dos campos nulos."""
    vistos = {}
    nulos = {}
    for l in local_json["locais"]:
        for asp, f in l["aspectos"].items():
            if asp == "geologia":      # retirada do projeto
                continue
            if f["valor"] is None:
                nulos.setdefault(asp, set()).add(f["motivo_nulo"])
            else:
                chave = (asp, f["produto"], f["instrumento"], f["versao"], f["periodo"])
                v = vistos.setdefault(chave, dict(resolucao=f["resolucao"], links=set(), n=0))
                v["links"].add(f["link"]); v["n"] += 1
    return vistos, nulos


def tabela(linhas, cab):
    s = "| " + " | ".join(cab) + " |\n|" + "---|" * len(cab) + "\n"
    for l in linhas:
        s += "| " + " | ".join(str(x).replace("\n", " ").replace("|", "/") for x in l) + " |\n"
    return s


def escrever_relatorio(earth, marte, lua, pasta):
    md = [f"# Relatório de dados: Globo de Análogos\n\nGerado automaticamente por `scripts/04_normalizar.py` em {date.today().isoformat()}.\n"]
    md.append("> Tudo aqui vem dos metadados que os scripts 01, 02 e 03 gravaram junto com os números. "
              "Quando um campo está `null`, o motivo aparece na seção 3.\n")
    # 1. Produtos
    md.append("## 1. Produtos usados\n")
    linhas = []
    if earth:
        for asp, m in earth["aspectos"].items():
            if asp == "geologia":
                continue
            linhas.append(["Terra", asp, m["produto"], m["versao"], m["instrumento"], m["resolucao"],
                           "ver nota abaixo", m["link"]])
    for corpo, js in (("Marte", marte), ("Lua", lua)):
        if js:
            v, _ = produtos_de(js)
            for (asp, prod, inst, ver, per), info in sorted(v.items()):
                linhas.append([corpo, asp, prod, ver, inst, info["resolucao"], per, " ; ".join(sorted(info["links"]))])
    md.append(tabela(linhas, ["Corpo", "Aspecto", "Produto", "Versão", "Instrumento", "Resolução", "Período", "Link"]))
    if earth:
        md.append(f"\nPeríodo dos dados da Terra (MODIS e MERRA-2): anos {earth.get('anos')}. SRTM é de fev/2000; "
                  "(O ASTER GED foi baixado, mas a geologia foi retirada do projeto.)\n")
        md.append("**Complementos (fora da NASA):** " + "; ".join(earth.get("complementos", [])) + "\n")
        md.append("### Métodos da Terra\n")
        for asp, m in earth["aspectos"].items():
            if asp != "geologia":
                md.append(f"- **{asp}**: {m['metodo']}\n")
    # 2. Normalização
    md.append("\n## 2. Normalização e semelhança\n")
    md.append(tabela([[a, f"{FAIXAS[a]['min']:g} a {FAIXAS[a]['max']:g}", FAIXAS[a]["unidade"], FAIXAS[a]["motivo"]]
                      for a in ASPECTOS if FAIXAS.get(a)], ["Aspecto", "Faixa fixa", "Unidade", "Motivo"]))
    md.append(f"\n**Geologia:** {GEOLOGIA_NOTA}\n")
    def _pct(p):
        return ", ".join(f"{a} {100 * p[a]:.1f}%" for a in ASPECTOS)
    md.append("\n`semelhança = 100% × (1 − √(Σ pesoʹ × (nota_Terra − nota_alvo)²))`, em que `pesoʹ` são os pesos base dos "
              "aspectos disponíveis nos DOIS lados, renormalizados para somar 1. "
              f"Pesos base Marte: {_pct(PESOS['marte'])}. Pesos base Lua: {_pct(PESOS['lua'])}. "
              "(São os pesos do desafio sem a geologia, renormalizados.)\n")
    md.append("\n**Cada ranking traz `peso_original_coberto`**: a fração dos pesos originais que de fato entrou na conta. "
              "Com Marte, hoje, só relevo e gelo entram (47% do peso); com a Lua entram temperatura, relevo e gelo (100% do peso). "
              "Quanto menor esse número, menos a % de semelhança diz sobre o todo.\n")
    # 3. Nulos
    md.append("\n## 3. O que NÃO foi possível obter, e por quê\n")
    for corpo, js in (("Marte", marte), ("Lua", lua)):
        if js:
            _, nulos = produtos_de(js)
            for asp, motivos in sorted(nulos.items()):
                for mt in sorted(motivos):
                    md.append(f"- **{corpo} / {asp}:** {mt}\n")
    if earth:
        if earth.get("problemas"):
            for k, v in earth["problemas"].items():
                md.append(f"- **Terra / {k}:** falhou na execução: `{v}`\n")
        cel = earth["celulas"]
        if cel:
            md.append(f"\nCélulas da Terra sem valor (de {len(cel)}):\n\n")
            cont = []
            for nome, get in (("temperatura média", lambda x: x["temperatura"]["media_anual_C"]),
                              ("rugosidade do relevo", lambda x: x["relevo"]["rugosidade_desvio_m"]),
                              ("fração de neve", lambda x: x["gelo"]["frac_neve"]),
                              ("vento", lambda x: x["vento"]["vento_ms"])):
                n = sum(1 for x in cel if get(x) is None)
                cont.append([nome, n, f"{100 * n / len(cel):.0f}%"])
            md.append(tabela(cont, ["Campo", "Células null", "%"]))
    md.append("\n- **Marte e Lua / coordenadas:** os centros dos locais vêm do Gazetteer da IAU (USGS), campos center_lat/center_lon "
              "(`coord_verificada: true` nos JSONs). Meridiani Planum é o centro da planície inteira, não o ponto de pouso do Opportunity.\n")
    md.append("- **Lua / LEND:** não usado. A pasta de dados derivados (`lro-l-lend-4_5-rdr-v1`) redirecionou para a de dados brutos "
              "(`lro-l-lend-2-edr-v1`) e não verifiquei nenhum mapa derivado de supressão de nêutrons.\n")
    # 4. Limitações
    md.append("""
## 4. Limitações científicas

- **Gravidade, atmosfera e radiação não são reproduzidas na Terra.** Marte tem 38% da gravidade da Terra, ar ~100x mais fino e
  muito mais radiação; a Lua tem 17% da gravidade, quase nenhuma atmosfera e radiação direta. Nenhuma célula da Terra imita isso.
- **Resoluções muito diferentes:** Terra em células de 2° a partir de pixels de 1 a 5 km; Marte e Lua em janelas circulares de
  1° de raio ao redor de UM ponto, a partir de mapas de ~1 a 4 km (relevo), 5° (água do GRS, pegada ~300 km) e 0,5° (temperatura
  lunar). A rugosidade é o desvio padrão da elevação na janela e muda com a resolução do pixel.
- **Grandezas diferentes sob o mesmo nome:** "gelo" (neve na superfície x água enterrada x área fria), "temperatura" (LST do MODIS
  dia+noite / 2 x temperatura bolométrica média x temperatura anual modelada do PRP) e "relevo" (σ da elevação em janelas
  de tamanhos parecidos mas resoluções distintas).
- **Relevo da Terra:** o SRTMGL30 (NASA) vai de 90°N a 60°S, mas o radar só cobriu 60°N a 56°S; acima de 60°N os valores
  são quase com certeza do GTOPO30 (USGS) embutido no produto. No extremo sul (McMurdo) o relevo é do ETOPO 2022 (NOAA),
  que não é produto NASA. **Vento da Terra:** o MERRA-2 é uma reanálise (modelo corrigido por observações), não medida direta.
- **Temperatura da Lua nos polos** vem do PRP, que é um produto derivado/modelado pela equipe Diviner, não uma medição direta.
- **Marte:** só relevo (MOLA) e água (GRS) foram obtidos. O GRS tem pegada de ~300 km e vê só ~1 m de profundidade; o produto
  suavizado usado aqui não cobre as latitudes mais altas.
- **Neve do MODIS:** os meses de noite polar (código 211) não têm dado e são descartados; a fração de neve polar pode ser
  subestimada. Células com poucos meses válidos ficam `null`.
- **Terra, 1 ano:** por padrão 1 ano de MODIS e MERRA-2 (ver `anos`); não é uma climatologia de décadas.
- **Os valores normalizados dependem das faixas escolhidas** (seção 2). Outras faixas dão outros rankings.
""")
    p = Path(pasta); p.mkdir(parents=True, exist_ok=True)
    (p / "data_report.md").write_text("".join(md), encoding="utf-8")
    print(f"  salvo: {p / 'data_report.md'}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--dados", default="data")
    ap.add_argument("--relatorio", default="relatorio")
    ap.add_argument("--conferir", action="store_true")
    ap.add_argument("--limite-ranking", type=int, default=2000,
                    help="se houver mais células que isto (ex.: grade do mundo todo), o ranking por célula só é gravado "
                         "para as células dos locais do site, para o similaridade.json não ficar gigante (padrão: 2000)")
    ap.add_argument("--autoteste", action="store_true")
    a = ap.parse_args()
    if a.autoteste:
        autoteste(); return
    d = Path(a.dados)

    def abre(nome):
        p = d / nome
        return json.load(open(p, encoding="utf-8")) if p.exists() else None
    earth, marte, lua = abre("earth_grid.json"), abre("mars_sites.json"), abre("moon_sites.json")
    if not (marte and lua):
        sys.exit("Faltam data/mars_sites.json e/ou data/moon_sites.json. Rode antes 02_marte.py e 03_lua.py.")

    alvos_m = [dict(id=l["id"], nome=l["nome"], notas=notas_marte(l)) for l in marte["locais"]]
    alvos_l = [dict(id=l["id"], nome=l["nome"], notas=notas_lua(l)) for l in lua["locais"]]
    saida = dict(
        gerado_por="scripts/04_normalizar.py", faixas={k: v for k, v in FAIXAS.items() if v},
        geologia_nota=GEOLOGIA_NOTA, pesos=PESOS, faixas_busca=FAIXAS_BUSCA,
        notas_marte={x["id"]: x["notas"] for x in alvos_m}, notas_lua={x["id"]: x["notas"] for x in alvos_l},
        celulas=[])
    if earth:
        for cel in earth["celulas"]:
            n = notas_terra(cel)
            if all(v is None for v in n.values()):
                continue
            saida["celulas"].append(dict(
                lat=cel["lat"], lon=cel["lon"], notas={k: (None if v is None else round(v, 4)) for k, v in n.items()},
                marte=ranking(n, alvos_m, PESOS["marte"]), lua=ranking(n, alvos_l, PESOS["lua"])))
        print(f"  {len(saida['celulas'])} células da Terra com ao menos um aspecto")
        if len(saida["celulas"]) > a.limite_ranking:
            manter = centros_dos_locais(d)
            antes = len(saida["celulas"])
            saida["celulas"] = [c_ for c_ in saida["celulas"] if (c_["lat"], c_["lon"]) in manter]
            saida["ranking_reduzido"] = f"só as {len(saida['celulas'])} células dos locais do site (de {antes}); veja --limite-ranking"
            print(f"  AVISO: {antes} células passam do limite ({a.limite_ranking}); o ranking por célula foi gravado só para "
                  f"as {len(saida['celulas'])} dos locais do site. A busca do site usa data/celulas.js e não depende disto.")
    else:
        print("  AVISO: data/earth_grid.json não existe ainda (rode 01_terra.py). Só o relatório de Marte/Lua será gerado.")
    c.salvar_json(saida, d / "similaridade.json")
    escrever_relatorio(earth, marte, lua, a.relatorio)
    if a.conferir and earth:
        conferir(earth)


if __name__ == "__main__":
    main()
