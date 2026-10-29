import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { supabase } from "../../../../services/supabase";

export function useWorkoutPreview(navigation: any, route: any) {
  const { treinoId, conexaoId } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [treino, setTreino] = useState<any>(null);
  const [exercicios, setExercicios] = useState<any[]>([]);

  const buscarDetalhesDoTreino = async () => {
    if (!treinoId) throw new Error("ID do dia do treino não fornecido.");

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
          id,
          rest_seconds,
          sets,
          reps_target,
          weight_target,
          public_note,
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

    return { diaTreino, ultimaData: null };
  };

  const formatarDadosDoTreino = (diaSupabase: any, ultimaData: string | null) => {
    let totalSeriesGlobais = 0;
    
    const listaOriginal = diaSupabase.planned_exercises || [];
    
    const exerciciosFormatados = listaOriginal.map((ex: any) => {
      const numSeries = Number(ex.sets) || 0;
      totalSeriesGlobais += numSeries;

      return {
        id: ex.id,
        nome: ex.global_exercises?.name || "Exercício Customizado",
        grupo_muscular: ex.global_exercises?.muscle_group || "",
        imagem_url: ex.global_exercises?.gif_url || null,
        series: numSeries,
        reps_alvo: ex.reps_target || "--",
        carga_alvo: ex.weight_target || "--",
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

    const programaBase = diaSupabase.training_programs;

    const treinoFormatado = {
      nome: diaSupabase.name,
      objetivo: programaBase?.objective || "Treino Personalizado",
      observacao_geral: programaBase?.general_observation || null,
      total_series: totalSeriesGlobais,
      mensagem_hype: mensagemHype,
      duracao: `~ ${Math.max(30, exerciciosFormatados.length * 8)} min` 
    };

    return { treinoFormatado, exerciciosFormatados };
  };

  useEffect(() => {
    let isMounted = true;

    const carregarInicial = async () => {
      try {
        const { diaTreino, ultimaData } = await buscarDetalhesDoTreino();
        if (diaTreino && isMounted) {
          const { treinoFormatado, exerciciosFormatados } = formatarDadosDoTreino(diaTreino, ultimaData);
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
      const { diaTreino, ultimaData } = await buscarDetalhesDoTreino();
      if (diaTreino) {
        const { treinoFormatado, exerciciosFormatados } = formatarDadosDoTreino(diaTreino, ultimaData);
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
    navigation.navigate("WorkoutSession", { treinoId, conexaoId });
  };

  const voltar = () => {
    navigation.goBack();
  };

  return { loading, refreshing, onRefresh, treino, exercicios, iniciarTreino, voltar };
}