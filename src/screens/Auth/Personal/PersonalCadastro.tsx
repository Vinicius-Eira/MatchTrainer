import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../../services/supabase";
import { theme } from "../../../theme/theme";
import { moderateScale, scale, verticalScale } from "../../../utils/responsive";

export default function PersonalCadastro({ navigation }: any) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cref, setCref] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const [inputFocado, setInputFocado] = useState<string | null>(null);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [modalSucesso, setModalSucesso] = useState(false);

  const handleCadastro = async () => {
    if (!nome || !email || !senha || !confirmarSenha || !cref) return Alert.alert("Atenção", "Preencha todos os campos para continuar.");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return Alert.alert("E-mail Inválido", "Por favor, digite um e-mail válido.");
    if (senha.length < 6) return Alert.alert("Atenção", "A senha deve ter no mínimo 6 caracteres.");
    if (senha !== confirmarSenha) return Alert.alert("Atenção", "As senhas não coincidem.");

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: senha,
        options: {
          data: { nome: nome.trim(), cref: cref.trim(), tipo: "personal" },
          emailRedirectTo: "exp://192.168.15.26:8081/--/PersonalLogin", 
        },
      });

      if (error) throw error;
      setModalSucesso(true);
    } catch (error: any) {
      Alert.alert("Erro no Cadastro", error.message || "Não foi possível concluir o cadastro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />

      <BlurView intensity={Platform.OS === "ios" ? 80 : 100} tint="dark" experimentalBlurMethod="dimezisBlurView" style={styles.headerGlass}>
        <TouchableOpacity style={styles.btnVoltar} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color="#FFF" style={{ marginLeft: -2 }} />
        </TouchableOpacity>
      </BlurView>

      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>
              Eleve sua carreira {"\n"}
              <Text style={styles.titleHighlight}>ao próximo nível.</Text>
            </Text>
            <Text style={styles.subtitle}>Crie sua conta parceira para começar a captar alunos e gerenciar seus treinos em um só lugar.</Text>
          </View>

          <View style={styles.form}>
            <View style={[styles.inputContainer, inputFocado === "nome" && styles.inputContainerFocused]}>
              <Ionicons name="person-outline" size={20} color={inputFocado === "nome" ? theme.colors.primary : "#FF5500"} style={styles.icon} />
              <TextInput style={[styles.input, Platform.OS === "web" ? { outlineStyle: "none" as any } : {}]} placeholder="Nome completo" placeholderTextColor="#555" value={nome} onChangeText={setNome} onFocus={() => setInputFocado("nome")} onBlur={() => setInputFocado(null)} autoCapitalize="words" autoCorrect={false} cursorColor={theme.colors.primary} keyboardAppearance="dark" />
            </View>

            <View style={[styles.inputContainer, inputFocado === "email" && styles.inputContainerFocused]}>
              <Ionicons name="mail-outline" size={20} color={inputFocado === "email" ? theme.colors.primary : "#FF5500"} style={styles.icon} />
              <TextInput style={[styles.input, Platform.OS === "web" ? { outlineStyle: "none" as any } : {}]} placeholder="E-mail profissional" placeholderTextColor="#555" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} value={email} onChangeText={setEmail} onFocus={() => setInputFocado("email")} onBlur={() => setInputFocado(null)} cursorColor={theme.colors.primary} keyboardAppearance="dark" />
            </View>

            <View style={[styles.inputContainer, inputFocado === "cref" && styles.inputContainerFocused]}>
              <Ionicons name="card-outline" size={20} color={inputFocado === "cref" ? theme.colors.primary : "#FF5500"} style={styles.icon} />
              <TextInput style={[styles.input, Platform.OS === "web" ? { outlineStyle: "none" as any } : {}]} placeholder="Número do Registro (CREF)" placeholderTextColor="#555" autoCapitalize="characters" value={cref} onChangeText={setCref} onFocus={() => setInputFocado("cref")} onBlur={() => setInputFocado(null)} cursorColor={theme.colors.primary} keyboardAppearance="dark" />
            </View>

            <View style={[styles.inputContainer, inputFocado === "senha" && styles.inputContainerFocused]}>
              <Ionicons name="lock-closed-outline" size={20} color={inputFocado === "senha" ? theme.colors.primary : "#FF5500"} style={styles.icon} />
              <TextInput style={[styles.input, Platform.OS === "web" ? { outlineStyle: "none" as any } : {}]} placeholder="Crie uma senha forte" placeholderTextColor="#555" secureTextEntry={!mostrarSenha} value={senha} onChangeText={setSenha} onFocus={() => setInputFocado("senha")} onBlur={() => setInputFocado(null)} cursorColor={theme.colors.primary} keyboardAppearance="dark" />
              <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)} style={styles.eyeIcon}><Ionicons name={mostrarSenha ? "eye-off-outline" : "eye-outline"} size={20} color={mostrarSenha ? theme.colors.primary : "#FF5500"} /></TouchableOpacity>
            </View>

            <View style={[styles.inputContainer, inputFocado === "confirmar" && styles.inputContainerFocused]}>
              <Ionicons name="shield-checkmark-outline" size={20} color={inputFocado === "confirmar" ? theme.colors.primary : "#FF5500"} style={styles.icon} />
              <TextInput style={[styles.input, Platform.OS === "web" ? { outlineStyle: "none" as any } : {}]} placeholder="Repita a senha" placeholderTextColor="#555" secureTextEntry={!mostrarConfirmarSenha} value={confirmarSenha} onChangeText={setConfirmarSenha} onFocus={() => setInputFocado("confirmar")} onBlur={() => setInputFocado(null)} cursorColor={theme.colors.primary} keyboardAppearance="dark" />
              <TouchableOpacity onPress={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)} style={styles.eyeIcon}><Ionicons name={mostrarConfirmarSenha ? "eye-off-outline" : "eye-outline"} size={20} color={mostrarConfirmarSenha ? theme.colors.primary : "#FF5500"} /></TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.btnOutline, loading && { opacity: 0.7 }]} onPress={handleCadastro} disabled={loading} activeOpacity={0.8}>
                <LinearGradient colors={["rgba(255, 107, 0, 0.1)", "rgba(255, 107, 0, 0.02)"]} style={StyleSheet.absoluteFill} />
                <Text style={styles.btnOutlineText}>{loading ? "Criando Perfil..." : "Criar Perfil de Personal"}</Text>
                {!loading && <Ionicons name="arrow-forward" size={18} color={theme.colors.primary} style={{ marginLeft: 8 }} />}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.benefitsWrapper}>
            <View style={styles.benefitsHeaderRow}>
              <View style={styles.benefitsHeaderLine} />
              <Text style={styles.benefitsTitle}>Vantagens exclusivas</Text>
              <View style={styles.benefitsHeaderLine} />
            </View>

            <View style={styles.benefitCard}>
              <View style={styles.benefitIconBg}>
                <MaterialCommunityIcons name="check-decagram" size={22} color={theme.colors.primary} />
              </View>
              <View style={styles.benefitTextWrap}>
                <Text style={styles.benefitTitle}>Selo de Verificação</Text>
                <Text style={styles.benefitDesc}>Destaque-se na busca e transmita muito mais confiança aos alunos.</Text>
              </View>
            </View>

            <View style={styles.benefitCard}>
              <View style={styles.benefitIconBg}>
                <Ionicons name="analytics" size={22} color={theme.colors.primary} />
              </View>
              <View style={styles.benefitTextWrap}>
                <Text style={styles.benefitTitle}>Gestão de Contatos</Text>
                <Text style={styles.benefitDesc}>Receba leads qualificados e acompanhe suas estatísticas de perfil.</Text>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Já é um treinador parceiro?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("PersonalLogin")} activeOpacity={0.7} style={styles.footerButton}>
              <Text style={styles.footerLink}>Fazer Login</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={modalSucesso} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalGlow} />
            <View style={styles.modalIconWrapper}>
              <MaterialCommunityIcons name="email-fast-outline" size={38} color={theme.colors.primary} />
            </View>
            <Text style={styles.modalTitle}>Quase lá!</Text>
            <Text style={styles.modalText}>Enviamos um link de confirmação para{"\n"}<Text style={styles.modalEmail}>{email}</Text>{"\n\n"}Verifique sua caixa de entrada e ative sua conta antes de fazer o login.</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={() => { setModalSucesso(false); navigation.navigate("PersonalLogin"); }} activeOpacity={0.8}>
               <LinearGradient colors={["#FF8C00", "#FF5500"]} style={styles.modalBtnGradient}>
                <Text style={styles.modalBtnText}>Ir para o Login</Text>
               </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#020202", position: "relative" },
  keyboardView: { flex: 1 },

  glowTopLeft: { position: "absolute", top: verticalScale(-50), left: scale(-50), width: scale(200), height: scale(200), borderRadius: scale(100), backgroundColor: theme.colors.primary, opacity: 0.15},
  glowBottomRight: { position: "absolute", bottom: verticalScale(-50), right: scale(-50), width: scale(250), height: scale(250), borderRadius: scale(125), backgroundColor: theme.colors.primary, opacity: 0.08},

  headerGlass: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 100, flexDirection: "row", alignItems: "center", paddingTop: Platform.OS === "ios" ? verticalScale(50) : verticalScale(40), paddingBottom: verticalScale(15), paddingHorizontal: scale(20), borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.05)", backgroundColor: Platform.OS === "android" ? "rgba(0,0,0,0.8)" : "transparent" },
  btnVoltar: { width: scale(40), height: scale(40), borderRadius: scale(12), backgroundColor: "rgba(255,255,255,0.05)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },

  scrollContent: { flexGrow: 1, paddingHorizontal: scale(24), paddingTop: Platform.OS === "ios" ? verticalScale(120) : verticalScale(110), paddingBottom: verticalScale(40) },

  headerTextContainer: { marginBottom: verticalScale(25), alignItems: "center" },
  title: { fontFamily: theme.fonts.title, fontSize: moderateScale(34), color: "#FFF", letterSpacing: -0.5, lineHeight: moderateScale(40), textAlign: "center" },
  titleHighlight: { color: theme.colors.primary },
  subtitle: { fontFamily: theme.fonts.body, fontSize: moderateScale(14), color: "#888", marginTop: verticalScale(12), lineHeight: moderateScale(22), textAlign: "center", paddingHorizontal: scale(10) },

  form: { width: "100%", gap: verticalScale(16) },
  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#0A0A0A", borderRadius: moderateScale(16), borderWidth: 1, borderColor: "#1A1A1A", paddingLeft: scale(16), height: verticalScale(60) },
  inputContainerFocused: { borderColor: theme.colors.primary, backgroundColor: "rgba(255, 107, 0, 0.05)", shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3 },
  icon: { marginRight: scale(12) },
  eyeIcon: { paddingHorizontal: scale(16), height: "100%", justifyContent: "center" },
  input: { flex: 1, color: "#FFF", fontFamily: theme.fonts.body, fontSize: moderateScale(15), height: "100%", backgroundColor: "transparent" },

  buttonContainer: { marginTop: verticalScale(10) },
  btnOutline: { flexDirection: "row", height: verticalScale(60), borderRadius: moderateScale(18), borderWidth: 1, borderColor: theme.colors.primary, justifyContent: "center", alignItems: "center", position: "relative" },
  btnOutlineText: { color: theme.colors.primary, fontSize: moderateScale(16), fontWeight: "bold", letterSpacing: 0.5, textTransform: "uppercase" },

  benefitsWrapper: { marginTop: verticalScale(45) },
  benefitsHeaderRow: { flexDirection: "row", alignItems: "center", marginBottom: verticalScale(20) },
  benefitsHeaderLine: { flex: 1, height: 1, backgroundColor: "#1A1A1A" },
  benefitsTitle: { color: "#555", fontSize: moderateScale(11), textTransform: "uppercase", fontWeight: "900", letterSpacing: 1.5, marginHorizontal: scale(12) },
  benefitCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#0A0A0A", paddingHorizontal: scale(18), paddingVertical: verticalScale(18), borderRadius: moderateScale(18), marginBottom: verticalScale(12), borderWidth: 1, borderColor: "#1A1A1A" },
  benefitIconBg: { width: scale(44), height: scale(44), borderRadius: moderateScale(12), backgroundColor: "rgba(255,107,0,0.1)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.3)" },
  benefitTextWrap: { flex: 1, marginLeft: scale(16) },
  benefitTitle: { color: "#FFF", fontSize: moderateScale(15), fontWeight: "900", marginBottom: verticalScale(4), letterSpacing: 0.5 },
  benefitDesc: { color: "#777", fontSize: moderateScale(12), lineHeight: moderateScale(18) },

  footer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: verticalScale(40) },
  footerText: { color: "#666", fontFamily: theme.fonts.body, fontSize: moderateScale(14) },
  footerButton: { flexDirection: "row", alignItems: "center", paddingLeft: scale(8) },
  footerLink: { color: theme.colors.primary, fontFamily: theme.fonts.title, fontSize: moderateScale(14), fontWeight: "bold", letterSpacing: 0.5 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", alignItems: "center", paddingHorizontal: scale(24) },
  modalBox: { backgroundColor: "#0A0A0A", width: "100%", borderRadius: moderateScale(28), padding: scale(32), alignItems: "center", borderWidth: 1, borderColor: "#1A1A1A", position: "relative", overflow: "hidden" },
  modalGlow: { position: "absolute", top: -50, width: 200, height: 200, backgroundColor: theme.colors.primary, opacity: 0.1, borderRadius: 100},
  modalIconWrapper: { width: scale(70), height: scale(70), borderRadius: scale(35), backgroundColor: "rgba(255, 107, 0, 0.1)", justifyContent: "center", alignItems: "center", marginBottom: verticalScale(20), borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.3)" },
  modalTitle: { color: "#FFF", fontSize: moderateScale(24), fontFamily: theme.fonts.title, marginBottom: verticalScale(12) },
  modalText: { color: "#888", fontFamily: theme.fonts.body, fontSize: moderateScale(14), textAlign: "center", lineHeight: moderateScale(22), marginBottom: verticalScale(30) },
  modalEmail: { color: "#FFF", fontWeight: "900" },
  modalBtn: { width: "100%", height: verticalScale(56), borderRadius: moderateScale(16), shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
  modalBtnGradient: { flex: 1, borderRadius: moderateScale(16), justifyContent: "center", alignItems: "center" },
  modalBtnText: { color: "#000", fontSize: moderateScale(15), fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.5 },
});