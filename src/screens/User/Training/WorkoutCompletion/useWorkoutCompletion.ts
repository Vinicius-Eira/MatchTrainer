import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { supabase } from "../../../../services/supabase"; 

export function useFinalizacaoTreino(navigation: any, route: any) {
  const { tempoTotal = 0, conexaoId, treinoId, exercicios = [] } = route.params || {};

  const [treinoNome, setTreinoNome] = useState("Carregando...");
  const [salvando, setSalvando] = useState(false);
  
  // NOVOS ESTADOS PARA O FEEDBACK
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

        if (carga > Number(serie.carga_alvo)) {
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
    // Obriga o aluno a escolher a intensidade
    if (!intensidade) {
        Alert.alert("Quase lá!", "Por favor, selecione como foi a intensidade do seu treino antes de finalizar.");
        return;
    }

    setSalvando(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
         await supabase.from('treinos_execucoes').insert([{
           workout_day_id: treinoId,
           student_id: user.id,
           duracao_segundos: tempoTotal,
           volume_total: volumeCalculado,
           dados_execucao: exercicios,
           nivel_esforco: intensidade, // Enviando a intensidade
           observacoes: feedback,      // Enviando o comentário
           data_inicio: new Date().toISOString()
         }]);
      }
      
      // Salva e volta para a Home
      navigation.popToTop(); 
    } catch (err) {
      console.error("Erro ao finalizar treino:", err);
      Alert.alert("Erro", "Não foi possível sincronizar o treino. Tente novamente.");
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