import { useEffect, useState } from "react";
import { Alert, LayoutAnimation, Platform, UIManager } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../../../../services/supabase";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type ModalidadeEfetiva = "Consultoria" | "Presencial";

async function carregarModalidadesPersonal() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { opcoes: ["Consultoria"] as ModalidadeEfetiva[], padrao: "Consultoria" as ModalidadeEfetiva };

  const { data: personal } = await supabase
    .from("personals")
    .select("servicos_oferecidos")
    .eq("id", user.id)
    .maybeSingle();

  const raw = personal?.servicos_oferecidos;
  let lista: string[] = [];
  if (Array.isArray(raw)) {
    lista = raw;
  } else if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) lista = parsed;
    } catch {}
  }

  const normalizados = lista.map((s) => String(s).toLowerCase());
  const temConsultoria = normalizados.some((s) => s.includes("consultoria") || s.includes("online"));
  const temPresencial = normalizados.some((s) => s.includes("presencial"));
  const temAmbos = normalizados.some((s) => s.includes("ambos") || s.includes("hibrid") || s.includes("híbrid"));

  if ((temConsultoria && temPresencial) || temAmbos) {
    return { opcoes: ["Consultoria", "Presencial"] as ModalidadeEfetiva[], padrao: "Consultoria" as ModalidadeEfetiva };
  }

  if (temPresencial && !temConsultoria) {
    return { opcoes: ["Presencial"] as ModalidadeEfetiva[], padrao: "Presencial" as ModalidadeEfetiva };
  }

  return { opcoes: ["Consultoria"] as ModalidadeEfetiva[], padrao: "Consultoria" as ModalidadeEfetiva };
}

export function useCriarContratoMatch(route: any, navigation: any) {
  const { conexaoId, nomeAluno } = route?.params || {};

  const [modalidadesDisponiveis, setModalidadesDisponiveis] = useState<ModalidadeEfetiva[]>(["Consultoria", "Presencial"]);
  const [modalidade, setModalidade] = useState<ModalidadeEfetiva>("Consultoria");

  const [frequencia, setFrequencia] = useState("Mensal");
  const [mensalidade, setMensalidade] = useState("");
  const [vencimento, setVencimento] = useState("10");
  const [vencimentoOutro, setVencimentoOutro] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [inputFocado, setInputFocado] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [modalUploadVisivel, setModalUploadVisivel] = useState(false);
  const [isProcessandoTexto, setIsProcessandoTexto] = useState(false);
  const [statusProcessamento, setStatusProcessamento] = useState("");

  useEffect(() => {
    let ativo = true;

    carregarModalidadesPersonal()
      .then((res) => {
        if (!ativo) return;
        setModalidadesDisponiveis(res.opcoes);
        setModalidade(res.padrao);
      })
      .catch(() => {});

    return () => {
      ativo = false;
    };
  }, []);

  const handleMoneyChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, "");
    if (numericValue) {
      const parsedValue = (parseInt(numericValue, 10) / 100).toFixed(2);
      setMensalidade(parsedValue.replace(".", ","));
    } else {
      setMensalidade("");
    }
  };

  const handleVencimentoSelect = (val: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setVencimento(val);
  };

  const handlePickDocument = async () => {
    setModalUploadVisivel(false);
    setTimeout(async () => {
      try {
        const result = await DocumentPicker.getDocumentAsync({ type: "application/pdf", copyToCacheDirectory: true });
        if (!result.canceled && result.assets && result.assets.length > 0) {
          Alert.alert(
            "Em atualização",
            "O armazenamento seguro de PDF e a leitura por IA serão ativados na próxima etapa. Por enquanto, digite os termos diretamente no editor."
          );
        }
      } catch (err: any) {
        Alert.alert("Erro no Documento", err.message);
      }
    }, 500);
  };

  const handlePickImage = async () => {
    setModalUploadVisivel(false);
    Alert.alert(
      "Em atualização",
      "A leitura de imagens por IA segura (via servidor) será ativada na Etapa 4."
    );
  };

  const handleTakePicture = async () => {
    setModalUploadVisivel(false);
    Alert.alert(
      "Em atualização",
      "A leitura de fotos por IA segura (via servidor) será ativada na Etapa 4."
    );
  };

  const handleMelhorarTextoManual = () => {
    Alert.alert(
      "Em atualização",
      "A assistência real de IA para organização contratual será ativada na Etapa 4."
    );
  };

  const handleEnviarProposta = async () => {
    if (!conexaoId) {
      return Alert.alert("Erro", "Conexão não identificada.");
    }
    if (!mensalidade) {
      return Alert.alert("Atenção", "O valor da proposta é obrigatório.");
    }

    const valorFloat = parseFloat(mensalidade.replace(",", "."));
    if (isNaN(valorFloat) || valorFloat <= 0) {
      return Alert.alert("Atenção", "Informe um valor maior que zero.");
    }

    const diaFinal = vencimento === "Outro" ? vencimentoOutro : vencimento;
    const diaInt = parseInt(diaFinal, 10);
    if (isNaN(diaInt) || diaInt < 1 || diaInt > 31) {
      return Alert.alert("Atenção", "Insira um dia de vencimento válido (1 a 31).");
    }

    setLoading(true);
    try {
      const { error } = await supabase.rpc("enviar_proposta_match", {
        p_conexao_id: conexaoId,
        p_valor: valorFloat,
        p_frequencia: frequencia,
        p_dia_vencimento: diaInt,
        p_modalidade: modalidade,
        p_termos_contrato: observacoes.trim() || null,
      });

      if (error) throw error;

      Alert.alert(
        "Proposta Enviada!",
        "O aluno já pode visualizar as condições no chat para revisar e assinar o contrato."
      );
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Erro ao Enviar", error.message || "Não foi possível enviar a proposta.");
    } finally {
      setLoading(false);
    }
  };

  return {
    state: {
      nomeAluno,
      modalidadesDisponiveis,
      modalidade,
      frequencia,
      mensalidade,
      vencimento,
      vencimentoOutro,
      observacoes,
      inputFocado,
      loading,
      isProcessandoTexto,
      statusProcessamento,
      modalUploadVisivel,
    },
    actions: {
      setModalidade,
      setFrequencia,
      setMensalidade,
      setVencimento,
      setVencimentoOutro,
      setObservacoes,
      setInputFocado,
      setModalUploadVisivel,
      handleMoneyChange,
      handleVencimentoSelect,
      handlePickDocument,
      handlePickImage,
      handleTakePicture,
      handleMelhorarTextoManual,
      handleEnviarProposta,
    },
  };
}