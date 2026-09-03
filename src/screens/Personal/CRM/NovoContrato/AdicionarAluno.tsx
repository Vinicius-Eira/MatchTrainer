import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  LayoutAnimation,
  UIManager,
  Modal
} from "react-native";

import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

import { supabase } from "../../../../services/supabase";
import { theme } from "../../../../theme/theme";
import {
  moderateScale,
  scale,
  verticalScale,
} from "../../../../utils/responsive";

import { useOnboarding } from "../../../../hooks/useOnboarding";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Modalidade = "Consultoria" | "Presencial" | "Híbrido" | string;
type Frequencia = "Avulso" | "Mensal" | "Trimestral" | "Semestral" | "Anual" | string;

interface Lead {
  id: string;
  nome: string;
  email: string;
  preferencias?: string | { servicos_buscados?: string[] };
}

interface Plano {
  id: string;
  servicos_inclusos?: string[];
  frequencia?: Frequencia;
  valor_mensal?: number;
  dia_vencimento?: number | string;
  observacoes?: string;
}

interface RouteParams {
  leadInjetado?: Lead;
  planoAtivo?: Plano;
  conexaoId?: string;
}

interface AdicionarAlunoProps {
  route: {
    params?: RouteParams;
  };
  navigation: {
    goBack: () => void;
    navigate: (screen: string, params?: any) => void;
  };
}

