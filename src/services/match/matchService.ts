import { supabase } from "../supabase";

export interface MatchMotivo {
  icone: string;
  categoria: string;
  texto: string;
}

export interface MatchCriterioDetalhe {
  pts: number;
  max: number;
  exato?: boolean;
}

export interface MatchDetalhesPontuacao {
  objetivo: MatchCriterioDetalhe;
  saude: MatchCriterioDetalhe;
  experiencia: MatchCriterioDetalhe;
  faixa_etaria: MatchCriterioDetalhe;
  comunicacao: MatchCriterioDetalhe;
  cobranca: MatchCriterioDetalhe;
  acompanhamento: MatchCriterioDetalhe;
  autonomia: MatchCriterioDetalhe;
  investimento: MatchCriterioDetalhe;
  distancia: MatchCriterioDetalhe;
  local: MatchCriterioDetalhe;
  turno: MatchCriterioDetalhe;
  total_pts: number;
  total_max: number;
}

export type MatchTier = "perfeito" | "altissima" | "alta";

export interface PersonalMatchItem {
  id: string;
  nome: string;
  foto_url: string | null;
  capa_url: string | null;
  headline: string | null;
  descricao: string | null;
  cidade: string | null;
  bairro: string | null;
  cref: string | null;
  cref_verificado: boolean;
  tempo_experiencia: string | null;
  status_agenda: string;
  servicos_oferecidos: string[];
  servicosOferecidosSeguros: string[];
  preco_consultoria: number | null;
  preco_presencial: number | null;
  preco_medio: number;
  precoAvaliar: number | null;
  labelPreco: string;
  modoAtendimento: "Consultoria" | "Presencial";
  corDestaque: string;
  nota_media: number;
  total_avaliacoes: number;
  distanciaReal: number | null;
  matchPercentual: number;
  matchTier: MatchTier;
  matchTierLabel: string;
  detalhesPontuacao: MatchDetalhesPontuacao;
  matchMotivos: MatchMotivo[];
  specsParsed: { objetivos: string[] };
  badgeUi: string;
  iconUi: string;
}

export const SCORE_MINIMO_MATCH = 85;
export const LIMITE_TOP_MATCH = 3;

export function classificarTierMatch(score: number): { tier: MatchTier; label: string } {
  if (score >= 95) return { tier: "perfeito", label: "Match Perfeito" };
  if (score >= 88) return { tier: "altissima", label: "Altíssima Compatibilidade" };
  return { tier: "alta", label: "Alta Compatibilidade" };
}


export function construirMotivosSeguros(
  detalhes: MatchDetalhesPontuacao,
  modoAtendimento: string,
  distanciaKm: number | null
): MatchMotivo[] {
  const motivos: MatchMotivo[] = [];

  if (detalhes?.objetivo?.max > 0 && detalhes.objetivo.pts >= detalhes.objetivo.max * 0.75) {
    motivos.push({
      icone: "🎯",
      categoria: "Objetivo",
      texto: "Especialista alinhado ao seu objetivo principal de treino.",
    });
  }

  if (detalhes?.saude?.max > 0 && detalhes.saude.pts >= 12) {
    motivos.push({
      icone: "🛡️",
      categoria: "Segurança",
      texto: detalhes.saude.exato
        ? "Experiência específica para atender suas restrições com segurança."
        : "Preparado para adaptar o treino às suas restrições físicas.",
    });
  }

  const ptsDna =
    (detalhes?.comunicacao?.pts || 0) +
    (detalhes?.cobranca?.pts || 0) +
    (detalhes?.acompanhamento?.pts || 0) +
    (detalhes?.autonomia?.pts || 0);
  const maxDna =
    (detalhes?.comunicacao?.max || 0) +
    (detalhes?.cobranca?.max || 0) +
    (detalhes?.acompanhamento?.max || 0) +
    (detalhes?.autonomia?.max || 0);

  if (maxDna > 0 && ptsDna / maxDna >= 0.75) {
    motivos.push({
      icone: "🧠",
      categoria: "Estilo",
      texto: "Comunicação, nível de cobrança e acompanhamento combinam com seu perfil.",
    });
  }

  if (detalhes?.experiencia?.max > 0 && detalhes.experiencia.pts === detalhes.experiencia.max) {
    motivos.push({
      icone: "💪",
      categoria: "Nível",
      texto: "Atende alunos exatamente no seu nível atual de experiência.",
    });
  }

  if (modoAtendimento === "Consultoria") {
    motivos.push({
      icone: "📱",
      categoria: "Formato",
      texto: "Acompanhamento 100% digital pelo app, sem depender de distância.",
    });
  } else if (distanciaKm !== null && distanciaKm <= 10) {
    motivos.push({
      icone: "📍",
      categoria: "Localização",
      texto: `Atende perto de você (${distanciaKm.toFixed(1)} km de distância).`,
    });
  } else if (detalhes?.distancia?.pts >= 6) {
    motivos.push({
      icone: "📍",
      categoria: "Localização",
      texto: "Atende presencialmente na sua região.",
    });
  }

  if (detalhes?.turno?.max > 0 && detalhes.turno.pts >= 3) {
    motivos.push({
      icone: "⏰",
      categoria: "Agenda",
      texto: "Disponibilidade compatível com o seu turno preferido.",
    });
  }

  if (detalhes?.investimento?.max > 0 && detalhes.investimento.pts >= 6) {
    motivos.push({
      icone: "💰",
      categoria: "Investimento",
      texto: "Valor base dentro da sua expectativa de investimento.",
    });
  }

  if (motivos.length === 0) {
    motivos.push({
      icone: "🤝",
      categoria: "Compatibilidade",
      texto: "Perfil compatível com seus requisitos obrigatórios.",
    });
  }

  return motivos.slice(0, 5);
}

