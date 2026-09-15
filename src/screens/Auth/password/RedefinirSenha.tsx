import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

export default function RedefinirSenha({ navigation }: any) {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [verSenha, setVerSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validandoLink, setValidandoLink] = useState(true);

  const [focoSenha, setFocoSenha] = useState(false);
  const [focoConfirmar, setFocoConfirmar] = useState(false);

  const processarUrlToken = async (url: string) => {
    try {
      const queryString = url.includes("#") ? url.split("#")[1] : url.split("?")[1];
      if (!queryString) return;

      const pairs = queryString.split("&");
      let accessToken = null;
      let refreshToken = null;

      pairs.forEach((pair) => {
        const [key, value] = pair.split("=");
        if (key === "access_token") accessToken = value;
        if (key === "refresh_token") refreshToken = value;
      });

      if (accessToken && refreshToken) {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
      }
    } catch (err) {
      console.log("Erro ao extrair tokens:", err);
    } finally {
      setValidandoLink(false);
    }
  };

  useEffect(() => {
    const prepararSessao = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          setValidandoLink(false);
          return;
        }

        const url = await Linking.getInitialURL();
        if (url && url.includes("access_token")) {
          await processarUrlToken(url);
        } else {
          setValidandoLink(false);
        }
      } catch (e) {
        console.log("Erro ao preparar sessão:", e);
        setValidandoLink(false);
      }
    };

    prepararSessao();
  }, []);

  const handleAtualizarSenha = async () => {
    if (!novaSenha.trim() || !confirmarSenha.trim()) return Alert.alert("Atenção", "Preencha os dois campos de senha.");
    if (novaSenha !== confirmarSenha) return Alert.alert("Erro", "As senhas não coincidem.");
    if (novaSenha.length < 6) return Alert.alert("Atenção", "A senha deve ter pelo menos 6 caracteres.");

    setLoading(true);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error("Sua sessão de recuperação expirou ou não foi reconhecida. Por favor, clique no link do e-mail novamente.");
      }

      const { error } = await supabase.auth.updateUser({ password: novaSenha.trim() });

      if (error) throw error;

      Alert.alert(
        "Senha Atualizada! 🔒",
        "Sua nova credencial foi salva com sucesso.",
        [{ text: "Fazer Login", onPress: () => navigation.reset({ index: 0, routes: [{ name: "ChoiceScreen" }] }) }]
      );
    } catch (error: any) {
      Alert.alert("Erro", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (validandoLink) {
    return (
      <View style={[styles.mainContainer, { justifyContent: "center", alignItems: "center" }]}>
        <StatusBar barStyle="light-content" backgroundColor="#020202" translucent />
        <View style={styles.glowTopLeft} />
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Autenticando link seguro...</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#020202" translucent />

      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />

      <BlurView intensity={Platform.OS === "ios" ? 80 : 100} tint="dark" experimentalBlurMethod="dimezisBlurView" style={styles.headerGlass}>
        <TouchableOpacity style={styles.btnVoltar} onPress={() => navigation.navigate("ChoiceScreen")} activeOpacity={0.7}>
          <Ionicons name="close" size={24} color="#FFF" />
        </TouchableOpacity>
      </BlurView>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.innerContent}>
            
            <View style={styles.header}>
              <View style={styles.iconWrapper}>
                <View style={styles.iconGlow} />
                <LinearGradient colors={["rgba(255, 107, 0, 0.25)", "rgba(255, 107, 0, 0.02)"]} style={styles.iconCircle}>
                  <MaterialCommunityIcons name="shield-key-outline" size={34} color={theme.colors.primary} />
                </LinearGradient>
              </View>
              <Text style={styles.title}>Nova <Text style={styles.titleHighlight}>Senha.</Text></Text>
              <Text style={styles.subtitle}>Crie uma credencial forte e única para proteger seus dados e treinos.</Text>
            </View>

            <View style={styles.form}>
              <View style={[styles.inputBox, focoSenha && styles.inputBoxFocused]}>
                <Ionicons name="lock-closed-outline" size={20} color={focoSenha ? theme.colors.primary : "#555"} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, Platform.OS === "web" ? { outlineStyle: "none" as any } : {}]}
                  placeholder="Digite sua nova senha"
                  placeholderTextColor="#555"
                  secureTextEntry={!verSenha}
                  value={novaSenha}
                  onChangeText={setNovaSenha}
                  onFocus={() => setFocoSenha(true)}
                  onBlur={() => setFocoSenha(false)}
                  cursorColor={theme.colors.primary}
                  keyboardAppearance="dark"
                  textContentType="newPassword"
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setVerSenha(!verSenha)} activeOpacity={0.7}>
                  <Ionicons name={verSenha ? "eye-off-outline" : "eye-outline"} size={20} color="#888" />
                </TouchableOpacity>
              </View>

              <View style={[styles.inputBox, focoConfirmar && styles.inputBoxFocused]}>
                <Ionicons name="checkmark-circle-outline" size={20} color={focoConfirmar ? theme.colors.primary : "#FF5500"} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, Platform.OS === "web" ? { outlineStyle: "none" as any } : {}]}
                  placeholder="Confirme a nova senha"
                  placeholderTextColor="#555"
                  secureTextEntry={!verSenha}
                  value={confirmarSenha}
                  onChangeText={setConfirmarSenha}
                  onFocus={() => setFocoConfirmar(true)}
                  onBlur={() => setFocoConfirmar(false)}
                  cursorColor={theme.colors.primary}
                  keyboardAppearance="dark"
                  textContentType="newPassword"
                />
              </View>

              <TouchableOpacity style={[styles.btnOutline, loading && { opacity: 0.7 }]} onPress={handleAtualizarSenha} disabled={loading} activeOpacity={0.8}>
                <LinearGradient colors={["rgba(255, 107, 0, 0.15)", "rgba(255, 107, 0, 0.02)"]} style={StyleSheet.absoluteFill} />
                {loading ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (
                  <>
                    <Text style={styles.btnOutlineText}>Salvar Nova Senha</Text>
                    <Ionicons name="arrow-forward" size={18} color={theme.colors.primary} style={{ marginLeft: 8 }} />
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.trustBadgesContainer}>
              <View style={styles.securityCard}>
                <View style={styles.securityIconBox}>
                  <Ionicons name="finger-print" size={22} color="#00E676" />
                </View>
                <View style={styles.securityTextContent}>
                  <Text style={styles.securityTitle}>Criptografia de Ponta</Text>
                  <Text style={styles.securityDesc}>Sua senha é blindada e invisível no banco de dados. Nem nossa equipe tem acesso.</Text>
                </View>
              </View>

              <View style={styles.securityCard}>
                <View style={[styles.securityIconBox, { backgroundColor: "rgba(255, 107, 0, 0.1)", borderColor: "rgba(255, 107, 0, 0.2)" }]}>
                  <MaterialCommunityIcons name="shield-check" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.securityTextContent}>
                  <Text style={styles.securityTitle}>Proteção Ativa</Text>
                  <Text style={styles.securityDesc}>Ao atualizar, qualquer sessão logada em celulares antigos será desconectada na hora.</Text>
                </View>
              </View>

              <View style={styles.securityCard}>
                <View style={[styles.securityIconBox, { backgroundColor: "rgba(0, 191, 255, 0.1)", borderColor: "rgba(0, 191, 255, 0.2)" }]}>
                  <Ionicons name="flash" size={22} color="#00BFFF" />
                </View>
                <View style={styles.securityTextContent}>
                  <Text style={styles.securityTitle}>Acesso Imediato</Text>
                  <Text style={styles.securityDesc}>Sua credencial é atualizada instantaneamente. Salve e retome seus treinos.</Text>
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
  mainContainer: { flex: 1, backgroundColor: "#020202", position: "relative" },

  glowTopLeft: { position: "absolute", top: verticalScale(-80), left: scale(-80), width: scale(300), height: scale(300), borderRadius: scale(150), backgroundColor: theme.colors.primary, opacity: 0.12},
  glowBottomRight: { position: "absolute", bottom: verticalScale(-80), right: scale(-80), width: scale(350), height: scale(350), borderRadius: scale(175), backgroundColor: theme.colors.primary, opacity: 0.08},

  loadingText: { color: "#888", marginTop: verticalScale(20), fontSize: moderateScale(15), fontFamily: theme.fonts.body, fontWeight: "600", letterSpacing: 0.5 },

  headerGlass: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 100, flexDirection: "row", alignItems: "center", paddingTop: Platform.OS === "ios" ? verticalScale(50) : verticalScale(40), paddingBottom: verticalScale(15), paddingHorizontal: scale(20), borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.05)", backgroundColor: Platform.OS === "android" ? "rgba(0,0,0,0.8)" : "transparent" },
  btnVoltar: { width: scale(40), height: scale(40), borderRadius: scale(12), backgroundColor: "rgba(255,255,255,0.05)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },

  scrollContent: { flexGrow: 1 },
  innerContent: { flex: 1, paddingHorizontal: scale(24), paddingTop: Platform.OS === "ios" ? verticalScale(140) : verticalScale(110), paddingBottom: verticalScale(40) },

  header: { alignItems: "center", marginBottom: verticalScale(40) },
  iconWrapper: { position: "relative", marginBottom: verticalScale(20), justifyContent: "center", alignItems: "center" },
  iconGlow: { position: "absolute", width: scale(70), height: scale(70), borderRadius: scale(35), backgroundColor: theme.colors.primary, opacity: 0.3},
  iconCircle: { width: scale(74), height: scale(74), borderRadius: scale(37), justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.4)", backgroundColor: "#0A0A0A" },

  title: { fontFamily: theme.fonts.title, fontSize: moderateScale(36), color: "#FFF", letterSpacing: -0.5, lineHeight: moderateScale(42), textAlign: "center" },
  titleHighlight: { color: theme.colors.primary },
  subtitle: { fontFamily: theme.fonts.body, fontSize: moderateScale(14), color: "#888", marginTop: verticalScale(12), lineHeight: moderateScale(22), textAlign: "center", paddingHorizontal: scale(10) },

  form: { width: "100%" },
  inputBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#0A0A0A", borderRadius: moderateScale(16), borderWidth: 1, borderColor: "#1A1A1A", paddingLeft: scale(16), marginBottom: verticalScale(16), height: verticalScale(60) },
  inputBoxFocused: { borderColor: theme.colors.primary, backgroundColor: "rgba(255, 107, 0, 0.05)", shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3 },
  inputIcon: { marginRight: scale(12) },
  input: { flex: 1, color: "#FFF", fontSize: moderateScale(16), fontFamily: theme.fonts.body, height: "100%", backgroundColor: "transparent" },
  eyeIcon: { paddingHorizontal: scale(16), height: "100%", justifyContent: "center" },

  btnOutline: { flexDirection: "row", marginTop: verticalScale(10), height: verticalScale(60), borderRadius: moderateScale(18), borderWidth: 1, borderColor: theme.colors.primary, justifyContent: "center", alignItems: "center", position: "relative" },
  btnOutlineText: { color: theme.colors.primary, fontSize: moderateScale(15), fontWeight: "900", letterSpacing: 0.5, textTransform: "uppercase" },

  trustBadgesContainer: { marginTop: "auto", paddingTop: verticalScale(40), gap: verticalScale(12) },
  securityCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#0A0A0A", borderWidth: 1, borderColor: "#1A1A1A", borderRadius: moderateScale(20), paddingHorizontal: scale(18), paddingVertical: verticalScale(18) },
  securityIconBox: { width: scale(44), height: scale(44), borderRadius: moderateScale(14), backgroundColor: "rgba(0, 230, 118, 0.1)", justifyContent: "center", alignItems: "center", marginRight: scale(16), borderWidth: 1, borderColor: "rgba(0, 230, 118, 0.2)" },
  securityTextContent: { flex: 1 },
  securityTitle: { color: "#FFF", fontSize: moderateScale(14), fontWeight: "800", marginBottom: verticalScale(4), letterSpacing: 0.5 },
  securityDesc: { color: "#777", fontSize: moderateScale(12), lineHeight: moderateScale(18) },
});