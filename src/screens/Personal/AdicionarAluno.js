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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { supabase } from "../../services/supabase";
import { theme } from "../../theme/theme";

export default function AdicionarAluno({ navigation }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [tipo, setTipo] = useState("consultoria"); 
  const [objetivo, setObjetivo] = useState("hipertrofia"); 
  const [mensalidade, setMensalidade] = useState("");
  const [vencimento, setVencimento] = useState("");
  const [loading, setLoading] = useState(false);

  const [inputFocado, setInputFocado] = useState(null);

  const handleAdicionarAluno = async () => {
    if (!nome || !email) {
      return Alert.alert("Atenção", "Nome e E-mail são obrigatórios.");
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

      const { error: insertError } = await supabase
        .from('convites_alunos')
        .insert([
          {
            email: email.trim().toLowerCase(),
            codigo_convite: codigoGerado,
            personal_id: user.id,
            nome: nome.trim(),
            tipo_acompanhamento: tipo,
            objetivo_principal: objetivo,
            valor_mensalidade: parseFloat(mensalidade) || 0,
            dia_vencimento: diaInt,
            status: 'pendente'
          }
        ]);

      if (insertError) throw insertError;

      const copiarEVoltar = async () => {
        const mensagem = `Fala ${nome.split(' ')[0]}! Baixe o MatchTrainer e clique em "Já tenho um Personal".\n\nUse o código VIP abaixo para ativar nossa consultoria:\n🎟️ Código: ${codigoGerado}`;
        await Clipboard.setStringAsync(mensagem);
        Alert.alert("Copiado! ✅", "O texto foi copiado. É só colar no WhatsApp do aluno.");
        navigation.goBack();
      };

      Alert.alert(
        "Convite Gerado! 🎉",
        `O aluno foi pré-cadastrado na sua lista.\n\nCódigo: ${codigoGerado}`,
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

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#070707" />

      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />

      <BlurView 
        intensity={Platform.OS === 'ios' ? 70 : 100} 
        tint="dark" 
        experimentalBlurMethod="dimezisBlurView" 
        style={styles.headerGlass}
      >
        <TouchableOpacity style={styles.btnVoltar} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color="#FFF" style={{ marginLeft: -2 }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo Aluno</Text>
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
                <LinearGradient colors={["rgba(255, 107, 0, 0.2)", "rgba(255, 107, 0, 0.02)"]} style={styles.iconCircle}>
                  <MaterialCommunityIcons name="account-plus-outline" size={38} color={theme.colors.primary} />
                </LinearGradient>
              </View>
              <Text style={styles.title}>Convidar <Text style={styles.titleHighlight}>Aluno.</Text></Text>
              <Text style={styles.subtitle}>Gere um código de acesso exclusivo para o seu aluno entrar na plataforma já vinculado a você.</Text>
            </View>

            <Text style={styles.sectionTitle}>Dados do Aluno</Text>
            
            <View style={[styles.inputBox, inputFocado === "nome" && styles.inputBoxFocused]}>
              <Ionicons name="person-outline" size={20} color={inputFocado === "nome" ? theme.colors.primary : "#666"} style={styles.inputIcon} />
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
              <Ionicons name="mail-outline" size={20} color={inputFocado === "email" ? theme.colors.primary : "#666"} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, Platform.OS === "web" && { outlineStyle: "none" }]}
                placeholder="E-mail do aluno"
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

            <Text style={styles.sectionTitle}>Modalidade de Treino</Text>
            <View style={styles.selectorRow}>
              {["consultoria", "presencial", "apenas_personal"].map((item) => {
                const isActive = tipo === item;
                const labels = { "consultoria": "Consultoria", "presencial": "Presencial", "apenas_personal": "Só Personal" };
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.selectorButton, isActive && styles.selectorButtonActive]}
                    onPress={() => setTipo(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.selectorText, isActive && styles.selectorTextActive]}>
                      {labels[item]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.sectionTitle}>Objetivo Principal</Text>
            <View style={styles.selectorGrid}>
              {["hipertrofia", "emagrecimento", "saude", "performance"].map((item) => {
                const isActive = objetivo === item;
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.gridButton, isActive && styles.gridButtonActive]}
                    onPress={() => setObjetivo(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.selectorText, isActive && styles.selectorTextActive]}>
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.sectionTitle}>Acordo Financeiro (Opcional)</Text>
            <View style={styles.rowInputs}>
              <View style={[styles.inputBox, { flex: 1, marginRight: 8 }, inputFocado === "valor" && styles.inputBoxFocused]}>
                <Ionicons name="wallet-outline" size={20} color={inputFocado === "valor" ? theme.colors.primary : "#666"} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, Platform.OS === "web" && { outlineStyle: "none" }]}
                  placeholder="Mensalidade"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  value={mensalidade}
                  onChangeText={setMensalidade}
                  onFocus={() => setInputFocado("valor")}
                  onBlur={() => setInputFocado(null)}
                  cursorColor={theme.colors.primary}
                  keyboardAppearance="dark"
                />
              </View>

              <View style={[styles.inputBox, { flex: 1, marginLeft: 8 }, inputFocado === "vencimento" && styles.inputBoxFocused]}>
                <Ionicons name="calendar-outline" size={20} color={inputFocado === "vencimento" ? theme.colors.primary : "#666"} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, Platform.OS === "web" && { outlineStyle: "none" }]}
                  placeholder="Dia Venc."
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  maxLength={2}
                  value={vencimento}
                  onChangeText={setVencimento}
                  onFocus={() => setInputFocado("vencimento")}
                  onBlur={() => setInputFocado(null)}
                  cursorColor={theme.colors.primary}
                  keyboardAppearance="dark"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.btnPrimary, loading && { opacity: 0.7 }]}
              onPress={handleAdicionarAluno}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <>
                  <Ionicons name="paper-plane" size={20} color="#000" style={{ marginRight: 8 }} />
                  <Text style={styles.btnPrimaryText}>Gerar Convite de Acesso</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.infoContainer}>
              <View style={styles.infoWrapper}>
                <View style={styles.infoIconBox}>
                  <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoTitle}>Como funciona?</Text>
                  <Text style={styles.infoDesc}>Ao gerar o convite, um código de 6 dígitos será criado para você compartilhar com o aluno.</Text>
                </View>
              </View>

              <View style={styles.infoWrapper}>
                <View style={[styles.infoIconBox, { backgroundColor: "rgba(0, 191, 255, 0.1)", borderColor: "rgba(0, 191, 255, 0.2)" }]}>
                  <Ionicons name="rocket" size={24} color="#00BFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoTitle}>Acesso Imediato</Text>
                  <Text style={styles.infoDesc}>Assim que o aluno inserir o código, o perfil dele será vinculado ao seu painel automaticamente.</Text>
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
  mainContainer: { flex: 1, backgroundColor: "#070707", position: "relative" },

  glowTopLeft: { position: "absolute", top: -100, left: -50, width: 250, height: 250, borderRadius: 125, backgroundColor: theme.colors.primary, opacity: 0.12, blurRadius: 60 },
  glowBottomRight: { position: "absolute", bottom: -50, right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: theme.colors.primary, opacity: 0.08, blurRadius: 80 },

  headerGlass: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    backgroundColor: Platform.OS === "android" ? "rgba(0,0,0,0.5)" : "transparent",
    overflow: "hidden",
  },
  btnVoltar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.08)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  headerTitle: { fontFamily: theme.fonts.title, fontSize: 16, color: "#FFF", letterSpacing: 0.5, textTransform: "uppercase" },

  scrollContent: { flexGrow: 1 },
  innerContent: { padding: 24, paddingTop: Platform.OS === "ios" ? 130 : 110, paddingBottom: 40 },

  headerTextContainer: { alignItems: "center", marginBottom: 30 },
  iconWrapper: { position: "relative", marginBottom: 25, justifyContent: "center", alignItems: "center" },
  iconGlow: { position: "absolute", width: 70, height: 70, borderRadius: 35, backgroundColor: theme.colors.primary, opacity: 0.3, blurRadius: 20 },
  iconCircle: { width: 74, height: 74, borderRadius: 37, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.4)" },
  
  title: { fontFamily: theme.fonts.title, fontSize: 34, color: "#FFF", letterSpacing: -0.5, lineHeight: 40, textAlign: "center" },
  titleHighlight: { color: theme.colors.primary },
  subtitle: { fontFamily: theme.fonts.body, fontSize: 14, color: "#888", marginTop: 10, lineHeight: 22, textAlign: "center", paddingHorizontal: 10 },

  sectionTitle: { color: theme.colors.textSecondary, fontSize: 12, textTransform: "uppercase", fontWeight: "900", letterSpacing: 1.2, marginTop: 10, marginBottom: 12, marginLeft: 4 },
  
  inputBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#121212", borderRadius: 16, borderWidth: 1, borderColor: "#222", paddingLeft: 16, marginBottom: 16, height: 60 },
  inputBoxFocused: { borderColor: theme.colors.primary, backgroundColor: "rgba(255, 107, 0, 0.05)" },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: "#FFF", fontSize: 16, fontFamily: theme.fonts.body, height: "100%", backgroundColor: "transparent" },

  selectorRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  selectorButton: { flex: 1, height: 50, backgroundColor: "#121212", borderRadius: 14, justifyContent: "center", alignItems: "center", marginHorizontal: 4, borderWidth: 1, borderColor: "#222" },
  selectorButtonActive: { backgroundColor: "rgba(255, 107, 0, 0.15)", borderColor: theme.colors.primary },
  
  selectorGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 5 },
  gridButton: { width: "48%", height: 50, backgroundColor: "#121212", borderRadius: 14, justifyContent: "center", alignItems: "center", marginBottom: 12, borderWidth: 1, borderColor: "#222" },
  gridButtonActive: { backgroundColor: "rgba(255, 107, 0, 0.15)", borderColor: theme.colors.primary },
  
  selectorText: { color: "#888", fontWeight: "700", fontSize: 13, letterSpacing: 0.3 },
  selectorTextActive: { color: theme.colors.primary, fontWeight: "900" },

  rowInputs: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },

  btnPrimary: { flexDirection: "row", backgroundColor: theme.colors.primary, height: 64, borderRadius: 18, justifyContent: "center", alignItems: "center", marginTop: 25, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  btnPrimaryText: { color: "#000", fontSize: 16, fontWeight: "900", letterSpacing: 0.5, textTransform: "uppercase" },

  infoContainer: { marginTop: 35, gap: 12 },
  infoWrapper: { flexDirection: "row", backgroundColor: "rgba(255, 255, 255, 0.03)", borderRadius: 16, padding: 20, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.05)", alignItems: "center" },
  infoIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: "rgba(255, 107, 0, 0.1)", justifyContent: "center", alignItems: "center", marginRight: 16, borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.2)" },
  infoTitle: { color: "#FFF", fontSize: 14, fontWeight: "bold", marginBottom: 4 },
  infoDesc: { color: "#888", fontSize: 12, lineHeight: 18 },
});