import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { supabase } from "../../../services/supabase"; // Ajuste o caminho se necessário

export function useWorkoutPreview(navigation: any, route: any) {
  const { treinoId, conexaoId } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [treino, setTreino] = useState<any>(null);
  const [exercicios, setExercicios] = useState<any[]>([]);

  const buscarDetalhesDoTreino = async () => {
    if (!treinoId) throw new Error("ID do treino não fornecido.");

    const { data: ficha, error: errFicha } = await supabase
      .from('treinos_prescritos')
      .select(`
        id,
        nome,
        descricao_geral,
        treinos_exercicios (
          id,
          ordem,
          descanso_segundos,
          observacao_personal,
          exercicios_dicionario (
            nome,
            grupo_muscular,
            midia_url
          ),
          treinos_series_prescritas (
            numero_serie,
            reps_alvo,
            carga_alvo
          )
        )
      `)
      .eq('id', treinoId)
      .single();

    if (errFicha) throw errFicha;
    return ficha;
  };

  const formatarDadosDoTreino = (fichaSupabase: any) => {
    let totalSeriesGlobais = 0;
    const exerciciosOrdenados = fichaSupabase.treinos_exercicios.sort((a: any, b: any) => a.ordem - b.ordem);

    const exerciciosFormatados = exerciciosOrdenados.map((ex: any) => {
      const seriesOrdenadas = ex.treinos_series_prescritas.sort((sa: any, sb: any) => sa.numero_serie - sb.numero_serie);
      const numSeries = seriesOrdenadas.length;
      totalSeriesGlobais += numSeries;

      const repsAlvoVisual = seriesOrdenadas.length > 0 ? seriesOrdenadas[0].reps_alvo : "--";
      const cargaAlvoVisual = seriesOrdenadas.length > 0 ? seriesOrdenadas[0].carga_alvo : "--";

      return {
        id: ex.id,
        nome: ex.exercicios_dicionario?.nome || "Exercício sem nome",
        grupo_muscular: ex.exercicios_dicionario?.grupo_muscular || "",
        imagem_url: ex.exercicios_dicionario?.midia_url || null,
        series: numSeries,
        reps_alvo: repsAlvoVisual,
        carga_alvo: cargaAlvoVisual,
        descanso: ex.descanso_segundos || 60,
        observacao: ex.observacao_personal || null
      };
    });

    const treinoFormatado = {
      nome: fichaSupabase.nome,
      objetivo: fichaSupabase.descricao_geral || "Treino Personalizado",
      observacao_geral: null,
      total_series: totalSeriesGlobais,
      duracao: `${Math.max(30, exerciciosFormatados.length * 8)} min`
    };

    return { treinoFormatado, exerciciosFormatados };
  };

  useEffect(() => {
    let isMounted = true;

    const carregarInicial = async () => {
      try {
        const ficha = await buscarDetalhesDoTreino();
        if (ficha && isMounted) {
          const { treinoFormatado, exerciciosFormatados } = formatarDadosDoTreino(ficha);
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
      const ficha = await buscarDetalhesDoTreino();
      if (ficha) {
        const { treinoFormatado, exerciciosFormatados } = formatarDadosDoTreino(ficha);
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

  return {
    loading,
    refreshing,
    onRefresh,
    treino,
    exercicios,
    iniciarTreino,
    voltar
  };
}