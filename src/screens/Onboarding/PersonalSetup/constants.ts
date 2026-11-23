export interface OpcaoGrid {
  id: string;
  titulo: string;
  icon: any;
  desc?: string;
}

export interface PaletaVitrine {
  id: string;
  nome: string;
  hex: string;
}

export const PALETAS_VITRINE: PaletaVitrine[] = [
  { id: "orange", nome: "Match Orange", hex: "#FF6B00" },
  { id: "green", nome: "Performance", hex: "#00E676" },
  { id: "blue", nome: "Elite Blue", hex: "#3B82F6" },
  { id: "cyan", nome: "Cyber Cyan", hex: "#06B6D4" },
  { id: "gold", nome: "Luxury Gold", hex: "#F59E0B" },
  { id: "red", nome: "Power Red", hex: "#EF4444" },
  { id: "purple", nome: "Royal Purple", hex: "#A855F7" },
  { id: "rose", nome: "Studio Rose", hex: "#EC4899" },
];

export function hexToRgba(hex: string, alpha: number): string {
  const clean = (hex || "#FF6B00").replace("#", "");
  if (clean.length !== 6) return `rgba(255, 107, 0, ${alpha})`;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const STEP_TITLES = [
  "Identidade",
  "Serviços & Logística",
  "Foco & Público",
  "Motor do Match",
  "Sua Vitrine",
];

export const OPCOES_GENERO = ["Masculino", "Feminino", "Outro"];

export const OPCOES_SERVICOS: OpcaoGrid[] = [
  { id: "Consultoria", titulo: "Consultoria Online", icon: "phone-portrait", desc: "Planejamento e treinos pelo App" },
  { id: "Presencial", titulo: "Presencial/Híbrido", icon: "people", desc: "Acompanhamento físico lado a lado" },
];

export const OPCOES_LOCAL: OpcaoGrid[] = [
  { id: "Academias Comerciais", titulo: "Academias", icon: "business", desc: "Academias de rede ou de bairro" },
  { id: "Condominios", titulo: "Condomínios", icon: "home", desc: "Treino no espaço do próprio aluno" },
  { id: "Estudios", titulo: "Estúdios", icon: "barbell", desc: "Espaços privativos de personal" },
  { id: "Ar Livre", titulo: "Ar Livre/Parques", icon: "leaf", desc: "Praças, parques funcionais ou praia" },
];

export const OPCOES_TURNO: OpcaoGrid[] = [
  { id: "manha", titulo: "Manhã (06h - 12h)", icon: "partly-sunny", desc: "Alunos que treinam antes do dia começar" },
  { id: "tarde", titulo: "Tarde (12h - 18h)", icon: "sunny", desc: "Horários de almoço e meio da tarde" },
  { id: "noite", titulo: "Noite (18h - 22h+)", icon: "moon", desc: "O pico de movimento nas academias" },
  { id: "variado", titulo: "Horários Variados", icon: "time", desc: "Janelas específicas na agenda" },
];

export const OPCOES_AGENDA: OpcaoGrid[] = [
  { id: "Disponível", titulo: "Disponível", icon: "checkmark-circle", desc: "Aceitando novos alunos ativamente" },
  { id: "Poucas Vagas", titulo: "Poucas Vagas", icon: "warning", desc: "Agenda quase cheia, poucos horários" },
  { id: "Lotada", titulo: "Agenda Lotada", icon: "close-circle", desc: "Apenas online ou fila de espera" },
];

export const OPCOES_GENERO_ATENDIDO: OpcaoGrid[] = [
  { id: "indiferente", titulo: "Homens e Mulheres", icon: "people", desc: "Atendimento geral para ambos os gêneros" },
  { id: "mulher", titulo: "Apenas Mulheres", icon: "woman", desc: "Atendimento e metodologia 100% feminina" },
  { id: "homem", titulo: "Apenas Homens", icon: "man", desc: "Atendimento e metodologia 100% masculina" },
];

export const OPCOES_FAIXA_ETARIA: OpcaoGrid[] = [
  { id: "jovens", titulo: "Geração Z (16-25)", icon: "flash", desc: "Foco em estética, energia e hipertrofia" },
  { id: "adultos", titulo: "Profissionais (26-40)", icon: "briefcase", desc: "Treinos otimizados para rotinas corridas" },
  { id: "maturidade", titulo: "Maturidade (41-55)", icon: "shield-checkmark", desc: "Prevenção de dores, tônus e saúde" },
  { id: "longevidade", titulo: "Longevidade (55+)", icon: "leaf", desc: "Mobilidade, qualidade de vida e funcionalidade" },
  { id: "todas", titulo: "Todas as Idades", icon: "infinite", desc: "Didática adaptável para qualquer público" },
];

export const OPCOES_PUBLICO: OpcaoGrid[] = [
  { id: "iniciantes", titulo: "Iniciantes", icon: "walk", desc: "Pessoas começando do zero" },
  { id: "intermediarios", titulo: "Intermediários", icon: "bicycle", desc: "Alunos que já treinam com frequência" },
  { id: "avancados", titulo: "Avançados/Atletas", icon: "fitness", desc: "Foco em alta performance" },
];

export const OPCOES_OBJETIVO: OpcaoGrid[] = [
  { id: "emagrecimento", titulo: "Emagrecimento", icon: "flame", desc: "Perder gordura, secar e definir" },
  { id: "hipertrofia", titulo: "Hipertrofia", icon: "barbell", desc: "Ganho de massa magra e volume" },
  { id: "performance", titulo: "Performance", icon: "speedometer", desc: "Força, TAF ou esportes" },
  { id: "saude", titulo: "Saúde/Qualidade", icon: "heart", desc: "Condicionamento e bem-estar" },
  { id: "outro", titulo: "Outro Foco", icon: "add-circle", desc: "Especialidade complementar" },
];

export const SUB_SAUDE = ["Hipertensão", "Diabetes", "Obesidade", "Postura", "Outros"];
export const SUB_ESPORTE = ["Corrida", "Lutas", "Ciclismo", "Crossfit", "Futebol", "Outros"];

export const OPCOES_LIMITACAO: OpcaoGrid[] = [
  { id: "nenhuma", titulo: "Sem Restrições", icon: "checkmark-done", desc: "Não trabalho com limitações específicas" },
  { id: "gestante", titulo: "Gestante/Pós-parto", icon: "body", desc: "Treinamento adaptado e seguro" },
  { id: "lesao", titulo: "Lesões ou Dores", icon: "medkit", desc: "Fortalecimento e reabilitação" },
  { id: "clinica", titulo: "Condição Clínica", icon: "pulse", desc: "Doenças crônicas ou síndromes" },
  { id: "outra", titulo: "Outra Restrição", icon: "add-circle", desc: "Outra condição específica" },
];

export const SUB_LESAO = ["Joelho", "Coluna", "Ombro", "Quadril", "Tornozelo", "Outros"];
export const SUB_CLINICA = ["Cardiopatia", "Asma", "SOP", "Fibromialgia", "Outros"];

export const OPCOES_ESTILO_COMUNICACAO: OpcaoGrid[] = [
  { id: "motivador", titulo: "Motivador / Energético", icon: "flame", desc: "Energia, incentivo e push mental" },
  { id: "tecnico", titulo: "Técnico / Analítico", icon: "analytics", desc: "Foco em biomecânica e dados" },
  { id: "militar", titulo: "Militar / Direto", icon: "flash", desc: "Sem desculpas, disciplina total" },
  { id: "empatico", titulo: "Acolhedor / Parceiro", icon: "heart", desc: "Escuta ativa e adaptação ao aluno" },
];

export const OPCOES_COBRANCA: OpcaoGrid[] = [
  { id: "leve", titulo: "Leve / Constância", icon: "leaf-outline", desc: "Foco no hábito e acolhimento" },
  { id: "moderada", titulo: "Moderada / Equilíbrio", icon: "scale-outline", desc: "Exige resultado com flexibilidade" },
  { id: "rigorosa", titulo: "Rigorosa / Alta Demanda", icon: "flash-outline", desc: "Metas estritas e cobrança firme" },
];

export const OPCOES_ACOMPANHAMENTO: OpcaoGrid[] = [
  { id: "pontual", titulo: "Pontual (Tira-dúvidas)", icon: "chatbubble-outline", desc: "Contato eventual para ajustes" },
  { id: "frequente", titulo: "Frequente (Check-ins)", icon: "calendar-outline", desc: "Análise semanal de métricas" },
  { id: "proximo", titulo: "Próximo (Quase Diário)", icon: "people-circle-outline", desc: "Contato constante pelo app/WhatsApp" },
];

export const OPCOES_AUTONOMIA: OpcaoGrid[] = [
  { id: "baixa", titulo: "Baixa (Iniciante)", icon: "map-outline", desc: "Precisa de vídeos e correções" },
  { id: "media", titulo: "Média (Intermediário)", icon: "compass-outline", desc: "Conhece o básico, precisa de direção" },
  { id: "alta", titulo: "Alta (Sabe Treinar)", icon: "rocket-outline", desc: "Busca apenas periodização" },
];

export const OPCOES_VALORES: OpcaoGrid[] = [
  { id: "constancia", titulo: "Constância", icon: "calendar", desc: "Disciplina e frequência regular" },
  { id: "comunicacao", titulo: "Comunicação", icon: "chatbubbles", desc: "Transparência nos feedbacks" },
  { id: "compromisso", titulo: "Compromisso", icon: "restaurant", desc: "Seriedade com dieta e descanso" },
  { id: "feedback", titulo: "Abertura a Feedbacks", icon: "ear", desc: "Escutar correções para evoluir" },
  { id: "outro", titulo: "Outro Valor", icon: "add-circle", desc: "Outro comportamento essencial" },
];

export const OPCOES_EXPERIENCIA = [
  "Iniciante (< 2 anos)",
  "Pleno (2 a 5 anos)",
  "Sênior (5 a 10 anos)",
  "Especialista (> 10 anos)",
];

export const ICONES_DESTAQUE = [
  "flame",
  "barbell",
  "trophy",
  "ribbon",
  "heart",
  "location",
  "wallet",
  "sparkles",
];

export const CATEGORIAS_PUBLICACAO: {
  id: "resultado" | "treino" | "certificado" | "espaco";
  label: string;
  icon: string;
}[] = [
  { id: "resultado", label: "Resultado", icon: "trending-up" },
  { id: "treino", label: "Treino", icon: "barbell-outline" },
  { id: "certificado", label: "Certificado", icon: "ribbon-outline" },
  { id: "espaco", label: "Espaço", icon: "business-outline" },
];