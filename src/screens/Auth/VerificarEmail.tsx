import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { theme } from "../../theme/theme";
import { moderateScale, scale, verticalScale } from "../../utils/responsive";

export default function VerificarEmail({ navigation, route }: any) {
  const email = route.params?.email || "seu e-mail";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020202" translucent />

      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />

      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          <View style={styles.iconGlow} />
          <LinearGradient colors={["rgba(255, 107, 0, 0.25)", "rgba(255, 107, 0, 0.05)"]} style={styles.iconCircle}>
            <MaterialCommunityIcons name="email-fast-outline" size={46} color={theme.colors.primary} />
          </LinearGradient>
        </View>

        <Text style={styles.title}>
          Verifique seu <Text style={styles.titleHighlight}>E-mail</Text>
        </Text>

        <Text style={styles.subtitle}>
          Enviamos um link de ativação exclusivo para:{"\n"}
          <Text style={styles.emailHighlight}>{email}</Text>
        </Text>

        <View style={styles.securityBox}>
          <View style={styles.securityIconRing}>
            <Ionicons name="shield-checkmark" size={20} color="#00E676" />
          </View>
          <Text style={styles.instructions}>
            Para garantir a segurança da nossa comunidade, sua conta só será
            ativada e liberada para login após a confirmação deste link.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.btnOutline}
          onPress={() => navigation.reset({ index: 0, routes: [{ name: "ChoiceScreen" }] })}
          activeOpacity={0.8}
        >
          <LinearGradient colors={["rgba(255, 107, 0, 0.15)", "rgba(255, 107, 0, 0.02)"]} style={StyleSheet.absoluteFill} />
          <Text style={styles.btnOutlineText}>Voltar para o Início</Text>
          <Ionicons name="home-outline" size={18} color={theme.colors.primary} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020202", position: "relative" },

  glowTopLeft: { position: "absolute", top: verticalScale(-80), left: scale(-80), width: scale(300), height: scale(300), borderRadius: scale(150), backgroundColor: theme.colors.primary, opacity: 0.15},
  glowBottomRight: { position: "absolute", bottom: verticalScale(-80), right: scale(-80), width: scale(350), height: scale(350), borderRadius: scale(175), backgroundColor: theme.colors.primary, opacity: 0.1},

  content: { flex: 1, paddingHorizontal: scale(24), justifyContent: "center", alignItems: "center" },

  iconWrapper: { position: "relative", marginBottom: verticalScale(30), justifyContent: "center", alignItems: "center" },
  iconGlow: { position: "absolute", width: scale(80), height: scale(80), borderRadius: scale(40), backgroundColor: theme.colors.primary, opacity: 0.3},
  iconCircle: { width: scale(90), height: scale(90), borderRadius: scale(45), backgroundColor: "#0A0A0A", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.4)" },

  title: { color: "#FFF", fontSize: moderateScale(36), fontFamily: theme.fonts.title, marginBottom: verticalScale(16), textAlign: "center", letterSpacing: -0.5 },
  titleHighlight: { color: theme.colors.primary },

  subtitle: { color: "#888", fontSize: moderateScale(15), lineHeight: moderateScale(24), textAlign: "center", marginBottom: verticalScale(40) },
  emailHighlight: { color: "#FFF", fontWeight: "900", fontSize: moderateScale(16) },

  securityBox: { backgroundColor: "#0A0A0A", paddingHorizontal: scale(24), paddingVertical: verticalScale(24), borderRadius: moderateScale(20), borderWidth: 1, borderColor: "#1A1A1A", alignItems: "center", marginBottom: verticalScale(45), width: "100%" },
  securityIconRing: { width: scale(44), height: scale(44), borderRadius: scale(22), backgroundColor: "rgba(0, 230, 118, 0.1)", justifyContent: "center", alignItems: "center", marginBottom: verticalScale(12), borderWidth: 1, borderColor: "rgba(0, 230, 118, 0.2)" },
  instructions: { color: "#AAA", fontSize: moderateScale(13), lineHeight: moderateScale(20), textAlign: "center" },

  btnOutline: { flexDirection: "row", width: "100%", height: verticalScale(60), borderRadius: moderateScale(18), borderWidth: 1, borderColor: theme.colors.primary, justifyContent: "center", alignItems: "center", position: "relative" },
  btnOutlineText: { color: theme.colors.primary, fontSize: moderateScale(15), fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.5 },
});