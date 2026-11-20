import { useEffect, useState } from "react";
import { Alert, LayoutAnimation, Platform, UIManager } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../../../../services/supabase";
import {
  abrirDocumentoContrato,
  analisarDocumentoComIA,
  DocumentoContratoAnexo,
  organizarTextoContratoComIA,
  removerDocumentoContrato,
  ResultadoAnaliseIA,
  uploadDocumentoContrato,
} from "../../../../../services/contratoDocumentos";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type ModalidadeEfetiva = "Consultoria" | "Presencial";

async function carregarModalidadesPersonal() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
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

  const [modalidadesDisponiveis, setModalidadesDisponiveis] = useState<ModalidadeEfetiva[]>(["Consultoria"]);
  const [modalidade, setModalidade] = useState<ModalidadeEfetiva>("Consultoria");

  const [frequencia, setFrequencia] = useState("Mensal");
  const [mensalidade, setMensalidade] = useState("");
  const [vencimento, setVencimento] = useState("10");
  const [vencimentoOutro, setVencimentoOutro] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [documentoAnexo, setDocumentoAnexo] = useState<DocumentoContratoAnexo | null>(null);
  const [resultadoIA, setResultadoIA] = useState<ResultadoAnaliseIA | null>(null);
  const [modalRevisaoIAVisivel, setModalRevisaoIAVisivel] = useState(false);

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

  const executarAnaliseDocumento = async (anexo: DocumentoContratoAnexo) => {
    setIsProcessandoTexto(true);
    setStatusProcessamento("Analisando documento com IA (preservando original)...");
    try {
      const resultado = await analisarDocumentoComIA(anexo);
      setResultadoIA(resultado);
      setModalRevisaoIAVisivel(true);
    } catch (err: any) {
      Alert.alert(
        "Falha na Leitura por IA",
        `${err.message}\n\nSeu arquivo original permanece anexado com segurança e você pode editar os termos manualmente.`
      );
    } finally {
      setIsProcessandoTexto(false);
      setStatusProcessamento("");
    }
  };

  const processarUploadEAnalise = async (
    payload: { uri: string; nomeArquivo?: string | null; mimeType?: string | null; tamanhoBytes?: number | null; base64?: string | null },
    perguntarIA: boolean
  ) => {
    setIsProcessandoTexto(true);
    setStatusProcessamento("Enviando arquivo para armazenamento seguro...");
    try {
      const anexoAnterior = documentoAnexo;
      const novoAnexo = await uploadDocumentoContrato(payload);
      setDocumentoAnexo(novoAnexo);

      if (anexoAnterior?.storagePath) {
        removerDocumentoContrato(anexoAnterior.storagePath).catch(() => {});
      }

      if (perguntarIA) {
        setIsProcessandoTexto(false);
        setStatusProcessamento("");
        Alert.alert(
          "Documento Anexado!",
          `"${novoAnexo.nomeArquivo}" foi salvo com segurança.\n\nDeseja que a IA leia e organize as cláusulas para sua revisão?`,
          [
            { text: "Não, apenas anexar", style: "cancel" },
            { text: "Analisar com IA", onPress: () => executarAnaliseDocumento(novoAnexo) },
          ]
        );
      } else {
        await executarAnaliseDocumento(novoAnexo);
      }
    } catch (err: any) {
      Alert.alert("Erro ao Importar", err.message || "Não foi possível salvar o documento.");
      setIsProcessandoTexto(false);
      setStatusProcessamento("");
    }
  };

  const handlePickDocument = async () => {
    setModalUploadVisivel(false);
    setTimeout(async () => {
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: "application/pdf",
          copyToCacheDirectory: true,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          await processarUploadEAnalise(
            {
              uri: asset.uri,
              nomeArquivo: asset.name,
              mimeType: asset.mimeType || "application/pdf",
              tamanhoBytes: asset.size,
            },
            true
          );
        }
      } catch (err: any) {
        Alert.alert("Erro no Documento", err.message);
      }
    }, 400);
  };

  const handlePickImage = async () => {
    setModalUploadVisivel(false);
    setTimeout(async () => {
      try {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          return Alert.alert("Permissão Bloqueada", "Precisamos de acesso à Galeria.");
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.75,
          base64: true,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          await processarUploadEAnalise(
            {
              uri: asset.uri,
              nomeArquivo: asset.fileName || `contrato_galeria_${Date.now()}.jpg`,
              mimeType: asset.mimeType || "image/jpeg",
              tamanhoBytes: asset.fileSize,
              base64: asset.base64,
            },
            false
          );
        }
      } catch (err: any) {
        Alert.alert("Erro na Galeria", err.message);
      }
    }, 400);
  };

  const handleTakePicture = async () => {
    setModalUploadVisivel(false);
    setTimeout(async () => {
      try {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          return Alert.alert("Permissão Bloqueada", "Precisamos de acesso à Câmera.");
        }
        const result = await ImagePicker.launchCameraAsync({
          quality: 0.75,
          base64: true,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          await processarUploadEAnalise(
            {
              uri: asset.uri,
              nomeArquivo: asset.fileName || `contrato_foto_${Date.now()}.jpg`,
              mimeType: asset.mimeType || "image/jpeg",
              tamanhoBytes: asset.fileSize,
              base64: asset.base64,
            },
            false
          );
        }
      } catch (err: any) {
        Alert.alert("Erro na Câmera", err.message);
      }
    }, 400);
  };

  const handleRemoverDocumento = async () => {
    if (!documentoAnexo) return;
    const path = documentoAnexo.storagePath;
    setDocumentoAnexo(null);
    removerDocumentoContrato(path).catch(() => {});
  };

  const handleVisualizarDocumento = async () => {
    if (!documentoAnexo) return;
    try {
      await abrirDocumentoContrato(documentoAnexo.storagePath);
    } catch (err: any) {
      Alert.alert("Erro", err.message || "Não foi possível abrir o arquivo.");
    }
  };

  const handleAnalisarDocumentoAnexo = async () => {
    if (!documentoAnexo) return;
    await executarAnaliseDocumento(documentoAnexo);
  };

  const handleMelhorarTextoManual = async () => {
    if (observacoes.trim().length < 15) {
      return Alert.alert(
        "Atenção",
        "Escreva pelo menos algumas condições no editor ou importe um PDF/imagem antes de usar a IA."
      );
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsProcessandoTexto(true);
    setStatusProcessamento("Organizando suas cláusulas com IA (sem inventar regras)...");

    try {
      const resultado = await organizarTextoContratoComIA(observacoes.trim());
      setResultadoIA(resultado);
      setModalRevisaoIAVisivel(true);
    } catch (err: any) {
      Alert.alert("Erro na IA", err.message || "Não foi possível organizar o texto agora.");
    } finally {
      setIsProcessandoTexto(false);
      setStatusProcessamento("");
    }
  };

  const handleAplicarTextoIA = (textoOrganizado: string) => {
    setObservacoes(textoOrganizado);
    setModalRevisaoIAVisivel(false);
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
        p_documento_original_url: documentoAnexo?.storagePath || null,
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
      documentoAnexo,
      resultadoIA,
      modalRevisaoIAVisivel,
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
      setModalRevisaoIAVisivel,
      handleMoneyChange,
      handleVencimentoSelect,
      handlePickDocument,
      handlePickImage,
      handleTakePicture,
      handleRemoverDocumento,
      handleVisualizarDocumento,
      handleAnalisarDocumentoAnexo,
      handleMelhorarTextoManual,
      handleAplicarTextoIA,
      handleEnviarProposta,
    },
  };
}