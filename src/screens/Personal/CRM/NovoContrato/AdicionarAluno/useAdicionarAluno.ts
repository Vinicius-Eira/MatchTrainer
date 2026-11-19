import { useEffect, useState } from "react";
import { Alert, LayoutAnimation, Platform, UIManager } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as Clipboard from "expo-clipboard";
import { supabase } from "../../../../../services/supabase";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type ModalidadeEfetiva = "Consultoria" | "Presencial";
type Frequencia = "Avulso" | "Mensal" | "Trimestral" | "Semestral" | "Anual" | string;

export interface ConviteGeradoInfo {
  nome: string;
  email: string;
  codigo: string;
  expiraEm: string;
}

async function carregarRegraModalidadePersonal() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { exibirSeletor: false, padrao: "Consultoria" as ModalidadeEfetiva };
  }

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
    return { exibirSeletor: true, padrao: "Consultoria" as ModalidadeEfetiva };
  }

  if (temPresencial && !temConsultoria) {
    return { exibirSeletor: false, padrao: "Presencial" as ModalidadeEfetiva };
  }

  return { exibirSeletor: false, padrao: "Consultoria" as ModalidadeEfetiva };
}

export function useAdicionarAluno(route: any, navigation: any) {
  const { leadInjetado, planoAtivo } = route?.params || {};

  let prefs: any = {};
  try {
    prefs =
      typeof leadInjetado?.preferencias === "string"
        ? JSON.parse(leadInjetado.preferencias)
        : leadInjetado?.preferencias || {};
  } catch {}

  let servicoInicial: ModalidadeEfetiva = "Consultoria";
  const modalidadeSalva = planoAtivo?.modalidade || planoAtivo?.servicos_inclusos?.[0];
  if (modalidadeSalva && String(modalidadeSalva).toLowerCase().includes("presencial")) {
    servicoInicial = "Presencial";
  } else if (prefs?.servicos_buscados?.some((s: string) => String(s).toLowerCase().includes("presencial"))) {
    servicoInicial = "Presencial";
  }

  const diaInicial = planoAtivo?.dia_vencimento?.toString() || "10";
  const diaFormatado = diaInicial.length === 1 ? `0${diaInicial}` : diaInicial;
  const isDiaPadrao = ["05", "10", "20"].includes(diaFormatado);

  const valorInicial = planoAtivo?.valor_mensal
    ? Number(planoAtivo.valor_mensal).toFixed(2).replace(".", ",")
    : "";

  const termosIniciais =
    planoAtivo?.termos_contrato ||
    (planoAtivo?.observacoes && !String(planoAtivo.observacoes).startsWith("[CONGELADO]")
      ? planoAtivo.observacoes
      : "");

  const [modalUploadVisivel, setModalUploadVisivel] = useState(false);
  const [modalConviteVisivel, setModalConviteVisivel] = useState(false);
  const [codigoCopiado, setCodigoCopiado] = useState(false);
  const [conviteGerado, setConviteGerado] = useState<ConviteGeradoInfo | null>(null);

  const [exibirSeletorModalidade, setExibirSeletorModalidade] = useState(false);
  const [nome, setNome] = useState(leadInjetado?.nome || "");
  const [email, setEmail] = useState(leadInjetado?.email || "");
  const [modalidade, setModalidade] = useState<ModalidadeEfetiva>(servicoInicial);
  const [frequencia, setFrequencia] = useState<Frequencia>(planoAtivo?.frequencia || "Mensal");
  const [mensalidade, setMensalidade] = useState(valorInicial);
  const [vencimento, setVencimento] = useState(isDiaPadrao ? diaFormatado : "Outro");
  const [vencimentoOutro, setVencimentoOutro] = useState(isDiaPadrao ? "" : diaFormatado);
  const [observacoes, setObservacoes] = useState(termosIniciais);

  const [inputFocado, setInputFocado] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isProcessandoTexto] = useState(false);
  const [statusProcessamento] = useState("");

  useEffect(() => {
    let ativo = true;

    carregarRegraModalidadePersonal()
      .then((res) => {
        if (!ativo) return;
        setExibirSeletorModalidade(res.exibirSeletor);
        if (!res.exibirSeletor) {
          setModalidade(res.padrao);
        }
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

  const mostrarAjudaFinanceiro = () => {
    Alert.alert(
      "Como funciona o Fechamento?",
      "O valor definido aqui será a base do seu contrato.\n\nO aluno só terá acesso às planilhas de treino após aceitar formalmente os termos no aplicativo.\nO ciclo de cobrança determina a periodicidade das renovações.",
      [{ text: "Entendi", style: "default" }]
    );
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
          Alert.alert(
            "Em atualização",
            "O armazenamento seguro de PDF e a leitura por IA serão ativados na Etapa 4."
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
      "A organização assistida por IA real será ativada na Etapa 4."
    );
  };

  const handleCopiarCodigo = async () => {
    if (!conviteGerado?.codigo) return;
    await Clipboard.setStringAsync(conviteGerado.codigo);
    setCodigoCopiado(true);
  };

  const handleFecharModalConvite = () => {
    setModalConviteVisivel(false);
    navigation.goBack();
  };

  const handleAdicionarAluno = async () => {
    const nomeLimpo = nome.trim();
    const emailLimpo = email.trim().toLowerCase();

    if (!nomeLimpo || !emailLimpo || !mensalidade) {
      return Alert.alert("Atenção", "Nome, e-mail e valor são obrigatórios para continuar.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailLimpo)) {
      return Alert.alert("E-mail Inválido", "Digite um e-mail válido para vincular o convite.");
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
      if (leadInjetado && planoAtivo) {
        const { error: errUpdate } = await supabase
          .from("planos")
          .update({
            modalidade,
            servicos_inclusos: [modalidade],
            frequencia,
            valor_mensal: valorFloat,
            dia_vencimento: diaInt,
            termos_contrato: observacoes.trim() || null,
          })
          .eq("id", planoAtivo.id);

        if (errUpdate) throw errUpdate;

        Alert.alert("Sucesso!", "O contrato do aluno foi atualizado.");
        navigation.goBack();
      } else {
        const { data: conviteRes, error: rpcError } = await supabase.rpc("gerar_convite_aluno", {
          p_nome: nomeLimpo,
          p_email: emailLimpo,
          p_valor: valorFloat,
          p_frequencia: frequencia,
          p_dia_vencimento: diaInt,
          p_modalidade: modalidade,
          p_termos_contrato: observacoes.trim() || null,
        });

        if (rpcError) throw rpcError;

        const codigoGerado = conviteRes?.codigo_convite;
        const expiraEm = conviteRes?.expires_at
          ? new Date(conviteRes.expires_at).toLocaleDateString("pt-BR")
          : "7 dias";

        setCodigoCopiado(false);
        setConviteGerado({
          nome: nomeLimpo,
          email: emailLimpo,
          codigo: codigoGerado,
          expiraEm,
        });
        setModalConviteVisivel(true);
      }
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Não foi possível concluir a operação.");
    } finally {
      setLoading(false);
    }
  };

  return {
    state: {
      nome,
      email,
      modalidade,
      exibirSeletorModalidade,
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
      modalConviteVisivel,
      conviteGerado,
      codigoCopiado,
      leadInjetado,
      planoAtivo,
    },
    actions: {
      setNome,
      setEmail,
      setModalidade,
      setFrequencia,
      setObservacoes,
      setVencimentoOutro,
      setInputFocado,
      setModalUploadVisivel,
      handleMoneyChange,
      handleVencimentoSelect,
      handlePickDocument,
      handlePickImage,
      handleTakePicture,
      handleMelhorarTextoManual,
      handleAdicionarAluno,
      handleCopiarCodigo,
      handleFecharModalConvite,
      mostrarAjudaFinanceiro,
    },
  };
}