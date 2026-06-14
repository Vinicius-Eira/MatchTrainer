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
} from "react-native";
import BotaoPrincipal from "../../../components/BotaoPrincipal";
import { supabase } from "../../../services/supabase";
import { theme } from "../../../theme/theme";

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

  const handleCadastro = async () => {
    if (!nome || !email || !senha || !confirmarSenha || !cref) {
      return Alert.alert("Atenção", "Preencha todos os campos para continuar.");
    }
    if (senha.length < 6) {
      return Alert.alert("Atenção", "A senha deve ter no mínimo 6 caracteres.");
    }
    if (senha !== confirmarSenha) {
      return Alert.alert("Atenção", "As senhas digitadas não são iguais.");
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: senha,
        options: { data: { nome: nome.trim(), tipo: "personal" } },
      });

      if (error) throw error;

      if (data?.user) {
        const { error: dbError } = await supabase.from("personals").insert([
          {
            id: data.user.id,
            nome: nome.trim(),
            email: email.trim().toLowerCase(),
            cref: cref.trim(),
            ativo: false,
          },
        ]);

        if (dbError) throw dbError;
      }

      Alert.alert(
        "Sucesso!",
        "Perfil profissional criado. Verifique seu e-mail para confirmar a conta.",
        [{ text: "OK", onPress: () => navigation.goBack() }],
      );
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

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View>
            <TouchableOpacity
              style={styles.backButtonPill}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={18} color="#FFF" />
              <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={styles.title}>
                Eleve sua carreira {"\n"}
                <Text style={styles.titleHighlight}>ao próximo nível.</Text>
              </Text>
              <Text style={styles.subtitle}>
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
                  color={inputFocado === "nome" ? theme.colors.primary : "#777"}
                  style={styles.icon}
                />
                <TextInput
                  style={[
                    styles.input,
                    Platform.OS === "web" && { outlineStyle: "none" },
                  ]}
                  placeholder="Nome completo"
                  placeholderTextColor="#666"
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
                    inputFocado === "email" ? theme.colors.primary : "#777"
                  }
                  style={styles.icon}
                />
                <TextInput
                  style={[
                    styles.input,
                    Platform.OS === "web" && { outlineStyle: "none" },
                  ]}
                  placeholder="E-mail profissional"
                  placeholderTextColor="#666"
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
                  placeholderTextColor="#666"
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
                    inputFocado === "senha" ? theme.colors.primary : "#777"
                  }
                  style={styles.icon}
                />
                <TextInput
                  style={[
                    styles.input,
                    Platform.OS === "web" && { outlineStyle: "none" },
                  ]}
                  placeholder="Crie uma senha (mín. 6 dígitos)"
                  placeholderTextColor="#666"
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
                    color="#888"
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
                    inputFocado === "confirmar" ? theme.colors.primary : "#777"
                  }
                  style={styles.icon}
                />
                <TextInput
                  style={[
                    styles.input,
                    Platform.OS === "web" && { outlineStyle: "none" },
                  ]}
                  placeholder="Confirme sua senha"
                  placeholderTextColor="#666"
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
                    color="#888"
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
                    "rgba(255, 107, 0, 0.15)",
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
                    "rgba(255, 107, 0, 0.15)",
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
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#070707", position: "relative" },
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

  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 40,
    justifyContent: "space-between",
  },

  backButtonPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121212",
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#222",
  },
  backButtonText: {
    color: "#CCC",
    fontFamily: theme.fonts.body,
    fontSize: 13,
    marginLeft: 6,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  header: { marginBottom: 35 },
  title: {
    fontFamily: theme.fonts.title,
    fontSize: 36,
    color: "#FFF",
    letterSpacing: -0.5,
    lineHeight: 42,
  },
  titleHighlight: { color: theme.colors.primary },
  subtitle: {
    fontFamily: theme.fonts.body,
    fontSize: 15,
    color: "#999",
    marginTop: 12,
    lineHeight: 24,
  },

  form: { width: "100%", gap: 16 },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121212",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#222",
    paddingLeft: 16,
    height: 64,
  },
  inputContainerFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: "rgba(255, 107, 0, 0.05)",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  icon: { marginRight: 12 },
  eyeIcon: { paddingHorizontal: 16, height: "100%", justifyContent: "center" },
  input: {
    flex: 1,
    color: "#FFF",
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
  benefitsHeaderLine: { flex: 1, height: 1, backgroundColor: "#222" },
  benefitsTitle: {
    color: "#888",
    fontSize: 11,
    textTransform: "uppercase",
    fontWeight: "900",
    letterSpacing: 1.5,
    marginHorizontal: 12,
  },

  benefitCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F0F0F",
    padding: 18,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1A1A1A",
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
    color: "#FFF",
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  benefitDesc: { color: "#888", fontSize: 13, lineHeight: 18 },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  footerText: { color: "#777", fontFamily: theme.fonts.body, fontSize: 15 },
  footerButton: { flexDirection: "row", alignItems: "center", paddingLeft: 8 },
  footerLink: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.title,
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});
