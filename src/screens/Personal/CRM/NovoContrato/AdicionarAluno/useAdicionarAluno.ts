import { useState } from "react";
import { Alert, LayoutAnimation, UIManager, Platform } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as Clipboard from "expo-clipboard";
import { supabase } from "../../../../../services/supabase";
import { useOnboarding } from "../../../../../hooks/useOnboarding";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Modalidade = "Consultoria" | "Presencial" | "Híbrido" | string;
type Frequencia = "Avulso" | "Mensal" | "Trimestral" | "Semestral" | "Anual" | string;

export function useAdicionarAluno(route: any, navigation: any) {
  const { completarMissao } = useOnboarding();
  const { leadInjetado, planoAtivo, conexaoId } = route?.params || {};

  let prefs: any = {};
  try {
    prefs = typeof leadInjetado?.preferencias === 'string' 
      ? JSON.parse(leadInjetado.preferencias) 
      : (leadInjetado?.preferencias || {});
  } catch(e) {}

  let servicoDesejado: Modalidade = "Consultoria";
  if (planoAtivo?.servicos_inclusos?.[0]) {
    servicoDesejado = planoAtivo.servicos_inclusos[0];
  } else if (prefs?.servicos_buscados?.length > 0) {
    const buscado = prefs.servicos_buscados[0];
    if (buscado === "Presencial") servicoDesejado = "Presencial";
    else if (buscado === "Consultoria") servicoDesejado = "Consultoria";
  }

  const diaInicial = planoAtivo?.dia_vencimento?.toString() || "10";
  const isDiaPadrao = ["05", "10", "20"].includes(diaInicial);
  const diaFormatado = diaInicial.length === 1 ? `0${diaInicial}` : diaInicial;

  const [modalUploadVisivel, setModalUploadVisivel] = useState(false);
  const [nome, setNome] = useState(leadInjetado?.nome || "");
  const [email, setEmail] = useState(leadInjetado?.email || "");
  const [modalidade, setModalidade] = useState<Modalidade>(servicoDesejado);
  const [frequencia, setFrequencia] = useState<Frequencia>(planoAtivo?.frequencia || "Mensal");
  const [mensalidade, setMensalidade] = useState(planoAtivo?.valor_mensal?.toString() || "");
  const [vencimento, setVencimento] = useState(isDiaPadrao ? diaFormatado : "Outro");
  const [vencimentoOutro, setVencimentoOutro] = useState(isDiaPadrao ? "" : diaFormatado);
  const [observacoes, setObservacoes] = useState(planoAtivo?.observacoes || "");
  
  const [inputFocado, setInputFocado] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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

  const mostrarAjudaFinanceiro = () => {
    Alert.alert(
      "Como funciona o Fechamento?",
      "O valor definido aqui será a base do seu contrato.\n\n• O aluno só terá acesso às planilhas de treino após o app confirmar o aceite deste valor.\n• O ciclo de cobrança (Mensal, Trimestral) determinará quando ele será avisado da renovação.",
      [{ text: "Entendi", style: "default" }]
    );
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
           Alert.alert("PDF Anexado", `O arquivo PDF será vinculado à ficha do aluno. (Nota: Para extrair o texto de um contrato impresso e jogar no campo de texto, use a opção Câmera).`);
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
      const textoBase = observacoes.trim();
      const textoFormatado = `TERMOS E CONDIÇÕES DO ACOMPANHAMENTO\n\nEscopo de Trabalho:\n${textoBase}\n\n1. O aluno compromete-se a seguir as diretrizes prescritas no aplicativo.\n2. Os pagamentos devem ocorrer até a data de vencimento acordada.\n3. O suporte para dúvidas será realizado via chat com SLA de resposta em até 24h.`;
      
      setObservacoes(textoFormatado);
      setIsProcessandoTexto(false);
      setStatusProcessamento("");
    }, 2000);
  };

  const handleAdicionarAluno = async () => {
    if (!nome || (!email && !leadInjetado) || !mensalidade) {
      return Alert.alert("Atenção", "Nome, e-mail e valor são obrigatórios.");
    }

    let diaFinal = vencimento === "Outro" ? vencimentoOutro : vencimento;
    let diaInt = parseInt(diaFinal, 10);
    if (isNaN(diaInt) || diaInt < 1 || diaInt > 31) {
      return Alert.alert("Atenção", "Insira um dia de vencimento válido (1 a 31).");
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessão do profissional não encontrada.");

      const valorFloat = mensalidade ? parseFloat(mensalidade.replace(",", ".")) : 0;
      
      if (leadInjetado && conexaoId) {
        if (planoAtivo) {
          await supabase.from("planos").update({
            servicos_inclusos: [modalidade],
            frequencia: frequencia,
            valor_mensal: valorFloat,
            dia_vencimento: diaInt,
            observacoes: observacoes.trim(),
          }).eq("id", planoAtivo.id);
          
          await supabase.from("historico_financeiro_logs").insert([{
            personal_id: user.id, aluno_id: leadInjetado.id, referencia_id: planoAtivo.id,
            tipo_evento: "CONTRATO_ATUALIZADO", descricao: `O contrato foi reajustado para R$ ${valorFloat}.`, metadados: { valor: valorFloat }
          }]);

          Alert.alert("Sucesso!", "O contrato do aluno foi atualizado.");
          navigation.goBack();
        } else {
          const { data: novoPlano, error: erroPlano } = await supabase.from("planos").insert([{
            aluno_id: leadInjetado.id,
            personal_id: user.id,
            conexao_id: conexaoId,
            servicos_inclusos: [modalidade],
            frequencia: frequencia,
            valor_mensal: valorFloat,
            dia_vencimento: diaInt,
            observacoes: observacoes.trim(),
            status: "aguardando_assinatura" 
          }]).select().single();
          
          if (erroPlano) throw erroPlano;
          
          await supabase.from("historico_financeiro_logs").insert([{
            personal_id: user.id, aluno_id: leadInjetado.id, referencia_id: novoPlano.id,
            tipo_evento: "NOVO_CONTRATO", descricao: `Nova proposta de R$ ${valorFloat} enviada ao aluno.`, metadados: { valor: valorFloat }
          }]);
          
          await supabase.from("conexoes").update({ status: "aguardando_assinatura" }).eq("id", conexaoId);
          
          Alert.alert("Proposta Enviada!", "O aluno receberá a proposta para assinar.");
          navigation.navigate("Messages"); 
        }

      } else {
        const codigoGerado = Math.floor(100000 + Math.random() * 900000).toString();

        const { error: insertError } = await supabase.from("convites_alunos").insert([{
          email: email.trim().toLowerCase(),
          codigo_convite: codigoGerado,
          personal_id: user.id,
          nome: nome.trim(),
          servicos_inclusos: [modalidade],
          frequencia_pagamento: frequencia,
          valor_mensalidade: valorFloat,
          dia_vencimento: diaInt,
          observacoes: observacoes.trim(),
          status: "pendente",
        }]);

        if (insertError) throw insertError;

        await completarMissao("primeiro_aluno");
        await completarMissao("primeiro_contrato");

        const copiarEVoltar = async () => {
          const mensagem = `Fala ${nome.split(" ")[0]}! Baixe o MatchTrainer e clique em "Já tenho um Personal".\n\nUse o código VIP abaixo para ativar nosso contrato:\n🎟️ Código: ${codigoGerado}`;
          await Clipboard.setStringAsync(mensagem);
          navigation.goBack();
        };

        Alert.alert(
          "Contrato Digital Gerado! 🎉",
          `O aluno foi pré-cadastrado.\n\nCódigo: ${codigoGerado}`,
          [{ text: "Copiar e Enviar", onPress: copiarEVoltar }, { text: "Sair", onPress: () => navigation.goBack(), style: "cancel" }]
        );
      }

    } catch (error: any) {
      Alert.alert("Erro", error.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    state: {
      nome, email, modalidade, frequencia, mensalidade, vencimento, vencimentoOutro, observacoes,
      inputFocado, loading, isProcessandoTexto, statusProcessamento, modalUploadVisivel,
      leadInjetado, planoAtivo
    },
    actions: {
      setNome, setEmail, setModalidade, setFrequencia, setObservacoes, setVencimentoOutro,
      setInputFocado, setModalUploadVisivel, handleMoneyChange, handleVencimentoSelect,
      handlePickDocument, handlePickImage, handleTakePicture, handleMelhorarTextoManual, handleAdicionarAluno,
      mostrarAjudaFinanceiro
    }
  };
}