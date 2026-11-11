import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { supabase } from "../../../../services/supabase"; 

export function useFinalizacaoTreino(navigation: any, route: any) {
  const { tempoTotal = 0, conexaoId, treinoId, exercicios = [], dataInicio, sentiuDor } = route.params || {};

  const [treinoNome, setTreinoNome] = useState("Carregando...");
  const [salvando, setSalvando] = useState(false);
  
  const [intensidade, setIntensidade] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  let volumeCalculado = 0;
  let prsCalculados = 0;

  exercicios.forEach((ex: any) => {
    ex.series?.forEach((serie: any) => {
      if (serie.concluida) {
        const reps = Number(serie.reps_feitas) || 0;
        const carga = Number(serie.carga_feita) || 0;
        volumeCalculado += reps * carga;

        if (carga > Number(serie.carga_alvo || 0)) {
          prsCalculados += 1;
        }
      }
    });
  });

  const formatarTempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${mins}m ${segs}s`;
  };

  useEffect(() => {
    let isMounted = true;
    
    const buscarNomeTreino = async () => {
      if (!treinoId) return;
      const { data } = await supabase.from('workout_days').select('name').eq('id', treinoId).single();
      if (data && isMounted) setTreinoNome(data.name);
    };

    buscarNomeTreino();
    return () => { isMounted = false; };
  }, [treinoId]);

  const finalizarESalvar = async () => {
    if (!intensidade) {
        Alert.alert("Quase lá!", "Por favor, selecione como foi a intensidade do seu treino antes de finalizar.");
        return;
    }

    if (!conexaoId) {
        Alert.alert("Erro", "ID de conexão ausente. Não é possível salvar o treino.");
        return;
    }

    const mapaIntensidade: any = {
        "Leve": 1,
        "Moderado": 2,
        "Intenso": 3,
        "Máximo": 4
    };
    const rpeValorBanco = mapaIntensidade[intensidade] || 2; 

    setSalvando(true);
    try {
        const { error } = await supabase.from('treinos_execucoes').insert([{
          conexao_id: conexaoId,
          treino_id: treinoId,
          tempo_total_segundos: tempoTotal,
          volume_total_kg: volumeCalculado,
          dados_execucao: exercicios,
          esforco_rpe: rpeValorBanco, 
          sentiu_dor: sentiuDor || false,
          observacao_geral: feedback,
          data_inicio: dataInicio || new Date().toISOString(),
          data_fim: new Date().toISOString()
        }]);
        
        if (error) throw error; 
      
      navigation.popToTop(); 
    } catch (err: any) {
      console.error("Erro ao finalizar treino:", err);
      Alert.alert("Erro ao Salvar", err.message || "O banco de dados recusou o salvamento. Tente novamente.");
      setSalvando(false);
    }
  };

  return {
    treinoNome,
    salvando,
    tempoTotal: formatarTempo(tempoTotal),
    volumeTotal: `${volumeCalculado} kg`,
    prsBatidos: prsCalculados,
    intensidade, setIntensidade,
    feedback, setFeedback,
    finalizarESalvar
  };
}