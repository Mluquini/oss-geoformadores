#!/usr/bin/env python3
"""
06_baixar_imagens.py: baixa uma foto livre de cada um dos 12 lugares do site e guarda os créditos.

De onde vêm as fotos: Wikimedia Commons (https://commons.wikimedia.org). Escolhemos só arquivos com licença
livre (domínio público, CC BY ou CC BY-SA). Essas licenças exigem dar o crédito: o site mostra autor, licença e
link de cada foto no painel, e os créditos também ficam em assets/lugares/CREDITOS.md.

O que ele faz, em português simples:
  1. Para cada lugar, pergunta ao Commons autor, licença e endereço da foto (API oficial do Commons).
  2. Baixa uma versão de 900 px de largura (leve) para assets/lugares/<id>.jpg.
  3. Escreve data/imagens.js (o que o site lê) e assets/lugares/CREDITOS.md.

Como rodar:
    python scripts/06_baixar_imagens.py
Para trocar uma foto, mude o nome do arquivo em FOTOS e rode de novo (ele apaga a antiga e baixa a nova).
"""
import argparse
import html
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

API = "https://commons.wikimedia.org/w/api.php"
UA = "GloboDeAnalogos-projeto-escolar/1.0"   # nome genérico do programa (sem dados pessoais)
LARGURA = 900

# id do lugar (igual ao de data/exemplo/earth_sites.js) -> arquivo no Wikimedia Commons
FOTOS = {
    "atacama":     "File:Atacama Desert Landscape (iced moment 870-CC).jpg",
    "vales-secos": "File:Wright Valley 2013 02.jpg",
    "lut":         "File:2020-01-02 Iran, Kerman, Dasht-e Lut DSC 9973 DxO.jpg",
    "danakil":     "File:Ethiopia - Dallol.jpg",
    "mauna-kea":   "File:Mauna Kea Summit 2021-06-16 33 (cropped).jpg",
    "holuhraun":   "File:Bárðarbunga Volcano, September 4 2014 - 14959724748.jpg",
    "haughton":    "File:Rovers Red and Black at Houghton Crater Devon Island Canada.jpg",
    "namibe":      "File:Sossusvlei Dune Namib Desert Namibia Luca Galuzzi 2004.JPG",
    "lanzarote":   "File:Cueva de los Verdes, Lanzarote.jpg",
    "lava-beds":   "File:Skull Cave Entrance.JPG",
    "utah-mdrs":   "File:Mars Desert Research Station (10.3897-BDJ.8.e55063) Figure 1 a.jpeg",
    "svalbard":    "File:Haakon VII Land Bockfjorden Trolltindane IMG 5590.JPG",
}

# Só aceitamos estas licenças (todas livres para reuso com crédito)
LICENCAS_OK = ("Public domain", "CC0", "CC BY ", "CC BY-SA ", "PD ")


def pedir(url, binario=False):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    for tentativa in range(4):
        try:
            with urllib.request.urlopen(req, timeout=90) as r:
                dados = r.read()
            return dados if binario else json.loads(dados)
        except urllib.error.HTTPError as e:
            if e.code != 429 or tentativa == 3:
                raise
            time.sleep(30 * (tentativa + 1))   # o servidor pediu calma


def limpar(txt, limite=140):
    """Tira as tags HTML dos campos do Commons e deixa texto simples (cortando numa vírgula + 'et al.' se for longo)."""
    t = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", txt or "")).strip())
    if len(t) <= limite:
        return t
    corte = t[:limite]
    if "," in corte:
        return corte[:corte.rindex(",")] + ", et al."
    return corte.rsplit(" ", 1)[0] + "…"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--projeto", default=None, help="pasta do projeto (padrão: a pasta acima de scripts/)")
    a = ap.parse_args()
    raiz = Path(a.projeto).resolve() if a.projeto else Path(__file__).resolve().parent.parent
    pasta = raiz / "assets" / "lugares"
    pasta.mkdir(parents=True, exist_ok=True)

    creditos = {}
    for lugar, titulo in FOTOS.items():
        params = dict(action="query", titles=titulo, prop="imageinfo", iiprop="url|size|mime|extmetadata",
                      iiurlwidth=str(LARGURA), format="json")
        d = pedir(API + "?" + urllib.parse.urlencode(params))
        pagina = next(iter(d["query"]["pages"].values()))
        if "imageinfo" not in pagina:
            sys.exit(f"ERRO: não achei {titulo} no Commons.")
        ii = pagina["imageinfo"][0]
        m = ii["extmetadata"]
        licenca = limpar(m.get("LicenseShortName", {}).get("value"), 40)
        if not licenca.startswith(LICENCAS_OK):
            sys.exit(f"ERRO: licença '{licenca}' de {titulo} não é uma das aceitas.")
        if ii["mime"] != "image/jpeg":
            sys.exit(f"ERRO: {titulo} não é JPEG ({ii['mime']}).")
        dados = pedir(ii["thumburl"], binario=True)
        if dados[:2] != b"\xff\xd8":
            sys.exit(f"ERRO: o arquivo baixado de {titulo} não é um JPEG de verdade.")
        destino = pasta / f"{lugar}.jpg"
        destino.write_bytes(dados)
        creditos[lugar] = dict(
            arquivo=f"assets/lugares/{lugar}.jpg",
            titulo=titulo.replace("File:", ""),
            autor=limpar(m.get("Artist", {}).get("value"), 100) or "autor não informado",
            licenca=licenca,
            licenca_url=limpar(m.get("LicenseUrl", {}).get("value"), 200),
            origem_url=ii["descriptionurl"],
            largura_original=ii["width"], altura_original=ii["height"])
        print(f"  {lugar:12s} {len(dados) / 1024:5.0f} KB | {licenca:12s} | {creditos[lugar]['autor'][:50]}")
        time.sleep(3)

    (raiz / "data").mkdir(exist_ok=True)
    (raiz / "data" / "imagens.js").write_text(
        "// Gerado por scripts/06_baixar_imagens.py: NÃO edite à mão.\nwindow.IMAGENS_LUGARES = "
        + json.dumps(creditos, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")

    linhas = ["# Créditos das fotos\n",
              "Todas as fotos vêm do [Wikimedia Commons](https://commons.wikimedia.org), com licença livre. "
              "As licenças CC BY e CC BY-SA exigem o crédito abaixo. Reduzimos as fotos para 900 px de largura.\n",
              "| Lugar | Foto | Autor | Licença |", "|---|---|---|---|"]
    for lugar, c in creditos.items():
        lic = f"[{c['licenca']}](<{c['licenca_url']}>)" if c["licenca_url"] else c["licenca"]
        linhas.append(f"| {lugar} | [{c['titulo']}](<{c['origem_url']}>) | {c['autor']} | {lic} |")   # <> por causa dos parênteses
    (pasta / "CREDITOS.md").write_text("\n".join(linhas) + "\n", encoding="utf-8")
    print(f"salvo: {raiz / 'data' / 'imagens.js'} e {pasta / 'CREDITOS.md'}")


if __name__ == "__main__":
    main()
