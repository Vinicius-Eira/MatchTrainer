import { useCallback, useState } from "react";
import { Alert, Share } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import { useOnboarding } from "../../../../../hooks/useOnboarding";
import { supabase } from "../../../../../services/supabase";

export type AbaBusiness = "negocio" | "marca" | "aquisicao";

export interface ScoreMotivo {
  tipo: "positivo" | "negativo";
  texto: string;
}

export interface FunilData {
  leads: number;
  em_contato: number;
  propostas_aguardando: number;
  propostas_valor: number;
  fechados: number;
  tempo_resposta_horas: number;
  tempo_fechamento_dias: number;
}

export interface FunilConvitesData {
  total: number;
  pendentes: number;
  utilizados: number;
  expirados: number;
  revogados: number;
}

export interface ChecklistMarcaItem {
  chave: string;
  label: string;
  concluido: boolean;
  pontos: number;
}

export interface DepoimentoItem {
  id: string;
  nota: number;
  comentario: string;
  criado_em: string;
  aluno_nome: string;
}

export interface PerfilMarcaData {
  nome: string;
  cref: string | null;
  cref_verificado: boolean;
  foto_url: string | null;
  cidade: string | null;
  tempo_experiencia: string | null;
  instagram: string | null;
  especialidades: any;
  servicos_oferecidos: any;
}

export interface MarcaData {
  score_marca: number;
  nota_media: number;
  total_avaliacoes: number;
  checklist: ChecklistMarcaItem[];
  depoimentos: DepoimentoItem[];
  perfil: PerfilMarcaData;
}

export interface AlunoRiscoItem {
  aluno_id: string;
  conexao_id: string;
  nome: string;
  valor_mensal: number;
  motivo: string;
  prioridade: "alta" | "media" | "baixa";
}

export interface HistoricoItem {
  mes_ref: string;
  mes_num?: number;
  ano_num?: number;
  faturamento: number | string;
}

export interface MetaNegocio {
  id?: string;
  tipo: string;
  alvo: string | number;
}

export interface BusinessKPIs {
  score: number;
  score_motivos: ScoreMotivo[];
  contratos_ativos: number;
  alunos_ativos: number;
  distribuicao: {
    consultoria: number;
    presencial: number;
    receita_consultoria?: number;
    receita_presencial?: number;
  };
  funil: FunilData;
  funil_convites?: FunilConvitesData;
  marca?: MarcaData;
  alunos_risco?: AlunoRiscoItem[];
  historico: HistoricoItem[];
  mrr: number;
  mrr_anterior: number;
  metas: MetaNegocio[];
  receita_total: number;
  receita_recebida: number;
  receita_pendente: number;
  receita_atraso: number;
  ticket_medio: number;
}

export interface InsightBusiness {
  icone: any;
  cor: string;
  titulo: string;
  texto: string;
  ctaLabel?: string;
  ctaRota?: string;
}

export interface InfoModalDados {
  titulo: string;
  texto: string;
  dica: string;
}

