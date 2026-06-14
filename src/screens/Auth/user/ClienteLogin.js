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

const { width } = Dimensions.get("window");

export default function ClienteLogin({ navigation }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const [focoEmail, setFocoEmail] = useState(false);
  const [focoSenha, setFocoSenha] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha)
      return Alert.alert(
        "Atenção",
        "Preencha seu e-mail e senha para continuar.",
      );

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: senha,
    });

    if (error) {
      setLoading(false);
      return Alert.alert(
        "Ops!",
        "E-mail ou senha incorretos. Tente novamente.",
      );
    }

    if (data?.user) {
      const { data: userData } = await supabase
        .from("usuarios")
        .select("nome, cidade, telefone, objetivo, nivel_experiencia")
        .eq("id", data.user.id)
        .single();

      setLoading(false);

      if (userData) {
        if (!userData.nome || !userData.cidade || !userData.telefone) {
          navigation.reset({ index: 0, routes: [{ name: "ClienteSetup" }] });
        } else if (!userData.objetivo || !userData.nivel_experiencia) {
          navigation.reset({ index: 0, routes: [{ name: "SetupBuscaAluno" }] });
        } else {
          navigation.replace("UsuarioTabs");
        }
      } else {
        navigation.reset({ index: 0, routes: [{ name: "ClienteSetup" }] });
      }
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#070707" />

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
            color="#FFF"
            style={{ marginLeft: -2 }}
          />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.innerContent}>
            <View style={styles.header}>
              <View style={styles.iconWrapper}>
                <View style={styles.iconGlow} />
                <LinearGradient
                  colors={["rgba(255, 107, 0, 0.2)", "rgba(255, 107, 0, 0.02)"]}
                  style={styles.iconCircle}
                >
                  <Ionicons
                    name="person"
                    size={34}
                    color={theme.colors.primary}
                  />
                </LinearGradient>
              </View>
              <Text style={styles.title}>
                Bem-vindo(a) {"\n"}
                <Text style={styles.titleHighlight}>de volta.</Text>
              </Text>
              <Text style={styles.subtitle}>
                Acesse sua conta para continuar sua jornada de treinos.
              </Text>
            </View>

            <View style={styles.form}>
              <View
                style={[styles.inputBox, focoEmail && styles.inputBoxFocused]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={focoEmail ? theme.colors.primary : "#666"}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    Platform.OS === "web" && { outlineStyle: "none" },
                  ]}
                  placeholder="Seu e-mail"
                  placeholderTextColor="#666"
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
                  color={focoSenha ? theme.colors.primary : "#666"}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    Platform.OS === "web" && { outlineStyle: "none" },
                  ]}
                  placeholder="Sua senha"
                  placeholderTextColor="#666"
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
                    color="#888"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.forgotPassword}
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
                  {loading ? "Acessando..." : "Entrar na Conta"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Ainda não tem conta?</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("ClienteCadastro")}
                activeOpacity={0.7}
              >
                <Text style={styles.registerTextHighlight}>
                  Criar conta grátis
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#070707", position: "relative" },

  glowTopLeft: {
    position: "absolute",
    top: -100,
    left: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: theme.colors.primary,
    opacity: 0.12,
    blurRadius: 60,
  },
  glowBottomRight: {
    position: "absolute",
    bottom: -50,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: theme.colors.primary,
    opacity: 0.08,
    blurRadius: 80,
  },

  scrollContent: { flexGrow: 1, justifyContent: "center" },
  innerContent: { padding: 24, paddingTop: 80, paddingBottom: 40 },

  headerAbsolute: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 30,
    left: 24,
    zIndex: 10,
  },
  btnVoltar: {
    backgroundColor: "#121212",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },

  header: { alignItems: "center", marginBottom: 45, marginTop: 20 },
  iconWrapper: {
    position: "relative",
    marginBottom: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  iconGlow: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.colors.primary,
    opacity: 0.3,
    blurRadius: 20,
  },
  iconCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 0, 0.4)",
  },

  title: {
    fontFamily: theme.fonts.title,
    fontSize: 38,
    color: "#FFF",
    letterSpacing: -0.5,
    lineHeight: 44,
    textAlign: "center",
  },
  titleHighlight: { color: theme.colors.primary },
  subtitle: {
    fontFamily: theme.fonts.body,
    fontSize: 15,
    color: "#888",
    marginTop: 12,
    lineHeight: 22,
    textAlign: "center",
  },

  form: { width: "100%" },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121212",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#222",
    paddingLeft: 16,
    marginBottom: 16,
    height: 64,
  },
  inputBoxFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: "rgba(255, 107, 0, 0.03)",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  inputIcon: { marginRight: 12 },
  input: {
    flex: 1,
    color: "#FFF",
    fontSize: 16,
    fontFamily: theme.fonts.body,
    height: "100%",
    backgroundColor: "transparent",
  },
  eyeIcon: { paddingHorizontal: 16, height: "100%", justifyContent: "center" },

  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 35,
    marginTop: -5,
    paddingVertical: 5,
  },
  forgotPasswordText: {
    color: "#AAA",
    fontFamily: theme.fonts.body,
    fontSize: 14,
    fontWeight: "700",
  },

  btnPrimary: {
    backgroundColor: theme.colors.primary,
    height: 64,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  btnPrimaryText: {
    color: "#000",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 45,
  },
  footerText: { color: "#777", fontFamily: theme.fonts.body, fontSize: 15 },
  registerTextHighlight: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.title,
    fontSize: 15,
    fontWeight: "bold",
    marginLeft: 6,
    letterSpacing: 0.5,
  },
});
