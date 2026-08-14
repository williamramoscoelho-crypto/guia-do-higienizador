import { getFicha, marcasFichas } from "./fichas-fabricantes";

export type PapelIndicacao = "principal" | "alternativa" | "sintetico" | "tecido-delicado" | "couro";

export type IndicacaoProdutoMancha = {
  fichaSlug: string;
  papel: PapelIndicacao;
  citacaoFabricante: string;
  quandoUsar: string;
  evitarEm: string;
  fonte: string;
};

/** Cruzamento mancha → SKU da lista, só com citação de página/ficha oficial. Não é ranking nem garantia. */
export const indicacoesPorMancha: Record<string, IndicacaoProdutoMancha[]> = {
  cafe: [
    {
      fichaSlug: "protelim-bac-peroxy-limpador-de-uso-geral-de-alta-performance",
      papel: "principal",
      citacaoFabricante:
        "Protelim: BAC PEROXY combina peróxido de hidrogênio e tensoativos; a ficha cita remoção de manchas pesadas e orgânicas. É o alvejante profissional de peróxido da linha — não é hipoclorito (água sanitária).",
      quandoUsar: "Estofado sintético ou natural que passou no teste. Café é sujidade orgânica com tanino. Diluição só a do rótulo.",
      evitarEm: "Não usar alvejante de cloro. Protelim: não aplicar em madeira, alumínio, bronze ou cobre; não diluir em recipiente metálico. Couro: use limpador de couro, não extratora.",
      fonte: "https://protelim.com.br/produto/bac-peroxy-limpador-de-uso-geral-de-alta-performance/",
    },
    {
      fichaSlug: "vonixx-bactran",
      papel: "alternativa",
      citacaoFabricante:
        "Vonixx: Bactran, com peróxido de hidrogênio, remove em especial manchas de sangue, suco, café e bolores; alveja e desinfeta. pH ácido. Uso com extratora. Spot test obrigatório.",
      quandoUsar: "Quando o fabricante do tecido permitir produto ácido/peróxido. Vonixx indica tecidos naturais e sintéticos; não usar em vidro.",
      evitarEm: "Corante instável no teste. Não misturar com outros químicos.",
      fonte: "https://www.vonixx.com.br/produto/bactran/",
    },
    {
      fichaSlug: "protelim-leather-cleaner-limpa-couro",
      papel: "couro",
      citacaoFabricante: "Protelim: Leather Cleaner é para limpeza profunda de couro natural ou sintético, pH neutro, pronto para uso com flanela.",
      quandoUsar: "Mancha de café em couro ou courino — pano, sem extratora.",
      evitarEm: "Não extrair couro com BAC PEROXY nem Extractus.",
      fonte: "https://protelim.com.br/produto/leather-cleaner-limpa-couro/",
    },
  ],
  refrigerante: [
    {
      fichaSlug: "vintex-limpa-estofados-5l",
      papel: "principal",
      citacaoFabricante: "Vintex: Limpa Estofados lava a seco estofados automotivos e residenciais; limpa, tira manchas e deixa aroma. Diluição da página: 300 ml em 5 L, só a espuma.",
      quandoUsar: "Sintéticos e estofados em geral, depois de absorver o açúcar. Enxágue/aspiração conforme o modo de usar.",
      evitarEm: "Deixar residual açucarado. Couro: limpador de couro.",
      fonte: "https://vintex.com.br/produto/limpa-estofados-5l/",
    },
    {
      fichaSlug: "vonixx-extractus-sensitive",
      papel: "tecido-delicado",
      citacaoFabricante:
        "Vonixx: Extractus Sensitive é pH neutro, indicado para tecidos delicados e fibras naturais como seda, linho, lã e camurça.",
      quandoUsar: "Linho, seda, lã, camurça e viscose — método conservador, spot test.",
      evitarEm: "Extractus (sem Sensitive): Vonixx não recomenda em linho e camurça.",
      fonte: "https://www.vonixx.com.br/produto/extractus-sensitive/",
    },
    {
      fichaSlug: "protelim-leather-cleaner-limpa-couro",
      papel: "couro",
      citacaoFabricante: "Protelim Leather Cleaner: couro natural ou sintético, pH neutro, flanela.",
      quandoUsar: "Açúcar/corante de refrigerante em couro — pano úmido e produto de couro.",
      evitarEm: "Extratora no couro.",
      fonte: "https://protelim.com.br/produto/leather-cleaner-limpa-couro/",
    },
  ],
  suco: [
    {
      fichaSlug: "vonixx-bactran",
      papel: "principal",
      citacaoFabricante: "Vonixx Bactran cita expressamente manchas de suco (além de café, sangue e bolores), com peróxido de hidrogênio.",
      quandoUsar: "Tecidos que aceitam peróxido após teste. Suco de fruta é corante + acidez.",
      evitarEm: "Alcalino forte pode fixar cor de fruta vermelha. Extractus (alcalino) não é a primeira escolha aqui. Não usar em vidro (Vonixx).",
      fonte: "https://www.vonixx.com.br/produto/bactran/",
    },
    {
      fichaSlug: "spartan-peroxy-flot",
      papel: "tecido-delicado",
      citacaoFabricante:
        "Spartan: Peroxy Flot é flotador à base de peróxido para limpeza e alvejamento de suede, linho, algodão e chenille. Diluição até 1:200; pH 3,2 (página).",
      quandoUsar: "Suede, linho, algodão, chenille — com teste de cor.",
      evitarEm: "Couro e corantes que sangram no teste.",
      fonte: "https://www.spartanbrasil.com.br/produtos/detalhes/787/peroxy-flot.html",
    },
  ],
  vinho: [
    {
      fichaSlug: "alcance-nura-pronto-uso",
      papel: "principal",
      citacaoFabricante: "Alcance Nura Pronto Uso: a página cita remoção de manchas de sangue, vinho e batom (multiuso veicular/residencial).",
      quandoUsar: "Após teste. Não é um tira-manchas exclusivo de estofado — confirme no rótulo se a superfície está listada.",
      evitarEm: "A mesma página cita tinta/cola em plásticos, borrachas, pintura e vidros — isso não homologa tinta em tecido. Sempre spot test.",
      fonte: "https://alcanceprofissional.com.br/produtos/nura-pronto-uso",
    },
    {
      fichaSlug: "easytech-oxy4d",
      papel: "alternativa",
      citacaoFabricante:
        "Easytech: OXY-4D é tira-manchas concentrado a base de peróxido, indicado para estofados, tapetes, carpetes, couro sintético e natural, vinil e plásticos.",
      quandoUsar: "Taninos de vinho em tecido/estofado compatível com peróxido. Diluição só a do rótulo.",
      evitarEm: "Tecido colorido sem teste — peróxido pode clarear a fibra. Não misturar produtos.",
      fonte: "https://www.easytechshield.com.br/loja/oxy4d/",
    },
    {
      fichaSlug: "spartan-peroxy-flot",
      papel: "tecido-delicado",
      citacaoFabricante: "Spartan Peroxy Flot: alvejamento em suede, linho, algodão e chenille.",
      quandoUsar: "Fibras naturais listadas pelo fabricante, com teste.",
      evitarEm: "Couro anilina e tecidos que desbotam no teste.",
      fonte: "https://www.spartanbrasil.com.br/produtos/detalhes/787/peroxy-flot.html",
    },
  ],
  leite: [
    {
      fichaSlug: "protelim-bac-peroxy-limpador-de-uso-geral-de-alta-performance",
      papel: "principal",
      citacaoFabricante: "Protelim BAC PEROXY: peróxido + tensoativos; a ficha cita manchas pesadas e orgânicas. Leite é proteína/gordura orgânica.",
      quandoUsar: "Tecido de estofado compatível, água fria, extração e secagem rápida. Diluição do rótulo.",
      evitarEm: "Água quente (coagula proteína). Madeira, alumínio, bronze, cobre (Protelim). Couro: Leather Cleaner.",
      fonte: "https://protelim.com.br/produto/bac-peroxy-limpador-de-uso-geral-de-alta-performance/",
    },
    {
      fichaSlug: "protelim-leather-cleaner-limpa-couro",
      papel: "couro",
      citacaoFabricante: "Protelim Leather Cleaner: couro natural ou sintético, pH neutro.",
      quandoUsar: "Leite em couro — pano, sem calor e sem extratora.",
      evitarEm: "Encharcar o couro.",
      fonte: "https://protelim.com.br/produto/leather-cleaner-limpa-couro/",
    },
  ],
  chocolate: [
    {
      fichaSlug: "easytech-float",
      papel: "principal",
      citacaoFabricante:
        "Easytech Float: pH levemente alcalino para manchas de óleos e gorduras; a página cita uso em peças delicadas como alcântara, suede, linho e couro natural.",
      quandoUsar: "Fração gordurosa do chocolate, inclusive nas fibras listadas pelo fabricante — após teste.",
      evitarEm: "Não substitui extração. Confirme diluição no rótulo. A frase do fabricante não é garantia de zero dano.",
      fonte: "https://www.easytechshield.com.br/loja/float/",
    },
    {
      fichaSlug: "protelim-multi-ecco-apc-limpador-apc-multiuso",
      papel: "alternativa",
      citacaoFabricante:
        "Protelim MULTI ECCO APC: limpador APC para estofados, carpetes, couro, vinil e outras superfícies. Tempo excessivo de exposição pode alterar a peça (rótulo).",
      quandoUsar: "Sintéticos resistentes com mancha oleosa pontual. Diluição da ficha (pesada até 1:10).",
      evitarEm: "Linho e seda sem teste. Não deixar o produto secar na peça.",
      fonte: "https://protelim.com.br/produto/multi-ecco-apc-limpador-apc-multiuso/",
    },
  ],
  "molho-de-tomate": [
    {
      fichaSlug: "easytech-oxy4d",
      papel: "principal",
      citacaoFabricante:
        "Easytech OXY-4D: tira-manchas com peróxido para estofados; a ficha cita remoção de manchas orgânicas e, no rótulo, sangue/bolor em 1:10 e demais intensidades.",
      quandoUsar: "Corante de tomate em tecido que passou no teste de peróxido.",
      evitarEm: "Calor. Oxidante em tecido colorido sem teste. Nenhum SKU da lista cita “tomate” pelo nome — a indicação é pela classe (orgânico/corante).",
      fonte: "https://www.easytechshield.com.br/loja/oxy4d/",
    },
    {
      fichaSlug: "spartan-peroxy-flot",
      papel: "tecido-delicado",
      citacaoFabricante: "Spartan Peroxy Flot: peróxido para alvejamento em suede, linho, algodão e chenille.",
      quandoUsar: "Fibras naturais listadas, com teste de cor.",
      evitarEm: "Couro e corantes instáveis.",
      fonte: "https://www.spartanbrasil.com.br/produtos/detalhes/787/peroxy-flot.html",
    },
  ],
  gordura: [
    {
      fichaSlug: "easytech-float",
      papel: "principal",
      citacaoFabricante:
        "Easytech Float: indicado para manchas de óleos e gorduras; cita alcântara, suede, linho e couro natural.",
      quandoUsar: "Óleo de cozinha e gordura em estofado, inclusive fibras mais delicadas listadas — com teste.",
      evitarEm: "Extractus (Vonixx) não deve ser usado em linho e camurça.",
      fonte: "https://www.easytechshield.com.br/loja/float/",
    },
    {
      fichaSlug: "vonixx-extractus",
      papel: "sintetico",
      citacaoFabricante:
        "Vonixx Extractus: tensoativos para graxa, suor e gorduras em geral; uso recomendado em tecidos sintéticos, com extratora.",
      quandoUsar: "Poliéster, microfibra e sintéticos com extração.",
      evitarEm: "Linho, camurça, fibras naturais e plástico (Vonixx).",
      fonte: "https://www.vonixx.com.br/produto/extractus/",
    },
  ],
  suor: [
    {
      fichaSlug: "vonixx-extractus",
      papel: "sintetico",
      citacaoFabricante: "Vonixx Extractus cita sujeiras derivadas de graxa, suor e gorduras em geral, em tecidos sintéticos.",
      quandoUsar: "Encostos e braços em sintético, tratando o painel inteiro — não só o ponto.",
      evitarEm: "Linho e camurça — use Extractus Sensitive ou Float.",
      fonte: "https://www.vonixx.com.br/produto/extractus/",
    },
    {
      fichaSlug: "easytech-float",
      papel: "tecido-delicado",
      citacaoFabricante: "Float: óleos/gorduras e peças delicadas (alcântara, suede, linho, couro natural) segundo a Easytech.",
      quandoUsar: "Suede, linho, alcântara com oleosidade de suor.",
      evitarEm: "Confirme no rótulo; teste sempre.",
      fonte: "https://www.easytechshield.com.br/loja/float/",
    },
    {
      fichaSlug: "vonixx-higicouro",
      papel: "couro",
      citacaoFabricante: "Vonixx Higicouro: limpa bancos e superfícies de couro sem agredir o material.",
      quandoUsar: "Oleosidade em couro automotivo ou residencial, com aplicador/pano.",
      evitarEm: "Não usar em plásticos (Vonixx). Sem extratora no couro.",
      fonte: "https://www.vonixx.com.br/produto/higicouro/",
    },
  ],
  maquiagem: [
    {
      fichaSlug: "alcance-nura-pronto-uso",
      papel: "principal",
      citacaoFabricante: "Alcance Nura Pronto Uso cita remoção de manchas de batom (junto de sangue e vinho).",
      quandoUsar: "Batom/base oleosa após teste. Tamponar, sem esfregar o pigmento.",
      evitarEm: "Acetona e solvente de unha. A citação de tinta da Nura é para plástico/pintura/vidro, não para tecido.",
      fonte: "https://alcanceprofissional.com.br/produtos/nura-pronto-uso",
    },
    {
      fichaSlug: "easytech-float",
      papel: "tecido-delicado",
      citacaoFabricante: "Float para fração oleosa em alcântara, suede, linho e couro natural, segundo a Easytech.",
      quandoUsar: "Fibras delicadas com mancha oleosa de maquiagem.",
      evitarEm: "Esfregar pigmento. O fabricante não cita “maquiagem” pelo nome — a indicação é pela gordura.",
      fonte: "https://www.easytechshield.com.br/loja/float/",
    },
    {
      fichaSlug: "vonixx-higicouro",
      papel: "couro",
      citacaoFabricante: "Vonixx Higicouro: limpeza de couro sem agredir o material.",
      quandoUsar: "Maquiagem em couro — pano, sem solvente de unha.",
      evitarEm: "Plásticos (Vonixx). Extratora.",
      fonte: "https://www.vonixx.com.br/produto/higicouro/",
    },
  ],
  "protetor-solar": [
    {
      fichaSlug: "easytech-float",
      papel: "principal",
      citacaoFabricante: "Easytech Float: manchas de óleos e gorduras; cita tecidos delicados (alcântara, suede, linho, couro natural).",
      quandoUsar: "Filtro solar é oleoso; tratar cedo, antes do amarelamento fixar.",
      evitarEm: "Calor. Nenhum SKU cita avobenzona — se o amarelo já oxidou, pode ser permanente.",
      fonte: "https://www.easytechshield.com.br/loja/float/",
    },
    {
      fichaSlug: "vonixx-extractus",
      papel: "sintetico",
      citacaoFabricante: "Vonixx Extractus: gorduras em geral em tecidos sintéticos, com extratora.",
      quandoUsar: "Poliéster/microfibra com residual oleoso de protetor, após teste.",
      evitarEm: "Linho e camurça (Vonixx).",
      fonte: "https://www.vonixx.com.br/produto/extractus/",
    },
  ],
  urina: [
    {
      fichaSlug: "easytech-zbac",
      papel: "principal",
      citacaoFabricante:
        "Easytech ZBAC: alvejante bactericida para manchas orgânicas em estofados, tapetes, carpetes, couro sintético/natural, vinil e plásticos. A ficha recomenda peças com manchas de urinas, fezes e vômitos, e bloqueio de odor.",
      quandoUsar: "Após extrair a urina. Diluição só a do rótulo. Teste de cor obrigatório.",
      evitarEm: "Não usar só perfume. Não misturar com outros produtos.",
      fonte: "https://www.easytechshield.com.br/loja/zbac/",
    },
    {
      fichaSlug: "protelim-bac-peroxy-limpador-de-uso-geral-de-alta-performance",
      papel: "alternativa",
      citacaoFabricante: "Protelim BAC PEROXY: peróxido; ficha cita manchas pesadas e orgânicas.",
      quandoUsar: "Complemento em tecido que aceita peróxido, após extração da urina.",
      evitarEm: "Metais e superfícies listadas no rótulo Protelim.",
      fonte: "https://protelim.com.br/produto/bac-peroxy-limpador-de-uso-geral-de-alta-performance/",
    },
  ],
  vomito: [
    {
      fichaSlug: "easytech-zbac",
      papel: "principal",
      citacaoFabricante: "Easytech ZBAC cita vômitos junto de urina e fezes, com ação em manchas orgânicas e odor.",
      quandoUsar: "Após remover sólidos, com EPI. Extração e secagem rápida.",
      evitarEm: "Deixar secar antes de tratar. Misturar desinfetantes.",
      fonte: "https://www.easytechshield.com.br/loja/zbac/",
    },
    {
      fichaSlug: "protelim-bac-peroxy-limpador-de-uso-geral-de-alta-performance",
      papel: "alternativa",
      citacaoFabricante: "Protelim BAC PEROXY: manchas pesadas e orgânicas, com peróxido de hidrogênio.",
      quandoUsar: "Tecido compatível com peróxido, após diluir e extrair o ácido.",
      evitarEm: "Couro: limpador específico, sem extratora.",
      fonte: "https://protelim.com.br/produto/bac-peroxy-limpador-de-uso-geral-de-alta-performance/",
    },
  ],
  odor: [
    {
      fichaSlug: "easytech-zbac",
      papel: "principal",
      citacaoFabricante: "ZBAC: alveja e bloqueia odor; ação sobre manchas e sujeiras orgânicas.",
      quandoUsar: "Odor de origem orgânica depois de limpar a fonte (não só mascarar).",
      evitarEm: "Aromatizante sozinho. Estofado úmido.",
      fonte: "https://www.easytechshield.com.br/loja/zbac/",
    },
    {
      fichaSlug: "vonixx-bactran",
      papel: "alternativa",
      citacaoFabricante: "Bactran: alveja, desinfeta e remove manchas orgânicas com peróxido.",
      quandoUsar: "Quando houver mancha orgânica associada ao odor. Extratora. Spot test.",
      evitarEm: "Vidro (Vonixx). Misturas químicas.",
      fonte: "https://www.vonixx.com.br/produto/bactran/",
    },
  ],
  caneta: [
    {
      fichaSlug: "easytech-multiinteriores",
      papel: "principal",
      citacaoFabricante:
        "Easytech Multi Interiores: APC para tecidos, couro e vinil; a página cita remoção de gorduras, óleos e pigmentos, tal como tinta de canetas. pH 11 (rótulo).",
      quandoUsar: "Tecido sintético/vinil após teste. Diluição da tabela (incrustada até 1:5). EPI.",
      evitarEm: "Fibras naturais e corantes instáveis — pH 11. Acetona em sintéticos. Não esfregar.",
      fonte: "https://www.easytechshield.com.br/loja/multiinteriores/",
    },
    {
      fichaSlug: "easytech-oxyfast",
      papel: "alternativa",
      citacaoFabricante:
        "Easytech OXY FAST: tira manchas difíceis em tecidos e estofados com oxigênio ativo. Não cita caneta pelo nome.",
      quandoUsar: "Somente se Multi Interiores não for opção e o teste passar. Resultado de tinta é incerto.",
      evitarEm: "Afirmar que o fabricante homologou caneta neste SKU. Solvente direto no tecido.",
      fonte: "https://www.easytechshield.com.br/loja/oxyfast/",
    },
  ],
  sangue: [
    {
      fichaSlug: "vonixx-bactran",
      papel: "principal",
      citacaoFabricante: "Vonixx Bactran cita manchas de sangue (com suco, café e bolores) e peróxido de hidrogênio.",
      quandoUsar: "Sangue fresco ou recente, água fria, EPI. Tecido compatível com produto ácido/peróxido. Extratora.",
      evitarEm: "Água quente. Alcalino forte de início. Vidro (Vonixx).",
      fonte: "https://www.vonixx.com.br/produto/bactran/",
    },
    {
      fichaSlug: "easytech-oxy4d",
      papel: "alternativa",
      citacaoFabricante:
        "Easytech OXY-4D: no rótulo, manchas de alta intensidade (sangue e bolor) na diluição 1:10 — confirme no lote. Também cita couro sintético e natural.",
      quandoUsar: "Estofados, tapetes e, se o rótulo permitir, couro — sempre com teste.",
      evitarEm: "Inventar outra diluição. Sempre o rótulo do fabricante.",
      fonte: "https://www.easytechshield.com.br/loja/oxy4d/",
    },
  ],
  barro: [
    {
      fichaSlug: "easytech-tapetex",
      papel: "principal",
      citacaoFabricante: "Easytech TAPETEX: detergente concentrado para tapetes e carpetes, com remoção de manchas e ação desengordurante.",
      quandoUsar: "Barro já seco e aspirado, em tapete/carpete/estofado sintético.",
      evitarEm: "Limpar barro ainda úmido (espalha). Couro: pano e Higicouro.",
      fonte: "https://www.easytechshield.com.br/loja/tapetex/",
    },
    {
      fichaSlug: "protelim-prot-carp-20-limpa-tapetes-e-carpetes",
      papel: "alternativa",
      citacaoFabricante: "Protelim CARP 20: limpa tapetes e carpetes; modo de usar descreve espuma na aplicação manual.",
      quandoUsar: "Tapetes e carpetes com sujidade sólida, após aspirar. Diluição da ficha (manual 1:20 / extratora 1:60).",
      evitarEm: "Encharcar. Confirme diluição no rótulo.",
      fonte: "https://protelim.com.br/produto/prot-carp-20-limpa-tapetes-e-carpetes/",
    },
  ],
  graxa: [
    {
      fichaSlug: "vonixx-extractus",
      papel: "sintetico",
      citacaoFabricante: "Vonixx Extractus: especialmente graxa, suor e gorduras; tecidos sintéticos, uso em extratora.",
      quandoUsar: "Graxa em poliéster/sintético com extração e enxágue.",
      evitarEm: "Linho, camurça e fibras naturais (Vonixx). Não esfregar.",
      fonte: "https://www.vonixx.com.br/produto/extractus/",
    },
    {
      fichaSlug: "easytech-float",
      papel: "tecido-delicado",
      citacaoFabricante: "Easytech Float: óleos e gorduras; cita alcântara, suede, linho e couro natural.",
      quandoUsar: "Fibras delicadas com residual oleoso — teste obrigatório.",
      evitarEm: "Aquo Alcalino da Alcance é de lavagem de pintura, não de estofado.",
      fonte: "https://www.easytechshield.com.br/loja/float/",
    },
    {
      fichaSlug: "vintex-desengraxante-biodegradavel",
      papel: "alternativa",
      citacaoFabricante: "Vintex: desengraxante biodegradável para sujeira pesada, inclusive as mais difíceis. A página não restringe a estofado — teste e enxágue obrigatórios.",
      quandoUsar: "Sintéticos muito resistentes, com teste.",
      evitarEm: "Algodão, linho e couro sem teste. Não deixar secar na fibra.",
      fonte: "https://vintex.com.br/produto/desengraxante-biodegradavel/",
    },
  ],
  "marcas-de-patas": [
    {
      fichaSlug: "vintex-limpa-estofados-5l",
      papel: "principal",
      citacaoFabricante: "Vintex Limpa Estofados: remove manchas difíceis em estofados automotivos e residenciais, lava a seco.",
      quandoUsar: "Marcas repetidas de terra/oleosidade em sintético, após remover pelos.",
      evitarEm: "Umidade com pelo (nós). Trate o painel, não só a pata.",
      fonte: "https://vintex.com.br/produto/limpa-estofados-5l/",
    },
    {
      fichaSlug: "easytech-tapetex",
      papel: "alternativa",
      citacaoFabricante: "Easytech TAPETEX: tapetes e carpetes, remoção de manchas e desengraxe.",
      quandoUsar: "Tapete/carpete com terra de pata, depois de secar e aspirar.",
      evitarEm: "Barro úmido. Couro: Higicouro.",
      fonte: "https://www.easytechshield.com.br/loja/tapetex/",
    },
  ],
  fezes: [
    {
      fichaSlug: "easytech-zbac",
      papel: "principal",
      citacaoFabricante: "Easytech ZBAC cita fezes (com urina e vômitos) em tapetes e carpetes, com ação orgânica, alvejante e bloqueio de odor.",
      quandoUsar: "Após remover sólidos com EPI. Estofado/tapete compatível. Diluição do rótulo.",
      evitarEm: "Trabalhar sem EPI. Misturar desinfetantes. Prometer 100%.",
      fonte: "https://www.easytechshield.com.br/loja/zbac/",
    },
    {
      fichaSlug: "protelim-bac-peroxy-limpador-de-uso-geral-de-alta-performance",
      papel: "alternativa",
      citacaoFabricante: "Protelim BAC PEROXY: manchas pesadas e orgânicas, peróxido de hidrogênio.",
      quandoUsar: "Tecido que passou no teste de peróxido, após remoção mecânica.",
      evitarEm: "Metais listados no rótulo Protelim.",
      fonte: "https://protelim.com.br/produto/bac-peroxy-limpador-de-uso-geral-de-alta-performance/",
    },
  ],
};

const PAPEL_LABEL: Record<PapelIndicacao, string> = {
  principal: "Indicado (ficha oficial)",
  alternativa: "Outro SKU da lista com citação",
  sintetico: "Se o tecido for sintético",
  "tecido-delicado": "Se o tecido for delicado / natural",
  couro: "Se for couro ou courino",
};

export function rotuloPapel(papel: PapelIndicacao) {
  return PAPEL_LABEL[papel];
}

export function nomeMarcaFicha(marcaSlug: string) {
  return marcasFichas.find((m) => m.slug === marcaSlug)?.nome ?? marcaSlug;
}

export function indicacoesDaMancha(slug: string) {
  return (indicacoesPorMancha[slug] ?? [])
    .map((ind) => {
      const ficha = getFicha(ind.fichaSlug);
      return ficha ? { ...ind, ficha } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
}

export function resumoProdutoLista(slug: string) {
  const lista = indicacoesDaMancha(slug);
  const principal = lista.find((i) => i.papel === "principal") ?? lista[0];
  if (!principal) return null;
  return `${nomeMarcaFicha(principal.ficha.marca)} ${principal.ficha.nome}`;
}
