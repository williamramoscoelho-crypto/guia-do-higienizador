export const fluxoHigienizacao = [
  { n: 1, titulo: "Inspeção", texto: "Avalie a peça inteira com boa iluminação, registre fotos e converse com o cliente sobre expectativas.", aviso: "Nunca comece sem documentar o estado inicial." },
  { n: 2, titulo: "Identificação do tecido", texto: "Procure a etiqueta. Sem etiqueta, use o assistente de identificação e trate como provável, não como certeza.", aviso: "Sem confirmação, adote sempre o método mais conservador." },
  { n: 3, titulo: "Aspiração", texto: "Remova pó, pelos e partículas com passadas lentas, incluindo frestas e costuras.", aviso: "Sujeira seca + água = lama dentro da fibra." },
  { n: 4, titulo: "Teste de produto", texto: "Aplique o produto diluído em área discreta e observe cor, textura e brilho após alguns minutos.", aviso: "Teste também apenas água em tecidos com viscose." },
  { n: 5, titulo: "Aplicação", texto: "Pulverize de forma uniforme, em camadas leves, cobrindo o painel inteiro.", aviso: "Aplicar só na mancha cria halos visíveis." },
  { n: 6, titulo: "Agitação", texto: "Use a escova compatível com movimentos suaves para soltar a sujidade.", aviso: "Força não substitui química nem tempo de ação." },
  { n: 7, titulo: "Tempo de ação", texto: "Respeite o tempo indicado pelo fabricante e não deixe o produto secar sobre o tecido.", aviso: "Produto seco na fibra pode fixar a mancha." },
  { n: 8, titulo: "Extração", texto: "Recolha a solução com passadas cruzadas e finalize com passadas apenas de sucção.", aviso: "Extrair pouco é a principal causa de odor e re-sujeira." },
  { n: 9, titulo: "Enxágue", texto: "Quando usar alcalino ou desengraxante, enxágue e, se necessário, neutralize.", aviso: "Resíduo alcalino amarela tecidos claros." },
  { n: 10, titulo: "Inspeção final", texto: "Reavalie a peça com o cliente presente e aponte o que melhorou e o que permaneceu.", aviso: "Nunca prometa 100% de remoção." },
  { n: 11, titulo: "Secagem", texto: "Use ventilação forçada e ambiente arejado até a umidade residual desaparecer.", aviso: "Secagem lenta gera mofo e odor." },
  { n: 12, titulo: "Orientação ao cliente", texto: "Explique o tempo de secagem, cuidados e o que esperar nas próximas horas.", aviso: "Orientação clara evita reclamação e retrabalho." },
];

export const errosGraves = [
  { titulo: "Aplicar produto sem testar", risco: "Alto", texto: "É a causa número um de dano irreversível. O teste leva 5 minutos; o prejuízo pode custar um sofá inteiro." },
  { titulo: "Utilizar produto incompatível", risco: "Alto", texto: "Alcalino em couro, solvente em courino, oxidante em tecido colorido: danos frequentemente permanentes." },
  { titulo: "Excesso de água", risco: "Alto", texto: "Molha espuma e estrutura, gera odor, mofo e manchas que sobem na secagem (wicking)." },
  { titulo: "Excesso de produto", risco: "Médio", texto: "Deixa residual pegajoso que atrai sujeira e faz o estofado sujar mais rápido do que antes." },
  { titulo: "Esfregar agressivamente", risco: "Alto", texto: "Desfia, deforma pelos e cria áreas brilhantes ou desbotadas que não voltam ao normal." },
  { titulo: "Usar temperatura inadequada", risco: "Alto", texto: "Calor pode fixar manchas de proteína, deformar sintéticos e ressecar couro." },
  { titulo: "Misturar produtos químicos", risco: "Crítico", texto: "Nunca misture produtos. A reação pode gerar gases tóxicos e inutilizar as duas soluções." },
  { titulo: "Ignorar a etiqueta", risco: "Alto", texto: "A etiqueta é a informação mais confiável disponível na peça. Procure sob o assento ou no zíper." },
  { titulo: "Não realizar inspeção", risco: "Médio", texto: "Sem fotos e registro, qualquer dano preexistente vira responsabilidade sua." },
  { titulo: "Não comunicar limitações", risco: "Médio", texto: "Cliente com expectativa errada reclama mesmo de um bom serviço. Alinhe antes de começar." },
];

