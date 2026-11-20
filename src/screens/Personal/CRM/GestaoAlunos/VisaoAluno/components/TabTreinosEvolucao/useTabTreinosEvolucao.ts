import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "../../../../../../../services/supabase";

export const formatarNumero = (valor: number | string | null | undefined, casas = 1): string => {
  if (valor === null || valor === undefined || valor === "") return "--";
  const num = Number(valor);
  if (Number.isNaN(num)) return "--";
  return Number.isInteger(num) ? String(num) : num.toFixed(casas).replace(".", ",");
};

export const formatarDataCurta = (iso?: string | null): string => {
  if (!iso) return "--/--";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
};

export const calcularVariacao = (
  atual: number | null | undefined,
  anterior: number | null | undefined,
  unidade: string,
  menorMelhor = false
): { texto: string | null; cor: string } => {
  if (atual === null || atual === undefined || anterior === null || anterior === undefined) {
    return { texto: null, cor: "#888" };
  }

  const diff = Number(atual) - Number(anterior);
  if (Number.isNaN(diff)) return { texto: null, cor: "#888" };

  if (Math.abs(diff) < 0.05) {
    return { texto: "Estável", cor: "#8E8E93" };
  }

  const sinal = diff > 0 ? "+" : "";
  const texto = `${sinal}${diff.toFixed(1).replace(".", ",")}${unidade}`;
  const melhorou = menorMelhor ? diff < 0 : diff > 0;

  return {
    texto,
    cor: melhorou ? "#00E676" : "#FF6B00",
  };
};

export const getAnaliseIntensidade = (rpe?: number | null) => {
  if (!rpe) {
    return {
      label: "Concluído",
      texto: "Check-in Concluído",
      sub: "Sessão registrada sem nota de esforço",
      percentual: 100,
      cor: "#00E676",
    };
  }

  if (rpe === 1) {
    return { label: "Leve", texto: "Esforço Leve / Recuperação", sub: "Carga confortável, margem para progredir", percentual: 40, cor: "#00E676" };
  }
  if (rpe === 2) {
    return { label: "Moderado", texto: "Estímulo Moderado (Zona Alvo)", sub: "Boa intensidade e controle de execução", percentual: 70, cor: "#FFB300" };
  }
  if (rpe === 3) {
    return { label: "Intenso", texto: "Treino Intenso", sub: "Alto recrutamento e foco muscular", percentual: 85, cor: "#FF6B00" };
  }

  if (rpe <= 4) {
    return { label: "Leve", texto: "Esforço Leve / Recuperação", sub: "Carga confortável, margem para progredir", percentual: 40, cor: "#00E676" };
  }
  if (rpe <= 7) {
    return { label: "Moderado", texto: "Estímulo Moderado (Zona Alvo)", sub: "Boa intensidade e controle de execução", percentual: 70, cor: "#FFB300" };
  }
  if (rpe <= 8) {
    return { label: "Intenso", texto: "Treino Intenso", sub: "Próximo à falha, excelente recrutamento", percentual: 85, cor: "#FF6B00" };
  }
  return { label: "Máximo", texto: "Exigência Máxima / Limite", sub: "Atenção à recuperação para a próxima sessão", percentual: 100, cor: "#EF4444" };
};

