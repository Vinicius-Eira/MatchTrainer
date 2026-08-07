// Cliente
export const OPCOES_MODALIDADE = [
  {
    id: "Consultoria",
    titulo: "Consultoria no App",
    desc: "Treinos na palma da mão, suporte online e flexibilidade total.",
    icon: "phone-portrait-outline",
  },
  {
    id: "Presencial",
    titulo: "Personal Presencial",
    desc: "Acompanhamento físico lado a lado durante toda a execução do treino.",
    icon: "barbell-outline",
  },
  {
    id: "indiferente",
    titulo: "Híbrido / Ambos",
    desc: "Quero ver os melhores profissionais disponíveis, tanto presenciais quanto online.",
    icon: "diamond-outline",
  },
];

export const OPCOES_OBJETIVO = [
  {
    id: "emagrecimento",
    titulo: "Emagrecimento",
    desc: "Perder gordura, secar e definir a musculatura.",
    icon: "flame-outline",
  },
  {
    id: "hipertrofia",
    titulo: "Hipertrofia",
    desc: "Ganhar massa muscular, força e volume.",
    icon: "barbell-outline",
  },
  {
    id: "saude",
    titulo: "Saúde e Qualidade",
    desc: "Melhorar postura, reabilitação e bem-estar geral.",
    icon: "heart-outline",
    hasSub: true,
  },
  {
    id: "performance",
    titulo: "Performance",
    desc: "Evoluir no meu esporte ou superar recordes.",
    icon: "trophy-outline",
    hasSub: true,
  },
];

export const OPCOES_HISTORICO = [
  {
    id: "iniciante",
    titulo: "Iniciante Total",
    desc: "Nunca treinei ou parei faz muitos anos.",
    icon: "leaf-outline",
  },
  {
    id: "inconstante",
    titulo: "Inconstante",
    desc: "Vou e volto, não consigo manter uma rotina sólida.",
    icon: "pulse-outline",
  },
  {
    id: "intermediario",
    titulo: "Intermediário",
    desc: "Treino sempre, mas sinto que estagnei nos resultados.",
    icon: "fitness-outline",
  },
  {
    id: "avancado",
    titulo: "Avançado",
    desc: "Treino pesado, busco alta performance e lapidação.",
    icon: "rocket-outline",
  },
];

export const OPCOES_LIMITACAO = [
  {
    id: "gestante",
    titulo: "Gestante / Pós-parto",
    desc: "Preciso de um treino adaptado e 100% seguro.",
    icon: "woman-outline",
  },
  {
    id: "lesao",
    titulo: "Lesões ou Dores",
    desc: "Desconforto articular, muscular ou ósseo.",
    icon: "bandage-outline",
    hasSub: true,
  },
  {
    id: "clinica",
    titulo: "Condição Clínica",
    desc: "Hipertensão, diabetes, asma, etc.",
    icon: "medkit-outline",
    hasSub: true,
  },
  {
    id: "nenhuma",
    titulo: "Nenhuma Restrição",
    desc: "Estou 100% liberado(a) para qualquer intensidade.",
    icon: "checkmark-circle-outline",
  },
];

export const OPCOES_PERFIL = [
  {
    id: "acolhedor",
    titulo: "O Acolhedor",
    desc: "Paciente, respeita meu ritmo e foca na adaptação.",
    icon: "happy-outline",
  },
  {
    id: "motivador",
    titulo: "O Motivador",
    desc: "Intenso, me puxa ao limite e não me deixa desistir.",
    icon: "megaphone-outline",
  },
  {
    id: "tecnico",
    titulo: "O Professor",
    desc: "Foca muito na biomecânica, ensina o porquê de tudo.",
    icon: "school-outline",
  },
  {
    id: "estrategista",
    titulo: "O Estrategista",
    desc: "Foco 100% em planilhas, metas claras e progressão.",
    icon: "stats-chart-outline",
  },
];

export const OPCOES_GENERO_TREINADOR = [
  {
    id: "Indiferente",
    titulo: "Indiferente",
    desc: "Me importo apenas com a qualidade técnica do profissional.",
    icon: "people-outline",
  },
  {
    id: "Mulher",
    titulo: "Apenas Mulheres",
    desc: "Me sinto mais confortável treinando com uma treinadora.",
    icon: "woman-outline",
  },
  {
    id: "Homem",
    titulo: "Apenas Homens",
    desc: "Prefiro que meu treinador seja do gênero masculino.",
    icon: "man-outline",
  },
];

export const OPCOES_TURNO = [
  {
    id: "Manhã",
    titulo: "Manhã (06h às 12h)",
    desc: "Gosto de treinar cedo para começar bem o dia.",
    icon: "sunny-outline",
  },
  {
    id: "Tarde",
    titulo: "Tarde (12h às 18h)",
    desc: "Aproveito o horário de almoço ou meio da tarde.",
    icon: "partly-sunny-outline",
  },
  {
    id: "Noite",
    titulo: "Noite (18h às 22h)",
    desc: "Meu dia é corrido, treino após o trabalho.",
    icon: "moon-outline",
  },
  {
    id: "Indiferente",
    titulo: "Horários Variados",
    desc: "Trabalho por turnos ou tenho agenda bem flexível.",
    icon: "shuffle-outline",
  },
];

