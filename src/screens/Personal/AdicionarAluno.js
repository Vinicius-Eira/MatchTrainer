import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar,
  ActivityIndicator
} from "react-native";
import * as Clipboard from 'expo-clipboard';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { supabase } from "../../services/supabase";
import { theme } from "../../theme/theme";

import { useOnboarding } from "../../hooks/useOnboarding";

const OPCOES_MODALIDADE = [
  { id: "Consultoria", label: "Consultoria", icon: "phone-portrait-outline" },
  { id: "Presencial", label: "Presencial", icon: "barbell-outline" },
  { id: "Híbrido", label: "Híbrido", icon: "diamond-outline" }
];

export default function AdicionarAluno({ navigation }) {
  const { completarMissao } = useOnboarding();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  
  const [modalidade, setModalidade] = useState("Consultoria"); 
  
  const [frequencia, setFrequencia] = useState("Mensal"); 
  const [objetivo, setObjetivo] = useState("hipertrofia"); 
  const [mensalidade, setMensalidade] = useState("");
  const [vencimento, setVencimento] = useState("10");
  const [observacoes, setObservacoes] = useState("");
  const [loading, setLoading] = useState(false);
  const [inputFocado, setInputFocado] = useState(null);

  const handleMoneyChange = (text) => {
    let numericValue = text.replace(/[^0-9]/g, '');
    if (numericValue) {
      numericValue = (parseInt(numericValue) / 100).toFixed(2);
      setMensalidade(numericValue.replace('.', ','));
    } else {
      setMensalidade('');
    }
  };

  const handleAdicionarAluno = async () => {
    if (!nome || !email) {
      return Alert.alert("Atenção", "Nome e E-mail são obrigatórios.");
    }
    if (!mensalidade) {
      return Alert.alert("Atenção", "O Valor do contrato é obrigatório.");
    }

    let diaInt = null;
    if (vencimento) {
      diaInt = parseInt(vencimento);
      if (isNaN(diaInt) || diaInt < 1 || diaInt > 31) {
        return Alert.alert("Atenção", "Insira um dia de vencimento válido (1 a 31).");
      }
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessão do profissional não encontrada.");

      const codigoGerado = Math.floor(100000 + Math.random() * 900000).toString();
      const valorFloat = mensalidade ? parseFloat(mensalidade.replace(',', '.')) : 0;

      let servicosDB = [];
      if (modalidade === "Híbrido") {
        servicosDB = ["Consultoria", "Presencial"];
      } else {
        servicosDB = [modalidade];
      }

      const { error: insertError } = await supabase
        .from('convites_alunos')
        .insert([
          {
            email: email.trim().toLowerCase(),
            codigo_convite: codigoGerado,
            personal_id: user.id,
            nome: nome.trim(),
            servicos_inclusos: servicosDB, 
            objetivo_principal: objetivo,
            frequencia_pagamento: frequencia,
            valor_mensalidade: valorFloat,
            dia_vencimento: diaInt,
            observacoes: observacoes.trim(), 
            status: 'pendente'
          }
        ]);

      if (insertError) throw insertError;

      await completarMissao('primeiro_aluno');
      await completarMissao('primeiro_contrato');

      const copiarEVoltar = async () => {
        const mensagem = `Fala ${nome.split(' ')[0]}! Baixe o MatchTrainer e clique em "Já tenho um Personal".\n\nUse o código VIP abaixo para ativar nosso contrato:\n🎟️ Código: ${codigoGerado}`;
        await Clipboard.setStringAsync(mensagem);
        Alert.alert("Copiado! ✅", "O texto foi copiado. É só colar no WhatsApp do aluno.");
        navigation.goBack();
      };

      Alert.alert(
        "Contrato Digital Gerado! 🎉",
        `O aluno foi pré-cadastrado.\nAssim que ele inserir o código no app, a cobrança começará a rodar no painel de Recebimentos.\n\nCódigo: ${codigoGerado}`,
        [
          { text: "Copiar e Enviar", onPress: copiarEVoltar },
          { text: "Apenas Sair", onPress: () => navigation.goBack(), style: "cancel" }
        ]
      );

    } catch (error) {
      Alert.alert("Erro ao salvar", error.message || "Não foi possível cadastrar o aluno.");
    } finally {
      setLoading(false);
    }
  };

  const frequenciaList = [
    { id: "Avulso", label: "Avulso" },
    { id: "Mensal", label: "Mensal" },
    { id: "Trimestral", label: "Trimestral" },
    { id: "Semestral", label: "Semestral" },
    { id: "Anual", label: "Anual" }
  ];

  const objetivosList = [
    { id: "hipertrofia", label: "Hipertrofia", icon: "dumbbell" },
    { id: "emagrecimento", label: "Emagrecimento", icon: "fire" },
    { id: "saude", label: "Saúde & Qualidade", icon: "heartbeat" },
    { id: "performance", label: "Performance", icon: "bolt" }
  ];

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />

      <BlurView 
        intensity={Platform.OS === 'ios' ? 80 : 100} 
        tint="dark" 
        experimentalBlurMethod="dimezisBlurView" 
        style={styles.headerGlass}
      >
        <TouchableOpacity style={styles.btnVoltar} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color="#FFF" style={{ marginLeft: -2 }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>NOVO CONTRATO</Text>
        <View style={{ width: 44 }} />
      </BlurView>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.innerContent}>
            
            <View style={styles.headerTextContainer}>
              <View style={styles.iconWrapper}>
                <View style={styles.iconGlow} />
                <LinearGradient colors={["rgba(255, 107, 0, 0.25)", "rgba(255, 107, 0, 0.05)"]} style={styles.iconCircle}>
                  <MaterialCommunityIcons name="file-sign" size={38} color={theme.colors.primary} />
                </LinearGradient>
              </View>
              <Text style={styles.title}>Vincular <Text style={styles.titleHighlight}>Aluno.</Text></Text>
              <Text style={styles.subtitle}>Configure as regras financeiras e escopo de trabalho para gerar a credencial VIP do seu novo aluno.</Text>
            </View>

            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="person-circle" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.sectionTitle}>Dados Cadastrais</Text>
              </View>
            </View>
            
            <View style={[styles.inputBox, inputFocado === "nome" && styles.inputBoxFocused]}>
              <View style={[styles.inputIconWrapper, inputFocado === "nome" && styles.inputIconWrapperFocused]}>
                <Ionicons name="person" size={16} color={inputFocado === "nome" ? theme.colors.primary : "#888"} />
              </View>
              <TextInput
                style={[styles.input, Platform.OS === "web" && { outlineStyle: "none" }]}
                placeholder="Nome completo do aluno"
                placeholderTextColor="#666"
                value={nome}
                onChangeText={setNome}
                onFocus={() => setInputFocado("nome")}
                onBlur={() => setInputFocado(null)}
                cursorColor={theme.colors.primary}
                keyboardAppearance="dark"
                autoCapitalize="words"
              />
            </View>

            <View style={[styles.inputBox, inputFocado === "email" && styles.inputBoxFocused]}>
              <View style={[styles.inputIconWrapper, inputFocado === "email" && styles.inputIconWrapperFocused]}>
                <Ionicons name="mail" size={16} color={inputFocado === "email" ? theme.colors.primary : "#888"} />
              </View>
              <TextInput
                style={[styles.input, Platform.OS === "web" && { outlineStyle: "none" }]}
                placeholder="E-mail principal"
                placeholderTextColor="#666"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setInputFocado("email")}
                onBlur={() => setInputFocado(null)}
                cursorColor={theme.colors.primary}
                keyboardAppearance="dark"
              />
            </View>

            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="layers" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.sectionTitle}>Escopo do Serviço (Pacote)</Text>
              </View>
              <Text style={styles.sectionDesc}>O que será entregue a este aluno?</Text>
            </View>

            <View style={styles.modalidadeContainer}>
              {OPCOES_MODALIDADE.map(opcao => {
                const isSelected = modalidade === opcao.id;
                let iconColor = isSelected ? theme.colors.primary : "#666";
                if (isSelected && opcao.id === "Híbrido") iconColor = "#0A84FF";
                
                return (
                  <TouchableOpacity 
                    key={opcao.id} 
                    style={[
                      styles.modalidadeCard, 
                      isSelected && styles.modalidadeCardActive,
                      isSelected && opcao.id === "Híbrido" && { borderColor: "#0A84FF", backgroundColor: "rgba(10, 132, 255, 0.08)" }
                    ]} 
                    onPress={() => setModalidade(opcao.id)} 
                    activeOpacity={0.8}
                  >
                    <Ionicons 
                      name={isSelected ? "checkmark-circle" : opcao.icon} 
                      size={24} 
                      color={iconColor} 
                      style={{ marginBottom: 8 }} 
                    />
                    <Text style={[
                      styles.modalidadeCardText, 
                      isSelected && styles.modalidadeCardTextActive,
                      isSelected && opcao.id === "Híbrido" && { color: "#0A84FF" }
                    ]}>
                      {opcao.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="flag" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.sectionTitle}>Foco de Treino Principal</Text>
              </View>
            </View>

            <View style={styles.selectorGrid}>
              {objetivosList.map((item) => {
                const isActive = objetivo === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.gridButton, isActive && styles.gridButtonActive]}
                    onPress={() => setObjetivo(item.id)}
                    activeOpacity={0.7}
                  >
                    {isActive && <LinearGradient colors={["rgba(255, 107, 0, 0.08)", "transparent"]} style={StyleSheet.absoluteFill} borderRadius={20} />}
                    <View style={[styles.gridIconBox, isActive && styles.gridIconBoxActive]}>
                      <FontAwesome5 name={item.icon} size={16} color={isActive ? theme.colors.primary : "#888"} />
                    </View>
                    <Text style={[styles.selectorText, isActive && styles.selectorTextActive, { fontSize: 13, marginTop: 8 }]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="wallet" size={20} color="#FF6B00" style={{ marginRight: 8 }} />
                <Text style={styles.sectionTitle}>Detalhes Financeiros</Text>
              </View>
            </View>

            <View style={styles.financeiroCard}>
              <Text style={styles.financeiroLabel}>Frequência de Cobrança</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.freqScrollContainer}>
                {frequenciaList.map((item) => {
                  const isActive = frequencia === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.freqChip, isActive && styles.freqChipActive]}
                      onPress={() => setFrequencia(item.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.freqChipText, isActive && styles.freqChipTextActive]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={[styles.financeiroLabel, { marginTop: 10, marginBottom: 10 }]}>Valores e Datas</Text>
              <View style={styles.rowInputs}>
                <View style={[styles.inputBox, { flex: 1.2, marginRight: 8, marginBottom: 0 }, inputFocado === "valor" && styles.inputBoxFocusedFinance]}>
                  <View style={[styles.inputIconWrapper, { backgroundColor: "rgba(0, 230, 118, 0.1)", borderColor: "rgba(0, 230, 118, 0.2)" }]}>
                    <MaterialCommunityIcons name="currency-brl" size={18} color="#00E676" />
                  </View>
                  <TextInput
                    style={[styles.input, Platform.OS === "web" && { outlineStyle: "none" }]}
                    placeholder="0,00"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                    value={mensalidade}
                    onChangeText={handleMoneyChange}
                    onFocus={() => setInputFocado("valor")}
                    onBlur={() => setInputFocado(null)}
                    cursorColor="#00E676"
                    keyboardAppearance="dark"
                  />
                </View>

                <View style={[styles.inputBox, { flex: 0.8, marginLeft: 8, marginBottom: 0 }, inputFocado === "vencimento" && styles.inputBoxFocusedFinance]}>
                  <View style={[styles.inputIconWrapper, { backgroundColor: "rgba(255, 107, 0, 0.1)", borderColor: "rgba(255, 107, 0, 0.6)" }]}>
                    <Ionicons name="calendar" size={18} color="#FF6B00" />
                  </View>
                  <TextInput
                    style={[styles.input, Platform.OS === "web" && { outlineStyle: "none" }]}
                    placeholder="Venc."
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                    maxLength={2}
                    value={vencimento}
                    onChangeText={setVencimento}
                    onFocus={() => setInputFocado("vencimento")}
                    onBlur={() => setInputFocado(null)}
                    cursorColor="#00E676"
                    keyboardAppearance="dark"
                  />
                </View>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="document-text" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.sectionTitle}>Termos e Condições</Text>
              </View>
            </View>

            <View style={[styles.inputBoxArea, inputFocado === "obs" && styles.inputBoxFocused]}>
               <TextInput
                 style={[styles.inputArea, Platform.OS === "web" && { outlineStyle: "none" }]}
                 placeholder="Insira as regras do contrato (Ex: Atrasos maiores de 15min cancelam a aula, reagendamentos com 24h de aviso...)"
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

            <TouchableOpacity
              style={[styles.btnPrimary, loading && { opacity: 0.7 }]}
              onPress={handleAdicionarAluno}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient colors={["#00E676", "#00B259"]} style={styles.btnGradient}>
                {loading ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <>
                    <Ionicons name="shield-checkmark" size={20} color="#000" style={{ marginRight: 10 }} />
                    <Text style={styles.btnPrimaryText}>Firmar Contrato Digital</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.infoContainer}>
              <View style={styles.infoCard}>
                <View style={[styles.infoIconBox, { backgroundColor: "rgba(255, 107, 0, 0.1)", borderColor: "rgba(255, 107, 0, 0.2)" }]}>
                  <Ionicons name="sync" size={20} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoTitle}>Automação de Painel</Text>
                  <Text style={styles.infoDesc}>Este aluno será inserido no seu Dashboard já segmentado como <Text style={{fontWeight: 'bold', color: '#FFF'}}>[{modalidade}]</Text>.</Text>
                </View>
              </View>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#000000", position: "relative" },

  glowTopLeft: { position: "absolute", top: -100, left: -50, width: 300, height: 300, borderRadius: 150, backgroundColor: theme.colors.primary, opacity: 0.12, blurRadius: 90 },
  glowBottomRight: { position: "absolute", bottom: -50, right: -100, width: 350, height: 350, borderRadius: 175, backgroundColor: "#00E676", opacity: 0.08, blurRadius: 100 },

  headerGlass: {
    position: "absolute", top: 0, left: 0, right: 0, zIndex: 100, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: Platform.OS === "ios" ? 60 : 40, paddingBottom: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.05)",
  },
  btnVoltar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.05)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  headerTitle: { fontFamily: theme.fonts.title, fontSize: 14, color: "#FFF", letterSpacing: 1.5, textTransform: "uppercase" },

  scrollContent: { flexGrow: 1 },
  innerContent: { padding: 24, paddingTop: Platform.OS === "ios" ? 130 : 110, paddingBottom: 40 },

  headerTextContainer: { alignItems: "center", marginBottom: 35 },
  iconWrapper: { position: "relative", marginBottom: 25, justifyContent: "center", alignItems: "center" },
  iconGlow: { position: "absolute", width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.primary, opacity: 0.4, blurRadius: 25 },
  iconCircle: { width: 84, height: 84, borderRadius: 42, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.6)" },
  
  title: { fontFamily: theme.fonts.title, fontSize: 34, color: "#FFF", letterSpacing: -0.5, lineHeight: 40, textAlign: "center" },
  titleHighlight: { color: theme.colors.primary },
  subtitle: { fontFamily: theme.fonts.body, fontSize: 15, color: "#AAA", marginTop: 12, lineHeight: 24, textAlign: "center", paddingHorizontal: 10 },

  sectionHeader: { marginBottom: 16, marginTop: 10 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  sectionTitle: { color: "#FFF", fontSize: 18, fontFamily: theme.fonts.title, letterSpacing: 0.2 },
  sectionDesc: { color: "#888", fontSize: 13, lineHeight: 20, paddingLeft: 28 },
  
  inputBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#111", borderRadius: 20, borderWidth: 1, borderColor: "#222", paddingLeft: 12, marginBottom: 16, height: 64, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 },
  inputBoxFocused: { borderColor: theme.colors.primary, backgroundColor: "rgba(255, 107, 0, 0.05)" },
  inputBoxFocusedFinance: { borderColor: "#00E676", backgroundColor: "rgba(0, 230, 118, 0.05)" },
  
  inputIconWrapper: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.03)", justifyContent: "center", alignItems: "center", marginRight: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  inputIconWrapperFocused: { backgroundColor: "rgba(255, 107, 0, 0.1)", borderColor: "rgba(255, 107, 0, 0.2)" },
  input: { flex: 1, color: "#FFF", fontSize: 16, fontFamily: theme.fonts.body, height: "100%", backgroundColor: "transparent" },

  inputBoxArea: { backgroundColor: "#111", borderRadius: 20, borderWidth: 1, borderColor: "#222", padding: 16, height: 120, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 },
  inputArea: { flex: 1, color: "#FFF", fontSize: 15, fontFamily: theme.fonts.body, textAlignVertical: 'top', backgroundColor: "transparent", lineHeight: 22 },

  modalidadeContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 24 },
  modalidadeCard: { flex: 1, height: 90, backgroundColor: "#111", borderRadius: 18, borderWidth: 1, borderColor: "#222", justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 },
  modalidadeCardActive: { borderColor: theme.colors.primary, backgroundColor: "rgba(255, 107, 0, 0.08)", shadowColor: theme.colors.primary, shadowOpacity: 0.2 },
  modalidadeCardText: { color: "#888", fontSize: 12, fontWeight: "bold", letterSpacing: 0.2 },
  modalidadeCardTextActive: { color: theme.colors.primary, fontWeight: "900" },

  selectorGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 15 },
  gridButton: { width: "48%", height: 100, backgroundColor: "#111", borderRadius: 20, justifyContent: "center", alignItems: "center", marginBottom: 15, borderWidth: 1, borderColor: "#222", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 4, position: 'relative', overflow: 'hidden' },
  gridButtonActive: { borderColor: theme.colors.primary, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  gridIconBox: { width: 40, height: 40, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.03)", justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  gridIconBoxActive: { backgroundColor: "rgba(255, 107, 0, 0.15)" },

  financeiroCard: { backgroundColor: "#111", borderRadius: 24, padding: 20, borderWidth: 1, borderColor: "#222", marginBottom: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  financeiroLabel: { color: "#888", fontSize: 13, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 },
  
  freqScrollContainer: { flexDirection: 'row', gap: 10, paddingBottom: 4 },
  freqChip: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 14, backgroundColor: "#1A1A1A", borderWidth: 1, borderColor: "#333" },
  freqChipActive: { backgroundColor: "rgba(0, 230, 118, 0.1)", borderColor: "#00E676" },
  freqChipText: { color: "#666", fontSize: 13, fontWeight: "bold", letterSpacing: 0.3 },
  freqChipTextActive: { color: "#00E676", fontWeight: "900" },

  selectorText: { color: "#888", fontWeight: "700", fontSize: 14, letterSpacing: 0.3 },
  selectorTextActive: { color: theme.colors.primary, fontWeight: "900" },

  rowInputs: { flexDirection: "row", justifyContent: "space-between" },

  btnPrimary: { marginTop: 25, borderRadius: 22, shadowColor: "#00E676", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10 },
  btnGradient: { flexDirection: "row", height: 64, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  btnPrimaryText: { color: "#000", fontSize: 16, fontWeight: "900", letterSpacing: 0.5, textTransform: "uppercase" },

  infoContainer: { marginTop: 25 },
  infoCard: { flexDirection: "row", backgroundColor: "#111", borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "#222", alignItems: "center" },
  infoIconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: "center", alignItems: "center", marginRight: 16, borderWidth: 1 },
  infoTitle: { color: "#FFF", fontSize: 15, fontWeight: "bold", marginBottom: 6, letterSpacing: 0.3 },
  infoDesc: { color: "#888", fontSize: 13, lineHeight: 22 },
});