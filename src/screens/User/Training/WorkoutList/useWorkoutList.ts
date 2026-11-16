import { useEffect, useState } from "react";
import { supabase } from "../../../../services/supabase";

export interface MappedDay {
  id: string;
  nome: string;
  objetivo: string;
  qtd_exercicios: number;
  qtd_series: number;
  duracao_estimada: string;
  is_completed: boolean; 
  week_id: string;
  dia_semana: string;
  feedback_treino: string;
}

export interface MappedWeek {
  id: string;
  nome: string;
  titulo_formatado: string;
  start_date: string | null;
  end_date: string | null;
  date_range_formatted: string | null;
  general_notes: string;
  qtd_treinos: number;
  qtd_concluidos: number;
  dias: MappedDay[];
}

export interface MappedProgramHistory {
  id: string;
  nome: string;
  objetivo: string;
  criado_em_formatado: string;
  is_active: boolean;
  total_treinos: number;
  treinos_concluidos: number;
  semanas: MappedWeek[];
}

export function useWorkoutList(navigation: any, routeConexaoId?: string) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [programIdAtual, setProgramIdAtual] = useState<string | null>(null);
  const [programName, setProgramName] = useState<string>("");
  const [programObjective, setProgramObjective] = useState<string>("Buscando...");
  const [programLevel, setProgramLevel] = useState<string>("Intermediário");
  
  const [semanas, setSemanas] = useState<MappedWeek[]>([]);
  const [totalTreinos, setTotalTreinos] = useState<number>(0);
  const [treinosConcluidosGeral, setTreinosConcluidosGeral] = useState<number>(0);

  const [todosProgramasMapeados, setTodosProgramasMapeados] = useState<MappedProgramHistory[]>([]);
  const [programasAnteriores, setProgramasAnteriores] = useState<MappedProgramHistory[]>([]);
  const [historicoModalVisivel, setHistoricoModalVisivel] = useState<boolean>(false);
  const [visualizandoProgramaAntigo, setVisualizandoProgramaAntigo] = useState<boolean>(false);
  
  const [conexaoId, setConexaoId] = useState<string | null>(routeConexaoId || null);
  const [selectedWeekId, setSelectedWeekId] = useState<string | null>(null);
  const [currentAutoWeekId, setCurrentAutoWeekId] = useState<string | null>(null); 

  const [expandedFeedbackId, setExpandedFeedbackId] = useState<string | null>(null);

  const toggleFeedback = (id: string) => {
    setExpandedFeedbackId(prev => prev === id ? null : id);
  };

  const formatarDataBR = (dataIso?: string | null) => {
    if (!dataIso) return null;
    try {
      const limpo = dataIso.split('T')[0];
      if (limpo.length === 10 && limpo.includes('-')) {
        const parts = limpo.split('-');
        return `${parts[2]}/${parts[1]}/${parts[0]}`; 
      }
      const d = new Date(dataIso);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch { return null; }
  };

  const paraDataLocalISO = (d: Date) => {
    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  };

  const DIAS_SEMANA = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];

  const buscarDadosNoSupabase = async (currentConexaoId: string | null) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não logado");

    let cid = currentConexaoId && currentConexaoId !== "1" ? currentConexaoId : null;
    if (!cid) {
      const { data: conexao } = await supabase
        .from('conexoes')
        .select('id')
        .eq('usuario_id', user.id)
        .in('status', ['aluno_ativo', 'aguardando_assinatura', 'pendente'])
        .order('criado_em', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (conexao) cid = conexao.id;
    }

    const { data: listaProgramas, error: errTreinos } = await supabase
      .from('training_programs')
      .select(`
        id, name, objective, general_observation, is_active, created_at,
        training_weeks (
          id, name, general_notes, start_date, end_date,
          workout_days ( id, name, order_index, planned_exercises ( id, public_note ) )
        ),
        workout_days (
          id, name, order_index,
          planned_exercises ( id, public_note )
        )
      `)
      .eq('student_id', user.id)
      .order('created_at', { ascending: false });

    if (errTreinos && errTreinos.code !== 'PGRST116') throw errTreinos;
    
    let execucoes: any[] = [];
    if (cid) {
      const { data: historico } = await supabase
        .from('treinos_execucoes')
        .select('treino_id')
        .eq('conexao_id', cid);
      if (historico) execucoes = historico;
    }

    return { cid, listaProgramas: listaProgramas || [], execucoes };
  };

  const processarDados = (programa: any, execucoes: any[]) => {
    const nomeRotina = (programa?.name && programa.name.trim())
      ? programa.name.trim()
      : (programa?.objective && programa.objective.trim() ? programa.objective.trim() : "Treino Personalizado");

    let weeksSource = programa?.training_weeks || [];
    const legacyDays = programa?.workout_days || [];

    if (weeksSource.length === 0 && legacyDays.length > 0) {
      weeksSource = [{
        id: `legacy-week-${programa.id}`,
        name: 'Semana 1',
        start_date: null,
        end_date: null,
        general_notes: programa.general_observation || '',
        workout_days: legacyDays
      }];
    }

    if (weeksSource.length === 0) {
      return { semanasMapeadas: [], total: 0, concluidosTotais: 0, semanaAtualCalculada: null, programNameTratado: nomeRotina };
    }

    const sortedWeeks = [...weeksSource].sort((a: any, b: any) => {
      if (a.start_date && b.start_date) return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
      return (a.name || "").localeCompare(b.name || "", undefined, { numeric: true, sensitivity: 'base' });
    });
    
    let sumTreinos = 0;
    let sumConcluidosGeral = 0;
    let weekPorDataReal: string | null = null;
    let primeiraWeekComPendentes: string | null = null;

    const dataHoje = new Date();
    dataHoje.setHours(0, 0, 0, 0);

    const dataCriacaoPrograma = programa?.created_at ? new Date(programa.created_at) : new Date();
    const baseCriacaoLocal = new Date(
      dataCriacaoPrograma.getFullYear(),
      dataCriacaoPrograma.getMonth(),
      dataCriacaoPrograma.getDate(),
      0, 0, 0, 0
    );

    const idsConcluidosSet = new Set(execucoes.map(exec => String(exec.treino_id)));

    const semanasMapeadas: MappedWeek[] = sortedWeeks.map((week: any, index: number) => {
      const sortedDays = [...(week.workout_days || [])].sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0));
      let concluidosNaSemana = 0;

      const diasMapeados: MappedDay[] = sortedDays.map((dia: any, idx: number) => {
        const completed = idsConcluidosSet.has(String(dia.id)); 
        if (completed) { concluidosNaSemana++; sumConcluidosGeral++; }
        
        const diaSemana = DIAS_SEMANA[idx % 7];
        const feedbackDoTreino = dia.planned_exercises?.find((ex: any) => ex.public_note && ex.public_note.trim().length > 0)?.public_note || "";

        return {
          id: dia.id,
          nome: dia.name,
          objetivo: programa?.objective || "Treinamento",
          qtd_exercicios: dia.planned_exercises?.length || 0,
          qtd_series: (dia.planned_exercises?.length || 0) * 3, 
          duracao_estimada: `${Math.max(30, (dia.planned_exercises?.length || 0) * 8)} min`,
          is_completed: completed,
          week_id: week.id,
          dia_semana: diaSemana,
          feedback_treino: feedbackDoTreino
        };
      });

      sumTreinos += diasMapeados.length;

      let sDate = week.start_date ? week.start_date.split('T')[0] : null;
      let eDate = week.end_date ? week.end_date.split('T')[0] : null;

      if (!sDate || !eDate) {
        const inicioFixo = new Date(baseCriacaoLocal);
        inicioFixo.setDate(inicioFixo.getDate() + (index * 7)); 
        
        const fimFixo = new Date(inicioFixo);
        fimFixo.setDate(fimFixo.getDate() + 6); 

        sDate = paraDataLocalISO(inicioFixo);
        eDate = paraDataLocalISO(fimFixo);
      }

      if (sDate && eDate && !weekPorDataReal) {
        const [sY, sM, sD] = sDate.split('-').map(Number);
        const [eY, eM, eD] = eDate.split('-').map(Number);
        const startLocal = new Date(sY, sM - 1, sD, 0, 0, 0, 0);
        const endLocal = new Date(eY, eM - 1, eD, 23, 59, 59, 999);

        if (dataHoje >= startLocal && dataHoje <= endLocal && concluidosNaSemana < diasMapeados.length) {
          weekPorDataReal = week.id;
        }
      }

      if (!primeiraWeekComPendentes && concluidosNaSemana < diasMapeados.length && diasMapeados.length > 0) {
        primeiraWeekComPendentes = week.id;
      }

      const tituloHierarquico = `${nomeRotina} / ${week.name}`;

      return {
        id: week.id,
        nome: week.name,
        titulo_formatado: tituloHierarquico,
        start_date: sDate,
        end_date: eDate,
        date_range_formatted: `${formatarDataBR(sDate)} até ${formatarDataBR(eDate)}`, 
        general_notes: week.general_notes || "",
        qtd_treinos: diasMapeados.length,
        qtd_concluidos: concluidosNaSemana,
        dias: diasMapeados
      };
    });

    const weekAtualDetectada =
      weekPorDataReal ||
      primeiraWeekComPendentes ||
      (semanasMapeadas.length > 0 ? semanasMapeadas[semanasMapeadas.length - 1].id : null);

    return { semanasMapeadas, total: sumTreinos, concluidosTotais: sumConcluidosGeral, semanaAtualCalculada: weekAtualDetectada, programNameTratado: nomeRotina };
  };

  const aplicarProgramaNaTela = (progRaw: any, execucoes: any[], isAntigo: boolean) => {
    const dbObjective = progRaw.objective || "Hipertrofia e Evolução";
    setProgramIdAtual(progRaw.id);
    setProgramObjective(dbObjective);
    setProgramLevel("Intermediário");
    setVisualizandoProgramaAntigo(isAntigo);

    const { semanasMapeadas, total, concluidosTotais, semanaAtualCalculada, programNameTratado } = processarDados(progRaw, execucoes);
    setProgramName(programNameTratado);
    setSemanas(semanasMapeadas);
    setTotalTreinos(total);
    setTreinosConcluidosGeral(concluidosTotais);
    setCurrentAutoWeekId(semanaAtualCalculada);
    setSelectedWeekId(null);
  };

  const fetchDadosEAtualizarEstado = async () => {
    const result = await buscarDadosNoSupabase(conexaoId);
    setConexaoId(result.cid);
    
    const todosRaw = result.listaProgramas || [];

    if (todosRaw.length > 0) {
      const principalRaw = todosRaw.find((p: any) => p.is_active !== false) || todosRaw[0];
      aplicarProgramaNaTela(principalRaw, result.execucoes, false);

      const mapeadosHistorico: MappedProgramHistory[] = todosRaw.map((p: any) => {
        const proc = processarDados(p, result.execucoes);
        return {
          id: p.id,
          nome: proc.programNameTratado,
          objetivo: p.objective || "Hipertrofia e Evolução",
          criado_em_formatado: formatarDataBR(p.created_at) || "--/--/----",
          is_active: p.is_active !== false,
          total_treinos: proc.total,
          treinos_concluidos: proc.concluidosTotais,
          semanas: proc.semanasMapeadas
        };
      });

      setTodosProgramasMapeados(mapeadosHistorico);
      setProgramasAnteriores(mapeadosHistorico.filter(p => p.id !== principalRaw.id && p.total_treinos > 0));
    } else {
      setProgramName("Meus Treinos");
      setProgramObjective("Aguardando Rotina");
      setProgramLevel("");
      setSemanas([]);
      setProgramasAnteriores([]);
    }
  };

  const selecionarProgramaDoHistorico = (programaHist: MappedProgramHistory) => {
    setProgramIdAtual(programaHist.id);
    setProgramName(programaHist.nome);
    setProgramObjective(programaHist.objetivo);
    setSemanas(programaHist.semanas);
    setTotalTreinos(programaHist.total_treinos);
    setTreinosConcluidosGeral(programaHist.treinos_concluidos);
    setCurrentAutoWeekId(programaHist.semanas[0]?.id || null);
    setSelectedWeekId(null);
    setVisualizandoProgramaAntigo(true);
    setHistoricoModalVisivel(false);
  };

  const voltarParaProgramaAtual = () => {
    if (todosProgramasMapeados.length === 0) return;
    const principal = todosProgramasMapeados.find(p => p.is_active) || todosProgramasMapeados[0];
    setProgramIdAtual(principal.id);
    setProgramName(principal.nome);
    setProgramObjective(principal.objetivo);
    setSemanas(principal.semanas);
    setTotalTreinos(principal.total_treinos);
    setTreinosConcluidosGeral(principal.treinos_concluidos);
    setCurrentAutoWeekId(principal.semanas[0]?.id || null);
    setSelectedWeekId(null);
    setVisualizandoProgramaAntigo(false);
  };

  useEffect(() => {
    let isMounted = true;
    const carregarInicial = async () => {
      try { await fetchDadosEAtualizarEstado(); } 
      catch (error: any) { console.log("Erro ao buscar rotinas:", error); } 
      finally { if (isMounted) setLoading(false); }
    };
    carregarInicial();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchDadosEAtualizarEstado();
    });
    return unsubscribe;
  }, [navigation, conexaoId]);

  const onRefresh = async () => {
    setRefreshing(true);
    try { await fetchDadosEAtualizarEstado(); } 
    finally { setRefreshing(false); }
  };

  const openWorkoutList = (treinoId: string) => {
    setHistoricoModalVisivel(false);
    navigation.navigate("WorkoutPreview", { treinoId, conexaoId });
  };

  const handleBack = () => {
    if (selectedWeekId) setSelectedWeekId(null);
    else if (visualizandoProgramaAntigo) voltarParaProgramaAtual();
    else navigation.goBack();
  };

  const activeWeek = selectedWeekId ? semanas.find(s => s.id === selectedWeekId) : null;
  const progressoPercentual = totalTreinos > 0 ? (treinosConcluidosGeral / totalTreinos) * 100 : 0;

  return {
    loading, refreshing, onRefresh,
    programIdAtual, programName, programObjective, programLevel, semanas, totalTreinos, treinosConcluidosGeral, progressoPercentual,
    selectedWeekId, setSelectedWeekId, activeWeek, currentAutoWeekId,
    expandedFeedbackId, toggleFeedback,
    programasAnteriores, historicoModalVisivel, setHistoricoModalVisivel,
    visualizandoProgramaAntigo, selecionarProgramaDoHistorico, voltarParaProgramaAtual,
    openWorkoutList, voltar: handleBack
  };
}