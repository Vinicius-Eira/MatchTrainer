import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { supabase } from "../../../../services/supabase";

export function useWorkoutList(navigation: any, routeConexaoId?: string) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [treinos, setTreinos] = useState<any[]>([]);
  const [conexaoId, setConexaoId] = useState<string | null>(routeConexaoId || null);

  const buscarDadosNoSupabase = async (currentConexaoId: string | null) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não logado");

    let cid = currentConexaoId;

    if (!cid) {
      const { data: conexao, error: errConexao } = await supabase
        .from('conexoes')
        .select('id')
        .eq('usuario_id', user.id) 
        .in('status', ['aluno_ativo', 'aguardando_assinatura'])
        .single();

      if (errConexao || !conexao) throw new Error("Nenhuma conexão ativa encontrada.");
      cid = conexao.id;
    }

    const { data: treinosPrescritos, error: errTreinos } = await supabase
      .from('treinos_prescritos')
      .select(`
        id,
        nome,
        descricao_geral,
        treinos_exercicios (
          id,
          treinos_series_prescritas (id)
        ),
        treinos_execucoes (
          data_inicio
        )
      `)
      .eq('conexao_id', cid)
      .eq('ativo', true)
      .order('nome', { ascending: true }); 

    if (errTreinos) throw errTreinos;

    return { cid, treinosPrescritos };
  };

  const formatarTreinos = (treinosPrescritos: any[]) => {
    let treinosMapeados = treinosPrescritos.map((ficha: any) => {
      let totalSeries = 0;
      ficha.treinos_exercicios.forEach((ex: any) => {
        totalSeries += ex.treinos_series_prescritas?.length || 0;
      });

      let ultimaExecucaoData: Date | null = null;
      let ultimaExecucaoStr = "Nunca";
      let fezHoje = false;
      
      const hojeStr = new Date().toLocaleDateString('pt-BR');

      if (ficha.treinos_execucoes && ficha.treinos_execucoes.length > 0) {
        const execucoesOrdenadas = ficha.treinos_execucoes.sort(
          (a: any, b: any) => new Date(b.data_inicio).getTime() - new Date(a.data_inicio).getTime()
        );
        ultimaExecucaoData = new Date(execucoesOrdenadas[0].data_inicio);
        ultimaExecucaoStr = ultimaExecucaoData.toLocaleDateString('pt-BR');
        
        if (ultimaExecucaoStr === hojeStr) fezHoje = true;
      }

      return {
        id: ficha.id,
        nome: ficha.nome,
        objetivo: ficha.descricao_geral || "Foco em Metas",
        qtd_exercicios: ficha.treinos_exercicios.length,
        qtd_series: totalSeries,
        duracao_estimada: `${Math.max(30, ficha.treinos_exercicios.length * 8)} min`,
        ultimaExecucaoData, 
        ultima_execucao: ultimaExecucaoStr,
        fez_hoje: fezHoje,
        is_hoje: false, 
        status: "DISPONÍVEL"
      };
    });

    let dataMaisRecenteGlobal: Date | null = null;
    let indexUltimoTreinoFeito = -1;

    treinosMapeados.forEach((t: any, idx: number) => {
      if (t.ultimaExecucaoData) {
        if (!dataMaisRecenteGlobal || t.ultimaExecucaoData > dataMaisRecenteGlobal) {
          dataMaisRecenteGlobal = t.ultimaExecucaoData;
          indexUltimoTreinoFeito = idx;
        }
      }
    });

    let indexHoje = 0; 
    if (indexUltimoTreinoFeito !== -1) {
      indexHoje = indexUltimoTreinoFeito + 1;
      if (indexHoje >= treinosMapeados.length) {
        indexHoje = 0;
      }
    }

    treinosMapeados[indexHoje].is_hoje = true;
        if (treinosMapeados[indexHoje].fez_hoje) {
        treinosMapeados[indexHoje].status = "CONCLUÍDO 🔥";
    } else {
        treinosMapeados[indexHoje].status = "A FAZER";
    }

    return treinosMapeados;
  };

  useEffect(() => {
    let isMounted = true;

    const carregarInicial = async () => {
      try {
        const result = await buscarDadosNoSupabase(conexaoId);
        
        if (isMounted) {
          setConexaoId(result.cid);
          if (result.treinosPrescritos) {
            setTreinos(formatarTreinos(result.treinosPrescritos));
          }
        }
      } catch (error: any) {
        console.log("Erro ao buscar treinos (inicial):", error);
        if (isMounted) Alert.alert("Aviso", "Não encontramos treinos ativos ou seu personal ainda não enviou a ficha.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    carregarInicial();

    return () => {
      isMounted = false;
    };
  }, []); 

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const result = await buscarDadosNoSupabase(conexaoId);
      setConexaoId(result.cid);
      if (result.treinosPrescritos) {
        setTreinos(formatarTreinos(result.treinosPrescritos));
      }
    } catch (error: any) {
      console.log("Erro ao buscar treinos (refresh):", error);
      Alert.alert("Erro", "Não foi possível atualizar os treinos.");
    } finally {
      setRefreshing(false);
    }
  };

  const openWorkoutList = (treinoId: string) => {
    navigation.navigate("WorkoutPreview", { treinoId, conexaoId });
  };

  const voltar = () => navigation.goBack();

  return {
    loading,
    refreshing,
    onRefresh,
    treinos,
    openWorkoutList,
    voltar
  };
}