export async function buscarMatchesTop3(params?: {
  distanciaMaximaKm?: number;
  scoreMinimo?: number;
  limite?: number;
}): Promise<PersonalMatchItem[]> {
  const { data, error } = await supabase.rpc("get_match_personals", {
    p_max_distancia_km: params?.distanciaMaximaKm ?? 20,
    p_score_minimo: params?.scoreMinimo ?? SCORE_MINIMO_MATCH,
    p_limite: params?.limite ?? LIMITE_TOP_MATCH,
  });

  if (error) throw error;
  if (!Array.isArray(data)) return [];

  return data.map((row: any) => {
    const servicos: string[] = Array.isArray(row.servicos_oferecidos) ? row.servicos_oferecidos : [];
    const modoAtendimento: "Consultoria" | "Presencial" =
      row.modo_atendimento === "Presencial" ? "Presencial" : "Consultoria";

    const badgeUi =
      servicos.length > 1 ? "HÍBRIDO" : (servicos[0] || modoAtendimento).toUpperCase();
    const iconUi =
      badgeUi === "CONSULTORIA" ? "phone-portrait" : badgeUi === "HÍBRIDO" ? "options" : "barbell";

    const score = Number(row.score_compatibilidade || 0);
    const tierInfo = classificarTierMatch(score);
    const distanciaReal = row.distancia_km !== null && row.distancia_km !== undefined ? Number(row.distancia_km) : null;
    const detalhes: MatchDetalhesPontuacao = row.detalhes_pontuacao || ({} as MatchDetalhesPontuacao);

    return {
      id: row.personal_id,
      nome: row.nome || "Profissional",
      foto_url: row.foto_url || null,
      capa_url: row.capa_url || null,
      headline: row.headline || null,
      descricao: row.descricao || null,
      cidade: row.cidade || null,
      bairro: row.bairro || null,
      cref: row.cref || null,
      cref_verificado: Boolean(row.cref_verificado),
      tempo_experiencia: row.tempo_experiencia || null,
      status_agenda: row.status_agenda || "Disponível",
      servicos_oferecidos: servicos,
      servicosOferecidosSeguros: servicos,
      preco_consultoria: row.preco_consultoria !== null ? Number(row.preco_consultoria) : null,
      preco_presencial: row.preco_presencial !== null ? Number(row.preco_presencial) : null,
      preco_medio: Number(row.preco_medio || 0),
      precoAvaliar: row.preco_relevante !== null ? Number(row.preco_relevante) : null,
      labelPreco: row.label_preco || (modoAtendimento === "Consultoria" ? "Consultoria/mês" : "Por aula"),
      modoAtendimento,
      corDestaque: row.cor_destaque || "#FF6B00",
      nota_media: Number(row.nota_media || 0),
      total_avaliacoes: Number(row.total_avaliacoes || 0),
      distanciaReal,
      matchPercentual: score,
      matchTier: tierInfo.tier,
      matchTierLabel: tierInfo.label,
      detalhesPontuacao: detalhes,
      matchMotivos: construirMotivosSeguros(detalhes, modoAtendimento, distanciaReal),
      specsParsed: {
        objetivos: Array.isArray(row.objetivos_personal) ? row.objetivos_personal : [],
      },
      badgeUi,
      iconUi,
    };
  });
}