// =====================================================================
// TEXTOS dos 12 locais da Terra, em português (pt) e inglês (en): nome, país, descrição e "útil para testar".
// Este arquivo NÃO tem nenhum número de dado. Só "tipo" e as coordenadas aproximadas do local (lat, lon), que servem
// para achar a célula certa (e são conferidas contra o Wikidata por scripts/07_verificar_dados.py).
// Os números (temperatura, relevo, gelo, vento...) vêm do pipeline (scripts/01 a 05, arquivos da NASA) e chegam ao
// site por data/dados_reais.js. Para mudar um texto: edite aqui e rode scripts/05_exportar_site.py.
// =====================================================================
window.EARTH_SITES = [
  {
    "id": "atacama",
    "tipo": "deserto",
    "lat": -24.5,
    "lon": -69.25,
    "nome": {
      "pt": "Deserto do Atacama",
      "en": "Atacama Desert"
    },
    "pais": {
      "pt": "Chile",
      "en": "Chile"
    },
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
    }
  },
  {
    "id": "vales-secos",
    "tipo": "polar",
    "lat": -77.5,
    "lon": 162.0,
    "nome": {
      "pt": "Vales Secos de McMurdo",
      "en": "McMurdo Dry Valleys"
    },
    "pais": {
      "pt": "Antártida",
      "en": "Antarctica"
    },
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
    }
  },
  {
    "id": "lut",
    "tipo": "deserto",
    "lat": 30.5,
    "lon": 58.5,
    "nome": {
      "pt": "Deserto do Lut",
      "en": "Lut Desert"
    },
    "pais": {
      "pt": "Irã",
      "en": "Iran"
    },
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
    }
  },
  {
    "id": "danakil",
    "tipo": "vulcânico",
    "lat": 14.24,
    "lon": 40.3,
    "nome": {
      "pt": "Depressão de Danakil (Dallol)",
      "en": "Danakil Depression (Dallol)"
    },
    "pais": {
      "pt": "Etiópia",
      "en": "Ethiopia"
    },
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
    }
  },
  {
    "id": "mauna-kea",
    "tipo": "vulcânico",
    "lat": 19.82,
    "lon": -155.47,
    "nome": {
      "pt": "Mauna Kea",
      "en": "Mauna Kea"
    },
    "pais": {
      "pt": "Havaí, EUA",
      "en": "Hawaii, USA"
    },
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
    }
  },
  {
    "id": "holuhraun",
    "tipo": "vulcânico",
    "lat": 64.85,
    "lon": -16.83,
    "nome": {
      "pt": "Campo de lava de Holuhraun",
      "en": "Holuhraun lava field"
    },
    "pais": {
      "pt": "Islândia",
      "en": "Iceland"
    },
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
    }
  },
  {
    "id": "haughton",
    "tipo": "polar",
    "lat": 75.38,
    "lon": -89.68,
    "nome": {
      "pt": "Cratera de Haughton",
      "en": "Haughton Crater"
    },
    "pais": {
      "pt": "Ilha Devon, Canadá",
      "en": "Devon Island, Canada"
    },
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
    }
  },
  {
    "id": "namibe",
    "tipo": "deserto",
    "lat": -24.75,
    "lon": 15.3,
    "nome": {
      "pt": "Deserto do Namibe",
      "en": "Namib Desert"
    },
    "pais": {
      "pt": "Namíbia",
      "en": "Namibia"
    },
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
    }
  },
  {
    "id": "lanzarote",
    "tipo": "caverna",
    "lat": 29.16,
    "lon": -13.44,
    "nome": {
      "pt": "Tubos de lava de Lanzarote",
      "en": "Lanzarote lava tubes"
    },
    "pais": {
      "pt": "Canárias, Espanha",
      "en": "Canary Islands, Spain"
    },
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
    }
  },
  {
    "id": "lava-beds",
    "tipo": "caverna",
    "lat": 41.71,
    "lon": -121.51,
    "nome": {
      "pt": "Lava Beds",
      "en": "Lava Beds"
    },
    "pais": {
      "pt": "Califórnia, EUA",
      "en": "California, USA"
    },
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
    }
  },
  {
    "id": "utah-mdrs",
    "tipo": "deserto",
    "lat": 38.41,
    "lon": -110.79,
    "nome": {
      "pt": "Deserto de San Rafael (MDRS)",
      "en": "San Rafael Desert (MDRS)"
    },
    "pais": {
      "pt": "Utah, EUA",
      "en": "Utah, USA"
    },
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
    }
  },
  {
    "id": "svalbard",
    "tipo": "polar",
    "lat": 79.4,
    "lon": 13.3,
    "nome": {
      "pt": "Svalbard (Bockfjord)",
      "en": "Svalbard (Bockfjord)"
    },
    "pais": {
      "pt": "Noruega",
      "en": "Norway"
    },
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
    }
  }
];
