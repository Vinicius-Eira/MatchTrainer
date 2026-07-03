import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
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
  StatusBar
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { supabase } from "../../../services/supabase";
import { theme } from "../../../theme/theme";

export default function AtivarConvite({ navigation }) {
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [inputFocado, setInputFocado] = useState(null);

  const handleAtivarConta = async () => {
    if (!email || !codigo || !senha) {
      return Alert.alert("Atenção", "Preencha todos os campos para continuar.");
    }

    if (senha.length < 6) {
      return Alert.alert(
        "Atenção",
        "Sua senha deve ter no minímo 6 caracteres",
      );
    }

    setLoading(true);

    try {
      const { data: convite, error: fetchError } = await supabase
        .from("convites_alunos")
        .select("*")
        .eq("email", email.trim().toLowerCase())
        .eq("codigo_convite", codigo.trim())
        .single();

      if (fetchError || !convite) {
        throw new Error(
          "Convite não encontrado, inválido ou já utilizado. Verifique o código com seu Personal.",
        );
      }

      const { error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: senha,
        options: {
          data: {
            nome: convite.nome,
            tipo: "cliente",
            criado_pelo_personal: true,
            personal_id: convite.personal_id,
            tipo_acompanhamento: convite.tipo_acompanhamento,
            objetivo_principal: convite.objetivo_principal,
            valor_mensalidade: convite.valor_mensalidade,
            dia_vencimento: convite.dia_vencimento,
          },
        },
      });

      if (authError) throw authError;

      await supabase
        .from("convites_alunos")
        .update({ status: "aceito" })
        .eq("id", convite.id);

      Alert.alert(
        "Conta Ativada! 🎉",
        "Seu perfil foi vinculado com sucesso ao seu Personal Trainer.",
        [
          { 
            text: "Ir para o Painel", 
            onPress: () => {
              navigation.reset({ 
                index: 0, 
                routes: [{ name: "UsuarioTabs" }] 
              });
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert("Ops!", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#070707" />

      {/* LUZES NEON DE FUNDO */}
      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />

      {/* CABEÇALHO COM EFEITO VIDRO FOSCO */}
      <BlurView 
        intensity={Platform.OS === 'ios' ? 70 : 100} 
        tint="dark" 
        experimentalBlurMethod="dimezisBlurView" 
        style={styles.headerGlass}
      >
        <TouchableOpacity
          style={styles.btnVoltar}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#FFF" style={{ marginLeft: -2 }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ativar Acesso VIP</Text>
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
            
            {/* ÍCONE E TEXTOS DE CABEÇALHO */}
            <View style={styles.headerTextContainer}>
              <View style={styles.iconWrapper}>
                <View style={styles.iconGlow} />
                <LinearGradient
                  colors={["rgba(255, 107, 0, 0.2)", "rgba(255, 107, 0, 0.02)"]}
                  style={styles.iconCircle}
                >
                  <MaterialCommunityIcons
                    name="star-shooting"
                    size={38}
                    color={theme.colors.primary}
                  />
                </LinearGradient>
              </View>
              
              <Text style={styles.title}>Você foi <Text style={styles.titleHighlight}>convidado!</Text></Text>
              <Text style={styles.subtitle}>
                Insira o e-mail cadastrado pelo seu Personal, o código fornecido e crie sua senha de acesso.
              </Text>
            </View>

            {/* FORMULÁRIO */}
            <View style={styles.form}>
              <View
                style={[
                  styles.inputBox,
                  inputFocado === "email" && styles.inputBoxFocused,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={
                    inputFocado === "email"
                      ? theme.colors.primary
                      : "#666"
                  }
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, Platform.OS === "web" && { outlineStyle: "none" }]}
                  placeholder="Seu e-mail"
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

              <View
                style={[
                  styles.inputBox,
                  inputFocado === "codigo" && styles.inputBoxFocused,
                ]}
              >
                <MaterialCommunityIcons
                  name="ticket-confirmation-outline"
                  size={20}
                  color={
                    inputFocado === "codigo"
                      ? theme.colors.primary
                      : "#666"
                  }
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, Platform.OS === "web" && { outlineStyle: "none" }]}
                  placeholder="Código de 6 dígitos"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  maxLength={6}
                  value={codigo}
                  onChangeText={setCodigo}
                  onFocus={() => setInputFocado("codigo")}
                  onBlur={() => setInputFocado(null)}
                  cursorColor={theme.colors.primary}
                  keyboardAppearance="dark"
                />
              </View>

              <View
                style={[
                  styles.inputBox,
                  inputFocado === "senha" && styles.inputBoxFocused,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={
                    inputFocado === "senha"
                      ? theme.colors.primary
                      : "#666"
                  }
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, Platform.OS === "web" && { outlineStyle: "none" }]}
                  placeholder="Crie sua senha de acesso"
                  placeholderTextColor="#666"
                  secureTextEntry={!mostrarSenha}
                  value={senha}
                  onChangeText={setSenha}
                  onFocus={() => setInputFocado("senha")}
                  onBlur={() => setInputFocado(null)}
                  cursorColor={theme.colors.primary}
                  keyboardAppearance="dark"
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
                style={[styles.btnPrimary, loading && { opacity: 0.7 }]}
                onPress={handleAtivarConta}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.btnPrimaryText}>
                  {loading ? "Validando..." : "Desbloquear Meu Acesso"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* SEÇÃO INFORMATIVA PREENCHENDO O ESPAÇO */}
            <View style={styles.infoWrapper}>
              <Text style={styles.infoSectionTitle}>O que acontece agora?</Text>
              
              <View style={styles.infoItem}>
                <View style={styles.infoIconBox}>
                  <Ionicons name="flash" size={16} color={theme.colors.primary} />
                </View>
                <Text style={styles.infoText}>
                  Seu perfil será <Text style={styles.infoTextBold}>vinculado instantaneamente</Text> ao seu personal trainer.
                </Text>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoIconBox}>
                  <Ionicons name="barbell" size={16} color={theme.colors.primary} />
                </View>
                <Text style={styles.infoText}>
                  Você terá acesso aos seus <Text style={styles.infoTextBold}>treinos e planilhas</Text> sem precisar configurar nada.
                </Text>
              </View>
              
              <View style={styles.infoItem}>
                <View style={styles.infoIconBox}>
                  <Ionicons name="shield-checkmark" size={16} color={theme.colors.primary} />
                </View>
                <Text style={styles.infoText}>
                  Esta senha será a sua credencial <Text style={styles.infoTextBold}>única e segura</Text> para os próximos acessos.
                </Text>
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
  btnVoltar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  headerTitle: {
    fontFamily: theme.fonts.title,
    fontSize: 18,
    color: "#FFF",
    letterSpacing: 0.5,
  },

  scrollContent: { flexGrow: 1 },
  innerContent: { flex: 1, padding: 24, paddingTop: Platform.OS === "ios" ? 130 : 110, paddingBottom: 40 },

  headerTextContainer: { alignItems: "center", marginBottom: 35 },
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
    fontSize: 34,
    color: "#FFF",
    letterSpacing: -0.5,
    lineHeight: 40,
    textAlign: "center",
  },
  titleHighlight: { color: theme.colors.primary },
  subtitle: {
    fontFamily: theme.fonts.body,
    fontSize: 15,
    color: "#888",
    marginTop: 12,
    lineHeight: 24,
    textAlign: "center",
    paddingHorizontal: 10,
  },

  form: { width: "100%", marginBottom: 30 },
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
    backgroundColor: "rgba(255, 107, 0, 0.05)",
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

  btnPrimary: {
    backgroundColor: theme.colors.primary,
    height: 64,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  btnPrimaryText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  infoWrapper: {
    marginTop: "auto",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 20,
    padding: 20,
  },
  infoSectionTitle: {
    color: "#FFF",
    fontFamily: theme.fonts.title,
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  infoIconBox: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: "rgba(255, 107, 0, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    color: "#888",
    fontSize: 13,
    lineHeight: 20,
  },
  infoTextBold: {
    color: "#DDD",
    fontWeight: "bold",
  }
});