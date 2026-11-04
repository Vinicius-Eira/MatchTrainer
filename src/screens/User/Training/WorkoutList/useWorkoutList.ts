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

export function useWorkoutList(navigation: any, routeConexaoId?: string) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [programName, setProgramName] = useState<string>("");
  const [programObjective, setProgramObjective] = useState<string>("Buscando...");
  const [programLevel, setProgramLevel] = useState<string>("Intermediário");
  
  const [semanas, setSemanas] = useState<MappedWeek[]>([]);
  const [totalTreinos, setTotalTreinos] = useState<number>(0);
  const [treinosConcluidosGeral, setTreinosConcluidosGeral] = useState<number>(0);
  
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
      if (dataIso.length === 10 && dataIso.includes('-')) {
        const parts = dataIso.split('-');
        return `${parts[2]}/${parts[1]}/${parts[0]}`; 
      }
      const d = new Date(dataIso);
      return new Date(d.getTime() + d.getTimezoneOffset() * 60000).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch { return null; }
  };

  const DIAS_SEMANA = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];

  const buscarDadosNoSupabase = async (currentConexaoId: string | null) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não logado");

    let cid = currentConexaoId;
    if (!cid) {
      const { data: conexao } = await supabase.from('conexoes').select('id').eq('usuario_id', user.id).in('status', ['aluno_ativo', 'aguardando_assinatura', 'pendente']).maybeSingle();
      if (conexao) cid = conexao.id;
    }

    const { data: programas, error: errTreinos } = await supabase
      .from('training_programs')
      .select(`
        id, name, objective, general_observation,
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
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (errTreinos && errTreinos.code !== 'PGRST116') throw errTreinos;
    
    let execucoes: any[] = [];
    if (programas && cid) {
      const { data: historico } = await supabase
         .from('treinos_execucoes')
         .select('treino_id')
         .eq('conexao_id', cid);
      if(historico) execucoes = historico;
    }

    return { cid, programa: programas, execucoes };
  };

  const processarDados = (programa: any, execucoes: any[]) => {
    let nomeRotina = programa?.name || "Planejamento Atual";
    if (nomeRotina.toLowerCase().includes("deload")) nomeRotina = "Planejamento Atual";

    let weeksSource = programa?.training_weeks || [];
    let legacyDays = programa?.workout_days || [];

    if (weeksSource.length === 0 && legacyDays.length > 0) {
      weeksSource = [{ id: 'legacy-week-1', name: 'Sua Rotina', start_date: null, end_date: null, general_notes: programa.general_observation || '', workout_days: legacyDays }];
    }

    if (weeksSource.length === 0) return { semanasMapeadas: [], total: 0, concluidosTotais: 0, semanaAtualCalculada: null, programNameTratado: nomeRotina };

    const sortedWeeks = weeksSource.sort((a: any, b: any) => {
       if(a.start_date && b.start_date) return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
       return a.name.localeCompare(b.name);
    });
    
    let sumTreinos = 0;
    let sumConcluidosGeral = 0;
    let weekAtualDetectada: string | null = null;
    const dataAtual = new Date();
    dataAtual.setHours(0, 0, 0, 0); 

    const semanasMapeadas: MappedWeek[] = sortedWeeks.map((week: any, index: number) => {
      const sortedDays = (week.workout_days || []).sort((a: any, b: any) => a.order_index - b.order_index);
      let concluidosNaSemana = 0;

      const diasMapeados: MappedDay[] = sortedDays.map((dia: any, idx: number) => {
        const completed = execucoes.some(exec => exec.treino_id === dia.id); 
        if (completed) { concluidosNaSemana++; sumConcluidosGeral++; }
        
        const diaSemana = DIAS_SEMANA[idx % 7];
        const feedbackDoTreino = dia.planned_exercises?.find((ex: any) => ex.public_note && ex.public_note.trim().length > 0)?.public_note || "";

        return {
          id: dia.id,
          nome: dia.name,
          objetivo: "Treinamento",
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
      
      let sDate = week.start_date || null;
      let eDate = week.end_date || null;

      if (!sDate || !eDate) {
          const inicioFicticio = new Date(dataAtual);
          inicioFicticio.setDate(inicioFicticio.getDate() + (index * 7)); 
          
          const fimFicticio = new Date(inicioFicticio);
          fimFicticio.setDate(fimFicticio.getDate() + 6); 

          sDate = inicioFicticio.toISOString().split('T')[0];
          eDate = fimFicticio.toISOString().split('T')[0];
      }
      
      if (!weekAtualDetectada) {
         if (sDate && eDate) {
             const start = new Date(sDate);
             const end = new Date(eDate);
             const startAdjusted = new Date(start.getTime() + start.getTimezoneOffset() * 60000);
             const endAdjusted = new Date(end.getTime() + end.getTimezoneOffset() * 60000);
             startAdjusted.setHours(0,0,0,0);
             endAdjusted.setHours(0,0,0,0);

             if (dataAtual >= startAdjusted && dataAtual <= endAdjusted) weekAtualDetectada = week.id;
         } else if (concluidosNaSemana < diasMapeados.length) {
             weekAtualDetectada = week.id;
         }
      }

      let tituloHierarquico = `${nomeRotina} | ${week.name}`;

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

    if (!weekAtualDetectada && semanasMapeadas.length > 0) weekAtualDetectada = semanasMapeadas[semanasMapeadas.length - 1].id;

    return { semanasMapeadas, total: sumTreinos, concluidosTotais: sumConcluidosGeral, semanaAtualCalculada: weekAtualDetectada, programNameTratado: nomeRotina };
  };

  const fetchDadosEAtualizarEstado = async () => {
    const result = await buscarDadosNoSupabase(conexaoId);
    setConexaoId(result.cid);
    
    if (result.programa) {
      let dbObjective = result.programa.objective || "Treinamento";
      if (dbObjective.toLowerCase().includes("deload")) {
          dbObjective = "Foco e Evolução";
      }
      setProgramObjective(dbObjective);
      setProgramLevel("Intermediário"); 
      
      const { semanasMapeadas, total, concluidosTotais, semanaAtualCalculada, programNameTratado } = processarDados(result.programa, result.execucoes);
      setProgramName(programNameTratado);
      setSemanas(semanasMapeadas);
      setTotalTreinos(total);
      setTreinosConcluidosGeral(concluidosTotais);
      setCurrentAutoWeekId(semanaAtualCalculada);
    } else {
      setProgramName("Planejamento Atual");
      setProgramObjective("Aguardando Rotina");
      setProgramLevel("");
      setSemanas([]);
    }
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
    navigation.navigate("WorkoutPreview", { treinoId, conexaoId });
  };

  const handleBack = () => {
    if (selectedWeekId) setSelectedWeekId(null);
    else navigation.goBack();
  };

  const activeWeek = selectedWeekId ? semanas.find(s => s.id === selectedWeekId) : null;
  const progressoPercentual = totalTreinos > 0 ? (treinosConcluidosGeral / totalTreinos) * 100 : 0;

  return {
    loading, refreshing, onRefresh,
    programName, programObjective, programLevel, semanas, totalTreinos, treinosConcluidosGeral, progressoPercentual,
    selectedWeekId, setSelectedWeekId, activeWeek, currentAutoWeekId,
    expandedFeedbackId, toggleFeedback,
    openWorkoutList, voltar: handleBack
  };
}