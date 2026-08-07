import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { theme } from "../../theme/theme";
import { moderateScale, scale, verticalScale } from "../../utils/responsive";

export default function VerificarEmail({ navigation, route }) {
  const email = route.params?.email || "seu e-mail";

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background}
      />

      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />

      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          <View style={styles.iconGlow} />
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons
              name="email-fast-outline"
              size={46}
              color={theme.colors.primary}
            />
          </View>
        </View>

        <Text style={styles.title}>
          Verifique seu <Text style={styles.titleHighlight}>E-mail</Text>
        </Text>

        <Text style={styles.subtitle}>
          Enviamos um link de ativação exclusivo para:{"\n"}
          <Text style={styles.emailHighlight}>{email}</Text>
        </Text>

        <View style={styles.securityBox}>
          <Ionicons
            name="shield-checkmark"
            size={24}
            color={theme.colors.success}
            style={{ marginBottom: 10 }}
          />
          <Text style={styles.instructions}>
            Para garantir a segurança da nossa comunidade, sua conta só será
            ativada e liberada para login após a confirmação deste link.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.btnAcao}
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{ name: "ChoiceScreen" }],
            })
          }
          activeOpacity={0.85}
        >
          <Text style={styles.btnAcaoText}>Voltar para o Início</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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

  content: {
    flex: 1,
    paddingHorizontal: scale(24),
    justifyContent: "center",
    alignItems: "center",
  },

  iconWrapper: {
    position: "relative",
    marginBottom: verticalScale(30),
    justifyContent: "center",
    alignItems: "center",
  },
  iconGlow: {
    position: "absolute",
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    backgroundColor: theme.colors.primary,
    opacity: 0.3,
    blurRadius: 20,
  },
  iconCircle: {
    width: scale(90),
    height: scale(90),
    borderRadius: scale(45),
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 0, 0.4)",
  },

  title: {
    color: theme.colors.text,
    fontSize: moderateScale(32),
    fontFamily: theme.fonts.title,
    marginBottom: verticalScale(16),
    textAlign: "center",
  },
  titleHighlight: { color: theme.colors.primary },

  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: moderateScale(15),
    lineHeight: moderateScale(24),
    textAlign: "center",
    marginBottom: verticalScale(30),
  },
  emailHighlight: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: moderateScale(16),
  },

  securityBox: {
    backgroundColor: "rgba(0, 230, 118, 0.05)",
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(20),
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: "rgba(0, 230, 118, 0.2)",
    alignItems: "center",
    marginBottom: verticalScale(40),
    width: "100%",
  },
  instructions: {
    color: theme.colors.success,
    fontSize: moderateScale(13),
    lineHeight: moderateScale(20),
    textAlign: "center",
    fontWeight: "600",
  },

  btnAcao: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    height: verticalScale(60),
    borderRadius: moderateScale(16),
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  btnAcaoText: {
    color: theme.colors.text,
    fontSize: moderateScale(15),
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
