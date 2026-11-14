// Gerado por scripts/05_exportar_site.py: NÃO edite à mão.
window.DADOS_REAIS = {
 "gerado_em": "2026-11-14",
 "anos_terra": [
  2020
 ],
 "status": {
  "n_com": 12,
  "n_total": 12,
  "terra_sem_dado": [],
  "marte_usa": [
   "relevo",
   "gelo"
  ],
  "lua_usa": [
   "temperatura",
   "relevo",
   "gelo"
  ],
  "completo": false
 },
 "faixas": {
  "temperatura": {
   "min": -250.0,
   "max": 100.0,
   "unidade": "°C (temperatura média anual/diária da superfície)",
   "motivo": "Cobre de ~ -233 °C (armadilhas frias lunares, ~40 K) até +100 °C. A média anual de superfície mais quente da Terra fica bem abaixo de +100 °C, então o topo da faixa nunca satura na Terra."
  },
  "relevo": {
   "min": 0.0,
   "max": 3000.0,
   "unidade": "m (desvio padrão da elevação numa janela de ~2°)",
   "motivo": "0 = planície perfeita. 3000 m já é o de Valles Marineris (cânion de ~7 km); acima disso a nota satura em 1."
  },
  "gelo": {
   "min": 0.0,
   "max": 1.0,
   "unidade": "fração 0-1",
   "motivo": "Terra = média de (fração do tempo com neve) e (fração do tempo com T < 0 °C). Lua = fração da área com temperatura máxima < 110 K (armadilha fria). Marte = % em massa de água do GRS dividido por 100 (100% = gelo puro). ATENÇÃO: as três quantidades têm significados físicos DIFERENTES (neve na superfície x gelo enterrado x área fria). É um proxy comum, não uma medida idêntica; revisar com a equipe."
  },
  "vento": {
   "min": 0.0,
   "max": 12.0,
   "unidade": "m/s (velocidade média do vento no nível mais baixo do MERRA-2, ~50-70 m)",
   "motivo": "Nas células calculadas as médias anuais do MERRA-2 vão de ~4 a ~15 m/s; acima de 12 a nota satura em 1. Não é o vento a 10 m. Marte e Lua não têm medição comparável (o vento da Terra não entra em nenhum ranking)."
  }
 },
 "pesos": {
  "marte": {
   "temperatura": 0.3333333333333333,
   "relevo": 0.26666666666666666,
   "gelo": 0.19999999999999998,
   "vento": 0.19999999999999998
  },
  "lua": {
   "temperatura": 0.3529411764705882,
   "relevo": 0.2941176470588235,
   "gelo": 0.3529411764705882,
   "vento": 0.0
  }
 },
 "faixas_busca": {
  "amplitude": {
   "min": 0.0,
   "max": 60.0,
   "unidade": "°C (variação ao longo do ano: máx. − mín. das médias mensais)",
   "motivo": "Nas células calculadas vai de ~5 a ~49 °C; 60 dá folga. Mede variação ao longo do ANO na Terra, não o ciclo dia/noite."
  },
  "poeira": {
   "min": 0.0,
   "max": 300.0,
   "unidade": "µg/m³ (poeira em suspensão, média anual)",
   "motivo": "Nas células calculadas vai de ~0,4 a ~400 µg/m³ (95% abaixo de ~200); acima de 300 a nota satura em 1."
  },
  "geologia": {
   "min": 0.99,
   "max": 1.1,
   "unidade": "índice de quartzo do ASTER (sem unidade)",
   "motivo": "Nas células calculadas vai de ~0,993 a ~1,099. Só existe para a Terra: serve para um alvo personalizado ('rocha rica em quartzo'), e NÃO é comparável com Marte e a Lua."
  }
 },
 "fontes": {
  "terra": [
   {
    "aspecto": "temperatura",
    "produto": "MOD11C3",
    "versao": "061"
   },
   {
    "aspecto": "gelo",
    "produto": "MOD10CM + MOD11C3",
    "versao": "61 / 061"
   },
   {
    "aspecto": "relevo",
    "produto": "SRTMGL30",
    "versao": "002"
   },
   {
    "aspecto": "vento",
    "produto": "M2TMNXFLX (SPEED) + M2TMNXAER (DUSMASS)",
    "versao": "5.12.4"
   }
  ],
  "complementos": [
   "etopo2022"
  ],
  "marte": [
   "MGS/MOLA: MGS-M-MOLA-5-MEGDR-L3-V1.0",
   "Mars Odyssey/GRS: ODY-M-GRS-5-ELEMENTS-V1.0"
  ],
  "lua": [
   "LRO/Diviner: LRO-L-DLRE-5-PRP-V2.0",
   "LRO/LOLA: LRO-L-LOLA-4-GDR-V1.0",
   "LRO/Diviner: LRO-L-DLRE-5-GCP-V1.0",
   "LRO/Diviner: LRO-L-DLRE-5-GDR-V1.0"
  ]
 },
 "terra": [
  {
   "id": "atacama",
   "nome": {
    "pt": "Deserto do Atacama",
    "en": "Atacama Desert"
   },
   "pais": {
    "pt": "Chile",
    "en": "Chile"
   },
   "tipo": "deserto",
   "lat": -24.5,
   "lon": -69.25,
   "descricao": {
    "pt": "Um dos lugares mais secos do planeta. O solo quase sem vida lembra o de Marte.",
    "en": "One of the driest places on the planet. The almost lifeless soil resembles Mars."
   },
   "util_para_testar": {
    "marte": {
     "pt": "Testar robôs que procuram sinais de vida em solo extremamente seco.",
     "en": "Test robots that search for signs of life in extremely dry soil."
    },
    "lua": {
     "pt": "Testar painéis solares e poeira fina em sol forte e ar muito seco.",
     "en": "Test solar panels and fine dust in strong sun and very dry air."
    }
   },
   "celula": {
    "lat": -25.0,
    "lon": -69.0,
    "tamanho_graus": 2
   },
   "tem_dado": true,
   "valores": {
    "temperatura_C": 17.513,
    "amplitude_C": 17.531,
    "elevacao_m": 3266.3,
    "rugosidade_m": 1053.7,
    "declividade_graus": 4.275,
    "fonte_relevo": "SRTMGL30",
    "frac_neve": 0.012,
    "frac_T_abaixo_0C": 0.022,
    "vento_ms": 5.814,
    "poeira_ugm3": 5.926
   },
   "notas": {
    "temperatura": 0.7643,
    "relevo": 0.3512,
    "gelo": 0.017,
    "vento": 0.4845
   },
   "ranking": {
    "marte": [
     {
      "id": "gale",
      "nome": "Cratera Gale",
      "semelhanca": 97.5,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "jezero",
      "nome": "Cratera Jezero",
      "semelhanca": 83.9,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "hellas",
      "nome": "Bacia de Hellas",
      "semelhanca": 82.3,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "meridiani",
      "nome": "Meridiani Planum",
      "semelhanca": 77.1,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "utopia",
      "nome": "Utopia Planitia",
      "semelhanca": 74.7,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "valles",
      "nome": "Valles Marineris",
      "semelhanca": 50.9,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     }
    ],
    "lua": [
     {
      "id": "tycho",
      "nome": "Cratera Tycho",
      "semelhanca": 82.8,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "tranquillitatis",
      "nome": "Mare Tranquillitatis",
      "semelhanca": 79.4,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "malapert",
      "nome": "Monte Malapert",
      "semelhanca": 68.9,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "shackleton",
      "nome": "Polo Sul (Cratera Shackleton)",
      "semelhanca": 66.3,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     }
    ]
   }
  },
  {
   "id": "vales-secos",
   "nome": {
    "pt": "Vales Secos de McMurdo",
    "en": "McMurdo Dry Valleys"
   },
   "pais": {
    "pt": "Antártida",
    "en": "Antarctica"
   },
   "tipo": "polar",
   "lat": -77.5,
   "lon": 162.0,
   "descricao": {
    "pt": "Vales muito secos, com ventos fortes e solo congelado, cercados por geleiras.",
    "en": "Very dry valleys, with strong winds and frozen ground, surrounded by glaciers."
   },
   "util_para_testar": {
    "marte": {
     "pt": "Testar brocas que buscam gelo e micróbios embaixo do solo congelado.",
     "en": "Test drills that look for ice and microbes beneath frozen ground."
    },
    "lua": {
     "pt": "Testar equipamentos que precisam funcionar em frio extremo.",
     "en": "Test equipment that must work in extreme cold."
    }
   },
   "celula": {
    "lat": -77.0,
    "lon": 163.0,
    "tamanho_graus": 2
   },
   "tem_dado": true,
   "valores": {
    "temperatura_C": -28.642,
    "amplitude_C": 30.765,
    "elevacao_m": 636.2,
    "rugosidade_m": 492.9,
    "declividade_graus": 6.345,
    "fonte_relevo": "ETOPO202",
    "frac_neve": 1.0,
    "frac_T_abaixo_0C": 1.0,
    "vento_ms": 7.942,
    "poeira_ugm3": 0.421
   },
   "notas": {
    "temperatura": 0.6325,
    "relevo": 0.1643,
    "gelo": 1.0,
    "vento": 0.6618
   },
   "ranking": {
    "marte": [
     {
      "id": "meridiani",
      "nome": "Meridiani Planum",
      "semelhanca": 37.7,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "hellas",
      "nome": "Bacia de Hellas",
      "semelhanca": 37.2,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "jezero",
      "nome": "Cratera Jezero",
      "semelhanca": 36.8,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "gale",
      "nome": "Cratera Gale",
      "semelhanca": 36.6,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "utopia",
      "nome": "Utopia Planitia",
      "semelhanca": 36.3,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "valles",
      "nome": "Valles Marineris",
      "semelhanca": 10.6,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     }
    ],
    "lua": [
     {
      "id": "shackleton",
      "nome": "Polo Sul (Cratera Shackleton)",
      "semelhanca": 42.0,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "tycho",
      "nome": "Cratera Tycho",
      "semelhanca": 40.3,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "tranquillitatis",
      "nome": "Mare Tranquillitatis",
      "semelhanca": 40.1,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "malapert",
      "nome": "Monte Malapert",
      "semelhanca": 35.3,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     }
    ]
   }
  },
  {
   "id": "lut",
   "nome": {
    "pt": "Deserto do Lut",
    "en": "Lut Desert"
   },
   "pais": {
    "pt": "Irã",
    "en": "Iran"
   },
   "tipo": "deserto",
   "lat": 30.5,
   "lon": 58.5,
   "descricao": {
    "pt": "Em 7 anos de dados do satélite MODIS da NASA, foi o ponto mais quente da Terra em 5 deles (máxima de 70,7 °C na superfície, em 2005). Tem dunas e formas esculpidas pelo vento.",
    "en": "In 7 years of data from NASA's MODIS satellite, it was the hottest spot on Earth in 5 of them (maximum of 70.7 °C at the surface, in 2005). It has dunes and wind-sculpted formations."
   },
   "util_para_testar": {
    "marte": {
     "pt": "Estudar como o vento esculpe rochas (os 'yardangs'), igual acontece em Marte.",
     "en": "Study how wind sculpts rock (the 'yardangs'), just as it does on Mars."
    },
    "lua": {
     "pt": "Testar o resfriamento de equipamentos sob calor extremo.",
     "en": "Test the cooling of equipment under extreme heat."
    }
   },
   "celula": {
    "lat": 31.0,
    "lon": 59.0,
    "tamanho_graus": 2
   },
   "tem_dado": true,
   "valores": {
    "temperatura_C": 30.629,
    "amplitude_C": 31.627,
    "elevacao_m": 811.4,
    "rugosidade_m": 404.3,
    "declividade_graus": 1.378,
    "fonte_relevo": "SRTMGL30",
    "frac_neve": 0.001,
    "frac_T_abaixo_0C": 0.0,
    "vento_ms": 6.483,
    "poeira_ugm3": 113.903
   },
   "notas": {
    "temperatura": 0.8018,
    "relevo": 0.1348,
    "gelo": 0.0005,
    "vento": 0.5403
   },
   "ranking": {
    "marte": [
     {
      "id": "jezero",
      "nome": "Cratera Jezero",
      "semelhanca": 97.7,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "hellas",
      "nome": "Bacia de Hellas",
      "semelhanca": 97.0,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "meridiani",
      "nome": "Meridiani Planum",
      "semelhanca": 92.6,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "utopia",
      "nome": "Utopia Planitia",
      "semelhanca": 90.7,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "gale",
      "nome": "Cratera Gale",
      "semelhanca": 83.8,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "valles",
      "nome": "Valles Marineris",
      "semelhanca": 34.6,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     }
    ],
    "lua": [
     {
      "id": "tranquillitatis",
      "nome": "Mare Tranquillitatis",
      "semelhanca": 84.6,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "tycho",
      "nome": "Cratera Tycho",
      "semelhanca": 83.9,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "shackleton",
      "nome": "Polo Sul (Cratera Shackleton)",
      "semelhanca": 62.6,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "malapert",
      "nome": "Monte Malapert",
      "semelhanca": 62.0,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     }
    ]
   }
  },
  {
   "id": "danakil",
   "nome": {
    "pt": "Depressão de Danakil (Dallol)",
    "en": "Danakil Depression (Dallol)"
   },
   "pais": {
    "pt": "Etiópia",
    "en": "Ethiopia"
   },
   "tipo": "vulcânico",
   "lat": 14.24,
   "lon": 40.3,
   "descricao": {
    "pt": "Lagos ácidos, sal e atividade vulcânica. Um dos ambientes mais extremos da Terra.",
    "en": "Acidic lakes, salt and volcanic activity. One of the most extreme environments on Earth."
   },
   "util_para_testar": {
    "marte": {
     "pt": "Testar instrumentos que identificam minerais formados em água ácida.",
     "en": "Test instruments that identify minerals formed in acidic water."
    },
    "lua": {
     "pt": "Testar a resistência de materiais a calor e química agressiva.",
     "en": "Test how materials withstand heat and harsh chemistry."
    }
   },
   "celula": {
    "lat": 15.0,
    "lon": 41.0,
    "tamanho_graus": 2
   },
   "tem_dado": true,
   "valores": {
    "temperatura_C": 36.873,
    "amplitude_C": 9.869,
    "elevacao_m": 145.7,
    "rugosidade_m": 244.6,
    "declividade_graus": 1.708,
    "fonte_relevo": "SRTMGL30",
    "frac_neve": 0.0,
    "frac_T_abaixo_0C": 0.0,
    "vento_ms": 5.46,
    "poeira_ugm3": 133.365
   },
   "notas": {
    "temperatura": 0.8196,
    "relevo": 0.0815,
    "gelo": 0.0,
    "vento": 0.455
   },
   "ranking": {
    "marte": [
     {
      "id": "hellas",
      "nome": "Bacia de Hellas",
      "semelhanca": 96.1,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "meridiani",
      "nome": "Meridiani Planum",
      "semelhanca": 95.6,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "jezero",
      "nome": "Cratera Jezero",
      "semelhanca": 95.1,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "utopia",
      "nome": "Utopia Planitia",
      "semelhanca": 94.4,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "gale",
      "nome": "Cratera Gale",
      "semelhanca": 79.8,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "valles",
      "nome": "Valles Marineris",
      "semelhanca": 30.5,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     }
    ],
    "lua": [
     {
      "id": "tranquillitatis",
      "nome": "Mare Tranquillitatis",
      "semelhanca": 84.2,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "tycho",
      "nome": "Cratera Tycho",
      "semelhanca": 82.3,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "shackleton",
      "nome": "Polo Sul (Cratera Shackleton)",
      "semelhanca": 60.7,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "malapert",
      "nome": "Monte Malapert",
      "semelhanca": 59.5,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     }
    ]
   }
  },
  {
   "id": "mauna-kea",
   "nome": {
    "pt": "Mauna Kea",
    "en": "Mauna Kea"
   },
   "pais": {
    "pt": "Havaí, EUA",
    "en": "Hawaii, USA"
   },
   "tipo": "vulcânico",
   "lat": 19.82,
   "lon": -155.47,
   "descricao": {
    "pt": "Vulcão de cinza e basalto, com o cume a mais de 4.000 m de altitude.",
    "en": "A volcano of ash and basalt, with a summit above 4,000 m."
   },
   "util_para_testar": {
    "marte": {
     "pt": "Testar como tirar água e oxigênio do solo vulcânico (ISRU).",
     "en": "Test how to extract water and oxygen from volcanic soil (ISRU)."
    },
    "lua": {
     "pt": "Testar a construção de bases usando o solo local, como o regolito lunar.",
     "en": "Test building bases from local soil, like lunar regolith."
    }
   },
   "celula": {
    "lat": 19.0,
    "lon": -155.0,
    "tamanho_graus": 2
   },
   "tem_dado": true,
   "valores": {
    "temperatura_C": 20.409,
    "amplitude_C": 6.223,
    "elevacao_m": 1247.9,
    "rugosidade_m": 937.0,
    "declividade_graus": 4.994,
    "fonte_relevo": "SRTMGL30",
    "frac_neve": 0.004,
    "frac_T_abaixo_0C": 0.0,
    "vento_ms": 7.602,
    "poeira_ugm3": 0.881
   },
   "notas": {
    "temperatura": 0.7726,
    "relevo": 0.3123,
    "gelo": 0.002,
    "vento": 0.6335
   },
   "ranking": {
    "marte": [
     {
      "id": "gale",
      "nome": "Cratera Gale",
      "semelhanca": 95.8,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "jezero",
      "nome": "Cratera Jezero",
      "semelhanca": 86.7,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "hellas",
      "nome": "Bacia de Hellas",
      "semelhanca": 85.1,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "meridiani",
      "nome": "Meridiani Planum",
      "semelhanca": 79.9,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "utopia",
      "nome": "Utopia Planitia",
      "semelhanca": 77.5,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "valles",
      "nome": "Valles Marineris",
      "semelhanca": 48.0,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     }
    ],
    "lua": [
     {
      "id": "tycho",
      "nome": "Cratera Tycho",
      "semelhanca": 83.6,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "tranquillitatis",
      "nome": "Mare Tranquillitatis",
      "semelhanca": 80.7,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "malapert",
      "nome": "Monte Malapert",
      "semelhanca": 67.8,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "shackleton",
      "nome": "Polo Sul (Cratera Shackleton)",
      "semelhanca": 65.6,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     }
    ]
   }
  },
  {
   "id": "holuhraun",
   "nome": {
    "pt": "Campo de lava de Holuhraun",
    "en": "Holuhraun lava field"
   },
   "pais": {
    "pt": "Islândia",
    "en": "Iceland"
   },
   "tipo": "vulcânico",
   "lat": 64.85,
   "lon": -16.83,
   "descricao": {
    "pt": "Lava basáltica recente em um lugar frio, perto de geleiras.",
    "en": "Recent basaltic lava in a cold place, near glaciers."
   },
   "util_para_testar": {
    "marte": {
     "pt": "Treinar a navegação de rovers sobre lava áspera e irregular.",
     "en": "Train rover navigation over rough, jagged lava."
    },
    "lua": {
     "pt": "Testar rodas e pés de pouso sobre terreno basáltico.",
     "en": "Test wheels and landing feet on basaltic terrain."
    }
   },
   "celula": {
    "lat": 65.0,
    "lon": -17.0,
    "tamanho_graus": 2
   },
   "tem_dado": true,
   "valores": {
    "temperatura_C": -4.758,
    "amplitude_C": 20.978,
    "elevacao_m": 804.6,
    "rugosidade_m": 427.8,
    "declividade_graus": 3.174,
    "fonte_relevo": "SRTMGL30",
    "frac_neve": 0.725,
    "frac_T_abaixo_0C": 0.746,
    "vento_ms": 9.228,
    "poeira_ugm3": 1.022
   },
   "notas": {
    "temperatura": 0.7007,
    "relevo": 0.1426,
    "gelo": 0.7355,
    "vento": 0.769
   },
   "ranking": {
    "marte": [
     {
      "id": "meridiani",
      "nome": "Meridiani Planum",
      "semelhanca": 55.0,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "hellas",
      "nome": "Bacia de Hellas",
      "semelhanca": 54.5,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "jezero",
      "nome": "Cratera Jezero",
      "semelhanca": 54.2,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "utopia",
      "nome": "Utopia Planitia",
      "semelhanca": 53.6,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "gale",
      "nome": "Cratera Gale",
      "semelhanca": 52.9,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "valles",
      "nome": "Valles Marineris",
      "semelhanca": 20.5,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     }
    ],
    "lua": [
     {
      "id": "tranquillitatis",
      "nome": "Mare Tranquillitatis",
      "semelhanca": 55.2,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "tycho",
      "nome": "Cratera Tycho",
      "semelhanca": 55.1,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "shackleton",
      "nome": "Polo Sul (Cratera Shackleton)",
      "semelhanca": 52.8,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "malapert",
      "nome": "Monte Malapert",
      "semelhanca": 46.6,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     }
    ]
   }
  },
  {
   "id": "haughton",
   "nome": {
    "pt": "Cratera de Haughton",
    "en": "Haughton Crater"
   },
   "pais": {
    "pt": "Ilha Devon, Canadá",
    "en": "Devon Island, Canada"
   },
   "tipo": "polar",
   "lat": 75.38,
   "lon": -89.68,
   "descricao": {
    "pt": "Cratera de impacto em deserto polar. Aqui funciona o Projeto Haughton-Mars, apoiado pela NASA, com testes de robôs e treino de astronautas.",
    "en": "Impact crater in a polar desert. Home of the Haughton-Mars Project, supported by NASA, with robot tests and astronaut training."
   },
   "util_para_testar": {
    "marte": {
     "pt": "Simular uma missão tripulada inteira: trajes, veículos e comunicação com atraso.",
     "en": "Simulate a whole crewed mission: suits, vehicles and communication with delay."
    },
    "lua": {
     "pt": "Treinar astronautas a estudar uma cratera de impacto.",
     "en": "Train astronauts to study an impact crater."
    }
   },
   "celula": {
    "lat": 75.0,
    "lon": -89.0,
    "tamanho_graus": 2
   },
   "tem_dado": true,
   "valores": {
    "temperatura_C": -19.752,
    "amplitude_C": 46.224,
    "elevacao_m": 242.4,
    "rugosidade_m": 102.4,
    "declividade_graus": 2.32,
    "fonte_relevo": "SRTMGL30",
    "frac_neve": 0.666,
    "frac_T_abaixo_0C": 0.89,
    "vento_ms": 6.015,
    "poeira_ugm3": 1.296
   },
   "notas": {
    "temperatura": 0.6579,
    "relevo": 0.0341,
    "gelo": 0.778,
    "vento": 0.5012
   },
   "ranking": {
    "marte": [
     {
      "id": "meridiani",
      "nome": "Meridiani Planum",
      "semelhanca": 52.8,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "utopia",
      "nome": "Utopia Planitia",
      "semelhanca": 51.8,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "hellas",
      "nome": "Bacia de Hellas",
      "semelhanca": 51.4,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "jezero",
      "nome": "Cratera Jezero",
      "semelhanca": 50.7,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "gale",
      "nome": "Cratera Gale",
      "semelhanca": 47.1,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "valles",
      "nome": "Valles Marineris",
      "semelhanca": 12.2,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     }
    ],
    "lua": [
     {
      "id": "tranquillitatis",
      "nome": "Mare Tranquillitatis",
      "semelhanca": 53.4,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "tycho",
      "nome": "Cratera Tycho",
      "semelhanca": 52.6,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "shackleton",
      "nome": "Polo Sul (Cratera Shackleton)",
      "semelhanca": 50.8,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "malapert",
      "nome": "Monte Malapert",
      "semelhanca": 43.3,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     }
    ]
   }
  },
  {
   "id": "namibe",
   "nome": {
    "pt": "Deserto do Namibe",
    "en": "Namib Desert"
   },
   "pais": {
    "pt": "Namíbia",
    "en": "Namibia"
   },
   "tipo": "deserto",
   "lat": -24.75,
   "lon": 15.3,
   "descricao": {
    "pt": "Dunas gigantes e vento constante, como os campos de dunas de Marte.",
    "en": "Giant dunes and constant wind, like the dune fields of Mars."
   },
   "util_para_testar": {
    "marte": {
     "pt": "Testar rovers subindo dunas e estudar como as dunas se movem.",
     "en": "Test rovers climbing dunes and study how dunes move."
    },
    "lua": {
     "pt": "Testar filtros e vedações contra poeira fina.",
     "en": "Test filters and seals against fine dust."
    }
   },
   "celula": {
    "lat": -25.0,
    "lon": 15.0,
    "tamanho_graus": 2
   },
   "tem_dado": true,
   "valores": {
    "temperatura_C": 29.431,
    "amplitude_C": 14.468,
    "elevacao_m": 653.6,
    "rugosidade_m": 304.4,
    "declividade_graus": 1.467,
    "fonte_relevo": "SRTMGL30",
    "frac_neve": 0.0,
    "frac_T_abaixo_0C": 0.0,
    "vento_ms": 7.195,
    "poeira_ugm3": 96.96
   },
   "notas": {
    "temperatura": 0.7984,
    "relevo": 0.1015,
    "gelo": 0.0,
    "vento": 0.5996
   },
   "ranking": {
    "marte": [
     {
      "id": "hellas",
      "nome": "Bacia de Hellas",
      "semelhanca": 97.0,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "jezero",
      "nome": "Cratera Jezero",
      "semelhanca": 96.3,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "meridiani",
      "nome": "Meridiani Planum",
      "semelhanca": 94.6,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "utopia",
      "nome": "Utopia Planitia",
      "semelhanca": 93.1,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "gale",
      "nome": "Cratera Gale",
      "semelhanca": 81.3,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "valles",
      "nome": "Valles Marineris",
      "semelhanca": 32.0,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     }
    ],
    "lua": [
     {
      "id": "tranquillitatis",
      "nome": "Mare Tranquillitatis",
      "semelhanca": 85.3,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "tycho",
      "nome": "Cratera Tycho",
      "semelhanca": 83.8,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "shackleton",
      "nome": "Polo Sul (Cratera Shackleton)",
      "semelhanca": 62.2,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "malapert",
      "nome": "Monte Malapert",
      "semelhanca": 61.2,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     }
    ]
   }
  },
  {
   "id": "lanzarote",
   "nome": {
    "pt": "Tubos de lava de Lanzarote",
    "en": "Lanzarote lava tubes"
   },
   "pais": {
    "pt": "Canárias, Espanha",
    "en": "Canary Islands, Spain"
   },
   "tipo": "caverna",
   "lat": 29.16,
   "lon": -13.44,
   "descricao": {
    "pt": "Túneis formados por lava, como os que existem na Lua e em Marte.",
    "en": "Tunnels formed by lava, like those found on the Moon and Mars."
   },
   "util_para_testar": {
    "marte": {
     "pt": "Testar drones e robôs que mapeiam cavernas no escuro.",
     "en": "Test drones and robots that map caves in the dark."
    },
    "lua": {
     "pt": "Estudar tubos de lava como abrigo contra radiação para uma base lunar.",
     "en": "Study lava tubes as shelter from radiation for a lunar base."
    }
   },
   "celula": {
    "lat": 29.0,
    "lon": -13.0,
    "tamanho_graus": 2
   },
   "tem_dado": true,
   "valores": {
    "temperatura_C": 23.692,
    "amplitude_C": 10.788,
    "elevacao_m": 137.2,
    "rugosidade_m": 114.9,
    "declividade_graus": 2.604,
    "fonte_relevo": "SRTMGL30",
    "frac_neve": 0.0,
    "frac_T_abaixo_0C": 0.0,
    "vento_ms": 7.362,
    "poeira_ugm3": 64.83
   },
   "notas": {
    "temperatura": 0.782,
    "relevo": 0.0383,
    "gelo": 0.0,
    "vento": 0.6135
   },
   "ranking": {
    "marte": [
     {
      "id": "utopia",
      "nome": "Utopia Planitia",
      "semelhanca": 96.8,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "meridiani",
      "nome": "Meridiani Planum",
      "semelhanca": 96.2,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "hellas",
      "nome": "Bacia de Hellas",
      "semelhanca": 93.3,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "jezero",
      "nome": "Cratera Jezero",
      "semelhanca": 92.1,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "gale",
      "nome": "Cratera Gale",
      "semelhanca": 76.6,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "valles",
      "nome": "Valles Marineris",
      "semelhanca": 27.3,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     }
    ],
    "lua": [
     {
      "id": "tranquillitatis",
      "nome": "Mare Tranquillitatis",
      "semelhanca": 86.5,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "tycho",
      "nome": "Cratera Tycho",
      "semelhanca": 83.6,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "shackleton",
      "nome": "Polo Sul (Cratera Shackleton)",
      "semelhanca": 61.9,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "malapert",
      "nome": "Monte Malapert",
      "semelhanca": 59.9,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     }
    ]
   }
  },
  {
   "id": "lava-beds",
   "nome": {
    "pt": "Lava Beds",
    "en": "Lava Beds"
   },
   "pais": {
    "pt": "Califórnia, EUA",
    "en": "California, USA"
   },
   "tipo": "caverna",
   "lat": 41.71,
   "lon": -121.51,
   "descricao": {
    "pt": "Centenas de cavernas de lava, algumas com gelo lá dentro.",
    "en": "Hundreds of lava caves, some with ice inside."
   },
   "util_para_testar": {
    "marte": {
     "pt": "Testar sensores que procuram gelo e vida microbiana dentro de cavernas.",
     "en": "Test sensors that look for ice and microbial life inside caves."
    },
    "lua": {
     "pt": "Testar a comunicação por rádio entre o fundo de uma caverna e a superfície.",
     "en": "Test radio communication between the bottom of a cave and the surface."
    }
   },
   "celula": {
    "lat": 41.0,
    "lon": -121.0,
    "tamanho_graus": 2
   },
   "tem_dado": true,
   "valores": {
    "temperatura_C": 12.351,
    "amplitude_C": 29.991,
    "elevacao_m": 1501.4,
    "rugosidade_m": 333.2,
    "declividade_graus": 3.506,
    "fonte_relevo": "SRTMGL30",
    "frac_neve": 0.167,
    "frac_T_abaixo_0C": 0.152,
    "vento_ms": 5.092,
    "poeira_ugm3": 5.782
   },
   "notas": {
    "temperatura": 0.7496,
    "relevo": 0.1111,
    "gelo": 0.1595,
    "vento": 0.4243
   },
   "ranking": {
    "marte": [
     {
      "id": "hellas",
      "nome": "Bacia de Hellas",
      "semelhanca": 92.3,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "meridiani",
      "nome": "Meridiani Planum",
      "semelhanca": 91.9,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "jezero",
      "nome": "Cratera Jezero",
      "semelhanca": 91.6,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "utopia",
      "nome": "Utopia Planitia",
      "semelhanca": 89.5,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "gale",
      "nome": "Cratera Gale",
      "semelhanca": 81.1,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "valles",
      "nome": "Valles Marineris",
      "semelhanca": 32.3,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     }
    ],
    "lua": [
     {
      "id": "tranquillitatis",
      "nome": "Mare Tranquillitatis",
      "semelhanca": 84.7,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "tycho",
      "nome": "Cratera Tycho",
      "semelhanca": 83.7,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "shackleton",
      "nome": "Polo Sul (Cratera Shackleton)",
      "semelhanca": 65.9,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "malapert",
      "nome": "Monte Malapert",
      "semelhanca": 63.0,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     }
    ]
   }
  },
  {
   "id": "utah-mdrs",
   "nome": {
    "pt": "Deserto de San Rafael (MDRS)",
    "en": "San Rafael Desert (MDRS)"
   },
   "pais": {
    "pt": "Utah, EUA",
    "en": "Utah, USA"
   },
   "tipo": "deserto",
   "lat": 38.41,
   "lon": -110.79,
   "descricao": {
    "pt": "Rochas vermelhas e sedimentares. Tem uma estação de simulação de Marte.",
    "en": "Red, sedimentary rocks. Home to a Mars simulation station."
   },
   "util_para_testar": {
    "marte": {
     "pt": "Fazer simulações de semanas vivendo isolado, como numa base em Marte.",
     "en": "Run simulations of weeks living in isolation, as in a Mars base."
    },
    "lua": {
     "pt": "Treinar caminhadas com traje e coleta de amostras.",
     "en": "Practice spacewalks in a suit and sample collection."
    }
   },
   "celula": {
    "lat": 39.0,
    "lon": -111.0,
    "tamanho_graus": 2
   },
   "tem_dado": true,
   "valores": {
    "temperatura_C": 12.275,
    "amplitude_C": 36.684,
    "elevacao_m": 2021.4,
    "rugosidade_m": 481.7,
    "declividade_graus": 4.287,
    "fonte_relevo": "SRTMGL30",
    "frac_neve": 0.191,
    "frac_T_abaixo_0C": 0.249,
    "vento_ms": 5.471,
    "poeira_ugm3": 7.458
   },
   "notas": {
    "temperatura": 0.7494,
    "relevo": 0.1606,
    "gelo": 0.22,
    "vento": 0.4559
   },
   "ranking": {
    "marte": [
     {
      "id": "hellas",
      "nome": "Bacia de Hellas",
      "semelhanca": 87.9,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "jezero",
      "nome": "Cratera Jezero",
      "semelhanca": 87.8,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "meridiani",
      "nome": "Meridiani Planum",
      "semelhanca": 86.5,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "utopia",
      "nome": "Utopia Planitia",
      "semelhanca": 84.1,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "gale",
      "nome": "Cratera Gale",
      "semelhanca": 82.4,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "valles",
      "nome": "Valles Marineris",
      "semelhanca": 35.4,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     }
    ],
    "lua": [
     {
      "id": "tycho",
      "nome": "Cratera Tycho",
      "semelhanca": 81.6,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "tranquillitatis",
      "nome": "Mare Tranquillitatis",
      "semelhanca": 81.5,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "shackleton",
      "nome": "Polo Sul (Cratera Shackleton)",
      "semelhanca": 66.4,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "malapert",
      "nome": "Monte Malapert",
      "semelhanca": 63.5,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     }
    ]
   }
  },
  {
   "id": "svalbard",
   "nome": {
    "pt": "Svalbard (Bockfjord)",
    "en": "Svalbard (Bockfjord)"
   },
   "pais": {
    "pt": "Noruega",
    "en": "Norway"
   },
   "tipo": "polar",
   "lat": 79.4,
   "lon": 13.3,
   "descricao": {
    "pt": "Vulcões antigos no meio do gelo do Ártico.",
    "en": "Ancient volcanoes in the middle of Arctic ice."
   },
   "util_para_testar": {
    "marte": {
     "pt": "Testar instrumentos de rovers (a NASA já testou aqui, em Bockfjord, protótipos de instrumentos do Curiosity: CheMin e SAM).",
     "en": "Test rover instruments (NASA has tested prototypes of Curiosity instruments here, in Bockfjord: CheMin and SAM)."
    },
    "lua": {
     "pt": "Testar a busca por gelo em regiões frias e escuras, como os polos da Lua.",
     "en": "Test the search for ice in cold, dark regions, like the Moon's poles."
    }
   },
   "celula": {
    "lat": 79.0,
    "lon": 13.0,
    "tamanho_graus": 2
   },
   "tem_dado": true,
   "valores": {
    "temperatura_C": -12.925,
    "amplitude_C": 30.915,
    "elevacao_m": 467.1,
    "rugosidade_m": 285.0,
    "declividade_graus": 6.924,
    "fonte_relevo": "SRTMGL30",
    "frac_neve": 0.9,
    "frac_T_abaixo_0C": 0.877,
    "vento_ms": 6.77,
    "poeira_ugm3": 1.703
   },
   "notas": {
    "temperatura": 0.6774,
    "relevo": 0.095,
    "gelo": 0.8885,
    "vento": 0.5642
   },
   "ranking": {
    "marte": [
     {
      "id": "meridiani",
      "nome": "Meridiani Planum",
      "semelhanca": 45.4,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "hellas",
      "nome": "Bacia de Hellas",
      "semelhanca": 44.5,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "utopia",
      "nome": "Utopia Planitia",
      "semelhanca": 44.3,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "jezero",
      "nome": "Cratera Jezero",
      "semelhanca": 44.0,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "gale",
      "nome": "Cratera Gale",
      "semelhanca": 42.2,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "valles",
      "nome": "Valles Marineris",
      "semelhanca": 11.6,
      "aspectos_usados": [
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     }
    ],
    "lua": [
     {
      "id": "tranquillitatis",
      "nome": "Mare Tranquillitatis",
      "semelhanca": 46.7,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "tycho",
      "nome": "Cratera Tycho",
      "semelhanca": 46.4,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "shackleton",
      "nome": "Polo Sul (Cratera Shackleton)",
      "semelhanca": 45.8,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "malapert",
      "nome": "Monte Malapert",
      "semelhanca": 38.8,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     }
    ]
   }
  }
 ],
 "marte": [
  {
   "id": "jezero",
   "nome": {
    "pt": "Cratera Jezero",
    "en": "Jezero Crater"
   },
   "descricao": {
    "pt": "Antigo delta de rio. É onde o rover Perseverance trabalha.",
    "en": "Ancient river delta. This is where the Perseverance rover works."
   },
   "lat": 18.4082,
   "lon_leste": 77.6873,
   "coord_verificada": true,
   "notas": {
    "temperatura": null,
    "relevo": 0.13888966666666666,
    "gelo": 0.03531,
    "vento": null
   },
   "valores": {
    "relevo_m": 416.669,
    "agua_pct": 3.531
   }
  },
  {
   "id": "gale",
   "nome": {
    "pt": "Cratera Gale",
    "en": "Gale Crater"
   },
   "descricao": {
    "pt": "Cratera com uma montanha de camadas no meio. É onde o rover Curiosity trabalha.",
    "en": "Crater with a layered mountain in the middle. This is where the Curiosity rover works."
   },
   "lat": -5.3672,
   "lon_leste": 137.811,
   "coord_verificada": true,
   "notas": {
    "temperatura": null,
    "relevo": 0.34418896666666665,
    "gelo": 0.054029999999999995,
    "vento": null
   },
   "valores": {
    "relevo_m": 1032.5669,
    "agua_pct": 5.403
   }
  },
  {
   "id": "meridiani",
   "nome": {
    "pt": "Meridiani Planum",
    "en": "Meridiani Planum"
   },
   "descricao": {
    "pt": "Planície com hematita, um mineral ligado à água. O rover Opportunity explorou aqui.",
    "en": "Plain with hematite, a mineral linked to water. The Opportunity rover explored here."
   },
   "lat": -0.04,
   "lon_leste": 356.86,
   "coord_verificada": true,
   "notas": {
    "temperatura": null,
    "relevo": 0.050382666666666666,
    "gelo": 0.05682,
    "vento": null
   },
   "valores": {
    "relevo_m": 151.148,
    "agua_pct": 5.682
   }
  },
  {
   "id": "valles",
   "nome": {
    "pt": "Valles Marineris",
    "en": "Valles Marineris"
   },
   "descricao": {
    "pt": "O maior cânion do Sistema Solar, com até 7 km de profundidade.",
    "en": "The largest canyon in the Solar System, up to 7 km deep."
   },
   "lat": -14.0059,
   "lon_leste": 301.4123,
   "coord_verificada": true,
   "notas": {
    "temperatura": null,
    "relevo": 1.0,
    "gelo": 0.03306,
    "vento": null
   },
   "valores": {
    "relevo_m": 3190.4977,
    "agua_pct": 3.306
   }
  },
  {
   "id": "hellas",
   "nome": {
    "pt": "Bacia de Hellas",
    "en": "Hellas Basin"
   },
   "descricao": {
    "pt": "Cratera de impacto gigante, o ponto mais baixo de Marte. Muitas tempestades de poeira.",
    "en": "Giant impact basin, the lowest point on Mars. Many dust storms."
   },
   "lat": -42.4301,
   "lon_leste": 70.5025,
   "coord_verificada": true,
   "notas": {
    "temperatura": null,
    "relevo": 0.1186012,
    "gelo": 0.04156,
    "vento": null
   },
   "valores": {
    "relevo_m": 355.8036,
    "agua_pct": 4.156
   }
  },
  {
   "id": "utopia",
   "nome": {
    "pt": "Utopia Planitia",
    "en": "Utopia Planitia"
   },
   "descricao": {
    "pt": "Planície enorme com muito gelo embaixo do solo. O Viking 2 pousou aqui.",
    "en": "Huge plain with lots of ice under the soil. Viking 2 landed here."
   },
   "lat": 46.7363,
   "lon_leste": 117.5168,
   "coord_verificada": true,
   "notas": {
    "temperatura": null,
    "relevo": 0.0171563,
    "gelo": 0.04229,
    "vento": null
   },
   "valores": {
    "relevo_m": 51.4689,
    "agua_pct": 4.229
   }
  }
 ],
 "lua": [
  {
   "id": "shackleton",
   "nome": {
    "pt": "Polo Sul (Cratera Shackleton)",
    "en": "South Pole (Shackleton Crater)"
   },
   "descricao": {
    "pt": "O fundo da cratera nunca recebe sol. Pode guardar gelo de água. Alvo do programa Artemis.",
    "en": "The crater floor never sees sunlight. It may hold water ice. A target of the Artemis program."
   },
   "lat": -89.67,
   "lon_leste": 129.78,
   "coord_verificada": true,
   "notas": {
    "temperatura": 0.20892171428571438,
    "relevo": 0.3178366,
    "gelo": 0.1317,
    "vento": null
   },
   "valores": {
    "temperatura_C": -176.87739999999997,
    "temperatura_max_C": 74.65000000000003,
    "relevo_m": 953.5098,
    "armadilha_fria_pct": 13.170000000000002
   }
  },
  {
   "id": "tranquillitatis",
   "nome": {
    "pt": "Mare Tranquillitatis",
    "en": "Mare Tranquillitatis"
   },
   "descricao": {
    "pt": "Planície de lava basáltica. É onde a Apollo 11 pousou.",
    "en": "Basaltic lava plain. This is where Apollo 11 landed."
   },
   "lat": 8.3487,
   "lon_leste": 30.8346,
   "coord_verificada": true,
   "notas": {
    "temperatura": 0.5552157142857144,
    "relevo": 0.04871453333333333,
    "gelo": 0.0,
    "vento": null
   },
   "valores": {
    "temperatura_C": -55.674499999999966,
    "temperatura_max_C": 121.18,
    "relevo_m": 146.1436,
    "armadilha_fria_pct": 0.0
   }
  },
  {
   "id": "tycho",
   "nome": {
    "pt": "Cratera Tycho",
    "en": "Tycho Crater"
   },
   "descricao": {
    "pt": "Cratera jovem com paredes altas e raios brilhantes que dá para ver da Terra.",
    "en": "Young crater with high walls and bright rays that can be seen from Earth."
   },
   "lat": -43.2958,
   "lon_leste": 348.7847,
   "coord_verificada": true,
   "notas": {
    "temperatura": 0.5316211428571429,
    "relevo": 0.16456206666666667,
    "gelo": 0.0,
    "vento": null
   },
   "valores": {
    "temperatura_C": -63.93259999999998,
    "temperatura_max_C": 75.18,
    "relevo_m": 493.6862,
    "armadilha_fria_pct": 0.0
   }
  },
  {
   "id": "malapert",
   "nome": {
    "pt": "Monte Malapert",
    "en": "Malapert Mountain"
   },
   "descricao": {
    "pt": "Montanha perto do polo sul, com boa vista para a Terra (bom para comunicação).",
    "en": "Mountain near the south pole with a good view of Earth (good for communication)."
   },
   "lat": -85.98,
   "lon_leste": 358.33,
   "coord_verificada": true,
   "notas": {
    "temperatura": 0.260794,
    "relevo": 0.5079971333333334,
    "gelo": 0.0257,
    "vento": null
   },
   "valores": {
    "temperatura_C": -158.72209999999998,
    "temperatura_max_C": 68.93,
    "relevo_m": 1523.9914,
    "armadilha_fria_pct": 2.5700000000000003
   }
  }
 ]
};
