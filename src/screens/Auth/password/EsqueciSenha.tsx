import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

export default function EsqueciSenha({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [inputFocado, setInputFocado] = useState(false);

  const handleRecuperarSenha = async () => {
    if (!email.trim()) {
      return Alert.alert("Atenção", "Por favor, digite seu e-mail cadastrado.");
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: "matchtrainer://redefinir-senha", 
        }
      );

      if (error) throw error;

      setEnviado(true);
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Não foi possível enviar o e-mail de recuperação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#020202" translucent />

      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />

      <BlurView intensity={Platform.OS === "ios" ? 80 : 100} tint="dark" experimentalBlurMethod="dimezisBlurView" style={styles.headerGlass}>
        <TouchableOpacity style={styles.btnVoltar} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color="#FFF" style={{ marginLeft: -2 }} />
        </TouchableOpacity>
      </BlurView>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.innerContent}>
            
            <View style={styles.headerTextContainer}>
              <View style={styles.iconWrapper}>
                <View style={styles.iconGlow} />
                <LinearGradient colors={["rgba(255, 107, 0, 0.25)", "rgba(255, 107, 0, 0.05)"]} style={styles.iconCircle}>
                  <MaterialCommunityIcons name="lock-reset" size={38} color={theme.colors.primary} />
                </LinearGradient>
              </View>

              <Text style={styles.title}>
                Recuperar {"\n"}
                <Text style={styles.titleHighlight}>Senha.</Text>
              </Text>
            </View>

            {!enviado ? (
              <View style={styles.form}>
                <Text style={styles.subtitle}>
                  Não se preocupe! Digite o e-mail associado à sua conta e enviaremos um link seguro para você criar uma nova senha.
                </Text>

                <View style={[styles.inputBox, inputFocado && styles.inputBoxFocused]}>
                  <Ionicons name="mail-outline" size={20} color={inputFocado ? theme.colors.primary : "#FF5500"} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, Platform.OS === "web" ? { outlineStyle: "none" as any } : {}]}
                    placeholder="Seu e-mail cadastrado"
                    placeholderTextColor="#555"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setInputFocado(true)}
                    onBlur={() => setInputFocado(false)}
                    cursorColor={theme.colors.primary}
                    keyboardAppearance="dark"
                  />
                </View>

                {/* BOTÃO OUTLINE NEON */}
                <TouchableOpacity style={[styles.btnOutline, loading && { opacity: 0.7 }]} onPress={handleRecuperarSenha} disabled={loading} activeOpacity={0.8}>
                  <LinearGradient colors={["rgba(255, 107, 0, 0.15)", "rgba(255, 107, 0, 0.02)"]} style={StyleSheet.absoluteFill}  />
                  {loading ? (
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                  ) : (
                    <>
                      <Text style={styles.btnOutlineText}>Enviar Link de Recuperação</Text>
                      <Ionicons name="arrow-forward" size={18} color={theme.colors.primary} style={{ marginLeft: 8 }} />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.successBox}>
                <View style={styles.successIconWrapper}>
                  <View style={styles.successIconGlow} />
                  <Ionicons name="checkmark-circle" size={60} color="#00E676" style={{ zIndex: 2 }} />
                </View>

                <Text style={styles.successTitle}>E-mail Enviado!</Text>
                <Text style={styles.successText}>
                  As instruções foram enviadas para {"\n"}
                  <Text style={styles.successEmailHighlight}>{email}</Text>
                  {"\n\n"}
                  Verifique sua caixa de entrada e a pasta de spam.
                </Text>

                <TouchableOpacity style={styles.btnVoltarLogin} onPress={() => navigation.goBack()} activeOpacity={0.8}>
                   <LinearGradient colors={["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.02)"]} style={StyleSheet.absoluteFill}  />
                   <Text style={styles.btnVoltarLoginText}>Voltar para o Login</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#020202", position: "relative" },

  glowTopLeft: { position: "absolute", top: verticalScale(-80), left: scale(-80), width: scale(300), height: scale(300), borderRadius: scale(150), backgroundColor: theme.colors.primary, opacity: 0.15},
  glowBottomRight: { position: "absolute", bottom: verticalScale(-80), right: scale(-80), width: scale(350), height: scale(350), borderRadius: scale(175), backgroundColor: theme.colors.primary, opacity: 0.1},

  headerGlass: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 100, flexDirection: "row", alignItems: "center", paddingTop: Platform.OS === "ios" ? verticalScale(50) : verticalScale(40), paddingBottom: verticalScale(15), paddingHorizontal: scale(20), borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.05)", backgroundColor: Platform.OS === "android" ? "rgba(0,0,0,0.8)" : "transparent" },
  btnVoltar: { width: scale(40), height: scale(40), borderRadius: scale(12), backgroundColor: "rgba(255,255,255,0.05)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },

  scrollContent: { flexGrow: 1 },
  innerContent: { flex: 1, paddingHorizontal: scale(24), paddingTop: Platform.OS === "ios" ? verticalScale(130) : verticalScale(110), paddingBottom: verticalScale(40) },

  headerTextContainer: { alignItems: "center", marginBottom: verticalScale(30) },
  iconWrapper: { position: "relative", marginBottom: verticalScale(20), justifyContent: "center", alignItems: "center" },
  iconGlow: { position: "absolute", width: scale(70), height: scale(70), borderRadius: scale(35), backgroundColor: theme.colors.primary, opacity: 0.3},
  iconCircle: { width: scale(74), height: scale(74), borderRadius: scale(37), justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.4)", backgroundColor: "#0A0A0A" },

  title: { fontFamily: theme.fonts.title, fontSize: moderateScale(36), color: "#FFF", letterSpacing: -0.5, lineHeight: moderateScale(42), textAlign: "center" },
  titleHighlight: { color: theme.colors.primary },
  subtitle: { fontFamily: theme.fonts.body, fontSize: moderateScale(14), color: "#888", marginBottom: verticalScale(30), lineHeight: moderateScale(22), textAlign: "center", paddingHorizontal: scale(10) },

  form: { width: "100%" },
  inputBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#0A0A0A", borderRadius: moderateScale(16), borderWidth: 1, borderColor: "#1A1A1A", paddingLeft: scale(16), marginBottom: verticalScale(20), height: verticalScale(64) },
  inputBoxFocused: { borderColor: theme.colors.primary, backgroundColor: "rgba(255, 107, 0, 0.05)", shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3 },
  inputIcon: { marginRight: scale(12) },
  input: { flex: 1, color: "#FFF", fontSize: moderateScale(16), fontFamily: theme.fonts.body, height: "100%", backgroundColor: "transparent" },

  // BOTÃO OUTLINE NEON
  btnOutline: { flexDirection: "row", height: verticalScale(60), borderRadius: moderateScale(18), borderWidth: 1, borderColor: theme.colors.primary, justifyContent: "center", alignItems: "center", position: "relative", marginTop: verticalScale(5) },
  btnOutlineText: { color: theme.colors.primary, fontSize: moderateScale(15), fontWeight: "900", letterSpacing: 0.5, textTransform: "uppercase" },

  successBox: { backgroundColor: "#0A0A0A", paddingHorizontal: scale(24), paddingVertical: verticalScale(35), borderRadius: moderateScale(28), borderWidth: 1, borderColor: "#1A1A1A", alignItems: "center" },
  successIconWrapper: { position: "relative", justifyContent: "center", alignItems: "center", marginBottom: verticalScale(20) },
  successIconGlow: { position: "absolute", width: scale(60), height: scale(60), borderRadius: scale(30), backgroundColor: "#00E676", opacity: 0.3},
  successTitle: { color: "#FFF", fontSize: moderateScale(24), fontFamily: theme.fonts.title, marginBottom: verticalScale(12), letterSpacing: 0.5 },
  successText: { color: "#888", fontSize: moderateScale(14), textAlign: "center", lineHeight: moderateScale(22), marginBottom: verticalScale(30), paddingHorizontal: scale(10) },
  successEmailHighlight: { color: "#FFF", fontWeight: "bold" },
  btnVoltarLogin: { flexDirection: "row", width: "100%", height: verticalScale(56), borderRadius: moderateScale(16), justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", position: "relative" },
  btnVoltarLoginText: { color: "#FFF", fontSize: moderateScale(15), fontWeight: "bold", letterSpacing: 0.5 },
});