export function useTabTreinosEvolucao({ aluno, conexaoId, navigation }: any) {
  const [abaVisualizacao, setAbaVisualizacao] = useState<"evolucao" | "corpo">("evolucao");
  const [tipoSegmentar, setTipoSegmentar] = useState<"gordura" | "massa">("gordura");
  const [ocultarAlertaDor, setOcultarAlertaDor] = useState(false);

  const [idConexaoReal, setIdConexaoReal] = useState<string | null>(conexaoId || null);
  const [recadoAtualSalvo, setRecadoAtualSalvo] = useState<string>("");
  const [novoRecadoInput, setNovoRecadoInput] = useState<string>("");
  const [dataUltimoRecado, setDataUltimoRecado] = useState<string | null>(null);
  const [editorFeedbackAberto, setEditorFeedbackAberto] = useState(false);
  const [salvandoRecado, setSalvandoRecado] = useState(false);

  const [avaliacoesBio, setAvaliacoesBio] = useState<any[]>([]);
  const [indiceBioSelecionada, setIndiceBioSelecionada] = useState<number>(0);
  const [loadingBio, setLoadingBio] = useState<boolean>(false);

  const [treinoSelecionado, setTreinoSelecionado] = useState<any | null>(null);
  const [exercicioExpandidoId, setExercicioExpandidoId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const carregarRecadoExistente = async () => {
      try {
        let query = supabase.from("conexoes").select("id, recado_evolucao, data_recado");
        if (conexaoId) {
          query = query.eq("id", conexaoId);
        } else if (aluno?.id) {
          query = query.eq("usuario_id", aluno.id).in("status", ["aluno_ativo", "aguardando_assinatura", "pendente"]);
        } else {
          return;
        }

        const { data } = await query.maybeSingle();
        if (data && isMounted) {
          setIdConexaoReal(data.id);
          setRecadoAtualSalvo(data.recado_evolucao || "");
          if (data.data_recado) {
            setDataUltimoRecado(new Date(data.data_recado).toLocaleDateString("pt-BR"));
          }
        }
      } catch (err) {
        console.log("Erro ao carregar recado do personal:", err);
      }
    };

    carregarRecadoExistente();
    return () => {
      isMounted = false;
    };
  }, [conexaoId, aluno?.id]);

  const carregarBioimpedancias = useCallback(async () => {
    if (!idConexaoReal) return;

    setLoadingBio(true);
    try {
      const { data, error } = await supabase
        .from("aluno_evolucao")
        .select(
          "id, data_registro, peso, percentual_gordura, massa_magra, massa_de_gordura, agua_corporal, gordura_visceral, taxa_metabolica_basal, analise_segmentar"
        )
        .eq("conexao_id", idConexaoReal)
        .order("data_registro", { ascending: false });

      if (error) throw error;

      setAvaliacoesBio(data || []);
      setIndiceBioSelecionada(0);
    } catch (err) {
      console.log("Erro ao buscar histórico de bioimpedância:", err);
    } finally {
      setLoadingBio(false);
    }
  }, [idConexaoReal]);

  useFocusEffect(
    useCallback(() => {
      carregarBioimpedancias();
    }, [carregarBioimpedancias])
  );

  const abrirNovaAvaliacao = () => {
    if (!idConexaoReal) {
      Alert.alert("Aguarde", "Ainda estamos carregando o vínculo deste aluno. Tente novamente em instantes.");
      return;
    }
    navigation.navigate("Bioimpedancia", { conexaoId: idConexaoReal });
  };

  const abrirEditorNovoFeedback = () => {
    setNovoRecadoInput("");
    setEditorFeedbackAberto(true);
  };

  const salvarFeedbackEvolucao = async () => {
    if (!idConexaoReal) {
      return Alert.alert("Erro", "Vínculo do aluno não localizado.");
    }
    const textoLimpo = novoRecadoInput.trim();
    if (!textoLimpo) {
      return Alert.alert("Campo vazio", "Escreva uma mensagem antes de enviar para o aluno.");
    }

    setSalvandoRecado(true);
    try {
      const agoraIso = new Date().toISOString();

      const { error } = await supabase
        .from("conexoes")
        .update({
          recado_evolucao: textoLimpo,
          data_recado: agoraIso,
        })
        .eq("id", idConexaoReal);

      if (error) throw error;

      setRecadoAtualSalvo(textoLimpo);
      setDataUltimoRecado(new Date(agoraIso).toLocaleDateString("pt-BR"));
      setNovoRecadoInput("");
      setEditorFeedbackAberto(false);
    } catch (err) {
      console.log("Erro ao salvar feedback:", err);
      Alert.alert("Erro", "Não foi possível enviar o feedback.");
    } finally {
      setSalvandoRecado(false);
    }
  };

  const abrirDetalhesExecucao = (log: any) => {
    setTreinoSelecionado(log);
    const primeiroExId = log?.exerciciosDetalhados?.[0]?.id || null;
    setExercicioExpandidoId(primeiroExId);
  };

  const fecharDetalhesExecucao = () => {
    setTreinoSelecionado(null);
    setExercicioExpandidoId(null);
  };

  const alternarExercicioExpandido = (exId: string) => {
    setExercicioExpandidoId((prev) => (prev === exId ? null : exId));
  };

  let prefs: any = {};
  try {
    prefs = typeof aluno?.preferencias === "string" ? JSON.parse(aluno.preferencias) : aluno?.preferencias || {};
  } catch (e) {}
  const metaDePeso = prefs?.meta_peso || "--";

  const bioMaisRecente = avaliacoesBio[0] || null;
  const bioAtual = avaliacoesBio[indiceBioSelecionada] || null;
  const bioAnterior = avaliacoesBio[indiceBioSelecionada + 1] || null;

  let segRaw: any = {};
  try {
    segRaw =
      typeof bioAtual?.analise_segmentar === "string"
        ? JSON.parse(bioAtual.analise_segmentar)
        : bioAtual?.analise_segmentar || {};
  } catch (e) {}

  const prefixoSeg = tipoSegmentar === "gordura" ? "gord" : "massa";
  const segmentarExibido = {
    bracoEsq: formatarNumero(segRaw?.[`${prefixoSeg}_braco_esq`]),
    bracoDir: formatarNumero(segRaw?.[`${prefixoSeg}_braco_dir`]),
    tronco: formatarNumero(segRaw?.[`${prefixoSeg}_tronco`]),
    pernaEsq: formatarNumero(segRaw?.[`${prefixoSeg}_perna_esq`]),
    pernaDir: formatarNumero(segRaw?.[`${prefixoSeg}_perna_dir`]),
  };

  const deltas = {
    pesoResumo: calcularVariacao(bioMaisRecente?.peso, avaliacoesBio[1]?.peso, " kg", false),
    gordura: calcularVariacao(bioAtual?.percentual_gordura, bioAnterior?.percentual_gordura, "%", true),
    massa: calcularVariacao(bioAtual?.massa_magra, bioAnterior?.massa_magra, " kg", false),
    agua: calcularVariacao(bioAtual?.agua_corporal, bioAnterior?.agua_corporal, " L", false),
    visceral: calcularVariacao(bioAtual?.gordura_visceral, bioAnterior?.gordura_visceral, "", true),
    tmb: calcularVariacao(bioAtual?.taxa_metabolica_basal, bioAnterior?.taxa_metabolica_basal, " kcal", false),
  };

  const pesoExibirResumo =
    bioMaisRecente?.peso !== undefined && bioMaisRecente?.peso !== null
      ? formatarNumero(bioMaisRecente.peso)
      : formatarNumero(aluno?.peso);

  return {
    state: {
      abaVisualizacao,
      tipoSegmentar,
      ocultarAlertaDor,
      recadoAtualSalvo,
      novoRecadoInput,
      dataUltimoRecado,
      editorFeedbackAberto,
      salvandoRecado,
      avaliacoesBio,
      indiceBioSelecionada,
      loadingBio,
      treinoSelecionado,
      exercicioExpandidoId,
      metaDePeso,
      bioMaisRecente,
      bioAtual,
      bioAnterior,
      segmentarExibido,
      deltas,
      pesoExibirResumo,
    },
    actions: {
      setAbaVisualizacao,
      setTipoSegmentar,
      setOcultarAlertaDor,
      setNovoRecadoInput,
      setEditorFeedbackAberto,
      setIndiceBioSelecionada,
      abrirNovaAvaliacao,
      abrirEditorNovoFeedback,
      salvarFeedbackEvolucao,
      abrirDetalhesExecucao,
      fecharDetalhesExecucao,
      alternarExercicioExpandido,
    },
  };
}