export const checklistItens = [
  "Identificar o tecido",
  "Verificar etiqueta de composição",
  "Fotografar o estofado inteiro",
  "Fotografar as manchas",
  "Verificar rasgos",
  "Verificar costuras",
  "Verificar desbotamento",
  "Verificar manchas antigas",
  "Verificar odor",
  "Verificar presença de pelos",
  "Verificar danos já existentes",
  "Realizar teste de produto",
  "Definir método de limpeza",
  "Explicar limitações ao cliente",
];

export const perguntasIdentificacao: {
  id: string;
  pergunta: string;
  opcoes: { label: string; tecidos: string[] }[];
}[] = [
  {
    id: "pelos",
    pergunta: "O tecido possui pelos?",
    opcoes: [
      { label: "Sim, pelo denso e em pé", tecidos: ["veludo"] },
      { label: "Sim, pelo bem curto", tecidos: ["suede", "microfibra"] },
      { label: "Fios felpudos com relevo", tecidos: ["chenille"] },
      { label: "Não tem pelo", tecidos: ["linho", "algodao", "poliester", "sarja", "couro", "courino", "napa"] },
    ],
  },
  {
    id: "brilho",
    pergunta: "É brilhante ou fosco?",
    opcoes: [
      { label: "Brilho que muda com a luz", tecidos: ["veludo", "jacquard"] },
      { label: "Fosco", tecidos: ["suede", "linho", "algodao", "microfibra", "sarja"] },
      { label: "Brilho plástico uniforme", tecidos: ["courino", "napa"] },
    ],
  },
  {
    id: "toque",
    pergunta: "Como é o toque?",
    opcoes: [
      { label: "Muito macio e sedoso", tecidos: ["veludo", "microfibra", "suede"] },
      { label: "Áspero ou rústico", tecidos: ["linho", "sarja"] },
      { label: "Liso e frio", tecidos: ["courino", "napa"] },
      { label: "Encorpado e natural", tecidos: ["couro", "algodao"] },
    ],
  },
  {
    id: "trama",
    pergunta: "Possui trama aparente?",
    opcoes: [
      { label: "Sim, trama bem visível", tecidos: ["linho", "algodao", "sarja"] },
      { label: "Sim, com desenho em relevo", tecidos: ["jacquard"] },
      { label: "Não, superfície fechada", tecidos: ["suede", "microfibra", "veludo", "courino", "napa", "couro"] },
    ],
  },
  {
    id: "agua",
    pergunta: "Absorve água rapidamente?",
    opcoes: [
      { label: "Absorve muito rápido", tecidos: ["linho", "algodao", "chenille"] },
      { label: "Absorve devagar", tecidos: ["poliester", "microfibra", "suede"] },
      { label: "Não absorve, a gota escorre", tecidos: ["courino", "napa", "couro"] },
    ],
  },
  {
    id: "couro",
    pergunta: "Tem aparência semelhante a couro?",
    opcoes: [
      { label: "Sim, com poros irregulares e cheiro natural", tecidos: ["couro"] },
      { label: "Sim, com textura muito regular", tecidos: ["courino", "napa"] },
      { label: "Não", tecidos: ["suede", "veludo", "linho", "algodao", "poliester", "chenille", "sarja", "jacquard", "microfibra"] },
    ],
  },
  {
    id: "elasticidade",
    pergunta: "Possui elasticidade?",
    opcoes: [
      { label: "Sim, estica bastante", tecidos: ["sinteticos", "microfibra"] },
      { label: "Pouca ou nenhuma", tecidos: ["linho", "algodao", "sarja", "jacquard", "couro"] },
    ],
  },
  {
    id: "etiqueta",
    pergunta: "Possui etiqueta de composição?",
    opcoes: [
      { label: "Sim, e consigo ler", tecidos: [] },
      { label: "Não encontrei etiqueta", tecidos: [] },
    ],
  },
];

