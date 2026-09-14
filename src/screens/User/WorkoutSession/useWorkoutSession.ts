import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { supabase } from "../../../services/supabase";

export function useWorkoutSession(navigation: any, route: any) {
  const { treinoId, conexaoId } = route.params || {};

  const [treinoInfo, setTreinoInfo] = useState({ id: "", nome: "Carregando..." });
  const [exercicios, setExercicios] = useState<any[]>([]);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [progressoBarra, setProgressoBarra] = useState(0);
  const [observacaoTreinoGeral, setObservacaoTreinoGeral] = useState("");

  const [tempoTotalTreino, setTempoTotalTreino] = useState(0);
  const [emDescanso, setEmDescanso] = useState(false);
  const [tempoDescansoRestante, setTempoDescansoRestante] = useState(0);
  
  const [dataInicio, setDataInicio] = useState(new Date().toISOString());

  const buscarTreinoParaExecucao = async () => {
    const { data, error } = await supabase
      .from("treinos_prescritos")
      .select(`
        id, nome,
        treinos_exercicios (
          id, ordem, descanso_segundos, observacao_personal,
          exercicios_dicionario (nome, grupo_muscular, midia_url),
          treinos_series_prescritas (id, numero_serie, reps_alvo, carga_alvo)
        )
      `)
      .eq("id", treinoId)
      .single();

    if (error) throw error;
    return data;
  };

  const prepararTreino = (ficha: any) => {
    setTreinoInfo({ id: ficha.id, nome: ficha.nome });

    const exerciciosOrdenados = ficha.treinos_exercicios.sort((a: any, b: any) => a.ordem - b.ordem);
    
    const formatado = exerciciosOrdenados.map((ex: any) => {
      const seriesOrdenadas = ex.treinos_series_prescritas.sort((a: any, b: any) => a.numero_serie - b.numero_serie);
      
      return {
        id: ex.id,
        nome: ex.exercicios_dicionario?.nome,
        grupo_muscular: ex.exercicios_dicionario?.grupo_muscular,
        imagem_url: ex.exercicios_dicionario?.midia_url,
        descanso: ex.descanso_segundos || 60,
        observacao_personal: ex.observacao_personal,
        observacao_aluno: "",
        series: seriesOrdenadas.map((s: any) => ({
          id: s.id,
          numero: s.numero_serie,
          reps_alvo: s.reps_alvo,
          carga_alvo: s.carga_alvo,
          reps_feitas: s.reps_alvo, 
          carga_feita: s.carga_alvo,
          concluida: false
        }))
      };
    });

    setExercicios(formatado);
    setDataInicio(new Date().toISOString());
  };

  useEffect(() => {
    let isMounted = true;
    buscarTreinoParaExecucao()
      .then(dados => { if (isMounted && dados) prepararTreino(dados); })
      .catch(err => console.log("Erro ao carregar execução:", err));
    return () => { isMounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treinoId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTempoTotalTreino(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    
    if (emDescanso && tempoDescansoRestante > 0) {
      timer = setInterval(() => {
        setTempoDescansoRestante(prev => prev - 1);
      }, 1000);
    } else if (emDescanso && tempoDescansoRestante <= 0) {
      setTimeout(() => {
        setEmDescanso(false);
      }, 0);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [emDescanso, tempoDescansoRestante]);

  const formatarTempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${mins.toString().padStart(2, "0")}:${segs.toString().padStart(2, "0")}`;
  };

  const pularDescanso = () => setEmDescanso(false);
  
  const focarExercicio = (index: number) => setIndiceAtual(index);

  const cancelarTreino = () => {
    Alert.alert("Cancelar Treino", "Tem certeza que deseja sair? O progresso não será salvo.", [
      { text: "Continuar Treinando", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => navigation.goBack() }
    ]);
  };

  const atualizarExecucaoSerie = (exIndex: number, sIndex: number, campo: 'reps_feitas' | 'carga_feita', valor: string) => {
    const novaLista = [...exercicios];
    novaLista[exIndex].series[sIndex][campo] = valor;
    setExercicios(novaLista);
  };

  const atualizarObservacaoAluno = (exIndex: number, valor: string) => {
    const novaLista = [...exercicios];
    novaLista[exIndex].observacao_aluno = valor;
    setExercicios(novaLista);
  };

  const concluirSerie = async (exIndex: number, sIndex: number) => {
    const novaLista = [...exercicios];
    novaLista[exIndex].series[sIndex].concluida = true;
    setExercicios(novaLista);

    let seriesTotais = 0;
    let seriesConcluidas = 0;
    novaLista.forEach(ex => {
      seriesTotais += ex.series.length;
      seriesConcluidas += ex.series.filter((s: any) => s.concluida).length;
    });
    
    setProgressoBarra((seriesConcluidas / seriesTotais) * 100);

    const isUltimaSerieDoExercicio = sIndex === novaLista[exIndex].series.length - 1;
    const isUltimoExercicio = exIndex === novaLista.length - 1;

    if (isUltimaSerieDoExercicio && isUltimoExercicio) {
      await finalizarTreinoNoBanco();
      return;
    }

    if (isUltimaSerieDoExercicio) {
      setIndiceAtual(exIndex + 1);
    }

    setTempoDescansoRestante(novaLista[exIndex].descanso);
    setEmDescanso(true);
  };

  const finalizarTreinoNoBanco = async () => {
    try {
      const { error } = await supabase
        .from('treinos_execucoes')
        .insert([{
          treino_id: treinoId,
          data_inicio: dataInicio
        }]);

      if (error) throw error;

      navigation.replace("WorkoutCompletion", { tempoTotal: tempoTotalTreino, conexaoId });
      
    } catch (error) {
      console.log("Erro ao salvar treino:", error);
      Alert.alert("Erro", "Houve um problema ao salvar seu histórico, mas seu treino foi excelente!");
      navigation.replace("WorkoutCompletion", { tempoTotal: tempoTotalTreino, conexaoId });
    }
  };

  return {
    treinoInfo, exercicios, indiceAtual, progressoBarra,
    emDescanso, tempoDescansoRestante, tempoTotalTreino,
    observacaoTreinoGeral, setObservacaoTreinoGeral,
    formatarTempo, atualizarExecucaoSerie, atualizarObservacaoAluno,
    focarExercicio, concluirSerie, pularDescanso, cancelarTreino
  };
}