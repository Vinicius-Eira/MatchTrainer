import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";
import { BlurView } from "expo-blur";
import BotaoPrincipal from "../../../components/BotaoPrincipal";
import { supabase } from "../../../services/supabase";
import { theme } from "../../../theme/theme";

const { width } = Dimensions.get("window");

export default function ClienteCadastro({ navigation }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const [inputFocado, setInputFocado] = useState(null);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [modalSucesso, setModalSucesso] = useState(false);

 const handleCadastro = async () => {
    if (!nome || !email || !senha || !confirmarSenha) {
      return Alert.alert("Atenção", "Por favor, preencha todos os campos.");
    }
    if (senha.length < 6) {
      return Alert.alert("Atenção", "A senha deve ter no mínimo 6 caracteres.");
    }
    if (senha !== confirmarSenha) {
      return Alert.alert("Atenção", "As senhas não coincidem.");
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: senha,
        options: { 
          data: { nome: nome.trim(), tipo: "cliente" },
          emailRedirectTo: 'exp://192.168.15.26:8081/--/ClienteLogin'
        },
      });

      if (error) throw error;

      setModalSucesso(true);

    } catch (error) {
      Alert.alert(
        "Erro no Cadastro",
        error.message || "Não foi possível concluir o cadastro."
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
        intensity={Platform.OS === 'ios' ? 70 : 100}
        tint="dark"
        experimentalBlurMethod="dimezisBlurView"
        style={styles.headerGlass}
      >
        <TouchableOpacity
          style={styles.btnVoltar}
          onPress={() => navigation.navigate("ChoiceScreen")}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </BlurView>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0} 
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>
                Sua jornada {"\n"}
                <Text style={styles.titleHighlight}>começa aqui.</Text>
              </Text>
              <Text style={styles.subtitle}>
                Crie sua conta gratuitamente e encontre o profissional ideal
                para o seu objetivo.
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
                  color={inputFocado === "nome" ? theme.colors.primary : theme.colors.textMuted}
                  style={styles.icon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Como quer ser chamado?"
                  placeholderTextColor={theme.colors.textMuted}
                  value={nome}
                  onChangeText={setNome}
                  onFocus={() => setInputFocado("nome")}
                  onBlur={() => setInputFocado(null)}
                  autoCapitalize="words"
                  autoCorrect={false}
                  cursorColor={theme.colors.primary}
                  keyboardAppearance="dark"
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
                    inputFocado === "email" ? theme.colors.primary : theme.colors.textMuted
                  }
                  style={styles.icon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Seu melhor e-mail"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setInputFocado("email")}
                  onBlur={() => setInputFocado(null)}
                  cursorColor={theme.colors.primary}
                  keyboardAppearance="dark"
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
                    inputFocado === "senha" ? theme.colors.primary : theme.colors.textMuted
                  }
                  style={styles.icon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Crie uma senha forte"
                  placeholderTextColor={theme.colors.textMuted}
                  secureTextEntry={!mostrarSenha}
                  value={senha}
                  onChangeText={setSenha}
                  onFocus={() => setInputFocado("senha")}
                  onBlur={() => setInputFocado(null)}
                  cursorColor={theme.colors.primary}
                  keyboardAppearance="dark"
                  textContentType="oneTimeCode"
                  autoComplete="off"
                />
                <TouchableOpacity
                  onPress={() => setMostrarSenha(!mostrarSenha)}
                  style={styles.eyeIcon}
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
                    inputFocado === "confirmar" ? theme.colors.primary : theme.colors.textMuted
                  }
                  style={styles.icon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Repita a senha"
                  placeholderTextColor={theme.colors.textMuted}
                  secureTextEntry={!mostrarConfirmarSenha}
                  value={confirmarSenha}
                  onChangeText={setConfirmarSenha}
                  onFocus={() => setInputFocado("confirmar")}
                  onBlur={() => setInputFocado(null)}
                  cursorColor={theme.colors.primary}
                  keyboardAppearance="dark"
                  textContentType="oneTimeCode"
                  autoComplete="off"
                />
                <TouchableOpacity
                  onPress={() =>
                    setMostrarConfirmarSenha(!mostrarConfirmarSenha)
                  }
                  style={styles.eyeIcon}
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
                  titulo={loading ? "Criando conta..." : "Criar Conta Grátis"}
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
                    name="magnify-scan"
                    size={20}
                    color={theme.colors.primary}
                  />
                </LinearGradient>
                <View style={styles.benefitTextWrap}>
                  <Text style={styles.benefitTitle}>Busca Inteligente</Text>
                  <Text style={styles.benefitDesc}>
                    Profissionais qualificados perto de você.
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
                    name="chatbubbles-outline"
                    size={20}
                    color={theme.colors.primary}
                  />
                </LinearGradient>
                <View style={styles.benefitTextWrap}>
                  <Text style={styles.benefitTitle}>Contato Direto</Text>
                  <Text style={styles.benefitDesc}>
                    Fale com treinadores sem intermediários.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Já tem uma conta?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("ClienteLogin")}
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
              <MaterialCommunityIcons name="email-fast-outline" size={40} color={theme.colors.primary} />
            </View>
            <Text style={styles.modalTitle}>Quase lá!</Text>
            <Text style={styles.modalText}>
              Enviamos um link de confirmação para{"\n"}
              <Text style={styles.modalEmail}>{email}</Text>{"\n\n"}
              Verifique sua caixa de entrada e ative sua conta antes de fazer o login.
            </Text>

            <TouchableOpacity 
              style={styles.modalBtn}
              onPress={() => {
                setModalSucesso(false);
                navigation.navigate("ClienteLogin");
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.modalBtnText}>Ir para o Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: theme.colors.background, position: "relative" },
  keyboardView: { flex: 1 },

  glowTopLeft: {
    position: "absolute",
    top: -50,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: theme.colors.primary,
    opacity: 0.15,
    blurRadius: 50,
  },
  glowBottomRight: {
    position: "absolute",
    bottom: -50,
    right: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
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
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: theme.colors.borderLight,
    backgroundColor: Platform.OS === "android" ? "rgba(0,0,0,0.5)" : "transparent",
    overflow: "hidden",
  },
  btnVoltar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },

  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: Platform.OS === "ios" ? 130 : 110,
    paddingBottom: 40,
  }, 

  headerTextContainer: { marginBottom: 35 },
  title: {
    fontFamily: theme.fonts.title,
    fontSize: 36,
    color: theme.colors.text,
    letterSpacing: -0.5,
    lineHeight: 42,
  },
  titleHighlight: { color: theme.colors.primary },
  subtitle: {
    fontFamily: theme.fonts.body,
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginTop: 12,
    lineHeight: 24,
  },

  form: { width: "100%", gap: 16 },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingLeft: 16,
    height: 64,
  },
  inputContainerFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  icon: { marginRight: 12 },
  eyeIcon: { paddingHorizontal: 16, height: "100%", justifyContent: "center" },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    fontSize: 16,
    height: "100%",
    backgroundColor: "transparent",
  },

  buttonContainer: { marginTop: 16 },

  benefitsWrapper: { marginTop: 45 },
  benefitsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  benefitsHeaderLine: { flex: 1, height: 1, backgroundColor: theme.colors.border },
  benefitsTitle: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    textTransform: "uppercase",
    fontWeight: "900",
    letterSpacing: 1.5,
    marginHorizontal: 12,
  },

  benefitCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    padding: 18,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  benefitIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 0, 0.3)",
  },
  benefitTextWrap: { flex: 1, marginLeft: 16 },
  benefitTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  benefitDesc: { color: theme.colors.textSecondary, fontSize: 13, lineHeight: 18 },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  footerText: { color: theme.colors.textSecondary, fontFamily: theme.fonts.body, fontSize: 15 },
  footerButton: { flexDirection: "row", alignItems: "center", paddingLeft: 8 },
  footerLink: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.title,
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalBox: {
    backgroundColor: theme.colors.surface,
    width: "100%",
    borderRadius: 24,
    padding: 32,
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 0, 0.2)",
  },
  modalTitle: {
    color: theme.colors.text,
    fontSize: 26,
    fontFamily: theme.fonts.title,
    marginBottom: 12,
    textAlign: "center",
  },
  modalText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  modalEmail: {
    color: theme.colors.text,
    fontWeight: "900",
  },
  modalBtn: {
    backgroundColor: theme.colors.primary,
    width: "100%",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBtnText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "900",
    textTransform: "uppercase",
  },
});