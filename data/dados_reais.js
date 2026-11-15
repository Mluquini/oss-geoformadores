// Gerado por scripts/05_exportar_site.py: NÃO edite à mão.
window.DADOS_REAIS = {
 "gerado_em": "2026-11-15",
 "anos_terra": [
  2020
 ],
 "status": {
  "n_com": 12,
  "n_total": 12,
  "terra_sem_dado": [],
  "marte_usa": [
   "relevo",
   "declividade",
   "gelo"
  ],
  "marte_usa_so_em": {
   "aspectos": [
    "temperatura",
    "diurna"
   ],
   "locais": [
    "jezero",
    "gale"
   ]
  },
  "lua_usa": [
   "temperatura",
   "diurna",
   "relevo",
   "declividade",
   "gelo"
  ]
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
  "declividade": {
   "min": 0.0,
   "max": 15.0,
   "unidade": "graus (inclinação média do terreno na escala de ~3,7 km por pixel)",
   "motivo": "Nos valores calculados vai de ~0 a ~5° na Terra, ~0,3 a ~7,6° em Marte e ~0,7 a ~12° na Lua (bordas de crateras polares); 15° dá folga. A inclinação depende do tamanho do pixel, por isso os três corpos foram medidos na MESMA escala de ~3,7 km (Terra: blocos de 4x4 pixels de 30\"; Marte: MOLA de 16 pixels/grau; Lua: LOLA de 16 pixels/grau reduzido 2x2)."
  },
  "diurna": {
   "min": 0.0,
   "max": 350.0,
   "unidade": "K ou °C (diferença entre a temperatura do dia e a da noite)",
   "motivo": "Na Lua, de ~234 K (Tycho) a ~300 K (Tranquillitatis); na Terra, de ~1 a ~34 K (ar e solo úmidos amortecem o ciclo). Por isso nenhum lugar da Terra se parece com a Lua nesse aspecto: é uma diferença REAL, e não um erro. Marte não tem dado (ver relatório). Terra: média anual de (MODIS dia − noite), uma aproximação do máximo menos o mínimo do dia; Lua: máximo menos mínimo da curva do dia lunar (Diviner GCP)."
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
   "temperatura": 0.16666666666666666,
   "diurna": 0.16666666666666666,
   "relevo": 0.13333333333333333,
   "declividade": 0.13333333333333333,
   "gelo": 0.19999999999999998,
   "vento": 0.19999999999999998
  },
  "lua": {
   "temperatura": 0.1764705882352941,
   "diurna": 0.1764705882352941,
   "relevo": 0.14705882352941174,
   "declividade": 0.14705882352941174,
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
   "Mars 2020/Perseverance MEDA: mars2020_meda",
   "MGS/MOLA: MGS-M-MOLA-5-MEGDR-L3-V1.0",
   "Mars Odyssey/GRS: ODY-M-GRS-5-ELEMENTS-V1.0",
   "MSL/Curiosity REMS: msl_rems_bundle"
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
    "amplitude_diurna_C": 33.544,
    "elevacao_m": 3266.3,
    "rugosidade_m": 1053.7,
    "declividade_graus": 4.275,
    "declividade_3km_graus": 2.764,
    "fonte_relevo": "SRTMGL30",
    "frac_neve": 0.012,
    "frac_T_abaixo_0C": 0.022,
    "vento_ms": 5.814,
    "poeira_ugm3": 5.926
   },
   "notas": {
    "temperatura": 0.7643,
    "diurna": 0.0958,
    "relevo": 0.3512,
    "declividade": 0.1843,
    "gelo": 0.017,
    "vento": 0.4845
   },
   "ranking": {
    "marte": [
     {
      "id": "gale",
      "nome": "Cratera Gale",
      "semelhanca": 88.3,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.8
     },
     {
      "id": "hellas",
      "nome": "Bacia de Hellas",
      "semelhanca": 87.2,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "jezero",
      "nome": "Cratera Jezero",
      "semelhanca": 86.3,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.8
     },
     {
      "id": "meridiani",
      "nome": "Meridiani Planum",
      "semelhanca": 82.6,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "utopia",
      "nome": "Utopia Planitia",
      "semelhanca": 80.0,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "valles",
      "nome": "Valles Marineris",
      "semelhanca": 61.3,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     }
    ],
    "lua": [
     {
      "id": "tycho",
      "nome": "Cratera Tycho",
      "semelhanca": 72.0,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "malapert",
      "nome": "Monte Malapert",
      "semelhanca": 65.7,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.824
     },
     {
      "id": "tranquillitatis",
      "nome": "Mare Tranquillitatis",
      "semelhanca": 64.4,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "shackleton",
      "nome": "Polo Sul (Cratera Shackleton)",
      "semelhanca": 62.4,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.824
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
    "amplitude_diurna_C": 2.097,
    "elevacao_m": 636.2,
    "rugosidade_m": 492.9,
    "declividade_graus": 6.345,
    "declividade_3km_graus": 4.831,
    "fonte_relevo": "ETOPO202",
    "frac_neve": 1.0,
    "frac_T_abaixo_0C": 1.0,
    "vento_ms": 7.942,
    "poeira_ugm3": 0.421
   },
   "notas": {
    "temperatura": 0.6325,
    "diurna": 0.006,
    "relevo": 0.1643,
    "declividade": 0.3221,
    "gelo": 1.0,
    "vento": 0.6618
   },
   "ranking": {
    "marte": [
     {
      "id": "gale",
      "nome": "Cratera Gale",
      "semelhanca": 51.1,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.8
     },
     {
      "id": "jezero",
      "nome": "Cratera Jezero",
      "semelhanca": 50.1,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.8
     },
     {
      "id": "meridiani",
      "nome": "Meridiani Planum",
      "semelhanca": 36.5,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "hellas",
      "nome": "Bacia de Hellas",
      "semelhanca": 36.4,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "utopia",
      "nome": "Utopia Planitia",
      "semelhanca": 34.8,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "valles",
      "nome": "Valles Marineris",
      "semelhanca": 21.9,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     }
    ],
    "lua": [
     {
      "id": "shackleton",
      "nome": "Polo Sul (Cratera Shackleton)",
      "semelhanca": 36.1,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.824
     },
     {
      "id": "tycho",
      "nome": "Cratera Tycho",
      "semelhanca": 34.2,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "malapert",
      "nome": "Monte Malapert",
      "semelhanca": 29.9,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.824
     },
     {
      "id": "tranquillitatis",
      "nome": "Mare Tranquillitatis",
      "semelhanca": 29.6,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
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
    "amplitude_diurna_C": 26.873,
    "elevacao_m": 811.4,
    "rugosidade_m": 404.3,
    "declividade_graus": 1.378,
    "declividade_3km_graus": 0.75,
    "fonte_relevo": "SRTMGL30",
    "frac_neve": 0.001,
    "frac_T_abaixo_0C": 0.0,
    "vento_ms": 6.483,
    "poeira_ugm3": 113.903
   },
   "notas": {
    "temperatura": 0.8018,
    "diurna": 0.0768,
    "relevo": 0.1348,
    "declividade": 0.05,
    "gelo": 0.0005,
    "vento": 0.5403
   },
   "ranking": {
    "marte": [
     {
      "id": "hellas",
      "nome": "Bacia de Hellas",
      "semelhanca": 94.8,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "meridiani",
      "nome": "Meridiani Planum",
      "semelhanca": 94.1,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "utopia",
      "nome": "Utopia Planitia",
      "semelhanca": 92.9,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "jezero",
      "nome": "Cratera Jezero",
      "semelhanca": 87.3,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.8
     },
     {
      "id": "gale",
      "nome": "Cratera Gale",
      "semelhanca": 81.5,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.8
     },
     {
      "id": "valles",
      "nome": "Valles Marineris",
      "semelhanca": 47.7,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     }
    ],
    "lua": [
     {
      "id": "tycho",
      "nome": "Cratera Tycho",
      "semelhanca": 69.9,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "tranquillitatis",
      "nome": "Mare Tranquillitatis",
      "semelhanca": 65.4,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "malapert",
      "nome": "Monte Malapert",
      "semelhanca": 57.8,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.824
     },
     {
      "id": "shackleton",
      "nome": "Polo Sul (Cratera Shackleton)",
      "semelhanca": 56.3,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.824
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
    "amplitude_diurna_C": 16.538,
    "elevacao_m": 145.7,
    "rugosidade_m": 244.6,
    "declividade_graus": 1.708,
    "declividade_3km_graus": 1.03,
    "fonte_relevo": "SRTMGL30",
    "frac_neve": 0.0,
    "frac_T_abaixo_0C": 0.0,
    "vento_ms": 5.46,
    "poeira_ugm3": 133.365
   },
   "notas": {
    "temperatura": 0.8196,
    "diurna": 0.0473,
    "relevo": 0.0815,
    "declividade": 0.0687,
    "gelo": 0.0,
    "vento": 0.455
   },
   "ranking": {
    "marte": [
     {
      "id": "meridiani",
      "nome": "Meridiani Planum",
      "semelhanca": 95.9,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "hellas",
      "nome": "Bacia de Hellas",
      "semelhanca": 95.2,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "utopia",
      "nome": "Utopia Planitia",
      "semelhanca": 94.8,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "jezero",
      "nome": "Cratera Jezero",
      "semelhanca": 85.9,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.8
     },
     {
      "id": "gale",
      "nome": "Cratera Gale",
      "semelhanca": 79.9,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.8
     },
     {
      "id": "valles",
      "nome": "Valles Marineris",
      "semelhanca": 45.6,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     }
    ],
    "lua": [
     {
      "id": "tycho",
      "nome": "Cratera Tycho",
      "semelhanca": 68.7,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "tranquillitatis",
      "nome": "Mare Tranquillitatis",
      "semelhanca": 64.1,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "malapert",
      "nome": "Monte Malapert",
      "semelhanca": 57.0,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.824
     },
     {
      "id": "shackleton",
      "nome": "Polo Sul (Cratera Shackleton)",
      "semelhanca": 55.9,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.824
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
    "amplitude_diurna_C": 15.125,
    "elevacao_m": 1247.9,
    "rugosidade_m": 937.0,
    "declividade_graus": 4.994,
    "declividade_3km_graus": 4.757,
    "fonte_relevo": "SRTMGL30",
    "frac_neve": 0.004,
    "frac_T_abaixo_0C": 0.0,
    "vento_ms": 7.602,
    "poeira_ugm3": 0.881
   },
   "notas": {
    "temperatura": 0.7726,
    "diurna": 0.0432,
    "relevo": 0.3123,
    "declividade": 0.3171,
    "gelo": 0.002,
    "vento": 0.6335
   },
   "ranking": {
    "marte": [
     {
      "id": "gale",
      "nome": "Cratera Gale",
      "semelhanca": 87.5,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.8
     },
     {
      "id": "hellas",
      "nome": "Bacia de Hellas",
      "semelhanca": 85.4,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "jezero",
      "nome": "Cratera Jezero",
      "semelhanca": 83.9,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.8
     },
     {
      "id": "meridiani",
      "nome": "Meridiani Planum",
      "semelhanca": 80.4,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "utopia",
      "nome": "Utopia Planitia",
      "semelhanca": 77.4,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "valles",
      "nome": "Valles Marineris",
      "semelhanca": 61.8,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     }
    ],
    "lua": [
     {
      "id": "tycho",
      "nome": "Cratera Tycho",
      "semelhanca": 71.2,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "malapert",
      "nome": "Monte Malapert",
      "semelhanca": 68.7,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.824
     },
     {
      "id": "shackleton",
      "nome": "Polo Sul (Cratera Shackleton)",
      "semelhanca": 65.6,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.824
     },
     {
      "id": "tranquillitatis",
      "nome": "Mare Tranquillitatis",
      "semelhanca": 61.7,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
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
    "amplitude_diurna_C": 5.494,
    "elevacao_m": 804.6,
    "rugosidade_m": 427.8,
    "declividade_graus": 3.174,
    "declividade_3km_graus": 2.011,
    "fonte_relevo": "SRTMGL30",
    "frac_neve": 0.725,
    "frac_T_abaixo_0C": 0.746,
    "vento_ms": 9.228,
    "poeira_ugm3": 1.022
   },
   "notas": {
    "temperatura": 0.7007,
    "diurna": 0.0157,
    "relevo": 0.1426,
    "declividade": 0.1341,
    "gelo": 0.7355,
    "vento": 0.769
   },
   "ranking": {
    "marte": [
     {
      "id": "jezero",
      "nome": "Cratera Jezero",
      "semelhanca": 63.3,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.8
     },
     {
      "id": "gale",
      "nome": "Cratera Gale",
      "semelhanca": 62.6,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.8
     },
     {
      "id": "meridiani",
      "nome": "Meridiani Planum",
      "semelhanca": 55.2,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "hellas",
      "nome": "Bacia de Hellas",
      "semelhanca": 54.6,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "utopia",
      "nome": "Utopia Planitia",
      "semelhanca": 53.7,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "valles",
      "nome": "Valles Marineris",
      "semelhanca": 32.1,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     }
    ],
    "lua": [
     {
      "id": "tycho",
      "nome": "Cratera Tycho",
      "semelhanca": 47.1,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "shackleton",
      "nome": "Polo Sul (Cratera Shackleton)",
      "semelhanca": 45.7,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.824
     },
     {
      "id": "tranquillitatis",
      "nome": "Mare Tranquillitatis",
      "semelhanca": 43.2,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "malapert",
      "nome": "Monte Malapert",
      "semelhanca": 40.7,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.824
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
    "amplitude_diurna_C": 2.247,
    "elevacao_m": 242.4,
    "rugosidade_m": 102.4,
    "declividade_graus": 2.32,
    "declividade_3km_graus": 1.285,
    "fonte_relevo": "SRTMGL30",
    "frac_neve": 0.666,
    "frac_T_abaixo_0C": 0.89,
    "vento_ms": 6.015,
    "poeira_ugm3": 1.296
   },
   "notas": {
    "temperatura": 0.6579,
    "diurna": 0.0064,
    "relevo": 0.0341,
    "declividade": 0.0857,
    "gelo": 0.778,
    "vento": 0.5012
   },
   "ranking": {
    "marte": [
     {
      "id": "jezero",
      "nome": "Cratera Jezero",
      "semelhanca": 61.1,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.8
     },
     {
      "id": "gale",
      "nome": "Cratera Gale",
      "semelhanca": 59.2,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.8
     },
     {
      "id": "meridiani",
      "nome": "Meridiani Planum",
      "semelhanca": 52.8,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "utopia",
      "nome": "Utopia Planitia",
      "semelhanca": 51.7,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "hellas",
      "nome": "Bacia de Hellas",
      "semelhanca": 51.5,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "valles",
      "nome": "Valles Marineris",
      "semelhanca": 25.5,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     }
    ],
    "lua": [
     {
      "id": "tycho",
      "nome": "Cratera Tycho",
      "semelhanca": 44.4,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "shackleton",
      "nome": "Polo Sul (Cratera Shackleton)",
      "semelhanca": 42.6,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.824
     },
     {
      "id": "tranquillitatis",
      "nome": "Mare Tranquillitatis",
      "semelhanca": 41.4,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "malapert",
      "nome": "Monte Malapert",
      "semelhanca": 37.0,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.824
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
    "amplitude_diurna_C": 26.3,
    "elevacao_m": 653.6,
    "rugosidade_m": 304.4,
    "declividade_graus": 1.467,
    "declividade_3km_graus": 0.771,
    "fonte_relevo": "SRTMGL30",
    "frac_neve": 0.0,
    "frac_T_abaixo_0C": 0.0,
    "vento_ms": 7.195,
    "poeira_ugm3": 96.96
   },
   "notas": {
    "temperatura": 0.7984,
    "diurna": 0.0751,
    "relevo": 0.1015,
    "declividade": 0.0514,
    "gelo": 0.0,
    "vento": 0.5996
   },
   "ranking": {
    "marte": [
     {
      "id": "meridiani",
      "nome": "Meridiani Planum",
      "semelhanca": 95.3,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "hellas",
      "nome": "Bacia de Hellas",
      "semelhanca": 94.8,
      "aspectos_usados": [
       "relevo",
       "declividade",
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
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "jezero",
      "nome": "Cratera Jezero",
      "semelhanca": 87.3,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.8
     },
     {
      "id": "gale",
      "nome": "Cratera Gale",
      "semelhanca": 80.9,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.8
     },
     {
      "id": "valles",
      "nome": "Valles Marineris",
      "semelhanca": 46.1,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     }
    ],
    "lua": [
     {
      "id": "tycho",
      "nome": "Cratera Tycho",
      "semelhanca": 69.8,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "tranquillitatis",
      "nome": "Mare Tranquillitatis",
      "semelhanca": 65.5,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "malapert",
      "nome": "Monte Malapert",
      "semelhanca": 57.4,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.824
     },
     {
      "id": "shackleton",
      "nome": "Polo Sul (Cratera Shackleton)",
      "semelhanca": 56.2,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.824
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
    "amplitude_diurna_C": 16.306,
    "elevacao_m": 137.2,
    "rugosidade_m": 114.9,
    "declividade_graus": 2.604,
    "declividade_3km_graus": 1.36,
    "fonte_relevo": "SRTMGL30",
    "frac_neve": 0.0,
    "frac_T_abaixo_0C": 0.0,
    "vento_ms": 7.362,
    "poeira_ugm3": 64.83
   },
   "notas": {
    "temperatura": 0.782,
    "diurna": 0.0466,
    "relevo": 0.0383,
    "declividade": 0.0907,
    "gelo": 0.0,
    "vento": 0.6135
   },
   "ranking": {
    "marte": [
     {
      "id": "meridiani",
      "nome": "Meridiani Planum",
      "semelhanca": 96.1,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "utopia",
      "nome": "Utopia Planitia",
      "semelhanca": 95.1,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "hellas",
      "nome": "Bacia de Hellas",
      "semelhanca": 94.5,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "jezero",
      "nome": "Cratera Jezero",
      "semelhanca": 86.8,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.8
     },
     {
      "id": "gale",
      "nome": "Cratera Gale",
      "semelhanca": 80.1,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.8
     },
     {
      "id": "valles",
      "nome": "Valles Marineris",
      "semelhanca": 44.0,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     }
    ],
    "lua": [
     {
      "id": "tycho",
      "nome": "Cratera Tycho",
      "semelhanca": 69.4,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "tranquillitatis",
      "nome": "Mare Tranquillitatis",
      "semelhanca": 64.6,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "malapert",
      "nome": "Monte Malapert",
      "semelhanca": 57.8,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.824
     },
     {
      "id": "shackleton",
      "nome": "Polo Sul (Cratera Shackleton)",
      "semelhanca": 57.2,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.824
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
    "amplitude_diurna_C": 15.635,
    "elevacao_m": 1501.4,
    "rugosidade_m": 333.2,
    "declividade_graus": 3.506,
    "declividade_3km_graus": 1.96,
    "fonte_relevo": "SRTMGL30",
    "frac_neve": 0.167,
    "frac_T_abaixo_0C": 0.152,
    "vento_ms": 5.092,
    "poeira_ugm3": 5.782
   },
   "notas": {
    "temperatura": 0.7496,
    "diurna": 0.0447,
    "relevo": 0.1111,
    "declividade": 0.1307,
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
       "declividade",
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
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "utopia",
      "nome": "Utopia Planitia",
      "semelhanca": 89.0,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "jezero",
      "nome": "Cratera Jezero",
      "semelhanca": 87.1,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.8
     },
     {
      "id": "gale",
      "nome": "Cratera Gale",
      "semelhanca": 82.7,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.8
     },
     {
      "id": "valles",
      "nome": "Valles Marineris",
      "semelhanca": 47.8,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     }
    ],
    "lua": [
     {
      "id": "tycho",
      "nome": "Cratera Tycho",
      "semelhanca": 69.1,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "tranquillitatis",
      "nome": "Mare Tranquillitatis",
      "semelhanca": 63.4,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "shackleton",
      "nome": "Polo Sul (Cratera Shackleton)",
      "semelhanca": 61.0,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.824
     },
     {
      "id": "malapert",
      "nome": "Monte Malapert",
      "semelhanca": 60.3,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.824
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
    "amplitude_diurna_C": 18.188,
    "elevacao_m": 2021.4,
    "rugosidade_m": 481.7,
    "declividade_graus": 4.287,
    "declividade_3km_graus": 2.352,
    "fonte_relevo": "SRTMGL30",
    "frac_neve": 0.191,
    "frac_T_abaixo_0C": 0.249,
    "vento_ms": 5.471,
    "poeira_ugm3": 7.458
   },
   "notas": {
    "temperatura": 0.7494,
    "diurna": 0.052,
    "relevo": 0.1606,
    "declividade": 0.1568,
    "gelo": 0.22,
    "vento": 0.4559
   },
   "ranking": {
    "marte": [
     {
      "id": "hellas",
      "nome": "Bacia de Hellas",
      "semelhanca": 88.0,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "meridiani",
      "nome": "Meridiani Planum",
      "semelhanca": 86.9,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "jezero",
      "nome": "Cratera Jezero",
      "semelhanca": 85.5,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.8
     },
     {
      "id": "utopia",
      "nome": "Utopia Planitia",
      "semelhanca": 84.2,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "gale",
      "nome": "Cratera Gale",
      "semelhanca": 83.1,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.8
     },
     {
      "id": "valles",
      "nome": "Valles Marineris",
      "semelhanca": 49.9,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     }
    ],
    "lua": [
     {
      "id": "tycho",
      "nome": "Cratera Tycho",
      "semelhanca": 68.4,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "tranquillitatis",
      "nome": "Mare Tranquillitatis",
      "semelhanca": 62.3,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "shackleton",
      "nome": "Polo Sul (Cratera Shackleton)",
      "semelhanca": 61.8,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.824
     },
     {
      "id": "malapert",
      "nome": "Monte Malapert",
      "semelhanca": 60.8,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.824
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
    "amplitude_diurna_C": 1.276,
    "elevacao_m": 467.1,
    "rugosidade_m": 285.0,
    "declividade_graus": 6.924,
    "declividade_3km_graus": 3.565,
    "fonte_relevo": "SRTMGL30",
    "frac_neve": 0.9,
    "frac_T_abaixo_0C": 0.877,
    "vento_ms": 6.77,
    "poeira_ugm3": 1.703
   },
   "notas": {
    "temperatura": 0.6774,
    "diurna": 0.0036,
    "relevo": 0.095,
    "declividade": 0.2377,
    "gelo": 0.8885,
    "vento": 0.5642
   },
   "ranking": {
    "marte": [
     {
      "id": "jezero",
      "nome": "Cratera Jezero",
      "semelhanca": 55.7,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.8
     },
     {
      "id": "gale",
      "nome": "Cratera Gale",
      "semelhanca": 55.6,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.8
     },
     {
      "id": "meridiani",
      "nome": "Meridiani Planum",
      "semelhanca": 44.8,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "hellas",
      "nome": "Bacia de Hellas",
      "semelhanca": 44.3,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "utopia",
      "nome": "Utopia Planitia",
      "semelhanca": 43.2,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     },
     {
      "id": "valles",
      "nome": "Valles Marineris",
      "semelhanca": 24.6,
      "aspectos_usados": [
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.467
     }
    ],
    "lua": [
     {
      "id": "shackleton",
      "nome": "Polo Sul (Cratera Shackleton)",
      "semelhanca": 40.1,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.824
     },
     {
      "id": "tycho",
      "nome": "Cratera Tycho",
      "semelhanca": 39.7,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "tranquillitatis",
      "nome": "Mare Tranquillitatis",
      "semelhanca": 35.5,
      "aspectos_usados": [
       "temperatura",
       "diurna",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 1.0
     },
     {
      "id": "malapert",
      "nome": "Monte Malapert",
      "semelhanca": 34.0,
      "aspectos_usados": [
       "temperatura",
       "relevo",
       "declividade",
       "gelo"
      ],
      "peso_original_coberto": 0.824
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
    "temperatura": 0.5772222857142858,
    "diurna": 0.22139000000000003,
    "relevo": 0.13888966666666666,
    "declividade": 0.12843333333333334,
    "gelo": 0.03531,
    "vento": null
   },
   "valores": {
    "temperatura_C": -47.97219999999999,
    "amplitude_diurna_K": 77.4865,
    "relevo_m": 416.669,
    "declividade_graus": 1.9265,
    "agua_pct": 3.531,
    "vento_rover_ms": 3.26
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
    "temperatura": 0.5732345714285715,
    "diurna": 0.22086114285714287,
    "relevo": 0.34418896666666665,
    "declividade": 0.30667333333333335,
    "gelo": 0.054029999999999995,
    "vento": null
   },
   "valores": {
    "temperatura_C": -49.36789999999996,
    "amplitude_diurna_K": 77.3014,
    "relevo_m": 1032.5669,
    "declividade_graus": 4.6001,
    "agua_pct": 5.403,
    "vento_rover_ms": null
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
    "diurna": null,
    "relevo": 0.050382666666666666,
    "declividade": 0.06993999999999999,
    "gelo": 0.05682,
    "vento": null
   },
   "valores": {
    "temperatura_C": null,
    "amplitude_diurna_K": null,
    "relevo_m": 151.148,
    "declividade_graus": 1.0491,
    "agua_pct": 5.682,
    "vento_rover_ms": null
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
    "diurna": null,
    "relevo": 1.0,
    "declividade": 0.5058733333333333,
    "gelo": 0.03306,
    "vento": null
   },
   "valores": {
    "temperatura_C": null,
    "amplitude_diurna_K": null,
    "relevo_m": 3190.4977,
    "declividade_graus": 7.5881,
    "agua_pct": 3.306,
    "vento_rover_ms": null
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
    "diurna": null,
    "relevo": 0.1186012,
    "declividade": 0.13207333333333335,
    "gelo": 0.04156,
    "vento": null
   },
   "valores": {
    "temperatura_C": null,
    "amplitude_diurna_K": null,
    "relevo_m": 355.8036,
    "declividade_graus": 1.9811,
    "agua_pct": 4.156,
    "vento_rover_ms": null
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
    "diurna": null,
    "relevo": 0.0171563,
    "declividade": 0.01798,
    "gelo": 0.04229,
    "vento": null
   },
   "valores": {
    "temperatura_C": null,
    "amplitude_diurna_K": null,
    "relevo_m": 51.4689,
    "declividade_graus": 0.2697,
    "agua_pct": 4.229,
    "vento_rover_ms": null
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
    "diurna": null,
    "relevo": 0.3178366,
    "declividade": 0.8067666666666666,
    "gelo": 0.1317,
    "vento": null
   },
   "valores": {
    "temperatura_C": -176.87739999999997,
    "temperatura_max_C": 74.65000000000003,
    "amplitude_diurna_K": null,
    "relevo_m": 953.5098,
    "declividade_graus": 12.1015,
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
    "diurna": 0.8583334285714286,
    "relevo": 0.04871453333333333,
    "declividade": 0.04631333333333333,
    "gelo": 0.0,
    "vento": null
   },
   "valores": {
    "temperatura_C": -55.674499999999966,
    "temperatura_max_C": 121.18,
    "amplitude_diurna_K": 300.4167,
    "relevo_m": 146.1436,
    "declividade_graus": 0.6947,
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
    "diurna": 0.6692685714285714,
    "relevo": 0.16456206666666667,
    "declividade": 0.37715333333333334,
    "gelo": 0.0,
    "vento": null
   },
   "valores": {
    "temperatura_C": -63.93259999999998,
    "temperatura_max_C": 75.18,
    "amplitude_diurna_K": 234.244,
    "relevo_m": 493.6862,
    "declividade_graus": 5.6573,
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
    "diurna": null,
    "relevo": 0.5079971333333334,
    "declividade": 0.75956,
    "gelo": 0.0257,
    "vento": null
   },
   "valores": {
    "temperatura_C": -158.72209999999998,
    "temperatura_max_C": 68.93,
    "amplitude_diurna_K": null,
    "relevo_m": 1523.9914,
    "declividade_graus": 11.3934,
    "armadilha_fria_pct": 2.5700000000000003
   }
  }
 ]
};
