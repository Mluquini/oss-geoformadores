# 🌍 Globo de Análogos

Projeto para o **NASA Space Apps Challenge 2026**, desafio **Terrestrial Analogs**.

Um globo 3D da Terra: você clica num lugar (deserto, polo, vulcão ou caverna) e o site mostra quais lugares de **Marte** ou da **Lua** são mais parecidos com ele, com a % de semelhança.

> ✅ O site já usa **dados reais da NASA** nos 12 locais da Terra, nos 6 de Marte e nos 4 da Lua. ⚠️ Mas ainda **faltam** o vento e a poeira da Terra (MERRA-2) e a geologia não entra no cálculo. O próprio site mostra um aviso com o que falta, e ele é gerado a partir dos dados: se um dia tudo estiver completo, o aviso muda sozinho.

## Como abrir

**Jeito 1, duplo clique:** abra o arquivo `index.html`. É preciso estar conectado à internet, porque o globo e o gráfico vêm de lá.

**Jeito 2, servidor local:** abra um terminal nesta pasta e rode:

```bash
python -m http.server
```

Depois abra <http://localhost:8000> no navegador. No Linux ou no Mac, talvez o comando seja `python3`.

## Arquivos

| Arquivo | Para que serve |
|---|---|
| `index.html` | O esqueleto da página (o que aparece) |
| `style.css` | O visual (cores, tamanhos, celular) |
| `script.js` | O cérebro (globo, painel, gráfico de barras). Não calcula a semelhança: lê o ranking pronto |
| `data/dados_reais.js` | **Os dados que o site lê.** Gerado por `scripts/05_exportar_site.py`: não edite à mão |
| `data/imagens.js` e `assets/lugares/` | As **fotos** dos 12 lugares e os créditos (autor, licença, link). Gerados por `scripts/06_baixar_imagens.py`. Todas do Wikimedia Commons, com licença livre: veja `assets/lugares/CREDITOS.md` |
| `data/exemplo/*.js` | Só os **textos** dos locais (nome, descrição, "útil para testar"). Os números de exemplo que estavam aqui não são mais usados |
| `scripts/` | O pipeline que baixa e processa os dados da NASA (veja mais abaixo) |

## Como atualizar os dados e os textos

- **Mudar um texto** (nome, descrição, "útil para testar") de um local da Terra, de Marte ou da Lua: edite o arquivo em `data/exemplo/` e rode de novo o `05_exportar_site.py`.
- **Atualizar os números:** rode os scripts do pipeline em ordem (`02`, `03`, `01`, `04`) e depois o `05`. O passo a passo está em [relatorio/COLAB.md](relatorio/COLAB.md).
- **Adicionar um local novo na Terra:** acrescente o bloco no `data/exemplo/earth_sites.js` (só os textos, `lat`, `lon` e `tipo`; o `tipo` é `deserto`, `polar`, `vulcânico` ou `caverna`). Se o local estiver fora das zonas já calculadas, inclua-o em `LOCAIS_ESTRATEGICOS` no `scripts/01_terra.py` e rode o `01` de novo.
- **Por que `.js` e não `.json`?** Por segurança, os navegadores não deixam a página ler arquivos `.json` quando ela é aberta com duplo clique. Por isso `dados_reais.js` começa com `window.DADOS_REAIS = `. Tudo que vem depois é JSON normal.
- **Mudar os pesos ou as faixas do cálculo:** edite `PESOS` e `FAIXAS` no `scripts/04_normalizar.py` e rode o `04` e o `05`. A seção "Como calculamos" do site se atualiza sozinha (a tabela de pesos do `index.html` é fixa: atualize-a junto).

## Como calculamos

```
semelhança = 100% × (1 − √( Σ peso × (notaTerra − notaAlvo)² ))
```

| Aspecto | Marte | Lua |
|---|---|---|
| Temperatura | 25% | 30% |
| Relevo | 20% | 25% |
| Gelo | 15% | 30% |
| Geologia | 25% | 15% |
| Vento/poeira | 15% | 0% (não se aplica) |

## Publicar de graça no GitHub Pages

1. Envie os arquivos para o GitHub (no terminal, dentro da pasta):
   ```bash
   git add .
   git commit -m "Globo de Análogos: versão básica"
   git push
   ```
2. No site do GitHub, abra o repositório e vá em **Settings → Pages**.
3. Em **Source**, escolha **Deploy from a branch**. Em **Branch**, escolha `main` e a pasta `/ (root)`. Clique em **Save**.
4. Espere 1 ou 2 minutos e atualize a página. O link vai aparecer lá, algo como
   `https://SEU-USUARIO.github.io/constelacao-zero-nasa/`.

Cada `git push` novo atualiza o site sozinho.

## Pipeline de dados reais (NASA)

Os scripts em `scripts/` constroem os dados reais que o site mostra:

| Script | O que faz | Estado |
|---|---|---|
| `01_terra.py` | Grade de 2° da Terra (MODIS, SRTM, ASTER, MERRA-2). Precisa de conta Earthdata. | rodou com dados reais nas **zonas estratégicas** (`--zonas estrategicas`); o MERRA-2 (vento/poeira) ainda falha, e o mundo todo não foi rodado |
| `02_marte.py` | 6 locais de Marte (MOLA, GRS) | rodou com dados reais |
| `03_lua.py` | 4 locais da Lua (LOLA, Diviner) | rodou com dados reais |
| `04_normalizar.py` | Semelhança Terra x Marte/Lua e relatório | rodou com os dados reais |
| `05_exportar_site.py` | Junta tudo em `data/dados_reais.js`, o arquivo que o site lê | rodou |
| `06_baixar_imagens.py` | Baixa as fotos dos lugares (Wikimedia Commons) e guarda os créditos | rodou; 12 fotos, todas com licença livre |

Relatório com fontes, problemas e decisões: [relatorio/data_report.md](relatorio/data_report.md).
Passo a passo para o Google Colab: [relatorio/COLAB.md](relatorio/COLAB.md).

## Créditos

- Globo: [Globe.gl](https://globe.gl) · Gráfico: [Chart.js](https://www.chartjs.org)
- Imagens da Terra: NASA Blue Marble (pelo pacote three-globe)
- Dados futuros: MODIS, NASADEM, MERRA-2, ASTER (Terra) · THEMIS, MOLA, CRISM (Marte) · Diviner, LOLA, LEND (Lua)
