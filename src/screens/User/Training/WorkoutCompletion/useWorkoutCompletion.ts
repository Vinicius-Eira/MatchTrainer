import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { supabase } from "../../../../services/supabase"; 

const extrairNumero = (val: any): number => {
  if (val === null || val === undefined) return 0;
  const match = String(val).replace(",", ".").match(/[0-9]+(\.[0-9]+)?/);
  return match ? parseFloat(match[0]) : 0;
};

const formatarTempo = (segundos: number) => {
  const mins = Math.floor(segundos / 60);
  const segs = segundos % 60;
  return `${mins}m ${segs}s`;
};

export function useFinalizacaoTreino(navigation: any, route: any) {
  const { tempoTotal = 0, conexaoId, treinoId, exercicios = [], dataInicio, sentiuDor } = route.params || {};

  const [treinoNome, setTreinoNome] = useState("Carregando...");
  const [salvando, setSalvando] = useState(false);
  const [realConexaoId, setRealConexaoId] = useState<string | null>(
    conexaoId && conexaoId !== "1" ? conexaoId : null
  );
  
  const [intensidade, setIntensidade] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  const metricasCalculadas = useMemo(() => {
    const listaExercicios = Array.isArray(exercicios) ? exercicios : [];

    const resumo = listaExercicios.map((ex: any) => {
      const listaSeries = Array.isArray(ex.series) ? ex.series : [];

      let maiorCargaEx = 0;
      let seriesFeitasEx = 0;
      let volumeEx = 0;
      const partesSeries: string[] = [];

      for (let idx = 0; idx < listaSeries.length; idx++) {
        const serie = listaSeries[idx];
        const carga = extrairNumero(serie.carga_feita);
        const reps = extrairNumero(serie.reps_feitas || serie.reps_alvo) || 10;

        if (serie.concluida) {
          seriesFeitasEx += 1;
          volumeEx += reps * carga;
        }

        if (carga > 0) {
          if (carga > maiorCargaEx) maiorCargaEx = carga;
          partesSeries.push(`S${serie.numero || idx + 1}: ${carga}kg`);
        }
      }

      return {
        id: ex.id,
        nome: ex.nome || "Exercício",
        maiorCarga: maiorCargaEx,
        seriesPlanejadas: listaSeries.length,
        seriesConcluidas: seriesFeitasEx,
         seriesFeitas: seriesFeitasEx || listaSeries.length,
        volumeEx,
        cargasPorSerieTexto: partesSeries.length > 0 ? partesSeries.join("  •  ") : null,
        observacaoAluno:
          ex.observacao_aluno && String(ex.observacao_aluno).trim().length > 0
            ? String(ex.observacao_aluno).trim()
            : null,
        relatoDor: Boolean(ex.relato_dor)
      };
    });

    let volumeTotalCalc = 0;
    let maiorCargaGlobalCalc = 0;
    let totalPlanejadasCalc = 0;
    let totalConcluidasCalc = 0;
    let teveDorCalc = Boolean(sentiuDor);

    for (let i = 0; i < resumo.length; i++) {
      const item = resumo[i];
      volumeTotalCalc += item.volumeEx;
      totalPlanejadasCalc += item.seriesPlanejadas;
      totalConcluidasCalc += item.seriesConcluidas;
      if (item.maiorCarga > maiorCargaGlobalCalc) {
        maiorCargaGlobalCalc = item.maiorCarga;
      }
      if (item.relatoDor) {
        teveDorCalc = true;
      }
    }

    const concluidasExibicao = totalConcluidasCalc > 0 ? totalConcluidasCalc : totalPlanejadasCalc;

    return {
      resumoExercicios: resumo,
      volumeCalculado: Math.round(volumeTotalCalc),
      maiorCargaGlobal: maiorCargaGlobalCalc,
      seriesResumo: `${concluidasExibicao}/${totalPlanejadasCalc}`,
      teveAlgumRelatoDor: teveDorCalc
    };
  }, [exercicios, sentiuDor]);

  useEffect(() => {
    let isMounted = true;

    const buscarDadosIniciais = async () => {
      let cidEncontrado: string | null = null;

      if (!conexaoId || conexaoId === "1") {
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
          if (con) cidEncontrado = con.id;
        }
      }

      let nomeEncontrado: string | null = null;
      if (treinoId) {
        const { data } = await supabase
          .from("workout_days")
          .select("name")
          .eq("id", treinoId)
          .maybeSingle();
        if (data?.name) nomeEncontrado = data.name;
      }

      return { cidEncontrado, nomeEncontrado };
    };

    buscarDadosIniciais()
      .then(({ cidEncontrado, nomeEncontrado }) => {
        if (!isMounted) return;
        if (cidEncontrado) setRealConexaoId(cidEncontrado);
        if (nomeEncontrado) setTreinoNome(nomeEncontrado);
      })
      .catch((err) => console.log("Erro ao carregar finalização:", err));

    return () => {
      isMounted = false;
    };
  }, [treinoId, conexaoId]);

  const finalizarESalvar = async () => {
    if (!intensidade) {
      Alert.alert("Quase lá!", "Por favor, selecione como foi a intensidade do seu treino antes de finalizar.");
      return;
    }

    const cidFinal = realConexaoId || conexaoId;
    if (!cidFinal || cidFinal === "1") {
      Alert.alert("Erro", "ID de conexão ausente. Não é possível salvar o treino.");
      return;
    }

    const mapaIntensidade: Record<string, number> = {
      "Leve": 4,
      "Moderado": 7,
      "Intenso": 8,
      "Máximo": 10
    };
    const rpeValorBanco = mapaIntensidade[intensidade] || 7; 

    const exerciciosParaSalvar = (exercicios || []).map((ex: any) => ({
      ...ex,
      observacao_aluno: ex.observacao_aluno ? String(ex.observacao_aluno).trim() : "",
      series: (ex.series || []).map((s: any) => ({
        ...s,
        concluida: s.concluida || extrairNumero(s.carga_feita) > 0
      }))
    }));

    setSalvando(true);
    try {
      const { error } = await supabase.from('treinos_execucoes').insert([{
        conexao_id: cidFinal,
        treino_id: treinoId,
        tempo_total_segundos: tempoTotal,
        volume_total_kg: metricasCalculadas.volumeCalculado,
        dados_execucao: exerciciosParaSalvar,
        esforco_rpe: rpeValorBanco, 
        sentiu_dor: metricasCalculadas.teveAlgumRelatoDor,
        observacao_geral: feedback.trim(),
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
    seriesResumo: metricasCalculadas.seriesResumo,
    maiorCargaTreino: metricasCalculadas.maiorCargaGlobal > 0 ? `${metricasCalculadas.maiorCargaGlobal} kg` : "--",
    volumeTotal: `${metricasCalculadas.volumeCalculado} kg`,
    resumoExercicios: metricasCalculadas.resumoExercicios,
    intensidade,
    setIntensidade,
    feedback,
    setFeedback,
    finalizarESalvar
  };
}