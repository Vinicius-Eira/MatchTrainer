import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import BotaoPrincipal from "../../components/BotaoPrincipal";
import { supabase } from "../../services/supabase";
import { theme } from "../../theme/theme";
import { moderateScale, scale, verticalScale } from "../../utils/responsive";

export default function Avaliar({ route, navigation }) {
  const { personalId, personalNome, personalFoto } = route.params;

  const [userId, setUserId] = useState(null);
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const starScale = useRef(new Animated.Value(1)).current;
  const checkScale = useRef(new Animated.Value(0)).current;

  const labelsNota = {
    1: "Péssimo",
    2: "Ruim",
    3: "Regular",
    4: "Bom",
    5: "Excelente",
  };

  useEffect(() => {
    obterUsuario();
  }, []);

  const obterUsuario = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      setUserId(session.user.id);
    }
  };

  const handleSelecionarNota = (valor) => {
    setNota(valor);
    starScale.setValue(0.8);
    Animated.spring(starScale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const handleEnviar = async () => {
    if (!userId || nota === 0) return;
    setLoading(true);

    try {
      const { data: avaliacaoExistente } = await supabase
        .from("avaliacoes")
        .select("id")
        .eq("usuario_id", userId)
        .eq("personal_id", personalId)
        .single();

      if (avaliacaoExistente) {
        await supabase
          .from("avaliacoes")
          .update({ nota, comentario })
          .eq("id", avaliacaoExistente.id);
      } else {
        await supabase.from("avaliacoes").insert({
          usuario_id: userId,
          personal_id: personalId,
          nota,
          comentario,
        });
      }

      await supabase
        .from("conexoes")
        .update({ status: "avaliado" })
        .match({ usuario_id: userId, personal_id: personalId });

      setSucesso(true);
      Animated.spring(checkScale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error);
    } finally {
      setLoading(false);
    }
  };

  if (sucesso) {
    return (
      <View style={[styles.container, styles.center]}>
        <Animated.View
          style={{ transform: [{ scale: checkScale }], alignItems: "center" }}
        >
          <Ionicons
            name="checkmark-circle"
            size={100}
            color={theme.colors.primary}
          />
          <Text style={styles.successText}>Avaliação enviada!</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Image
            source={{ uri: personalFoto || "https://via.placeholder.com/150" }}
            style={styles.avatar}
          />
          <Text style={styles.title}>
            Como foi sua experiência com {personalNome?.split(" ")[0]}?
          </Text>
        </View>

        <Animated.View
          style={[styles.starsContainer, { transform: [{ scale: starScale }] }]}
        >
          {[1, 2, 3, 4, 5].map((estrela) => (
            <TouchableOpacity
              key={estrela}
              activeOpacity={0.7}
              onPress={() => handleSelecionarNota(estrela)}
            >
              <Ionicons
                name={estrela <= nota ? "star" : "star-outline"}
                size={48}
                color={
                  estrela <= nota
                    ? theme.colors.primary
                    : theme.colors.textSecondary
                }
                style={styles.star}
              />
            </TouchableOpacity>
          ))}
        </Animated.View>

        <Text style={styles.notaLabel}>
          {nota > 0 ? labelsNota[nota] : " "}
        </Text>

        <TextInput
          style={styles.textArea}
          placeholder="Conte como foi (opcional)"
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          maxLength={300}
          value={comentario}
          onChangeText={setComentario}
          textAlignVertical="top"
        />

        <View style={styles.buttonsContainer}>
          <BotaoPrincipal
            titulo={loading ? "Enviando..." : "Enviar avaliação"}
            onPress={handleEnviar}
            disabled={nota === 0 || loading}
          />

          <TouchableOpacity
            style={styles.ghostButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.ghostButtonText}>Agora não</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { justifyContent: "center", alignItems: "center" },
  content: {
    flex: 1,
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(20),
    justifyContent: "center",
  },
  header: { alignItems: "center", marginBottom: verticalScale(30) },
  avatar: {
    width: scale(72),
    height: scale(72),
    borderRadius: moderateScale(36),
    backgroundColor: "#333",
    marginBottom: verticalScale(15),
  },
  title: {
    fontFamily: theme.fonts.title,
    fontSize: moderateScale(26),
    color: theme.colors.text,
    textAlign: "center",
    lineHeight: moderateScale(30),
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: verticalScale(10),
  },
  star: { marginHorizontal: scale(5) },
  notaLabel: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.title,
    fontSize: moderateScale(20),
    textAlign: "center",
    marginBottom: verticalScale(30),
    height: verticalScale(25),
  },
  textArea: {
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(15),
    borderRadius: moderateScale(12),
    minHeight: verticalScale(100),
    fontSize: moderateScale(16),
    borderWidth: 1,
    borderColor: "#252525",
    marginBottom: verticalScale(25),
  },
  buttonsContainer: { marginTop: verticalScale(10) },
  ghostButton: {
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(15),
    alignItems: "center",
    marginTop: verticalScale(10),
  },
  ghostButtonText: {
    color: theme.colors.textSecondary,
    fontSize: moderateScale(16),
    fontWeight: "bold",
  },
  successText: {
    fontFamily: theme.fonts.title,
    fontSize: moderateScale(28),
    color: theme.colors.text,
    marginTop: verticalScale(15),
  },
});
