import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Dimensions
} from "react-native";
import { theme } from "../../theme/theme";

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
        <View style={[styles.iconWrapper, primary ? styles.iconWrapperPrimary : styles.iconWrapperSecondary]}>
          <Ionicons
            name={icon}
            size={32}
            color={primary ? theme.colors.primary : theme.colors.primary}
          />
        </View>
        
        <View style={styles.textWrapper}>
          <Text
            style={[
              styles.cardTitle,
              primary ? { color: "#000" } : { color: "#FFF" },
            ]}
          >
            {title}
          </Text>
          <Text
            style={[
              styles.cardDesc,
              primary ? { color: "rgba(0,0,0,0.7)" } : { color: "#888" },
            ]}
          >
            {description}
          </Text>
        </View>

        <Ionicons 
          name="chevron-forward" 
          size={24} 
          color={primary ? "rgba(0,0,0,0.5)" : "#555"} 
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
          <Text style={styles.mainTitle}>Como você quer{"\n"}<Text style={styles.highlightTitle}>acessar o app?</Text></Text>
          <Text style={styles.subtitle}>Escolha o seu perfil para continuar</Text>
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
        Ao continuar você aceita nossos Termos de Uso
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#070707",
    padding: 24,
    position: "relative",
  },
  
  glowTopLeft: { position: 'absolute', top: -100, left: -50, width: 250, height: 250, borderRadius: 125, backgroundColor: theme.colors.primary, opacity: 0.15, blurRadius: 60 },
  glowBottomRight: { position: 'absolute', bottom: -100, right: -50, width: 300, height: 300, borderRadius: 150, backgroundColor: theme.colors.primary, opacity: 0.08, blurRadius: 80 },

  centralView: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
  },

  header: {
    marginBottom: 40,
    marginTop: -20,
    alignItems: "center", 
  },
  mainTitle: {
    fontFamily: theme.fonts.title,
    fontSize: 38,
    color: "#FFF",
    letterSpacing: -0.5,
    lineHeight: 44,
    textAlign: "center", 
  },
  highlightTitle: {
    color: theme.colors.primary,
  },
  subtitle: {
    fontFamily: theme.fonts.body,
    fontSize: 16,
    color: "#888",
    marginTop: 12,
    textAlign: "center", 
  },

  cardsContainer: {
    width: "100%",
    gap: 16,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 24,
    borderRadius: 24,
  },
  cardPrimary: { 
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  cardSecondary: {
    backgroundColor: "#121212",
    borderWidth: 1.5,
    borderColor: "#222",
  },

  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  iconWrapperPrimary: {
    backgroundColor: "#000",
  },
  iconWrapperSecondary: {
    backgroundColor: "rgba(255, 107, 0, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 0, 0.2)",
  },

  textWrapper: {
    flex: 1,
  },
  cardTitle: { 
    fontFamily: theme.fonts.title, 
    fontSize: 20,
    letterSpacing: 0.5,
  },
  cardDesc: {
    fontFamily: theme.fonts.body,
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },

  footerText: {
    fontFamily: theme.fonts.body,
    fontSize: 13,
    color: "#555",
    textAlign: "center",
    marginBottom: Platform.OS === 'ios' ? 20 : 10,
  },
});