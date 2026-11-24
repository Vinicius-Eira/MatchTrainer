export interface OpcaoMatch {
  id: string;
  titulo: string;
  icon: any;
  desc?: string;
}

export const ALUNO_STEP_TITLES = ["Seu Perfil", "Logística", "Seu Corpo", "O Match Ideal"];

export const OPCOES_GENERO_USUARIO = ["Masculino", "Feminino", "Outro"];

export const OPCOES_MODALIDADE_ALUNO: OpcaoMatch[] = [
  { id: "Consultoria", titulo: "Consultoria Online", icon: "phone-portrait", desc: "Treinos e acompanhamento 100% pelo app" },
  { id: "Presencial", titulo: "Presencial", icon: "people", desc: "Acompanhamento físico lado a lado" },
  { id: "Indiferente", titulo: "Híbrido / Ambos", icon: "options", desc: "Aberto a presencial ou consultoria" },
];

export const OPCOES_LOCAL_TREINO: OpcaoMatch[] = [
  { id: "Academias Comerciais", titulo: "Academias", icon: "business", desc: "Academias de rede ou de bairro" },
  { id: "Condominios", titulo: "Condomínios", icon: "home", desc: "Treinar no prédio ou em casa" },
  { id: "Estudios", titulo: "Estúdios", icon: "barbell", desc: "Espaços privativos de personal" },
  { id: "Ar Livre", titulo: "Ar Livre", icon: "leaf", desc: "Parques, praças ou praia" },
];

export const OPCOES_TURNO_TREINO: OpcaoMatch[] = [
  { id: "manha", titulo: "Manhã", icon: "partly-sunny", desc: "Treino antes do dia começar (06h–12h)" },
  { id: "tarde", titulo: "Tarde", icon: "sunny", desc: "Almoço ou período da tarde (12h–18h)" },
  { id: "noite", titulo: "Noite", icon: "moon", desc: "Depois do trabalho ou estudos (18h–22h+)" },
  { id: "variado", titulo: "Janelas Específicas", icon: "time", desc: "Horários flexíveis ou dias específicos" },
];

export const OPCOES_FREQUENCIA_SEMANAL: OpcaoMatch[] = [
  { id: "1-2", titulo: "1 a 2 dias", icon: "calendar", desc: "Adaptação e rotina apertada" },
  { id: "3-4", titulo: "3 a 4 dias", icon: "flash", desc: "Constância e evolução equilibrada" },
  { id: "5-6", titulo: "5 a 6 dias", icon: "flame", desc: "Foco alto e disciplina" },
  { id: "7", titulo: "Todo dia", icon: "rocket", desc: "Rotina intensa e diária" },
];

export const OPCOES_GENERO_TREINADOR: OpcaoMatch[] = [
  { id: "indiferente", titulo: "Indiferente", icon: "people", desc: "Foco apenas na compatibilidade" },
  { id: "mulher", titulo: "Apenas Mulheres", icon: "woman", desc: "Me sinto mais confortável" },
  { id: "homem", titulo: "Apenas Homens", icon: "man", desc: "Tenho preferência" },
];

export const OPCOES_INVESTIMENTO: OpcaoMatch[] = [
  {
    id: "economico",
    titulo: "Orçamento Básico",
    icon: "wallet-outline",
    desc: "Consultoria até R$ 150/mês ou aula até R$ 90",
  },
  {
    id: "medio",
    titulo: "Média de Mercado",
    icon: "cash-outline",
    desc: "Consultoria R$ 150–300/mês ou aula R$ 90–160",
  },
  {
    id: "premium",
    titulo: "Orçamento Premium",
    icon: "diamond-outline",
    desc: "Consultoria acima de R$ 300/mês ou aula acima de R$ 160",
  },
];

export const OPCOES_HISTORICO_ALUNO: OpcaoMatch[] = [
  { id: "iniciante", titulo: "Iniciante", icon: "walk", desc: "Nunca treinei ou parei faz tempo" },
  { id: "intermediario", titulo: "Intermediário", icon: "bicycle", desc: "Treino com alguma constância" },
  { id: "avancado", titulo: "Avançado", icon: "fitness", desc: "Treino pesado e conheço execução" },
];

export const OPCOES_OBJETIVO_TREINO: OpcaoMatch[] = [
  { id: "emagrecimento", titulo: "Emagrecer", icon: "flame", desc: "Perder gordura e definir" },
  { id: "hipertrofia", titulo: "Ganhar Massa", icon: "barbell", desc: "Ganho de massa magra e força" },
  { id: "performance", titulo: "Performance", icon: "speedometer", desc: "Corrida, TAF ou esportes" },
  { id: "saude", titulo: "Saúde / Qualidade", icon: "heart", desc: "Condicionamento e bem-estar" },
  { id: "outro", titulo: "Outro Foco", icon: "add-circle", desc: "Tenho um objetivo diferente" },
];

export const SUB_SAUDE = ["Hipertensão", "Diabetes", "Obesidade", "Postura", "Outros"];
export const SUB_SAUDE_SENSIVEIS = ["Hipertensão", "Diabetes", "Obesidade"];
export const SUB_ESPORTE = ["Corrida", "Lutas", "Ciclismo", "Crossfit", "Futebol", "Outros"];

export const OPCOES_LIMITACAO_ALUNO: OpcaoMatch[] = [
  { id: "nenhuma", titulo: "Sem Restrições", icon: "checkmark-done", desc: "Sem lesões ou condições clínicas" },
  {
    id: "nao_informar",
    titulo: "Prefiro Não Informar",
    icon: "shield-outline",
    desc: "Compartilho apenas depois com meu personal",
  },
  { id: "gestante", titulo: "Gestante/Pós-parto", icon: "body", desc: "Treino seguro e adaptado" },
  { id: "lesao", titulo: "Lesões ou Dores", icon: "medkit", desc: "Dores articulares ou musculares" },
  { id: "clinica", titulo: "Condição Clínica", icon: "pulse", desc: "Doença crônica ou síndrome" },
  { id: "outra", titulo: "Outra Restrição", icon: "add-circle", desc: "Especificar condição" },
];

