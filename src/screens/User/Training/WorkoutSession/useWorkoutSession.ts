import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { supabase } from "../../../../services/supabase";

export function useWorkoutSession(navigation: any, route: any) {
  const { treinoId, conexaoId } = route.params || {};

  const [treinoInfo, setTreinoInfo] = useState({ id: "", nome: "Carregando..." });
  const [exercicios, setExercicios] = useState<any[]>([]);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [progressoBarra, setProgressoBarra] = useState(0);
  const [observacaoTreinoGeral, setObservacaoTreinoGeral] = useState("");
  
  const [nivelEsforco, setNivelEsforco] = useState<number | null>(null); 
  const [sentiuDor, setSentiuDor] = useState<boolean | null>(null); 
  const [mostrarFinalizacao, setMostrarFinalizacao] = useState(false);

  const [tempoTotalTreino, setTempoTotalTreino] = useState(0);
  const [emDescanso, setEmDescanso] = useState(false);
  const [tempoDescansoRestante, setTempoDescansoRestante] = useState(0);
  const [dataInicio, setDataInicio] = useState(new Date().toISOString());

  const [modalDorVisivel, setModalDorVisivel] = useState(false);
  const [exercicioDorId, setExercicioDorId] = useState<string>("");

  const abrirModalDor = (exId: string) => {
    setExercicioDorId(exId);
    setModalDorVisivel(true);
  };

  const fecharModalDor = () => {
    setModalDorVisivel(false);
    setExercicioDorId("");
  };

  const handleDorRegistradaSucesso = () => {
    setSentiuDor(true);
    fecharModalDor();
    Alert.alert("Registrado", "O personal será notificado sobre esse desconforto para avaliar seu movimento.");
  };

  const buscarTreinoParaExecucao = async () => {
    const { data: prescricao, error: errPrescricao } = await supabase
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

    if (errPrescricao) throw errPrescricao;

    const { data: ultimaExecucao } = await supabase
      .from("treinos_execucoes")
      .select("dados_execucao")
      .eq("treino_id", treinoId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return { prescricao, ultimaExecucao: ultimaExecucao?.dados_execucao || null };
  };

  const prepararTreino = ({ prescricao, ultimaExecucao }: any) => {
    setTreinoInfo({ id: prescricao.id, nome: prescricao.nome });

    const exerciciosOrdenados = prescricao.treinos_exercicios.sort((a: any, b: any) => a.ordem - b.ordem);
    
    const formatado = exerciciosOrdenados.map((ex: any) => {
      const seriesOrdenadas = ex.treinos_series_prescritas.sort((a: any, b: any) => a.numero_serie - b.numero_serie);
      
      const historicoExercicio = ultimaExecucao ? ultimaExecucao.find((he: any) => he.nome === ex.exercicios_dicionario?.nome) : null;

      return {
        id: ex.id,
        nome: ex.exercicios_dicionario?.nome,
        grupo_muscular: ex.exercicios_dicionario?.grupo_muscular,
        imagem_url: ex.exercicios_dicionario?.midia_url,
        descanso: ex.descanso_segundos || 60,
        observacao_personal: ex.observacao_personal,
        observacao_aluno: "",
        series: seriesOrdenadas.map((s: any, sIdx: number) => {
          
          const cargaAnterior = historicoExercicio?.series?.[sIdx]?.carga_feita || null;
          const repsAnteriores = historicoExercicio?.series?.[sIdx]?.reps_feitas || null;

          return {
            id: s.id,
            numero: s.numero_serie,
            reps_alvo: s.reps_alvo,
            carga_alvo: s.carga_alvo,
            reps_feitas: s.reps_alvo, 
            carga_feita: cargaAnterior ? cargaAnterior : s.carga_alvo, 
            carga_historico: cargaAnterior, 
            reps_historico: repsAnteriores,
            concluida: false
          };
        })
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
  }, [treinoId]);

  useEffect(() => {
    const timer = setInterval(() => { setTempoTotalTreino(prev => prev + 1); }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (emDescanso && tempoDescansoRestante > 0) {
      timer = setInterval(() => { setTempoDescansoRestante(prev => prev - 1); }, 1000);
    } else if (emDescanso && tempoDescansoRestante <= 0) {
      setTimeout(() => { setEmDescanso(false); }, 0);
    }
    return () => { if (timer) clearInterval(timer); };
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

  const concluirSerie = (exIndex: number, sIndex: number) => {
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
      setMostrarFinalizacao(true);
      return;
    }

    if (isUltimaSerieDoExercicio) {
      setIndiceAtual(exIndex + 1);
    }

    setTempoDescansoRestante(novaLista[exIndex].descanso);
    setEmDescanso(true);
  };

  const finalizarTreinoNoBanco = async () => {
    if (nivelEsforco === null || sentiuDor === null) {
        return Alert.alert("Atenção", "Por favor, indique seu nível de esforço e se sentiu alguma dor antes de finalizar.");
    }

    try {
      const jsonExecucao = exercicios.map(ex => ({
          nome: ex.nome,
          observacao_aluno: ex.observacao_aluno,
          series: ex.series.map((s: any) => ({
              numero: s.numero,
              reps_feitas: s.reps_feitas,
              carga_feita: s.carga_feita
          }))
      }));

      const { error } = await supabase
        .from('treinos_execucoes')
        .insert([{
          treino_id: treinoId,
          data_inicio: dataInicio,
          tempo_total_segundos: tempoTotalTreino,
          esforco_rpe: nivelEsforco, 
          sentiu_dor: sentiuDor, 
          observacao_geral: observacaoTreinoGeral,
          dados_execucao: jsonExecucao 
        }]);

      if (error) throw error;

      navigation.replace("WorkoutCompletion", { tempoTotal: tempoTotalTreino, conexaoId, dor: sentiuDor });
      
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
    mostrarFinalizacao, nivelEsforco, setNivelEsforco, sentiuDor, setSentiuDor,
    modalDorVisivel, exercicioDorId, abrirModalDor, fecharModalDor, handleDorRegistradaSucesso,
    formatarTempo, atualizarExecucaoSerie, atualizarObservacaoAluno,
    focarExercicio, concluirSerie, pularDescanso, cancelarTreino, finalizarTreinoNoBanco
  };
}