export function formatarMoeda(valor: number | string | null | undefined): string {
  const num = Number(valor || 0);
  if (Number.isNaN(num)) return "R$ 0,00";
  return `R$ ${num.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatarMascaraInputMoeda(texto: string): string {
  const apenasDigitos = texto.replace(/\D/g, "");
  if (!apenasDigitos) return "";
  const valorFloat = parseInt(apenasDigitos, 10) / 100;
  return valorFloat.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function parseMoedaBrasileira(texto: string): number {
  const limpo = texto.replace(/\./g, "").replace(",", ".").replace(/[^0-9.]/g, "");
  const num = parseFloat(limpo);
  return Number.isNaN(num) ? 0 : num;
}

export function usePainelCrescimento(navigation: any) {
  const { completarMissao } = useOnboarding();

  const [abaAtiva, setAbaAtiva] = useState<AbaBusiness>("negocio");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [kpis, setKpis] = useState<BusinessKPIs | null>(null);

  const [modalMetaVisivel, setModalMetaVisivel] = useState(false);
  const [novaMetaValor, setNovaMetaValor] = useState("");
  const [salvandoMeta, setSalvandoMeta] = useState(false);

  const [modalInfoVisivel, setModalInfoVisivel] = useState(false);
  const [infoDados, setInfoDados] = useState<InfoModalDados>({
    titulo: "",
    texto: "",
    dica: "",
  });

  const [indicacaoCopiada, setIndicacaoCopiada] = useState(false);

  const carregarDados = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase.rpc("get_business_kpis");
      if (error) throw error;
      setKpis(data as BusinessKPIs);
    } catch (error) {
      console.error("Erro ao puxar métricas do MatchBusiness:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [carregarDados])
  );

  const onRefresh = () => {
    setRefreshing(true);
    carregarDados();
  };

  const mrrAtual = Number(kpis?.mrr || 0);
  const mrrAnterior = Number(kpis?.mrr_anterior || 0);
  const ticketMedio = Number(kpis?.ticket_medio || 0);

  let crescimentoPct = 0;
  if (mrrAnterior > 0) {
    crescimentoPct = ((mrrAtual - mrrAnterior) / mrrAnterior) * 100;
  } else if (mrrAtual > 0) {
    crescimentoPct = 100;
  }

  const metaObj = kpis?.metas?.find((m) => m.tipo === "faturamento");
  const valorMeta = metaObj ? Number(metaObj.alvo) : null;
  const faltamReais = valorMeta && valorMeta > mrrAtual ? valorMeta - mrrAtual : 0;

  const ticketReferencia = ticketMedio > 0 ? ticketMedio : 250;
  const alunosParaMeta = faltamReais > 0 ? Math.ceil(faltamReais / ticketReferencia) : 0;

  let diasParaMeta: number | null = null;
  if (valorMeta && mrrAtual < valorMeta) {
    const crescimentoMensalAbsoluto = mrrAtual - mrrAnterior;
    if (crescimentoMensalAbsoluto > 0) {
      diasParaMeta = Math.ceil((faltamReais / crescimentoMensalAbsoluto) * 30);
    }
  }

  const abrirModalMeta = () => {
    if (valorMeta && valorMeta > 0) {
      setNovaMetaValor(
        valorMeta.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    } else {
      setNovaMetaValor("");
    }
    setModalMetaVisivel(true);
  };

  const handleAlterarMetaInput = (texto: string) => {
    setNovaMetaValor(formatarMascaraInputMoeda(texto));
  };

  const salvarNovaMeta = async () => {
    const valorFloat = parseMoedaBrasileira(novaMetaValor);
    if (!valorFloat || valorFloat <= 0) {
      Alert.alert("Valor inválido", "Informe uma meta mensal maior que zero.");
      return;
    }

    setSalvandoMeta(true);
    try {
      const { error } = await supabase.rpc("salvar_meta_negocio", {
        p_tipo: "faturamento",
        p_alvo: valorFloat,
      });

      if (error) throw error;

      await completarMissao("meta_definida").catch(() => {});
      setModalMetaVisivel(false);
      await carregarDados();
    } catch (error: any) {
      Alert.alert("Erro", error?.message || "Não foi possível salvar a meta.");
    } finally {
      setSalvandoMeta(false);
    }
  };

  const abrirInfo = (titulo: string, texto: string, dica: string) => {
    setInfoDados({ titulo, texto, dica });
    setModalInfoVisivel(true);
  };

  const montarMensagemIndicacao = () => {
    const nomePersonal = kpis?.marca?.perfil?.nome?.split(" ")[0] || "seu treinador";
    return `Fala! Tudo certo? Tenho acompanhado sua evolução nos treinos e estou abrindo 2 vagas novas na minha consultoria pelo MatchTrainer neste mês.\n\nSe você tiver algum amigo ou familiar que queira treinar com acompanhamento personalizado e resultados reais, me passa o contato dele ou compartilha meu perfil! Quem vier por indicação sua já garante uma condição especial comigo.\n\nAbraço, ${nomePersonal}!`;
  };

  const handleCompartilharIndicacao = async () => {
    try {
      await Share.share({ message: montarMensagemIndicacao() });
    } catch {}
  };

  const handleCopiarIndicacao = async () => {
    await Clipboard.setStringAsync(montarMensagemIndicacao());
    setIndicacaoCopiada(true);
    setTimeout(() => setIndicacaoCopiada(false), 2500);
  };

  const handleAcaoChecklistMarca = (chave: string) => {
    if (chave === "avaliacoes") {
      navigation.navigate("Avaliacoes");
      return;
    }
    navigation.navigate("PersonalSetup");
  };

  const gerarDiagnosticoInteligente = (): InsightBusiness | null => {
    if (!kpis) return null;

    const receitaTotal = Number(kpis.receita_total || 0);
    const receitaAtraso = Number(kpis.receita_atraso || 0);
    const inadimplencia = receitaTotal > 0 ? (receitaAtraso / receitaTotal) * 100 : 0;
    const propostasAguardando = Number(kpis.funil?.propostas_aguardando || 0);
    const propostasValor = Number(kpis.funil?.propostas_valor || 0);
    const convitesExpirados = Number(kpis.funil_convites?.expirados || 0);
    const scoreMarca = Number(kpis.marca?.score_marca || 0);
    const leads = Number(kpis.funil?.leads || 0);
    const fechados = Number(kpis.funil?.fechados || 0);
    const taxaConv = leads > 0 ? (fechados / leads) * 100 : 0;

    if (receitaAtraso > 0 && inadimplencia >= 8) {
      return {
        icone: "alert-circle",
        cor: "#FF3B30",
        titulo: "Caixa em Risco Imediato",
        texto: `${inadimplencia.toFixed(1)}% da sua receita do mês está atrasada (${formatarMoeda(receitaAtraso)}). Recupere esse valor antes de investir esforço em novos leads.`,
        ctaLabel: "Abrir Recebimentos",
        ctaRota: "Recebimentos",
      };
    }

    if (propostasAguardando > 0) {
      return {
        icone: "document-text",
        cor: "#FFD700",
        titulo: `${formatarMoeda(propostasValor)} Parados em Propostas`,
        texto: `Você tem ${propostasAguardando} proposta(s) aguardando assinatura do aluno. Envie uma mensagem curta no chat para destravar o fechamento hoje.`,
        ctaLabel: "Ir para Conversas",
        ctaRota: "Messages",
      };
    }

    if (convitesExpirados > 0) {
      return {
        icone: "refresh-circle",
        cor: "#FF6B00",
        titulo: `${convitesExpirados} Convite(s) Expirado(s)`,
        texto: "Alunos que receberam seu convite direto deixaram o código vencer. Reemita com 1 toque e chame no WhatsApp para fechar.",
        ctaLabel: "Gerenciar Convites",
        ctaRota: "MeusAlunos",
      };
    }

    if (scoreMarca < 75) {
      return {
        icone: "ribbon",
        cor: "#0A84FF",
        titulo: `Sua Vitrine está em ${scoreMarca}%`,
        texto: "Perfis com CREF verificado, bio completa e avaliações reais convertem muito mais Matches. Complete os itens pendentes na aba Marca & Vitrine.",
        ctaLabel: "Melhorar Vitrine",
        ctaRota: "__ABA_MARCA__",
      };
    }

    if (leads >= 3 && taxaConv < 30) {
      return {
        icone: "chatbubbles",
        cor: "#0A84FF",
        titulo: "Gargalo na Conversão de Matches",
        texto: `Sua conversão está em ${taxaConv.toFixed(0)}%. Responder novos Matches rápido com um áudio ou convite de avaliação inicial acelera o fechamento.`,
        ctaLabel: "Ver Mensagens",
        ctaRota: "Messages",
      };
    }

    return {
      icone: "rocket",
      cor: "#00E676",
      titulo: "Operação Saudável — Hora de Escalar",
      texto:
        faltamReais > 0
          ? `Sua base está estável. Com mais ${alunosParaMeta} aluno(s) no seu ticket de ${formatarMoeda(ticketReferencia)}, você bate sua meta mensal.`
          : "Use o Motor de Indicação na aba Marca & Vitrine para transformar seus alunos satisfeitos no seu melhor canal de vendas.",
      ctaLabel: "Convidar Novo Aluno",
      ctaRota: "AdicionarAluno",
    };
  };

  const executarAcaoInsight = (rota?: string) => {
    if (!rota) return;
    if (rota === "__ABA_MARCA__") {
      setAbaAtiva("marca");
      return;
    }
    navigation.navigate(rota);
  };

  return {
    abaAtiva,
    setAbaAtiva,
    loading,
    refreshing,
    kpis,
    onRefresh,
    modalMetaVisivel,
    setModalMetaVisivel,
    abrirModalMeta,
    novaMetaValor,
    handleAlterarMetaInput,
    salvandoMeta,
    salvarNovaMeta,
    modalInfoVisivel,
    setModalInfoVisivel,
    infoDados,
    abrirInfo,
    indicacaoCopiada,
    handleCompartilharIndicacao,
    handleCopiarIndicacao,
    handleAcaoChecklistMarca,
    executarAcaoInsight,
    insightAtual: gerarDiagnosticoInteligente(),
    metricas: {
      mrrAtual,
      mrrAnterior,
      ticketMedio,
      ticketReferencia,
      crescimentoPct,
      valorMeta,
      faltamReais,
      alunosParaMeta,
      diasParaMeta,
    },
  };
}