export const experienciaCampo = [
  {
    slug: "erros-comuns-em-atendimentos",
    titulo: "Erros comuns encontrados em atendimentos",
    resumo: "O que mais aparece na rotina de quem atende sofás todos os dias.",
    conteudo: [
      "Cliente que tentou limpar sozinho com produto de limpeza doméstico e fixou a mancha.",
      "Sofá limpo por outro prestador sem extração adequada, com odor voltando dias depois.",
      "Impermeabilização aplicada sobre tecido sujo, selando a sujeira dentro da fibra.",
      "Excesso de água em espuma de alta densidade, resultando em semanas de umidade retida.",
    ],
  },
  {
    slug: "problemas-frequentes-em-sofas",
    titulo: "Problemas frequentes em sofás",
    resumo: "Padrões que se repetem em atendimentos residenciais.",
    conteudo: [
      "Braços e encostos com oleosidade concentrada — sempre trate a peça inteira.",
      "Assentos com marcas de uso mais escuras que o restante: após a limpeza, a diferença pode continuar visível.",
      "Tecidos claros com sombra de bebida antiga que não sai totalmente.",
      "Almofadas com odor por secagem malfeita em limpezas anteriores.",
    ],
  },
  {
    slug: "conversar-com-o-cliente",
    titulo: "Como conversar com o cliente antes do serviço",
    resumo: "Alinhamento de expectativa evita 90% das reclamações.",
    conteudo: [
      "Mostre as manchas antes de começar e explique quais têm chance real de sair.",
      "Fale sobre o tempo de secagem antes de fechar o horário.",
      "Explique que manchas antigas, desbotamento e danos químicos podem ser permanentes.",
      "Registre tudo em fotos e envie ao cliente ao final.",
    ],
  },
  {
    slug: "fotografar-o-estofado",
    titulo: "Como fotografar um estofado antes do serviço",
    resumo: "Documentação é a sua proteção profissional.",
    conteudo: [
      "Faça fotos gerais dos quatro lados com boa luz.",
      "Aproxime em cada mancha, rasgo, costura solta e desbotamento.",
      "Fotografe a etiqueta de composição.",
      "Repita as mesmas fotos ao final, do mesmo ângulo.",
    ],
  },
  {
    slug: "evitar-retrabalho",
    titulo: "Como evitar retrabalho",
    resumo: "Retrabalho custa tempo, combustível e reputação.",
    conteudo: [
      "Nunca finalize sem checar umidade residual.",
      "Enxágue quando usar produto alcalino: residual causa re-sujeira rápida.",
      "Não prometa remoção total de mancha antiga.",
      "Deixe orientação escrita de pós-limpeza com o cliente.",
    ],
  },
  {
    slug: "montar-processo-de-atendimento",
    titulo: "Como montar um processo de atendimento",
    resumo: "Processo padronizado é o que separa amador de profissional.",
    conteudo: [
      "Orçamento com perguntas padrão: tipo de estofado, tecido, manchas, animais e prazo.",
      "Checklist de pré-inspeção no local.",
      "Execução seguindo sempre a mesma sequência de etapas.",
      "Inspeção final acompanhada e envio das fotos.",
      "Mensagem de acompanhamento após 48 horas.",
    ],
  },
];

export const kitsHigienizacao = [
  {
    nivel: "Kit inicial",
    descricao: "O mínimo para atender com segurança e qualidade.",
    itens: ["Aspirador com bocais para estofado", "Extratora de baixa capacidade", "Pulverizadores identificados", "Escovas macia e média", "Panos de microfibra brancos", "Detergente neutro para estofados", "Removedor de manchas", "Neutralizador de odor", "EPIs (luvas, óculos, máscara)", "Ventilador ou soprador"],
  },
  {
    nivel: "Kit intermediário",
    descricao: "Ganho de qualidade e variedade de atendimento.",
    itens: ["Extratora com aquecimento", "Enzimático e desengraxante", "Escovas específicas por tecido", "Fita ou medidor de pH", "Medidor de umidade", "Gerador de espuma", "Mais sopradores", "Aspirador de líquidos", "Kit de proteção de piso e parede"],
  },
  {
    nivel: "Kit profissional",
    descricao: "Produtividade, segurança e serviços especializados.",
    itens: ["Extratora de maior potência e autonomia", "Sistema de secagem com múltiplos sopradores", "Desumidificador", "Ferramentas específicas para colchão e automotivo", "Linha completa de químicos por finalidade", "Impermeabilizante e equipamento de aplicação", "EPIs completos, incluindo respirador adequado", "Organização e transporte dos equipamentos"],
  },
];

export const kitsAutomotivos = [
  { objetivo: "Lavagem", itens: ["Shampoo automotivo", "APC", "Pulverizador", "Luva de lavagem", "Microfibras", "Escovas e pincéis", "Baldes com separador de sujeira", "Equipamento de pressão"] },
  { objetivo: "Detalhamento interno", itens: ["Limpador de tecido", "Limpador de couro", "Produto para plásticos", "Escovas macias", "Extratora", "Microfibras", "Aspirador com bocais finos"] },
  { objetivo: "Polimento", itens: ["Politriz", "Boinas de corte e refino", "Compostos polidores", "Polidor de refino", "Fita de mascaramento", "Microfibras de acabamento", "Iluminação de inspeção"] },
  { objetivo: "Proteção", itens: ["Cera", "Selante", "Coating", "Aplicadores", "Microfibras específicas", "Ambiente coberto e controlado"] },
];

