import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useRef } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "../../theme/theme";
import { moderateScale, scale, verticalScale } from "../../utils/responsive";

const { width } = Dimensions.get("window");

const ChoiceCard = ({ title, description, icon, primary, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
    onPress();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.card,
          primary ? styles.cardPrimary : styles.cardSecondary,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={styles.iconWrapper}>
          <Ionicons name={icon} size={28} color={theme.colors.primary} />
        </View>

        <View style={styles.textWrapper}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDesc}>{description}</Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={24}
          color={primary ? theme.colors.primary : theme.colors.textMuted}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function ChoiceScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />

      <View style={styles.centralView}>
        <View style={styles.header}>
          <Text style={styles.mainTitle}>
            Sua evolução{"\n"}
            <Text style={styles.highlightTitle}>começa aqui</Text>
          </Text>

          <Text style={styles.subtitle}>Encontre. Conecte. Evolua.</Text>
        </View>

        <View style={styles.ruleOfThreeRow}>
          <View style={styles.ruleItem}>
            <View style={styles.ruleIconBg}>
              <FontAwesome5
                name="fire"
                size={14}
                color={theme.colors.primary}
              />
            </View>
            <Text style={styles.ruleText}>Match Exato</Text>
          </View>
          <View style={styles.ruleItem}>
            <View style={styles.ruleIconBg}>
              <Ionicons
                name="chatbubbles"
                size={14}
                color={theme.colors.primary}
              />
            </View>
            <Text style={styles.ruleText}>Contato Direto</Text>
          </View>
          <View style={styles.ruleItem}>
            <View style={styles.ruleIconBg}>
              <FontAwesome5
                name="dumbbell"
                size={12}
                color={theme.colors.primary}
              />
            </View>
            <Text style={styles.ruleText}>Alta Performance</Text>
          </View>
        </View>

        <View style={styles.cardsContainer}>
          <ChoiceCard
            title="Sou Aluno"
            description="Quero encontrar o personal ideal"
            icon="person"
            primary={true}
            onPress={() =>
              navigation.navigate("ClienteLogin", { tipo: "cliente" })
            }
          />

          <ChoiceCard
            title="Sou Personal"
            description="Quero gerenciar e captar alunos"
            icon="barbell"
            primary={false}
            onPress={() =>
              navigation.navigate("PersonalLogin", { tipo: "personal" })
            }
          />
        </View>
      </View>

      <Text style={styles.footerText}>
        Ao continuar você aceita nossos Termos de Uso e Privacidade
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(24),
    position: "relative",
  },

  glowTopLeft: {
    position: "absolute",
    top: verticalScale(-100),
    left: scale(-50),
    width: scale(250),
    height: scale(250),
    borderRadius: moderateScale(125),
    backgroundColor: theme.colors.primary,
    opacity: 0.12,
    blurRadius: 60,
  },
  glowBottomRight: {
    position: "absolute",
    bottom: verticalScale(-100),
    right: scale(-50),
    width: scale(300),
    height: scale(300),
    borderRadius: moderateScale(150),
    backgroundColor: theme.colors.primary,
    opacity: 0.08,
    blurRadius: 80,
  },

  centralView: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
  },

  header: {
    alignItems: "center",
    marginBottom: verticalScale(25),
  },
  mainTitle: {
    fontFamily: theme.fonts.title,
    fontSize: moderateScale(42),
    color: theme.colors.text,
    letterSpacing: -0.5,
    lineHeight: moderateScale(48),
    textAlign: "center",
  },
  highlightTitle: {
    color: theme.colors.primary,
  },
  subtitle: {
    fontFamily: theme.fonts.body,
    fontSize: moderateScale(16),
    fontWeight: "bold",
    color: theme.colors.textSecondary,
    marginTop: verticalScale(12),
    textTransform: "uppercase",
    letterSpacing: 2,
    textAlign: "center",
  },

  ruleOfThreeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: verticalScale(40),
    paddingHorizontal: scale(10),
  },
  ruleItem: {
    alignItems: "center",
    flex: 1,
  },
  ruleIconBg: {
    width: scale(36),
    height: scale(36),
    borderRadius: moderateScale(18),
    backgroundColor: theme.colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(8),
    borderWidth: 1,
    borderColor: "rgba(255, 107, 0, 0.2)",
  },
  ruleText: {
    color: theme.colors.textBody,
    fontSize: moderateScale(11),
    fontWeight: "600",
    textAlign: "center",
    textTransform: "uppercase",
  },

  cardsContainer: {
    width: "100%",
    gap: verticalScale(16),
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(24),
    borderRadius: moderateScale(24),
  },
  cardPrimary: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  cardSecondary: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },

  iconWrapper: {
    width: scale(56),
    height: scale(56),
    borderRadius: moderateScale(18),
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(16),
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 0, 0.2)",
  },

  textWrapper: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: theme.fonts.title,
    fontSize: moderateScale(22),
    letterSpacing: 0.5,
    color: theme.colors.text,
  },
  cardDesc: {
    fontFamily: theme.fonts.body,
    fontSize: moderateScale(13),
    marginTop: verticalScale(4),
    lineHeight: moderateScale(18),
    color: theme.colors.textSecondary,
  },

  footerText: {
    fontFamily: theme.fonts.body,
    fontSize: moderateScale(12),
    color: theme.colors.textMuted,
    textAlign: "center",
    marginBottom: Platform.OS === "ios" ? verticalScale(20) : verticalScale(10),
  },
});
