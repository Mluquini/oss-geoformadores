// =====================================================================
// LOCAIS DA LUA. A Lua não tem atmosfera, então "vento" é null
// ("não se aplica") e não entra no cálculo.
// =====================================================================
window.MOON_SITES = [
  {
    "id": "shackleton", "nome": "Polo Sul (Cratera Shackleton)", "lat": -89.90, "lon": 0.00,
    "descricao": "O fundo da cratera nunca recebe sol. Pode guardar gelo de água. Alvo do programa Artemis.",
    "aspectos": {
      "temperatura": { "valor": 0.02, "fonte": "Diviner", "estimativa": true },
      "relevo":      { "valor": 0.85, "fonte": "LOLA",    "estimativa": true },
      "gelo":        { "valor": 0.85, "fonte": "LEND",    "estimativa": true },
      "geologia":    { "valor": 0.65, "fonte": "Diviner", "estimativa": true },
      "vento":       { "valor": null, "fonte": "-",       "estimativa": true, "nao_se_aplica": true }
    }
  },
  {
    "id": "tranquillitatis", "nome": "Mare Tranquillitatis", "lat": 8.50, "lon": 31.40,
    "descricao": "Planície de lava basáltica. É onde a Apollo 11 pousou.",
    "aspectos": {
      "temperatura": { "valor": 0.45, "fonte": "Diviner", "estimativa": true },
      "relevo":      { "valor": 0.15, "fonte": "LOLA",    "estimativa": true },
      "gelo":        { "valor": 0.00, "fonte": "LEND",    "estimativa": true },
      "geologia":    { "valor": 0.95, "fonte": "Diviner", "estimativa": true },
      "vento":       { "valor": null, "fonte": "-",       "estimativa": true, "nao_se_aplica": true }
    }
  },
  {
    "id": "tycho", "nome": "Cratera Tycho", "lat": -43.30, "lon": -11.20,
    "descricao": "Cratera jovem com paredes altas e raios brilhantes que dá para ver da Terra.",
    "aspectos": {
      "temperatura": { "valor": 0.40, "fonte": "Diviner", "estimativa": true },
      "relevo":      { "valor": 0.90, "fonte": "LOLA",    "estimativa": true },
      "gelo":        { "valor": 0.00, "fonte": "LEND",    "estimativa": true },
      "geologia":    { "valor": 0.40, "fonte": "Diviner", "estimativa": true },
      "vento":       { "valor": null, "fonte": "-",       "estimativa": true, "nao_se_aplica": true }
    }
  },
  {
    "id": "malapert", "nome": "Monte Malapert", "lat": -85.90, "lon": 0.00,
    "descricao": "Montanha perto do polo sul, com boa vista para a Terra (bom para comunicação).",
    "aspectos": {
      "temperatura": { "valor": 0.10, "fonte": "Diviner", "estimativa": true },
      "relevo":      { "valor": 0.80, "fonte": "LOLA",    "estimativa": true },
      "gelo":        { "valor": 0.50, "fonte": "LEND",    "estimativa": true },
      "geologia":    { "valor": 0.60, "fonte": "Diviner", "estimativa": true },
      "vento":       { "valor": null, "fonte": "-",       "estimativa": true, "nao_se_aplica": true }
    }
  }
];
