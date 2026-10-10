import { useEffect, useState } from "react";
import { supabase } from "../../../../services/supabase"; 

export function useFinalizacaoTreino(navigation: any, route: any) {
  const { tempoTotal = 0, conexaoId, treinoId } = route.params || {};

  const [treinoNome, setTreinoNome] = useState("Treino Finalizado");

  const volumeTotal = "2.450 kg"; 
  const prsBatidos = 1;

  const formatarTempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${mins}m ${segs}s`;
  };

  useEffect(() => {
    let isMounted = true;
    
    const buscarNomeTreino = async () => {
      if (!treinoId) return;
      const { data } = await supabase
        .from('treinos_prescritos')
        .select('nome')
        .eq('id', treinoId)
        .single();
        
      if (data && isMounted) setTreinoNome(data.nome);
    };

    buscarNomeTreino();
    return () => { isMounted = false; };
  }, [treinoId]);

  const voltarAoInicio = () => {
    navigation.popToTop(); 
  };

  return {
    treinoNome,
    tempoTotal: formatarTempo(tempoTotal),
    volumeTotal,
    prsBatidos,
    voltarAoInicio
  };
}