export const perfilCompra = [
  { id: "economico", label: "Quero opções econômicas", dica: "Priorize itens multiuso e químicos concentrados. Comece com uma extratora simples e invista primeiro em aspiração e secagem, que impactam o resultado mais do que produtos caros." },
  { id: "profissional", label: "Quero opções profissionais", dica: "Priorize potência de sucção, aquecimento e autonomia. Equipamentos de maior produtividade reduzem tempo por atendimento e aumentam a margem." },
  { id: "custo-beneficio", label: "Quero melhor custo-benefício", dica: "Compare custo por aplicação, não preço da embalagem. Produtos concentrados com boa diluição costumam sair mais baratos por serviço." },
];

export const etapasAutomotivas = [
  { slug: "avaliar-banco-automotivo", titulo: "Como avaliar um banco automotivo antes da higienização", pontos: ["Identifique o material do revestimento e procure etiqueta ou manual do veículo.", "Verifique costuras, rasgos e desgaste de uso.", "Localize componentes elétricos, sensores e airbag lateral.", "Cheque odor e sinais de umidade ou mofo sob o assento.", "Fotografe cada banco antes de iniciar."] },
  { slug: "identificar-tecido-automotivo", titulo: "Como identificar tecido automotivo", pontos: ["A maioria dos tecidos automotivos é sintética, com base de poliéster.", "Tecidos com aspecto de camurça costumam ser microfibra ou alcantara sintética.", "Alcantara e similares exigem produto específico e umidade mínima.", "Couro e sintéticos que imitam couro exigem limpeza com pano e hidratação, nunca extratora."] },
  { slug: "couro-automotivo", titulo: "Como trabalhar com couro automotivo", pontos: ["Aspire e remova a sujeira solta antes de qualquer produto.", "Use limpador específico aplicado no pano, nunca direto no banco.", "Trabalhe por seções e remova o produto imediatamente.", "Finalize com condicionador em camada fina.", "Evite calor, álcool, solventes e vapor."] },
  { slug: "manchas-em-bancos", titulo: "Como lidar com manchas em bancos", pontos: ["Identifique a origem antes de escolher o produto.", "Teste sempre em área escondida do banco.", "Trate o painel inteiro para evitar diferença de tonalidade.", "Controle a umidade: banco encharcado gera odor e mofo.", "Seque com soprador e portas abertas."] },
  { slug: "reduzir-riscos-interna", titulo: "Como reduzir riscos durante a higienização interna", pontos: ["Proteja painéis eletrônicos e centrais de comando.", "Nunca pulverize produto próximo a módulos elétricos.", "Controle rigorosamente o volume de água aplicado.", "Garanta secagem completa antes de fechar o veículo.", "Registre com fotos o estado inicial e final."] },
];

export const categoriasAutomotivas = [
  { grupo: "Lavagem", itens: ["Shampoo automotivo", "Shampoo neutro", "Shampoo alcalino", "Shampoo ácido", "Snow foam", "Pré-lavagem", "APC", "Desengraxante"] },
  { grupo: "Rodas e pneus", itens: ["Limpa rodas", "Descontaminante ferroso", "Limpa pneus", "Desengraxante", "Restaurador de pneus", "Selante para rodas"] },
  { grupo: "Pintura", itens: ["Clay bar", "Lubrificante para clay", "Composto polidor", "Polidor de corte", "Polidor de refino", "Lustrador", "Cera", "Selante", "Coating", "Removedor de contaminantes"] },
  { grupo: "Vidros", itens: ["Limpa-vidros", "Removedor de chuva ácida", "Descontaminante de vidro", "Selante de vidro"] },
  { grupo: "Interior", itens: ["APC", "Limpador de tecido", "Limpador de couro", "Hidratante de couro", "Limpador de plástico", "Restaurador de plástico", "Neutralizador de odores", "Higienizador"] },
  { grupo: "Estofados automotivos", itens: ["Limpadores de tecido", "Produtos para manchas", "Produtos enzimáticos", "Neutralizadores de odor", "Produtos para couro", "Impermeabilizantes"] },
];
