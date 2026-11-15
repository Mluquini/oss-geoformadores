"""
Funções que os outros scripts usam (baixar arquivo, ler "etiqueta" do PDS,
medir uma janela ao redor de um local, salvar JSON).

Este arquivo NÃO é para rodar sozinho: ele é importado pelos scripts 01 a 04.
"""
import json
import math
import os
import sys
import time
from pathlib import Path

import numpy as np
import requests

# ---------------------------------------------------------------------
# Raio da janela ao redor de cada local: 1 grau de arco => janela de ~2 graus
# (no equador de Marte ~ 59 km de raio; na Lua ~ 30 km de raio).
# Usamos distância angular (círculo) e não um quadrado, para funcionar
# também perto dos polos, onde a longitude "se aperta".
# ---------------------------------------------------------------------
RAIO_JANELA_GRAUS = 1.0


def pasta_do_projeto(args_pasta=None):
    """Raiz do projeto: pelo argumento --projeto, ou a pasta acima de scripts/."""
    if args_pasta:
        return Path(args_pasta).resolve()
    return Path(__file__).resolve().parent.parent


def baixar(url, destino, tamanho_esperado=None):
    """Baixa `url` para `destino` (com barra de progresso simples).
    Se o arquivo já existe com o tamanho certo, não baixa de novo."""
    destino = Path(destino)
    destino.parent.mkdir(parents=True, exist_ok=True)
    if destino.exists() and (tamanho_esperado is None or destino.stat().st_size == tamanho_esperado):
        print(f"  [já existe] {destino.name}")
        return destino
    print(f"  baixando {url}")
    tmp = destino.with_suffix(destino.suffix + ".parte")
    with requests.get(url, stream=True, timeout=60) as r:
        r.raise_for_status()
        total = int(r.headers.get("content-length", 0))
        feito = 0
        ultimo = time.time()
        with open(tmp, "wb") as f:
            for bloco in r.iter_content(chunk_size=1 << 20):
                f.write(bloco)
                feito += len(bloco)
                if time.time() - ultimo > 5 and total:
                    print(f"    {feito / 1e6:.0f}/{total / 1e6:.0f} MB")
                    ultimo = time.time()
    if total and feito != total:
        raise IOError(f"Download incompleto de {url}: {feito} de {total} bytes")
    tmp.rename(destino)
    if tamanho_esperado is not None and destino.stat().st_size != tamanho_esperado:
        raise IOError(f"Tamanho inesperado em {destino}")
    return destino


def ler_etiqueta_pds3(caminho_ou_texto):
    """Lê uma etiqueta (.lbl) do PDS3 e devolve um dicionário CHAVE -> valor (texto).
    Se uma chave aparece mais de uma vez, vale a primeira."""
    if isinstance(caminho_ou_texto, (str, Path)) and Path(str(caminho_ou_texto)).exists():
        texto = Path(caminho_ou_texto).read_text(errors="ignore")
    else:
        texto = str(caminho_ou_texto)
    d = {}
    for linha in texto.splitlines():
        if "=" in linha and not linha.strip().startswith("/*"):
            k, v = linha.split("=", 1)
            k = k.strip()
            v = v.split("<")[0].split("/*")[0].strip().strip('"').strip()
            if k and k not in d:
                d[k] = v
    return d


def numero(txt):
    return float(str(txt).split()[0])


def distancia_angular_graus(lat1, lon1, lat2, lon2):
    """Distância no círculo máximo (em graus) entre pontos; aceita arrays."""
    p1, p2 = np.radians(lat1), np.radians(lat2)
    dl = np.radians(lon2 - lon1)
    c = np.sin(p1) * np.sin(p2) + np.cos(p1) * np.cos(p2) * np.cos(dl)
    return np.degrees(np.arccos(np.clip(c, -1.0, 1.0)))


def janela_circular(lat_grade, lon_grade, lat0, lon0, raio=RAIO_JANELA_GRAUS):
    """Máscara booleana dos pixels a menos de `raio` graus do ponto (lat0, lon0).
    lat_grade e lon_grade devem ser arrays com formato compatível (broadcast)."""
    return distancia_angular_graus(lat_grade, lon_grade, lat0, lon0) <= raio


def carregar_grade_cilindrica(caminho, linhas, colunas, dtype):
    """Lê um arquivo binário de mapa (sem cabeçalho) como matriz [linhas, colunas]."""
    a = np.fromfile(caminho, dtype=dtype)
    if a.size != linhas * colunas:
        raise ValueError(f"{caminho}: esperava {linhas}x{colunas} valores, achei {a.size}")
    return a.reshape(linhas, colunas)