export const LIMITACOES_SENSIVEIS = ["gestante", "lesao", "clinica", "outra"];

export const SUB_LESAO = ["Joelho", "Coluna", "Ombro", "Quadril", "Tornozelo", "Outros"];
export const SUB_CLINICA = ["Cardiopatia", "Asma", "SOP", "Fibromialgia", "Outros"];

export const OPCOES_ESTILO_COMUNICACAO: OpcaoMatch[] = [
  { id: "motivador", titulo: "Motivador", icon: "flame", desc: "Energia alta para me incentivar" },
  { id: "tecnico", titulo: "Técnico / Focado", icon: "analytics", desc: "Foco em biomecânica e dados" },
  { id: "militar", titulo: "Direto / Firme", icon: "flash", desc: "Objetivo e focado em disciplina" },
  { id: "empatico", titulo: "Acolhedor", icon: "heart", desc: "Parceiro que respeita meu ritmo" },
];

export const OPCOES_COBRANCA_ALUNO: OpcaoMatch[] = [
  { id: "leve", titulo: "Compreensivo(a)", icon: "leaf-outline", desc: "Construir hábito sem pressão" },
  { id: "moderada", titulo: "Equilibrado(a)", icon: "scale-outline", desc: "Exige evolução com flexibilidade" },
  { id: "rigorosa", titulo: "Alta Demanda", icon: "flash-outline", desc: "Pega no pé e puxa meus limites" },
];

export const OPCOES_ACOMPANHAMENTO_ALUNO: OpcaoMatch[] = [
  { id: "pontual", titulo: "Independente", icon: "chatbubble-outline", desc: "Treino montado + dúvidas pontuais" },
  { id: "frequente", titulo: "Semanal", icon: "calendar-outline", desc: "Check-ins e ajustes toda semana" },
  { id: "proximo", titulo: "Lado a Lado", icon: "people-circle-outline", desc: "Contato quase diário e suporte próximo" },
];

export const OPCOES_AUTONOMIA_ALUNO: OpcaoMatch[] = [
  { id: "baixa", titulo: "Baixa Autonomia", icon: "map-outline", desc: "Preciso de vídeos e correções" },
  { id: "media", titulo: "Média Autonomia", icon: "compass-outline", desc: "Executo bem, preciso de direção" },
  { id: "alta", titulo: "Alta Autonomia", icon: "rocket-outline", desc: "Domino a academia, quero periodização" },
];

export const OPCOES_VALORES_TREINADOR: OpcaoMatch[] = [
  { id: "didatica", titulo: "Boa Didática", icon: "book", desc: "Explicar o porquê de cada exercício" },
  { id: "motivacao", titulo: "Motivação", icon: "flame", desc: "Energia positiva e incentivo" },
  { id: "flexibilidade", titulo: "Flexibilidade", icon: "swap-horizontal", desc: "Adaptar treinos nos imprevistos" },
  { id: "pontualidade", titulo: "Pontualidade", icon: "time", desc: "Respostas ágeis e compromisso" },
  { id: "outro", titulo: "Outro Valor", icon: "add-circle", desc: "Especificar comportamento" },
];

export function generoUiParaDb(generoUi: string): "homem" | "mulher" | "outro" | null {
  if (generoUi === "Masculino") return "homem";
  if (generoUi === "Feminino") return "mulher";
  if (generoUi === "Outro") return "outro";
  return null;
}

export function generoDbParaUi(generoDb?: string | null): string {
  if (generoDb === "homem") return "Masculino";
  if (generoDb === "mulher") return "Feminino";
  if (generoDb === "outro") return "Outro";
  return "";
}

export function normalizarHistoricoParaPublico(historico?: string | null): string | null {
  if (historico === "iniciante") return "iniciantes";
  if (historico === "intermediario") return "intermediarios";
  if (historico === "avancado") return "avancados";
  return null;
}

export function validarDataNascimentoBr(dataBr: string): { valida: boolean; iso: string | null; erro?: string } {
  const limpo = dataBr.trim();
  if (limpo.length !== 10) {
    return { valida: false, iso: null, erro: "Informe a data completa no formato DD/MM/AAAA." };
  }
  const partes = limpo.split("/").map(Number);
  if (partes.length !== 3 || partes.some((n) => Number.isNaN(n))) {
    return { valida: false, iso: null, erro: "Data de nascimento inválida." };
  }
  const [dd, mm, yyyy] = partes;
  const anoAtual = new Date().getFullYear();
  if (yyyy < 1920 || yyyy > anoAtual - 14) {
    return { valida: false, iso: null, erro: "Informe uma data válida (idade mínima de 14 anos)." };
  }
  const dt = new Date(yyyy, mm - 1, dd);
  if (dt.getFullYear() !== yyyy || dt.getMonth() !== mm - 1 || dt.getDate() !== dd) {
    return { valida: false, iso: null, erro: "Essa data não existe no calendário." };
  }
  const iso = `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
  return { valida: true, iso };
}

export function possuiDadosSaudeSensiveis(limitacoes: string[], subsObjetivos: string[]): boolean {
  const temLimitacaoSensivel = limitacoes.some((l) => LIMITACOES_SENSIVEIS.includes(l));
  const temSubSaudeSensivel = subsObjetivos.some((s) => SUB_SAUDE_SENSIVEIS.includes(s));
  return temLimitacaoSensivel || temSubSaudeSensivel;
}