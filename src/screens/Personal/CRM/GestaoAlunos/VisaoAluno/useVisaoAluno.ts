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

  const carregarDadosAluno = async () => {
    setIsFetchingData(true);
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
      const { data: sessoes } = await supabase
        .from("workout_sessions")
        .select("id, workout_id, completed_at, has_pain_alert")
        .eq("student_id", aluno.id)
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false });

      if (sessoes && sessoes.length > 0) {
        setTotalTreinos(sessoes.length);

        const dataHoje = new Date();
        const trintaDiasAtras = new Date();
        trintaDiasAtras.setDate(dataHoje.getDate() - 30);
        
        const sessoesRecentes = sessoes.filter(s => new Date(s.completed_at) >= trintaDiasAtras);
        setStreak(sessoesRecentes.length); 

        const adesaoMap: any = {};
        sessoes.forEach(s => {
          if (s.workout_id) {
            adesaoMap[s.workout_id] = (adesaoMap[s.workout_id] || 0) + 1;
          }
        });

        const adesaoArray = Object.keys(adesaoMap).map(workoutId => {
          const qtd = adesaoMap[workoutId];
          const percentual = Math.round((qtd / sessoes.length) * 100);
          return {
            workout_id: workoutId,
            nome: `Treino ${workoutId.substring(0,4).toUpperCase()}`, 
            percentual: percentual,
            quantidade: qtd
          };
        }).sort((a, b) => b.percentual - a.percentual);

        setAdesao(adesaoArray);

        const sessoesIds = sessoes.map(s => s.id);
        const { data: logs } = await supabase
          .from("workout_logs")
          .select("*")
          .in("session_id", sessoesIds)
          .order("created_at", { ascending: false })
          .limit(10); 

        if (logs) {
          setUltimosLogs(logs);
        }
      } else {
        setTotalTreinos(0);
        setStreak(0);
        setAdesao([]);
        setUltimosLogs([]);
      }
    } catch (error) {
      console.log("Erro ao buscar evolução:", error);
    }
  };

  useEffect(() => {
    carregarDadosAluno();
  }, [conexaoId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      try {
        const { data } = await supabase.from('conexoes').select('status').eq('id', conexaoId).single();
        if (data && data.status !== status) {
          setStatus(data.status); 
          carregarDadosAluno(); 
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

  const objetivoFinal = anamnese?.objetivo || aluno?.objetivo_principal || prefs.objetivo_principal || prefs.objetivo || "Não informado";
  const metaDePeso = prefs.meta_peso; 
  const freqReal = prefs.frequencia_semanal || prefs.frequencia;
  const displayFrequencia = MAP_FREQUENCIA[freqReal] || "Não informado";
  const historicoReal = anamnese?.nivel_experiencia;
  const displayHistorico = NIVEIS_MAP[historicoReal] || MAP_HISTORICO[prefs.historico] || "Não informado";
  const isRestrito = anamnese ? anamnese.tem_restricao : (prefs.limitacao && prefs.limitacao !== "nenhuma");
  const descRestricao = anamnese?.detalhes_restricao || (prefs.sub_limitacao?.length > 0 ? prefs.sub_limitacao.join(", ") : prefs.detalhe_outra_limitacao);
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