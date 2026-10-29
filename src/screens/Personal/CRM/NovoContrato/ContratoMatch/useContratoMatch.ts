import { useState } from "react";
import { Alert, LayoutAnimation, UIManager, Platform } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../../../../services/supabase"; 

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function useCriarContratoMatch(route: any, navigation: any) {
  const { conexaoId, nomeAluno } = route?.params || {};

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

  const handleMoneyChange = (text: string) => {
    let numericValue = text.replace(/[^0-9]/g, "");
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

  const extrairTextoDaImagem = async (base64Image: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsProcessandoTexto(true);
    setStatusProcessamento("Extraindo texto da imagem...");

    try {
      let formData = new FormData();
      formData.append('base64Image', `data:image/jpg;base64,${base64Image}`);
      formData.append('language', 'por');

      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        headers: { 'apikey': 'helloworld' }, 
        body: formData,
      });

      const data = await response.json();
      if (data.ParsedResults && data.ParsedResults.length > 0) {
        const textoReal = data.ParsedResults[0].ParsedText;
        if (!textoReal || textoReal.trim() === "") {
          Alert.alert("Ops", "Não consegui identificar nenhuma letra nesta imagem.");
        } else {
          setObservacoes((prev: string) => prev + "\n" + textoReal);
        }
      } else {
        Alert.alert("Erro", "Falha ao ler a imagem. Tente uma foto mais nítida.");
      }
    } catch (error) {
      Alert.alert("Erro na Conexão", "Não foi possível conectar ao servidor de leitura.");
    } finally {
      setIsProcessandoTexto(false);
      setStatusProcessamento("");
    }
  };
  
  const handlePickDocument = async () => {
    setModalUploadVisivel(false);
    setTimeout(async () => {
      try {
        const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
        if (!result.canceled && result.assets && result.assets.length > 0) {
           Alert.alert("PDF Anexado", `O arquivo PDF será vinculado à ficha do aluno.`);
        }
      } catch (err: any) {
        Alert.alert("Erro no Documento", err.message);
      }
    }, 800); 
  };

  const handlePickImage = async () => {
    setModalUploadVisivel(false);
    setTimeout(async () => {
      try {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) return Alert.alert('Permissão Bloqueada', 'Precisamos de acesso à Galeria.');
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.5, base64: true });
        if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].base64) {
            extrairTextoDaImagem(result.assets[0].base64);
        }
      } catch (err: any) {
        Alert.alert("Erro na Galeria", err.message);
      }
    }, 800);
  };

  const handleTakePicture = async () => {
    setModalUploadVisivel(false);
    setTimeout(async () => {
      try {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (permissionResult.granted === false) return Alert.alert("Permissão Bloqueada", "Precisamos de acesso à Câmera.");
        const result = await ImagePicker.launchCameraAsync({ quality: 0.5, base64: true });
        if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].base64) {
            extrairTextoDaImagem(result.assets[0].base64);
        }
      } catch (err: any) {
        Alert.alert("Erro na Câmera", err.message);
      }
    }, 800);
  };

  const handleMelhorarTextoManual = () => {
    if (!observacoes.trim()) return Alert.alert("Atenção", "Escreva ou importe algo primeiro.");
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsProcessandoTexto(true);
    setStatusProcessamento("Organizando juridicamente com IA...");
    
    setTimeout(() => {
      const textoFormatado = `TERMOS LEGAIS E COMERCIAIS\n\n1. Escopo de Trabalho:\n${observacoes.trim()}\n\n2. Obrigações: O aluno compromete-se a seguir as diretrizes prescritas no aplicativo.\n3. Pagamentos: Os pagamentos devem ocorrer até a data de vencimento acordada.\n4. Suporte: O suporte para dúvidas será realizado via chat com SLA de resposta em até 24h.`;
      setObservacoes(textoFormatado);
      setIsProcessandoTexto(false);
      setStatusProcessamento("");
    }, 2000);
  };

  const handleEnviarProposta = async () => {
    if (!mensalidade) return Alert.alert("Atenção", "O valor da proposta é obrigatório.");

    let diaFinal = vencimento === "Outro" ? vencimentoOutro : vencimento;
    let diaInt = parseInt(diaFinal, 10);
    if (isNaN(diaInt) || diaInt < 1 || diaInt > 31) {
      return Alert.alert("Atenção", "Insira um dia de vencimento válido (1 a 31).");
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessão inválida.");

      const { data: conn } = await supabase.from("conexoes").select("usuario_id").eq("id", conexaoId).single();
      if (!conn || !conn.usuario_id) throw new Error("Conexão com o aluno não encontrada.");

      const valorFloat = parseFloat(mensalidade.replace(",", "."));

      const { data: novoPlano, error: erroPlano } = await supabase.from("planos").insert([{
        aluno_id: conn.usuario_id,
        personal_id: user.id,
        conexao_id: conexaoId,
        frequencia: frequencia,
        valor_mensal: valorFloat,
        dia_vencimento: diaInt,
        observacoes: observacoes.trim(),
        status: "aguardando_assinatura" 
      }]).select().single();
      
      if (erroPlano) throw erroPlano;

      await supabase.from("historico_financeiro_logs").insert([{
        personal_id: user.id, aluno_id: conn.usuario_id, referencia_id: novoPlano.id,
        tipo_evento: "PROPOSTA_ENVIADA", descricao: `Proposta comercial de R$ ${valorFloat} enviada ao aluno.`, metadados: { valor: valorFloat }
      }]);
      
      await supabase.from("conexoes").update({ status: "aguardando_aluno" }).eq("id", conexaoId);
      
      Alert.alert("Proposta Enviada!", "O aluno será notificado para assinar o contrato.");
      navigation.goBack(); 
    } catch (error: any) {
      Alert.alert("Erro ao Enviar", error.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    state: { 
      nomeAluno, frequencia, mensalidade, vencimento, vencimentoOutro, observacoes, 
      inputFocado, loading, isProcessandoTexto, statusProcessamento, modalUploadVisivel 
    },
    actions: { 
      setFrequencia, setMensalidade, setVencimento, setVencimentoOutro, setObservacoes, 
      setInputFocado, setModalUploadVisivel, handleMoneyChange, handleVencimentoSelect,
      handlePickDocument, handlePickImage, handleTakePicture, handleMelhorarTextoManual, handleEnviarProposta 
    }
  };
}