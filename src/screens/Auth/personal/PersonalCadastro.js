import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
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
import BotaoPrincipal from "../../../components/BotaoPrincipal";
import { supabase } from "../../../services/supabase";
import { theme } from "../../../theme/theme";
import { moderateScale, scale, verticalScale } from "../../../utils/responsive";

const { width } = Dimensions.get("window");

export default function PersonalCadastro({ navigation }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cref, setCref] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const [inputFocado, setInputFocado] = useState(null);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [modalSucesso, setModalSucesso] = useState(false);

  const handleCadastro = async () => {
    if (!nome || !email || !senha || !confirmarSenha || !cref) {
      return Alert.alert("Atenção", "Preencha todos os campos para continuar.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return Alert.alert(
        "E-mail Inválido", 
        "Por favor, digite um e-mail válido (exemplo: seu.nome@gmail.com)."
      );
    }
    
    if (senha.length < 6) {
      return Alert.alert("Atenção", "A senha deve ter no mínimo 6 caracteres.");
    }
    if (senha !== confirmarSenha) {
      return Alert.alert("Atenção", "As senhas digitadas não são iguais.");
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: senha,
        options: {
          data: {
            nome: nome.trim(),
            cref: cref.trim(),
            tipo: "personal",
          },
          emailRedirectTo: "matchtrainer://PersonalLogin",
        },
      });

      if (error) throw error;

      setModalSucesso(true);
    } catch (error) {
      Alert.alert(
        "Erro no Cadastro",
        error.message || "Não foi possível concluir o cadastro.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />

      <BlurView
        intensity={Platform.OS === "ios" ? 70 : 100}
        tint="dark"
        experimentalBlurMethod="dimezisBlurView"
        style={styles.headerGlass}
      >
        <TouchableOpacity
          style={styles.btnVoltar}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </BlurView>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            <View style={styles.header}>
              <Text style={[styles.title, {flex: 1, textAlign: "center"}]}>
                Eleve sua carreira {"\n"}
                <Text style={styles.titleHighlight}>ao próximo nível.</Text>
              </Text>
              <Text style={[styles.subtitle, {flex: 1, textAlign: "center"}]}>
                Crie sua conta parceira para começar a captar alunos e gerenciar
                seus treinos em um só lugar.
              </Text>
            </View>

            <View style={styles.form}>
              <View
                style={[
                  styles.inputContainer,
                  inputFocado === "nome" && styles.inputContainerFocused,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={
                    inputFocado === "nome"
                      ? theme.colors.primary
                      : theme.colors.textMuted
                  }
                  style={styles.icon}
                />
                <TextInput
                  style={[
                    styles.input,
                    Platform.OS === "web" && { outlineStyle: "none" },
                  ]}
                  placeholder="Nome completo"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardAppearance="dark"
                  value={nome}
                  onChangeText={setNome}
                  onFocus={() => setInputFocado("nome")}
                  onBlur={() => setInputFocado(null)}
                  autoCapitalize="words"
                  autoCorrect={false}
                  cursorColor={theme.colors.primary}
                />
              </View>

              <View
                style={[
                  styles.inputContainer,
                  inputFocado === "email" && styles.inputContainerFocused,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={
                    inputFocado === "email"
                      ? theme.colors.primary
                      : theme.colors.textMuted
                  }
                  style={styles.icon}
                />
                <TextInput
                  style={[
                    styles.input,
                    Platform.OS === "web" && { outlineStyle: "none" },
                  ]}
                  placeholder="E-mail profissional"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardAppearance="dark"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setInputFocado("email")}
                  onBlur={() => setInputFocado(null)}
                  cursorColor={theme.colors.primary}
                />
              </View>

              <View
                style={[
                  styles.inputContainer,
                  inputFocado === "cref" && styles.inputContainerFocused,
                  {
                    borderColor:
                      inputFocado === "cref"
                        ? theme.colors.primary
                        : "rgba(255, 107, 0, 0.4)",
                  },
                ]}
              >
                <Ionicons
                  name="card-outline"
                  size={20}
                  color={
                    inputFocado === "cref"
                      ? theme.colors.primary
                      : theme.colors.primary
                  }
                  style={styles.icon}
                />
                <TextInput
                  style={[
                    styles.input,
                    Platform.OS === "web" && { outlineStyle: "none" },
                  ]}
                  placeholder="Número do Registro (CREF)"
                  placeholderTextColor={theme.colors.textMuted}
                  autoCapitalize="characters"
                  keyboardAppearance="dark"
                  value={cref}
                  onChangeText={setCref}
                  onFocus={() => setInputFocado("cref")}
                  onBlur={() => setInputFocado(null)}
                  cursorColor={theme.colors.primary}
                />
              </View>

              <View
                style={[
                  styles.inputContainer,
                  inputFocado === "senha" && styles.inputContainerFocused,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={
                    inputFocado === "senha"
                      ? theme.colors.primary
                      : theme.colors.textMuted
                  }
                  style={styles.icon}
                />
                <TextInput
                  style={[
                    styles.input,
                    Platform.OS === "web" && { outlineStyle: "none" },
                  ]}
                  placeholder="Crie uma senha (mín. 6 dígitos)"
                  placeholderTextColor={theme.colors.textMuted}
                  secureTextEntry={!mostrarSenha}
                  keyboardAppearance="dark"
                  value={senha}
                  onChangeText={setSenha}
                  onFocus={() => setInputFocado("senha")}
                  onBlur={() => setInputFocado(null)}
                  cursorColor={theme.colors.primary}
                  textContentType="oneTimeCode"
                  autoComplete="off"
                />
                <TouchableOpacity
                  onPress={() => setMostrarSenha(!mostrarSenha)}
                  style={styles.eyeIcon}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={mostrarSenha ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <View
                style={[
                  styles.inputContainer,
                  inputFocado === "confirmar" && styles.inputContainerFocused,
                ]}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={
                    inputFocado === "confirmar"
                      ? theme.colors.primary
                      : theme.colors.textMuted
                  }
                  style={styles.icon}
                />
                <TextInput
                  style={[
                    styles.input,
                    Platform.OS === "web" && { outlineStyle: "none" },
                  ]}
                  placeholder="Confirme sua senha"
                  placeholderTextColor={theme.colors.textMuted}
                  secureTextEntry={!mostrarConfirmarSenha}
                  keyboardAppearance="dark"
                  value={confirmarSenha}
                  onChangeText={setConfirmarSenha}
                  onFocus={() => setInputFocado("confirmar")}
                  onBlur={() => setInputFocado(null)}
                  cursorColor={theme.colors.primary}
                  textContentType="oneTimeCode"
                  autoComplete="off"
                />
                <TouchableOpacity
                  onPress={() =>
                    setMostrarConfirmarSenha(!mostrarConfirmarSenha)
                  }
                  style={styles.eyeIcon}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={
                      mostrarConfirmarSenha ? "eye-off-outline" : "eye-outline"
                    }
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.buttonContainer}>
                <BotaoPrincipal
                  titulo={
                    loading ? "Criando Perfil..." : "Criar Perfil de Personal"
                  }
                  onPress={handleCadastro}
                  disabled={loading}
                />
              </View>
            </View>

            <View style={styles.benefitsWrapper}>
              <View style={styles.benefitsHeaderRow}>
                <View style={styles.benefitsHeaderLine} />
                <Text style={styles.benefitsTitle}>Vantagens exclusivas</Text>
                <View style={styles.benefitsHeaderLine} />
              </View>

              <View style={styles.benefitCard}>
                <LinearGradient
                  colors={[
                    theme.colors.primaryLight,
                    "rgba(255, 107, 0, 0.05)",
                  ]}
                  style={styles.benefitIconBg}
                >
                  <MaterialCommunityIcons
                    name="check-decagram"
                    size={20}
                    color={theme.colors.primary}
                  />
                </LinearGradient>
                <View style={styles.benefitTextWrap}>
                  <Text style={styles.benefitTitle}>Selo de Verificação</Text>
                  <Text style={styles.benefitDesc}>
                    Destaque-se na busca e transmita muito mais confiança aos
                    alunos.
                  </Text>
                </View>
              </View>

              <View style={styles.benefitCard}>
                <LinearGradient
                  colors={[
                    theme.colors.primaryLight,
                    "rgba(255, 107, 0, 0.05)",
                  ]}
                  style={styles.benefitIconBg}
                >
                  <Ionicons
                    name="analytics"
                    size={20}
                    color={theme.colors.primary}
                  />
                </LinearGradient>
                <View style={styles.benefitTextWrap}>
                  <Text style={styles.benefitTitle}>Gestão de Contatos</Text>
                  <Text style={styles.benefitDesc}>
                    Receba leads qualificados e acompanhe suas estatísticas de
                    perfil.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Já é um treinador parceiro?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("PersonalLogin")}
              activeOpacity={0.7}
              style={styles.footerButton}
            >
              <Text style={styles.footerLink}>Fazer Login</Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color={theme.colors.primary}
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={modalSucesso} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalIconWrapper}>
              <MaterialCommunityIcons
                name="email-fast-outline"
                size={40}
                color={theme.colors.primary}
              />
            </View>
            <Text style={styles.modalTitle}>Quase lá!</Text>
            <Text style={styles.modalText}>
              Enviamos um link de confirmação para{"\n"}
              <Text style={styles.modalEmail}>{email}</Text>
              {"\n\n"}
              Verifique sua caixa de entrada e ative sua conta antes de fazer o
              login.
            </Text>

            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => {
                setModalSucesso(false);
                navigation.navigate("PersonalLogin");
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.modalBtnText}>Ir para Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    position: "relative",
  },
  keyboardView: { flex: 1 },

  glowTopLeft: {
    position: "absolute",
    top: verticalScale(-50),
    left: scale(-50),
    width: scale(200),
    height: scale(200),
    borderRadius: scale(100),
    backgroundColor: theme.colors.primary,
    opacity: 0.15,
    blurRadius: 50,
  },
  glowBottomRight: {
    position: "absolute",
    bottom: verticalScale(-50),
    right: scale(-50),
    width: scale(250),
    height: scale(250),
    borderRadius: scale(125),
    backgroundColor: theme.colors.primary,
    opacity: 0.08,
    blurRadius: 60,
  },

  headerGlass: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? verticalScale(60) : verticalScale(40),
    paddingBottom: verticalScale(15),
    paddingHorizontal: scale(20),
    borderBottomWidth: 1,
    borderColor: theme.colors.borderLight,
    backgroundColor:
      Platform.OS === "android" ? "rgba(0,0,0,0.5)" : "transparent",
    overflow: "hidden",
  },
  btnVoltar: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: scale(24),
    paddingTop: Platform.OS === "ios" ? verticalScale(130) : verticalScale(110),
    paddingBottom: verticalScale(40),
  },

  header: { marginBottom: verticalScale(35) },
  title: {
    fontFamily: theme.fonts.title,
    fontSize: moderateScale(36),
    color: theme.colors.text,
    letterSpacing: -0.5,
    lineHeight: moderateScale(42),
  },
  titleHighlight: { color: theme.colors.primary },
  subtitle: {
    fontFamily: theme.fonts.body,
    fontSize: moderateScale(15),
    color: theme.colors.textSecondary,
    marginTop: verticalScale(12),
    lineHeight: moderateScale(24),
  },

  form: { width: "100%", gap: verticalScale(16) },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: moderateScale(18),
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingLeft: scale(16),
    height: verticalScale(64),
  },
  inputContainerFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  icon: { marginRight: scale(12) },
  eyeIcon: {
    paddingHorizontal: scale(16),
    height: "100%",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    fontSize: moderateScale(16),
    height: "100%",
    backgroundColor: "transparent",
  },

  buttonContainer: { marginTop: verticalScale(16) },

  benefitsWrapper: { marginTop: verticalScale(45) },
  benefitsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(20),
  },
  benefitsHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  benefitsTitle: {
    color: theme.colors.textSecondary,
    fontSize: moderateScale(11),
    textTransform: "uppercase",
    fontWeight: "900",
    letterSpacing: 1.5,
    marginHorizontal: scale(12),
  },

  benefitCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    paddingHorizontal: scale(18),
    paddingVertical: verticalScale(18),
    borderRadius: moderateScale(20),
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  benefitIconBg: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 0, 0.3)",
  },
  benefitTextWrap: { flex: 1, marginLeft: scale(16) },
  benefitTitle: {
    color: theme.colors.text,
    fontSize: moderateScale(15),
    fontWeight: "900",
    marginBottom: verticalScale(4),
    letterSpacing: 0.5,
  },
  benefitDesc: {
    color: theme.colors.textSecondary,
    fontSize: moderateScale(13),
    lineHeight: moderateScale(18),
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: verticalScale(40),
  },
  footerText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: moderateScale(15),
  },
  footerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: scale(8),
  },
  footerLink: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.title,
    fontSize: moderateScale(15),
    fontWeight: "bold",
    letterSpacing: 0.5,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(24),
  },
  modalBox: {
    backgroundColor: theme.colors.surface,
    width: "100%",
    borderRadius: moderateScale(24),
    paddingHorizontal: scale(32),
    paddingVertical: verticalScale(32),
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconWrapper: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    backgroundColor: theme.colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(20),
    borderWidth: 1,
    borderColor: "rgba(255, 107, 0, 0.2)",
  },
  modalTitle: {
    color: theme.colors.text,
    fontSize: moderateScale(26),
    fontFamily: theme.fonts.title,
    marginBottom: verticalScale(12),
    textAlign: "center",
  },
  modalText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: moderateScale(15),
    textAlign: "center",
    lineHeight: moderateScale(24),
    marginBottom: verticalScale(30),
  },
  modalEmail: {
    color: theme.colors.text,
    fontWeight: "900",
  },
  modalBtn: {
    backgroundColor: theme.colors.primary,
    width: "100%",
    height: verticalScale(56),
    borderRadius: moderateScale(16),
    justifyContent: "center",
    alignItems: "center",
  },
  modalBtnText: {
    color: "#000",
    fontSize: moderateScale(16),
    fontWeight: "900",
    textTransform: "uppercase",
  },
});
