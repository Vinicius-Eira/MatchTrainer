import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { supabase } from "../../../services/supabase"; // Ajuste o caminho se necessário

export function useFinalizacaoTreino(navigation: any, route: any) {
  const { tempoTotal = 0, conexaoId, treinoId } = route.params || {};

  const [treinoNome, setTreinoNome] = useState("Treino Finalizado");
  const [salvando, setSalvando] = useState(false);
  const [esforco, setEsforco] = useState(0);
  const [observacao, setObservacao] = useState("");

  const volumeTotal = "2.450 kg"; 
  const prsBatidos = 1;

  const niveisEsforco = [
    { id: 1, label: "Leve", sub: "Sem suor", icon: "happy-outline", cor: "#00E676" },
    { id: 2, label: "Moderado", sub: "Suor leve", icon: "walk-outline", cor: "#FFB300" },
    { id: 3, label: "Difícil", sub: "Ofegante", icon: "flame-outline", cor: "#FF6B00" },
    { id: 4, label: "Máximo", sub: "Falha total", icon: "skull-outline", cor: "#D50000" }
  ];

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

  const finalizarESalvar = async () => {
    if (esforco === 0) {
      Alert.alert("Feedback", "Por favor, selecione o nível de esforço do treino.");
      return;
    }

    setSalvando(true);
    try {
      const { data: ultimasExecucoes } = await supabase
        .from('treinos_execucoes')
        .select('id')
        .order('data_inicio', { ascending: false })
        .limit(1);

      if (ultimasExecucoes && ultimasExecucoes.length > 0) {
        const execucaoId = ultimasExecucoes[0].id;

        const { error } = await supabase
          .from('treinos_execucoes')
          .update({
            duracao_segundos: tempoTotal,
            nivel_esforco: esforco,
            observacao_aluno: observacao
          })
          .eq('id', execucaoId);

        if (error) throw error;
      }

      navigation.popToTop(); 

    } catch (error) {
      console.log("Erro ao salvar feedback:", error);
      Alert.alert("Erro", "Não foi possível salvar seu feedback, mas seu treino foi registrado!");
      navigation.popToTop();
    } finally {
      setSalvando(false);
    }
  };

  return {
    treinoNome,
    tempoTotal: formatarTempo(tempoTotal),
    volumeTotal,
    prsBatidos,
    esforco,
    setEsforco,
    niveisEsforco,
    observacao,
    setObservacao,
    salvando,
    finalizarESalvar
  };
}