import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { supabase } from "../../../../../services/supabase";
import { theme } from "../../../../../theme/theme";

const NIVEIS_MAP: Record<string, string> = {
  Iniciante: "Iniciante Total",
  Intermediario: "Intermediário",
  Avancado: "Avançado",
};

const MAP_HISTORICO: Record<string, string> = {
  iniciante: "Iniciante Total",
  inconstante: "Inconstante (Vai e para)",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

const MAP_FREQUENCIA: Record<string, string> = {
  "1-2": "1 a 2 dias/sem",
  "3-4": "3 a 4 dias/sem",
  "5-6": "5 a 6 dias/sem",
  "7": "Todos os dias",
};

export function useVisaoAluno(route: any, navigation: any) {
  const { conexaoId, aluno, statusAtual } = route.params;
  const [status, setStatus] = useState<string>(statusAtual);
  
  const [activeTab, setActiveTab] = useState<string>("visao_geral"); 
  
  const [isFetchingData, setIsFetchingData] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  const [alunoSolicitouSaida, setAlunoSolicitouSaida] = useState<boolean>(false);
  const [dataInicioParceria, setDataInicioParceria] = useState<string | null>(null);
  const [planoAtivo, setPlanoAtivo] = useState<any>(null);
  const [anamnese, setAnamnese] = useState<any>(null);

  const [streak, setStreak] = useState<number>(0);
  const [adesao, setAdesao] = useState<any[]>([]);
  const [totalTreinos, setTotalTreinos] = useState<number>(0);
  const [ultimosLogs, setUltimosLogs] = useState<any[]>([]);

  let prefs: any = {};
  try {
    prefs =
      typeof aluno.preferencias === "string"
        ? JSON.parse(aluno.preferencias)
        : aluno.preferencias || {};
  } catch (e) {}

  const carregarDadosAluno = async (pularLoading = false) => {
    if (!pularLoading) {
      setIsFetchingData(true);
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const [planoRes, anamneseRes, msgsRes, conexaoRes] = await Promise.all([
        supabase
          .from("planos")
          .select("*")
          .eq("aluno_id", aluno.id)
          .eq("personal_id", session.user.id)
          .eq("status", "ativo")
          .single(),
        supabase
          .from("anamneses")
          .select("*")
          .eq("usuario_id", aluno.id)
          .eq("personal_id", session.user.id)
          .order('criado_em', { ascending: false })
          .limit(1)
          .single(),
        supabase
          .from("mensagens")
          .select("conteudo")
          .eq("conexao_id", conexaoId)
          .eq("tipo_remetente", "aluno")
          .like("conteudo", "%solicitar o encerramento%"),
        supabase
          .from("conexoes")
          .select("confirmado_em, atualizado_em, criado_em, status")
          .eq("id", conexaoId)
          .single()
      ]);

      if (planoRes.data) setPlanoAtivo(planoRes.data);
      if (anamneseRes.data) setAnamnese(anamneseRes.data);
      if (msgsRes.data && msgsRes.data.length > 0) setAlunoSolicitouSaida(true);
      
      if (conexaoRes.data) {
        setDataInicioParceria(
          conexaoRes.data.confirmado_em || conexaoRes.data.atualizado_em || conexaoRes.data.criado_em
        );
        if (conexaoRes.data.status !== status) {
          setStatus(conexaoRes.data.status);
        }
      }

      await calcularMetricasEvolucao();

    } catch (error) {
      console.log("Erro ao buscar dados extras do aluno:", error);
    } finally {
      setIsFetchingData(false);
    }
  };

  const calcularMetricasEvolucao = async () => {
    try {
      const { data: treinosPrescritos } = await supabase
        .from('treinos_prescritos')
        .select('id, nome')
        .eq('conexao_id', conexaoId);

      if (!treinosPrescritos || treinosPrescritos.length === 0) {
        setTotalTreinos(0); setStreak(0); setAdesao([]); setUltimosLogs([]);
        return;
      }

      const idsTreinos = treinosPrescritos.map(t => t.id);

      const { data: execucoes } = await supabase
        .from("treinos_execucoes")
        .select("id, treino_id, data_inicio, sentiu_dor, esforco_rpe, duracao_segundos, dados_execucao")
        .in("treino_id", idsTreinos)
        .order("data_inicio", { ascending: false });

      if (execucoes && execucoes.length > 0) {
        setTotalTreinos(execucoes.length);

        const dataHoje = new Date();
        const trintaDiasAtras = new Date();
        trintaDiasAtras.setDate(dataHoje.getDate() - 30);
        
        const sessoesRecentes = execucoes.filter(s => new Date(s.data_inicio) >= trintaDiasAtras);
        setStreak(sessoesRecentes.length); 

        const adesaoMap: any = {};
        execucoes.forEach(s => {
          if (s.treino_id) {
            adesaoMap[s.treino_id] = (adesaoMap[s.treino_id] || 0) + 1;
          }
        });

        const adesaoArray = Object.keys(adesaoMap).map(treinoId => {
          const qtd = adesaoMap[treinoId];
          const percentual = Math.round((qtd / execucoes.length) * 100);
          const nomeTreino = treinosPrescritos.find(t => t.id === treinoId)?.nome || `Treino`;
          return {
            workout_id: treinoId,
            nome: nomeTreino, 
            percentual: percentual,
            quantidade: qtd
          };
        }).sort((a, b) => b.percentual - a.percentual);

        setAdesao(adesaoArray);

        const formatarKGs = (pesoTotal: number) => pesoTotal.toLocaleString('pt-BR');

        const logsFormatados = execucoes.slice(0, 10).map(exec => {
            const nomeTreino = treinosPrescritos.find(t => t.id === exec.treino_id)?.nome || "Treino";
            const mins = Math.floor((exec.duracao_segundos || 0) / 60);

            let volumeDoTreino = 0;
            if (exec.dados_execucao && Array.isArray(exec.dados_execucao)) {
                exec.dados_execucao.forEach((ex: any) => {
                    if (ex.series && Array.isArray(ex.series)) {
                        ex.series.forEach((s: any) => {
                            const reps = Number(s.reps_feitas) || 0;
                            const carga = Number(s.carga_feita) || 0;
                            volumeDoTreino += (reps * carga);
                        });
                    }
                });
            }

            return {
                id: exec.id,
                created_at: exec.data_inicio,
                nomeTreino: nomeTreino,
                duracao: `${mins} min`,
                rpe: exec.esforco_rpe,
                sentiuDor: exec.sentiu_dor,
                volumeTotal: volumeDoTreino > 0 ? `${formatarKGs(volumeDoTreino)} kg` : "--"
            };
        });

        setUltimosLogs(logsFormatados);

      } else {
        setTotalTreinos(0); setStreak(0); setAdesao([]); setUltimosLogs([]);
      }
    } catch (error) {
      console.log("Erro ao buscar evolução:", error);
    }
  };

  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted) carregarDadosAluno(true);
    });
    return () => { isMounted = false; };
  }, [conexaoId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      try {
        const { data } = await supabase.from('conexoes').select('status').eq('id', conexaoId).single();
        if (data && data.status !== status) {
          setStatus(data.status); 
          carregarDadosAluno(true); 
        }
      } catch (e) {}
    });
    return unsubscribe;
  }, [navigation, conexaoId, status]);

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarDadosAluno();
    setRefreshing(false);
  };

  const irParaNovoContrato = () => {
    navigation.navigate("AdicionarAluno", {
      leadInjetado: aluno, 
      conexaoId: conexaoId,
      planoAtivo: planoAtivo 
    });
  };

  const atualizarStatusBasico = async (novoStatus: string) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await supabase.from("conexoes").update({ status: novoStatus }).eq("id", conexaoId);
      setStatus(novoStatus);

      if (novoStatus === "inativo") {
        if (planoAtivo) {
          await supabase.from("planos").update({ status: "cancelado" }).eq("id", planoAtivo.id);
          await supabase.from("historico_financeiro_logs").insert([
            {
              personal_id: session?.user.id,
              aluno_id: aluno.id,
              referencia_id: planoAtivo.id,
              tipo_evento: "CONTRATO_CANCELADO",
              descricao: `Contrato encerrado e parceria movida para inativos.`,
              metadados: { acao: "cancelamento" },
            },
          ]);
        }
        Alert.alert("Ciclo Encerrado", "O aluno foi movido para os inativos e as cobranças futuras foram canceladas.");
        navigation.goBack();
      } else if (novoStatus === "recusado") {
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao processar.");
    } finally {
      setLoading(false);
    }
  };

  const handlePersonalEncerraParceria = () => {
    const dataInicio = new Date(dataInicioParceria || Date.now());
    const hoje = new Date();
    const diffDays = Math.floor(Math.abs(hoje.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24));

    let msg = "Tem certeza que deseja encerrar o contrato e pausar as cobranças?\n\nO aluno irá para o seu arquivo de inativos.";
    if (diffDays <= 7) msg = "Este contrato foi iniciado há menos de 7 dias (Período de Adaptação).\n\nDeseja encerrar e cancelar as cobranças?";
    else if (diffDays < 30) msg = "Atenção: O aluno não completou o primeiro ciclo de 30 dias.\n\nTem certeza que deseja forçar o cancelamento do contrato agora?";

    Alert.alert("Encerrar Parceria", msg, [
      { text: "Cancelar", style: "cancel" },
      { text: "Sim, Encerrar", style: "destructive", onPress: () => atualizarStatusBasico("inativo") },
    ]);
  };

  const abrirChat = () =>
    navigation.navigate("Chat", {
      conexaoId,
      nomeOutro: aluno.nome,
      fotoOutro: aluno.foto_url,
      tipoUsuarioLogado: "personal",
    });

  const calcularIdade = (d: string) => {
    if (!d) return "--";
    const n = new Date(d.includes("/") ? `${d.split("/")[2]}-${d.split("/")[1]}-${d.split("/")[0]}` : d);
    const h = new Date();
    let i = h.getFullYear() - n.getFullYear();
    const m = h.getMonth() - n.getMonth();
    if (m < 0 || (m === 0 && h.getDate() < n.getDate())) i--;
    return isNaN(i) ? "--" : i.toString();
  };

  const calcularIMC = (p: string | number, a: string | number) => {
    if (!p || !a) return null;
    const h = Number(a) > 3 ? Number(a) / 100 : Number(a);
    const imc = parseFloat(p.toString()) / (h * h);
    let c = "", cor = theme.colors.textSecondary;
    if (imc < 18.5) { c = "Abaixo"; cor = theme.colors.warning; } 
    else if (imc < 24.9) { c = "Normal"; cor = theme.colors.success; } 
    else if (imc < 29.9) { c = "Sobrepeso"; cor = theme.colors.primary; } 
    else { c = "Obesidade"; cor = theme.colors.danger; }
    return { valor: imc.toFixed(1), classificacao: c, cor };
  };

  const mostrarAjudaAdesao = () => {
    Alert.alert(
      "O que é isso?",
      "Esta barra compara quantas vezes o aluno completou cada ficha.\n\nSe ele faz muito o 'Treino A' e pouco o 'Treino C', a barra do Treino C ficará menor e vermelha, indicando que ele pode estar 'pulando' esse treino."
    );
  };

  
  const fotoUrlRaw = aluno?.foto_url;
  let fotoValida = null;
  if (typeof fotoUrlRaw === 'string' && fotoUrlRaw.trim().length > 5) {
      fotoValida = fotoUrlRaw;
  }

  const cidadeStr = aluno?.cidade?.trim();
  const bairroStr = aluno?.bairro?.trim();
  const localizacaoFormatada = [cidadeStr, bairroStr].filter(Boolean).join(" • ") || "Local não informado";

  const arrObjetivos = prefs?.objetivos || [];
  let objetivoFinalText = null;
  if (arrObjetivos.length > 0) {
    objetivoFinalText = arrObjetivos.map((o: string) => o.charAt(0).toUpperCase() + o.slice(1)).join(" e ");
  }
  const objetivoFinal = anamnese?.objetivo || objetivoFinalText || "Não informado";

  const orcamentoAluno = prefs?.orcamento ? `R$ ${prefs.orcamento}` : "Aberto";
  const metaDePeso = prefs?.meta_peso; 
  const freqReal = prefs?.frequencia_semanal || prefs?.frequencia;
  const displayFrequencia = MAP_FREQUENCIA[freqReal] || "Não informado";
  
  const historicoReal = anamnese?.nivel_experiencia;
  const displayHistorico = NIVEIS_MAP[historicoReal] || MAP_HISTORICO[prefs?.historico] || "Não informado";
  
  const arrLimitacoes = prefs?.limitacoes || [];
  const isRestrito = anamnese ? anamnese.tem_restricao : (arrLimitacoes.length > 0 && !arrLimitacoes.includes("nenhuma"));
  
  let descRestricao = anamnese?.detalhes_restricao;
  if (!descRestricao) {
    const subsLim = prefs?.subs_limitacoes || [];
    descRestricao = subsLim.length > 0 ? subsLim.join(", ") : prefs?.outra_limitacao;
  }
  
  const dadosIMC = calcularIMC(aluno.peso, aluno.altura);

  return {
    aluno,
    conexaoId,
    status,
    activeTab,
    setActiveTab,
    isFetchingData,
    loading,
    refreshing,
    onRefresh,
    alunoSolicitouSaida,
    planoAtivo,
    prefs,
    irParaNovoContrato,
    atualizarStatusBasico,
    handlePersonalEncerraParceria,
    abrirChat,
    mostrarAjudaAdesao,
    calcularIdade,
    fotoValida,
    objetivoFinal,
    localizacaoFormatada,
    orcamentoAluno,
    metaDePeso,
    displayFrequencia,
    displayHistorico,
    isRestrito,
    descRestricao,
    dadosIMC,
    streak,
    totalTreinos,
    adesao,
    ultimosLogs
  };
}