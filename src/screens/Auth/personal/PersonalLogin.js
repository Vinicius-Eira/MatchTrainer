import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../../services/supabase";
import { theme } from "../../../theme/theme";
import { moderateScale, scale, verticalScale } from "../../../utils/responsive";

const { width } = Dimensions.get("window");

export default function PersonalLogin({ navigation }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const [focoEmail, setFocoEmail] = useState(false);
  const [focoSenha, setFocoSenha] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) {
      return Alert.alert(
        "Atenção",
        "Preencha seu e-mail e senha para continuar.",
      );
    }

    setLoading(true);

    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password: senha,
        });

      if (authError) {
        setLoading(false);
        return Alert.alert(
          "Ops!",
          "E-mail ou senha incorretos. Tente novamente.",
        );
      }

      if (authData?.user) {
        const { data: perfilData, error: perfilError } = await supabase
          .from("personals")
          .select("ativo")
          .eq("id", authData.user.id)
          .maybeSingle();

        if (perfilError) {
          console.error(
            "[Login] Erro ao buscar tabela personals:",
            perfilError,
          );
        }

        if (perfilData?.ativo) {
          navigation.replace("PersonalDashboard");
        } else {
          navigation.replace("PersonalSetup");
        }
      }
    } catch (error) {
      Alert.alert("Erro ao entrar", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background}
      />

      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />

      <View style={styles.headerAbsolute}>
        <TouchableOpacity
          style={styles.btnVoltar}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={theme.colors.text}
            style={{ marginLeft: -2 }}
          />
        </TouchableOpacity>
      </View>

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
          <View style={styles.innerContent}>
            <View style={styles.header}>
              <View style={styles.iconWrapper}>
                <View style={styles.iconGlow} />
                <LinearGradient
                  colors={[
                    theme.colors.primaryLight,
                    "rgba(255, 107, 0, 0.02)",
                  ]}
                  style={styles.iconCircle}
                >
                  <Ionicons
                    name="barbell"
                    size={34}
                    color={theme.colors.primary}
                  />
                </LinearGradient>
              </View>
              <Text style={styles.title}>
                Área do {"\n"}
                <Text style={styles.titleHighlight}>Personal.</Text>
              </Text>
              <Text style={styles.subtitle}>
                Acesse seu painel profissional e gerencie seus alunos.
              </Text>
            </View>

            <View style={styles.form}>
              <View
                style={[styles.inputBox, focoEmail && styles.inputBoxFocused]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={
                    focoEmail ? theme.colors.primary : theme.colors.textMuted
                  }
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    Platform.OS === "web" && { outlineStyle: "none" },
                  ]}
                  placeholder="Seu e-mail profissional"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocoEmail(true)}
                  onBlur={() => setFocoEmail(false)}
                  cursorColor={theme.colors.primary}
                  keyboardAppearance="dark"
                />
              </View>

              <View
                style={[styles.inputBox, focoSenha && styles.inputBoxFocused]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={
                    focoSenha ? theme.colors.primary : theme.colors.textMuted
                  }
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    Platform.OS === "web" && { outlineStyle: "none" },
                  ]}
                  placeholder="Sua senha"
                  placeholderTextColor={theme.colors.textMuted}
                  secureTextEntry={!mostrarSenha}
                  value={senha}
                  onChangeText={setSenha}
                  onFocus={() => setFocoSenha(true)}
                  onBlur={() => setFocoSenha(false)}
                  cursorColor={theme.colors.primary}
                  keyboardAppearance="dark"
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

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => navigation.navigate("EsqueciSenha")}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btnPrimary, loading && { opacity: 0.7 }]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.btnPrimaryText}>
                  {loading ? "Acessando..." : "Entrar no Painel"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Ainda não tem conta?</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("PersonalCadastro")}
                activeOpacity={0.7}
                style={styles.footerButton}
              >
                <Text style={styles.registerTextHighlight}>Cadastre-se</Text>
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color={theme.colors.primary}
                  style={{ marginLeft: 4 }}
                />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    position: "relative",
  },

  glowTopLeft: {
    position: "absolute",
    top: verticalScale(-100),
    left: scale(-50),
    width: scale(250),
    height: scale(250),
    borderRadius: scale(125),
    backgroundColor: theme.colors.primary,
    opacity: 0.12,
    blurRadius: 60,
  },
  glowBottomRight: {
    position: "absolute",
    bottom: verticalScale(-50),
    right: scale(-100),
    width: scale(300),
    height: scale(300),
    borderRadius: scale(150),
    backgroundColor: theme.colors.primary,
    opacity: 0.08,
    blurRadius: 80,
  },

  scrollContent: { flexGrow: 1 },
  innerContent: {
    paddingHorizontal: scale(24),
    paddingTop: Platform.OS === "ios" ? verticalScale(140) : verticalScale(100),
    paddingBottom: verticalScale(40),
  },

  headerAbsolute: {
    position: "absolute",
    top: Platform.OS === "ios" ? verticalScale(60) : verticalScale(30),
    left: scale(24),
    zIndex: 10,
  },
  btnVoltar: {
    backgroundColor: theme.colors.surface,
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },

  header: {
    alignItems: "center",
    marginBottom: verticalScale(45),
    marginTop: verticalScale(20),
  },
  iconWrapper: {
    position: "relative",
    marginBottom: verticalScale(25),
    justifyContent: "center",
    alignItems: "center",
  },
  iconGlow: {
    position: "absolute",
    width: scale(70),
    height: scale(70),
    borderRadius: scale(35),
    backgroundColor: theme.colors.primary,
    opacity: 0.3,
    blurRadius: 20,
  },
  iconCircle: {
    width: scale(74),
    height: scale(74),
    borderRadius: scale(37),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 0, 0.4)",
  },

  title: {
    fontFamily: theme.fonts.title,
    fontSize: moderateScale(38),
    color: theme.colors.text,
    letterSpacing: -0.5,
    lineHeight: moderateScale(44),
    textAlign: "center",
  },
  titleHighlight: { color: theme.colors.primary },
  subtitle: {
    fontFamily: theme.fonts.body,
    fontSize: moderateScale(15),
    color: theme.colors.textSecondary,
    marginTop: verticalScale(12),
    lineHeight: moderateScale(22),
    textAlign: "center",
    paddingHorizontal: scale(20),
  },

  form: { width: "100%" },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: moderateScale(18),
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingLeft: scale(16),
    marginBottom: verticalScale(16),
    height: verticalScale(64),
  },
  inputBoxFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  inputIcon: { marginRight: scale(12) },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: moderateScale(16),
    fontFamily: theme.fonts.body,
    height: "100%",
    backgroundColor: "transparent",
  },
  eyeIcon: {
    paddingHorizontal: scale(16),
    height: "100%",
    justifyContent: "center",
  },

  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: verticalScale(35),
    marginTop: verticalScale(-5),
    paddingVertical: verticalScale(5),
  },
  forgotPasswordText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: moderateScale(14),
    fontWeight: "700",
  },

  btnPrimary: {
    backgroundColor: theme.colors.primary,
    height: verticalScale(64),
    borderRadius: moderateScale(18),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  btnPrimaryText: {
    color: theme.colors.backgroundPure,
    fontSize: moderateScale(17),
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: verticalScale(45),
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
  registerTextHighlight: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.title,
    fontSize: moderateScale(15),
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});
