import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { supabase } from "../../../../services/supabase"; 

export function useWorkoutSession(navigation: any, route: any) {
  const { treinoId, conexaoId } = route.params || {};

  const [realConexaoId, setRealConexaoId] = useState<string | null>(
    conexaoId && conexaoId !== "1" ? conexaoId : null
  );
  const [treinoInfo, setTreinoInfo] = useState({ id: "", nome: "Carregando..." });
  const [exercicios, setExercicios] = useState<any[]>([]);
  const [progressoBarra, setProgressoBarra] = useState(0);
  const [observacaoTreinoGeral, setObservacaoTreinoGeral] = useState("");
  
  const [nivelEsforco, setNivelEsforco] = useState<number | null>(null); 
  const [sentiuDor, setSentiuDor] = useState<boolean>(false); 
  const [mostrarFinalizacao, setMostrarFinalizacao] = useState(false);

  const [tempoTotalTreino, setTempoTotalTreino] = useState(0);
  const [emDescanso, setEmDescanso] = useState(false);
  const [tempoDescansoRestante, setTempoDescansoRestante] = useState(0);
  const [dataInicio, setDataInicio] = useState(new Date().toISOString());

  const [modalDorVisivel, setModalDorVisivel] = useState(false);
  const [exercicioDorId, setExercicioDorId] = useState<string>("");
  const [exercicioDorNome, setExercicioDorNome] = useState<string>("");

  const abrirModalDor = (exId: string, exNome: string) => {
    setExercicioDorId(exId);
    setExercicioDorNome(exNome);
    setModalDorVisivel(true);
  };

  const fecharModalDor = () => {
    setModalDorVisivel(false);
    setExercicioDorId("");
    setExercicioDorNome("");
  };

  const handleDorRegistradaSucesso = () => {
    setSentiuDor(true);
    
    const novaLista = [...exercicios];
    const index = novaLista.findIndex(e => e.id === exercicioDorId);
    if (index !== -1) {
      novaLista[index].relato_dor = true;
      setExercicios(novaLista);
    }
  };

  const buscarTreinoParaExecucao = async () => {
    let cid = conexaoId && conexaoId !== "1" ? conexaoId : null;
    if (!cid) {
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
        if (con) {
          cid = con.id;
        }
      }
    }

    const { data: diaTreino, error: errDia } = await supabase
      .from('workout_days')
      .select(`id, name, planned_exercises (*)`)
      .eq('id', treinoId)
      .single();

    if (errDia) throw errDia;

    const listaPlanejados = diaTreino.planned_exercises || [];
    
    const exerciseIds = listaPlanejados.map((pe: any) => pe.exercise_id).filter(Boolean);
    const globalExerciseIds = listaPlanejados.map((pe: any) => pe.global_exercise_id).filter(Boolean);

    let dicionario: any[] = [];
    
    if (exerciseIds.length > 0) {
      const { data: exData } = await supabase.from('exercises').select('*').in('id', exerciseIds);
      if (exData) dicionario = [...dicionario, ...exData];
    }
    
    if (globalExerciseIds.length > 0) {
      const { data: globalData } = await supabase.from('global_exercises').select('*').in('id', globalExerciseIds);
      if (globalData) dicionario = [...dicionario, ...globalData];
    }

    let historicoDesteTreino: any = null;
    
    if (cid) {
      const { data: execucaoAnterior } = await supabase
        .from("treinos_execucoes")
        .select("dados_execucao")
        .eq("treino_id", treinoId) 
        .eq("conexao_id", cid) 
        .order("data_inicio", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (execucaoAnterior) {
        historicoDesteTreino = execucaoAnterior;
      }
    }

    return { cid, diaTreino, dicionario, historicoDesteTreino };
  };

  const prepararTreino = ({ cid, diaTreino, dicionario, historicoDesteTreino }: any) => {
    if (cid) setRealConexaoId(cid);
    setTreinoInfo({ id: diaTreino.id, nome: diaTreino.name });
    const listaOriginal = diaTreino.planned_exercises || [];
    
    const formatado = listaOriginal.map((ex: any) => {
      const libData = dicionario.find((d: any) => d.id === ex.exercise_id || d.id === ex.global_exercise_id) || {};

      const nomeOriginal = 
        libData.name || libData.nome || libData.title || 
        ex.exercise_name || ex.name || ex.nome || ex.title || "Exercício";

      const mediaUrl = 
        libData.gif_url || libData.video_url || libData.thumbnail_url || 
        libData.media_url || libData.image_url || ex.custom_media_url || null;

      const cargaAlvoPadrao = ex.weight_target ? String(ex.weight_target) : "";
      let observacaoAluno = "";
      let seriesHistoricoAntigo: any[] = [];
      
      if (historicoDesteTreino && Array.isArray(historicoDesteTreino.dados_execucao)) {
        const exercicioNoHistorico = historicoDesteTreino.dados_execucao.find(
          (he: any) => String(he.id) === String(ex.id) || he.nome === nomeOriginal
        );
        if (exercicioNoHistorico) {
          if (Array.isArray(exercicioNoHistorico.series)) {
            seriesHistoricoAntigo = exercicioNoHistorico.series;
          }
          if (exercicioNoHistorico.observacao_aluno) {
            observacaoAluno = exercicioNoHistorico.observacao_aluno;
          }
        }
      }
      
      const numSeries = Number(ex.sets) || 0;
      const arrayDeSeries = Array.from({ length: numSeries }).map((_, sIdx) => {
        let valorTempo = "--";
        if (ex.rest_seconds) valorTempo = String(ex.rest_seconds);
        else if (ex.time_target) valorTempo = ex.time_target;
        else if (ex.tempo) valorTempo = ex.tempo;

        const serieAntigaCorrespondente = seriesHistoricoAntigo[sIdx] || seriesHistoricoAntigo[0];
        let cargaInicialSerie = cargaAlvoPadrao;
        if (
          serieAntigaCorrespondente?.carga_feita &&
          String(serieAntigaCorrespondente.carga_feita).trim() !== "" &&
          String(serieAntigaCorrespondente.carga_feita) !== "0"
        ) {
          cargaInicialSerie = String(serieAntigaCorrespondente.carga_feita);
        }

        return {
          id: `${ex.id}-serie-${sIdx + 1}`,
          numero: sIdx + 1,
          tempo_alvo: valorTempo, 
          reps_alvo: ex.reps_target || "--",
          carga_alvo: ex.weight_target || "", 
          reps_feitas: ex.reps_target || "0", 
          carga_feita: cargaInicialSerie, 
          concluida: false
        };
      });

      return {
        id: ex.id,
        nome: nomeOriginal,
        grupo_muscular: libData.muscle_group || ex.group_code || "Geral",
        imagem_url: mediaUrl, 
        descanso: ex.rest_seconds || 60,
        observacao_personal: ex.public_note || null,
        observacao_aluno: observacaoAluno, 
        relato_dor: false,
        series: arrayDeSeries
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
    setTempoDescansoRestante(novaLista[exIndex].descanso);
    setEmDescanso(true);
  };

  return {
    conexaoId: realConexaoId || conexaoId, 
    treinoInfo, exercicios, progressoBarra,
    emDescanso, tempoDescansoRestante, tempoTotalTreino,
    observacaoTreinoGeral, setObservacaoTreinoGeral,
    mostrarFinalizacao, setMostrarFinalizacao, nivelEsforco, setNivelEsforco, sentiuDor, setSentiuDor,
    modalDorVisivel, exercicioDorId, exercicioDorNome, abrirModalDor, fecharModalDor, handleDorRegistradaSucesso,
    formatarTempo, atualizarExecucaoSerie, atualizarObservacaoAluno,
    concluirSerie, pularDescanso, cancelarTreino, dataInicio
  };
}