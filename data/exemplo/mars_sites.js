// =====================================================================
// LOCAIS DE MARTE. Mesmas 5 notas (0 a 1) e mesma escala dos locais da Terra.
// =====================================================================
window.MARS_SITES = [
  {
    "id": "jezero", "nome": "Cratera Jezero", "lat": 18.40, "lon": 77.50,
    "descricao": "Antigo delta de rio. É onde o rover Perseverance trabalha.",
    "aspectos": {
      "temperatura": { "valor": 0.32, "fonte": "THEMIS", "estimativa": true },
      "relevo":      { "valor": 0.45, "fonte": "MOLA",   "estimativa": true },
      "gelo":        { "valor": 0.15, "fonte": "CRISM",  "estimativa": true },
      "geologia":    { "valor": 0.30, "fonte": "CRISM",  "estimativa": true },
      "vento":       { "valor": 0.55, "fonte": "THEMIS", "estimativa": true }
    }
  },
  {
    "id": "gale", "nome": "Cratera Gale", "lat": -5.40, "lon": 137.80,
    "descricao": "Cratera com uma montanha de camadas no meio. É onde o rover Curiosity trabalha.",
    "aspectos": {
      "temperatura": { "valor": 0.35, "fonte": "THEMIS", "estimativa": true },
      "relevo":      { "valor": 0.65, "fonte": "MOLA",   "estimativa": true },
      "gelo":        { "valor": 0.10, "fonte": "CRISM",  "estimativa": true },
      "geologia":    { "valor": 0.25, "fonte": "CRISM",  "estimativa": true },
      "vento":       { "valor": 0.50, "fonte": "THEMIS", "estimativa": true }
    }
  },
  {
    "id": "meridiani", "nome": "Meridiani Planum", "lat": -1.90, "lon": -5.50,
    "descricao": "Planície com hematita, um mineral ligado à água. O rover Opportunity explorou aqui.",
    "aspectos": {
      "temperatura": { "valor": 0.33, "fonte": "THEMIS", "estimativa": true },
      "relevo":      { "valor": 0.20, "fonte": "MOLA",   "estimativa": true },
      "gelo":        { "valor": 0.05, "fonte": "CRISM",  "estimativa": true },
      "geologia":    { "valor": 0.35, "fonte": "CRISM",  "estimativa": true },
      "vento":       { "valor": 0.60, "fonte": "THEMIS", "estimativa": true }
    }
  },
  {
    "id": "valles", "nome": "Valles Marineris", "lat": -13.90, "lon": -59.20,
    "descricao": "O maior cânion do Sistema Solar, com até 7 km de profundidade.",
    "aspectos": {
      "temperatura": { "valor": 0.34, "fonte": "THEMIS", "estimativa": true },
      "relevo":      { "valor": 1.00, "fonte": "MOLA",   "estimativa": true },
      "gelo":        { "valor": 0.15, "fonte": "CRISM",  "estimativa": true },
      "geologia":    { "valor": 0.55, "fonte": "CRISM",  "estimativa": true },
      "vento":       { "valor": 0.65, "fonte": "THEMIS", "estimativa": true }
    }
  },
  {
    "id": "hellas", "nome": "Bacia de Hellas", "lat": -42.40, "lon": 70.50,
    "descricao": "Cratera de impacto gigante, o ponto mais baixo de Marte. Muitas tempestades de poeira.",
    "aspectos": {
      "temperatura": { "valor": 0.30, "fonte": "THEMIS", "estimativa": true },
      "relevo":      { "valor": 0.60, "fonte": "MOLA",   "estimativa": true },
      "gelo":        { "valor": 0.40, "fonte": "CRISM",  "estimativa": true },
      "geologia":    { "valor": 0.45, "fonte": "CRISM",  "estimativa": true },
      "vento":       { "valor": 0.85, "fonte": "THEMIS", "estimativa": true }
    }
  },
  {
    "id": "utopia", "nome": "Utopia Planitia", "lat": 46.70, "lon": 117.50,
    "descricao": "Planície enorme com muito gelo embaixo do solo. O Viking 2 pousou aqui.",
    "aspectos": {
      "temperatura": { "valor": 0.22, "fonte": "THEMIS", "estimativa": true },
      "relevo":      { "valor": 0.15, "fonte": "MOLA",   "estimativa": true },
      "gelo":        { "valor": 0.75, "fonte": "CRISM",  "estimativa": true },
      "geologia":    { "valor": 0.50, "fonte": "CRISM",  "estimativa": true },
      "vento":       { "valor": 0.40, "fonte": "THEMIS", "estimativa": true }
    }
  }
];