export const OPCOES_FREQUENCIA = [
  {
    id: "1-2",
    titulo: "1 a 2 dias por semana",
    desc: "Minha rotina é muito apertada, mas quero iniciar.",
    icon: "calendar-outline",
  },
  {
    id: "3-4",
    titulo: "3 a 4 dias por semana",
    desc: "Consigo manter uma constância saudável e contínua.",
    icon: "calendar-outline",
  },
  {
    id: "5-6",
    titulo: "5 a 6 dias por semana",
    desc: "Foco quase diário. O treino é prioridade no meu dia.",
    icon: "flame-outline",
  },
  {
    id: "7",
    titulo: "Todos os dias",
    desc: "Não descanso, quero treino intenso todos os dias.",
    icon: "flash-outline",
  },
];

export const OPCOES_LOCAL = [
  {
    id: "academia",
    titulo: "Academia Comercial",
    desc: "Grandes redes ou academias de bairro completas.",
    icon: "barbell-outline",
  },
  {
    id: "condominio",
    titulo: "Academia do Prédio",
    desc: "Treino no condomínio, com a estrutura disponível lá.",
    icon: "business-outline",
  },
  {
    id: "casa",
    titulo: "Em Casa / Apartamento",
    desc: "Treino com peso do corpo ou acessórios que já tenho.",
    icon: "home-outline",
  },
  {
    id: "ar_livre",
    titulo: "Ao Ar Livre / Parques",
    desc: "Gosto de praças, parques, praias ou quadras.",
    icon: "leaf-outline",
  },
];

export const OPCOES_INVESTIMENTO = [
  {
    id: "base",
    titulo: "R$ 90 a R$ 110 / mês",
    desc: "Excelente custo-benefício para iniciar os treinos.",
    icon: "wallet-outline",
  },
  {
    id: "mid",
    titulo: "R$ 120 a R$ 150 / mês",
    desc: "Profissionais especialistas e com ótima avaliação.",
    icon: "star-outline",
  },
  {
    id: "premium",
    titulo: "A partir de R$ 160 / mês",
    desc: "Treinadores de Elite e acompanhamento super VIP.",
    icon: "diamond-outline",
  },
];

export const SUB_SAUDE = [
  { titulo: "Melhorar Postura", icon: "body-outline" },
  { titulo: "Dores nas Costas", icon: "bandage-outline" },
  { titulo: "Recomendação Médica", icon: "medkit-outline" },
  { titulo: "Reduzir Stress / Sono", icon: "moon-outline" },
  { titulo: "Terceira Idade", icon: "walk-outline" },
];
export const SUB_ESPORTE = [
  { titulo: "Corrida / Maratona", icon: "walk-outline" },
  { titulo: "Artes Marciais", icon: "hand-left-outline" },
  { titulo: "Natação", icon: "water-outline" },
  { titulo: "Futebol / Quadra", icon: "football-outline" },
  { titulo: "Crossfit", icon: "barbell-outline" },
  { titulo: "Ciclismo", icon: "bicycle-outline" },
  { titulo: "Outro", icon: "star-outline" },
];
export const SUB_LESAO = [
  { titulo: "Joelho", icon: "accessibility-outline" },
  { titulo: "Lombar / Coluna", icon: "body-outline" },
  { titulo: "Ombro", icon: "fitness-outline" },
  { titulo: "Cervical", icon: "person-outline" },
  { titulo: "Quadril", icon: "walk-outline" },
  { titulo: "Tornozelo", icon: "footsteps-outline" },
  { titulo: "Outra", icon: "add-circle-outline" },
];
export const SUB_CLINICA = [
  { titulo: "Hipertensão", icon: "pulse-outline" },
  { titulo: "Diabetes", icon: "water-outline" },
  { titulo: "Asma", icon: "leaf-outline" },
  { titulo: "Cardiopatia", icon: "heart-half-outline" },
  { titulo: "Outra", icon: "add-circle-outline" },
];



// Personal
export const OPCOES_GENERO_PERSONAL = [
  { id: "Homem", titulo: "Homem", icon: "man-outline" },
  { id: "Mulher", titulo: "Mulher", icon: "woman-outline" },
];

export const OPCOES_AGENDA = [
  {
    id: "Disponível",
    titulo: "Agenda Livre",
    desc: "Recebendo alunos",
    icon: "calendar-outline",
  },
  {
    id: "Poucas Vagas",
    titulo: "Poucas Vagas",
    desc: "Alta procura",
    icon: "flame-outline",
  },
  {
    id: "Quase Lotada",
    titulo: "Quase Lotada",
    desc: "Vagas restritas",
    icon: "lock-closed-outline",
  },
];

export const OPCOES_SERVICOS = [
  {
    id: "Consultoria",
    titulo: "Consultoria no App",
    icon: "phone-portrait-outline",
    desc: "Planilhas e suporte",
  },
  {
    id: "Presencial",
    titulo: "Personal Presencial",
    icon: "barbell-outline",
    desc: "1 a 1",
  },
];

export const OPCOES_PUBLICO = [
  "Homens",
  "Mulheres",
  "Idosos",
  "Adolescentes",
  "Atletas",
  "Iniciantes",
];

export const OPCOES_EXPERIENCIA = [
  "Menos de 1 ano",
  "1 a 3 anos",
  "3 a 5 anos",
  "5 a 10 anos",
  "Mais de 10 anos",
];