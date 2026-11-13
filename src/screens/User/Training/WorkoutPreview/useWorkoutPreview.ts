import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { supabase } from "../../../../services/supabase";

export function useWorkoutPreview(navigation: any, route: any) {
  const { treinoId, conexaoId } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [treino, setTreino] = useState<any>(null);
  const [exercicios, setExercicios] = useState<any[]>([]);
  const [realConexaoId, setRealConexaoId] = useState<string | null>(
    conexaoId && conexaoId !== "1" ? conexaoId : null
  );

  const extrairNumeroCarga = (val: any): number => {
    if (val === null || val === undefined) return 0;
    const limpo = String(val).replace(",", ".").replace(/[^0-9.]/g, "");
    const num = parseFloat(limpo);
    return isNaN(num) ? 0 : num;
  };

  const buscarDetalhesDoTreino = async () => {
    if (!treinoId) throw new Error("ID do dia do treino não fornecido.");

    let cid = realConexaoId;
    if (!cid) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: con } = await supabase
          .from("conexoes")
          .select("id")
          .eq("usuario_id", user.id)
          .in("status", ["aluno_ativo", "aguardando_assinatura", "pendente"])
          .order("criado_em", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (con) {
          cid = con.id;
          setRealConexaoId(con.id);
        }
      }
    }

    const { data: diaTreino, error: errDia } = await supabase
      .from('workout_days')
      .select(`
        id,
        name,
        training_programs (
          name,
          objective,
          general_observation
        ),
        planned_exercises (
          *,
          global_exercises (
            name,
            muscle_group,
            gif_url
          )
        )
      `)
      .eq('id', treinoId)
      .single();

    if (errDia) throw errDia;

    const listaPlanejados = diaTreino.planned_exercises || [];
    const exerciseIds = listaPlanejados.map((pe: any) => pe.exercise_id).filter(Boolean);

    let dicionarioCustom: any[] = [];
    if (exerciseIds.length > 0) {
      const { data: exData } = await supabase.from('exercises').select('*').in('id', exerciseIds);
      if (exData) dicionarioCustom = exData;
    }

    let historicoExecucoes: any[] = [];
    let ultimaData: string | null = null;

    if (cid) {
      const { data: execs } = await supabase
        .from("treinos_execucoes")
        .select("dados_execucao, data_inicio")
        .eq("treino_id", treinoId)
        .eq("conexao_id", cid)
        .order("data_inicio", { ascending: false })
        .limit(10);
          
      if (execs && execs.length > 0) {
        historicoExecucoes = execs;
        ultimaData = execs[0].data_inicio;
      }
    }

    return { diaTreino, dicionarioCustom, historicoExecucoes, ultimaData };
  };

  const formatarDadosDoTreino = (
    diaSupabase: any,
    dicionarioCustom: any[],
    historicoExecucoes: any[],
    ultimaData: string | null
  ) => {
    let totalSeriesGlobais = 0;
    const listaOriginal = diaSupabase.planned_exercises || [];
    
    const exerciciosFormatados = listaOriginal.map((ex: any) => {
      const numSeries = Number(ex.sets) || 0;
      totalSeriesGlobais += numSeries;

      const customData = dicionarioCustom.find((d: any) => d.id === ex.exercise_id) || {};
      const globalData = ex.global_exercises || {};

      const nomeExercicio =
        globalData.name || customData.name || customData.nome || customData.title ||
        ex.exercise_name || ex.name || "Exercício Customizado";

      const mediaUrl =
        globalData.gif_url || customData.gif_url || customData.video_url ||
        customData.thumbnail_url || customData.media_url || customData.image_url || null;

      const grupoMuscular =
        globalData.muscle_group || customData.muscle_group || ex.group_code || "";

      let maiorCargaHistorico = 0;
      let seriesUltimaExecucao: { numero: number; carga: string; isMax: boolean }[] = [];

      for (const exec of historicoExecucoes) {
        if (!exec.dados_execucao || !Array.isArray(exec.dados_execucao)) continue;

        const exHist = exec.dados_execucao.find(
          (he: any) => String(he.id) === String(ex.id) || he.nome === nomeExercicio
        );

        if (exHist && Array.isArray(exHist.series) && exHist.series.length > 0) {
          const seriesValidas = exHist.series
            .map((s: any, idx: number) => ({
              numero: s.numero || idx + 1,
              cargaNum: extrairNumeroCarga(s.carga_feita),
            }))
            .filter((s: any) => s.cargaNum > 0);

          seriesValidas.forEach((s: any) => {
            if (s.cargaNum > maiorCargaHistorico) {
              maiorCargaHistorico = s.cargaNum;
            }
          });

          if (seriesUltimaExecucao.length === 0 && seriesValidas.length > 0) {
            const maxDaSessao = Math.max(...seriesValidas.map((s: any) => s.cargaNum));
            seriesUltimaExecucao = seriesValidas.map((s: any) => ({
              numero: s.numero,
              carga: String(s.cargaNum),
              isMax: s.cargaNum === maxDaSessao && seriesValidas.length > 1
            }));
          }
        }
      }

      let cargaFinal = "--";
      if (maiorCargaHistorico > 0) {
        cargaFinal = `${maiorCargaHistorico} kg`;
      } else if (ex.weight_target && String(ex.weight_target).trim() !== "" && String(ex.weight_target) !== "0") {
        const wt = String(ex.weight_target).trim();
        cargaFinal = wt.toLowerCase().includes("kg") ? wt : `${wt} kg`;
      }

      return {
        id: ex.id,
        nome: nomeExercicio,
        grupo_muscular: grupoMuscular,
        imagem_url: mediaUrl,
        series: numSeries,
        reps_alvo: ex.reps_target || "--",
        carga_alvo: cargaFinal,
        series_historico: seriesUltimaExecucao,
        descanso: ex.rest_seconds || 60,
        observacao: ex.public_note || null
      };
    });

    let mensagemHype = "Novo treino! Estabeleça suas primeiras marcas.";
    if (ultimaData) {
      const dataUltima = new Date(ultimaData);
      const hoje = new Date();
      dataUltima.setHours(0, 0, 0, 0);
      hoje.setHours(0, 0, 0, 0);
      
      const diffTime = Math.abs(hoje.getTime() - dataUltima.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        mensagemHype = "Você já treinou esta ficha hoje! Modo insano ativado 🔥";
      } else {
        mensagemHype = `Você fez este treino há ${diffDays} dias. Tente bater suas cargas!`;
      }
    }

    const programaBase = Array.isArray(diaSupabase.training_programs)
      ? diaSupabase.training_programs[0]
      : diaSupabase.training_programs;

    const treinoFormatado = {
      nome: diaSupabase.name,
      objetivo: programaBase?.objective || "Treino Personalizado",
      observacao_geral: programaBase?.general_observation || null,
      total_series: totalSeriesGlobais,
      mensagem_hype: mensagemHype,
      duracao: `${Math.max(30, exerciciosFormatados.length * 8)} min` 
    };

    return { treinoFormatado, exerciciosFormatados };
  };

  useEffect(() => {
    let isMounted = true;

    const carregarInicial = async () => {
      try {
        const { diaTreino, dicionarioCustom, historicoExecucoes, ultimaData } = await buscarDetalhesDoTreino();
        if (diaTreino && isMounted) {
          const { treinoFormatado, exerciciosFormatados } = formatarDadosDoTreino(
            diaTreino,
            dicionarioCustom,
            historicoExecucoes,
            ultimaData
          );
          setTreino(treinoFormatado);
          setExercicios(exerciciosFormatados);
        }
      } catch (error: any) {
        console.log("Erro ao buscar detalhes do treino:", error);
        if (isMounted) {
          Alert.alert("Erro", "Não foi possível carregar os detalhes do treino.");
          navigation.goBack();
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    carregarInicial();

    return () => {
      isMounted = false;
    };
  }, [treinoId]);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      const { diaTreino, dicionarioCustom, historicoExecucoes, ultimaData } = await buscarDetalhesDoTreino();
      if (diaTreino) {
        const { treinoFormatado, exerciciosFormatados } = formatarDadosDoTreino(
          diaTreino,
          dicionarioCustom,
          historicoExecucoes,
          ultimaData
        );
        setTreino(treinoFormatado);
        setExercicios(exerciciosFormatados);
      }
    } catch (error) {
      console.log("Erro no refresh do preview:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const iniciarTreino = () => {
    navigation.navigate("WorkoutSession", { treinoId, conexaoId: realConexaoId || conexaoId });
  };

  const voltar = () => {
    navigation.goBack();
  };

  return { loading, refreshing, onRefresh, treino, exercicios, iniciarTreino, voltar };
}