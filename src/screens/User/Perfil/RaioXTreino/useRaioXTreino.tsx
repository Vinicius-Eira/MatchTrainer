import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { registrarConsentimentoLGPD, RESUMO_FINALIDADE_SAUDE } from "../../../../services/lgpd/lgpdService";
import { supabase } from "../../../../services/supabase";
import { possuiDadosSaudeSensiveis, SUB_SAUDE_SENSIVEIS } from "../../../../shared/matchSchema";

export function useRaioXTreino(navigation: any) {
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const [servicoBuscado, setServicoBuscado] = useState("");
  const [locaisTreino, setLocaisTreino] = useState<string[]>([]);
  const [turnos, setTurnos] = useState<string[]>([]);
  const [horarioEspecifico, setHorarioEspecifico] = useState("");
  const [frequencia, setFrequencia] = useState("");
  const [generoTreinador, setGeneroTreinador] = useState("indiferente");
  const [investimento, setInvestimento] = useState("");

  const [historico, setHistorico] = useState("");
  const [objetivos, setObjetivos] = useState<string[]>([]);
  const [outroObjetivoTexto, setOutroObjetivoTexto] = useState("");
  const [subsObjetivos, setSubsObjetivos] = useState<string[]>([]);

  const [limitacoes, setLimitacoes] = useState<string[]>([]);
  const [outraLimitacaoTexto, setOutraLimitacaoTexto] = useState("");
  const [subsLimitacoes, setSubsLimitacoes] = useState<string[]>([]);
  const [consentimentoSaude, setConsentimentoSaude] = useState(false);

  const [estiloComunicacao, setEstiloComunicacao] = useState("");
  const [cobranca, setCobranca] = useState("");
  const [acompanhamento, setAcompanhamento] = useState("");
  const [autonomia, setAutonomia] = useState("");
  const [valoresTreinador, setValoresTreinador] = useState<string[]>([]);
  const [outroValorTexto, setOutroValorTexto] = useState("");

  const precisaConsentimentoSaude = possuiDadosSaudeSensiveis(limitacoes, subsObjetivos);

  useEffect(() => {
    const carregarRaioX = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const [resConexao, resUsuario] = await Promise.all([
          supabase
            .from("conexoes")
            .select("id")
            .eq("usuario_id", user.id)
            .eq("status", "aluno_ativo")
            .maybeSingle(),
          supabase.from("usuarios").select("preferencias, frequencia_treino").eq("id", user.id).maybeSingle(),
        ]);

        if (resConexao.data) setIsLocked(true);

        const data = resUsuario.data;
        if (data?.preferencias) {
          const p =
            typeof data.preferencias === "string" ? JSON.parse(data.preferencias) : data.preferencias;
          const extractId = (val: any): string =>
            val ? String(typeof val === "object" ? val.id || "" : val) : "";
          const extractArr = (val: any): string[] =>
            Array.isArray(val) ? val : val ? [String(val)] : [];

          setServicoBuscado(extractId(p.servico_buscado || p.servicoBuscado || p.modalidade));
          setLocaisTreino(extractArr(p.locais_treino || p.locaisTreino || p.local_treino));
          setTurnos(extractArr(p.turnos || p.turno_preferido));
          setHorarioEspecifico(p.horario_especifico || p.horarioEspecifico || "");
          setFrequencia(extractId(p.frequencia || data.frequencia_treino));
          setGeneroTreinador(extractId(p.genero_treinador || p.generoTreinador) || "indiferente");
          setInvestimento(extractId(p.investimento));

          setHistorico(extractId(p.historico));
          setObjetivos(extractArr(p.objetivos || p.objetivo));
          setOutroObjetivoTexto(p.outro_objetivo || p.outroObjetivoTexto || "");
          setSubsObjetivos(extractArr(p.subs_objetivos || p.subsObjetivos || p.sub_objetivo));

          setLimitacoes(extractArr(p.limitacoes || p.limitacao));
          setOutraLimitacaoTexto(p.outra_limitacao || p.outraLimitacaoTexto || "");
          setSubsLimitacoes(extractArr(p.subs_limitacoes || p.subsLimitacoes || p.sub_limitacao));
          setConsentimentoSaude(Boolean(p.consentimento_saude));

          setEstiloComunicacao(extractId(p.estilo_comunicacao || p.estiloComunicacao));
          setCobranca(extractId(p.cobranca || p.perfil_treinador));
          setAcompanhamento(extractId(p.acompanhamento));
          setAutonomia(extractId(p.autonomia));
          setValoresTreinador(extractArr(p.valores_treinador || p.valoresTreinador));
          setOutroValorTexto(p.outro_valor || p.outroValorTexto || "");
        }
      } catch (error) {
        console.log("Erro ao carregar Raio-X:", error);
      } finally {
        setLoading(false);
      }
    };
    carregarRaioX();
  }, []);

  const handleLockedPress = () => {
    Alert.alert(
      "Edição Blindada",
      "Você possui um contrato ativo com um Personal Trainer. Alterações no Raio-X só são liberadas sem vínculo ativo."
    );
  };

  const toggleArrayItem = (item: string, stateArray: string[], setStateArray: (val: string[]) => void) => {
    if (isLocked) return handleLockedPress();
    setStateArray(
      stateArray.includes(item) ? stateArray.filter((i) => i !== item) : [...stateArray, item]
    );
  };

  const handleToggleLimitacao = (id: string) => {
    if (isLocked) return handleLockedPress();

    if (id === "nenhuma" || id === "nao_informar") {
      const jaMarcado = limitacoes.includes(id);
      setLimitacoes(jaMarcado ? [] : [id]);
      setSubsLimitacoes([]);
      setOutraLimitacaoTexto("");
      if (!jaMarcado && !subsObjetivos.some((s) => SUB_SAUDE_SENSIVEIS.includes(s))) {
        setConsentimentoSaude(false);
      }
      return;
    }

    setLimitacoes((prev) => {
      const semExcludentes = prev.filter((item) => item !== "nenhuma" && item !== "nao_informar");
      const proximo = semExcludentes.includes(id)
        ? semExcludentes.filter((item) => item !== id)
        : [...semExcludentes, id];

      if (!proximo.includes("lesao") && !proximo.includes("clinica")) setSubsLimitacoes([]);
      if (!proximo.includes("outra")) setOutraLimitacaoTexto("");
      return proximo;
    });
  };

  const optarNaoInformarSaude = () => {
    if (isLocked) return handleLockedPress();
    setLimitacoes(["nao_informar"]);
    setSubsLimitacoes([]);
    setOutraLimitacaoTexto("");
    setSubsObjetivos((prev) => prev.filter((s) => !SUB_SAUDE_SENSIVEIS.includes(s)));
    setConsentimentoSaude(false);
  };

  const handleSalvar = async () => {
    if (isLocked) return;

    if (!servicoBuscado || !frequencia || !generoTreinador || !investimento) {
      Alert.alert("Campos obrigatórios", "Selecione formato de atendimento, frequência, gênero preferido e investimento.");
      return;
    }
    if (servicoBuscado === "Presencial" && (locaisTreino.length === 0 || turnos.length === 0)) {
      Alert.alert("Logística Presencial", "Informe onde vai treinar e seu turno preferido para atendimento presencial.");
      return;
    }
    if (!historico || objetivos.length === 0 || limitacoes.length === 0) {
      Alert.alert("Perfil corporal", "Selecione seu nível, objetivo e uma opção sobre limitações.");
      return;
    }
    if (!estiloComunicacao || !cobranca || !acompanhamento || !autonomia || valoresTreinador.length === 0) {
      Alert.alert("Match Ideal", "Preencha estilo de comunicação, cobrança, contato, autonomia e valores.");
      return;
    }
    if (precisaConsentimentoSaude && !consentimentoSaude) {
      Alert.alert(
        "Consentimento LGPD necessário",
        "Autorize o uso dos dados de saúde no filtro do Match ou toque em 'Prefiro não informar dados de saúde'."
      );
      return;
    }

    setSalvando(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não encontrado.");

      const { data: userData } = await supabase
        .from("usuarios")
        .select("preferencias")
        .eq("id", user.id)
        .single();

      const prefsAnteriores =
        typeof userData?.preferencias === "string"
          ? JSON.parse(userData.preferencias)
          : userData?.preferencias || {};

      const usaPresencial = servicoBuscado === "Presencial" || servicoBuscado === "Indiferente";
      const agoraIso = new Date().toISOString();

      const novasPreferencias = {
        ...prefsAnteriores,
        servico_buscado: servicoBuscado,
        locais_treino: usaPresencial ? locaisTreino : [],
        turnos: usaPresencial ? turnos : [],
        horario_especifico: usaPresencial && turnos.includes("variado") ? horarioEspecifico.trim() : null,
        frequencia,
        genero_treinador: generoTreinador || "indiferente",
        investimento,
        historico,
        objetivos,
        outro_objetivo: objetivos.includes("outro") ? outroObjetivoTexto.trim() : null,
        subs_objetivos: subsObjetivos,
        limitacoes,
        outra_limitacao: limitacoes.includes("outra") ? outraLimitacaoTexto.trim() : null,
        subs_limitacoes: limitacoes.includes("lesao") || limitacoes.includes("clinica") ? subsLimitacoes : [],
        consentimento_saude: precisaConsentimentoSaude ? consentimentoSaude : false,
        consentimento_saude_em: precisaConsentimentoSaude && consentimentoSaude ? agoraIso : null,
        estilo_comunicacao: estiloComunicacao,
        cobranca,
        acompanhamento,
        autonomia,
        valores_treinador: valoresTreinador,
        outro_valor: valoresTreinador.includes("outro") ? outroValorTexto.trim() : null,
      };

      const { error } = await supabase
        .from("usuarios")
        .update({
          preferencias: novasPreferencias,
          frequencia_treino: frequencia,
          setup_completo: true,
        })
        .eq("id", user.id);

      if (error) throw error;

      if (precisaConsentimentoSaude && consentimentoSaude) {
        await registrarConsentimentoLGPD({
          tipo: "dados_saude_match",
          concedido: true,
          origem: "raio_x_treino",
          resumoFinalidade: RESUMO_FINALIDADE_SAUDE,
        });
      }

      Alert.alert("Raio-X atualizado!", "Seu Top 3 do Match já será recalculado com suas novas preferências.");
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Erro", error?.message || "Falha ao salvar as preferências.");
    } finally {
      setSalvando(false);
    }
  };

  return {
    state: {
      loading,
      salvando,
      isLocked,
      servicoBuscado,
      locaisTreino,
      turnos,
      horarioEspecifico,
      frequencia,
      generoTreinador,
      investimento,
      historico,
      objetivos,
      outroObjetivoTexto,
      subsObjetivos,
      limitacoes,
      outraLimitacaoTexto,
      subsLimitacoes,
      consentimentoSaude,
      precisaConsentimentoSaude,
      estiloComunicacao,
      cobranca,
      acompanhamento,
      autonomia,
      valoresTreinador,
      outroValorTexto,
    },
    actions: {
      setServicoBuscado,
      setLocaisTreino,
      setTurnos,
      setHorarioEspecifico,
      setFrequencia,
      setGeneroTreinador,
      setInvestimento,
      setHistorico,
      setObjetivos,
      setOutroObjetivoTexto,
      setSubsObjetivos,
      handleToggleLimitacao,
      setOutraLimitacaoTexto,
      setSubsLimitacoes,
      setConsentimentoSaude,
      optarNaoInformarSaude,
      setEstiloComunicacao,
      setCobranca,
      setAcompanhamento,
      setAutonomia,
      setValoresTreinador,
      setOutroValorTexto,
      toggleArrayItem,
      handleLockedPress,
      handleSalvar,
    },
  };
}