def estatisticas_janela(grade, lat_topo, lon_oeste, ppd, lat0, lon0, valido=None, raio=RAIO_JANELA_GRAUS):
    """Estatísticas dos pixels de `grade` dentro de uma janela circular.

    grade     : matriz [linhas, colunas] já em unidades físicas (float)
    lat_topo  : latitude da borda de cima (ex.: 90)
    lon_oeste : longitude da borda esquerda (ex.: 0, em graus leste)
    ppd       : pixels por grau
    valido    : matriz booleana (True = pixel bom); se None, usa tudo que não é NaN
    Devolve dicionário com média, desvio padrão (rugosidade), mínimo, máximo,
    declividade média (graus) e quantos pixels entraram. Se não houver pixel
    válido, tudo é None.
    """
    n_lin, n_col = grade.shape
    # Recorta só o retângulo que pode conter a janela (rápido):
    dlat = raio + 1.0 / ppd
    i0 = max(0, int(math.floor((lat_topo - (lat0 + dlat)) * ppd)))
    i1 = min(n_lin, int(math.ceil((lat_topo - (lat0 - dlat)) * ppd)))
    cos = max(math.cos(math.radians(min(abs(lat0) + raio, 89.9))), 0.02)
    dlon = min(180.0, (raio + 1.0 / ppd) / cos)
    if abs(lat0) + raio >= 90:   # janela inclui o polo: todas as longitudes
        j_idx = np.arange(n_col)
    else:
        centro_j = ((lon0 - lon_oeste) % 360.0) * ppd
        j_idx = np.arange(int(math.floor(centro_j - dlon * ppd)), int(math.ceil(centro_j + dlon * ppd)) + 1) % n_col
    lat_c = lat_topo - (np.arange(i0, i1) + 0.5) / ppd
    lon_c = lon_oeste + (j_idx + 0.5) / ppd
    sub = grade[i0:i1][:, j_idx].astype(float)
    ok = np.isfinite(sub) if valido is None else (valido[i0:i1][:, j_idx] & np.isfinite(sub))
    dentro = janela_circular(lat_c[:, None], lon_c[None, :], lat0, lon0, raio) & ok
    n = int(dentro.sum())
    if n == 0:
        return dict(media=None, desvio=None, minimo=None, maximo=None, declividade_media_graus=None, n_pixels=0)
    vals = sub[dentro]
    # Declividade: gradiente da elevação (m) sobre o tamanho do pixel (m).
    return dict(
        media=float(vals.mean()),
        desvio=float(vals.std()),
        minimo=float(vals.min()),
        maximo=float(vals.max()),
        n_pixels=n,
        _sub=sub, _lat=lat_c, _dentro=dentro,   # usados por quem quiser calcular declividade
    )


def reduzir_grade(grade, fator):
    """Junta blocos de fator x fator pixels (média) para deixar o mapa mais grosso. Usada para medir a declividade
    na MESMA escala em Marte, na Lua e na Terra (a inclinação depende do tamanho do pixel)."""
    n_l, n_c = grade.shape
    n_l, n_c = (n_l // fator) * fator, (n_c // fator) * fator
    return grade[:n_l, :n_c].reshape(n_l // fator, fator, n_c // fator, fator).mean(axis=(1, 3))


def declividade_media_graus(sub, lat_c, dentro, ppd, raio_corpo_m):
    """Declividade média (graus) dentro da janela, a partir do gradiente da elevação.
    sub: elevações em metros [linhas, colunas]; raio_corpo_m: raio do planeta/lua (m)."""
    passo_lat_m = math.radians(1.0 / ppd) * raio_corpo_m
    passo_lon_m = passo_lat_m * np.cos(np.radians(lat_c))[:, None]
    with np.errstate(invalid="ignore", divide="ignore"):
        dz_dlat = np.gradient(sub, axis=0) / passo_lat_m
        dz_dlon = np.gradient(sub, axis=1) / np.maximum(passo_lon_m, 1e-6)
        decl = np.degrees(np.arctan(np.hypot(dz_dlat, dz_dlon)))
    # Bordas do recorte têm gradiente pouco confiável: tira 1 pixel de borda.
    interior = np.zeros_like(dentro)
    interior[1:-1, 1:-1] = dentro[1:-1, 1:-1]
    v = decl[interior & np.isfinite(decl)]
    return float(v.mean()) if v.size else None


def salvar_json(obj, caminho):
    caminho = Path(caminho)
    caminho.parent.mkdir(parents=True, exist_ok=True)
    with open(caminho, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)
    print(f"  salvo: {caminho}")


def campo(valor, produto, instrumento, versao, periodo, resolucao, link, unidade, metodo=None, motivo_nulo=None,
          papel="oficial", **extra):
    """Monta o registro padrão de um valor: sempre com produto, instrumento, versão,
    período, resolução e link. Se `valor` for None, `motivo_nulo` é obrigatório."""
    if valor is None and not motivo_nulo:
        raise ValueError("Valor nulo precisa de motivo_nulo")
    d = dict(valor=None if valor is None else (round(valor, 4) if isinstance(valor, float) else valor),
             unidade=unidade, produto=produto, instrumento=instrumento, versao=versao,
             periodo=periodo, resolucao=resolucao, link=link, papel=papel)
    if metodo:
        d["metodo"] = metodo
    if motivo_nulo:
        d["motivo_nulo"] = motivo_nulo
    d.update(extra)
    return d


def aviso(msg):
    print(f"  AVISO: {msg}", file=sys.stderr)