interface OpcaoModalidade {
  id: Modalidade;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const OPCOES_MODALIDADE: OpcaoModalidade[] = [
  { id: "Consultoria", label: "Consultoria", icon: "phone-portrait-outline" },
  { id: "Presencial", label: "Presencial", icon: "barbell-outline" },
  { id: "Híbrido", label: "Híbrido", icon: "diamond-outline" },
];

export default function AdicionarAluno({ route, navigation }: AdicionarAlunoProps) {
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
  const isDiaPadrao = ["05", "5", "10", "20"].includes(diaInicial);
  const diaFormatado = diaInicial.length === 1 ? `0${diaInicial}` : diaInicial;

  const [modalUploadVisivel, setModalUploadVisivel] = useState<boolean>(false);

  const [nome, setNome] = useState<string>(leadInjetado?.nome || "");
  const [email, setEmail] = useState<string>(leadInjetado?.email || "");
  const [modalidade, setModalidade] = useState<Modalidade>(servicoDesejado);
  const [frequencia, setFrequencia] = useState<Frequencia>(planoAtivo?.frequencia || "Mensal");
  const [mensalidade, setMensalidade] = useState<string>(planoAtivo?.valor_mensal?.toString() || "");
  const [vencimento, setVencimento] = useState<string>(isDiaPadrao ? diaFormatado : "Outro");
  const [vencimentoOutro, setVencimentoOutro] = useState<string>(isDiaPadrao ? "" : diaFormatado);
  const [observacoes, setObservacoes] = useState<string>(planoAtivo?.observacoes || "");
  
  const [inputFocado, setInputFocado] = useState<string | null>(null);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [isProcessandoTexto, setIsProcessandoTexto] = useState<boolean>(false);
  const [statusProcessamento, setStatusProcessamento] = useState<string>("");


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
    setStatusProcessamento("Lendo o texto da imagem...");

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
          setObservacoes((prev) => prev + "\n" + textoReal);
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
        const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
        if (!result.canceled && result.assets && result.assets.length > 0) {
           Alert.alert("Aviso", `Para extrair texto de PDFs e Docs, precisaremos conectar um servidor próprio no futuro. Por enquanto, teste com a Câmera ou Galeria!`);
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
    setStatusProcessamento("Aguardando backend de IA para otimizar...");
    setTimeout(() => {
      setIsProcessandoTexto(false);
      Alert.alert("Aviso", "A integração com IA será necessária para modificar a redação automaticamente.");
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
      let servicosDB = modalidade === "Híbrido" ? ["Consultoria", "Presencial"] : [modalidade];

      if (leadInjetado && conexaoId) {
        
        if (planoAtivo) {
          await supabase.from("planos").update({
            servicos_inclusos: servicosDB,
            frequencia: frequencia,
            valor_mensal: valorFloat,
            dia_vencimento: diaInt,
            observacoes: observacoes.trim(),
          }).eq("id", planoAtivo.id);
          
          Alert.alert("Sucesso!", "O contrato do aluno foi atualizado com as novas condições.");
          navigation.goBack();
        } else {
          const { error: erroPlano } = await supabase.from("planos").insert([{
            personal_id: user.id,
            aluno_id: leadInjetado.id,
            servicos_inclusos: servicosDB,
            frequencia: frequencia,
            valor_mensal: valorFloat,
            dia_vencimento: diaInt,
            observacoes: observacoes.trim(),
            status: "aguardando_assinatura"
          }]);
          
          if (erroPlano) throw erroPlano;
          
          await supabase.from("conexoes").update({ status: "aguardando_assinatura" }).eq("id", conexaoId);
          
          Alert.alert("Proposta Enviada!", "O aluno receberá uma notificação no app para revisar e aceitar os valores.");
          navigation.goBack(); 
        }

      } else {
        const codigoGerado = Math.floor(100000 + Math.random() * 900000).toString();

        const { error: insertError } = await supabase.from("convites_alunos").insert([{
          email: email.trim().toLowerCase(),
          codigo_convite: codigoGerado,
          personal_id: user.id,
          nome: nome.trim(),
          servicos_inclusos: servicosDB,
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

  const frequenciaList: { id: string; label: string }[] = [
    { id: "Avulso", label: "Avulso" },
    { id: "Mensal", label: "Mensal" },
    { id: "Trimestral", label: "Trimestral" },
    { id: "Semestral", label: "Semestral" },
    { id: "Anual", label: "Anual" },
  ];

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />

      <BlurView intensity={Platform.OS === "ios" ? 80 : 100} tint="dark" experimentalBlurMethod="dimezisBlurView" style={styles.headerGlass}>
        <TouchableOpacity style={styles.btnVoltar} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={moderateScale(24)} color="#FFF" style={{ marginLeft: scale(-2) }} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          {planoAtivo ? "AJUSTAR CONTRATO" : leadInjetado ? "ENVIAR PROPOSTA" : "NOVO CONTRATO"}
        </Text>
        <View style={{ width: scale(44) }} />
      </BlurView>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={Platform.OS === "ios" ? verticalScale(40) : 0}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.innerContent}>
            
            <View style={styles.headerTextContainer}>
              <View style={styles.iconWrapper}>
                <View style={styles.iconGlow} />
                <LinearGradient colors={["rgba(255, 107, 0, 0.25)", "rgba(255, 107, 0, 0.05)"]} style={styles.iconCircle}>
                  <MaterialCommunityIcons name="file-sign" size={moderateScale(38)} color={theme.colors.primary} />
                </LinearGradient>
              </View>
              
              <Text style={styles.title}>
                {planoAtivo ? "Ajustar " : leadInjetado ? "Enviar " : "Vincular "}
                <Text style={styles.titleHighlight}>{planoAtivo ? "Contrato." : leadInjetado ? "Proposta." : "Aluno."}</Text>
              </Text>
              <Text style={styles.subtitle}>
                {planoAtivo 
                  ? "Modifique os valores, datas ou serviços. O aluno verá as novas condições no app dele na mesma hora." 
                  : leadInjetado 
                  ? "Ajuste os valores do acompanhamento. O aluno será notificado no app para revisar e aceitar a parceria." 
                  : "Configure as regras financeiras e escopo de trabalho para gerar a credencial VIP de acesso."}
              </Text>
            </View>

            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="person-circle" size={moderateScale(20)} color={theme.colors.primary} style={{ marginRight: scale(8) }} />
                <Text style={styles.sectionTitle}>Dados Cadastrais</Text>
              </View>
            </View>
            
            <View style={[styles.inputBox, inputFocado === "nome" && styles.inputBoxFocused, leadInjetado && {opacity: 0.6}]}>
              <View style={[styles.inputIconWrapper, inputFocado === "nome" && styles.inputIconWrapperFocused]}>
                <Ionicons name="person" size={moderateScale(16)} color={inputFocado === "nome" ? theme.colors.primary : "#888"} />
              </View>
              <TextInput style={styles.input} placeholder="Nome completo" placeholderTextColor="#666" value={nome} onChangeText={setNome} onFocus={() => setInputFocado("nome")} onBlur={() => setInputFocado(null)} cursorColor={theme.colors.primary} keyboardAppearance="dark" autoCapitalize="words" editable={!leadInjetado}/>
            </View>
            
            <View style={[styles.inputBox, inputFocado === "email" && styles.inputBoxFocused, leadInjetado && {opacity: 0.6}]}>
              <View style={[styles.inputIconWrapper, inputFocado === "email" && styles.inputIconWrapperFocused]}>
                <Ionicons name="mail" size={moderateScale(16)} color={inputFocado === "email" ? theme.colors.primary : "#888"} />
              </View>
              <TextInput style={styles.input} placeholder="E-mail principal" placeholderTextColor="#666" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} onFocus={() => setInputFocado("email")} onBlur={() => setInputFocado(null)} cursorColor={theme.colors.primary} keyboardAppearance="dark" editable={!leadInjetado} />
            </View>

            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="layers" size={moderateScale(20)} color={theme.colors.primary} style={{ marginRight: scale(8) }} />
                <Text style={styles.sectionTitle}>Escopo do Serviço</Text>
              </View>
            </View>
            <View style={styles.modalidadeContainer}>
              {OPCOES_MODALIDADE.map((opcao) => {
                const isSelected = modalidade === opcao.id;
                let iconColor = isSelected ? theme.colors.primary : "#666";
                if (isSelected && opcao.id === "Híbrido") iconColor = "#0A84FF";
                return (
                  <TouchableOpacity key={opcao.id} style={[styles.modalidadeCard, isSelected && styles.modalidadeCardActive, isSelected && opcao.id === "Híbrido" && { borderColor: "#0A84FF", backgroundColor: "rgba(10, 132, 255, 0.08)" }]} onPress={() => setModalidade(opcao.id)} activeOpacity={0.8}>
                    <Ionicons name={isSelected ? "checkmark-circle" : opcao.icon} size={moderateScale(24)} color={iconColor} style={{ marginBottom: verticalScale(8) }} />
                    <Text style={[styles.modalidadeCardText, isSelected && styles.modalidadeCardTextActive, isSelected && opcao.id === "Híbrido" && { color: "#0A84FF" }]}>{opcao.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="wallet" size={moderateScale(20)} color="#00E676" style={{ marginRight: scale(8) }} />
                <Text style={styles.sectionTitle}>Detalhes Financeiros</Text>
              </View>
            </View>
            <View style={styles.financeiroCard}>
              <Text style={styles.financeiroLabel}>Valor do Contrato</Text>
              <View style={[styles.inputBox, { marginBottom: verticalScale(20) }, inputFocado === "valor" && styles.inputBoxFocusedFinance]}>
                <View style={[styles.inputIconWrapper, { backgroundColor: "rgba(0, 230, 118, 0.1)", borderColor: "rgba(0, 230, 118, 0.2)" }]}><MaterialCommunityIcons name="currency-brl" size={moderateScale(18)} color="#00E676" /></View>
                <TextInput style={[styles.input, { fontSize: moderateScale(20), fontWeight: 'bold' }]} placeholder="0,00" placeholderTextColor="#666" keyboardType="numeric" value={mensalidade} onChangeText={handleMoneyChange} onFocus={() => setInputFocado("valor")} onBlur={() => setInputFocado(null)} cursorColor="#00E676" keyboardAppearance="dark" />
              </View>

              <Text style={styles.financeiroLabel}>Frequência de Cobrança</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.freqScrollContainer}>
                {frequenciaList.map((item) => (
                  <TouchableOpacity key={item.id} style={[styles.freqChip, frequencia === item.id && styles.freqChipActive]} onPress={() => setFrequencia(item.id)}>
                    <Text style={[styles.freqChipText, frequencia === item.id && styles.freqChipTextActive]}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.financeiroLabel, { marginTop: verticalScale(20), textAlign: 'center' }]}>Dia de Vencimento</Text>
              <View style={{ alignItems: 'center' }}>
                <View style={[styles.chipsContainerWrap, { justifyContent: 'center' }]}>
                  {["05", "10", "20"].map((item) => (
                    <TouchableOpacity key={item} style={[styles.vencimentoChip, vencimento === item && styles.vencimentoChipActive]} onPress={() => handleVencimentoSelect(item)}>
                      <Text style={[styles.vencimentoChipText, vencimento === item && styles.vencimentoChipTextActive]}>Dia {item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity style={[styles.vencimentoChip, { marginTop: verticalScale(10), minWidth: scale(100), alignItems: 'center' }, vencimento === "Outro" && styles.vencimentoChipActive]} onPress={() => handleVencimentoSelect("Outro")}>
                  <Text style={[styles.vencimentoChipText, vencimento === "Outro" && styles.vencimentoChipTextActive]}>Outro</Text>
                </TouchableOpacity>
              </View>
              {vencimento === "Outro" && (
                <View style={[styles.inputBox, { marginTop: verticalScale(15), marginBottom: 0 }, inputFocado === "vencimento_outro" && styles.inputBoxFocusedFinance]}>
                  <View style={[styles.inputIconWrapper, { backgroundColor: "rgba(255, 107, 0, 0.1)", borderColor: "rgba(255, 107, 0, 0.6)" }]}><Ionicons name="calendar" size={moderateScale(18)} color="#FF6B00" /></View>
                  <TextInput style={styles.input} placeholder="Dia (1 a 31)" placeholderTextColor="#666" keyboardType="numeric" maxLength={2} value={vencimentoOutro} onChangeText={setVencimentoOutro} onFocus={() => setInputFocado("vencimento_outro")} onBlur={() => setInputFocado(null)} cursorColor="#00E676" keyboardAppearance="dark" />
                </View>
              )}
            </View>

            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="document-text" size={moderateScale(20)} color={theme.colors.primary} style={{ marginRight: scale(8) }} />
                <Text style={styles.sectionTitle}>Regras do Contrato</Text>
              </View>
              <Text style={styles.sectionDesc}>Digite os termos ou importe de um arquivo.</Text>
            </View>

            <View style={styles.termosCard}>
              <View style={styles.termosHeader}>
                <Text style={styles.termosTitle}>Editor Manual</Text>
                <TouchableOpacity style={styles.btnImportarMini} onPress={() => setModalUploadVisivel(true)}>
                  <Ionicons name="cloud-upload-outline" size={16} color={theme.colors.primary} />
                  <Text style={styles.btnImportarMiniText}>Importar Foto</Text>
                </TouchableOpacity>
              </View>

              {isProcessandoTexto ? (
                <View style={styles.iaProcessingContainer}>
                  <ActivityIndicator size="large" color="#A020F0" />
                  <Text style={styles.iaProcessingTitle}>Processando Arquivo...</Text>
                  <Text style={styles.iaProcessingStatus}>{statusProcessamento}</Text>
                </View>
              ) : (
                <>
                  <View style={[styles.inputBoxArea, inputFocado === "obs" && styles.inputBoxFocused]}>
                    <TextInput
                      style={styles.inputArea}
                      placeholder="Escreva aqui ou importe uma foto. As palavras da foto aparecerão exatamente aqui."
                      placeholderTextColor="#666"
                      multiline
                      value={observacoes}
                      onChangeText={setObservacoes}
                      onFocus={() => setInputFocado("obs")}
                      onBlur={() => setInputFocado(null)}
                      cursorColor={theme.colors.primary}
                      keyboardAppearance="dark"
                    />
                  </View>
                  
                  <TouchableOpacity style={styles.btnMagicIA} onPress={handleMelhorarTextoManual} activeOpacity={0.8}>
                    <LinearGradient colors={["rgba(160, 32, 240, 0.2)", "rgba(160, 32, 240, 0.05)"]} style={styles.btnMagicIAGradient}>
                      <FontAwesome5 name="magic" size={moderateScale(14)} color="#A020F0" style={{marginRight: scale(8)}} />
                      <Text style={styles.btnMagicIAText}>Organizar e Melhorar Texto</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}
            </View>

            <TouchableOpacity style={[styles.btnPrimary, loading && { opacity: 0.7 }]} onPress={handleAdicionarAluno} disabled={loading} activeOpacity={0.85}>
              <LinearGradient colors={["#00E676", "#00B259"]} style={styles.btnGradient}>
                {loading ? <ActivityIndicator size="small" color="#000" /> : <><Ionicons name="shield-checkmark" size={moderateScale(20)} color="#000" style={{ marginRight: scale(10) }} /><Text style={styles.btnPrimaryText}>{planoAtivo ? "SALVAR AJUSTES NO CONTRATO" : leadInjetado ? "ENVIAR PROPOSTA PARA O ALUNO" : "Firmar Contrato Digital"}</Text></>}
              </LinearGradient>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={modalUploadVisivel} transparent animationType="slide" onRequestClose={() => setModalUploadVisivel(false)}>
        <View style={styles.modalUploadOverlay}>
          <TouchableOpacity style={{flex: 1}} onPress={() => setModalUploadVisivel(false)} activeOpacity={1} />
          <View style={styles.modalUploadSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Importar Contrato Base</Text>
            <Text style={styles.sheetSubtitle}>Como você deseja enviar as regras?</Text>

            <TouchableOpacity style={styles.uploadOptionBtn} onPress={handlePickDocument} activeOpacity={0.7}>
              <View style={[styles.uploadOptionIcon, { backgroundColor: 'rgba(10, 132, 255, 0.15)', borderColor: 'rgba(10, 132, 255, 0.3)' }]}><Ionicons name="document-text" size={24} color="#0A84FF" /></View>
              <View style={styles.uploadOptionTexts}><Text style={styles.uploadOptionTitle}>Documento (PDF/Word)</Text><Text style={styles.uploadOptionDesc}>Necessitará de backend para funcionar.</Text></View>
              <Ionicons name="chevron-forward" size={18} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadOptionBtn} onPress={handlePickImage} activeOpacity={0.7}>
              <View style={[styles.uploadOptionIcon, { backgroundColor: 'rgba(255, 215, 0, 0.15)', borderColor: 'rgba(255, 215, 0, 0.3)' }]}><Ionicons name="images" size={24} color="#FFD700" /></View>
              <View style={styles.uploadOptionTexts}><Text style={styles.uploadOptionTitle}>Galeria de Fotos (OCR Ativo)</Text><Text style={styles.uploadOptionDesc}>Lê os textos de prints e imagens.</Text></View>
              <Ionicons name="chevron-forward" size={18} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadOptionBtn} onPress={handleTakePicture} activeOpacity={0.7}>
              <View style={[styles.uploadOptionIcon, { backgroundColor: 'rgba(0, 230, 118, 0.15)', borderColor: 'rgba(0, 230, 118, 0.3)' }]}><Ionicons name="camera" size={24} color="#00E676" /></View>
              <View style={styles.uploadOptionTexts}><Text style={styles.uploadOptionTitle}>Tirar Foto (OCR Ativo)</Text><Text style={styles.uploadOptionDesc}>Lê o texto de contratos impressos.</Text></View>
              <Ionicons name="chevron-forward" size={18} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.sheetBtnClose} onPress={() => setModalUploadVisivel(false)}>
               <Text style={styles.sheetBtnCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#000000", position: "relative" },
  
  glowTopLeft: { 
    position: "absolute", top: verticalScale(-100), left: scale(-50), width: scale(300), height: scale(300), 
    borderRadius: moderateScale(150), backgroundColor: theme.colors.primary, opacity: 0.12 
  },
  glowBottomRight: { 
    position: "absolute", bottom: verticalScale(-50), right: scale(-100), width: scale(350), height: scale(350), 
    borderRadius: moderateScale(175), backgroundColor: "#00E676", opacity: 0.08 
  },
  
  headerGlass: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 100, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: Platform.OS === "ios" ? verticalScale(60) : verticalScale(40), paddingBottom: verticalScale(15), paddingHorizontal: scale(20), borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  btnVoltar: { width: scale(44), height: scale(44), borderRadius: moderateScale(22), backgroundColor: "rgba(255,255,255,0.05)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  headerTitle: { fontFamily: theme.fonts.title, fontSize: moderateScale(14), color: "#FFF", letterSpacing: 1.5, textTransform: "uppercase" },
  scrollContent: { flexGrow: 1 },
  innerContent: { paddingHorizontal: scale(24), paddingTop: Platform.OS === "ios" ? verticalScale(130) : verticalScale(110), paddingBottom: verticalScale(40) },
  
  headerTextContainer: { alignItems: "center", marginBottom: verticalScale(35) },
  iconWrapper: { position: "relative", marginBottom: verticalScale(25), justifyContent: "center", alignItems: "center" },
  
  iconGlow: { 
    position: "absolute", width: scale(80), height: scale(80), borderRadius: moderateScale(40), 
    backgroundColor: theme.colors.primary, opacity: 0.4 
  },
  
  iconCircle: { width: scale(84), height: scale(84), borderRadius: moderateScale(42), justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.6)" },
  title: { fontFamily: theme.fonts.title, fontSize: moderateScale(34), color: "#FFF", letterSpacing: -0.5, lineHeight: moderateScale(40), textAlign: "center" },
  titleHighlight: { color: theme.colors.primary },
  subtitle: { fontFamily: theme.fonts.body, fontSize: moderateScale(15), color: "#AAA", marginTop: verticalScale(12), lineHeight: moderateScale(24), textAlign: "center", paddingHorizontal: scale(10) },
  sectionHeader: { marginBottom: verticalScale(16), marginTop: verticalScale(10) },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", marginBottom: verticalScale(4) },
  sectionTitle: { color: "#FFF", fontSize: moderateScale(18), fontFamily: theme.fonts.title, letterSpacing: 0.2 },
  sectionDesc: { color: "#888", fontSize: moderateScale(13), lineHeight: moderateScale(20), paddingLeft: scale(28) },
  
  inputBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#111", borderRadius: moderateScale(20), borderWidth: 1, borderColor: "#222", paddingLeft: scale(12), marginBottom: verticalScale(16), height: verticalScale(64), shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 },
  inputBoxFocused: { borderColor: theme.colors.primary, backgroundColor: "rgba(255, 107, 0, 0.05)" },
  inputBoxFocusedFinance: { borderColor: "#00E676", backgroundColor: "rgba(0, 230, 118, 0.05)" },
  inputIconWrapper: { width: scale(40), height: scale(40), borderRadius: moderateScale(12), backgroundColor: "rgba(255,255,255,0.03)", justifyContent: "center", alignItems: "center", marginRight: scale(14), borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  inputIconWrapperFocused: { backgroundColor: "rgba(255, 107, 0, 0.1)", borderColor: "rgba(255, 107, 0, 0.2)" },
  input: { flex: 1, color: "#FFF", fontSize: moderateScale(16), fontFamily: theme.fonts.body, height: "100%", backgroundColor: "transparent" },
  
  modalidadeContainer: { flexDirection: "row", justifyContent: "space-between", gap: scale(10), marginBottom: verticalScale(24) },
  modalidadeCard: { flex: 1, height: verticalScale(90), backgroundColor: "#111", borderRadius: moderateScale(18), borderWidth: 1, borderColor: "#222", justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 },
  modalidadeCardActive: { borderColor: theme.colors.primary, backgroundColor: "rgba(255, 107, 0, 0.08)", shadowColor: theme.colors.primary, shadowOpacity: 0.2 },
  modalidadeCardText: { color: "#888", fontSize: moderateScale(12), fontWeight: "bold", letterSpacing: 0.2 },
  modalidadeCardTextActive: { color: theme.colors.primary, fontWeight: "900" },
  
  financeiroCard: { backgroundColor: "#111", borderRadius: moderateScale(24), padding: scale(20), borderWidth: 1, borderColor: "#222", marginBottom: verticalScale(24), shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  financeiroLabel: { color: "#AAA", fontSize: moderateScale(13), fontFamily: theme.fonts.body, marginBottom: verticalScale(8), marginLeft: scale(4) },
  
  freqScrollContainer: { flexDirection: "row", gap: scale(8), paddingBottom: verticalScale(10) },
  freqChip: { paddingHorizontal: scale(16), paddingVertical: verticalScale(10), backgroundColor: "#1A1A1A", borderRadius: moderateScale(12), borderWidth: 1, borderColor: "#333", marginRight: scale(8) },
  freqChipActive: { backgroundColor: "rgba(0, 230, 118, 0.1)", borderColor: "#00E676" },
  freqChipText: { color: "#888", fontSize: moderateScale(13), fontFamily: theme.fonts.body },
  freqChipTextActive: { color: "#00E676", fontWeight: "bold" },
  
  chipsContainerWrap: { flexDirection: "row", flexWrap: "wrap", gap: scale(10), width: "100%" },
  vencimentoChip: { paddingHorizontal: scale(16), paddingVertical: verticalScale(10), backgroundColor: "#1A1A1A", borderRadius: moderateScale(12), borderWidth: 1, borderColor: "#333", marginHorizontal: scale(5) },
  vencimentoChipActive: { backgroundColor: "rgba(255, 107, 0, 0.1)", borderColor: theme.colors.primary },
  vencimentoChipText: { color: "#888", fontSize: moderateScale(13), fontFamily: theme.fonts.body },
  vencimentoChipTextActive: { color: theme.colors.primary, fontWeight: "bold" },

  termosCard: { backgroundColor: "#111", borderRadius: moderateScale(24), padding: scale(20), borderWidth: 1, borderColor: "#222", marginBottom: verticalScale(24), shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  termosHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: verticalScale(16) },
  termosTitle: { color: "#FFF", fontSize: moderateScale(15), fontFamily: theme.fonts.title },
  btnImportarMini: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255, 107, 0, 0.1)", paddingHorizontal: scale(12), paddingVertical: verticalScale(6), borderRadius: moderateScale(8), borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.3)" },
  btnImportarMiniText: { color: theme.colors.primary, fontSize: moderateScale(12), fontWeight: "bold", marginLeft: scale(6) },
  
  iaProcessingContainer: { height: verticalScale(150), justifyContent: "center", alignItems: "center", backgroundColor: "#1A1A1A", borderRadius: moderateScale(16), borderWidth: 1, borderColor: "#333" },
  iaProcessingTitle: { color: "#A020F0", fontSize: moderateScale(14), fontWeight: "bold", marginTop: verticalScale(12) },
  iaProcessingStatus: { color: "#888", fontSize: moderateScale(12), marginTop: verticalScale(4) },
  
  inputBoxArea: { minHeight: verticalScale(120), backgroundColor: "#1A1A1A", borderRadius: moderateScale(16), borderWidth: 1, borderColor: "#333", padding: scale(12) },
  inputArea: { flex: 1, color: "#FFF", fontSize: moderateScale(14), fontFamily: theme.fonts.body, textAlignVertical: "top" },
  
  btnMagicIA: { marginTop: verticalScale(12), borderRadius: moderateScale(12), overflow: "hidden" },
  btnMagicIAGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: verticalScale(12), borderWidth: 1, borderColor: "rgba(160, 32, 240, 0.3)", borderRadius: moderateScale(12) },
  btnMagicIAText: { color: "#A020F0", fontSize: moderateScale(13), fontWeight: "bold" },
  
  btnPrimary: { height: verticalScale(60), borderRadius: moderateScale(20), overflow: "hidden", shadowColor: "#00E676", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  btnGradient: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  btnPrimaryText: { color: "#000", fontSize: moderateScale(15), fontFamily: theme.fonts.title, fontWeight: "900", letterSpacing: 0.5, textTransform: "uppercase" },

  modalUploadOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.7)", justifyContent: "flex-end" },
  modalUploadSheet: { backgroundColor: "#111", borderTopLeftRadius: moderateScale(24), borderTopRightRadius: moderateScale(24), paddingHorizontal: scale(24), paddingBottom: Platform.OS === "ios" ? verticalScale(40) : verticalScale(24), paddingTop: verticalScale(12), borderWidth: 1, borderColor: "#222" },
  sheetHandle: { width: scale(40), height: verticalScale(4), backgroundColor: "#333", borderRadius: moderateScale(2), alignSelf: "center", marginBottom: verticalScale(20) },
  sheetTitle: { color: "#FFF", fontSize: moderateScale(20), fontFamily: theme.fonts.title, marginBottom: verticalScale(4) },
  sheetSubtitle: { color: "#888", fontSize: moderateScale(14), fontFamily: theme.fonts.body, marginBottom: verticalScale(24) },
  
  uploadOptionBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#1A1A1A", padding: scale(16), borderRadius: moderateScale(16), marginBottom: verticalScale(12), borderWidth: 1, borderColor: "#333" },
  uploadOptionIcon: { width: scale(48), height: scale(48), borderRadius: moderateScale(12), justifyContent: "center", alignItems: "center", marginRight: scale(16), borderWidth: 1 },
  uploadOptionTexts: { flex: 1 },
  uploadOptionTitle: { color: "#FFF", fontSize: moderateScale(15), fontWeight: "bold", marginBottom: verticalScale(2) },
  uploadOptionDesc: { color: "#888", fontSize: moderateScale(12) },
  
  sheetBtnClose: { marginTop: verticalScale(16), alignItems: "center", paddingVertical: verticalScale(12) },
  sheetBtnCloseText: { color: "#FFF", fontSize: moderateScale(16), fontWeight: "bold" }
});