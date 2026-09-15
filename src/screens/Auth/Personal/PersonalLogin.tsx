import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
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

export default function PersonalLogin({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const [focoEmail, setFocoEmail] = useState(false);
  const [focoSenha, setFocoSenha] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) return Alert.alert("Atenção", "Preencha seu e-mail e senha para continuar.");

    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: senha,
      });

      if (authError) {
        setLoading(false);
        return Alert.alert("Ops!", "E-mail ou senha incorretos. Tente novamente.");
      }

      if (authData?.user) {
        const { data: perfilData, error: perfilError } = await supabase
          .from("personals")
          .select("ativo")
          .eq("id", authData.user.id)
          .maybeSingle();

        if (perfilError) {
          console.error("[Login] Erro ao buscar tabela personals:", perfilError);
        }

        if (perfilData?.ativo) {
          navigation.replace("PersonalDashboard");
        } else {
          navigation.replace("PersonalSetup");
        }
      }
    } catch (error: any) {
      Alert.alert("Erro ao entrar", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent />

      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />

      <View style={styles.headerAbsolute}>
        <TouchableOpacity style={styles.btnVoltar} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="chevron-back" size={22} color="#FFF" style={{ marginLeft: -2 }} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.innerContent}>
            
            <View style={styles.header}>
              <View style={styles.iconWrapper}>
                <View style={styles.iconGlow} />
                <LinearGradient colors={["rgba(255, 107, 0, 0.25)", "rgba(255, 107, 0, 0.02)"]} style={styles.iconCircle}>
                  <Ionicons name="barbell" size={32} color={theme.colors.primary} />
                </LinearGradient>
              </View>
              <Text style={styles.title}>
                Área do {"\n"}
                <Text style={styles.titleHighlight}>Personal.</Text>
              </Text>
              <Text style={styles.subtitle}>Acesse seu painel profissional e gerencie seus alunos.</Text>
            </View>

            <View style={styles.form}>
              <View style={[styles.inputBox, focoEmail && styles.inputBoxFocused]}>
                <Ionicons name="mail-outline" size={20} color={focoEmail ? theme.colors.primary : "#FF5500"} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, Platform.OS === "web" ? { outlineStyle: "none" as any } : {}]}
                  placeholder="Seu e-mail profissional"
                  placeholderTextColor="#555"
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

              <View style={[styles.inputBox, focoSenha && styles.inputBoxFocused]}>
                <Ionicons name="lock-closed-outline" size={20} color={focoSenha ? theme.colors.primary : "#FF5500"} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, Platform.OS === "web" ? { outlineStyle: "none" as any } : {}]}
                  placeholder="Sua senha"
                  placeholderTextColor="#555"
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
                <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)} style={styles.eyeIcon} activeOpacity={0.7}>
                  <Ionicons name={mostrarSenha ? "eye-off-outline" : "eye-outline"} size={20} color={mostrarSenha ? theme.colors.primary : "#FF5500"} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.forgotPassword} onPress={() => navigation.navigate("EsqueciSenha")} activeOpacity={0.7}>
                <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.btnOutline, loading && { opacity: 0.7 }]} onPress={handleLogin} disabled={loading} activeOpacity={0.8}>
                <LinearGradient colors={["rgba(255, 107, 0, 0.1)", "rgba(255, 107, 0, 0.02)"]} style={StyleSheet.absoluteFill} />
                <Text style={styles.btnOutlineText}>{loading ? "Acessando..." : "Entrar no Painel"}</Text>
                {!loading && <Ionicons name="arrow-forward" size={18} color={theme.colors.primary} style={{ marginLeft: 8 }} />}
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Ainda não tem conta?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("PersonalCadastro")} activeOpacity={0.7} style={styles.footerButton}>
                <Text style={styles.registerTextHighlight}>Cadastre-se</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#020202", position: "relative" },
  glowTopLeft: { position: "absolute", top: verticalScale(-80), left: scale(-80), width: scale(300), height: scale(300), borderRadius: scale(150), backgroundColor: theme.colors.primary, opacity: 0.12},
  glowBottomRight: { position: "absolute", bottom: verticalScale(-80), right: scale(-80), width: scale(350), height: scale(350), borderRadius: scale(175), backgroundColor: theme.colors.primary, opacity: 0.08},

  headerAbsolute: { position: "absolute", top: Platform.OS === "ios" ? verticalScale(50) : verticalScale(40), left: scale(20), zIndex: 10 },
  btnVoltar: { backgroundColor: "rgba(255,255,255,0.05)", width: scale(40), height: scale(40), borderRadius: scale(12), justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },

  scrollContent: { flexGrow: 1 },
  innerContent: { paddingHorizontal: scale(24), paddingTop: Platform.OS === "ios" ? verticalScale(140) : verticalScale(110), paddingBottom: verticalScale(40) },

  header: { alignItems: "center", marginBottom: verticalScale(40), marginTop: verticalScale(10) },
  iconWrapper: { position: "relative", marginBottom: verticalScale(20), justifyContent: "center", alignItems: "center" },
  iconGlow: { position: "absolute", width: scale(70), height: scale(70), borderRadius: scale(35), backgroundColor: theme.colors.primary, opacity: 0.4},
  iconCircle: { width: scale(74), height: scale(74), borderRadius: scale(24), justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.5)", backgroundColor: "#0A0A0A" },

  title: { fontFamily: theme.fonts.title, fontSize: moderateScale(36), color: "#FFF", letterSpacing: -0.5, lineHeight: moderateScale(42), textAlign: "center" },
  titleHighlight: { color: theme.colors.primary },
  subtitle: { fontFamily: theme.fonts.body, fontSize: moderateScale(14), color: "#888", marginTop: verticalScale(12), lineHeight: moderateScale(22), textAlign: "center", paddingHorizontal: scale(20) },

  form: { width: "100%" },
  inputBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#0A0A0A", borderRadius: moderateScale(16), borderWidth: 1, borderColor: "#1A1A1A", paddingLeft: scale(16), marginBottom: verticalScale(16), height: verticalScale(60) },
  inputBoxFocused: { borderColor: theme.colors.primary, backgroundColor: "rgba(255, 107, 0, 0.05)", shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3 },
  inputIcon: { marginRight: scale(12) },
  input: { flex: 1, color: "#FFF", fontSize: moderateScale(16), fontFamily: theme.fonts.body, height: "100%", backgroundColor: "transparent" },
  eyeIcon: { paddingHorizontal: scale(16), height: "100%", justifyContent: "center" },

  forgotPassword: { alignSelf: "flex-end", marginBottom: verticalScale(35), marginTop: verticalScale(5), paddingVertical: verticalScale(5) },
  forgotPasswordText: { color: "#666", fontFamily: theme.fonts.body, fontSize: moderateScale(13), fontWeight: "700" },

  btnOutline: { flexDirection: "row", marginTop: verticalScale(10), height: verticalScale(60), borderRadius: moderateScale(18), borderWidth: 1, borderColor: theme.colors.primary, justifyContent: "center", alignItems: "center", position: "relative" },
  btnOutlineText: { color: theme.colors.primary, fontSize: moderateScale(16), fontWeight: "bold", letterSpacing: 0.5, textTransform: "uppercase" },

  footer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: verticalScale(45) },
  footerText: { color: "#666", fontFamily: theme.fonts.body, fontSize: moderateScale(14) },
  footerButton: { flexDirection: "row", alignItems: "center", paddingLeft: scale(8) },
  registerTextHighlight: { color: theme.colors.primary, fontFamily: theme.fonts.title, fontSize: moderateScale(14), fontWeight: "bold", letterSpacing: 0.5 },
});