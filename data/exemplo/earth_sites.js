// =====================================================================
// LOCAIS DA TERRA (análogos terrestres)
// ---------------------------------------------------------------------
// Tudo entre os colchetes [ ] é JSON normal. Para editar, troque os
// números de "valor" (sempre entre 0 e 1). Quando tiverem o dado real da
// NASA, troquem o valor e mudem "estimativa" para false.
//
// Escala das notas (0 a 1):
//   temperatura: 0 = frio extremo      1 = muito quente
//   relevo:      0 = plano             1 = montanhas / cânions enormes
//   gelo:        0 = sem gelo          1 = muito gelo
//   geologia:    0 = rocha sedimentar  1 = rocha vulcânica (basalto)
//   vento:       0 = calmo             1 = muito vento / poeira
// =====================================================================
window.EARTH_SITES = [
  {
    "id": "atacama", "nome": "Deserto do Atacama", "pais": "Chile", "tipo": "deserto",
    "lat": -24.50, "lon": -69.25,
    "descricao": "Um dos lugares mais secos do planeta. O solo quase sem vida lembra o de Marte.",
    "aspectos": {
      "temperatura": { "valor": 0.62, "fonte": "MODIS",   "estimativa": true },
      "relevo":      { "valor": 0.45, "fonte": "NASADEM", "estimativa": true },
      "gelo":        { "valor": 0.05, "fonte": "MODIS",   "estimativa": true },
      "geologia":    { "valor": 0.35, "fonte": "ASTER",   "estimativa": true },
      "vento":       { "valor": 0.55, "fonte": "MERRA-2", "estimativa": true }
    },
    "util_para_testar": {
      "marte": "Testar robôs que procuram sinais de vida em solo extremamente seco.",
      "lua":   "Testar painéis solares e poeira fina em sol forte e ar muito seco."
    }
  },
  {
    "id": "vales-secos", "nome": "Vales Secos de McMurdo", "pais": "Antártida", "tipo": "polar",
    "lat": -77.50, "lon": 162.00,
    "descricao": "Vales muito secos, com ventos fortes e solo congelado, cercados por geleiras.",
    "aspectos": {
      "temperatura": { "valor": 0.28, "fonte": "MODIS",   "estimativa": true },
      "relevo":      { "valor": 0.55, "fonte": "NASADEM", "estimativa": true },
      "gelo":        { "valor": 0.70, "fonte": "MODIS",   "estimativa": true },
      "geologia":    { "valor": 0.40, "fonte": "ASTER",   "estimativa": true },
      "vento":       { "valor": 0.75, "fonte": "MERRA-2", "estimativa": true }
    },
    "util_para_testar": {
      "marte": "Testar brocas que buscam gelo e micróbios embaixo do solo congelado.",
      "lua":   "Testar equipamentos que precisam funcionar em frio extremo."
    }
  },
  {
    "id": "lut", "nome": "Deserto do Lut", "pais": "Irã", "tipo": "deserto",
    "lat": 30.50, "lon": 58.50,
    "descricao": "Já registrou as temperaturas de superfície mais altas da Terra. Tem dunas e formas esculpidas pelo vento.",
    "aspectos": {
      "temperatura": { "valor": 0.95, "fonte": "MODIS",   "estimativa": true },
      "relevo":      { "valor": 0.40, "fonte": "NASADEM", "estimativa": true },
      "gelo":        { "valor": 0.00, "fonte": "MODIS",   "estimativa": true },
      "geologia":    { "valor": 0.30, "fonte": "ASTER",   "estimativa": true },
      "vento":       { "valor": 0.80, "fonte": "MERRA-2", "estimativa": true }
    },
    "util_para_testar": {
      "marte": "Estudar como o vento esculpe rochas (os 'yardangs'), igual acontece em Marte.",
      "lua":   "Testar o resfriamento de equipamentos sob calor extremo."
    }
  },
  {
    "id": "danakil", "nome": "Depressão de Danakil (Dallol)", "pais": "Etiópia", "tipo": "vulcânico",
    "lat": 14.24, "lon": 40.30,
    "descricao": "Lagos ácidos, sal e atividade vulcânica. Um dos ambientes mais extremos da Terra.",
    "aspectos": {
      "temperatura": { "valor": 0.98, "fonte": "MODIS",   "estimativa": true },
      "relevo":      { "valor": 0.35, "fonte": "NASADEM", "estimativa": true },
      "gelo":        { "valor": 0.00, "fonte": "MODIS",   "estimativa": true },
      "geologia":    { "valor": 0.75, "fonte": "ASTER",   "estimativa": true },
      "vento":       { "valor": 0.50, "fonte": "MERRA-2", "estimativa": true }
    },
    "util_para_testar": {
      "marte": "Testar instrumentos que identificam minerais formados em água ácida.",
      "lua":   "Testar a resistência de materiais a calor e química agressiva."
    }
  },
  {
    "id": "mauna-kea", "nome": "Mauna Kea", "pais": "Havaí, EUA", "tipo": "vulcânico",
    "lat": 19.82, "lon": -155.47,
    "descricao": "Vulcão de cinza e basalto, com o cume a mais de 4.000 m de altitude.",
    "aspectos": {
      "temperatura": { "valor": 0.50, "fonte": "MODIS",   "estimativa": true },
      "relevo":      { "valor": 0.70, "fonte": "NASADEM", "estimativa": true },
      "gelo":        { "valor": 0.10, "fonte": "MODIS",   "estimativa": true },
      "geologia":    { "valor": 0.90, "fonte": "ASTER",   "estimativa": true },
      "vento":       { "valor": 0.40, "fonte": "MERRA-2", "estimativa": true }
    },
    "util_para_testar": {
      "marte": "Testar como tirar água e oxigênio do solo vulcânico (ISRU).",
      "lua":   "Testar a construção de bases usando o solo local, como o regolito lunar."
    }
  },
  {
    "id": "holuhraun", "nome": "Campo de lava de Holuhraun", "pais": "Islândia", "tipo": "vulcânico",
    "lat": 64.85, "lon": -16.83,
    "descricao": "Lava basáltica recente em um lugar frio, perto de geleiras.",
    "aspectos": {
      "temperatura": { "valor": 0.40, "fonte": "MODIS",   "estimativa": true },
      "relevo":      { "valor": 0.30, "fonte": "NASADEM", "estimativa": true },
      "gelo":        { "valor": 0.35, "fonte": "MODIS",   "estimativa": true },
      "geologia":    { "valor": 0.95, "fonte": "ASTER",   "estimativa": true },
      "vento":       { "valor": 0.60, "fonte": "MERRA-2", "estimativa": true }
    },
    "util_para_testar": {
      "marte": "Treinar a navegação de rovers sobre lava áspera e irregular.",
      "lua":   "Testar rodas e pés de pouso sobre terreno basáltico."
    }
  },
  {
    "id": "haughton", "nome": "Cratera de Haughton", "pais": "Ilha Devon, Canadá", "tipo": "polar",
    "lat": 75.38, "lon": -89.68,
    "descricao": "Cratera de impacto em deserto polar. A NASA já fez treinos de missão aqui.",
    "aspectos": {
      "temperatura": { "valor": 0.30, "fonte": "MODIS",   "estimativa": true },
      "relevo":      { "valor": 0.50, "fonte": "NASADEM", "estimativa": true },
      "gelo":        { "valor": 0.55, "fonte": "MODIS",   "estimativa": true },
      "geologia":    { "valor": 0.45, "fonte": "ASTER",   "estimativa": true },
      "vento":       { "valor": 0.50, "fonte": "MERRA-2", "estimativa": true }
    },
    "util_para_testar": {
      "marte": "Simular uma missão tripulada inteira: trajes, veículos e comunicação com atraso.",
      "lua":   "Treinar astronautas a estudar uma cratera de impacto."
    }
  },
  {
    "id": "namibe", "nome": "Deserto do Namibe", "pais": "Namíbia", "tipo": "deserto",
    "lat": -24.75, "lon": 15.30,
    "descricao": "Dunas gigantes e vento constante, como os campos de dunas de Marte.",
    "aspectos": {
      "temperatura": { "valor": 0.70, "fonte": "MODIS",   "estimativa": true },
      "relevo":      { "valor": 0.35, "fonte": "NASADEM", "estimativa": true },
      "gelo":        { "valor": 0.00, "fonte": "MODIS",   "estimativa": true },
      "geologia":    { "valor": 0.25, "fonte": "ASTER",   "estimativa": true },
      "vento":       { "valor": 0.85, "fonte": "MERRA-2", "estimativa": true }
    },
    "util_para_testar": {
      "marte": "Testar rovers subindo dunas e estudar como as dunas se movem.",
      "lua":   "Testar filtros e vedações contra poeira fina."
    }
  },
  {
    "id": "lanzarote", "nome": "Tubos de lava de Lanzarote", "pais": "Canárias, Espanha", "tipo": "caverna",
    "lat": 29.16, "lon": -13.44,
    "descricao": "Túneis formados por lava, como os que existem na Lua e em Marte.",
    "aspectos": {
      "temperatura": { "valor": 0.60, "fonte": "MODIS",   "estimativa": true },
      "relevo":      { "valor": 0.40, "fonte": "NASADEM", "estimativa": true },
      "gelo":        { "valor": 0.00, "fonte": "MODIS",   "estimativa": true },
      "geologia":    { "valor": 0.85, "fonte": "ASTER",   "estimativa": true },
      "vento":       { "valor": 0.20, "fonte": "MERRA-2", "estimativa": true }
    },
    "util_para_testar": {
      "marte": "Testar drones e robôs que mapeiam cavernas no escuro.",
      "lua":   "Estudar tubos de lava como abrigo contra radiação para uma base lunar."
    }
  },
  {
    "id": "lava-beds", "nome": "Lava Beds", "pais": "Califórnia, EUA", "tipo": "caverna",
    "lat": 41.71, "lon": -121.51,
    "descricao": "Centenas de cavernas de lava, algumas com gelo lá dentro.",
    "aspectos": {
      "temperatura": { "valor": 0.45, "fonte": "MODIS",   "estimativa": true },
      "relevo":      { "valor": 0.45, "fonte": "NASADEM", "estimativa": true },
      "gelo":        { "valor": 0.30, "fonte": "MODIS",   "estimativa": true },
      "geologia":    { "valor": 0.85, "fonte": "ASTER",   "estimativa": true },
      "vento":       { "valor": 0.10, "fonte": "MERRA-2", "estimativa": true }
    },
    "util_para_testar": {
      "marte": "Testar sensores que procuram gelo e vida microbiana dentro de cavernas.",
      "lua":   "Testar a comunicação por rádio entre o fundo de uma caverna e a superfície."
    }
  },
  {
    "id": "utah-mdrs", "nome": "Deserto de San Rafael (MDRS)", "pais": "Utah, EUA", "tipo": "deserto",
    "lat": 38.41, "lon": -110.79,
    "descricao": "Rochas vermelhas e sedimentares. Tem uma estação de simulação de Marte.",
    "aspectos": {
      "temperatura": { "valor": 0.58, "fonte": "MODIS",   "estimativa": true },
      "relevo":      { "valor": 0.55, "fonte": "NASADEM", "estimativa": true },
      "gelo":        { "valor": 0.05, "fonte": "MODIS",   "estimativa": true },
      "geologia":    { "valor": 0.30, "fonte": "ASTER",   "estimativa": true },
      "vento":       { "valor": 0.50, "fonte": "MERRA-2", "estimativa": true }
    },
    "util_para_testar": {
      "marte": "Fazer simulações de semanas vivendo isolado, como numa base em Marte.",
      "lua":   "Treinar caminhadas com traje e coleta de amostras."
    }
  },
  {
    "id": "svalbard", "nome": "Svalbard (Bockfjord)", "pais": "Noruega", "tipo": "polar",
    "lat": 79.40, "lon": 13.30,
    "descricao": "Vulcões antigos no meio do gelo do Ártico.",
    "aspectos": {
      "temperatura": { "valor": 0.22, "fonte": "MODIS",   "estimativa": true },
      "relevo":      { "valor": 0.60, "fonte": "NASADEM", "estimativa": true },
      "gelo":        { "valor": 0.80, "fonte": "MODIS",   "estimativa": true },
      "geologia":    { "valor": 0.60, "fonte": "ASTER",   "estimativa": true },
      "vento":       { "valor": 0.55, "fonte": "MERRA-2", "estimativa": true }
    },
    "util_para_testar": {
      "marte": "Testar instrumentos de rovers (a NASA já testou peças do Curiosity aqui).",
      "lua":   "Testar a busca por gelo em regiões frias e escuras, como os polos da Lua."
    }
  }
];
