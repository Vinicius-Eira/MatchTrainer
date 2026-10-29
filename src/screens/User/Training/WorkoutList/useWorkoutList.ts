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
}

export interface MappedWeek {
  id: string;
  nome: string;
  is_deload: boolean;
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
  const [activeTab, setActiveTab] = useState<'ROTINAS' | 'AEROBICO'>('ROTINAS');

  const formatarData = (dataIso?: string | null) => {
    if (!dataIso) return null;
    try {
      const d = new Date(dataIso);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch { return null; }
  };

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
          id, name, general_notes,
          workout_days ( id, name, order_index, planned_exercises ( id ) )
        ),
        workout_days (
          id, name, order_index,
          planned_exercises ( id )
        )
      `)
      .eq('student_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (errTreinos) throw errTreinos;
    return { cid, programa: programas };
  };

  const processarDados = (programa: any) => {
    let weeksSource = programa.training_weeks || [];
    let legacyDays = programa.workout_days || [];

    if (weeksSource.length === 0 && legacyDays.length > 0) {
      weeksSource = [{ id: 'legacy-week-1', name: 'Sua Ficha', general_notes: programa.general_observation || '', workout_days: legacyDays }];
    }

    if (weeksSource.length === 0) return { semanasMapeadas: [], total: 0, concluidosTotais: 0, semanaAtualCalculada: null };

    const sortedWeeks = weeksSource.sort((a: any, b: any) => a.name.localeCompare(b.name));
    let sumTreinos = 0;
    let sumConcluidosGeral = 0;
    let weekAtualDetectada: string | null = null;

    const semanasMapeadas: MappedWeek[] = sortedWeeks.map((week: any) => {
      const sortedDays = (week.workout_days || []).sort((a: any, b: any) => a.order_index - b.order_index);
      let concluidosNaSemana = 0;

      const diasMapeados: MappedDay[] = sortedDays.map((dia: any) => {
        const completed = false; 
        if (completed) { concluidosNaSemana++; sumConcluidosGeral++; }
        
        return {
          id: dia.id,
          nome: dia.name,
          objetivo: dia.name.includes("A") || dia.name.includes("B") ? dia.name : "Treino " + (dia.order_index + 1),
          qtd_exercicios: dia.planned_exercises?.length || 0,
          qtd_series: (dia.planned_exercises?.length || 0) * 3, 
          duracao_estimada: `${Math.max(30, (dia.planned_exercises?.length || 0) * 8)} min`,
          is_completed: completed,
          week_id: week.id
        };
      });

      sumTreinos += diasMapeados.length;
      if (!weekAtualDetectada && concluidosNaSemana < diasMapeados.length) {
        weekAtualDetectada = week.id;
      }

      const sDate = (week as any).start_date || null;
      const eDate = (week as any).end_date || null;

      return {
        id: week.id,
        nome: week.name,
        is_deload: week.name.toLowerCase().includes('deload'),
        start_date: sDate,
        end_date: eDate,
        date_range_formatted: sDate && eDate ? `${formatarData(sDate)} — ${formatarData(eDate)}` : null,
        general_notes: week.general_notes || "",
        qtd_treinos: diasMapeados.length,
        qtd_concluidos: concluidosNaSemana,
        dias: diasMapeados
      };
    });

    if (!weekAtualDetectada && semanasMapeadas.length > 0) weekAtualDetectada = semanasMapeadas[semanasMapeadas.length - 1].id;

    return { semanasMapeadas, total: sumTreinos, concluidosTotais: sumConcluidosGeral, semanaAtualCalculada: weekAtualDetectada };
  };

  const fetchDadosEAtualizarEstado = async () => {
    const result = await buscarDadosNoSupabase(conexaoId);
    setConexaoId(result.cid);
    
    if (result.programa) {
      setProgramName(result.programa.name || "");
      setProgramObjective(result.programa.objective || "Treinamento");
      
      setProgramLevel("Nível Intermediário"); 
      
      const { semanasMapeadas, total, concluidosTotais, semanaAtualCalculada } = processarDados(result.programa);
      setSemanas(semanasMapeadas);
      setTotalTreinos(total);
      setTreinosConcluidosGeral(concluidosTotais);
      setCurrentAutoWeekId(semanaAtualCalculada);

      if (semanasMapeadas.length === 1) {
          setSelectedWeekId(semanasMapeadas[0].id);
      }
    } else {
      setProgramObjective("Aguardando Ficha");
      setProgramLevel("");
      setSemanas([]);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const carregarInicial = async () => {
      try { await fetchDadosEAtualizarEstado(); } 
      catch (error: any) { console.log("Erro ao buscar treinos:", error); } 
      finally { if (isMounted) setLoading(false); }
    };
    carregarInicial();
    return () => { isMounted = false; };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try { await fetchDadosEAtualizarEstado(); } 
    finally { setRefreshing(false); }
  };

  const openWorkoutList = (treinoId: string) => {
    navigation.navigate("WorkoutPreview", { treinoId, conexaoId });
  };

  const handleBack = () => {
    if (selectedWeekId && semanas.length > 1) setSelectedWeekId(null);
    else navigation.goBack();
  };

  const activeWeek = selectedWeekId ? semanas.find(s => s.id === selectedWeekId) : null;
  const progressoPercentual = totalTreinos > 0 ? (treinosConcluidosGeral / totalTreinos) * 100 : 0;

  return {
    loading, refreshing, onRefresh,
    programName, programObjective, programLevel, semanas, totalTreinos, treinosConcluidosGeral, progressoPercentual,
    selectedWeekId, setSelectedWeekId, activeWeek, currentAutoWeekId,
    activeTab, setActiveTab,
    openWorkoutList, voltar: handleBack
  };
}